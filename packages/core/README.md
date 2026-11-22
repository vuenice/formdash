# Formdash (`@formdash/core`)

> Drag-and-drop visual form builder, conditional logic engine, and EmDash CMS plugin for Astro.

[![npm version](https://img.shields.io/npm/v/@formdash/core.svg)](https://www.npmjs.com/package/@formdash/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Features

- **Visual Studio**: Clean, human-designed 3-column drag-and-drop builder at `/admin/formdash`.
- **Live User Preview**: Dedicated full-page preview at `/admin/formdash/preview`.
- **Zero-Friction EmDash Plugin**: Integrates directly into the EmDash CMS admin dashboard (`/_emdash/admin`).
- **Astro Auto-Route Injection**: Automatically mounts the Studio and Preview routes in your Astro app with zero manual page copying.
- **Conditional Logic**: Show/hide fields dynamically based on real-time user selections.
- **Anti-Spam Built-in**: Honeypot traps and Cloudflare Turnstile integration.
- **Cloudflare D1 & SQLite Ready**: Built-in Kysely database migrations and entry repositories.

---

## Installation

```bash
pnpm add @formdash/core @formdash/types
# or
npm install @formdash/core @formdash/types
```

---

## Quick Start

### 1. Register in `astro.config.mjs`

Add Formdash to your integrations and EmDash plugin list:

```js
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import emdash from "emdash/astro";
import { d1, r2 } from "@emdash-cms/cloudflare";
import formdashPlugin, { formdashIntegration } from "@formdash/core";

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA" }),
      plugins: [formdashPlugin], // EmDash Admin Dashboard menu
    }),
    formdashIntegration(), // Auto-injects /admin/formdash & /admin/formdash/preview
  ],
});
```

### 2. Access the Studio

Once your dev server or production deployment is running:

| Route | Purpose |
|---|---|
| `/_emdash/admin` | EmDash Admin Dashboard (Forms menu item) |
| `/admin/formdash` | Formdash Visual Drag & Drop Studio |
| `/admin/formdash/preview` | Live Form User-Facing Preview |

---

## Embedding a Form on Your Astro Pages

To render a live form on any page of your Astro site:

```astro
---
import Formdash from "@formdash/core/components/Formdash.astro";
import { basicContactForm } from "@formdash/core";
---

<Layout title="Contact Us">
  <main>
    <Formdash form={basicContactForm} themeColor="#111827" />
  </main>
</Layout>
```

---

## Handling Form Submissions (API Route)

Create an API endpoint at `src/pages/api/formdash/submit.ts`:

```ts
import type { APIRoute } from "astro";
import { handleFormDashSubmit } from "@formdash/core";

export const POST: APIRoute = async ({ request, locals }) => {
  // locals.runtime.env.DB contains your Cloudflare D1 database binding
  const db = (locals as any).db; 
  return handleFormDashSubmit(request, db);
};
```

---

## Integration Options

Customize the auto-injected routes:

```js
formdashIntegration({
  studioRoute: "/custom-admin/studio",
  previewRoute: "/custom-admin/form-preview",
})
```

---

## Architecture

Formdash follows a modular monorepo architecture:

- **`@formdash/types`**: Shared Zod schemas and TypeScript interfaces.
- **`@formdash/core`**: Studio UI, Astro router injection, Kysely database migrations, submission validator, and runtime.
- **`@formdash/pro`**: Advanced field types (Stripe payments, signature pads, file uploads).

---

## License

MIT © [Swapnil Maheshwari](https://github.com/Swapnil-Maheshwari)
