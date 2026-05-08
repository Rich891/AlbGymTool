import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, Loader2, Calendar, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const SERVICE_IDS = { geraete: 24, five: 26, milon: 25 };
const UNIT_IDS = { geraete: 9, five: 11, milon: 10 };

const SERVICE_LABELS = {
  geraete: 'Geräte-Einweisung',
  five: 'FIVE-Einweisung',
  milon: 'Milon-Einweisung',
};

const SERVICE_IMAGES = {
  geraete: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80',
  five: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80',
  milon: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=80',
};

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function fmt(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Get Monday of the week containing `date`
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=So
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function BookingFlow({ serviceType, serviceId, unitId, clientData, onConfirmed, onBack }) {
  const [step, setStep] = useState('week'); // week | confirm | done
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [weekStart, setWeekStart] = useState(() => getMonday(today));
  const [workDays, setWorkDays] = useState({});
  const [loadingDays, setLoadingDays] = useState(false);
  // slots per date: { '2026-05-15': ['10:00:00', ...] }
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loadingSlots, setLoadingSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);

  // Load work calendar once
  useEffect(() => {
    const load = async () => {
      setLoadingDays(true);
      try {
        const res = await base44.functions.invoke('simplybookApi', { action: 'getWorkDays', serviceId });
        setWorkDays(res.data.schedule || {});
      } catch (e) {
        setError('Kalender konnte nicht geladen werden.');
      }
      setLoadingDays(false);
    };
    load();
  }, [serviceId]);

  // The 7 days of the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const isWorkDay = (d) => {
    const key = fmt(d);
    const info = workDays[key];
    if (!info) return false;
    if (info === '0') return false;
    if (info.is_day_off === '1') return false;
    return true;
  };

  const isPast = (d) => d < today;

  // Load slots for all available days of the week
  useEffect(() => {
    if (loadingDays) return;
    const availDays = weekDays.filter(d => !isPast(d) && isWorkDay(d));
    availDays.forEach(async (d) => {
      const key = fmt(d);
      if (slotsByDate[key] !== undefined || loadingSlots[key]) return;
      setLoadingSlots(prev => ({ ...prev, [key]: true }));
      try {
        const res = await base44.functions.invoke('simplybookApi', { action: 'getSlots', serviceId, date: key });
        setSlotsByDate(prev => ({ ...prev, [key]: res.data.slots || [] }));
      } catch {
        setSlotsByDate(prev => ({ ...prev, [key]: [] }));
      }
      setLoadingSlots(prev => ({ ...prev, [key]: false }));
    });
  }, [weekStart, workDays, loadingDays]);

  const handleSelectSlot = (dateStr, time) => {
    setSelectedDate(dateStr);
    setSelectedTime(time);
    setStep('confirm');
  };

  const handleBook = async () => {
    setBooking(true);
    setError(null);
    try {
      await base44.functions.invoke('simplybookApi', {
        action: 'book',
        serviceId,
        unitId,
        date: selectedDate,
        time: selectedTime,
        clientData: {
          name: clientData.name,
          email: clientData.email || 'info@alb-gym.de',
          phone: clientData.phone || '+4973819386510',
        },
      });
      setStep('done');
    } catch (e) {
      setError('Buchung fehlgeschlagen: ' + e.message);
    }
    setBooking(false);
  };

  const weekEnd = addDays(weekStart, 6);
  const fmtShort = (d) => `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}`;

  // Days that have at least one slot
  const daysWithSlots = weekDays.filter(d => {
    const key = fmt(d);
    return !isPast(d) && isWorkDay(d) && slotsByDate[key] && slotsByDate[key].length > 0;
  });

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-black text-foreground uppercase mb-2">Termin gebucht!</h3>
        <p className="text-muted-foreground text-sm mb-1">{SERVICE_LABELS[serviceType]}</p>
        <p className="text-muted-foreground text-sm">
          {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })} · {selectedTime && selectedTime.slice(0,5)} Uhr
        </p>
        <button onClick={onConfirmed} className="mt-8 px-8 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide text-sm hover:bg-primary/90 transition-all">
          Weiter →
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={step === 'week' ? onBack : () => setStep('week')}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-bold">{SERVICE_LABELS[serviceType]}</p>
          <p className="text-sm text-foreground font-semibold">
            {step === 'week' ? 'Termin wählen' : 'Bestätigen'}
          </p>
        </div>
      </div>

      {error && <p className="text-destructive text-sm mb-4 px-1">{error}</p>}

      {/* WEEK VIEW */}
      {step === 'week' && (
        <div>
          {/* Week navigation */}
          <div className="flex items-center justify-between mb-5 px-1">
            <button
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              disabled={addDays(weekStart, -1) < today}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Vorige Woche
            </button>
            <span className="text-xs font-black text-foreground tracking-wider">
              {fmtShort(weekStart)} – {fmtShort(weekEnd)}.{weekEnd.getFullYear()}
            </span>
            <button
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Nächste Woche <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loadingDays ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Lädt…</p>
            </div>
          ) : daysWithSlots.length === 0 && !Object.values(loadingSlots).some(Boolean) ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-sm mb-4">Keine freien Termine diese Woche.</p>
              <button
                onClick={() => setWeekStart(addDays(weekStart, 7))}
                className="text-xs text-primary font-black uppercase tracking-wide hover:underline flex items-center gap-1 mx-auto"
              >
                Nächste Woche <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {weekDays.map((d) => {
                const key = fmt(d);
                const past = isPast(d);
                const workday = isWorkDay(d);
                const loading = loadingSlots[key];
                const daySlots = slotsByDate[key] || [];

                if (past || !workday) return null;

                return (
                  <div key={key} className="rounded-2xl border border-border bg-card overflow-hidden">
                    {/* Day header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/50">
                      <div className="text-center min-w-[2.5rem]">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                          {MONTHS[d.getMonth()]} {d.getDate()}
                        </p>
                        <p className="text-lg font-black text-foreground leading-none">
                          {WEEKDAYS[(d.getDay() + 6) % 7]}
                        </p>
                      </div>
                      {daySlots.length > 0 && (
                        <div className="flex items-center gap-1.5 ml-auto">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-xs text-primary font-bold">{daySlots.length} frei</span>
                        </div>
                      )}
                    </div>

                    {/* Slots */}
                    <div className="p-3">
                      {loading ? (
                        <div className="flex justify-center py-3">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : daySlots.length === 0 ? (
                        <p className="text-xs text-muted-foreground/40 text-center py-2">Keine freien Zeiten</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {daySlots.map(slot => (
                            <motion.button
                              key={slot}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSelectSlot(key, slot)}
                              className="px-4 py-2 rounded-xl text-sm font-black border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_0_12px_rgba(0,230,80,0.3)] transition-all cursor-pointer"
                            >
                              {slot.slice(0, 5)}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Show loading days that are workdays */}
              {Object.values(loadingSlots).some(Boolean) && daysWithSlots.length === 0 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-5 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Verfügbar</span>
          </div>
        </div>
      )}

      {/* CONFIRM */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Datum</p>
                <p className="text-sm text-foreground font-black">
                  {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Uhrzeit</p>
                <p className="text-sm text-foreground font-black">{selectedTime && selectedTime.slice(0, 5)} Uhr</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Name</p>
                <p className="text-sm text-foreground font-black">{clientData.name}</p>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleBook}
            disabled={booking}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,80,0.3)]"
          >
            {booking ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird gebucht…</> : 'Termin jetzt buchen →'}
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default function RehaAppointment({ profile, onDone }) {
  const selected = profile.selectedOffers || [];
  const hasFive = selected.includes('five');
  const hasMilon = selected.includes('milon');

  // Determine which einweisungen are needed
  const needed = [];
  if (hasFive) needed.push('five');
  if (hasMilon) needed.push('milon');
  if (!hasFive && !hasMilon) needed.push('geraete'); // fallback

  const [confirmed, setConfirmed] = useState({});
  const [activeService, setActiveService] = useState(null);
  const firstName = (profile.name || 'du').split(' ')[0];
  const allConfirmed = needed.every(t => confirmed[t]);

  const clientData = { name: profile.name, email: profile.email || 'info@alb-gym.de', phone: profile.phone || '+4973819386510' };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-2xl">

        {activeService ? (
          <div className="bg-card border border-border rounded-3xl p-6">
            <BookingFlow
              serviceType={activeService}
              serviceId={SERVICE_IDS[activeService]}
              unitId={UNIT_IDS[activeService]}
              clientData={clientData}
              onConfirmed={() => {
                setConfirmed(prev => ({ ...prev, [activeService]: true }));
                setActiveService(null);
              }}
              onBack={() => setActiveService(null)}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-primary uppercase tracking-widest font-bold">Alles bereit</p>
                <h1 className="text-3xl font-black text-foreground uppercase">Zeit zu starten!</h1>
              </div>
            </div>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Super, {firstName}! Buche jetzt deine Einweisungstermine direkt hier.
            </p>

            <div className={`grid gap-4 mb-8 ${needed.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {needed.map(type => (
                <motion.button
                  key={type}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => !confirmed[type] && setActiveService(type)}
                  className={`group relative overflow-hidden rounded-3xl h-48 text-left focus:outline-none w-full transition-all duration-300
                    ${confirmed[type]
                      ? 'ring-2 ring-primary shadow-[0_0_30px_rgba(0,230,80,0.3)] cursor-default'
                      : 'hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] cursor-pointer'
                    }`}
                >
                  <img src={SERVICE_IMAGES[type]} alt={SERVICE_LABELS[type]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className={`absolute inset-0 bg-gradient-to-t transition-all duration-300 ${confirmed[type] ? 'from-primary/60 to-black/50' : 'from-black/85 to-black/40'}`} />

                  {confirmed[type] && (
                    <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h3 className={`text-lg font-black uppercase leading-tight transition-colors duration-300 ${confirmed[type] ? 'text-primary' : 'text-white'}`}>
                      {SERVICE_LABELS[type]}
                    </h3>
                    <span className={`mt-1 inline-block text-xs font-semibold uppercase tracking-widest ${confirmed[type] ? 'text-primary' : 'text-white/50'}`}>
                      {confirmed[type] ? 'Gebucht ✓' : 'Termin buchen →'}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onDone}
              disabled={!allConfirmed}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide text-base hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {allConfirmed
                ? 'Weiter zum Abschluss →'
                : `Noch ${needed.filter(t => !confirmed[t]).length} Termin${needed.filter(t => !confirmed[t]).length > 1 ? 'e' : ''} ausstehend`}
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}