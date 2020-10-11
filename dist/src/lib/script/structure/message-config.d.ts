export interface MessageConfig {
    deleteConfirmationText: string;
    textAreaPlaceholder: string;
    textRequiredNotification: string;
    uploadFileFailedNotification: string;
    inputUIConfirmText: string;
    inputUICancelText: string;
    inputUIFileUploadBtnText: string;
    attachedFileLabelText: string;
}
export declare function newMessageConfig(): MessageConfig;
