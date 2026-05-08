import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp, Clock, Target, FileText } from 'lucide-react';

export default function Analytics() {
  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations-all'],
    queryFn: () => base44.entities.Consultation.list('-created_date', 500),
  });

  const total = consultations.length;
  const completed = consultations.filter(c => c.outcome === 'abschluss').length;
  const trials = consultations.filter(c => c.outcome === 'testphase').length;
  const offers = consultations.filter(c => c.outcome === 'angebot').length;
  const closeRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const avgValue = total > 0
    ? Math.round(consultations.reduce((sum, c) => sum + (c.monthly_price || 0), 0) / total)
    : 0;

  // Goal frequency
  const goalCounts = {};
  consultations.forEach(c => {
    (c.selected_goals || []).forEach(g => {
      goalCounts[g] = (goalCounts[g] || 0) + 1;
    });
  });
  const topGoals = Object.entries(goalCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Upsell stats
  const totalUpsellsAccepted = consultations.reduce((sum, c) => sum + (c.upsells_accepted?.length || 0), 0);
  const totalUpsellsShown = consultations.reduce((sum, c) => sum + (c.upsells_shown?.length || 0), 0);
  const upsellRate = totalUpsellsShown > 0 ? Math.round((totalUpsellsAccepted / totalUpsellsShown) * 100) : 0;

  const STATS = [
    { label: 'Beratungen', value: total, icon: FileText, color: 'text-blue-400' },
    { label: 'Abschlussquote', value: `${closeRate}%`, icon: TrendingUp, color: 'text-primary' },
    { label: 'Ø Vertragswert', value: `${avgValue}€`, icon: BarChart3, color: 'text-orange-400' },
    { label: 'Testphasen', value: trials, icon: Clock, color: 'text-cyan-400' },
    { label: 'Angebote', value: offers, icon: Target, color: 'text-purple-400' },
    { label: 'Upsell-Rate', value: `${upsellRate}%`, icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATS.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5 bg-card border border-border">
              <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Häufigste Ziele</h3>
          {topGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Daten</p>
          ) : (
            <div className="space-y-3">
              {topGoals.map(([goal, count]) => (
                <div key={goal} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{goal}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${Math.round((count / total) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Beratungstypen</h3>
          {(() => {
            const typeCounts = {};
            consultations.forEach(c => {
              typeCounts[c.consultation_type] = (typeCounts[c.consultation_type] || 0) + 1;
            });
            const types = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
            return types.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Daten</p>
            ) : (
              <div className="space-y-3">
                {types.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-foreground capitalize">{type}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-400 rounded-full" 
                          style={{ width: `${Math.round((count / total) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </Card>
      </div>
    </div>
  );
}