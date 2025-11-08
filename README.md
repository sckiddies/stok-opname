# stok-opname

Minimal inventory app (Node.js + Express + Prisma) for stok opname.
This package is configured for quick deploy to Railway (Docker).

## Quick start (local / Railway)

1. Install dependencies:
   ```
   npm install
   ```

2. Generate Prisma client & migrate (after DATABASE_URL is set):
   ```
   npx prisma generate
   npx prisma migrate deploy
   node prisma/seed.js
   ```

3. Run:
   ```
   node src/index.js
   ```

## Endpoints
- GET / -> health
- GET /api/locations
- GET /api/products
- GET /api/stock
- POST /api/transfers
- POST /api/transfers/:id/ship
- POST /api/transfers/:id/receive

## Deploy to Railway
- Push repo to GitHub
- Use Railway one-click template with PostgreSQL plugin or create new project and connect repo.
- Railway will provide DATABASE_URL; run migrations & seed in Railway Shell as described above.
