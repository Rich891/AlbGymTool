import React from 'react';
import { motion } from 'framer-motion';

const OPTIONS = [
  {
    id: 'renew',
    label: 'Rehasport erneuern',
    description: 'Wir schauen gemeinsam, was sich verändert hat und welcher nächste Schritt sinnvoll ist.',
    image: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/14550ee7e_generated_image.png',
    color: 'from-green-900/90',
  },
  {
    id: 'more',
    label: 'Ich möchte mehr tun',
    description: 'Du möchtest deinen Rehasport gezielt ergänzen und mehr aus deinem Training machen.',
    image: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/2f39cef9e_generated_image.png',
    color: 'from-blue-900/90',
    active: true,
  },
];

export default function BestandWelcome({ customer, onSelect, onBack }) {
  const name = customer?.customer_name?.split(' ')[0] || 'Hallo';

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-3xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Zurück
        </button>

        <div className="text-center mb-10">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Bestandskunde</p>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            HALLO {name.toUpperCase()},<br />
            <span className="text-primary">WIE KÖNNEN WIR DIR HELFEN?</span>
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
              className="relative overflow-hidden rounded-3xl h-72 text-left group focus:outline-none">
              <img src={opt.image} alt={opt.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className={`absolute inset-0 bg-gradient-to-t ${opt.color} to-black/30`} />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/60 rounded-3xl transition-all duration-300 shadow-[0_0_0_0_rgba(0,200,80,0)] group-hover:shadow-[0_0_40px_rgba(0,200,80,0.3)]" />

              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
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