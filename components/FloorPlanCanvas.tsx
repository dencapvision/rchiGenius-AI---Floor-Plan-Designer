
import React, { useState, useRef } from 'react';
import { Wall, Point, ToolMode, Furniture, FurnitureType } from '../types';

interface FloorPlanCanvasProps {
  mode: ToolMode;
  walls: Wall[];
  setWalls: React.Dispatch<React.SetStateAction<Wall[]>>;
  furniture: Furniture[];
  setFurniture: React.Dispatch<React.SetStateAction<Furniture[]>>;
  selectedFurnitureType: FurnitureType;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  backgroundImage: string | null;
  bgOpacity: number;
}

const PIXELS_TO_METERS = 0.05;

const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({ 
  mode, 
  walls, 
  setWalls, 
  furniture, 
  setFurniture,
  selectedFurnitureType,
  selectedId,
  setSelectedId,
  backgroundImage,
  bgOpacity
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.round((clientX - rect.left) / 20) * 20,
      y: Math.round((clientY - rect.top) / 20) * 20
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    if (mode === ToolMode.SELECT) {
      const found = furniture.find(f => {
        const dx = Math.abs(f.position.x - pos.x);
        const dy = Math.abs(f.position.y - pos.y);
        return dx < f.width / 2 + 10 && dy < f.height / 2 + 10;
      });
      if (found) {
        setSelectedId(found.id);
        setDraggingId(found.id);
        setDragOffset({ x: pos.x - found.position.x, y: pos.y - found.position.y });
      } else {
        setSelectedId(null);
      }
      return;
    }
    if (mode === ToolMode.WALL || mode === ToolMode.ROOM) {
      setIsDrawing(true);
      setStartPoint(pos);
      setCurrentMousePos(pos);
    } else if (mode === ToolMode.FURNITURE) {
      const newFurniture: Furniture = {
        id: Math.random().toString(36).substr(2, 9),
        type: selectedFurnitureType,
        position: pos,
        rotation: 0,
        width: 60,
        height: 40
      };
      setFurniture([...furniture, newFurniture]);
      setSelectedId(newFurniture.id);
    } else if (mode === ToolMode.ERASE) {
      setWalls(walls.filter(w => Math.hypot(w.start.x - pos.x, w.start.y - pos.y) > 15 && Math.hypot(w.end.x - pos.x, w.end.y - pos.y) > 15));
      setFurniture(furniture.filter(f => Math.hypot(f.position.x - pos.x, f.position.y - pos.y) > 30));
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    if (draggingId) {
      setFurniture(prev => prev.map(f => f.id === draggingId ? { ...f, position: { x: pos.x - dragOffset.x, y: pos.y - dragOffset.y } } : f));
    } else if (isDrawing) {
      setCurrentMousePos(pos);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && startPoint && currentMousePos) {
      if (mode === ToolMode.ROOM) {
        const w1: Wall = { id: Math.random().toString(), start: startPoint, end: { x: currentMousePos.x, y: startPoint.y }, thickness: 8 };
        const w2: Wall = { id: Math.random().toString(), start: { x: currentMousePos.x, y: startPoint.y }, end: currentMousePos, thickness: 8 };
        const w3: Wall = { id: Math.random().toString(), start: currentMousePos, end: { x: startPoint.x, y: currentMousePos.y }, thickness: 8 };
        const w4: Wall = { id: Math.random().toString(), start: { x: startPoint.x, y: currentMousePos.y }, end: startPoint, thickness: 8 };
        setWalls([...walls, w1, w2, w3, w4]);
      } else {
        setWalls([...walls, { id: Math.random().toString(), start: startPoint, end: currentMousePos, thickness: 8 }]);
      }
    }
    setIsDrawing(false);
    setDraggingId(null);
  };

  return (
    <div className="flex-1 bg-white relative overflow-hidden grid-background h-screen">
      {backgroundImage && (
        <img 
          src={backgroundImage} 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
          style={{ opacity: bgOpacity }}
          alt="Background Context"
        />
      )}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-crosshair relative z-10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {walls.map((wall) => (
          <line key={wall.id} x1={wall.start.x} y1={wall.start.y} x2={wall.end.x} y2={wall.end.y} stroke="#1e293b" strokeWidth={wall.thickness} strokeLinecap="round" />
        ))}
        {furniture.map(f => (
          <g key={f.id} transform={`translate(${f.position.x}, ${f.position.y}) rotate(${f.rotation})`}>
            <rect x={-f.width/2} y={-f.height/2} width={f.width} height={f.height} fill="#3b82f6" fillOpacity={selectedId === f.id ? "0.4" : "0.2"} stroke="#3b82f6" strokeWidth="2" rx="4" />
            <text y={4} textAnchor="middle" className="text-[10px] fill-slate-700 font-bold uppercase pointer-events-none">{f.type}</text>
          </g>
        ))}
        {isDrawing && startPoint && currentMousePos && (
          <line x1={startPoint.x} y1={startPoint.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke="#3b82f6" strokeWidth="4" strokeDasharray="4 2" />
        )}
      </svg>
    </div>
  );
};

export default FloorPlanCanvas;
