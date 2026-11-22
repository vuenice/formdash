import type { FormDefinition } from "@formdash/types";

// 1. Default: 1-Click Basic Contact Form (Zero Friction)
export const basicContactForm: FormDefinition = {
    id: 'form_basic_contact',
    slug: 'contact-us',
    title: 'Contact Us',
    status: 'published',
    isMultiStep: false,
    steps: [],
    fields: [
        {
            id: 'fld_name',
            type: 'text',
            name: 'name',
            label: 'Your Name',
            placeholder: 'John Doe',
            width: 'full',
            validation: { required: true },
        },
        {
            id: 'fld_email',
            type: 'email',
            name: 'email',
            label: 'Email Address',
            placeholder: 'john@example.com',
            width: 'full',
            validation: { required: true },
        },
        {
            id: 'fld_message',
            type: 'textarea',
            name: 'message',
            label: 'Message',
            placeholder: 'How can we help you?',
            width: 'full',
            validation: { required: true },
          },
    ],
    rules: [],
    settings: {
        submitButtonText: 'Send Message',
        successMessage: 'Thanks for reaching out! We will get back to you shortly.',
        enableHoneypot: true,
        enableTurnstile: true
    },
};

// 2. Template: Lead Qualification (with conditional logic)
export const leadGenTemplate: FormDefinition = {
    id: 'form_lead_gen',
    slug: 'get-quote',
    title: 'Project Estimate & Lead Gen',
    status: 'published',
    isMultiStep: false,
    steps: [],
    fields: [
        {
            id: 'fld_lead_name',
            type: 'text',
            name: 'full_name',
            label: 'Full Name',
            width: 'half',
            validation: { required: true },
        },
        {
            id: 'fld_lead_email',
            type: 'email',
            name: 'email',
            label: 'Work Email',
            width: 'half',
            validation: { required: true },
        },
        {
            id: 'fld_lead_service',
            type: 'select',
            name: 'service_type',
            label: 'Service Needed',
            width: 'full',
            options: [
                { label: 'Standard Web Development', value: 'standard' },
                { label: 'Enterprise Custom Migration', value: 'enterprise' },
            ],
            validation: { required: true },
        },
        // Condiitonal Field
        {
            id: 'fld_lead_company_size',
            type: 'select',
            name: 'company_size',
            label: 'Company Size (Enterprise Only)',
            width: 'full',
            options: [
                { label: '50 - 250 Employees', value: 'mid' },
                { label: '250+ Employees', value: 'large' },
            ],
            validation: { required: true },
        },
    ],
    rules: [
        {
            id: 'rule_show_enterprise',
            action: 'show',
            targetFieldId: 'fld_lead_company_size',
            combinator: 'AND',
            conditions: [{ fieldId: 'fld_lead_service', operator: 'equals', value: 'enterprise' }],
        },
    ],
    settings: {
        submitButtonText: 'Request Estimate',
        successMessage: 'Your quote request has been received.',
        enableHoneypot: true,
        enableTurnstile: true,
    },
};