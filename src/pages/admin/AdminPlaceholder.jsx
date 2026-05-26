// Generische Skeleton-Page fuer Admin-Bereiche, die noch nicht implementiert sind
// (Sprint-1-AP-6). Verhindert leere/404-Seiten waehrend die Admin-Welt schrittweise
// aufgebaut wird.
//
// Verwendung:
//   <AdminPlaceholder title="Arbeitszeiten" sprint={7}
//     description="Hier werden Schichten und Krankmeldungen verwaltet." />
//
// 'sprint' darf number oder string sein ("spaetere Phase"). Wenn fehlend faellt
// der Subline auf einen generischen Hinweis zurueck.

import React from 'react';
import { Construction } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPlaceholder({ title, sprint, description }) {
  const sprintLabel =
    sprint === undefined || sprint === null
      ? 'einer spaeteren Phase'
      : typeof sprint === 'number'
        ? `Sprint ${sprint}`
        : sprint;

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Construction className="w-6 h-6 text-amber-500" />
            {title || 'In Vorbereitung'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">
            Diese Funktion ist Teil von {sprintLabel}.
          </p>
          {description ? (
            <p className="text-sm text-foreground">{description}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
