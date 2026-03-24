# Demo report – anonymizovaný ukázkový report

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Vytvořit veřejně přístupný demo report na `/demo/` jako kopii Euroinstitut reportu s anonymizovanými jmény, firmou a kategoriemi.

**Architecture:** Kopie 8 MDX stránek + data.json + meta.json do `content/demo/`, nový app route, nový source v Fumadocs. Bez PINu – middleware automaticky propustí. Homepage tile s barvou a popisem.

**Tech Stack:** Next.js, Fumadocs MDX, TypeScript

---

## Mapovací tabulka – jména

| # | Původní | Demo | Původní kategorie | Demo kategorie | Původní role | Demo role |
|---|---|---|---|---|---|---|
| 1 | Karel Krucký | Martin Dvořák | Management | Vedení | Manažer | Jednatel |
| 2 | Veronika Vajdiaková | Lucie Procházková | Projekťák | Provoz a HR | Projekťák | HR specialistka |
| 3 | Aneta Marinkovič | Jana Černá | Management | Vedení | Manažer | Vedoucí oddělení |
| 4 | Markéta Nováková | Petra Veselá | Management | Vedení | manažer, podpora, vzdělavatel | Manažerka, podpora |
| 5 | Daniela Kovaříková | Eva Horáková | Management | Vedení | Manažer, Lektor, Podpora | Vedoucí týmu |
| 6 | Pavla Dušková | Tereza Kopecká | Lektor | Finance a účetnictví | Lektor či jiný vzdělavatel | Účetní junior |
| 7 | Michaela Týblová | Barbora Šimková | HR | Provoz a HR | HR | HR manažerka |
| 8 | Kateřina Junková | Hana Marková | Support | Provoz a HR | Asistent / support | Asistentka |
| 9 | Jana Kosecová | Alena Pokorná | Management | Vedení | Manažer | Vedoucí pobočky |
| 10 | Daniela Petřeková | Ivana Benešová | (prázdné) | Finance a účetnictví | (prázdné) | Finanční kontrolorka |
| 11 | Michaela Krucká | Monika Krejčí | Administrativa | Finance a účetnictví | administrativní pracovník | Fakturantka |
| 12 | Petra Pospíšilová | Lenka Říhová | Management | Finance a účetnictví | Manažer | Účetní |
| 13 | Michelle Muchová | Klára Němcová | Support | Provoz a HR | Asistent / support | Provozní asistentka |
| 14 | Ilona Jará Svobodová | Dana Urbanová | Lektor | Finance a účetnictví | Lektor či jiný vzdělavatel | Finanční analytička |
| 15 | Kateřina Weiserová | Simona Fialová | Lektor | Finance a účetnictví | Lektor či jiný vzdělavatel | Senior účetní |
| 16 | Monika Miňovská | Renata Králová | Metodik | Provoz a HR | metodik | Metodička procesů |

## Mapovací tabulka – kategorie (v grafech)

| Původní (v scatter/heatmap) | Demo |
|---|---|
| Vedení | Vedení |
| Speciální pedagogové / Speciální pedagog | Finance a účetnictví |
| Kancelář + HR | Provoz a HR |

## Mapovací tabulka – firma a kontext

| Původní | Demo |
|---|---|
| Euroinstitut | Vzdělávací centrum Horizont |
| Euroinstitutu (genitiv) | Vzdělávacího centra Horizont |
| síť škol | síť poboček |
| speciální pedagog/pedagožka | finanční kontrolor/ka |
| učitelé/učitele | zaměstnanci/zaměstnance |
| žáci/žáků | klienti/klientů |
| IVP (individuální vzdělávací plán) | individuální klientský plán (IKP) |
| karty konzultací | měsíční reporty |
| Google Disk | sdílený disk |
| Bakaláři | interní systém |
| pedagogická rada | porada vedení |
| speciálně pedagogická dokumentace | finanční dokumentace |
| Nalejvárna | Workshop |
| AI Pro Smrtelníky | externí konzultant |
| Středočeská škola | středočeská pobočka |
| Karlovarský kraj | jihočeská pobočka |
| Olomoucká škola | olomoucká pobočka |
| TLDV | TLDV |
| Cursor | Cursor |

## Mapovací tabulka – zodpovědnosti (data.json)

Zodpovědnosti v data.json obsahují identifikující informace (názvy škol, specifické procesy). Pro každou osobu se přepíšou na generickou verzi odpovídající nové roli. Viz Task 2.

