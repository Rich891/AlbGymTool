# AlbGym Nav — Externe Integrationen

Quelle: Direkt-Briefing (`docs/sprint-0/00-product-vision-raw.md`), aktueller Code in `base44/functions/*`, `src/pages/rehasport/*`, `src/lib/syncReadiness.js`, `src/lib/customerDataModel.js`.
Zweck: Faktischer Stand der externen Anbindungen + Empfehlung fuer MVP 1.

---

## 1. Uebersicht aller externen Systeme

| System | Zweck | Heute angebunden? | Spec-Status | Prio MVP 1 |
|---|---|---|---|---|
| **AZH / myYolo myConnect** | Rehasport-Personensync, Rezeptdaten | **JA** (Backend-Function `azhMyConnect` vorhanden, Frontend ruft sie aber NICHT auf) | Endpoints dokumentiert (`README.md:34-45`); Basic-Auth-Credentials per Function-Secret | Read-only Anzeige + manueller Trigger |
| **SimplyBook.me** | Rehasport-Welcome-Termine | **JA** (Backend-Function `simplybookApi` + Frontend-Aufrufe in `RehaBooking.jsx`, `RehaAppointment.jsonc`) | API-Key + Company-Login per Secret; JSON-RPC | Beibehalten (Status quo) |
| **ThemiSoft** | Vertrags-/Mitgliedsverwaltung | **NEIN** (nur Feldnamen vorhanden, kein Function-Code, kein API-Call) | Keine Specs im Repo | NICHT MVP 1 — Charter explizit out (`00-product-vision-raw.md:129`) |
| **Meta Leads (FB/IG Lead Ads)** | Inbound-Lead-Pipeline | **NEIN** (nur Lead-Source-Label `meta_ad`, `instagram_dm`, `facebook`, `crmModel.js:77-79`) | Keine Webhook-/API-Anbindung im Code | Nicht MVP 1 (Status quo: manuelle Erfassung) |
| **Superchat** | Messaging Lead/Kunde | **NEIN** (nur Lead-Source-Label `superchat`, `crmModel.js:83`) | Keine API-Anbindung | Nicht MVP 1 |
| **E-Mail / WhatsApp** | Multi-Kanal-Kommunikation | **NEIN** | Charter: "spaeter" (`00-product-vision-raw.md:108`) | Nicht MVP 1 |

---

## 2. ThemiSoft

### 2.1 Zweck
Vertrags- und Mitgliedsverwaltung des Studios. Charter: Ziel ist ein "Vollautomatischer ThemiSoft-Sync" — aber explizit **nicht MVP 1** (`00-product-vision-raw.md:129`).

### 2.2 Aktueller Anbindungsstand
- **Keine Backend-Function `themisoftApi` o.Ae.** im Repo (Glob auf `base44/functions/**` liefert nur `azhMyConnect/entry.ts` und `simplybookApi/entry.ts`).
- **Keine API-Specs im Repo** (Grep nach `themisoft` findet ausschliesslich Customer/ContractDraft-Felder und String-Labels).
- Felder im Datenmodell, die ThemiSoft adressieren:
  - `Customer.themisoft_customer_id` (`Customer.jsonc:163-166`)
  - `Customer.themisoft_sync_status` (`Customer.jsonc:167-181`)
  - `ContractDraft.themisoft_reference` (`ContractDraft.jsonc:57-60`)
  - `SyncJob.target_system: themisoft` (`SyncJob.jsonc:8-16`)
  - `ExternalReference.target_system: themisoft` (`ExternalReference.jsonc:8-16`)
  - `crmModel.js:51-53` Pipeline-Stage `CONTRACT_READY` mit Action "ThemiSoft pruefen".

### 2.3 Erforderliche Daten (Soll)
- Vertragsdaten: Tarif, Laufzeit, Startdatum, Startgebuehr, Monatspreis, Rabatte, Addons.
- Personenstammdaten: Name, Adresse, Kontakt, IBAN/Bankdaten, Versichertendaten.
- Sync-Readiness-Pflichtfelder bereits definiert (`syncReadiness.js:55-62`): `customer_name`, `street`, `postal_code`, `city`, E-Mail-oder-Telefon, `data_quality_score >= 60`.

