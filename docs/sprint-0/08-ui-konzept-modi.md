# AlbGym Nav — UI-Konzept & Modi

Sprint 0 · UI Designer · 2026-05-22
Quellen: `src/index.css`, `tailwind.config.js`, `src/components/ui/*`, `src/pages/PersonenCockpit.jsx`, `src/pages/LeadCockpit.jsx`, `src/pages/HeroPage.jsx`, `src/pages/berater/RehasportAdvisorDashboard.jsx`.

---

## 1. Vier UI-Modi

Ein UI-System mit vier Tönungen. Gleiches Komponenten-Vokabular, aber Layout-Dichte, Farbakzent und Tonalität wechseln pro Welt.

### 1.1 Übersicht

| Modus | Zielnutzer | Tonalität | Information Density | Beispiel-Screens |
|---|---|---|---|---|
| **Management** | Studioleitung, Admin | nüchtern, faktisch, vollständig | hoch — Tabellen, mehrspaltig, KPIs | `/management/uebersicht`, `/management/mitarbeiter`, `/management/sync` |
| **Trainer** | Trainer, Coach | tageszentriert, locker | mittel — große Cards, 1 Hauptfokus pro View | `/trainer/heute`, `/trainer/meine-kunden` |
| **Berater** | Berater, Sales, Empfang | hybrid: Übersicht + Detailtiefe | mittel-hoch — Karten-Grid + Tab-Details | `/berater/personen`, `/berater/leads`, `/berater/heute` (= Vorlage `Dashboard.jsx`) |
| **Kunde** | Kunde im Studio (am Tablet) | motivierend, einladend, ein Schritt | sehr niedrig — 1 Frage / Screen, max 4 Buttons | `/berate-mich/*`, `/rehasport` |

### 1.2 Designentscheidungen pro Modus

**Management Modus**
- Layout: Sidebar (`w-56 lg:w-64`) + Content max-w-1600.
- Default-Ansicht: Tabellen, Charts (shadcn `chart.jsx`), Karten 3-spaltig.
- Aktion-Hierarchie: primärer CTA oben rechts, Filter links/oben, Bulk-Actions in Tabellenkopf.
- Beispiel-Vorbild im Repo: existiert nicht — Neubau in Sprint 1.

**Trainer Modus** (Mobile-First)
- Layout: Bottom-Nav (5 Items) auf Mobile, Sidebar auf Desktop.
- Default-Ansicht: vertikaler Stack großer Karten, ein Fokuselement oben (z.B. "Nächster Termin in 12 Min").
- Aktion-Hierarchie: 1 großer CTA pro Karte, max 1 sekundäre Aktion.
- Beispiel-Vorbild: keine vorhanden — Neubau Sprint 2.

**Berater Modus**
- Layout: Sidebar `w-16 lg:w-56` wie heute (`AdvisorLayout.jsx:42`), funktioniert.
- Default-Ansicht: Karten-Grid 1/2/3-spaltig responsive (Vorbild: `PersonenCockpit.jsx:360`).
- Aktion-Hierarchie: Filter-Chips oberhalb Grid, CTA-Karten-Action am rechten Rand jeder Karte.
- Beispiel-Vorbild: `PersonenCockpit.jsx` (Karten + Filter), `LeadCockpit.jsx` (Pipeline-Statusspalten).

**Kunde Modus**
- Layout: zentriert, vertikal, max-w-2xl, KEINE Sidebar, kein User-Menü.
- Default-Ansicht: 1 Frage pro Screen, 2-4 große Optionsbuttons (min-h-32, große Schrift).
- Aktion-Hierarchie: "Weiter"-Button bottom-sticky, "Zurück" subtil links oben.
- Beispiel-Vorbild: `HeroPage.jsx` (Tile-Stil mit Bildhintergrund) — das ist die Sprache.

---

## 2. Farbrollen

### 2.1 Status quo (`src/index.css:7-79`)

