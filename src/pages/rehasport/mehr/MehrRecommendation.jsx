import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Zap, Info } from 'lucide-react';
import { computeMehrRecommendation, PACKAGE_CONFIG, UPSELL_CONFIG, getPackagePrice, getFocusLabel } from './scoringEngine';

const FIVE_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/0291e3711_442236-five_logo_4c_weiss.png';
const MILON_LOGO = 'https://media.base44.com/images/public/69fd9350879c9d422990f406/d9acc9839_442240-milon_logo_weiss.png';

function ExplainPopup({ reasons, onClose }) {
  const goalLabels = { figur: 'Figur', leistung: 'Leistung', gesundheit: 'Gesundheit' };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="bg-card border border-border rounded-t-3xl md:rounded-3xl w-full md:max-w-lg max-h-[85vh] overflow-y-auto">

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h2 className="text-xl font-black text-foreground uppercase">Warum diese Empfehlung?</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-secondary/40 border border-border rounded-2xl p-4">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Ziel</p>
                  <p className="text-sm font-bold text-foreground">{r.goal}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Fokus</p>
                  <p className="text-sm font-bold text-foreground">{r.focusPoint}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Empfehlung</p>
                  <p className="text-sm font-black text-primary">{r.service}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3">
                <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{r.why}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-bold transition-all text-sm">
            Schließen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function UpsellCard({ serviceId, onAdd, onRemove, isAdded }) {
  const config = UPSELL_CONFIG[serviceId];
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
        isAdded ? 'border-primary shadow-[0_0_25px_rgba(0,200,80,0.3)]' : 'border-border hover:border-primary/40'
      }`}>
      <div className="h-32 relative overflow-hidden">
        <img src={config.image} alt={config.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
        <p className="absolute bottom-3 left-3 font-black text-white uppercase text-sm">{config.name}</p>
        {isAdded && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="p-4 bg-card">
        <div className="mb-2">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">{config.focusPoint}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-snug mb-3">{config.pitch}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{config.price} · {config.priceType}</span>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={isAdded ? () => onRemove(serviceId) : () => onAdd(serviceId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
              isAdded
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}>
            {isAdded ? <><Check className="w-3.5 h-3.5" /> Hinzugefügt</> : <><Plus className="w-3.5 h-3.5" /> Hinzufügen</>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MehrRecommendation({ moreState, customerName, onAccept, onBack }) {
  const [acceptedUpsells, setAcceptedUpsells] = useState([]);
  const [showExplain, setShowExplain] = useState(false);

  const { corePackage, upsells, reasons } = computeMehrRecommendation(moreState);
  const pkgConfig = PACKAGE_CONFIG[corePackage];
  const weeklyPrice = getPackagePrice(corePackage, acceptedUpsells);
  const firstName = customerName?.split(' ')[0] || '';

  const handleAdd = (id) => setAcceptedUpsells(prev => [...prev, id]);
  const handleRemove = (id) => setAcceptedUpsells(prev => prev.filter(u => u !== id));

  const handleAccept = () => {
    const selectedOffers = ['rehasport'];
    if (corePackage.includes('five') || acceptedUpsells.includes('five')) selectedOffers.push('five');
    if (corePackage.includes('milon') || acceptedUpsells.includes('milon')) selectedOffers.push('milon');

    onAccept({
      corePackage,
      selectedOffers,
      acceptedUpsells,
      weekly_price: weeklyPrice,
      reasons,
      moreState,
    });
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
        <div className="w-full max-w-5xl">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            ← Zurück
          </button>

          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Personalisierte Empfehlung</p>
            <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none">
              UNSERE EMPFEHLUNG{firstName ? ` FÜR DICH,` : ''}<br />
              {firstName && <span className="text-primary">{firstName.toUpperCase()}</span>}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Kernpaket – groß, mittig (3 Spalten) */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-3xl border-2 border-primary shadow-[0_0_60px_rgba(0,200,80,0.3)] h-full">
                <div className="h-64 relative overflow-hidden">
                  <img src={pkgConfig.image} alt={pkgConfig.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest">
                    ✓ Empfohlen für dich
                  </div>

                  {/* Logos */}
                  {corePackage.includes('five') && (
                    <img src={FIVE_LOGO} alt="FIVE" className="absolute bottom-20 left-6 h-7 object-contain" />
                  )}
                  {corePackage.includes('milon') && (
                    <img src={MILON_LOGO} alt="Milon" className="absolute bottom-20 left-6 h-7 object-contain" style={{ left: corePackage.includes('five') ? '120px' : '24px' }} />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs font-bold text-primary/80 uppercase tracking-widest mb-1">{pkgConfig.subtitle}</p>
                    <h2 className="text-3xl font-black text-white uppercase">{pkgConfig.name}</h2>
                  </div>
                </div>

                <div className="p-6 bg-card">
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">{pkgConfig.description}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {pkgConfig.includes.map(item => (
                      <span key={item} className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold">
                        ✓ {item}
                      </span>
                    ))}
                    {acceptedUpsells.map(id => (
                      <span key={id} className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-bold">
                        + {UPSELL_CONFIG[id]?.name}
                      </span>
                    ))}
                  </div>

                  {/* Preis */}
                  <div className="flex items-end justify-between mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Wochenpreis</p>
                      <motion.p
                        key={weeklyPrice}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-black text-primary">
                        {weeklyPrice.toFixed(2).replace('.', ',')}€
                      </motion.p>
                      <p className="text-xs text-muted-foreground">pro Woche · ca. {(weeklyPrice * 4.33).toFixed(2).replace('.', ',')}€ / Monat</p>
                    </div>
                    <button
                      onClick={() => setShowExplain(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all text-xs font-bold">
                      <Info className="w-3.5 h-3.5" />
                      Warum das?
                    </button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAccept}
                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-base uppercase tracking-wide hover:bg-primary/90 transition-all shadow-[0_0_25px_rgba(0,200,80,0.3)]">
                    Paket übernehmen →
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Upsells – rechts (2 Spalten) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-px flex-1 bg-border" />
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">Sinnvolle Ergänzungen</p>
                <div className="h-px flex-1 bg-border" />
              </div>

              {upsells.length > 0 ? upsells.map((id) => (
                <UpsellCard
                  key={id}
                  serviceId={id}
                  isAdded={acceptedUpsells.includes(id)}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                />
              )) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground border border-border rounded-2xl">
                  <p className="text-sm">Dein Kernpaket deckt alle Fokuspunkte bereits ab.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showExplain && (
          <ExplainPopup reasons={reasons} onClose={() => setShowExplain(false)} />
        )}
      </AnimatePresence>
    </>
  );
}