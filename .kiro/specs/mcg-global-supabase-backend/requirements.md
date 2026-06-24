# Requirements Document

## Introduction

MCG Global is a multi-tenant B2B sourcing and logistics platform built on Next.js (App Router) and Supabase. Today the application renders five persona dashboards (Admin, Importer/Buyer, Supplier/Manufacturer, Logistics/Driver, Warehouse Host) and a public Home Page entirely from hardcoded mock arrays under `lib/**/data.ts`. There is no synchronized, authoritative data store, so onboarding, approvals, sourcing requests, quotations, deals, and shipment tracking never persist or propagate between personas.

This feature delivers a production-grade relational backend and refactors the codebase to run on it. It has three layers:

1. **Backend schema (single source of truth)** — a monolithic, idempotent PostgreSQL `schema.sql` for the Supabase SQL Editor that defines custom enums, strictly-foreign-keyed tables, an auth-to-profile mirroring trigger, and Row Level Security (RLS) policies.
2. **Live interconnected loops** — replacing mock arrays with live async Supabase calls across three closed loops: the onboarding/approval funnel (Loop A), the RFQ → Quotation → Deal pipeline (Loop B), and real-time WebSocket synchronization (Loop C).
3. **Strict integration correctness** — App Router data-layer wiring (SSR with HTTP-only cookies on Vercel), elimination of dead code and `any` types, closed routing/authorization gaps, and preservation of the existing brand visuals (Deep Dark Blue `#0F172A` backdrop, Vibrant Accent Orange `#F97316` for metrics, progress, and tags).

The existing scaffolding already provides `supabase/schema.sql` (profiles only), `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `.env.local.example`, `lib/auth/roles.ts`, and `lib/auth/useSession.ts`. This feature extends the schema to the full domain model and grounds all dashboard data flows in it.

## Glossary

- **Platform**: The MCG Global Next.js + Supabase application as a whole.
- **Schema_Script**: The monolithic, idempotent `supabase/schema.sql` file executed in the Supabase SQL Editor to provision the entire backend.
- **Auth_Service**: Supabase native authentication (`auth.users`), the source of identity.
- **Profile_Trigger**: The `SECURITY DEFINER` trigger function on `auth.users` that mirrors a new registration into `public.profiles`.
- **Profile**: A row in `public.profiles`, extending an `auth.users` record with platform role and verification status.
- **Platform_Role**: The `platform_role` enum value of a Profile: `BUYER`, `SUPPLIER`, `DRIVER`, `WAREHOUSE_HOST`, or `SUPER_ADMIN`.
- **Verification_Status**: The `verification_status` enum value of a Profile: `PENDING`, `APPROVED`, or `REJECTED`.
- **Commercial_Account**: A Profile whose Platform_Role is `SUPPLIER`, `DRIVER`, or `WAREHOUSE_HOST` (accounts that require admin verification before public visibility).
- **Buyer**: A Profile whose Platform_Role is `BUYER` (also referred to as Importer in the UI).
- **Supplier**: A Profile whose Platform_Role is `SUPPLIER`.
- **Driver**: A Profile whose Platform_Role is `DRIVER`.
- **Warehouse_Host**: A Profile whose Platform_Role is `WAREHOUSE_HOST`.
- **Super_Admin**: A Profile whose Platform_Role is `SUPER_ADMIN`, holding full read/write authority across all tables.
- **RLS**: PostgreSQL Row Level Security, enforced on every public table.
- **Product**: A row in `public.products`, owned by a Supplier.
- **Warehouse**: A row in `public.warehouses`, owned by a Warehouse_Host.
- **Driver_Metadata**: A row in `public.drivers_metadata`, owned 1:1 by a Driver Profile.
- **RFQ**: A Request For Quotation; a row in `public.rfqs` created by a Buyer.
- **Quotation**: A row in `public.quotations`; a Supplier's offer against an RFQ.
- **Deal**: A row in `public.deals`; a contracted transaction binding a Buyer, Supplier, and accepted Quotation, optionally a Warehouse and Driver.
- **Deal_Status**: The `deal_status` enum value of a Deal: `OPEN`, `NEGOTIATION`, `CONTRACTED`, `IN_PROGRESS`, `COMPLETED`, or `CANCELLED`.
- **Vehicle_Type**: The `vehicle_type` enum value: `TRUCK`, `VAN`, `CAR`, or `MOTORCYCLE`.
- **Approval_Funnel**: The onboarding flow where Commercial_Accounts register as `PENDING` and a Super_Admin transitions them to `APPROVED` or `REJECTED` (Loop A).
- **Pipeline**: The RFQ → Quotation → Deal B2B engine (Loop B).
- **Accept_Deal_RPC**: A `SECURITY DEFINER` PostgreSQL function (RPC) that atomically accepts a Quotation and creates a Deal.
- **Realtime_Channel**: A Supabase Realtime `postgres_changes` subscription that pushes row changes to subscribed clients (Loop C).
- **Browser_Client**: The Supabase client created by `lib/supabase/client.ts` for Client Components.
- **Server_Client**: The Supabase client created by `lib/supabase/server.ts` for Server Components, Server Actions, and Route Handlers, using HTTP-only cookies.
- **Service_Role_Client**: The RLS-bypassing Supabase client created from the service-role key, used only in trusted server contexts.
- **Timeline_Stepper**: The horizontal milestone progress component bound to a Deal's Deal_Status.
- **Brand_Backdrop**: The Deep Dark Blue background color `#0F172A`.
- **Brand_Accent**: The Vibrant Accent Orange color `#F97316` used for metrics, progress indicators, and tags.

