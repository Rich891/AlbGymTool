// Admin-Dashboard — Skeleton mit Quicklinks (Sprint-1-AP-6).
//
// Sprint 1 zeigt nur die Studio-Steuerzentrale als Startseite an, ohne echte
// KPIs. Quicklinks fuehren auf bereits existierende Admin-Tools (Tarife,
// Krankenkassen, Regeln, Analytics) sowie auf neue Skeletons.
//
// Vollausbau ("Studio-Uebersicht") folgt in Sprint 5.

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Heart,
  Settings2,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const QUICKLINKS = [
  {
    title: 'Tarife',
    description: 'Tarife konfigurieren und Bausteine pflegen.',
    icon: CreditCard,
    to: '/admin/tarife',
    accent: 'text-primary bg-primary/10',
  },
  {
    title: 'Krankenkassen',
    description: 'Stammdaten und Zuschuesse der Krankenkassen.',
    icon: Heart,
    to: '/admin/krankenkassen',
    accent: 'text-rose-600 bg-rose-500/10',
  },
  {
    title: 'Regeln',
    description: 'Empfehlungs- und Pricing-Regeln pflegen.',
    icon: Settings2,
    to: '/admin/regeln',
    accent: 'text-amber-600 bg-amber-500/10',
  },
  {
    title: 'Analytics',
    description: 'Konversionen, Quoten und Beraterleistung.',
    icon: BarChart3,
    to: '/admin/analytics',
    accent: 'text-sky-600 bg-sky-500/10',
  },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Studio-Steuerzentrale</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Uebersicht folgt in Sprint 5. Bis dahin direkt zu den verfuegbaren Tools.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICKLINKS.map(({ title, description, icon: Icon, to, accent }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/40">
              <CardHeader className="pb-2">
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{title}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
