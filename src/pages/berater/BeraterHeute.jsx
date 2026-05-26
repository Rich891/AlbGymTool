// /berater/heute — Tagesfokussierte Mitarbeiter-Startseite (Sprint-1-AP-5).
//
// 4-Kachel-Layout (responsive: stapelt auf sm, 2 Spalten ab md):
//   1) Termine heute       (Appointment.list, gefiltert auf heute)
//   2) Faellige Follow-ups (FollowUpTask.list, faellig oder ueberfaellig)
//   3) Neue Leads          (Lead.list, top 5 nach created_date)
//   4) Schnellaktionen     (statische Buttons, kein Datenfeed)
//
// Datenquellen ausschliesslich ueber safeListEntity → entityGateway.js.
// Aggregation/Filterung ausgelagert in heuteAggregation.js (pure functions).
// Route-Verkabelung erfolgt in Welle 3 (App.jsx).

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  Pill,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';

import { base44 } from '@/api/base44Client';
import { safeListEntity } from '@/lib/entityGateway';
import { buildHeuteOverview } from '@/lib/heuteAggregation';
import { useAuth } from '@/lib/AuthContext';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TodaySectionCard from '@/components/advisor/TodaySectionCard';

// --- Display-Helper (defensiv, keine Lib-Dependency) -----------------------

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatTime(value) {
  const d = toDate(value);
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
}

// "12.05., 14:30" — kompakte Datums+Zeit-Kennung fuer ueberfaellige Follow-ups.
function formatDayTime(value) {
  const d = toDate(value);
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '';
  }
}

// Wochentag/Datum fuer Header. "Montag, 12. Mai" — falsch-formatierte Daten
// fallen lautlos auf leeren String zurueck.
function formatHeaderDate(date) {
  const d = toDate(date) || new Date();
  try {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    }).format(d);
  } catch {
    return '';
  }
}

function leadDisplayName(lead) {
  if (!lead) return 'Unbekannter Lead';
  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  return lead.email || lead.phone || 'Unbekannter Lead';
}

// FollowUpTask hat kein 'title'-Feld. Wir zeigen 'reason' als Label und
// fallen auf channel / draft_message / status zurueck — defensiv tolerant.
function followUpLabel(task) {
  if (!task) return 'Follow-up';
  return (
    task.reason ||
    task.draft_message ||
    task.channel ||
    task.status ||
    'Follow-up'
  );
}

// Appointment hat kein 'title' und kein 'customer_name'-Feld. Wir nutzen
// notes als Beschriftung und fallen auf status zurueck.
function appointmentLabel(appt) {
  if (!appt) return 'Termin';
  if (appt.notes) return appt.notes;
  if (appt.status) return `Termin (${appt.status})`;
  return 'Termin';
}

// --- Page ------------------------------------------------------------------

export default function BeraterHeute() {
  const { user } = useAuth();
  const now = useMemo(() => new Date(), []);

  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
  } = useQuery({
    queryKey: ['heute-appointments'],
    queryFn: () => safeListEntity(base44, 'Appointment', '-start', 50),
    retry: false,
  });

  const {
    data: followUps = [],
    isLoading: followUpsLoading,
  } = useQuery({
    queryKey: ['heute-followups'],
    queryFn: () => safeListEntity(base44, 'FollowUpTask', '-due_at', 100),
    retry: false,
  });

  const {
    data: leads = [],
    isLoading: leadsLoading,
  } = useQuery({
    queryKey: ['heute-leads'],
    queryFn: () => safeListEntity(base44, 'Lead', '-created_date', 50),
    retry: false,
  });

  const isLoading = appointmentsLoading || followUpsLoading || leadsLoading;

  const overview = useMemo(
    () => buildHeuteOverview({ appointments, followUps, leads, now }),
    [appointments, followUps, leads, now],
  );

  // Ueberfaellige Follow-ups extra zaehlen — buildHeuteOverview liefert sie
  // bereits "heute oder ueberfaellig" sortiert (ueberfaellige zuerst). Wir
  // identifizieren ueberfaellige am due_at < heute 00:00.
  const overdueCount = useMemo(() => {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    return overview.dueFollowUps.filter((task) => {
      const due = toDate(task?.due_at);
      return due && due.getTime() < startOfToday.getTime();
    }).length;
  }, [overview.dueFollowUps, now]);

  const userDisplayName = user?.full_name || user?.name || user?.email || 'Mitarbeiter';
  const headerDate = formatHeaderDate(now);

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Heute</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {userDisplayName}
          {headerDate ? ` · ${headerDate}` : ''}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TodaySectionCard
          title="Termine heute"
          icon={Calendar}
          accent="info"
          isLoading={isLoading}
          count={overview.counts.todayAppointments}
          items={overview.todayAppointments}
          emptyText="Heute keine Termine."
          linkText="Personen-Cockpit"
          linkTo="/berater/personen"
          renderItem={(appt) => (
            <div className="flex items-center justify-between gap-3 py-1.5">
              <span className="text-sm text-foreground truncate">
                {appointmentLabel(appt)}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatTime(appt?.start)}
              </span>
            </div>
          )}
        />

        <TodaySectionCard
          title="Faellige Follow-ups"
          icon={AlertCircle}
          accent={overdueCount > 0 ? 'urgent' : 'default'}
          isLoading={isLoading}
          count={overview.counts.dueFollowUps}
          items={overview.dueFollowUps}
          emptyText="Alles abgearbeitet."
          linkText="Lead-Cockpit"
          linkTo="/berater/leads"
          renderItem={(task) => (
            <div className="flex items-center justify-between gap-3 py-1.5">
              <span className="text-sm text-foreground truncate">
                {followUpLabel(task)}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatDayTime(task?.due_at)}
              </span>
            </div>
          )}
        />

        <TodaySectionCard
          title="Neue Leads"
          icon={UserPlus}
          accent="success"
          isLoading={isLoading}
          count={overview.counts.newLeads}
          items={overview.newLeads}
          emptyText="Keine neuen Leads."
          linkText="Alle Leads"
          linkTo="/berater/leads"
          renderItem={(lead) => (
            <div className="flex items-center justify-between gap-3 py-1.5">
              <span className="text-sm text-foreground truncate">
                {leadDisplayName(lead)}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {lead?.source || ''}
              </span>
            </div>
          )}
        />

        {/* Schnellaktionen — kein Datenfeed, statische Buttons */}
        <Card className="flex flex-col p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </span>
            Schnellaktionen
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="default">
              <Link to="/beratung/neukunde">
                <UserPlus className="h-4 w-4" />
                Neukunde
              </Link>
            </Button>
            <Button asChild variant="default">
              <Link to="/beratung/rehasport">
                <Sparkles className="h-4 w-4" />
                Rehasport
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/berater/rezepte">
                <Pill className="h-4 w-4" />
                Rezept
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/berater/personen">
                <Users className="h-4 w-4" />
                Personen
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