---

### Task 1: Routing a konfigurace

**Files:**
- Modify: `web/source.config.ts`
- Modify: `web/src/lib/source.ts`
- Create: `web/src/app/demo/layout.tsx`
- Create: `web/src/app/demo/[[...slug]]/page.tsx`
- Modify: `web/src/config/access.ts`

**Step 1: Přidat source do source.config.ts**

Na konec souboru (před `export default`) přidat:

```ts
export const demo = defineDocs({
  dir: 'content/demo',
});
```

**Step 2: Přidat loader do source.ts**

Import `demo` z `@/.source/server` a přidat:

```ts
export const demoSource = loader({
  source: demo.toFumadocsSource(),
  baseUrl: '/demo',
});
```

**Step 3: Vytvořit layout.tsx**

Zkopírovat z `src/app/euroinstitut/layout.tsx`. Změny:
- Import `demoSource` místo `euroinstitutSource`
- `reportSlug="demo"`
- `url: '/demo/uvod'`
- `currentReport="demo"`
- Název funkce: `DemoLayout`
- Protože report je veřejný a uživatel nemusí mít session, ošetřit `session` jako nullable (už je – `session?.reports ?? []`)

```tsx
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { demoSource } from '@/lib/source';
import { SidebarSeparator } from '@/components/sidebar-separator';
import { ReportSwitcher } from '@/components/report-switcher';
import { NavTitle } from '@/components/nav-title';
import { SidebarPdfLink } from '@/components/sidebar-pdf-link';
import { LogoutButton } from '@/components/logout-button';
import { SidebarThemeToggle } from '@/components/sidebar-theme-toggle';
import { decodeSession } from '@/lib/auth';

export default async function DemoLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('pin-session');
  const session = sessionCookie ? decodeSession(sessionCookie.value) : null;
  const reports = session?.reports ?? [];

  return (
    <DocsLayout
      tree={demoSource.pageTree}
      nav={{
        title: <NavTitle showHome={reports.length > 1} reportSlug="demo" />,
        url: '/demo/uvod',
      }}
      searchToggle={{ enabled: false }}
      themeSwitch={{ enabled: false }}
      sidebar={{
        banner: (
          <ReportSwitcher currentReport="demo" reports={reports} />
        ),
        footer: (
          <div className="flex items-center gap-1">
            <SidebarPdfLink reportSlug="demo" />
            <SidebarThemeToggle />
            <LogoutButton variant="icon" />
          </div>
        ),
        components: {
          Separator: SidebarSeparator,
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
```

**Step 4: Vytvořit page.tsx**

Zkopírovat z `src/app/euroinstitut/[[...slug]]/page.tsx`. Změny:
- Import `demoSource` místo `euroinstitutSource`
- Redirect na `/demo/uvod`
- Všechny reference na `euroinstitutSource` → `demoSource`

**Step 5: Přidat REPORTS záznam do access.ts**

Přidat do `REPORTS`:

```ts
demo: {
  title: "Vzdělávací centrum Horizont",
  subtitle: "Ukázkový report",
  color: "#D946EF",
  colorLight: "rgba(217, 70, 239, 0.08)",
},
```

**NEPŘIDÁVAT** do `ACCESS` – report bude veřejný.

**Step 6: Ověřit**

Run: `cd /Users/tomasdolezal/Developer/ai-audit/web && npx next build 2>&1 | head -30`
Expected: Build projde (content ještě neexistuje, ale source config je OK)

**Step 7: Commit**

```bash
git add source.config.ts src/lib/source.ts src/app/demo/ src/config/access.ts
git commit -m "Routing a konfigurace pro demo report"
```

---

### Task 2: data.json – anonymizace

**Files:**
- Create: `web/content/demo/data.json`

**Step 1: Zkopírovat euroinstitut data.json**

```bash
cp web/content/euroinstitut/data.json web/content/demo/data.json
```

**Step 2: Anonymizovat data.json**

Změnit pole `klient` na `"demo"`.

Pro každou osobu v poli `lide` (16 záznamů) nahradit:
- `jmeno` → fiktivní jméno dle mapovací tabulky
- `kategorie` → nová kategorie dle mapovací tabulky
- `role` → nová role dle mapovací tabulky
- `zodpovednosti` → přepsat na generickou verzi odpovídající nové roli

Přepis zodpovědností:

