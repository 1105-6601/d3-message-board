import { Item } from './item';
import { Rectangle } from './rectangle';
import { InputUIConfig } from './input-ui-config';
import { BalloonUIConfig } from './balloon-ui-config';
import { DrawUIConfig } from './draw-ui-config';
import { CanvasConfig } from './canvas-config';
import { MessageConfig } from './message-config';
export interface Configuration {
    version: string;
    canvas: CanvasConfig;
    input: InputUIConfig;
    balloon: BalloonUIConfig;
    draw: DrawUIConfig;
    message: MessageConfig;
    rectangles: Item<Rectangle>[];
}
export declare function newConfiguration(): Configuration;
export declare function loadConfiguration(json: string): Configuration;
