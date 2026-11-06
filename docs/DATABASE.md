# Database Design — SQL Server

## 1. Entities & Relationships

```
Users (1) ──< Projects (1) ──< Datasets (1) ──< DatasetColumns
                                      │
                                      ├──< AnalysisResults
                                      ├──< MLModels (1) ──< Predictions
                                      └──< Reports
Users (1) ──< Reports
Users (m) ──< UserRoles >── (m) Roles
Users (1) ──< AuditLogs
```

## 2. Tables

### Users
| Column | Type | Constraints |
|---|---|---|
| Id | uniqueidentifier | PK, default newid() |
| Email | nvarchar(256) | NOT NULL, UNIQUE |
| PasswordHash | nvarchar(512) | NOT NULL |
| FullName | nvarchar(200) | NOT NULL |
| IsActive | bit | NOT NULL default 1 |
| CreatedAt | datetime2 | NOT NULL |
| UpdatedAt | datetime2 | NULL |

### Roles
| Id | uniqueidentifier PK |
| Name | nvarchar(50) UNIQUE NOT NULL |

### UserRoles (composite PK UserId, RoleId)

### Projects
| Id uniqueidentifier PK |
| UserId FK Users NOT NULL |
| Name nvarchar(200) NOT NULL |
| Description nvarchar(1000) NULL |
| CreatedAt datetime2 NOT NULL |

### Datasets
| Id uniqueidentifier PK |
| ProjectId FK Projects NOT NULL |
| UserId FK Users NOT NULL |
| Name nvarchar(256) NOT NULL |
| OriginalFileName nvarchar(512) NOT NULL |
| StoragePath nvarchar(1024) NOT NULL |
| FileType nvarchar(20) NOT NULL (csv/xlsx) |
| FileSizeBytes bigint NOT NULL |
| Status nvarchar(30) NOT NULL (Uploaded/Profiled/Cleaned/Failed) |
| RowCount int NULL |
| ColumnCount int NULL |
| MissingValueCount int NULL |
| DuplicateRowCount int NULL |
| CreatedAt datetime2 NOT NULL |
| UpdatedAt datetime2 NULL |

### DatasetColumns
| Id uniqueidentifier PK |
| DatasetId FK Datasets NOT NULL |
| Name nvarchar(256) NOT NULL |
| DataType nvarchar(30) NOT NULL (Numeric/Categorical/DateTime/Boolean/Text) |
| IsNullable bit NOT NULL |
| MissingCount int NOT NULL |
| DistinctCount int NULL |
| SampleValues nvarchar(max) NULL (JSON) |
| Statistics nvarchar(max) NULL (JSON) |

### AnalysisResults
| Id uniqueidentifier PK |
| DatasetId FK Datasets NOT NULL |
| Type nvarchar(50) NOT NULL (Profile/EDA/Cleaning/Correlation) |
| Payload nvarchar(max) NOT NULL (JSON) |
| CreatedAt datetime2 NOT NULL |

### MLModels
| Id uniqueidentifier PK |
| DatasetId FK Datasets NOT NULL |
| UserId FK Users NOT NULL |
| Name nvarchar(200) NOT NULL |
| TaskType nvarchar(30) NOT NULL (Regression/Classification/Clustering) |
| Algorithm nvarchar(50) NOT NULL |
| TargetColumn nvarchar(256) NULL |
| FeatureColumns nvarchar(max) NOT NULL (JSON array) |
| Metrics nvarchar(max) NULL (JSON) |
| FeatureImportance nvarchar(max) NULL (JSON) |
| ArtifactPath nvarchar(1024) NULL |
| Status nvarchar(30) NOT NULL (Training/Ready/Failed) |
| CreatedAt datetime2 NOT NULL |

### Predictions
| Id uniqueidentifier PK |
| ModelId FK MLModels NOT NULL |
| InputPayload nvarchar(max) NOT NULL (JSON) |
| Result nvarchar(max) NOT NULL (JSON) |
| Explanation nvarchar(max) NULL (JSON) |
| CreatedAt datetime2 NOT NULL |

### Reports
| Id uniqueidentifier PK |
| UserId FK Users NOT NULL |
| DatasetId FK Datasets NULL |
| ModelId FK MLModels NULL |
| Title nvarchar(256) NOT NULL |
| Format nvarchar(20) NOT NULL (Pdf/Csv/Xlsx/Png) |
| FilePath nvarchar(1024) NOT NULL |
| CreatedAt datetime2 NOT NULL |

### AuditLogs
| Id bigint IDENTITY PK |
| UserId uniqueidentifier NULL |
| Action nvarchar(100) NOT NULL |
| Entity nvarchar(100) NULL |
| EntityId nvarchar(100) NULL |
| Details nvarchar(max) NULL |
| IpAddress nvarchar(64) NULL |
| CreatedAt datetime2 NOT NULL |

## 3. Indexes
- Users.Email (unique)
- Projects.UserId
- Datasets.ProjectId, Datasets.UserId
- MLModels.DatasetId
- Predictions.ModelId
- AuditLogs.UserId, AuditLogs.CreatedAt

## 4. EF Core
Code-first with migrations. Configuration via Fluent API in `Infrastructure/Persistence/Configurations`. Seed roles (Admin, Analyst, Viewer) and an admin user on first run (dev only).