### 2.4 Mapping ContractDraft -> ThemiSoft-Member (Soll-Vorschlag)
Heute existiert keine Mapping-Implementierung. Vorgeschlagenes Soll-Mapping:
| AlbGym-Feld | Quelle | ThemiSoft-Aequivalent (Annahme) |
|---|---|---|
| `Customer.customer_name` | Customer | Mitgliedsname |
| `Customer.first_name + last_name` | Customer | Vorname/Nachname getrennt |
| `Customer.birthdate` | Customer | Geburtsdatum |
| `Customer.street + postal_code + city` | Customer | Adresse |
| `Customer.email`, `Customer.phone` | Customer | Kontakt |
| `Customer.insurance_number` | Customer | KV-Nummer |
| `ContractDraft.tariff_id` / `tariff_name` | ContractDraft | Tarif |
| `ContractDraft.start_date` | ContractDraft | Vertragsbeginn |
| `ContractDraft.duration_months` | ContractDraft | Laufzeit |
| `ContractDraft.monthly_price` | ContractDraft | Beitrag |
| `ContractDraft.start_fee` | ContractDraft | Startgebuehr |
| `ContractDraft.addons[]` | ContractDraft | Zusatzleistungen |
| **(Soll)** ThemiSoft-Mitglieds-ID | ThemiSoft-Response | -> `Customer.themisoft_customer_id` zurueckschreiben |

### 2.5 SyncJob-Skeleton — passt das?
- `SyncJob.jsonc:1-67` deckt `target_system: themisoft` ab, payload_snapshot als `object` (`SyncJob.jsonc:31-34`).
- Reicht als Skeleton. Fehlt: konkretes Payload-Schema, Retry-Strategie (`attempts`-Feld da, aber keine Max-Retries-Doku).

### 2.6 Blocker
- **Keine API-Specs vorliegend.** Es ist im Repo nicht dokumentiert, ob ThemiSoft REST, SOAP, CSV-Import oder DB-Direktzugriff anbietet.
- **Keine Test-Credentials.** AZH hat dokumentierte Secret-Variablen (`README.md:39-43`); fuer ThemiSoft keine Erwaehnung.
- **Konflikt-Strategie unklar.** Was passiert, wenn ein Mitglied in ThemiSoft bereits existiert? `Customer.themisoft_sync_status: conflict` existiert als Enum (`Customer.jsonc:167-181`), aber keine Resolver-Logik im Code.

### 2.7 Empfohlene Sprint-Position
- **Sprint 0 (jetzt):** Specs vom Studio-Owner einholen — siehe "Kritischste Frage" am Ende.
- **MVP 1:** Read-only-Anzeige des `themisoft_sync_status` im Personen-Cockpit (bereits implementiert in `syncReadiness.js`). Kein schreibender Sync.
- **MVP 2/3:** Implementation `themisoftApi`-Backend-Function nach Spec-Klaerung.

---

## 3. myYolo / AZH (myConnect)

### 3.1 Backend-Function `azhMyConnect` existiert
`base44/functions/azhMyConnect/entry.ts:1-229`. **Status:** vollstaendig implementiert, aber **vom Frontend nicht aufgerufen** (Grep nach `azhMyConnect` liefert ausschliesslich `README.md` als Match — kein React-Component invoked die Function).

### 3.2 Endpoints / Actions
Implementierte `action`-Werte (`azhMyConnect/entry.ts:181-224`):
| Action | Methode (myConnect) | Zweck |
|---|---|---|
| `configStatus` | — | Pruefen ob Secrets gesetzt sind |
| `queryPersons` | `POST /personsBulkQuery` | Personen-Suche mit Filter (`entry.ts:198-204`) |
| `findCustomer` | `POST /personsBulkQuery` + Scoring (`entry.ts:118-140`) | Suche + Ranking exakter Matches |
| `upsertPerson` | `POST /persons` | Person neu anlegen / aktualisieren |
| `syncCustomer` | findExisting -> upsertPerson -> Customer.update | End-to-End-Sync mit Conflict-Detection (`entry.ts:142-179`) |

