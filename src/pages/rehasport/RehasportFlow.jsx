import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import RehaStart from './RehaStart';
import RehaCustomer from './RehaCustomer';
import RehaReason from './RehaReason';
import RehaComplaints from './RehaComplaints';
import RehaProfile from './RehaProfile';
import RehaRules from './RehaRules';
import RehaUpsellBridge from './RehaUpsellBridge';
import RehaUpsell from './RehaUpsell';
import RehaOffer from './RehaOffer';
import RehaAppointment from './RehaAppointment';
import RehaContract from './RehaContract';

export default function RehasportFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: '', birthdate: '', gender: '',
    reasons: [], complaints: [],
    rulesAccepted: false,
    wishes: [], selectedOffers: [],
    subsidyMode: false,
  });

  const update = (data) => setProfile(prev => ({ ...prev, ...data }));

  const steps = [
    <RehaStart key="start" onNew={() => setStep(1)} onBack={() => navigate('/')} />,
    <RehaCustomer key="customer" profile={profile} update={update} onNext={() => setStep(2)} onBack={() => setStep(0)} />,
    <RehaReason key="reason" profile={profile} update={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />,
    <RehaComplaints key="complaints" profile={profile} update={update} onNext={() => setStep(4)} onBack={() => setStep(2)} />,
    <RehaProfile key="profile" profile={profile} onConfirm={() => setStep(5)} onChange={() => setStep(1)} />,
    <RehaRules key="rules" profile={profile} update={update} onNext={() => setStep(6)} onBack={() => setStep(4)} />,
    <RehaUpsellBridge key="bridge" profile={profile} update={update} onNext={() => setStep(7)} onBack={() => setStep(5)} />,
    <RehaUpsell key="upsell" profile={profile} update={update} onNext={() => setStep(8)} onBack={() => setStep(6)} />,
    <RehaOffer key="offer" profile={profile} update={update} onNext={() => setStep(9)} onBack={() => setStep(7)} />,
    <RehaAppointment key="appointment" profile={profile} onDone={() => setStep(10)} />,
    <RehaContract key="contract" profile={profile} onDone={() => navigate('/')} />,
  ];

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="min-h-screen"
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}