import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

function BigCard({ title, sub, image, color, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      className={`group relative overflow-hidden rounded-3xl h-64 md:h-72 text-left focus:outline-none w-full
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className={`absolute inset-0 bg-gradient-to-t ${color} to-black/60 transition-opacity duration-300`} />
      <div className="absolute inset-0 rounded-3xl ring-inset ring-0 group-hover:ring-2 group-hover:ring-primary/70 transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(0,230,80,0.25)]" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-white/70 mt-2 group-hover:text-white/90 transition-colors duration-300 leading-snug">{sub}</p>
      </div>
    </motion.button>
  );
}

export default function RehaStart({ onNew, onExisting, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-4xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none">
            REHASPORT<br /><span className="text-primary">IM ALBGYM</span>
          </h1>
          <p className="text-lg text-muted-foreground mt-3">
            Starte sicher, verständlich und mit einem klaren nächsten Schritt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <BigCard
            title="Ich starte neu"
            sub="Ich möchte mit Rehasport beginnen."
            image="https://media.base44.com/images/public/69fd9350879c9d422990f406/612d28ff5_generated_image.png"
            color="from-primary/70"
            onClick={onNew}
          />
          <div className="relative group">
            <BigCard
              title="Ich bin schon dabei"
              sub="Ich nehme bereits am Rehasport teil und möchte meinen nächsten Schritt klären."
              image="https://media.base44.com/images/public/69fd9350879c9d422990f406/05adde033_generated_image.png"
              color="from-blue-600/70"
              onClick={onExisting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}