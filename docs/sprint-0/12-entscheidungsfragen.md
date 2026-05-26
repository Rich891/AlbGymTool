# Sprint 0.5 — Entscheidungsfragen für den Studio-Owner

**Zweck:** Strukturierter Q&A-Katalog. Studio-Owner trägt Antworten direkt unter jeder Frage ein. Pro Frage ist markiert, welchen Sprint sie blockiert.

**Quellen:** Sprint-0-Risikoregister (`02-roadmap-mvp.md`), Sprint-0-Befunde aller Discovery-Agenten, Sprint-0.5-Übergabe-Briefing.

---

## Blocker-Klassifikation

| Symbol | Bedeutung |
|---|---|
| 🛑 | Blockiert Sprint 1 — muss vor Sprint-1-Start beantwortet werden |
| 🟧 | Blockiert Sprint 2-4 — kann während Sprint 1 geklärt werden |
| 🟨 | Blockiert Sprint 5+ — Zeitpuffer vorhanden |
| 🟩 | Nice-to-have / strategisch — kein konkreter Blocker |

---

## B-01 ✅ Rollen-Detail: Studioleitung vs. Admin getrennt oder eins?

**Kontext:** Heute kollabieren beide auf den `admin`-Key (`src/lib/advisorAccess.js:1-2`). Charter listet beide getrennt.

**Optionen:**
- (A) Eine Rolle behalten → Charter-Liste auf 7 Rollen reduzieren.
- (B) Zwei getrennte Rollen mit unterschiedlichen Landings/Sichtbarkeiten → eigenes Management-Modul nötig.

**Konsequenz Sprint 1:** Bei (B) kommt eine Layout-Variante mehr dazu (4 statt 3 aktive Layouts) und Route-Guards müssen sauber zwischen beiden trennen.

**Antwort (Studio-Owner, 2026-05-22):**
> **Die Studioleitung IST der Admin.** Admin ist der Supervisor. Trainer/Mitarbeiter haben Befugnisse — je nach was sie dürfen. Der Studioleiter kann auch weitere Admins benennen.
>
> Implementierung: 1 Rolle `admin`. User-Management-Feature "make admin" für andere Mitarbeiter — gehört nicht in Sprint 1, kommt in Sprint 5.

---

## B-02 ✅ Welche Rollen aktiviert Sprint 1 wirklich?

**Vorschlag aus Sprint-0.5-Briefing:** Studioleitung, Trainer, Berater, Service.

**Frage:** Soll Service in Sprint 1 wirklich eine eigene Welt sein, oder ist Service eine eingeschränkte Trainer-Variante?

**Optionen:**
- (A) Service = eigene Welt mit eigenem Layout/Navigation.
- (B) Service = Trainer-Welt mit Feature-Flags (sieht z.B. keine Krankmeldung).
- (C) Service in Sprint 1 weglassen, erst in Sprint 5.

**Antwort (Studio-Owner, 2026-05-22):**
> **Trainer = Berater = Service.** Es gibt nur **3 Ebenen**:
> 1. **Admin / Studioleiter** (oben — alles)
> 2. **Trainer / Mitarbeiter** (Mitte — eine Rolle, intern via Befugnisse differenziert)
> 3. **Kunde / Mitglied** (unten — Kiosk/Frontend, MVP-2)
>
> Innerhalb der Mitarbeiter-Rolle gibt es **Capabilities** (z.B. "darf beraten", "darf Reha aufnehmen", "darf Verträge anlegen"). Capability-System ist NICHT Sprint 1 — kommt in Sprint 5. In Sprint 1 sehen alle Mitarbeiter alle Mitarbeiter-Items.

---

## B-03 ✅ Default-Landing pro Rolle final?

**Vorschlag aus Sprint-0.5-Briefing:**

- Studioleitung → Management Dashboard
- Trainer → Heute
- Berater → Personen (oder Leads?)
- Service → Aufgaben / Personen eingeschränkt

**Frage:** Berater Default = `/berater/personen` (neues Cockpit) ODER `/berater/leads` (Pipeline) ODER `/berater/heute` (neu, nicht existent)?

**Antwort (Studio-Owner, 2026-05-22):**
> **`/berater/heute`** — neue Tages-Page. Tagesfokussierte Sicht mit Terminen + fälligen Follow-ups + neuen Leads in einer aggregierten Übersicht.
>
> Konsequenz: Sprint-1-Scope wird um diese eine zusätzliche Composite-Page erweitert (Skeleton OK — füllt sich in späteren Sprints).
>
> Default-Landings final:
> - **Admin** → `/admin/dashboard` (neu, Skeleton)
> - **Mitarbeiter** → `/berater/heute` (neu, Skeleton mit Tages-Aggregation)
> - **Kunde** → `/kiosk` (Skeleton, MVP-2)

