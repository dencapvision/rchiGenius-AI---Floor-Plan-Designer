
import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import FloorPlanCanvas from './components/FloorPlanCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import ThreeDViewer from './components/ThreeDViewer';
import { Wall, ToolMode, Furniture, FurnitureType, ProjectReport } from './types';
import { getProjectReport, generateVisualization, convertImageToFloorPlan } from './services/geminiService';
import { X, Loader2, ChevronRight, Wand2, Maximize, FileText, Camera, Box, Layout, Receipt } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<ToolMode>(ToolMode.SELECT);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureType>(FurnitureType.BED);
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
      setBackgroundImage(base64); // Use as background tracing
      try {
        const { walls: w, furniture: f } = await convertImageToFloorPlan(base64);
        if (w.length > 0) {
          setWalls(prev => [...prev, ...w]);
          setFurniture(prev => [...prev, ...f]);
        }
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateReport = async () => {
    if (walls.length === 0) return;
    setIsGeneratingReport(true);
    setShowReportModal(true);
    try {
      const report = await getProjectReport(walls, furniture);
      setProjectReport(report);
    } catch (err) {
      alert("Error generating report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleVisualize = async () => {
    if (walls.length === 0) return;
    setIsVisualizing(true);
    setVisualizationUrl(null);
    setShowReportModal(true);
    const url = await generateVisualization(`Modern interior construction: ${walls.length} walls`);
    setVisualizationUrl(url);
    setIsVisualizing(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Toolbar 
        mode={mode} 
        setMode={setMode} 
        selectedFurniture={selectedFurniture}
        setSelectedFurniture={setSelectedFurniture}
        onAnalyze={handleGenerateReport}
        onVisualize={handleVisualize}
        onUndo={() => setWalls(walls.slice(0, -1))}
        onImportImage={handleImportImage}
        isImporting={isImporting}
      />
      
      <main className="flex-1 relative flex flex-col">
        {/* Top Control Bar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
          <div className="flex bg-white/90 backdrop-blur border border-slate-200 p-1 rounded-xl shadow-lg">
            <button onClick={() => setViewMode('2D')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${viewMode === '2D' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Layout size={14} /> 2D</button>
            <button onClick={() => setViewMode('3D')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${viewMode === '3D' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Box size={14} /> 3D</button>
          </div>
          
          {backgroundImage && (
            <div className="bg-white/90 backdrop-blur border border-slate-200 px-4 py-2 rounded-xl shadow-lg flex items-center gap-3">
              <Camera size={14} className="text-slate-400" />
              <input type="range" min="0" max="1" step="0.1" value={bgOpacity} onChange={(e) => setBgOpacity(parseFloat(e.target.value))} className="w-24 accent-slate-900" title="Opacity" />
              <button onClick={() => setBackgroundImage(null)} className="text-slate-400 hover:text-red-500 transition"><X size={14} /></button>
            </div>
          )}
        </div>

        {viewMode === '2D' ? (
          <FloorPlanCanvas 
            mode={mode} 
            walls={walls} setWalls={setWalls}
            furniture={furniture} setFurniture={setFurniture}
            selectedFurnitureType={selectedFurniture}
            selectedId={selectedId} setSelectedId={setSelectedId}
            backgroundImage={backgroundImage} bgOpacity={bgOpacity}
          />
        ) : (
          <ThreeDViewer walls={walls} furniture={furniture} />
        )}
      </main>

      <PropertiesPanel selectedId={selectedId} walls={walls} furniture={furniture} onUpdateFurniture={(id, up) => setFurniture(prev => prev.map(f => f.id === id ? { ...f, ...up } : f))} onDelete={(id) => setFurniture(prev => prev.filter(f => f.id !== id))} />

      {/* AI Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md pointer-events-none">
          <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="p-8 border-b bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText size={24} className="text-blue-400" />
                <h2 className="text-2xl font-black">Project Technical Report</h2>
              </div>
              <button onClick={() => setShowReportModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {/* Summary Section */}
              <section className="bg-blue-50/50 border border-blue-100 p-8 rounded-3xl">
                <h3 className="text-blue-600 font-black uppercase tracking-widest text-xs mb-4">AI Analysis Summary</h3>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {isGeneratingReport ? "Calculating construction data..." : projectReport?.summary || "Ready to analyze project parameters."}
                </p>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Visualizer Section */}
                <div className="space-y-4">
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Realistic Preview</h3>
                  {isVisualizing ? (
                    <div className="aspect-video bg-slate-100 rounded-3xl flex items-center justify-center animate-pulse"><Loader2 className="animate-spin text-blue-500" /></div>
                  ) : visualizationUrl ? (
                    <img src={visualizationUrl} className="w-full rounded-3xl shadow-xl border-4 border-white" alt="Render" />
                  ) : (
                    <button onClick={handleVisualize} className="w-full aspect-video border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center hover:bg-slate-50 transition"><Maximize className="text-slate-300 mb-2" /> <span className="text-xs font-bold text-slate-400">Generate 3D Render</span></button>
                  )}
                </div>

                {/* BOQ Section */}
                <div className="space-y-4">
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Bill of Quantities (BOQ)</h3>
                  {isGeneratingReport ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
                    </div>
                  ) : projectReport ? (
                    <div className="space-y-3">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-slate-400 border-b">
                            <th className="pb-2">Material</th>
                            <th className="pb-2">Qty</th>
                            <th className="pb-2 text-right">Price (THB)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {projectReport.items.map((item, idx) => (
                            <tr key={idx} className="group hover:bg-slate-50 transition">
                              <td className="py-3 font-bold text-slate-700">{item.name}</td>
                              <td className="py-3 text-slate-500">{item.quantity} {item.unit}</td>
                              <td className="py-3 text-right font-mono text-slate-900">{item.estimatedPrice.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-slate-900">
                            <td colSpan={2} className="py-4 font-black text-lg">Total Estimate</td>
                            <td className="py-4 text-right font-black text-lg text-blue-600">{projectReport.totalEstimate.toLocaleString()} ฿</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-300 italic text-sm">Run analysis to see pricing breakdown.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t flex justify-between items-center">
              <div className="flex gap-2">
                <Receipt size={16} className="text-slate-400" />
                <span className="text-xs text-slate-400 font-bold">Prices based on Thai Market Average 2024</span>
              </div>
              <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition">Print Full Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
