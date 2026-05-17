# ENASVERSE_CONTEXT.md
> Dokumen ini adalah "otak" project Enasverse.
> Selalu upload file ini di awal setiap sesi baru bersama Claude.
> Claude akan update bagian yang relevan di akhir setiap sesi.

---

## 1. Identitas Project

| Key | Value |
|-----|-------|
| Nama project | Enasverse |
| Tipe | Produk SaaS — dipakai banyak orang (multi-tenant) |
| Tujuan utama | Sistem memori persisten + agentic AI berbasis Claude |
| Status | Phase 1-9 selesai — Rate limiting & security aktif |
| Dibuat | 2026-05-14 |
| Terakhir diupdate | 2026-05-17 |

---

## 2. Visi Sistem

Enasverse adalah platform yang memungkinkan Claude untuk:
- **Mengingat** semua kode, dokumentasi API, dan percakapan lintas sesi
- **Membaca dan memahami** update terbaru dari codebase secara otomatis
- **Mengedit kode** dan melakukan **deploy otomatis** ketika ada bug atau update
- Digunakan oleh **banyak user** secara bersamaan dengan isolasi data per tim/project

---

## 3. Arsitektur yang Sudah Disepakati

### Stack Technology

| Komponen | Pilihan | Alasan |
|----------|---------|--------|
| Backend | Python + FastAPI | Sudah familiar, async support |
| Database relational | PostgreSQL (Railway) | Multi-tenant, managed |
| Vector DB | Qdrant Cloud (Free tier) | Cloud-hosted, no maintenance |
| Embedding model (dev) | sentence-transformers all-MiniLM-L6-v2 | Gratis, no API key |
| Embedding model (prod) | text-embedding-3-small (OpenAI) | Cost-efficient untuk skala besar |
| Auth | JWT (python-jose + passlib bcrypt==4.0.1) | Built-in, no external dependency |
| Hosting | Railway | Cloud-based, auto-scale, sudah setup |
| CI/CD | Railway auto-deploy | Push ke main = auto deploy |
| Agent framework | Claude API (claude-sonnet-4-20250514) + MCP | |
| IDE | GitHub Codespaces | Zero setup, browser-based VS Code |
| Monitoring | Betterstack Telemetry (Logs) | Real-time log monitoring |
| Rate limiting | slowapi==0.1.9 | Per-IP throttling via x-forwarded-for |

### Layer Arsitektur

```
Layer 7 — Betterstack (monitoring & logging)
Layer 6 — Rate limiting + Security headers (slowapi + middleware)
Layer 5 — Claude API (claude-sonnet-4-20250514)
Layer 4 — RAG API + Auth & User Management
Layer 3 — Qdrant Cloud + PostgreSQL (Railway)
Layer 2 — Auto-indexer + Chunker + Embedder
Layer 1 — Sumber data: GitHub, Docs, Chat History, Files
```

---

## 4. Roadmap Phase

| Phase | Nama | Isi | Status |
|-------|------|-----|--------|
| 1 | Fondasi backend | FastAPI + PostgreSQL + struktur project | ✅ Selesai |
| 2 | Vector DB & embedding | Qdrant + chunker + sentence-transformers | ✅ Selesai |
| 3 | RAG API & Claude integration | Query → retrieve → inject ke Claude | ✅ Selesai |
| 4 | Auth & multi-user | JWT + user model + isolasi data per tenant | ✅ Selesai |
| 5 | Agentic layer | Claude agent + tools (read/write/run/search) | ✅ Selesai |
| 6 | GitHub auto-indexer | Webhook + auto-index setiap git push | ✅ Selesai |
| 7 | Deploy ke Railway | Docker + Railway + Qdrant Cloud + PostgreSQL | ✅ Selesai |
| 8 | Monitoring | Betterstack logging — log production real-time | ✅ Selesai |
| 9 | Rate limiting & security | slowapi throttling + security headers | ✅ Selesai |
| 10 | Frontend / dashboard | UI untuk query + agent management | ⬜ Belum mulai |

