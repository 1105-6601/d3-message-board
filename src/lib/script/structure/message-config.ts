export interface MessageConfig
{
  deleteConfirmationText: string;
  textAreaPlaceholder: string;
  inputUIConfirmText: string;
  inputUICancelText: string;
}

export function newMessageConfig(): MessageConfig
{
  return {
    deleteConfirmationText: '削除してもよろしいですか？',
    textAreaPlaceholder:    'ここに説明を入力して下さい...',
    inputUIConfirmText:     '確定',
    inputUICancelText:      'キャンセル'
  }
}
