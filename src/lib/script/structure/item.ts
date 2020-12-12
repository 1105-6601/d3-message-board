import { Text }                    from './text';
import { UploadedFile }            from './uploaded-file';
import { newRectangle, Rectangle } from './rectangle';

export interface Item<T>
{
  figure: T;
  text: Text;
  files: UploadedFile[]
}

export function newRectangleItem(item: Item<Rectangle>): RectangleItem
{
  if (item instanceof RectangleItem) {
    return item;
  }

  return new RectangleItem(item);
}

class RectangleItem implements Item<Rectangle>
{
  figure: Rectangle;
  text: Text;
  files: UploadedFile[];

  public constructor(item: Item<Rectangle>)
  {
    this.figure = newRectangle(item.figure);
    this.text   = item.text;
    this.files  = item.files;
  }
}