- Theme: dark only (`--background: 220 20% 4%`, foreground 95% Hellgrau).
- `--primary: 135 100% 45%` — sattes Grün (AlbGym).
- `--accent` = `--primary` (kein eigener Akzent).
- Chart-Palette: Grün/Blau/Orange/Lila/Rot.
- Light-Mode-Variablen fehlen praktisch (`.dark` ist identisch mit `:root` — kein Light-Theme aktiv).
- Eigene Modus-Farben **gibt es nicht.**

### 2.2 Vorschlag: Modus-Tinten als Tailwind-Tokens

Erweiterung von `tailwind.config.js:colors` mit CSS-Variablen, NICHT hardcoded. Beispiel-Tokens:

```
// tailwind.config.js (extend.colors)
mgmt: {
  50:  'hsl(var(--mgmt-50))',     // sehr helles Slate (Karten-Hintergrund)
  500: 'hsl(var(--mgmt-500))',    // mittleres Slate-Blau (Akzent)
  900: 'hsl(var(--mgmt-900))',    // tiefes Slate (Sidebar)
},
trainer: {
  50:  'hsl(var(--trainer-50))',  // warmes Amber-50
  500: 'hsl(var(--trainer-500))', // Amber 500 (Akzent CTAs)
  900: 'hsl(var(--trainer-900))', // warmes Anthrazit
},
advisor: {
  // Berater bleibt nahe Primary-Grün
  50:  'hsl(var(--advisor-50))',
  500: 'hsl(var(--primary))',     // identisch mit AlbGym Grün
  900: 'hsl(var(--advisor-900))',
},
customer: {
  50:  'hsl(var(--customer-50))', // helles Mintgrün
  500: 'hsl(var(--customer-500))',// helleres frischeres Grün
  900: 'hsl(var(--customer-900))',// Dunkelgrün
}
```

Konkret-Vorschlag HSL (in CSS-Vars in `src/index.css`):

```
--mgmt-50:    220 20% 96%;
--mgmt-500:   215 35% 50%;     // ruhiges Slate-Blau
--mgmt-900:   220 25% 12%;

--trainer-50:  35 90% 95%;
--trainer-500: 35 90% 55%;     // warmes Amber
--trainer-900: 25 30% 12%;

--advisor-50:  135 60% 92%;
--advisor-500: 135 100% 45%;   // = primary, identisch mit AlbGym Grün
--advisor-900: 145 30% 10%;

--customer-50:  140 70% 96%;
--customer-500: 145 75% 55%;   // helles frisches Grün
--customer-900: 150 35% 10%;
```

AlbGym-Grün **bleibt durchgängiges Marken-Element** (Logo, Bestätigungsstatus, "Erfolgreich"-States) — die Modus-Tinten setzen den Kontext-Akzent.

### 2.3 Status-Farben (fix für alle Modi)

| Token | HSL-Vorschlag | Verwendung |
|---|---|---|
| `--success` | `135 100% 45%` (= primary) | Sync ok, Vertrag abgeschlossen |
| `--warning` | `35 90% 55%` (chart-3) | Daten unvollständig, Trial läuft ab |
| `--error` | `0 72% 51%` (= destructive) | Sync fehler, Pflichtfeld leer |
| `--info` | `200 80% 55%` (chart-2) | Hinweis, Tipp |

### 2.4 Sync-Status-Farben (eigene Skala)

Heute schon in `PersonenCockpit.jsx:69-74` definiert — übernehmen und global hochziehen:

| Status | Token | HSL | Bedeutung |
|---|---|---|---|
| `ready` | sync-green | `145 70% 45%` | bereit / synchronisiert |
| `partial` | sync-amber | `35 90% 55%` | teilweise (Felder fehlen) |
| `blocked` | sync-red | `0 70% 50%` | blockiert (Konflikt) |
| `idle` | sync-gray | `220 10% 50%` | nicht aktiv / unbekannt |
| `syncing` | sync-blue (animiert) | `200 80% 55%` | gerade in Übertragung |

