# Jak editovat reporty — průvodce krok za krokem

Tento návod tě provede od nuly až po odeslání úprav. Nepotřebuješ žádné předchozí zkušenosti s programováním ani Gitem.

---

## 1. Nainstaluj Cursor

Cursor je editor kódu s vestavěnou AI, která ti bude pomáhat s celým procesem.

1. Jdi na https://www.cursor.com a stáhni verzi pro Mac
2. Nainstaluj a spusť — máš 7 dní zdarma
3. Při prvním spuštění vytvoř účet (stačí přes Google)

Od teď budeš většinu věcí dělat tak, že **napíšeš do chatu v Cursoru co potřebuješ** a AI tě provede.

Chat otevřeš klávesovou zkratkou **Cmd+I** (nebo klikneš na ikonu chatu v pravém panelu).

---

## 2. Založ si Git a GitHub

Git je systém pro správu verzí souborů. GitHub je web, kde se soubory sdílí mezi lidmi.

Otevři chat v Cursoru a zadej:

> Potřebuji si nainstalovat Git a vytvořit GitHub účet. Proveď mě tím krok za krokem. Jsem na Macu.

AI tě provede:
- Instalací Gitu (přes Xcode Command Line Tools)
- Vytvořením účtu na github.com
- Nastavením jména a emailu v Gitu

**Až budeš mít účet, pošli mi svůj GitHub username** — přidám tě do repozitáře.

---

## 3. Stáhni repozitář

Až tě přidám jako contributora, zadej do chatu v Cursoru:

> Potřebuji naklonovat repozitář https://github.com/dolezal-td/ai-audit-web a vytvořit novou branch s názvem `upravy-palo`. Proveď mě tím.

Výsledek: máš na disku celý projekt a pracuješ na vlastní větvi, která neovlivní hlavní verzi.

---

## 4. Spusť lokální preview

V chatu v Cursoru zadej:

> Spusť mi vývojový server, ať vidím web v prohlížeči.

AI spustí `npm install` a `npm run dev`. V prohlížeči pak uvidíš web na adrese http://localhost:3000.

Preview se automaticky aktualizuje, když uložíš změny v souboru.

---

## 5. Edituj texty

Reporty jsou v složce `content/jtre/`. Každá stránka je jeden `.mdx` soubor:

| Soubor | Stránka |
|--------|---------|
| `uvod.mdx` | Úvod |
| `tym.mdx` | Tým |
| `lide.mdx` | Lidé |
| `prace-a-nastroje.mdx` | Práce a nástroje |
| `procesy.mdx` | Procesy |
| `doporuceni.mdx` | Doporučení |

### Co můžeš editovat

- **Běžný text** — odstavce, nadpisy (`##`), odrážky, tučné písmo (`**text**`)
- **Text uvnitř `<Callout>`** — bloky se zvýrazněným textem (insight, warning, positive)

Příklad — tohle můžeš upravit:

```
## Znalosti a zkušenosti

Průměrný člen týmu zná základní koncepty, ale nemá praktické
zkušenosti s implementací AI nástrojů do svého workflow.

<Callout type="insight">
  Tenhle text můžeš editovat — je to interpretace dat.
</Callout>
```

### Čeho se nedotýkej

- **Bloky s daty** — vše co vypadá jako `<NázevKomponenty data={[...]} />`. Jsou to grafy a tabulky s čísly. Příklad:

```
<TeamRadar
  clientName="JTRE"
  data={[
    { metric: "Umím", value: 3.1, benchmark: 3.9 },
    ...
  ]}
/>
```

- **Frontmatter** — blok na úplném začátku souboru mezi `---`:

```
---
title: Tým
description: Celkové metriky firmy vs. benchmark trhu
---
```

**Jednoduché pravidlo:** pokud vidíš `{`, `[`, `data=` nebo `/>`, nedotýkej se toho.

---

## 6. Odešli změny

Až budeš s úpravami hotový, zadej do chatu v Cursoru:

> Commitni všechny moje změny a pushni je na GitHub. Pak vytvoř pull request.

AI vytvoří commit, pushne tvou branch na GitHub a vytvoří pull request — žádost o začlenění tvých změn do hlavní verze.

**Od téhle chvíle to přebírám já** — podívám se na tvé úpravy, případně napíšu komentáře, a když bude vše OK, schválím a mergnu.

---

## Shrnutí workflow

```
Cursor nainstalován
        ↓
Git + GitHub účet (AI tě provede)
        ↓
Naklonování repa + nová branch
        ↓
npm run dev → preview v prohlížeči
        ↓
Editace textů v .mdx souborech
        ↓
Commit + push + pull request (AI tě provede)
        ↓
Tomáš reviewne → merge → deploy
```

## Potřebuješ pomoct?

Kdykoliv si nebudeš jistý, zeptej se AI v Cursoru. Pokud ani ta neporadí, ozvi se Tomášovi.
