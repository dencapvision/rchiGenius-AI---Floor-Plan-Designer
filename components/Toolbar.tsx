
import React, { useRef } from 'react';
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
  ImagePlus,
  Loader2
} from 'lucide-react';
import { ToolMode, FurnitureType } from '../types';

interface ToolbarProps {
  mode: ToolMode;
  setMode: (mode: ToolMode) => void;
  selectedFurniture: FurnitureType;
  setSelectedFurniture: (type: FurnitureType) => void;
  onVisualize: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onUndo: () => void;
  onImportImage: (file: File) => void;
  isImporting: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  mode, 
  setMode, 
  selectedFurniture, 
  setSelectedFurniture,
  onVisualize,
  onAnalyze,
  isAnalyzing,
  onUndo,
  onImportImage,
  isImporting
}) => {
  const furnitureList = Object.values(FurnitureType);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportImage(file);
    }
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col border-r border-slate-700 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2 mb-1">
          <Box className="text-blue-400" />
          ArchiGenius
        </h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pro AI Planner</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6 space-y-6">
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</h2>
            <div className="flex gap-2">
              <button onClick={onUndo} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition">
                <Undo2 size={14} />
              </button>
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 transition mb-4 text-xs font-bold"
          >
            {isImporting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <ImagePlus size={16} />
            )}
            {isImporting ? "Processing..." : "Import Image Plan"}
          </button>

          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tools</h2>
          <div className="grid grid-cols-2 gap-2">
            <ToolButton 
              active={mode === ToolMode.SELECT} 
              onClick={() => setMode(ToolMode.SELECT)} 
              icon={<MousePointer2 size={18} />} 
              label="Select" 
            />
            <ToolButton 
              active={mode === ToolMode.ROOM} 
              onClick={() => setMode(ToolMode.ROOM)} 
              icon={<Square size={18} />} 
              label="Room" 
            />
            <ToolButton 
              active={mode === ToolMode.WALL} 
              onClick={() => setMode(ToolMode.WALL)} 
              icon={<Layout size={18} />} 
              label="Wall" 
            />
            <ToolButton 
              active={mode === ToolMode.ERASE} 
              onClick={() => setMode(ToolMode.ERASE)} 
              icon={<Trash2 size={18} />} 
              label="Erase" 
              danger
            />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Components</h2>
          <button 
            onClick={() => setMode(ToolMode.FURNITURE)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition mb-2 ${mode === ToolMode.FURNITURE ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            <Bed size={18} />
            <span className="text-sm font-medium">Add Furniture</span>
          </button>
          
          {mode === ToolMode.FURNITURE && (
            <div className="grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {furnitureList.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFurniture(type)}
                  className={`text-left px-3 py-2 rounded text-xs transition ${selectedFurniture === type ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  • {type}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
        <button 
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 py-3 rounded-xl text-sm font-bold hover:bg-indigo-500 transition disabled:opacity-50"
        >
          <Sparkles size={16} />
          {isAnalyzing ? "Analyzing..." : "AI Technical Fix"}
        </button>
        <button 
          onClick={onVisualize}
          className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 transition shadow-lg"
        >
          <Maximize size={16} />
          Visualizer
        </button>
      </div>
    </div>
  );
};

const ToolButton = ({ active, onClick, icon, label, danger = false }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 rounded-xl transition gap-1 ${
      active 
        ? (danger ? 'bg-red-600 text-white' : 'bg-blue-600 text-white') 
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default Toolbar;
