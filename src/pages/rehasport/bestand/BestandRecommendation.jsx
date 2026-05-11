import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { MEASURES } from './BestandUsedMeasures';
import { computeRecommendation, getPackagePrice } from './recommendationLogic';

const FIVE_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/0291e3711_442236-five_logo_4c_weiss.png';
const MILON_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/d9acc9839_442240-milon_logo_weiss.png';

const LOGOS = { five: FIVE_LOGO, milon: MILON_LOGO };

function ExplainPopup({ reasons, onClose, onAccept }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="bg-card border border-border rounded-t-3xl md:rounded-3xl w-full md:max-w-lg max-h-[85vh] overflow-y-auto">

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h2 className="text-xl font-black text-foreground uppercase">Warum diese Empfehlung?</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {reasons.map((r, i) => (
            <div key={i} className="bg-secondary/50 border border-border rounded-2xl p-4">
              {r.deficit && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Defizit</p>
                  <p className="text-foreground font-bold">{r.deficit}</p>
                  <p className="text-sm text-orange-400 font-semibold mt-0.5">{r.currentState}</p>
                </div>
              )}
              {r.wish && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Wunsch</p>
                  <p className="text-foreground font-bold">{r.wish}</p>
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <p className="text-primary font-black text-sm uppercase">{r.measure}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.why}</p>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onAccept}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-sm tracking-widest hover:bg-primary/90 transition-all">
            Empfehlung übernehmen →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BestandRecommendation({ state, onAccept, onKeep, onBack }) {
  const [showExplain, setShowExplain] = useState(false);

  const { recommendedMeasures, reasons, alreadyFits } = computeRecommendation(state);
  const allOffers = [...(state.usedMeasures || []), ...recommendedMeasures];
  const price = getPackagePrice(allOffers);

  // selectedOffers für den Paket-Flow aufbauen
  const buildSelectedOffers = () => {
    const offers = ['rehasport'];
    if (allOffers.includes('rehasportPlus') || allOffers.includes('rehasport')) offers.push('rehasport_plus');
    if (allOffers.includes('five')) offers.push('five');
    if (allOffers.includes('milon')) offers.push('milon');
    return offers;
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
        <div className="w-full max-w-3xl">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            ← Zurück
          </button>

          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Basierend auf deinem Verlauf</p>
            <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none">
              DEINE EMPFEHLUNG
            </h1>
          </div>

          {alreadyFits ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/10 border border-primary/30 rounded-3xl p-8 text-center mb-8">
              <p className="text-2xl font-black text-primary uppercase mb-3">Dein aktueller Weg passt bereits gut.</p>
              <p className="text-muted-foreground">Die bisherigen Maßnahmen decken deine Wünsche gut ab. Kein zusätzlicher Handlungsbedarf.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {MEASURES.map((m, i) => {
                const isUsed = state.usedMeasures?.includes(m.id);
                const isRecommended = recommendedMeasures.includes(m.id);
                const isBase = m.id === 'rehasport';

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative overflow-hidden rounded-2xl h-44 transition-all ${
                      isRecommended
                        ? 'ring-2 ring-primary shadow-[0_0_40px_rgba(0,200,80,0.4)]'
                        : isUsed || isBase
                        ? 'opacity-80'
                        : 'opacity-25 grayscale'
                    }`}>
                    <img src={m.image} alt={m.label} className="absolute inset-0 w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${isRecommended ? 'from-green-900/90' : 'from-black/80'} to-black/30`} />

                    {LOGOS[m.id] && (
                      <div className="absolute top-3 left-3 h-6 z-10">
                        <img src={LOGOS[m.id]} alt={m.label} className="h-full object-contain" />
                      </div>
                    )}

                    {isRecommended && (
                      <motion.div
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-black uppercase z-10">
                        Sinnvoll für dich
                      </motion.div>
                    )}
                    {isUsed && !isRecommended && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-white/20 text-white text-xs font-bold z-10">
                        Bereits genutzt
                      </div>
                    )}

                    <p className={`absolute bottom-3 left-3 text-sm font-black uppercase z-10 ${isRecommended ? 'text-primary' : 'text-white'}`}>
                      {m.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Preis */}
          {!alreadyFits && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-5 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Dein neuer Wochenpreis</p>
                <p className="text-4xl font-black text-primary">{price.toFixed(2).replace('.', ',')}€</p>
                <p className="text-sm text-muted-foreground">pro Woche</p>
              </div>
              <button
                onClick={() => setShowExplain(true)}
                className="px-4 py-2.5 rounded-2xl border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all text-sm font-bold">
                Empfehlung erklären
              </button>
            </motion.div>
          )}

          {/* CTA */}
          <div className="flex flex-col gap-3">
            {!alreadyFits ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onAccept({
                  selectedOffers: buildSelectedOffers(),
                  weekly_price: price,
                  recommendedMeasures,
                  reasons,
                })}
                className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all">
                Empfehlung nutzen →
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onKeep}
                className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all">
                Paket beibehalten →
              </motion.button>
            )}
            {alreadyFits && (
              <button
                onClick={() => onAccept({
                  selectedOffers: buildSelectedOffers(),
                  weekly_price: price,
                  recommendedMeasures,
                  reasons,
                })}
                className="w-full h-12 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-sm font-bold">
                Trotzdem Empfehlung prüfen
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showExplain && (
          <ExplainPopup
            reasons={reasons}
            onClose={() => setShowExplain(false)}
            onAccept={() => {
              setShowExplain(false);
              onAccept({
                selectedOffers: buildSelectedOffers(),
                weekly_price: price,
                recommendedMeasures,
                reasons,
              });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}