# AlbGym Nav — Studio-Prozesse

Stand: Sprint 0, 2026-05-22. Praxis-Workflows aus Studio-Sicht. Pro Prozess: Auslöser, Beteiligte, Schritte, erzeugte Daten, Folgeaktionen, heutige Repraesentation im Code.

---

## Process A: Lead kommt rein (Meta-Ad, Walk-In, Empfehlung)

- **Ausloeser:** Externer Kontakt: Meta-Formular-Submission, Instagram-DM, Walk-In am Empfang, telefonischer Anruf, Empfehlung durch Mitglied, Superchat-Konversation.
- **Beteiligte:** Empfang (bei Walk-In/Telefon), Berater (bei direkten DMs), Studioleitung (Eskalation), Admin (Datenpflege).

**Schritte:**
1. Erstkontakt landet beim Studio (Channel-abhaengig).
2. Empfang/Berater oeffnet **Lead Cockpit** (`/berater/leads`) und klickt "Lead erfassen" → Formular Vorname/Nachname/Telefon/E-Mail/Quelle/Hauptziel.
3. System legt `Lead` mit Status `NEW_LEAD` an (`crmModel.js:1-7`), `next_action_at = jetzt`, `created_from = lead_cockpit`.
4. System legt automatisch einen `ActivityLog`-Eintrag `lead.created` an (`LeadCockpit.jsx:90-101`).
5. Lead taucht im Cockpit auf, sortiert nach `next_action_at` (faellige zuerst).
6. Berater entscheidet Pipeline-Stage (Dropdown). Wenn `QUALIFIED` → System empfiehlt Terminlink senden (`crmModel.js:14-19`, Spalte "action").

**Erzeugte Daten:**
- `Lead` (Entity vorhanden, `base44/entities/Lead.jsonc`).
- `ActivityLog` (Entity vorhanden, `base44/entities/ActivityLog.jsonc`).
- Optional: `Customer`-Datensatz noch NICHT — entsteht erst bei Beratung (siehe Process B).

**Folgeaktionen / Trigger:**
- Wenn `next_action_at` ueberfaellig → erscheint im Metrik-Tile "Faellig" (`LeadCockpit.jsx:167-175`).
- Wenn Stage `QUALIFIED` → Berater sendet Terminlink (heute manuell), spaeter SimplyBook.me-Trigger.

**Heutige Repraesentation:**
- ✅ `Lead`-Entity, Pipeline-Stages (`crmModel.js:1-74`), Quelle-Liste (`crmModel.js:76-85`).
- ✅ Manuelle Erfassung im Lead Cockpit (`LeadCockpit.jsx:79-110`).
- ❌ **Kein automatischer Meta-Ads-Import.** Heute muss jedes Meta-Lead manuell uebertragen werden.
- ❌ **Kein Walk-In-Schnelltool fuer Empfang** (Empfang hat heute gar keinen Zugang, siehe Rollenmatrix Abschnitt 1.5).
- ❌ **Kein Superchat-Anschluss.** Quelle `superchat` ist nur als Label definiert (`crmModel.js:83`), kein Import-Mechanismus.

**Praxis-Problem:** Heute liegt der Lead-Eintrag bei der **gleichen Person** wie das Beratungsgespraech (Berater = Empfang = Lead-Owner). Sobald Empfang als eigene Rolle dazukommt, muss klar sein, wer den `assigned_advisor` setzt.

---

## Process B: Welcome-Termin / Beratung

- **Ausloeser:** Lead hat Termin (Stage `APPOINTMENT_BOOKED`) — entweder Walk-In, Online-Buchung oder telefonisch vereinbart. Tablet im Beratungsraum wird vorbereitet.
- **Beteiligte:** Berater (fuehrt das Gespraech), Kunde (am Tablet), evtl. Empfang (Vorbereitung).

