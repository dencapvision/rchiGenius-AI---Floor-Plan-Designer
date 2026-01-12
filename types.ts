
export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number;
}

export enum FurnitureType {
  BED = 'Bed',
  SOFA = 'Sofa',
  TABLE = 'Table',
  CHAIR = 'Chair',
  DOOR = 'Door',
  WINDOW = 'Window',
  CABINET = 'Cabinet'
}

export interface Furniture {
  id: string;
  type: FurnitureType;
  position: Point;
  rotation: number;
  width: number;
  height: number;
}

export enum ToolMode {
  SELECT = 'SELECT',
  WALL = 'WALL',
  FURNITURE = 'FURNITURE',
  ERASE = 'ERASE'
}

export interface RoomAdvice {
  suggestion: string;
  pros: string[];
  cons: string[];
}
