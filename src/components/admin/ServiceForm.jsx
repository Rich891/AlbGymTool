import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { CATEGORIES, GOALS } from '@/lib/goalConfig';

export default function ServiceForm({ service, onSave, onCancel, isSaving }) {
  const [data, setData] = useState(service || {
    name: '', category: '', goal_areas: [], short_description: '',
    benefit_argument: '', ideal_for: '', less_suitable_for: '',
    contraindications: '', price_monthly: 0, price_once: 0,
    included_in_tariff: false, is_addon: false, upsell_priority: 5,
    combination_rules: '', experience_required: 'keine',
    time_efficient: false, needs_coaching: false, is_active: true,
  });

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const toggleGoalArea = (goal) => {
    const current = data.goal_areas || [];
    update('goal_areas', current.includes(goal) ? current.filter(g => g !== goal) : [...current, goal]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {service?.id ? 'Leistung bearbeiten' : 'Neue Leistung'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border border-border space-y-4">
          <h3 className="font-semibold text-foreground">Grunddaten</h3>
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={data.name} onChange={(e) => update('name', e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Kategorie *</Label>
            <Select value={data.category} onValueChange={(v) => update('category', v)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Kategorie wählen" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Kurzbeschreibung</Label>
            <Textarea value={data.short_description || ''} onChange={(e) => update('short_description', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nutzenargument</Label>
            <Textarea value={data.benefit_argument || ''} onChange={(e) => update('benefit_argument', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Ideal für</Label>
            <Input value={data.ideal_for || ''} onChange={(e) => update('ideal_for', e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Weniger geeignet für</Label>
            <Input value={data.less_suitable_for || ''} onChange={(e) => update('less_suitable_for', e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>Kontraindikationen</Label>
            <Input value={data.contraindications || ''} onChange={(e) => update('contraindications', e.target.value)} className="h-11" />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-card border border-border space-y-4">
            <h3 className="font-semibold text-foreground">Zielbereiche</h3>
            <div className="flex flex-wrap gap-2">
              {GOALS.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoalArea(goal.label)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border
                    ${(data.goal_areas || []).includes(goal.label) 
                      ? `${goal.bg} ${goal.color} ${goal.border}` 
                      : 'border-border text-muted-foreground hover:bg-secondary'
                    }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card border border-border space-y-4">
            <h3 className="font-semibold text-foreground">Preise & Einstellungen</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monatl. Preis (€)</Label>
                <Input type="number" value={data.price_monthly || ''} onChange={(e) => update('price_monthly', parseFloat(e.target.value) || 0)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>Einmalpreis (€)</Label>
                <Input type="number" value={data.price_once || ''} onChange={(e) => update('price_once', parseFloat(e.target.value) || 0)} className="h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mindest-Erfahrung</Label>
              <Select value={data.experience_required || 'keine'} onValueChange={(v) => update('experience_required', v)}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="keine">Keine</SelectItem>
                  <SelectItem value="wenig">Wenig</SelectItem>
                  <SelectItem value="mittel">Mittel</SelectItem>
                  <SelectItem value="viel">Viel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Upsell-Priorität (1-10)</Label>
              <Input type="number" min={1} max={10} value={data.upsell_priority || 5} onChange={(e) => update('upsell_priority', parseInt(e.target.value) || 5)} className="h-11" />
            </div>
            <div className="space-y-3 pt-2">
              {[
                ['is_addon', 'Zusatzleistung (Addon)'],
                ['included_in_tariff', 'Im Tarif enthalten'],
                ['time_efficient', 'Zeiteffizient'],
                ['needs_coaching', 'Erfordert Betreuung'],
                ['is_active', 'Aktiv'],
              ].map(([field, label]) => (
                <div key={field} className="flex items-center justify-between">
                  <Label>{label}</Label>
                  <Switch checked={data[field] || false} onCheckedChange={(v) => update(field, v)} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Button onClick={() => onSave(data)} disabled={isSaving || !data.name || !data.category} className="h-12 px-8 gap-2">
        <Save className="w-4 h-4" /> {service?.id ? 'Speichern' : 'Erstellen'}
      </Button>
    </div>
  );
}