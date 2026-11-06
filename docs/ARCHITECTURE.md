# AI-Powered Data Analytics and Predictive Intelligence Platform

## 1. System Overview

The platform is a three-tier web application with a dedicated AI microservice:

```
┌────────────────────────────┐
│  React + TS + Tailwind     │  (SPA, browser)
│  Dashboard / Charts        │
└────────────┬───────────────┘
             │ HTTPS / REST (JWT)
┌────────────▼───────────────┐
│  ASP.NET Core Web API      │  (C#, Clean Architecture)
│  Auth, Users, Projects,     │
│  Datasets metadata, Reports │
└────┬──────────────┬────────┘
     │ EF Core       │ HttpClient (service token)
┌────▼────┐   ┌─────▼──────────────┐
│ SQL     │   │ FastAPI (Python)   │
│ Server  │   │ NumPy/Pandas/Sklearn│
└─────────┘   └─────┬──────────────┘
                    │ shared file storage
                    ▼
            ┌───────────────┐
            │  Uploads /    │
            │  Artifacts    │
            └───────────────┘
```

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite, Recharts/Plotly, Axios, React Router, React Query |
| Backend API | ASP.NET Core 8, C#, EF Core 8, SQL Server, JWT Bearer, FluentValidation, Serilog, AutoMapper |
| AI Service | Python 3.11, FastAPI, Uvicorn, NumPy, Pandas, Scikit-learn, Matplotlib, Seaborn, Plotly, Pydantic |
| Database | SQL Server (LocalDB / full) |
| Auth | JWT (access + refresh), role-based (Admin, Analyst, Viewer) |
| Storage | Local filesystem in dev, Azure Blob / S3 in prod (abstracted) |
| Testing | xUnit + Moq (backend), pytest (python), Vitest + RTL (frontend) |
| DevOps | Docker, docker-compose, GitHub Actions |

## 3. Main Modules

### 3.1 Frontend (`src/frontend`)
- `app/` – routing, providers, layout shell
- `components/` – reusable UI primitives (Button, Card, Modal, Table, Chart wrappers)
- `features/` – feature slices: auth, dashboard, datasets, analytics, ml, insights, reports
- `hooks/` – custom React hooks (useAuth, useDataset, usePolling)
- `lib/` – utilities, formatters, validators
- `services/` – typed API clients (axios instances)
- `types/` – TypeScript interfaces mirroring backend DTOs
- `styles/` – Tailwind config, global CSS

### 3.2 Backend (`src/backend`)
Clean Architecture layers:
- `Domain/` – entities, value objects, domain interfaces, enums (no dependencies)
- `Application/` – DTOs, use-case services, validators, mapping profiles, interfaces for infra
- `Infrastructure/` – EF Core DbContext, repositories, file storage, FastAPI HTTP client, identity
- `WebApi/` – controllers, middleware (exception, logging), DI composition, Program.cs

### 3.3 AI Service (`src/ai-service`)
- `app/api/` – FastAPI routers (datasets, analysis, ml, insights, reports, health)
- `app/core/` – config, security (service token), logging
- `app/models/` – domain models / DB (optional, stateless preferred)
- `app/schemas/` – Pydantic request/response models
- `app/services/` – business logic: data_processing, numpy_analysis, pandas_analysis, ml_pipeline, evaluation, insights, report_generation
- `app/utils/` – file io, validation, plotting helpers

## 4. Data Flow

### 4.1 Upload & Profile
1. User selects CSV/XLSX in React → `POST /api/datasets` (multipart) to ASP.NET Core.
2. Backend validates extension/MIME/size, saves file to storage, creates `Dataset` row (status=Uploaded).
3. Backend calls FastAPI `POST /ai/datasets/profile` with file reference + datasetId.
4. FastAPI (NumPy/Pandas): detect dtypes, missing values, duplicates, numerical/categorical columns, basic stats.
5. FastAPI returns profile JSON → backend persists `AnalysisResult` (type=Profile) → frontend renders preview + KPIs.