## Requirements

### Requirement 1: Custom Enum Type Definitions

**User Story:** As a backend engineer, I want all domain enumerations defined as PostgreSQL custom types, so that role, status, and vehicle values are constrained at the database layer and shared consistently across tables.

#### Acceptance Criteria

1. WHEN the Schema_Script is executed, THE Schema_Script SHALL create a `platform_role` enum type containing exactly the case-sensitive values `BUYER`, `SUPPLIER`, `DRIVER`, `WAREHOUSE_HOST`, and `SUPER_ADMIN` declared in that order, with no additional, missing, or differently-cased values.
2. WHEN the Schema_Script is executed, THE Schema_Script SHALL create a `verification_status` enum type containing exactly the case-sensitive values `PENDING`, `APPROVED`, and `REJECTED` declared in that order, with no additional, missing, or differently-cased values.
3. WHEN the Schema_Script is executed, THE Schema_Script SHALL create a `deal_status` enum type containing exactly the case-sensitive values `OPEN`, `NEGOTIATION`, `CONTRACTED`, `IN_PROGRESS`, `COMPLETED`, and `CANCELLED` declared in that order, with no additional, missing, or differently-cased values.
4. WHEN the Schema_Script is executed, THE Schema_Script SHALL create a `vehicle_type` enum type containing exactly the case-sensitive values `TRUCK`, `VAN`, `CAR`, and `MOTORCYCLE` declared in that order, with no additional, missing, or differently-cased values.
5. IF an enum type of the same name already exists when the Schema_Script is executed, THEN THE Schema_Script SHALL skip creation of that enum type, leave the existing type and its values unchanged, and complete without raising an error or aborting execution of remaining statements.
6. IF creation of an enum type fails for a reason other than the type already existing, THEN THE Schema_Script SHALL halt execution and return an error indicating which enum type failed to be created, leaving no partially defined type of that name.

### Requirement 2: Profiles Table and Auth Binding

**User Story:** As a platform architect, I want a `profiles` table bound 1:1 to Supabase auth users, so that every authenticated identity carries a platform role and verification status.

#### Acceptance Criteria

1. WHEN the Schema_Script is executed, THE Schema_Script SHALL create a `public.profiles` table with an `id` column of type `uuid` as the primary key referencing `auth.users(id)` with `ON DELETE CASCADE`.
2. THE Schema_Script SHALL define on `public.profiles` the columns `full_name` (text), `company_name` (text), `phone_number` (text), `role` (platform_role, NOT NULL), and `status` (verification_status, NOT NULL).
3. WHEN a Profile row is inserted without an explicit `status` value AND the Platform_Role is a Commercial_Account, THE Schema_Script SHALL default the `status` to `PENDING`.
4. WHEN a Profile row is inserted without an explicit `status` value AND the Platform_Role is `BUYER`, THE Schema_Script SHALL default the `status` to `APPROVED`.
5. WHEN a Profile row is inserted with an explicit `status` value that is one of `PENDING`, `APPROVED`, or `REJECTED`, THE Schema_Script SHALL persist that supplied value without overriding it with a role-based default.
6. IF a Profile's Platform_Role changes from `BUYER` to a Commercial_Account after registration, THEN THE Schema_Script SHALL retain the existing `APPROVED` Verification_Status without resetting it to `PENDING`.
7. THE Schema_Script SHALL define each foreign key relationship that targets `public.profiles` with `ON DELETE CASCADE`.

