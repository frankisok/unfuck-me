export interface DelContentConfirmDelegate {
    onDelContentConfirm(content: { [keyof: string]: any }, contentType: string): void;
    onDelContentCancel(): void;
}
