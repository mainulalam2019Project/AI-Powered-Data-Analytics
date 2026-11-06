import numpy as np
import pandas as pd
from typing import Any, Dict, List

def numerical_summary(df: pd.DataFrame, columns: List[str] = None) -> Dict[str, Any]:
    if columns is None:
        columns = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    out = {}
    for c in columns:
        arr = df[c].dropna().to_numpy(dtype=float)
        if arr.size == 0:
            out[c] = None
            continue
        q1, q3 = np.percentile(arr, [25, 75])
        iqr = q3 - q1
        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
        outliers = [float(x) for x in arr if x < lower or x > upper]
        out[c] = {
            "count": int(arr.size),
            "mean": float(np.mean(arr)),
            "median": float(np.median(arr)),
            "mode": float(pd.Series(arr).mode().iloc[0]) if not pd.Series(arr).mode().empty else None,
            "std": float(np.std(arr, ddof=1)) if arr.size > 1 else 0.0,
            "variance": float(np.var(arr, ddof=1)) if arr.size > 1 else 0.0,
            "min": float(np.min(arr)),
            "max": float(np.max(arr)),
            "p25": float(np.percentile(arr, 25)),
            "p50": float(np.percentile(arr, 50)),
            "p75": float(np.percentile(arr, 75)),
            "p95": float(np.percentile(arr, 95)),
            "p99": float(np.percentile(arr, 99)),
            "outlierCount": len(outliers),
            "outliers": outliers[:50]
        }
    # correlation matrix
    num_df = df[columns].apply(pd.to_numeric, errors="coerce")
    corr = num_df.corr()
    corr_dict = {r: {c: (None if pd.isna(v) else float(v)) for c, v in row.items()} for r, row in corr.iterrows()}
    return {"columns": out, "correlation": corr_dict}

def normalize(df: pd.DataFrame, columns: List[str], method: str = "standard") -> pd.DataFrame:
    df = df.copy()
    for c in columns:
        arr = df[c].astype(float)
        if method == "standard":
            mu, sd = arr.mean(), arr.std(ddof=0)
            df[c] = (arr - mu) / (sd if sd != 0 else 1)
        elif method == "minmax":
            mn, mx = arr.min(), arr.max()
            df[c] = (arr - mn) / ((mx - mn) if (mx - mn) != 0 else 1)
        elif method == "robust":
            med = arr.median()
            q1, q3 = arr.quantile(0.25), arr.quantile(0.75)
            iqr = q3 - q1
            df[c] = (arr - med) / (iqr if iqr != 0 else 1)
    return df