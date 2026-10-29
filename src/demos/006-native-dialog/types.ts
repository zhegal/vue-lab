export type DialogMode = 'non-modal' | 'modal';
export type FocusTarget = 'input' | 'heading' | 'close';

export interface DialogRecord {
    name: string;
    detail: string;
}

export interface DialogLogEntry extends DialogRecord {
    id: number;
    time: string;
}

export interface DialogResult {
    value: string;
    note: string;
    reason: string;
}
