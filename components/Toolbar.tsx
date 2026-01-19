
import React from 'react';
import { 
  MousePointer2, 
  Square, 
  Trash2, 
  Bed, 
  Layout,
  Maximize,
  Sparkles,
  Box,
  Undo2,
  Loader2,
  Camera,
  Palette,
  ChevronDown,
  Search,
  Type as FontIcon,
  Minus,
  Receipt,
  Plus,
  PenTool,
  Grid3X3
} from 'lucide-react';
import { ToolMode, FurnitureType } from '../types';

interface ToolbarProps {
  mode: ToolMode;
  setMode: (mode: ToolMode) => void;
  selectedFurniture: FurnitureType;
  setSelectedFurniture: (type: FurnitureType) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  onVisualize: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onUndo: () => void;
  onImportImage: (file: File) => void;
  isImporting: boolean;
}

const STYLES = ['Modern Luxury', 'Minimalist', 'Scandinavian', 'Industrial', 'Contemporary'];

const Toolbar: React.FC<ToolbarProps> = ({ 
  mode, 
  setMode, 
  selectedFurniture, 
  setSelectedFurniture,
  selectedStyle,
  setSelectedStyle,
  onVisualize,
  onAnalyze,
  isAnalyzing,
  onUndo,
  onImportImage,
  isImporting
}) => {
  const furnitureList = Object.values(FurnitureType);

  return (
    <div className="w-72 bg-[#020617] border-r border-white/5 flex flex-col overflow-hidden z-40">
      {/* Designer Toolbox Search */}
      <div className="p-6 bg-[#020617]">
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-white/5 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500 transition text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-8">
        {/* Foundation Tools */}
        <section>
          <div className="px-6 mb-4 flex items-center justify-between">
            <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Foundation</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 px-6">
            <ToolIconButton active={mode === ToolMode.SELECT} onClick={() => setMode(ToolMode.SELECT)} icon={<MousePointer2 size={16} />} label="Pick" />
            <ToolIconButton active={mode === ToolMode.ROOM} onClick={() => setMode(ToolMode.ROOM)} icon={<Square size={16} />} label="Enclose" />
            <ToolIconButton active={mode === ToolMode.WALL} onClick={() => setMode(ToolMode.WALL)} icon={<PenTool size={16} />} label="Structure" />
            <ToolIconButton active={mode === ToolMode.ERASE} onClick={() => setMode(ToolMode.ERASE)} icon={<Trash2 size={16} />} label="Erase" danger />
          </div>
        </section>

        {/* Blueprint Items */}
        <section>
          <div className="px-6 mb-4">
            <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Blueprint Library</h2>
          </div>
          <div className="px-4 space-y-1">
              {furnitureList.map(type => (
                <button 
                  key={type}
                  onClick={() => {
                    setMode(ToolMode.FURNITURE);
                    setSelectedFurniture(type);
                  }}
                  className={`w-full text-left px-5 py-3 rounded-xl text-[11px] font-bold transition flex items-center gap-4 ${selectedFurniture === type && mode === ToolMode.FURNITURE ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${selectedFurniture === type && mode === ToolMode.FURNITURE ? 'bg-white' : 'bg-slate-700'}`} />
                  {type}
                </button>
              ))}
          </div>
        </section>

        {/* AI Synthesis Style */}
        <section className="px-6">
           <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
             <Sparkles size={14} /> Studio Style
           </h2>
           <div className="space-y-1.5">
             {STYLES.map(style => (
               <button
                 key={style}
                 onClick={() => setSelectedStyle(style)}
                 className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-between border ${selectedStyle === style ? 'bg-slate-800 border-emerald-500/50 text-white shadow-xl' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
               >
                 {style}
                 {selectedStyle === style && <div className="w-1 h-1 bg-emerald-500 rounded-full" />}
               </button>
             ))}
           </div>
        </section>
      </div>

      <div className="p-6 bg-slate-950 border-t border-white/5 space-y-3">
        <button onClick={onAnalyze} disabled={isAnalyzing} className="group w-full flex items-center justify-center gap-3 bg-slate-900 text-slate-300 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white transition shadow-lg border border-white/5">
          <Receipt size={16} className="group-hover:rotate-12 transition-transform" /> Budget Intel
        </button>
        <button onClick={onVisualize} className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition shadow-xl shadow-emerald-900/20">
          <Maximize size={16} /> Synthesis Render
        </button>
      </div>
    </div>
  );
};

const ToolIconButton = ({ active, onClick, icon, label, danger = false }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all duration-300 ${active ? (danger ? 'bg-red-500 border-red-400 shadow-lg text-white' : 'bg-emerald-500 border-emerald-400 shadow-lg text-white') : 'bg-slate-900 border-white/5 text-slate-500 hover:border-emerald-500/30 hover:text-slate-300'}`}
  >
    {icon}
    <span className="text-[9px] mt-2 font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default Toolbar;
