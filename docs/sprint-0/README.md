# Sprint 0 — AlbGym Nav Produkt- und Systemdefinition

**Status:** ✅ Abgeschlossen + Sprint 0.5 Übergabe (Stand: 2026-05-22). Welle 2 (Modulkarte/Systemlandkarte) wurde übersprungen — Studio-Owner hat selbst konsolidiert.

## Zweck

Sprint 0 ist Discovery & Struktur. **Keine Codeänderung, keine UI-Umsetzung.** Ergebnis sind Dokumente, die als Grundlage für Sprint 1+ dienen.

## Dokumentenübersicht

| # | File | Eigentümer-Agent | Status |
|---|---|---|---|
| 00 | `00-product-vision-raw.md` | Studio-Owner Briefing | Roh-Input |
| 01 | `01-product-charter.md` | Product Owner | ✅ |
| 02 | `02-roadmap-mvp.md` | Project Manager | ✅ |
| 03 | `03-rollenmatrix.md` | Domain Analyst | ✅ |
| 04 | `04-studio-prozesse.md` | Domain Analyst | ✅ |
| 05 | `05-datenmodell-grob.md` | Data Model | ✅ |
| 06 | `06-integrationen.md` | Integration | ✅ |
| 07 | `07-navigation-sitemap.md` | UX Architect | ✅ |
| 08 | `08-ui-konzept-modi.md` | UI Designer | ✅ |
| 09 | `09-modulkarte.md` | Software Architect | ⏭ Übersprungen (Owner braucht nicht) |
| 10 | `10-systemlandkarte.md` | Software Architect | ⏭ Übersprungen (Owner braucht nicht) |
| 11 | `11-sprint0-briefing.md` | Studio-Owner (selbst) | ✅ |
| 12 | `12-entscheidungsfragen.md` | Documentation | ✅ |
| — | `../sprint-1/00-scope.md` | Projektleiter | ✅ |

## Empfohlene Leseroutine für den Studio-Owner

1. **`00-product-vision-raw.md`** — bestätige, dass deine Vision korrekt erfasst ist.
2. **`01-product-charter.md`** — formale Produktdefinition + MVP-1-Abnahmekriterien.
3. **`02-roadmap-mvp.md`** — Phasenplan und Sprintreihenfolge.
4. **`12-entscheidungsfragen.md`** (sobald da) — die offenen Blocker, auf die du antworten musst.
5. Rest nach Interesse / Vertiefung.

## Bewertung Phase-3+4-Code (Commit `cca650d`)

Bereits gebauter Code (`PersonenCockpit`, `GoalProfile`-Lib, `syncReadiness`) **bleibt drin**. Sprint 0 prüft, ob er zum neuen Charter passt:

- **Datenmodell**: passt strukturell ✅ (Customer ist kanonisch, GoalProfile als Kontext)
- **Navigation**: passt NICHT ❌ (alles unter `/berater/*`, keine Welten-Trennung)
- **Personen-Cockpit**: passt teilweise ⚠ (Cockpit-Klick = Toast-Stub, Personenakte-Detail fehlt)
- **Sync-Readiness**: passt ✅ (reine Funktionen, gut struktur)

→ Post-Sprint-0 Anpassungen werden in `02-roadmap-mvp.md` Sprint 2-3 verortet.

## No-Go-Regeln für Sprint 0

- ❌ Keine Codeänderung
- ❌ Keine .js/.jsx-Modifikationen
- ❌ Keine UI-Umsetzung
- ❌ Keine Repo-Strukturänderung außer `docs/sprint-0/`

## Nächste Schritte nach Sprint 0.5

1. **Studio-Owner beantwortet 🛑-Blocker B-01, B-02, B-03** in `12-entscheidungsfragen.md`.
2. **Sprint-1-Scope formal abnehmen** (`../sprint-1/00-scope.md`).
3. Sprint 1 startet: Rollenmodell + Rollenbasierte Layouts.
4. Parallele Tracks A/B/C/D laufen konzeptionell weiter (keine Code-Änderung).
