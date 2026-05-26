# Sprint 1 — Scope: Rollenmodell + rollenbasierte Navigation

**Sprint:** 1
**Eigentümer:** Projektleiter (delegiert an Frontend Agent + Software Architect)
**Dauer-Schätzung:** 1 Implementierungs-Sprint (~5-7 Arbeitstage)
**Status:** ✅ Freigegeben durch Studio-Owner-Antworten zu B-01/B-02/B-03 (siehe `../sprint-0/12-entscheidungsfragen.md`).

---

## Sprint-Ziel (1 Satz)

**Zwei Welten als getrennte Layouts mit Route-Guards, drei Default-Landings, eine neue Composite-Page `/berater/heute` — keine Fachlogik, keine UI-Komplett-Neugestaltung.**

---

## Bestätigte Architekturentscheidungen (aus Sprint 0.5)

### 3-Rollen-Modell

```
┌─────────────────────────────────────────────────┐
│  Admin / Studioleiter                           │
│  → sieht ALLES (Admin-Welt + Mitarbeiter-Welt)  │
│  → kann andere User zu Admin promoten           │
├─────────────────────────────────────────────────┤
│  Mitarbeiter (= Trainer = Berater = Service =   │
│              Empfang = Reha-Mitarbeiter)        │
│  → eine Rolle, intern via Capabilities          │
│  → Capability-System kommt in Sprint 5          │
│  → in Sprint 1: alle sehen alles                │
├─────────────────────────────────────────────────┤
│  Kunde / Mitglied                               │
│  → Kiosk-Modus, MVP-2                           │
│  → Sprint 1: nur Skeleton-Layout                │
└─────────────────────────────────────────────────┘
```

### 2 aktive Welten in Sprint 1 + 1 Kiosk-Skeleton

| Welt | URL-Prefix | Rollen mit Zugriff | Inhalt Sprint 1 |
|---|---|---|---|
| Admin | `/admin/*` | admin | Management-Items (Sidebar-Skeleton) |
| Mitarbeiter | `/berater/*` | admin, mitarbeiter | Existing pages + neue `/berater/heute` |
| Kiosk | `/kiosk/*` | kunde (later), unauth | Skeleton |

**Welt-Switcher im Header** für Admin (zwischen "Studio-Steuerung" und "Beratung").

### Default-Landings

| Rolle | URL |
|---|---|
| admin | `/admin/dashboard` |
| mitarbeiter | `/berater/heute` |
| kunde / unauth | `/kiosk` oder `/login` |

---

## Was Sprint 1 NICHT tut (No-Go)

- Keine Personenakte bauen.
- Kein Reha-Flow-Umbau.
- Kein Sync-Button.
- Keine Capability-Logik (kommt Sprint 5).
- Keine Datenmodell-Migration (`Customer.training_*` bleibt unangetastet).
- Keine Employee-Entity (kommt Sprint 5).
- Keine UI-Komplett-Neugestaltung.
- **Keine bestehenden funktionierenden Pages löschen.**
- **Keine Umbenennung `/berater/*` → `/mitarbeiter/*`** (Route-Migration kommt in Sprint 2+; Prefix bleibt aus Pragmatismus).

---

## Sprint-1-Fragen — was Sprint 1 beantwortet

1. Wer ist eingeloggt?
2. Ist der User Admin oder Mitarbeiter?
3. Welche Routen darf er öffnen?
4. Welches Layout bekommt er?
5. Welche Navigation sieht er?
6. Wo landet er nach dem Login?

---

## Arbeitspakete

### AP-1: Rollen-Modell

**Ziel:** Saubere Definition der 3 Rollen im Code als Single Source of Truth.

**Tasks:**

