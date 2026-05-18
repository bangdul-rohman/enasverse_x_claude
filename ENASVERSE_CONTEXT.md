# ENASVERSE_CONTEXT.md
> Keyword sesi baru: "enasverse load context: https://raw.githubusercontent.com/bangdul-rohman/enasverse_x_claude/main/ENASVERSE_CONTEXT.md?v=12"

## 1. Status Project
| Phase | Nama | Status |
|-------|------|--------|
| 1-11 | Fondasi s/d Chat History | DONE |
| 12 | Landing Page + SEO | DONE |
| 13 | File Upload (PDF, DOCX, TXT) | DONE |
| 14 | API Key Management | DONE |
| 15 | Quota & Usage Tracking | TODO |
| 16 | Billing & Subscription | TODO |
| 17 | Admin Panel | TODO |
| 18 | Team & Kolaborasi | TODO |
| 19 | Reliability & Scale | TODO |
| 20 | Security & Compliance | TODO |

## 2. URLs Production
| Service | URL |
|---------|-----|
| Frontend | https://enasverse-x-claude.vercel.app |
| Backend | https://enasversexclaude-production.up.railway.app |
| API Docs | https://enasversexclaude-production.up.railway.app/docs |
| GitHub | https://github.com/bangdul-rohman/enasverse_x_claude |

## 3. Stack
Backend: Python FastAPI, PostgreSQL, Qdrant, sentence-transformers (dim=384), bcrypt==4.0.1, slowapi, pypdf==4.3.1, python-docx==1.1.2
Frontend: Next.js + Tailwind CSS
Hosting: Railway (backend) + Vercel (frontend)
Auth: JWT via get_current_user dari app.services.auth

## 4. Phase 14 Detail
- backend/app/models/api_key.py — SQLAlchemy model APIKey
- backend/app/routers/api_keys.py — POST/GET/DELETE /api-keys/
- backend/app/main.py — router registered
- backend/app/database.py — model imported untuk auto-create table
- frontend/app/api-keys/page.tsx — UI buat/lihat/cabut API key

## 5. Phase 13 Detail
- backend/app/routers/documents.py — upload PDF/DOCX/TXT, chunking, indexing
- frontend/components/FileUpload.tsx — drag & drop, progress bar, multi-file
- frontend/app/dashboard/page.tsx — tab Upload diganti FileUpload komponen

## 6. Aturan Penting
- Tulis file besar via base64 clipboard paste (JANGAN heredoc - emoji unicode error)
- bcrypt==4.0.1, vector dim=384
- Auth: Depends(get_current_user) dari app.services.auth
- chat_sessions: user_id = String tanpa FK
- limiter di app/limiter.py bukan main.py
- DATABASE_URL default: enasverse:enasverse (docker)
- Vercel root: frontend

## 7. Dev Lokal
cd /workspaces/enasverse_x_claude/backend && uvicorn app.main:app --host 0.0.0.0 --port 8002
cd /workspaces/enasverse_x_claude/frontend && npm run dev -- --port 3000

## 8. Progress Sesi Ini
- Phase 12: Landing page + SEO (page.tsx + layout.tsx)
- Phase 13: File Upload backend + FileUpload.tsx komponen
- Phase 14: API Key model + router + halaman /api-keys
- Next: Phase 15 - Quota & Usage Tracking
