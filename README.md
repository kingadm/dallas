# Cardápio + Admin secreto (Next.js + NestJS + Postgres + Prisma + Cloudinary)

## Stack
- Monorepo com NPM Workspaces
- Web: Next.js (App Router) + TypeScript
- API: NestJS + TypeScript
- DB: Postgres + Prisma
- Upload: Cloudinary (não salva em disco)
- Auth: JWT (Bearer)
- Validação: class-validator
- Node 20+

## Rotas
- Público: `/`
- Admin (secreto): `/a9d3x-admin` (não existe link público)
- Login Admin: `/a9d3x-admin/login`

## Desenvolvimento local (resumo)
1) Subir Postgres (opcional via Docker):
   `docker compose up -d`

2) Configurar envs:
- `apps/api/.env` (copie de `.env.example`)
- `apps/web/.env.local` (copie de `.env.example`)

3) Prisma:
- `npm run prisma:migrate`
- `npm run prisma:seed`

4) Rodar:
- `npm run dev`

Web: http://localhost:3000  
API: http://localhost:3001

## Deploy
- Web: Vercel
- API: Render/Railway
- DB: Neon/Supabase (Postgres)
- Ajuste CORS na API com `CORS_ORIGINS`.