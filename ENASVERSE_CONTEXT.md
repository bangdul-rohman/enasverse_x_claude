# ENASVERSE_CONTEXT.md
> Dokumen ini adalah "otak" project Enasverse.
> Selalu upload file ini di awal setiap sesi baru bersama Claude.
> Claude akan update file ini langsung di Codespaces setiap akhir sesi.
> Keyword sesi baru: "enasverse load context: https://raw.githubusercontent.com/bangdul-rohman/enasverse_x_claude/main/ENASVERSE_CONTEXT.md"

---

## 1. Identitas Project

| Key | Value |
|-----|-------|
| Nama project | Enasverse |
| Tipe | Produk SaaS — multi-tenant |
| Tujuan utama | Sistem memori persisten + agentic AI berbasis Claude |
| Status | ✅ SEMUA 10 PHASE SELESAI — Phase 1,2,3,4,5,6,7,8,9,10 DONE |
| Dibuat | 2026-05-14 |
| Terakhir diupdate | 2026-05-18 |

---

## 2. URLs Production

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://enasverse-x-claude.vercel.app |
| Backend (Railway) | https://enasversexclaude-production.up.railway.app |
| API Docs | https://enasversexclaude-production.up.railway.app/docs |
| GitHub | https://github.com/bangdul-rohman/enasverse_x_claude |

---

## 3. Stack Technology

| Komponen | Pilihan |
|----------|---------|
| Backend | Python + FastAPI |
| Frontend | Next.js + Tailwind CSS |
| Database | PostgreSQL (Railway) |
| Vector DB | Qdrant Cloud (Free tier) |
| Embedding | sentence-transformers all-MiniLM-L6-v2 (dim=384) |
| Auth | JWT + bcrypt==4.0.1 |
| State mgmt | Zustand |
| HTTP client | Axios |
| Hosting backend | Railway (Dockerfile) |
| Hosting frontend | Vercel |
| Monitoring | Betterstack Telemetry |
| Rate limiting | slowapi==0.1.9 |
| Agent model | claude-sonnet-4-20250514 |

---

## 4. Roadmap Phase

| Phase | Nama | Status |
|-------|------|--------|
| 1 | Fondasi backend | DONE |
| 2 | Vector DB & embedding | DONE |
| 3 | RAG API & Claude integration | DONE |
| 4 | Auth & multi-user | DONE |
| 5 | Agentic layer | DONE |
| 6 | GitHub auto-indexer | DONE |
| 7 | Deploy ke Railway | DONE |
| 8 | Monitoring Betterstack | DONE |
| 9 | Rate limiting & security | DONE |
| 10 | Frontend Next.js + Vercel | DONE |

---

## 5. Struktur Folder
---

## 6. API Endpoints
---

## 7. Security & Rate Limiting

| Endpoint | Limit |
|----------|-------|
| login + register | 5/minute |
| query | 20/minute |
| agent/run | 10/minute |
| global | 200/minute |

Security headers aktif: X-Frame-Options, X-Content-Type-Options, HSTS, XSS-Protection, Referrer-Policy.
IP detection via x-forwarded-for (Railway proxy aware).

---

## 8. Infrastructure

### Railway
- URL: https://enasversexclaude-production.up.railway.app
- Deploy: Dockerfile, auto-deploy on push

### Vercel
- Root directory: `frontend`
- Env: NEXT_PUBLIC_API_URL=https://enasversexclaude-production.up.railway.app
- Auto-deploy on push ke main

### Qdrant Cloud
- Collection: enasverse_docs (dim=384)
- Free tier, AWS Ohio

### Betterstack
- Source: Enasverse (Python)
- Ingesting host: s2444508.eu-fsn-3.betterstackdata.com
- Token: 53JpK51wXd2N8DpDibL3x3qT

### GitHub Webhook
- URL: https://enasversexclaude-production.up.railway.app/indexer/github/webhook

---

## 9. Railway Environment Variables

ANTHROPIC_API_KEY, APP_ENV=production, APP_NAME=enasverse,
BETTERSTACK_TOKEN=53JpK51wXd2N8DpDibL3x3qT, DATABASE_URL,
GITHUB_TOKEN, QDRANT_API_KEY, QDRANT_COLLECTION=enasverse_docs,
QDRANT_URL, SECRET_KEY

---

## 10. Hal JANGAN Diulang

- bcrypt harus versi 4.0.1
- anthropic SDK harus versi terbaru
- Railway deploy pakai Dockerfile (bukan nixpacks)
- DATABASE_URL pakai public URL Railway (bukan .railway.internal)
- Vector dim = 384 (MiniLM, bukan 1536)
- Betterstack: custom HTTP handler, token DibL bukan DlbL
- Rate limiting: x-forwarded-for (bukan get_remote_address)
- Saat tambah rate limit ke router: jangan hapus Depends dan HTTPException
- Vercel root directory: frontend (bukan ./)
- .env dan .env.local TIDAK di-commit

---

## 11. Cara Dev Lokal

```bash
# Backend
cd /workspaces/enasverse_x_claude/backend
docker compose up -d
uvicorn app.main:app --reload --host 0.0.0.0 --port 8002

# Frontend
cd /workspaces/enasverse_x_claude/frontend
npm run dev -- --port 3000
```

---

## 12. Progress Sesi

- Sesi 1-2 (2026-05-14): Phase 1-6 selesai
- Sesi 3-4 (2026-05-16): Deploy Railway, production live
- Sesi 5 (2026-05-17): Betterstack monitoring
- Sesi 6 (2026-05-17): Rate limiting + security headers
- Sesi 7 (2026-05-18): Frontend Next.js + deploy Vercel — SEMUA PHASE SELESAI

---

*Diupdate otomatis oleh Claude di akhir setiap sesi.*