### Requirement 3: Domain Tables with Strict Foreign Keys

**User Story:** As a backend engineer, I want all domain entities stored in relational tables with enforced foreign keys, so that data integrity and ownership are guaranteed at the database layer.

#### Acceptance Criteria

1. WHEN the Schema_Script is executed, THE Schema_Script SHALL create a `public.products` table with a `supplier_id` foreign key referencing `public.profiles(id)` `ON DELETE CASCADE`, and columns `title` (text), `description` (text), `price_range` (text), `moq` (integer), `lead_time` (text), and `images` (text array).
2. WHEN the Schema_Script is executed, THE Schema_Script SHALL create a `public.warehouses` table with a `host_id` foreign key referencing `public.profiles(id)` `ON DELETE CASCADE`, and columns `title` (text), `city` (text), `total_area_m2` (numeric), `available_area_m2` (numeric), and `price_per_m2_monthly` (numeric).
3. WHEN the Schema_Script is executed, THE Schema_Script SHALL create a `public.drivers_metadata` table whose `id` is both primary key and foreign key referencing `public.profiles(id)` `ON DELETE CASCADE`, with columns `license_number` (text), `vehicle` (vehicle_type), and `max_weight_capacity_kg` (numeric).
4. WHEN the Schema_Script is executed, THE Schema_Script SHALL create a `public.rfqs` table with a `buyer_id` foreign key referencing `public.profiles(id)` `ON DELETE CASCADE`, and columns `product_title` (text), `specifications` (text), `target_budget` (numeric), and `quantity` (integer).
5. WHEN the Schema_Script is executed, THE Schema_Script SHALL create a `public.quotations` table with a `rfq_id` foreign key referencing `public.rfqs(id)` `ON DELETE CASCADE`, a `supplier_id` foreign key referencing `public.profiles(id)` `ON DELETE CASCADE`, and columns `offered_price` (numeric), `dynamic_lead_time` (text), and `invoice_url` (text).
6. WHEN the Schema_Script is executed, THE Schema_Script SHALL create a `public.deals` table with foreign keys `buyer_id` referencing `public.profiles(id)`, `supplier_id` referencing `public.profiles(id)`, `quote_id` referencing `public.quotations(id)`, an optional `warehouse_id` referencing `public.warehouses(id)`, and an optional `driver_id` referencing `public.drivers_metadata(id)`, plus columns `gross_valuation` (numeric) and `status` (deal_status).
7. THE Schema_Script SHALL define `buyer_id`, `supplier_id`, and `quote_id` on `public.deals` as NOT NULL, and SHALL define the `warehouse_id` and `driver_id` columns as nullable.
8. WHEN a new `public.deals` row is inserted without an explicit `status`, THE deals table SHALL default the `status` to `OPEN`.
9. IF a table in the set `public.products`, `public.warehouses`, `public.drivers_metadata`, `public.rfqs`, `public.quotations`, `public.deals` already exists when the Schema_Script is executed, THEN THE Schema_Script SHALL skip creation of that table and complete the remaining statements without raising an error.
10. IF an insert or update would violate a foreign key constraint on any domain table, THEN THE Schema_Script-defined constraints SHALL reject the operation with an error and SHALL NOT persist the row.
11. WHEN a `public.profiles` row is deleted, THE ON DELETE CASCADE constraints SHALL propagate the deletion to all dependent rows in `public.products`, `public.warehouses`, `public.drivers_metadata`, `public.rfqs`, `public.quotations`, and `public.deals` that reference that profile.

### Requirement 4: Automatic Profile Provisioning Trigger

**User Story:** As a platform operator, I want new auth registrations mirrored into the profiles table automatically, so that a profile always exists for every authenticated user without a manual step.

#### Acceptance Criteria

