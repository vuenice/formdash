import { z } from 'zod';

export const RuleOperatorSchema = z.enum([
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'greater_than',
    'less_than',
    'is_empty',
    'is_not_empty',
]);

export type RuleOperator = z.infer<typeof RuleOperatorSchema>;

export const ConditionSchema = z.object({
    fieldId: z.string(),
    operator: RuleOperatorSchema,
    value: z.any().optional()
});

export type Condition = z.infer<typeof ConditionSchema>;

export const ConditionalRuleSchema = z.object({
    id: z.string(),
    action: z.enum(['show', 'hide', 'require', 'skip_to_step']),
    targetFieldId: z.string().optional(), // Used when action is show/hide/require
    targetStepId: z.string().optional(), // Used when action is skip_to_step
    combinator: z.enum(['AND', 'OR']).default('AND'),
    conditions: z.array((ConditionSchema)),
});

export type ConditionalRule = z.infer<typeof ConditionalRuleSchema>;