### 3.3 Felder-Mapping Customer -> myConnect Person
Implementiert in `azhMyConnect/entry.ts:78-99` (`mapCustomerToPerson`):
| AlbGym Customer-Feld | myConnect Person-Feld | Quelle |
|---|---|---|
| `azh_person_guid` | `Guid` | `entry.ts:80` |
| (fix) `true` | `Aktiv` | `entry.ts:81` |
| `azh_customer_number` (nicht im Schema, runtime) | `Kundennummer` | `entry.ts:82` |
| `first_name` | `Vorname` | `entry.ts:83` |
| `last_name` | `Nachname` | `entry.ts:84` |
| `birthdate` -> `YYYY-MM-DDT00:00:00` | `Geb_Datum` | `entry.ts:85`, Hilfsfunktion `toAzhDate` `entry.ts:61-64` |
| `gender` -> `m/w/d` | `Geschlecht` | `entry.ts:86`, `toAzhGender` `entry.ts:53-59` |
| `postal_code` | `PLZ` | `entry.ts:87` |
| `city` | `Ort` | `entry.ts:88` |
| `street` || `address` | `StrasseNr` | `entry.ts:89` |
| `phone` | `Telefon_1` | `entry.ts:90` |
| `''` | `Telefon_2` | `entry.ts:91` |
| `mobile` (nicht im Customer-Schema, runtime) | `Mobil` | `entry.ts:92` |
| `email` | `EMail` | `entry.ts:93` |
| `insurance_number` normalisiert | `Versichertennummer` | `entry.ts:94`, `normalizeInsuranceNumber` `entry.ts:70-72` |
| `cost_carrier_number` Digits-only | `Kostentraegernummer` | `entry.ts:95`, `normalizeDigits` `entry.ts:66-68` |
| `card_number` (nicht im Customer-Schema, runtime) | `Kartennummer` | `entry.ts:96` |
| `magicline_customer_id` (nicht im Customer-Schema, runtime) | `MagicLineCustomerID` | `entry.ts:97` |

**Bemerkenswert:** mehrere Felder (`azh_customer_number`, `mobile`, `card_number`, `magicline_customer_id`) werden im Mapping erwartet, sind aber NICHT im `Customer.jsonc`-Schema definiert — d.h. sie kommen aktuell nur, wenn das Runtime-Objekt sie zufaellig mitbringt (z.B. aus Prescription).

### 3.4 Konfiguration
- 4 Function-Secrets (`README.md:39-43`, `azhMyConnect/entry.ts:5-16`): `AZH_MYCONNECT_BASE_URL` (Default `https://myconnect.azh-myyolo.info`), `AZH_MYCONNECT_VERSION` (Default `1`), `AZH_MYCONNECT_USERNAME`, `AZH_MYCONNECT_PASSWORD`.
- Basic-Auth ueber `Authorization: Basic <base64>` (`entry.ts:18-20`).

### 3.5 Conflict-Detection
- `syncCustomer` (`entry.ts:142-179`) prueft, ob mehr als 1 exakter Match (Score >= 7) gefunden wird — bei Mehrfach-Match wird `Customer.azh_sync_status = 'conflict'` gesetzt und KEIN Upsert ausgefuehrt (`entry.ts:152-159`).
- Scoring (`entry.ts:118-127`): GUID (10), Versichertennummer (5), Geburtsdatum (4), Nachname (3), Vorname (2), PLZ (1).

### 3.6 Status-Werte ruckgeschrieben in Customer
Nach erfolgreichem Sync (`entry.ts:170-176`):
- `azh_person_guid` = zurueckgegebene GUID
- `azh_sync_status` = `synced` falls `result.StatusText === 'OK'` oder `result.Status === 0`, sonst `error`
- `azh_last_sync_at` = aktueller Zeitstempel

