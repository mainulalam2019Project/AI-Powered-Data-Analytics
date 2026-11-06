import os
import joblib
import numpy as np
import pandas as pd
from typing import Any, Dict, List, Optional, Tuple
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold, KFold
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.cluster import KMeans
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    silhouette_score
)

MODEL_DIR = os.environ.get("AI_MODEL_DIR", "models")
os.makedirs(MODEL_DIR, exist_ok=True)

def _split_features(df, feature_cols, target_col=None):
    X = df[feature_cols].copy()
    y = df[target_col].copy() if target_col else None
    num_cols = [c for c in feature_cols if pd.api.types.is_numeric_dtype(df[c])]
    cat_cols = [c for c in feature_cols if c not in num_cols]
    return X, y, num_cols, cat_cols

def build_preprocessor(num_cols, cat_cols):
    num_pipe = Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())])
    cat_pipe = Pipeline([("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))])
    return ColumnTransformer([("num", num_pipe, num_cols), ("cat", cat_pipe, cat_cols)], remainder="drop")

def train(storage_path, file_type, task_type, algorithm, target_col, feature_cols) -> Dict[str, Any]:
    from app.utils.data_loader import load_dataframe
    df = load_dataframe(storage_path, file_type)
    df = df.dropna(subset=feature_cols + ([target_col] if target_col else []))
    if len(df) < 20:
        raise ValueError("Not enough rows after cleaning.")

    X, y, num_cols, cat_cols = _split_features(df, feature_cols, target_col)
    pre = build_preprocessor(num_cols, cat_cols)

    if task_type == "Clustering":
        model = KMeans(n_clusters=int(algorithm.split("_")[-1]) if "_" in algorithm else 3, random_state=42, n_init="auto")
        pipe = Pipeline([("pre", pre), ("model", model)])
        pipe.fit(X)
        labels = pipe.predict(X)
        sil = float(silhouette_score(pre.fit_transform(X), labels)) if len(set(labels)) > 1 else 0.0
        artifact = os.path.join(MODEL_DIR, f"model_{id(pipe)}.joblib")
        joblib.dump(pipe, artifact)
        return {"metrics": {"silhouette": sil, "nClusters": int(len(set(labels)))}, "featureImportance": None, "artifactPath": artifact}

    # supervised
    is_clf = task_type == "Classification"
    if algorithm == "RandomForest":
        est = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1) if is_clf else RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    elif algorithm == "LogisticRegression":
        est = LogisticRegression(max_iter=1000)
    elif algorithm == "LinearRegression":
        est = LinearRegression()
    else:
        est = RandomForestClassifier(n_estimators=200, random_state=42) if is_clf else RandomForestRegressor(n_estimators=200, random_state=42)

    pipe = Pipeline([("pre", pre), ("model", est)])

    # encode target for classification if non-numeric
    le = None
    if is_clf and not pd.api.types.is_numeric_dtype(y):
        le = LabelEncoder()
        y = le.fit_transform(y.astype(str))

    # split BEFORE fitting (no leakage; pipeline fits preprocessor on train only)
    stratify = y if is_clf and len(set(y)) > 1 and min(pd.Series(y).value_counts()) >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=stratify)

    pipe.fit(X_train, y_train)
    pred = pipe.predict(X_test)

    metrics: Dict[str, Any] = {}
    if is_clf:
        metrics["accuracy"] = float(accuracy_score(y_test, pred))
        try:
            metrics["precision"] = float(precision_score(y_test, pred, average="weighted", zero_division=0))
            metrics["recall"] = float(recall_score(y_test, pred, average="weighted", zero_division=0))
            metrics["f1"] = float(f1_score(y_test, pred, average="weighted", zero_division=0))
        except Exception:
            pass
        # CV
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42) if stratify is not None else KFold(n_splits=5, shuffle=True, random_state=42)
        try:
            cv_scores = cross_val_score(pipe, X, y, cv=cv, scoring="accuracy")
            metrics["cvMean"] = float(cv_scores.mean())
            metrics["cvStd"] = float(cv_scores.std())
        except Exception:
            pass
    else:
        metrics["mae"] = float(mean_absolute_error(y_test, pred))
        metrics["rmse"] = float(np.sqrt(mean_squared_error(y_test, pred)))
        metrics["r2"] = float(r2_score(y_test, pred))
        cv = KFold(n_splits=5, shuffle=True, random_state=42)
        try:
            cv_scores = cross_val_score(pipe, X, y, cv=cv, scoring="r2")
            metrics["cvMean"] = float(cv_scores.mean())
            metrics["cvStd"] = float(cv_scores.std())
        except Exception:
            pass

    # feature importance
    fi = None
    try:
        m = pipe.named_steps["model"]
        if hasattr(m, "feature_importances_"):
            # map back through preprocessor feature names
            pre_fitted = pipe.named_steps["pre"]
            try:
                names = pre_fitted.get_feature_names_out()
            except Exception:
                names = feature_cols
            importances = m.feature_importances_
            # aggregate one-hot back to original feature
            agg = {c: 0.0 for c in feature_cols}
            for name, imp in zip(names, importances):
                # name like num__Age or cat__Color_Red
                base = name.split("__", 1)[-1]
                matched = None
                for c in feature_cols:
                    if base == c or base.startswith(c + "_"):
                        matched = c
                        break
                if matched:
                    agg[matched] += float(imp)
            fi = agg
        elif hasattr(m, "coef_"):
            coefs = np.abs(m.coef_).ravel() if m.coef_.ndim > 1 else np.abs(m.coef_)
            pre_fitted = pipe.named_steps["pre"]
            try:
                names = pre_fitted.get_feature_names_out()
            except Exception:
                names = feature_cols
            agg = {c: 0.0 for c in feature_cols}
            for name, imp in zip(names, coefs):
                base = name.split("__", 1)[-1]
                matched = None
                for c in feature_cols:
                    if base == c or base.startswith(c + "_"):
                        matched = c
                        break
                if matched:
                    agg[matched] += float(imp)
            # normalize
            total = sum(agg.values()) or 1
            fi = {k: v / total for k, v in agg.items()}
    except Exception:
        fi = None

    artifact = os.path.join(MODEL_DIR, f"model_{os.urandom(6).hex()}.joblib")
    joblib.dump({"pipeline": pipe, "label_encoder": le, "feature_cols": feature_cols, "target_col": target_col, "task_type": task_type}, artifact)

    return {"metrics": metrics, "featureImportance": fi, "artifactPath": artifact}

def predict(storage_path, file_type, artifact_path, rows):
    bundle = joblib.load(artifact_path)
    pipe = bundle["pipeline"]
    le = bundle["label_encoder"]
    feature_cols = bundle["feature_cols"]
    task_type = bundle["task_type"]

    # build dataframe from rows
    input_df = pd.DataFrame(rows)
    # ensure all feature cols present
    for c in feature_cols:
        if c not in input_df.columns:
            input_df[c] = np.nan
    X = input_df[feature_cols]
    preds = pipe.predict(X)
    if le is not None:
        preds = le.inverse_transform(preds.astype(int))
    preds_list = [ (float(x) if isinstance(x, (np.integer, np.floating)) else (x.item() if hasattr(x, "item") else x)) for x in preds ]

    # explanation: per-feature contribution approx via feature importance + value
    explanation = {"featureImportance": None}
    try:
        pre = pipe.named_steps["pre"]
        m = pipe.named_steps["model"]
        if hasattr(m, "feature_importances_"):
            explanation["note"] = "Feature importance from trained model (global)."
    except Exception:
        pass

    return {"predictions": preds_list, "explanation": explanation}