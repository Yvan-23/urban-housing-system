# Urban Housing Analysis & Policy Simulation System
## UML Design & Architecture Diagrams (PlantUML)

This document contains a set of 6 professionally styled and syntactically validated **PlantUML** diagrams that accurately map out both the **Frontend** and **Backend** architectures of your Final Year Project. Each diagram includes modern, cohesive styling matching enterprise software design standards.

---

## 1. Use Case Diagram
### Description
This diagram describes the functional requirements and system boundaries. It highlights the relationships between user roles (**System Administrator**, **Urban Planner/Analyst**, and **System User**) and the core features they interact with:
*   **Authentication & MFA**: Secured JWT-based login, MFA, and password recovery.
*   **Ingestion & Data Management**: Uploading and parsing CSV datasets, filtering housing records.
*   **Policy Simulation**: Executing custom policy parameters, calculating growth/sustainability indices, and persisting scenarios.
*   **Collaboration & Auditing**: Sharing workspaces, active discussion threads, task delegation, and monitoring administrative logs.

### PlantUML Code
```plantuml
@startuml "Use Case Diagram"
skinparam rankdir LR
skinparam linetype ortho
skinparam roundcorner 10
skinparam shadowing false
skinparam handwritten false

' Theme Colors (Sleek Slate/Blue)
skinparam Usecase {
    BackgroundColor #F7FAFC
    BorderColor #3182CE
    BorderThickness 1.5
    FontColor #2D3748
    FontSize 12
    FontName "Inter", "Arial"
}

skinparam Actor {
    BackgroundColor #EDF2F7
    BorderColor #4A5568
    BorderThickness 1.5
    FontColor #2D3748
    FontSize 12
    FontName "Inter", "Arial"
}

skinparam Rectangle {
    BackgroundColor #FFFFFF
    BorderColor #CBD5E0
    BorderThickness 1
    FontColor #1A202C
    FontName "Inter", "Arial"
}

skinparam Arrow {
    Color #4A5568
    Thickness 1.2
}

left to right direction

actor "System User" as User
actor "Urban Planner / Analyst" as Planner
actor "System Administrator" as Admin

Planner --|> User
Admin --|> User

rectangle "Urban Housing & Policy Simulation System" {
    ' Auth Cases
    usecase "Register & Login\n(JWT Authentication)" as UC_Auth
    usecase "Perform Multi-Factor\nAuthentication (MFA)" as UC_Mfa
    usecase "Reset Password" as UC_Reset
    
    ' Data Ingestion
    usecase "Browse & Filter\nHousing Records" as UC_ViewHousing
    usecase "Ingest Dataset\n(CSV Upload)" as UC_Upload
    
    ' Spatial Map
    usecase "View GIS Spatial\nDensity Maps" as UC_ViewGis
    
    ' Policy Simulation
    usecase "Run Policy Simulation\nScenario" as UC_Simulate
    usecase "Save & Delete Scenarios" as UC_ManageScenario
    usecase "View Analytics & Forecasts\n(Demand vs Supply)" as UC_Analytics
    
    ' Collaboration
    usecase "Manage Collaboration Workspaces" as UC_Workspace
    usecase "Assign & Update Tasks" as UC_Tasks
    usecase "Comment on Discussion Threads" as UC_Comment
    
    ' Reports
    usecase "Generate Ad-hoc Reports\n(PDF, Excel, PPT)" as UC_Report
    
    ' System Admin
    usecase "View System Audit Logs" as UC_Audit
    usecase "Perform User Management\n(Lock, Assign Roles)" as UC_UserMgmt
    usecase "Monitor System KPIs" as UC_Monitor
}

' Auth relations
User --> UC_Auth
UC_Auth <.. UC_Mfa : <<extend>>
User --> UC_Reset

' Housing / GIS relations
User --> UC_ViewHousing
User --> UC_ViewGis
Planner --> UC_Upload

' Simulation / Analytics relations
Planner --> UC_Simulate
Planner --> UC_ManageScenario
User --> UC_Analytics

' Collaboration relations
User --> UC_Workspace
User --> UC_Tasks
User --> UC_Comment

' Reports relations
User --> UC_Report

' Admin relations
Admin --> UC_Audit
Admin --> UC_UserMgmt
Admin --> UC_Monitor

@endum
```

