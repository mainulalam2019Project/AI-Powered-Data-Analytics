import os
import json
from fastapi import APIRouter, Depends
from app.core.security import require_service_key
from app.utils.data_loader import load_dataframe
from app.services.pandas_analysis import clean_dataframe, eda_summary, filter_sort
from app.services.numpy_analysis import numerical_summary, normalize
from app.schemas.analysis import AnalysisRequest

router = APIRouter(prefix="/ai/analysis", tags=["analysis"], dependencies=[Depends(require_service_key)])

@router.post("/run")
async def run(req: AnalysisRequest):
    params = req.parameters or {}
    op = req.operation

    if op == "profile":
        from app.services.data_profiling import profile_dataset
        return profile_dataset(req.storagePath, params.get("fileType", "csv"))

    if op == "eda":
        ft = params.get("fileType", "csv")
        df = load_dataframe(req.storagePath, ft)
        return {"eda": eda_summary(df), "numerical": numerical_summary(df)}

    if op == "clean":
        ft = params.get("fileType", "csv")
        df = load_dataframe(req.storagePath, ft)
        strategy = params.get("strategy", "drop")
        cols = params.get("columns")
        cleaned = clean_dataframe(df, strategy=strategy, columns=cols)
        # save cleaned
        base, ext = os.path.splitext(req.storagePath)
        out_path = f"{base}_cleaned{ext}"
        if ft in ("xlsx", "xls"):
            cleaned.to_excel(out_path, index=False)
        else:
            cleaned.to_csv(out_path, index=False)
        return {"cleanedPath": out_path, "originalRows": len(df), "cleanedRows": len(cleaned), "eda": eda_summary(cleaned)}

    if op == "normalize":
        ft = params.get("fileType", "csv")
        df = load_dataframe(req.storagePath, ft)
        cols = params.get("columns", [])
        method = params.get("method", "standard")
        out_df = normalize(df, cols, method)
        base, ext = os.path.splitext(req.storagePath)
        out_path = f"{base}_normalized{ext}"
        if ft in ("xlsx", "xls"):
            out_df.to_excel(out_path, index=False)
        else:
            out_df.to_csv(out_path, index=False)
        return {"outputPath": out_path, "rows": len(out_df)}

    if op == "filter":
        ft = params.get("fileType", "csv")
        df = load_dataframe(req.storagePath, ft)
        filtered = filter_sort(df, filters=params.get("filters"), sort_by=params.get("sortBy"), ascending=params.get("ascending", True), limit=params.get("limit"))
        return {"rows": filtered.to_dict(orient="records"), "count": len(filtered)}

    return {"error": f"Unknown operation {op}"}