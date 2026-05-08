import React, { useState } from 'react';
import { ChevronLeft, AlertCircle, Loader2, FlaskConical, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

// --- IBAN Validation (Mod97, no external lib needed) ---
function validateIban(iban) {
  const raw = iban.replace(/\s/g, '').toUpperCase();
  if (raw.length < 5) return false;
  // Move first 4 chars to end, replace letters with numbers
  const rearranged = raw.slice(4) + raw.slice(0, 4);
  const numeric = rearranged.split('').map(c => {
    const code = c.charCodeAt(0);
    return code >= 65 && code <= 90 ? String(code - 55) : c;
  }).join('');
  // Mod97 on large number via string
  let remainder = 0;
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder * 10 + parseInt(numeric[i])) % 97;
  }
  return remainder === 1;
}

// --- Insurance number: 1 letter + 9 digits ---
function formatInsuranceNumber(val) {
  // Keep only allowed chars: first char letter, rest digits
  const clean = val.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length === 0) return '';
  const letter = clean[0].replace(/[^a-zA-Z]/g, '');
  const digits = clean.slice(1).replace(/[^0-9]/g, '').slice(0, 9);
  let result = letter.toUpperCase();
  if (digits.length > 0) result += ' ' + digits.slice(0, 3);
  if (digits.length > 3) result += ' ' + digits.slice(3, 6);
  if (digits.length > 6) result += ' ' + digits.slice(6, 9);
  return result;
}

function validateInsuranceNumber(val) {
  const clean = val.replace(/\s/g, '');
  return /^[A-Z][0-9]{9}$/.test(clean);
}

// --- Dummy test data ---
const TEST_DATA = {
  address: 'Musterstraße 12, 72525 Münsingen',
  email: 'max.mustermann@example.com',
  phone: '+49 7381 123456',
  health_insurance: 'AOK Baden-Württemberg',
  insurance_number: 'A 123 456 789',
  account_holder: 'Max Mustermann',
  iban: 'DE89 3704 0044 0532 0130 00',
};

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
      <p className="text-xs text-destructive">{msg}</p>
    </div>
  );
}

function FieldSuccess({ show, msg }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
      <p className="text-xs text-primary">{msg}</p>
    </div>
  );
}