---

## 5. Struktur Folder Project (Current)

```
enasverse_x_claude/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point + router + DB init + logger + rate limiter + security headers
│   │   ├── config.py             # Settings & env vars (pydantic-settings)
│   │   ├── database.py           # PostgreSQL async connection (SQLAlchemy)
│   │   ├── logger.py             # ✅ Custom Betterstack HTTP logging handler
│   │   ├── models/
│   │   │   └── user.py           # ✅ User model
│   │   ├── schemas/
│   │   │   └── auth.py           # ✅ Auth schemas
│   │   ├── routers/
│   │   │   ├── auth.py           # ✅ register (5/min), login (5/min)
│   │   │   ├── documents.py      # ✅ index, upload
│   │   │   ├── query.py          # ✅ RAG query (20/min)
│   │   │   ├── agent.py          # ✅ agent run (10/min)
│   │   │   └── indexer.py        # ✅ github webhook + index-repo
│   │   ├── services/
│   │   │   ├── auth.py           # ✅ JWT, bcrypt
│   │   │   ├── embedder.py       # ✅ sentence-transformers dim=384
│   │   │   ├── retriever.py      # ✅ Qdrant vector search
│   │   │   ├── claude.py         # ✅ Claude API + RAG
│   │   │   ├── agent.py          # ✅ Claude agent + 5 tools
│   │   │   └── github_indexer.py # ✅ GitHub repo indexer
│   │   └── utils/
│   ├── tests/
│   ├── .env                      # TIDAK di-commit
│   ├── .env.example
│   ├── requirements.txt
│   └── docker-compose.yml
├── Dockerfile                    # ✅ untuk Railway deploy
├── railway.toml                  # ✅ Railway config
├── Procfile                      # ✅ start command
├── README.md
├── .gitignore
└── ENASVERSE_CONTEXT.md
```

---

## 6. API Endpoints Aktif

```
✅ GET  /                             → app info
✅ GET  /health                       → status check
✅ GET  /docs                         → Swagger UI

✅ POST /auth/register                → daftar user baru [5/min]
✅ POST /auth/login                   → login, dapat JWT token [5/min]
✅ GET  /auth/me                      → info user saat ini

✅ POST /documents/index              → index teks ke Qdrant
✅ POST /documents/upload             → upload file .txt

✅ POST /query                        → tanya Claude dengan RAG context [20/min]

✅ POST /agent/run                    → jalankan Claude agent task [10/min]
✅ GET  /agent/health                 → status agent + tools

✅ POST /indexer/github/webhook       → GitHub webhook endpoint
✅ POST /indexer/index-repo           → manual index GitHub repo
✅ GET  /indexer/health               → status indexer
```

---

## 7. Agent Tools yang Tersedia

| Tool | Fungsi |
|------|--------|
| `read_file` | Baca isi file di project |
| `write_file` | Tulis/update file di project |
| `run_command` | Jalankan shell command |
| `search_codebase` | Cari konteks di vector DB |
| `request_human_approval` | Minta approval sebelum perubahan besar |

---

## 8. Security & Rate Limiting

### Rate Limits (per IP via x-forwarded-for)

| Endpoint | Limit |
|----------|-------|
| `POST /auth/login` | 5/minute |
| `POST /auth/register` | 5/minute |
| `POST /query` | 20/minute |
| `POST /agent/run` | 10/minute |
| Global default | 200/minute |

### Security Headers (semua response)

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | nosniff |
| `X-Frame-Options` | DENY |
| `X-XSS-Protection` | 1; mode=block |
| `Strict-Transport-Security` | max-age=31536000; includeSubDomains |
| `Referrer-Policy` | strict-origin-when-cross-origin |

### Implementasi
- Library: `slowapi==0.1.9`
- IP detection: `x-forwarded-for` header (Railway proxy aware)
- Rate limit exceeded: HTTP 429 Too Many Requests
- Security headers: custom `@app.middleware("http")` di main.py

