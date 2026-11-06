import pandas as pd
import numpy as np
from typing import Any, Dict, List, Optional

def clean_dataframe(df: pd.DataFrame, strategy: str = "drop", columns: Optional[List[str]] = None) -> pd.DataFrame:
    df = df.copy()
    cols = columns or list(df.columns)
    if strategy == "drop":
        df = df.dropna(subset=cols)
    elif strategy == "mean":
        for c in cols:
            if pd.api.types.is_numeric_dtype(df[c]):
                df[c] = df[c].fillna(df[c].mean())
    elif strategy == "median":
        for c in cols:
            if pd.api.types.is_numeric_dtype(df[c]):
                df[c] = df[c].fillna(df[c].median())
    elif strategy == "mode":
        for c in cols:
            m = df[c].mode()
            if not m.empty:
                df[c] = df[c].fillna(m.iloc[0])
    elif strategy == "ffill":
        df[cols] = df[cols].ffill()
    elif strategy == "bfill":
        df[cols] = df[cols].bfill()
    # dedup
    df = df.drop_duplicates()
    return df

def eda_summary(df: pd.DataFrame) -> Dict[str, Any]:
    num_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    cat_cols = [c for c in df.columns if c not in num_cols]
    summary = {
        "shape": [int(df.shape[0]), int(df.shape[1])],
        "missingByColumn": {c: int(df[c].isna().sum()) for c in df.columns},
        "dtypes": {c: str(df[c].dtype) for c in df.columns},
        "numericColumns": num_cols,
        "categoricalColumns": cat_cols,
        "describe": df.describe(include="all").fillna("").to_dict() if len(df) else {},
    }
    # groupby example: if a categorical with <=10 unique and a numeric, aggregate
    group_insights = []
    for cat in cat_cols:
        if df[cat].nunique(dropna=True) <= 10 and num_cols:
            g = df.groupby(cat)[num_cols[0]].agg(["mean", "count"]).reset_index()
            group_insights.append({"column": cat, "metric": num_cols[0], "groups": g.to_dict(orient="records")})
    summary["groupInsights"] = group_insights
    return summary

def filter_sort(df: pd.DataFrame, filters: Dict[str, Any] = None, sort_by: Optional[str] = None, ascending: bool = True, limit: Optional[int] = None) -> pd.DataFrame:
    if filters:
        for k, v in filters.items():
            if k in df.columns:
                if isinstance(v, list):
                    df = df[df[k].isin(v)]
                elif isinstance(v, dict):
                    if "min" in v: df = df[df[k] >= v["min"]]
                    if "max" in v: df = df[df[k] <= v["max"]]
                else:
                    df = df[df[k] == v]
    if sort_by and sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=ascending)
    if limit:
        df = df.head(limit)
    return df