# Emotion Analysis Platform – Incremental Architecture Evolution

## Overview
This document describes how the system architecture evolves across sprints based on the **development-plan.md**.  
The platform follows a **modular monolith** pattern using a monorepo structure:  
`/frontend/` → Next.js + shadcn/ui (UI layer)  
`/backend/` → FastAPI + MongoDB (API and business layers)

---

## Sprint 0 – Base Scaffolding Architecture

### Architecture Diagram

```
          ┌────────────────────┐
          │     Frontend       │
          │  (Next.js + UI)    │
          └───────┬────────────┘
                  │ REST API (Health Check)
                  ▼
          ┌────────────────────┐
          │     Backend        │
          │   (FastAPI App)    │
          ├────────────────────┤
          │ APIs: /health       │
          │ Modules: core       │
          └───────┬────────────┘
                  │
                  ▼
          ┌────────────────────┐
          │   MongoDB Atlas    │
          │ (env configured)   │
          └────────────────────┘
```

**Key Implementations**
- Repository and monorepo setup (`frontend/`, `backend/`)
- Environment variables (`.env`)
- Health check endpoint `/api/v1/health`
- Initial deployment scaffold for **Vercel** and **Render**

---

## Sprint 1 – Authentication Layer Integration

### Evolving Architecture

```
          ┌───────────────┐
          │   Frontend    │
          │ auth UI       │
          │ Login/Register│
          └──────┬────────┘
                 │
      ┌──────────┴──────────┐
      │     Backend (API)   │
      │  /auth endpoints    │
      │  JWT issue/verify   │
      ├─────────────────────┤
      │ User Model + Hashing│
      └──────────┬──────────┘
                 │
                 ▼
          ┌───────────────┐
          │ MongoDB Atlas │
          │ users colln   │
          └───────────────┘
```

**Enhancements**
- Added **auth module** in backend
- JWT generation & protected route
- Frontend integration with login/register UI

---

## Sprint 2 – Emotion Analysis Engine MVP

### Evolving Architecture

```
 ┌─────────────┐        ┌──────────────────┐
 │  Frontend   │        │   Backend (API)  │
 │ Uploader UI │─POST──▶│ /api/v1/analyze  │
 │ Result Chart│◀───────│ ProcessorService │
 └─────────────┘        │ HuggingFace HF model │
                        ├──────────────────┤
                        │ analysis module  │
                        │ Mongo write/read │
                        └───────┬──────────┘
                                │
                                ▼
                        ┌──────────────┐
                        │ MongoDB Atlas│
                        │ analyses coll│
                        └──────────────┘
```

**New Additions**
- EmotionProcessor (using transformer model)
- `/analyze` API
- Frontend visualization with basic chart

---

## Sprint 3 – Emotion Dashboard

### Architecture with Visualization Module

```
                ┌──────────────────────────┐
                │   Dashboard Frontend     │
                │  charts, filters, trends │
                └────────────┬─────────────┘
                             │
         ┌───────────────────┴────────────────┐
         │           Backend API              │
         │ /dashboard → aggregated analytics  │
         │ /analysis → detailed history       │
         ├────────────────────────────────────┤
         │ metrics.py aggregation service     │
         └───────────┬────────────────────────┘
                     │
                     ▼
             ┌───────────────┐
             │ MongoDB Atlas │
             │ stored results│
             └───────────────┘
```

**Features**
- Aggregate emotion results per user/session
- Filter and timeline-based charts
- Data fetch via `/dashboard` endpoint

---

## Sprint 4 – Report Export and Finalization

### Final MVP Architecture

```
 ┌────────────┐
 │  Frontend  │
 │ Export UI  │
 │ Dashboard  │
 └─────┬──────┘
       │
┌──────┴────────┐
│ Backend API   │
│ /export       │→ generates CSV/JSON
│ /dashboard    │
│ auth + analysis│
└──────┬────────┘
       │
       ▼
┌───────────────┐
│ MongoDB Atlas │
│ complete data │
└───────────────┘
```

**Final Features**
- Export endpoints (CSV/JSON)
- Final frontend download/report view
- Complete authentication + visualization coupling

---

## Evolution Summary

| Sprint | Backend Modules           | Frontend Modules       | Key Deliverables                  |
|--------|---------------------------|------------------------|----------------------------------|
| 0 | core, health | base scaffold | Monorepo setup |
| 1 | auth | auth UI | JWT auth |
| 2 | analysis | uploader | Emotion processing |
| 3 | dashboard | chart | Data visualization |
| 4 | export | report | Download/export |

## ✅ Sprint 0 Verification – Architecture Update

The foundational architecture has now been successfully implemented and verified.

- **Frontend:** Next.js scaffold created with TypeScript, Tailwind, and shadcn/ui.
- **Backend:** FastAPI app with a working `/api/v1/health` endpoint returning:
  ```json
  { "status": "ok" }
  ```
- **Local testing:** Passed (verified at `http://localhost:8000/api/v1/health`)
- **Environment:** `.env` and virtual environment configured, dependencies installed.

### Verified Architecture Snapshot
```
frontend/  →  Next.js (App Router)
backend/   →  FastAPI modular entrypoint

          ┌────────────────────┐
          │ Frontend (Next.js) │
          ├────────────────────┤
          │ TailwindCSS + UI   │
          └────────┬───────────┘
                   │ API Call
                   ▼
          ┌────────────────────┐
          │ Backend (FastAPI)  │
          ├────────────────────┤
          │ /api/v1/health     │
          │ Core Configured    │
          └────────┬───────────┘
                   │
                   ▼
          ┌────────────────────┐
          │ MongoDB Atlas (env)│
          └────────────────────┘
```

This confirms **Sprint 0 completion** according to the `development-plan.md` success criteria. The project is now ready for **Sprint 1 – JWT Authentication Module** implementation.
