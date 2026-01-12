
import React from 'react';
import { 
  MousePointer2, 
  Square, 
  Trash2, 
  Bed, 
  Layout,
  Maximize,
  Sparkles
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
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  mode, 
  setMode, 
  selectedFurniture, 
  setSelectedFurniture,
  onVisualize,
  onAnalyze,
  isAnalyzing
}) => {
  const furnitureList = Object.values(FurnitureType);

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col border-r border-slate-700 shadow-xl overflow-y-auto no-scrollbar">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Layout className="text-blue-400" />
          ArchiGenius
        </h1>
        <p className="text-xs text-slate-400">AI-Powered Floor Plan</p>
      </div>

      <div className="px-4 space-y-6">
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Drawing Tools</h2>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setMode(ToolMode.SELECT)}
              className={`flex flex-col items-center p-3 rounded-lg transition ${mode === ToolMode.SELECT ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <MousePointer2 size={20} />
              <span className="text-[10px] mt-1">Select</span>
            </button>
            <button 
              onClick={() => setMode(ToolMode.WALL)}
              className={`flex flex-col items-center p-3 rounded-lg transition ${mode === ToolMode.WALL ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <Square size={20} />
              <span className="text-[10px] mt-1">Wall</span>
            </button>
            <button 
              onClick={() => setMode(ToolMode.FURNITURE)}
              className={`flex flex-col items-center p-3 rounded-lg transition ${mode === ToolMode.FURNITURE ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <Bed size={20} />
              <span className="text-[10px] mt-1">Object</span>
            </button>
            <button 
              onClick={() => setMode(ToolMode.ERASE)}
              className={`flex flex-col items-center p-3 rounded-lg transition ${mode === ToolMode.ERASE ? 'bg-red-600' : 'bg-slate-800 hover:bg-slate-700'}`}
            >
              <Trash2 size={20} />
              <span className="text-[10px] mt-1">Erase</span>
            </button>
          </div>
        </section>

        {mode === ToolMode.FURNITURE && (
          <section className="animate-in slide-in-from-left-4 duration-300">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Furniture Library</h2>
            <div className="space-y-1">
              {furnitureList.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFurniture(type)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition ${selectedFurniture === type ? 'bg-slate-700 border-l-4 border-blue-500' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="pt-4 border-t border-slate-700 space-y-3 pb-8">
          <button 
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            <Sparkles size={18} />
            {isAnalyzing ? "Analyzing..." : "AI Analysis"}
          </button>
          <button 
            onClick={onVisualize}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 py-3 rounded-lg font-medium hover:bg-white transition"
          >
            <Maximize size={18} />
            3D Visualize
          </button>
        </section>
      </div>
    </div>
  );
};

export default Toolbar;
