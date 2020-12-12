import { Size } from './size';
export interface BalloonUIConfig {
    size: Size;
    margin: number;
    highlightColor: string;
    borderColor: string;
    borderWidth: number;
    arrowSize: number;
    autoResize: boolean;
    attachedFileLabelWidth: number;
    editLabelWidth: number;
}
export declare function newBalloonUIConfig(): BalloonUIConfig;
