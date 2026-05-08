import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Plus, X } from 'lucide-react';
import { calculateScores, findBestTariff } from '@/lib/scoringEngine';

const GOAL_IMAGES = {
  abnehmen: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80',
  muskelaufbau: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  ruecken: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  gesundheit: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  reha: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80',
  performance: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
  stress: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80',
  einfach: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80',
  community: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800&q=80',
};

const ADDON_IMAGES = {
  'Ernährungsberatung': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
  'InBody Analyse': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80',
  'Sauna & Dampfbad': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  'EMS Training': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
  'RedWave': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
  'Avacura': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
  'FFS FitnessführerSchein': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
  'Trainingsberatung': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
  'Rehasport+': 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80',
  'PelviPower': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
};

export default function RecommendationStep({
  customer, anamnesis, selectedGoals, services, tariffs, rules,
  selectedAddons, setSelectedAddons, selectedTariff, setSelectedTariff,
  onNext, onBack
}) {
  const scoredServices = useMemo(() =>
    calculateScores(services, customer, anamnesis, selectedGoals, rules),
    [services, customer, anamnesis, selectedGoals, rules]
  );

  const rankedTariffs = useMemo(() =>
    findBestTariff(tariffs, selectedGoals, scoredServices),
    [tariffs, selectedGoals, scoredServices]
  );

  const bestTariff = rankedTariffs[0];

  useEffect(() => {
    if (bestTariff && !selectedTariff) setSelectedTariff(bestTariff);
  }, [bestTariff]);

  const topUpsells = scoredServices.filter(s => s.isAddon && s.score >= 30).slice(0, 3);

  const toggleAddon = (service) => {
    setSelectedAddons(prev =>
      prev.find(a => a.id === service.id)
        ? prev.filter(a => a.id !== service.id)
        : [...prev, service]
    );
  };

  const totalMonthly = (selectedTariff?.monthly_price || 0) +
    selectedAddons.reduce((sum, a) => sum + (a.price_monthly || 0), 0);

  const heroGoal = selectedGoals[0] || 'gesundheit';
  const heroImage = GOAL_IMAGES[heroGoal] || GOAL_IMAGES.gesundheit;

  const tariffColor = bestTariff?.monthly_price > 60
    ? 'from-yellow-500/20'
    : bestTariff?.monthly_price > 40
    ? 'from-primary/20'
    : 'from-blue-500/20';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Banner */}
      <div className="relative h-44 md:h-56 overflow-hidden flex-shrink-0">
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Dein empfohlener Start</p>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
            {bestTariff?.name || 'Dein Tarif'}
          </h2>
          <p className="text-white/80 mt-2 text-sm md:text-base">{bestTariff?.ideal_for || ''}</p>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-6 pb-6 overflow-y-auto">
        {/* Price + Tariff card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-3xl border-2 border-primary/30 bg-gradient-to-br ${tariffColor} via-card to-card p-6 mb-5 mt-4`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-5xl font-black text-primary leading-none">
                {bestTariff?.monthly_price}<span className="text-2xl">€</span>
              </div>
              <div className="text-muted-foreground text-sm mt-1">pro Monat</div>
            </div>
            <div className="text-right">
              {bestTariff?.start_fee > 0 && (
                <div className="text-sm text-muted-foreground">
                  Startgebühr: <span className="text-foreground font-semibold">{bestTariff.start_fee}€</span>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Laufzeit: <span className="text-foreground font-semibold">{bestTariff?.duration_months || 12} Monate</span>
              </div>
            </div>
          </div>

          {bestTariff?.included_service_names?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Im Tarif enthalten</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {bestTariff.included_service_names.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-sm text-muted-foreground italic">{bestTariff?.description}</p>
        </motion.div>

        {/* Upsells */}
        {topUpsells.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Sinnvolle Ergänzungen</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topUpsells.map((upsell, i) => {
                const isChosen = selectedAddons.find(a => a.id === upsell.id);
                const img = ADDON_IMAGES[upsell.name] || ADDON_IMAGES['Trainingsberatung'];
                return (
                  <motion.button
                    key={upsell.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => toggleAddon(upsell)}
                    className={`group relative overflow-hidden rounded-2xl h-44 text-left transition-all duration-200 focus:outline-none ${isChosen ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                  >
                    <img src={img} alt={upsell.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                    
                    {/* Chosen badge */}
                    <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isChosen ? 'bg-primary' : 'bg-white/20 backdrop-blur-sm'}`}>
                      {isChosen ? <Check className="w-4 h-4 text-primary-foreground" /> : <Plus className="w-4 h-4 text-white" />}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className={`text-base font-black uppercase leading-tight transition-colors ${isChosen ? 'text-primary' : 'text-white'}`}>
                        {upsell.name}
                      </h4>
                      <p className="text-xs text-white/70 mt-0.5 line-clamp-2">{upsell.benefit_argument || upsell.short_description}</p>
                      {upsell.price_monthly > 0 && (
                        <p className="text-sm font-bold text-primary mt-1">+{upsell.price_monthly}€/mtl.</p>
                      )}
                      {upsell.price_once > 0 && (
                        <p className="text-sm font-bold text-primary mt-1">{upsell.price_once}€ einmalig</p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price summary */}
        <div className="bg-secondary/50 rounded-2xl p-5 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tarif {selectedTariff?.name}</span>
            <span className="text-foreground font-semibold">{selectedTariff?.monthly_price || 0}€/mtl.</span>
          </div>
          {selectedAddons.map(a => (
            <div key={a.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                {a.name}
                <button onClick={() => toggleAddon(a)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </span>
              <span className="text-foreground font-semibold">+{a.price_monthly || 0}€</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-black text-foreground uppercase">Gesamt</span>
            <span className="text-2xl font-black text-primary">{totalMonthly}€<span className="text-sm font-normal text-muted-foreground">/mtl.</span></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="h-14 px-6 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNext}
            className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-base uppercase tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Weiter zum Abschluss →
          </button>
        </div>
      </div>
    </div>
  );
}