# Deployment Guide

## Docker Compose (recommended for staging)
```bash
cd docker
docker compose up --build -d
```
Services: SQL Server, FastAPI (8000), ASP.NET Core (5000), frontend (5173 via nginx).

## Production recommendations
- Host frontend on CDN/static hosting (Vercel/Netlify/S3+CloudFront).
- Backend on Azure App Service / AWS ECS / Kubernetes.
- AI service on container with GPU optional; scale horizontally.
- SQL Server on Azure SQL / RDS.
- File storage: Azure Blob / S3; update `IFileStorage` implementation.
- Secrets: Azure Key Vault / AWS Secrets Manager; never commit keys.
- Enable HTTPS, HSTS, rate limiting, and WAF.
- Run EF migrations as part of CI/CD (`dotnet ef database update`).
- Add Application Insights / OpenTelemetry for observability.