import React, { useState } from 'react';
import { ArrowLeft, FileText, Phone, Mail, MapPin, CreditCard, Heart, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import TeilnahmebescheinigungDownload from './TeilnahmebescheinigungDownload';

export default function CustomerDetail({ consultation, onBack }) {
  const [showBescheinigung, setShowBescheinigung] = React.useState(false);

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground text-sm font-semibold text-right max-w-[60%]">{value || '–'}</span>
    </div>
  );

  const statusColor = consultation.status === 'abgeschlossen'
    ? 'bg-primary/10 text-primary'
    : consultation.status === 'angebot_erstellt'
    ? 'bg-blue-500/10 text-blue-400'
    : 'bg-orange-500/10 text-orange-400';

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase">{consultation.customer_name}</h1>
          <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColor}`}>
            {consultation.status}
          </span>
        </div>

        {/* §20 PDF Button – immer wenn subsidy_active */}
        {consultation.subsidy_active && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowBescheinigung(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-wide hover:bg-primary/90 transition-all shadow-lg">
            <FileText className="w-4 h-4" />
            §20 Fertigmeldungen
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Kontaktdaten */}
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

        {/* Krankenkasse */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-primary" />
            <p className="text-xs font-black uppercase tracking-widest text-primary">Krankenkasse</p>
          </div>
          <InfoRow label="Krankenkasse" value={consultation.health_insurance} />
          <InfoRow label="Versicherungsnr." value={consultation.insurance_number} />
        </div>

        {/* Bankdaten */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-primary" />
            <p className="text-xs font-black uppercase tracking-widest text-primary">Bankverbindung</p>
          </div>
          <InfoRow label="Kontoinhaber" value={consultation.account_holder} />
          <InfoRow label="IBAN" value={consultation.iban} />
          <InfoRow label="BIC" value={consultation.bic} />
        </div>

        {/* Paket & Zuschuss */}
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

        {/* Gesundheit */}
        {(consultation.reasons?.length > 0 || consultation.complaints?.length > 0) && (
          <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-primary" />
              <p className="text-xs font-black uppercase tracking-widest text-primary">Gesundheit & Ziele</p>
            </div>
            {consultation.reasons?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Gründe</p>
                <div className="flex flex-wrap gap-2">
                  {consultation.reasons.map(r => (
                    <span key={r} className="px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-semibold">{r}</span>
                  ))}
                </div>
              </div>
            )}
            {consultation.complaints?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Beschwerden</p>
                <div className="flex flex-wrap gap-2">
                  {consultation.complaints.map(c => (
                    <span key={c} className="px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-semibold">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showBescheinigung && (
        <TeilnahmebescheinigungDownload
          consultation={consultation}
          onClose={() => setShowBescheinigung(false)}
        />
      )}
    </div>
  );
}