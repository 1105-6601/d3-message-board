import { Item }                                from './item';
import { Rectangle, newRectangle }             from './rectangle';
import { InputUIConfig, newInputUIConfig }     from './input-ui-config';
import { BalloonUIConfig, newBalloonUIConfig } from './balloon-ui-config';
import { DrawUIConfig, newDrawUIConfig }       from './draw-ui-config';
import { CanvasConfig, newCanvasConfig }       from './canvas-config';
import { MessageConfig, newMessageConfig }     from './message-config';

const CONFIG_STRUCTURE_VERSION = 'v1';

export interface Configuration
{
  version: string;
  canvas: CanvasConfig;
  input: InputUIConfig;
  balloon: BalloonUIConfig;
  draw: DrawUIConfig;
  message: MessageConfig;
  rectangles: Item<Rectangle>[];
}

export function newConfiguration(): Configuration
{
  return {
    version:    CONFIG_STRUCTURE_VERSION,
    canvas:     newCanvasConfig(),
    input:      newInputUIConfig(),
    balloon:    newBalloonUIConfig(),
    draw:       newDrawUIConfig(),
    message:    newMessageConfig(),
    rectangles: [],
  };
}

export function loadConfiguration(json: string)
{
  const object = JSON.parse(json);

  if (object.hasOwnProperty('rectangles')) {
    const rectangles = <Item<Rectangle>[]> object.rectangles;
    rectangles.map(item => {
      item.figure = newRectangle(item.figure);
    });
  }

  return object;
}
