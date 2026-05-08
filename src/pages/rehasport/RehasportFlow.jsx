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
import RehaPackage from './RehaPackage';
import RehaBeforeClosing from './RehaBeforeClosing';
import RehaBooking from './RehaBooking';
import RehaContract from './RehaContract';

export default function RehasportFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [testMode, setTestMode] = useState(false);
  const [profile, setProfile] = useState({
    name: '', first_name: '', last_name: '', birthdate: '', gender: '',
    reasons: [], complaints: [],
    rulesAccepted: false,
    wishes: [], selectedOffers: [],
    subsidyMode: false,
  });

  const update = (data) => setProfile(prev => ({ ...prev, ...data }));

  const steps = [
    <RehaStart key="start" onNew={() => setStep(1)} onBack={() => navigate('/')} />,
    <RehaCustomer key="customer" profile={profile} update={update} onNext={() => setStep(2)} onBack={() => setStep(0)} testMode={testMode} />,
    <RehaReason key="reason" profile={profile} update={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />,
    <RehaComplaints key="complaints" profile={profile} update={update} onNext={() => setStep(4)} onBack={() => setStep(2)} />,
    <RehaProfile key="profile" profile={profile} update={update} onConfirm={(data) => {
      update(data);
      setStep(5);
    }} onChange={() => setStep(1)} testMode={testMode} />,
    <RehaRules key="rules" profile={profile} update={update} onNext={() => setStep(6)} onBack={() => setStep(4)} />,
    <RehaUpsellBridge key="bridge" profile={profile} update={update} onNext={() => setStep(7)} onBack={() => setStep(5)} />,
    <RehaUpsell key="upsell" profile={profile} update={update} onNext={() => setStep(8)} onBack={() => setStep(6)} />,
    <RehaPackage key="package" profile={profile} update={update} onNext={() => {
      const required = ['address', 'email', 'phone', 'health_insurance', 'insurance_number', 'account_holder', 'iban'];
      const allFilled = required.every(f => profile[f]?.trim?.());
      setStep(allFilled ? 10 : 9);
    }} onBack={() => setStep(7)} />,
    <RehaBeforeClosing key="before-closing" profile={profile} update={update} onNext={() => setStep(10)} onBack={() => setStep(8)} testMode={testMode} />,
    <RehaBooking key="booking" profile={profile} onBack={() => setStep(9)} onDone={() => { update({ bookingDone: true }); setStep(11); }} />,
    <RehaContract key="contract" profile={profile} onDone={() => navigate('/')} />,
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Test-Mode Toggle – nur für Berater sichtbar */}
      <div className="fixed top-3 right-3 z-50">
        <button
          onClick={() => setTestMode(t => !t)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${testMode ? 'bg-orange-500/20 border-orange-500/60 text-orange-400' : 'bg-card border-border text-muted-foreground/40 hover:text-muted-foreground'}`}>
          {testMode ? '⚙ TEST AN' : '⚙'}
        </button>
      </div>
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