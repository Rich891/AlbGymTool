# AlbGym Nav — Rollenmatrix & Sichtbarkeit

Stand: Sprint 0, 2026-05-22. Quelle Soll: `docs/sprint-0/00-product-vision-raw.md`. Quelle Ist: aktuelle main-Branch.

---

## 1. Rollen-Definitionen (8 Rollen)

### 1.1 Studioleitung
- **Beschreibung:** Inhaber bzw. operative Leitung. Verantwortlich fuer Personal, Kennzahlen, Vertrags- und Tarifgestaltung, Krankenkassenvertraege, Sync mit ThemiSoft/myYolo.
- **Hauptaufgaben:** Mitarbeiter anlegen/zuweisen, Schichten festlegen, Tarife/Leistungen entscheiden, Krankenkassen pflegen, Analytics lesen, Sync-Fehler eskalieren.
- **Braucht:** Vollzugriff auf alles ausser Kundenfrontend; Analytics; Mitarbeiterverwaltung; Tarif/Vertragsregeln; Krankenkassen-CRUD; Sync-Konsole.
- **Braucht NICHT:** Kunden-Beratungsbuttons (sieht sie nur lesend zur Kontrolle).
- **Code heute:** Wird ueber `is_admin === true` oder Rolle `admin`/`administrator` abgebildet (`src/lib/advisorAccess.js:1-21`). Es existiert KEIN dediziertes Management-Layout — Studioleitung sieht heute exakt das gleiche Menue wie ein Berater (`src/components/layout/AdvisorLayout.jsx:21-33`).

### 1.2 Admin
- **Beschreibung:** Technischer/operativer Verwalter (z.B. Backoffice). Pflegt Stammdaten, repariert Datenprobleme, ueberwacht Sync-Jobs.
- **Hauptaufgaben:** Personenakten bereinigen, Lead-Pipeline reparieren, Sync-Konflikte aufloesen, Empfehlungsregeln pflegen.
- **Braucht:** Lesen+Schreiben auf alle Entities; Zugriff auf Sync-Jobs und ExternalReference; Regeln-Editor.
- **Braucht NICHT:** Eigenstaendige Personalentscheidungen (delegiert an Studioleitung); Kundenfrontend ausser Kontrollblick.
- **Code heute:** Identisch zu Studioleitung — beide Rollen kollabieren auf den `admin`-Key. **Es gibt keine Trennung zwischen Studioleitung und Admin im Code.** Siehe `src/lib/advisorAccess.js:12-13` (`admin` und `administrator` zeigen beide Label "Admin").

### 1.3 Berater
- **Beschreibung:** Verkaufs- und Beratungsfunktion. Fuehrt Welcome-Termine, Bedarfsanalyse, Empfehlung, Vertragsabschluss durch. Auch Erstkontakt bei Walk-Ins und Lead-Followup.
- **Hauptaufgaben:** Lead qualifizieren, Beratungsgespraech fuehren (`ConsultationFlow`), Rezept annehmen (`PrescriptionIntake`), Reha-Aufnahme (`RehasportFlow`), Vertrag vorbereiten.
- **Braucht:** Lead Cockpit, Personen-Cockpit, Beratungsnavigator, Tarif-/Leistungskatalog (lesen), Krankenkassen (lesen), Rezeptscan.
- **Braucht NICHT:** Tarife anlegen, Krankenkassen-CRUD, Mitarbeiterverwaltung, Schichtplan.
- **Code heute:** Hauptzielgruppe. Rollen-Keys `berater` und `advisor` sind synonym (`src/lib/advisorAccess.js:4-5`). Sieht das volle Sidebar-Nav inkl. Admin/Analytics/Regeln — also faktisch mehr als laut Charter erlaubt.

