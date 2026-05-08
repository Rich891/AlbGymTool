import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, ArrowLeft, Save, Target } from 'lucide-react';

export default function RulesAdmin() {
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: rules = [] } = useQuery({
    queryKey: ['rules'],
    queryFn: () => base44.entities.RecommendationRule.list('-priority', 100),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => data.id
      ? base44.entities.RecommendationRule.update(data.id, data)
      : base44.entities.RecommendationRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      setEditing(null);
    },
  });

  if (editing) {
    return <RuleForm rule={editing} onSave={(d) => saveMutation.mutate(d)} onCancel={() => setEditing(null)} isSaving={saveMutation.isPending} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Empfehlungsregeln</h1>
        <Button onClick={() => setEditing({})} className="gap-2"><Plus className="w-4 h-4" /> Neue Regel</Button>
      </div>
      {rules.length === 0 ? (
        <div className="text-center py-20">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Noch keine Regeln angelegt</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <Card key={rule.id} className="p-5 bg-card border border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{rule.name}</h3>
                  {!rule.is_active && <Badge variant="outline" className="text-xs text-muted-foreground">Inaktiv</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                <div className="flex gap-2 mt-2">
                  {rule.condition_goal && <Badge variant="outline" className="text-xs">Ziel: {rule.condition_goal}</Badge>}
                  {rule.condition_experience && <Badge variant="outline" className="text-xs">Erfahrung: {rule.condition_experience}</Badge>}
                  <Badge variant="outline" className="text-xs text-primary">Boost: +{rule.boost_amount || 0}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditing(rule)}>
                <Pencil className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RuleForm({ rule, onSave, onCancel, isSaving }) {
  const [data, setData] = useState(rule || {
    name: '', description: '', condition_goal: '', condition_experience: '',
    condition_extra: '', boost_services: [], boost_amount: 10, is_active: true, priority: 5,
  });
  const [newService, setNewService] = useState('');

  const update = (f, v) => setData(prev => ({ ...prev, [f]: v }));

  const addService = () => {
    if (newService.trim()) {
      update('boost_services', [...(data.boost_services || []), newService.trim()]);
      setNewService('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel} className="gap-2"><ArrowLeft className="w-4 h-4" /> Zurück</Button>
        <h1 className="text-2xl font-bold text-foreground">{rule?.id ? 'Regel bearbeiten' : 'Neue Regel'}</h1>
      </div>
      <Card className="p-6 bg-card border border-border space-y-4 max-w-2xl">
        <div className="space-y-2"><Label>Regelname *</Label><Input value={data.name} onChange={(e) => update('name', e.target.value)} className="h-11" /></div>
        <div className="space-y-2"><Label>Beschreibung</Label><Textarea value={data.description || ''} onChange={(e) => update('description', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Wenn Ziel = ...</Label><Input value={data.condition_goal || ''} onChange={(e) => update('condition_goal', e.target.value)} className="h-11" placeholder="z.B. Abnehmen" /></div>
          <div className="space-y-2"><Label>Wenn Erfahrung = ...</Label><Input value={data.condition_experience || ''} onChange={(e) => update('condition_experience', e.target.value)} className="h-11" placeholder="z.B. keine" /></div>
        </div>
        <div className="space-y-2"><Label>Zusätzliche Bedingung</Label><Input value={data.condition_extra || ''} onChange={(e) => update('condition_extra', e.target.value)} className="h-11" /></div>
        <div className="space-y-2">
          <Label>Leistungen boosten</Label>
          <div className="flex gap-2">
            <Input value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="Leistungsname" className="h-10" onKeyDown={(e) => e.key === 'Enter' && addService()} />
            <Button variant="outline" onClick={addService} size="sm">+</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data.boost_services || []).map((s, i) => (
              <Badge key={i} variant="outline" className="gap-1 cursor-pointer" onClick={() => update('boost_services', data.boost_services.filter((_, idx) => idx !== i))}>
                {s} ×
              </Badge>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Score-Boost (0-30)</Label><Input type="number" min={0} max={30} value={data.boost_amount || 10} onChange={(e) => update('boost_amount', parseInt(e.target.value) || 0)} className="h-11" /></div>
          <div className="space-y-2"><Label>Priorität (1-10)</Label><Input type="number" min={1} max={10} value={data.priority || 5} onChange={(e) => update('priority', parseInt(e.target.value) || 5)} className="h-11" /></div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Label>Aktiv</Label>
          <Switch checked={data.is_active !== false} onCheckedChange={(v) => update('is_active', v)} />
        </div>
      </Card>
      <Button onClick={() => onSave(data)} disabled={isSaving || !data.name} className="h-12 px-8 gap-2">
        <Save className="w-4 h-4" /> {rule?.id ? 'Speichern' : 'Erstellen'}
      </Button>
    </div>
  );
}