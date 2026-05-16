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
| Status | Perencanaan arsitektur selesai, belum mulai coding |
| Dibuat | 2026-05-14 |
| Terakhir diupdate | 2026-05-14 |

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
| Database relational | PostgreSQL | Multi-tenant, mature |
| Vector DB | Qdrant | Self-hostable, performa tinggi |
| Embedding model | text-embedding-3-small (OpenAI) | Cost-efficient untuk skala besar |
| Auth | Supabase | Gratis untuk mulai, built-in JWT |
| Hosting | Railway / GCP Cloud Run | Cloud-based, auto-scale |
| CI/CD | GitHub Actions | Integrasi native dengan repo |
| Deploy target | Vercel (frontend) + Railway (backend) | |
| Agent framework | Claude API (claude-sonnet-4) + MCP | |

### Layer Arsitektur (urutan dari bawah ke atas)

```
Layer 5 — Claude API (claude-sonnet-4)
Layer 4 — RAG API + Auth & User Management
Layer 3 — Vector DB (Qdrant) + Metadata DB (PostgreSQL)
Layer 2 — Auto-indexer + Chunker + Embedder
Layer 1 — Sumber data: GitHub, Docs, Chat History, Files
```

### Agentic Layer (di atas semua layer)

```
Trigger: User request / Error monitor / Scheduled task / GitHub event
      ↓
Claude Agent → Tools: File system, Bash executor, Git tools, Deploy API
      ↓
Safety Gate: Auto test suite + Human approval (untuk perubahan besar)
      ↓
CI/CD Pipeline: GitHub Actions → Staging → Production
```

---

## 4. Roadmap Phase

| Phase | Nama | Isi | Status | Est. Waktu |
|-------|------|-----|--------|------------|
| 1 | Fondasi backend | FastAPI + PostgreSQL + struktur project | ⬜ Belum mulai | 1-2 hari |
| 2 | Vector DB & embedding | Qdrant + chunker + auto-indexer GitHub | ⬜ Belum mulai | 2-3 hari |
| 3 | RAG API & Claude integration | Query → retrieve → inject ke Claude | ⬜ Belum mulai | 2-3 hari |
| 4 | Auth & multi-user | JWT + Supabase + isolasi data per tim | ⬜ Belum mulai | 2 hari |
| 5 | Agentic layer | Claude edit kode + auto deploy | ⬜ Belum mulai | 3-5 hari |

**Legend:** ⬜ Belum mulai · 🔄 Sedang dikerjakan · ✅ Selesai · ❌ Blocked

---

## 5. Struktur Folder Project (Planned)

```
enasverse/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point
│   │   ├── config.py             # Settings & env vars
│   │   ├── database.py           # PostgreSQL connection
│   │   ├── models/               # SQLAlchemy models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── routers/              # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── documents.py
│   │   │   ├── query.py
│   │   │   └── agent.py
│   │   ├── services/
│   │   │   ├── embedder.py       # Chunking + embedding
│   │   │   ├── retriever.py      # Vector search
│   │   │   ├── claude.py         # Claude API wrapper
│   │   │   └── agent.py          # Agentic tools
│   │   └── utils/
│   ├── tests/
│   ├── .env.example
│   ├── requirements.txt
│   └── docker-compose.yml
├── indexer/
│   ├── github_indexer.py         # Auto-index dari GitHub
│   └── scheduler.py              # Cron jobs
├── docs/
│   └── api/                      # API documentation
└── ENASVERSE_CONTEXT.md          # File ini
```

---

## 6. API Endpoints yang Direncanakan

### Auth
```
POST /auth/register
POST /auth/login
POST /auth/refresh
DELETE /auth/logout
```

### Documents (Ingestion)
```
POST   /documents/upload          # Upload file manual
POST   /documents/index-repo      # Index dari GitHub repo
GET    /documents                 # List semua dokumen
DELETE /documents/{id}
```

### Query (RAG)
```
POST /query                       # Query dengan context retrieval
GET  /query/history               # Riwayat query
```

### Agent
```
POST /agent/run                   # Jalankan agent task
GET  /agent/tasks                 # List tasks
GET  /agent/tasks/{id}            # Status task
POST /agent/tasks/{id}/approve    # Human approval
```

---

## 7. Keputusan Desain yang Sudah Disepakati

> Catat setiap keputusan penting di sini supaya tidak diulang diskusinya.

| # | Keputusan | Alasan | Tanggal |
|---|-----------|--------|---------|
| 1 | Pakai Qdrant bukan Pinecone | Self-hostable, tidak tergantung vendor cloud | 2026-05-14 |
| 2 | Multi-tenant dari awal | Produk untuk banyak user, bukan personal tool | 2026-05-14 |
| 3 | Human approval wajib untuk perubahan besar di agentic layer | Safety gate mencegah deploy kode rusak | 2026-05-14 |
| 4 | Staging environment sebelum production | Test dulu sebelum user terdampak | 2026-05-14 |
| 5 | Pakai claude-sonnet-4 sebagai agent model | Balance antara kemampuan dan cost | 2026-05-14 |

