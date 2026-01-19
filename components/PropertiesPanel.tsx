
import React from 'react';
import { Furniture, Wall, FurnitureType } from '../types';
import { Settings, RotateCw, Trash2, Palette, Ruler } from 'lucide-react';

interface PropertiesPanelProps {
  selectedId: string | null;
  walls: Wall[];
  furniture: Furniture[];
  onUpdateFurniture: (id: string, updates: Partial<Furniture>) => void;
  onDelete: (id: string) => void;
}

const MATERIALS = [
  // Woods
  { id: 'oak', name: 'Oak Wood', color: '#d4b483', type: 'wood' },
  { id: 'walnut', name: 'Walnut Finish', color: '#4e3b31', type: 'wood' },
  { id: 'pine', name: 'Scandinavian Pine', color: '#e8d5b5', type: 'wood' },
  // Fabrics
  { id: 'fabric_grey', name: 'Woven Grey', color: '#8a8a8a', type: 'fabric' },
  { id: 'velvet_navy', name: 'Navy Velvet', color: '#2c3e50', type: 'fabric' },
  { id: 'leather_black', name: 'Aniline Leather', color: '#1a1a1a', type: 'leather' },
  // Metals
  { id: 'metal_chrome', name: 'Polished Chrome', color: '#e8e8e8', type: 'metal' },
  { id: 'metal_brass', name: 'Brushed Brass', color: '#c5a059', type: 'metal' },
  // Stones & Others
  { id: 'marble_white', name: 'Carrara Marble', color: '#f0f0f0', type: 'stone' },
  { id: 'concrete_raw', name: 'Raw Concrete', color: '#959595', type: 'stone' },
  { id: 'plastic_white', name: 'Arctic White', color: '#fefefe', type: 'plastic' },
  { id: 'terracotta', name: 'Terracotta', color: '#c06c4c', type: 'clay' },
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
    <div className="w-full h-full bg-[#0b1120] p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-5">
        <div className="bg-emerald-500/10 p-2 rounded-xl">
          <Settings size={20} className="text-emerald-500" />
        </div>
        <div>
          <h3 className="font-black text-white leading-tight">{selectedFurniture.type}</h3>
          <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest">การปรับแต่งวัตถุ</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-10 pr-1">
        {/* Dimensions */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Ruler size={14} className="text-slate-500" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">ขนาดวัตถุ (ซม.)</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">ความกว้าง</span>
              <input 
                type="number" 
                value={selectedFurniture.width}
                onChange={(e) => onUpdateFurniture(selectedFurniture.id, { width: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:ring-1 focus:ring-emerald-500 outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">ความลึก</span>
              <input 
                type="number" 
                value={selectedFurniture.height}
                onChange={(e) => onUpdateFurniture(selectedFurniture.id, { height: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-3 text-sm font-bold text-white focus:ring-1 focus:ring-emerald-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Rotation Slider - อัปเดตตามคำขอ */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <RotateCw size={14} className="text-slate-500" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">ทิศทางการวาง (องศา)</label>
          </div>
          <div className="bg-slate-900 border border-white/5 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-500 uppercase">องศาปัจจุบัน</span>
              <span className="text-xs font-mono font-black text-white bg-emerald-500 px-3 py-1 rounded-full shadow-lg shadow-emerald-900/40">
                {selectedFurniture.rotation}°
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="359" 
              value={selectedFurniture.rotation}
              onChange={(e) => onUpdateFurniture(selectedFurniture.id, { rotation: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between px-1">
              <span className="text-[9px] font-bold text-slate-600">0°</span>
              <span className="text-[9px] font-bold text-slate-600">180°</span>
              <span className="text-[9px] font-bold text-slate-600">359°</span>
            </div>
          </div>
        </div>

        {/* Material Selection */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Palette size={14} className="text-slate-500" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">วัสดุและพื้นผิว</label>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {MATERIALS.map((mat) => (
              <button
                key={mat.id}
                onClick={() => onUpdateFurniture(selectedFurniture.id, { material: mat.id })}
                title={mat.name}
                className={`group relative aspect-square rounded-2xl border-2 transition-all flex items-center justify-center overflow-hidden ${
                  selectedFurniture.material === mat.id 
                    ? 'border-emerald-500 scale-105 shadow-xl shadow-emerald-900/20' 
                    : 'border-transparent hover:border-white/10'
                }`}
              >
                <div 
                  className="w-full h-full" 
                  style={{ backgroundColor: mat.color }}
                />
                {selectedFurniture.material === mat.id && (
                  <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                  </div>
                )}
                {(mat.type === 'metal' || mat.type === 'stone') && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-tr from-transparent via-white to-transparent" />
                )}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-slate-500 mt-4 font-bold text-center uppercase tracking-widest">
            {MATERIALS.find(m => m.id === selectedFurniture.material)?.name || 'Standard Finish'}
          </p>
        </div>

        <div className="pt-6">
          <button 
            onClick={() => onDelete(selectedFurniture.id)}
            className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[1.5rem] hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-red-900/40"
          >
            <Trash2 size={16} />
            ลบวัตถุนี้ออก
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;