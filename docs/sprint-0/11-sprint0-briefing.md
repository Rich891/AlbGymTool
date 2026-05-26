# Sprint 0.5 — Übergabe-Briefing nach Sprint 0

**Quelle:** Studio-Owner-Resume, 2026-05-22.
**Zweck:** Abnahme von Sprint 0 + kontrollierte Freigabe von Sprint 1.
**Status:** Sprint 0 abgenommen. Sprint 1 vorbereitet, Freigabe ausstehend (siehe `12-entscheidungsfragen.md`).

---

## 1. Was Sprint 0 entschieden hat

AlbGym Nav ist eine **rollenbasierte Steuerungsplattform des Studios** — eine Plattform, vier Sichten, ein Datenmodell.

**Die vier Sichten:**

- Management-System
- Trainer-Tool
- Beratungsnavigator
- Kunden-Frontend / Tablet-Modus

**Die zentrale Architekturentscheidung:**

- Eine kanonische Personenakte.
- Alle Kontexte hängen an dieser Person.
- Lead, Beratung, Reha, Vertrag, Zielprofil und Termine sind Vorgänge.

Rehasport ist laut Charter **kein eigener Bereich**, sondern ein Vorgang innerhalb der Personenakte. Sync mit ThemiSoft, myYolo/AZH, SimplyBook, Meta Leads und Superchat darf **nicht blind** passieren, sondern nur über Readiness-Prüfung und SyncJob.

---

## 2. Sprint 0.5 — Abnahme, Konsolidierung, Umsetzungsfreigabe

Ein kurzer Übergangsschritt zwischen Planung und Coding.

**Ziel:**

- Sprint 0 prüfen
- Offene Entscheidungen klären
- MVP 1 final bestätigen
- Sprint 1 freigeben

**Begründung:** Sprint 0 hat viele Befunde und Risiken offengelegt. Die Roadmap sagt selbst: MVP 1 soll eine zentrale Steuerungsoberfläche mit Rollenmodell, Personenakte, Personen-Cockpit, Reha-Aufnahme, Beratungsnavigator, Admin-Grundstruktur, Sync-Readiness und minimalem Trainer-Modul werden. Bevor Codex loslegt, muss der Projektleiter daraus eine priorisierte Umsetzung machen.

---

## 3. Offene Entscheidungen vor Sprint 1

Sprint 0 nennt mehrere Blocker. Strukturierter Katalog in **`12-entscheidungsfragen.md`**.

Kurzliste:

- ThemiSoft API-Spec fehlt
- myYolo/AZH Test-Credentials fehlen
- Rollenliste mit Berechtigungen fehlt
- Terminquelle ist unklar
- DSGVO-Text für Rezept-Consent fehlt
- Employee-Entity fehlt
- Krankmeldungs-Datenstruktur ist unklar

**Konsequenz:** Sprint 1 darf nicht versuchen, alle Integrationen oder das komplette Mitarbeitermanagement zu lösen. Sprint 1 muss zuerst die Rollen- und Navigationsstruktur schaffen.

---

## 4. Projektleiter-Übergabe

### Bereits vorhanden

- Product Vision
- Product Charter
- MVP-Roadmap
- Agentenbefunde
- No-Go-Regeln
- Risikoregister
- MVP-Abgrenzung
- bestehende technische Bausteine

### Bewertung der vorhandenen Bausteine

**Passt grundsätzlich:**

- Customer Core
- GoalProfile
- Personen-Cockpit
- Sync-Readiness

**Gaps:**

- "Person öffnen" ist noch Stub.
- Personenakte fehlt.
- Employee-Entity fehlt.
- Trainer-Welt fehlt komplett.
- Customer und GoalProfile haben noch doppelte Trainingsdaten.
- Cockpit lädt viele Entities gleichzeitig.
- Sync zeigt bisher nur Readiness, keinen echten SyncJob-Workflow.

Diese Bewertung steht im Product Charter (`01-product-charter.md`).

---

## 5. Sprint-Reihenfolge ab jetzt

