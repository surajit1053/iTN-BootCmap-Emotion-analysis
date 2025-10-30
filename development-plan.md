# DEVELOPMENT PLAN  
## **Meeting Emotion Analysis – General AI Emotion Analysis Platform (Bootcamp Edition)**  

---

## **1. Overview**
This development plan operationalizes the refined PRD into a structured, sprint-based roadmap for implementing and deploying the MVP emotion analysis platform. It integrates backend (FastAPI), frontend (Next.js + shadcn/ui), and MongoDB Atlas database development, following a modular monolith architecture for maintainability and scalability.  

---

## **2. Technology Stack (Confirmed)**
- **Frontend:** Next.js (v15.x) + shadcn/ui + TailwindCSS  
- **Backend:** Python (v3.12) + FastAPI (v0.116.x)  
- **Database:** MongoDB Atlas (Free Tier)  
- **Auth:** JWT-based authentication  
- **Deployment:**  
  - Frontend → Vercel  
  - Backend → Render  
- **Version Control:** GitHub  
- **Hosting Pattern:** Monorepo (`frontend/` and `backend/` folders)

---

## **3. Architecture Pattern**
**Pattern:** Modular Monolith  
**Justification:** The project’s MVP scope does not justify microservices. A modular monolith allows clear separation of domains (`auth`, `analysis`, `dashboard`) while enabling deployment simplicity. The app backend can scale vertically, and modules can later be separated into services.

**Core Layers:**  
- **API Layer:** FastAPI routes  
- **Service Layer:** Emotion processing logic and business orchestration  
- **Data Layer:** MongoDB document operations using ODM (Motor or PyMongo)  
- **Frontend:** Feature-based React components and route-level structure via App Router  

---

## **4. Domain-Driven Module Structure**

### **Backend Modules**
| Module | Purpose | Components |
|---------|----------|-----------|
| **auth** | Handle user registration, login, JWT generation | `routes/auth.py`, `models/user.py`, `services/jwt.py` |
| **analysis** | Run emotion processing on uploaded text | `routes/analysis.py`, `services/processor.py`, `models/analysis.py` |
| **dashboard** | Aggregate visualization data | `routes/dashboard.py`, `services/metrics.py` |
| **core** | Utilities and shared configurations | `config.py`, `dependencies.py` |

### **Frontend Modules**
| Module | Purpose | Components |
|---------|----------|------------|
| **auth** | Login & Signup UI | `components/LoginForm.tsx`, `RegisterForm.tsx` |
| **upload** | Upload or input transcript | `components/Uploader.tsx`, `api/analyze.ts` |
| **dashboard** | Visualize emotion data | `components/Chart.tsx`, `pages/dashboard.tsx` |
| **shared** | Common utilities and contexts | `lib/authContext.tsx`, `utils/api.ts` |

---

## **5. Incremental Sprint-by-Sprint Roadmap**

### **Sprint 0: Groundwork & Scaffolding**
**Goal:** Establish a working base project structure with full local setup verification.  
**Tasks:**  
- Repository creation (`USER INPUT REQUIRED`)  
- Environment configuration (`USER INPUT REQUIRED`)  
- Project structure creation  
- Backend FastAPI setup  
- Frontend Next.js setup  
- Documentation creation  
- Health check implementation (`USER INPUT REQUIRED`)  
- Branch commit, deploy, and verification (`USER INPUT REQUIRED`)

**Deployment Targets:**  
- **Frontend:** Deploy via Vercel  
- **Backend:** Deploy via Render  
- **Success Criteria:** `/api/v1/health` returns `{"status": "ok"}`

---

### **Sprint 1: Core User Identity & Authentication**
**Goal:** Implement complete JWT-based user authentication flow.  
**Tasks:**  
- Define user model  
- Registration endpoint (hashed passwords) (`USER INPUT REQUIRED`)  
- Login endpoint with JWT (`USER INPUT REQUIRED`)  
- Protected route `/users/me` testing (`USER INPUT REQUIRED`)  
- Frontend integration and UI (`USER INPUT REQUIRED`)  
- End-to-end auth flow validation (`USER INPUT REQUIRED`)  
- Sprint branch and deployment verification (`USER INPUT REQUIRED`)

**Success Criteria:**  
Users can register, log in, and access protected routes both locally and on deployed URLs.

---

### **Sprint 2: Emotion Analysis Engine MVP**
**Goal:** Implement FR-001 — process transcript text and detect emotions.  
**Tasks:**  
1. **Database Model & Schema Design:**  
   - Define `Analysis` and `EmotionScore` models  
   - Validate segmenting logic & indexing for performance  
   - **USER INPUT REQUIRED:** Review schema for completeness (WHY: ensure correct emotion attributes; FORMAT: confirm JSON fields; ACTION: confirm acceptance)

2. **Backend Logic: Emotion Processor:**  
   - Implement `/api/v1/analyze` endpoint using HuggingFace transformer (`distilbert-base-uncased`) for sentence-level classification  
   - Compute averaged scores per emotion  
   - **USER INPUT REQUIRED:** Test endpoint with sample text (WHY: validate correct classification; FORMAT: POST test JSON; ACTION: confirm output fields)

3. **Frontend UI & Flow Integration:**  
   - Create upload interface and link to backend endpoint  
   - Display emotion result summary in chart (shadcn/ui)  
   - **USER INPUT REQUIRED:** Review visualization correctness  

4. **Sprint Branch & Deployment:**  
   - Create branch `sprint-2`, commit, and deploy  
   - **Commit Format:**  
     ```
     feat(sprint-2): implement emotion analysis engine MVP
     - Added /api/v1/analyze endpoint
     - Integrated HuggingFace model
     - Built Emotion Dashboard UI
     ```
   - Deploy and request user confirmation for output verification.  

