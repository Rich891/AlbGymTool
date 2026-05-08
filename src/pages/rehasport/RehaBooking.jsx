import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addDays, format, startOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';

const SERVICE_LABELS = { geraete: 'Geräte-Einweisung', five: 'FIVE Training', milon: 'Milon Training' };
const SERVICE_COLORS = {
  geraete: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30', slotBg: 'hover:bg-primary/20 hover:border-primary' },
  five: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', slotBg: 'hover:bg-orange-500/20 hover:border-orange-400' },
  milon: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', slotBg: 'hover:bg-blue-500/20 hover:border-blue-400' }
};
const SERVICE_IDS = { geraete: 24, five: 26, milon: 25 };
const UNIT_IDS = { geraete: 9, five: 11, milon: 10 };

export default function RehaBooking({ profile, onBack, onDone }) {
  const [services, setServices] = useState([]);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [allSlots, setAllSlots] = useState({});
  const [loadingServices, setLoadingServices] = useState(new Set());
  const [booked, setBooked] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  const slotCacheRef = useRef({});
  const bookingRef = useRef(false);

  // Determine services once
  useEffect(() => {
    const selected = profile.selectedOffers || [];
    const needed = [];
    if (selected.includes('five')) needed.push('five');
    if (selected.includes('milon')) needed.push('milon');
    if (!selected.includes('five') || !selected.includes('milon')) needed.push('geraete');
    
    if (needed.length === 0) {
      onDone();
      return;
    }
    
    setServices(needed);
    if (!selectedService && needed.length > 0) {
      setSelectedService(needed[0]);
    }
  }, []);

  // Auto-done when all booked
  useEffect(() => {
    if (services.length > 0 && services.every(s => booked[s])) {
      onDone();
    }
  }, [booked, services, onDone]);

  // Load slots for ALL services in parallel when week changes
  useEffect(() => {
    if (services.length === 0) return;

    const loadAllSlots = async () => {
      setLoadingServices(new Set(services));

      try {
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
        
        // Parallel load for all services
        const promises = services.map(async (service) => {
          const cacheKey = `${service}-${format(weekStart, 'yyyy-MM-dd')}`;
          
          if (slotCacheRef.current[cacheKey]) {
            return { service, slots: slotCacheRef.current[cacheKey] };
          }

          const daysWithSlots = {};

          try {
            // Parallel load for all days of current service
            const dayPromises = weekDays.map(async (d) => {
              const dateKey = format(d, 'yyyy-MM-dd');
              try {
                const response = await base44.functions.invoke('simplybookApi', {
                  action: 'getSlots',
                  serviceId: SERVICE_IDS[service],
                  date: dateKey,
                });
                const daySlots = response.data.slots ? Object.values(response.data.slots).flat() : [];
                return { dateKey, daySlots };
              } catch (err) {
                console.warn(`Slots ${service} ${dateKey}:`, err.message);
                return { dateKey, daySlots: [] };
              }
            });

            const dayResults = await Promise.all(dayPromises);
            dayResults.forEach(({ dateKey, daySlots }) => {
              if (daySlots.length > 0) {
                daysWithSlots[dateKey] = daySlots;
              }
            });

            slotCacheRef.current[cacheKey] = daysWithSlots;
            return { service, slots: daysWithSlots };
          } catch (err) {
            console.error(`Load ${service}:`, err);
            return { service, slots: {} };
          }
        });

        const results = await Promise.all(promises);
        
        const merged = {};
        results.forEach(({ service, slots }) => {
          merged[service] = slots;
        });
        
        setAllSlots(merged);
      } finally {
        setLoadingServices(new Set());
      }
    };

    loadAllSlots();
  }, [weekStart, services]);

  const handleBook = async () => {
    if (bookingRef.current || !selectedDate || !selectedTime || !selectedService) return;
    
    bookingRef.current = true;
    setBooking(true);

    try {
      await base44.functions.invoke('simplybookApi', {
        action: 'book',
        serviceId: SERVICE_IDS[selectedService],
        unitId: UNIT_IDS[selectedService],
        date: selectedDate,
        time: selectedTime,
        clientData: {
          name: profile.name,
          email: profile.email || 'info@alb-gym.de',
          phone: profile.phone || '+4973819386510'
        },
      });

      setSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setBooked(prev => ({ ...prev, [selectedService]: true }));
      setSelectedDate(null);
      setSelectedTime(null);
      setSuccess(false);

      // Move to next unbooked service
      const nextService = services.find(s => !booked[s] && s !== selectedService);
      if (nextService) {
        setSelectedService(nextService);
      }
    } catch (err) {
      console.error('Buchung:', err);
      setSuccess(false);
    }

    setBooking(false);
    bookingRef.current = false;
  };

  if (services.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Keine Services zum Buchen.</p>
      </div>
    );
  }

  const weekEnd = addDays(weekStart, 6);
  const currentSlots = allSlots[selectedService] || {};
  const daysArray = Object.entries(currentSlots)
    .map(([date, times]) => ({ date, times }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const isLoading = loadingServices.has(selectedService);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 md:px-8 pt-8 pb-6 border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft className="w-5 h-5" /> Zurück
        </button>
        <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase mb-4">Zeit zu starten!</h1>
        <p className="text-muted-foreground mb-4">Buche deine Einweisungstermine:</p>

        {/* Service Pills */}
        <div className="flex gap-3 flex-wrap">
          {services.map((service) => (
            <motion.button
              key={service}
              onClick={() => setSelectedService(service)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wide border transition-all cursor-pointer ${
                booked[service]
                  ? `${SERVICE_COLORS[service].bg} ${SERVICE_COLORS[service].text} ${SERVICE_COLORS[service].border} opacity-50 line-through`
                  : selectedService === service
                  ? `ring-2 ring-offset-2 ring-offset-background ${SERVICE_COLORS[service].border.replace('border-', 'ring-')}`
                  : `${SERVICE_COLORS[service].bg} ${SERVICE_COLORS[service].text} ${SERVICE_COLORS[service].border}`
              }`}>
              {booked[service] && <Check className="w-3 h-3 inline mr-1" />}
              {SERVICE_LABELS[service]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="px-4 md:px-8 py-6 border-b border-border flex items-center justify-between gap-4">
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-foreground whitespace-nowrap">
          {format(weekStart, 'd. MMM', { locale: de })} – {format(weekEnd, 'd. MMM', { locale: de })}
        </span>
        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slots Grid */}
      <div className="flex-1 px-4 md:px-8 overflow-y-auto pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Termine werden geladen…</p>
          </div>
        ) : daysArray.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Keine Termine diese Woche verfügbar.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {daysArray.map(({ date, times }) => {
              const d = new Date(date + 'T12:00:00');
              const dayName = format(d, 'EEEE', { locale: de });
              const monthName = format(d, 'dd. MMM', { locale: de });

              return times.slice(0, 2).map((time) => (
                <motion.button
                  key={`${date}-${time}`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedDate(date); setSelectedTime(time); }}
                  disabled={booking}
                  className={`p-6 rounded-2xl text-center transition-all duration-300 border-2 h-32 flex flex-col justify-center disabled:opacity-50 ${
                    selectedDate === date && selectedTime === time
                      ? `ring-2 ring-offset-2 ring-offset-background shadow-lg ${SERVICE_COLORS[selectedService].border.replace('border-', 'ring-')}`
                      : `border-border bg-card ${SERVICE_COLORS[selectedService].slotBg}`
                  }`}>
                  <p className="text-xs text-muted-foreground uppercase font-bold">{dayName}</p>
                  <p className="text-xs text-muted-foreground mb-1">{monthName}</p>
                  <p className={`text-4xl font-black ${SERVICE_COLORS[selectedService].text}`}>{time.slice(0, 5)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Uhr</p>
                </motion.button>
              ));
            })}
          </div>
        )}
      </div>

      {/* Confirmation Footer */}
      <AnimatePresence>
        {selectedDate && selectedTime && !success && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-6 md:px-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
                  {SERVICE_LABELS[selectedService]} buchen
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-sm font-bold text-foreground">
                      {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, d. MMMM yyyy', { locale: de })}
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
                {booking ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird gebucht…</> : 'Termin buchen →'}
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
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
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