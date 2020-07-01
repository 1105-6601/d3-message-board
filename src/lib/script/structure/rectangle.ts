import { Coordinate } from './coordinate';

export interface Rectangle
{
  id?: string;
  leftTop: Coordinate;
  rightBottom: Coordinate;
  colorCode?: string;
}

export function newRectangle(rectangle: Rectangle)
{
  if (rectangle instanceof _Rectangle) {
    return rectangle;
  }

  return new _Rectangle(rectangle);
}

class _Rectangle implements Rectangle
{
  public id: string;
  public leftTop: Coordinate;
  public rightBottom: Coordinate;
  public colorCode: string;

  public constructor(rectangle: Rectangle)
  {
    this.id          = rectangle.id || `g-${Math.random().toString(32).substring(2)}`;
    this.leftTop     = rectangle.leftTop;
    this.rightBottom = rectangle.rightBottom;
    this.colorCode   = rectangle.colorCode;
  }

  public get x(): number
  {
    return this.leftTop.x;
  }

  public get y(): number
  {
    return this.leftTop.y;
  }

  public get width(): number
  {
    return this.rightBottom.x - this.leftTop.x;
  }

  public get height(): number
  {
    return this.rightBottom.y - this.leftTop.y;
  }

  public getSpecialCoordinate(position: string): Coordinate
  {
    let x, y;
    switch (position) {
      case 'top':
        x = this.x + this.width / 2;
        y = this.y;
        break;
      case 'top-left':
        x = this.x;
        y = this.y;
        break;
      case 'top-right':
        x = this.x + this.width;
        y = this.y;
        break;
      case 'left':
        x = this.x;
        y = this.y + this.height / 2;
        break;
      case 'right':
        x = this.x + this.width;
        y = this.y + this.height / 2;
        break;
      case 'bottom':
        x = this.x + this.width / 2;
        y = this.y + this.height;
        break;
      case 'bottom-left':
        x = this.x;
        y = this.y + this.height;
        break;
      case 'bottom-right':
        x = this.x + this.width;
        y = this.y + this.height;
        break;
      default:
        throw Error('Invalid position specified.');
    }

    return {x, y};
  }

  public getArrowPolygonPoints(position: string, size: number = 10, cornerSpace: number = 8): string
  {
    let points: string,
        c: Coordinate;

    switch (position) {
      case 'top':
        c      = this.getSpecialCoordinate('top');
        points = `${c.x},${c.y - size} ${c.x - size},${c.y} ${c.x + size},${c.y}`;
        break;
      case 'top-left':
        c      = this.getSpecialCoordinate('top-left');
        points = `${c.x + size + cornerSpace},${c.y - size} ${c.x + size * 2 + cornerSpace},${c.y} ${c.x + cornerSpace},${c.y}`;
        break;
      case 'top-right':
        c      = this.getSpecialCoordinate('top-right');
        points = `${c.x - size - cornerSpace},${c.y - size} ${c.x - size * 2 - cornerSpace},${c.y} ${c.x - cornerSpace},${c.y}`;
        break;
      case 'left':
        c      = this.getSpecialCoordinate('left');
        points = `${c.x - size},${c.y} ${c.x},${c.y + size} ${c.x},${c.y - size}`;
        break;
      case 'left-top':
        c      = this.getSpecialCoordinate('top-left');
        points = `${c.x - size},${c.y + size + cornerSpace} ${c.x},${c.y + cornerSpace} ${c.x},${c.y + size * 2 + cornerSpace}`;
        break;
      case 'left-bottom':
        c      = this.getSpecialCoordinate('bottom-left');
        points = `${c.x - size},${c.y - size - cornerSpace} ${c.x},${c.y - cornerSpace} ${c.x},${c.y - size * 2 - cornerSpace}`;
        break;
      case 'right':
        c      = this.getSpecialCoordinate('right');
        points = `${c.x + size},${c.y} ${c.x},${c.y - size} ${c.x},${c.y + size}`;
        break;
      case 'right-top':
        c      = this.getSpecialCoordinate('top-right');
        points = `${c.x + size},${c.y + size + cornerSpace} ${c.x},${c.y + cornerSpace} ${c.x},${c.y + size * 2 + cornerSpace}`;
        break;
      case 'right-bottom':
        c      = this.getSpecialCoordinate('bottom-right');
        points = `${c.x + size},${c.y - size - cornerSpace} ${c.x},${c.y - cornerSpace} ${c.x},${c.y - size * 2 - cornerSpace}`;
        break;
      case 'bottom':
        c      = this.getSpecialCoordinate('bottom');
        points = `${c.x},${c.y + size} ${c.x - size},${c.y} ${c.x + size},${c.y}`;
        break;
      case 'bottom-left':
        c      = this.getSpecialCoordinate('bottom-left');
        points = `${c.x + size + cornerSpace},${c.y + size} ${c.x + cornerSpace},${c.y} ${c.x + size * 2 + cornerSpace},${c.y}`;
        break;
      case 'bottom-right':
        c      = this.getSpecialCoordinate('bottom-right');
        points = `${c.x - size - cornerSpace},${c.y + size} ${c.x - cornerSpace},${c.y} ${c.x - size * 2 - cornerSpace},${c.y}`;
        break;
      default:
        throw Error('Invalid position specified.');
    }

    return points;
  }

  public getPositionedRectangle(position: string, margin: number = 0, width?: number): _Rectangle
  {
    let leftTop: Coordinate,
        rightBottom: Coordinate;

    switch (position) {
      case 'left':
        leftTop = {
          x: this.x - this.width - margin,
          y: this.y
        };

        if (width) {
          leftTop.x = this.x - width - margin;
        }

        rightBottom = this.getSpecialCoordinate('bottom-left');
        rightBottom.x -= margin;
        break;
      case 'right':
        leftTop = this.getSpecialCoordinate('top-right');
        leftTop.x += margin;

        rightBottom = this.getSpecialCoordinate('bottom-right');

        if (!width) {
          rightBottom.x += this.width + margin;
        } else {
          rightBottom.x += width + margin;
        }
        break;
      default:
        throw Error('Invalid position specified.');
    }

    return newRectangle({leftTop, rightBottom})
  }

  public getArea(): number
  {
    return this.width * this.height;
  }
}
