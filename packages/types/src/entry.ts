import { z } from 'zod';

export const FormEntrySchema = z.object({
    id: z.string(),
    formId: z.string(),
    data: z.record(z.string(), z.any()), // key-value map of submitted values
    status: z.enum(['unread', 'read', 'archived', 'spam']).default('unread'),
    paymentStatus: z.enum(['none', 'pending', 'succeeded', 'failed']).default('none'),
    paymentIntentId: z.string().optional(),
    ipHash: z.string().optional(),
    createdAt: z.string(),
});

export type FormEntry = z.infer<typeof FormEntrySchema>;