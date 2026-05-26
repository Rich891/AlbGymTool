// Pure-function-Helpers fuer /berater/heute (Sprint-1-AP-5, lib-Anteil).
//
// Werden von BeraterHeute.jsx (kommt in Welle 2) konsumiert. Datenquellen
// sind Appointment.list, FollowUpTask.list und Lead.list — geladen ueber
// safeListEntity in entityGateway.js. Diese Datei beruehrt KEINE Entities
// direkt und macht KEINE Netzwerkaufrufe — sie sortiert/filtert nur
// bereits geladene Arrays.
//
// Defensive Implementierung: jeder Input-Array darf null/undefined/[] sein,
// Datums-Felder duerfen ISO-Strings, Date-Objekte oder numerische Timestamps
// sein. Datums-Helper sind inline (keine externe Lib).

// --- Datums-Helper ----------------------------------------------------------

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function startOfDay(date) {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date.getTime());
  d.setHours(23, 59, 59, 999);
  return d;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// --- Status-Helper ----------------------------------------------------------

// Welche FollowUpTask-Status gelten als "abgeschlossen / nicht mehr offen"?
// Frei-Form-Strings aus Base44 koennen variieren, darum tolerant matchen.
const FOLLOWUP_CLOSED_STATUSES = new Set([
  'done',
  'erledigt',
  'completed',
  'closed',
  'cancelled',
  'canceled',
  'abgebrochen',
  'storniert',
  'skipped',
  'uebersprungen',
]);

function isFollowUpOpen(task) {
  const status = String(task?.status || '').trim().toLowerCase();
  if (!status) return true; // ohne Status: lieber anzeigen als verschlucken
  return !FOLLOWUP_CLOSED_STATUSES.has(status);
}

// --- Public Helpers ---------------------------------------------------------

/**
 * Filtert eine Terminliste auf "heute" (= gleicher Kalendertag wie now).
 * Verwendet das Feld 'start' (siehe base44/entities/Appointment.jsonc).
 * Sortiert aufsteigend nach Startzeit.
 *
 * @param {Array} appointments  Liste aus Appointment.list — darf null sein
 * @param {Date}  now           Referenzzeit, default new Date()
 * @returns {Array}             Termine, die heute stattfinden
 */
export function filterAppointmentsToday(appointments, now = new Date()) {
  if (!Array.isArray(appointments) || appointments.length === 0) return [];
  const today = now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date();

  return appointments
    .filter(appt => {
      const start = toDate(appt?.start);
      if (!start) return false;
      return isSameDay(start, today);
    })
    .sort((a, b) => {
      const da = toDate(a.start)?.getTime() ?? 0;
      const db = toDate(b.start)?.getTime() ?? 0;
      return da - db;
    });
}

/**
 * Filtert FollowUpTasks auf "faellig oder ueberfaellig" relativ zu now.
 * Verwendet das Feld 'due_at' (siehe base44/entities/FollowUpTask.jsonc).
 * Geschlossene/erledigte Tasks werden ausgeblendet.
 *
 * Sortierung: ueberfaellige zuerst (aelteste due_at zuerst),
 * dann fuer heute Faellige (nach due_at aufsteigend).
 *
 * @param {Array} followUps  Liste aus FollowUpTask.list — darf null sein
 * @param {Date}  now        Referenzzeit, default new Date()
 * @returns {Array}          offene, faellige/ueberfaellige Follow-ups
 */
export function filterFollowUpsDue(followUps, now = new Date()) {
  if (!Array.isArray(followUps) || followUps.length === 0) return [];
  const today = now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date();
  const endToday = endOfDay(today);
  const startToday = startOfDay(today);

  const open = followUps.filter(task => {
    if (!isFollowUpOpen(task)) return false;
    const due = toDate(task?.due_at);
    if (!due) return false;
    // Faellig = due_at <= Ende heute (deckt heute UND alle ueberfaelligen ab)
    return due.getTime() <= endToday.getTime();
  });

  return open.sort((a, b) => {
    const da = toDate(a.due_at)?.getTime() ?? 0;
    const db = toDate(b.due_at)?.getTime() ?? 0;
    const aOverdue = da < startToday.getTime();
    const bOverdue = db < startToday.getTime();
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return da - db;
  });
}

/**
 * Liefert die N neuesten Leads, sortiert nach created_date absteigend.
 * Akzeptiert sowohl created_date als auch created_at (Base44-Variante),
 * fallback auf updated_date / id-Sortierung wenn beides fehlt.
 *
 * @param {Array}  leads  Liste aus Lead.list — darf null sein
 * @param {number} limit  Default 5
 * @returns {Array}       die top-N Leads
 */
export function groupNewLeads(leads, limit = 5) {
  if (!Array.isArray(leads) || leads.length === 0) return [];
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 5;

  const withTs = leads.map(lead => {
    const ts =
      toDate(lead?.created_date)?.getTime() ??
      toDate(lead?.created_at)?.getTime() ??
      toDate(lead?.updated_date)?.getTime() ??
      0;
    return { lead, ts };
  });

  withTs.sort((a, b) => b.ts - a.ts);
  return withTs.slice(0, safeLimit).map(entry => entry.lead);
}

/**
 * Konsolidiert die Tagesuebersicht fuer /berater/heute.
 * Erwartet bereits geladene Arrays — laedt selbst NICHTS.
 *
 * @param {object} input
 * @param {Array}  input.appointments
 * @param {Array}  input.followUps
 * @param {Array}  input.leads
 * @param {Date}   input.now
 * @returns {{
 *   todayAppointments: Array,
 *   dueFollowUps: Array,
 *   newLeads: Array,
 *   counts: { todayAppointments: number, dueFollowUps: number, newLeads: number }
 * }}
 */
export function buildHeuteOverview({
  appointments = [],
  followUps = [],
  leads = [],
  now = new Date(),
} = {}) {
  const todayAppointments = filterAppointmentsToday(appointments, now);
  const dueFollowUps = filterFollowUpsDue(followUps, now);
  const newLeads = groupNewLeads(leads, 5);

  return {
    todayAppointments,
    dueFollowUps,
    newLeads,
    counts: {
      todayAppointments: todayAppointments.length,
      dueFollowUps: dueFollowUps.length,
      newLeads: newLeads.length,
    },
  };
}