**Schritte:**
1. Berater oeffnet Lead-Karte im Cockpit, klickt "Welcome starten" → Route `/beratung/welcome?lead=<id>` (`LeadCockpit.jsx:380-385`).
2. **ConsultationFlow** laedt — Schritt 0 `CustomerStep` (Stammdaten).
3. Schritt 1 `AnamnesisStep` — Vorerkrankungen, Beschwerden, Kontraindikationen.
4. Schritt 2 `GoalStep` — Zielwahl (Mehrfachauswahl: Gesundheit/Figur/Leistung/Reha/Zuschuss aus `crmModel.js:87-93`).
5. Schritt 3 `AnalysisScreen` — automatische Analyse-Animation (`ConsultationFlow.jsx:248-252`).
6. Schritt 4 `RecommendationStep` — System schlaegt Tarif + Addons vor (aus `Service`/`Tariff`/`RecommendationRule`, geladen in `ConsultationFlow.jsx:43-54`).
7. Schritt 5 `ClosingStep` — Kunde entscheidet: `abschluss` / `testphase` / `angebot` / `no_show`.
8. `handleClose` triggert die zentrale Speicherkette (`ConsultationFlow.jsx:59-192`):
   - Consent-Snapshot (`enrichCustomerWithConsentSnapshot`).
   - `upsertUnifiedCustomer` → `Customer`-Datensatz wird angelegt/aktualisiert.
   - `upsertGoalProfile` → `GoalProfile`-Datensatz mit ausgewaehlten Zielen.
   - `Consultation` wird erstellt.
   - `syncConsultationCrmArtifacts` (`crmAutomation.js:21-110`) updated den `Lead` oder legt einen neuen an, schreibt `ActivityLog`, ggf. `FollowUpTask` (bei Angebot), ggf. `ContractDraft` (bei Abschluss/Testphase).
   - `Customer` bekommt `active_*_id`-Pointer auf alle erzeugten Artefakte.

**Erzeugte Daten:**
- `Customer` (created oder updated).
- `GoalProfile` (created/updated).
- `Consultation` (always created).
- `Lead` (updated, falls schon vorhanden — sonst created).
- `ActivityLog` (always created).
- `FollowUpTask` (nur wenn Outcome = `angebot`).
- `ContractDraft` (nur wenn Outcome = `abschluss` oder `testphase`).

**Folgeaktionen / Trigger:**
- Bei `abschluss`: `ContractDraft.status = 'ready'`, Stage des Leads → `CONVERTED` (`crmModel.js:130-136`). ThemiSoft-Sync soll vorbereitet werden (heute manuell).
- Bei `testphase`: `next_action_at = +7 Tage` (`crmModel.js:138-143`), Stage → `TRIAL_STARTED`.
- Bei `angebot`: `FollowUpTask` faellig morgen, Stage → `OFFER_OPEN`.
- Bei `no_show`: Stage → `NO_SHOW`, manuelle Reaktivierung noetig.

**Heutige Repraesentation:**
- ✅ ConsultationFlow komplett implementiert inkl. CRM-Sync (`ConsultationFlow.jsx:30-192`).
- ✅ Recommendation-Engine basiert auf `RecommendationRule`-Entity.
- ✅ Trainerbriefing wird in `crmModel.js:249-260` aus dem Lead abgeleitet — kann an Trainer weitergereicht werden.
- ❌ **Kein expliziter Berater-Auswahlschritt am Anfang.** Lead `assigned_advisor` wird nirgends gesetzt — der Berater bleibt anonym im Datensatz.
- ❌ **Kein Schritt "Kunde am Tablet" vs "Berater im Backoffice".** Heute durchlaeuft ein einziger Bildschirm beide Welten.

**Praxis-Problem:** Der `ConsultationFlow` ist sehr datenreich, aber wenn das Tablet abstuerzt zwischen Step 4 und 5, gehen alle Eingaben verloren — es gibt keinen Zwischenspeicher. State lebt nur in `useState` (`ConsultationFlow.jsx:36-41`).

