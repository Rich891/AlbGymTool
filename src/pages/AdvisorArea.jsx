import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, BookOpen, Package, Target, History, BarChart3, Settings, ArrowLeft
} from 'lucide-react';

const SECTIONS = [
  { label: 'Beratungsverlauf', description: 'Alle vergangenen Beratungen', icon: History, path: '/berater/verlauf', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Kundenverwaltung', description: 'Kundenprofile anzeigen', icon: Users, path: '/berater/kunden', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Leistungskatalog', description: 'Alle Leistungen verwalten', icon: BookOpen, path: '/berater/leistungen', color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Tarifverwaltung', description: 'Tarife anlegen und bearbeiten', icon: Package, path: '/berater/tarife', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { label: 'Empfehlungsregeln', description: 'Scoring-Regeln konfigurieren', icon: Target, path: '/berater/regeln', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { label: 'Analytics', description: 'Beratungsquoten und Umsatz', icon: BarChart3, path: '/berater/analytics', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { label: 'Admin', description: 'Systemeinstellungen', icon: Settings, path: '/berater/admin', color: 'text-muted-foreground', bg: 'bg-secondary' },
];

export default function AdvisorArea() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Zurück
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Beraterbereich</h1>
            <p className="text-sm text-muted-foreground">Interne Verwaltung – nicht für Kunden</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.path} to={s.path}>
                <div className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-secondary/50 transition-all duration-200 cursor-pointer h-full">
                  <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{s.label}</h3>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}