import type { FormDefinition, FormField } from "@formdash/types";

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
    cleanedData: Record<string, any>;
    isSpam: boolean;
}

export function validateSubmission(
    form: FormDefinition,
    rawPayload: Record<string, any>
): ValidationResult {
    const errors: Record<string, string> = {};
    const cleanedData: Record<string, any> = {};

    // 1. Honeypot check : Bots fill hidden fields
    const honeypotfield = rawPayload['_fd_hp'];
    if(form.settings.enableHoneypot && honeypotfield && String(honeypotfield).trim().length > 0) {
        return {
            isValid: false,
            errors: { _general: 'Spam detected'},
            cleanedData: {},
            isSpam: true,
        };
    }

    // 2. Validate each field according to the form schema
    for(const field of form.fields) {
        const value = rawPayload[field.name];
        // Check required rule
        if(field.validation.required) {
            const isEmpty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
            if(isEmpty) {
                errors[field.name] = field.validation.customErrorMessage || `${field.label} is required.`;
                continue;
            }
        }

        // Skip further checks if value is absent and not required
        if (value === undefined || value === null || value === '') {
            continue;
        }

        //  Email validation
        if(field.type === 'email' && typeof value === 'string') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(value)) {
                errors[field.name] =  'Plaese provide a valid email address.';
                continue;
            }
        }

        // Number Validation
        if (field.type === 'number') {
            const num = Number(value);
            if(isNaN(num)) {
                errors[field.name] = `${field.label} must be a number.`;
                continue;
            }
            if(field.validation.min !== undefined && num < field.validation.min) {
                errors[field.name] = `Value cannot be less than ${field.validation.min}.`;
                continue;
            }
            if(field.validation.max !== undefined && num > field.validation.max) {
                errors[field.name] = `Value cannot be greater than ${field.validation.max}.`;
                continue;
            }
        }

        cleanedData[field.name] = value;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        cleanedData,
        isSpam: false,
    };
}