---

## B-04 🟧 Employee-Entity Scope für MVP 1

**Kontext:** Employee-Entity existiert noch nicht (`base44/entities/` enthält keine Employee.jsonc). Charter verlangt sie als zweite kanonische Identität.

**Optionen:**
- (A) MVP 1: nur minimal — `{ id, name, email, role_keys[], base44_user_id }`. Schichten/Skills/Krankmeldung später.
- (B) MVP 1: voll — inkl. Skills, Arbeitszeiten, Schichten.
- (C) MVP 1: gar nicht — Mitarbeiter bleiben Base44-User-Records ohne Domain-Entity.

**Sprint-1-Konsequenz:** Sprint 1 braucht keine Employee-Entity — nur Role-Keys auf Base44-User. (A) oder (C) reichen.

**Antwort:**
> _<hier eintragen>_

---

## B-05 🟧 DSGVO-Text für Rezept-/Datenschutz-Consent

**Kontext:** Rezeptscan und Personenakte speichern sensible Gesundheitsdaten. Heute kein expliziter DSGVO-Consent-Flow im Code (`grep -rn "consent" src/`).

**Frage:** Wer liefert den DSGVO-Mustertext (Studio-Owner? Anwalt? Kassenverband?) und wo wird er angezeigt (PrescriptionIntake? Personenakte-Header? Beratungsstart?)?

**Antwort:**
> _<hier eintragen>_

---

## B-06 🟧 Krankmeldungs-Datenstruktur

**Kontext:** Charter listet "Krankmeldung" als Trainer-Funktion. Kein Code, keine Entity.

**Optionen:**
- (A) Self-Service: Trainer trägt selbst ein, Studioleiter sieht Read-Only.
- (B) Eingabe nur durch Studioleiter (klassisches HR).
- (C) Beides möglich (Trainer kann melden, Studioleiter kann eintragen).

**Felder-Frage:** Nur Zeitraum? Oder auch Grund (frei? Kategorien?)? Attest-Upload?

**Antwort:**
> _<hier eintragen>_

---

## B-07 🟨 ThemiSoft API-Spec & Test-Credentials

**Kontext:** ThemiSoft hat **keinerlei Anbindung** im Code, aber 5 Felder + 1 Pipeline-Stage sind dafür vorbereitet (`Customer.themisoft_*`, `ContractDraft.themisoft_reference`, `crmModel.js:51-53`).

**Fragen:**
1. API-Typ — REST, SOAP, CSV-Import, DB-Direktzugriff?
2. Authentifizierung — Basic Auth, OAuth, API-Key?
3. Test-Umgebung verfügbar? Wenn ja: URL + Credentials.
4. Führung bei Mitglieder-Konflikten — ThemiSoft oder AlbGym Nav?
5. Reicht `Customer.themisoft_customer_id` aus, oder braucht ThemiSoft zusätzlich Mitarbeiter-IDs (Trainer als "Vertriebspartner")?

**Sprint-Konsequenz:** Ohne Antworten bleibt Sprint 6 (Sync-UI) ein Stub.

**Antwort:**
> _<hier eintragen>_

---

## B-08 🟨 myYolo / AZH Test-Credentials

**Kontext:** Backend-Function `azhMyConnect` existiert (`README.md:36-46`) mit Endpoints `configStatus`, `queryPersons`, `findCustomer`, `upsertPerson`, `syncCustomer`. Aber:

- Sind Test-Credentials hinterlegt? `process.env.AZH_MYCONNECT_USERNAME` etc.?
- Gibt es eine Sandbox-URL oder läuft alles gegen Produktiv-System?

**Antwort:**
> _<hier eintragen>_

---

## B-09 🟨 Terminquelle (Appointment vs. SimplyBook)

**Kontext:** `Appointment.jsonc` existiert. SimplyBook.me ist im Charter als externes System genannt.

**Frage:**
- (A) Appointment ist **führende** Datenquelle, SimplyBook nur Buchungsfenster (one-way write to SimplyBook).
- (B) SimplyBook ist **führende** Datenquelle, Appointment ist nur lokaler Cache (one-way read from SimplyBook).
- (C) Bidirektional mit Konfliktauflösung.

**Sprint-Konsequenz:** Trifft Sprint 4 (Beratungsnavigator) und Sprint 7 (Trainer-Modul).

**Antwort:**
> _<hier eintragen>_

