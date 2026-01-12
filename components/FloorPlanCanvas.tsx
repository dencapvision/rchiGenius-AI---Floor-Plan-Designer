
import React, { useState, useRef, useEffect } from 'react';
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
}

const PIXELS_TO_METERS = 0.05; // 20px = 1m

const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({ 
  mode, 
  walls, 
  setWalls, 
  furniture, 
  setFurniture,
  selectedFurnitureType,
  selectedId,
  setSelectedId
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Snapping to grid 20px
    return {
      x: Math.round((clientX - rect.left) / 20) * 20,
      y: Math.round((clientY - rect.top) / 20) * 20
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    
    if (mode === ToolMode.SELECT) {
      // Find furniture under click
      const found = furniture.find(f => {
        const dist = Math.hypot(f.position.x - pos.x, f.position.y - pos.y);
        return dist < 30;
      });
      setSelectedId(found ? found.id : null);
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
        width: selectedFurnitureType === FurnitureType.BED ? 100 : 60,
        height: selectedFurnitureType === FurnitureType.BED ? 120 : 40
      };
      setFurniture([...furniture, newFurniture]);
      setSelectedId(newFurniture.id);
    } else if (mode === ToolMode.ERASE) {
      setWalls(walls.filter(w => {
        const distStart = Math.hypot(w.start.x - pos.x, w.start.y - pos.y);
        const distEnd = Math.hypot(w.end.x - pos.x, w.end.y - pos.y);
        return distStart > 15 && distEnd > 15;
      }));
      setFurniture(furniture.filter(f => {
        const dist = Math.hypot(f.position.x - pos.x, f.position.y - pos.y);
        return dist > 30;
      }));
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing) {
      setCurrentMousePos(getMousePos(e));
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && startPoint && currentMousePos) {
      const dx = Math.abs(currentMousePos.x - startPoint.x);
      const dy = Math.abs(currentMousePos.y - startPoint.y);

      if (dx > 5 || dy > 5) {
        if (mode === ToolMode.ROOM) {
          // Draw 4 walls
          const w1: Wall = { id: Math.random().toString(), start: startPoint, end: { x: currentMousePos.x, y: startPoint.y }, thickness: 8 };
          const w2: Wall = { id: Math.random().toString(), start: { x: currentMousePos.x, y: startPoint.y }, end: currentMousePos, thickness: 8 };
          const w3: Wall = { id: Math.random().toString(), start: currentMousePos, end: { x: startPoint.x, y: currentMousePos.y }, thickness: 8 };
          const w4: Wall = { id: Math.random().toString(), start: { x: startPoint.x, y: currentMousePos.y }, end: startPoint, thickness: 8 };
          setWalls([...walls, w1, w2, w3, w4]);
        } else {
          const newWall: Wall = {
            id: Math.random().toString(),
            start: startPoint,
            end: currentMousePos,
            thickness: 8
          };
          setWalls([...walls, newWall]);
        }
      }
    }
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentMousePos(null);
  };

  const renderFurniture = (f: Furniture) => {
    const isSelected = selectedId === f.id;
    let color = "#94a3b8"; 
    switch (f.type) {
      case FurnitureType.BED: color = "#6366f1"; break;
      case FurnitureType.SOFA: color = "#ef4444"; break;
      case FurnitureType.TV: color = "#000000"; break;
      case FurnitureType.PLANT: color = "#22c55e"; break;
      default: color = "#3b82f6";
    }

    return (
      <g key={f.id} transform={`translate(${f.position.x}, ${f.position.y}) rotate(${f.rotation})`}>
        <rect 
          x={-f.width/2} 
          y={-f.height/2} 
          width={f.width} 
          height={f.height} 
          fill={color} 
          fillOpacity={isSelected ? "0.4" : "0.15"} 
          stroke={color} 
          strokeWidth={isSelected ? "3" : "1.5"}
          rx="4"
        />
        {isSelected && (
           <rect 
            x={-f.width/2 - 4} 
            y={-f.height/2 - 4} 
            width={f.width + 8} 
            height={f.height + 8} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="1"
            strokeDasharray="4 2"
            rx="6"
          />
        )}
        <text y={4} textAnchor="middle" className="text-[10px] select-none fill-slate-700 font-bold uppercase tracking-tighter">
          {f.type}
        </text>
      </g>
    );
  };

  const getDistanceStr = (p1: Point, p2: Point) => {
    const d = Math.hypot(p1.x - p2.x, p1.y - p2.y) * PIXELS_TO_METERS;
    return `${d.toFixed(1)}m`;
  };

  return (
    <div className="flex-1 bg-white relative overflow-hidden grid-background h-screen">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <rect width="100%" height="100%" fill="url(#grid)" />

        {walls.map((wall) => (
          <line
            key={wall.id}
            x1={wall.start.x}
            y1={wall.start.y}
            x2={wall.end.x}
            y2={wall.end.y}
            stroke="#1e293b"
            strokeWidth={wall.thickness}
            strokeLinecap="round"
          />
        ))}

        {furniture.map(f => renderFurniture(f))}

        {isDrawing && startPoint && currentMousePos && (
          <g>
            {mode === ToolMode.ROOM ? (
              <rect
                x={Math.min(startPoint.x, currentMousePos.x)}
                y={Math.min(startPoint.y, currentMousePos.y)}
                width={Math.abs(startPoint.x - currentMousePos.x)}
                height={Math.abs(startPoint.y - currentMousePos.y)}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            ) : (
              <line
                x1={startPoint.x}
                y1={startPoint.y}
                x2={currentMousePos.x}
                y2={currentMousePos.y}
                stroke="#3b82f6"
                strokeWidth="4"
                strokeDasharray="4 2"
              />
            )}
            <text 
              x={(startPoint.x + currentMousePos.x)/2} 
              y={(startPoint.y + currentMousePos.y)/2 - 10}
              className="text-xs font-bold fill-blue-600 select-none"
              textAnchor="middle"
            >
              {getDistanceStr(startPoint, currentMousePos)}
            </text>
          </g>
        )}
      </svg>
      
      <div className="absolute bottom-6 left-6 flex gap-4 pointer-events-none">
        <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
          Mode: {mode}
        </div>
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
