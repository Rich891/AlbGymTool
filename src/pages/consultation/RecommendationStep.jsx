import React, { useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Plus, Star, Sparkles, ArrowRight } from 'lucide-react';
import { GOALS } from '@/lib/goalConfig';
import GoalIcon from '@/components/shared/GoalIcon';
import { calculateScores, findBestTariff } from '@/lib/scoringEngine';

export default function RecommendationStep({ 
  customer, anamnesis, selectedGoals, services, tariffs, rules,
  selectedServices, setSelectedServices, selectedAddons, setSelectedAddons,
  selectedTariff, setSelectedTariff, onNext, onBack 
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
  const topServices = scoredServices.filter(s => s.score >= 50 && !s.isAddon).slice(0, 8);
  const topUpsells = scoredServices.filter(s => s.isAddon && s.score >= 40).slice(0, 3);

  const goalLabels = GOALS.filter(g => selectedGoals.includes(g.id));

  // Auto-select best tariff
  React.useEffect(() => {
    if (bestTariff && !selectedTariff) {
      setSelectedTariff(bestTariff);
    }
  }, [bestTariff]);

  const toggleAddon = (service) => {
    setSelectedAddons(prev => 
      prev.find(a => a.id === service.id)
        ? prev.filter(a => a.id !== service.id)
        : [...prev, service]
    );
  };

  const totalMonthly = (selectedTariff?.monthly_price || 0) + 
    selectedAddons.reduce((sum, a) => sum + (a.price_monthly || 0), 0);

  return (
    <div className="space-y-6">
      {/* Goals Summary */}
      <div className="flex flex-wrap gap-2">
        {goalLabels.map(goal => (
          <Badge key={goal.id} variant="outline" className={`${goal.bg} ${goal.color} ${goal.border} px-3 py-1.5 text-sm`}>
            <GoalIcon iconName={goal.icon} className="w-3.5 h-3.5 mr-1.5" />
            {goal.label}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Recommendation - Center/Left, Large */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tariff Card */}
          {bestTariff && (
            <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-primary/5 via-card to-card border-2 border-primary/30">
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground gap-1 px-3 py-1">
                  <Sparkles className="w-3.5 h-3.5" /> Empfehlung
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">{bestTariff.name}</h2>
                  <p className="text-muted-foreground mt-1">{bestTariff.description || bestTariff.ideal_for}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-primary">{bestTariff.monthly_price}€</span>
                  <span className="text-lg text-muted-foreground">/Monat</span>
                </div>

                {bestTariff.included_service_names?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Enthaltene Leistungen</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {bestTariff.included_service_names.map((name, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bestTariff.start_fee > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Startgebühr: {bestTariff.start_fee}€ · Mindestlaufzeit: {bestTariff.duration_months || 12} Monate
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Top Services */}
          {topServices.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Passende Leistungen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topServices.map((service) => (
                  <Card key={service.id} className="p-4 bg-card border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{service.name}</h4>
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {service.score}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.benefit_argument || service.short_description}</p>
                        {service.reasons.length > 0 && (
                          <p className="text-xs text-primary mt-1">{service.reasons[0]}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upsells - Right Side */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Sinnvolle Ergänzungen</h3>
          
          {topUpsells.length === 0 && (
            <p className="text-sm text-muted-foreground">Keine passenden Zusatzleistungen gefunden.</p>
          )}

          {topUpsells.map((upsell) => {
            const isSelected = selectedAddons.find(a => a.id === upsell.id);
            return (
              <Card 
                key={upsell.id} 
                className={`p-5 border-2 transition-all cursor-pointer hover:scale-[1.01]
                  ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                onClick={() => toggleAddon(upsell)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{upsell.name}</h4>
                  <Button 
                    size="sm" 
                    variant={isSelected ? 'default' : 'outline'}
                    className="h-8 text-xs gap-1"
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {isSelected ? 'Gewählt' : 'Hinzufügen'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{upsell.benefit_argument || upsell.short_description}</p>
                {upsell.reasons.length > 0 && (
                  <p className="text-xs text-primary mb-2">{upsell.reasons[0]}</p>
                )}
                {upsell.price_monthly > 0 && (
                  <p className="text-sm font-semibold text-foreground">+{upsell.price_monthly}€/Monat</p>
                )}
              </Card>
            );
          })}

          {/* Price Summary */}
          <Card className="p-5 bg-secondary/50 border border-border">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tarif</span>
                <span className="text-foreground font-medium">{selectedTariff?.monthly_price || 0}€/mtl.</span>
              </div>
              {selectedAddons.map(addon => (
                <div key={addon.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{addon.name}</span>
                  <span className="text-foreground font-medium">+{addon.price_monthly || 0}€</span>
                </div>
              ))}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Gesamt</span>
                  <span className="text-2xl font-black text-primary">{totalMonthly}€<span className="text-sm font-normal text-muted-foreground">/mtl.</span></span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="h-14 px-6 text-base gap-2">
          <ArrowLeft className="w-5 h-5" /> Zurück
        </Button>
        <Button onClick={onNext} className="flex-1 h-14 text-base font-semibold gap-2">
          Weiter zum Abschluss <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}