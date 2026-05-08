import React, { useState, useEffect } from 'react';
import { ArrowLeft, Info, Check, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function RehaOfferWithSubsidy({ profile, update, onNext, onBack }) {
  const [selectedOffers, setSelectedOffers] = useState(profile.selectedOffers || []);
  const [subsidyActive, setSubsidyActive] = useState(false);
  const [subsidyVariant, setSubsidyVariant] = useState('none');
  const [insurance, setInsurance] = useState(null);
  const [insurances, setInsurances] = useState([]);
  const [showSubsidyInfo, setShowSubsidyInfo] = useState(false);
  const [showSection20Conditions, setShowSection20Conditions] = useState(false);
  const [section20Accepted, setSection20Accepted] = useState({
    binding: false,
    no_guarantee: false,
    requires_rehasport: false,
    conditions_when_stopped: false,
  });
  const [loading, setLoading] = useState(false);

  const TARIFF_PRICES = {
    rehasport_plus: 6.98,
    plus_five: 11.98,
    plus_milon: 11.98,
    plus_both: 13.98,
  };

  const SECTION20_COURSE_FEE = 99;

  // Load insurance data
  useEffect(() => {
    const load = async () => {
      try {
        const result = await base44.entities.HealthInsurance.list();
        setInsurances(result);
        
        if (profile.health_insurance) {
          const found = result.find(i => i.name === profile.health_insurance);
          if (found) setInsurance(found);
        }
      } catch (err) {
        console.error('Error loading insurances:', err);
      }
    };
    load();
  }, [profile.health_insurance]);

  const handleActivateSubsidy = () => {
    if (!profile.health_insurance) {
      alert('Bitte wähle deine Krankenkasse im Profil aus.');
      return;
    }
    if (!insurance) {
      alert('Krankenkasse nicht gefunden.');
      return;
    }
    setSubsidyActive(true);
  };

  const handleSelectSubsidyVariant = (variant) => {
    setSubsidyVariant(variant);
    setShowSection20Conditions(true);
  };

  const canProceedSection20 = Object.values(section20Accepted).every(v => v);

  const handleProceed = async () => {
    if (subsidyActive && !canProceedSection20) {
      alert('Bitte bestätige alle §20-Bedingungen.');
      return;
    }

    setLoading(true);
    try {
      update({
        selectedOffers,
        subsidyActive,
        subsidy_variant: subsidyVariant,
      });
      onNext();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const estimatedSubsidy = insurance && subsidyVariant === '1_course'
    ? insurance.subsidy_per_course
    : insurance && subsidyVariant === '2_courses'
    ? insurance.subsidy_per_year
    : 0;

  const weeklyPrice = TARIFF_PRICES[selectedOffers.length === 2 ? 'plus_both' : selectedOffers.includes('five') ? 'plus_five' : selectedOffers.includes('milon') ? 'plus_milon' : 'rehasport_plus'] || 6.98;
  const totalCourseFee = subsidyVariant === '2_courses' ? SECTION20_COURSE_FEE * 2 : subsidyVariant === '1_course' ? SECTION20_COURSE_FEE : 0;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>

        <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase mb-4">
          {subsidyActive ? 'MIT KRANKENKASSEN-ZUSCHUSS' : 'DEIN REHASPORT+ PAKET'}
        </h1>

        {/* Offer Selection */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {['rehasport_plus', 'five', 'milon'].map(offer => (
            <motion.button
              key={offer}
              onClick={() => {
                const label = { rehasport_plus: 'rehasport_plus', five: 'five', milon: 'milon' }[offer];
                setSelectedOffers(selectedOffers.includes(label) ? selectedOffers.filter(o => o !== label) : [...selectedOffers, label]);
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                selectedOffers.includes(offer) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-foreground uppercase">{offer === 'rehasport_plus' ? 'Rehasport+' : offer === 'five' ? 'FIVE Training' : 'Milon Training'}</p>
                  <p className="text-sm text-muted-foreground">{offer === 'rehasport_plus' ? 'Basis-Paket' : 'Zusatz'}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedOffers.includes(offer) ? 'border-primary bg-primary' : 'border-border'}`}>
                  {selectedOffers.includes(offer) && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Subsidy Button */}
        {!subsidyActive && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleActivateSubsidy}
            className="w-full h-14 rounded-2xl bg-secondary text-secondary-foreground font-black uppercase tracking-wide hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 mb-8">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 0a10 10 0 1 1 0 20 10 10 0 0 1 0-20zM9 5h2v6H9V5zm0 8h2v2H9v-2z" />
            </svg>
            Krankenkassen-Zuschuss nutzen
            <button onClick={() => setShowSubsidyInfo(true)} className="ml-2">
              <Info className="w-4 h-4" />
            </button>
          </motion.button>
        )}

        {/* Info Modal */}
        <AnimatePresence>
          {showSubsidyInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-card border border-border rounded-3xl p-8 max-w-lg w-full">
                <h2 className="text-2xl font-black text-foreground uppercase mb-4">Was bedeutet Krankenkassen-Zuschuss?</h2>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed mb-8">
                  <p>Viele gesetzliche Krankenkassen bezuschussen zertifizierte Präventionskurse nach §20 SGB V. Die genaue Höhe hängt von deiner Krankenkasse, deinem persönlichen Anspruch und deiner regelmäßigen Teilnahme ab.</p>
                  <div>
                    <p className="font-bold text-foreground mb-2">Wichtig:</p>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Der Zuschuss ist nicht garantiert.</li>
                      <li>Die Höhe unterscheidet sich je nach Krankenkasse.</li>
                      <li>Meist werden bis zu zwei Kurse pro Jahr unterstützt.</li>
                      <li>Die Erstattung erfolgt nach erfolgreicher Teilnahme.</li>
                      <li>Dafür werden Teilnahmebescheinigung und Zahlungsnachweis benötigt.</li>
                    </ul>
                  </div>
                  <p>Dieses Paket gilt nur in Verbindung mit aktiver Rehasport+ Teilnahme.</p>
                </div>
                <button
                  onClick={() => setShowSubsidyInfo(false)}
                  className="w-full h-12 rounded-2xl border border-border text-foreground hover:bg-secondary transition-all">
                  Verstanden
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subsidy Active View */}
        {subsidyActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-8">
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6">
              <p className="text-sm font-bold text-foreground mb-2">Krankenkasse: {insurance?.name}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Max. Zuschuss/Kurs</p>
                  <p className="font-black text-primary">{insurance?.subsidy_per_course}€</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Max. Zuschuss/Jahr</p>
                  <p className="font-black text-primary">{insurance?.subsidy_per_year}€</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold text-foreground">Wähle dein §20-Paket:</p>
              
              <motion.button
                onClick={() => handleSelectSubsidyVariant('1_course')}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                  subsidyVariant === '1_course' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}>
                <p className="font-black text-foreground mb-1">1 §20-Kurs</p>
                <p className="text-sm text-muted-foreground">99€ | 6 Monate | Zuschuss bis {insurance?.subsidy_per_course}€</p>
              </motion.button>

              <motion.button
                onClick={() => handleSelectSubsidyVariant('2_courses')}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                  subsidyVariant === '2_courses' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}>
                <p className="font-black text-foreground mb-1">2 §20-Kurse</p>
                <p className="text-sm text-muted-foreground">2 × 99€ | 12 Monate | Zuschuss bis {insurance?.subsidy_per_year}€</p>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Section 20 Conditions Modal */}
        <AnimatePresence>
          {showSection20Conditions && subsidyVariant !== 'none' && (
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
                <h2 className="text-2xl font-black text-foreground uppercase mb-6">§20-Bedingungen</h2>

                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed mb-8">
                  <p>Das Krankenkassen-Zuschuss-Paket gilt nur in Verbindung mit einer aktiven Rehasport+ Teilnahme.</p>
                  <p>Ein regulärer §20-Präventionskurs läuft in der Regel über ca. 8 Wochen. Im AlbGym wird die Nutzung im Rahmen des gewählten Rehasport+ Pakets auf 6 bzw. 12 Monate erweitert.</p>
                  <p>Der Zuschuss kann frühestens 2 Monate nach Abbuchung eingefordert werden.</p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    { key: 'binding', text: 'Ich melde mich verbindlich zum gewählten §20-Präventionsangebot an.' },
                    { key: 'no_guarantee', text: 'Ich habe verstanden, dass der Krankenkassen-Zuschuss nicht garantiert ist.' },
                    { key: 'requires_rehasport', text: 'Ich habe verstanden, dass das Zuschuss-Paket nur mit aktiver Rehasport+ Teilnahme gilt.' },
                    { key: 'conditions_when_stopped', text: 'Ich habe verstanden, dass bei Beendigung von Rehasport+ die Standardkonditionen gelten.' },
                  ].map(({ key, text }) => (
                    <label key={key} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={section20Accepted[key]}
                        onChange={e => setSection20Accepted({ ...section20Accepted, [key]: e.target.checked })}
                        className="w-5 h-5 rounded mt-1 accent-primary cursor-pointer"
                      />
                      <span className="text-foreground">{text}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSection20Conditions(false)}
                    className="flex-1 h-12 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                    Zurück
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowSection20Conditions(false)}
                    disabled={!canProceedSection20}
                    className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50">
                    Bestätigen
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Price Summary */}
        <div className="bg-secondary rounded-2xl p-6 mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-4">Zusammenfassung</p>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span>Wochenpreis Rehasport+</span>
              <span className="font-bold text-foreground">{weeklyPrice.toFixed(2)}€</span>
            </div>
            {subsidyActive && totalCourseFee > 0 && (
              <>
                <div className="flex justify-between">
                  <span>§20 Kursgebühren</span>
                  <span className="font-bold text-foreground">{totalCourseFee}€</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Möglicher Zuschuss</span>
                  <span className="font-bold">bis {estimatedSubsidy}€</span>
                </div>
              </>
            )}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleProceed}
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Jetzt starten →'}
        </motion.button>
      </div>
    </div>
  );
}