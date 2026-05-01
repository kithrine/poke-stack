# PokéResume Workspace

## Overview

PokéResume is a web app that transforms a user's resume (PDF or Word doc) into a personalized holographic Pokémon-style trainer card, including an AI-generated creature illustration.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Architecture

### Artifacts
- `artifacts/resume-pokemon` — React + Vite frontend at `/`
- `artifacts/api-server` — Express 5 API at `/api`

### Key Libraries
- `lib/api-spec` — OpenAPI spec (`openapi.yaml`) + Orval codegen config
- `lib/api-client-react` — Generated React Query hooks and Zod schemas
- `lib/integrations-openai-ai-server` — OpenAI integration (chat + image generation)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Build**: esbuild (ESM bundle)
- **AI**: OpenAI via Replit AI Integrations (`AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`)
- **Text extraction**: pdf-parse v1 (internal path import to avoid test file), mammoth (Word docs)
- **Card download**: html2canvas (frontend)
- **API codegen**: Orval (from OpenAPI spec)

## API Endpoints

- `GET /api/healthz` — health check
- `POST /api/resume/upload` — upload PDF or .docx (multer, saved to `./uploads/`)
- `POST /api/resume/analyze/:filename` — extract text + GPT analysis → returns PokemonCardData JSON
- `POST /api/resume/card-image` — generate a Pokémon-style creature illustration via gpt-image-1

## User Flow

1. User drops a PDF/Word resume on the upload area
2. File is uploaded and text extracted
3. AI analysis returns: name, pokemonType, HP, attacks (with descriptions), pokedexEntry, yearsOfExperience
4. A Pokéball opening animation plays as transition
5. The holographic card appears full-screen with:
   - AI-generated Pokémon artwork loading in the background
   - Rainbow conic gradient holographic shimmer (CSS color-dodge)
   - Mouse-tracking 3D tilt effect (perspective + rotateX/Y)
   - Type-colored card frame, attacks, Pokédex entry
6. Buttons: "Download Card" (html2canvas PNG export) + "New Card" (reset)

## Pokémon Type Mapping

18 types mapped from job roles: Fire=fullstack, Electric=frontend, Water=backend, Psychic=analyst/ML, Dragon=senior/architect, Steel=security, Ground=DevOps, Flying=cloud, Ice=QA, Dark=blockchain, Ghost=ML engineer, Grass=data engineer, Rock=DBA, Fighting=PM/agile, Bug=junior, Fairy=UX engineer, Poison=legacy, Normal=general

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — typecheck composite libs only
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/api-server run build` — build API server

## Important Notes

- pdf-parse must be imported from `pdf-parse/lib/pdf-parse.js` (not the root) to avoid test file loading at startup
- API server uses ESM output (`dist/index.mjs`) with a globalThis.require shim for CJS compat
- Uploads directory is `path.resolve(process.cwd(), "uploads")` relative to api-server
- The `--holo-angle` CSS variable on the card updates via inline style on mousemove for the shimmer effect
- Image generation uses `gpt-image-1` model, returns base64 PNG, takes 10-30s
