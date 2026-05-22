# AlbGym Nav — Product Charter

> Status: Sprint 0, Welle 1. Verfasst vom Product-Owner-Agent.
> Quelle der Wahrheit: `docs/sprint-0/00-product-vision-raw.md` (Studio-Owner-Briefing 2026-05-22).
> Existing Code: Stand Commit `cca650d` (`Round out Personen cockpit for testing`).

---

## 1. Produktvision

**AlbGym Nav ist die rollenbasierte Steuerungsplattform des Studios — eine Plattform, vier Sichten, ein Datenmodell.**

AlbGym Nav löst die zentrale Frage des Studios: *Wer sieht was wann?* Jeder Nutzer — Studioleitung, Trainer, Berater, Kunde — bekommt genau die Funktionen und Daten, die seine Rolle braucht, und nichts darüber hinaus. Dahinter steht **eine** kanonische Personenakte (`Customer`), an die alle Kontexte (Lead, Beratung, Rehasport, Vertrag, Zielprofil, Termine) als Vorgänge gehängt werden. Es gibt nicht "den Rehasportler" und "den Lead" als getrennte Datensätze. Es gibt **eine Person mit mehreren aktiven Kontexten**.

Die Plattform organisiert vier Welten parallel: ein **Management-System** für Studioleitung/Admin, ein **Trainer-Tool** als schnelles Tagestool ohne Verwaltungs-Overhead, einen **Beratungsnavigator** für die geführte Verkaufsberatung und ein **Kunden-Frontend** mit visuellem, einfachem Beratungserlebnis. Rehasport-Aufnahme ist **kein eigener Bereich**, sondern ein Vorgang innerhalb der Personenakte.

Sync mit externen Systemen (ThemiSoft, myYolo/AZH, SimplyBook.me, Meta Leads, Superchat) folgt einer harten Regel: **kein blinder Sync**. Jeder Sync läuft über eine Readiness-Prüfung (Pflichtfelder, Datenqualitäts-Score), wird als `SyncJob` protokolliert und ist im UI sichtbar — auch wenn er fehlschlägt.

Der zentrale Satz aus dem Briefing bleibt der Maßstab:
> **AlbGym Nav organisiert Menschen, Aufgaben, Angebote und Prozesse im Studio – passend zur Rolle des Nutzers.**

---

## 2. Zielgruppe & Personas

Vier Personas — ohne sie keine Rollenmatrix.

### Persona 1 — Studioleiter / Inhaber (Auftraggeber)
| | |
|---|---|
| **Pain** | Verteilt Daten zwischen ThemiSoft, myYolo, Excel, Papier, SimplyBook. Sieht nie das Gesamtbild. Sync-Fehler werden erst nach Wochen sichtbar. Personalsteuerung läuft per WhatsApp. |
| **Need** | Eine Oberfläche, die zeigt: Wo stehen Leads · Wer braucht heute eine Aktion · Wo blockt der Sync · Wer ist krank · Welche Tarife performen. |
| **Daily Action** | Morgens Dashboard öffnen, Personen-Cockpit nach Fokus filtern (z.B. "Vertrag offen"), Sync-Status auf rot prüfen, Berater zuweisen. |

### Persona 2 — Trainer (Reinhard, 38, Vollzeit-Trainer)
| | |
|---|---|
| **Pain** | Bekommt morgens Excel-Liste, vergisst Termine, sieht Kundenhistorie nicht. Krankmeldung per Anruf, keine Vertretungsregel sichtbar. |
| **Need** | "Was ist heute meins?" — Termine, Aufgaben, eigene Kunden, schnelle Krankmeldung. **Kein Tarifkram, kein Krankenkassen-Käse.** |
| **Daily Action** | App öffnen, Tagesliste sehen, Termin abhaken, Notiz zu Kunde anhängen, Krankmeldung in 2 Klicks. |

