# Pure Milk Bar — Dairy ERP: Team Task Allocation & Engineering Workflow

> **Project Hub:** Pure Milk Bar Dairy Business Management System  
> **Team Topology:** 5 Engineers (1 Full-Stack Lead, 2 Backend, 2 Frontend)  
> **Integration Branch:** dev  
> **Effective Date:** September 8, 2026  
> **Architecture Mode:** 100% Online Real-Time Synchronous (Zero Offline Caching)  

---

## 1. Team Module Assignment Table

This table defines the module ownership, responsibilities, and deliverables for each team member:

| Member Name | Role | Modules | Detailed Responsibilities | Deliverables |
| :--- | :--- | :--- | :--- | :--- |
| **Abdul Wahab** | **Backend Developer** | Farm, Suppliers, Inventory, POS | • Develop Farm & Cattle Management APIs<br>• Implement Milk Procurement intake & FAT/LR lab calculations<br>• Bulk Tank & Dairy Inventory Management<br>• Synchronous Retail POS Counter Sales & Live Inventory Deduction APIs<br>• Implement instant stock deduction & inventory valuation<br>• Implement business logic using provided schemas (Animal, MilkingYieldLog, Supplier, MilkProcurement, Product, Order)<br>• Optimize database queries & compound indexing | • Farm module APIs<br>• Supplier module APIs<br>• Inventory module APIs<br>• POS module APIs<br>• Procurement APIs<br>• Sales Order APIs |
| **Nabeel** | **Backend Developer** | Auth, Admin, Customers, Deliveries, Finance | • Develop Authentication & Token Rotation APIs (JWT, bcrypt)<br>• Customer CRUD, credit limit & balance tracking<br>• Delivery Route Scheduling & Fleet Fuel Logging (ADR-002)<br>• Double-Entry Khata Accounting & Aging Engine<br>• Nightly 23:59 Daily Closing & Cash Audit Engine<br>• System Security Audit Logging Interceptor<br>• Implement business logic using provided schemas (User, Customer, DeliveryRun, VehicleFuelLog, KhataEntry, DailyClosing, AuditLog)<br>• Enforce multi-document ACID transactions | • Auth module APIs<br>• Customer module APIs<br>• Delivery module APIs<br>• Finance & Khata module APIs<br>• Daily Closing module APIs<br>• Audit Trail module |
| **Farman** | **Frontend Developer** | Farm, Suppliers, Inventory, POS, Dashboard | • Design & develop Cattle Registry & Milking shift entry views<br>• Build Supplier Dock Reception UI with live FAT% / LR calculator<br>• Implement Product Catalog & Bulk Chilling Tank level UI<br>• Build Cashier POS Counter Terminal with barcode scanning & cart<br>• Implement synchronous POS Cart with direct live stock validation and real-time network connection guard<br>• Develop Executive Command Center Dashboard with Recharts telemetry, cold tank visual gauges & KPI cards<br>• Build thermal receipt print triggers & modal dialogs<br>• Connect frontend services to Wahab's Backend APIs | • Farm module UI (7 views)<br>• Supplier module UI (7 views)<br>• Inventory module UI (2 views)<br>• POS module UI (2 views)<br>• Dashboard module UI (1 view)<br>• Real-time POS Connection Guard |
| **Mustafa** | **Frontend Developer** | Auth, Customers, Deliveries, Finance, Closing, Reports | • Build Login & Shift Selection screens with protected route guards<br>• Customer Directory, Khata Statement of Accounts & Aging UI<br>• Implement Delivery Dispatch Run Sheets with ADR-002 inline fuel dialog<br>• Build End-of-Day Daily Closing screen with variance threshold alerts<br>• Build WhatsApp statement share triggers & NOC certificate generator<br>• Build System Reports, Audit Log & User RBAC screens<br>• Connect frontend services to Nabeel's Backend APIs | • Auth module UI (1 view)<br>• Customer module UI (2 views)<br>• Delivery module UI (2 views)<br>• Finance & Khata module UI (3 views)<br>• Daily Closing UI (1 view)<br>• Reports & Governance UI (4 views) |
| **Lead Developer (You)** | **Full-Stack Lead** | Core Architecture, Infrastructure, Design System, Git Governance | • Define overall system architecture and clean standards<br>• Build and maintain core Express server pipeline (pp.js, db.js, server.js)<br>• Mount feature routers in server/src/app.js<br>• Build centralized Axios client with JWT auto-refresh in client/src/services/apiClient.js<br>• Build and maintain client AppShell, layout, and routing (AppLayout.jsx, AppRoutes.jsx)<br>• Build shared atomic UI primitives (components/ui/)<br>• Review all Pull Requests and manage merges on dev<br>• Enforce database indexing, schema validation, and zero secret leaks<br>• Conduct end-to-end integration testing across Track A and Track B | • Core Server Pipeline<br>• Core Client Layout Shell<br>• Centralized API Client<br>• Shared UI Design System<br>• PR Review & Integration on dev |

