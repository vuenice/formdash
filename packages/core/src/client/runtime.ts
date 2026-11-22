import { input } from "zod";

export interface ClientRuntimeOptions {
    formId: string;
    submitUrl?: string;
    onSuccess?: (response:any) => void;
    onError?: (errors: Record<string, string>) => void;
}

export function initFormdashClient(options:ClientRuntimeOptions) {
    const formElement = document.getElementById(`fd-${options.formId}`) as HTMLFormElement;
    if(!formElement) return;

    const container = formElement.closest('.formdash-container') as HTMLElement;
    const submitUrl = options.submitUrl || '/api/formdash/submit';

    // State
    const steps = Array.from(formElement.querySelectorAll<HTMLElement>('.formdash-step'));
    let currentStepIndex = 0;

    // 1. Gather all values currently filled in the form
    function getFormValues(): Record<string, any> {
        const values: Record<string, any> = {};
        const fieldWrappers = formElement.querySelectorAll<HTMLElement>('[data-field-id]');

        fieldWrappers.forEach((wrapper) => {
            const fieldId = wrapper.getAttribute('data-field-id');
            const input = wrapper.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea');
            if(input && fieldId) {
                values[input.name] = input.value;
                values[fieldId] = input.value; 
            }
        });
        return values;
    }

    // 2. Evaluate conditional rules in the browser
    function evaluateClientRules() {
        const rulesJson = formElement.getAttribute('data-rules');
        if (!rulesJson) return;

        try {
            const rules = JSON.parse(rulesJson);
            const values = getFormValues();

            for (const rule of rules) {
                if(!rule.targetFieldId || !rule.conditions) continue;

                const fieldContainer = formElement.querySelector<HTMLElement>(`[data-field-id="${rule.targetFieldId}"]`);
                if(!fieldContainer) continue;

                // Check condition
                const isMatch = rule.conditions.every((c:any) => {
                    const rawVal = values[c.fieldId] ?? '';
                    if(c.operator === 'equals') return String(rawVal) === String(c.value);
                    if(c.operator === 'not_equals') return String(rawVal) !== String(c.value);
                    if(c.operator === 'contains') return String(rawVal).toLowerCase().includes(String(c.value).toLowerCase())
                    if(c.operator === 'is_not_empty') return String(rawVal).trim().length > 0;
                    return false;
                });

                // Toggle Visibility Smoothly
                if (rule.action === 'show') {
                    fieldContainer.classList.toggle('hidden', !isMatch);
                } else if (rule.action === 'hide') {
                    fieldContainer.classList.toggle('hidden', isMatch);
                }
            }
        } catch (e) {
            console.error('[Formdash] Error evaluating conditional rules:', e);
        }
    }

    // 3. Multi-Step Navigation
    function updateStepUI() {
        if (steps.length <= 1) return;

        steps.forEach((step, idx) => {
            step.classList.toggle('hidden', idx !== currentStepIndex);
        });

        // update progress bar
        const progressFill = container.querySelector<HTMLElement>('.formdash-progress-fill');
        const stepIndicator = container.querySelector<HTMLElement>('.formdash-step-indicator');
        const percent = Math.round(((currentStepIndex + 1)/steps.length)*100);

        if (progressFill) progressFill.style.width = `${percent}%`;
        if (stepIndicator) stepIndicator.textContent = `Step ${currentStepIndex + 1} of ${steps.length}`;
    }

    // Next Step Validation
    function validateCurrentStep(): boolean {
        if (steps.length === 0) return true;
        const currentStep = steps[currentStepIndex];
        const inputs = Array.from(currentStep.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'));

        for (const input of inputs) {
            const fieldContainer = input.closest('.formdash-field') as HTMLElement;
            if(fieldContainer && fieldContainer.classList.contains('hidden')) continue; // Skip validation for conditionally hidden fields
            if(!input.checkValidity()) {
                input.reportValidity(); 
                return false;
            }
        }
        return true;
    }

    // 4. Bind Events
    formElement.addEventListener('input', evaluateClientRules);
    formElement.addEventListener('change', evaluateClientRules);
    container.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.matches('.formdash-btn-next')) {
            e.preventDefault();
            if (validateCurrentStep() && currentStepIndex < steps.length - 1) {
                currentStepIndex++;
                updateStepUI();
            }
        }

        if (target.matches('.formdash-btn-prev')) {
            e.preventDefault();
            if(currentStepIndex > 0) {
                currentStepIndex--;
                updateStepUI();
            }
        }
    });

    // 5. Submit via AJAX
    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateCurrentStep()) return;
        const submitBtn = formElement.querySelector<HTMLButtonElement>('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : 'Submit';
        if(submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }

        try {
            const payload = getFormValues();
            const response = await fetch(submitUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: options.formId,
                    data: payload,
                    _fd_hp: (formElement.querySelector('input[name="_fd_hp"]') as HTMLInputElement)?.value || '',
                }),
            });

            const resData = await response.json();

            if(response.ok && resData.success) {
                const successBox = container.querySelector<HTMLElement>('.formdash-success');
                formElement.classList.remove('hidden');
                if(options.onSuccess) options.onSuccess(resData);
            } else {
                alert(resData.message || 'Submission failed. Please check your entries.');
            }
        } catch (err) {
            alert('Network error submitting form. Please try again.');
        } finally {
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });

    // Initialize
    evaluateClientRules();
    updateStepUI();
}

