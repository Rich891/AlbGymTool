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

// Woche startet Montag
const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

// Montag-basierter Offset: So=0 → 6, Mo=1 → 0, Di=2 → 1, ...
function mondayOffset(date) {
  const day = date.getDay(); // 0=So, 1=Mo, ...
  return (day + 6) % 7;
}

function BookingFlow({ serviceType, serviceId, unitId, clientData, onConfirmed, onBack }) {
  const [step, setStep] = useState('calendar');
  const [calMonth, setCalMonth] = useState(new Date());
  const [workDays, setWorkDays] = useState({});
  const [loadingDays, setLoadingDays] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);

  const loadWorkDays = async () => {
    setLoadingDays(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('simplybookApi', { action: 'getWorkDays', serviceId });
      setWorkDays(res.data.schedule || {});
    } catch (e) {
      setError('Kalender konnte nicht geladen werden.');
    }
    setLoadingDays(false);
  };

  useEffect(() => { loadWorkDays(); }, [serviceId]);

  const loadSlots = async (date) => {
    setLoadingSlots(true);
    setSlots([]);
    setError(null);
    try {
      const res = await base44.functions.invoke('simplybookApi', { action: 'getSlots', serviceId, date });
      setSlots(res.data.slots || []);
    } catch (e) {
      setError('Zeiten konnten nicht geladen werden.');
    }
    setLoadingSlots(false);
  };

  const handleDayClick = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedTime(null);
    setStep('time');
    loadSlots(dateStr);
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

  // Calendar grid (Montag-basiert)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
  const lastDay = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0);
  const startOffset = mondayOffset(firstDay);

  const calDays = [];
  for (let i = 0; i < startOffset; i++) calDays.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    calDays.push(new Date(calMonth.getFullYear(), calMonth.getMonth(), d));
  }

  const isAvailable = (d) => {
    if (!d) return false;
    const normalized = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (normalized < today) return false;
    const key = fmt(d);
    const info = workDays[key];
    return info && info.is_day_off !== '1' && info !== '0';
  };

  // Collect all available dates for the current month view
  const availableDates = calDays.filter(d => d && isAvailable(d)).map(d => fmt(d));

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-black text-foreground uppercase mb-2">Termin gebucht!</h3>
        <p className="text-muted-foreground text-sm mb-1">{SERVICE_LABELS[serviceType]}</p>
        <p className="text-muted-foreground text-sm">
          {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })} · {selectedTime}
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
          onClick={step === 'calendar' ? onBack : () => setStep('calendar')}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-bold">{SERVICE_LABELS[serviceType]}</p>
          <p className="text-sm text-foreground font-semibold">
            {step === 'calendar' ? 'Datum wählen' : step === 'time' ? 'Uhrzeit wählen' : 'Bestätigen'}
          </p>
        </div>
      </div>

      {error && <p className="text-destructive text-sm mb-4 px-1">{error}</p>}

      {/* CALENDAR */}
      {step === 'calendar' && (
        <div>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-black text-foreground text-base uppercase tracking-widest">
              {MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}
            </span>
            <button
              onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loadingDays ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Verfügbarkeit wird geladen…</p>
            </div>
          ) : (
            <>
              {/* Availability summary */}
              {availableDates.length > 0 && (
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-xs text-primary font-bold uppercase tracking-wide">
                    {availableDates.length} freie Tag{availableDates.length !== 1 ? 'e' : ''} diesen Monat
                  </p>
                </div>
              )}

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs text-muted-foreground/60 font-bold py-1 uppercase tracking-wider">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {calDays.map((d, i) => {
                  const avail = isAvailable(d);
                  const isToday = d && fmt(d) === fmt(today);
                  const isPast = d && new Date(d.getFullYear(), d.getMonth(), d.getDate()) < today;

                  if (!d) return <div key={i} />;

                  return (
                    <motion.button
                      key={i}
                      whileTap={avail ? { scale: 0.9 } : {}}
                      disabled={!avail}
                      onClick={() => avail && handleDayClick(fmt(d))}
                      className={`
                        relative h-11 rounded-2xl text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center gap-0.5
                        ${avail
                          ? 'bg-primary/15 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_0_16px_rgba(0,230,80,0.4)] cursor-pointer'
                          : isPast
                            ? 'text-muted-foreground/20 cursor-not-allowed'
                            : 'text-muted-foreground/25 cursor-not-allowed'
                        }
                        ${isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''}
                      `}
                    >
                      <span>{d.getDate()}</span>
                      {avail && <span className="w-1 h-1 rounded-full bg-primary absolute bottom-1.5" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-lg bg-primary/15 border border-primary/40" />
                  <span className="text-xs text-muted-foreground">Verfügbar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-lg bg-transparent" />
                  <span className="text-xs text-muted-foreground/40">Nicht verfügbar</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TIME SLOTS */}
      {step === 'time' && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">
              {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {loadingSlots ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Zeiten werden geladen…</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">Keine freien Zeiten an diesem Tag.</p>
              <button onClick={() => setStep('calendar')} className="mt-4 text-xs text-primary font-bold uppercase tracking-wide hover:underline">
                Anderen Tag wählen →
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold mb-3">{slots.length} freie Zeiten</p>
              <div className="grid grid-cols-3 gap-2">
                {slots.map(slot => (
                  <motion.button
                    key={slot}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedTime(slot); setStep('confirm'); }}
                    className="h-13 py-3 rounded-2xl text-sm font-black transition-all border bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_0_12px_rgba(0,230,80,0.3)] cursor-pointer"
                  >
                    {slot.slice(0, 5)}
                  </motion.button>
                ))}
              </div>
            </>
          )}
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