import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Clock, User, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDays, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';

const SERVICE_LABELS = { geraete: 'Gerätetraining', five: 'FIVE Training', milon: 'Milon Training' };
const SERVICE_COLORS = {
  geraete: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
  five: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  milon: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' }
};
const SERVICE_IDS = { geraete: '7769942', five: '7769943', milon: '7769941' };
const UNIT_IDS = { geraete: null, five: null, milon: null };

export default function RehaBooking({ profile, onBack, onDone }) {
  const [services, setServices] = useState([]);
  const [currentServiceIdx, setCurrentServiceIdx] = useState(0);
  const [slots, setSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState({});
  const [success, setSuccess] = useState(false);

  // Determine services to book
  useEffect(() => {
    const selected = profile.selectedOffers || [];
    const needed = [];
    if (selected.includes('five')) needed.push('five');
    if (selected.includes('milon')) needed.push('milon');
    if (!selected.includes('five') || !selected.includes('milon')) needed.push('geraete');
    setServices(needed.filter(s => !booked[s]));
    if (needed.filter(s => !booked[s]).length === 0 && needed.length > 0) {
      onDone();
    }
  }, [booked, profile.selectedOffers, onDone]);

  const currentService = services[currentServiceIdx];

  // Load slots for current service
  useEffect(() => {
    if (!currentService) return;
    const loadSlots = async () => {
      setLoading(true);
      setSelectedDate(null);
      setSelectedTime(null);
      try {
        const response = await base44.functions.invoke('simplybookApi', {
          action: 'getWorkDays',
          serviceId: SERVICE_IDS[currentService],
        });
        const schedule = response.data.schedule || {};
        const today = new Date();
        const daysWithSlots = {};
        
        for (let i = 0; i < 60; i++) {
          const d = addDays(today, i);
          const key = format(d, 'yyyy-MM-dd');
          if (schedule[key] && schedule[key].is_day_off === '0') {
            const slotResponse = await base44.functions.invoke('simplybookApi', {
              action: 'getSlots',
              serviceId: SERVICE_IDS[currentService],
              date: key,
            });
            const daySlots = slotResponse.data.slots ? Object.values(slotResponse.data.slots).flat() : [];
            if (daySlots.length > 0) {
              daysWithSlots[key] = daySlots;
            }
          }
        }
        setSlots(daysWithSlots);
      } catch (err) {
        console.error('Fehler beim Laden der Termine:', err);
      }
      setLoading(false);
    };
    loadSlots();
  }, [currentService]);

  const handleBook = async () => {
    setBooking(true);
    try {
      const clientData = {
        name: profile.name,
        email: profile.email || 'info@alb-gym.de',
        phone: profile.phone || '+4973819386510'
      };
      await base44.functions.invoke('simplybookApi', {
        action: 'book',
        serviceId: SERVICE_IDS[currentService],
        unitId: UNIT_IDS[currentService],
        date: selectedDate,
        time: selectedTime,
        clientData,
      });
      setSuccess(true);
      setBooked(prev => ({ ...prev, [currentService]: true }));
      setTimeout(() => {
        setSuccess(false);
        setSelectedDate(null);
        setSelectedTime(null);
        setCurrentServiceIdx(prev => prev + 1);
      }, 1800);
    } catch (err) {
      console.error('Buchungsfehler:', err);
    }
    setBooking(false);
  };

  if (!currentService) return null;

  const daysArray = Object.entries(slots).map(([date, times]) => ({ date, times })).slice(0, 14);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-8 pt-8 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft className="w-5 h-5" /> Zurück
        </button>
        <h1 className="text-4xl font-black text-foreground uppercase mb-4">Zeit zu starten!</h1>
        <p className="text-muted-foreground mb-6">Buche die Einweisungstermine für deine Services:</p>
        
        {/* Service Pills */}
        <div className="flex gap-3 flex-wrap">
          {services.map((service, idx) => (
            <motion.div
              key={service}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`px-5 py-2.5 rounded-full font-black text-sm uppercase tracking-wide border ${SERVICE_COLORS[service].bg} ${SERVICE_COLORS[service].text} ${SERVICE_COLORS[service].border} border ${booked[service] ? 'opacity-50' : ''}`}>
              {booked[service] && <Check className="w-4 h-4 inline mr-2" />}
              {SERVICE_LABELS[service]} {booked[service] ? '✓' : ''}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Slots Grid */}
      <div className="flex-1 px-4 md:px-8 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Termine werden geladen…</p>
          </div>
        ) : daysArray.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Keine freien Termine gefunden.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-32">
            {daysArray.map(({ date, times }) => {
              const d = new Date(date + 'T12:00:00');
              const dayName = format(d, 'EEE', { locale: de });
              const monthName = format(d, 'MMM', { locale: de });
              return times.map(time => (
                <motion.button
                  key={`${date}-${time}`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedDate(date); setSelectedTime(time); }}
                  className={`p-3 rounded-xl text-center transition-all duration-300 ${
                    selectedDate === date && selectedTime === time
                      ? `ring-2 ring-offset-2 ring-offset-background ${SERVICE_COLORS[currentService].text.replace('text-', 'ring-')} shadow-lg`
                      : 'border border-border hover:border-primary/50 bg-card'
                  }`}>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-1">{dayName}</p>
                  <p className="text-xs text-muted-foreground mb-1.5">{d.getDate()}. {monthName}</p>
                  <p className="text-lg font-black text-primary">{time.slice(0, 5)}</p>
                </motion.button>
              ));
            })}
          </div>
        )}
      </div>

      {/* Confirmation Sidebar */}
      <AnimatePresence>
        {selectedDate && selectedTime && !success && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-6 md:px-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1">
                <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-4">Bestätigung</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-sm font-bold text-foreground">
                      {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, d. MMMM', { locale: de })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-sm font-bold text-foreground">{selectedTime.slice(0, 5)} Uhr</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-sm font-bold text-foreground">{profile.name}</p>
                  </div>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBook}
                disabled={booking}
                className="w-full md:w-auto h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {booking ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird gebucht…</> : 'Jetzt buchen →'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-[0_0_60px_rgba(0,230,80,0.5)]">
              <Check className="w-12 h-12 text-primary-foreground" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-32 text-center text-foreground font-black text-xl uppercase">
              Termin gebucht! ✓
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}