import { z } from 'zod';

export const FieldTypeSchema = z.enum([
    'text',
    'email',
    'phone',
    'number',
    'textarea',
    'select',
    'radio',
    'checkbox',
    'date',
    'file',
    'hidden',
    // Pro Fields
    'stripe_payment',
    'signature',
    'rating',
    'calculation',
]);

export type FieldType = z.infer<typeof FieldTypeSchema>;

export const FormFieldOptionsSchema = z.object({
    label: z.string(),
    value: z.string(),
    isDefault: z.boolean().optional(),
});

export type FormFieldOption = z.infer<typeof FormFieldOptionsSchema>;

export const FormFieldValidationSchema = z.object({
    required: z.boolean().default(false),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(), // Regex validation pattern
    customErrorMessage: z.string().optional(),
    allowedFileTypes: z.array(z.string()).optional(), // e.g. ['image/png', 'application/pdf']
    maxFileSizeMb: z.number().optional(),
});

export type FormFieldValidation = z.infer<typeof FormFieldValidationSchema>;

export const FormFieldSchema = z.object({
    id: z.string(), //Unique UUID
    type: FieldTypeSchema,
    name: z.string(), // key used in submission payload e.g. 'user_email'
    label: z.string(),
    placeholder: z.string().optional(),
    helptext: z.string().optional(),
    defaultValue: z.any().optional(),
    stepId: z.string().optional(), // Which step/page this field belongs to
    width: z.enum(['full', 'half', 'third']).default('full'), // Layout column width
    options: z.array(FormFieldOptionsSchema).optional(), // For select, radio, checkbox
    validation: FormFieldValidationSchema.default({ required: false }),
});

export type FormField = z.infer<typeof FormFieldSchema>;