### 3.7 Heute genutzt? Wo fehlt UI?
- **Backend-Function fertig, Frontend NICHT verbunden.**
- README erwaehnt die Function, aber: `Grep azhMyConnect | files_with_matches` liefert **nur README.md** — kein React-Pfad.
- Was fehlt fuer MVP 1:
  1. UI-Trigger "Mit AZH synchronisieren" im Personen-Cockpit / in der Personenakte
  2. Anzeige `azh_last_sync_at` im Cockpit (heute Feld vorhanden, aber nicht in `summarizeSyncBadges` `syncReadiness.js:265-313`)
  3. Conflict-Resolver-UI (welche der gefundenen myConnect-Personen ist die richtige?)
  4. Fehlerlog-View bei `azh_sync_status === 'error'`

### 3.8 Spannung mit ExternalReference-Modell
- `Customer.azh_person_guid` und `Customer.myyolo_person_id` sind zwei Felder, die laut README zum selben System gehoeren (`README.md:34` "AZH / myYOLO myConnect"). 
- `azhMyConnect/entry.ts:170-174` schreibt nur `azh_person_guid`, nicht `myyolo_person_id`.
- Empfehlung: `myyolo_person_id` als Legacy markieren oder klaerend dokumentieren.

---

## 4. SimplyBook.me

### 4.1 Zweck
Terminbuchung — heute ausschliesslich fuer Rehasport-Welcome-Termine (Geraete-Einweisung, FIVE, Milon).

### 4.2 Aktueller Stand: VOLL ANGEBUNDEN
- Backend-Function `simplybookApi` (`base44/functions/simplybookApi/entry.ts:1-96`).
- 5 Actions: `getSlots`, `getNextSlot`, `getWorkDays`, `getUnits`, `book`.
- 2 Function-Secrets: `SIMPLYBOOK_COMPANY_LOGIN`, `SIMPLYBOOK_API_KEY` (`entry.ts:3-4`).
- Auth via JSON-RPC `getToken` -> `X-Token` Header (`entry.ts:19-21, 29-30`).
- Frontend-Aufrufe in:
  - `src/pages/rehasport/RehaBooking.jsx:83` (`getSlots`) und `:134` (`book`)
  - `src/pages/rehasport/RehaAppointment.jsx:79` (`getWorkDays`), `:109` (`getSlots`), `:122` (`book`)
- Hardcoded Service/Unit-IDs (`RehaBooking.jsx:14-15`): `geraete: 24/9`, `five: 26/11`, `milon: 25/10`.

### 4.3 Erforderliche Daten
- Slots: Service-ID, Datum, Unit-ID (Trainer-Verfuegbarkeit).
- Mitarbeiter-Verfuegbarkeit: heute via `getUnitList` (`entry.ts:76-79`).
- Person beim Buchen: `clientData = { name, email, phone }` (`entry.ts:81-93`).

### 4.4 Konflikt mit interner Appointment-Entity?
- **Ja, teilweise.** `Appointment.jsonc:1-44` ist eine interne Termin-Entity mit `start`, `end`, `advisor`, `customer_id`, `lead_id`, `consultation_id`, `rehasport_consultation_id`, `status`, `notes`.
- Bei Rehasport-Buchung wird heute nur in SimplyBook gebucht — KEIN `Appointment`-Record angelegt (grep nach `Appointment` in `src/pages/rehasport/*` liefert keinen `createEntity('Appointment'...)`-Call).
- Risiko: Termine in SimplyBook und in AlbGym-Nav divergieren. Doppelbuchung moeglich.

**Empfehlung:**
- **Kurzfristig (MVP 1):** Nach erfolgreicher SimplyBook-Buchung einen `Appointment`-Record mit `notes: "SimplyBook:bookingId=..."` anlegen. ExternalReference einsetzen — siehe §8.
- **Langfristig (MVP 2+):** Entscheidung: ist SimplyBook lese-fuehrend (Quelle der Wahrheit) oder schreibend-bidirektional? Heute lese-und-schreibend, aber ohne Spiegel.