---

## 2. Class Diagram
### Description
This diagram represents the structural architecture of the **Spring Boot backend** package namespaces (`entity`, `repository`, `controller`). It shows:
1.  **JPA Entities**: All data models (`User`, `HousingData`, `Workspace`, `Scenario`, `Kpi`, etc.) with their variables, annotations, custom logic methods, and relationships.
2.  **Spring Data JPA Repositories**: Interfaces extending database persistence functions.
3.  **Controllers**: Rest API entry points handling user requests, file uploads, and simulation calculations.
4.  **Relationships**: Strong associations (`createdBy`, `assignedTo`) and dependency flows mapping how components bind together.

### PlantUML Code
```plantuml
@startuml "Class Diagram"
skinparam linetype ortho
skinparam roundcorner 8
skinparam shadowing false
skinparam handwritten false

skinparam Class {
    BackgroundColor #F7FAFC
    BorderColor #2B6CB0
    BorderThickness 1.5
    HeaderBackgroundColor #2B6CB0
    HeaderFontColor #FFFFFF
    FontColor #2D3748
    FontSize 11
    AttributeFontSize 9
    MethodFontSize 9
}

skinparam Package {
    BackgroundColor #EDF2F7
    BorderColor #A0AEC0
}

skinparam Arrow {
    Color #4A5568
    Thickness 1.2
}

package com.urban.housing.entity {
    class User {
        + UUID id
        + String name
        + String email
        + String password
        + String role
        + String department
        + String organization
        + String phone
        + boolean isLocked
        + boolean isMfaEnabled
        + String mfaSecret
        + int failedLoginAttempts
        + String otpCode
        + LocalDateTime otpExpiry
        + String resetToken
        + LocalDateTime resetTokenExpiry
    }

    class HousingData {
        + UUID id
        + String title
        + String address
        + String city
        + String district
        + String propertyType
        + Double price
        + String status
        + Integer bedrooms
        + Integer bathrooms
        + Integer areaSqFt
        + LocalDateTime createdAt
        + Integer datasetVersion
        + Integer getUnits()
        + Double getVacancyRate()
        + String getLastUpdated()
    }

    class Workspace {
        + UUID id
        + String name
        + String description
        + LocalDateTime createdAt
        + User createdBy
        + String getOwner()
        + Integer getMembers()
    }

    class Comment {
        + UUID id
        + String workspaceId
        + String user
        + String role
        + String text
        + String timestamp
    }

    class Task {
        + UUID id
        + String title
        + String description
        + LocalDate dueDate
        + String status
        + LocalDateTime createdAt
        + User assignedTo
    }

    class Scenario {
        + UUID id
        + String name
        + String description
        + String parameters
        + String results
        + String status
        + LocalDateTime createdAt
        + User createdBy
    }

    class Kpi {
        + UUID id
        + String name
        + String category
        + String district
        + Double actualValue
        + Double targetValue
        + String unit
        + Scenario scenario
    }

    class EtlJob {
        + UUID id
        + String sourceName
        + LocalDateTime startedAt
        + LocalDateTime completedAt
        + Integer recordsProcessed
        + String status
        + String errorDetails
    }

    class Report {
        + UUID id
        + String code
        + String title
        + String format
        + String createdDate
        + String generatedBy
    }

    class AuditLog {
        + UUID id
        + String action
        + String module
        + String details
        + String ipAddress
        + LocalDateTime timestamp
        + User user
    }
}

package com.urban.housing.repository {
    interface UserRepository
    interface HousingDataRepository
    interface WorkspaceRepository
    interface CommentRepository
    interface TaskRepository
    interface ScenarioRepository
    interface KpiRepository
    interface EtlJobRepository
    interface ReportRepository
    interface AuditLogRepository
}

package com.urban.housing.controller {
    class AuthController {
        + ResponseEntity login(LoginRequest)
        + ResponseEntity register(RegisterRequest)
        + ResponseEntity refresh(String)
        + ResponseEntity resetPassword(String, String)
    }

    class HousingController {
        + ResponseEntity getHousingData(String)
        + ResponseEntity uploadDataset(MultipartFile, String)
    }

    class PolicyController {
        + ResponseEntity getAllScenarios()
        + ResponseEntity runSimulation(Map, Authentication)
        + ResponseEntity getSimulationResult(UUID)
        + ResponseEntity deleteScenario(UUID)
    }

    class CollaborationController {
        + ResponseEntity getWorkspaces()
        + ResponseEntity createWorkspace(Map, Authentication)
        + ResponseEntity getComments(String)
        + ResponseEntity createComment(Map, Authentication)
    }
}

' Entity relationships
Workspace "0..*" --> "1" User : createdBy
Task "0..*" --> "1" User : assignedTo
Scenario "0..*" --> "1" User : createdBy
Kpi "0..*" --> "1" Scenario : scenario
AuditLog "0..*" --> "1" User : user

' Controller dependencies on Repositories
AuthController ..> UserRepository
HousingController ..> HousingDataRepository
PolicyController ..> ScenarioRepository
CollaborationController ..> WorkspaceRepository
CollaborationController ..> CommentRepository

@endum
```

