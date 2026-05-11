import React, { useState } from 'react';
import { Search, User, ChevronRight, Plus, Calendar, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const STATUS_LABELS = {
  abgeschlossen: 'Abgeschlossen',
  angebot_erstellt: 'Angebot erstellt',
  beratung_gestartet: 'Beratung gestartet',
  abgebrochen: 'Abgebrochen',
};

const STATUS_COLORS = {
  abgeschlossen: 'text-primary bg-primary/10',
  angebot_erstellt: 'text-blue-400 bg-blue-500/10',
  beratung_gestartet: 'text-orange-400 bg-orange-500/10',
  abgebrochen: 'text-destructive bg-destructive/10',
};

export default function BestandProfileSelect({ onSelect, onBack }) {
  const [search, setSearch] = useState('');

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['rehasport-consultations'],
    queryFn: () => base44.entities.RehasportConsultation.list('-created_date', 200),
  });

  // Dedupliziere nach Name – nimm den neuesten Eintrag pro Person
  const uniqueCustomers = Object.values(
    consultations.reduce((acc, c) => {
      const key = c.customer_name?.toLowerCase().trim();
      if (key && (!acc[key] || new Date(c.created_date) > new Date(acc[key].created_date))) {
        acc[key] = c;
      }
      return acc;
    }, {})
  );

  const filtered = uniqueCustomers.filter(c => {
    const q = search.toLowerCase();
    return (
      c.customer_name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.birthdate?.includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          ← Zurück
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            PROFIL<br /><span className="text-primary">WÄHLEN</span>
          </h1>
          <p className="text-lg text-muted-foreground">Wähle das Profil des Kunden aus dem Kundenkatalog.</p>
        </div>

        {/* Suchfeld */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Name, Telefon oder Geburtsdatum..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary text-base"
            autoFocus
          />
        </div>

        {/* Kundenliste */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {filtered.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onSelect(c)}
                className="w-full p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-foreground text-lg">{c.customer_name}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {c.birthdate && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" /> {c.birthdate}
                          </span>
                        )}
                        {c.selected_offers?.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Package className="w-3 h-3" /> {c.selected_offers.join(', ')}
                          </span>
                        )}
                        {c.created_date && (
                          <span className="text-xs text-muted-foreground">
                            Zuletzt: {new Date(c.created_date).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.status && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${STATUS_COLORS[c.status] || 'bg-secondary text-muted-foreground'}`}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </motion.button>
            ))}

            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Kein Kunde gefunden.</p>
              </div>
            )}
          </div>
        )}

        {/* Neues Profil anlegen */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">Kunde noch nicht im System?</p>
          <button
            onClick={() => onSelect(null)}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-2xl border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all text-sm font-bold">
            <Plus className="w-4 h-4" /> Neues Profil anlegen
          </button>
        </div>
      </div>
    </div>
  );
}