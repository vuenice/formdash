import type { FormDefinition } from "@formdash/types";

export const sampleLeadForm: FormDefinition = {
    id: 'form_lead_qualification',
    slug: 'get-quote',
    title: 'Project Discovery & Estimate',
    status: 'published',
    isMultiStep: false,
    steps: [
        {
            id: 'step_contact',
            title: 'Contact Details',
            description: 'Tell us who you are so we can send your quote.',
            order: 1,
        },
        {
            id: 'step_scope',
            title: 'Project Scope',
            description: 'Help us understand your requirements.',
            order: 2,
        },
        {
            id: 'step_review',
            title: 'Additional Notes',
            description: 'Any specific timelines or questions?',
            order: 3,
        },
    ],
    fields: [
        // step 1: Contact info
        {
            id: 'fld_name',
            type: 'text',
            name: 'full_name',
            label: 'Your Full Name',
            placeholder: 'Swapnil Maheshwari',
            stepId: 'step_contact',
            width: 'half',
            validation: { required: true },
        },
        {
            id: 'fld_email',
            type: 'email',
            name: 'email',
            label: 'Business Email',
            placeholder: 'swapnil@company.com',
            stepId: 'step_contact',
            width: 'half',
            validation: { required: true },
        },

        // step 2: Scope & Conditional Trigger
        {
            id: 'fld_service',
            type: 'select',
            name: 'service_type',
            label: 'Service Needed',
            stepId: 'step_scope',
            width: 'full',
            options: [
                {label: 'Web Development (Astro/EmDash)', value: 'web_dev'},
                {label: 'UI/UX Design', value: 'design'},
                {label: 'Enterprise Custom Migration', value: 'enterprise'},
            ],
            validation: { required: true },
        },

        // Conditionally Shown: Only appears if 'enterprise' is selected
        {
            id: 'fld_company_size',
            type: 'select',
            name: 'company_size',
            label: 'Company Size (Enterprise Only)',
            stepId: 'step_scope',
            width: 'full',
            options: [
                { label: '50 - 250 Employees', value: 'mid' },
                { label: '250+ Employees', value: 'large' },
            ],
            validation: { required: true },
        },

        // Step 3. Notes
        {
            id: 'fld_notes',
            type: 'textarea',
            name: 'project_notes',
            label: 'Brief Project Summary',
            placeholder: 'Tell us a bit about your goals...',
            stepId: 'step_review',
            width: 'full',
            validation: { required: false },
        },
    ],
    // Conditional Logic: Show company size only if service type === 'enterprise'
    rules: [
        {
            id: 'rule_show_enterprise',
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
        },
    ],
    settings: {
        submitButtonText: 'Submit Discovery Form',
        successMessage: 'Discovery submitted! Our sales engineering team will reach out shortly.',
        enableHoneypot: true,
        enableTurnstile: true,
    },
};