import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Check, X, Search, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY = {
  name: '',
  region: '',
  approval_required: false,
  subsidy_per_course: '',
  subsidy_per_year: '',
  courses_per_year: '',
  participation_requirement: '',
  note: '',
  last_verified: '',
  status: 'bestätigt',
  is_active: true,
};

function InsuranceForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-card border border-primary/30 rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-black text-foreground uppercase mb-5">
        {initial?.id ? 'Krankenkasse bearbeiten' : 'Neue Krankenkasse'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="z. B. AOK Baden-Württemberg"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Region</label>
          <input value={form.region} onChange={e => set('region', e.target.value)}
            placeholder="z. B. Baden-Württemberg"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Zuletzt geprüft</label>
          <input type="date" value={form.last_verified} onChange={e => set('last_verified', e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Zuschuss / Kurs (€)</label>
          <input type="number" value={form.subsidy_per_course} onChange={e => set('subsidy_per_course', e.target.value)}
            placeholder="z. B. 80"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Max. Zuschuss / Jahr (€)</label>
          <input type="number" value={form.subsidy_per_year} onChange={e => set('subsidy_per_year', e.target.value)}
            placeholder="z. B. 160"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Kurse / Jahr</label>
          <input type="number" value={form.courses_per_year} onChange={e => set('courses_per_year', e.target.value)}
            placeholder="z. B. 2"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary">
            <option value="bestätigt">Bestätigt</option>
            <option value="prüfen">Prüfen</option>
            <option value="veraltet">Veraltet</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Teilnahmevoraussetzung</label>
          <input value={form.participation_requirement} onChange={e => set('participation_requirement', e.target.value)}
            placeholder="z. B. mind. 80% Teilnahme"
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary" />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Hinweise / Besonderheiten</label>
          <textarea value={form.note} onChange={e => set('note', e.target.value)}
            rows={2} placeholder="Besondere Bedingungen, Ausnahmen..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary resize-none" />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4 mb-6">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button type="button" onClick={() => set('approval_required', !form.approval_required)}
            className={`w-11 h-6 rounded-full transition-all relative ${form.approval_required ? 'bg-orange-500' : 'bg-muted'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.approval_required ? 'translate-x-5' : ''}`} />
          </button>
          <span className="text-sm font-semibold text-foreground">Rezept-Genehmigung erforderlich</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button type="button" onClick={() => set('is_active', !form.is_active)}
            className={`w-11 h-6 rounded-full transition-all relative ${form.is_active ? 'bg-primary' : 'bg-muted'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : ''}`} />
          </button>
          <span className="text-sm font-semibold text-foreground">Aktiv (in Auswahlliste sichtbar)</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 h-11 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-sm font-bold">
          Abbrechen
        </button>
        <button onClick={() => onSave(form)} disabled={saving || !form.name.trim()}
          className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Speichern</>}
        </button>
      </div>
    </motion.div>
  );
}

export default function InsuranceManager() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {id,...} = edit
  const [saving, setSaving] = useState(false);

  const { data: insurances = [] } = useQuery({
    queryKey: ['health-insurances'],
    queryFn: () => base44.entities.HealthInsurance.list('name', 200),
  });

  const filtered = insurances.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.region?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const data = {
        ...form,
        subsidy_per_course: form.subsidy_per_course !== '' ? Number(form.subsidy_per_course) : undefined,
        subsidy_per_year: form.subsidy_per_year !== '' ? Number(form.subsidy_per_year) : undefined,
        courses_per_year: form.courses_per_year !== '' ? Number(form.courses_per_year) : undefined,
      };
      if (form.id) {
        await base44.entities.HealthInsurance.update(form.id, data);
      } else {
        await base44.entities.HealthInsurance.create(data);
      }
      qc.invalidateQueries({ queryKey: ['health-insurances'] });
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (s) => s === 'bestätigt' ? 'text-primary' : s === 'prüfen' ? 'text-orange-400' : 'text-destructive';
  const statusBg = (s) => s === 'bestätigt' ? 'bg-primary/10' : s === 'prüfen' ? 'bg-orange-500/10' : 'bg-destructive/10';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-foreground uppercase">Krankenkassen-Datenbank</h1>
        <button
          onClick={() => setEditing({})}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-wide hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> Neue Krankenkasse
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Suchen nach Name oder Region..."
          className="w-full h-11 pl-11 pr-4 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Form (new or edit) */}
      <AnimatePresence>
        {editing !== null && (
          <InsuranceForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-bold text-muted-foreground">Name</th>
              <th className="text-left p-3 font-bold text-muted-foreground">Region</th>
              <th className="text-left p-3 font-bold text-muted-foreground">Genehmigung</th>
              <th className="text-left p-3 font-bold text-muted-foreground">Zuschuss/Kurs</th>
              <th className="text-left p-3 font-bold text-muted-foreground">Max/Jahr</th>
              <th className="text-left p-3 font-bold text-muted-foreground">Kurse/J.</th>
              <th className="text-left p-3 font-bold text-muted-foreground">Status</th>
              <th className="text-left p-3 font-bold text-muted-foreground">Aktiv</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(ins => (
              <tr key={ins.id} className="border-b border-border hover:bg-secondary/40 transition-all">
                <td className="p-3 font-semibold text-foreground">
                  <div>{ins.name}</div>
                  {ins.note && <div className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">{ins.note}</div>}
                </td>
                <td className="p-3 text-muted-foreground">{ins.region || '–'}</td>
                <td className="p-3">
                  {ins.approval_required
                    ? <span className="flex items-center gap-1 text-orange-400 text-xs font-bold"><ShieldAlert className="w-3.5 h-3.5" /> Ja</span>
                    : <span className="flex items-center gap-1 text-primary text-xs font-bold"><ShieldCheck className="w-3.5 h-3.5" /> Nein</span>
                  }
                </td>
                <td className="p-3 font-bold text-foreground">{ins.subsidy_per_course != null ? `${ins.subsidy_per_course} €` : '–'}</td>
                <td className="p-3 font-bold text-foreground">{ins.subsidy_per_year != null ? `${ins.subsidy_per_year} €` : '–'}</td>
                <td className="p-3 text-muted-foreground">{ins.courses_per_year ?? '–'}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusBg(ins.status)} ${statusColor(ins.status)}`}>
                    {ins.status}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${ins.is_active ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                </td>
                <td className="p-3">
                  <button onClick={() => setEditing(ins)}
                    className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Keine Krankenkassen gefunden.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}