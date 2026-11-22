┌────────────────────────────────────────────────────────────────────────┐
│                        Formdash Master Roadmap                         │
└────────────────────────────────────────────────────────────────────────┘

  Phase 1: Environment & Schema Foundation
  Phase 2: Universal Conditional Logic & State Machine
  Phase 3: Drag-and-Drop Admin Canvas (DnD-Kit)
  Phase 4: Frontend Astro Component & Direct R2 Uploads
  Phase 5: Integrations (HubSpot, Salesforce, Google Sheets, Stripe)
  Phase 6: Monetization & Licensing Engine (LemonSqueezy + Offline JWT)

Folder summary 

- packages/types: Shared TypeScript definitions (form field schemas, validation rules, submission contracts) used by both Core and Pro.

- packages/core: The base EmDash plugin (drag-and-drop builder, D1 database storage, standard Astro frontend component, honeypot spam prevention).

- packages/pro: The commercial features (conditional logic engine, multi-step progress bar, CRM webhooks, Stripe integration, license verification).

packages/types/src/index.ts : Exports everything cleanly from a single entry point.

packages/types/src/field.ts : This defines every field type that can be dragged into a form.

packages/types/src/rule.ts : This powers showing/hiding fields, skipping steps, or conditional calculations.

packages/types/src/form.ts : Combines fields, multi-step configuration, notifications, and settings into a full Form.

packages/types/src/entry.ts: Defines what a completed form submission looks like.

packages/core/src/db/tables.ts: This describes the exact structure of your database tables to TypeScript.

packages/core/src/db/migrations.ts: This contains the SQL schema definitions used by EmDash to initialize the database tables on Cloudflare D1 or local SQLite.

packages/core/src/server/validator.ts: Why this is critical:

A client-side form can easily be bypassed by a spammer or malicious user sending direct HTTP POST requests. This validator ensures:

Honeypot protection: If a hidden bot field is filled, the submission is silently dropped or flagged as spam.
Schema validation: Every submitted value is checked against required rules, email formats, and number bounds.
