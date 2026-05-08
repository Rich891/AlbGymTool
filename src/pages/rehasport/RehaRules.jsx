import React from 'react';
import { ArrowLeft, Check, CalendarCheck, Phone, Clipboard, PenLine, Shirt } from 'lucide-react';
import { motion } from 'framer-motion';

const RULES = [
  { icon: CalendarCheck, title: 'Regelmäßige Teilnahme', text: 'Rehasport funktioniert am besten, wenn du regelmäßig dabei bist.' },
  { icon: Phone, title: 'Absagen bei Verhinderung', text: 'Wenn du nicht kommen kannst, sag bitte rechtzeitig ab.' },
  { icon: Clipboard, title: 'Kursplatz ist verbindlich', text: 'Dein Platz ist für die Dauer deines Rezepts reserviert.' },
  { icon: PenLine, title: 'Check-in & Unterschrift', text: 'Vor Ort einchecken und im Kurs unterschreiben.' },
  { icon: Shirt, title: 'Saubere Sportkleidung', text: 'Bitte Handtuch, saubere Sportschuhe und geeignete Kleidung mitbringen.' },
];

export default function RehaRules({ profile, update, onNext, onBack }) {
  const accepted = profile.rulesAccepted;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-4xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>

      <div className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight leading-tight mb-2">
        WICHTIGE REGELN
      </h1>
      <p className="text-muted-foreground">Für deinen Rehasport im AlbGym.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RULES.map((rule, i) => {
          const Icon = rule.icon;
          return (
            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-black text-foreground text-base mb-1">{rule.title}</h3>
                <p className="text-sm text-muted-foreground leading-snug">{rule.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Accept */}
      <div className="mt-8">
        <button
          onClick={() => update({ rulesAccepted: !accepted })}
          className={`w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left
            ${accepted ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(0,230,80,0.2)]' : 'border-border bg-card hover:border-primary/40'}`}
        >
          <div className={`mt-0.5 w-7 h-7 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${accepted ? 'border-primary bg-primary' : 'border-border'}`}>
            {accepted && <Check className="w-4 h-4 text-primary-foreground" />}
          </div>
          <span className="text-sm text-foreground leading-relaxed font-medium">
            Ich habe die Rehasport-Regeln verstanden und akzeptiere sie.
          </span>
        </button>
      </div>

      <div className="mt-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={!accepted}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Bestätigen und weiter →
        </motion.button>
      </div>
      </div>
    </div>
  );
}