1. **`src/lib/roleModel.js`** (neu) — Single Source of Truth:
   ```javascript
   export const ROLES = {
     ADMIN: 'admin',           // = Studioleiter, kann andere promoten
     MITARBEITER: 'mitarbeiter', // = Trainer/Berater/Service/Empfang/Reha
     KUNDE: 'kunde',           // = Mitglied, MVP-2
   };

   export const ROLE_LABELS = {
     admin: 'Studioleiter',
     mitarbeiter: 'Mitarbeiter',
     kunde: 'Mitglied',
   };

   export const WORLDS = {
     ADMIN: 'admin',
     BERATER: 'berater', // Mitarbeiter-Welt, Prefix bleibt /berater/*
     KIOSK: 'kiosk',
   };

   // Welche Welt darf welche Rolle aufrufen?
   export const WORLD_ACCESS = {
     admin: ['admin', 'berater', 'kiosk'],
     mitarbeiter: ['berater', 'kiosk'],
     kunde: ['kiosk'],
   };

   export const DEFAULT_LANDING = {
     admin: '/admin/dashboard',
     mitarbeiter: '/berater/heute',
     kunde: '/kiosk',
   };

   export function resolveUserRole(user) {
     // Map Base44 user.role / role_keys auf ROLES.
     // Backward-compat: bestehende 'admin'-Keys bleiben 'admin'.
     // 'advisor'/'trainer'/'coach'/'service'/'sales' → 'mitarbeiter'.
     // Default: 'kunde' (sicherster Fallback).
   }

   export function userCanAccessWorld(user, world) {
     const role = resolveUserRole(user);
     return WORLD_ACCESS[role]?.includes(world) ?? false;
   }

   export function defaultLandingFor(user) {
     return DEFAULT_LANDING[resolveUserRole(user)] ?? '/login';
   }
   ```

2. **`src/lib/advisorAccess.js`** (refactor) — Bestehende `getAdvisorRoleKey`-Funktion wird zum Wrapper:
   ```javascript
   import { resolveUserRole } from './roleModel';
   export function isAdvisor(user) {
     const role = resolveUserRole(user);
     return role === 'admin' || role === 'mitarbeiter';
   }
   export function isAdmin(user) {
     return resolveUserRole(user) === 'admin';
   }
   ```
   Bestehende Caller dürfen nicht brechen.

3. **Zombie-Keys entfernen:** `coach`, `service`, `sales` aus altem Code aussortieren — bestehende User mit diesen Keys werden auf `mitarbeiter` gemappt.

**Akzeptanz:**
- `roleModel.js` exportiert die 3 Rollen + 3 Welten + WORLD_ACCESS.
- Existierende Pages, die `getAdvisorRoleKey`/`isAdvisor` nutzen, funktionieren weiter.
- `npm run build` grün.

---

### AP-2: Layouts trennen

**Ziel:** Zwei Layout-Komponenten + 1 Kiosk-Skeleton.

**Tasks:**

1. **`src/components/layout/AdminLayout.jsx`** (neu)
   - Sidebar mit Admin-Navigation (siehe AP-5).
   - Welt-Header: "Studio-Steuerung" + Studioname.
   - Welt-Switcher-Button (Mitarbeiter-Welt) wenn User admin ist.
   - Farbe: neutrales Dunkelblau-Grau (Vorschlag aus `08-ui-konzept-modi.md`).

2. **`src/components/layout/AdvisorLayout.jsx`** (existiert — Cleanup)
   - Bestehende Nav-Items entrümpeln: **Admin, Regeln, Analytics, Tarife, Krankenkassen raus** (gehören in AdminLayout).
   - Verbleibende Items: Heute (neu), Personen, Leads, Rezeptaufnahme, Beratung starten, Verlauf.
   - Welt-Header: "Beratung & Mitarbeiter".
   - Welt-Switcher-Button (Admin-Welt) wenn User admin ist.
   - Farbe: Markengrün bleibt.

3. **`src/components/layout/CustomerKioskLayout.jsx`** (Skeleton)
   - Kein Sidebar, full-screen.
   - Optional minimaler Header (Logo + Exit-Button).
   - Outlet für Kiosk-Routes.
   - Sprint 1 zeigt nur Placeholder "Kiosk folgt in MVP 2".

4. **Header-Welt-Switcher-Komponente** (neu, gemeinsam)
   - `src/components/layout/WorldSwitcher.jsx` — Button-Group mit aktueller Welt + Klick auf andere Welt → navigate.
   - Erscheint nur bei `isAdmin(user)`.
   - Erscheint NICHT für reine Mitarbeiter.

**Akzeptanz:**
- 3 Layout-Files vorhanden.
- AdvisorLayout enthält keine Admin-Items mehr.
- WorldSwitcher rendert nur für Admin.
- Visuelle Welt-Identität pro Layout erkennbar (eigene Farbe + Welt-Header).
- `npm run build` grün.

---

### AP-3: Route Guards

**Ziel:** `<ProtectedWorldRoute>` schützt jede Welt vor unberechtigtem Zugriff.

**Tasks:**