---

## Process C: Rezept-Annahme & Rehasport-Aufnahme

- **Ausloeser:** Person kommt mit Rezept (Formular 56) zum Studio — entweder als Lead, der zur Rehasport-Beratung gewandelt wurde, oder als Walk-In ohne Vorgeschichte, oder als Bestandskunde (siehe Process D).
- **Beteiligte:** Empfang (Annahme, Scan), Reha-Mitarbeiter (Pruefung, Kasse, Vorgang), Berater (bei kombiniertem Termin).

**Schritte (Neu-Aufnahme):**
1. Empfang/Reha-Mitarbeiter oeffnet **PrescriptionIntake** (`/berater/rezepte`).
2. Foto/Scan/PDF des Rezepts hochladen (`PrescriptionIntake.jsx:96-104`).
3. Klick "Rezept auslesen" → `extractPrescriptionDataWithRetry` (`PrescriptionIntake.jsx:124-167`) — OCR via Formular-56-Pipeline mit Vision-Fallback.
4. Daten landen im Formular (`form`-State, `PrescriptionIntake.jsx:38`). Reha-Mitarbeiter prueft Felder manuell.
5. System schlaegt **Kandidaten-Kunden** vor, basierend auf Versichertennummer/E-Mail/Geburtsdatum (`PrescriptionIntake.jsx:74-90`).
6. Reha-Mitarbeiter entscheidet: "Neue Kundendatei anlegen" oder bestehenden Kandidaten waehlen.
7. Klick "Speichern" (`PrescriptionIntake.jsx:169-263`):
   - `upsertUnifiedCustomer` (anlegen/aktualisieren).
   - `PrescriptionScan` wird erstellt (mit Datei-Meta, OCR-Status).
   - `RehasportConsultation` wird erstellt (Reha-Vorgang).
   - Cross-Links: `PrescriptionScan.rehasport_consultation_id` und `Customer.last_prescription_scan_id`/`last_rehasport_consultation_id`.
   - `Customer.azh_sync_status = 'not_started'`.
   - `ActivityLog` `prescription.scan_saved` (`PrescriptionIntake.jsx:230-241`).
8. **Welcome-Termin optional** — falls noch nicht passiert, wird vom Reha-Mitarbeiter manuell ein Beratungstermin gebucht.

**Erzeugte Daten:**
- `PrescriptionScan` (mit OCR-Status `extracted` / `manual_review` / `failed`).
- `RehasportConsultation` (Status erstmal `offen`).
- `Customer` (created/updated).
- `ActivityLog`.

**Folgeaktionen / Trigger:**
- AZH-Sync ist initial `not_started`. Reha-Mitarbeiter triggert manuell die Anmeldung bei der Kasse (myYolo/AZH).
- Falls Rezept-Felder fehlen (z.B. ICD-Code, Frequenz): das Formular bleibt offen, Status `manual_review` (`PrescriptionIntake.jsx:531-533`).
- Bei vollstaendigem Rezept: Person wechselt im Personen-Cockpit auf Status `Reha aktiv` (`customerDataModel`).

**Heutige Repraesentation:**
- ✅ Voll funktionaler Rezept-Intake mit OCR + Vision-Fallback (`PrescriptionIntake.jsx`).
- ✅ Cross-Linking zu `Customer`, `PrescriptionScan`, `RehasportConsultation`.
- ✅ AZH-Sync-Status-Feld vorhanden (`PrescriptionIntake.jsx:227`).
- ❌ **Kein automatisches AZH/myYolo-Push.** Heute nur `not_started`-Marker.
- ❌ **Keine Folgeverordnungs-Erkennung.** `follow_up_prescription`-Checkbox vorhanden, aber keine Logik die alte Rezepte verknuepft.
- ❌ **Kein Hinweis, ob Krankenkasse §20-Zuschuss leistet.** Wird erst im RehasportFlow geprueft.

