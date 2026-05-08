import React, { useState } from 'react';
import { ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function RehaBeforeClosing({ profile, update, onNext, onBack }) {
  const [formData, setFormData] = useState({
    address: profile.address || '',
    email: profile.email || '',
    phone: profile.phone || '',
    health_insurance: profile.health_insurance || '',
    insurance_number: profile.insurance_number || '',
    account_holder: profile.account_holder || '',
    iban: profile.iban || '',
  });

  const [showConsent, setShowConsent] = useState(false);
  const [consents, setConsents] = useState({
    counseling: false,
    health: false,
    bank: false,
  });
  const [saving, setSaving] = useState(false);

  const requiredFields = ['address', 'email', 'phone', 'health_insurance', 'insurance_number', 'account_holder', 'iban'];
  const canProceed = requiredFields.every(field => formData[field]?.trim());
  const hasBankData = !!formData.iban;

  const handleProceed = () => {
    if (!canProceed) return;
    setShowConsent(true);
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
        reasons: profile.reasons || [],
        complaints: profile.complaints || [],
        wishes: profile.wishes || [],
        rules_accepted: profile.rulesAccepted || false,
        consent_counseling: consents.counseling,
        consent_health: consents.health,
        consent_bank: consents.bank,
        selected_offers: profile.selectedOffers || [],
        subsidy_active: profile.subsidyActive || false,
        status: 'angebot_erstellt',
      });

      update({
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        health_insurance: formData.health_insurance,
        insurance_number: formData.insurance_number,
        account_holder: formData.account_holder,
        iban: formData.iban,
      });

      setShowConsent(false);
      onNext();
    } catch (err) {
      console.error('Fehler:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10 bg-background">
      <div className="w-full max-w-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" /> Zurück
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            BEVOR ES WEITERGEHT
          </h1>
          <p className="text-lg text-muted-foreground">
            Für die Anmeldung und Vertragsabwicklung brauchen wir noch ein paar Angaben.
          </p>
        </div>

        {/* Profil Übersicht */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-3xl p-6 mb-8">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Deine Angaben</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <p className="font-bold text-foreground">{profile.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Geburtsdatum</p>
              <p className="font-bold text-foreground">{profile.birthdate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Geschlecht</p>
              <p className="font-bold text-foreground">{profile.gender}</p>
            </div>
            {profile.reasons?.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Rehabziele</p>
                <p className="font-bold text-foreground">{profile.reasons.join(', ')}</p>
              </div>
            )}
            {profile.complaints?.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Beschwerden</p>
                <p className="font-bold text-foreground">{profile.complaints.join(', ')}</p>
              </div>
            )}
            {profile.selectedOffers?.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Leistungen</p>
                <p className="font-bold text-foreground">Rehasport+ {profile.selectedOffers.map(o => o === 'five' ? '+ FIVE' : o === 'milon' ? '+ Milon' : '').join('')}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={e => e.preventDefault()} className="bg-card border border-border rounded-3xl p-8 mb-8 space-y-5">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Adresse *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="z. B. Musterstr. 1, 70178 Stuttgart"
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              E-Mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="deine.email@example.com"
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Telefon *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+49 ..."
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Krankenkasse *
            </label>
            <input
              type="text"
              value={formData.health_insurance}
              onChange={e => setFormData({ ...formData, health_insurance: e.target.value })}
              placeholder="z. B. AOK Bayern"
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Krankenkassennummer *
            </label>
            <input
              type="text"
              value={formData.insurance_number}
              onChange={e => setFormData({ ...formData, insurance_number: e.target.value })}
              placeholder="xxxxxxxxxxxxxx"
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Kontoinhaber *
            </label>
            <input
              type="text"
              value={formData.account_holder}
              onChange={e => setFormData({ ...formData, account_holder: e.target.value })}
              placeholder="Name"
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              IBAN *
            </label>
            <input
              type="text"
              value={formData.iban}
              onChange={e => setFormData({ ...formData, iban: e.target.value })}
              placeholder="DE..."
              className="w-full h-12 px-4 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </form>

        {/* Consent Modal */}
        <AnimatePresence>
          {showConsent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-card border border-border rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black text-foreground uppercase mb-6">Datenschutz & Einwilligung</h2>

                <div className="space-y-4 mb-8 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Wir speichern deine Angaben, um deine Rehasport-Beratung, mögliche Zusatzangebote, Zuschussinformationen und einen eventuellen Vertragsabschluss korrekt vorbereiten zu können.
                  </p>
                  <p>
                    Dabei können auch gesundheitsbezogene Angaben verarbeitet werden, z. B. Beschwerden, Trainingsziele oder Einschränkungen. Diese Daten werden ausschließlich für Beratung, Betreuung, Terminplanung, Zuschussprüfung und Vertragsabwicklung im AlbGym genutzt.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.counseling}
                      onChange={e => setConsents({ ...consents, counseling: e.target.checked })}
                      className="w-5 h-5 rounded mt-1 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">
                      Ich akzeptiere die Verarbeitung meiner Beratungs- und Kontaktdaten.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.health}
                      onChange={e => setConsents({ ...consents, health: e.target.checked })}
                      className="w-5 h-5 rounded mt-1 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">
                      Ich akzeptiere die Verarbeitung gesundheitsbezogener Angaben im Rahmen der Beratung.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents.bank}
                      onChange={e => setConsents({ ...consents, bank: e.target.checked })}
                      className="w-5 h-5 rounded mt-1 accent-primary cursor-pointer"
                    />
                    <span className="text-sm text-foreground">
                      Ich akzeptiere die Nutzung meiner Bankdaten für Vertrags-/SEPA-Abwicklung.
                    </span>
                  </label>
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
                    disabled={saving || !consents.counseling || !consents.health || !consents.bank}
                    className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Bestätigen →'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleProceed}
          disabled={!canProceed}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          Angaben bestätigen & fortfahren →
        </motion.button>
      </div>
    </div>
  );
}