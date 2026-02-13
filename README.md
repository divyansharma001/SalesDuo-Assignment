# Amazon Product Listing Optimizer

A full-stack web application that uses Google Gemini AI to optimize Amazon product listings for better search visibility and conversions.

Enter an ASIN, and the app fetches the product details from Amazon, generates AI-optimized content (title, bullet points, description, keywords), and displays the original vs optimized versions side-by-side. All optimizations are stored in MySQL for history tracking.

---

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | React 19, Vite, Tailwind CSS 4     |
| Backend    | Node.js, Express 5, TypeScript     |
| Database   | MySQL with Drizzle ORM             |
| AI         | Google Gemini 2.0 Flash            |
| Scraping   | axios + cheerio                    |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────────────────────────┐     ┌─────────┐
│   React Client  │────>│  Express API Server                 │────>│  MySQL  │
│   (Vite)        │     │  Routes > Controllers > Services    │     │         │
│                 │<────│  > Models                           │<────│         │
└─────────────────┘     └──────────┬──────────────┬───────────┘     └─────────┘
                                   │              │
                            ┌──────┴──────┐ ┌─────┴──────┐
                            │   Amazon    │ │  Gemini AI │
                            │  (Scraper)  │ │    API     │
                            └─────────────┘ └────────────┘
```

**Backend follows a strict layered architecture:**
- **Routes** — Define HTTP endpoints with rate limiting and validation
- **Controllers** — Handle request/response (HTTP concerns only)
- **Services** — Business logic and orchestration
- **Models** — Database access via Drizzle ORM

---

## Prerequisites

- **Node.js** >= 18
- **MySQL** >= 8.0
- **Google Gemini API Key** — Get one free at https://aistudio.google.com/apikey

---

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd amazon-optimizer

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your values:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=amazon_optimizer

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
```

### 3. Create the Database

```sql
CREATE DATABASE amazon_optimizer;
```

### 4. Push Schema to Database

```bash
cd server
npm run db:push
```

This uses Drizzle Kit to create the `products` and `optimizations` tables directly from the schema definition in `src/database/schema.ts`.

### 5. Start the Application

```bash
# Terminal 1 — Backend (port 3000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

| Method | Endpoint                           | Description                                |
| ------ | ---------------------------------- | ------------------------------------------ |
| POST   | `/api/products/optimize`           | Scrape + AI optimize + persist             |
| GET    | `/api/optimizations/history/:asin` | List all optimizations for an ASIN         |
| GET    | `/api/optimizations/:id`           | Single optimization with original data     |
| GET    | `/api/health`                      | Health check                               |

### Example Request

```bash
curl -X POST http://localhost:3000/api/products/optimize \
  -H "Content-Type: application/json" \
  -d '{"asin": "B08N5WRWNW"}'
