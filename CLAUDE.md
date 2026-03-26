# D&Ddle — D&D Daily Guessing Game

## Commands

```bash
npm run dev              # Start dev server (Vite, port 5173)
npm run build            # TypeScript check + production build
npm run test             # Run Vitest tests
npm run fetch-data       # Download monster data from 5etools GitHub
npm run process-data     # Normalize raw monsters → public/data/monsters.json
npm run fetch-spells     # Download spell data from 5etools GitHub
npm run process-spells   # Normalize raw spells → public/data/spells.json
```

## Data Pipeline

Monster/spell data comes from `5etools-mirror-3/5etools-src` (GitHub raw).
Images from `5etools-mirror-3/5etools-img`. Sounds from `5e.tools/audio/`.

Pipeline: `fetch-*` → `scripts/raw/*.json` → `process-*` → `public/data/*.json`

Raw data is gitignored. Processed JSON is committed. Re-run pipeline to update.

## Architecture

- **4 game modes**: Classic (7-column), Artwork (blur reveal), Spell'dle (spell columns), Emoji (decode clues)
- Each mode has its own daily seed in `src/lib/daily.ts`
- Classic uses `useGame` hook; other monster modes use `useNameGuess`; Spell'dle manages its own state
- Two-column layout on desktop (hints left, grid right); card layout on mobile (<600px)

## Key Files

- `src/App.tsx` — Mode routing, game state orchestration
- `src/lib/daily.ts` — Deterministic daily monster/spell selection (UTC midnight reset)
- `src/lib/compare.ts` — 7-column monster attribute comparison logic
- `src/lib/spell-compare.ts` — 7-column spell comparison logic
- `src/types/index.ts` — Monster, GameMode, feedback types
- `src/types/spell.ts` — Spell types
- `scripts/process-data.ts` — Monster normalization (CR fractions, alignment parsing, image URLs, sound clips)

## Deployment

Netlify at `dnddle.netlify.app`. Deploy: `npm run build && npx netlify-cli deploy --prod --dir=dist`

Git: `main` = production, `dev` = development. Merge dev → main before deploying.

## Gotchas

- **CR fractions**: 1/8=0.125, 1/4=0.25, 1/2=0.5 — never round these
- **Lore redaction**: Monster name must be redacted from lore text (case-insensitive regex)
- **Daily vs Random**: Daily mode uses full monster pool; Random mode respects difficulty filter
- **Artwork/Emoji daily picks** filter to monsters WITH lore (so lore hint always works)
- **`_copy` monsters**: Raw 5etools data has monster entries that reference other monsters — skip these in processing
- **Sound clips**: Only 732/2571 monsters have sounds; gracefully handle missing audio
- **Mobile grid**: Classic mode switches from 8-column grid to vertical cards at 600px breakpoint

## Code Style

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Component CSS: BEM-style with component-name prefix (e.g., `.hint-panel__name`)
- CSS variables defined in `src/styles/theme.css` (gold/dark palette)
- Fonts: Cinzel (headings), Crimson Text (body)