---

## 2. Specific Module Directory Breakdown

`	ext
E:\SMIT\BootCamp\DairyMilkFarm\
├── client/src/features/
│   ├── farm/               <--- Farman (Frontend)
│   ├── suppliers/          <--- Farman (Frontend)
│   ├── inventory/          <--- Farman (Frontend)
│   ├── pos/                <--- Farman (Frontend)
│   ├── dashboard/          <--- Farman (Frontend)
│   ├── auth/               <--- Mustafa (Frontend)
│   ├── customers/          <--- Mustafa (Frontend)
│   ├── deliveries/         <--- Mustafa (Frontend)
│   ├── finance/            <--- Mustafa (Frontend)
│   └── reports/            <--- Mustafa (Frontend)
│
└── server/src/modules/
    ├── farm/               <--- Abdul Wahab (Backend)
    ├── suppliers/          <--- Abdul Wahab (Backend)
    ├── inventory/          <--- Abdul Wahab (Backend)
    ├── pos/                <--- Abdul Wahab (Backend)
    ├── auth/               <--- Nabeel (Backend)
    ├── admin/              <--- Nabeel (Backend)
    ├── customers/          <--- Nabeel (Backend)
    ├── deliveries/         <--- Nabeel (Backend)
    └── finance/            <--- Nabeel (Backend)
`

---

## 3. Mongoose Schemas Status (server/src/models/) — [COMPLETED & AUDITED]

All 13 production Mongoose schemas are verified and compile with 100% pass rate (
ode -c):

### Abdul Wahab (Backend):
1. Animal.model.js — Cattle ear tags, lactation cycles, health status [VERIFIED]
2. MilkingYieldLog.model.js — Milking shifts, daily yields, fat %, compound unique index [VERIFIED]
3. Supplier.model.js — Milk sourcer profiles, base rates, current balance [VERIFIED]
4. MilkProcurement.model.js — Batch intake, FAT %, LR hydrometer, Richmond SNF calculation [VERIFIED]
5. Product.model.js — Retail selling price, cost price, current stock, alerts [VERIFIED]
6. Order.model.js — Synchronous POS sales receipts, real-time inventory deduction, payment tenders [VERIFIED]

### Nabeel (Backend):
1. User.model.js — Staff credentials, roles (ADMIN, CASHIER, RIDER), shifts, toJSON transform [VERIFIED]
2. Customer.model.js — Customer accounts, credit limits, khata balance [VERIFIED]
3. DeliveryRun.model.js — Morning/evening home delivery routes, bottle returns, COD [VERIFIED]
4. VehicleFuelLog.model.js — Rider inline fuel logging per ADR-002 linked to DeliveryRun [VERIFIED]
5. KhataEntry.model.js — Immutable double-entry running balance ledger, compound index [VERIFIED]
6. DailyClosing.model.js — 23:59 milk mass-balance & cash drawer closing [VERIFIED]
7. AuditLog.model.js — Append-only administrative and financial audit trails [VERIFIED]

---

