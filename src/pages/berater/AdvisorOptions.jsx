import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Settings, PenLine, FileText, Shield, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';

// Persistent options stored on a special Settings entity record
// We use a single record keyed by id="global" via localStorage as a lightweight config store
const STORAGE_KEY = 'alb_advisor_options';

function loadOptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOptions(opts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(opts));
}

const OPTION_GROUPS = [
  {
    title: 'Unterschrift & Vertrag',
    icon: PenLine,
    options: [
      {
        key: 'signature_required',
        label: 'Unterschrift erforderlich',
        description: 'Kunden müssen den Vertrag digital unterschreiben, bevor der Download freigeschaltet wird.',
        defaultValue: true,
      },
      {
        key: 'signature_skip_allowed',
        label: 'Unterschrift überspringbar (Berater)',
        description: 'Der Berater kann den Unterschriftsschritt im Flow überspringen (z.B. bei telefonischer Beratung).',
        defaultValue: false,
      },
      {
        key: 'contract_download_auto',
        label: 'Automatischer PDF-Download',
        description: 'Der Vertrag wird nach Abschluss automatisch heruntergeladen, ohne Bestätigungsklick.',
        defaultValue: false,
      },
    ],
  },
  {
    title: 'Buchung & Termine',
    icon: FileText,
    options: [
      {
        key: 'booking_required',
        label: 'Terminbuchung Pflicht',
        description: 'Kunden müssen einen Einführungstermin buchen, bevor der Vertrag generiert wird.',
        defaultValue: true,
      },
      {
        key: 'booking_skip_allowed',
        label: 'Buchung überspringbar (Berater)',
        description: 'Berater können den Buchungsschritt überspringen und direkt zum Vertragsabschluss.',
        defaultValue: false,
      },
    ],
  },
  {
    title: 'Datenschutz & Einwilligungen',
    icon: Shield,
    options: [
      {
        key: 'consent_health_required',
        label: 'Gesundheitsdaten-Einwilligung Pflicht',
        description: 'Kunden müssen explizit in die Verarbeitung von Gesundheitsdaten einwilligen.',
        defaultValue: true,
      },
      {
        key: 'consent_bank_required',
        label: 'Bankdaten-Einwilligung Pflicht',
        description: 'Kunden müssen explizit in die SEPA-Lastschrift einwilligen.',
        defaultValue: true,
      },
    ],
  },
  {
    title: 'Flow & Interface',
    icon: Settings,
    options: [
      {
        key: 'upsell_enabled',
        label: 'Upsell-Schritte anzeigen',
        description: 'FIVE und Milon werden im Beratungsflow als Zusatzoption angeboten.',
        defaultValue: true,
      },
      {
        key: 'subsidy_enabled',
        label: '§20-Zuschuss-Option anzeigen',
        description: 'Kunden sehen die §20-Zuschussoption im Paketschritt.',
        defaultValue: true,
      },
      {
        key: 'test_mode_visible',
        label: 'Test-Modus sichtbar',
        description: 'Der ⚙ Test-Modus-Button ist im Flow sichtbar (nur für Berater).',
        defaultValue: true,
      },
    ],
  },
];

function ToggleOption({ optKey, label, description, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground mb-0.5">{label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <button
        onClick={() => onChange(optKey, !value)}
        className={`flex-shrink-0 mt-0.5 transition-all duration-200 ${value ? 'text-primary' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
      >
        {value ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
      </button>
    </div>
  );
}

export default function AdvisorOptions() {
  const [options, setOptions] = useState(() => {
    const saved = loadOptions();
    // Apply defaults for any missing keys
    const defaults = {};
    OPTION_GROUPS.forEach(g => g.options.forEach(o => { defaults[o.key] = o.defaultValue; }));
    return { ...defaults, ...saved };
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    const next = { ...options, [key]: value };
    setOptions(next);
    saveOptions(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetDefaults = () => {
    const defaults = {};
    OPTION_GROUPS.forEach(g => g.options.forEach(o => { defaults[o.key] = o.defaultValue; }));
    setOptions(defaults);
    saveOptions(defaults);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground uppercase">Optionen</h1>
          <p className="text-sm text-muted-foreground mt-1">Flow-Einstellungen und Berater-Konfiguration</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-bold text-primary"
            >
              ✓ Gespeichert
            </motion.span>
          )}
          <button
            onClick={resetDefaults}
            className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all uppercase tracking-wide"
          >
            Zurücksetzen
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-8">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Änderungen werden sofort gespeichert und wirken sich auf neue Beratungen aus. Bestehende Abschlüsse sind nicht betroffen. Die Einstellungen werden lokal im Browser gespeichert.
        </p>
      </div>

      <div className="space-y-6">
        {OPTION_GROUPS.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-black text-foreground uppercase tracking-wide">{group.title}</h2>
              </div>
              {group.options.map((opt) => (
                <ToggleOption
                  key={opt.key}
                  optKey={opt.key}
                  label={opt.label}
                  description={opt.description}
                  value={options[opt.key]}
                  onChange={handleChange}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}