# AlbGym Nav — Roadmap & MVP-Plan

> Status: Sprint 0, Welle 1. Verfasst vom Project-Manager-Agent.
> Komplementär zu `01-product-charter.md`. Liest sich nicht ohne den Charter.
> Annahmen: Sprint = ~2 Wochen Realzeit / ~1 Woche Agenten-Realzeit (Schwarmgeschwindigkeit). Sprints können parallelisiert werden — siehe §5.

---

## 1. MVP-Definition

**MVP 1 = AlbGym Nav ist im Tagesgeschäft des Studios als zentrale Steuerungsoberfläche nutzbar — mit Stub-Sync, ohne Trainer-Vollumfang, ohne Kunden-Frontend.**

### MVP 1 IN
| Bereich | Was genau drin ist |
|---|---|
| Rollenmodell + Navigation | 4 Rollen aktiv (Studioleitung, Trainer, Berater, Service). Welten-Trennung im Layout. Rollencheck auf Routes (nicht nur im Menü). |
| Personenakte | Detailseite `/berater/personen/:id` mit allen Kontexten (Lead, Beratung, Reha, Vertrag, Goal, Aktivität). |
| Personen-Cockpit | Existierende Phase-4-Karte bleibt, Klick → Personenakte. Filter werden verfeinert. |
| Lead-Kontext | LeadCockpit existiert, wird mit Personenakte verlinkt (Lead → Customer → Personenakte). |
| Rehasport-Aufnahme | Eingebettet in Personenakte (nicht als eigener Menüpunkt). Scan → Extraktion → Review → `RehasportConsultation`. |
| Beratungsnavigator | Existierender ConsultationFlow wird in Berater-Welt einsortiert, Pre-Fill aus Personenakte. |
| Admin-Grundstruktur | TariffBuilder, ServiceCatalog, InsuranceManager (existieren) bekommen Welt-1-Layout. **Neu**: Employee-Listenansicht (read-only ok). |
| Sync-Readiness UI | Pro Person sichtbar: AZH/ThemiSoft/myYolo Status + Blocker. SyncJob-Anlage als Datensatz (auch wenn API-Call Stub bleibt). |
| Trainer-Modul (Minimum) | Heute-Liste (Termine + Aufgaben), Krankmeldung. **Kein** Vertretungsmanagement, kein Dienstplan-Editor. |

### MVP 1 OUT (explizit nicht in V1)
| Bereich | Warum nicht |
|---|---|
| Vollständige Dienstplanung | Eigene Domäne, zu groß. Sprint 9+ Roadmap-Erweiterung. |
| Komplette interne Kommunikation | Team-Chat, Push-Benachrichtigungen. Sprint 10+. |
| Vollautomatischer ThemiSoft-Sync | API-Doku unklar, Test-Tenant fehlt. MVP 1: Stub-SyncJob + manueller Trigger. |
| Vollautomatischer myYolo-Sync | `azhMyConnect` Backend-Function existiert, aber kein Production-Cred. MVP 1: read-only + SyncJob-Vorbereitung. |
| Komplexe Kursplanung | Kein Briefing-Bedarf für V1. |
| Mobile Mitarbeiter-App (native) | Nicht im Briefing. Trainer-Modul läuft als Responsive-Web. |
| Kunden-Frontend (Welt 3b) | Briefing nennt es als Vision, MVP 2. Risiko: zu viel UI-Design für V1. |
| Vollständige §20-Subsidy-Logik mit Vertragsgenerierung | `RehasportConsultation` hat Felder, aber Subsidy-Berechnung muss validiert werden. MVP 1: Anzeige + Hinweis, keine automatische Berechnung im Vertrag. |

---

## 2. Phasenplan

Übersicht (Detail in §3).

