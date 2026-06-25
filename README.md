# Invoice Parser

Upload a PDF invoice and get back structured invoice data. The API uses the
Anthropic API to extract invoice fields and the [Frankfurter API](https://frankfurter.dev)
for currency conversion. The frontend is a React + Vite single page app.

## Project structure

```
invoice-parser/
├── apps/
│   └── frontend/        # React + Vite + TypeScript UI
├── services/
│   └── api/             # Koa + TypeScript API
└── docker-compose.yml   # Runs the API in a container
```

## Prerequisites

- **Node.js** `24.x` (the API Docker image is built on `node:24.13`)
- **pnpm** `^11.9.0` — the repo pins pnpm via `devEngines`; if you have
  [corepack](https://nodejs.org/api/corepack.html) enabled, run `corepack enable`
  and the correct version will be used automatically.
- An **Anthropic API key** (`ANTHROPIC_API_KEY`)
- **Docker** (optional, only needed to run the API via `docker-compose`)

## 1. Configure environment variables

### API (`services/api`)

```bash
cp services/api/.env.example services/api/.env
```

Then edit `services/api/.env`:

| Variable              | Description                                  | Default                          |
| --------------------- | -------------------------------------------- | -------------------------------- |
| `FRANKFURTER_API_URL` | Base URL for the currency conversion API     | `https://api.frankfurter.dev/v2` |
| `PORT`                | Port the API listens on                      | `3000`                           |
| `ANTHROPIC_API_KEY`   | Your Anthropic API key (**required**)        | _(empty)_                        |

> The API will refuse to start if `FRANKFURTER_API_URL` or `ANTHROPIC_API_KEY`
> is missing.

### Frontend (`apps/frontend`)

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

| Variable            | Description                  | Default                 |
| ------------------- | ---------------------------- | ----------------------- |
| `VITE_API_BASE_URL` | Base URL of the API service  | `http://localhost:3000` |

## 2. Install dependencies

The two packages are independent (no workspace root), so install in each:

```bash
# API
cd services/api
pnpm install

# Frontend
cd apps/frontend
pnpm install
```

## 3. Run in development

Run each service in its own terminal.

### API

```bash
cd services/api
pnpm dev          # tsx watch src/app.ts → http://localhost:3000
```

### Frontend

```bash
cd apps/frontend
pnpm dev          # Vite dev server → http://localhost:5173
```

Open the frontend URL printed by Vite, upload a PDF invoice, and the parsed
result will be displayed.

## 4. Build for production

### API

```bash
cd services/api
pnpm build        # compiles TypeScript to dist/
pnpm start        # runs node dist/app.js
```

### Frontend

```bash
cd apps/frontend
pnpm build        # type-checks and builds to dist/
pnpm preview      # serves the production build locally
```

## Running the API with Docker

A `docker-compose.yml` is provided to run the API in a container. It reads
environment variables from `services/api/.env`, so make sure that file exists
first (see step 1).

```bash
docker compose up --build
```

The API will be available on `http://localhost:3000`.

## API

| Method | Endpoint         | Body                          | Description                                            |
| ------ | ---------------- | ----------------------------- | ------------------------------------------------------ |
| `POST` | `/invoice/parse` | `multipart/form-data` (`file`)| Parses an uploaded PDF invoice and returns structured data |

Example:

```bash
curl -X POST http://localhost:3000/invoice/parse \
  -F "file=@/path/to/invoice.pdf"
```

## Tech stack

- **API:** Koa 3, TypeScript, `@anthropic-ai/sdk`, Multer (file uploads)
- **Frontend:** React 19, Vite, TypeScript
