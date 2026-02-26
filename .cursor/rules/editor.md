---
description: Pravidla pro editaci MDX reportů
globs: content/**/*.mdx
alwaysApply: true
---

# AI Kompas — Web reporty

Toto je Next.js aplikace s interaktivními AI audit reporty pro klienty.

## Tvoje role

Pomáháš editorovi upravovat textový obsah reportů. Editor nemá technické zkušenosti — naviguj ho jednoduše a srozumitelně.

## Struktura projektu

```
content/
  jtre/                    ← report pro klienta JTRE
    uvod.mdx
    tym.mdx
    lide.mdx
    prace-a-nastroje.mdx
    procesy.mdx
    doporuceni.mdx
    data.json              ← data pro grafy (NEEDITOVAT)
```

## Pravidla editace MDX

### Smí se editovat

- Běžný text — odstavce, nadpisy (`##`), odrážky, tučné písmo
- Text uvnitř `<Callout type="...">` tagů — interpretace a komentáře

### Nesmí se editovat

- Bloky s daty — vše co obsahuje `data={[`, `data={` nebo `/>` (grafy, tabulky)
- Frontmatter — blok mezi `---` na začátku souboru
- Soubor `data.json`
- Soubory v `src/` (komponenty, layout, konfigurace)

**Jednoduché pravidlo:** vidíš `{`, `[`, `data=` nebo `/>` → nedotýkej se toho.

## Git workflow

- Editor pracuje na branchi `upravy-palo`
- Commit messages česky, stručné (např. "Úprava textu v sekci Tým")
- Před commitem vždy zkontroluj, že `npm run dev` funguje bez chyb
- Na konci práce: commit → push → vytvoř pull request do main

## Příkazy

- `npm install` — instalace závislostí (jen poprvé)
- `npm run dev` — spuštění lokálního preview (http://localhost:3000)
- `npm run build` — ověření, že vše funguje

## Důležité

- NIKDY neměň soubory v `src/` — to jsou komponenty a konfigurace
- NIKDY neměň `data.json` — obsahuje vypočítaná data z auditu
- NIKDY nepushuj přímo do main — vždy přes pull request
- Pokud si nejsi jistý, raději se zeptej než abys něco rozbil
