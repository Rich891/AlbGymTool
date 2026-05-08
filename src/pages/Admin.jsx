import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { 
  BookOpen, Package, Settings, Target, TrendingUp, 
  FileText, ArrowRight, BarChart3 
} from 'lucide-react';

const ADMIN_SECTIONS = [
  { title: 'Leistungskatalog', description: 'Leistungen anlegen, bearbeiten und verwalten', icon: BookOpen, path: '/leistungskatalog', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { title: 'Tarife', description: 'Tarife und Vertragsmodelle bearbeiten', icon: Package, path: '/tarife', color: 'text-primary', bg: 'bg-primary/10' },
  { title: 'Empfehlungsregeln', description: 'Scoring-Regeln und Prioritäten anpassen', icon: Target, path: '/admin/regeln', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { title: 'Analytics', description: 'Beratungen und Performance auswerten', icon: BarChart3, path: '/analytics', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { title: 'Beratungsverlauf', description: 'Alle Beratungen einsehen', icon: FileText, path: '/beratungsverlauf', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
];

export default function Admin() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Admin-Verwaltung</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ADMIN_SECTIONS.map(section => {
          const Icon = section.icon;
          return (
            <Link key={section.path} to={section.path}>
              <Card className="p-6 bg-card border border-border hover:border-primary/20 transition-all cursor-pointer group h-full">
                <div className={`w-12 h-12 rounded-2xl ${section.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${section.color}`} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
                <div className="mt-3 flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                  Öffnen <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}