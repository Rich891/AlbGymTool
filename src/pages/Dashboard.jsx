import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  UserPlus, HeartPulse, TrendingUp, ShoppingBag, 
  Search, History, ArrowRight, Users, FileText, BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MAIN_ACTIONS = [
  {
    title: 'Neukunden-Beratung',
    description: 'Komplette Beratung mit Anamnese, Zielanalyse und Empfehlung',
    icon: UserPlus,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    path: '/beratung/neukunde',
  },
  {
    title: 'Rehasport-Beratung',
    description: 'Spezielle Beratung für Rehasport-Kunden mit Ergänzungsangeboten',
    icon: HeartPulse,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    path: '/beratung/rehasport',
  },
  {
    title: 'Bestandskunden-Upgrade',
    description: 'Bestehende Kunden beraten und Leistungen erweitern',
    icon: TrendingUp,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    path: '/beratung/upgrade',
  },
];

const QUICK_ACTIONS = [
  { title: 'Schnellverkauf', icon: ShoppingBag, path: '/tarif-baukasten', color: 'text-orange-400' },
  { title: 'Kunde suchen', icon: Search, path: '/kunden', color: 'text-cyan-400' },
  { title: 'Gespeicherte Beratungen', icon: History, path: '/beratungsverlauf', color: 'text-purple-400' },
];

export default function Dashboard() {
  const { data: recentConsultations = [] } = useQuery({
    queryKey: ['consultations-recent'],
    queryFn: () => base44.entities.Consultation.list('-created_date', 5),
  });

  const { data: customerCount = [] } = useQuery({
    queryKey: ['customers-count'],
    queryFn: () => base44.entities.Customer.list('-created_date', 100),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Willkommen zurück
          </h1>
          <p className="text-muted-foreground mt-1">
            Starte eine neue Beratung oder verwalte bestehende Kunden
          </p>
        </div>
        <img 
          src="https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/0137b7bb4_AlbGymLogo.png" 
          alt="AlbGym" 
          className="h-10 object-contain hidden md:block"
        />
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {MAIN_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.path} to={action.path}>
              <Card className={`relative overflow-hidden p-6 border ${action.border} ${action.bg} hover:scale-[1.02] transition-all duration-300 cursor-pointer group h-full`}>
                <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 rounded-full opacity-5 bg-current" />
                <div className={`w-14 h-14 rounded-2xl ${action.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-7 h-7 ${action.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${action.color} group-hover:gap-3 transition-all`}>
                  Starten <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quick Actions */}
        <Card className="p-6 bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Schnellzugriff</h3>
          <div className="space-y-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.path} to={action.path}>
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{action.title}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Stats */}
        <Card className="p-6 bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Übersicht</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Kunden</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{customerCount.length}</span>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-muted-foreground">Beratungen</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{recentConsultations.length}</span>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-muted-foreground">Abschlüsse</span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                {recentConsultations.filter(c => c.outcome === 'abschluss').length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-muted-foreground">Testphasen</span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                {recentConsultations.filter(c => c.outcome === 'testphase').length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Consultations */}
      {recentConsultations.length > 0 && (
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Letzte Beratungen</h3>
            <Link to="/beratungsverlauf" className="text-sm text-primary hover:underline">Alle anzeigen</Link>
          </div>
          <div className="space-y-3">
            {recentConsultations.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.customer_name || 'Unbekannt'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{c.consultation_type} · {c.status}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                  c.outcome === 'abschluss' ? 'bg-primary/10 text-primary' : 
                  c.outcome === 'testphase' ? 'bg-blue-400/10 text-blue-400' : 
                  'bg-secondary text-muted-foreground'
                }`}>
                  {c.outcome || c.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}