| Demo jméno | Nové zodpovědnosti |
|---|---|
| Martin Dvořák | Strategické řízení firmy, všechny oblasti |
| Lucie Procházková | HR procesy, nábor, onboarding |
| Jana Černá | Vedení oddělení, koordinace týmů, procesní řízení |
| Petra Veselá | Vedení části týmu, metodické vedení, organizace práce, dokumentace |
| Eva Horáková | Vedení týmu, komunikace s vedením, koordinace práce, administrativa, kontrola dokumentace, metodické vedení |
| Tereza Kopecká | Podpora kolegů, základní účetní operace |
| Barbora Šimková | HR agenda – onboarding, offboarding, výkazy a mzdy, personální dokumentace, péče o zaměstnance |
| Hana Marková | Podpora a administrativa na středočeské pobočce |
| Alena Pokorná | Provoz jihočeské pobočky, koordinace poboček, vedení studijního oddělení |
| Ivana Benešová | Provoz olomoucké pobočky, kontrola procesů, finanční poradenství |
| Monika Krejčí | Fakturace, administrativa, prodej |
| Lenka Říhová | Účetnictví pro několik poboček, zpracování dokladů |
| Klára Němcová | Kontrola dokladů, správnost dat, podpora pro celý tým, komunikace s dodavateli, objednávky |
| Dana Urbanová | Finanční kontrola poboček, metodická podpora, reporting, spolupráce s externími auditory |
| Simona Fialová | Senior účetní pro více poboček, metodické vedení, administrativa, kontrola dokumentace |
| Renata Králová | Kvalifikace pracovníků, plán vzdělávání, metodické postupy, akreditace |

Všechna čísla (indexy, skóry, benchmarky, činnosti, nástroje, koncepty) zůstávají beze změny.

**Step 3: Ověřit**

Zkontrolovat, že JSON je validní:
```bash
python3 -c "import json; json.load(open('web/content/demo/data.json'))"
```

**Step 4: Commit**

```bash
git add web/content/demo/data.json
git commit -m "Anonymizovaný data.json pro demo report"
```

---

### Task 3: meta.json

**Files:**
- Create: `web/content/demo/meta.json`

**Step 1: Vytvořit meta.json**

```json
{
  "title": "AI Kompas – Vzdělávací centrum Horizont",
  "pages": [
    "uvod",
    "---Analytická část---",
    "tym", "lide", "prace-a-nastroje",
    "---Strategická část---",
    "procesy", "licence", "vzdelavaci-plan", "shrnuti"
  ]
}
```

**Step 2: Commit**

```bash
git add web/content/demo/meta.json
git commit -m "meta.json pro demo report"
```

---

### Task 4: MDX stránky – anonymizace

Toto je největší task. Pro každou z 8 MDX stránek: zkopírovat z euroinstitut, provést substituci jmen, firmy, kategorií a kontextových termínů dle mapovacích tabulek.

**Files:**
- Create: `web/content/demo/uvod.mdx`
- Create: `web/content/demo/tym.mdx`
- Create: `web/content/demo/lide.mdx`
- Create: `web/content/demo/prace-a-nastroje.mdx`
- Create: `web/content/demo/procesy.mdx`
- Create: `web/content/demo/licence.mdx`
- Create: `web/content/demo/vzdelavaci-plan.mdx`
- Create: `web/content/demo/shrnuti.mdx`

**Step 1: Zkopírovat všechny MDX soubory**

```bash
for f in uvod tym lide prace-a-nastroje procesy licence vzdelavaci-plan shrnuti; do
  cp web/content/euroinstitut/$f.mdx web/content/demo/$f.mdx
done
```

**Step 2: Provést substituce v každém souboru**

Pro **každý soubor** provést tyto záměny (v tomto pořadí – delší stringy první):