---

## 9. Infrastructure & Services

### Railway (Production)
- **URL:** https://enasversexclaude-production.up.railway.app
- **Database:** PostgreSQL (Railway managed) — Online ✅
- **Deploy:** Dockerfile based, auto-deploy on git push ✅
- **Status:** Online ✅

### Qdrant Cloud
- **Cluster:** enasverse (Free tier, AWS Ohio)
- **Status:** ✅ Active

### Betterstack Monitoring
- **Product:** Telemetry (Logs)
- **Source:** Enasverse (Python, Europe cluster eu-fsn-3)
- **Ingesting host:** s2444508.eu-fsn-3.betterstackdata.com
- **Status:** ✅ Active — log production masuk real-time

### GitHub Webhook
- **Repo:** bangdul-rohman/enasverse_x_claude
- **URL:** https://enasversexclaude-production.up.railway.app/indexer/github/webhook
- **Event:** push
- **Status:** ✅ Active

---

## 10. Railway Environment Variables

| Variable | Status | Notes |
|----------|--------|-------|
| `ANTHROPIC_API_KEY` | ✅ Set | |
| `APP_ENV` | ✅ Set | production |
| `APP_NAME` | ✅ Set | enasverse |
| `BETTERSTACK_TOKEN` | ✅ Set | 53JpK51wXd2N8DpDibL3x3qT |
| `DATABASE_URL` | ✅ Set | Railway PostgreSQL public URL |
| `GITHUB_TOKEN` | ✅ Set | |
| `QDRANT_API_KEY` | ✅ Set | |
| `QDRANT_COLLECTION` | ✅ Set | enasverse_docs |
| `QDRANT_URL` | ✅ Set | Qdrant Cloud URL |
| `SECRET_KEY` | ✅ Set | |

---

## 11. Keputusan Desain

| # | Keputusan | Tanggal |
|---|-----------|---------|
| 1 | Pakai Qdrant Cloud free tier untuk production | 2026-05-16 |
| 2 | Multi-tenant dari awal | 2026-05-14 |
| 3 | Human approval wajib di agentic layer | 2026-05-14 |
| 4 | Deploy via Dockerfile ke Railway | 2026-05-16 |
| 5 | claude-sonnet-4-20250514 sebagai model | 2026-05-14 |
| 6 | sentence-transformers untuk dev, bisa upgrade ke OpenAI prod | 2026-05-14 |
| 7 | Vector dimension = 384 (MiniLM) | 2026-05-14 |
| 8 | .env TIDAK boleh di-commit ke GitHub | 2026-05-14 |
| 9 | bcrypt versi 4.0.1 (bukan versi terbaru) | 2026-05-14 |
| 10 | anthropic SDK harus versi terbaru untuk support tools | 2026-05-14 |
| 11 | Betterstack pakai custom HTTP handler (bukan logtail library) | 2026-05-17 |
| 12 | Betterstack token: gunakan yang ada huruf 'i' bukan 'l' (DibL bukan DlbL) | 2026-05-17 |
| 13 | Rate limiting pakai x-forwarded-for bukan get_remote_address (Railway proxy) | 2026-05-17 |
| 14 | Security headers via custom HTTP middleware di main.py | 2026-05-17 |

---

## 12. Bug & Issues Log