### 4.5 Empfehlung MVP 1
- **Status quo behalten** fuer Rehasport-Buchung (funktioniert).
- **Ergaenzung:** `Appointment`-Spiegel-Eintrag bei Buchung, damit Sync-Readiness und Personen-Cockpit den Termin sehen koennen.
- **Bidirektional?** Erst MVP 2+. Heute koennen Studio-Mitarbeiter in SimplyBook direkt umterminieren — AlbGym Nav merkt das nicht.

---

## 5. Meta Leads (Facebook / Instagram Lead Ads)

### 5.1 Zweck
Inbound-Lead-Pipeline aus Meta-Anzeigen.

### 5.2 Aktueller Stand
- **Keine Webhook-Function** im Repo (Glob `base44/functions/**` zeigt nur azhMyConnect + simplybookApi).
- Lead-Quellen-Labels vorhanden (`crmModel.js:77-79`): `meta_ad`, `instagram_dm`, `facebook` — werden im UI angezeigt, aber keine technische Integration.
- Lead-Eintraege werden heute manuell oder via ConsultationFlow erfasst (Spiegel-Code in `crmModel.js:166-189` `buildLeadPayload`).

### 5.3 Erforderliche Daten (Soll)
Meta Lead Ads liefern typischerweise:
| Feld | Beschreibung |
|---|---|
| `lead_id` (Meta) | Meta-eigene Lead-ID |
| `created_time` | Erstellungszeit |
| `page_id` | Welche Studio-Seite |
| `form_id` | Welches Lead-Formular |
| `campaign_id` / `ad_id` | Tracking |
| `field_data[]` | Vorname, Nachname, Telefon, E-Mail (variabel je Formular) |

### 5.4 Mapping Meta -> Lead (Soll-Vorschlag)
| Meta-Feld | AlbGym-Lead-Feld |
|---|---|
| `field_data.first_name` | `Lead.first_name` |
| `field_data.last_name` | `Lead.last_name` |
| `field_data.phone_number` | `Lead.phone` |
| `field_data.email` | `Lead.email` |
| `created_time` | `Lead.last_contact_at` |
| `ad_id` / `campaign_id` | `Lead.campaign_id` |
| (fix) `meta_ad` oder `facebook` | `Lead.source` |
| (Soll) Meta-Lead-ID | `ExternalReference{target_system:'meta', external_id:lead_id}` |

### 5.5 Empfehlung MVP 1
- **Nicht MVP 1.** Status quo: Studio-Mitarbeiter uebernimmt Meta-Leads manuell (Walk-in-aehnlich).
- MVP 2+: Webhook-Backend-Function `metaLeadWebhook` mit Konvertierung -> `upsertUnifiedCustomer` + `createEntity('Lead', ...)`.

---

## 6. Superchat

### 6.1 Zweck
Messaging-Plattform fuer Studio<->Kunde (Inbox-aehnlich).

### 6.2 Aktueller Stand
- Nur Lead-Source-Label `superchat` (`crmModel.js:83`).
- Keine API-Anbindung, keine Webhook-Function, keine Inbox-View im Code.

### 6.3 Konflikt mit Multi-Kanal-Strategie?
- Charter erwaehnt "spaeter E-Mail/WhatsApp" als zusaetzliche Kanaele (`00-product-vision-raw.md:108`).
- Superchat ist potentiell **selbst** ein Multi-Kanal-Aggregator (WhatsApp + Instagram + Web-Chat in einem Tool) — d.h. wenn Superchat eingebunden wird, koennte das die "E-Mail/WhatsApp"-Anforderung mit abdecken.
- **Offene Frage:** ist Superchat unsere Messaging-Schicht ODER nur eine Quelle unter mehreren? Antwort braucht der Studio-Owner.

### 6.4 Empfehlung MVP 1
- Nicht MVP 1. Status quo: Manuelles Lead-Erfassen aus Superchat.

---

## 7. SyncJob-Architektur

