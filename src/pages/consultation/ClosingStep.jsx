import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Clock, Save, FileText, Sparkles } from 'lucide-react';

export default function ClosingStep({ 
  customer, selectedTariff, selectedAddons, totalMonthly, 
  onClose, onBack 
}) {
  const [outcome, setOutcome] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFinish = async (selectedOutcome) => {
    setOutcome(selectedOutcome);
    setSaving(true);
    await onClose(selectedOutcome, notes);
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Summary */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Zusammenfassung</h2>
          <p className="text-muted-foreground mt-1">
            Beratung für {customer.first_name} {customer.last_name}
          </p>
        </div>

        <div className="space-y-4">
          {/* Tariff */}
          <div className="p-5 rounded-2xl bg-secondary/50 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-primary/10 text-primary mb-2">Empfohlener Tarif</Badge>
                <h3 className="text-xl font-bold text-foreground">{selectedTariff?.name || 'Kein Tarif gewählt'}</h3>
              </div>
              <span className="text-3xl font-black text-primary">{selectedTariff?.monthly_price || 0}€</span>
            </div>
          </div>

          {/* Addons */}
          {selectedAddons.length > 0 && (
            <div className="p-5 rounded-2xl bg-secondary/50 border border-border">
              <p className="text-sm font-semibold text-muted-foreground mb-3">Zusatzleistungen</p>
              {selectedAddons.map(addon => (
                <div key={addon.id} className="flex items-center justify-between py-2">
                  <span className="text-foreground">{addon.name}</span>
                  <span className="text-foreground font-medium">+{addon.price_monthly || 0}€/mtl.</span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground mb-1">Monatlicher Gesamtpreis</p>
            <span className="text-4xl font-black text-primary">{totalMonthly}€</span>
            <span className="text-muted-foreground">/Monat</span>
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-5 bg-card border border-border">
        <p className="text-sm font-semibold text-foreground mb-2">Beratungsnotizen</p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optionale Notizen zum Beratungsgespräch..."
          className="min-h-[80px]"
        />
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={() => handleFinish('abschluss')}
          disabled={saving}
          className="h-16 text-base font-bold gap-2 bg-primary hover:bg-primary/90"
        >
          <Sparkles className="w-5 h-5" />
          Jetzt abschließen
        </Button>
        <Button
          onClick={() => handleFinish('testphase')}
          disabled={saving}
          variant="outline"
          className="h-16 text-base font-semibold gap-2 border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
        >
          <Clock className="w-5 h-5" />
          14 Tage testen
        </Button>
        <Button
          onClick={() => handleFinish('angebot')}
          disabled={saving}
          variant="outline"
          className="h-16 text-base font-semibold gap-2"
        >
          <Save className="w-5 h-5" />
          Angebot speichern
        </Button>
      </div>

      <Button variant="ghost" onClick={onBack} className="h-12 gap-2 text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Zurück zur Empfehlung
      </Button>
    </div>
  );
}