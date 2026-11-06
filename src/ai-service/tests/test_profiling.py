import pandas as pd
import numpy as np
from app.services.data_profiling import profile_dataset
import tempfile, os

def test_profile_basic():
    df = pd.DataFrame({"a": [1,2,3,4,5], "b": ["x","y","x",None,"y"]})
    path = os.path.join(tempfile.gettempdir(), "t.csv")
    df.to_csv(path, index=False)
    res = profile_dataset(path, "csv")
    assert res["rowCount"] == 5
    assert res["columnCount"] == 2
    assert res["missingValueCount"] == 1
    assert len(res["columns"]) == 2