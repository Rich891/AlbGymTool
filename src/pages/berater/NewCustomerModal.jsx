import React, { useState } from 'react';
import { X, Check, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const EMPTY = {
  customer_name: '',
  birthdate: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
  health_insurance: '',
  insurance_number: '',
  status: 'beratung_gestartet',
  subsidy_active: false,
};

export default function NewCustomerModal({ onClose, onCreated }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [insuranceOpen, setInsuranceOpen] = useState(false);
  const [insuranceSearch, setInsuranceSearch] = useState('');

  const { data: insuranceList = [] } = useQuery({
    queryKey: ['health-insurances'],
    queryFn: () => base44.entities.HealthInsurance.list('name', 200),
    select: d => d.filter(i => i.is_active !== false),
  });

  const filtered = insuranceList.filter(i =>
    i.name?.toLowerCase().includes(insuranceSearch.toLowerCase())
  );

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const canSave = form.customer_name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const record = await base44.entities.RehasportConsultation.create(form);
      qc.invalidateQueries({ queryKey: ['rehasport-consultations'] });
      onCreated(record);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all text-sm';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.93, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-foreground uppercase">Neuer Kunde</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Name *</label>
            <input value={form.customer_name} onChange={e => set('customer_name', e.target.value)}
              placeholder="Vor- und Nachname" className={inputCls} />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Geburtsdatum</label>
            <input type="date" value={form.birthdate} onChange={e => set('birthdate', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Geschlecht</label>
            <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputCls}>
              <option value="">– wählen –</option>
              <option value="männlich">Männlich</option>
              <option value="weiblich">Weiblich</option>
              <option value="divers">Divers</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">E-Mail</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="email@example.com" className={inputCls} />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Telefon</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+49 ..." className={inputCls} />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Adresse</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="Straße, PLZ Ort" className={inputCls} />
          </div>

          {/* Krankenkasse Dropdown */}
          <div className="md:col-span-2 relative">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Krankenkasse</label>
            <button type="button"
              onClick={() => { setInsuranceOpen(o => !o); setInsuranceSearch(''); }}
              className={`${inputCls} flex items-center justify-between`}>
              <span className={form.health_insurance ? 'text-foreground' : 'text-muted-foreground/40'}>
                {form.health_insurance || 'Krankenkasse auswählen...'}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${insuranceOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {insuranceOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute z-50 w-full mt-1 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input autoFocus value={insuranceSearch} onChange={e => setInsuranceSearch(e.target.value)}
                      placeholder="Suchen..." className="w-full h-9 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filtered.map(ins => (
                      <button key={ins.id} type="button"
                        onClick={() => { set('health_insurance', ins.name); setInsuranceOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-all flex items-center justify-between">
                        <span className="text-foreground font-medium">{ins.name}</span>
                        {ins.approval_required && <span className="text-xs text-orange-400 font-bold">Genehmigung nötig</span>}
                      </button>
                    ))}
                    {filtered.length === 0 && <p className="p-4 text-sm text-muted-foreground text-center">Keine Treffer</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Versicherungsnr.</label>
            <input value={form.insurance_number} onChange={e => set('insurance_number', e.target.value)}
              placeholder="A 123 456 789" className={inputCls} />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
              <option value="beratung_gestartet">Beratung gestartet</option>
              <option value="angebot_erstellt">Angebot erstellt</option>
              <option value="abgeschlossen">Abgeschlossen</option>
              <option value="abgebrochen">Abgebrochen</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-12 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all font-bold">
            Abbrechen
          </button>
          <button onClick={handleSave} disabled={saving || !canSave}
            className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Kunde anlegen</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}