---

## 3. Sequence Diagram (Policy Simulation)
### Description
This sequence diagram shows the step-by-step transaction flow when an **Urban Planner** executes a **Policy Simulation**. It traces:
1.  **Frontend trigger**: Captures parameters and dispatches a Redux store action.
2.  **API Gateway & Security**: Attaches the JWT Bearer token via Axios interceptors, validates it through the `JwtRequestFilter` on the backend, and loads the user identity.
3.  **Simulation Engine & Persist**: Calculates the values (`deficit`, `infrastructure cost`, `sustainability index`), builds the entity, and saves it to the **PostgreSQL** database.
4.  **UI Feedback**: Sends the persisted JSON entity back to update the React state and update dynamic analytical graphs.

### PlantUML Code
```plantuml
@startuml "Sequence Diagram - Policy Simulation"
skinparam ParticipantPadding 10
skinparam BoxPadding 10
skinparam roundcorner 8
skinparam shadowing false
skinparam handwritten false

' Color themes
skinparam Sequence {
    ArrowColor #2B6CB0
    LifeLineBorderColor #4A5568
    LifeLineBackgroundColor #EDF2F7
    
    ParticipantBackgroundColor #F7FAFC
    ParticipantBorderColor #2B6CB0
    ParticipantFontColor #2D3748
    ParticipantFontName "Inter", "Arial"
    
    BoxBackgroundColor #EDF2F7
    BoxBorderColor #CBD5E0
    BoxFontColor #4A5568
}

actor "Urban Planner" as Planner

box "Frontend Client (React/Redux)" #EDF2F7
    participant "PolicySimulation.jsx" as View
    participant "api.js (Axios)" as Axios
    participant "simulationSlice" as Store
end box

box "Backend API Gateway & Security" #E2E8F0
    participant "JwtRequestFilter" as Filter
    participant "JwtTokenUtil" as Jwt
end box

box "Backend Core Services" #E2E8F0
    participant "PolicyController" as Controller
    participant "ScenarioRepository" as ScenarioRepo
    participant "UserRepository" as UserRepo
end box

database "PostgreSQL" as DB

== Phase 1: Authentication & Simulation Request ==
Planner -> View : Inputs parameters (growthRate, budget, ecoFriendly)\nand clicks "Run Simulation"
activate View

View -> Store : dispatch(runSimulation(payload))
activate Store

Store -> Axios : post("/api/policy/simulate", payload)
activate Axios

note over Axios: Axios interceptor attaches\nJWT Token: Bearer [token]

Axios -> Filter : HTTP POST /api/policy/simulate
activate Filter

== Phase 2: Token Validation & Context Setup ==

Filter -> Jwt : getUsernameFromToken(token)
activate Jwt
Jwt --> Filter : email (admin@urbanai.gov)
deactivate Jwt

Filter -> Filter : validateToken & setAuthenticationContext()
Filter -> Controller : Forward request with Authentication Context
activate Controller

== Phase 3: Mathematical Simulation & DB Persistence ==

Controller -> Controller : Parse parameters:\n- growthRate: 3.5%\n- budget: $150M\n- ecoFriendly: true
Controller -> Controller : Run algorithm to calculate:\n- housingDeficitReduction\n- requiredInfrastructure\n- sustainabilityIndex

Controller -> UserRepo : findByEmail("admin@urbanai.gov")
activate UserRepo
UserRepo -> DB : SELECT * FROM users WHERE email = ...
DB --> UserRepo : User object
UserRepo --> Controller : Current User (System Admin)
deactivate UserRepo

Controller -> Controller : Build Scenario Entity\n(status: "Completed")

Controller -> ScenarioRepo : save(scenario)
activate ScenarioRepo
ScenarioRepo -> DB : INSERT INTO scenarios (...)
activate DB
DB --> ScenarioRepo : Saved Scenario Entity
deactivate DB
ScenarioRepo --> Controller : Saved Scenario Entity
deactivate ScenarioRepo

Controller --> Filter : HTTP 200 OK (Scenario JSON)
deactivate Controller
Filter --> Axios : HTTP 200 OK (Scenario JSON)
deactivate Filter
Axios --> Store : Resolve Promise (Scenario JSON)
deactivate Axios
Store -> Store : Update state.scenarios
Store --> View : State updated
deactivate Store

View -> Planner : Render beautiful dashboard charts\nand success message
deactivate View

@endum
```