### 1.4 Trainer
- **Beschreibung:** Mitarbeiter auf der Flaeche. Betreuung der Mitglieder, Einweisungen, Kursdurchfuehrung, Tagesaufgaben.
- **Hauptaufgaben:** Tagesplan abarbeiten, Einweisungen geben, Kundenfragen klaeren, Krankmeldung absetzen, interne Hilfsanfragen, Statusupdate zu betreuten Kunden.
- **Braucht:** "Heute"-Liste, Meine Aufgaben, Meine Kunden, Termine, Krankmeldung-Button, Team-Nachrichten, Trainerbriefing aus Beratung.
- **Braucht NICHT:** Tarife, Krankenkassen, Vertraege, Lead-Pipeline-Management, Mitarbeiterverwaltung, Analytics, Regeln-Editor, Sync-Konsole.
- **Code heute:** Rolle `trainer`/`coach` ist im Advisor-Set definiert (`src/lib/advisorAccess.js:6-7`), bekommt aber das **identische volle Berater-Menue** (`AdvisorLayout.jsx:21-33`) inkl. Tarife, Regeln und Admin-Sektion. **Charter-Verletzung: Trainer sieht heute zwingend Tarife und Krankenkassen.**

### 1.5 Empfang
- **Beschreibung:** Erste Anlaufstelle vor Ort. Nimmt Walk-Ins entgegen, vergibt Termine, leitet an Berater weiter, Telefon-/Mail-Triage.
- **Hauptaufgaben:** Lead manuell anlegen, Termin eintragen, Probetraining buchen, Rezept entgegennehmen (Scan starten), Kundendaten aktualisieren.
- **Braucht:** Lead Cockpit (anlegen+bearbeiten), Personen-Suche, Termin-Buchung, Rezept-Upload-Funktion.
- **Braucht NICHT:** Tarif-Konditionen festlegen, Vertragsabschluss durchfuehren (gibt an Berater weiter), Mitarbeiterverwaltung, Analytics, Empfehlungsregeln.
- **Code heute:** **Keine Repraesentation.** Es gibt keinen `empfang`/`reception`-Key in `ADVISOR_ROLE_KEYS` (`src/lib/advisorAccess.js:1-10`). Ein Empfangsmitarbeiter haette heute entweder Vollzugriff (wenn als `advisor` markiert) oder gar keinen Zugriff.

### 1.6 Reha-Mitarbeiter
- **Beschreibung:** Spezialist fuer Reha-Aufnahme, Rezeptpruefung, Krankenkassen-Kommunikation, AZH/myYolo-Sync, §20-Bescheinigungen.
- **Hauptaufgaben:** Rezept scannen+pruefen, Folgeverordnungen bearbeiten, Reha-Kunde bei Kasse anmelden (myYolo/AZH), Teilnahmebescheinigung erstellen, Reha-Status pflegen.
- **Braucht:** Rezept-Intake, Personen-Cockpit gefiltert auf Reha-aktive, RehasportConsultation-CRUD, HealthInsurance-Liste, AZH-Sync-Status, Teilnahmebescheinigung-Export.
- **Braucht NICHT:** Standard-Lead-Pipeline (Meta Ads etc.), Tarif-Editor, allgemeine Vertragsverwaltung ausserhalb Reha, Personalplanung.
- **Code heute:** **Keine eigene Rolle.** Reha-Funktionalitaet liegt heute alles unter `advisor` (`RehasportAdvisorDashboard.jsx:23-21`). Es gibt **kein Berechtigungsfilter**, der einen Reha-Mitarbeiter auf Reha-Kontexte einschraenken wuerde.

### 1.7 Reinigung
- **Beschreibung:** Im Charter erwaehnt, aber Rolle unklar definiert. Vermutlich kein App-User im engeren Sinn, eher Empfaenger von Reinigungsplaenen oder Aufgaben.
- **Hauptaufgaben:** Reinigungsplan einsehen, Aufgaben abhaken, ggf. Mangelmeldung.
- **Braucht:** Sehr beschraenkter Read-Only-Bereich + Checkliste — wenn ueberhaupt App-User.
- **Braucht NICHT:** Alles andere.
- **Code heute:** **Keine Repraesentation.** Steht nur in der Vision-Roh-Liste (`00-product-vision-raw.md:98`). **Muss vom Studio-Owner explizit bestaetigt werden** (siehe Abschnitt 6).