### 7.1 Lifecycle (Soll)
```
pending  -> Job angelegt, aber noch nicht geprueft
ready    -> alle Pflichtfelder vorhanden
syncing  -> API-Call laeuft
synced   -> erfolgreich; ExternalReference geschrieben
failed   -> Fehler; error_message + attempts
blocked  -> Pflichtfelder fehlen; UI zeigt Blocker-Liste
```
Belegt durch `SyncJob.jsonc:17-29` (alle 6 Enum-Werte vorhanden).

### 7.2 Readiness-Pruefung VOR Sync
Charter-Pflicht: "Kein blinder Sync." (`00-product-vision-raw.md:110`).
Heute:
- `evaluateSyncReadiness(customer)` (`syncReadiness.js:158-180`) liefert pro Zielsystem `{ ready, blockers[] }`.
- `summarizeSyncBadges(customer)` (`syncReadiness.js:265-313`) liefert UI-Badges.
- **Aber:** kein Code-Pfad erzwingt, dass `azhMyConnect.syncCustomer` (`entry.ts:142-179`) Readiness prueft VORHER. Die Function startet direkt, prueft nur `first_name`+`last_name` (`entry.ts:147-149`).

**Lueck:** Backend-Function `azhMyConnect` honoriert die Readiness-Logik im Frontend NICHT. Ein Aufruf koennte heute mit unvollstaendigen Daten durchgehen.

### 7.3 Wo laeuft Sync?
- Heute: nur `azhMyConnect`-Backend-Function (Base44 Deno-Runtime), getriggert durch Frontend-Invoke.
- Kein Worker, kein Cron-Job, keine Queue.
- SyncJob-Entity heute nicht aktiv geschrieben — `Grep createEntity.*SyncJob` liefert keinen Treffer in `src/**`. SyncJob ist Skeleton fuer spaeter (Phase 4, `00-product-vision-raw.md:172-176`).

### 7.4 Heutiger Stand vs. Charter
- Skeleton + Frontend-Readiness-Logik = ausreichend fuer MVP 1 (Read-only Cockpit-Anzeige).
- Schreibender Sync mit Job-Lifecycle = post MVP 1.

### 7.5 Bewertung
- `SyncJob.jsonc:1-67` (Skeleton) und `syncReadiness.js:1-313` (Logik) decken den Read-only-Pfad sauber ab.
- **Fehlt:** Backend-Function, die SyncJobs konsumiert, Readiness checkt, dann ggf. `azhMyConnect`/`themisoftApi`/`myYoloApi` aufruft und das Ergebnis zurueckschreibt. Post MVP 1.

---

## 8. ExternalReference-Modell

### 8.1 Heutige Implementation
- `ExternalReference.jsonc:1-42` Skeleton:
  - `customer_id` (Pflicht)
  - `target_system` (Pflicht, enum: azh/themisoft/myyolo)
  - `external_id` (Pflicht)
  - `lookup_key` (optional)
  - `confirmed_at`, `note` (optional)

### 8.2 Heute aktiv geschrieben?
- Grep nach `createEntity.*ExternalReference` und `ExternalReference\.create` -> keine Treffer in `src/**`.
- **Nicht aktiv genutzt.** Sync-IDs werden heute direkt in `Customer.azh_person_guid` etc. abgelegt.

### 8.3 Konflikt mit direkten Customer-Sync-Feldern
- Customer hat: `azh_person_guid`, `myyolo_person_id`, `themisoft_customer_id` (`Customer.jsonc:163-220`).
- ExternalReference wuerde das ersetzen — heute redundant.

### 8.4 Brauchen wir das fuer Employee<->ThemiSoft-Mitarbeiter?
- **Ja, sobald Employee-Entity existiert.** ThemiSoft kennt vermutlich Mitarbeiter (z.B. Trainer als "Vertriebspartner"). ExternalReference muss dann erweitert werden um `subject_type: 'customer' | 'employee'` ODER ein separates Schema `EmployeeExternalReference`.

### 8.5 Brauchen wir das fuer Termin<->SimplyBook?
- **Ja.** SimplyBook gibt eine Booking-ID zurueck (`simplybookApi/entry.ts:81-93` Action `book`), die heute nicht persistiert wird.
- Empfehlung: ExternalReference erweitern um `subject_type: 'appointment'` und `target_system: 'simplybook'`.

