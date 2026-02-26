# AI Kompas — Web reporty

Interaktivní webová aplikace pro zobrazení AI audit reportů pro klienty. Každý klient má vlastní sekci s vizualizacemi, analýzou týmu a doporučeními.

## Stack

- [Next.js 15](https://nextjs.org) — App Router
- [Fumadocs](https://fumadocs.vercel.app) — docs layout (sidebar, TOC)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Recharts](https://recharts.org) — interaktivní grafy
- MDX — obsah reportů

## Spuštění lokálně

```bash
npm install
npm run dev
```

Web běží na [http://localhost:3000](http://localhost:3000) a přesměruje na aktuální report.

## Struktura projektu

```
content/
  [klient]/          ← MDX stránky reportu + data.json
src/
  app/[slug]/        ← Next.js routes per klient
  components/        ← vizualizační komponenty (grafy, tabulky)
  lib/source.ts      ← Fumadocs loader per klient
```

## Editace textů

Viz [CONTRIBUTING.md](./CONTRIBUTING.md) — průvodce pro editaci bez technických zkušeností.

## Deploy

Automatický deploy na [Vercel](https://vercel.com) při push do `main`.
