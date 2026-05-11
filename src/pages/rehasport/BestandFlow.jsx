import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import BestandProfileSelect from './bestand/BestandProfileSelect';
import BestandWelcome from './bestand/BestandWelcome';
import BestandPrescriptionHistory from './bestand/BestandPrescriptionHistory';
import BestandDeficits from './bestand/BestandDeficits';
import BestandImprovement from './bestand/BestandImprovement';
import BestandFutureGoals from './bestand/BestandFutureGoals';
import BestandUsedMeasures from './bestand/BestandUsedMeasures';
import BestandAnalysis from './bestand/BestandAnalysis';
import BestandEvaluation from './bestand/BestandEvaluation';
import BestandRecommendation from './bestand/BestandRecommendation';
import RehaPackage from './RehaPackage';
import RehaBeforeClosing from './RehaBeforeClosing';
import RehaSignature from './RehaSignature';
import RehaBooking from './RehaBooking';
import RehaContract from './RehaContract';
import { base44 } from '@/api/base44Client';

const STEPS = [
  'profile_select',     // 0
  'welcome',            // 1
  'prescription',       // 2
  'deficits',           // 3
  'improvement',        // 4
  'future_goals',       // 5
  'used_measures',      // 6
  'analysis',           // 7
  'evaluation',         // 8
  'recommendation',     // 9
  'package',            // 10
  'before_closing',     // 11
  'signature',          // 12
  'booking',            // 13
  'contract',           // 14
];