1. WHEN a new row is inserted into `auth.users`, THE Profile_Trigger SHALL insert exactly one corresponding row into `public.profiles` using the same `id` as the new `auth.users` row.
2. WHEN the Profile_Trigger runs, THE Profile_Trigger SHALL read `full_name`, `role`, `company_name`, and `phone_number` from the new user's registration metadata.
3. IF any of `full_name`, `company_name`, or `phone_number` is absent or null in the registration metadata, THEN THE Profile_Trigger SHALL store a null value for that column and SHALL complete without raising an error.
4. IF the registration metadata contains a `role` value that is absent, null, or not a valid `platform_role`, THEN THE Profile_Trigger SHALL assign the Platform_Role `BUYER`.
5. WHEN the Profile_Trigger creates a Profile whose assigned Platform_Role is a Commercial_Account, THE Profile_Trigger SHALL set the Verification_Status to `PENDING`.
6. WHEN the Profile_Trigger creates a Profile whose assigned Platform_Role is `BUYER`, THE Profile_Trigger SHALL set the Verification_Status to `APPROVED`.
7. IF a Profile row with the same `id` already exists, THEN THE Profile_Trigger SHALL complete without raising an error and without modifying any column of the existing row.
8. IF the Profile_Trigger encounters a failure other than a duplicate profile during profile creation, THEN THE Profile_Trigger SHALL raise that error and SHALL NOT persist a partially populated Profile row.
9. THE Profile_Trigger SHALL be declared `SECURITY DEFINER` with a fixed `search_path` so that it can write to `public.profiles` regardless of the caller's privileges.

### Requirement 5: Row Level Security Enablement and Admin Authority

**User Story:** As a security engineer, I want RLS enabled on every table with Super_Admin holding full authority, so that data access is governed by policy rather than client trust.

#### Acceptance Criteria

1. WHEN the Schema_Script is executed, THE Schema_Script SHALL enable Row Level Security on each of the following tables: `public.profiles`, `public.products`, `public.warehouses`, `public.drivers_metadata`, `public.rfqs`, `public.quotations`, and `public.deals`, such that no table among them remains with RLS disabled after execution completes.
2. WHERE a request is made by a Super_Admin, THE RLS policies SHALL permit read access (select) to all rows in every table listed in criterion 1, regardless of row ownership.
3. WHERE a request is made by a Super_Admin, THE RLS policies SHALL permit each write operation (insert, update, and delete) on all rows in every table listed in criterion 1, regardless of row ownership.
4. IF a request is made by a client that is neither the owning user of the targeted row nor a Super_Admin, AND no RLS policy grants the requested operation, THEN THE RLS policies SHALL deny the operation, return zero affected rows (for read) or a policy-violation rejection (for write), and leave all stored data unchanged.
5. WHERE a Super_Admin authority condition applies, THE RLS policies SHALL grant the requested operation even when the row-ownership condition is not met, so that Super_Admin authority always overrides the ownership requirement.
6. WHEN the Schema_Script is executed more than once against the same database, THE Schema_Script SHALL define every RLS policy idempotently so that re-execution completes without raising a duplicate-policy error and leaves the set of policies identical to a single execution.

### Requirement 6: Public Visibility Filtering by Verification Status

**User Story:** As a Buyer browsing the platform, I want to see only approved suppliers, products, and warehouses, so that I never transact with unverified or rejected commercial accounts.

#### Acceptance Criteria

1. WHERE a request reads `public.profiles` without Super_Admin authority AND the requester is not the owner of the Profile row, THE RLS policies SHALL exclude Profiles whose Verification_Status is `PENDING`.
2. WHERE a request reads `public.profiles` without Super_Admin authority AND the requester is not the owner of the Profile row, THE RLS policies SHALL exclude Profiles whose Verification_Status is `REJECTED`.
3. WHERE a Buyer reads `public.products`, THE RLS policies SHALL return only Products whose owning Supplier Profile has Verification_Status `APPROVED`, and SHALL exclude Products whose owning Supplier Profile has Verification_Status `PENDING` or `REJECTED`.
4. WHERE a Buyer reads `public.warehouses`, THE RLS policies SHALL return only Warehouses whose owning Warehouse_Host Profile has Verification_Status `APPROVED`, and SHALL exclude Warehouses whose owning Warehouse_Host Profile has Verification_Status `PENDING` or `REJECTED`.
5. WHERE a Buyer reads supplier Profiles, THE RLS policies SHALL return only Profiles whose Verification_Status is `APPROVED`, and SHALL return an empty result set (zero rows) when no Profile with Verification_Status `APPROVED` exists.
6. WHILE a Commercial_Account's own Verification_Status is `PENDING`, THE RLS policies SHALL permit that account to read its own Profile row.
7. WHILE a Commercial_Account's own Verification_Status is `REJECTED`, THE RLS policies SHALL permit that account to read its own Profile row.
8. WHERE a request reads `public.profiles` with no authenticated session, THE RLS policies SHALL return only Profiles whose Verification_Status is `APPROVED`.

### Requirement 7: Commercial Account Registration (Loop A — Onboarding)