### 1.8 Kunde
- **Beschreibung:** Endkunde des Studios. Nutzt das Beratungs-Frontend (HeroPage, ConsultationFlow, RehasportFlow) — entweder selbst am Tablet vor Ort oder gefuehrt durch einen Berater.
- **Hauptaufgaben:** Ziel waehlen, Bedarf angeben, Empfehlung sehen, Vertrag/Reha-Anmeldung bestaetigen, Unterschrift leisten.
- **Braucht:** HeroPage, ConsultationFlow-Steps, RehasportFlow, eigenes Zielprofil, eigene Vertragsuebersicht.
- **Braucht NICHT:** Alles Operative. Insbesondere darf der Kunde **niemals** Mitarbeiterdaten, andere Kunden, Tarifgestaltungslogik, Sync-Zustaende oder Lead-Pipeline-Eintraege sehen.
- **Code heute:** Es gibt keinen Kunden-Login. HeroPage und Flows sind **ungeschuetzt** unter `/`, `/beratung/:type`, `/rehasport` (`src/App.jsx:58-61`). Ein "Kunde" als authentifizierter Nutzer existiert nicht — heute ist es ein **anonymer Tablet-Modus**.

---

## 2. Funktionsmatrix

Legende: ✓ Vollzugriff (CRUD) · ✏ Anlegen/Bearbeiten ohne Loeschen · 👁 Nur lesen · ⚠ Bedingt (Fussnote) · ✗ Nicht sichtbar

| Funktion | Studio | Admin | Berater | Trainer | Empfang | Reha-MA | Reinigung | Kunde |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Lead-Verwaltung** (anlegen, qualifizieren, Status) | ✓ | ✓ | ✓ | ⚠¹ | ✏ | ⚠² | ✗ | ✗ |
| **Personen-Cockpit** (Liste, Suche) | ✓ | ✓ | ✓ | 👁³ | 👁 | 👁² | ✗ | ✗ |
| **Personenakte** (Detailansicht eines Kunden) | ✓ | ✓ | ✓ | 👁³ | 👁 | 👁² | ✗ | ⚠⁴ |
| **Beratungsnavigator** (`ConsultationFlow`) | 👁 | 👁 | ✓ | ✗ | ⚠⁵ | ✗ | ✗ | ⚠⁶ |
| **GoalProfile** (Ziel/Bedarf pflegen) | 👁 | ✓ | ✓ | 👁³ | ✗ | 👁² | ✗ | ⚠⁴ |
| **Rezept-Intake** (`PrescriptionIntake`) | 👁 | ✓ | ✓ | ✗ | ✏⁷ | ✓ | ✗ | ✗ |
| **Rehasport-Aufnahme** (`RehasportFlow`) | 👁 | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ⚠⁶ |
| **Vertrag/ContractDraft** | ✓ | ✓ | ✓ | ✗ | ⚠⁸ | ⚠² | ✗ | ⚠⁹ |
| **Tarife** (Editor, Baukasten) | ✓ | ✓ | 👁 | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Leistungskatalog** | ✓ | ✓ | 👁 | 👁³ | 👁 | 👁² | ✗ | ✗ |
| **Krankenkassen-CRUD** | ✓ | ✓ | 👁 | ✗ | 👁⁷ | ✓ | ✗ | ✗ |
| **Empfehlungsregeln (Scoring)** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Mitarbeiterverwaltung** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Rollen-/Berechtigungs-Setup** | ✓ | ✏ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Schichtplan / Arbeitszeit** | ✓ | ✏ | 👁¹⁰ | 👁¹⁰ | 👁¹⁰ | 👁¹⁰ | 👁¹⁰ | ✗ |
| **Krankmeldung Mitarbeiter** | 👁¹¹ | 👁¹¹ | ✏¹² | ✏¹² | ✏¹² | ✏¹² | ✏¹² | ✗ |
| **Tagesplan / "Heute"** | 👁 | 👁 | 👁 | ✓¹³ | 👁 | 👁 | 👁 | ✗ |
| **Meine Aufgaben** | 👁 | 👁 | ✓ | ✓ | ✓ | ✓ | ⚠¹⁴ | ✗ |
| **Team-Nachrichten / Interne Hilfe** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ⚠¹⁴ | ✗ |
| **Kursplanung / Kurskatalog** | ✓ | ✏ | 👁 | 👁 | 👁 | 👁 | ✗ | ✗ |
| **Buchung Probetraining/Termin** | ✓ | ✓ | ✓ | ⚠¹⁵ | ✓ | ✓ | ✗ | ⚠⁶ |
| **Sync-Konsole (ThemiSoft/myYolo)** | ✓ | ✓ | 👁¹⁶ | ✗ | ✗ | 👁²+✏ | ✗ | ✗ |
| **SyncJob / ExternalReference** | ✓ | ✓ | 👁 | ✗ | ✗ | ⚠² | ✗ | ✗ |
| **Analytics Studio (Umsatz, Conversion)** | ✓ | 👁 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Reha-Analytics (§20, Abschluesse)** | ✓ | 👁 | 👁 | ✗ | ✗ | 👁 | ✗ | ✗ |
| **§20-Teilnahmebescheinigung** | ✓ | ✓ | ✓ | ✗ | ⚠⁷ | ✓ | ✗ | 👁⁴ |
| **Beratungsverlauf / History** | ✓ | ✓ | 👁 | 👁³ | 👁 | 👁² | ✗ | ✗ |
| **Admin-Bereich (Stammdaten)** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Eigene Kundendaten (Selfservice)** | n/a | n/a | n/a | n/a | n/a | n/a | n/a | ✓ |