---

## 3. Komponenten-System (Reuse + Neu)

### 3.1 Vorhanden — wiederverwendbar (`src/components/ui/`)

Komplettes shadcn-Set steht bereits zur Verfügung:
`accordion · alert · alert-dialog · avatar · badge · breadcrumb · button · calendar · card · carousel · chart · checkbox · collapsible · command · context-menu · dialog · drawer · dropdown-menu · form · hover-card · input-otp · input · label · menubar · navigation-menu · pagination · popover · progress · radio-group · resizable · scroll-area · select · separator · sheet · sidebar · skeleton · slider · sonner · switch · table · tabs · textarea · toast · toaster · toggle-group · toggle · tooltip`.

Sowie `src/components/shared/`: `GoalIcon · SignaturePad · StepProgress`.

**Keine Neubeschaffung nötig — alle MVP-1-UI-Bausteine sind als shadcn vorhanden.**

### 3.2 Neue Schlüsselkomponenten für AlbGym Nav

| Komponente | Zweck | Modus | Vorbild im Repo |
|---|---|---|---|
| `<RoleLayout mode="management\|trainer\|advisor\|customer">` | Top-Level Layout mit Sidebar/Bottom-Nav/kein-Nav je Modus | alle | `AdvisorLayout.jsx` als Basis |
| `<PersonCard>` | Karte Person mit Status/Sync/Ziel | Berater | **existiert** in `PersonenCockpit.jsx:483-616` — bewerten + extrahieren |
| `<NextActionBox>` | "Nächste Aktion"-Block mit Termin | Berater/Trainer | **existiert** in `PersonenCockpit.jsx:517-530` — extrahieren |
| `<SyncBadgeGroup>` | Sync-Status-Badges Gruppe | Berater/Management | **existiert** in `PersonenCockpit.jsx:560-575` — extrahieren |
| `<DataQualityBar>` | Progress + fehlende Felder | Berater/Management | **existiert** in `PersonenCockpit.jsx:532-548` — extrahieren |
| `<ConsultStepCard>` | Großer visueller Kundenflow-Block | Kunde | `HeroPage.jsx:81-124` (Tile-Sprache) |
| `<TrainerTodayCard>` | Tageskarte Trainer | Trainer | — Neubau Sprint 2 |
| `<MgmtKpiCard>` | KPI-Kachel Studioleitung | Management | — Neubau Sprint 1 |
| `<RoleSwitchHeader>` | Header mit Welt-Indikator (für Cross-World-Visits) | alle | — Neubau Sprint 1 |
| `<PersonenAkteTabs>` | Tab-Container für `/berater/personen/:id` | Berater | shadcn `tabs.jsx` Basis, Wrapper neu (Sprint 5) |

### 3.3 Bewertung `PersonCard` (PersonenCockpit.jsx:483-616)

Pluspunkte:
- Karten-Hierarchie (Avatar/Name/Status → Nächste Aktion → Datenqualität → Badges → Ziel) ist sauber.
- Status-Farben passen zum geplanten Tokenset.
- Tooltips für Sync-Badges (`PersonenCockpit.jsx:560-575`) — Bedienlogik gut.

Schwachpunkte:
- Inline-Definition aller Style-Maps (`PROFILE_STATUS_BADGE_CLASS:47-55`, `SYNC_BADGE_COLOR_CLASS:69-74`) — sollte zentralisiert.
- Karte ist 5 Sektionen tief — am Limit. Mehr Felder darf nicht rein (Density-Regel §4).
- Komponente ist embedded — nicht wiederverwendbar in `/berater/heute` oder Personenakte ohne Refactor.

Empfehlung Sprint 1: `<PersonCard>` extrahieren in `src/components/persons/PersonCard.jsx`, Style-Maps in `src/lib/personDisplay.js` zentralisieren.

---

## 4. Information Density Guidelines