1. **`src/components/auth/ProtectedWorldRoute.jsx`** (neu)
   ```jsx
   import { Navigate } from 'react-router-dom';
   import { useAuth } from '@/lib/AuthContext';
   import { userCanAccessWorld, defaultLandingFor } from '@/lib/roleModel';

   export function ProtectedWorldRoute({ world, children }) {
     const { user, isLoading } = useAuth();
     if (isLoading) return null;
     if (!user) return <Navigate to="/login" replace />;
     if (!userCanAccessWorld(user, world)) {
       return <Navigate to={defaultLandingFor(user)} replace />;
     }
     return children;
   }
   ```

2. **`src/App.jsx`** (refactor — additiv) — neue Route-Bäume:
   ```jsx
   {/* Admin-Welt: nur admin */}
   <Route element={<ProtectedWorldRoute world="admin"><AdminLayout /></ProtectedWorldRoute>}>
     <Route path="/admin/dashboard" element={<AdminDashboard />} />
     <Route path="/admin/mitarbeiter" element={<AdminMitarbeiterPlaceholder />} />
     <Route path="/admin/tarife" element={<TariffBuilder />} />        {/* existing */}
     <Route path="/admin/regeln" element={<RulesAdmin />} />            {/* existing */}
     <Route path="/admin/krankenkassen" element={<InsuranceManager />} /> {/* existing, move from /berater */}
     <Route path="/admin/analytics" element={<Analytics />} />          {/* existing */}
     <Route path="/admin/sync" element={<AdminSyncPlaceholder />} />
   </Route>

   {/* Mitarbeiter-Welt: admin + mitarbeiter */}
   <Route element={<ProtectedWorldRoute world="berater"><AdvisorLayout /></ProtectedWorldRoute>}>
     <Route path="/berater/heute" element={<BeraterHeute />} />        {/* NEU */}
     <Route path="/berater/personen" element={<PersonenCockpit />} />  {/* existing */}
     <Route path="/berater/personen/:id" element={<PersonenAktePlaceholder />} />
     <Route path="/berater/leads" element={<LeadCockpit />} />         {/* existing */}
     <Route path="/berater/rezepte" element={<PrescriptionIntake />} /> {/* existing */}
     <Route path="/berater/beratung" element={<ConsultationFlow />} /> {/* existing */}
     <Route path="/berater/verlauf" element={<ConsultationHistory />} />
   </Route>

   {/* Kiosk: anonym OK */}
   <Route element={<CustomerKioskLayout />}>
     <Route path="/kiosk" element={<KioskPlaceholder />} />
   </Route>

   {/* Root-Redirect: nach User-Rolle */}
   <Route path="/" element={<RootRedirect />} />
   ```

3. **Backward-Compatibility:** Alte Routes (`/beratung/*`, `/rehasport/*`, etc.) bleiben unverändert — sie sind heute eh nicht role-guarded.

**Akzeptanz:**
- Mitarbeiter kann `/admin/*` nicht aufrufen — redirect auf `/berater/heute`.
- Anonymer User kann nur `/login`, `/kiosk`, und öffentliche Pages.
- Admin kann beide Welten aufrufen.
- Existierende Routes funktionieren weiter (nur unter neuem Layout-Wrapper).

---

### AP-4: Default Landing & Root-Redirect

**Ziel:** Login leitet auf die korrekte Welt um.

**Tasks:**

1. **`src/pages/RootRedirect.jsx`** (neu) — kleine Komponente:
   ```jsx
   export default function RootRedirect() {
     const { user, isLoading } = useAuth();
     if (isLoading) return <LoadingScreen />;
     if (!user) return <Navigate to="/login" replace />;
     return <Navigate to={defaultLandingFor(user)} replace />;
   }
   ```

2. **`src/pages/berater/AdvisorLogin.jsx`** — nach erfolgreichem Login: `navigate(defaultLandingFor(user))`. Aktuell vermutlich hardcoded — ersetzen.

3. **`App.jsx`** — `<Route path="/" element={<RootRedirect />} />` als erste Route nach Login.

**Akzeptanz:**
- Login als Admin → `/admin/dashboard`.
- Login als Mitarbeiter → `/berater/heute`.
- Niemand landet mehr auf `RehasportAdvisorDashboard` als Default.
- Anonymer User auf `/` → `/login`.

---

### AP-5: `/berater/heute` Composite Page (NEUE Page)

**Ziel:** Tagesfokussierte Mitarbeiter-Startseite. Skeleton in Sprint 1, Vollausbau in späteren Sprints.

