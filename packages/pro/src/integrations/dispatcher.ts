export interface WebhookConfig {
    url: string;
    secret: string;
    headers?: Record<string, string>;
}

export interface DispatchPayload {
    entryId: string;
    formId: string;
    data: Record<string, any>;
    submittedAt: string;
}

/*
*Dispatches form entries to external CRMs / Webhooks without blocking the user response
*/ 

export async function dispatchWebhook(
    config: WebhookConfig,
    payload: DispatchPayload
): Promise<{ success: boolean; status?: number; error?: string }> {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'Formdash-Lead-Dispatcher/1.0            ...config.headers',
            ...(config.headers || {}),
        };

        if(config.secret) {
            headers['X-Formdash-Signature'] = config.secret;
        }

        const response = await fetch(config.url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                error: `Webhook returned status ${response.status}: ${await response.text()}`,
            };
        }

        return { success: true, status: response.status };
    }  catch (err:any) {
        return {
            success: false,
            error: err.message || 'Failed to dispatch webhook',
        };
    }
}