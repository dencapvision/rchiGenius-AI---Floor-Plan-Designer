
import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import FloorPlanCanvas from './components/FloorPlanCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import ThreeDViewer from './components/ThreeDViewer';
import TemplateSelector from './components/TemplateSelector';
import { Wall, ToolMode, Furniture, FurnitureType, ProjectReport } from './types';
import { getProjectReport, generateVisualization, convertImageToFloorPlan } from './services/geminiService';
// Added MousePointer2 to fix the compilation error
import { X, Loader2, Maximize, FileText, Box, Layout, Receipt, Sliders, Sparkles, ChevronDown, Share2, Search, Settings, Compass, Layers, Zap, Save, Undo2, Redo2, Trash2, Camera, Download, Hammer, Palette, ListChecks, Info, MousePointer2 } from 'lucide-react';

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

  const getGuideText = () => {
    if (viewMode === '3D') return "สำรวจมุมมอง 3 มิติของคุณ (คลิกขวาเพื่อเลื่อน, คลิกซ้ายเพื่อหมุน)";
    if (mode === ToolMode.SELECT) return "คลิกที่สิ่งของเพื่อปรับขนาดหรือลบออก";
    if (mode === ToolMode.WALL) return "คลิกค้างแล้วลากเพื่อวาดผนัง";
    if (mode === ToolMode.ROOM) return "คลิกค้างแล้วลากเพื่อสร้างห้องสี่เหลี่ยมสำเร็จรูป";
    if (mode === ToolMode.FURNITURE) return `คลิกตรงไหนก็ได้บนแปลนเพื่อวาง ${selectedFurniture}`;
    if (mode === ToolMode.ERASE) return "คลิกที่สิ่งของที่ต้องการนำออก";
    if (mode === ToolMode.MEASURE) return "คลิก 2 จุดบนแปลนเพื่อวัดระยะห่าง";
    return "พร้อมเริ่มออกแบบแล้ว!";
  };

  if (view === 'templates') {
    return <TemplateSelector onSelect={() => setView('editor')} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] overflow-hidden font-sans text-slate-100">
      {/* Top Pro Header */}
      <header className="h-16 bg-[#0b1120] border-b border-white/5 flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('templates')}>
            <div className="bg-emerald-500 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20"><Compass size={20} className="text-white" /></div>
            <span className="font-black text-lg tracking-tight uppercase hidden lg:block">Studio<span className="text-emerald-500">Aura</span></span>
          </div>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-2">
             <button onClick={() => setWalls(walls.slice(0, -1))} className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 transition" title="Undo"><Undo2 size={18} /></button>
             <button onClick={() => {setWalls([]); setFurniture([]);}} className="p-2.5 hover:bg-white/5 rounded-xl text-red-400/50 hover:text-red-400 transition" title="Clear Canvas"><Trash2 size={18} /></button>
          </div>
        </div>

        {/* Pro Central Switch */}
        <div className="flex items-center bg-slate-900/50 rounded-2xl border border-white/5 p-1 gap-1">
           <button 
            onClick={() => setViewMode('2D')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === '2D' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             <Layout size={14} /> 2D แปลน
           </button>
           <button 
            onClick={() => setViewMode('3D')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === '3D' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
           >
             <Box size={14} /> 3D โมเดล
           </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => {setIsGeneratingReport(true); setShowReportModal(true); getProjectReport(walls, furniture).then(setProjectReport);}} className="flex items-center gap-2 bg-slate-800 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition">
            <Receipt size={14} className="text-emerald-500" /> งบประมาณ
          </button>
          <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/40 flex items-center gap-2">
            <Download size={14} /> ส่งออก
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side Toolbox */}
        <Toolbar 
          mode={mode} setMode={setMode} 
          selectedFurniture={selectedFurniture} setSelectedFurniture={setSelectedFurniture}
          selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle}
          onVisualize={handleVisualize}
          onAnalyze={() => {}} 
          isAnalyzing={isGeneratingReport}
          onUndo={() => setWalls(walls.slice(0, -1))}
          onImportImage={handleImportImage}
          isImporting={isImporting}
          bgOpacity={bgOpacity}
          onOpacityChange={setBgOpacity}
          backgroundImage={backgroundImage}
        />
        
        <main className="flex-1 relative flex flex-col bg-[#020617]">
          {/* Pro Context Help Banner */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-auto">
             <div className="bg-[#0b1120]/90 backdrop-blur-xl px-8 py-3 rounded-full border border-emerald-500/20 shadow-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-300 tracking-wide uppercase">{getGuideText()}</span>
             </div>
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

          {/* Scale Overlay */}
          <div className="absolute bottom-10 left-10 z-30 pointer-events-none group">
             <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-3">
                <Info size={14} className="text-emerald-500" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Grid: 0.5m</span>
             </div>
          </div>
        </main>

        {/* Right Info Sidebar */}
        <aside className={`w-80 bg-[#0b1120] border-l border-white/5 transition-all duration-500 ${selectedId ? 'translate-x-0' : 'translate-x-full'}`}>
           {selectedId && (
             <PropertiesPanel 
               selectedId={selectedId} 
               walls={walls} 
               furniture={furniture} 
               onUpdateFurniture={(id, up) => setFurniture(prev => prev.map(f => f.id === id ? {...f, ...up} : f))} 
               onDelete={(id) => {setFurniture(prev => prev.filter(f => f.id !== id)); setSelectedId(null);}} 
             />
           )}
           {!selectedId && (
              <div className="p-12 h-full flex flex-col justify-center items-center text-center opacity-30">
                 <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <MousePointer2 size={32} className="text-slate-600" />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Editor Panel</h4>
                 <p className="text-[11px] text-slate-600 font-medium">คลิกที่สิ่งของในแปลนเพื่อแก้ไขขนาดหรือวัสดุ</p>
              </div>
           )}
        </aside>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-12 bg-slate-950/98 backdrop-blur-3xl">
          <div className="bg-slate-900 w-full max-w-7xl h-full max-h-[90vh] rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.15)] border border-white/5 flex flex-col overflow-hidden">
            <div className="p-10 border-b border-white/5 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-emerald-500 text-white rounded-[1.5rem] shadow-xl shadow-emerald-500/20"><Sparkles size={28} /></div>
                <div>
                  <h2 className="text-3xl font-black tracking-tighter">AI Synthesis Report</h2>
                  <p className="text-[11px] text-emerald-500 uppercase font-black tracking-[0.2em]">Neural Interior Intelligence</p>
                </div>
              </div>
              <button onClick={() => setShowReportModal(false)} className="bg-white/5 hover:bg-white/10 p-4 rounded-full transition-all text-slate-400 hover:text-white"><X size={28} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-16 grid grid-cols-1 lg:grid-cols-2 gap-20 no-scrollbar">
              <div className="space-y-10">
                <h3 className="text-slate-500 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
                   <div className="w-8 h-[1px] bg-emerald-500" /> Photorealistic Concept
                </h3>
                {isVisualizing ? (
                  <div className="aspect-[16/10] bg-slate-800/50 rounded-[3rem] flex flex-col items-center justify-center animate-pulse border border-emerald-500/10">
                    <Loader2 className="animate-spin text-emerald-500 mb-8" size={64} />
                    <span className="text-[12px] font-black uppercase text-emerald-400 tracking-[0.3em]">Synthesizing Scene...</span>
                  </div>
                ) : visualizationUrl ? (
                  <img src={visualizationUrl} className="w-full aspect-[16/10] object-cover rounded-[3rem] shadow-2xl border-4 border-white/5" alt="Render" />
                ) : (
                  <div className="aspect-[16/10] bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-[3rem] flex items-center justify-center text-slate-600 font-black uppercase text-[12px]">No Rendering Found</div>
                )}
              </div>

              <div className="space-y-10">
                <h3 className="text-slate-500 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
                   <div className="w-8 h-[1px] bg-emerald-500" /> Construction Intel
                </h3>
                {isGeneratingReport ? (
                  <div className="space-y-8 animate-pulse">
                    <div className="h-20 bg-slate-800 rounded-3xl" /><div className="h-64 bg-slate-800 rounded-3xl" />
                  </div>
                ) : projectReport ? (
                  <div className="bg-slate-800/20 p-12 rounded-[3rem] border border-white/5">
                    <p className="text-slate-300 text-sm mb-12 leading-relaxed italic border-l-4 border-emerald-500 pl-8 font-medium">"{projectReport.summary}"</p>
                    <table className="w-full text-left text-[12px]">
                      <thead className="text-slate-500 font-black uppercase tracking-[0.2em] border-b border-white/5">
                        <tr><th className="pb-6">Item</th><th className="pb-6 text-right">Estimate Cost</th></tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {projectReport.items.map((item, i) => (
                          <tr key={i}><td className="py-6 font-bold text-slate-200">{item.name}</td><td className="py-6 text-right font-mono font-bold text-emerald-400">{item.estimatedPrice.toLocaleString()} ฿</td></tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-emerald-500/30"><td className="py-10 font-black text-sm uppercase text-slate-400">Total Investment</td><td className="py-10 text-right font-black text-3xl text-white">{projectReport.totalEstimate.toLocaleString()} <span className="text-xs text-emerald-500 ml-2">THB</span></td></tr>
                      </tfoot>
                    </table>
                  </div>
                ) : <div className="p-20 text-center text-slate-700 border-2 border-dashed border-slate-800 rounded-[3rem] font-black uppercase text-[12px]">Missing Stream Data</div>}
              </div>
            </div>
            
            <div className="p-10 bg-slate-900 border-t border-white/5 flex justify-end gap-5">
               <button onClick={() => setShowReportModal(false)} className="px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition">ปิดหน้าต่าง</button>
               <button onClick={() => window.print()} className="bg-emerald-600 text-white px-12 py-4 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition shadow-2xl shadow-emerald-900/40">พิมพ์รายงานสรุป</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
