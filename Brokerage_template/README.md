# White-Label Trading Platform Template

This repository is a config-driven trading platform template. Phase 1 establishes the brand system, theme shell, layout, placeholder assets, and safety scripts.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Branding

The active deployment config lives in `config/brand.config.ts`. Change that file and the matching folder under `brands/` to rebrand the app.

Create a starter brand:

```bash
npm run new-brand -- --name "Acme"
```

Then review the generated files under `brands/acme/`.

Run a selected brand:

```bash
BRAND=acme npm run dev
```

In PowerShell:

```powershell
$env:BRAND="acme"; npm run dev
```

## Phase Status

- Phase 1: config, theming, shell, assets, scripts
- Phase 2: public pages
- Phase 3: auth
- Phase 4: dashboard
- Phase 5: admin
- Phase 6: seed, tests, docs, crawl