**Tasks:**

1. **`src/pages/berater/BeraterHeute.jsx`** (neu)
   - 4-Kachel-Layout (responsive):
     - **Termine heute** (aus `Appointment.list` mit Filter `today`)
     - **Fällige Follow-ups** (aus `FollowUpTask.list` mit Filter `due_today` + `overdue`)
     - **Neue Leads** (aus `Lead.list` sortiert `-created_date`, limit 5)
     - **Schnellaktionen** (Buttons: "Neue Beratung", "Rezept scannen", "Person suchen")
   - Datenquelle: alle via `safeListEntity` aus `entityGateway.js`.
   - Skeleton-Loader und Empty-States pro Kachel.
   - Loading-States parallel (React Query).

2. **`src/components/advisor/TodaySectionCard.jsx`** (neu) — generische Kachel mit Titel, Count, Items-Liste, Link.

3. **`src/lib/heuteAggregation.js`** (neu, leichtgewichtig) — pure functions:
   - `filterAppointmentsToday(appointments)`
   - `filterFollowUpsDue(followUps, now)`
   - `groupNewLeads(leads, limit)`

**Akzeptanz:**
- `/berater/heute` lädt 4 Kacheln parallel.
- Bei fehlenden optional-Entities: graceful fallback (z.B. "Keine Termine heute").
- Mobile-responsive (4 Kacheln stapeln auf sm).
- Klick auf eine Lead/Follow-up navigiert zur passenden Detail-/List-View.
- `npm run build` grün.

---

### AP-6: Admin-Sidebar (Skeleton)

**Ziel:** Sidebar der Admin-Welt. Skeleton-Pages für Items die noch nicht existieren.

#### Admin-Sidebar in Sprint 1

```
/admin
  /dashboard         (NEU — Skeleton: "Studio-Übersicht folgt")
  /mitarbeiter       (NEU — Skeleton: "Mitarbeiterverwaltung folgt in Sprint 5")
  /arbeitszeiten     (NEU — Skeleton: "kommt später")
  /kurse             (NEU — Skeleton)
  /leistungen        (NEU — Skeleton)
  /tarife            ← existing TariffBuilder
  /krankenkassen     ← existing InsuranceManager (Move von /berater)
  /regeln            ← existing RulesAdmin
  /analytics         ← existing Analytics.jsx
  /sync              (NEU — Skeleton: "Sync-Verwaltung folgt in Sprint 6")
```

**Tasks:**

1. `src/pages/admin/AdminDashboard.jsx` — Skeleton-Page mit Headline + Sprint-Hinweis + Quicklinks zu existierenden Admin-Tools.
2. `src/pages/admin/AdminPlaceholder.jsx` — generische Placeholder-Component (params: `title`, `sprint`).
3. AdminLayout-Sidebar listet die 10 Items.

**Akzeptanz:**
- Admin-Sidebar zeigt alle 10 Items.
- Klick auf Skeleton-Pages zeigt "kommt in Sprint X"-Hinweis (kein 404).
- Klick auf Tarife/Krankenkassen/Regeln/Analytics führt zu existierender Page (rendered in AdminLayout).

---

### AP-7: Berater-Sidebar Cleanup

**Ziel:** Aus AdvisorLayout Admin-Items entfernen.

**Berater-Sidebar in Sprint 1**

```
/berater
  /heute             ← NEU (AP-5)
  /personen          ← existing PersonenCockpit
  /leads             ← existing LeadCockpit
  /rezepte           ← existing PrescriptionIntake
  /beratung          ← existing ConsultationFlow als Start
  /verlauf           ← existing ConsultationHistory
```

**Entfernt aus Berater-Sidebar** (jetzt unter `/admin/*`):
- Tarife
- Regeln
- Analytics
- Krankenkassen
- Admin

**Tasks:**

1. `src/components/layout/AdvisorLayout.jsx` — NAV-Array trimmen.
2. Klick-Verhalten testen: `/berater/regeln` (old URL) sollte zu `/admin/regeln` redirecten (oder 404 — Owner-Entscheidung).

**Akzeptanz:**
- Mitarbeiter sieht in Sidebar **nur** die 6 Berater-Items.
- Klick auf alte Bookmarks zu `/berater/tarife` etc.: Sprint 1 Verhalten = 404 mit Redirect-Hinweis (Lightweight). Sprint 2 kann Redirects einbauen.

---

## Risiken

