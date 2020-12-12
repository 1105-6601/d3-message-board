import { Text } from './text';
import { UploadedFile } from './uploaded-file';
import { Rectangle } from './rectangle';
export interface Item<T> {
    figure: T;
    text: Text;
    files: UploadedFile[];
}
export declare function newRectangleItem(item: Item<Rectangle>): RectangleItem;
declare class RectangleItem implements Item<Rectangle> {
    figure: Rectangle;
    text: Text;
    files: UploadedFile[];
    constructor(item: Item<Rectangle>);
}
export {};
