export const fieldNames = ['fullName', 'email', 'topic', 'projectCode', 'message'] as const;
export type FieldName = (typeof fieldNames)[number];
export type FormValues = Record<FieldName, string>;
export const labels: Record<FieldName, string> = {
    fullName: 'Full name',
    email: 'Email',
    topic: 'Topic',
    projectCode: 'Project code',
    message: 'Message',
};
export const topics = { question: 'Question', feedback: 'Feedback', issue: 'Issue' } as const;

export function emptyValues(): FormValues {
    return { fullName: '', email: '', topic: '', projectCode: '', message: '' };
}

export function validateForm(values: FormValues, includeProject: boolean): FormValues {
    const errors = emptyValues();
    const name = values.fullName.trim();
    if (name.length < 2 || name.length > 60) errors.fullName = 'Enter a name of 2–60 characters.';

    const email = values.email.trim();
    // A deliberately limited ASCII address policy, with bounded domain labels.
    const label = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
    const emailPattern = new RegExp(`^[a-z0-9._%+-]+@${label}(?:\\.${label})+$`, 'i');
    if (email.length > 120 || !emailPattern.test(email)) {
        errors.email = 'Enter an address such as alex@example.com (up to 120 characters).';
    }
    if (!Object.hasOwn(topics, values.topic)) errors.topic = 'Choose a topic.';
    if (includeProject && !/^[A-Z]{2}-\d{3}$/.test(values.projectCode.trim())) {
        errors.projectCode = 'Use two uppercase letters and three digits, such as VL-010.';
    }
    const message = values.message.trim();
    if (message.length < 20 || message.length > 500) {
        errors.message = 'Enter a message of 20–500 characters.';
    }
    return errors;
}

export function createResult(values: FormValues, includeProject: boolean) {
    return {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        topic: values.topic,
        ...(includeProject ? { projectCode: values.projectCode.trim() } : {}),
        message: values.message.trim(),
    };
}

export interface FieldError {
    name: FieldName;
    label: string;
    message: string;
}

export interface FieldState {
    name: FieldName;
    label: string;
    touched: boolean;
    dirty: boolean;
}