| # | Sprint | Ziel-Output | Hauptagent(en) | Vorgänger |
|---|---|---|---|---|
| 0 | Discovery | 12 Sprint-0-Docs (`docs/sprint-0/`) | PO+PM, Domain, UX, Data, Integration, SW-Architect, Documentation | — |
| 1 | Rollenmodell + rollenbasierte Navigation | Rollen-Auth + Layout-Trennung + Route-Guards | SW-Architect, UX, Frontend | 0 |
| 2 | Personenakte + Cockpit-Anpassung | `/berater/personen/:id` Detailseite + Cockpit-Klick aktiv | Frontend, Data | 1 |
| 3 | Rehasport-Integration in Personenakte | Rezeptscan-Flow wird Sub-Tab der Personenakte | Frontend, Workflow | 2 |
| 4 | Beratungsnavigator-Stabilisierung | ConsultationFlow konsumiert Personenakte, schreibt sauber zurück | Frontend, Workflow, QA | 2 |
| 5 | Admin-Grundstruktur | Management-Welt-Layout + `Employee`-Entity + Sync-Settings-Seite | Data, Frontend, UX | 1 |
| 6 | Sync-Readiness UI | Sync-Jobs sichtbar machen + manueller Trigger (Stub-API ok) | Integration, Frontend | 2, 5 |
| 7 | Trainer-Modul (Tagestool) | Welt-2-Layout + Heute-Liste + Krankmeldung | Frontend, UX, Workflow | 1, 5 |
| 8 | QA, Bug-Bash, Release | Smoke-E2E + Acceptance-Test der MVP-1-Items | QA, Documentation | alle |

Parallelisierung siehe §5.

---

## 3. Sprintdetails

### Sprint 0 — Discovery (LÄUFT)

| Feld | Inhalt |
|---|---|
| **Ziel** | Gemeinsame Faktenbasis. Charter, Roadmap, Rollenmatrix, Prozessflows, Datenmodell-Skizze, Integrationsplan, Sitemap, UI-Modi, Modulkarte, Systemlandkarte, Übergabebriefing, Entscheidungsfragen. |
| **Beteiligte Agenten** | Welle 1: PO+PM, Domain Analyst, UX Architect (+UI Designer), Data Model (+Integration). Welle 2: Software Architect. Welle 3: Documentation. |
| **Deliverables** | `docs/sprint-0/01..12-*.md`. |
| **Abnahmekriterien** | 12 Dokumente vorhanden. Jeder Agent verweist auf TATSÄCHLICH existierende Files/Entities. Keine Codeänderung. Keine `.js/.jsx`-Touches. |
| **Risiken** | Charter und Datenmodell driften auseinander (Mitigation: SW-Architect-Konsolidierung in Welle 2). |

### Sprint 1 — Rollenmodell + Rollenbasierte Navigation

| Feld | Inhalt |
|---|---|
| **Ziel** | Vier Rollen aktiv. Drei Welten als Layouts implementiert. Route-Guards greifen serverseitig (Base44-Session) UND clientseitig. |
| **Beteiligte** | SW-Architect (Auth + Routing), UX (Layout-Konzept), Frontend, Data (Rollen-Enum). |
| **Deliverables** | Layout-Komponenten `ManagementLayout`, `TrainerLayout`, `AdvisorLayout`, `CustomerKioskLayout` (letzteres als Skelett). Erweiterung `AuthContext` mit `getActiveWorld()`. Erweiterung `advisorAccess.js` zu rollenbasiertem Access-Checker. |
| **Abnahmekriterien** | (i) Studioleiter-Account kommt nach Login auf Management-Cockpit. (ii) Trainer-Account hat im Menü ausschließlich Welt-2-Routes; `/admin` ergibt 404. (iii) Berater unverändert wie heute. (iv) `npm run typecheck` grün. |
| **Vorgänger** | Sprint 0 fertig (Rollenmatrix muss vorliegen). |
| **Risiken** | Bestehende Routen brechen, weil sie unbewusst Berater-Rolle annehmen. **Mitigation**: Sprint 1 fasst nur Routing/Layout an, keine Inhalte. Regression-Smoke vor Merge. |

### Sprint 2 — Personenakte + Personen-Cockpit Anpassung

