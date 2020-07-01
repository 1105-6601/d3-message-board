import { Configuration } from './structure/configuration';
export declare class Board {
    private readonly config;
    private svg;
    private dragging;
    private dragStartX;
    private dragStartY;
    private editing;
    private currentTemporaryRectangle;
    private currentFixedBalloonId;
    constructor(config: Configuration);
    init(): Promise<void>;
    exportConfiguration(): string;
    private initMainCanvas;
    private calculateCanvasSize;
    private makeGridLines;
    private bindEventsForEdit;
    private initInputUI;
    private cleanUpInputState;
    private initRectangles;
    private changeCommentBalloonAppearance;
    private initCloseIcon;
    private initGlobalEvents;
    private closest;
    private getInputUITemplate;
    private getRemoteImageSize;
}
