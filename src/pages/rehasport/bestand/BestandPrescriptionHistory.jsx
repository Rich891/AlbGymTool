import React from 'react';
import { motion } from 'framer-motion';

const OPTIONS = [
  {
    id: 'short_term',
    label: '1–2 Rezepte',
    description: 'Du bist noch relativ frisch im Rehasport oder hast gerade erst erste Erfahrungen gesammelt.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    emoji: '🌱',
  },
  {
    id: 'long_term',
    label: '3 oder mehr Rezepte',
    description: 'Du bist schon länger dabei und wir sollten genauer prüfen, was dich wirklich weiterbringt.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    emoji: '🏅',
  },
];

export default function BestandPrescriptionHistory({ onSelect, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-3xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Zurück
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            WIE LANGE BIST DU<br /><span className="text-primary">SCHON IM REHASPORT?</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {OPTIONS.map((opt, i) => (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(opt.id)}
              className="relative overflow-hidden rounded-3xl h-64 text-left group focus:outline-none">
              <img src={opt.image} alt={opt.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/30" />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/60 rounded-3xl transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(0,200,80,0.25)]" />

              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <p className="text-3xl mb-2">{opt.emoji}</p>
                <h3 className="text-2xl font-black uppercase text-foreground mb-2 group-hover:text-primary transition-colors">
                  {opt.label}
                </h3>
                <p className="text-sm text-white/70 leading-snug">{opt.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}