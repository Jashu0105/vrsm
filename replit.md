# Workspace

## Overview

Vehicle Rental Management System — a full-stack web application for managing a vehicle fleet, customers, and rental transactions.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/vehicle-rental)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **UI**: Tailwind CSS, Shadcn UI, Recharts, Framer Motion

## Features

- **Dashboard**: Fleet overview stats, revenue chart, and recent rentals
- **Fleet Management**: Add, edit, delete vehicles with status tracking (available/rented/maintenance)
- **Customer Management**: Customer CRUD with driver license details
- **Rental Management**: Create rentals, track status, return vehicles with cost calculation

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── vehicle-rental/     # React frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── schema/
│           ├── vehicles.ts
│           ├── customers.ts
│           └── rentals.ts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## API Endpoints

- `GET/POST /api/vehicles` — list and create vehicles
- `GET/PUT/DELETE /api/vehicles/:id` — vehicle CRUD
- `GET/POST /api/customers` — list and create customers
- `GET/PUT/DELETE /api/customers/:id` — customer CRUD
- `GET/POST /api/rentals` — list and create rentals
- `GET/PUT /api/rentals/:id` — rental detail and updates
- `GET /api/rentals/stats` — dashboard statistics (also via `/api/dashboard/stats`)

## Database Schema

- **vehicles**: Fleet vehicles with make, model, year, license plate, category, daily rate, status, specs
- **customers**: Customer info with driver license
- **rentals**: Links vehicles + customers with date range, rates, status

## Development

- `pnpm --filter @workspace/api-server run dev` — API server
- `pnpm --filter @workspace/vehicle-rental run dev` — Frontend
- `pnpm --filter @workspace/db run push` — Sync DB schema
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API client
