# Sprint 1 — Scope: Rollenmodell + rollenbasierte Navigation

**Sprint:** 1
**Eigentümer:** Projektleiter (delegiert an Frontend Agent + Software Architect)
**Dauer-Schätzung:** 1 Implementierungs-Sprint (~5-7 Arbeitstage)
**Status:** Vorbereitet. Freigabe ausstehend (siehe `docs/sprint-0/12-entscheidungsfragen.md` — Blocker B-01, B-02, B-03 müssen entschieden sein).

---

## Sprint-Ziel (1 Satz)

**Vier Welten als getrennte Layouts mit Route-Guards, vier Default-Landings — keine Fachlogik, keine UI-Komplett-Neugestaltung.**

---

## Was Sprint 1 NICHT tut (No-Go für diesen Sprint)

- Keine Personenakte bauen.
- Kein Reha-Flow-Umbau.
- Kein Sync-Button.
- Kein vollständiges Employee-Management.
- Keine Datenmodell-Migration (Customer.training_* bleibt unangetastet).
- Keine UI-Komplett-Neugestaltung.
- **Keine bestehenden funktionierenden Pages löschen** (PrescriptionIntake, ConsultationFlow, RehasportFlow, CustomerList, LeadCockpit, PersonenCockpit bleiben drin — nur ihre Layout-Eltern ändern sich).

---

## Sprint-1-Fragen — was Sprint 1 beantwortet

1. Wer ist eingeloggt?
2. Welche Welt sieht diese Rolle?
3. Welche Routen darf diese Rolle öffnen?
4. Welches Layout bekommt diese Rolle?
5. Welche Navigation sieht diese Rolle?

---

## Vorbedingungen (müssen erfüllt sein, bevor Sprint 1 startet)

- [ ] **B-01** beantwortet — Studioleitung vs Admin getrennt oder eins?
- [ ] **B-02** beantwortet — Welche 4 Rollen aktiviert Sprint 1? (Vorschlag: Studioleitung, Trainer, Berater, Service)
- [ ] **B-03** beantwortet — Default-Landing pro Rolle final?
- [ ] Studio-Owner hat Sprint-0-Charter und Roadmap formal abgenommen.

---

## Arbeitspakete

### AP-1: Rollen-Modell

**Ziel:** Saubere Definition aller 8 Rollen im Code, davon 4 in Sprint 1 aktiv.

**Tasks:**

1. `src/lib/roleModel.js` (neu) — Single Source of Truth:
   ```javascript
   export const ROLES = {
     STUDIOLEITUNG: 'studioleitung',
     ADMIN: 'admin',
     BERATER: 'berater',
     TRAINER: 'trainer',
     SERVICE: 'service',
     REHA_MITARBEITER: 'reha_mitarbeiter',
     EMPFANG: 'empfang',
     KUNDE: 'kunde',
   };

   export const ROLE_ACTIVATION = {
     SPRINT_1: ['studioleitung', 'trainer', 'berater', 'service'],
     // 'admin', 'reha_mitarbeiter', 'empfang', 'kunde' folgen später
   };

   export const ROLE_WORLD = {
     studioleitung: 'management',
     admin: 'management',  // hängt von B-01 ab
     berater: 'advisor',
     trainer: 'trainer',
     service: 'trainer',   // hängt von B-02 ab — ggf. eigene Welt
     reha_mitarbeiter: 'trainer',
     empfang: 'trainer',
     kunde: 'kiosk',
   };

   export function resolveUserRole(user) { /* … */ }
   export function resolveUserWorld(user) { /* … */ }
   export function userCanAccessWorld(user, world) { /* … */ }
   ```

2. `src/lib/advisorAccess.js` (refactor) — Bisheriger `getAdvisorRoleKey` wird zum Wrapper um `roleModel.js`. Backward-compat erhalten (alte Caller dürfen nicht brechen).

3. Cleanup: Zombie-Keys `coach`, `service`, `sales` aus altem Code entfernen oder explizit auf neue Rollen mappen.

**Akzeptanz:**
- `roleModel.js` exportiert alle 8 Rollen.
- `ROLE_ACTIVATION.SPRINT_1` enthält genau die in B-02 entschiedenen 4 Rollen.
- Existierende Pages, die `getAdvisorRoleKey` nutzen, funktionieren weiter.
- `npm run build` grün.

---

### AP-2: Layouts trennen

**Ziel:** Vier Layout-Komponenten, jede mit eigener Sidebar/Header/Welt-Identität.

**Tasks:**

1. **`src/components/layout/ManagementLayout.jsx`** (neu)
   - Sidebar mit Management-Navigation (siehe AP-5).
   - Welt-Header: "Management".
   - Farbe: neutrales Dunkelblau/Grau (Vorschlag aus `08-ui-konzept-modi.md`).

2. **`src/components/layout/TrainerLayout.jsx`** (neu)
   - Sidebar oder Bottom-Tabs für Mobile-First.
   - Welt-Header: "Trainer".
   - Farbe: warm (amber-Variante).