| Feld | Inhalt |
|---|---|
| **Ziel** | Charter-zentrale Personenakte als Detailseite. Cockpit-Klick aktiv. Doppelte trainingsspezifische Felder zwischen `Customer` und `GoalProfile` bereinigen. |
| **Beteiligte** | Frontend (Detail-UI), Data Model (Migration der `training_*`-Felder), Workflow (Pre-Fill in ConsultationFlow). |
| **Deliverables** | `src/pages/berater/PersonenAkte.jsx` (Detail-Component). Erweiterung `customerDataModel.js` um Hydrations-Helper. Migrationsnotiz für `Customer.training_goal` → `GoalProfile.primary_goal`. |
| **Abnahmekriterien** | (i) Klick auf Karte in Cockpit lädt Detailansicht. (ii) Detail zeigt alle Kontexte ohne N+1-Query-Burst (Batch-Load via `entityGateway`). (iii) Fehlende Pflichtfelder sind als Link in passenden Edit-Flow ausgeführt (z.B. "Krankenkasse fehlt" → öffnet Krankenkassen-Edit-Inline). (iv) Bestehende `Customer.training_*`-Felder werden read-only angezeigt mit Hinweis "Wechsel zu GoalProfile geplant", aber nicht entfernt (Migration in Sprint 5/6). |
| **Vorgänger** | Sprint 1. |
| **Risiken** | Performance: 7 Entities laden parallel kann bei >500 Customers eng werden. **Mitigation**: Detail-Page lädt nur 1 Customer + dessen Beziehungen, Cockpit bleibt wie bisher Listen-Heavy. |

### Sprint 3 — Rehasport-Integration in Personenakte

| Feld | Inhalt |
|---|---|
| **Ziel** | Rezeptscan und Rehasport-Vorgang verlassen ihre Insel-Pages und werden Sub-Tab/Modal innerhalb der Personenakte. **No-Go-Regel 2** wird strukturell umgesetzt. |
| **Beteiligte** | Frontend, Workflow (`crmAutomation.js`-Erweiterung), Data (PrescriptionScan ↔ RehasportConsultation Beziehung verifizieren). |
| **Deliverables** | Sub-Tab "Rehasport" auf Personenakte mit: Scan-Liste (`PrescriptionScan`), aktiver Vorgang (`RehasportConsultation`), §20-Status. Neuer Scan-Upload startet aus Personenakte, **nicht** aus separater Top-Level-Page. Bestehende `/berater/rezepte`-Seite wird zur reinen Übersichtsliste (Inbox-Style) und linkt in die jeweilige Personenakte. |
| **Abnahmekriterien** | (i) Aus Personenakte heraus Scan hochladen → automatische Verknüpfung zum aktiven Customer. (ii) Bestehender Reha-Aufnahme-Flow (`rehasport/*`-Pages) wird nicht gelöscht, aber in Personenakten-Kontext aufrufbar (Modal/Wizard-Modus). (iii) `HealthInsurance.approval_required` triggert sichtbare Warnung. |
| **Vorgänger** | Sprint 2. |
| **Risiken** | Reha-Flow ist sehr breit (17 Subpages unter `src/pages/rehasport/`). Kompletter Umbau sprengt MVP. **Mitigation**: Embedding statt Refactor — Rehasport-Flow läuft weiter als Wizard, wird nur durch Personenakte angestoßen und schreibt zurück. |

### Sprint 4 — Beratungsnavigator-Stabilisierung

| Feld | Inhalt |
|---|---|
| **Ziel** | Berater-Welt sauber: ConsultationFlow konsumiert Personenakte, schreibt sauber zurück, kein Datenleck zu falschen Customer-IDs. Bekannte CRM-Persist-Issues sichten und schließen. |
| **Beteiligte** | Frontend, Workflow, QA. |
| **Deliverables** | Regression-Tests für ConsultationFlow-Closing (`Lead`, `ActivityLog`, `FollowUpTask`, `ContractDraft`, `GoalProfile`). Erweiterung `crmAutomation.js`-Tests. UI-Hinweise wenn `Customer` unvollständig ist. |
| **Abnahmekriterien** | (i) Beratungsabschluss erzeugt `GoalProfile` nur wenn Anamnese-Felder ausgefüllt. (ii) `recommended_tariff` landet im `ContractDraft`. (iii) Kein Abschluss ohne `privacy_consent`. (iv) Mindestens 5 Vitest-Cases neu. |
| **Vorgänger** | Sprint 2 (Personenakte als Quelle für Pre-Fill). |
| **Risiken** | ConsultationFlow ist seit Phase 2 stabil, aber sechs Steps unter `src/pages/consultation/` haben unterschiedliche State-Management-Stile. **Mitigation**: nur kritische Pfade testen, kein State-Refactor. |

