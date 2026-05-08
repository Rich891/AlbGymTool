import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, User, ArrowRight, ArrowLeft,
  UserCircle, Phone, Shield, Check,
  Baby, Smile, PersonStanding, Crown, Star,
  Dumbbell, Activity
} from 'lucide-react';

// ─── Gender icon as inline SVG (lucide has no Mars/Venus) ───────────────────
const MaleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="10" cy="14" r="5"/><path d="M19 5l-5.5 5.5M19 5h-5M19 5v5"/>
  </svg>
);
const FemaleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="9" r="5"/><line x1="12" y1="14" x2="12" y2="21"/><line x1="9" y1="18" x2="15" y2="18"/>
  </svg>
);
const DiversIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="5"/><path d="M17 7l2-2m0 0h-3m3 0v3"/><path d="M7 17l-2 2m0 0h3m-3 0v-3"/>
  </svg>
);

const GENDER_OPTIONS = [
  { id: 'männlich', label: 'Mann', IconComp: MaleIcon, image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=80', color: 'from-blue-600/70' },
  { id: 'weiblich', label: 'Frau', IconComp: FemaleIcon, image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&q=80', color: 'from-pink-500/70' },
  { id: 'divers', label: 'Divers', IconComp: DiversIcon, image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=700&q=80', color: 'from-purple-500/70' },
];

const AGE_OPTIONS = [
  { id: '16-25', label: '16 – 25', sub: 'Jung & voller Energie', icon: Baby, image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=80', color: 'from-yellow-500/70' },
  { id: '26-35', label: '26 – 35', sub: 'Aktiv & leistungsstark', icon: Dumbbell, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=80', color: 'from-primary/70' },
  { id: '36-50', label: '36 – 50', sub: 'Erfahren & zielorientiert', icon: Activity, image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=700&q=80', color: 'from-teal-500/70' },
  { id: '51+',  label: '51+', sub: 'Fit & aktiv in jeder Phase', icon: Star, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80', color: 'from-orange-500/70' },
];

// ─── Visual Card ─────────────────────────────────────────────────────────────
function VisualCard({ option, selected, onClick }) {
  const [hovered, setHovered] = useState(false);
  const Icon = option.icon;
  const IconComp = option.IconComp;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative overflow-hidden rounded-2xl text-left focus:outline-none transition-all duration-200 h-44 md:h-52
        ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'ring-1 ring-transparent hover:ring-primary/30'}`}
    >
      <img src={option.image} alt={option.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className={`absolute inset-0 bg-gradient-to-t ${option.color} to-black/75 transition-opacity duration-300 ${hovered || selected ? 'opacity-100' : 'opacity-90'}`} />

      {selected && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center z-10">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      <div className={`absolute top-3 left-3 w-9 h-9 rounded-xl flex items-center justify-center z-10 transition-all
        ${selected ? 'bg-primary' : 'bg-black/40 backdrop-blur-sm'}`}>
        {IconComp ? <IconComp /> : Icon ? <Icon className="w-5 h-5 text-white" /> : null}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className={`text-lg font-black uppercase leading-tight ${selected ? 'text-primary' : 'text-white'}`}>
          {option.label}
        </h3>
        {option.sub && (
          <AnimatePresence>
            {(hovered || selected) && (
              <motion.p
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.18 }}
                className="text-xs text-white/80 leading-snug overflow-hidden"
              >
                {option.sub}
              </motion.p>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.button>
  );
}

// ─── Animated panel wrapper ───────────────────────────────────────────────────
function StepPanel({ children, stepKey, dir }) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: dir * 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: dir * -50 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CustomerStep({ customer, setCustomer, onNext }) {
  const [mode, setMode] = useState(null);
  const [subStep, setSubStep] = useState(0);
  const [searchQ, setSearchQ] = useState('');
  const [dir, setDir] = useState(1);

  const { data: allCustomers = [] } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => base44.entities.Customer.list('-created_date', 200),
    enabled: mode === 'search',
  });

  const filtered = allCustomers.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email || ''}`.toLowerCase().includes(searchQ.toLowerCase())
  );

  const goSub = (next) => {
    setDir(next > subStep ? 1 : -1);
    setSubStep(next);
  };

  const TOTAL_SUB = 5;
  const progress = mode === 'new' ? ((subStep + 1) / TOTAL_SUB) * 100 : 0;

  // ── Mode selection ─────────────────────────────────────────────────────────
  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center mb-2">
          <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">Wer kommt heute?</h2>
          <p className="text-muted-foreground mt-2">Starte eine neue Beratung oder such einen bestehenden Kunden</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setMode('new')}
            className="group relative overflow-hidden rounded-3xl h-52 text-left focus:outline-none">
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80" alt="Neukunde" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-black/50" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-3">
                <UserCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-black text-white uppercase">Neukunde</h3>
              <p className="text-sm text-white/70 mt-1">Noch kein Profil – jetzt anlegen</p>
            </div>
          </motion.button>

          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setMode('search')}
            className="group relative overflow-hidden rounded-3xl h-52 text-left focus:outline-none">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80" alt="Bestandskunde" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-black/50" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black text-white uppercase">Bestandskunde</h3>
              <p className="text-sm text-white/70 mt-1">Profil suchen & Beratung starten</p>
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  if (mode === 'search') {
    return (
      <div className="min-h-screen flex flex-col px-4 md:px-6 pt-8 pb-8">
        <button onClick={() => setMode(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-6">Kunden suchen</h2>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Name oder Telefon ..." autoFocus
            className="w-full h-16 pl-12 pr-4 rounded-2xl border border-border bg-card text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
        </div>
        {searchQ && (
          <div className="space-y-3 flex-1 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-8">Kein Kunde gefunden</p>
              : filtered.map(c => (
                <button key={c.id} onClick={() => { setCustomer(c); onNext(); }}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-secondary/50 transition-all text-left">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-lg text-foreground">{c.first_name} {c.last_name}</p>
                    {c.phone && <p className="text-sm text-muted-foreground">{c.phone}</p>}
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
          </div>
        )}
      </div>
    );
  }

  // ── New customer sub-steps ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-medium">Schritt {subStep + 1} / {TOTAL_SUB}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── 0: Name ── */}
          {subStep === 0 && (
            <StepPanel key="name" stepKey="name" dir={dir}>
              <div className="flex-1 flex flex-col px-4 md:px-6 pt-8 pb-4">
                <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight mb-2">Wie heißt du?</h2>
                <p className="text-muted-foreground mb-8">Vorname und Nachname für die persönliche Ansprache.</p>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Vorname *</label>
                    <input type="text" value={customer.first_name || ''} onChange={e => setCustomer(p => ({ ...p, first_name: e.target.value }))}
                      placeholder="Max" autoFocus
                      className="w-full h-16 px-5 rounded-2xl border-2 border-border bg-card text-foreground text-xl font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">Nachname *</label>
                    <input type="text" value={customer.last_name || ''} onChange={e => setCustomer(p => ({ ...p, last_name: e.target.value }))}
                      placeholder="Mustermann"
                      className="w-full h-16 px-5 rounded-2xl border-2 border-border bg-card text-foreground text-xl font-bold placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>
              </div>
              <div className="px-4 md:px-6 pb-8 flex gap-3">
                <button onClick={() => setMode(null)} className="h-14 px-5 rounded-2xl border border-border text-muted-foreground hover:bg-secondary transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => goSub(1)}
                  disabled={!customer.first_name || !customer.last_name}
                  className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-base uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Weiter →
                </motion.button>
              </div>
            </StepPanel>
          )}

          {/* ── 1: Gender ── */}
          {subStep === 1 && (
            <StepPanel key="gender" stepKey="gender" dir={dir}>
              <div className="flex-1 flex flex-col px-4 md:px-6 pt-8 pb-4">
                <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight mb-2">
                  Hallo {customer.first_name}!
                </h2>
                <p className="text-muted-foreground mb-8">Wie möchtest du angesprochen werden? · Wähle eine Antwort</p>
                <div className="grid grid-cols-3 gap-4 max-w-2xl">
                  {GENDER_OPTIONS.map(opt => (
                    <VisualCard key={opt.id} option={opt} selected={customer.gender === opt.id}
                      onClick={() => { setCustomer(p => ({ ...p, gender: opt.id })); setTimeout(() => goSub(2), 300); }} />
                  ))}
                </div>
              </div>
              <div className="px-4 md:px-6 pb-8">
                <button onClick={() => goSub(0)} className="h-14 px-5 rounded-2xl border border-border text-muted-foreground hover:bg-secondary transition-all flex items-center">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </StepPanel>
          )}

          {/* ── 2: Age ── */}
          {subStep === 2 && (
            <StepPanel key="age" stepKey="age" dir={dir}>
              <div className="flex-1 flex flex-col px-4 md:px-6 pt-8 pb-4">
                <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight mb-2">In welcher Altersgruppe?</h2>
                <p className="text-muted-foreground mb-8">Wähle eine Antwort</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
                  {AGE_OPTIONS.map(opt => (
                    <VisualCard key={opt.id} option={opt} selected={customer.age_group === opt.id}
                      onClick={() => {
                        const midAge = { '16-25': 20, '26-35': 30, '36-50': 43, '51+': 58 }[opt.id];
                        setCustomer(p => ({ ...p, age: midAge, age_group: opt.id }));
                        setTimeout(() => goSub(3), 300);
                      }} />
                  ))}
                </div>
              </div>
              <div className="px-4 md:px-6 pb-8">
                <button onClick={() => goSub(1)} className="h-14 px-5 rounded-2xl border border-border text-muted-foreground hover:bg-secondary transition-all flex items-center">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </StepPanel>
          )}

          {/* ── 3: Contact ── */}
          {subStep === 3 && (
            <StepPanel key="contact" stepKey="contact" dir={dir}>
              <div className="flex-1 flex flex-col px-4 md:px-6 pt-8 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight mb-2">Erreichbarkeit</h2>
                <p className="text-muted-foreground mb-8">Optional – für Angebote und Rückfragen.</p>
                <div className="space-y-4 max-w-lg">
                  <input type="tel" value={customer.phone || ''} onChange={e => setCustomer(p => ({ ...p, phone: e.target.value }))}
                    placeholder="Telefonnummer" autoFocus
                    className="w-full h-16 px-5 rounded-2xl border-2 border-border bg-card text-foreground text-lg font-semibold placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all" />
                  <input type="email" value={customer.email || ''} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))}
                    placeholder="E-Mail (optional)"
                    className="w-full h-16 px-5 rounded-2xl border-2 border-border bg-card text-foreground text-lg font-semibold placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-all" />
                </div>
              </div>
              <div className="px-4 md:px-6 pb-8 flex gap-3">
                <button onClick={() => goSub(2)} className="h-14 px-5 rounded-2xl border border-border text-muted-foreground hover:bg-secondary transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => goSub(4)}
                  className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-base uppercase tracking-wide hover:bg-primary/90 transition-all">
                  Weiter →
                </motion.button>
              </div>
            </StepPanel>
          )}

          {/* ── 4: Privacy ── */}
          {subStep === 4 && (
            <StepPanel key="privacy" stepKey="privacy" dir={dir}>
              <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 text-center">
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight mb-3">Datenschutz</h2>
                <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
                  Deine Daten werden ausschließlich für diese Beratung verwendet und nicht an Dritte weitergegeben. Wir halten uns strikt an die DSGVO.
                </p>
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => { setCustomer(p => ({ ...p, privacy_consent: true, privacy_consent_date: new Date().toISOString() })); onNext(); }}
                  className="w-full max-w-sm h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all flex items-center justify-center gap-3">
                  <Check className="w-6 h-6" /> Zustimmen & Weiter
                </motion.button>
                <button onClick={() => goSub(3)} className="mt-5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Zurück
                </button>
              </div>
            </StepPanel>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}