**Praxis-Problem:** Heute laeuft der Rezept-Intake **getrennt** vom `RehasportFlow` (`/rehasport`). Der RehasportFlow erstellt ebenfalls eine `RehasportConsultation` (`RehasportFlow.jsx:108-136`), ohne den Rezeptscan zu nutzen. **Zwei Wege erzeugen den gleichen Datensatz, ohne sich zu kennen.** Das muss konsolidiert werden.

---

## Process D: Bestandskunde bringt neues Rezept

- **Ausloeser:** Person ist bereits Mitglied (Status `MEMBER`) oder hatte bereits eine `RehasportConsultation` und kommt mit Folgeverordnung.
- **Beteiligte:** Reha-Mitarbeiter, Bestandskunde.

**Schritte:**
1. Kunde meldet sich am Empfang/Tablet.
2. Bei Tablet: `/rehasport` (HeroPage-Tile, `HeroPage.jsx:18-23`) → RehasportFlow → `RehaStart` mit Auswahl "Bestandskunde" → `BestandFlow` startet (`RehasportFlow.jsx:84-87`).
3. `BestandWelcome` zeigt zwei Optionen: "Rehasport erneuern" oder "Ich moechte mehr tun" (`BestandWelcome.jsx:4-20`).
4. Pfad **Erneuern**: `BestandProfileSelect` → `BestandPrescriptionHistory` → `BestandUsedMeasures` → `BestandEvaluation` → `BestandFutureGoals` → `BestandDeficits` → `BestandImprovement` → `BestandAnalysis` → `BestandRecommendation` (alle in `src/pages/rehasport/bestand/`).
5. Pfad **Mehr**: `MehrFlow` mit 10 Steps (`MehrFlow.jsx:16-27`) — MainGoals → FocusPoints → Questions → Analysis → Recommendation → Package → BeforeClosing → Signature → Booking → Abschluss.
6. Am Ende wird wieder eine `RehasportConsultation` angelegt — diesmal mit Bezug auf vorherigen Vorgang.

**Erzeugte Daten:**
- Neue `RehasportConsultation` (mit Vermerk Folgeverordnung).
- Optional `ContractDraft` (bei Mehr-Pfad und Vertragsabschluss).
- `ActivityLog`.

**Folgeaktionen / Trigger:**
- Folgeverordnungs-Sync zur Kasse (heute manuell).
- Eintrag im Personen-Cockpit, dass Reha verlaengert wurde.

**Heutige Repraesentation:**
- ✅ Sehr ausgepraegter Bestandsflow (`BestandFlow.jsx`) und Mehr-Flow (`MehrFlow.jsx`) — beide implementiert.
- ✅ Recommendation-Logik in `BestandRecommendation.jsx` und `recommendationLogic.jsx`.
- ❌ **Keine Verknuepfung zwischen `BestandFlow` und der bestehenden `RehasportConsultation` des Kunden.** Der Flow erkennt nicht, dass dieselbe Person frueher schon ein Rezept hatte (`RehasportFlow.jsx:84-87` ruft `BestandFlow` ohne Customer-Argument).
- ❌ **Profile-Select sucht nach `customer_name`/`birthdate`**, nicht nach `Customer.id` — der Bestandsflow lebt parallel zur Unified-Customer-Welt.

**Praxis-Problem:** Heute ist der Bestandskunde-Flow **eine Insel**. Er erstellt frische `RehasportConsultation`-Datensaetze, ohne den Unified Customer-Datensatz zu nutzen. Das fuehrt zu Karteileichen im Personen-Cockpit (mehrere Reha-Vorgaenge zu derselben Person, ohne klare Reihenfolge).

---

## Process E: Abschluss / Vertrag

