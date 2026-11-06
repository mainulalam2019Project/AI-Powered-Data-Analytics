namespace Analytics.Domain.Enums;

public enum DatasetStatus { Uploaded, Profiled, Cleaned, Failed }
public enum DataType { Numeric, Categorical, DateTime, Boolean, Text }
public enum AnalysisType { Profile, EDA, Cleaning, Correlation }
public enum TaskType { Regression, Classification, Clustering }
public enum ModelStatus { Training, Ready, Failed }
public enum ReportFormat { Pdf, Csv, Xlsx, Png }
public enum RoleName { Admin, Analyst, Viewer }