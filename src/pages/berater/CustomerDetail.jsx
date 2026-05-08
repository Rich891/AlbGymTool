import React, { useState } from 'react';
import { ArrowLeft, FileText, Phone, CreditCard, Heart, Package, Trash2, Activity, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TeilnahmebescheinigungDownload from './TeilnahmebescheinigungDownload';

const STATUS_STYLES = {
  abgeschlossen: 'bg-primary/10 text-primary',
  angebot_erstellt: 'bg-blue-500/10 text-blue-400',
  beratung_gestartet: 'bg-orange-500/10 text-orange-400',
  abgebrochen: 'bg-destructive/10 text-destructive',
};

const STATUS_LABELS = {
  abgeschlossen: 'Abgeschlossen',
  angebot_erstellt: 'Angebot erstellt',
  beratung_gestartet: 'Beratung gestartet',
  abgebrochen: 'Abgebrochen',
};

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground text-sm font-semibold text-right max-w-[60%]">{value || '–'}</span>
    </div>
  );
}

function HistoryTimeline({ consultations, currentId }) {
  const sorted = [...consultations].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  if (sorted.length <= 1) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-primary">Beratungshistorie ({sorted.length})</p>
      </div>
      <div className="space-y-3">
        {sorted.map((c) => (
          <div key={c.id} className={`flex gap-4 p-4 rounded-xl border transition-all ${c.id === currentId ? 'border-primary/30 bg-primary/5' : 'border-border bg-secondary/30'}`}>
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${c.id === currentId ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${STATUS_STYLES[c.status] || 'bg-secondary text-muted-foreground'}`}>
                  {STATUS_LABELS[c.status] || c.status}
                </span>
                {c.id === currentId && <span className="text-xs text-primary font-bold">← Aktuell</span>}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Calendar className="w-3 h-3" />
                {c.created_date ? new Date(c.created_date).toLocaleDateString('de-DE') : '–'}
              </div>
              <p className="text-xs text-muted-foreground">
                {c.selected_offers?.filter(o => o !== 'rehasport_plus').length > 0 && (
                  <span>Paket: Rehasport+ {c.selected_offers.filter(o => o !== 'rehasport_plus').map(o => `+ ${o.toUpperCase()}`).join(' ')} · </span>
                )}
                {c.subsidy_active && <span className="text-primary font-semibold">§20 aktiv · </span>}
                {c.health_insurance && <span>KK: {c.health_insurance}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomerDetail({ consultation, onBack }) {
  const [showBescheinigung, setShowBescheinigung] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const qc = useQueryClient();

  const { data: allConsultations = [] } = useQuery({
    queryKey: ['rehasport-consultations'],
    queryFn: () => base44.entities.RehasportConsultation.list('-created_date', 100),
  });

  const customerHistory = allConsultations.filter(
    c => c.customer_name?.toLowerCase() === consultation.customer_name?.toLowerCase()
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.entities.RehasportConsultation.delete(consultation.id);
      qc.invalidateQueries({ queryKey: ['rehasport-consultations'] });
      onBack();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
        </button>
        <button onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-all text-sm font-bold">
          <Trash2 className="w-4 h-4" /> Löschen
        </button>
      </div>

      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase">{consultation.customer_name}</h1>
          <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${STATUS_STYLES[consultation.status] || 'bg-secondary text-muted-foreground'}`}>
            {STATUS_LABELS[consultation.status] || consultation.status}
          </span>
        </div>
        {consultation.subsidy_active && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowBescheinigung(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-wide hover:bg-primary/90 transition-all shadow-lg">
            <FileText className="w-4 h-4" /> §20 Fertigmeldungen
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-4 h-4 text-primary" />
            <p className="text-xs font-black uppercase tracking-widest text-primary">Kontakt</p>
          </div>
          <InfoRow label="Geburtsdatum" value={consultation.birthdate} />
          <InfoRow label="Geschlecht" value={consultation.gender} />
          <InfoRow label="E-Mail" value={consultation.email} />
          <InfoRow label="Telefon" value={consultation.phone} />
          <InfoRow label="Adresse" value={consultation.address} />
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-primary" />
            <p className="text-xs font-black uppercase tracking-widest text-primary">Krankenkasse</p>
          </div>
          <InfoRow label="Krankenkasse" value={consultation.health_insurance} />
          <InfoRow label="Versicherungsnr." value={consultation.insurance_number} />
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-primary" />
            <p className="text-xs font-black uppercase tracking-widest text-primary">Bankverbindung</p>
          </div>
          <InfoRow label="Kontoinhaber" value={consultation.account_holder} />
          <InfoRow label="IBAN" value={consultation.iban} />
          <InfoRow label="BIC" value={consultation.bic} />
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-primary" />
            <p className="text-xs font-black uppercase tracking-widest text-primary">Paket & Zuschuss</p>
          </div>
          <InfoRow label="Pakete" value={consultation.selected_offers?.join(', ') || 'Rehasport+'} />
          <InfoRow label="Zuschuss aktiv" value={consultation.subsidy_active ? 'Ja' : 'Nein'} />
          <InfoRow label="Zuschuss-Variante" value={consultation.subsidy_variant} />
          <InfoRow label="Angemeldet am" value={consultation.created_date ? new Date(consultation.created_date).toLocaleDateString('de-DE') : '–'} />
        </div>

        {(consultation.reasons?.length > 0 || consultation.complaints?.length > 0) && (
          <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              <p className="text-xs font-black uppercase tracking-widest text-primary">Gesundheit & Ziele</p>
            </div>
            {consultation.reasons?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Gründe</p>
                <div className="flex flex-wrap gap-2">
                  {consultation.reasons.map(r => <span key={r} className="px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-semibold">{r}</span>)}
                </div>
              </div>
            )}
            {consultation.complaints?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Beschwerden</p>
                <div className="flex flex-wrap gap-2">
                  {consultation.complaints.map(c => <span key={c} className="px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-semibold">{c}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        <HistoryTimeline consultations={customerHistory} currentId={consultation.id} />
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full">
              <h3 className="text-xl font-black text-foreground uppercase mb-2">Eintrag löschen?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Der Eintrag von <strong className="text-foreground">{consultation.customer_name}</strong> wird dauerhaft gelöscht.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-11 rounded-2xl border border-border text-muted-foreground hover:bg-secondary transition-all font-bold text-sm">
                  Abbrechen
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 h-11 rounded-2xl bg-destructive text-destructive-foreground font-black uppercase text-sm hover:bg-destructive/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleting
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Trash2 className="w-4 h-4" /> Löschen</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showBescheinigung && (
        <TeilnahmebescheinigungDownload consultation={consultation} onClose={() => setShowBescheinigung(false)} />
      )}
    </div>
  );
}