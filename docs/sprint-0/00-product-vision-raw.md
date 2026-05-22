# AlbGym Nav — Roh-Vision vom Auftraggeber (Sprint 0 Input)

Quelle: Direkt-Briefing 2026-05-22 vom Studio-Owner.
Zweck: gemeinsame Faktenbasis für alle Sprint-0-Agenten. Wird NICHT überschrieben.

---

## Produktname
**AlbGym Nav**

## Produktvision
AlbGym Nav wird die zentrale Steuerungsplattform des Studios.
Es ist nicht nur ein Beratungsnavigator. Es ist ein System für:

- Studioleitung
- Trainer
- Berater
- Rehasport-Aufnahme
- Lead-Management
- Kunden-/Personenverwaltung
- Mitarbeitermanagement
- Vertrags- und Leistungsmanagement
- Sync mit externen Systemen

Der zentrale Satz lautet:
> **AlbGym Nav organisiert Menschen, Aufgaben, Angebote und Prozesse im Studio – passend zur Rolle des Nutzers.**

---

## Die drei Hauptwelten

### 1. Management-System
Für Studioleitung, Verwaltung und Admin. **Studio-Steuerzentrale.**
Steuert: Mitarbeiter · Rollen · Fähigkeiten · Arbeitszeiten · Arbeitspläne · Kurse · Leistungen · Tarife · Blockkarten · Verträge · Krankenkassen · Sync-Einstellungen · Systemregeln · Analytics.

### 2. Trainer-Tool
Für Trainer im Alltag. Sieht: heutige Aufgaben/Kunden/Termine, Hilfsanfragen, Krankmeldung, interne Infos.
**KEINE Verwaltung, KEINE Tarifregeln, KEINE Krankenkassenverwaltung.** Schnelles Werkzeug.

### 3. Berater-Tool / Kunden-Frontend
Für Beratungsgespräche und Verkauf. Visuelle, einfache Schritte:
- Was ist dein Ziel?
- Wo willst du hin?
- Was hält dich aktuell auf?
- Wie viel Betreuung brauchst du?
- Welche Leistungen passen?
- Welcher Tarif ist sinnvoll?

Kundensicht: große Buttons, Zielbilder, einfache Auswahlflächen, klare Empfehlung.
Im Hintergrund Matrix aus: Personendaten · Zielprofil · Bedarf · Anamnese · Leistungskatalog · Tarife · Kontraindikationen · Reha-Kontext · §20-Relevanz · Vertragslogik.

---

## Zusatzwelt: Rehasport-Aufnahme
**Kein isolierter Menüpunkt**, sondern Aufnahmeprozess INNERHALB der Personenakte:
Rezept scannen → Daten auslesen → Felder prüfen → Fehler markieren → Krankenkasse abgleichen → Person anlegen/aktualisieren → Reha-Vorgang erstellen → PDF speichern → Welcome-Termin optional.

---

## Zentrales Datenprinzip

### Zwei zentrale Identitäten
- **Person**
- **Mitarbeiter (Employee)**

Alles andere hängt daran als Kontext/Vorgang.

### Person kann sein
Lead · Interessent · Kunde · Mitglied · Rehasportler · Beratungskandidat · Vertragskandidat. **Aber keine getrennten Datensätze — eine Person mit mehreren Kontexten.**

### Mitarbeiter kann haben
Rolle · Fähigkeiten · Arbeitszeiten · Schichten · Termine · Aufgaben · Krankmeldungen · Teamkommunikation · Berechtigungen.

---

## KI-Projektteam (12 Agenten)

| Agent | Verantwortung |
|---|---|
| Product Owner | Produktvision |
| Project Manager | Ablauf |
| Software Architect | Systemarchitektur |
| Domain Analyst | Studio-Prozesse |
| UX Architect | Rollen & Navigation |
| UI Designer | Interface-System |
| Data Model | Entities |
| Integration | APIs & Sync |
| Frontend | React UI (nicht Sprint 0) |
| Workflow | Prozesse (nicht Sprint 0) |
| QA | Tests (nicht Sprint 0) |
| Documentation | Übergaben |

Detaillierte Rollen-Definitionen siehe Original-Briefing (siehe Issue-Kontext).

---

## Rollen-Initialliste (Studio-Personal)
Studioleitung · Admin · Berater · Trainer · Empfang · Reha-Mitarbeiter · Reinigung · Kunde.

