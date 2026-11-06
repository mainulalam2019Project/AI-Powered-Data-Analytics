import pandas as pd
import numpy as np
from typing import Any, Dict, List

def generate_insights(profile: dict, eda: dict) -> Dict[str, Any]:
    summary_parts = []
    trends = []
    anomalies = []
    recommendations = []

    shape = eda.get("shape", [0, 0])
    summary_parts.append(f"Dataset contains {shape[0]} rows and {shape[1]} columns.")

    missing = eda.get("missingByColumn", {})
    total_missing = sum(missing.values())
    if total_missing > 0:
        worst = max(missing, key=lambda k: missing[k]) if missing else None
        summary_parts.append(f"There are {total_missing} missing values; '{worst}' has the most.")
        recommendations.append("Consider imputing or removing rows with missing values before modeling.")
    else:
        summary_parts.append("No missing values detected.")

    num_cols = eda.get("numericColumns", [])
    cat_cols = eda.get("categoricalColumns", [])
    summary_parts.append(f"Numeric columns: {len(num_cols)}; categorical/text: {len(cat_cols)}.")

    # trend detection: correlation strong pairs
    # recompute corr from profile? Use eda describe not enough. We'll add simple trend heuristics.
    # Anomalies: outlier counts from profile columns
    for c in profile.get("columns", []):
        if c.get("dataType") == "Numeric":
            st = c.get("statistics") or {}
            oc = st.get("outlierCount", 0) if isinstance(st, dict) else 0
            if oc and oc > 0:
                anomalies.append(f"Column '{c['name']}' has {oc} potential outliers (IQR method).")
            # skewness hint
            mean = st.get("mean"); med = st.get("median")
            if mean is not None and med is not None and abs(mean - med) > (st.get("std") or 1) * 0.5:
                trends.append(f"Column '{c['name']}' appears skewed (mean != median).")

    # recommendations based on data
    if len(num_cols) >= 2:
        recommendations.append("Multiple numeric features available — regression or clustering may be suitable.")
    if any(eda.get("missingByColumn", {}).values()):
        recommendations.append("Handle missing values before training models.")
    if len(cat_cols) > 0:
        recommendations.append("Encode categorical variables (one-hot) for ML models.")

    # group insights trends
    for gi in eda.get("groupInsights", []):
        groups = gi.get("groups", [])
        if len(groups) >= 2:
            # find max/min group by mean
            try:
                key = "mean"
                sortedg = sorted(groups, key=lambda g: g.get(key, 0))
                trends.append(f"Group '{sortedg[-1].get(gi['column'])}' has highest average {gi['metric']}.")
            except Exception:
                pass

    return {
        "summary": " ".join(summary_parts),
        "trends": trends,
        "anomalies": anomalies,
        "recommendations": recommendations
    }