**Fussnoten zu bedingten Zellen:**

1. ⚠¹ Trainer sieht Leads nur, wenn er als zustaendiger Mitarbeiter zugewiesen ist (Briefing-Lesemodus), darf aber nicht qualifizieren oder umtaufen.
2. ⚠² Reha-Mitarbeiter sieht und bearbeitet ausschliesslich Personen mit Reha-Kontext (laufende `RehasportConsultation` oder `PrescriptionScan`). Verbergen aller Nicht-Reha-Leads/Vertraege.
3. ⚠³ Trainer sieht Personen-/Beratungsdaten nur fuer Kunden, die ihm zugewiesen sind. **Nie Tarif- oder Kassenfelder.**
4. ⚠⁴ Kunde sieht im Selfservice nur die eigene Personenakte (Name, Ziel, Vertragsstatus, Reha-Status, eigene §20-Bescheinigung).
5. ⚠⁵ Empfang kann den Beratungsnavigator **starten** (Termin/Tablet vorbereiten), aber nicht selbst die Empfehlung treffen oder Vertraege abschliessen.
6. ⚠⁶ Kunde sieht den Beratungs-/Rehaflow als gefuehrten Wizard (HeroPage → Flow), ohne Zugriff auf interne Tarif-/Regel-Listen, nur eigene Auswahl.
7. ⚠⁷ Empfang darf Rezept hochladen und Pflichtdaten vorerfassen, aber NICHT die Kasse final freigeben und NICHT die Bescheinigung erzeugen.
8. ⚠⁸ Empfang kann Vertragsdraft sehen (Status fuer Auskunft), aber keinen anlegen.
9. ⚠⁹ Kunde sieht den eigenen Vertrag/Vertragsentwurf (Tarif, Laufzeit, Preis).
10. ⚠¹⁰ Schichtplan: alle Mitarbeiter sehen den eigenen Plan; **fremde Plaene sehen sie nur, sofern Studioleitung dies pro Team freigibt** (Default: nein).
11. ⚠¹¹ Studioleitung/Admin sehen Krankmeldungen aller Mitarbeiter aggregiert.
12. ⚠¹² Jeder Mitarbeiter darf nur die eigene Krankmeldung anlegen/aendern.
13. ⚠¹³ Tagesplan ist die zentrale Trainer-Startseite — fuer andere Rollen optional.
14. ⚠¹⁴ Reinigung NUR, falls als App-User bestaetigt (siehe Abschnitt 6, offene Frage).
15. ⚠¹⁵ Trainer kann eine Folgesession (z.B. Einweisung) eintragen, aber keinen Vertragsabschlusstermin verbuchen.
16. ⚠¹⁶ Berater sieht Sync-Status pro Person (Badge im Personen-Cockpit), aber nicht die globale Sync-Konsole.

---

## 3. Sichtbarkeitsregeln je Rolle

### 3.1 Studioleitung — Default-Landing: `Management-Dashboard`
- **Sidebar:** Dashboard · Mitarbeiter · Schichten · Personen · Leads · Reha-Faelle · Tarife · Leistungen · Krankenkassen · Regeln · Analytics · Sync · Admin
- **Quick-Actions:** "Neuer Mitarbeiter", "Schicht eintragen", "Tarif vergleichen", "Sync-Probleme oeffnen"
- **Sieht NICHT als Default:** die rohen Beratungs-Wizards (er kann sie oeffnen, hat aber keinen Shortcut darauf).