### 8.6 Empfehlung Sprint 0
- ExternalReference-Skeleton **behalten** und in MVP 1+ aktiv schreiben (Erweiterung um `subject_type`).
- Direkt-Felder im Customer (`azh_person_guid` etc.) bleiben als Convenience-Caches.

---

## 9. Fehlerfaelle & Retry-Strategie

### 9.1 Was passiert heute, wenn Sync failed?
- `azhMyConnect.syncCustomer`: Bei HTTP-Fehler wirft `myConnectRequest` ein `Error` (`entry.ts:46-48`), wird vom outer try/catch gefangen (`entry.ts:225-227`) und als `Response.json({ error }, { status: 500 })` zurueckgegeben.
- Customer-Update auf `azh_sync_status: 'error'` erfolgt NUR im Success-Pfad mit `StatusText !== 'OK'` (`entry.ts:170-175`). Bei kompletten HTTP-Failures wird der Customer-Status NICHT auf `error` gesetzt — d.h. das Frontend muesste den Fehler aus der Response separat verarbeiten.

### 9.2 User-sichtbares Fehlerlog?
- **Heute nicht vorhanden.** Es gibt keinen "Sync-Log"-View. `ActivityLog`-Entity (`ActivityLog.jsonc:1-51`) koennte das tragen (`type: 'sync.failed'`), wird aber nicht so verwendet.

### 9.3 Retry-Counter
- `SyncJob.attempts` Feld vorhanden (`SyncJob.jsonc:48-51`, default 0).
- **Kein Code, der attempts hochzaehlt** (SyncJob heute nicht aktiv beschrieben).
- Keine Max-Retries-Definition.

### 9.4 Empfehlung Sprint 0
- **MVP 1:** mindestens `Customer.{azh,themisoft,myyolo}_sync_status = 'error'` setzen bei jedem Failure UND `ActivityLog`-Eintrag schreiben (`type: 'sync.failed'`, `notes: error_message`).
- **MVP 2+:** Job-basierte Retry-Logik mit `attempts < 3 -> requeue` und Dead-Letter bei Ueberschreitung.

---

## 10. Prioritaeten-Empfehlung fuer MVP 1

### 10.1 In MVP 1
1. **Sync-Readiness-UI (read-only):** Badges aus `summarizeSyncBadges` im Personen-Cockpit anzeigen (Phase 4 bereits vorhanden, in `PersonenCockpit.jsx`).
2. **AZH-Sync (halbautomatisch, manuell triggern):** UI-Button "Mit AZH synchronisieren" -> ruft `azhMyConnect.syncCustomer` -> Ergebnis anzeigen. Backend ist fertig, nur Frontend-Verdrahtung fehlt.
3. **Conflict-Resolver-UI (minimal):** Wenn `azh_sync_status === 'conflict'`, zeige die `search.candidates` aus `azhMyConnect.findCustomer` und lass Mitarbeiter den richtigen Match waehlen.
4. **SimplyBook-Termin -> Appointment-Spiegel:** Nach Buchung in `RehaBooking.jsx`/`RehaAppointment.jsx` einen `Appointment`-Record anlegen + ExternalReference.
5. **ActivityLog fuer Sync-Events:** `sync.attempted`, `sync.success`, `sync.failed`.

### 10.2 NICHT MVP 1
- Vollautomatischer ThemiSoft-Sync (`00-product-vision-raw.md:129`).
- Vollautomatischer myYolo-Sync (`00-product-vision-raw.md:130`).
- Meta-Webhook (manuelle Erfassung bleibt).
- Superchat-API.
- E-Mail/WhatsApp-Anbindung.
- Worker/Queue-basierte SyncJob-Verarbeitung.

### 10.3 Sprint-0-Outputs (jetzt)
- Dieses Dokument + `05-datenmodell-grob.md`.
- Keine Codeaenderung. Keine neue Backend-Function. Keine Entity-Schema-Aenderung.