### Persona 3 — Berater (Anna, 29, Verkauf+Beratung)
| | |
|---|---|
| **Pain** | Beratungsgespräch ist Improvisation. Vergisst §20-Frage. Tarif-Empfehlung aus dem Bauch. Kunde unterschreibt — Daten landen nicht in ThemiSoft. |
| **Need** | Geführter Flow: Ziel → Bedarf → Anamnese → Empfehlung → Tarif → Vertrag. Mit Personenakte daneben (Lead-Quelle, vorherige Beratung, Rehasport-Kontext sichtbar). |
| **Daily Action** | Lead-Cockpit checken, Person öffnen, Beratungsnavigator starten, abschließen — und sehen "Sync zu ThemiSoft: blockiert, fehlt Geburtsdatum" → ergänzen. |

### Persona 4 — Kunde (Maria, 52, Reha-Einstieg)
| | |
|---|---|
| **Pain** | Wird beim Berater mit Excel-Sheets bombardiert. Versteht §20 nicht. Will einfach wissen: Was passt zu mir, was kostet es, was muss ich tun? |
| **Need** | Große Buttons, Zielbilder ("Beweglich bleiben", "Schmerz reduzieren"), klare Empfehlung mit Begründung in Klartext. **Keine Tabelle, keine Fachterminologie.** |
| **Daily Action** | Im Beratungsgespräch auf Tablet tippen: Ziele wählen, Einschränkungen markieren, Empfehlung ansehen, Tarif zustimmen. |

---

## 3. Die drei Hauptwelten

> Briefing nennt drei Welten plus Kunden-Frontend als eigene Sicht innerhalb von Welt 3. Wir behandeln das als **drei Welten + eine Sub-Welt** ("Berater-Tool/Kunden-Frontend" als Tablet-Modus).

### Welt 1 — Management-System
| | |
|---|---|
| **Was** | Studio-Steuerzentrale. Konfiguration, Steuerung, Analytics. |
| **Für wen** | Studioleitung, Admin. |
| **Kernfunktionen** | Mitarbeiter & Rollen · Arbeitszeiten · Kurse · Leistungskatalog · Tarife · Krankenkassen · Sync-Einstellungen · Systemregeln · Analytics-Dashboard. |
| **NICHT enthalten** | Beratungsgespräch-Flow · Trainer-Tagesliste · Kundensicht. Studioleitung kann zwar **sehen** (z.B. Lead-Cockpit lesend), aber das Management-Modul ist nicht der Ort dafür. |

### Welt 2 — Trainer-Tool
| | |
|---|---|
| **Was** | Schnelles Tagestool für Trainer im Studio-Alltag. |
| **Für wen** | Trainer, Reha-Mitarbeiter, Empfang (eingeschränkt). |
| **Kernfunktionen** | Heute-Liste (Termine + Aufgaben) · Meine Kunden · Hilfsanfragen an Berater · Krankmeldung · Team-Nachrichten · interne Infos. |
| **NICHT enthalten** | Tarifregeln · Krankenkassenverwaltung · Mitarbeiteranlage · Sync-Konfiguration · Vertragsentwurf. |

### Welt 3 — Beratungsnavigator (Berater-Sicht)
| | |
|---|---|
| **Was** | Geführter Beratungs- und Verkaufsprozess. Existierende ConsultationFlow-Architektur (Customer → Anamnese → Goal → Recommendation → Closing) wird unter dieser Welt fortgeführt. |
| **Für wen** | Berater, Service-Mitarbeiter, Admin (mit Berater-Rolle). |
| **Kernfunktionen** | Lead-Cockpit · Personenakte (in Aufbau) · Personen-Cockpit (existiert, Phase 4) · Beratungsnavigator (Neukunde + Rehasport) · Empfehlungs-Engine · Vertragsentwurf · Sync-Vorbereitung. |
| **NICHT enthalten** | Mitarbeiterverwaltung · Kursplanung · Arbeitszeiten · Buchhaltung. |

### Welt 3b — Kunden-Frontend (Tablet-Modus innerhalb Welt 3)
| | |
|---|---|
| **Was** | Visuelle, vereinfachte Sicht auf den Beratungsflow, die der Kunde selbst auf dem Tablet bedient. Berater sitzt daneben. |
| **Für wen** | Kunde während der Beratung. |
| **Kernfunktionen** | Zielbilder · Einschränkungs-Tags · Tarif-Auswahl mit Begründung · DSGVO-Einwilligung · digitale Unterschrift. |
| **NICHT enthalten** | Listenansichten · CRM-Felder · interne Notizen · jeglicher Schreibzugriff auf andere Personen. |