export default function RehaBeforeClosing({ profile, update, onNext, onBack, testMode }) {
  const [insuranceOpen, setInsuranceOpen] = useState(false);
  const [insuranceSearch, setInsuranceSearch] = useState('');

  const { data: insuranceList = [] } = useQuery({
    queryKey: ['health-insurances'],
    queryFn: () => base44.entities.HealthInsurance.list('name', 200),
    select: data => data.filter(i => i.is_active !== false),
  });

  const filteredInsurances = insuranceList.filter(i =>
    i.name?.toLowerCase().includes(insuranceSearch.toLowerCase())
  );

  const [formData, setFormData] = useState({
    address: profile.address || '',
    email: profile.email || '',
    phone: profile.phone || '',
    health_insurance: profile.health_insurance || '',
    insurance_number: profile.insurance_number || '',
    account_holder: profile.account_holder || '',
    iban: profile.iban || '',
  });

  const [touched, setTouched] = useState({});
  const [showConsent, setShowConsent] = useState(false);
  const [consents, setConsents] = useState({ counseling: false, health: false, bank: false });
  const [saving, setSaving] = useState(false);

  const set = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const blur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const fillTestData = () => {
    setFormData(TEST_DATA);
    setTouched({ address: true, email: true, phone: true, health_insurance: true, insurance_number: true, account_holder: true, iban: true });
  };

  // Validation
  const ibanClean = formData.iban.replace(/\s/g, '');
  const ibanValid = ibanClean.length >= 15 && validateIban(formData.iban);
  const ibanTouched = touched.iban;
  const ibanError = ibanTouched && formData.iban.length > 0 && !ibanValid ? 'Ungültige IBAN – bitte prüfen' : null;

  const insValid = validateInsuranceNumber(formData.insurance_number);
  const insError = touched.insurance_number && formData.insurance_number.length > 0 && !insValid
    ? 'Format: Buchstabe + 9 Ziffern (z. B. A 123 456 789)' : null;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const emailError = touched.email && formData.email.length > 0 && !emailValid ? 'Ungültige E-Mail-Adresse' : null;

  const requiredFilled = ['address', 'email', 'phone', 'health_insurance', 'insurance_number', 'account_holder', 'iban']
    .every(f => formData[f]?.trim());
  const canProceed = requiredFilled && ibanValid && insValid && emailValid;
  const hasBankData = !!formData.iban;

  const handleProceed = () => {
    // Touch all fields to show errors
    setTouched({ address: true, email: true, phone: true, health_insurance: true, insurance_number: true, account_holder: true, iban: true });
    if (!canProceed) return;
    setShowConsent(true);
  };

  const handleConsentConfirm = async () => {
    if (!consents.counseling || !consents.health || (hasBankData && !consents.bank)) return;
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
      update({ ...formData });
      setShowConsent(false);
      onNext();
    } catch (err) {
      console.error('Fehler:', err);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field, extraValid) => {
    const isError = touched[field] && (extraValid === false || (extraValid === undefined && !formData[field]?.trim()));
    const isOk = touched[field] && formData[field]?.trim() && extraValid !== false;
    return `w-full h-12 px-4 rounded-2xl border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-all ${
      isError ? 'border-destructive focus:border-destructive' :
      isOk ? 'border-primary/60 focus:border-primary' :
      'border-border focus:border-primary'
    }`;
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
            {profile.selectedOffers?.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Leistungen</p>
                <p className="font-bold text-foreground">
                  Rehasport+ {profile.selectedOffers.map(o => o === 'five' ? '+ FIVE' : o === 'milon' ? '+ Milon' : '').join('')}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Test-Mode Banner */}
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

        {/* Form */}
        <form onSubmit={e => e.preventDefault()} className="bg-card border border-border rounded-3xl p-8 mb-8 space-y-5">

          {/* Adresse */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Adresse *</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => set('address', e.target.value)}
              onBlur={() => blur('address')}
              placeholder="z. B. Musterstr. 1, 70178 Stuttgart"
              className={inputCls('address')}
            />
            <FieldError msg={touched.address && !formData.address?.trim() ? 'Bitte Adresse eingeben' : null} />
          </div>

          {/* E-Mail */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">E-Mail *</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => set('email', e.target.value)}
              onBlur={() => blur('email')}
              placeholder="deine.email@example.com"
              className={inputCls('email', formData.email ? emailValid : undefined)}
            />
            <FieldError msg={emailError} />
          </div>

          {/* Telefon */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Telefon *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => set('phone', e.target.value)}
              onBlur={() => blur('phone')}
              placeholder="+49 ..."
              className={inputCls('phone')}
            />
            <FieldError msg={touched.phone && !formData.phone?.trim() ? 'Bitte Telefonnummer eingeben' : null} />
          </div>

          {/* Krankenkasse – Dropdown aus DB */}
          <div className="relative">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Krankenkasse *</label>
            <button
              type="button"
              onClick={() => { setInsuranceOpen(o => !o); setInsuranceSearch(''); }}
              onBlur={() => { blur('health_insurance'); }}
              className={`w-full h-12 px-4 rounded-2xl border bg-background text-left flex items-center justify-between focus:outline-none transition-all ${
                touched.health_insurance && !formData.health_insurance?.trim()
                  ? 'border-destructive'
                  : formData.health_insurance
                  ? 'border-primary/60'
                  : 'border-border'
              }`}>
              <span className={formData.health_insurance ? 'text-foreground' : 'text-muted-foreground/40'}>
                {formData.health_insurance || 'Krankenkasse auswählen...'}
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${insuranceOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {insuranceOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute z-50 w-full mt-1 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input
                      autoFocus
                      value={insuranceSearch}
                      onChange={e => setInsuranceSearch(e.target.value)}
                      placeholder="Suchen..."
                      className="w-full h-9 px-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredInsurances.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground text-center">Keine Treffer</p>
                    ) : filteredInsurances.map(ins => (
                      <button
                        key={ins.id}
                        type="button"
                        onClick={() => { set('health_insurance', ins.name); setInsuranceOpen(false); }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-secondary transition-all flex items-center justify-between">
                        <span className="text-foreground font-medium">{ins.name}</span>
                        {ins.approval_required && (
                          <span className="text-xs text-orange-400 font-bold">Genehmigung nötig</span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <FieldError msg={touched.health_insurance && !formData.health_insurance?.trim() ? 'Bitte Krankenkasse wählen' : null} />
          </div>

          {/* Versicherungsnummer */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Krankenversicherungsnummer * <span className="text-muted-foreground/60 normal-case font-normal">(z. B. A 123 456 789)</span>
            </label>
            <input
              type="text"
              value={formData.insurance_number}
              onChange={e => set('insurance_number', formatInsuranceNumber(e.target.value))}
              onBlur={() => blur('insurance_number')}
              placeholder="A 123 456 789"
              maxLength={13}
              className={inputCls('insurance_number', formData.insurance_number ? insValid : undefined)}
            />
            <FieldError msg={insError} />
            <FieldSuccess show={touched.insurance_number && insValid} msg="Gültiges Format" />
          </div>

          {/* Kontoinhaber */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Kontoinhaber *</label>
            <input
              type="text"
              value={formData.account_holder}
              onChange={e => set('account_holder', e.target.value)}
              onBlur={() => blur('account_holder')}
              placeholder="Vor- und Nachname"
              className={inputCls('account_holder')}
            />
            <FieldError msg={touched.account_holder && !formData.account_holder?.trim() ? 'Bitte Kontoinhaber eingeben' : null} />
          </div>

          {/* IBAN */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">IBAN *</label>
            <input
              type="text"
              value={formData.iban}
              onChange={e => set('iban', e.target.value.toUpperCase())}
              onBlur={() => blur('iban')}
              placeholder="DE89 3704 0044 0532 0130 00"
              className={inputCls('iban', formData.iban ? ibanValid : undefined)}
            />
            <FieldError msg={ibanError} />
            <FieldSuccess show={ibanTouched && ibanValid} msg="IBAN gültig" />
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
                  <p>Wir speichern deine Angaben, um deine Rehasport-Beratung, mögliche Zusatzangebote, Zuschussinformationen und einen eventuellen Vertragsabschluss korrekt vorbereiten zu können.</p>
                  <p>Dabei können auch gesundheitsbezogene Angaben verarbeitet werden, z. B. Beschwerden, Trainingsziele oder Einschränkungen. Diese Daten werden ausschließlich für Beratung, Betreuung, Terminplanung, Zuschussprüfung und Vertragsabwicklung im AlbGym genutzt.</p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    { key: 'counseling', label: 'Ich akzeptiere die Verarbeitung meiner Beratungs- und Kontaktdaten.' },
                    { key: 'health', label: 'Ich akzeptiere die Verarbeitung gesundheitsbezogener Angaben im Rahmen der Beratung.' },
                    { key: 'bank', label: 'Ich akzeptiere die Nutzung meiner Bankdaten für Vertrags-/SEPA-Abwicklung.' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consents[key]}
                        onChange={e => setConsents({ ...consents, [key]: e.target.checked })}
                        className="w-5 h-5 rounded mt-1 accent-primary cursor-pointer"
                      />
                      <span className="text-sm text-foreground">{label}</span>
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
          disabled={false}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all">
          Angaben bestätigen & fortfahren →
        </motion.button>
      </div>
    </div>
  );
}