Aus `02-roadmap-mvp.md`:

```txt
Sprint 1: Rollenmodell + rollenbasierte Navigation
Sprint 2: Personenakte + Cockpit-Anpassung
Sprint 3: Rehasport-Integration in Personenakte
Sprint 4: Beratungsnavigator-Stabilisierung
Sprint 5: Admin-Grundstruktur
Sprint 6: Sync-Readiness UI
Sprint 7: Trainer-Modul
Sprint 8: QA, Bug-Bash, MVP 1 Release
```

Reihenfolge ist sinnvoll und wird beibehalten. **Sprint 1 wird aber schärfer formuliert** — siehe `docs/sprint-1/00-scope.md`.

---

## 6. Sprint 1 — strikte Zielfokussierung

**Sprint 1 hat genau ein Ziel: Rollenmodell + Navigationsarchitektur.**

**NICHT in Sprint 1:**

- Keine Personenakte
- Kein Reha-Umbau
- Kein Sync
- Kein komplettes Employee-Management
- Keine Fachlogik
- Keine Datenmodell-Migration
- Keine UI-Komplett-Neugestaltung
- Keine Löschung bestehender funktionierender Flows

**Sprint 1 muss nur klären:**

- Wer ist eingeloggt?
- Welche Welt sieht diese Rolle?
- Welche Routen darf diese Rolle öffnen?
- Welches Layout bekommt diese Rolle?
- Welche Navigation sieht diese Rolle?

Vollständiger Scope: `docs/sprint-1/00-scope.md`.

---

## 7. Sprint 1 Zielbild (Sichten)

### Management-Welt

**Für:** Studioleitung, Admin.

**Sichtbar:**

- Management Dashboard
- Mitarbeiter
- Arbeitszeiten
- Kurse
- Leistungen
- Tarife
- Krankenkassen
- Regeln
- Analytics
- Sync-Einstellungen

### Trainer-Welt

**Für:** Trainer, Reha-Mitarbeiter, Empfang (eingeschränkt).

**Sichtbar:**

- Heute
- Meine Aufgaben
- Meine Termine
- Meine Kunden
- Krankmeldung
- Teaminfos

Noch keine vollständige Dienstplanung.

### Berater-Welt

**Für:** Berater, Service, Admin mit Beraterrolle.

**Sichtbar:**

- Personen
- Leads
- Rezeptaufnahme
- Beratung starten
- Personenakte

### Kunden-Frontend

**Für:** Kunde im Beratungsgespräch.

**Sichtbar (später):**

- Zielbilder
- Große Buttons
- Auswahlflächen
- Empfehlung
- Abschluss

In MVP 1 noch nicht voll drin — eher MVP 2. Sprint 1 baut nur ein leeres `CustomerKioskLayout`-Skeleton.

---

## 8. Parallele Tracks nach Sprint 0

Während Sprint 1 technisch das Rollenmodell baut, können Agenten parallel an Konzepten weiterarbeiten — **ohne Code zu schreiben**.

### Parallel Track A: UX

- Management Navigation finalisieren
- Trainer Navigation finalisieren
- Berater Navigation finalisieren
- Kundenmodus grob skizzieren

### Parallel Track B: Data

- Employee-Entity final definieren
- Krankmeldung entscheiden
- Appointment-Zuordnung klären
- Customer vs GoalProfile Datenkonflikt vorbereiten

### Parallel Track C: Integration

- ThemiSoft API-Fragenliste
- myYolo/AZH Credential-Status
- SimplyBook Terminquelle
- Meta Lead Mapping
- Superchat Mapping

### Parallel Track D: QA

- Smoke-Test je Rolle
- Regression Rezeptscan
- Regression ConsultationFlow
- Route-Guard-Test

**Codex / Sprint-1-Implementierung** fasst aber nur den technischen Rollen-/Navigationskern an.

---

## 9. Was jetzt NICHT passieren darf

- Nicht sofort Personenakte bauen.
- Nicht Reha-Flow umbauen.
- Nicht Sync-Button einbauen.
- Nicht komplettes Employee-Management bauen.
- Nicht die komplette UI neu designen.
- Nicht bestehende funktionierende Flows löschen.

