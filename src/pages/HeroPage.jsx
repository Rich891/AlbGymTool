import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdvisorModal from '@/components/advisor/AdvisorModal';

const ENTRY_TILES = [
  {
    id: 'neukunde',
    title: 'Ich will fitter werden',
    subtitle: 'Mehr Energie, mehr Stärke, mehr Lebensgefühl',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    type: 'neukunde',
  },
  {
    id: 'beschwerden',
    title: 'Ich möchte Beschwerden angehen',
    subtitle: 'Rücken, Gelenke oder Schmerzen gezielt verbessern',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    type: 'rehasport',
  },
  {
    id: 'sicher',
    title: 'Ich will sicher und mit Plan starten',
    subtitle: 'Geführt, strukturiert und mit professioneller Anleitung',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    type: 'neukunde',
  },
  {
    id: 'reha',
    title: 'Ich bin wegen Rehasport hier',
    subtitle: 'Mit Verordnung – Krankenkasse übernimmt die Kosten',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80',
    type: 'rehasport',
  },
];

export default function HeroPage() {
  const navigate = useNavigate();
  const [advisorOpen, setAdvisorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Beraterbereich button – top right */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setAdvisorOpen(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-xl border border-border/50 hover:border-border bg-background/80 backdrop-blur-sm"
        >
          Beraterbereich
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-16 pb-10 px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <img
            src="https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/0137b7bb4_AlbGymLogo.png"
            alt="AlbGym"
            className="h-16 object-contain mx-auto"
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none uppercase mb-4"
        >
          DEIN PASSENDER<br />
          <span className="text-primary">START IM ALBGYM</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
        >
          Finde in wenigen Schritten heraus, welche Trainingslösung<br className="hidden md:block" />
          am besten zu dir und deinen Zielen passt.
        </motion.p>
      </div>

      {/* Entry Tiles */}
      <div className="flex-1 px-4 md:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {ENTRY_TILES.map((tile, i) => (
            <motion.button
              key={tile.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              onClick={() => navigate(`/beratung/${tile.type}?entry=${tile.id}`)}
              className="group relative overflow-hidden rounded-3xl h-52 md:h-64 text-left focus:outline-none"
            >
              {/* Background Image */}
              <img
                src={tile.image}
                alt={tile.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/70 transition-all duration-300" />
              {/* Green accent on hover */}
              <div className="absolute inset-0 ring-inset ring-0 group-hover:ring-2 group-hover:ring-primary/60 rounded-3xl transition-all duration-300" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl md:text-2xl font-black text-white uppercase leading-tight mb-1 group-hover:text-primary transition-colors duration-300">
                  {tile.title}
                </h3>
                <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300 leading-snug">
                  {tile.subtitle}
                </p>
              </div>

              {/* Arrow indicator */}
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/80 transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AdvisorModal open={advisorOpen} onClose={() => setAdvisorOpen(false)} />
    </div>
  );
}