import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const FIVE_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/0291e3711_442236-five_logo_4c_weiss.png';
const MILON_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/d9acc9839_442240-milon_logo_weiss.png';

const MEASURES = [
  {
    id: 'rehasport',
    label: 'Rehasport',
    description: 'Ich habe am Rehasport-Kurs teilgenommen.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    logo: null,
  },
  {
    id: 'rehasportPlus',
    label: 'Rehasport+',
    description: 'Ich habe zusätzlich eigenständig im Studio trainiert.',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80',
    logo: null,
  },
  {
    id: 'five',
    label: 'FIVE',
    description: 'Ich habe Beweglichkeits- oder Muskellängentraining genutzt.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    logo: FIVE_LOGO,
  },
  {
    id: 'milon',
    label: 'Milon',
    description: 'Ich habe unterstütztes Krafttraining genutzt.',
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80',
    logo: MILON_LOGO,
  },
];

export default function BestandUsedMeasures({ selected = [], onToggle, onNext, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-3xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Zurück
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            WELCHE MASSNAHMEN<br /><span className="text-primary">HAST DU BISHER GENUTZT?</span>
          </h1>
          <p className="text-muted-foreground">Mehrfachauswahl möglich.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {MEASURES.map((m, i) => {
            const isSelected = selected.includes(m.id);
            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onToggle(m.id)}
                className={`relative overflow-hidden rounded-3xl h-44 text-left group focus:outline-none transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-primary shadow-[0_0_30px_rgba(0,200,80,0.3)]' : ''
                }`}>
                <img src={m.image} alt={m.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className={`absolute inset-0 bg-gradient-to-t ${isSelected ? 'from-green-900/90' : 'from-black/85'} to-black/30`} />

                {m.logo && (
                  <div className="absolute top-4 left-4 h-7 z-10">
                    <img src={m.logo} alt={m.label} className="h-full object-contain" />
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <h3 className={`text-xl font-black uppercase mb-1 transition-colors ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                    {m.label}
                  </h3>
                  <p className="text-sm text-white/70 leading-snug">{m.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={selected.length === 0}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40">
          Weiter →
        </motion.button>
      </div>
    </div>
  );
}

export { MEASURES };