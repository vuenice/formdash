import type { FormStep } from "@formdash/types";
import type { EvaluatedFormState } from "./evaluator.js";

export interface StepNavigationState {
    currentStepIndex: number;
    currentStep: number;
    totalSteps: number;
    progressPercent: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    nextStepIid?: string;
    previousStepId?: string;
}

export function compileStepNavigation (
    steps: FormStep[],
    currentStepId: string,
    evaluatedState: EvaluatedFormState
): StepNavigationState {
    const sortedSteps = [...steps].sort((a,b) => a.order - b.order);
    const currentIndex = sortedSteps.findIndex((s) => s.id === currentStepId);
    const safeIndex = currentIndex === -1 ? 0: currentIndex;
    const currentStep = Number(sortedSteps[safeIndex])
    const totalSteps = sortedSteps.length;
    const isFirstStep = safeIndex === 0;
    const isLastStep = safeIndex === totalSteps -1;

    // Determine next step (checking if conditional logic has an override skip)
    let nextStepIid: string | undefined;
    if(!isLastStep) {
        nextStepIid = evaluatedState.activeStepOverride || sortedSteps[safeIndex +1]?.id;
    }
    
    const previousStepId = !isFirstStep ? sortedSteps[safeIndex -1]?.id : undefined;
    const progressPercent = Math.round(((safeIndex + 1)/totalSteps)*100);

    return {
        currentStepIndex: safeIndex,
        currentStep,
        totalSteps,progressPercent, isFirstStep, isLastStep, nextStepIid, previousStepId,
    };
}