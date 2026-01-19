
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
  CABINET = 'Cabinet',
  PLANT = 'Plant',
  TV = 'Television'
}

export interface Furniture {
  id: string;
  type: FurnitureType;
  position: Point;
  rotation: number;
  width: number;
  height: number;
  material?: string;
}

export enum ToolMode {
  SELECT = 'SELECT',
  WALL = 'WALL',
  ROOM = 'ROOM',
  FURNITURE = 'FURNITURE',
  ERASE = 'ERASE',
  MEASURE = 'MEASURE'
}

export interface ProjectReport {
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    estimatedPrice: number;
    description: string;
  }>;
  totalEstimate: number;
  summary: string;
}
