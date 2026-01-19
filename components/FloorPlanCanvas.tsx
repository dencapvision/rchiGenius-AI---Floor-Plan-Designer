
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
  const [currentMousePos, setCurrentMousePos] = useState<Point>({ x: 0, y: 0 });
  
  // Measure state
  const [measurePoints, setMeasurePoints] = useState<{ start: Point | null, end: Point | null }>({ start: null, end: null });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clear measure points when switching tools
  useEffect(() => {
    setMeasurePoints({ start: null, end: null });
  }, [mode]);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: Math.round((clientX - rect.left) / GRID_SIZE) * GRID_SIZE,
      y: Math.round((clientY - rect.top) / GRID_SIZE) * GRID_SIZE
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    
    if (mode === ToolMode.MEASURE) {
      if (!measurePoints.start || (measurePoints.start && measurePoints.end)) {
        // Start a fresh measurement
        setMeasurePoints({ start: pos, end: null });
      } else {
        // Finalize measurement
        setMeasurePoints(prev => ({ ...prev, end: pos }));
      }
      return;
    }

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
    setCurrentMousePos(pos);
    
    if (mode === ToolMode.MEASURE && measurePoints.start && !measurePoints.end) {
      // Dynamic update for measure preview is handled by currentMousePos
    }

    if (draggingId) {
      setFurniture(prev => prev.map(f => f.id === draggingId ? { ...f, position: { x: pos.x - dragOffset.x, y: pos.y - dragOffset.y } } : f));
    } else if (isDrawing) {
      // Logic managed by currentMousePos state
    }
  };

  const handleMouseUp = () => {
    if (mode === ToolMode.MEASURE) return;

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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] relative">
      <div className="flex-1 relative overflow-auto no-scrollbar p-12">
        <div className="min-w-[2400px] min-h-[2400px] bg-[#0b1120] relative shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[3rem] overflow-hidden" ref={containerRef}>
          {/* Subtle Grid */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          {backgroundImage && (
            <img 
              src={backgroundImage} 
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
              style={{ opacity: bgOpacity }}
              alt="Blueprint"
            />
          )}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full cursor-crosshair z-10"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Walls with auto-dimension labels */}
            {walls.map((wall) => {
              const midX = (wall.start.x + wall.end.x) / 2;
              const midY = (wall.start.y + wall.end.y) / 2;
              const pixels = Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
              const length = (pixels * PIXELS_TO_METERS).toFixed(2);
              return (
                <g key={wall.id}>
                  <line x1={wall.start.x} y1={wall.start.y} x2={wall.end.x} y2={wall.end.y} stroke="#334155" strokeWidth={wall.thickness} strokeLinecap="round" />
                  <line x1={wall.start.x} y1={wall.start.y} x2={wall.end.x} y2={wall.end.y} stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" />
                  <g transform={`translate(${midX}, ${midY - 12})`}>
                    <rect x="-20" y="-8" width="40" height="16" rx="4" fill="#0b1120" stroke="#10b981" strokeWidth="1" />
                    <text textAnchor="middle" dominantBaseline="middle" className="text-[9px] fill-emerald-500 font-black">
                      {length}m
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Furniture Ghost (Preview while moving or placing) */}
            {mode === ToolMode.FURNITURE && !draggingId && (
               <g transform={`translate(${currentMousePos.x}, ${currentMousePos.y})`} className="pointer-events-none opacity-40">
                  <rect x="-60" y="-40" width="120" height="80" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" rx="12" />
                  <text y={5} textAnchor="middle" className="text-[8px] fill-emerald-500 font-black uppercase tracking-widest">กดเพื่อวาง {selectedFurnitureType}</text>
               </g>
            )}

            {/* Measure Tool Rendering */}
            {measurePoints.start && (
              <g pointerEvents="none">
                <circle cx={measurePoints.start.x} cy={measurePoints.start.y} r="6" fill="#06b6d4" />
                { (measurePoints.end || (mode === ToolMode.MEASURE && !measurePoints.end)) && (
                  <>
                    <line 
                      x1={measurePoints.start.x} 
                      y1={measurePoints.start.y} 
                      x2={measurePoints.end ? measurePoints.end.x : currentMousePos.x} 
                      y2={measurePoints.end ? measurePoints.end.y : currentMousePos.y} 
                      stroke="#06b6d4" 
                      strokeWidth="3" 
                      strokeDasharray="6 4" 
                    />
                    <circle 
                      cx={measurePoints.end ? measurePoints.end.x : currentMousePos.x} 
                      cy={measurePoints.end ? measurePoints.end.y : currentMousePos.y} 
                      r="6" 
                      fill="#06b6d4" 
                    />
                    <g transform={`translate(${(measurePoints.start.x + (measurePoints.end ? measurePoints.end.x : currentMousePos.x)) / 2}, ${(measurePoints.start.y + (measurePoints.end ? measurePoints.end.y : currentMousePos.y)) / 2 - 20})`}>
                      <rect x="-30" y="-12" width="60" height="24" rx="8" fill="#0b1120" stroke="#06b6d4" strokeWidth="2" />
                      <text textAnchor="middle" dominantBaseline="middle" className="text-[11px] fill-cyan-400 font-black">
                        {(Math.hypot(
                          (measurePoints.end ? measurePoints.end.x : currentMousePos.x) - measurePoints.start.x, 
                          (measurePoints.end ? measurePoints.end.y : currentMousePos.y) - measurePoints.start.y
                        ) * PIXELS_TO_METERS).toFixed(2)}m
                      </text>
                    </g>
                  </>
                )}
              </g>
            )}

            {/* Visual Furniture blocks */}
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
                    fillOpacity={isSelected ? "0.2" : "0.5"} 
                    stroke={isSelected ? "#10b981" : "#475569"} 
                    strokeWidth={isSelected ? "3" : "1.5"} 
                    rx="12" 
                    className="transition-all duration-300"
                  />
                  <text y={5} textAnchor="middle" className={`text-[9px] font-black uppercase pointer-events-none tracking-[0.15em] ${isSelected ? 'fill-emerald-400' : 'fill-slate-500'}`}>
                    {f.type}
                  </text>
                  {isSelected && (
                    <g transform={`translate(0, ${f.height/2 + 20})`} rotate={-f.rotation}>
                       <text textAnchor="middle" className="text-[8px] fill-emerald-500/50 font-black uppercase">
                        {(f.width * 0.01).toFixed(1)}m x {(f.height * 0.01).toFixed(1)}m
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Drawing interaction feedback */}
            {isDrawing && startPoint && currentMousePos && (
              <g>
                {mode === ToolMode.ROOM ? (
                   <rect 
                    x={Math.min(startPoint.x, currentMousePos.x)} 
                    y={Math.min(startPoint.y, currentMousePos.y)}
                    width={Math.abs(currentMousePos.x - startPoint.x)}
                    height={Math.abs(currentMousePos.y - startPoint.y)}
                    fill="rgba(16, 185, 129, 0.1)"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    rx="4"
                   />
                ) : (
                  <>
                    <line x1={startPoint.x} y1={startPoint.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke="#10b981" strokeWidth="3" strokeDasharray="8 4" />
                    <circle cx={startPoint.x} cy={startPoint.y} r="5" fill="#10b981" />
                    <circle cx={currentMousePos.x} cy={currentMousePos.y} r="5" fill="#10b981" />
                  </>
                )}
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