**User Story:** As a prospective Supplier, Driver, or Warehouse Host, I want my registration to create a live pending record, so that an administrator can review and approve my account.

#### Acceptance Criteria

1. WHEN a Warehouse_Host submits the warehouse registration form with all required fields present and valid, THE Platform SHALL perform a live INSERT into `public.warehouses` associated with the registering Warehouse_Host's `host_id`.
2. WHEN a Driver submits the logistics registration form with all required fields present and valid, THE Platform SHALL perform a live INSERT into `public.drivers_metadata` associated with the registering Driver's `id`.
3. WHEN a Commercial_Account registration completes, THE registered Profile SHALL carry Verification_Status `PENDING`.
4. WHEN a Commercial_Account registration INSERT succeeds, THE Platform SHALL display, within 5 seconds, a confirmation message indicating that the submission is awaiting administrator review.
5. IF a Commercial_Account registration INSERT fails, THEN THE Platform SHALL display, within 5 seconds, an error message indicating the cause of the failure AND SHALL retain all entered form field values unchanged.
6. IF a required registration field is missing or fails its validation rule, THEN THE Platform SHALL block the INSERT AND SHALL display which field requires correction AND SHALL retain all entered form field values unchanged.
7. WHILE a Commercial_Account's Verification_Status is `PENDING`, THE Platform SHALL exclude that account's listings from the public Home Page and Buyer discovery feeds.

### Requirement 8: Admin Verification and Approval (Loop A — Approval)

**User Story:** As a Super_Admin, I want to review pending commercial accounts and approve or reject them, so that only vetted assets become publicly visible.

#### Acceptance Criteria

1. WHEN the Super_Admin opens the verification view, THE Platform SHALL query and display all Profiles whose Verification_Status is `PENDING`, ordered by submission timestamp from oldest to newest.
2. WHEN the Super_Admin approves a pending Profile, THE Platform SHALL perform a live UPDATE setting that Profile's Verification_Status to `APPROVED` and SHALL reflect the result in the verification view within 5 seconds.
3. WHEN the Super_Admin rejects a pending Profile, THE Platform SHALL perform a live UPDATE setting that Profile's Verification_Status to `REJECTED` and SHALL reflect the result in the verification view within 5 seconds.
4. WHEN a Profile's Verification_Status changes to `APPROVED`, THE Platform SHALL make that account's eligible listings queryable by the public Home Page and Buyer feeds within 5 seconds of the successful UPDATE.
5. IF an approval or rejection UPDATE fails, THEN THE Platform SHALL display an error message indicating that the update did not complete AND SHALL leave the Profile's Verification_Status unchanged in the displayed state.
6. IF a user whose role is not Super_Admin attempts to approve or reject a Profile, THEN THE Platform SHALL reject the action, leave the Profile's Verification_Status unchanged, and display an error message indicating the action is not permitted.
7. IF the Super_Admin attempts to approve or reject a Profile whose Verification_Status is no longer `PENDING`, THEN THE Platform SHALL reject the action, leave the Profile's Verification_Status unchanged, and display a message indicating the Profile has already been processed.
8. WHEN the verification view loads and no Profiles have Verification_Status `PENDING`, THE Platform SHALL display an empty-state message indicating there are no pending accounts to review.

### Requirement 9: Approved-Asset Discovery Feeds (Loop A — Visibility)

**User Story:** As a Buyer or public visitor, I want the Home Page and importer feeds to show approved assets pulled live from the backend, so that newly approved suppliers, products, and warehouses appear without code changes.

#### Acceptance Criteria

1. WHEN the public Home Page loads, THE Platform SHALL query Suppliers, Products, and Warehouses whose Verification_Status equals `APPROVED` through relational filter joins, SHALL exclude any record whose Verification_Status is not `APPROVED`, and SHALL return results within 3 seconds under normal load.
2. WHEN a Buyer opens the importer discovery feed, THE Platform SHALL query Suppliers, Products, and Warehouses whose Verification_Status equals `APPROVED` live from the backend on each request rather than from hardcoded or cached arrays, and SHALL return results within 3 seconds under normal load.
3. WHEN a Commercial_Account's Verification_Status transitions to `APPROVED`, THEN THE Platform SHALL include that account's eligible listings (records whose Verification_Status equals `APPROVED`) in the results of any public Home Page or Buyer feed fetch initiated after the transition completes, with no manual republication or re-indexing step required.
4. WHILE no listings with Verification_Status `APPROVED` exist for a requested category, THE Platform SHALL render an empty-state message that identifies the requested category and SHALL NOT render mock or placeholder listing data.
5. IF a Home Page or discovery feed query to the backend fails or exceeds the 3-second response bound, THEN THE Platform SHALL render an error-state message indicating that listings could not be loaded and SHALL NOT display mock or placeholder listing data.

