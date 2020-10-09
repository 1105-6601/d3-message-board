import { Text }         from './text';
import { UploadedFile } from './uploaded-file';

export interface Item<T>
{
  figure: T;
  text: Text;
  files: UploadedFile[]
}