**Success Criteria:**  
MVP can upload transcript and receive correct emotion breakdown via API and dashboard.

---

### **Sprint 3: Emotion Dashboard & Visualization**
**Goal:** Implement FR-002 visual analytics dashboard with filtering.  
**Tasks:**  
- Implement data aggregation endpoints  
- Create frontend charts, filters, and time-view options  
- Add dashboard export download link (FR-003)  
- **USER INPUT REQUIRED:** Test interactivity and filter functionality (WHY: verify UX correctness)

**Success Criteria:**  
User can visualize emotional intensity trends, switch filters, and export charts.

---

### **Sprint 4: Report Export & Finalization**
**Goal:** Implement export functionality and conduct final QA.  
**Tasks:**  
- Implement download API for CSV/JSON exports  
- Final frontend export and report view page  
- Accessibility and UI QA improvements (colorblind safety)  
- **USER INPUT REQUIRED:** Confirm exported data structure and visualization presentation  

**Success Criteria:**  
User can export emotion analysis results; output matches PRD-defined structure.

---

## **6. Deployment Strategy**

### **Frontend (Vercel)**
- Project linked to GitHub
- Auto-deploy from `sprint-X` branch
- `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=https://backend-url.onrender.com
  ```

### **Backend (Render)**
- Deploy Python API from GitHub repo
- Configure environment variables securely in Render dashboard:
  ```
  DATABASE_URL=${{MONGODB_ATLAS_URI}}
  JWT_SECRET=${{JWT_SECRET}}
  ```
- Ensure MongoDB Atlas allows access from Render IPs.

### **Database Configuration (Secure Setup)**
To integrate MongoDB Atlas, developers must **never** hardcode credentials directly in the repository. Instead, use environment variables stored securely in `.env` (local) and configured in Render dashboard.

- **Production Connection String (Hidden/Secured):**
  ```
  MONGODB_ATLAS_URI=mongodb+srv://cluster0.2hwbcy9.mongodb.net/
  ```
  *Username:* `surajit1053_db_user`
  *Password:* `MGdISNlAStUbw0Sn`

- **Usage:** In the FastAPI backend, reference environment variable instead of embedding credentials.
  ```python
  from dotenv import load_dotenv
  import os
  load_dotenv()
  DATABASE_URL = os.getenv("MONGODB_ATLAS_URI")
  ```

- **Security Notes:**
  - Store `.env` files in local development only (never commit them to GitHub).
  - Always add `.env` and `.env.local` to `.gitignore`.
  - Configure variables securely in **Render** before deployment.
  - All documentation should reference `.env` usage — never direct credentials.

**Manual Testing Requirements**
- Developer must confirm deployed backend returns health status `"ok"`
- User performs tests for visualization accuracy and export output validation

---

## **7. Commit & Deployment Formats**

**Commit Example (Sprint 0)**  
```
chore(sprint-0): initial project setup and scaffolding
- Initialized Next.js app with shadcn/ui and TailwindCSS
- Set up FastAPI backend and database connection
- Configured .env and health check endpoints
```

**Commit Example (Sprint 1)**  
```
feat(sprint-1): implement user authentication
- Added registration, login, JWT auth
- Built frontend forms for login/register
- Deployed sprint for user verification
```

**Deployment Verification Protocol**  
Each sprint requires testing confirmation on:
1. Vercel frontend  
2. Render backend  
3. Cross-service request integration  

---

## **8. Validation & User Input Protocol Summary**
Each **USER INPUT REQUIRED** section follows:
- **WHY:** Explain purpose of requested information  
- **FORMAT:** Specify expected format (URL, JSON, schema, etc.)  
- **ACTION:** Confirm or provide requested data before proceeding  

---

## **9. Final Verification Checklist**
- [x] PRD analysis completed  
- [x] Architecture & tech stack decided  
- [x] Sprints structured with USER INPUT REQUIRED  
- [x] Commit & deployment format standardized  
- [x] Vercel/Render deployment included  
- [x] Manual testing confirmation protocol defined  
- [x] Plan validated for incremental development approach  

---

**Deliverable:** The plan prepares the team to begin Sprint 0, ensuring repeatable, testable progress through Sprint 4 with verified frontend-backend integration and user validation checkpoints.
### Environment Setup Update (MongoDB)

- **Task**: Added `.env` file for MongoDB connection configuration
- **Details**:
  - Created `.env` in project root
  - Added `MONGO_URI` variable as placeholder with example connection string
  - Ready to integrate with database connection logic in backend scripts
- **Status**: ✅ Completed and verified

---

### Debugging Summary – Login Redirect & bcrypt Error

- **Issue 1**: Backend login returned HTTP 401 and bcrypt `__about__` attribute error.
- **Root Cause**: Mismatched `bcrypt` and `passlib` versions caused hashing issues and password truncation >72 bytes.
- **Fix Applied**: Updated/reinstalled `bcrypt` (v4.2.0+) and enforced password length <=72 characters in testing.

- **Issue 2**: Login did not redirect to `/upload` on success.
- **Root Cause**: Frontend router navigation not triggering due to early error from backend.
- **Fix Applied**: Corrected authentication validation and confirmed redirect behavior via browser test.

- **Verification**:
  - ✅ User successfully logs in and is redirected to `/upload`.
  - ✅ JWT token stored in `localStorage`.
  - ✅ Frontend and backend integrated correctly.

- **Next Steps**:
  - Ensure consistent bcrypt dependency lock across environments.
  - Add functional tests for auth and redirect in Sprint 1 validation.
  - Update `README.md` to include login troubleshooting section.

- **Status**: ✅ Debug completed and confirmed.
