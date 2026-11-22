import { basicContactForm, leadGenTemplate } from './demo/templates.js';
import type { FormDefinition } from '@formdash/types';

export interface BlockKitResponse {
    blocks: Array<Record<string, any>>;
}

export interface EmDashRouteContext {
    input: {
        type: 'page_load' | 'block_action' | 'form_submit';
        action_id?: string;
        page?: string;
        values?: Record<string, any>;
    };
    settings?: {
        get: <T>(key: string) => Promise<T | null>;
        set: <T>(key: string, value: T) => Promise<void>;
    };
    kv?: {
        get: <T>(key: string) => Promise<T | null>;
        set: <T>(key: string, value: T) => Promise<void>;
    };
    siteUrl?: string;
}

/*
 * Emdash Plugin Definition — deployable format
 */

export const formdashPlugin = {
    id: 'formdash',
    displayName: 'Formdash Form Builder',
    description: 'Drag-and-drop form builder with conditional logic and multi-step forms for EmDash',
    version: '0.1.0',
    entrypoint: '@formdash/core',
    format: 'standard' as const,
    capabilities: ['network:request', 'email:send', 'content:read', 'content:write'],

    adminPages: [
        {
            path: '/forms',
            label: 'Forms',
            icon: 'clipboard-document-list',
        },
    ],

    migrations: {
        module: '@formdash/core/db/migrations',
    },

    routes: {
        admin: {
            permission: 'plugins:manage',
            handler: async (ctx: EmDashRouteContext): Promise<BlockKitResponse> => {
                const input = ctx.input || {};

                const getForm = async (): Promise<FormDefinition | null> => {
                    if (ctx.settings?.get) {
                        try {
                            return await ctx.settings.get('active_form');
                        } catch { /* fallback */ }
                    }
                    if (ctx.kv?.get) {
                        try {
                            return await ctx.kv.get('active_form');
                        } catch { /* fallback */ }
                    }
                    return (globalThis as any)._formdash_active_form || null;
                };

                const saveForm = async (form: FormDefinition) => {
                    if (ctx.settings?.set) {
                        try { await ctx.settings.set('active_form', form); } catch { /* fallback */ }
                    }
                    if (ctx.kv?.set) {
                        try { await ctx.kv.set('active_form', form); } catch { /* fallback */ }
                    }
                    (globalThis as any)._formdash_active_form = form;
                };

                // Handle "Create Basic Contact Form" action
                if (input.type === 'block_action' && input.action_id === 'create_basic_form') {
                    await saveForm(basicContactForm);
                }

                // Handle "Create Lead Gen with Logic" action
                if (input.type === 'block_action' && input.action_id === 'create_lead_form') {
                    await saveForm(leadGenTemplate);
                }

                // Handle "+ Add Field" action
                if (input.type === 'block_action' && input.action_id === 'add_phone_field') {
                    const currentForm = (await getForm()) || basicContactForm;
                    const updatedForm: FormDefinition = {
                        ...currentForm,
                        fields: [
                            ...currentForm.fields,
                            {
                                id: `fld_phone_${Date.now()}`,
                                type: 'phone',
                                name: 'phone',
                                label: 'Phone Number',
                                placeholder: '+1 (555) 000-0000',
                                width: 'full',
                                validation: { required: false },
                            },
                        ],
                    };
                    await saveForm(updatedForm);
                }

                // Fetch the currently active form
                const activeForm = await getForm();
                const baseUrl = ctx.siteUrl || '';
                const studioUrl = `${baseUrl}/admin/formdash`;

                // No form yet — show zero-friction starter
                if (!activeForm) {
                    return {
                        blocks: [
                            { type: 'header', text: 'Formdash' },
                            { type: 'section', text: 'Create your first form. Choose a starter template below.' },
                            {
                                type: 'actions',
                                elements: [
                                    {
                                        type: 'button',
                                        action_id: 'create_basic_form',
                                        label: 'Basic Contact Form',
                                        style: 'primary',
                                    },
                                    {
                                        type: 'button',
                                        action_id: 'create_lead_form',
                                        label: 'Lead Gen with Conditional Logic',
                                    },
                                ],
                            },
                        ],
                    };
                }

                // Form exists — show management controls
                return {
                    blocks: [
                        { type: 'header', text: activeForm.title },
                        {
                            type: 'section',
                            text: `Status: ${activeForm.status} · ${activeForm.fields.length} fields · Embed: <Formdash formId="${activeForm.slug}" />`,
                        },
                        {
                            type: 'actions',
                            elements: [
                                {
                                    type: 'link',
                                    label: 'Open Visual Studio',
                                    appearance: 'primary',
                                    target: {
                                        kind: 'external',
                                        url: studioUrl,
                                    },
                                },
                                {
                                    type: 'button',
                                    action_id: 'create_basic_form',
                                    label: 'Reset to Basic Contact',
                                },
                            ],
                        },
                    ],
                };
            },
        },
    },
};

export default formdashPlugin;