---

## 4. Was AlbGym Nav NICHT ist

Klare Abgrenzung gegen Erwartungen, die sich im Studio-Umfeld leicht einschleichen.

| AlbGym Nav ist NICHT … | weil … |
|---|---|
| Kein ERP / Buchhaltung | Rechnungen, Mahnungen, DATEV-Export bleiben in ThemiSoft. AlbGym Nav liefert nur Vertragsentwürfe und Sync-Trigger. |
| Kein PMS / Personalverwaltung mit Lohnabrechnung | Arbeitszeit-Tracking ja, Lohn nein. Externer Lohnservice. |
| Kein Fitness-Tracker / Trainings-App für Endkunden | Kunden trainieren nicht in AlbGym Nav. Keine Workout-Logs, keine Trainingspläne im Detail. |
| Kein eigenes Buchungs-System (SimplyBook-Ersatz) | SimplyBook bleibt Quelle für Online-Termine. AlbGym Nav konsumiert via Sync. |
| Kein Marketing-Automation-Tool | Meta-Leads landen als Lead-Quelle in AlbGym Nav. E-Mail-Kampagnen / WhatsApp-Automation bleiben in Drittsystemen (Superchat etc.). |
| Kein Patienten-Dokumentationssystem | Rezeptscan + Reha-Vorgang ja. Befunde, Therapieprotokolle, Arzt-Korrespondenz: nein. |
| Kein Replacement von ThemiSoft / myYolo | AlbGym Nav ist das **Steuerungsfrontend** darüber. Quell-System für Membership-Daten bleibt ThemiSoft, Quell-System für Reha-Abrechnung bleibt myYolo/AZH. |
| Keine Lern-/Wissensplattform | Kein LMS, keine Trainerausbildung in der App. |

---

## 5. Erfolgskriterien (in 6 Monaten wahr)

Maßstab: nach MVP-1-Rollout + 8 Wochen Produktivbetrieb.

### Operative Metriken
| KPI | Zielwert | Heute (geschätzt) |
|---|---|---|
| Zeit von Lead-Eingang bis erste Berater-Aktion | < 24h für 80% der Leads | unbekannt (kein Tracking) |
| Beratungsabschluss-Quote | ≥ aktueller Wert + 10 Prozentpunkte | aktueller Wert nicht messbar |
| Rehasport-Aufnahme-Dauer (Rezept bis Vorgang erstellt) | < 5 min pro Fall | aktuell vermutlich 15–25 min |
| Dateneingaben doppelt erfasst (Person in zwei Tools) | 0 | hoch |
| Sync-Fehler die >7 Tage unbemerkt bleiben | 0 | unbekannt |
| Berater-Erfassungsfehler (fehlende Pflichtfelder bei Abschluss) | < 5% der Abschlüsse | unbekannt |

### Qualitative Erfolgskriterien
- **Studioleiter**: "Ich kann morgens in 5 Minuten sehen, was im Studio brennt."
- **Trainer**: "Ich öffne die App, sehe meinen Tag, fertig. Keine Schulung nötig."
- **Berater**: "Ich vergesse keine §20-Frage mehr und sehe sofort, ob der Sync klappt."
- **Kunde**: "Ich verstehe, warum mir dieser Tarif empfohlen wird."

### Negativ-Indikatoren (Failure-Signale)
- Berater nutzen weiter Excel parallel → Charter nicht erreicht.
- Studioleiter loggt sich < 1x/Woche ein → Management-Welt verfehlt Bedarf.
- Personenakte bleibt für >30% der Personen unter 50% Datenqualität → Erfassungsdisziplin fehlt.

---

## 6. No-Go-Regeln

Die 11 aus dem Briefing sind verbindlich. Drei zusätzliche aus PO-Analyse.

### Briefing (verbindlich)
1. Keine zweite Kundenwelt.
2. Kein Rehasportler als eigene Person.
3. Kein Lead als eigene Person.
4. Keine Adminfunktionen im Trainerbereich.
5. Keine Traineraufgaben im Kundenfrontend.
6. Kein Sync ohne Readiness-Prüfung.
7. Kein großes UI-Refactoring ohne Rollenentscheidung.
8. Keine neue Funktion ohne Zuordnung zu Management/Trainer/Berater/Kunde.
9. Keine Codeänderung in Sprint 0.
10. Keine Repo-Anweisung in Sprint 0.
11. Keine UI-Umsetzung in Sprint 0.