### Sprint 5 — Admin-Grundstruktur

| Feld | Inhalt |
|---|---|
| **Ziel** | Management-Welt mit eigenem Layout. `Employee`-Entity. Sync-Settings-Seite (Stub für Cred-Eingabe — Production-Cred bleibt Backend-Function-Secret). |
| **Beteiligte** | Data (`Employee.jsonc`), Frontend (Management-Layout, Employee-List, Sync-Settings), UX. |
| **Deliverables** | `base44/entities/Employee.jsonc` (Felder: `first_name`, `last_name`, `email`, `role`, `skills[]`, `is_active`, `phone`, `start_date`, `notes`). Read-only Listenansicht `src/pages/admin/EmployeeList.jsx`. `src/pages/admin/SyncSettings.jsx` mit ConfigStatus aus `azhMyConnect`-Backend-Function. |
| **Abnahmekriterien** | (i) Studioleiter sieht Mitarbeiterliste. (ii) Mitarbeiter anlegen UI (create-only, kein Edit/Delete in MVP 1). (iii) Sync-Settings zeigt für jedes Zielsystem: konfiguriert ja/nein, letzter erfolgreicher Sync (aus `SyncJob`). |
| **Vorgänger** | Sprint 1. |
| **Risiken** | `Employee` ist breites Thema (Schichten, Berechtigungen, Lohn — siehe Briefing). **Mitigation**: MVP 1 nur Stammdatensatz + Rolle. Berechtigungs-Edit und Schichten in MVP 2. |

### Sprint 6 — Sync-Readiness UI

| Feld | Inhalt |
|---|---|
| **Ziel** | Sync wird steuerbar (auch wenn API teilweise Stub). `SyncJob` wird beim manuellen Trigger geschrieben. `ExternalReference` bekommt einen Eintrag wenn ein Sync erfolgreich war (synthetisch für ThemiSoft, real für AZH). |
| **Beteiligte** | Integration (Backend-Function-Erweiterung), Frontend (Sync-Panel auf Personenakte), Data (`SyncJob.jsonc` ist da, evtl. Erweiterung). |
| **Deliverables** | Sync-Panel auf Personenakte mit Buttons "Sync zu AZH/ThemiSoft/myYolo vorbereiten". Erzeugt `SyncJob` und ruft passende Backend-Function. AZH ruft `azhMyConnect.syncCustomer` (real). ThemiSoft/myYolo erzeugen `SyncJob` mit `status='pending'` und Hinweis "wartet auf Integration". |
| **Abnahmekriterien** | (i) Klick "Sync AZH" für ready-Customer setzt `azh_sync_status='synced'`, schreibt `ExternalReference`, schreibt `SyncJob`. (ii) Klick "Sync ThemiSoft" für blockierten Customer ist deaktiviert mit Tooltip "Fehlt: …". (iii) `SyncJob.error_message` wird in UI sichtbar. |
| **Vorgänger** | Sprint 2 (Personenakte) + Sprint 5 (Sync-Settings). |
| **Risiken** | AZH-Cred fehlt in Dev/Test → Sprint 6 testet im Staging. **Mitigation**: Mock-Mode für `azhMyConnect` definieren (existiert teilweise als `configStatus`-Check). |

### Sprint 7 — Trainer-Modul (Tagestool)

