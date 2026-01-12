
import React, { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import FloorPlanCanvas from './components/FloorPlanCanvas';
import { Wall, ToolMode, Furniture, FurnitureType } from './types';
import { getDesignAdvice, generateVisualization } from './services/geminiService';
import { X, Loader2, Info, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<ToolMode>(ToolMode.SELECT);
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureType>(FurnitureType.BED);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [furniture, setFurniture] = useState<Furniture[]>([]);
  
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visualizationUrl, setVisualizationUrl] = useState<string | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const handleAnalyze = async () => {
    if (walls.length === 0 && furniture.length === 0) {
      alert("กรุณาวาดแบบแปลนหรือวางเฟอร์นิเจอร์ก่อนทำการวิเคราะห์");
      return;
    }
    setIsAnalyzing(true);
    setShowAiModal(true);
    const advice = await getDesignAdvice(walls, furniture);
    setAiAdvice(advice);
    setIsAnalyzing(false);
  };

  const handleVisualize = async () => {
    if (walls.length === 0) {
      alert("กรุณาวาดผนังห้องเพื่อระบุโครงสร้างก่อนสร้างภาพ 3D");
      return;
    }
    setIsVisualizing(true);
    setVisualizationUrl(null);
    setShowAiModal(true);
    
    const description = `A room with ${walls.length} walls and pieces including ${furniture.map(f => f.type).join(', ')}. Modern architectural style.`;
    const imageUrl = await generateVisualization(description);
    setVisualizationUrl(imageUrl);
    setIsVisualizing(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Toolbar 
        mode={mode} 
        setMode={setMode} 
        selectedFurniture={selectedFurniture}
        setSelectedFurniture={setSelectedFurniture}
        onAnalyze={handleAnalyze}
        onVisualize={handleVisualize}
        isAnalyzing={isAnalyzing}
      />
      
      <FloorPlanCanvas 
        mode={mode} 
        walls={walls} 
        setWalls={setWalls}
        furniture={furniture}
        setFurniture={setFurniture}
        selectedFurnitureType={selectedFurniture}
      />

      {/* AI Advice & Visualization Overlay */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none p-6">
          <div className="bg-white/95 backdrop-blur-xl w-full max-w-lg h-full max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col pointer-events-auto animate-in slide-in-from-right-10 duration-500">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">AI Design Assistant</h3>
                  <p className="text-xs text-slate-500">Gemini powered analysis</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {/* Visualization Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    3D Render Visualization
                  </h4>
                  {isVisualizing && <Loader2 className="animate-spin text-blue-500" size={16} />}
                </div>
                {visualizationUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                    <img src={visualizationUrl} alt="3D Visualization" className="w-full aspect-video object-cover" />
                  </div>
                ) : isVisualizing ? (
                  <div className="aspect-video bg-slate-100 rounded-2xl flex flex-col items-center justify-center border border-dashed border-slate-300">
                    <Loader2 className="animate-spin text-slate-400 mb-2" size={32} />
                    <p className="text-sm text-slate-500">Generating hyper-realistic 3D view...</p>
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 px-10 text-center italic">Click "3D Visualize" in the sidebar to generate an AI preview of your floor plan.</p>
                  </div>
                )}
              </section>

              {/* Advice Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Layout Analysis & Tips
                  </h4>
                  {isAnalyzing && <Loader2 className="animate-spin text-purple-500" size={16} />}
                </div>
                {aiAdvice ? (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="prose prose-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {aiAdvice}
                    </div>
                  </div>
                ) : isAnalyzing ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded w-4/6 animate-pulse" />
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-8 flex items-center justify-center border border-dashed border-slate-200 text-center">
                    <p className="text-sm text-slate-400">Click "AI Analysis" to get architectural feedback from Gemini.</p>
                  </div>
                )}
              </section>
            </div>
            
            <div className="p-6 bg-slate-50 border-t rounded-b-3xl">
               <button 
                onClick={() => setShowAiModal(false)}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg"
               >
                 Close and Continue Designing
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