### Vom Product Owner ergänzt
12. **Keine Schatten-Entities.** Jede neue Datenstruktur muss als JSONC unter `base44/entities/` definiert und vom Data-Model-Agent abgenommen sein. Lokale Datenkonstrukte (Maps, Caches) in `src/lib/` nur als Ableitung, nie als Quelle.
13. **Keine Rolle ohne Sichtbarkeitsmatrix.** Bevor in Sprint 1 eine neue Rolle eingeführt wird, muss `03-rollenmatrix.md` definieren, welche Routes, Entities, Felder, Aktionen sie sieht/darf.
14. **Keine §20-/Reha-Spezialregel ohne Quellenangabe.** Subsidy-Logik (HealthInsurance.subsidy_per_course etc.) braucht `source_url` + `last_verified`, sonst wird sie nicht ausgespielt.

---

## 7. Vorhandene Bausteine — ehrliche Bewertung

Was wurde **schon gebaut** (Stand Commit `cca650d`)? Passt es zum Charter?

### Phase 1 + 2 — Customer Core (Commit `aa364f0`)
- `Customer.jsonc` als kanonische Personenakte mit `customer_status`, `profile_status`, `current_focus`, `data_quality_score`, `missing_required_fields`, externen Sync-Statuswerten (azh/themisoft/myyolo), aktive Referenz-Felder (`active_lead_id`, `active_consultation_id`, `active_reha_case_id` …).
- `upsertUnifiedCustomer` in `src/lib/customerDataModel.js` (+ Tests in `customerDataModel.test.js`).
- ConsultationFlow refactored, schreibt CRM-Artefakte (`Lead`, `ActivityLog`, `FollowUpTask`, `ContractDraft`) beim Closing.

**Bewertung — passt zum Charter:**
- Eine Person, mehrere Kontexte: **erfüllt**. `Customer` ist Anker, Vorgänge hängen daran.
- Lead nicht als eigene Person: **erfüllt**. `Lead.customer_id` zeigt auf Customer; Lead ist Pipeline-Kontext.
- Rehasportler nicht als eigene Person: **erfüllt**. `RehasportConsultation.customer_id` analog.

**Gap zum Charter:**
- `Customer` hat **trainingsspezifische Felder** (`training_goal`, `training_experience`, `restrictions`, `complaints`, `interest_*`) **und** ein separates `GoalProfile` existiert. Doppelte Datenhaltung → Quelle-der-Wahrheit-Konflikt. Charter-konform wäre: trainingsspezifische Felder aus `Customer` entfernen, ausschließlich in `GoalProfile` führen. (Sprint-2-Thema, nicht Sprint 0.)
- Kein `Employee`/`Staff`-Entity vorhanden. Briefing nennt "Mitarbeiter" als zweite zentrale Identität — fehlt komplett.

### Phase 3 — GoalProfile (Commit cca650d, Slice innerhalb)
- `GoalProfile.jsonc` mit `customer_id`, `primary_goal`, `secondary_goals`, `life_phase`, `confidence_score`, `source`, `status`.
- `src/lib/goalProfileModel.js` (`buildGoalProfilePayload`, `upsertGoalProfile`, `deriveGoalProfileSummary`).
- Quelle "consultation_neukunde", "consultation_rehasport", "manual", "lead_cockpit" — sauber.

**Bewertung — passt zum Charter:**
- Lebensphasen (`young_adult`, `family`, `silver`, `reha_entry`) entsprechen Charter-Personas.
- `confidence_score` ist ein erster Schritt Richtung Erfolgskriterium "Berater vergisst keine Frage mehr".
- Supersede-Logik vorhanden (nur ein aktives Profil pro Customer) → konsistent mit Personenakte-Idee.

**Gap zum Charter:**
- Quellenliste in Enum ist hartcodiert. Bei späterem Onboarding-Flow (Kunden-Frontend) braucht es `kunde_frontend` als Quelle. Trivial nachzuholen.
- Pain-Points sind in `GoalProfile.pain_points` UND in `Customer.complaints` UND in `RehasportConsultation.complaints`. Redundanz — Sprint-2-Aufräumen.