### 3.2 Admin — Default-Landing: `Admin-Cockpit` (Stammdaten + Sync)
- **Sidebar:** Personen · Leads · Reha-Faelle · Tarife · Leistungen · Krankenkassen · Regeln · Sync · Stammdaten · Audit-Log
- **Quick-Actions:** "Sync-Job pruefen", "Person zusammenfuehren", "Regel anpassen"
- **Sichtbarkeitsregel:** sieht alle Daten, aber **keine Personal-Entscheidungen** (Einstellungen, Gehaelter etc.)

### 3.3 Berater — Default-Landing: `Lead Cockpit` (oder `Personen-Cockpit`, Owner entscheidet)
- **Sidebar:** Personen · Leads · Beratung · Reha-Aufnahme · Leistungen (lesen) · Tarife (lesen) · Verlauf · Termine
- **Quick-Actions:** "Lead erfassen", "Welcome starten", "Rezept scannen", "Reha-Aufnahme"
- **Sichtbarkeitsregel:** kein Mitarbeiter-/Schicht-/Regel-Editor.

### 3.4 Trainer — Default-Landing: `Heute` (Tagesplan)
- **Sidebar:** Heute · Meine Aufgaben · Meine Kunden · Termine · Krankmeldung · Team-Nachrichten
- **Quick-Actions:** "Krankmeldung absetzen", "Hilfsanfrage stellen", "Kunden notieren"
- **Sichtbarkeitsregel:** **NIE** Tarife, Krankenkassen, Vertraege, Pipeline-Status. Sieht Trainerbriefing (`crmModel.js:249-260`) als zusammengefasste Kacheln.

### 3.5 Empfang — Default-Landing: `Empfangs-Cockpit`
- **Sidebar:** Walk-Ins/Heute · Leads · Personen-Suche · Termine · Rezept-Upload
- **Quick-Actions:** "Walk-In erfassen", "Termin buchen", "Rezept hochladen"
- **Sichtbarkeitsregel:** kein Vertragsabschluss, keine Tarif-Kommunikation in Zahlen — verweist auf Berater.

### 3.6 Reha-Mitarbeiter — Default-Landing: `Reha-Aufnahme-Cockpit`
- **Sidebar:** Reha-Faelle · Rezepte · Krankenkassen · Bescheinigungen · myYolo/AZH-Sync · Reha-Analytics
- **Quick-Actions:** "Rezept scannen", "Folgeverordnung pruefen", "Teilnahmebescheinigung erstellen"
- **Sichtbarkeitsregel:** Filter auf Reha-Personen; keine allgemeinen Tarif-/Lead-Inhalte.

### 3.7 Reinigung (falls App-User) — Default-Landing: `Reinigungsplan`
- **Sidebar:** Heute · Aufgaben · Mangel melden
- **Quick-Actions:** "Aufgabe abhaken", "Mangel melden"
- **Sichtbarkeitsregel:** keinerlei Personen-/Mitarbeiter-/Vertragsdaten.

### 3.8 Kunde — Default-Landing: `HeroPage` (oder eigene Akten-Startseite)
- **Sidebar:** keine — gefuehrter Wizard mit grossen Tiles.
- **Quick-Actions:** "Mein Ziel waehlen", "Reha starten", "Beratung starten", "Mein Vertrag"
- **Sichtbarkeitsregel:** sieht **nur** eigene Daten + Wizards.

---

## 4. Aktueller Code-Stand vs. Soll

### 4.1 Heutige Rollen-Keys
- Definiert in `src/lib/advisorAccess.js:1-10`:
  - `admin`, `administrator`
  - `berater`, `advisor`
  - `trainer`, `coach`
  - `service`, `sales`
- Labels in `src/lib/advisorAccess.js:12-21` (z.B. `service` → `Service`, `sales` → `Sales`).
- Admin-Bypass: `user.is_admin === true || user.isAdmin === true` (`advisorAccess.js:62-64`).

