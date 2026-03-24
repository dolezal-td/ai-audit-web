# Executive Summary – nový úvod pro JTRE Projektové řízení

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Přepsat `uvod.mdx` pro JTRE Projektové řízení na executive summary – vizuální dashboard pro předávací schůzku s Knobem.

**Architecture:** Nový `uvod.mdx` využívá existující komponenty (TeamMapChart, ProcessMatrix, RoadmapTimeline) + novou modální komponentu pro skrytý obsah. Starý úvod zůstane v git historii. Feature branch se mergne do main.

**Tech Stack:** MDX, React komponenty (TeamMapChart, ProcessMatrix, RoadmapTimeline), nová Modal komponenta (Radix Dialog), Tailwind CSS

---

## Prerekvizita: Git – záloha a merge

### Task 0: Commitnout uncommitted změny a mergovat feature branch

**Files:**
- Modify: `web/content/jtre-projektove-rizeni/*.mdx` (staged)
- Modify: `web/content/jtre-*/data.json` (staged)

**Step 1: Commitnout uncommitted práci na feature branchi**

```bash
cd /Users/tomasdolezal/Developer/ai-audit/web
git add content/jtre-projektove-rizeni/ content/jtre-finance/data.json content/jtre-obchod/data.json content/jtre/data.json
git commit -m "WIP: rozpracovaný obsah projektové řízení + data.json updates"
```

**Step 2: Mergovat feature branch do main**

```bash
git checkout main
git merge feature/executive-summary --no-ff -m "Merge feature/executive-summary: komponenty TeamMapChart, ProcessMatrix, RoadmapTimeline + Euroinstitut report"
```

Expected: merge proběhne bez konfliktů (feature branch je ahead of main).

**Step 3: Ověřit, že build projde**

```bash
npm run build
```

Expected: build PASS, žádné errory.

**Step 4: Vytvořit pracovní branch pro nový úvod**

```bash
git checkout -b feature/executive-summary-uvod
```

---

## Task 1: Modal komponenta

**Files:**
- Create: `web/src/components/ui/info-modal.tsx`

**Proč:** Perex potřebuje 2 modální tlačítka (navigace v reportu, metodika měření) – dnes žádná modal komponenta neexistuje.

**Step 1: Vytvořit komponentu**

```tsx
// web/src/components/ui/info-modal.tsx
"use client";

import { useState } from "react";

interface InfoModalProps {
  trigger: string;
  title: string;
  children: React.ReactNode;
}

export function InfoModal({ trigger, title, children }: InfoModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-3 py-1.5 text-sm font-medium text-fd-foreground hover:bg-fd-accent transition-colors cursor-pointer"
      >
        {trigger}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-fd-border bg-fd-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-fd-muted-foreground hover:text-fd-foreground text-xl leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

**Step 2: Registrovat v page.tsx**

V `web/src/app/jtre-projektove-rizeni/[[...slug]]/page.tsx` přidat:

```tsx
import { InfoModal } from '@/components/ui/info-modal';
```

A do `components` objektu v MDX:

```tsx
InfoModal,
```

**Step 3: Ověřit build**

```bash
npm run build
```

Expected: PASS

**Step 4: Commit**

```bash
git add src/components/ui/info-modal.tsx src/app/jtre-projektove-rizeni/\[\[...slug\]\]/page.tsx
git commit -m "Nová komponenta InfoModal pro skrytý obsah v perexu"
```

---

## Task 2: Nový uvod.mdx

**Files:**
- Modify: `web/content/jtre-projektove-rizeni/uvod.mdx` (kompletní přepis)

**Step 1: Přepsat uvod.mdx**

Kompletní nový obsah:

```mdx
---
title: Přehled
description: Executive summary AI auditu pro oddělení projektového řízení JTRE
---

# Váš tým a AI: kde jste dnes a co s tím

Provedl jsem AI audit oddělení projektového řízení firmy JTRE – **15 respondentů**, z toho **10 hloubkových rozhovorů** s klíčovými projektovými manažery. Doba čtení celého reportu je přibližně **20–25 minut**, ale nemusíte ho přečíst najednou. Tato stránka shrnuje to nejdůležitější.

