import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Maximize, Minimize } from 'lucide-react';
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
  const [history, setHistory] = useState([]);
  const [showBestand, setShowBestand] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const advisorOpts = loadAdvisorOptions();
  const signatureRequired = advisorOpts.signature_required !== false; // default true
  const signatureSkipAllowed = advisorOpts.signature_skip_allowed === true;
  const fullscreenEnabled = advisorOpts.fullscreen_mode === true;
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (fullscreenEnabled) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    }
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };
  const [profile, setProfile] = useState({
    name: '', first_name: '', last_name: '', birthdate: '', gender: '',
    reasons: [], complaints: [],
    rulesAccepted: false,
    wishes: [], selectedOffers: [],
    subsidyMode: false,
  });

  const update = (data) => setProfile(prev => ({ ...prev, ...data }));

  const goTo = (nextStep) => {
    setHistory(h => [...h, step]);
    setStep(nextStep);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setStep(prev);
    } else {
      navigate('/');
    }
  };

  if (showBestand) {
    return <BestandFlow onBack={() => setShowBestand(false)} />;
  }

  const steps = [
    <RehaStart key="start" onNew={() => goTo(1)} onExisting={() => setShowBestand(true)} onBack={() => navigate('/')} />,
    <RehaCustomer key="customer" profile={profile} update={update} onNext={() => goTo(2)} onBack={goBack} testMode={testMode} />,
    <RehaReason key="reason" profile={profile} update={update} onNext={() => goTo(3)} onBack={goBack} />,
    <RehaComplaints key="complaints" profile={profile} update={update} onNext={() => goTo(4)} onBack={goBack} />,
    <RehaProfile key="profile" profile={profile} update={update} onConfirm={(data) => {
      update(data);
      goTo(5);
    }} onChange={() => goTo(1)} testMode={testMode} />,
    <RehaRules key="rules" profile={profile} update={update} onNext={() => goTo(6)} onBack={goBack} />,
    <RehaUpsellBridge key="bridge" profile={profile} update={update} onNext={() => goTo(7)} onBack={goBack} />,
    <RehaUpsell key="upsell" profile={profile} update={update} onNext={() => goTo(8)} onBack={goBack} />,
    <RehaPackage key="package" profile={profile} update={update} onNext={() => goTo(9)} onBack={goBack} />,
    <RehaSignature key="signature" profile={profile} update={update} skipAllowed={signatureSkipAllowed || !signatureRequired} onNext={() => {
      const required = ['address', 'email', 'phone', 'health_insurance', 'insurance_number', 'account_holder', 'iban'];
      const allFilled = required.every(f => profile[f]?.trim?.());
      goTo(allFilled ? 11 : 10);
    }} onBack={goBack} />,
    <RehaBeforeClosing key="before-closing" profile={profile} update={update} onNext={() => goTo(11)} onBack={goBack} testMode={testMode} />,
    <RehaBooking key="booking" profile={profile} onBack={goBack} onDone={() => { update({ bookingDone: true }); goTo(12); }} />,
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
      {/* Fullscreen Toggle */}
      <button
        onClick={toggleFullscreen}
        className="fixed top-3 left-3 z-50 p-2 rounded-full bg-card border border-border text-muted-foreground/40 hover:text-muted-foreground transition-all"
        title={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </button>

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