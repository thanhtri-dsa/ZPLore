# Database setup (Prisma) — data-first (DB-first) workflow

This project uses **Prisma + PostgreSQL**.

## 1) Configure environment

Set at least:

- `DATABASE_URL`
- `DIRECT_URL` (optional but recommended for Prisma)

Example:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/eco_tour?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/eco_tour?schema=public"
```

## 2) Reset database (new DB)

If you want a clean new database:

```bash
npx prisma migrate reset
```

This will drop data, run migrations, and (if configured) run seed.

## 3) Run migrations

After schema changes:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 4) Seed sample data (optional)

Seed is configured in `package.json` → `prisma.seed`:

```bash
npx prisma db seed
```

## Notes

- Community features require DB tables: `CommunityPost`, `CommunityComment`.
- v2 schema adds stronger typing (enums) and per-user interactions:
  - `BookingStatus`, `TourType`, `TransportMode`
  - `CommunityPostLike`, `CommunityPostSave` (unique per user)
- Some API routes require Clerk in production (when keys are present).

## Data-first workflow (recommended if DB is the source of truth)

### Pull schema from database

```bash
npm run db:pull
npm run db:generate
```

This will introspect the current database and update `prisma/schema.prisma` to match.

### When you change the database outside Prisma

- Make your DB change (SQL / Supabase UI / etc.)
- Then run:

```bash
npm run db:pull
npm run db:generate
```

### When you want Prisma to apply schema changes to DB (schema-first)

If you still want Prisma migrations sometimes:

```bash
npm run db:migrate -- --name your_change
```

Or for quick prototyping without migrations:

```bash
npm run db:push
```
