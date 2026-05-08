import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RehaCustomer({ profile, update, onNext, onBack }) {
  const canProceed = profile.name.trim().length > 1 && profile.birthdate && profile.gender;

  return (
    <div className="min-h-screen flex flex-col px-4 md:px-8 pt-8 pb-10">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>

      <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-2">
        WILLKOMMEN<br /><span className="text-primary">IM REHASPORT</span>
      </h1>
      <p className="text-lg text-muted-foreground mb-10 max-w-xl">
        Lass uns dich kurz kennenlernen, damit wir deinen Start besser einordnen können.
      </p>

      <div className="space-y-5 max-w-lg">
        {/* Name */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Dein Name *</label>
          <input
            type="text"
            value={profile.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="Vorname Nachname"
            autoFocus
            className="w-full h-16 px-5 rounded-2xl border-2 border-border bg-card text-foreground text-xl font-semibold placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Birthdate */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Geburtsdatum *</label>
          <input
            type="date"
            value={profile.birthdate}
            onChange={e => update({ birthdate: e.target.value })}
            className="w-full h-16 px-5 rounded-2xl border-2 border-border bg-card text-foreground text-xl font-semibold focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-3">Geschlecht *</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'männlich', label: 'Mann', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80' },
              { id: 'weiblich', label: 'Frau', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80' },
              { id: 'divers', label: 'Divers', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => update({ gender: opt.id })}
                className={`group relative overflow-hidden rounded-2xl h-28 text-left focus:outline-none transition-all duration-200
                  ${profile.gender === opt.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_20px_rgba(0,230,80,0.3)]' : 'hover:ring-1 hover:ring-primary/30'}`}
              >
                <img src={opt.image} alt={opt.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                <span className={`absolute bottom-3 left-0 right-0 text-center text-sm font-black uppercase ${profile.gender === opt.id ? 'text-primary' : 'text-white'}`}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-10 max-w-lg">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={!canProceed}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Weiter →
        </motion.button>
      </div>
    </div>
  );
}