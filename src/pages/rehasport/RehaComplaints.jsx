import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const COMPLAINTS = [
  { id: 'back', label: 'Rücken & Nacken', sub: 'Verspannungen, Rückenschmerzen oder Haltung.', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&q=80', color: 'from-orange-700/70' },
  { id: 'joints', label: 'Knie, Hüfte & Gelenke', sub: 'Belastung, Bewegungseinschränkung oder Unsicherheit.', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80', color: 'from-red-700/70' },
  { id: 'strength', label: 'Kraft & Stabilität', sub: 'Ich fühle mich schwach, instabil oder unsicher.', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=80', color: 'from-blue-700/70' },
  { id: 'everyday', label: 'Beweglichkeit & Alltag', sub: 'Bücken, Aufstehen oder Treppen fallen schwer.', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80', color: 'from-teal-700/70' },
];

export default function RehaComplaints({ profile, update, onNext, onBack }) {
  const toggle = (id) => {
    const current = profile.complaints || [];
    const next = current.includes(id) ? current.filter(c => c !== id) : [...current, id];
    update({ complaints: next });
  };

  return (
    <div className="min-h-screen flex flex-col px-4 md:px-8 pt-8 pb-10">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>

      <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight leading-tight mb-2">
        WAS MACHT DIR AM MEISTEN ZU SCHAFFEN?
      </h1>
      <p className="text-muted-foreground mb-8 text-sm font-medium text-primary">Mehrfachauswahl möglich</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        {COMPLAINTS.map(opt => {
          const selected = (profile.complaints || []).includes(opt.id);
          return (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(opt.id)}
              className={`group relative overflow-hidden rounded-3xl h-52 text-left focus:outline-none transition-all duration-200
                ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_40px_rgba(0,230,80,0.3)]' : 'hover:ring-1 hover:ring-primary/40 hover:shadow-[0_0_20px_rgba(0,230,80,0.15)]'}`}
            >
              <img src={opt.image} alt={opt.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className={`absolute inset-0 bg-gradient-to-t ${opt.color} to-black/60`} />
              {selected && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                  <Check className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <h3 className={`text-xl font-black uppercase leading-tight ${selected ? 'text-primary' : 'text-white group-hover:text-primary'} transition-colors duration-300`}>
                  {opt.label}
                </h3>
                <p className="text-sm text-white/70 mt-1 leading-snug">{opt.sub}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto pt-8 max-w-4xl">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={(profile.complaints || []).length === 0}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Profil anzeigen →
        </motion.button>
      </div>
    </div>
  );
}