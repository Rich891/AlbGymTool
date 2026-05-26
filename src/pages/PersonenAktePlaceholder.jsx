// /berater/personen/:id — Skeleton-Page fuer Personenakte (Sprint-1-AP-3).
//
// Loest den bisherigen Toast-Stub in PersonenCockpit ab. Echte Personenakte
// kommt in Sprint 2.

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PersonenAktePlaceholder() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/berater/personen"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurueck zum Personen-Cockpit
        </Link>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Construction className="w-6 h-6 text-amber-500" />
              Personenakte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Die Personenakte folgt in Sprint 2. Dann werden hier Lead-, Beratungs-,
              Reha- und Sync-Status pro Person konsolidiert.
            </p>
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                Customer-ID
              </p>
              <p className="font-mono text-sm text-foreground break-all mt-0.5">
                {id || 'unbekannt'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
