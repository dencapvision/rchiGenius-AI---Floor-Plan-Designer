
import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import FloorPlanCanvas from './components/FloorPlanCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import ThreeDViewer from './components/ThreeDViewer';
import TemplateSelector from './components/TemplateSelector';
import { Wall, ToolMode, Furniture, FurnitureType, ProjectReport } from './types';
import { getProjectReport, generateVisualization, convertImageToFloorPlan } from './services/geminiService';
import { X, Loader2, Maximize, FileText, Box, Layout, Receipt, Sliders, Sparkles, ChevronDown, Share2, Search, Settings, Compass, Layers, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'templates' | 'editor'>('templates');
  const [mode, setMode] = useState<ToolMode>(ToolMode.SELECT);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureType>(FurnitureType.BED);
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern Luxury');
  const [walls, setWalls] = useState<Wall[]>([]);
  const [furniture, setFurniture] = useState<Furniture[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [projectReport, setProjectReport] = useState<ProjectReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [visualizationUrl, setVisualizationUrl] = useState<string | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(0.4);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportImage = async (file: File) => {
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setBackgroundImage(base64);
      const data = await convertImageToFloorPlan(base64);
      setWalls(prev => [...prev, ...data.walls]);
      setFurniture(prev => [...prev, ...data.furniture]);
      setIsImporting(false);
    };
    reader.readAsDataURL(file);
  };

  const handleVisualize = async () => {
    if (walls.length === 0) return;
    setIsVisualizing(true);
    setVisualizationUrl(null);
    setShowReportModal(true);
    const desc = `A room with ${walls.length} walls and ${furniture.length} items of furniture including ${furniture.map(f => f.type).join(', ')}. Spacious and well-lit.`;
    const url = await generateVisualization(desc, selectedStyle);
    setVisualizationUrl(url);
    setIsVisualizing(false);
  };

  if (view === 'templates') {
    return <TemplateSelector onSelect={() => setView('editor')} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] overflow-hidden font-sans text-slate-100">
      {/* Premium Dark Navbar */}
      <header className="h-14 bg-[#020617] border-b border-emerald-500/20 flex items-center justify-between px-6 z-50 shadow-2xl">
        <div className="flex items-center gap-8 h-full">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('templates')}>
            <div className="bg-emerald-500 p-1.5 rounded-lg rotate-3 group-hover:rotate-0 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Compass size={20} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tighter uppercase">Studio<span className="text-emerald-500">Aura</span></span>
          </div>
          <nav className="hidden lg:flex h-full text-[10px] font-black items-center uppercase tracking-widest gap-2">
            {['Canvas', 'Materials', 'Assets', 'AI Studio', 'Support'].map(item => (
              <button key={item} className={`px-4 h-full hover:text-emerald-400 transition relative group ${item === 'Canvas' ? 'text-emerald-500' : 'text-slate-400'}`}>
                {item}
                {item === 'Canvas' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-800">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-400">ArchiAI Connected</span>
          </div>
          <button className="bg-emerald-600 text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">
            Export Design
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar 
          mode={mode} setMode={setMode} 
          selectedFurniture={selectedFurniture} setSelectedFurniture={setSelectedFurniture}
          selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle}
          onAnalyze={async () => {
            setIsGeneratingReport(true); setShowReportModal(true);
            const rep = await getProjectReport(walls, furniture);
            setProjectReport(rep); setIsGeneratingReport(false);
          }}
          onVisualize={handleVisualize}
          onUndo={() => setWalls(walls.slice(0, -1))}
          onImportImage={handleImportImage}
          isImporting={isImporting}
        />
        
        <main className="flex-1 relative flex flex-col bg-[#0b1120]">
          {/* Futuristic View Toggle */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 shadow-2xl">
            <button 
              onClick={() => setViewMode('2D')} 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === '2D' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Layout size={14} /> Blueprint
            </button>
            <button 
              onClick={() => setViewMode('3D')} 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === '3D' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Box size={14} /> Dimension
            </button>
          </div>

          {viewMode === '2D' ? (
            <div className="flex-1 relative overflow-hidden">
              <FloorPlanCanvas 
                mode={mode} walls={walls} setWalls={setWalls}
                furniture={furniture} setFurniture={setFurniture}
                selectedFurnitureType={selectedFurniture}
                selectedId={selectedId} setSelectedId={setSelectedId}
                backgroundImage={backgroundImage} bgOpacity={bgOpacity}
              />
            </div>
          ) : (
            <ThreeDViewer walls={walls} furniture={furniture} />
          )}

          {/* Precision Controls Overlay */}
          <div className="absolute bottom-6 left-6 z-30 flex gap-4">
             <div className="bg-slate-900/90 backdrop-blur p-3 rounded-2xl border border-white/5 shadow-2xl flex items-center gap-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Zap size={16} /></div>
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Auto-Snap</p>
                  <p className="text-[10px] font-bold text-white">Grid Active</p>
                </div>
             </div>
          </div>
        </main>

        <PropertiesPanel selectedId={selectedId} walls={walls} furniture={furniture} onUpdateFurniture={(id, up) => setFurniture(prev => prev.map(f => f.id === id ? {...f, ...up} : f))} onDelete={(id) => setFurniture(prev => prev.filter(f => f.id !== id))} />
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/95 backdrop-blur-2xl">
          <div className="bg-slate-900 w-full max-w-6xl h-full max-h-[85vh] rounded-[2.5rem] shadow-[0_0_100px_rgba(16,185,129,0.1)] border border-white/5 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20"><Sparkles size={24} /></div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">AI Vision Engine</h2>
                  <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-[0.3em]">Neural Architecture v4.0</p>
                </div>
              </div>
              <button onClick={() => setShowReportModal(false)} className="bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 grid grid-cols-1 lg:grid-cols-2 gap-16 no-scrollbar">
              <div className="space-y-8">
                <h3 className="text-slate-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                   <div className="w-8 h-[1px] bg-emerald-500" /> Photorealistic Concept
                </h3>
                {isVisualizing ? (
                  <div className="aspect-[16/10] bg-slate-800/50 rounded-[2.5rem] flex flex-col items-center justify-center animate-pulse border border-emerald-500/20">
                    <Loader2 className="animate-spin text-emerald-500 mb-6" size={48} />
                    <span className="text-[11px] font-black uppercase text-emerald-400 tracking-widest">Synthesizing World...</span>
                  </div>
                ) : visualizationUrl ? (
                  <div className="relative group">
                    <img src={visualizationUrl} className="w-full aspect-[16/10] object-cover rounded-[2.5rem] shadow-2xl border-2 border-white/10" alt="AI Visual" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] flex items-end p-8">
                       <p className="text-white text-xs font-bold leading-relaxed">{selectedStyle} Interior Concept</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-[2.5rem] flex items-center justify-center text-slate-500 font-black uppercase text-[10px]">Awaiting Synthesis</div>
                )}
              </div>

              <div className="space-y-8">
                <h3 className="text-slate-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                   <div className="w-8 h-[1px] bg-emerald-500" /> Material Intelligence
                </h3>
                {isGeneratingReport ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="h-14 bg-slate-800 rounded-2xl" /><div className="h-48 bg-slate-800 rounded-2xl" /><div className="h-20 bg-slate-800 rounded-2xl" />
                  </div>
                ) : projectReport ? (
                  <div className="bg-slate-800/30 p-10 rounded-[2.5rem] border border-white/5 shadow-inner">
                    <p className="text-slate-300 text-sm mb-8 font-medium leading-relaxed italic border-l-2 border-emerald-500 pl-6">"{projectReport.summary}"</p>
                    <table className="w-full text-left text-[11px]">
                      <thead className="border-b border-white/5 text-slate-500 font-black uppercase tracking-widest">
                        <tr><th className="pb-4">Component</th><th className="pb-4 text-right">Estimate Cost</th></tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {projectReport.items.map((item, i) => (
                          <tr key={i}><td className="py-5 font-bold text-slate-200">{item.name}</td><td className="py-5 text-right font-mono font-bold text-emerald-400">{item.estimatedPrice.toLocaleString()} ฿</td></tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-emerald-500/30"><td className="py-8 font-black text-xs uppercase tracking-widest text-slate-400">Total Investment</td><td className="py-8 text-right font-black text-2xl text-white">{projectReport.totalEstimate.toLocaleString()} <span className="text-[10px] text-emerald-500">THB</span></td></tr>
                      </tfoot>
                    </table>
                  </div>
                ) : <div className="p-16 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-[2.5rem] font-black uppercase text-[10px]">Data Stream Offline</div>}
              </div>
            </div>
            
            <div className="p-8 bg-slate-900/50 border-t border-white/5 flex justify-end gap-4">
               <button onClick={() => setShowReportModal(false)} className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition">Cancel</button>
               <button onClick={() => window.print()} className="bg-emerald-600 text-white px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition shadow-xl shadow-emerald-900/40">Secure PDF Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
