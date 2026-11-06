import numpy as np
import pandas as pd
from typing import Any, Dict, List
from app.utils.data_loader import load_dataframe

def infer_dtype(series: pd.Series) -> str:
    if pd.api.types.is_bool_dtype(series):
        return "Boolean"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "DateTime"
    if pd.api.types.is_numeric_dtype(series):
        return "Numeric"
    # try parse dates
    if series.dtype == object:
        try:
            pd.to_datetime(series.dropna().head(50))
            return "DateTime"
        except Exception:
            pass
    nunique = series.nunique(dropna=True)
    if nunique <= 20 or (series.dtype == object and nunique / max(len(series), 1) < 0.05):
        return "Categorical"
    return "Text"

def profile_dataset(storage_path: str, file_type: str) -> dict:
    df = load_dataframe(storage_path, file_type)
    missing_total = int(df.isna().sum().sum())
    dup = int(df.duplicated().sum())

    columns = []
    for col in df.columns:
        s = df[col]
        dtype = infer_dtype(s)
        stats = None
        if dtype == "Numeric":
            arr = s.dropna().to_numpy(dtype=float)
            if arr.size:
                q1, q3 = np.percentile(arr, [25, 75])
                iqr = q3 - q1
                lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
                oc = int(((arr < lower) | (arr > upper)).sum())
                stats = {
                    "mean": float(np.mean(arr)),
                    "median": float(np.median(arr)),
                    "std": float(np.std(arr, ddof=1)) if arr.size > 1 else 0.0,
                    "variance": float(np.var(arr, ddof=1)) if arr.size > 1 else 0.0,
                    "min": float(np.min(arr)),
                    "max": float(np.max(arr)),
                    "p25": float(np.percentile(arr, 25)),
                    "p75": float(np.percentile(arr, 75)),
                    "mode": float(pd.Series(arr).mode().iloc[0]) if not pd.Series(arr).mode().empty else None,
                    "outlierCount": oc
                }
        elif dtype == "Categorical":
            vc = s.value_counts(dropna=True)
            stats = {"topValues": vc.head(10).to_dict(), "uniqueCount": int(s.nunique(dropna=True))}

        sample = s.dropna().head(5).tolist()
        # make json serializable
        sample = [ (x.isoformat() if hasattr(x, "isoformat") else (float(x) if isinstance(x, (np.integer, np.floating)) else x)) for x in sample ]

        columns.append({
            "name": str(col),
            "dataType": dtype,
            "isNullable": bool(s.isna().any()),
            "missingCount": int(s.isna().sum()),
            "distinctCount": int(s.nunique(dropna=True)),
            "sampleValues": sample,
            "statistics": stats
        })

    return {
        "rowCount": int(len(df)),
        "columnCount": int(len(df.columns)),
        "missingValueCount": missing_total,
        "duplicateRowCount": dup,
        "columns": columns
    }