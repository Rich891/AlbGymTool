import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

import RehaStart from './RehaStart';
import BestandFlow from './BestandFlow';
import RehaCustomer from './RehaCustomer';
import RehaReason from './RehaReason';
import RehaComplaints from './RehaComplaints';
import RehaProfile from './RehaProfile';
import RehaRules from './RehaRules';
import RehaUpsellBridge from './RehaUpsellBridge';
import RehaUpsell from './RehaUpsell';
import RehaPackage from './RehaPackage';
import RehaSignature from './RehaSignature';
import RehaBeforeClosing from './RehaBeforeClosing';
import RehaBooking from './RehaBooking';
import RehaContract from './RehaContract';

function loadAdvisorOptions() {
  try {
    const raw = localStorage.getItem('alb_advisor_options');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function RehasportFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showBestand, setShowBestand] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const advisorOpts = loadAdvisorOptions();
  const signatureRequired = advisorOpts.signature_required !== false; // default true
  const signatureSkipAllowed = advisorOpts.signature_skip_allowed === true;
  const [profile, setProfile] = useState({
    name: '', first_name: '', last_name: '', birthdate: '', gender: '',
    reasons: [], complaints: [],
    rulesAccepted: false,
    wishes: [], selectedOffers: [],
    subsidyMode: false,
  });

  const update = (data) => setProfile(prev => ({ ...prev, ...data }));

  if (showBestand) {
    return <BestandFlow onBack={() => setShowBestand(false)} />;
  }

  const steps = [
    <RehaStart key="start" onNew={() => setStep(1)} onExisting={() => setShowBestand(true)} onBack={() => navigate('/')} />,
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
    <RehaPackage key="package" profile={profile} update={update} onNext={() => setStep(9)} onBack={() => setStep(7)} />,
    <RehaSignature key="signature" profile={profile} update={update} skipAllowed={signatureSkipAllowed || !signatureRequired} onNext={() => {
      const required = ['address', 'email', 'phone', 'health_insurance', 'insurance_number', 'account_holder', 'iban'];
      const allFilled = required.every(f => profile[f]?.trim?.());
      setStep(allFilled ? 11 : 10);
    }} onBack={() => setStep(8)} />,
    <RehaBeforeClosing key="before-closing" profile={profile} update={update} onNext={() => setStep(11)} onBack={() => setStep(9)} testMode={testMode} />,
    <RehaBooking key="booking" profile={profile} onBack={() => setStep(10)} onDone={() => { update({ bookingDone: true }); setStep(12); }} />,
    <RehaContract key="contract" profile={profile} onDone={async () => {
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
          reasons: profile.reasons || [],
          complaints: profile.complaints || [],
          wishes: profile.wishes || [],
          rules_accepted: profile.rulesAccepted || false,
          selected_offers: profile.selectedOffers || [],
          subsidy_active: profile.subsidyActive || false,
          subsidy_variant: profile.subsidy_variant || 'none',
          weekly_price: profile.weekly_price,
          status: 'abgeschlossen',
        });
      } catch (err) {
        console.error('Fehler beim Speichern:', err);
      }
      navigate('/');
    }} />,
  ];

  // Gültige Steps: 0-12
  const validStep = Math.min(Math.max(step, 0), 12);

  return (
    <div className="min-h-screen bg-background">
      {/* Test-Mode Toggle – nur für Berater sichtbar */}
      <div className="fixed top-3 right-3 z-50 flex flex-col gap-1 items-end">
        <button
          onClick={() => setTestMode(t => !t)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${testMode ? 'bg-orange-500/20 border-orange-500/60 text-orange-400' : 'bg-card border-border text-muted-foreground/40 hover:text-muted-foreground'}`}>
          {testMode ? '⚙ TEST AN' : '⚙'}
        </button>
        {testMode && (
          <button
            onClick={() => { update({ bookingDone: true, signature: 'test' }); setStep(12); }}
            className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border bg-orange-500/20 border-orange-500/60 text-orange-400 hover:bg-orange-500/30">
            Termin dummy →
          </button>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={validStep}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="min-h-screen"
        >
          {steps[validStep]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}