<div className="flex gap-3 mt-4 mb-8">
  <InfoModal trigger="Jak číst report" title="Navigace v reportu">
    <p>Report má <strong>8 stránek</strong> rozdělených do dvou částí – analytické a strategické.</p>
    <p>V <strong>menu vlevo</strong> se přepínáte mezi stránkami. V <strong>menu vpravo</strong> vidíte obsah aktuální stránky pro snazší orientaci.</p>
    <p>Grafy a tabulky jsou <strong>interaktivní</strong> – najetím myší zobrazíte detaily.</p>
    <ul>
      <li><strong>Přehled</strong> (tato stránka) – shrnutí celého auditu</li>
      <li><strong>Tým</strong> – metriky oddělení vs. benchmark</li>
      <li><strong>Lidé</strong> – profily jednotlivců</li>
      <li><strong>Práce a nástroje</strong> – charakter práce, používané AI nástroje</li>
      <li><strong>Procesy</strong> – procesní analýza a příležitosti</li>
      <li><strong>Licence</strong> – doporučené AI nástroje</li>
      <li><strong>Vzdělávací plán</strong> – 5fázový plán</li>
      <li><strong>Shrnutí</strong> – rozhodnutí a další kroky</li>
    </ul>
  </InfoModal>

  <InfoModal trigger="Jak probíhalo měření" title="Metodika auditu">
    <table>
      <thead>
        <tr><th></th><th>Dotazník</th><th>Rozhovory</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Kdy</strong></td><td>20.–28. ledna 2026</td><td>6.–18. února 2026</td></tr>
        <tr><td><strong>Kdo</strong></td><td><strong>15 respondentů</strong> z oddělení projektového řízení</td><td><strong>10 klíčových lidí:</strong> Jan Kočí, Jana Řehořová, Pavel Stáhlík, Martin Koiš, Daniel Falťan, Daniel Petrlík, Petr Holan, Jiří Knob, Tomáš Pospíšil, Tomáš Mraček</td></tr>
        <tr><td><strong>Co</strong></td><td>Znalostní kvíz, sebehodnocení, postoje k AI, pracovní návyky, používané nástroje</td><td>45minutové individuální rozhovory o zkušenostech, postojích a pracovních procesech</td></tr>
        <tr><td><strong>Výstup</strong></td><td>Indexy Umím a Chci, srovnání s trhem</td><td>Mapa procesů, bolestivá místa, příležitosti pro automatizaci</td></tr>
      </tbody>
    </table>
    <p>Benchmark v tomto reportu vychází z dat více než <strong>200 respondentů</strong> napříč českými firmami, které prošly stejným auditem. Slouží jako orientační bod – ne jako cíl.</p>
  </InfoModal>
</div>

## Shrnutí v 5 bodech

<div className="space-y-6 my-8">

<div className="flex gap-4">
  <span className="text-4xl font-black text-fd-primary shrink-0 w-10 text-right">1</span>
  <div>
    <p className="font-bold text-lg mt-0 mb-1">ChatGPT používáte jako vyhledávač – ale umí mnohem víc.</p>
    <p className="text-fd-muted-foreground mt-0">9 z 15 lidí ho zná, ale nikdo nepracuje s kontextem vlastních dokumentů. Stáhlík z něj úspěšně vytáhl závazky ze stanoviska, Holan ušetřil právníkovi 2 hodiny na přípravě výzvy. Tohle je zlomek toho, co je možné.</p>
  </div>
</div>

<div className="flex gap-4">
  <span className="text-4xl font-black text-fd-primary shrink-0 w-10 text-right">2</span>
  <div>
    <p className="font-bold text-lg mt-0 mb-1">AI jste zkoušeli, narazili a vyvodili špatné závěry.</p>
    <p className="text-fd-muted-foreground mt-0">Knob testoval přepisy porad měsíc – nefungovalo. Kočí se ptal na vyhlášky – dostal neplatné. Ale problém nebyl v AI; problém byl v tom, že chatbot nedostal kontext. Dnes stačí nahrát normy do NotebookLM a halucinace zmizí.</p>
  </div>