- **Ausloeser:** Beratung endet mit Outcome `abschluss` oder Reha-Aufnahme schliesst mit Signatur ab.
- **Beteiligte:** Berater (bei Mitgliedervertrag), Reha-Mitarbeiter (bei Reha-Vertrag), Kunde, Studioleitung (Eskalation Konditionen), Admin (Sync ThemiSoft).

**Schritte (Mitgliedervertrag):**
1. Outcome im ConsultationFlow = `abschluss`.
2. System legt `ContractDraft` mit Status `ready` an (`crmModel.js:213-226`).
3. `Lead.status = CONVERTED`, `next_action_at = null`.
4. `Customer.active_contract_draft_id` wird gesetzt.
5. Berater druckt/erzeugt Vertrag (heute extern, ggf. ThemiSoft).
6. Kunde unterschreibt.
7. Berater traegt Vertragsbeginn ein, markiert Vertrag als final.
8. Admin/Studioleitung synct nach ThemiSoft (heute manuell).

**Schritte (Reha-Vertrag):**
1. Im `RehasportFlow` Schritt `RehaSignature` → Kunde unterschreibt am Tablet.
2. `RehaBooking` → Termin fixieren.
3. `RehaContract` Step → `RehasportConsultation.status = 'abgeschlossen'` (`RehasportFlow.jsx:108-131`).
4. Optional `generateLaufschuleVertrag.jsx` oder `generateTeilnahmebescheinigung.jsx` (PDF-Erzeugung).

**Erzeugte Daten:**
- `ContractDraft` (Mitglieder).
- Aktualisierter `RehasportConsultation` (Reha).
- Optional PDF-Dokumente.
- `ActivityLog` (heute nicht automatisch, ggf. manuell).

**Folgeaktionen / Trigger:**
- ThemiSoft-Anlage des Vertrags.
- Begruessungsmail an Kunden.
- Trainer-Briefing fuer ersten Termin (`crmModel.js:249-260`).

**Heutige Repraesentation:**
- ✅ `ContractDraft`-Entity vorhanden (`base44/entities/ContractDraft.jsonc`).
- ✅ Reha-Signatur-Flow implementiert.
- ❌ **Kein ThemiSoft-Push.** `themisoft_reference: null` (`crmModel.js:223`) — Feld vorbereitet, aber kein Sync.
- ❌ **Kein Begruessungsmail-Trigger.**
- ❌ **Keine Vertragslebenszyklus-Verwaltung** (Aktivierung, Kuendigung, Pausierung).

**Praxis-Problem:** Der Berater muss heute manuell daran denken, den ContractDraft tatsaechlich nach ThemiSoft zu uebertragen. Es gibt keine Erinnerung, keinen Status `pending_sync` der ihn ans Cockpit zurueckholt.

---

## Process F: Trainerischer Alltag (Tagesplan, Aufgaben)

- **Ausloeser:** Trainer beginnt Schicht. Will sehen, was heute ansteht.
- **Beteiligte:** Trainer, ggf. Studioleitung (gibt Aufgaben rein).

**Schritte (Soll):**
1. Trainer loggt sich ein → Default-Landing `Heute`.
2. Sieht: heutige Termine, zugewiesene Kunden (Trainerbriefing aus Beratung), offene Aufgaben, Hilfsanfragen, Krankmeldung-Button.
3. Klickt auf Kunde → minimale Personenkarte (Name, Ziel, Vertragsstart, Trainerhinweise) — **keine Tarif-/Kassendaten**.
4. Klickt "Aufgabe abhaken" oder "Hilfsanfrage stellen".
5. Bei Krankheit: Klick "Krankmeldung" → Mitarbeiter-Tabelle bekommt Eintrag.

**Erzeugte Daten:**
- `Task` (heute nicht existent).
- `HelpRequest` (heute nicht existent).
- `SickLeave` (heute nicht existent).

**Folgeaktionen / Trigger:**
- Krankmeldung → Studioleitung sieht offene Schichten zur Umverteilung.
- Hilfsanfrage → Push an Studioleitung/erfahrenen Kollegen.