### Phase 4 — Personen-Cockpit + Sync-Readiness (Commit cca650d)
- `src/pages/PersonenCockpit.jsx` unter Route `/berater/personen`. Karten-Layout: Status-Badge, Fokus, Datenqualitäts-Progress, Kontext-Badges, Sync-Badges, Goal-Headline, "Person öffnen"-Button (stub — Detailansicht "folgt in Phase 5").
- `src/lib/syncReadiness.js` mit `evaluateSyncReadiness(customer)` und `summarizeSyncBadges(customer)` — reine Funktionen, getestbar, drei Zielsysteme (AZH/ThemiSoft/myYolo).
- `SyncJob.jsonc` und `ExternalReference.jsonc` als Skeleton-Entities.

**Bewertung — passt zum Charter:**
- "Kein blinder Sync"-Regel: **strukturell erfüllt**. `evaluateSyncReadiness` blockiert genau auf den im Briefing geforderten Pflichtfeldern (Krankenkasse, Versichertennummer, Datenschutz-Consent etc.).
- Rollenzuordnung: liegt unter `/berater/...` — passt zur Berater-Welt (Welt 3).
- Personen-Cockpit hat **bereits** Filter nach Status, Fokus, Volltextsuche — gute Basis für Sprint 2.

**Gap zum Charter:**
- "Person öffnen"-Button ist Toast-Stub. Personenakte als Detailansicht **fehlt komplett** — und genau das ist der zentrale Charter-Begriff. Sprint 2 muss diese Lücke schließen.
- Cockpit lädt 7 Entities einzeln (`Customer`, `Lead`, `Consultation`, `RehasportConsultation`, `FollowUpTask`, `GoalProfile`, `PrescriptionScan`) mit je 300 Records. Performance-Risiko bei größeren Datenmengen. Vermerk an Software Architect.
- Sync-Job-Trigger (Button "Jetzt syncen") existiert nicht. Aktuell zeigt das Cockpit nur Readiness an. Sprint 6 schließt diese Lücke.

### Vorhandene Routen (Inspektion `src/pages/`)
| Route | Welt im Charter | Status |
|---|---|---|
| `/berater/leads` (LeadCockpit) | Welt 3 | existiert |
| `/berater/personen` (PersonenCockpit) | Welt 3 | existiert (P4) |
| `/berater/rezepte` (PrescriptionIntake) | Welt 3 | existiert |
| `/consultation/*` (ConsultationFlow) | Welt 3 | existiert |
| `/rehasport/*` (RehasportFlow + 17 Unter-Screens) | Welt 3 | existiert, **sehr breit** |
| Admin (`/admin`), TariffBuilder, ServiceCatalog, RulesAdmin, InsuranceManager | Welt 1 (Management) | existiert |
| Trainer-Welt (Welt 2) | — | **fehlt komplett** |
| Kunden-Frontend (Welt 3b) | — | **fehlt komplett** |
| Studioleiter-Dashboard (Welt 1) | — | nur `Analytics.jsx`, kein Welt-1-Layout |

**Verdikt:** Die existierende Codebase ist eine **Berater-Welt mit Admin-Beimischung**. Welten 1, 2 und 3b sind nicht abgegrenzt. Das ist erwartbar (der frühere Stand hieß "AlbGym Empfehlungsnavigator 2.0", nicht "Nav"). Sprint 1 muss die Rollen-/Welten-Trennung im Routing- und Layout-System verankern, **bevor** neue Features hinzukommen.

---

## 8. Abnahmekriterien für MVP 1

Jedes Item ist binär (ja/nein) und Acceptance-Test-fähig. Kein "größtenteils", kein "weitgehend".

### A — Rollen & Navigation
- [ ] Mindestens 4 Rollen sind im System aktiv: Studioleitung, Trainer, Berater, Service. Jede mit eigener Sichtbarkeitsregel auf Routes.
- [ ] Beim Login wird Nutzer in seine Welt geleitet (Studioleiter → Management-Cockpit, Trainer → Heute-Liste, Berater → Personen-Cockpit, Service → eingeschränkte Berater-Sicht).
- [ ] Route `/admin` ist für Rolle "Trainer" nicht erreichbar (404 oder Redirect, nicht nur versteckter Link).