</div>

<div className="flex gap-4">
  <span className="text-4xl font-black text-fd-primary shrink-0 w-10 text-right">3</span>
  <div>
    <p className="font-bold text-lg mt-0 mb-1">Oddělení je nejslabší v celém JTRE – a výrazně pod trhem.</p>
    <p className="text-fd-muted-foreground mt-0">Umím 2,9 oproti benchmarku 3,9. Praktické schopnosti 1,5 z 10 – šest lidí na nule. Finance i Obchod jsou na tom lépe. Dobrá zpráva: strach z AI je nejnižší v celé firmě (3,1). Tým nemá odpor, má mezeru.</p>
  </div>
</div>

<div className="flex gap-4">
  <span className="text-4xl font-black text-fd-primary shrink-0 w-10 text-right">4</span>
  <div>
    <p className="font-bold text-lg mt-0 mb-1">Cashflow, stanoviska a výkresy vás stojí desítky člověkodní ročně.</p>
    <p className="text-fd-muted-foreground mt-0">Kvartální aktualizace harmonogramů = týden na osobu. Ruční procházení 150 stanovisek. Kontrola výkresů bez AI pre-screeningu. Tři procesy, kde automatizace přináší okamžitou úlevu.</p>
  </div>
</div>

<div className="flex gap-4">
  <span className="text-4xl font-black text-fd-primary shrink-0 w-10 text-right">5</span>
  <div>
    <p className="font-bold text-lg mt-0 mb-1">Máte ambasadory, kteří to můžou táhnout – ale potřebují strukturu.</p>
    <p className="text-fd-muted-foreground mt-0">Falťan (Umím 4,7, Chci 7,6) aktivně experimentuje. Mraček nejlíp zvládl kvíz. Pospíšil má motivaci a vliv na realizace. Bez formální role a nástrojů ale jejich energie vyšumí.</p>
  </div>
</div>

</div>

<Callout type="info">
  Audiopřehled se připravuje. Brzy zde bude k dispozici shrnutí celého reportu ve formě krátkého audio záznamu.
</Callout>

---

## Mapa týmu

<TeamMapChart
  teamName="JTRE"
  teamUmim={3.53}
  teamChci={5.2}
  teamRozptyl={1.03}
  benchmarkUmim={3.9}
  benchmarkChci={5.83}
  benchmarkRozptyl={1.0}
  prehlcenost={5.59}
  benchmarkPrehlcenost={5.6}
  prescasy={5.56}
  benchmarkPrescasy={4.9}
  strachZAi={3.73}
  benchmarkStrachZAi={4.1}
  teams={[
    { name: "Finance", indexUmim: 3.96, indexChci: 5.89, pocetLidi: 10 },
    { name: "Obchod", indexUmim: 4.08, indexChci: 6.07, pocetLidi: 9 },
    { name: "Projektové řízení", indexUmim: 2.92, indexChci: 4.23, pocetLidi: 15 }
  ]}
  individuals={[
    { jmeno: "Daniel Falťan", kategorie: "Management", index_umim: 4.68, index_chci: 7.6 },
    { jmeno: "Lukáš Levický", kategorie: "Projekt", index_umim: 4.54, index_chci: 3.9 },
    { jmeno: "Daniel Petrlík", kategorie: "Projekt", index_umim: 4.04, index_chci: 4.5 },
    { jmeno: "Tomáš Mraček", kategorie: "Projekt", index_umim: 4.04, index_chci: 6.5 },
    { jmeno: "Václav Sigmund", kategorie: "Management", index_umim: 3.68, index_chci: 1.5 },
    { jmeno: "Tomáš Pospíšil", kategorie: "Management", index_umim: 3.32, index_chci: 6.2 },
    { jmeno: "Petr Holan", kategorie: "Management", index_umim: 2.96, index_chci: 5.1 },
    { jmeno: "Jiří Knob", kategorie: "Management", index_umim: 2.79, index_chci: 3.5 },
    { jmeno: "Martin Koiš", kategorie: "Management", index_umim: 2.64, index_chci: 5.1 },
    { jmeno: "Pavel Stáhlík", kategorie: "Management", index_umim: 2.64, index_chci: 5.3 },
    { jmeno: "Jan Kočí", kategorie: "Management", index_umim: 2.46, index_chci: 2.9 },
    { jmeno: "Jana Řehořová", kategorie: "Projekt", index_umim: 1.79, index_chci: 2.0 },
    { jmeno: "Pavel Opatřil", kategorie: "Management", index_umim: 1.43, index_chci: 4.0 },
    { jmeno: "Roman Gorski", kategorie: "Support", index_umim: 1.43, index_chci: 2.9 },
    { jmeno: "Radek Spurný", kategorie: "Management", index_umim: 1.43, index_chci: 2.4 }
  ]}