**Heutige Repraesentation:**
- ❌ **Nichts davon existiert.** Es gibt weder eine Heute-Page, noch Tasks, noch HelpRequest, noch SickLeave.
- ❌ Trainer hat heute das volle Berater-Layout (`AdvisorLayout.jsx:21-33`) — schaut zwingend auf Tarife/Regeln. Charter-Verletzung.
- ❌ Es gibt zwar `buildTrainerBriefing` (`crmModel.js:249-260`), aber kein UI das es dem Trainer zeigt.

**Praxis-Problem:** Trainer-Tool ist heute praktisch nicht existent. Charter sagt: "Heute, Meine Aufgaben, Meine Kunden, Termine, Krankmeldung, Team-Nachrichten" (`00-product-vision-raw.md:101`). Der gesamte Bereich muss in MVP 1 noch nicht voll gebaut werden (laut Vision NICHT-MVP — `00-product-vision-raw.md:128-133`), aber die **Rollensicht** muss trotzdem sauber sein, damit Trainer keine Berater-Inhalte sehen.

---

## Process G: Krankmeldung Mitarbeiter

- **Ausloeser:** Mitarbeiter ist krank. Mobil oder vor Ort.
- **Beteiligte:** Mitarbeiter (alle Rollen), Studioleitung (sieht Eintrag), Admin (Auswertung).

**Schritte (Soll):**
1. Mitarbeiter klickt "Krankmeldung" im eigenen Layout.
2. Formular: von wann/bis wann, Grund optional, Attest anhaengen.
3. Speichern → `SickLeave`-Entity entsteht.
4. Studioleitung bekommt Notification, sieht im Mitarbeiter-Dashboard die offenen Schichten.
5. Schichtplan-Neudisposition durch Studioleitung.

**Erzeugte Daten:**
- `SickLeave` (heute nicht existent).
- Notification (heute nicht existent).

**Folgeaktionen / Trigger:**
- Schichten dieses Mitarbeiters fuer diese Periode werden als "umverteilbar" markiert.

**Heutige Repraesentation:**
- ❌ **Komplett nicht vorhanden.** Keine Entity, kein Flow, keine UI.
- ❌ Vermutlich heute via WhatsApp/Telefon, nicht im System.

**Praxis-Problem:** Krankmeldung ist Teil der "Trainer-Tool"-Welt. Sollte in MVP 1 zumindest als Platzhalter-Button vorgesehen werden, damit der Mitarbeiter weiss, wo es spaeter hingehoert.

---

## Process H: Kurs-/Schichtplanung

- **Ausloeser:** Wochenplan muss erstellt werden. Studioleitung definiert Kurse, weist Trainer zu.
- **Beteiligte:** Studioleitung, Admin (Datenpflege), Trainer (sieht eigene Schichten), Empfang (sieht Kursplan fuer Kundenanfragen).

**Schritte (Soll):**
1. Studioleitung oeffnet Kursplaner.
2. Definiert Kurs (Name, Dauer, Kapazitaet, Frequenz).
3. Weist Trainer zu (mit Faehigkeitsmatch).
4. Erstellt Schichten (Start/Ende, welcher Mitarbeiter, welche Aufgaben).
5. Veroeffentlicht den Plan → Mitarbeiter sehen eigene Eintraege.

**Erzeugte Daten:**
- `Course` (heute nicht existent).
- `Shift` (heute nicht existent).
- `Employee.assigned_shifts` (heute nicht existent).

**Folgeaktionen / Trigger:**
- Trainer sieht eigene Schicht in "Heute".
- Empfang kann auf Anfragen "Wann ist Kurs X?" antworten.

**Heutige Repraesentation:**
- ❌ **Komplett nicht vorhanden.** Charter sagt NICHT-MVP-1 (`00-product-vision-raw.md:131`).
- ❌ Keine Mitarbeiter-Entity (`base44/entities/*.jsonc` — keine `Employee.jsonc`).