Beispiel Sichtbarkeit:
- Trainer sieht: Heute, Meine Aufgaben, Meine Kunden, Termine, Krankmeldung, Team-Nachrichten.
- Studioleiter sieht: Management, Mitarbeiter, Arbeitspläne, Kurse, Verträge, Leistungen, Analytics, Sync.
- Kunde sieht: Visueller Beratungsflow, Ziele, Auswahlbuttons, Empfehlung, Abschluss.

---

## Externe Systeme
ThemiSoft · myYolo/AZH · SimplyBook.me · Meta Leads · Superchat · später E-Mail/WhatsApp.

Grundregel: **Kein blinder Sync.** Daten prüfen → fehlende Felder anzeigen → SyncJob vorbereiten → Ergebnis protokollieren → Fehler sichtbar machen.

---

## MVP-Abgrenzung

### MVP 1 IN
- Rollenbasierte Navigation
- Personen-Cockpit
- Personenakte
- Lead-Kontext
- Reha-Aufnahme mit Rezeptscan
- Beratungsnavigator
- Admin-Grundstruktur
- Sync-Readiness

### NICHT MVP 1
- Vollständige Dienstplanung
- Komplette interne Kommunikation
- Vollautomatischer ThemiSoft-Sync
- Vollautomatischer myYolo-Sync
- Komplexe Kursplanung
- Mobile Mitarbeiter-App

---

## No-Go-Regeln
1. Keine neue zweite Kundenwelt.
2. Kein Rehasportler als eigene Person.
3. Kein Lead als eigene Person.
4. Keine Adminfunktionen im Trainerbereich.
5. Keine Traineraufgaben im Kundenfrontend.
6. Kein Sync ohne Readiness-Prüfung.
7. Kein großes UI-Refactoring ohne Rollenentscheidung.
8. Keine neue Funktion ohne Zuordnung zu Management/Trainer/Berater/Kunde.

**Sprint-0-spezifisch:**
9. **Keine Codeänderung.**
10. **Keine Repo-Anweisung.**
11. **Keine UI-Umsetzung.**

---

## Erster Sprint (Sprint 0): Discovery & Struktur

**Deliverables:**
1. `01-product-charter.md` — Product Charter
2. `02-roadmap-mvp.md` — Roadmap + MVP-Scope + Sprintplan
3. `03-rollenmatrix.md` — Rollen × Funktionen Matrix mit Sichtbarkeitsregeln
4. `04-studio-prozesse.md` — Praxisflows: Lead-Aufnahme, Rezeptscan, Welcome, Beratung, Vertrag, Krankmeldung, Schichtplan
5. `05-datenmodell-grob.md` — Entity-Map, Beziehungen, Pflichtfelder, Statuslogik
6. `06-integrationen.md` — Externe Systeme Mapping, SyncJob, ExternalReference
7. `07-navigation-sitemap.md` — Sitemap je Rolle, User Journeys, Screen-Hierarchie
8. `08-ui-konzept-modi.md` — UI-Modi (Management/Trainer/Berater/Kunde), Farbrollen, Komponenten
9. `09-modulkarte.md` — Modulstruktur, Modulgrenzen
10. `10-systemlandkarte.md` — Gesamtsystem-Architektur-Karte
11. `11-sprint0-briefing.md` — Projektleiter-Übergabebriefing
12. `12-entscheidungsfragen.md` — Offene Fragen die der Studio-Owner entscheiden muss

---

## Existing-State-Hinweis
Vor Sprint 0 wurden bereits implementiert (Commits in main):
- Phase 1+2: Customer Core (`upsertUnifiedCustomer`, Customer-Entity, ConsultationFlow refactor) — Commit aa364f0.
- Phase 3+4 Slice: GoalProfile (`src/lib/goalProfileModel.js`, `base44/entities/GoalProfile.jsonc`), Personen-Cockpit (`src/pages/PersonenCockpit.jsx` Route `/berater/personen`), Sync-Readiness (`src/lib/syncReadiness.js`), Skeleton-Entities (`SyncJob.jsonc`, `ExternalReference.jsonc`).

Sprint 0 prüft, ob diese Bausteine zum **neuen** Charter "AlbGym Nav" passen oder ob sie post-Sprint-0 angepasst werden müssen. Die Agenten bewerten Gap, nicht Neubau.
