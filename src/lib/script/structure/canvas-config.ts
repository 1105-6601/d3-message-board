export interface CanvasConfig
{
  selector: string;
  width: number;
  height: number;
  autoResize: boolean;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  defaultRectColor: string;
  defaultRectOpacity: number;
  rectAnimation: boolean;
  rectAnimationDashArray: string;
  readOnly: boolean;
  showGrid: boolean;
  gridSize: number;
  backgroundColor: string;
  backgroundImageUrl: string;
}

export function newCanvasConfig(): CanvasConfig
{
  return {
    selector:               '#canvas',
    width:                  400,
    height:                 400,
    autoResize:             true,
    minWidth:               400,
    minHeight:              400,
    maxWidth:               600,
    maxHeight:              800,
    defaultRectColor:       '#455a64',
    defaultRectOpacity:     0.8,
    rectAnimation:          true,
    rectAnimationDashArray: '20 5',
    readOnly:               false,
    showGrid:               true,
    gridSize:               30,
    backgroundColor:        '#f9f9f9',
    backgroundImageUrl:     null,
  }
}
