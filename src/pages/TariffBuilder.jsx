import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, X, Package, ArrowRight } from 'lucide-react';
import { GOALS, CATEGORY_COLORS } from '@/lib/goalConfig';
import GoalIcon from '@/components/shared/GoalIcon';

export default function TariffBuilder() {
  const [activeGoal, setActiveGoal] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTariff, setSelectedTariff] = useState(null);

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list('-created_date', 200),
  });

  const { data: tariffs = [] } = useQuery({
    queryKey: ['tariffs'],
    queryFn: () => base44.entities.Tariff.list('sort_order', 50),
  });

  const filteredServices = activeGoal
    ? services.filter(s => (s.goal_areas || []).some(g => g.toLowerCase().includes(activeGoal.toLowerCase())))
    : services;

  const toggleService = (service) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const totalMonthly = (selectedTariff?.monthly_price || 0) +
    selectedServices.filter(s => s.is_addon).reduce((sum, s) => sum + (s.price_monthly || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Tarif-Baukasten</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Goals */}
        <div className="col-span-12 md:col-span-2 space-y-2">
          <p className="text-sm font-semibold text-muted-foreground mb-2">Zielbereiche</p>
          <button
            onClick={() => setActiveGoal(null)}
            className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-colors
              ${!activeGoal ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            Alle
          </button>
          {GOALS.map(goal => (
            <button
              key={goal.id}
              onClick={() => setActiveGoal(goal.label)}
              className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-colors flex items-center gap-2
                ${activeGoal === goal.label ? `${goal.bg} ${goal.color}` : 'text-muted-foreground hover:bg-secondary'}`}
            >
              <GoalIcon iconName={goal.icon} className="w-4 h-4" />
              <span className="hidden md:inline">{goal.label}</span>
            </button>
          ))}
        </div>

        {/* Center: Service Cards */}
        <div className="col-span-12 md:col-span-6">
          <p className="text-sm font-semibold text-muted-foreground mb-3">Leistungen</p>

          {/* Tariff Selection */}
          <div className="mb-4 space-y-2">
            <p className="text-xs text-muted-foreground">Basis-Tarif wählen:</p>
            <div className="flex flex-wrap gap-2">
              {tariffs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTariff(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                    ${selectedTariff?.id === t.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-secondary'}`}
                >
                  {t.name} · {t.monthly_price}€
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredServices.map(service => {
              const isSelected = selectedServices.find(s => s.id === service.id);
              const catColor = CATEGORY_COLORS[service.category] || { color: 'text-gray-400', bg: 'bg-gray-400/10' };
              return (
                <Card
                  key={service.id}
                  onClick={() => toggleService(service)}
                  className={`p-4 cursor-pointer transition-all hover:scale-[1.01] border-2
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-foreground text-sm">{service.name}</h4>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <Badge variant="outline" className={`${catColor.bg} ${catColor.color} text-xs mb-1`}>
                    {service.category}
                  </Badge>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{service.short_description}</p>
                  {service.price_monthly > 0 && (
                    <p className="text-xs text-foreground mt-1 font-medium">{service.price_monthly}€/mtl.</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Live Summary */}
        <div className="col-span-12 md:col-span-4">
          <Card className="p-6 bg-card border border-border sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Paketübersicht</h3>
            </div>

            {selectedTariff ? (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4">
                <p className="text-sm font-semibold text-foreground">{selectedTariff.name}</p>
                <p className="text-lg font-bold text-primary">{selectedTariff.monthly_price}€/mtl.</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">Kein Tarif gewählt</p>
            )}

            {selectedServices.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Gewählte Leistungen</p>
                {selectedServices.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{s.name}</span>
                    <button onClick={() => toggleService(s)}>
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Monatlich</span>
                <span className="text-2xl font-black text-primary">{totalMonthly}€</span>
              </div>
              {selectedTariff?.start_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Startgebühr</span>
                  <span className="text-foreground">{selectedTariff.start_fee}€</span>
                </div>
              )}
            </div>

            <Button className="w-full mt-4 h-12 gap-2" disabled={!selectedTariff}>
              Vertrag generieren <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}