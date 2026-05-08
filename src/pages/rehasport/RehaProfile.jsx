import React, { useState } from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const TEST_PROFILE = {
  address: 'Musterstraße 12, 72525 Münsingen',
  email: 'max.mustermann@example.com',
  phone: '+49 7381 123456',
  health_insurance: 'AOK Baden-Württemberg',
  insurance_number: 'A123456789',
  account_holder: 'Max Mustermann',
  iban: 'DE89370400440532013000',
  bic: 'COBADEFFXXX',
};

export default function RehaProfile({ profile, onConfirm, onChange, testMode }) {
  const [expanded, setExpanded] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [consents, setConsents] = useState({
    counseling: false,
    health: false,
    bank: false,
  });
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    address: profile.address || '',
    email: profile.email || '',
    phone: profile.phone || '',
    health_insurance: profile.health_insurance || '',
    insurance_number: profile.insurance_number || '',
    account_holder: profile.account_holder || '',
    iban: profile.iban || '',
    bic: profile.bic || '',
  });

  const hasExtendedData = formData.address || formData.email || formData.phone;

  const fillTestData = () => {
    setFormData({ ...formData, ...TEST_PROFILE });
    setExpanded(true);
  };
  const hasBankData = formData.iban;
  const canProceedWithMore = expanded && hasExtendedData;

  const handleConfirm = () => {
    if (canProceedWithMore) {
      setShowConsent(true);
      return;
    }
    onConfirm();
  };

  const handleConsentConfirm = async () => {
    if (!consents.counseling || !consents.health || (hasBankData && !consents.bank)) {
      return;
    }

    setSaving(true);
    try {
      await base44.entities.RehasportConsultation.create({
        customer_name: profile.name,
        birthdate: profile.birthdate,
        gender: profile.gender,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        health_insurance: formData.health_insurance,
        insurance_number: formData.insurance_number,
        account_holder: formData.account_holder,
        iban: formData.iban,
        bic: formData.bic,
        reasons: profile.reasons || [],
        complaints: profile.complaints || [],
        wishes: profile.wishes || [],
        rules_accepted: profile.rulesAccepted || false,
        consent_counseling: consents.counseling,
        consent_health: consents.health,
        consent_bank: consents.bank,
        status: 'beratung_gestartet',
      });

      setShowConsent(false);
      onConfirm();
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-xl">
        {testMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between bg-orange-500/10 border border-orange-500/30 rounded-2xl px-5 py-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-orange-400" />
              <p className="text-sm font-bold text-orange-400">Test-Modus aktiv</p>
            </div>
            <button
              onClick={fillTestData}
              className="px-4 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-xs font-black text-orange-300 hover:bg-orange-500/30 transition-all uppercase tracking-widest">
              Felder befüllen
            </button>
          </motion.div>
        )}

        <button
          onClick={onChange}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Ändern
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-2">
            DEIN PROFIL
          </h1>
          <p className="text-lg text-muted-foreground">Kurze Übersicht deiner Angaben</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl p-8 mb-6 space-y-6">
          {/* Basic Info */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Name</p>
            <p className="text-2xl font-black text-foreground">{profile.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Geburtsdatum</p>
              <p className="text-lg font-bold text-foreground">{profile.birthdate || '–'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Geschlecht</p>
              <p className="text-lg font-bold text-foreground">{profile.gender || '–'}</p>
            </div>
          </div>

          {/* Expandable More Section */}
          <motion.button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full py-4 px-4 rounded-2xl border border-border bg-secondary/50 hover:bg-secondary transition-all flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Mehr Angaben hinzufügen</span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-primary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </motion.button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 border-t border-border pt-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Adresse</p>
                  <input
                     type="text"
                     value={formData.address}
                     onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="z. B. Musterstr. 1, 70178 Stuttgart"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">E-Mail</p>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="deine.email@example.com"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Telefon</p>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+49 ..."
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Krankenkasse</p>
                  <input
                    type="text"
                    value={formData.health_insurance}
                    onChange={e => setFormData({ ...formData, health_insurance: e.target.value })}
                    placeholder="z. B. AOK Bayern"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Krankenkassennummer</p>
                  <input
                    type="text"
                    value={formData.insurance_number}
                    onChange={e => setFormData({ ...formData, insurance_number: e.target.value })}
                    placeholder="xxxxxxxxxxxxxx"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Kontoinhaber</p>
                  <input
                    type="text"
                    value={formData.account_holder}
                    onChange={e => setFormData({ ...formData, account_holder: e.target.value })}
                    placeholder="Name"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">IBAN</p>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={e => setFormData({ ...formData, iban: e.target.value })}
                    placeholder="DE..."
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">BIC (optional)</p>
                  <input
                    type="text"
                    value={formData.bic}
                    onChange={e => setFormData({ ...formData, bic: e.target.value })}
                    placeholder="XXXXYY"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Consent Modal */}
        <AnimatePresence>
          {showConsent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-border rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black text-foreground uppercase mb-4">Datenschutz & Einwilligung</h2>

                <div className="space-y-4 mb-8 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Wir speichern deine Angaben, um deine Rehasport-Beratung, mögliche Zusatzangebote, Zuschussinformationen und einen eventuellen Vertragsabschluss korrekt vorbereiten zu können.
                  </p>
                  <p>
                    Dabei können auch gesundheitsbezogene Angaben verarbeitet werden, z. B. Beschwerden, Trainingsziele oder Einschränkungen. Diese Daten werden ausschließlich für Beratung, Betreuung, Terminplanung, Zuschussprüfung und Vertragsabwicklung im AlbGym genutzt.
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    { key: 'counseling', label: 'Ich akzeptiere die Verarbeitung meiner Beratungs- und Kontaktdaten.' },
                    { key: 'health', label: 'Ich akzeptiere die Verarbeitung gesundheitsbezogener Angaben im Rahmen der Beratung.' },
                    ...(hasBankData ? [{ key: 'bank', label: 'Ich akzeptiere die Nutzung meiner Bankdaten für Vertrags-/SEPA-Abwicklung.' }] : []),
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      onClick={() => setConsents(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        consents[key] ? 'border-primary bg-primary/10' : 'border-border bg-secondary/40 hover:border-primary/40'
                      }`}>
                      <div className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        consents[key] ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                      }`}>
                        {consents[key] && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      <span className="text-sm text-foreground leading-relaxed">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConsent(false)}
                    className="flex-1 h-12 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                    Abbrechen
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleConsentConfirm}
                    disabled={saving || !consents.counseling || !consents.health || (hasBankData && !consents.bank)}
                    className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? 'Wird gespeichert...' : 'Bestätigen & fortfahren →'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all">
          {expanded ? 'Angaben speichern & weiter' : 'Profil bestätigen →'}
        </motion.button>
      </div>
    </div>
  );
}