| ID | Risiko | Schweregrad | Mitigation |
|---|---|---|---|
| R1 | Bestehende Bookmarks auf `/berater/tarife` etc. brechen | Mittel | Optional in Sprint 1: einfache Redirect-Routes. Sonst 404 mit Hinweis. |
| R2 | Base44 User-Records haben falsche/alte Role-Keys (`coach`/`service`/`sales`) | Mittel | `resolveUserRole` mappt alle alten Keys auf `mitarbeiter` (Backward-compat) |
| R3 | Admin-Welt zeigt leere Pages (Skeleton) → wirkt unfertig | Niedrig | Klare Sprint-Hinweise auf jeder Skeleton-Page |
| R4 | `/berater/heute` zeigt leere Kacheln wenn keine Daten | Niedrig | Empty-States mit "Heute keine Termine"-Texten |
| R5 | Welt-Switcher verwirrt Mitarbeiter (sie sehen ihn nicht — Admin schon) | Niedrig | Switcher conditional rendern auf `isAdmin(user)` |
| R6 | Layout-Refactoring bricht aktuelle ConsultationFlow-Wrapper | Mittel | Existing pages bleiben unverändert; Layouts wickeln nur drumherum |
| R7 | Heute-Page lädt 4+ Entities = Performance bei vielen Records | Niedrig | Limits (5-10 pro Kachel), Sortier-Hints |

---

## Definition of Done (Sprint 1)

- [ ] `roleModel.js` mit 3 Rollen + 3 Welten + WORLD_ACCESS + DEFAULT_LANDING existiert
- [ ] `<ProtectedWorldRoute>` schützt Welten korrekt
- [ ] Default-Landing pro Rolle funktioniert
- [ ] 3 Layouts existieren (Admin, Advisor refactored, Kiosk Skeleton)
- [ ] `WorldSwitcher` rendert nur für Admin
- [ ] Berater-Sidebar enthält keine Admin-Items mehr
- [ ] `/berater/heute` als neue Composite-Page mit 4 Kacheln vorhanden
- [ ] Admin-Sidebar zeigt 10 Items, davon 4 existing + 6 Skeletons
- [ ] `RehasportAdvisorDashboard` ist nicht mehr Default-Landing
- [ ] Alte Role-Keys (`coach`/`service`/`sales`) werden auf `mitarbeiter` gemappt
- [ ] `npm run build` grün
- [ ] Regression Smoke Test:
  - [ ] Rezeptscan funktioniert weiter (`/berater/rezepte`)
  - [ ] ConsultationFlow funktioniert weiter (`/berater/beratung`)
  - [ ] PersonenCockpit funktioniert weiter (`/berater/personen`)
  - [ ] LeadCockpit funktioniert weiter (`/berater/leads`)
  - [ ] Login-Flow funktioniert (Admin → /admin/dashboard, Mitarbeiter → /berater/heute)

---

## Parallele Tracks während Sprint 1

Diese Tracks laufen **ohne Code-Änderung** parallel zu Sprint 1:

- **Track A (UX)**: Admin/Mitarbeiter-Navigation finalisieren als Wireframes; Kiosk-Mockup für MVP-2 vorbereiten
- **Track B (Data)**: Employee-Entity final definieren (B-04), Capability-Liste schärfen (B-14), Krankmeldung entscheiden (B-06), Customer/GoalProfile-Konsolidierung vorbereiten (B-13)
- **Track C (Integration)**: ThemiSoft-Fragenliste (B-07), myYolo-Credential-Status (B-08), SimplyBook/Meta/Superchat-Mapping
- **Track D (QA)**: Smoke-Test-Skripte pro Rolle, Regression-Test-Plan, Route-Guard-Test-Plan

Output dieser Tracks: weitere Sprint-Doku unter `docs/sprint-1/parallel-tracks/`.

---

## Nach Sprint 1

Bei erfolgreicher Sprint-1-Abnahme:

- Sprint 2 startet: **Personenakte Detail** (`/berater/personen/:id`).
- Sprint 5 kann teilweise parallel laufen: **Admin-Grundstruktur** + **Capability-System** + **Employee-Entity**.

Nicht direkt nach Sprint 1:

- Sprint 3 (Reha in Personenakte) wartet auf Sprint 2.
- Sprint 6 (Sync-UI) wartet auf B-07/B-08.
- Sprint 7 (vollausgebautes Trainer-Modul mit Aufgaben/Schichten/Krankmeldung) wartet auf B-04/B-06.
