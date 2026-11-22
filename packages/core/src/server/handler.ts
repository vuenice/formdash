import { Kysely } from "kysely";
import type { Database } from "../db/tables.js";
import type { FormDefinition } from "@formdash/types";
import { validateSubmission, type ValidationResult } from "./validator.js";

export interface SubmitHandlerOptions {
    customValidator?: (form: FormDefinition, rawPayload: Record<string, any>) => ValidationResult;
    onSuccess?: (entry: { id: string; formId: string; data: Record<string, any>}) => Promise<void> | void;
}

/*
* Universal Web API Request handler (works on cloudflare workers, node and astro API routes)
*/ 

export async function handleFormDashSubmit(
    request: Request,
    db: Kysely<Database>,
    options: SubmitHandlerOptions = {}
): Promise<Response> {
    // 1. Only allow POST requests
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({
            success: false,
            message: 'Method Not Allowed'
        }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();
        const { formId, data, _fd_hp } = body;

        if (!formId || !data) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Missing formId or submission data'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json'}
                }
            );
        }

        // 2. Fetch Form Definition from Database
        const formRecord = await db
            .selectFrom('formdash_forms')
            .selectAll()
            .where('id', '=', formId)
            .executeTakeFirst();
        
        if (!formRecord) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Form not found or inactive'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const formDefinition: FormDefinition = JSON.parse(formRecord.schema_json);

        // 3. Validate Submission (using smart validator if provided, else fallback to core validator)
        const rawPayload = { ...data, _fd_hp };
        const validatorFn = options.customValidator || validateSubmission;
        const validation = validatorFn(formDefinition, rawPayload);

        // 4. Handle Spam Trap
        if (validation.isSpam) {
            // Return a fake 200 OK so bots think they succeeded, but do not save to DB
            return new Response(
                JSON.stringify({
                    success: true, message: 'Submission Received'
                }), {
                    status: 200, headers: { 'Content-Type': 'application/json'}
                }
            );
        }

        // 5. Handle Validation Errors
        if (!validation.isValid) {
            return new Response(
                JSON.stringify({
                    success: false, message: 'Validation Failed', errors: validation.errors,
                }), {
                    status: 400, headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // 6. Generate UUID and Insert into Database
        const entryId = `entry_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;

        await db
            .insertInto('formdash_entries')
            .values({
                id: entryId,
                form_id: formId,
                data_json: JSON.stringify(validation.cleanedData),
                status: 'unread',
                payment_status: 'none',
                payment_intent_id: null,
                ip_hash: null,
            })
            .execute();

        // 7. Optional Post-Submission Hook
        if (options.onSuccess) {
            try{
                await options.onSuccess({
                    id: entryId,
                    formId,
                    data: validation.cleanedData,
                });
            } catch(hookErr) {
                console.error('[Formdash] Post-submit hook error:', hookErr);
                // we do not fail the user's submission if a background CRM webhook temporarily fails
            }
        }

        // 8. Return Success
        return new Response(
            JSON.stringify({
                success: true,
                message: formDefinition.settings.successMessage || 'Form submitted successfully',
                entryId,
            }), {
                status: 200, headers: { 'Content-Type': 'application/json'}
            }
        );
    } catch (e) {
        console.error('[Formdash] Submit error:', e);
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Internal Server Error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}