---

## B-10 🟨 Superchat — Aggregator oder eine Quelle unter mehreren?

**Kontext:** Charter listet Superchat + "später E-Mail/WhatsApp".

**Frage:**
- (A) Superchat ist der **Aggregator** (deckt WhatsApp, Instagram, E-Mail über eine API ab) → "später E-Mail/WhatsApp" ist redundant.
- (B) Superchat ist nur **eine Quelle**, weitere Anbieter folgen → Multi-Channel-Architektur nötig.

**Sprint-Konsequenz:** Trifft Sprint 6/MVP-2.

**Antwort:**
> _<hier eintragen>_

---

## B-11 🟩 Notfall-Kontakt-Felder auf Customer

**Kontext:** Heute kein `emergency_contact_*` auf Customer.

**Frage:** Brauchen wir das? Falls ja, welche Felder?

**Antwort:**
> _<hier eintragen>_

---

## B-12 🟩 Reinigung als App-User?

**Kontext:** Charter listet "Reinigung" unter den 8 Rollen.

**Frage:** Ist Reinigungspersonal wirklich App-User (App-Login, Aufgaben, Schichten) oder nur eine Rolle in der HR-Liste?

**Antwort:**
> _<hier eintragen>_

---

## B-13 🟩 Doppelte Trainingsfelder Customer vs. GoalProfile

**Kontext:** `Customer.training_*`/`interest_*`/`complaints` existieren parallel zu `GoalProfile`-Feldern (`05-datenmodell-grob.md`).

**Frage:** Wann konsolidieren?

**Optionen:**
- (A) Sprint 2: Customer-Felder read-only mit Migrations-Hinweis.
- (B) Sprint 5: harte Migration mit Daten-Übernahme.
- (C) Bleibt parallel — Customer-Felder als Legacy markieren, neue Daten nur in GoalProfile.

**Antwort:**
> _<hier eintragen>_

---

## Antwort-Prozess

1. Studio-Owner trägt unter jeder Frage in die `> _<hier eintragen>_`-Zeile die Antwort ein.
2. Bei Antwort: Status-Symbol von 🛑/🟧/🟨/🟩 auf ✅ ändern.
3. Bei Bedarf: neue Folgefragen direkt darunter ergänzen.
4. Sobald alle 🛑 (Sprint-1-Blocker) auf ✅ stehen, kann Sprint 1 starten.
5. Commit als `docs(sprint-0): Owner-Antworten zu Entscheidungsfragen`.

---

## Übersicht — Was muss VOR Sprint 1 entschieden sein?

| # | Frage | Status |
|---|---|---|
| B-01 | Studioleitung vs Admin | ✅ Admin = Studioleiter (1 Rolle) |
| B-02 | Welche Rollen aktiv? | ✅ 3 Ebenen: Admin / Mitarbeiter / Kunde |
| B-03 | Default-Landing | ✅ Admin→/admin/dashboard, Mitarbeiter→/berater/heute, Kunde→/kiosk |

**Sprint 1 ist freigegeben.** Sprint-1-Scope wird auf Basis dieser Antworten in `../sprint-1/00-scope.md` aktualisiert.

Die übrigen Fragen (B-04 bis B-13) können parallel zu Sprint 1 geklärt werden.

### Neue Folgefrage aus den Antworten

**B-14 🟧 Capability-System für Mitarbeiter**
Aus B-02-Antwort folgt: Mitarbeiter-Rolle hat intern Capabilities (z.B. `CAN_CONSULT`, `CAN_REHA_INTAKE`, `CAN_MANAGE_CONTRACTS`, `CAN_SEE_LEADS`).
- In Sprint 1: alle Mitarbeiter sehen alle Items (kein Capability-Check).
- In Sprint 5: Capability-System einführen, Admin kann Capabilities pro Mitarbeiter zuweisen.

**Frage an Owner:** Liste der initialen Capabilities? Vorschlag:
- `CAN_CONSULT` — Beratungen durchführen
- `CAN_REHA_INTAKE` — Rezepte scannen, Reha-Vorgang anlegen
- `CAN_MANAGE_LEADS` — Lead-Pipeline bearbeiten
- `CAN_CREATE_CONTRACTS` — Vertragsentwürfe anlegen
- `CAN_VIEW_ANALYTICS` — eingeschränkte Analytics (Mitarbeiter-Level)
- `IS_REHA_SPECIALIST` — Reha-Spezialist (eigene Reha-Sicht)

Antwort kann in Sprint 5 nachgereicht werden.

**Antwort:**
> _<hier eintragen>_
