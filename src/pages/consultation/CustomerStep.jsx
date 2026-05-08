import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Search, UserPlus, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function CustomerStep({ customer, setCustomer, onNext }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState('new'); // 'new' or 'search'

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-search', searchTerm],
    queryFn: () => searchTerm.length >= 2 
      ? base44.entities.Customer.filter({}, '-created_date', 50)
      : [],
    enabled: searchTerm.length >= 2,
  });

  const filteredCustomers = customers.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectCustomer = (c) => {
    setCustomer(c);
    setMode('new');
  };

  const updateField = (field, value) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = customer.first_name && customer.last_name;

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-3">
        <Button
          variant={mode === 'new' ? 'default' : 'outline'}
          onClick={() => setMode('new')}
          className="flex-1 h-14 text-base gap-2"
        >
          <UserPlus className="w-5 h-5" /> Neuer Kunde
        </Button>
        <Button
          variant={mode === 'search' ? 'default' : 'outline'}
          onClick={() => setMode('search')}
          className="flex-1 h-14 text-base gap-2"
        >
          <Search className="w-5 h-5" /> Kunde suchen
        </Button>
      </div>

      {mode === 'search' && (
        <Card className="p-5 bg-card border border-border">
          <Input
            placeholder="Name oder E-Mail eingeben..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 text-base mb-4"
          />
          {filteredCustomers.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{c.first_name} {c.last_name}</p>
                    <p className="text-sm text-muted-foreground">{c.email || c.phone || ''}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
          {searchTerm.length >= 2 && filteredCustomers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Kein Kunde gefunden</p>
          )}
        </Card>
      )}

      {/* Customer Form */}
      <Card className="p-6 bg-card border border-border">
        <h3 className="text-lg font-semibold mb-5 text-foreground">
          {customer.id ? 'Kundendaten bearbeiten' : 'Kundendaten erfassen'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label>Vorname *</Label>
            <Input value={customer.first_name || ''} onChange={(e) => updateField('first_name', e.target.value)} className="h-12" placeholder="Vorname" />
          </div>
          <div className="space-y-2">
            <Label>Nachname *</Label>
            <Input value={customer.last_name || ''} onChange={(e) => updateField('last_name', e.target.value)} className="h-12" placeholder="Nachname" />
          </div>
          <div className="space-y-2">
            <Label>Alter</Label>
            <Input type="number" value={customer.age || ''} onChange={(e) => updateField('age', parseInt(e.target.value) || '')} className="h-12" placeholder="Alter" />
          </div>
          <div className="space-y-2">
            <Label>Geschlecht</Label>
            <Select value={customer.gender || ''} onValueChange={(v) => updateField('gender', v)}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Auswählen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="männlich">Männlich</SelectItem>
                <SelectItem value="weiblich">Weiblich</SelectItem>
                <SelectItem value="divers">Divers</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input value={customer.phone || ''} onChange={(e) => updateField('phone', e.target.value)} className="h-12" placeholder="Telefonnummer" />
          </div>
          <div className="space-y-2">
            <Label>E-Mail</Label>
            <Input value={customer.email || ''} onChange={(e) => updateField('email', e.target.value)} className="h-12" placeholder="E-Mail" />
          </div>
        </div>

        {/* Privacy Consent */}
        <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Datenschutz-Einwilligung</p>
              <p className="text-xs text-muted-foreground mt-1">Einwilligung zur Verarbeitung von Gesundheits- und Beratungsdaten</p>
            </div>
            <Switch 
              checked={customer.privacy_consent || false}
              onCheckedChange={(v) => {
                updateField('privacy_consent', v);
                if (v) updateField('privacy_consent_date', new Date().toISOString());
              }}
            />
          </div>
        </div>
      </Card>

      <Button 
        onClick={onNext} 
        disabled={!canProceed}
        className="w-full h-14 text-lg font-semibold gap-2"
      >
        Weiter zur Anamnese <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
}