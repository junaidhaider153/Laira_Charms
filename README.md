# Laira Charms • Production Commerce & Operations Platform

> Direct-to-consumer e-commerce and business operations platform for handcrafted keepsakes and clay keychains in Pakistan.

## Architecture Baseline

- **Framework**: Next.js App Router (Turbopack, TypeScript strict mode)
- **Styling**: Tailwind CSS configured with bespoke artisanal tokens (`canvas-butter`, `strawberry-blush`, `surface-custard`, `espresso-deep`, `matcha-soft`)
- **Backend / DB**: Supabase PostgreSQL with strict Row Level Security (RLS)
- **Validation**: Zod runtime schema validation
- **Testing**: Vitest + React Testing Library (unit/component), Playwright (multi-browser and mobile emulation E2E)
- **CI/CD**: GitHub Actions automated pipeline enforcing lint, strict typechecks, unit suites and production build gates

## Getting Started

### Prerequisites

- Node.js >= 20 LTS (Node 24 LTS verified)
- npm >= 10

### Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your local Supabase keys and transactional email keys. Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to browser bundles.

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Start local development server with Turbopack |
| `npm run build` | Compile optimized production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint static analysis |
| `npm run typecheck` | Strict TypeScript compiler check (`tsc --noEmit`) |
| `npm run test` | Run Vitest unit & component test suite |
| `npm run test:e2e` | Run Playwright multi-project E2E suite |

## Project Development Sequence

1. **Unit 0**: Repository Foundation, CI Guardrails, Environment & Design Tokens (Completed)
2. **Unit 1**: Database Schemas, Supabase Auth & RLS Matrix
3. **Unit 2**: Artisanal Design System & Storefront Shell
4. **Unit 3**: Catalog, Search & Categories
5. **Unit 4**: Product Detail & Responsive Media Gallery
6. **Unit 5**: Fixed-Price Customization Engine
7. **Unit 6**: Bespoke Requests & Quotation Lifecycle
8. **Unit 7**: Cart & Idempotent Checkout
9. **Unit 8**: Manual Payment Verification & Audit Review
10. **Unit 9**: Order Management & Admin Operations
11. **Unit 10**: Website Realtime Messaging & Thread Isolation
12. **Unit 11**: Customer Accounts & Admin Experience Polish
13. **Unit 12**: Security Hardening, Accessibility Audit & Release Runbooks
