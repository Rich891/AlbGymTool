import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, Loader2, Calendar, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const SERVICE_IDS = { geraete: 24, five: 26, milon: 25 };
const UNIT_IDS = { geraete: 9, five: 11, milon: 10 };

const SERVICE_LABELS = {
  geraete: 'Geräte-Einweisung',
  five: 'FIVE-Einweisung',
  milon: 'Milon-Einweisung'
};

const SERVICE_IMAGES = {
  geraete: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80',
  five: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80',
  milon: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=80'
};

const SERVICE_LOGOS = {
  five: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/0291e3711_442236-five_logo_4c_weiss.png',
  milon: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/d9acc9839_442240-milon_logo_weiss.png'
};

// Per-service accent: gradient overlay + slot color
const SERVICE_STYLE = {
  geraete: { gradient: 'from-emerald-900/95', slotBg: 'bg-primary/15 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_0_12px_rgba(0,230,80,0.35)]' },
  five: { gradient: 'from-orange-900/95', slotBg: 'bg-orange-500/15 border-orange-400/40 text-orange-300 hover:bg-orange-500 hover:text-white hover:border-orange-400 hover:shadow-[0_0_12px_rgba(251,146,60,0.4)]' },
  milon: { gradient: 'from-blue-900/95', slotBg: 'bg-blue-500/15 border-blue-400/40 text-blue-300 hover:bg-blue-500 hover:text-white hover:border-blue-400 hover:shadow-[0_0_12px_rgba(96,165,250,0.4)]' }
};

const WEEKDAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function BookingFlow({ serviceType, serviceId, unitId, clientData, onConfirmed, onBack }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [step, setStep] = useState('week');
  const [weekStart, setWeekStart] = useState(() => getMonday(today));
  const [workDays, setWorkDays] = useState({});
  const [loadingDays, setLoadingDays] = useState(false);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loadingSlots, setLoadingSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);

  const style = SERVICE_STYLE[serviceType];

  useEffect(() => {
    const load = async () => {
      setLoadingDays(true);
      try {
        const res = await base44.functions.invoke('simplybookApi', { action: 'getWorkDays', serviceId });
        setWorkDays(res.data.schedule || {});
      } catch {
        setError('Kalender konnte nicht geladen werden.');
      }
      setLoadingDays(false);
    };
    load();
  }, [serviceId]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const isWorkDay = (d) => {
    const key = fmtDate(d);
    const info = workDays[key];
    if (!info || info === '0') return false;
    if (typeof info === 'object' && info.is_day_off === '1') return false;
    return true;
  };

  // Load slots for available days of this week
  useEffect(() => {
    if (loadingDays) return;
    weekDays.forEach(async (d) => {
      if (d < today) return;
      if (!isWorkDay(d)) return;
      const key = fmtDate(d);
      if (slotsByDate[key] !== undefined || loadingSlots[key]) return;
      setLoadingSlots((prev) => ({ ...prev, [key]: true }));
      try {
        const res = await base44.functions.invoke('simplybookApi', { action: 'getSlots', serviceId, date: key });
        setSlotsByDate((prev) => ({ ...prev, [key]: res.data.slots || [] }));
      } catch {
        setSlotsByDate((prev) => ({ ...prev, [key]: [] }));
      }
      setLoadingSlots((prev) => ({ ...prev, [key]: false }));
    });
  }, [weekStart, workDays, loadingDays]);

  const handleBook = async () => {
    setBooking(true);
    setError(null);
    try {
      await base44.functions.invoke('simplybookApi', {
        action: 'book', serviceId, unitId,
        date: selectedDate, time: selectedTime,
        clientData: {
          name: clientData.name,
          email: clientData.email || 'info@alb-gym.de',
          phone: clientData.phone || '+4973819386510'
        }
      });
      setStep('done');
    } catch (e) {
      setError('Buchung fehlgeschlagen: ' + e.message);
    }
    setBooking(false);
  };

  const fmtShort = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
  const weekEnd = addDays(weekStart, 6);

  // Only days with actual slots
  const daysWithSlots = weekDays.filter((d) => {
    const key = fmtDate(d);
    return d >= today && isWorkDay(d) && slotsByDate[key] && slotsByDate[key].length > 0;
  });

  const anyLoading = weekDays.some((d) => loadingSlots[fmtDate(d)]);

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-black text-foreground uppercase mb-2">Termin gebucht!</h3>
        <p className="text-muted-foreground text-sm mb-1">{SERVICE_LABELS[serviceType]}</p>
        <p className="text-muted-foreground text-sm">
          {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })} · {selectedTime && selectedTime.slice(0, 5)} Uhr
        </p>
        <button onClick={onConfirmed} className="mt-8 px-8 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide text-sm hover:bg-primary/90 transition-all">
          Weiter →
        </button>
      </div>);

  }

  return (
    <div>
      {/* Back + label */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={step === 'week' ? onBack : () => setStep('week')}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-bold">{SERVICE_LABELS[serviceType]}</p>
          <p className="text-sm text-foreground font-semibold">{step === 'week' ? 'Termin wählen' : 'Bestätigen'}</p>
        </div>
      </div>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      {/* WEEK VIEW */}
      {step === 'week' &&
      <div className="flex gap-6 -mx-6 -my-6 h-[calc(100vh-200px)]">
          {/* LEFT: Hero image */}
          <div className="hidden md:flex w-1/2 relative overflow-hidden rounded-r-3xl border-r border-border flex-shrink-0">
            <img
            src={SERVICE_IMAGES[serviceType]}
            alt={SERVICE_LABELS[serviceType]}
            className="w-full h-full object-cover" />
          
            <div className={`absolute inset-0 bg-gradient-to-b rounded-[10px] ${style.gradient} to-transparent`} />
            {SERVICE_LOGOS[serviceType] &&
          <div className="absolute top-6 left-6 z-10 h-12">
                <img src={SERVICE_LOGOS[serviceType]} alt="" className="h-full object-contain" />
              </div>
          }
          </div>

          {/* RIGHT: Week nav + slots */}
          <div className="flex-1 flex flex-col px-6 py-6 overflow-y-auto">
            {/* Week navigation */}
            <div className="flex items-center justify-between mb-8 gap-4">
              <button
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              disabled={addDays(weekStart, -1) < today}
              className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              
                <ChevronLeft className="w-4 h-4" /> Vorige
              </button>
              <span className="text-sm font-black text-foreground tracking-wider whitespace-nowrap">
                {fmtShort(weekStart)} – {fmtShort(weekEnd)}
              </span>
              <button
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
              
                Nächste <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loadingDays || (anyLoading && daysWithSlots.length === 0) ?
              <div className="flex flex-col items-center justify-center flex-1 gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Termine werden geladen…</p>
              </div> :
              daysWithSlots.length === 0 ?
              <div className="flex flex-col items-center justify-center flex-1">
                <p className="text-muted-foreground text-sm mb-4">Keine freien Termine diese Woche.</p>
                <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="flex items-center gap-1 text-xs text-primary font-black uppercase tracking-wide hover:underline">
                  Nächste Woche <ChevronRight className="w-3 h-3" />
                </button>
              </div> :

              <div className="space-y-8">
                {daysWithSlots.map((d) => {
                  const key = fmtDate(d);
                  const daySlots = slotsByDate[key] || [];
                  const dayName = WEEKDAYS_SHORT[d.getDay()];
                  const monthName = MONTHS_SHORT[d.getMonth()];

                  return (
                    <div key={key}>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4">{dayName}, {d.getDate()}. {monthName}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {daySlots.map((slot) => (
                    <motion.button
                      key={slot}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {setSelectedDate(key);setSelectedTime(slot);setStep('confirm');}}
                      className="group relative overflow-hidden rounded-3xl p-5 text-left focus:outline-none transition-all duration-300 cursor-pointer border border-border bg-card hover:border-primary/50">

                          {/* Datum oben */}
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-3">{d.getDate()}. {monthName.slice(0, 3)}</p>

                          {/* Tag + Uhrzeit groß */}
                          <div>
                            <p className="text-lg font-black text-foreground uppercase leading-tight">{dayName}</p>
                            <p className="text-4xl font-black text-primary leading-none">
                              {slot.slice(0, 5)}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Uhr</p>
                          </div>

                                            {/* Hover "Jetzt buchen" */}
                            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <span className="text-primary-foreground text-sm font-black uppercase tracking-wide">Jetzt buchen</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
          }
          </div>
        </div>
      }

      {/* CONFIRM */}
      {step === 'confirm' &&
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
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,80,0.3)]">
          
            {booking ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird gebucht…</> : 'Termin jetzt buchen →'}
          </motion.button>
        </div>
      }
    </div>);

}