### 4.2 Analysis
1. User requests cleaning/EDA → backend → FastAPI `/ai/analysis/run` (operations list).
2. FastAPI cleans data (missing handling, dedup, normalization), computes EDA, generates chart specs (Plotly JSON).
3. Results + cleaned file path returned; backend stores metadata; frontend renders charts.

### 4.3 Machine Learning
1. User picks target + model type → backend → FastAPI `/ai/ml/train`.
2. FastAPI: split train/test (stratified), preprocess (pipelines, no leakage), train RF/LogReg/LinearReg, CV, metrics, feature importance.
3. Model artifact saved; metrics returned; backend stores `MLModel` row.
4. Prediction: `POST /ai/ml/predict` with rows → returns predictions + explanations (SHAP-ish feature contributions).

### 4.4 Insights & Reports
- Insights: FastAPI generates textual summary + trend/anomaly detection → stored.
- Reports: FastAPI/Backend generate PDF (ReportLab or QuestPDF) and CSV/XLSX exports.

## 5. Database Design (high level)

Entities: `Users`, `Roles`, `UserRoles`, `Projects`, `Datasets`, `DatasetColumns`, `AnalysisResults`, `MLModels`, `Predictions`, `Reports`, `AuditLogs`.

Relationships:
- User 1..* Project
- Project 1..* Dataset
- Dataset 1..* DatasetColumn
- Dataset 1..* AnalysisResult
- Dataset 1..* MLModel
- MLModel 1..* Prediction
- User 1..* Report

Full schema in Phase 2.

## 6. Security

- JWT access (short-lived) + refresh token rotation.
- Role-based authorization policies.
- File validation: extension allow-list, MIME check, size limit, virus scan hook (optional).
- Dataset ownership checks (user can only access own datasets unless Admin).
- Service-to-service auth: shared secret / mTLS in prod; API key header in dev.
- Secrets via environment variables / .NET User Secrets / Key Vault.
- CORS restricted to frontend origin.
- Rate limiting on upload & ML endpoints.
- SQL injection prevented by EF Core parameterized queries.

## 7. ML Best Practices (no leakage)

- All preprocessing (imputation, scaling, encoding) fit ONLY on training split via sklearn Pipelines.
- Train/test split before any transformation.
- Cross-validation uses pipeline so folds are clean.
- Feature importance computed on held-out data where applicable.
- Stratified splits for classification; time-aware split if date column present.

## 8. Folder Structure

```
AI-Powered-Data-Analytics-Platform/
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   └── DEPLOYMENT.md
├── src/
│   ├── frontend/                 # React + TS + Tailwind
│   │   ├── public/
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── features/
│   │       ├── hooks/
│   │       ├── lib/
│   │       ├── services/
│   │       ├── types/
│   │       └── styles/
│   ├── backend/                  # ASP.NET Core (Clean Arch)
│   │   ├── src/
│   │   │   ├── Domain/
│   │   │   ├── Application/
│   │   │   ├── Infrastructure/
│   │   │   └── WebApi/
│   │   └── tests/
│   └── ai-service/               # FastAPI
│       ├── app/
│       │   ├── api/
│       │   ├── core/
│       │   ├── models/
│       │   ├── schemas/
│       │   ├── services/
│       │   └── utils/
│       ├── tests/
│       └── requirements.txt
├── data/
│   └── samples/
├── docker/
│   ├── docker-compose.yml
│   └── Dockerfiles
└── scripts/
```

## 9. Workflow Summary

1. User authenticates (JWT).
2. Creates a Project.
3. Uploads dataset → profile generated.
4. Explores EDA dashboard + filters.
5. Runs cleaning/transformations.
6. Trains ML model (with CV + metrics).
7. Generates predictions + explanations.
8. Reviews AI insights.
9. Exports reports (PDF/CSV/XLSX/charts).

## 10. Next Phases

- Phase 2: SQL Server schema + EF Core migrations.
- Phase 3: ASP.NET Core backend implementation.
- Phase 4: NumPy/Pandas processing.
- Phase 5: ML pipelines.
- Phase 6: FastAPI service + integration.
- Phase 7: React dashboard.
- Phase 8: Auth, validation, testing, error handling.
- Phase 9: Local run guide.
- Phase 10: Deployment, docs, samples, README.