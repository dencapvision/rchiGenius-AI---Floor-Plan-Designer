
import React from 'react';
import { Furniture, Wall, FurnitureType } from '../types';
import { Settings, RotateCw, MoveDiagonal, Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  selectedId: string | null;
  walls: Wall[];
  furniture: Furniture[];
  onUpdateFurniture: (id: string, updates: Partial<Furniture>) => void;
  onDelete: (id: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedId,
  walls,
  furniture,
  onUpdateFurniture,
  onDelete
}) => {
  const selectedFurniture = furniture.find(f => f.id === selectedId);
  
  if (!selectedFurniture) return null;

  return (
    <div className="fixed top-6 right-6 w-72 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl p-6 z-40 animate-in slide-in-from-right-4">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <Settings size={18} className="text-slate-400" />
        <h3 className="font-bold text-slate-800">Properties: {selectedFurniture.type}</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Dimensions (cm)</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500">Width</span>
              <input 
                type="number" 
                value={selectedFurniture.width}
                onChange={(e) => onUpdateFurniture(selectedFurniture.id, { width: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500">Depth</span>
              <input 
                type="number" 
                value={selectedFurniture.height}
                onChange={(e) => onUpdateFurniture(selectedFurniture.id, { height: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Rotation</label>
          <div className="flex items-center gap-4">
            <RotateCw size={16} className="text-slate-400" />
            <input 
              type="range" 
              min="0" 
              max="359" 
              value={selectedFurniture.rotation}
              onChange={(e) => onUpdateFurniture(selectedFurniture.id, { rotation: parseInt(e.target.value) })}
              className="flex-1 accent-blue-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-600">{selectedFurniture.rotation}°</span>
          </div>
        </div>

        <button 
          onClick={() => onDelete(selectedFurniture.id)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-red-100 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-bold text-sm"
        >
          <Trash2 size={16} />
          Remove Item
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