/>

## Kde začít – impact a effort

<Callout type="insight">
  Ne všechno, co bolí nejvíc, se řeší nejsnáz. Matice níže ukazuje čtyři kvadranty – a ke každému jasnou akci: co se dá vyřešit hned na workshopu, co vyžaduje hackathon, co si vyřešíte s konkrétním člověkem a co teď nemá smysl řešit.
</Callout>

| | **Snazší zavést** | **Náročnější zavést** |
|---|---|---|
| **Velký dopad** | **Nalejvárna (workshop)** | **Hackathon** |
| | Extrakce závazků ze smluv a stanovisek – ChatGPT Business s nahranými PDF (Stáhlík, Holan, Knob) | Automatizace cashflow – posun harmonogramů a nákladů jedním krokem (Řehořová, Kočí, Koiš, Falťan) |
| | Technické normy v NotebookLM – konec halucinací u vyhlášek a zákonů (Petrlík, Kočí, Knob) | Jednotný systém stavu projektů – návrh platformy na M365 (Knob + celý tým) |
| | AI pre-screening výkresů a dokumentace v PDF (Pospíšil, Kočí, Řehořová) | |
| | Právní drafty a výzvy – Holan ušetřil právníkovi 2 hodiny (Holan, Stáhlík) | |
| | Normalizace nabídek z výběrových řízení (Kočí, Petrlík, Mraček) | |
| **Menší dopad** | **Individuální práce** | **Neřešit (zatím)** |
| | Přenos dat mezi tabulkami – Power Automate (Holan, Falťan) | AI zápisy z kontrolních dnů – Knob testoval měsíc, nefunguje pro jejich styl |
| | Benchmark konkurence – AI rešerše pro Kočího | SharePoint optimalizace – IT záležitost mimo scope |

**Jak to číst:**
- **Nalejvárna** – quick wins, které si účastníci odnesou rovnou z workshopu. Společný vzorec: vezměte PDF, které už máte v ruce, a nechte AI ho přečíst.
- **Hackathon** – vysoký dopad, ale vyžaduje přípravu. Cashflow automatizace má největší měřitelnou úsporu; systém stavu projektů řeší kořenovou příčinu většiny problémů oddělení.
- **Individuální práce** – menší dopad na oddělení, ale velký pro konkrétního člověka.
- **Neřešit** – vysoká pracnost při nízkém dopadu, nebo už ověřeno, že nefunguje.

## Co děláme a kdy

