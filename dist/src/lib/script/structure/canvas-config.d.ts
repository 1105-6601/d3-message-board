export interface CanvasConfig {
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
export declare function newCanvasConfig(): CanvasConfig;
