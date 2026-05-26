// /kiosk — Skeleton-Page fuer Kiosk-Modus (Sprint-1-AP-2).
//
// Sprint 1 zeigt nur ein freundliches Willkommen. Der echte Kiosk-Modus folgt
// in MVP 2.

import React from 'react';
import { Sparkles } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export default function KioskPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <Card className="max-w-xl w-full shadow-lg">
        <CardContent className="py-12 text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Willkommen bei AlbGym
            </h1>
            <p className="text-base text-muted-foreground">
              Kiosk-Modus folgt in MVP 2.
            </p>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Hier werden bald Selbstbedienungs-Funktionen fuer Mitglieder bereitstehen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