<RoadmapTimeline
  steps={[
    {
      number: 1,
      title: "Pravidla a licence",
      description: "Nastavit pravidla práce s AI a aktivovat licence ChatGPT Business pro celý tým.",
      detail: "Interní jednastránkový dokument: co je bezpečné nahrávat, co ne. ChatGPT Business (~600 Kč/osoba/měsíc) pro 15 lidí. 5 licencí Microsoft 365 Copilot (~750 Kč/osoba) pro klíčové PM. Bez pravidel a licencí jsou všechna školení zbytečná.",
      timing: "Před Nalejvárnou",
      responsible: "Vedení + IT"
    },
    {
      number: 2,
      title: "AI Nalejvárna – celodenní bootcamp",
      description: "Praktický workshop zaměřený na reálné úkoly oddělení. Každý odejde s funkčním promptem.",
      detail: "Program: demystifikace AI (30 min), pravidla práce s daty (20 min), prompt engineering (90 min), praktická cvičení na stanoviscích, výkresech a normách (120 min), NotebookLM workshop (45 min), osobní akční plán (30 min).",
      timing: "Měsíc 1",
      responsible: "AI Pro Smrtelníky"
    },
    {
      number: 3,
      title: "AI Hackathon – cashflow a systém projektů",
      description: "Celodenní workshop, kde 3–4 týmy pracují na reálných projektech oddělení.",
      detail: "Tým 1: Jednotný systém stavu projektů (Knob, Falťan, Mraček, Koiš). Tým 2: Automatizace cashflow (Řehořová, Kočí, Falťan). Tým 3: Hromadná extrakce podmínek (Stáhlík, Holan, Petrlík). Tým 4: AI kontrola dokumentace (Pospíšil, Kočí, Řehořová).",
      timing: "Měsíc 2",
      responsible: "AI Pro Smrtelníky + IT"
    },
    {
      number: 4,
      title: "Debrief + jmenování ambasadorů",
      description: "Vyhodnocení: co tým reálně používá, co zahodil. Formální jmenování 3 ambasadorů.",
      detail: "Ambasadoři: Falťan (technický lídr), Mraček (dokumentátor), Pospíšil (most ke stavbám). Alokace 2 hodiny týdně na testování a sdílení know-how. AI buddies párování pro počáteční období.",
      timing: "Měsíc 3",
      responsible: "Vedení + ambasadoři"
    },
    {
      number: 5,
      title: "Specializované workshopy",
      description: "Dva půldenní workshopy zaměřené na Excel/automatizaci a analýzu dokumentů.",
      detail: "Workshop 1: Excel, cashflow, Power Query, Copilot (Falťan, Řehořová, Kočí, Koiš, Holan, Petrlík). Workshop 2: ChatGPT Business a NotebookLM nad reálnými smlouvami a výkresy (Stáhlík, Holan, Knob, Pospíšil, Mraček, Petrlík, Kočí).",
      timing: "Měsíc 3–4",
      responsible: "AI Pro Smrtelníky",
      parallel: true
    },
    {
      number: 6,
      title: "Přeměření",
      description: "Stejný dotazník + rozhovory. Srovnání indexů Umím a Chci s výchozím měřením.",
      detail: "Na základě výsledků rozhodnutí: rozšíření Copilot licencí na celý tým? Nákup dalších nástrojů? Pokračování ambasadorského programu nebo přechod na self-service?",
      timing: "Měsíc 6",
      responsible: "AI Pro Smrtelníky + vedení"
    }
  ]}
/>

## Co potřebuju od vás

<Callout type="warning">
  Bez těchto tří věcí se nepohneme. Nejde o velké investice – jde o jasné signály, které odblokují další kroky.
</Callout>

**1. Otevřenou mysl.** AI se za poslední rok dramaticky posunula. Zkušenosti, které tým má – halucinace u norem, nesmyslné přepisy porad – vycházejí z doby, kdy AI uměla méně, nebo ze situací, kdy nedostala potřebný kontext. Dnes umí pracovat s vašimi dokumenty, číst PDF výkresy a z 80 stanovisek vytáhnout podmínky za minuty. Prosím, dejte jí druhou šanci.

**2. Licence a přístupy – připravené před Nalejvárnou.** ChatGPT Business pro celý tým (~9 000 Kč/měsíc), 5 licencí Microsoft 365 Copilot pro klíčové PM (~3 750 Kč/měsíc). Všichni přihlášení, funkční účty. Bez toho je workshop jen přednáška.

**3. Čas.** Přehlcenost oddělení je 6,1 – nad průměrem trhu. Kočí a Stáhlík reportují přesčasy 9 z 10. Nalejvárna musí být pracovní den, ne extra zátěž. Ambasadoři potřebují alokaci 2 hodiny týdně. Pokud tým nedostane prostor, nic se nezmění.