### Requirement 10: RFQ Creation (Loop B — Request)

**User Story:** As a Buyer, I want to submit a product sourcing request, so that suppliers can respond with quotations.

#### Acceptance Criteria

1. WHEN a Buyer submits the "Request Product" form with all required fields present and valid, THE Platform SHALL perform a live INSERT into `public.rfqs` with `buyer_id` set to the submitting Buyer.
2. WHEN an RFQ INSERT is performed, THE Platform SHALL persist the submitted `product_title`, `specifications`, `target_budget`, and `quantity` values into the new `public.rfqs` row.
3. IF the "Request Product" form is submitted with `product_title` empty, `specifications` empty, `target_budget` not within 0.01 to 999,999,999.99, or `quantity` not a whole number of at least 1, THEN THE Platform SHALL block the submission without performing the INSERT, SHALL display which field requires correction, AND SHALL retain the entered form values.
4. WHEN an RFQ INSERT succeeds, THE Platform SHALL display the new RFQ in the Buyer's RFQ list sourced from live data within 5 seconds of the INSERT completing.
5. IF an RFQ INSERT fails, THEN THE Platform SHALL display an error message identifying the failure reason, SHALL leave `public.rfqs` unchanged with no partial row persisted, AND SHALL retain the entered form values.

### Requirement 11: Supplier Quotation Submission (Loop B — Quote)

**User Story:** As a Supplier, I want to view active RFQs and send quotations, so that I can compete for buyer business.

#### Acceptance Criteria

1. WHEN a Supplier opens the pipeline feed, THE Platform SHALL fetch from `public.rfqs` and render every RFQ whose status indicates it is open for quotation (an "active RFQ"), with rendered content reflecting the current database state within 5 seconds of the feed loading.
2. WHILE the entered `offered_price` is within the range 0.01 to 999,999,999.99 and the entered `dynamic_lead_time` is a whole number of days within the range 1 to 365, WHEN a Supplier submits the "Send Quote" form against an active RFQ, THE Platform SHALL perform an INSERT into `public.quotations` with `rfq_id` set to the target RFQ and `supplier_id` set to the submitting Supplier.
3. WHEN a quotation INSERT is performed, THE Platform SHALL persist the submitted `offered_price` and `dynamic_lead_time` values into the new `public.quotations` row.
4. IF a Supplier submits the "Send Quote" form with `offered_price` outside the range 0.01 to 999,999,999.99, OR with `dynamic_lead_time` that is not a whole number of days within the range 1 to 365, OR with either field empty, THEN THE Platform SHALL reject the submission without performing the INSERT, SHALL display an error message identifying each invalid or missing field, AND SHALL retain the entered quote values.
5. WHEN a quotation INSERT succeeds, THE Platform SHALL display the submitted quotation against its RFQ for both the submitting Supplier and the owning Buyer, with the displayed content reflecting the current database state within 5 seconds of the INSERT completing.
6. IF a quotation INSERT fails, THEN THE Platform SHALL display an error message identifying the failure reason, SHALL NOT persist a partial `public.quotations` row, AND SHALL retain the entered quote values in the form.

### Requirement 12: Deal Acceptance via Atomic Transaction (Loop B — Deal)

**User Story:** As a Buyer, I want accepting a quotation to atomically create a deal, so that the contracted transaction is recorded consistently without partial writes.

#### Acceptance Criteria

