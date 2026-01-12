
import React from 'react';
import { Furniture, Wall, FurnitureType } from '../types';
import { Settings, RotateCw, Trash2, Palette } from 'lucide-react';

interface PropertiesPanelProps {
  selectedId: string | null;
  walls: Wall[];
  furniture: Furniture[];
  onUpdateFurniture: (id: string, updates: Partial<Furniture>) => void;
  onDelete: (id: string) => void;
}

const MATERIALS = [
  { id: 'oak', name: 'Oak Wood', color: '#e5c08b', type: 'wood' },
  { id: 'walnut', name: 'Walnut', color: '#5d4037', type: 'wood' },
  { id: 'fabric_grey', name: 'Grey Fabric', color: '#9e9e9e', type: 'fabric' },
  { id: 'velvet_navy', name: 'Navy Velvet', color: '#1a237e', type: 'fabric' },
  { id: 'leather_black', name: 'Black Leather', color: '#212121', type: 'leather' },
  { id: 'metal_chrome', name: 'Chrome', color: '#cfd8dc', type: 'metal' },
  { id: 'plastic_white', name: 'White Gloss', color: '#ffffff', type: 'plastic' },
];

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedId,
  furniture,
  onUpdateFurniture,
  onDelete
}) => {
  const selectedFurniture = furniture.find(f => f.id === selectedId);
  
  if (!selectedFurniture) return null;

  return (
    <div className="fixed top-6 right-6 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-[2.5rem] p-8 z-40 animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
        <div className="bg-slate-100 p-2 rounded-xl">
          <Settings size={20} className="text-slate-600" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 leading-tight">{selectedFurniture.type}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Component Settings</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Dimensions */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Dimensions (cm)</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-medium ml-1">Width</span>
              <input 
                type="number" 
                value={selectedFurniture.width}
                onChange={(e) => onUpdateFurniture(selectedFurniture.id, { width: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-medium ml-1">Depth</span>
              <input 
                type="number" 
                value={selectedFurniture.height}
                onChange={(e) => onUpdateFurniture(selectedFurniture.id, { height: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Orientation</label>
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
            <RotateCw size={16} className="text-slate-400" />
            <input 
              type="range" 
              min="0" 
              max="359" 
              value={selectedFurniture.rotation}
              onChange={(e) => onUpdateFurniture(selectedFurniture.id, { rotation: parseInt(e.target.value) })}
              className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg w-12 text-center">{selectedFurniture.rotation}°</span>
          </div>
        </div>

        {/* Material Selection */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette size={14} className="text-slate-400" />
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Material & Finish</label>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {MATERIALS.map((mat) => (
              <button
                key={mat.id}
                onClick={() => onUpdateFurniture(selectedFurniture.id, { material: mat.id })}
                title={mat.name}
                className={`group relative aspect-square rounded-2xl border-2 transition-all flex items-center justify-center overflow-hidden ${
                  selectedFurniture.material === mat.id 
                    ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-100' 
                    : 'border-transparent hover:border-slate-200'
                }`}
              >
                <div 
                  className="w-full h-full" 
                  style={{ backgroundColor: mat.color }}
                />
                {selectedFurniture.material === mat.id && (
                  <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium text-center italic">
            {MATERIALS.find(m => m.id === selectedFurniture.material)?.name || 'Default Finish'}
          </p>
        </div>

        <button 
          onClick={() => onDelete(selectedFurniture.id)}
          className="w-full flex items-center justify-center gap-2 py-4 border border-red-100 bg-red-50/50 text-red-500 rounded-2xl hover:bg-red-50 hover:text-red-600 transition font-black text-xs uppercase tracking-widest"
        >
          <Trash2 size={16} />
          Discard Component
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;
