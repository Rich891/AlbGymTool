import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CustomerStep({ customer, setCustomer, onNext }) {
  const [mode, setMode] = useState('new'); // 'new' | 'search'
  const [searchQ, setSearchQ] = useState('');

  const { data: allCustomers = [] } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => base44.entities.Customer.list('-created_date', 200),
    enabled: mode === 'search',
  });

  const filtered = allCustomers.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email || ''}`.toLowerCase().includes(searchQ.toLowerCase())
  );

  const canProceed = customer.first_name && customer.last_name;

  return (
    <div className="min-h-screen flex flex-col px-4 md:px-6 pb-8 pt-6">
      <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-6">
        Wen beraten wir heute?
      </h2>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'new', label: 'Neuer Kunde' },
          { id: 'search', label: 'Bestandskunde' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${mode === m.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'search' ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Name oder E-Mail suchen ..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              autoFocus
            />
          </div>
          {searchQ && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Kunden gefunden</p>
              ) : (
                filtered.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCustomer(c); setMode('new'); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{c.first_name} {c.last_name}</p>
                      {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vorname *</label>
              <input
                type="text"
                value={customer.first_name || ''}
                onChange={e => setCustomer(p => ({ ...p, first_name: e.target.value }))}
                placeholder="Max"
                className="w-full h-14 px-4 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nachname *</label>
              <input
                type="text"
                value={customer.last_name || ''}
                onChange={e => setCustomer(p => ({ ...p, last_name: e.target.value }))}
                placeholder="Mustermann"
                className="w-full h-14 px-4 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-lg font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Alter</label>
              <input
                type="number"
                value={customer.age || ''}
                onChange={e => setCustomer(p => ({ ...p, age: parseInt(e.target.value) || '' }))}
                placeholder="35"
                className="w-full h-14 px-4 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Geschlecht</label>
              <div className="flex gap-2 h-14">
                {['männlich', 'weiblich', 'divers'].map(g => (
                  <button
                    key={g}
                    onClick={() => setCustomer(p => ({ ...p, gender: g }))}
                    className={`flex-1 rounded-2xl border text-xs font-semibold transition-all capitalize ${customer.gender === g ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:bg-secondary'}`}
                  >
                    {g === 'männlich' ? 'M' : g === 'weiblich' ? 'W' : 'D'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefon / E-Mail (optional)</label>
            <input
              type="text"
              value={customer.phone || ''}
              onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
              placeholder="07321 / 123456"
              className="w-full h-12 px-4 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Privacy */}
          <label className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors">
            <div
              onClick={() => setCustomer(p => ({ ...p, privacy_consent: !p.privacy_consent, privacy_consent_date: new Date().toISOString() }))}
              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${customer.privacy_consent ? 'border-primary bg-primary' : 'border-border'}`}
            >
              {customer.privacy_consent && (
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-xs text-muted-foreground leading-relaxed">
              Der Kunde stimmt der Erhebung und Verarbeitung seiner Daten für die Beratung zu (DSGVO-konform).
            </span>
          </label>
        </motion.div>
      )}

      {/* Next */}
      <div className="mt-auto pt-6">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          Weiter zur Befragung <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}