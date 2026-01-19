
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
  backgroundImage: string | null;
  bgOpacity: number;
}

const PIXELS_TO_METERS = 0.05;
const GRID_SIZE = 20;

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
  const containerRef = useRef<HTMLDivElement>(null);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.round((clientX - rect.left) / GRID_SIZE) * GRID_SIZE,
      y: Math.round((clientY - rect.top) / GRID_SIZE) * GRID_SIZE
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
        width: 120,
        height: 80
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
        if (startPoint.x !== currentMousePos.x || startPoint.y !== currentMousePos.y) {
          setWalls([...walls, { id: Math.random().toString(), start: startPoint, end: currentMousePos, thickness: 8 }]);
        }
      }
    }
    setIsDrawing(false);
    setDraggingId(null);
  };

  const renderRulers = () => {
    const topTicks = [];
    const leftTicks = [];
    for (let i = 0; i < 2000; i += GRID_SIZE) {
      const isMajor = i % (GRID_SIZE * 5) === 0;
      topTicks.push(
        <div key={`t-${i}`} className="flex flex-col items-center" style={{ width: GRID_SIZE, flexShrink: 0 }}>
          <div className={`w-px ${isMajor ? 'h-3 bg-emerald-500/50' : 'h-1.5 bg-slate-800'}`} />
          {isMajor && <span className="text-[7px] text-slate-600 font-black mt-1">{(i * PIXELS_TO_METERS).toFixed(0)}</span>}
        </div>
      );
      leftTicks.push(
        <div key={`l-${i}`} className="flex items-center justify-end pr-1" style={{ height: GRID_SIZE, flexShrink: 0 }}>
          {isMajor && <span className="text-[7px] text-slate-600 font-black mr-1">{(i * PIXELS_TO_METERS).toFixed(0)}</span>}
          <div className={`h-px ${isMajor ? 'w-3 bg-emerald-500/50' : 'w-1.5 bg-slate-800'}`} />
        </div>
      );
    }
    return { topTicks, leftTicks };
  };

  const { topTicks, leftTicks } = renderRulers();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b1120]">
      {/* Designer Ruler */}
      <div className="h-6 flex border-b border-white/5 bg-[#0b1120]">
        <div className="w-6 border-r border-white/5 bg-slate-950 shrink-0" />
        <div className="flex-1 flex items-start overflow-hidden opacity-50">
           {topTicks}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Designer Side Ruler */}
        <div className="w-6 flex flex-col bg-[#0b1120] border-r border-white/5 overflow-hidden opacity-50">
           {leftTicks}
        </div>

        {/* Workspace Obsidian */}
        <div className="flex-1 relative overflow-auto bg-[#020617] p-8 no-scrollbar">
          <div className="min-w-[2000px] min-h-[2000px] bg-[#0b1120] relative shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden" ref={containerRef}>
            {/* Emerald Grid Effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            {backgroundImage && (
              <img 
                src={backgroundImage} 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
                style={{ opacity: bgOpacity }}
                alt="Architecture Blueprint"
              />
            )}
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full cursor-crosshair z-10"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* Engineering Walls */}
              {walls.map((wall) => {
                const midX = (wall.start.x + wall.end.x) / 2;
                const midY = (wall.start.y + wall.end.y) / 2;
                const pixels = Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
                const length = (pixels * PIXELS_TO_METERS).toFixed(2);
                return (
                  <g key={wall.id}>
                    <line x1={wall.start.x} y1={wall.start.y} x2={wall.end.x} y2={wall.end.y} stroke="#334155" strokeWidth={wall.thickness} strokeLinecap="round" />
                    <line x1={wall.start.x} y1={wall.start.y} x2={wall.end.x} y2={wall.end.y} stroke="#10b981" strokeWidth="1" strokeOpacity="0.3" />
                    <g transform={`translate(${midX}, ${midY - 10})`}>
                      <rect x="-18" y="-7" width="36" height="14" rx="4" fill="#020617" stroke="#10b981" strokeWidth="0.5" />
                      <text textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-emerald-500 font-black tracking-tighter">
                        {length}m
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Designer Furniture Icons */}
              {furniture.map(f => {
                const isSelected = selectedId === f.id;
                return (
                  <g key={f.id} transform={`translate(${f.position.x}, ${f.position.y}) rotate(${f.rotation})`}>
                    <rect 
                      x={-f.width/2} 
                      y={-f.height/2} 
                      width={f.width} 
                      height={f.height} 
                      fill={isSelected ? "#10b981" : "#1e293b"} 
                      fillOpacity={isSelected ? "0.15" : "0.4"} 
                      stroke={isSelected ? "#10b981" : "#475569"} 
                      strokeWidth={isSelected ? "2" : "1"} 
                      rx="8" 
                    />
                    <text y={4} textAnchor="middle" className={`text-[8px] font-black uppercase pointer-events-none tracking-widest ${isSelected ? 'fill-emerald-400' : 'fill-slate-500'}`}>
                      {f.type}
                    </text>
                    {isSelected && (
                      <g transform={`translate(0, ${f.height/2 + 15})`} rotate={-f.rotation}>
                        <rect x="-35" y="-9" width="70" height="18" rx="6" fill="#10b981" />
                        <text textAnchor="middle" dominantBaseline="middle" className="text-[8px] fill-white font-black uppercase tracking-tighter">
                          {(f.width * 0.01).toFixed(1)}x{(f.height * 0.01).toFixed(1)}m
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Studio Draw Preview */}
              {isDrawing && startPoint && currentMousePos && (
                <g>
                  <line x1={startPoint.x} y1={startPoint.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke="#10b981" strokeWidth="2" strokeDasharray="6 4" />
                  <circle cx={startPoint.x} cy={startPoint.y} r="4" fill="#10b981" />
                  <circle cx={currentMousePos.x} cy={currentMousePos.y} r="4" fill="#10b981" />
                  <g transform={`translate(${(startPoint.x + currentMousePos.x) / 2}, ${(startPoint.y + currentMousePos.y) / 2 - 20})`}>
                    <rect x="-25" y="-10" width="50" height="20" rx="6" fill="#10b981" shadow="0 10px 15px rgba(16,185,129,0.3)" />
                    <text textAnchor="middle" dominantBaseline="middle" className="text-[9px] fill-white font-black tracking-tighter">
                      {(Math.hypot(currentMousePos.x - startPoint.x, currentMousePos.y - startPoint.y) * PIXELS_TO_METERS).toFixed(2)}m
                    </text>
                  </g>
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
