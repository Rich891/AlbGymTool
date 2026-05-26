// Generische Kachel-Komponente fuer /berater/heute (Sprint-1-AP-5).
//
// Default-defensive: jede Prop ist optional, sinnvolle Fallbacks.
// - Header: Icon + Titel + Count-Badge
// - Body: Loading-Skeleton, Empty-State oder bis zu 5 Items
// - Footer: optional Link mit "linkText →"
//
// Wird von BeraterHeute.jsx fuer alle 4 Tageskacheln konsumiert.

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Akzent-Variants steuern Farbe von Icon-Hintergrund und Count-Badge.
// Sprint 1: nur visuell, keine Fachlogik (z.B. "urgent" = rote Folie wenn
// ueberfaellige Tasks vorhanden sind).
const ACCENT_CLASSES = {
  default: {
    iconWrap: 'bg-primary/10 text-primary',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  urgent: {
    iconWrap: 'bg-rose-500/10 text-rose-600',
    badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  },
  success: {
    iconWrap: 'bg-emerald-500/10 text-emerald-600',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  info: {
    iconWrap: 'bg-sky-500/10 text-sky-600',
    badge: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  },
};

const MAX_VISIBLE_ITEMS = 5;

function defaultRenderItem(item, idx) {
  // Letzter Fallback wenn kein renderItem geliefert wird:
  // Versuche eine sinnvolle Beschriftung aus dem Item zu lesen.
  const label =
    item?.title ||
    item?.label ||
    item?.name ||
    item?.reason ||
    item?.notes ||
    item?.status ||
    'Eintrag';
  return (
    <div key={item?.id ?? idx} className="text-sm text-foreground py-1 truncate">
      {label}
    </div>
  );
}

export default function TodaySectionCard({
  title,
  count,
  icon: Icon,
  items,
  renderItem,
  emptyText = 'Nichts zu tun.',
  linkText,
  linkTo,
  accent = 'default',
  isLoading = false,
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const numericCount = Number.isFinite(count) ? count : safeItems.length;
  const accentClasses = ACCENT_CLASSES[accent] || ACCENT_CLASSES.default;
  const visibleItems = safeItems.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = Math.max(0, safeItems.length - visibleItems.length);
  const renderer = typeof renderItem === 'function' ? renderItem : defaultRenderItem;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {Icon ? (
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${accentClasses.iconWrap}`}
            >
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
          <span>{title || 'Heute'}</span>
        </CardTitle>
        {!isLoading && (
          <Badge
            variant="outline"
            className={`text-xs font-bold ${accentClasses.badge}`}
            aria-label={`${numericCount} Eintraege`}
          >
            {numericCount}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-1">
        {isLoading ? (
          <div className="space-y-2 py-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        ) : visibleItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">{emptyText}</p>
        ) : (
          <div className="divide-y divide-border/60">
            {visibleItems.map((item, idx) => (
              <div key={item?.id ?? idx}>{renderer(item, idx)}</div>
            ))}
            {hiddenCount > 0 && (
              <div className="pt-2 text-xs text-muted-foreground">
                +{hiddenCount} weitere
              </div>
            )}
          </div>
        )}

        {linkTo && linkText && (
          <div className="mt-auto pt-3">
            <Link
              to={linkTo}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {linkText}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
