import pandas as pd
import os

def load_dataframe(storage_path: str, file_type: str) -> pd.DataFrame:
    if file_type.lower() in ("xlsx", "xls"):
        return pd.read_excel(storage_path)
    return pd.read_csv(storage_path)