Jména (příjmení – v textu se často používají jen příjmení):
- `Ilona Jará Svobodová` → `Dana Urbanová`
- `I. Jará Svobodová` → `D. Urbanová`
- `Jará Svobodová` → `Urbanová`
- `Michelle Muchová` → `Klára Němcová`
- `Veronika Vajdiaková` → `Lucie Procházková`
- `Vajdiaková` → `Procházková`
- `Aneta Marinkovič` → `Jana Černá`
- `A. Marinkovič` → `J. Černá`
- `Marinkovič` → `Černá`
- `Karel Krucký` → `Martin Dvořák`
- `K. Krucký` → `M. Dvořák`
- `Krucký` → `Dvořák`
- `Markéta Nováková` → `Petra Veselá`
- `M. Nováková` → `P. Veselá`
- `Nováková` → `Veselá`
- `Daniela Kovaříková` → `Eva Horáková`
- `D. Kovaříková` → `E. Horáková`
- `Kovaříková` → `Horáková`
- `Pavla Dušková` → `Tereza Kopecká`
- `P. Dušková` → `T. Kopecká`
- `Dušková` → `Kopecká`
- `Michaela Týblová` → `Barbora Šimková`
- `Týblová` → `Šimková`
- `Kateřina Junková` → `Hana Marková`
- `K. Junková` → `H. Marková`
- `Junková` → `Marková`
- `Jana Kosecová` → `Alena Pokorná`
- `J. Kosecová` → `A. Pokorná`
- `Kosecová` → `Pokorná`
- `Daniela Petřeková` → `Ivana Benešová`
- `Petřeková` → `Benešová`
- `Michaela Krucká` → `Monika Krejčí`
- `Krucká` → `Krejčí`
- `Petra Pospíšilová` → `Lenka Říhová`
- `P. Pospíšilová` → `L. Říhová`
- `Pospíšilová` → `Říhová`
- `Muchová` → `Němcová`
- `Kateřina Weiserová` → `Simona Fialová`
- `K. Weiserová` → `S. Fialová`
- `Weiserová` → `Fialová`
- `Monika Miňovská` → `Renata Králová`
- `Miňovská` → `Králová`

Firma:
- `Euroinstitutu` → `Vzdělávacího centra Horizont`
- `Euroinstitut` → `Vzdělávací centrum Horizont`

Kategorie (v komponentách):
- `Speciální pedagogové` → `Finance a účetnictví`
- `Speciální pedagog` → `Finance a účetnictví`
- `Kancelář + HR` → `Provoz a HR`

Kontext (v textech – pozor na kontext, nenahrazovat slepě):
- `speciální pedagožka` → `finanční kontrolorka`
- `speciální pedagožky` → `finanční kontrolorky`
- `speciálních pedagogů` → `finančního oddělení`
- `speciální pedagogové` → `finanční tým`
- `speciální pedagog` → `finanční kontrolor`
- `speciálně pedagogické` → `finanční`
- `speciálně pedagogickým` → `finančním`
- `učitelé` → `zaměstnanci`
- `učitele` → `zaměstnance`
- `učitelů` → `zaměstnanců`
- `učiteli` → `zaměstnanci`
- `učitelům` → `zaměstnancům`
- `žáků` → `klientů`
- `žáky` → `klienty`
- `žáci` → `klienti`
- `žáka` → `klienta`
- `IVP` → `IKP`
- `individuálních vzdělávacích plánů` → `individuálních klientských plánů`
- `individuální vzdělávací plány` → `individuální klientské plány`
- `karet konzultací` → `měsíčních reportů`
- `karty konzultací` → `měsíční reporty`
- `Karty konzultací` → `Měsíční reporty`
- `Nalejvárna` → `Workshop`
- `Nalejvárnou` → `Workshopem`
- `Nalejvárny` → `Workshopu`
- `AI Pro Smrtelníky` → `externí konzultant`
- `AI Pro Smrtelníky + Krucký` → `externí konzultant + Dvořák` (v RoadmapTimeline)
- `AI Pro Smrtelníky + vedení` → `externí konzultant + vedení` (v RoadmapTimeline)
- `s Tomášem` → `s konzultantem`
- `pana Kruckého` → `pana Dvořáka`
- `Středočeské školy` → `středočeské pobočky`
- `Karlovarském kraji` → `jihočeském kraji`
- `Olomoucké školy` → `olomoucké pobočky`
- `síti škol Euroinstitut` → `síti poboček`
- `síť škol` → `síť poboček`
- `vedoucí školního poradenského pracoviště` → `vedoucí oddělení`
- `vedoucí RSO` → `vedoucí provozu`
- `studijní referentka` → `provozní referentka`
- `studijního oddělení` → `provozního oddělení`
- `Hope týmu` → `provozního týmu`
- `zřizovatel` → `jednatel`
- `zřizovatel škol` → `jednatel firmy`
- `Zřizovatel` → `Jednatel`
- `pedagogický proces` → `operativní řízení`
- `pedagogické rady` → `porady vedení`
- `pedagogických pracovníků` → `pracovníků`
- `pedagogické vedení tříd` → `vedení týmů`
- `pedagogického sboru` → `pracovního týmu`
- `pedagogů` → `pracovníků`
- `Pedagogické rady` → `Porady vedení`
- `pedagogickými` → `provozními`
- `pedagogické` → `provozní`
- `pedagogickou` → `provozní`
- `v rámci Google Workspace` → `v rámci interních systémů`
- `wflow` → `interní systém`
- `VFLOW` → `účetní systém`
- `Bakalářích` → `interním systému`
- `Bakaláři` → `interní systém`
- `Bakalářích (jak Junková naznačila)` → `nový interní systém (jak Marková naznačila)`
- `SPC` → `centrála`
- `DVPP` → `vzdělávání`
- `MŠMT` → `regulátor`
- `BOZP` → `compliance`