1. WHEN a Buyer triggers "Accept Quote" on a Quotation, THE Platform SHALL invoke the Accept_Deal_RPC within 2 seconds of the trigger.
2. WHEN the Accept_Deal_RPC executes, THE Accept_Deal_RPC SHALL create a `public.deals` row linking the accepted Quotation's `quote_id`, the RFQ's `buyer_id`, and the Quotation's `supplier_id`.
3. WHEN the Accept_Deal_RPC creates a Deal, THE Accept_Deal_RPC SHALL set the Deal's `gross_valuation` to the accepted Quotation's offered price, which is within the range 0.01 to 999,999,999.99.
4. IF the accepted Quotation's offered price is null or outside the range 0.01 to 999,999,999.99, THEN THE Accept_Deal_RPC SHALL reject the operation, return an error indication to the caller, and SHALL NOT create a Deal.
5. WHEN the Accept_Deal_RPC creates a Deal, THE Accept_Deal_RPC SHALL set the Deal's Deal_Status to the initial value `OPEN`.
6. IF any step of the Accept_Deal_RPC fails, THEN THE Accept_Deal_RPC SHALL roll back all changes so that no `public.deals` row is created, preserve all prior stored data unchanged, and return an error indication to the caller.
7. WHEN a Deal exists, THE Deal's Deal_Status SHALL hold a value drawn from the `deal_status` enum, whether the Deal is newly created or pre-existing.
8. IF a Buyer attempts to accept a Quotation that does not belong to one of that Buyer's RFQs, THEN THE Accept_Deal_RPC SHALL reject the operation, return an error indication to the caller, and SHALL NOT create a Deal.
9. IF a Deal already exists for the targeted Quotation, THEN THE Accept_Deal_RPC SHALL reject the operation, return an error indication to the caller, and SHALL NOT create a second Deal for that Quotation.

### Requirement 13: Deal Timeline Stepper Binding

**User Story:** As a Buyer tracking a contracted deal, I want a horizontal timeline stepper bound to the deal's live status, so that I can see the current stage of my transaction.

#### Acceptance Criteria

1. WHEN a Deal is displayed, THE Timeline_Stepper SHALL render exactly one active stage that maps one-to-one to the Deal's current Deal_Status value.
2. WHEN a Deal's Deal_Status changes in the backend, THE Timeline_Stepper SHALL advance to display the stage mapped to the new Deal_Status within 5 seconds of receiving the change, without requiring a manual page reload.
3. WHILE rendering, THE Timeline_Stepper SHALL display the active stage and all stages preceding it as completed using the Brand_Accent color `#F97316`, and SHALL display all stages following the active stage as pending in a visually distinct non-accent treatment.
4. IF a Deal has no associated status data, THEN THE Timeline_Stepper SHALL render the initial `OPEN` stage as the active default.
5. IF a Deal's Deal_Status holds a value that does not map to any defined stage, THEN THE Timeline_Stepper SHALL retain the last successfully rendered stage and SHALL display an indicator that the current stage could not be determined.

### Requirement 14: Real-Time Synchronization (Loop C)

**User Story:** As any platform user, I want milestone updates and admin approvals to appear without refreshing, so that all viewports stay synchronized in real time.

#### Acceptance Criteria

1. WHEN a relevant dashboard view mounts, THE Platform SHALL subscribe to a Supabase Realtime_Channel using `postgres_changes` for the tables that view renders within 3 seconds of mount completion.
2. WHEN a Driver posts a milestone update that changes a Deal's Deal_Status, THE Platform SHALL propagate the updated Deal_Status to all subscribed Buyer and Admin viewports within 5 seconds and SHALL update the displayed value without requiring a manual page refresh.
3. WHEN a Super_Admin changes a Profile's Verification_Status, THE Platform SHALL propagate the updated Verification_Status to all subscribed viewports within 5 seconds and SHALL update the displayed value without requiring a manual page refresh.
4. WHEN a subscribed component unmounts, THE Platform SHALL remove its Realtime_Channel subscription within 1 second and SHALL stop applying further updates from that channel to the unmounted view.
5. IF a Realtime_Channel subscription cannot be established within 10 seconds of the attempt, THEN THE Platform SHALL continue to display the last successfully fetched data, SHALL NOT blank or terminate the view, and SHALL display a non-blocking indicator informing the user that the view is not receiving live updates.
6. IF a previously established Realtime_Channel subscription is dropped, THEN THE Platform SHALL attempt to re-establish the subscription up to 5 times, and IF all re-establishment attempts fail, THEN THE Platform SHALL display a non-blocking indicator informing the user that the view is not receiving live updates while continuing to show the last successfully fetched data.

### Requirement 15: App Router Supabase Client Integration

**User Story:** As a Next.js developer, I want correct Supabase clients for each App Router context, so that authenticated SSR works on Vercel using HTTP-only cookies.

#### Acceptance Criteria