**Warum:** Sprint 1 ist die Grundlage für alle folgenden Sprints. Wenn Rollen und Layouts nicht sauber stehen, werden Personenakte, Trainer-Tool, Management und Beratung wieder vermischt.

---

## 10. Übergabe an den Projektleiter (Text-Form)

```txt
Sprint 0 wurde erfolgreich ausgeführt und liegt im Repo.

Die Produktvision ist bestätigt:
AlbGym Nav ist eine rollenbasierte Studio-Steuerungsplattform mit
Management-System, Trainer-Tool, Berater-Tool und späterem Kunden-Frontend.

Die wichtigste Architekturentscheidung ist:
Customer/Person bleibt die zentrale Wahrheit. Lead, Reha, Beratung, Vertrag,
Zielprofil und Sync sind Vorgänge an dieser Person.

Der nächste freizugebende Sprint ist Sprint 1:
Rollenmodell + rollenbasierte Navigation.

Sprint 1 darf keine Fachlogik umbauen.
Sprint 1 darf keine Reha- oder Sync-Features erweitern.
Sprint 1 muss nur die Welten sauber trennen:
Management, Trainer, Berater, Kunde.

Nach Sprint 1 können Sprint 2 und Sprint 5 teilweise parallel laufen:
Personenakte und Admin-Grundstruktur.
```

---

## 11. Sprint-1-Arbeitspakete (Kurzform)

Detaillierte Variante: `docs/sprint-1/00-scope.md`.

### Arbeitspaket 1 — Rollen definieren

**Vollständige Liste:**

- Studioleitung
- Admin
- Berater
- Trainer
- Service
- Reha-Mitarbeiter
- Empfang
- Kunde

**MVP-1-aktiv (Sprint 1 implementiert):**

- Studioleitung
- Trainer
- Berater
- Service

### Arbeitspaket 2 — Layouts trennen

- `ManagementLayout`
- `TrainerLayout`
- `AdvisorLayout` (existiert — Cleanup)
- `CustomerKioskLayout` (Skeleton)

### Arbeitspaket 3 — Route Guards

- Management-Routen
- Trainer-Routen
- Berater-Routen
- Kunden-/Kiosk-Routen

### Arbeitspaket 4 — Default Landing

Aktuell ist das Default-Landing für alle Rollen das Rehasport-Dashboard (Sprint-0-Befund). Das muss weg.

**Neu:**

- Studioleitung → Management Dashboard
- Trainer → Heute
- Berater → Personen oder Leads
- Service → Aufgaben / Personen eingeschränkt

### Arbeitspaket 5 — Menü je Rolle

Management sieht Management. Trainer sieht Trainer-Tool. Berater sieht Berater-Tool. Kunde sieht nur Kundenmodus.

---

## 12. Sprint-Reihenfolge nach Sprint 1

```txt
Sprint 2: Personenakte
Sprint 3: Reha in Personenakte
Sprint 5: Admin-Grundstruktur
Sprint 7: Trainer-Modul
```

Die Roadmap aus Sprint 0 ist gut. Der nächste Schritt ist jetzt, sie diszipliniert umzusetzen — nicht wieder alles gleichzeitig anzufassen.

---

## 13. Freigabe-Checkliste

Bevor Sprint 1 starten darf, müssen folgende Punkte erledigt sein:

- [ ] Studio-Owner hat `01-product-charter.md` gelesen und bestätigt
- [ ] Studio-Owner hat `02-roadmap-mvp.md` gelesen und bestätigt
- [ ] Studio-Owner hat `03-rollenmatrix.md` gelesen und bestätigt
- [ ] Studio-Owner hat die kritischen Blocker in `12-entscheidungsfragen.md` beantwortet, die Sprint 1 blockieren (siehe Liste dort, Markierung "Sprint 1 Blocker")
- [ ] Sprint-1-Scope in `docs/sprint-1/00-scope.md` ist verbindlich abgenommen