## 4. Phase 2 Immediate Development Tasks

### 4.1 Abdul Wahab (Backend)
- [ ] **Farm Controller & Routes** (modules/farm/):
  - Implement nimal.controller.js for CRUD operations with ear tag validation.
  - Implement milkingYield.controller.js with duplicate shift check via { animalId, date, shift }.
  - Expose GET /api/v1/farm/animals, POST /api/v1/farm/animals, POST /api/v1/farm/yield.
- [ ] **Procurement Dock Controller & Routes** (modules/suppliers/):
  - Implement supplier.controller.js for sourcer management.
  - Implement procurement.controller.js enforcing Richmond formula: SNF = (LR/4) + (0.21 * FAT) + 0.36.
  - Calculate rate per liter dynamically and update supplier currentPayableBalance.
  - Expose GET /api/v1/suppliers, POST /api/v1/suppliers, POST /api/v1/procurement/intake.
- [ ] **Inventory Controller & Routes** (modules/inventory/):
  - Implement product.controller.js for catalog items and stock updates.
  - Expose GET /api/v1/inventory/products, POST /api/v1/inventory/products, GET /api/v1/inventory/tanks.
- [ ] **Real-Time POS Checkout API** (modules/pos/):
  - Implement order.controller.js wrapping order creation and stock deduction in a MongoDB transaction session (client.startSession()).
  - Auto-generate sequential eceiptNumber and handle cash tender calculations.
  - Expose POST /api/v1/pos/orders, GET /api/v1/pos/orders.

### 4.2 Nabeel (Backend)
- [ ] **Auth & RBAC Middleware** (modules/auth/):
  - Implement uth.controller.js with bcrypt password hashing and JWT token issuance.
  - Implement protect and estrictTo('ADMIN', 'MANAGER', 'CASHIER', 'RIDER') middlewares.
  - Expose POST /api/v1/auth/login, POST /api/v1/auth/refresh, GET /api/v1/auth/me.
- [ ] **Customer Accounts API** (modules/customers/):
  - Implement customer.controller.js managing credit limits and customer master directory.
  - Expose GET /api/v1/customers, POST /api/v1/customers, GET /api/v1/customers/:id.
- [ ] **ADR-002 Atomic Delivery & Fuel Booking** (modules/deliveries/):
  - Implement delivery.controller.js with atomic single-endpoint transaction creating both DeliveryRun and VehicleFuelLog.
  - Expose POST /api/v1/deliveries/booking, GET /api/v1/deliveries, PATCH /api/v1/deliveries/:id/status.
- [ ] **Double-Entry Khata & Aging Engine** (modules/finance/):
  - Implement khata.controller.js calculating immutable running balances: Balance_n = Balance_{n-1} + Debit - Credit.
  - Implement 4-bucket aging query: Current (0-15d), 16-30d, 31-60d, 60+d.
  - Expose GET /api/v1/khata/:customerId/statement, GET /api/v1/khata/aging, POST /api/v1/expenses.
- [ ] **Daily Closing Mass Balance Engine** (modules/admin/):
  - Implement closing.controller.js calculating theoretical mass balance and checking against physical tank dipstick reading.
  - Enforce strict \pm 1.0L tolerance lock.
  - Expose POST /api/v1/closing/reconcile, GET /api/v1/closing/history.

### 4.3 Farman (Frontend)
- [ ] **Executive Dashboard Feature** (client/src/features/dashboard/):
  - Migrate Dashboard.tsx from prototype.
  - Connect KPI cards (Daily Milk, Revenue, Receivables, P&L) and cold tank visual gauges.
  - Integrate Recharts telemetry for live mass-balance inflow vs outflow.
- [ ] **Real-Time POS Counter** (client/src/features/pos/):
  - Migrate POS.tsx and Sales.tsx.
  - Build useOnlineStatus connection guard displaying a live status badge and disabling checkout if offline.
  - Connect cart checkout directly to Wahab's POST /api/v1/pos/orders.
  - Build ESC/POS thermal receipt print trigger.
