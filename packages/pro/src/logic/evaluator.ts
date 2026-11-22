import type { Condition, ConditionalRule, FormField } from '@formdash/types';

export interface EvaluatedFormState {
    hiddenFieldIds: Set<string>;
    requiredFieldIds: Set<string>;
    activeStepOverride?: string;
}

/*
* Evaluates a single condition against current form values
*/ 

export function evaluateCondition(
    condition: Condition,
    formValues: Record<string, any>,
    fieldsById: Map<string, FormField>
): boolean {
    const targetField = fieldsById.get(condition.fieldId);
    const rawValue = targetField ? formValues[targetField.name] : formValues[condition.fieldId];
    const expectedValue = condition.value;

    switch (condition.operator) {
        case 'equals': 
            return String(rawValue ?? '') === String(expectedValue ?? '');
        
        case 'not_equals':
            return String(rawValue ?? '') !== String(expectedValue ?? '');
            
        case 'contains':
            if(Array.isArray(rawValue)) {
                return rawValue.includes(expectedValue);
            }
            return String(rawValue ?? '').toLowerCase().includes(String(expectedValue ?? '').toLowerCase());

        case 'not_contains':
            if (Array.isArray(rawValue)) {
                return !rawValue.includes(expectedValue);
            }
            return !String(rawValue ?? '').toLowerCase().includes(String(expectedValue ?? '').toLowerCase());
        
        case 'greater_than':
            return Number(rawValue) > Number(expectedValue);

        case 'less_than':
            return Number(rawValue) < Number(expectedValue);

        case 'is_empty':
            return (
                rawValue ===  undefined || rawValue === null || rawValue === '' ||
                (Array.isArray(rawValue) && rawValue.length === 0)
            );


        case 'is_not_empty':
            return (
                rawValue !== undefined && rawValue !== null && rawValue !== '' &&
                (!Array.isArray(rawValue) || rawValue.length > 0)
            );
        
        default:
            return false;
    }
}

/*
* Evaluates all rules against current form values to determine visibility & requirements
*/

export function evaluateRules(
    rules: ConditionalRule[],
    fields: FormField[],
    formValues: Record<string, any>
): EvaluatedFormState {
    const fieldsById = new Map(fields.map((f) => [f.id, f]));
    const hiddenFieldIds = new Set<string>();
    const requiredFieldIds = new Set<string>();
    let activeStepOverride: string | undefined;

    for (const rule of rules) {
        if(!rule.conditions || rule.conditions.length === 0) continue;

        //  Check if the rule conditions are met (AND vs OR)
        const isMatch = rule.combinator === 'OR' ? rule.conditions.some((c) => evaluateCondition(c, formValues, fieldsById)):
            rule.conditions.every((c) => evaluateCondition(c, formValues, fieldsById));

        if(isMatch) {
            if(rule.action === 'show' && rule.targetFieldId) {
                hiddenFieldIds.delete(rule.targetFieldId);
            } else if (rule.action === 'hide' && rule.targetFieldId) {
                hiddenFieldIds.add(rule.targetFieldId);
            } else if (rule.action === 'require' && rule.targetFieldId) {
                requiredFieldIds.add(rule.targetFieldId);
            } else if (rule.action === 'skip_to_step' && rule.targetStepId) {
                activeStepOverride = rule.targetStepId;
            }
        } else {
            // Invert default for 'show' action: if condition is false, hide the field
            if (rule.action === 'show' && rule.targetFieldId) {
                hiddenFieldIds.add(rule.targetFieldId);
            }
        }
    }

    return {
        hiddenFieldIds, requiredFieldIds, activeStepOverride
    };
}