export default function BestandFlow({ onBack }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [bestandState, setBestandState] = useState({
    prescriptionHistory: null,
    initialDeficits: [],
    improvementScores: {},
    futureGoals: [],
    usedMeasures: [],
  });
  const [profile, setProfile] = useState({
    name: '', first_name: '', last_name: '', birthdate: '', gender: '',
    selectedOffers: [], subsidyActive: false, weekly_price: 6.98,
  });

  const updateBestand = (data) => setBestandState(prev => ({ ...prev, ...data }));
  const updateProfile = (data) => setProfile(prev => ({ ...prev, ...data }));

  const go = (i) => setStepIndex(i);
  const next = () => setStepIndex(i => i + 1);
  const prev = () => setStepIndex(i => Math.max(0, i - 1));

  const toggleDeficit = useCallback((id) => {
    setBestandState(prev => ({
      ...prev,
      initialDeficits: prev.initialDeficits.includes(id)
        ? prev.initialDeficits.filter(d => d !== id)
        : [...prev.initialDeficits, id],
    }));
  }, []);

  const toggleGoal = useCallback((id) => {
    setBestandState(prev => ({
      ...prev,
      futureGoals: prev.futureGoals.includes(id)
        ? prev.futureGoals.filter(g => g !== id)
        : [...prev.futureGoals, id],
    }));
  }, []);

  const toggleMeasure = useCallback((id) => {
    setBestandState(prev => ({
      ...prev,
      usedMeasures: prev.usedMeasures.includes(id)
        ? prev.usedMeasures.filter(m => m !== id)
        : [...prev.usedMeasures, id],
    }));
  }, []);

  const handleScoreChange = useCallback((defId, value) => {
    setBestandState(prev => ({
      ...prev,
      improvementScores: { ...prev.improvementScores, [defId]: value },
    }));
  }, []);

  const handleSelectCustomer = (c) => {
    if (c) {
      setCustomer(c);
      setProfile(prev => ({
        ...prev,
        name: c.customer_name || '',
        birthdate: c.birthdate || '',
        gender: c.gender || '',
        address: c.address || '',
        email: c.email || '',
        phone: c.phone || '',
        health_insurance: c.health_insurance || '',
        insurance_number: c.insurance_number || '',
        account_holder: c.account_holder || '',
        iban: c.iban || '',
      }));
    }
    next();
  };

  const handleWelcomeSelect = (option) => {
    if (option === 'renew') {
      next(); // → prescription
    } else {
      // "Ich möchte mehr tun" → Placeholder
      alert('Dieser Bereich wird bald verfügbar sein.');
    }
  };

  const handleRecommendationAccept = (data) => {
    updateProfile({
      selectedOffers: data.selectedOffers,
      weekly_price: data.weekly_price,
    });
    updateBestand({
      recommendedMeasures: data.recommendedMeasures,
      reasons: data.reasons,
    });
    go(10); // → RehaPackage
  };

  const handlePackageNext = () => {
    const required = ['address', 'email', 'phone', 'health_insurance', 'insurance_number', 'account_holder', 'iban'];
    const allFilled = required.every(f => profile[f]?.trim?.());
    go(allFilled ? 12 : 11);
  };

  const currentStep = STEPS[stepIndex];

  const renderStep = () => {
    switch (currentStep) {
      case 'profile_select':
        return <BestandProfileSelect onSelect={handleSelectCustomer} onBack={onBack} />;

      case 'welcome':
        return <BestandWelcome customer={customer} onSelect={handleWelcomeSelect} onBack={() => go(0)} />;

      case 'prescription':
        return (
          <BestandPrescriptionHistory
            onSelect={(val) => { updateBestand({ prescriptionHistory: val }); next(); }}
            onBack={() => go(1)}
          />
        );

      case 'deficits':
        return (
          <BestandDeficits
            selected={bestandState.initialDeficits}
            onToggle={toggleDeficit}
            onNext={next}
            onBack={prev}
          />
        );

      case 'improvement':
        return (
          <BestandImprovement
            deficits={bestandState.initialDeficits}
            scores={bestandState.improvementScores}
            onScoreChange={handleScoreChange}
            onNext={next}
            onBack={prev}
          />
        );

      case 'future_goals':
        return (
          <BestandFutureGoals
            selected={bestandState.futureGoals}
            onToggle={toggleGoal}
            onNext={next}
            onBack={prev}
          />
        );

      case 'used_measures':
        return (
          <BestandUsedMeasures
            selected={bestandState.usedMeasures}
            onToggle={toggleMeasure}
            onNext={next}
            onBack={prev}
          />
        );

      case 'analysis':
        return <BestandAnalysis onDone={next} />;

      case 'evaluation':
        return <BestandEvaluation state={bestandState} onNext={next} onBack={prev} />;

      case 'recommendation':
        return (
          <BestandRecommendation
            state={{ ...bestandState }}
            onAccept={handleRecommendationAccept}
            onKeep={() => go(10)}
            onBack={prev}
          />
        );

      case 'package':
        return (
          <RehaPackage
            profile={profile}
            update={updateProfile}
            onNext={handlePackageNext}
            onBack={() => go(9)}
          />
        );

      case 'before_closing':
        return (
          <RehaBeforeClosing
            profile={profile}
            update={updateProfile}
            onNext={() => go(12)}
            onBack={() => go(10)}
          />
        );

      case 'signature':
        return (
          <RehaSignature
            profile={profile}
            update={updateProfile}
            onNext={() => go(13)}
            onBack={() => {
              const required = ['address', 'email', 'phone', 'health_insurance', 'insurance_number', 'account_holder', 'iban'];
              const allFilled = required.every(f => profile[f]?.trim?.());
              go(allFilled ? 10 : 11);
            }}
          />
        );

      case 'booking':
        return (
          <RehaBooking
            profile={profile}
            onBack={() => go(12)}
            onDone={() => { updateProfile({ bookingDone: true }); go(14); }}
          />
        );

      case 'contract':
        return (
          <RehaContract
            profile={profile}
            onDone={async () => {
              try {
                await base44.entities.RehasportConsultation.create({
                  customer_name: profile.name,
                  birthdate: profile.birthdate,
                  gender: profile.gender,
                  address: profile.address,
                  email: profile.email,
                  phone: profile.phone,
                  health_insurance: profile.health_insurance,
                  insurance_number: profile.insurance_number,
                  account_holder: profile.account_holder,
                  iban: profile.iban,
                  signature: profile.signature,
                  selected_offers: profile.selectedOffers || [],
                  subsidy_active: profile.subsidyActive || false,
                  subsidy_variant: profile.subsidy_variant || 'none',
                  weekly_price: profile.weekly_price,
                  status: 'abgeschlossen',
                  notes: JSON.stringify({
                    existingCustomer: true,
                    prescriptionHistory: bestandState.prescriptionHistory,
                    initialDeficits: bestandState.initialDeficits,
                    improvementScores: bestandState.improvementScores,
                    futureGoals: bestandState.futureGoals,
                    usedMeasures: bestandState.usedMeasures,
                    recommendedMeasures: bestandState.recommendedMeasures,
                  }),
                });
              } catch (err) {
                console.error('Fehler beim Speichern:', err);
              }
              onBack();
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="min-h-screen">
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}