import os
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from app.core.security import require_service_key
from app.utils.data_loader import load_dataframe
from app.services.data_profiling import profile_dataset
from app.services.pandas_analysis import eda_summary
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

router = APIRouter(prefix="/ai/reports", tags=["reports"], dependencies=[Depends(require_service_key)])

class ReportRequest(BaseModel):
    storagePath: str
    fileType: str = "csv"
    title: str = "Dataset Report"

@router.post("/pdf")
async def pdf_report(req: ReportRequest):
    profile = profile_dataset(req.storagePath, req.fileType)
    df = load_dataframe(req.storagePath, req.fileType)
    eda = eda_summary(df)

    out_path = os.path.splitext(req.storagePath)[0] + "_report.pdf"
    c = canvas.Canvas(out_path, pagesize=letter)
    w, h = letter
    y = h - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, req.title); y -= 30
    c.setFont("Helvetica", 11)
    c.drawString(50, y, f"Rows: {profile['rowCount']}  Columns: {profile['columnCount']}"); y -= 20
    c.drawString(50, y, f"Missing values: {profile['missingValueCount']}  Duplicates: {profile['duplicateRowCount']}"); y -= 30
    c.drawString(50, y, "Columns:"); y -= 18
    for col in profile["columns"]:
        c.drawString(60, y, f"- {col['name']} ({col['dataType']}) missing={col['missingCount']}"); y -= 14
        if y < 60:
            c.showPage(); y = h - 50
    c.save()
    return {"filePath": out_path}