1. WHERE data is read in a Server Component, Server Action, or Route Handler, THE Platform SHALL use the Server_Client that reads HTTP-only auth cookies via the Next.js cookie store.
2. WHERE data is accessed in a Client Component, THE Platform SHALL use the Browser_Client created with the public Supabase URL and anon key.
3. WHEN an authentication token is expired or within 60 seconds of expiry during a request, THE Platform SHALL refresh the session and persist the updated session cookie through the middleware session helper within the same request lifecycle.
4. IF a session refresh attempt fails during a request, THEN THE Platform SHALL treat the request as unauthenticated, leave the existing session cookie unchanged, and return a response indicating the user is signed out.
5. WHERE an operation requires bypassing RLS for a trusted Super_Admin override, THE Platform SHALL use the Service_Role_Client only within server-side code.
6. IF the Service_Role_Client key is referenced, THEN THE Platform SHALL NOT expose that key to any Client Component or browser bundle.
7. WHILE either the public Supabase URL or anon key environment variable is absent or empty, THE Platform SHALL render an authenticated user as signed out and SHALL complete the request without throwing an unhandled error.

### Requirement 16: Mock Data Replacement Across Dashboards

**User Story:** As a product owner, I want every dashboard to read and write live backend data, so that the platform behaves as one synchronized system rather than isolated mock views.

#### Acceptance Criteria

1. WHEN a persona dashboard (Admin, Importer, Supplier, Logistics, Warehouse Host) renders domain data, THE Platform SHALL source that data from live Supabase queries.
2. THE Platform SHALL exclude the hardcoded mock arrays in `lib/**/data.ts` from the runtime data paths of the refactored dashboards.
3. WHEN a dashboard performs a create, update, or delete action on domain data, THE Platform SHALL persist the change through a live Supabase write.
4. WHILE a live query is in flight, THE Platform SHALL render a loading indicator for the affected view, replacing any error state previously displayed for that view, until the query resolves or a 30-second timeout elapses.
5. IF a live query returns an error or does not resolve within 30 seconds, THEN THE Platform SHALL render an error state for the affected view that displays the failure reason and a retry control, and SHALL NOT render mock data.
6. WHEN a live query succeeds, THE Platform SHALL render the returned data within 1 second of receiving the response without displaying an intermediate success indicator.
7. IF a live Supabase write fails, THEN THE Platform SHALL render an error state indicating that the change was not persisted, retain the values the user entered, and leave the previously persisted data unchanged.
8. WHILE a create, update, or delete write is in flight, THE Platform SHALL render a pending indicator on the affected action and reject duplicate submissions of the same action until the write resolves or a 30-second timeout elapses.

### Requirement 17: Type Safety and Code Hygiene

**User Story:** As a maintainer, I want the refactored codebase to compile cleanly with strict typing, so that runtime data shapes match TypeScript types and dead code is eliminated.

#### Acceptance Criteria

1. WHEN the project is type-checked with TypeScript strict mode enabled, THE Platform SHALL complete the type check with zero TypeScript compilation errors.
2. THE Platform SHALL define an explicit type for 100% of Supabase query results used in refactored code, with zero occurrences of the `any` type in refactored code.
3. WHEN refactored code is submitted for merge, IF any Supabase query in that code lacks an explicit result type, THEN THE Platform SHALL block the merge and indicate which query lacks an explicit type.
4. THE Platform SHALL contain zero unused variables, imports, and functions in refactored code, as reported by the project linter after the refactor.
5. WHERE a route renders persona-restricted content, WHEN the route is requested, THE Platform SHALL verify the requester's persona authorization before rendering any protected data.
6. IF a request's persona is not authorized for the requested persona-restricted content, THEN THE Platform SHALL deny access without rendering the protected data and present an authorization error indication.
7. IF an unauthenticated request targets a protected dashboard route, THEN THE Platform SHALL redirect the request to the authentication entry point without rendering any protected data.

### Requirement 18: Brand Visual Preservation

**User Story:** As a brand owner, I want the existing visual identity preserved through the refactor, so that the platform's look and feel remain consistent.

#### Acceptance Criteria

1. THE Platform SHALL render dashboard and page backdrops using the Brand_Backdrop color `#0F172A`, matching the hex value exactly with no substitution or tint.
2. THE Platform SHALL render metrics, progress indicators, and tags using the Brand_Accent color `#F97316`, matching the hex value exactly with no substitution or tint.
3. WHEN data sources change from mock to live, THE Platform SHALL preserve each refactored view's layout, component structure, and visual styling (element positions, spacing, colors, and typography) identical to its pre-refactor rendering at viewport widths of 375px, 768px, 1024px, and 1440px.
4. WHEN a user hovers over an interactive element, THE Platform SHALL change the cursor to a pointer cursor.
5. WHEN a user hovers over an interactive element, THE Platform SHALL display a visible hover state via a change in color, background, or border that completes within 150 to 300 milliseconds without causing layout shift.
