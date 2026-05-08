import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Package, ArrowLeft, Save, Check } from 'lucide-react';
import { GOALS } from '@/lib/goalConfig';

export default function TariffList() {
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: tariffs = [] } = useQuery({
    queryKey: ['tariffs'],
    queryFn: () => base44.entities.Tariff.list('sort_order', 50),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => data.id 
      ? base44.entities.Tariff.update(data.id, data)
      : base44.entities.Tariff.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      setEditing(null);
    },
  });

  if (editing) {
    return <TariffForm tariff={editing} onSave={(d) => saveMutation.mutate(d)} onCancel={() => setEditing(null)} isSaving={saveMutation.isPending} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Tarife</h1>
        <Button onClick={() => setEditing({})} className="gap-2"><Plus className="w-4 h-4" /> Neuer Tarif</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tariffs.map(t => (
          <Card key={t.id} className="p-6 bg-card border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditing(t)}>
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
            <h3 className="text-xl font-bold text-foreground">{t.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">{t.description || t.ideal_for}</p>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-black text-primary">{t.monthly_price}€</span>
              <span className="text-muted-foreground">/Monat</span>
            </div>
            {t.included_service_names?.length > 0 && (
              <div className="space-y-1 pt-3 border-t border-border">
                {t.included_service_names.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary" /> {name}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function TariffForm({ tariff, onSave, onCancel, isSaving }) {
  const [data, setData] = useState(tariff || {
    name: '', description: '', monthly_price: 0, start_fee: 0,
    duration_months: 12, included_service_names: [], goal_areas: [],
    ideal_for: '', is_active: true, sort_order: 0,
  });
  const [newService, setNewService] = useState('');

  const update = (f, v) => setData(prev => ({ ...prev, [f]: v }));

  const addServiceName = () => {
    if (newService.trim()) {
      update('included_service_names', [...(data.included_service_names || []), newService.trim()]);
      setNewService('');
    }
  };

  const toggleGoal = (label) => {
    const current = data.goal_areas || [];
    update('goal_areas', current.includes(label) ? current.filter(g => g !== label) : [...current, label]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel} className="gap-2"><ArrowLeft className="w-4 h-4" /> Zurück</Button>
        <h1 className="text-2xl font-bold text-foreground">{tariff?.id ? 'Tarif bearbeiten' : 'Neuer Tarif'}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border border-border space-y-4">
          <div className="space-y-2"><Label>Name *</Label><Input value={data.name} onChange={(e) => update('name', e.target.value)} className="h-11" /></div>
          <div className="space-y-2"><Label>Beschreibung</Label><Textarea value={data.description || ''} onChange={(e) => update('description', e.target.value)} /></div>
          <div className="space-y-2"><Label>Ideal für</Label><Input value={data.ideal_for || ''} onChange={(e) => update('ideal_for', e.target.value)} className="h-11" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Monatl. Preis (€)</Label><Input type="number" value={data.monthly_price || ''} onChange={(e) => update('monthly_price', parseFloat(e.target.value) || 0)} className="h-11" /></div>
            <div className="space-y-2"><Label>Startgebühr (€)</Label><Input type="number" value={data.start_fee || ''} onChange={(e) => update('start_fee', parseFloat(e.target.value) || 0)} className="h-11" /></div>
            <div className="space-y-2"><Label>Laufzeit (Monate)</Label><Input type="number" value={data.duration_months || ''} onChange={(e) => update('duration_months', parseInt(e.target.value) || 12)} className="h-11" /></div>
          </div>
        </Card>
        <Card className="p-6 bg-card border border-border space-y-4">
          <div>
            <Label className="mb-2 block">Zielbereiche</Label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map(g => (
                <button key={g.id} onClick={() => toggleGoal(g.label)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors
                    ${(data.goal_areas || []).includes(g.label) ? `${g.bg} ${g.color} ${g.border}` : 'border-border text-muted-foreground hover:bg-secondary'}`}
                >{g.label}</button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Enthaltene Leistungen</Label>
            <div className="flex gap-2 mb-2">
              <Input value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="Leistungsname" className="h-10" onKeyDown={(e) => e.key === 'Enter' && addServiceName()} />
              <Button variant="outline" onClick={addServiceName} size="sm">Hinzufügen</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.included_service_names || []).map((name, i) => (
                <Badge key={i} variant="outline" className="gap-1 cursor-pointer" onClick={() => update('included_service_names', data.included_service_names.filter((_, idx) => idx !== i))}>
                  {name} ×
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <Button onClick={() => onSave(data)} disabled={isSaving || !data.name} className="h-12 px-8 gap-2">
        <Save className="w-4 h-4" /> {tariff?.id ? 'Speichern' : 'Erstellen'}
      </Button>
    </div>
  );
}