### 4.2 Heute fehlende Rollen
- **`studio_lead` / `studioleitung`** — nicht im Set. Heute kollabiert auf `admin`.
- **`empfang` / `reception`** — fehlt komplett. Empfangsmitarbeiter haben heute entweder Vollzugriff oder gar keinen.
- **`reha_mitarbeiter` / `reha_staff`** — fehlt. Reha-Bereich ist Teilmenge von `advisor`.
- **`reinigung` / `cleaning`** — fehlt. (Offen, ob ueberhaupt App-User; siehe Abschnitt 6.)
- **`kunde` / `customer` / `member`** — fehlt als authentifizierter User-Typ. Kunde ist heute anonym am Tablet.

### 4.3 Unklare / redundante Keys
- `service` und `sales` (`advisorAccess.js:8-9`) sind im Set, werden aber **nirgends** gesetzt oder geprueft. Sie schalten faktisch nur das Berater-Layout frei und sind **Zombie-Keys** — vermutlich Altlasten.
- `coach` (`advisorAccess.js:7`) ist Alias fuer `trainer`, wird aber im Code nirgends explizit verwendet.

### 4.4 Heute fehlende Schutzmechanismen
- **`AdvisorLayout.jsx:21-33` zeigt jedem Berechtigten dasselbe Sidebar-Menue.** Es gibt keine `if role === trainer hide tarife`-Logik. **Konsequenz: Ein Trainer sieht heute zwingend Tarife, Krankenkassen und Admin-Sektion.** Das ist eine **direkte Verletzung von Charter-No-Go #4** (`00-product-vision-raw.md:140`).
- **Es existiert kein Reha-Filter.** `RehasportAdvisorDashboard.jsx:30-44` laedt alle Reha-Beratungen, aber jeder Advisor sieht sie — kein scoping auf "nur eigene" oder "nur Reha-Rolle".
- **Routes wie `/berater/admin`, `/berater/regeln`, `/berater/analytics` (`src/App.jsx:79-81`) sind durch `ProtectedAdvisorRoute` geschuetzt, aber nicht durch eine zweite Stufe.** Ein einfacher `advisor` darf heute den Admin-Bereich oeffnen.
- **Kundenfrontend hat keinen Schutz.** `/`, `/beratung/:type`, `/rehasport` (`src/App.jsx:58-61`) sind oeffentlich. Wenn ein Kunde-Login eingefuehrt wird, muss eine Trennung "Kunde sieht eigenes Profil, niemand anderen" eingezogen werden.

### 4.5 Berechnete Lueckenliste fuer MVP 1
| Soll-Rolle | Heute vorhanden? | Quelle/Datei | Aktion fuer MVP |
|---|---|---|---|
| Studioleitung | Nein (fehlt) | `advisorAccess.js:1-10` | Neuer Key `studio_lead`, eigene Landing, Mitarbeiter-Tab |
| Admin | Ja (`admin`) | `advisorAccess.js:1,12` | Bestehen lassen, Sichtbarkeit eingrenzen |
| Berater | Ja (`berater`/`advisor`) | `advisorAccess.js:4-5` | Sidebar entschlacken (Admin/Regeln raus) |
| Trainer | Ja (`trainer`/`coach`) | `advisorAccess.js:6-7` | **Eigenes Trainer-Layout zwingend** (heute identisch zu Berater) |
| Empfang | Nein (fehlt) | — | Neuer Key `empfang`, neues Layout |
| Reha-Mitarbeiter | Nein (Sub-Funktion von advisor) | `RehasportAdvisorDashboard.jsx` | Neuer Key `reha_staff`, scoping auf Reha-Faelle |
| Reinigung | Nein (Vision-Erwaehnung) | `00-product-vision-raw.md:98` | **Klaerung mit Owner zuerst** |
| Kunde | Nein (anonymer Wizard) | `App.jsx:58-61` | Spaeter MVP — heute noch kein Login |

---

## 5. Kritische Trennlinien (No-Go-Regeln in Rollen-Begriffen)

