
import React, { useState, useRef, useEffect } from 'react';
import { Wall, Point, ToolMode, Furniture, FurnitureType } from '../types';

interface FloorPlanCanvasProps {
  mode: ToolMode;
  walls: Wall[];
  setWalls: React.Dispatch<React.SetStateAction<Wall[]>>;
  furniture: Furniture[];
  setFurniture: React.Dispatch<React.SetStateAction<Furniture[]>>;
  selectedFurnitureType: FurnitureType;
}

const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({ 
  mode, 
  walls, 
  setWalls, 
  furniture, 
  setFurniture,
  selectedFurnitureType
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
    
    // Snap to grid (20px)
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;
    return {
      x: Math.round(rawX / 20) * 20,
      y: Math.round(rawY / 20) * 20
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    if (mode === ToolMode.WALL) {
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
    } else if (mode === ToolMode.ERASE) {
      // Logic for erasing could be complex with hit testing, 
      // simplified: remove if close to center/start/end
      setWalls(walls.filter(w => {
        const distStart = Math.hypot(w.start.x - pos.x, w.start.y - pos.y);
        const distEnd = Math.hypot(w.end.x - pos.x, w.end.y - pos.y);
        return distStart > 15 && distEnd > 15;
      }));
      setFurniture(furniture.filter(f => {
        const dist = Math.hypot(f.position.x - pos.x, f.position.y - pos.y);
        return dist > 30;
      }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing) {
      setCurrentMousePos(getMousePos(e));
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && startPoint && currentMousePos) {
      if (startPoint.x !== currentMousePos.x || startPoint.y !== currentMousePos.y) {
        const newWall: Wall = {
          id: Math.random().toString(36).substr(2, 9),
          start: startPoint,
          end: currentMousePos,
          thickness: 8
        };
        setWalls([...walls, newWall]);
      }
    }
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentMousePos(null);
  };

  const renderFurniture = (f: Furniture) => {
    const { position, type, rotation, width, height } = f;
    let color = "#94a3b8"; // Default slate-400
    
    switch (type) {
      case FurnitureType.BED: color = "#60a5fa"; break;
      case FurnitureType.SOFA: color = "#f87171"; break;
      case FurnitureType.TABLE: color = "#fbbf24"; break;
      case FurnitureType.DOOR: color = "#4ade80"; break;
      case FurnitureType.WINDOW: color = "#2dd4bf"; break;
    }

    return (
      <g key={f.id} transform={`translate(${position.x}, ${position.y}) rotate(${rotation})`}>
        <rect 
          x={-width/2} 
          y={-height/2} 
          width={width} 
          height={height} 
          fill={color} 
          fillOpacity="0.2" 
          stroke={color} 
          strokeWidth="2"
          rx="4"
        />
        <text 
          y={5} 
          textAnchor="middle" 
          className="text-[10px] select-none fill-slate-600 font-medium"
        >
          {type}
        </text>
      </g>
    );
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
        {/* Render Grid Helpers */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Existing Walls */}
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

        {/* Furniture */}
        {furniture.map(f => renderFurniture(f))}

        {/* Current Wall Being Drawn */}
        {isDrawing && startPoint && currentMousePos && (
          <line
            x1={startPoint.x}
            y1={startPoint.y}
            x2={currentMousePos.x}
            y2={currentMousePos.y}
            stroke="#3b82f6"
            strokeWidth="4"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        )}
      </svg>
      
      <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 text-xs text-slate-500 shadow-sm pointer-events-none">
        {mode === ToolMode.WALL ? 'Click and drag to draw a wall' : mode === ToolMode.FURNITURE ? `Click to place ${selectedFurnitureType}` : 'Use toolbar to select tools'} (Grid Snap: 20px)
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
