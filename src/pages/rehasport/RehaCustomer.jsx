import React from 'react';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';

const TEST_CUSTOMER = {
  first_name: 'Max',
  last_name: 'Mustermann',
  birthdate: '1980-06-15',
  gender: 'männlich',
};

export default function RehaCustomer({ profile, update, onNext, onBack, testMode }) {
  const firstName = profile.first_name || '';
  const lastName = profile.last_name || '';
  const canProceed = firstName.trim().length > 0 && lastName.trim().length > 0 && profile.birthdate && profile.gender;

  const fillTestData = () => {
    update({ ...TEST_CUSTOMER, name: `${TEST_CUSTOMER.first_name} ${TEST_CUSTOMER.last_name}` });
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-lg">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>

      {testMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between bg-orange-500/10 border border-orange-500/30 rounded-2xl px-5 py-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-orange-400" />
            <p className="text-sm font-bold text-orange-400">Test-Modus aktiv</p>
          </div>
          <button
            onClick={fillTestData}
            className="px-4 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-xs font-black text-orange-300 hover:bg-orange-500/30 transition-all uppercase tracking-widest">
            Felder befüllen
          </button>
        </motion.div>
      )}

      <div className="text-center mb-10">
      <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-2">
        WILLKOMMEN<br /><span className="text-primary">IM REHASPORT</span>
      </h1>
      <p className="text-lg text-muted-foreground">
        Lass uns dich kurz kennenlernen, damit wir deinen Start besser einordnen können.
      </p>
      </div>

      <div className="space-y-5">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Vorname *</label>
            <input
              type="text"
              value={firstName}
              onChange={e => update({ first_name: e.target.value, name: `${e.target.value} ${lastName}`.trim() })}
              placeholder="Max"
              className="w-full h-16 px-5 rounded-2xl border-2 border-border bg-card text-foreground text-xl font-semibold placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Nachname *</label>
            <input
              type="text"
              value={lastName}
              onChange={e => update({ last_name: e.target.value, name: `${firstName} ${e.target.value}`.trim() })}
              placeholder="Mustermann"
              className="w-full h-16 px-5 rounded-2xl border-2 border-border bg-card text-foreground text-xl font-semibold placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
            />
          </div>
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

      <div className="mt-10">
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
    </div>
  );
}