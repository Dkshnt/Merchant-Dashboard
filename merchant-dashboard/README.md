# Merchant dashboard

Next.js dashboard over a merchant order database, with a "Ask your orders" box that turns questions into read-only SQL (via Claude) and explains the result.

## Run
```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run seed                 # sample SQLite data (skip if using your own DB)
npm run dev
```

## Use your own database
Set `DB_PATH` to your SQLite file and update `SCHEMA` in `lib/db.ts` (and the queries in `app/page.tsx`) to match your tables. For Postgres/MySQL, swap `lib/db.ts` for a client using a **read-only database user**.

## Safety
The AI only gets the schema, never rows, when writing SQL. Queries run on a read-only connection, must be a single SELECT, and return at most 200 rows.
