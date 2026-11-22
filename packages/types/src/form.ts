import { z } from 'zod';
import { FormFieldSchema } from './field.js';
import { ConditionalRuleSchema } from './rule.js';

export const FormStepSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    order: z.number(),
});

export type FormStep = z.infer<typeof FormStepSchema>;

export const FormSettingsSchema = z.object({
    submitButtonText: z.string().default('Submit'),
    successMessage: z.string().default('Thank you! Your submission has been received.'),
    redirectUrl: z.string().url().optional(),
    enableHoneypot: z.boolean().default(true),
    enableTurnstile: z.boolean().default(false),
    notifications: z.object({
        adminEmail: z.string().email().optional(),
        sendAutoresponder: z.boolean().default(false),
        autoresponderSubject: z.string().optional(),
    }).optional(),
});

export type FormSettings = z.infer<typeof FormSettingsSchema>;

export const DEFAULT_FORM_SETTINGS: FormSettings = FormSettingsSchema.parse({});

export const FormDefinitionSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    isMultiStep: z.boolean().default(false),
    steps: z.array(FormStepSchema).default([]),
    fields: z.array(FormFieldSchema).default([]),
    rules: z.array(ConditionalRuleSchema).default([]),
    settings: FormSettingsSchema.default(() => FormSettingsSchema.parse({})),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export type FormDefinition = z.infer<typeof FormDefinitionSchema>;