Max-Limits pro Modus, hart einzuhalten:

| Limit | Management | Trainer | Berater | Kunde |
|---|:-:|:-:|:-:|:-:|
| Sidebar-Items | 10 | 5 (Bottom-Nav 5) | 6 | 0 |
| Felder pro Detail-View | unbegrenzt (Tabs!) | 6 | 12 | 1 Frage |
| Badges pro Karte | 6 | 3 | 6 | 0 |
| Tabs auf Page | 6 (mit Scroll) | 0 (kein Tab-Pattern auf Mobile) | 4 | 0 |
| Filter-Chips | 8 | 0 (Suchfeld reicht) | 5 | 0 |
| KPIs in Übersicht | 8 (Grid 4×2) | 3 (vertikaler Stack) | 4 | 0 |
| CTAs sichtbar gleichzeitig | 5 | 1 primär + 1 sekundär | 3 | 1 |

**Beispiel-Check Personen-Cockpit heute (`PersonenCockpit.jsx:550-578`):**
- 4 Kontext-Badges + 6 Sync-Badges max = 10 Badges → **überschreitet Berater-Limit 6**. Bereits im Code begrenzt (`Math.max(0, 6 - contextBadges.length)`:497) — auf max 6 gesamt. Passt.

---

## 5. Sprache & Microcopy

### 5.1 Grundton: Deutsch, Sie nicht, Du implizit

Heute schon im Stil ("Willkommen zurück", "Personen-Cockpit"). Bleibt.

### 5.2 Pro Modus

| Modus | Ton | Beispiel-Phrasen |
|---|---|---|
| Management | nüchtern, präzise, Substantiv-lastig | "12 Konflikte offen" · "Sync ThemiSoft fehlgeschlagen" · "Mitarbeiter inaktiv seit 14 Tagen" |
| Trainer | locker, kurz, aktiv | "Dein nächster Termin: 09:00 Müller" · "3 Aufgaben heute" · "Krank? Hier melden." |
| Berater | faktisch, aktivierend | "Lead qualifizieren" · "Rezept prüfen" · "Termin vorschlagen" |
| Kunde | motivierend, einladend | "Was möchtest du erreichen?" · "Wir finden den richtigen Weg." · "Bereit für den nächsten Schritt?" |

### 5.3 Microcopy-Konventionen

- Buttons: imperativ kurz ("Speichern", "Termin anlegen", "Rezept aufnehmen") — nicht "Klicken Sie hier".
- Empty-States: 1 Satz + CTA. Beispiel `PersonenCockpit.jsx`: existiert (Komponente `EmptyState`) — Stil übernehmen.
- Fehler-Toasts: Was fehlt + Was tun (`toast.error('Person hat keine ID.')` ist zu knapp — sollte sagen "ID fehlt — Person konnte nicht geöffnet werden").

---

## 6. Mobile vs. Desktop

| Modus | Primärgerät | Begründung | Sprint-Priorität responsive |
|---|---|---|---|
| Trainer | Mobile (Hochkant) | Tool im Studio am Handy in der Tasche | Sprint 2 (mobile-first ab Start!) |
| Berater | Desktop / Tablet quer | Beratungsgespräch an Tisch + Bildschirm/Tablet | Desktop-first, Tablet-quer ok |
| Management | Desktop | Tabellen, KPIs, Mehrspalten | Desktop-first; Mobile = read-only Notfall-Sicht |
| Kunde | Tablet (quer) im Studio + optional Mobile vorher zuhause | Im Studio gezeigt am Tablet | Tablet-first, Mobile-tauglich (HeroPage zeigt Pfad) |

**Konsequenzen Sprint-Plan:**
- Trainer-Layout = mobile-first (Bottom-Nav). Desktop = "großer Mobile".
- Berater bleibt aktuelles Layout (`AdvisorLayout.jsx` skaliert von `w-16` auf `w-56` ab `lg:`).
- Management braucht eigenes Desktop-Layout mit breiterer Sidebar + ggf. Resizable-Panels (shadcn `resizable.jsx` vorhanden).
- Kunde: Touch-Targets min 48px, Schriftgröße ab `text-xl`, vertikale Buttons stapeln.

