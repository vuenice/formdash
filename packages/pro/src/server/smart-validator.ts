import type { FormDefinition } from "@formdash/types";
import { validateSubmission, type ValidationResult } from '@formdash/core'
import { evaluateRules } from "../logic/evaluator.js";

export function validateSmartSubmission(
    form: FormDefinition,
    rawPayload: Record<string, any>
): ValidationResult {
    // 1. Run conditional rules against current submission data
    const evaluatedState = evaluateRules(form.rules, form.fields, rawPayload);

    // 2. Clone the form definition and dynamically adjust field requirements
    const adjustedFields = form.fields.map((field) => {
        const isHidden = evaluatedState.hiddenFieldIds.has(field.id);
        const isDynamicallyRequired = evaluatedState.requiredFieldIds.has(field.id);
        
        return {
            ...field,
            validation: {
                ...field.validation,
                // if conditionally hidden, it CANNOT be required
                required: isHidden ? false : (field.validation.required || isDynamicallyRequired),
            },
        };
    });

    const adjustedForm: FormDefinition = {
        ...form, fields: adjustedFields,
    };

    // 3. Run core validation with dynamically adjusted requirements
    const baseResult = validateSubmission(adjustedForm, rawPayload);

    // 4. Strip out any values that were submitted for conditionally hidden files
        //  (Prevents bot tampering / hidden field injection)
    
    const sanitizedCleanedData: Record<string, any> = {};
    for(const [key, value] of Object.entries(baseResult.cleanedData)) {
        const matchingField = form.fields.find((f) => f.name === key);
        if(matchingField && evaluatedState.hiddenFieldIds.has(matchingField.id)) continue ;
        
        sanitizedCleanedData[key] = value;
    }
    return {
        ...baseResult, cleanedData: sanitizedCleanedData,
    };
}