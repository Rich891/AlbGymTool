import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_MAP = {
  abgeschlossen: { label: 'Abgeschlossen', className: 'bg-primary/10 text-primary' },
  testphase: { label: 'Testphase', className: 'bg-blue-400/10 text-blue-400' },
  angebot_gespeichert: { label: 'Angebot', className: 'bg-orange-400/10 text-orange-400' },
  aktiv: { label: 'Aktiv', className: 'bg-yellow-400/10 text-yellow-400' },
  abgebrochen: { label: 'Abgebrochen', className: 'bg-destructive/10 text-destructive' },
};

export default function ConsultationHistory() {
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => base44.entities.Consultation.list('-created_date', 200),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Beratungsverlauf</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : consultations.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Noch keine Beratungen vorhanden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map(c => {
            const status = STATUS_MAP[c.status] || STATUS_MAP.aktiv;
            return (
              <Card key={c.id} className="p-5 bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{c.customer_name || 'Unbekannt'}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        <span className="capitalize">{c.consultation_type}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {c.created_date ? format(new Date(c.created_date), 'dd.MM.yyyy') : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.monthly_price > 0 && (
                      <span className="text-lg font-bold text-foreground">{c.monthly_price}€/mtl.</span>
                    )}
                    <Badge className={status.className}>{status.label}</Badge>
                  </div>
                </div>
                {(c.selected_tariff || c.selected_goals?.length > 0) && (
                  <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-2">
                    {c.selected_tariff && (
                      <Badge variant="outline" className="text-xs">Tarif: {c.selected_tariff}</Badge>
                    )}
                    {c.selected_goals?.map(g => (
                      <Badge key={g} variant="outline" className="text-xs text-primary">{g}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}