{/* === EXPERIMENTÁLNÍ SEKCE – ProcessMatrix pro budoucí použití === */}

{/*
<ProcessMatrix
  processes={[
    { name: "Aktualizace cashflow a harmonogramů", impact: 5, effort: 4, lossDays: 60, lossKc: 420000, who: "Řehořová, Kočí, Koiš, Falťan + další", frequency: "Kvartálně", tools: "Excel makra/VBA + Copilot" },
    { name: "Extrakce podmínek ze smluv a stanovisek", impact: 5, effort: 2, lossDays: 30, lossKc: 210000, who: "Stáhlík, Holan, Knob", frequency: "Per projektová fáze", tools: "ChatGPT Business" },
    { name: "AI pre-screening výkresů", impact: 4, effort: 3, lossDays: 25, lossKc: 175000, who: "Pospíšil, Kočí, Řehořová", frequency: "Denně–týdně", tools: "ChatGPT multimodální" },
    { name: "Normalizace nabídek z výběrových řízení", impact: 3, effort: 2, lossDays: 15, lossKc: 105000, who: "Kočí, Petrlík, Mraček", frequency: "10+ tenderů per projekt", tools: "ChatGPT Business" },
    { name: "Ověřování technických norem", impact: 3, effort: 1, lossDays: 10, lossKc: 70000, who: "Petrlík, Kočí, Knob", frequency: "Průběžně", tools: "NotebookLM" }
  ]}
  licenseCostYearly={153000}
/>
*/}
```

**Step 2: Ověřit build**

```bash
npm run build
```

Expected: PASS

**Step 3: Ověřit vizuálně**

```bash
npm run dev
```

Otevřít `localhost:3000/jtre-projektove-rizeni/uvod` a zkontrolovat:
- [ ] Hero nadpis se zobrazuje správně
- [ ] Modální tlačítka fungují (klik → overlay → obsah → zavření)
- [ ] 5 bodů s velkými číslicemi
- [ ] Audio placeholder callout
- [ ] TeamMapChart se 3 taby
- [ ] Kvadrantová tabulka procesů
- [ ] RoadmapTimeline
- [ ] Sekce „Co potřebuju od vás"
- [ ] ProcessMatrix je zakomentovaná (neviditelná)

**Step 4: Commit**

```bash
git add content/jtre-projektove-rizeni/uvod.mdx
git commit -m "Executive summary: nový úvod pro projektové řízení"
```

---

## Task 3: Aktualizace meta.json

**Files:**
- Modify: `web/content/jtre-projektove-rizeni/meta.json`

**Step 1: Změnit title první stránky**

V `meta.json` změnit label první stránky z „Úvod" na „Přehled" (pokud je tam explicitně).

**Step 2: Ověřit sidebar**

```bash
npm run dev
```

Zkontrolovat, že sidebar ukazuje „Přehled" místo „Úvod".

**Step 3: Commit**

```bash
git add content/jtre-projektove-rizeni/meta.json
git commit -m "Sidebar: přejmenování Úvod → Přehled"
```

---

## Task 4: Odstranění testovací stránky

**Files:**
- Delete: `web/content/jtre-finance/test-components.mdx`

**Step 1: Smazat testovací stránku**

Testovací stránka `test-components.mdx` v jtre-finance už není potřeba – komponenty jsou v produkčním použití.

```bash
rm web/content/jtre-finance/test-components.mdx
```

**Step 2: Ověřit build**

```bash
npm run build
```

Expected: PASS

**Step 3: Commit**

```bash
git add -A content/jtre-finance/test-components.mdx
git commit -m "Smazána testovací stránka pro executive summary komponenty"
```

---

## Souhrn tasků

| # | Task | Odhad |
|---|---|---|
| 0 | Git: commit + merge + nová branch | 5 min |
| 1 | Modal komponenta | 10 min |
| 2 | Nový uvod.mdx (kompletní obsah) | 5 min |
| 3 | meta.json update | 2 min |
| 4 | Smazání test-components.mdx | 2 min |

Celkem: ~25 min implementace + vizuální kontrola.