---

## 7. Accessibility-Mindeststandard

### 7.1 Status quo

- shadcn-Basis bringt Radix-Primitives (semantisch ok).
- Kontrast: Dark-Theme mit `foreground 0 0% 95%` auf `background 220 20% 4%` — Kontrast deutlich > 7:1 (WCAG AAA).
- Schwachstellen heute:
  - `muted-foreground 220 10% 50%` auf Card-Background — ~4.2:1, nur AA (knapp). Wird bei kleinen Schriften (`text-xs`) eng. Beispiel `PersonenCockpit.jsx:543` (`text-[11px]`) — kritisch.
  - Keyboard-Nav: Tab-Reihenfolge in `PersonenCockpit` Karten nicht geprüft (Karte ist `<Card>`-div, klickbarer Bereich unklar).
  - Screen-Reader-Hints: keine `aria-label`-Inventur durchgeführt.
  - Focus-Ring nutzt `--ring` (= primary) — gut sichtbar, ok.

### 7.2 Mindeststandard ab Sprint 1

- **WCAG 2.1 AA** für alle MVP-Pages.
- Tastatur-Navigation: jede Karte/jeder Button focusable + `Enter`/`Space` triggert primary action.
- Screen-Reader: jede Statusbadge mit `aria-label` (z.B. "Sync ThemiSoft: blockiert — fehlende Krankenkasse").
- Kontrast `text-[11px]` und kleiner → größere Schrift (mindestens `text-xs` = 12px) ODER stärkerer Kontrast.
- Touch-Targets im Trainer- und Kunden-Modus min 48×48px.
- Reduced-Motion: framer-motion (heute in `HeroPage`, `Admin`, `LeadCockpit`) respektiert `prefers-reduced-motion`? — Audit Sprint 1.

---

## 8. UI-Sprint-Plan Vorschau

Pro Sprint maximaler Output je Mode-Layer. Konkrete Listen:

| Sprint | Lieferungen UI | Begründung |
|---|---|---|
| **Sprint 1** | `<RoleLayout>` (mgmt/advisor/trainer/customer Varianten) · `/management/uebersicht` Skelett · Post-Login-Routing · Modus-Tokens in `index.css` + `tailwind.config.js` · `<PersonCard>` extrahieren | Fundament: ohne Layouts kein zweites Modul baubar. |
| **Sprint 2** | `<TrainerLayout>` (Mobile-Bottom-Nav) · `/trainer/heute` · `/trainer/meine-kunden` · `<TrainerTodayCard>` · Touch-Target-Audit | Trainer hat heute null UI — schnell sichtbarer Mehrwert für Studio. |
| **Sprint 3** | `/management/mitarbeiter` · `/management/sync` · `<MgmtKpiCard>` · `<SyncBadgeGroup>` global · Tabellen-Pattern Management | Management-Welt füllen, Sync-Sichtbarkeit dringend für Owner. |
| **Sprint 4** | `/berater/heute` (Dashboard.jsx recyceln) · `<NextActionBox>` extrahieren · Berater-Sidebar bereinigen (Admin-Items entfernen) | Berater bekommt eigenes Heute, Sidebar-Konflikt gelöst. |
| **Sprint 5** | `/berater/personen/:id` (Personenakte mit Tabs) · `<PersonenAkteTabs>` · Reha-Tab als Drawer integriert (`/berater/rezepte` deprecaten) | Detail-Ebene komplett, Charter §54 endgültig erfüllt. |
| **Sprint 6** | Kunden-Modus Refresh (`/berate-mich/*`) · `<ConsultStepCard>` · Accessibility-Sweep · Tablet-Test im Studio | Kundensicht polishen, Studio-Praxistest. |

---
