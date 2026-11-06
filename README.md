# AI-Powered Data Analytics and Predictive Intelligence Platform

A production-style full-stack platform for uploading datasets, exploring data with NumPy/Pandas, training machine-learning models, generating AI insights, and exporting reports.

## Tech Stack
- Frontend: React + TypeScript + Tailwind CSS (Vite)
- Backend: ASP.NET Core 8 (C#) + EF Core + SQL Server
- AI Service: FastAPI (Python) + NumPy + Pandas + Scikit-learn
- Auth: JWT (access + refresh), role-based (Admin/Analyst/Viewer)

## Features
- Dataset upload (CSV/XLSX), validation, profiling (missing, duplicates, dtypes, stats)
- NumPy numerical analysis (mean/median/mode/std/variance/percentiles/correlation/outliers/normalization)
- Pandas cleaning, EDA, grouping, filtering/sorting
- ML: regression, classification, clustering (Random Forest, Logistic/Linear Regression), train/test split, CV, metrics, feature importance
- Interactive dashboard with KPIs and charts
- AI insights (summary, trends, anomalies, recommendations)
- Reports (PDF/CSV/XLSX)

## Project Structure
See `docs/ARCHITECTURE.md`.

## Quick Start
See `docs/RUN.md`.

## Sample Data
`data/samples/sample_customers.csv`

## Testing
- Backend: `dotnet test src/backend/tests/Analytics.Tests.csproj`
- Python: `cd src/ai-service && pytest`
- Frontend: `cd src/frontend && npm test`

## Deployment
See `docker/docker-compose.yml` and `docs/DEPLOYMENT.md`.

## Security Notes
- Change JWT key and service key in production.
- Use HTTPS, restricted CORS, and blob storage for uploads.
- Datasets are scoped to the owning user.

## License
MIT