| Feld | Inhalt |
|---|---|
| **Ziel** | Welt 2 lebt. Trainer sieht seinen Tag. Krankmeldung kann erfasst werden. |
| **Beteiligte** | Frontend (Welt-2-Pages), UX (mobile-first Layout), Workflow (Krankmeldungs-Logik). |
| **Deliverables** | `src/pages/trainer/Today.jsx` (Termine + Tasks für eingeloggten Trainer). `src/pages/trainer/SickLeave.jsx`. Optional: `src/pages/trainer/MyCustomers.jsx`. Erweiterung `Appointment` mit `assigned_employee_id` falls fehlend. |
| **Abnahmekriterien** | (i) Trainer-Login → Heute-Seite mit korrekten zugewiesenen Items. (ii) Krankmeldung erzeugt einen Datensatz (neue Entity `SickLeave` ODER `ActivityLog` mit `type='sick_leave'` — Entscheidung in Sprint 0 §12). (iii) Trainer hat keinen Zugriff auf `/admin`, `/berater/personen` als Liste (max. lesend auf zugewiesene Kunden). |
| **Vorgänger** | Sprint 1 (Rollenmodell), Sprint 5 (Employee). |
| **Risiken** | `Appointment`-Entity hat aktuell keinen klaren Bezug zu Employee — Briefing nennt "Termine" als Trainer-Sicht, aber Daten dafür unklar. **Mitigation**: Domain-Analyst in Sprint 0 muss spezifizieren, woher Termine kommen (SimplyBook-Sync vs. manuell). |

### Sprint 8 — QA, Bug-Bash, MVP 1 Release

| Feld | Inhalt |
|---|---|
| **Ziel** | Alle 9 Acceptance-Items aus `01-product-charter.md` §8 grün. Smoke-Tests pro Welt. Demo-Vorbereitung. |
| **Beteiligte** | QA, Documentation, alle Agenten für Fixes. |
| **Deliverables** | `docs/mvp1-acceptance-report.md`. Mindestens ein Smoke-E2E-Skript pro Welt (kann manuell-checkliste sein). Release-Notes. |
| **Abnahmekriterien** | (i) Charter §8 A–I alle abgehakt. (ii) Kein offener "Severity High"-Bug. (iii) Studio-Owner-Demo durchgespielt mit zwei Test-Personen (Neukunde + Reha). |
| **Vorgänger** | Alle. |
| **Risiken** | Spät auftauchende Bugs aus Sprint-Integration → Sprint 8 hat absichtlich Puffer. **Mitigation**: kontinuierliche QA ab Sprint 4. |

---

## 4. Risiko-Register (Top 10)

| # | Risiko | Bereich | Schweregrad | Mitigation | Owner |
|---|---|---|---|---|---|
| R-01 | ThemiSoft-API-Doku fehlt oder ist veraltet | Integration | **Hoch** | Sprint 6 nur Stub. ThemiSoft-Voll-Sync in MVP 2. Studio-Owner muss Vertragspartner-Kontakt liefern. | PM + Studio-Owner |
| R-02 | myYolo/AZH Production-Credentials nicht in Test-Tenant verfügbar | Integration | Hoch | Mock-Mode für `azhMyConnect`, real-Run erst in Staging. `configStatus`-Endpoint zeigt Cred-Status. | Integration |
| R-03 | Doppelte trainingsspezifische Felder (`Customer.training_*` vs. `GoalProfile`) erzeugen Datendrift | Datenmodell | **Hoch** | Sprint 2: read-only Anzeige + Hinweis. Sprint 5: Migration. Daten-Hygiene-Check ab Sprint 4. | Data Model |
| R-04 | `Employee`-Entity wird zu breit gezogen (Schichten, Lohn, Berechtigungen mischen) | Scope | Mittel | MVP 1 nur Stammdaten. Berechtigung-Edit in Sprint 7+. | PO + Data |
| R-05 | Rolle "Service" ist unscharf — was sieht sie genau? | Rollenmodell | Mittel | Sprint 0 `03-rollenmatrix.md` muss Service definieren. Default: Berater-Sicht read-only + eingeschränkter Lead-Cockpit. | UX + Domain |
| R-06 | Bestehender Rehasport-Flow (17 Subpages) kollidiert mit Personenakte-Embedding | UX/Frontend | Mittel | Sprint 3: Embedding statt Refactor. Flow läuft als Wizard, schreibt zurück. | Frontend + UX |
| R-07 | Performance Personen-Cockpit bei >500 Customers (7 Entity-Loads parallel) | Performance | Mittel | Cockpit lädt heute 300er-Page. Server-side-Filter in Sprint 2. Pagination-Refactor in MVP 2. | SW-Architect |
| R-08 | Kunden-Frontend (Welt 3b) gerät unter Druck weil Studio-Owner es im Briefing als Vision nennt | Scope-Creep | Mittel | Klar in Charter: MVP 2. Demo-Plan zeigt Klick-Dummy als Vision. | PO |
| R-09 | §20-Subsidy-Logik fachlich falsch ausgespielt (Krankenkasse-Daten) | Compliance/Daten | Mittel | `HealthInsurance.source_url` + `last_verified` Pflicht. Reha-Mitarbeiter prüft Stichprobe vor Demo. | Domain + Data |
| R-10 | Sprint-1-Rollenmodell bricht bestehende Routen unbemerkt | Regression | Mittel | Smoke-Tests vor jedem Sprint-1-Merge. Feature-Flag `ROLE_BASED_ROUTING` als Notausgang. | SW-Architect + QA |

