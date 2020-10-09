export interface MessageConfig
{
  deleteConfirmationText: string;
  textAreaPlaceholder: string;
  textRequiredNotification: string;
  uploadFileFailedNotification: string;
  inputUIConfirmText: string;
  inputUICancelText: string;
  inputUIFileUploadBtnText: string;
}

export function newMessageConfig(): MessageConfig
{
  return {
    deleteConfirmationText:       '削除してもよろしいですか？',
    textAreaPlaceholder:          'ここに説明を入力して下さい...',
    textRequiredNotification:     '説明を入力して下さい',
    uploadFileFailedNotification: 'ファイルのアップロードに失敗しました。時間を置いて再度お試しください。',
    inputUIConfirmText:           '確定',
    inputUICancelText:            'キャンセル',
    inputUIFileUploadBtnText:     'ファイル',
  }
}
