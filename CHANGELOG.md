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

## [2.3.0] - 2026-03-24

### Přidáno
- Report JTRE Projektové řízení (8 stránek, 15 respondentů, 10 rozhovorů)
- Executive summary s novými komponentami: TeamMapChart, ProcessMatrix, RoadmapTimeline, InfoModal
- Report Euroinstitut (8 stránek, 16 respondentů, 7 rozhovorů, previousData pro 4 osoby)
- PIN přístupy pro Euroinstitut (Krucký)
- Knob odlišený jako "Vedení" (oranžová barva) na scatter plotech

### Změněno
- TeamMapChart refaktorován na sdílenou MetricCards komponentu
- Index rozptylu škála 0-2 napříč všemi reporty
- MetricCards s barevnými kartami

## [2.2.0] - 2026-03-20

### Přidáno
- Report JTRE Obchod (8 stránek, 9 respondentů)
- Audiopřehledy pro Finance, Obchod a Projektové řízení (m4a)
- Vercel Web Analytics (s vyloučením admin návštěv)
- ActivityBubbleChart komponenta
- Impact-effort matice pro Obchod
- Barevné odlišení týmů na scatter plotu

### Opraveno
- Mobilní opravy: radar chart ResizeObserver, sticky tabulky, MetricCards responsive grid, hydration fix
- Compliance opravy licencí (ChatGPT Business, ne Plus)

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
- Em dash nahrazeny en dashem napříč reporty
- JTRE Finance: obsahové úpravy, přímější tón, kratší texty

## [2.0.0] - 2026-03-01

### Přidáno
- Next.js 16 platforma s Fumadocs (App Router, MDX routing)
- Report JTRE Finance (8 stránek, 10 respondentů)
- 6 typů interaktivních grafů: TeamRadar, PeopleHeatmap, ScatterPlot, ActivityHeatmap, ToolsHeatmap, MetricCards
- Callout komponenta (info/warning/success)
- MDX tabulky, NavTitle s dobou čtení
- Tailwind CSS 4 s custom design systémem

[2.4.0]: https://github.com/dolezal-td/ai-audit-web/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/dolezal-td/ai-audit-web/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/dolezal-td/ai-audit-web/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/dolezal-td/ai-audit-web/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/dolezal-td/ai-audit-web/releases/tag/v2.0.0
