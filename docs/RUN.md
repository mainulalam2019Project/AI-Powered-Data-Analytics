# Local Run Guide

## Prerequisites
- .NET 8 SDK
- Python 3.11+
- Node.js 20+
- SQL Server (LocalDB or full) — or use Docker compose
- Visual Studio 2022 / VS Code

## 1. AI Service (FastAPI)
```bash
cd src/ai-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 2. Backend (ASP.NET Core)
```bash
cd src/backend
# update connection string in src/WebApi/appsettings.json if needed
dotnet ef database update --project src/Infrastructure --startup-project src/WebApi
dotnet run --project src/WebApi
# API at http://localhost:5000, Swagger at /swagger
```

## 3. Frontend (React)
```bash
cd src/frontend
npm install
npm run dev
# http://localhost:5173
```

## 4. Docker (optional)
```bash
docker compose -f docker/docker-compose.yml up --build
```

## Default flow
1. Register a user (gets Analyst role).
2. Create a project.
3. Upload CSV/XLSX.
4. View dataset profile, analytics, train ML, insights.