import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

import MehrMainGoals from './MehrMainGoals';
import MehrFocusPoints from './MehrFocusPoints';
import MehrQuestions from './MehrQuestions';
import MehrAnalysis from './MehrAnalysis';
import MehrRecommendation from './MehrRecommendation';
import MehrAbschluss from './MehrAbschluss';
import RehaPackage from '../RehaPackage';
import RehaBeforeClosing from '../RehaBeforeClosing';
import RehaSignature from '../RehaSignature';
import RehaBooking from '../RehaBooking';

const STEPS = [
  'main_goals',       // 0
  'focus_points',     // 1
  'questions',        // 2
  'analysis',         // 3
  'recommendation',   // 4
  'package',          // 5
  'before_closing',   // 6
  'signature',        // 7
  'booking',          // 8
  'abschluss',        // 9
];

export default function MehrFlow({ customer, onBack }) {
  const [stepIndex, setStepIndex] = useState(0);

  const [moreState, setMoreState] = useState({
    mainGoals: [],
    mainGoalWeights: {},
    focusPoints: [],
    answers: {},
    corePackage: null,
    acceptedUpsells: [],
    weekly_price: 6.98,
    reasons: [],
    selectedOffers: [],
  });

  const [profile, setProfile] = useState({
    name: customer?.customer_name || '',
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    birthdate: customer?.birthdate || '',
    gender: customer?.gender || '',
    address: customer?.address || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    health_insurance: customer?.health_insurance || '',
    insurance_number: customer?.insurance_number || '',
    account_holder: customer?.account_holder || '',
    iban: customer?.iban || '',
    selectedOffers: [],
    subsidyActive: false,
    weekly_price: 6.98,
  });

  const updateMore = useCallback((data) => setMoreState(prev => ({ ...prev, ...data })), []);
  const updateProfile = useCallback((data) => setProfile(prev => ({ ...prev, ...data })), []);

  const go = (i) => setStepIndex(i);
  const next = () => setStepIndex(i => i + 1);

  const toggleGoal = useCallback((id) => {
    setMoreState(prev => ({
      ...prev,
      mainGoals: prev.mainGoals.includes(id)
        ? prev.mainGoals.filter(g => g !== id)
        : [...prev.mainGoals, id],
    }));
  }, []);

  const handleWeightChange = useCallback((goalId, value) => {
    setMoreState(prev => ({
      ...prev,
      mainGoalWeights: { ...prev.mainGoalWeights, [goalId]: value },
    }));
  }, []);

  const toggleFocus = useCallback((id) => {
    setMoreState(prev => ({
      ...prev,
      focusPoints: prev.focusPoints.includes(id)
        ? prev.focusPoints.filter(f => f !== id)
        : [...prev.focusPoints, id],
    }));
  }, []);

  const handleAnswer = useCallback((questionId, value) => {
    setMoreState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }));
  }, []);

  const handleRecommendationAccept = (data) => {
    updateMore({
      corePackage: data.corePackage,
      acceptedUpsells: data.acceptedUpsells,
      weekly_price: data.weekly_price,
      reasons: data.reasons,
      selectedOffers: data.selectedOffers,
    });
    updateProfile({
      selectedOffers: data.selectedOffers,
      weekly_price: data.weekly_price,
    });
    go(5); // → RehaPackage
  };

  const handlePackageNext = () => {
    const required = ['address', 'email', 'phone', 'health_insurance', 'insurance_number', 'account_holder', 'iban'];
    const allFilled = required.every(f => profile[f]?.trim?.());
    go(allFilled ? 7 : 6); // signature or before_closing
  };

  const handleFinish = async () => {
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
          flowType: 'mehr_tun',
          mainGoals: moreState.mainGoals,
          mainGoalWeights: moreState.mainGoalWeights,
          focusPoints: moreState.focusPoints,
          answers: moreState.answers,
          corePackage: moreState.corePackage,
          acceptedUpsells: moreState.acceptedUpsells,
        }),
      });
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
    }
    go(9); // → Abschluss
  };

  const currentStep = STEPS[stepIndex];
  const customerName = profile.name;

  const renderStep = () => {
    switch (currentStep) {
      case 'main_goals':
        return (
          <MehrMainGoals
            customerName={customerName}
            selected={moreState.mainGoals}
            weights={moreState.mainGoalWeights}
            onToggle={toggleGoal}
            onWeightChange={handleWeightChange}
            onNext={next}
            onBack={onBack}
          />
        );

      case 'focus_points':
        return (
          <MehrFocusPoints
            mainGoals={moreState.mainGoals}
            selected={moreState.focusPoints}
            onToggle={toggleFocus}
            onNext={next}
            onBack={() => go(0)}
          />
        );

      case 'questions':
        return (
          <MehrQuestions
            answers={moreState.answers}
            onAnswer={handleAnswer}
            onNext={next}
            onBack={() => go(1)}
          />
        );

      case 'analysis':
        return (
          <MehrAnalysis
            mainGoals={moreState.mainGoals}
            focusPoints={moreState.focusPoints}
            onDone={next}
          />
        );

      case 'recommendation':
        return (
          <MehrRecommendation
            moreState={moreState}
            customerName={customerName}
            onAccept={handleRecommendationAccept}
            onBack={() => go(2)}
          />
        );

      case 'package':
        return (
          <RehaPackage
            profile={profile}
            update={updateProfile}
            onNext={handlePackageNext}
            onBack={() => go(4)}
          />
        );

      case 'before_closing':
        return (
          <RehaBeforeClosing
            profile={profile}
            update={updateProfile}
            onNext={() => go(7)}
            onBack={() => go(5)}
          />
        );

      case 'signature':
        return (
          <RehaSignature
            profile={profile}
            update={updateProfile}
            onNext={handleFinish}
            onBack={() => {
              const required = ['address', 'email', 'phone', 'health_insurance', 'insurance_number', 'account_holder', 'iban'];
              const allFilled = required.every(f => profile[f]?.trim?.());
              go(allFilled ? 5 : 6);
            }}
          />
        );

      case 'booking':
        return (
          <RehaBooking
            profile={profile}
            onBack={() => go(7)}
            onDone={() => { updateProfile({ bookingDone: true }); go(9); }}
          />
        );

      case 'abschluss':
        return (
          <MehrAbschluss
            profile={profile}
            moreState={moreState}
            onNewConsultation={() => {
              setStepIndex(0);
              setMoreState({ mainGoals: [], mainGoalWeights: {}, focusPoints: [], answers: {}, corePackage: null, acceptedUpsells: [], weekly_price: 6.98, reasons: [], selectedOffers: [] });
            }}
            onHome={onBack}
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