- [ ] **Farm Operations Views** (client/src/features/farm/):
  - Migrate Animals.tsx, YieldEntry.tsx, FarmDashboard.tsx, FarmMilkLogs.tsx, FarmExpenses.tsx, FarmPnL.tsx, FarmProfiles.tsx.
  - Connect YieldEntry.tsx to POST /api/v1/farm/yield.
- [ ] **Milk Procurement Dock Views** (client/src/features/suppliers/):
  - Migrate Procurement.tsx with live hydrometer FAT/LR calculator.
  - Connect dock intake submission to POST /api/v1/procurement/intake.
  - Migrate Suppliers.tsx, SupplierDashboard.tsx, SupplierMilkLogs.tsx, SupplierExpenses.tsx, SupplierPnL.tsx, SupplierProfiles.tsx.
- [ ] **Inventory & Tank Levels** (client/src/features/inventory/):
  - Migrate Products.tsx and Inventory.tsx.

### 4.4 Mustafa (Frontend)
- [ ] **Authentication Gateway** (client/src/features/auth/):
  - Migrate Login.tsx with terminal and shift selection.
  - Implement auth state store (token persistence, role navigation).
- [ ] **Customer Khata & Aging Views** (client/src/features/customers/, client/src/features/finance/):
  - Migrate Customers.tsx, Khata.tsx, ReceivablesAging.tsx, Expenses.tsx, Payments.tsx.
  - Connect running balance statement to Nabeel's GET /api/v1/khata/:customerId/statement.
  - Build WhatsApp statement share modal formatting customer statement templates.
- [ ] **Fleet Logistics & Dispatch** (client/src/features/deliveries/):
  - Migrate Deliveries.tsx run sheets and status lanes.
  - Migrate DeliveryForm.tsx (ADR-002 unified booking dialog with collapsible inline fuel inputs).
  - Connect to POST /api/v1/deliveries/booking.
- [ ] **End-of-Day Reconciliation** (client/src/features/closing/):
  - Migrate DailyClosing.tsx with theoretical vs physical mass balance formula.
  - Build green (<= \pm 1.0L) and red (> \pm 1.0L) tolerance indicator with supervisor override code modal.
- [ ] **Governance & Reports** (client/src/features/reports/):
  - Migrate Reports.tsx, ExportCSVModal.tsx, AuditLog.tsx, Users.tsx, Settings.tsx.

### 4.5 Full-Stack Lead (The User)
- [ ] **Core Express Pipeline**: Mount module routers under /api/v1/* in server/src/app.js.
- [ ] **Client API Client**: Build client/src/services/apiClient.js with Axios interceptors for JWT bearer token injection and 401 refresh loop.
- [ ] **App Shell & Layout**: Maintain AppLayout.jsx, Sidebar.jsx, and atomic design primitives in client/src/components/ui/.
- [ ] **PR Review & Integration**: Gate all merges on dev branch with zero unindexed queries, zero mock fallbacks, and zero secret leaks.

---

## 5. Git Collaboration Workflow

### Feature Branch Naming:
* **Abdul Wahab:** eat/wahab-farm, eat/wahab-suppliers, eat/wahab-inventory, eat/wahab-pos
* **Nabeel:** eat/nabeel-auth, eat/nabeel-customers, eat/nabeel-deliveries, eat/nabeel-finance, eat/nabeel-admin
* **Farman:** eat/farman-farm, eat/farman-suppliers, eat/farman-inventory, eat/farman-pos, eat/farman-dashboard
* **Mustafa:** eat/mustafa-auth, eat/mustafa-customers, eat/mustafa-deliveries, eat/mustafa-finance, eat/mustafa-closing

### Rules for the Team:
1. Always start from git checkout dev && git pull origin dev.
2. Work exclusively within your assigned feature/module directory.
3. Do not modify shared root files (pp.js, server.js, AppRoutes.jsx, AppLayout.jsx) on feature branches.
4. Rebase against dev before opening a Pull Request: git pull --rebase origin dev.