Zusätzlich beobachten (nicht Top 10, aber notieren):
- Base44-SDK-Updates können schreiben/lesen brechen (siehe Commit `e49d629`).
- DSGVO-Regelung für Rezeptscan-Speicherung (Consent-Strecke ist in `Customer.consent_*` schon angelegt, aber UI-Audit fehlt).

---

## 5. Parallelisierungs-Matrix

Welche Agenten können welche Sprints parallel bearbeiten?

| Sprint | SW-Architect | UX/UI | Frontend | Data | Integration | Workflow | QA | Docs |
|---|---|---|---|---|---|---|---|---|
| 0 (Discovery) | W2 | W1 | — | W1 | W1 | — | — | W3 |
| 1 (Rollen) | **lead** | support | **lead** | support | — | — | — | — |
| 2 (Personenakte) | review | **lead** | **lead** | **lead** | — | support | — | — |
| 3 (Reha-Embed) | review | support | **lead** | review | — | **lead** | — | — |
| 4 (Beratung-Stabil) | — | — | **lead** | review | — | **lead** | **lead** | — |
| 5 (Admin) | review | support | **lead** | **lead** | review | — | — | — |
| 6 (Sync-UI) | review | support | **lead** | review | **lead** | — | review | — |
| 7 (Trainer) | review | **lead** | **lead** | review | — | **lead** | — | — |
| 8 (Release) | review | — | review | review | review | review | **lead** | **lead** |

### Erlaubte Parallel-Tracks
- **Sprint 2 + Sprint 5** können parallel: Personenakte (Welt 3) und Admin-Grundstruktur (Welt 1) berühren disjunkte Files.
- **Sprint 3 + Sprint 4** können parallel: Reha-Embedding ist UX-fokussiert, Beratung-Stabilisierung ist Tests-fokussiert.
- **Sprint 6 + Sprint 7** können parallel: Sync-UI in Berater-Welt vs. Trainer-Welt. Beide brauchen Sprint 5 als Vorgänger.

### Nicht parallelisierbar
- **Sprint 1** ist Single-Threaded für alle Welt-Layouts. Erst danach alles andere.
- **Sprint 8** läuft erst nach allen anderen.

---

## 6. Blocker-Liste — was blockiert MVP 1 heute?

