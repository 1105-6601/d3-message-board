import { Coordinate } from './coordinate';
export interface Rectangle {
    id?: string;
    leftTop: Coordinate;
    rightBottom: Coordinate;
    colorCode?: string;
}
export declare function newRectangle(rectangle: Rectangle): _Rectangle;
declare class _Rectangle implements Rectangle {
    id: string;
    leftTop: Coordinate;
    rightBottom: Coordinate;
    colorCode: string;
    constructor(rectangle: Rectangle);
    get x(): number;
    get y(): number;
    get width(): number;
    get height(): number;
    getSpecialCoordinate(position: string): Coordinate;
    getArrowPolygonPoints(position: string, size?: number, cornerSpace?: number): string;
    getPositionedRectangle(position: string, margin?: number, width?: number): _Rectangle;
    getArea(): number;
}
export {};
