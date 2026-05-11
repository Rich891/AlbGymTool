import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdvisorModal from '@/components/advisor/AdvisorModal';

const TILES = [
  {
    id: 'training',
    title: 'Training',
    sub: 'Kraftaufbau, Ausdauer, Abnehmen & mehr',
    image: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/989fbb626_generated_image.png',
    color: 'from-primary/75',
    action: null,
    placeholder: true,
  },
  {
    id: 'rehasport',
    title: 'Rehasport',
    sub: 'Mit Verordnung – Krankenkasse übernimmt die Kosten',
    image: 'https://media.base44.com/images/public/69fd9350879c9d422990f406/f7b1cdfef_generated_image.png',
    color: 'from-teal-500/75',
    action: '/rehasport',
    placeholder: false,
  },
];

export default function HeroPage() {
  const navigate = useNavigate();
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [trainingMsg, setTrainingMsg] = useState(false);

  const handleTile = (tile) => {
    if (tile.placeholder) {
      setTrainingMsg(true);
      setTimeout(() => setTrainingMsg(false), 3000);
      return;
    }
    navigate(tile.action);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Advisor button – top right */}
      <div className="absolute top-5 right-5 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/berater/login')}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-xl border border-border/50 hover:border-border bg-background/80 backdrop-blur-sm font-bold"
        >
          🔐 Beraterbereich
        </motion.button>
      </div>

      {/* Logo */}
      <div className="flex justify-center pt-14 pb-8">
        <motion.img
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          src="https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/0137b7bb4_AlbGymLogo.png"
          alt="AlbGym"
          className="h-16 object-contain"
        />
      </div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center px-6 mb-10"
      >
        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none uppercase">
          WIE KÖNNEN WIR<br /><span className="text-primary">DIR HELFEN?</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-3">Wähle deinen Bereich und starte in wenigen Schritten.</p>
      </motion.div>

      {/* Tiles */}
      <div className="flex-1 px-4 md:px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {TILES.map((tile, i) => (
            <motion.button
              key={tile.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTile(tile)}
              className="group relative overflow-hidden rounded-3xl h-64 md:h-80 text-left focus:outline-none"
            >
              <img
                src={tile.image}
                alt={tile.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${tile.color} to-black/50 transition-opacity duration-300 group-hover:opacity-90`} />
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-3xl ring-inset ring-0 group-hover:ring-2 group-hover:ring-primary/70 transition-all duration-300 group-hover:shadow-[0_0_50px_rgba(0,230,80,0.3)]" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight group-hover:text-primary transition-colors duration-300">
                  {tile.title}
                </h3>
                <p className="text-sm md:text-base text-white/70 mt-2 group-hover:text-white/90 transition-colors duration-300 leading-snug">
                  {tile.sub}
                </p>
                {tile.placeholder && (
                  <span className="mt-3 inline-block text-xs text-white/40 uppercase tracking-wider font-bold">
                    Demnächst verfügbar
                  </span>
                )}
              </div>

              {/* Arrow */}
              <div className={`absolute top-5 right-5 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
                ${tile.placeholder ? 'bg-white/10' : 'bg-white/10 backdrop-blur-sm group-hover:bg-primary/80'}`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Training placeholder notice */}
        {trainingMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 max-w-4xl mx-auto p-5 rounded-2xl border border-primary/30 bg-primary/5 text-center"
          >
            <p className="text-foreground font-semibold">Dieser Bereich wird in Kürze ergänzt.</p>
            <p className="text-muted-foreground text-sm mt-1">Bitte wende dich direkt an das Team vor Ort.</p>
          </motion.div>
        )}
      </div>

      <AdvisorModal open={advisorOpen} onClose={() => setAdvisorOpen(false)} />
    </div>
  );
}