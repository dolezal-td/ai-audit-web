# Changelog

Všechny důležité změny v AI Kompas webové platformě.

Formát vychází z [Keep a Changelog](https://keepachangelog.com/cs/1.1.0/).
Verzování podle [Semantic Versioning](https://semver.org/).

## [2.4.0] - 2026-03-24

### Opraveno
- Oprava 3 systémových engine bugů: quiz scoring (prázdné odpovědi), BUG-2 inverze (strach vs experimentování), prázdné nástroje
- 6 faktických chyb v reportu JTRE Projektové řízení (počty lidí, sebehodnocení, strach, překlep, ChatGPT formulace, licence odhad)
- Přepočtena data pro všechny klienty; aktualizovány hodnoty ve všech 4 JTRE reportech + Euroinstitut
- Smazány staré feature branches (lokální + remote)

### Přidáno
- Demo report s routing a obsahem

## [2.3.1] - 2026-03-24

### Změněno
- TeamMapChart refaktorován na sdílenou MetricCards komponentu
- Vizuální polish: výraznější tlačítka, barevné MetricTile, menší tučnost nadpisů

### Opraveno
- TeamMapChart data za projektové řízení (ne celé JTRE)
- Index rozptylu škála 0-2
- Sladění barev na scatter plotech

## [2.3.0] - 2026-03-24

### Přidáno
- Report JTRE Projektové řízení (8 stránek, 15 respondentů, 10 rozhovorů)
- Executive summary s novými komponentami: TeamMapChart, ProcessMatrix, RoadmapTimeline, InfoModal
- Report Euroinstitut (8 stránek, 16 respondentů, 7 rozhovorů, previousData pro 4 osoby)
- PIN přístupy pro Euroinstitut (Krucký)
- Knob odlišený jako "Vedení" (oranžová barva) na scatter plotech

## [2.2.2] - 2026-03-22

### Přidáno
- Executive summary prototyp: TeamMapChart, ProcessMatrix, RoadmapTimeline
- Report Euroinstitut: kompletní 8stránkový AI Kompas report
- MetricCards s barvami + Index rozptylu pro všechny JTRE reporty

### Změněno
- ScatterPlot: skrytí filtru při jedné skupině

## [2.2.1] - 2026-03-21

### Přidáno
- Vercel Web Analytics (s vyloučením admin návštěv)
- JTRE Obchod: rozšíření impact-effort matice
- Barevné odlišení týmů na scatter plotu
- ActivityBubbleChart komponenta

## [2.2.0] - 2026-03-20

### Přidáno
- Report JTRE Obchod (8 stránek, 9 respondentů)
- Audiopřehledy pro Finance, Obchod a Projektové řízení (m4a)
- Logout tlačítko (homepage + sidebar)
- SidebarThemeToggle (light/dark mode)
- Homepage: barevné dlaždice s metrikami

### Opraveno
- Compliance opravy licencí (ChatGPT Business, ne Plus)
- Zjemnění formulací v reportech

## [2.1.2] - 2026-03-18

### Přidáno
- Report JTRE Obchod: routing, MDX stránky, PINy (první verze)
- Homepage redesign: barevné dlaždice s metrikami místo obdélníků

### Opraveno
- Licence: Antigravity fallback + zelené zvýraznění nejlepšího týmu
- Fix: padající stránka licence (neexistující Callout typ)

## [2.1.1] - 2026-03-15

### Přidáno
- Audiopřehled JTRE Finance (m4a)
- NavTitle s dobou čtení a navigací
- Access.ts refaktor

### Opraveno
- Mobilní opravy: radar chart ResizeObserver, sticky tabulky, MetricCards responsive grid, hydration fix

## [2.1.0] - 2026-03-15

### Přidáno
- PIN autentizace s multi-report přístupem
- Report switcher v sidebaru pro uživatele s 2+ reporty
- Logout (endpoint + tlačítko na homepage i v sidebaru)
- Homepage s disabled report kartami a report selectorem
- Warm design (auth + homepage)
- Logo jako favicon + branding
- Print-friendly verze (`/print/[slug]`)
- Mermaid diagram renderer

### Změněno
- Scatter-plot vylepšení (tooltips, interaktivita)
- JTRE Finance: obsahové úpravy, přímější tón, kratší texty

## [2.0.1] - 2026-03-10

### Změněno
- Obsahový review JTRE Finance: přepracování procesů, doplnění Cursoru
- Em dash nahrazeny en dashem napříč celým reportem
- Odstranění klienta Kačena (testovací data)

### Opraveno
- PeopleHeatmap: info tooltips, kontrast, delta, popisky
- Typografie: mezery před tečkami, chybějící mezera za čárkou

## [2.0.0] - 2026-03-01

### Přidáno
- Next.js 16 platforma s Fumadocs (App Router, MDX routing)
- Report JTRE Finance (8 stránek, 10 respondentů)
- 6 typů interaktivních grafů: TeamRadar, PeopleHeatmap, ScatterPlot, ActivityHeatmap, ToolsHeatmap, MetricCards
- Callout komponenta (info/warning/success)
- MDX tabulky, NavTitle s dobou čtení
- Tailwind CSS 4 s custom design systémem

[2.4.0]: https://github.com/dolezal-td/ai-audit-web/compare/v2.3.1...v2.4.0
[2.3.1]: https://github.com/dolezal-td/ai-audit-web/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/dolezal-td/ai-audit-web/compare/v2.2.2...v2.3.0
[2.2.2]: https://github.com/dolezal-td/ai-audit-web/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/dolezal-td/ai-audit-web/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/dolezal-td/ai-audit-web/compare/v2.1.2...v2.2.0
[2.1.2]: https://github.com/dolezal-td/ai-audit-web/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/dolezal-td/ai-audit-web/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/dolezal-td/ai-audit-web/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/dolezal-td/ai-audit-web/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/dolezal-td/ai-audit-web/releases/tag/v2.0.0