---

## 4. Activity Diagram (Data Ingestion & CSV ETL)
### Description
This diagram maps out the transactional workflow of the **ETL (Extract, Transform, Load)** pipeline when uploading external CSV housing data. It displays conditional checkpaths (e.g. empty file error checks), parsing loops, database transactions, and final UI rendering.

### PlantUML Code
```plantuml
@startuml "Activity Diagram - Ingestion"
skinparam roundcorner 10
skinparam shadowing false
skinparam handwritten false

skinparam Activity {
    BackgroundColor #F7FAFC
    BorderColor #2B6CB0
    ArrowColor #4A5568
    FontColor #2D3748
    FontName "Inter", "Arial"
}

skinparam StartEnd {
    BackgroundColor #4A5568
    BorderColor #4A5568
}

skinparam Partition {
    BackgroundColor #F7FAFC
    BorderColor #CBD5E0
}

partition "Frontend" {
    start
    :Select CSV file in HousingRepository.jsx;
    :Click "Upload Dataset" button;
    :Axios posts MultipartFile to /api/housing/upload;
}

partition "Backend (HousingController)" {
    :Receive request & file stream;
    if (Is the uploaded file empty?) then (yes)
        :Log error & return 400 Bad Request;
        partition "Frontend" {
            :Display error notification: "Please upload a file";
            end
        }
    else (no)
        :Initialize records array;
        :Open BufferedReader with InputStreamReader;
        :Read first line (CSV Header);
        while (Has more lines in CSV?) is (yes)
            :Read next line;
            :Split columns by regex (comma-separated with quote escapes);
            if (Line has at least 5 valid columns?) then (yes)
                :Parse columns:
                - title = values[0] (clean quotes)
                - price = values[1] (double)
                - district = values[2]
                - propertyType = values[3]
                - status = values[4];
                :Build HousingData entity;
                :Add record to records list;
            else (no)
                :Skip line (log warning);
            endif
        endwhile (no)
        
        :housingDataRepository.saveAll(records);
        partition "Database" {
            :Persist records in housing_data table;
        }
        :Return 200 OK with list of saved records;
    endif
}

partition "Frontend" {
    :Dispatch uploadDataset action to Redux store;
    :Update state.records & state.datasets;
    :Refresh Dashboard counts & GIS map indicators;
    :Show toast: "Dataset uploaded & ingested successfully";
    stop
}
@endum
```

---

## 5. Database Diagram (ERD)
### Description
An exact schema representation of your **PostgreSQL** relational database. It charts:
*   Primary Keys (PK) and Foreign Keys (FK).
*   Data Types (`UUID`, `VARCHAR`, `DOUBLE PRECISION`, `TIMESTAMP`, `BOOLEAN`, `TEXT`).
*   Database Table Constraints (e.g. Unique emails).
*   Relational Cardinality (one-to-many relationships matching JPA annotations).