**Praxis-Problem:** Wahrscheinlich heute komplett in Excel/Papier. Beim Aufbau der Mitarbeiter-Entity muss frueh entschieden werden, ob Schichten reine Termine sind oder ein eigenes Konstrukt.

---

## Process I: Sync-Kontrolle (ThemiSoft / myYolo / AZH)

- **Ausloeser:** Datensatz wurde in AlbGym Nav erstellt/geaendert, soll in externes System uebertragen werden. Oder: externe Aenderung kommt zurueck.
- **Beteiligte:** Admin/Studioleitung (operativ), Reha-Mitarbeiter (myYolo/AZH), Berater (sieht Sync-Status pro Person).

**Schritte (Soll):**
1. System markiert Datensaetze als "sync ready" (alle Pflichtfelder vorhanden) oder "sync pending" (es fehlt was).
2. Im Personen-Cockpit sieht der Berater farbige Badges (`PersonenCockpit.jsx:69-74`):
   - Gruen: alles ok
   - Bernstein: Pflichtfeld fehlt
   - Rot: Sync gescheitert
   - Grau: noch nicht versucht
3. Admin oeffnet Sync-Konsole → sieht offene `SyncJob`s (heute nur Skeleton-Entity `SyncJob.jsonc`).
4. Klick "Sync ausloesen" → System sendet, schreibt `ExternalReference`, protokolliert Ergebnis.
5. Bei Fehler: Eintrag bleibt rot, Detail-Log lesbar.

**Erzeugte Daten:**
- `SyncJob` (Skeleton vorhanden, `base44/entities/SyncJob.jsonc`).
- `ExternalReference` (Skeleton vorhanden, `base44/entities/ExternalReference.jsonc`).
- `Customer.{themisoft,myyolo,azh}_sync_status` (Felder vorhanden).

**Folgeaktionen / Trigger:**
- Erfolgreicher Sync: Badge wird gruen, ExternalReference verknuepft.
- Fehler: Admin bekommt Aufgabe "Sync pruefen".

**Heutige Repraesentation:**
- ✅ Sync-Readiness-Logik (`src/lib/syncReadiness.js`) — berechnet Badges fuer Personen-Cockpit.
- ✅ Skeleton-Entities `SyncJob` und `ExternalReference`.
- ✅ Badges werden im Personen-Cockpit angezeigt (`PersonenCockpit.jsx:560-575`).
- ❌ **Kein tatsaechlicher Sync-Mechanismus.** Heute nur Status-Anzeige, kein Push/Pull.
- ❌ **Keine Sync-Konsole** fuer Admin (Liste offener Jobs, Retry-Button).
- ❌ **Kein Webhook-Empfang** von externen Systemen (myYolo Statusupdates).

**Praxis-Problem:** Der Berater sieht heute zwar rote Badges, hat aber keine Aktion dahinter — kein Klick fuehrt zu einer Reparatur-Maske. Praktisch gleich keine Information.

---

## Process J: Lead-Nachfassung & Follow-up

- **Ausloeser:** Lead ist im Status `OFFER_OPEN` oder `TRIAL_STARTED`. `next_action_at` ist faellig.
- **Beteiligte:** Berater (Hauptverantwortlicher), Studioleitung (Eskalation), Reha-Mitarbeiter (wenn Reha-Lead).

**Schritte:**
1. Berater oeffnet Lead Cockpit. Metrik-Tile "Faellig" zeigt Anzahl ueberfaelliger (`LeadCockpit.jsx:167-175`).
2. Berater filtert Status = `OFFER_OPEN` oder sortiert nach `next_action_at`.
3. Klick auf Lead-Karte → sieht Trainerbriefing, naechste Aktion, Wert (`LeadCockpit.jsx:333-368`).
4. Berater kontaktiert Kunden (heute: WhatsApp, E-Mail, Telefon — manuell).
5. Aktualisiert Status:
   - Erfolg → `CONTRACT_READY` oder `CONVERTED`.
   - Kein Erfolg → `LOST` oder erneut faellig setzen.