export default function RehaAppointment({ profile, onDone }) {
  const selected = profile.selectedOffers || [];
  const hasFive = selected.includes('five');
  const hasMilon = selected.includes('milon');

  const needed = [];
  if (hasFive) needed.push('five');
  if (hasMilon) needed.push('milon');
  if (!hasFive && !hasMilon) needed.push('geraete');

  const [confirmed, setConfirmed] = useState({});
  const [activeService, setActiveService] = useState(null);
  const firstName = (profile.name || 'du').split(' ')[0];
  const allConfirmed = needed.every((t) => confirmed[t]);

  const clientData = { name: profile.name, email: profile.email || 'info@alb-gym.de', phone: profile.phone || '+4973819386510' };

  const SERVICE_IMAGES_OUTER = {
    geraete: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80',
    five: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80',
    milon: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=80'
  };
  const OUTER_GRADIENT = { geraete: 'from-emerald-900/95', five: 'from-orange-900/95', milon: 'from-blue-900/95' };
  const OUTER_ACCENT = { geraete: 'text-primary', five: 'text-orange-400', milon: 'text-blue-400' };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full">
        {activeService ?
        <div className="bg-card border border-border rounded-3xl p-6">
            <BookingFlow
            serviceType={activeService}
            serviceId={SERVICE_IDS[activeService]}
            unitId={UNIT_IDS[activeService]}
            clientData={clientData}
            onConfirmed={() => {
              setConfirmed((prev) => ({ ...prev, [activeService]: true }));
              setActiveService(null);
            }}
            onBack={() => setActiveService(null)} />
          
          </div> :

        <>
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

            <div className="space-y-4 mb-8">
              {needed.map((type) =>
            <motion.button
              key={type}
              whileTap={{ scale: 0.98 }}
              onClick={() => !confirmed[type] && setActiveService(type)}
              className={`group relative overflow-hidden rounded-3xl h-48 text-left focus:outline-none w-full transition-all duration-300
                    ${confirmed[type] ?
              'ring-2 ring-primary shadow-[0_0_30px_rgba(0,230,80,0.3)] cursor-default' :
              'hover:shadow-[0_0_20px_rgba(255,255,255,0.06)] cursor-pointer'}`
              }>
              
                  <img src={SERVICE_IMAGES_OUTER[type]} alt={SERVICE_LABELS[type]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${OUTER_GRADIENT[type]} to-black/40 transition-all duration-300`} />

                  {SERVICE_LOGOS[type] &&
              <div className="absolute top-4 left-5 z-10 h-7">
                      <img src={SERVICE_LOGOS[type]} alt="" className="h-full object-contain" />
                    </div>
              }

                  {confirmed[type] &&
              <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
              }

                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h3 className={`text-lg font-black uppercase leading-tight transition-colors duration-300 ${confirmed[type] ? 'text-primary' : OUTER_ACCENT[type]}`}>
                      {SERVICE_LABELS[type]}
                    </h3>
                    <span className={`mt-1 inline-block text-xs font-semibold uppercase tracking-widest ${confirmed[type] ? 'text-primary' : 'text-white/50'}`}>
                      {confirmed[type] ? 'Gebucht ✓' : 'Termin buchen →'}
                    </span>
                  </div>
                </motion.button>
            )}
            </div>

            <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onDone}
            disabled={!allConfirmed}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide text-base hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            
              {allConfirmed ?
            'Weiter zum Abschluss →' :
            `Noch ${needed.filter((t) => !confirmed[t]).length} Termin${needed.filter((t) => !confirmed[t]).length > 1 ? 'e' : ''} ausstehend`}
            </motion.button>
          </>
        }
      </div>
    </div>);

}