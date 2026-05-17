# ENASVERSE_CONTEXT.md
> Dokumen ini adalah "otak" project Enasverse.
> Selalu upload file ini di awal setiap sesi baru bersama Claude.
> Claude akan update file ini langsung di Codespaces setiap akhir sesi.
> Keyword sesi baru: "enasverse load context: https://raw.githubusercontent.com/bangdul-rohman/enasverse_x_claude/main/ENASVERSE_CONTEXT.md?v=9"

---

## 1. Identitas Project

| Key | Value |
|-----|-------|
| Nama project | Enasverse |
| Tipe | Produk SaaS — multi-tenant |
| Tujuan utama | Sistem memori persisten + agentic AI berbasis Claude |
| Status | Phase 1-10 DONE — Phase 11 backend selesai |
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
| 11 | Chat history persistence | Backend DONE — Frontend TODO |

---

## 5. Phase 11 — Chat History Persistence

### Backend (DONE)
- `app/models/chat.py` — ChatSession + ChatMessage (tanpa FK constraint)
- `app/schemas/chat.py` — Pydantic schemas
- `app/routers/history.py` — GET/DELETE sessions + export JSON
- `app/routers/query.py` — auto-save ke PostgreSQL + index ke Qdrant
- `app/limiter.py` — limiter dipindah dari main.py (fix circular import)

### Frontend (TODO — next session)
- Sidebar history (list sesi chat)
- Tampilan per sesi (bubble chat)
- Search history via Qdrant
- Export history (JSON)

### API Endpoints Baru
```
GET  /history/sessions          — list semua sesi user
GET  /history/sessions/{id}     — detail sesi + messages
DELETE /history/sessions/{id}   — hapus sesi
GET  /history/export/{id}       — export JSON
```

---

## 6. Infrastructure

### Railway
- URL: https://enasversexclaude-production.up.railway.app
- Deploy: Dockerfile, auto-deploy on push

### Vercel
- Root directory: `frontend`
- Env: NEXT_PUBLIC_API_URL=https://enasversexclaude-production.up.railway.app

### Qdrant Cloud
- Collection: enasverse_docs (dim=384)

### Betterstack
- Token: 53JpK51wXd2N8DpDibL3x3qT
- Host: s2444508.eu-fsn-3.betterstackdata.com

### GitHub Webhook
- URL: https://enasversexclaude-production.up.railway.app/indexer/github/webhook

---

## 7. Hal JANGAN Diulang

- bcrypt harus versi 4.0.1
- anthropic SDK harus versi terbaru
- Railway deploy pakai Dockerfile
- DATABASE_URL pakai public URL Railway
- Vector dim = 384 (MiniLM)
- Betterstack: custom HTTP handler, token DibL bukan DlbL
- Rate limiting: x-forwarded-for (Railway proxy)
- Jangan hapus Depends dan HTTPException saat tambah rate limit
- Vercel root directory: frontend
- .env dan .env.local TIDAK di-commit
- limiter ada di app/limiter.py (bukan app/main.py) — circular import!
- chat_sessions: user_id pakai String tanpa ForeignKey (UUID vs VARCHAR conflict)
- config.py default DATABASE_URL harus pakai credentials docker: enasverse:enasverse

---

## 8. Dev Lokal (Codespaces)

```bash
# Backend
cd /workspaces/enasverse_x_claude/backend
docker compose up -d
fuser -k 8002/tcp 2>/dev/null; uvicorn app.main:app --host 0.0.0.0 --port 8002

# Frontend
cd /workspaces/enasverse_x_claude/frontend
npm run dev -- --port 3000
```

---

## 9. Progress Sesi

- Sesi 1-2 (2026-05-14): Phase 1-6 selesai
- Sesi 3-4 (2026-05-16): Deploy Railway, production live
- Sesi 5 (2026-05-17): Betterstack monitoring
- Sesi 6 (2026-05-17): Rate limiting + security headers
- Sesi 7 (2026-05-18): Frontend Next.js + deploy Vercel
- Sesi 8 (2026-05-18): Phase 11 backend — chat history persistence
- **Next:** Phase 11 frontend — sidebar history + search + export

---

*Diupdate otomatis oleh Claude di akhir setiap sesi.*