3. **`src/components/layout/AdvisorLayout.jsx`** (existiert — Cleanup)
   - Bestehende Nav-Items entrümpeln: **Admin, Regeln, Analytics, Tarife raus** (gehören in ManagementLayout).
   - Verbleibende Items: Personen, Leads, Rezeptaufnahme, Beratung starten, Verlauf.
   - Welt-Header: "Beratung".
   - Farbe: Markengrün bleibt.

4. **`src/components/layout/CustomerKioskLayout.jsx`** (Skeleton)
   - Kein Sidebar, full-screen.
   - Header optional.
   - Logout/Exit-Button.
   - Inhalt: Outlet für Kiosk-Routes.

**Akzeptanz:**
- 4 Layout-Files vorhanden.
- AdvisorLayout enthält keine Admin-Items mehr.
- Visuelle Welt-Identität pro Layout erkennbar (eigene Farbe + Welt-Header-Label).
- `npm run build` grün.

---

### AP-3: Route Guards

**Ziel:** `<ProtectedWorldRoute>` schützt jede Welt vor unberechtigtem Zugriff.

**Tasks:**

1. **`src/components/auth/ProtectedWorldRoute.jsx`** (neu)
   ```jsx
   export function ProtectedWorldRoute({ world, children }) {
     const { user } = useAuth();
     const userWorld = resolveUserWorld(user);
     if (!userCanAccessWorld(user, world)) {
       return <Navigate to={defaultLandingFor(user)} replace />;
     }
     return children;
   }
   ```

2. **`src/App.jsx`** (refactor — additiv) — neue Route-Bäume:
   ```jsx
   <Route path="/management/*" element={<ProtectedWorldRoute world="management"><ManagementLayout /></ProtectedWorldRoute>}>
     <Route index element={<ManagementDashboard />} />
     <Route path="dashboard" element={<ManagementDashboard />} />
     {/* … weitere Routes Skeleton */}
   </Route>
   <Route path="/trainer/*" element={<ProtectedWorldRoute world="trainer"><TrainerLayout /></ProtectedWorldRoute>}>
     <Route index element={<TrainerHeute />} />
     {/* … */}
   </Route>
   <Route path="/kiosk/*" element={<CustomerKioskLayout />}>
     {/* unauthenticated allowed, optional token-guard */}
   </Route>
   {/* /berater/* bleibt unverändert mit AdvisorLayout */}
   ```

3. **Existierende `/berater/*`-Routen bleiben** — werden nur durch denselben Guard erweitert (`world="advisor"`).

**Akzeptanz:**
- Trainer kann `/management/*` nicht aufrufen — wird auf `/trainer` redirected.
- Berater kann `/trainer/*` nicht aufrufen — wird auf `/berater/personen` (oder B-03-Entscheidung) redirected.
- Studioleiter kann alle Welten aufrufen.
- Service-Mitarbeiter: hängt von B-02 ab.
- Login-Page bleibt offen, Kiosk bleibt offen (Token-basiert in MVP 2).

---

### AP-4: Default Landing pro Rolle

**Ziel:** Login leitet auf die korrekte Welt um.

**Tasks:**

1. `src/lib/roleModel.js` erweitert um:
   ```javascript
   export function defaultLandingFor(user) {
     const world = resolveUserWorld(user);
     return DEFAULT_LANDING[world];
   }

   export const DEFAULT_LANDING = {
     management: '/management/dashboard',
     trainer: '/trainer/heute',
     advisor: '/berater/personen',  // B-03 bestätigen
     kiosk: '/kiosk',
   };
   ```

2. `src/pages/berater/AdvisorLogin.jsx` (oder zentraler Login) — nach erfolgreichem Login: `navigate(defaultLandingFor(user))` statt aktuellem Hardcoded-Redirect.

3. **`App.jsx`**: `<Route path="/" />` → redirect to `defaultLandingFor(user)`. Anonymer User → Landing/Login-Page.

4. **Default-Landing für `/berater/heute`?** — nicht in Sprint 1. Berater-Default bleibt `/berater/personen` (existiert).

5. **Default-Landing für `/trainer/heute`?** — Sprint 1 baut nur ein **Placeholder-Page** (`<TrainerHeute />`) mit Headline + "Sprint 7 folgt"-Hinweis. Kein echtes Tagestool.

**Akzeptanz:**
- Login als Trainer → landet auf `/trainer/heute` (Placeholder OK).
- Login als Studioleiter → landet auf `/management/dashboard` (Placeholder OK).
- Login als Berater → landet auf `/berater/personen`.
- Login als Service → landet wo? (B-02-Entscheidung).
- Niemand landet mehr auf `RehasportAdvisorDashboard` als Default.

---

### AP-5: Menü je Rolle

**Ziel:** Jede Sidebar zeigt nur Items, die zur Welt gehören.

#### Management-Sidebar (Skeleton in Sprint 1)