6. Bei `angebot`-Beratung wurde bereits eine `FollowUpTask` mit Draft-Message erzeugt (`crmAutomation.js:80-91`).

**Erzeugte Daten:**
- `FollowUpTask` (bereits durch ConsultationFlow erzeugt, falls Outcome = `angebot`).
- `ActivityLog`-Eintrag (heute manuell oder gar nicht).
- `Lead.last_contact_at` Update (`LeadCockpit.jsx:122-125`).

**Folgeaktionen / Trigger:**
- Bei `CONVERTED` → siehe Process E (Vertrag).
- Bei `LOST` → Reactivation-Kampagne (heute nicht existent).
- Bei `NO_SHOW` → Stage-Aktion `Reaktivieren` (`crmModel.js:62-67`).

**Heutige Repraesentation:**
- ✅ Pipeline mit 12 Stages (`crmModel.js:1-74`).
- ✅ Faellig-Logik im Cockpit.
- ✅ Trainerbriefing-Anzeige.
- ✅ `FollowUpTask`-Entity mit Draft-Message (`crmAutomation.js:80-91`).
- ❌ **Kein automatisches Versenden der Draft-Message.** Draft existiert nur als String im Entity-Feld — Berater muss kopieren.
- ❌ **Keine Reactivation-Workflows** fuer `LOST`/`NO_SHOW`.
- ❌ **Kein Reminder fuer Berater** (z.B. tagesaktuelle Aufgabenliste mit "rufe heute X an").

**Praxis-Problem:** Heute muss der Berater **jeden Tag selbst** ins Cockpit gehen und nach faelligen Faellen scannen. Es gibt keine Push-Notification, kein Tagesbriefing. Bei vielen offenen Angeboten ist das fehleranfaellig.

---

## Querschnitts-Beobachtungen

1. **Zwei parallele Reha-Welten:** Der `RehasportFlow` (Kunden-Tablet, `/rehasport`) und der `PrescriptionIntake` (Berater, `/berater/rezepte`) erstellen beide `RehasportConsultation`-Datensaetze, **ohne** sich zu kennen. Das fuehrt zu Doppelanlage.

2. **`Customer` ist die zentrale Identitaet** (gemaess Charter — `00-product-vision-raw.md:60-73`), aber der `RehasportFlow.jsx:108-136` kennt keinen `customer_id`-Kontext und erzeugt damit Reha-Vorgaenge ohne Personen-Anker.

3. **Trainer-Welt fehlt fast komplett.** Process F + G + H sind im Code **null** abgebildet. Vision sagt: ist NICHT-MVP-1, aber die **Rollentrennung** muss schon da sein.

4. **Empfang-Welt fehlt komplett.** Keine Rolle, kein Layout, kein Quick-Walk-In-Erfassen.

5. **Mitarbeiter-Entity fehlt komplett.** Keine `Employee.jsonc` in `base44/entities/`. Ohne dieses Konstrukt ist kein Schichtplan, keine Krankmeldung, kein Trainerbriefing-Zuweisung moeglich.

6. **Sync-Konsole ist nur halbgar:** Status-Anzeige vorhanden, aber kein Push-Mechanismus.

7. **Kein durchgaengiger Audit-Log:** `ActivityLog` wird sporadisch erzeugt (ConsultationFlow ja, LeadCockpit ja, Vertragsabschluss nein, Sync nein). Charter erwartet vollstaendige Nachvollziehbarkeit.

8. **Tablet-Stabilitaet:** Wizard-Flows leben in React-State, ohne Zwischenspeicher. Tablet-Absturz = Datenverlust.