1. **Trainer ↛ Tarife / Krankenkassen / Vertraege.** Heute verletzt (`AdvisorLayout.jsx:21-33`). Trainer-Layout muss eigene Nav-Definition bekommen.
2. **Kunde ↛ Mitarbeiterdaten / andere Kunden / Sync-Konsole / Pipeline-Stages.** Heute zwar nicht verletzt (kein Kundenlogin existiert), wird aber bei Einfuehrung der Personenakte fuer Selfservice kritisch.
3. **Reha-Mitarbeiter ↛ Standard-Verkaufs-Lead-Pipeline.** Heute teilweise verletzt — Reha-Berater sieht heute alle Leads und alle Beratungen.
4. **Empfang ↛ Vertragsabschluss.** Heute n/a, weil Rolle fehlt. Bei Einfuehrung darf Empfang Termin/Lead anlegen, aber keinen finalen Vertrag.
5. **Berater ↛ Mitarbeiterverwaltung / Empfehlungsregeln-Editor.** Heute verletzt — Berater sieht `/berater/regeln` (`App.jsx:81`).
6. **Studioleitung ↛ direkter Eingriff in einzelne Kunden-Wizards.** Soll Daten lesen, aber nicht die Beratung selbst durchspielen (Owner-Entscheidung — siehe Abschnitt 6).
7. **Reinigung ↛ alle Personen- und Vertragsdaten.** Nur eigene Aufgaben/Plaene.
8. **Reha-Mitarbeiter ↛ Tarife des Mitgliederbereichs.** Sieht nur Reha-Tarife (`RehasportTariff`), nicht Standard-`Tariff`.
9. **Alle Nicht-Studio/Admin ↛ Audit-Log / Sync-Konsole / Rollen-Setup.**
10. **Kunde ↛ jegliche Datenoperationen ueber das eigene Profil hinaus.** Inklusive "Kunden vor mir in der Pipeline sehen".

---

## 6. Offene Fragen fuer Studio-Owner

| # | Frage | Warum entscheidend |
|---|---|---|
| F1 | **Ist "Reinigung" wirklich ein App-User?** Wenn ja: bekommt sie ein eigenes Tablet/Login, oder reicht ein gemeinsames Empfang-Geraet? | Bestimmt, ob wir uebernehmen oder rauswerfen. Wenn raus, sparen wir Rolle + UI. |
| F2 | **Trennung Studioleitung vs. Admin:** Sind das zwei Personen, oder ist Studioleitung = Admin? Heute kollabiert auf einen Key. | Wenn identisch, behalten wir `admin`. Wenn getrennt, brauchen wir `studio_lead` + neues Layout. |
| F3 | **Darf Empfang Vertraege erfassen, oder nur Lead/Termin?** | Bestimmt Empfangs-Funktionsmatrix-Zelle bei "Vertrag". |
| F4 | **Darf Trainer den Beratungsnavigator selbst starten?** (z.B. wenn er auf der Flaeche einen Walk-In hat und kein Berater da ist.) | Heute koennen sie es. Charter sagt nein. Wir brauchen klare Antwort. |
| F5 | **Sollen Kunden langfristig einen eigenen Login bekommen (Selfservice)?** | Bestimmt, ob HeroPage anonym bleibt oder zu einer Personen-Akten-Eingangsseite wird. |
| F6 | **Wer darf §20-Teilnahmebescheinigungen erzeugen?** Heute jeder Advisor (`RehasportAdvisorDashboard.jsx:160-166`). Charter macht das eher zur Reha-Mitarbeiter-Aufgabe. | Compliance-Frage. |
| F7 | **Sieht ein Trainer "seine Kunden" anhand einer Zuweisung, oder anhand der Schicht (alle Kunden die heute trainieren)?** | Bestimmt, ob wir ein `assigned_trainer_id`-Feld brauchen oder einen Schicht-Plan-Query. |
| F8 | **Sollen Reha-Mitarbeiter Standard-Leads (Nicht-Reha) ueberhaupt sehen koennen — z.B. weil Reha-Kunde spaeter Mitglied wird?** | Bestimmt, ob Scoping hart oder weich ist. |
| F9 | **Wer pflegt Empfehlungsregeln (Scoring)?** Studioleitung selbst oder ist das Admin-only? | Bestimmt Sichtbarkeit von `/berater/regeln`. |
| F10 | **Gibt es Schichten/Krankmeldungen schon heute irgendwo (z.B. Excel)?** Wenn ja: welches Datenformat? | Beeinflusst Datenmodell — heute existiert KEINE Mitarbeiter-/Schicht-Entity (`base44/entities/*.jsonc`). |