### PlantUML Code
```plantuml
@startuml "Database ERD"
!theme plain
skinparam roundcorner 8
skinparam shadowing false
skinparam handwritten false
skinparam linetype ortho

skinparam class {
    BackgroundColor #FFFFFF
    BorderColor #2B6CB0
    ArrowColor #2B6CB0
    HeaderBackgroundColor #2B6CB0
    HeaderFontColor #FFFFFF
    FontName "Inter", "Arial"
}

entity "users" as users {
    * id : UUID <<PK>>
    --
    * name : VARCHAR(255)
    * email : VARCHAR(255) <<unique>>
    * password : VARCHAR(255)
    * role : VARCHAR(50)
    department : VARCHAR(255)
    organization : VARCHAR(255)
    phone : VARCHAR(50)
    * is_locked : BOOLEAN
    * is_mfa_enabled : BOOLEAN
    mfa_secret : VARCHAR(255)
    * failed_login_attempts : INT
    otp_code : VARCHAR(50)
    otp_expiry : TIMESTAMP
    reset_token : VARCHAR(255)
    reset_token_expiry : TIMESTAMP
}

entity "housing_data" as housing_data {
    * id : UUID <<PK>>
    --
    * title : VARCHAR(255)
    address : VARCHAR(255)
    city : VARCHAR(100)
    district : VARCHAR(100)
    property_type : VARCHAR(50)
    price : DOUBLE PRECISION
    status : VARCHAR(50)
    bedrooms : INT
    bathrooms : INT
    area_sq_ft : INT
    created_at : TIMESTAMP
    dataset_version : INT
}

entity "workspaces" as workspaces {
    * id : UUID <<PK>>
    --
    * name : VARCHAR(255)
    description : TEXT
    created_at : TIMESTAMP
    created_by : UUID <<FK -> users.id>>
}

entity "comments" as comments {
    * id : UUID <<PK>>
    --
    * workspace_id : VARCHAR(255) <<FK-ish>>
    * user_name : VARCHAR(255)
    role : VARCHAR(100)
    * text : TEXT
    timestamp : VARCHAR(50)
}

entity "tasks" as tasks {
    * id : UUID <<PK>>
    --
    * title : VARCHAR(255)
    description : TEXT
    due_date : DATE
    status : VARCHAR(50)
    created_at : TIMESTAMP
    assigned_to : UUID <<FK -> users.id>>
}

entity "scenarios" as scenarios {
    * id : UUID <<PK>>
    --
    * name : VARCHAR(255)
    description : TEXT
    parameters : TEXT
    results : TEXT
    status : VARCHAR(50)
    created_at : TIMESTAMP
    created_by : UUID <<FK -> users.id>>
}

entity "kpis" as kpis {
    * id : UUID <<PK>>
    --
    * name : VARCHAR(255)
    category : VARCHAR(100)
    district : VARCHAR(100)
    actual_value : DOUBLE PRECISION
    target_value : DOUBLE PRECISION
    unit : VARCHAR(50)
    scenario_id : UUID <<FK -> scenarios.id>>
}

entity "etl_jobs" as etl_jobs {
    * id : UUID <<PK>>
    --
    * source_name : VARCHAR(255)
    started_at : TIMESTAMP
    completed_at : TIMESTAMP
    records_processed : INT
    status : VARCHAR(50)
    error_details : TEXT
}

entity "reports" as reports {
    * id : UUID <<PK>>
    --
    code : VARCHAR(50)
    title : VARCHAR(255)
    format : VARCHAR(50)
    created_date : VARCHAR(50)
    generated_by : VARCHAR(255)
}

entity "audit_logs" as audit_logs {
    * id : UUID <<PK>>
    --
    * action : VARCHAR(255)
    module : VARCHAR(100)
    details : TEXT
    ip_address : VARCHAR(50)
    timestamp : TIMESTAMP
    user_id : UUID <<FK -> users.id>>
}

' Defining Relationships
users ||--o{ workspaces : "created_by"
users ||--o{ tasks : "assigned_to"
users ||--o{ scenarios : "created_by"
users ||--o{ audit_logs : "user_id"
scenarios ||--o{ kpis : "scenario_id"

@endum
```