| # | Blocker | Auswirkung | Wer löst | Bis wann |
|---|---|---|---|---|
| B-01 | ThemiSoft API-Spec fehlt | MVP-1-Sync-UI bleibt Stub (Charter-konform), aber Studio-Owner muss kommunizieren ob das ok ist | Studio-Owner | Vor Sprint 6 |
| B-02 | myYolo/AZH Test-Cred fehlen | Sprint 6 AZH-Live-Test nicht möglich | Studio-Owner via AZH-Partner | Vor Sprint 6 |
| B-03 | Keine Rollenliste mit Berechtigungen aus Personalakte | Sprint 1 muss Rollen aus Briefing nehmen, später nachschärfen | Studio-Owner | Vor Sprint 1 |
| B-04 | Unklar woher `Appointment` kommt (SimplyBook-Sync? Manuell?) | Trainer-Modul (Sprint 7) bleibt leer ohne Datenquelle | Domain Analyst (Sprint 0) + Integration | Vor Sprint 7 |
| B-05 | DSGVO-Mustertext für Rezept-Consent fehlt | Reha-Aufnahme darf Scan nicht persistieren ohne Consent — Text muss vom Studio kommen | Studio-Owner | Vor Sprint 3 |
| B-06 | `Employee`-Entity nicht definiert | Sprint 5 + Sprint 7 brauchen sie | Data Model (Sprint 0) | Ende Sprint 0 |
| B-07 | Krankmeldungs-Datenstruktur unklar (eigene Entity vs. `ActivityLog`) | Sprint 7 muss entscheiden | Data + Workflow | Vor Sprint 7 |
| B-08 | Kein Bereich für "Notfall-Kontakt" / Bevollmächtigte in `Customer` | Reha-Senioren-Persona fragt das nach | Data Model | Vor Sprint 3 |

Keine B-01..B-08 ist heute **lösbar ohne Studio-Owner-Input**. Sprint 0 muss diese Punkte in `docs/sprint-0/12-entscheidungsfragen.md` mit klaren Antworten dokumentieren, **bevor** Sprint 1 startet.

---

## 7. Demo-Plan

Was zeigt der Schwarm dem Studio-Owner — und wann?

| Sprint | Demo-Inhalt | Ort | Dauer |
|---|---|---|---|
| 0 | Walkthrough durch alle 12 Discovery-Docs. Frage: stimmen Annahmen? | Online, geteilte Doku-Ansicht | 60 min |
| 1 | Login als 4 Rollen. Jeweils zeigen: was sieht ich, was nicht? | Demo-Tenant | 20 min |
| 2 | Personen-Cockpit → Klick → Personenakte mit allen Kontexten an Beispiel-Person | Demo-Tenant mit 3 Beispiel-Personen | 30 min |
| 3 | Reha-Aufnahme aus Personenakte: Scan hochladen → Daten prüfen → Vorgang erstellen | Demo-Tenant + echtes Beispielrezept | 25 min |
| 4 | Beratungsgespräch durchspielen: Lead → Personenakte → Berater-Flow → Vertragsentwurf | Demo-Tenant, Tablet vorne | 40 min |
| 5 | Management-Welt: Mitarbeiter, Tarife, Krankenkassen, Sync-Settings | Demo-Tenant, Studioleiter-Login | 30 min |
| 6 | Sync-Readiness in Aktion: Person ist blockiert → ergänze Feld → Status wird grün → Sync-Button aktiv | Demo-Tenant | 20 min |
| 7 | Trainer-Tag: Login als Trainer → Tagesliste → Termin abhaken → Krankmeldung erfassen | Demo-Tenant, Trainer-Account | 20 min |
| 8 | **MVP 1 Abnahme**: End-to-End Lead → Vertrag in einer Session. Acceptance-Checkliste live durchgehen. | Studio, vor Ort | 60 min |

Pro Demo: vorher gepushter Branch + verlinkbare Demo-URL. Studio-Owner-Feedback wird als `docs/demos/sprint-X-feedback.md` versioniert.

---

## Schlussbemerkung des Project Managers

Der schwierigste Teil dieses Plans ist **Sprint 1**, nicht weil er technisch hart ist, sondern weil er die einzige Stelle ist, an der man sich strukturell verirren kann. Wenn die Welten-Trennung sauber sitzt, läuft der Rest. Wenn nicht, wird Sprint 7 (Trainer) zur Katastrophe.

Der zweitschwierigste Teil ist **R-03** (doppelte Trainingsfelder in `Customer` und `GoalProfile`). Bisher wurde das aus Migrationsangst nicht angefasst. Sprint 2 (read-only) und Sprint 5 (Migration) müssen das ohne Datenverlust schaffen — das verlangt Domain-Analyst-Input und Data-Model-Diszipin im Sprint 0.

Alles andere ist Handwerk.
