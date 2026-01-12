
import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import FloorPlanCanvas from './components/FloorPlanCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import { Wall, ToolMode, Furniture, FurnitureType } from './types';
import { getDesignAdvice, generateVisualization } from './services/geminiService';
// Fix: Added missing icon imports Maximize and Sparkles
import { X, Loader2, Info, ChevronRight, Wand2, Maximize, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<ToolMode>(ToolMode.SELECT);
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureType>(FurnitureType.BED);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [furniture, setFurniture] = useState<Furniture[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visualizationUrl, setVisualizationUrl] = useState<string | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const handleUpdateFurniture = (id: string, updates: Partial<Furniture>) => {
    setFurniture(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleDelete = (id: string) => {
    setFurniture(prev => prev.filter(f => f.id !== id));
    setSelectedId(null);
  };

  const handleUndo = () => {
    // Basic undo logic
    if (walls.length > 0) setWalls(walls.slice(0, -1));
  };

  const handleAnalyze = async () => {
    if (walls.length === 0 && furniture.length === 0) return;
    setIsAnalyzing(true);
    setShowAiModal(true);
    const advice = await getDesignAdvice(walls, furniture);
    setAiAdvice(advice);
    setIsAnalyzing(false);
  };

  const handleVisualize = async () => {
    if (walls.length === 0) return;
    setIsVisualizing(true);
    setVisualizationUrl(null);
    setShowAiModal(true);
    
    const description = `A modern architectural room interior. Layout has ${walls.length} wall segments and furniture includes: ${furniture.map(f => f.type).join(', ')}. Use neutral tones, oak wood, and high-end lighting.`;
    const imageUrl = await generateVisualization(description);
    setVisualizationUrl(imageUrl);
    setIsVisualizing(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Toolbar 
        mode={mode} 
        setMode={setMode} 
        selectedFurniture={selectedFurniture}
        setSelectedFurniture={setSelectedFurniture}
        onAnalyze={handleAnalyze}
        onVisualize={handleVisualize}
        onUndo={handleUndo}
        isAnalyzing={isAnalyzing}
      />
      
      <FloorPlanCanvas 
        mode={mode} 
        walls={walls} 
        setWalls={setWalls}
        furniture={furniture}
        setFurniture={setFurniture}
        selectedFurnitureType={selectedFurniture}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />

      <PropertiesPanel 
        selectedId={selectedId}
        walls={walls}
        furniture={furniture}
        onUpdateFurniture={handleUpdateFurniture}
        onDelete={handleDelete}
      />

      {/* AI Intelligence Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm pointer-events-none">
          <div className="bg-white w-full max-w-4xl h-full max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-3 rounded-2xl text-white shadow-lg">
                  <Wand2 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Workspace</h2>
                  <p className="text-sm text-slate-500 font-medium italic">Architectural Intelligence Engine</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="w-10 h-10 bg-slate-100 flex items-center justify-center rounded-full hover:bg-slate-200 transition"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Visuals */}
              <div className="w-1/2 p-8 border-r overflow-y-auto no-scrollbar bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">3D Concept Visualization</h3>
                {isVisualizing ? (
                  <div className="aspect-square bg-slate-100 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 animate-pulse">
                    <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                    <p className="text-sm text-slate-500 font-bold">Dreaming up your room...</p>
                  </div>
                ) : visualizationUrl ? (
                  <div className="group relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                    <img src={visualizationUrl} alt="3D View" className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                       <span className="text-white text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur px-4 py-2 rounded-full">Pro Render</span>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleVisualize} className="w-full aspect-square bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center group hover:bg-slate-200 transition">
                    <Maximize size={32} className="text-slate-300 group-hover:text-indigo-400 transition mb-2" />
                    <span className="text-sm text-slate-400 font-medium">Click to Generate 3D Concept</span>
                  </button>
                )}
              </div>

              {/* Right Column: Textual Advice */}
              <div className="w-1/2 p-8 overflow-y-auto no-scrollbar">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Design Critique (Thai)</h3>
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded w-4/6 animate-pulse" />
                  </div>
                ) : aiAdvice ? (
                  <div className="prose prose-slate prose-sm max-w-none">
                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                      {aiAdvice}
                    </div>
                  </div>
                ) : (
                   <div className="text-center py-20">
                     <Sparkles size={40} className="mx-auto text-slate-200 mb-4" />
                     <p className="text-slate-400 text-sm italic">Request an analysis to see AI feedback.</p>
                   </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t flex justify-between items-center">
              <p className="text-xs text-slate-400 font-medium">Powered by Gemini 3 Flash Preview & Imagen</p>
              <button 
                onClick={() => setShowAiModal(false)}
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 shadow-xl transition active:scale-95"
              >
                Continue Draft
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
