# @formdash/types

Shared TypeScript definitions, Zod validation schemas, and interfaces for **Formdash**, the drag-and-drop form builder and conditional logic engine for EmDash CMS and Astro.

## Installation

```bash
pnpm add @formdash/types
# or
npm install @formdash/types
```

## Features

- **End-to-End Type Safety**: Complete typings for forms, fields, entries, validation rules, and conditional logic.
- **Runtime Validation**: Powered by [Zod](https://zod.dev), allowing schema validation on both server and client.
- **Multi-Step & Conditional Schemas**: Type definitions for branching rules, operators (`equals`, `not_equals`, `contains`, etc.), and multi-step pagination.

## Core Schemas & Types

### 1. `FormDefinition`
Represents a complete form schema:

```ts
import type { FormDefinition } from '@formdash/types';
import { FormDefinitionSchema } from '@formdash/types';

const myForm: FormDefinition = {
  id: 'form_contact',
  slug: 'contact-us',
  title: 'Contact Us',
  status: 'published',
  isMultiStep: false,
  steps: [],
  fields: [
    {
      id: 'fld_email',
      type: 'email',
      name: 'email',
      label: 'Email Address',
      placeholder: 'user@example.com',
      width: 'full',
      validation: { required: true },
    },
  ],
  rules: [],
  settings: {
    submitButtonText: 'Send Message',
    successMessage: 'Thank you! We will get back to you shortly.',
    enableHoneypot: true,
    enableTurnstile: false,
  },
};

// Validate at runtime
const validated = FormDefinitionSchema.parse(myForm);
```

### 2. `FormField`
Definitions for all supported field types: `text`, `email`, `phone`, `number`, `textarea`, `select`, `radio`, `checkbox`, `date`, `file`, `hidden`, and pro fields (`stripe_payment`, `signature`, `rating`, `calculation`).

```ts
import type { FormField } from '@formdash/types';

const nameField: FormField = {
  id: 'fld_name',
  type: 'text',
  name: 'full_name',
  label: 'Full Name',
  width: 'half',
  validation: { required: true },
};
```

### 3. `ConditionalRule`
Conditional branching and visibility logic:

```ts
import type { ConditionalRule } from '@formdash/types';

const showRule: ConditionalRule = {
  id: 'rule_1',
  action: 'show',
  targetFieldId: 'fld_company_size',
  combinator: 'AND',
  conditions: [
    {
      fieldId: 'fld_service',
      operator: 'equals',
      value: 'enterprise',
    },
  ],
};
```

### 4. `FormEntry`
Typings for form submission records:

```ts
import type { FormEntry } from '@formdash/types';
```

## License

MIT © Swapnil Maheshwari
