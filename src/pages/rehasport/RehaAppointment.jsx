import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOKING_URLS = {
  geraete: 'https://albgym.simplybook.it/v2/#book-class/service/24',
  five: 'https://albgym.simplybook.it/v2/#book-class/service/26',
  milon: 'https://albgym.simplybook.it/v2/#book-class/service/25',
};

const CARD_CONFIG = {
  geraete: {
    title: 'Geräte-Einweisung',
    sub: 'Wir zeigen dir alle relevanten Geräte, damit du sicher und selbstständig trainieren kannst.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80',
  },
  five: {
    title: 'FIVE-Einweisung',
    sub: 'Wir zeigen dir, wie du FIVE sinnvoll nutzt und gezielt trainierst.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80',
  },
  milon: {
    title: 'Milon-Einweisung',
    sub: 'Wir richten deine Geräte ein und zeigen dir, wie du sicher und einfach trainierst.',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=80',
  },
};

function BookingPopup({ type, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl h-[80vh] bg-card rounded-3xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <span className="font-black text-foreground uppercase text-sm tracking-wide">
            {CARD_CONFIG[type]?.title}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <iframe
          src={BOOKING_URLS[type]}
          className="flex-1 w-full border-0"
          title={CARD_CONFIG[type]?.title}
        />
        <div className="px-5 py-4 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide text-sm hover:bg-primary/90 transition-all"
          >
            Termin bestätigt ✓
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ type, confirmed, onBook }) {
  const cfg = CARD_CONFIG[type];
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onBook}
      className={`group relative overflow-hidden rounded-3xl h-56 text-left focus:outline-none w-full transition-all duration-300
        ${confirmed
          ? 'ring-2 ring-primary shadow-[0_0_30px_rgba(0,230,80,0.3)]'
          : 'hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]'
        }`}
    >
      <img src={cfg.image} alt={cfg.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className={`absolute inset-0 bg-gradient-to-t transition-all duration-300 ${confirmed ? 'from-primary/60 to-black/50' : 'from-black/85 to-black/40'}`} />
      <div className={`absolute inset-0 rounded-3xl ring-1 transition-all duration-300 ${confirmed ? 'ring-primary' : 'ring-border group-hover:ring-white/20'}`} />

      {confirmed && (
        <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-5 h-5 text-primary-foreground" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <h3 className={`text-xl font-black uppercase leading-tight transition-colors duration-300 ${confirmed ? 'text-primary' : 'text-white'}`}>
          {cfg.title}
        </h3>
        <p className="text-sm text-white/60 mt-1 leading-snug">{cfg.sub}</p>
        {!confirmed && (
          <span className="mt-2 inline-block text-xs text-white/40 font-semibold uppercase tracking-widest">Termin buchen →</span>
        )}
        {confirmed && (
          <span className="mt-2 inline-block text-xs text-primary font-bold uppercase tracking-widest">Gebucht ✓</span>
        )}
      </div>
    </motion.button>
  );
}

export default function RehaAppointment({ profile, onDone }) {
  const selected = profile.selectedOffers || [];
  const hasFive = selected.includes('five');
  const hasMilon = selected.includes('milon');
  const hasGeraete = hasFive && !hasMilon;

  // Which card types to show
  const cardTypes = [];
  if (hasFive) cardTypes.push('five');
  if (hasMilon) cardTypes.push('milon');
  if (hasGeraete) cardTypes.push('geraete');
  if (cardTypes.length === 0) cardTypes.push('geraete'); // fallback: always show Geräte

  const [confirmed, setConfirmed] = useState({});
  const [activePopup, setActivePopup] = useState(null);
  const firstName = (profile.name || 'du').split(' ')[0];

  const allConfirmed = cardTypes.every(t => confirmed[t]);

  const handleClose = (type) => {
    setConfirmed(prev => ({ ...prev, [type]: true }));
    setActivePopup(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-3xl">

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

        <p className="text-muted-foreground mb-8 max-w-xl leading-relaxed">
          Super, {firstName}! Wähle jetzt deinen Einweisungstermin, damit du sicher starten kannst.
          {cardTypes.length > 1 && ' Buche beide Termine, um abzuschließen.'}
        </p>

        <div className={`grid gap-4 mb-8 ${cardTypes.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {cardTypes.map(type => (
            <AppointmentCard
              key={type}
              type={type}
              confirmed={!!confirmed[type]}
              onBook={() => setActivePopup(type)}
            />
          ))}
        </div>

        {/* Continue button — only active when all confirmed */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDone}
          disabled={!allConfirmed}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide text-base hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {allConfirmed ? 'Weiter zum Abschluss →' : `Noch ${cardTypes.filter(t => !confirmed[t]).length} Termin${cardTypes.filter(t => !confirmed[t]).length > 1 ? 'e' : ''} ausstehend`}
        </motion.button>
      </div>

      {/* Booking Popup */}
      <AnimatePresence>
        {activePopup && (
          <motion.div
            key="popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BookingPopup type={activePopup} onClose={() => handleClose(activePopup)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}