**Důležité:**
- Po substituci **ručně zkontrolovat** každý soubor, že text dává smysl
- Některé substituce vyžadují kontextovou úpravu (citáty z rozhovorů musí dávat smysl v novém kontextu)
- V `uvod.mdx` frontmatter: `description: Executive summary AI auditu pro Vzdělávací centrum Horizont`
- V `uvod.mdx` TeamMapChart: `teamName="Vzdělávací centrum Horizont"`
- V `tym.mdx` TeamRadar: `clientName="Vzdělávací centrum Horizont"`

**Step 3: Kontrola – žádné zbývající originální jméno**

```bash
grep -n "Euroinstitut\|Krucký\|Vajdiaková\|Marinkovič\|Nováková\|Kovaříková\|Dušková\|Týblová\|Junková\|Kosecová\|Petřeková\|Krucká\|Pospíšilová\|Muchová\|Jará Svobodová\|Weiserová\|Miňovská" web/content/demo/*.mdx
```

Expected: žádný výstup.

**Step 4: Ověřit build**

```bash
cd /Users/tomasdolezal/Developer/ai-audit/web && npm run build
```

Expected: Build projde bez chyb.

**Step 5: Commit**

```bash
git add web/content/demo/
git commit -m "Anonymizované MDX stránky pro demo report"
```

---

### Task 5: Ověření a finální kontrola

**Step 1: Spustit dev server**

```bash
cd /Users/tomasdolezal/Developer/ai-audit/web && npm run dev
```

**Step 2: Kontrolní body**

- [ ] `/demo/uvod` – načte se, žádné originální jméno
- [ ] `/demo/tym` – radar chart a metric cards fungují
- [ ] `/demo/lide` – scatter plot a people heatmap fungují, jména anonymizovaná
- [ ] `/demo/prace-a-nastroje` – heatmapy fungují
- [ ] `/demo/procesy` – tabulky a text anonymizované
- [ ] `/demo/licence` – tabulka s doporučenými licencemi, jména anonymizovaná
- [ ] `/demo/vzdelavaci-plan` – timeline a tabulky, jména anonymizovaná
- [ ] `/demo/shrnuti` – text a callouts anonymizované
- [ ] Homepage – tile „Vzdělávací centrum Horizont" viditelný
- [ ] Demo report přístupný **bez PINu**
- [ ] Grep na originální jména v `content/demo/` vrací 0 výsledků

**Step 3: Build**

```bash
npm run build
```

**Step 4: Finální commit**

Pokud byly potřeba opravy z kontroly:

```bash
git add -A web/content/demo/ web/src/
git commit -m "Demo report – finální opravy po kontrole"
```

---

## Poznámky

- **Middleware:** `"demo"` není v `PROTECTED_REPORTS` → middleware ho propustí automaticky (řádek 23 middleware.ts)
- **Homepage tile:** `"demo"` je v `REPORTS` → zobrazí se na homepage. Ale není v žádném ACCESS záznamu → nikdo nemá demo v sessions → tile se zobrazí jen přihlášeným uživatelům s alespoň jedním reportem? **Ověřit** – pokud homepage vyžaduje session, nebude tile viditelný bez přihlášení. To je OK, protože demo report je přístupný přes přímý odkaz `/demo/`.
- **Řazení substitucí:** Vždy nahrazovat delší stringy první (např. `Ilona Jará Svobodová` před `Jará Svobodová`), aby nedošlo k částečné záměně.
- **Citáty z rozhovorů:** Některé citáty obsahují specifické detaily (iPady, puzzle dinosauru, 7 emailových schránek). Tyto ponechat – jsou dostatečně generické a dodávají reportu autenticitu. Pouze anonymizovat jména.