```
/management
  /dashboard         (Placeholder)
  /mitarbeiter       (Placeholder — Sprint 5)
  /arbeitszeiten     (Placeholder)
  /kurse             (Placeholder)
  /leistungen        (Placeholder)
  /tarife            (existierender TariffBuilder hierhin verlinken — kein Code-Move)
  /krankenkassen     (existierender InsuranceManager hierhin verlinken)
  /regeln            (existierender RulesAdmin hierhin verlinken)
  /analytics         (existierender Analytics.jsx hierhin verlinken)
  /sync              (Placeholder — Sprint 6)
```

#### Trainer-Sidebar (Skeleton in Sprint 1)

```
/trainer
  /heute             (Placeholder)
  /aufgaben          (Placeholder — Sprint 7)
  /termine           (Placeholder)
  /kunden            (Placeholder — Sprint 7)
  /krankmeldung      (Placeholder — B-06)
  /team              (Placeholder)
```

#### Berater-Sidebar (Cleanup in Sprint 1)

```
/berater
  /personen          (existiert — PersonenCockpit)
  /leads             (existiert — LeadCockpit)
  /rezepte           (existiert — PrescriptionIntake)
  /beratung          (existiert — ConsultationFlow als Start)
  /verlauf           (existiert — ConsultationHistory)
```

**Entfernt aus Berater-Sidebar** (jetzt in Management):
- Tarife
- Regeln
- Analytics
- Admin

#### Kiosk (kein Sidebar)

```
/kiosk             (Skeleton-Landing — Sprint 4+)
```

**Akzeptanz:**
- Trainer sieht in Sidebar **nur** die 6 Trainer-Items.
- Studioleiter sieht **nur** die 10 Management-Items.
- Berater sieht **nur** die 5 Berater-Items (kein Tarife/Regeln/Analytics).
- Klick auf existierende Pages funktioniert weiter (kein 404).

---

## Risiken

| ID | Risiko | Schweregrad | Mitigation |
|---|---|---|---|
| R1 | Bestehende Bookmarks auf `/berater/admin` brechen | Mittel | Redirect-Routes `/berater/admin` → `/management/admin` mit Hinweis-Banner |
| R2 | Service-Rolle ist in B-02 unklar entschieden | Hoch | Sprint-Start verzögern bis B-02 beantwortet |
| R3 | Base44 User-Records haben falsche Role-Keys | Mittel | Migrations-Skript / Admin-Tool zum Rollen-Mapping vor Sprint 2 |
| R4 | Layout-CSS-Konflikte mit existierenden Tailwind-Klassen | Niedrig | Lokales Testing nach jedem Layout-Commit |
| R5 | Default-Landing-Redirect-Loop bei unklarer Rolle | Mittel | Fallback `/login` wenn keine Rolle resolved |

---

## Definition of Done (Sprint 1)

- [ ] `roleModel.js` mit 8 Rollen + 4 aktiven existiert
- [ ] 4 Layouts existieren (Management, Trainer, Advisor, Kiosk)
- [ ] `<ProtectedWorldRoute>` schützt Welten korrekt
- [ ] Default-Landing pro Rolle funktioniert
- [ ] Trainer sieht keine Admin-Items mehr
- [ ] Berater sieht keine Tarife/Regeln/Analytics mehr in Sidebar
- [ ] `RehasportAdvisorDashboard` ist nicht mehr Default-Landing
- [ ] `npm run build` grün
- [ ] Regression Smoke Test:
  - [ ] Rezeptscan funktioniert weiter
  - [ ] ConsultationFlow funktioniert weiter
  - [ ] PersonenCockpit funktioniert weiter
  - [ ] LeadCockpit funktioniert weiter
  - [ ] Existierende Login-Flow funktioniert weiter

---

## Parallele Tracks während Sprint 1

Diese Tracks laufen **ohne Code-Änderung** parallel zu Sprint 1:

- **Track A (UX)**: Management/Trainer/Berater-Navigation finalisieren als Wireframes
- **Track B (Data)**: Employee-Entity final definieren, B-04/B-06 klären
- **Track C (Integration)**: ThemiSoft-Fragenliste, myYolo-Credential-Status, SimplyBook/Meta/Superchat-Mapping
- **Track D (QA)**: Smoke-Test-Skripte pro Rolle, Regression-Test-Plan

Output dieser Tracks: weitere Sprint-Doku unter `docs/sprint-1/parallel-tracks/`.

---

## Nach Sprint 1

Bei erfolgreicher Sprint-1-Abnahme:

- Sprint 2 startet sofort: **Personenakte Detail** (`/berater/personen/:id`).
- Sprint 5 kann teilweise parallel laufen: **Admin-Grundstruktur** (Tarif/Service/Krankenkassen-Verwaltung im Management-Layout aktivieren).

Nicht direkt nach Sprint 1:

- Sprint 3 (Reha in Personenakte) wartet auf Sprint 2.
- Sprint 6 (Sync-UI) wartet auf B-07/B-08.
- Sprint 7 (Trainer-Modul) wartet auf B-04/B-06.
