# ListingAI — Amazon Product Listing Optimizer

A full-stack web application that uses **Google Gemini AI** to optimize Amazon product listings for better search visibility, click-through rate, and conversions.

Enter an ASIN, pick a marketplace (amazon.in, amazon.com, amazon.co.uk, etc.), and the app scrapes the live product page, generates AI-optimized content — an improved title, rewritten bullet points, an enhanced description, and 3–5 new keyword suggestions — then displays the original vs. optimized versions side-by-side. Every optimization is persisted in MySQL for full history tracking.

---

## Tech Stack

| Layer        | Technology                                   |
| ------------ | -------------------------------------------- |
| Frontend     | React 19, Vite 6, Tailwind CSS 4, TypeScript |
| Backend      | Node.js, Express 5, TypeScript               |
| Database     | MySQL 8 with Drizzle ORM                     |
| AI Model     | Google Gemini 3 Flash Preview                |
| Scraping     | axios + cheerio                              |
| Rate Limiter | [Limitra](https://www.npmjs.com/package/limitra) (my own package) |
| Icons        | Lucide React                                 |

---

## Architecture & Request Flow

```
┌─────────────────┐     ┌─────────────────────────────────────┐     ┌─────────┐
│   React Client  │────>│  Express API Server                 │────>│  MySQL  │
│   (Vite + TS)   │     │  Routes > Controllers > Services    │     │         │
│                 │<────│  > Models (Drizzle ORM)             │<────│         │
└─────────────────┘     └──────────┬──────────────┬───────────┘     └─────────┘
                                   │              │
                            ┌──────┴──────┐ ┌─────┴──────┐
                            │   Amazon    │ │  Gemini 3  │
                            │  (Scraper)  │ │  Flash API │
                            └─────────────┘ └────────────┘
```

### Optimization Flow (What happens when you click "Optimize")

1. **Frontend** sends `POST /api/products/optimize` with `{ asin, marketplace }`
2. **Rate limiter** (Limitra — sliding window) checks the request against per-IP limits
3. **Validator** (Joi) validates the ASIN format and marketplace value
4. **Product Service** checks MySQL for a recently scraped copy (24h cache TTL)
   - **Cache hit** → skip scraping, reuse stored product data
   - **Cache miss** → scrape the live Amazon product page using axios + cheerio
5. Scraped data (title, bullets, description, price, image) is **persisted to MySQL**
6. Product data is sent to the **Gemini 3 Flash Preview** model with a detailed optimization prompt
7. Gemini returns **structured JSON** (enforced via `responseMimeType + responseSchema`) — no regex parsing needed
8. The AI optimization result is **persisted to MySQL** (linked to the product row)
9. **Response** returns both original and optimized listings for side-by-side comparison

---

## Rate Limiting — Limitra

This project uses **[Limitra](https://www.npmjs.com/package/limitra)**, a production-grade rate limiter I built.

Unlike `express-rate-limit`, Limitra uses a **Sliding Window algorithm** (not fixed windows), which prevents burst spikes at window boundaries and provides smoother, fairer rate limiting.

**Two layers of protection:**

| Layer              | Limit              | Scope              | Why                                                       |
| ------------------ | ------------------ | ------------------ | --------------------------------------------------------- |
| Global API         | 60 req/min per IP  | All `/api` routes  | General abuse prevention                                  |
| Optimize Endpoint  | 10 req/min per IP  | `POST /optimize`   | Each call hits Amazon + Gemini — expensive external I/O   |

```typescript
// server/src/middleware/rateLimiter.ts
const store = createMemoryStore();

export const apiLimiter = limitra({
  limiter: createSlidingWindow(store, { points: 60, duration: 60 }),
});

export const optimizeLimiter = limitra({
  limiter: createSlidingWindow(store, { points: 10, duration: 60 }),
});
```

Limitra also supports Redis stores and an **adaptive mode** that hot-swaps strategies under load (e.g., switch from Redis to in-memory when event loop lag is high). For this project, the memory store is sufficient.

---

## AI Prompt Strategy

The Gemini prompt (`server/src/services/gemini.service.ts`) is engineered for high-quality, compliant Amazon listing copy.

### What the AI generates:
1. **Improved Title** — keyword-rich, readable, front-loads the primary keyword within the first 80 characters (mobile-visible portion)
2. **Rewritten Bullet Points** — exactly 5, each structured as `CAPITALIZED BENEFIT: supporting detail`, ordered by: USP → differentiator → quality → use case → trust signal
3. **Enhanced Description** — 800–1500 characters of persuasive, benefit-forward copy with a hook, specific details, and a call to action
4. **Keyword Suggestions** — exactly 5 high-value backend search terms not already present in the optimized content (synonyms, long-tail phrases, misspellings, bilingual terms)

### Prompt design principles:

| Principle                | Implementation                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| **Expert role framing**  | Positioned as a senior Amazon strategist with 10,000+ ASIN experience                          |
| **Compliance guardrails**| Explicit rules: no superlatives, no health claims, no competitor mentions, no time-limited language |
| **Mobile-first SEO**     | Primary keyword within first 80 chars (mobile search truncation point)                          |
| **Structured output**    | Gemini's `responseMimeType: 'application/json'` + `responseSchema` guarantees valid JSON        |
| **Anti-keyword-stuffing**| Keywords must read as fluent English; backend terms must NOT duplicate title/bullet content      |
| **Specificity over filler** | Prompt explicitly bans vague phrases ("high quality", "great product") — demands numbers, materials, dimensions |

### Why Gemini 3 Flash Preview?

- **Speed**: Flash models are optimized for low-latency — critical for a real-time optimization tool
- **Structured output**: Native JSON mode with schema enforcement — no fragile regex/markdown parsing
- **Cost**: Significantly cheaper than Pro models while delivering excellent copywriting quality
- **Context window**: Large enough to handle full product listings + detailed system prompt

---

## Multi-Marketplace Support

The app supports scraping from multiple Amazon domains:

| Marketplace    | Domain              |
| -------------- | ------------------- |
| India          | amazon.in (default) |
| United States  | amazon.com          |
| United Kingdom | amazon.co.uk        |
| Germany        | amazon.de           |
| Canada         | amazon.ca           |

The user selects a marketplace from a dropdown in the UI. The selected domain is passed through the full stack: `frontend → API → scraper`, so the correct regional product page is fetched.

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
GEMINI_MODEL=gemini-3-flash-preview
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

| Method | Endpoint                           | Description                                | Rate Limit     |
| ------ | ---------------------------------- | ------------------------------------------ | -------------- |
| POST   | `/api/products/optimize`           | Scrape + AI optimize + persist             | 10 req/min/IP  |
| GET    | `/api/optimizations/history/:asin` | List all optimizations for an ASIN         | 60 req/min/IP  |
| GET    | `/api/optimizations/recent`        | Last 10 optimizations across all ASINs     | 60 req/min/IP  |
| GET    | `/api/optimizations/:id`           | Single optimization with original data     | 60 req/min/IP  |
| GET    | `/api/health`                      | Health check                               | 60 req/min/IP  |

### Example Request

```bash
curl -X POST http://localhost:3000/api/products/optimize \
  -H "Content-Type: application/json" \
  -d '{"asin": "B08N5WRWNW", "marketplace": "amazon.in"}'
```

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
│   │   ├── database/        # Drizzle schema + DB connection
│   │   ├── middleware/       # Error handler, validation, rate limiter (Limitra)
│   │   ├── models/          # Database queries (Drizzle ORM)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/
│   │   │   ├── amazonScraper.service.ts  # Multi-marketplace scraping
│   │   │   ├── gemini.service.ts         # AI prompt + Gemini API
│   │   │   └── product.service.ts        # Orchestration layer
│   │   ├── utils/           # Logger, ApiError, constants
│   │   ├── validators/      # Joi schemas (ASIN + marketplace)
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Entry point
│   └── drizzle.config.ts
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Header, Footer, Layout
│   │   │   ├── product/     # AsinSearchForm (with marketplace selector),
│   │   │   │                # ComparisonView, ProductDetails, etc.
│   │   │   ├── history/     # HistoryTable, RecentOptimizations
│   │   │   └── ui/          # LoadingSpinner, ErrorAlert, Badge
│   │   ├── hooks/           # useOptimize, useHistory, useRecent
│   │   ├── pages/           # HomePage, HistoryPage, NotFoundPage
│   │   ├── services/        # Axios API client
│   │   ├── types/           # TypeScript interfaces
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
- Smart cache (24h TTL) — avoids re-scraping the same product repeatedly
- Realistic browser headers (User-Agent, Accept-Language)
- Multi-marketplace: scrapes from the correct regional Amazon domain based on user selection

---

## Key Design Decisions

| Decision         | Choice             | Rationale                                                    |
| ---------------- | ------------------ | ------------------------------------------------------------ |
| AI Model         | Gemini 3 Flash     | Fast, cheap, excellent JSON mode — ideal for real-time tool  |
| Scraping         | axios + cheerio    | Product data in initial HTML; 100x lighter than Puppeteer    |
| AI output        | Structured JSON    | Guarantees valid JSON via schema enforcement, no parsing     |
| Rate Limiter     | Limitra            | Sliding window algorithm — fairer than fixed-window limiters |
| ORM              | Drizzle ORM        | Type-safe, schema-as-code, zero overhead, great DX           |
| Frontend state   | React hooks        | Simple app with 2 pages — Redux would be overkill            |
| CSS              | Tailwind CSS 4     | Rapid development, tiny bundle, utility-first                |
| Validation       | Joi                | Battle-tested, clean middleware pattern                      |
| Language         | TypeScript (full)  | End-to-end type safety across DB schema, API, and UI         |