---

## 6. System Architecture Design
### Description
A multi-tier architecture mapping showing how client-side components interact with secure gateway boundaries and persistent backend micro-segments:
1.  **Client Browser Tier (Frontend)**: Structured React application, using Redux slices to coordinate localized data state, and Axios to pipe outbound HTTP calls.
2.  **Ingress & Security Gateway**: Intercepts REST boundaries, using Spring Security filters to process stateless JWT tokens and block unauthenticated operations.
3.  **Application Service Tier**: Handles all computational calculations, file reads, and session processing.
4.  **Database Tier (Persistence)**: A PostgreSQL server containing individual tables seeded with municipal data.

### PlantUML Code
```plantuml
@startuml "System Architecture"
skinparam linetype ortho
skinparam roundcorner 8
skinparam shadowing false
skinparam handwritten false

skinparam Rectangle {
    BackgroundColor #FFFFFF
    BorderColor #A0AEC0
    Thickness 1.2
}

skinparam Node {
    BackgroundColor #F7FAFC
    BorderColor #4A5568
}

' Theme styling
skinparam Database {
    BackgroundColor #FFFFFF
    BorderColor #2B6CB0
}

skinparam Component {
    BackgroundColor #EDF2F7
    BorderColor #2B6CB0
    FontColor #2D3748
}

node "Client Browser Tier (Frontend)" as Client {
    rectangle "Single Page Application (React)" {
        component [Routing & Layouts\n(React Router Dom / App.jsx)] as Router
        component [Dashboard Pages\n(Analytics, GIS, PolicySim)] as Pages
        component [Redux Toolkit Store\n(Auth, Simulation, Repos Slices)] as Store
        component [Axios Client\n(JWT Interceptor / api.js)] as Axios
        
        Router --> Pages
        Pages --> Store : dispatch actions
        Store --> Axios : fetch/sync data
    }
}

node "Security & Ingress Gateway" as Gateway {
    component [Spring Security Configuration] as Security
    component [JWT Request Filter\n(Authentication Filter)] as JwtFilter
    
    Security --> JwtFilter : applies rules
}

node "Application Server Tier (Spring Boot Backend)" as AppServer {
    rectangle "Rest API Controllers" {
        component [AuthController] as AuthCtrl
        component [HousingController\n(CSV Parser / Ingestion)] as HousingCtrl
        component [PolicyController\n(Simulation Engine)] as PolicyCtrl
        component [GISController] as GisCtrl
        component [CollaborationController] as CollabCtrl
        component [UserController] as UserCtrl
    }
    
    rectangle "Spring Data JPA Repositories" as Repos {
        component [UserRepository] as UserRepo
        component [HousingDataRepository] as HousingRepo
        component [ScenarioRepository] as ScenarioRepo
        component [WorkspaceRepository] as WorkspaceRepo
        component [CommentRepository] as CommentRepo
        component [AuditLogRepository] as AuditRepo
    }
    
    AuthCtrl --> UserRepo
    HousingCtrl --> HousingRepo
    PolicyCtrl --> ScenarioRepo
    CollabCtrl --> WorkspaceRepo
    CollabCtrl --> CommentRepo
    UserCtrl --> UserRepo
}

node "Persistence Database Tier" as DatabaseTier {
    database "PostgreSQL Database\n(urban_housing_db)" as DB {
        folder "Relational Tables" {
            [users]
            [housing_data]
            [scenarios]
            [workspaces]
            [comments]
            [tasks]
            [kpis]
            [reports]
            [audit_logs]
            [etl_jobs]
        }
    }
}

' Connecting Tier Nodes
Axios --> Gateway : HTTP REST Requests (JWT in Auth Header)
JwtFilter --> AppServer : Authorizes & Forwards
Repos --> DB : JDBC / Hibernate ORM (SQL Statements)

@endum
```
