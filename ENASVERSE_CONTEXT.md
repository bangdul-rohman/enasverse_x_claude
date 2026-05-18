# ENASVERSE_CONTEXT.md
> Keyword sesi baru: "enasverse load context: https://raw.githubusercontent.com/bangdul-rohman/enasverse_x_claude/main/ENASVERSE_CONTEXT.md?v=11"

---

## 1. Identitas Project

| Key | Value |
|-----|-------|
| Nama project | Enasverse |
| Tipe | SaaS multi-tenant |
| Tujuan utama | Sistem memori persisten + agentic AI berbasis Claude |
| Status | Phase 1-12 DONE |
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
| 11 | Chat history persistence | DONE |
| 12 | Landing page + SEO | DONE |
| 13 | File Upload (PDF, DOCX, TXT) | TODO |
| 14 | API Key Management | TODO |
| 15 | Quota & Usage Tracking | TODO |
| 16 | Billing & Subscription | TODO |
| 17 | Admin Panel | TODO |
| 18 | Team & Kolaborasi | TODO |
| 19 | Reliability & Scale | TODO |
| 20 | Security & Compliance | TODO |

---

## 5. Phase 12 — Landing Page (DONE)

### Files dibuat/diupdate
- `frontend/app/page.tsx` — Landing page lengkap (hero, fitur, how it works, pricing, FAQ, CTA, footer)
- `frontend/app/layout.tsx` — SEO metadata (title, description, OG tags, Twitter card, robots)

### Sections Landing Page
- Navbar fixed dengan CTA
- Hero section dengan gradient glow
- Social proof stats (500+ users, 50K+ query, 99.9% uptime)
- 6 Feature cards
- How it works (3 langkah)
- Pricing (Free / Pro Rp99k / Enterprise)
- FAQ accordion (4 pertanyaan)
- CTA bottom section
- Footer dengan links

---

## 6. Phase 11 — Chat History (DONE)

### Backend
- ChatSession + ChatMessage models (PostgreSQL)
- Auto-save setiap query
- API: GET/DELETE sessions, export JSON

### Frontend
- ChatHistory.tsx — sidebar list sesi + bubble chat
- Tombol "Riwayat Chat" di navbar dashboard

---

## 7. Infrastructure

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

---

## 8. Hal JANGAN Diulang

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
- Tulis file TSX/Python besar via base64 + clipboard paste, JANGAN heredoc (unicode error emoji)

---

## 9. Dev Lokal (Codespaces)

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

## 10. Progress Sesi

- Sesi 1-2 (2026-05-14): Phase 1-6 selesai
- Sesi 3-4 (2026-05-16): Deploy Railway, production live
- Sesi 5 (2026-05-17): Betterstack monitoring
- Sesi 6 (2026-05-17): Rate limiting + security headers
- Sesi 7 (2026-05-18): Frontend Next.js + deploy Vercel
- Sesi 8 (2026-05-18): Phase 11 backend — chat history
- Sesi 9 (2026-05-18): Phase 11 frontend — ChatHistory.tsx
- Sesi 10 (2026-05-18): Phase 12 — Landing page + SEO
- **Next:** Phase 13 — File Upload (PDF, DOCX, TXT)

---

*Diupdate otomatis oleh Claude di akhir setiap sesi.*