```

---

## AI Prompt Strategy

The Gemini prompt is designed with these principles:

1. **Role Assignment** — The AI is positioned as an "expert Amazon listing optimization specialist" with knowledge of Amazon's A9/A10 search algorithm and consumer psychology.

2. **Specific Constraints** — Rather than open-ended instructions, the prompt specifies exact limits:
   - Title: Under 200 characters, front-loaded primary keyword
   - Bullets: Exactly 5, each starting with a CAPITALIZED benefit phrase, 100-200 chars each
   - Description: 800-1500 characters, benefit-driven, with a call to action
   - Keywords: Exactly 5 phrases NOT already in the title/bullets (to avoid redundancy)

3. **Structured Output Mode** — Uses Gemini's `responseMimeType: 'application/json'` with a `responseSchema` to guarantee valid JSON output. No regex parsing or markdown extraction needed.

4. **SEO Knowledge Injection** — The prompt includes specific Amazon SEO patterns: front-loading keywords, benefit-then-feature bullet structure, `[Brand] [Feature] [Type]` title format.

---

## Database Design

**`products`** — Raw Amazon data (one row per scrape)

| Column        | Type         | Notes                      |
| ------------- | ------------ | -------------------------- |
| id            | INT PK       | Auto-increment             |
| asin          | VARCHAR(10)  | Indexed                    |
| title         | TEXT         |                            |
| bullet_points | JSON         | Array of strings           |
| description   | TEXT         |                            |
| price         | VARCHAR(50)  | Nullable                   |
| image_url     | VARCHAR(2048)| Nullable                   |
| fetched_at    | TIMESTAMP    |                            |

**`optimizations`** — AI-generated results (many per ASIN for history)

| Column               | Type         | Notes                    |
| -------------------- | ------------ | ------------------------ |
| id                   | INT PK       | Auto-increment           |
| product_id           | INT FK       | References products.id   |
| asin                 | VARCHAR(10)  | Denormalized, indexed    |
| optimized_title      | TEXT         |                          |
| optimized_bullets    | JSON         | Array of strings         |
| optimized_description| TEXT         |                          |
| keywords             | JSON         | Array of 3-5 strings     |
| model_used           | VARCHAR(50)  |                          |
| created_at           | TIMESTAMP    |                          |

**Key design decisions:**
- `asin` is denormalized onto `optimizations` to avoid JOINs on history queries
- Products are not unique on ASIN — each scrape creates a new row, preserving the exact input for each optimization
- JSON columns for bullets/keywords since they're always read/written as a unit
- Schema is defined as code in `src/database/schema.ts` (Drizzle's schema-as-code approach) — single source of truth for types + database structure

---

## Project Structure

```
amazon-optimizer/
├── server/
│   ├── src/
│   │   ├── config/          # Environment config
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── database/        # Drizzle schema + DB client
│   │   ├── middleware/       # Error handler, validation
│   │   ├── models/          # Database queries (Drizzle)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic
│   │   │   ├── amazonScraper.service.ts
│   │   │   ├── gemini.service.ts
│   │   │   └── product.service.ts
│   │   ├── utils/           # Logger, ApiError, constants
│   │   ├── validators/      # Joi schemas
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Entry point
│   └── drizzle.config.ts    # Drizzle Kit config
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Header, Footer, Layout
│   │   │   ├── product/     # AsinSearchForm, ComparisonView, etc.
│   │   │   ├── history/     # HistoryTable
│   │   │   └── ui/          # LoadingSpinner, ErrorAlert, Badge
│   │   ├── hooks/           # useOptimize, useHistory
│   │   ├── pages/           # HomePage, HistoryPage, NotFoundPage
│   │   ├── services/        # Axios API client
│   │   └── utils/           # ASIN validation, date formatting
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Scraping Approach

Uses **axios + cheerio** (not Puppeteer) because Amazon product pages render critical content (title, bullets, description) in the initial HTML response. This is ~100x lighter and faster than a headless browser.

- Multiple fallback CSS selectors per field to handle Amazon layout variations
- CAPTCHA detection with graceful error messages
- Cache TTL (24h) to avoid re-scraping the same product repeatedly
- Realistic browser headers (User-Agent, Accept-Language)

---

## Key Design Decisions

| Decision         | Choice             | Rationale                                                    |
| ---------------- | ------------------ | ------------------------------------------------------------ |
| Scraping         | axios + cheerio    | Product data in initial HTML; 100x lighter than Puppeteer    |
| AI output        | Structured JSON    | Guarantees valid JSON, no fragile parsing                    |
| ORM              | Drizzle ORM        | Type-safe, schema-as-code, zero overhead, great DX           |
| Frontend state   | React hooks        | 2 pages with isolated state — Redux unnecessary              |
| CSS              | Tailwind CSS 4     | Fast development, minimal bundle                             |
| Validation       | Joi                | Battle-tested, clean middleware pattern                      |
| Backend language | TypeScript         | Type safety across DB schema, models, and services           |
