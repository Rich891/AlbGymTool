import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings2, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isAdmin, DEFAULT_LANDING, WORLDS } from '@/lib/roleModel';

/**
 * Welt-Switcher fuer den Header (Sprint-1-AP-2).
 *
 * Rendert NUR fuer Admin-User eine kleine Pill-Group:
 *   - aktuelle Welt (disabled, highlighted)
 *   - andere Welt (clickable, navigiert via react-router)
 *
 * Mitarbeiter und Kunde sehen nichts ('return null').
 *
 * Im Kiosk-Modus rendern wir bewusst gar nichts.
 *
 * Props:
 *   currentWorld: 'admin' | 'berater' | 'kiosk'
 */
export default function WorldSwitcher({ currentWorld }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Nicht-Admins sehen den Switcher nie.
  if (!isAdmin(user)) return null;

  // Im Kiosk gibt es bewusst keinen Switcher (unbenutzter Touchpunkt).
  if (currentWorld === WORLDS.KIOSK) return null;

  // Definition der beiden moeglichen Welten (Admin <-> Berater).
  const adminPill = {
    key: WORLDS.ADMIN,
    label: 'Studio-Steuerung',
    icon: Settings2,
    path: DEFAULT_LANDING.admin,
    // farbliche Identitaet: neutrales Slate-Blau fuer Admin-Welt
    activeClasses: 'bg-slate-200 text-slate-900 border-slate-300',
    inactiveClasses: 'bg-transparent text-muted-foreground border-border hover:bg-secondary hover:text-foreground',
  };

  const beraterPill = {
    key: WORLDS.BERATER,
    label: 'Beratung & Mitarbeiter',
    icon: Users,
    path: DEFAULT_LANDING.mitarbeiter,
    // farbliche Identitaet: Markengruen fuer Mitarbeiter-Welt
    activeClasses: 'bg-primary/15 text-primary border-primary/40',
    inactiveClasses: 'bg-transparent text-muted-foreground border-border hover:bg-secondary hover:text-foreground',
  };

  const pills =
    currentWorld === WORLDS.ADMIN
      ? [{ ...adminPill, active: true }, { ...beraterPill, active: false }]
      : [{ ...beraterPill, active: true }, { ...adminPill, active: false }];

  return (
    <div
      role="group"
      aria-label="Welt-Wechsel"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm"
    >
      {pills.map(pill => {
        const Icon = pill.icon;
        const classes = pill.active ? pill.activeClasses : pill.inactiveClasses;

        return (
          <button
            key={pill.key}
            type="button"
            disabled={pill.active}
            aria-pressed={pill.active}
            onClick={() => {
              if (!pill.active) navigate(pill.path);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-tight transition-all
              ${classes}
              ${pill.active ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">{pill.label}</span>
          </button>
        );
      })}
    </div>
  );
}
