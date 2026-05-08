import React from 'react';
import { User, Calendar, Heart, Target, Activity, Pencil, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const REASON_LABELS = {
  pain: 'Schmerzen reduzieren',
  mobility: 'Wieder beweglicher werden',
  recovery: 'Nach Krankheit / Verletzung',
  stability: 'Mehr Stabilität im Alltag',
};

const COMPLAINT_LABELS = {
  back: 'Rücken & Nacken',
  joints: 'Knie, Hüfte & Gelenke',
  strength: 'Kraft & Stabilität',
  everyday: 'Beweglichkeit & Alltag',
};

function calcAge(birthdate) {
  if (!birthdate) return '–';
  const diff = Date.now() - new Date(birthdate).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

function deriveDirection(profile) {
  const c = profile.complaints || [];
  const r = profile.reasons || [];
  if (c.includes('back') || r.includes('mobility')) return 'Beweglichkeit & Rücken';
  if (c.includes('joints') || c.includes('strength')) return 'Kraft & Stabilität';
  if (r.includes('pain')) return 'Schmerzreduktion';
  return 'Allgemeine Gesundheit';
}

function InfoRow({ icon: IconComponent, label, value }) {
  const Icon = IconComponent;
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/60">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-0.5">{label}</p>
        <p className="text-foreground font-semibold text-base">{value}</p>
      </div>
    </div>
  );
}

export default function RehaProfile({ profile, onConfirm, onChange }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
      <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-2">
        DEIN <span className="text-primary">PROFIL</span>
      </h1>
      <p className="text-muted-foreground">Überprüfe deine Angaben bevor es weitergeht.</p>
      </div>

      <div className="space-y-3">
        <InfoRow icon={User} label="Name" value={profile.name || '–'} />
        <InfoRow icon={Calendar} label="Alter" value={`${calcAge(profile.birthdate)} Jahre`} />
        <InfoRow icon={User} label="Geschlecht" value={profile.gender || '–'} />
        <InfoRow icon={Heart} label="Startgründe" value={(profile.reasons || []).map(r => REASON_LABELS[r]).join(', ') || '–'} />
        <InfoRow icon={Activity} label="Hauptbeschwerden" value={(profile.complaints || []).map(c => COMPLAINT_LABELS[c]).join(', ') || '–'} />
        <InfoRow icon={Target} label="Zielrichtung" value={deriveDirection(profile)} />
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
        >
          <Check className="w-6 h-6" /> Bestätigen
        </motion.button>
        <button
          onClick={onChange}
          className="w-full h-14 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all font-semibold flex items-center justify-center gap-2"
        >
          <Pencil className="w-4 h-4" /> Angaben ändern
        </button>
      </div>
      </div>
    </div>
  );
}