### B — Personenakte
- [ ] Klick auf eine Karte im Personen-Cockpit öffnet eine Detailansicht `/berater/personen/:customerId`.
- [ ] Detailansicht zeigt **alle** aktiven Kontexte zur Person: Lead, Beratung, Rehasport, Vertragsentwurf, Zielprofil, letzte Aktivitäten.
- [ ] Datenqualitäts-Score und fehlende Pflichtfelder sind sichtbar und linken in den passenden Edit-Flow.

### C — Rehasport-Aufnahme als Vorgang
- [ ] Rezeptscan startet **innerhalb** der Personenakte (Button "Rezept scannen" auf Personen-Detailansicht).
- [ ] Bei Scan-Upload wird automatisch `PrescriptionScan` erstellt, OCR/Vision läuft, `verified_data` ist editierbar, anschließend `RehasportConsultation.prescription_status = 'manual_review' → 'azh_pending'`.
- [ ] Krankenkasse wird gegen `HealthInsurance`-Entity geprüft; bei `approval_required = true` erscheint Warnung im UI.

### D — Beratungsnavigator
- [ ] Beratungsflow (Neukunde + Rehasport) startet aus Personenakte mit Pre-Fill aus Customer-Daten.
- [ ] Beim Closing werden `Lead`, `ActivityLog`, `FollowUpTask`, `ContractDraft` und ggf. neues `GoalProfile` geschrieben (bereits implementiert, regression-getestet).
- [ ] Kein Beratungsabschluss ohne `privacy_consent = true`.

### E — Admin-Grundstruktur
- [ ] Studioleitung kann: Tarife verwalten (existiert), Leistungen verwalten (existiert), Krankenkassen verwalten (existiert), Sync-Einstellungen sehen (NEU MVP 1).
- [ ] Studioleitung kann eine `Employee`-Liste sehen (NEU MVP 1: Entity + Listenansicht; Berechtigungs-Edit kann Sprint 7+ sein).

### F — Sync-Readiness UI
- [ ] Auf Personenakte ist pro Zielsystem (AZH, ThemiSoft, myYolo) sichtbar: aktueller Status, fehlende Felder, "Bereit für Sync"-Indikator.
- [ ] Klick auf "blockiert"-Badge zeigt konkrete Feldliste mit Edit-Link.
- [ ] Sync-Jobs werden als `SyncJob`-Entries gespeichert, auch wenn der eigentliche API-Call noch Stub ist.

### G — Trainer-Modul (Minimum)
- [ ] Trainer sieht "Heute"-Seite mit Terminen (aus `Appointment`) und fälligen `FollowUpTask`-Einträgen, die ihm zugewiesen sind.
- [ ] Trainer kann eine Krankmeldung erfassen (neuer kleiner Flow, NEU MVP 1).
- [ ] Trainer sieht **keine** Tarife, **keine** Krankenkassen, **keine** Sync-Einstellungen.

### H — Cross-Cutting
- [ ] Kein hartcodiertes Berater-Passwort mehr (bereits entfernt in Commit `277da3d`).
- [ ] Alle internen Routen sind durch Rollencheck geschützt (nicht nur durch Versteck im Menü).
- [ ] `npm run typecheck` und `npm run lint` laufen grün. `npm run build` ohne Warnings (jenseits bekannter Vendor-Hinweise).
- [ ] Mindestens ein Smoke-E2E pro Welt (Studioleiter / Trainer / Berater / Kunde) ist dokumentiert (kann manuell sein).

### I — Demobar
- [ ] In einer 30-Minuten-Demo kann der Studio-Owner sehen: Lead anlegen → Beratung führen → Rehasport-Vorgang anhängen → Vertragsentwurf erzeugen → Sync-Readiness prüfen. **Ohne Hilfe vom Berater.**

**Definition of MVP-1-Done:** Alle Items A–I sind grün. Das Briefing als auch dieser Charter sind nicht nachverhandelt. Risikoregister in `02-roadmap-mvp.md` hat keinen "Hoch+Offen"-Eintrag mehr.