---

## 8. Bug & Issues Log

> Semua bug yang ditemukan dan solusinya dicatat di sini.

| # | Bug / Issue | Lokasi | Status | Solusi | Tanggal |
|---|-------------|--------|--------|--------|---------|
| — | Belum ada bug (belum mulai coding) | — | — | — | — |

---

## 9. Environment Variables yang Diperlukan

```env
# App
APP_NAME=enasverse
APP_ENV=development
SECRET_KEY=

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/enasverse

# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=enasverse_docs

# OpenAI (untuk embedding)
OPENAI_API_KEY=

# Anthropic (untuk Claude)
ANTHROPIC_API_KEY=

# Supabase (auth)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# GitHub (untuk indexer)
GITHUB_TOKEN=
GITHUB_WEBHOOK_SECRET=

# Deploy
RAILWAY_TOKEN=
```

---

## 10. Progress Log Sesi

> Setiap sesi coding, tambahkan entry di sini.

### Sesi 1 — 2026-05-14
- Merancang arsitektur lengkap sistem RAG + Agentic
- Menyepakati tech stack dan roadmap 5 phase
- Membuat dokumen ENASVERSE_CONTEXT.md ini
- **Next session:** Mulai Phase 1 — setup FastAPI + PostgreSQL + struktur folder

---

## 11. Hal yang JANGAN Diulang

> Topik atau keputusan yang sudah final. Tidak perlu didiskusikan ulang.

- Pilihan vector DB sudah final: **Qdrant**
- Pilihan bahasa backend sudah final: **Python + FastAPI**
- Sistem ini adalah produk multi-user, **bukan** personal tool
- Safety gate (human approval) adalah **wajib**, bukan opsional

---

## 12. Cara Pakai Dokumen Ini

### Di awal setiap sesi baru:
1. Upload file `ENASVERSE_CONTEXT.md` ini ke chat
2. Tulis: *"Lanjutkan project Enasverse. Baca context file yang saya upload."*
3. Claude akan langsung tahu semua history tanpa perlu dijelaskan ulang

### Di akhir setiap sesi:
1. Minta Claude: *"Update ENASVERSE_CONTEXT.md berdasarkan sesi ini"*
2. Download file yang dihasilkan
3. Ganti file lama dengan yang baru
4. Simpan di repo GitHub kamu (opsional tapi sangat direkomendasikan)

---

*File ini di-generate dan di-maintain bersama Claude sebagai bagian dari project Enasverse.*

---
## Update Sesi 4 — 2026-05-16
- ✅ Phase 7: Deploy Railway BERHASIL
- ✅ URL Production: https://enasversexclaude-production.up.railway.app
- ✅ Health check: {"status":"ok"}
- ✅ GitHub webhook updated ke Railway URL permanen
- ✅ Fix: database.py auto-convert asyncpg, qdrant api_key, PORT env var
- **Next session:** End-to-end test production + monitoring

---
## Update Sesi 4 (Lanjutan) — 2026-05-16

### Bug Fixes yang Diselesaikan
- ✅ database.py: auto-convert DATABASE_URL postgresql:// → postgresql+asyncpg://
- ✅ database.py: fix import get_settings() bukan settings langsung
- ✅ database.py: fix lowercase settings.database_url
- ✅ config.py: tambah qdrant_api_key field
- ✅ retriever.py: pass api_key ke AsyncQdrantClient
- ✅ retriever.py: tambah create_payload_index() untuk tenant_id filter
- ✅ Dockerfile: ganti hardcode port 8000 → ${PORT:-8000}
- ✅ requirements.txt: tambah sentence-transformers, PyGithub, bcrypt==4.0.1
- ✅ main.py: restore semua router (auth, agent, indexer)
- ✅ models/user.py: restore User model
- ✅ schemas/auth.py: restore auth schemas
- ✅ routers/auth.py: restore auth router
- ✅ routers/agent.py: restore agent router
- ✅ routers/indexer.py: restore indexer router
- ✅ services/auth.py: restore JWT + bcrypt service
- ✅ services/agent.py: restore run_agent function
- ✅ services/github_indexer.py: restore GitHub indexer
- ✅ DATABASE_URL: ganti ke Railway PostgreSQL public URL (yamanote.proxy.rlwy.net)

### End-to-End Test Production — BERHASIL
- ✅ Register user → dapat id + tenant_id
- ✅ Login → dapat JWT token
- ✅ Index dokumen → indexed: 1
- ✅ Query Claude → Claude jawab dengan konteks RAG

### Monitoring Setup (In Progress)
- 🔄 Betterstack — akun dibuat, belum connect source
- **Next:** Connect source Betterstack → dapat token → integrasi ke FastAPI

### Production URL
- https://enasversexclaude-production.up.railway.app

### Catatan Penting
- Semua file yang hilang akibat git filter-branch sudah di-restore
- DATABASE_URL harus pakai public URL Railway (bukan internal .railway.internal)
- bcrypt harus pin ke 4.0.1
- Qdrant butuh payload index untuk field tenant_id sebelum bisa filter