| # | Bug | Status | Solusi |
|---|-----|--------|--------|
| 1 | `No module named 'app'` | ✅ Fixed | Jalankan uvicorn dari dalam folder `backend/` |
| 2 | Vector dimension error 1536 vs 384 | ✅ Fixed | DELETE collection Qdrant, buat ulang |
| 3 | GitHub Push Protection blocked API key | ✅ Fixed | .gitignore + git filter-branch |
| 4 | Port busy | ✅ Fixed | Pakai port 8001, 8002, dst |
| 5 | curl tidak ada response | ✅ Fixed | Set port visibility ke Public di Codespaces |
| 6 | bcrypt `module has no attribute '__about__'` | ✅ Fixed | pip install bcrypt==4.0.1 |
| 7 | `AsyncMessages.create() unexpected keyword 'tools'` | ✅ Fixed | pip install anthropic --upgrade |
| 8 | Railway: `pip: command not found` | ✅ Fixed | Ganti ke Dockerfile approach |
| 9 | Railway: `No module named 'sentence_transformers'` | ✅ Fixed | Tambah ke requirements.txt |
| 10 | Railway: `No module named 'github'` | ✅ Fixed | Tambah PyGithub==2.3.0 ke requirements.txt |
| 11 | Railway: Healthcheck failed | ✅ Fixed | Update QDRANT_URL + QDRANT_API_KEY |
| 12 | Betterstack: `{"error": "Unauthorized"}` | ✅ Fixed | Token salah (DlbL → DibL) |
| 13 | Betterstack: logtail-python tidak kirim log | ✅ Fixed | Ganti ke custom HTTP handler |
| 14 | Phase 9: Healthcheck failed setelah deploy | ✅ Fixed | Import HTTPException + Depends terhapus di query.py & agent.py |
| 15 | Rate limit tidak trigger (semua 401) | ✅ Fixed | Ganti ke x-forwarded-for untuk Railway proxy |

---

## 13. Cara Jalankan Server (Local/Codespaces)

```bash
cd /workspaces/enasverse_x_claude/backend
docker compose up -d
uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
# Set port visibility ke Public di tab PELABUHAN
```

---

## 14. Cara Test Manual Index Repo

```bash
TOKEN=$(curl -s -X POST "https://enasversexclaude-production.up.railway.app/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@enasverse.com", "password": "password123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -X POST "https://enasversexclaude-production.up.railway.app/indexer/index-repo" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"repo": "bangdul-rohman/enasverse_x_claude", "branch": "main", "tenant_id": "tenant-1"}'
```

---

## 15. Progress Log Sesi

### Sesi 1 — 2026-05-14
- Merancang arsitektur lengkap RAG + Agentic
- Menyepakati tech stack dan roadmap

### Sesi 2 — 2026-05-14
- ✅ Phase 1-5 selesai semua
- ✅ GitHub auto-indexer + webhook aktif

### Sesi 3 — 2026-05-16
- ✅ Setup Railway + PostgreSQL + Qdrant Cloud

### Sesi 4 — 2026-05-16
- ✅ Deploy Railway BERHASIL
- ✅ End-to-end test production berhasil

### Sesi 5 — 2026-05-17
- ✅ Betterstack monitoring aktif
- ✅ Log production masuk real-time

### Sesi 6 — 2026-05-17
- ✅ Rate limiting: login/register 5/min, query 20/min, agent 10/min
- ✅ Security headers aktif di semua response
- ✅ Fix import bug (Phase 9) — HTTPException + Depends terhapus
- ✅ Fix rate limiting di belakang Railway proxy (x-forwarded-for)
- ✅ Konfirmasi 429 Too Many Requests berfungsi di production
- **Next session:** Phase 10 — Frontend / dashboard

---

## 16. Hal yang JANGAN Diulang

- Vector DB: **Qdrant** (final)
- Backend: **Python + FastAPI** (final)
- `.env` **TIDAK BOLEH** di-commit ke GitHub
- Uvicorn **HARUS** dari folder `backend/`
- Vector dim = **384** (MiniLM)
- bcrypt harus versi **4.0.1**
- anthropic SDK harus **versi terbaru**
- Railway deploy pakai **Dockerfile**
- DATABASE_URL pakai **public URL** Railway
- Betterstack: pakai **custom HTTP handler**, token: **DibL** bukan DlbL
- Rate limiting: pakai **x-forwarded-for**, bukan get_remote_address
- Saat tambah rate limit ke router: **jangan hapus** import Depends dan HTTPException

---

*File ini di-generate dan di-maintain bersama Claude sebagai bagian dari project Enasverse.*
