
import React, { useRef, useState } from 'react';
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
  Grid3X3,
  ImageIcon,
  Layers,
  Home,
  DoorOpen,
  Waves,
  Zap,
  Move,
  Ruler,
  Sliders
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
  bgOpacity: number;
  onOpacityChange: (opacity: number) => void;
  backgroundImage: string | null;
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
  isImporting,
  bgOpacity,
  onOpacityChange,
  backgroundImage
}) => {
  const [activeTab, setActiveTab] = useState<'build' | 'furnish' | 'ai'>('build');
  const furnitureList = Object.values(FurnitureType);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportImage(file);
    }
  };

  return (
    <div className="w-80 bg-[#0b1120] border-r border-white/5 flex flex-col overflow-hidden z-40">
      {/* Beginner Friendly Tabs */}
      <div className="flex bg-[#020617] p-2 gap-1 border-b border-white/5">
         <button onClick={() => setActiveTab('build')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${activeTab === 'build' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-500 hover:bg-white/5'}`}>
            <PenTool size={14} /> 1. วาดโครง
         </button>
         <button onClick={() => setActiveTab('furnish')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${activeTab === 'furnish' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-500 hover:bg-white/5'}`}>
            <Bed size={14} /> 2. ตกแต่ง
         </button>
         <button onClick={() => setActiveTab('ai')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${activeTab === 'ai' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-500 hover:bg-white/5'}`}>
            <Sparkles size={14} /> 3. แปลงภาพ
         </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
        
        {activeTab === 'build' && (
           <section className="space-y-6">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-emerald-500/20">
                 <p className="text-[10px] text-emerald-400 font-bold leading-relaxed">
                   <span className="block mb-1">💡 ขั้นตอนง่ายๆ:</span>
                   สร้างห้อง -> ใส่ประตู -> ใส่หน้าต่าง
                 </p>
              </div>
              
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Building Tools</h2>
              <div className="grid grid-cols-2 gap-3">
                 <VisualToolButton active={mode === ToolMode.ROOM} onClick={() => setMode(ToolMode.ROOM)} icon={<Square size={20} />} label="ลากสร้างห้อง" highlight />
                 <VisualToolButton active={mode === ToolMode.WALL} onClick={() => setMode(ToolMode.WALL)} icon={<PenTool size={20} />} label="ลากวาดผนัง" />
                 <VisualToolButton active={selectedFurniture === FurnitureType.DOOR && mode === ToolMode.FURNITURE} onClick={() => {setMode(ToolMode.FURNITURE); setSelectedFurniture(FurnitureType.DOOR);}} icon={<DoorOpen size={20} />} label="ประตู" />
                 <VisualToolButton active={selectedFurniture === FurnitureType.WINDOW && mode === ToolMode.FURNITURE} onClick={() => {setMode(ToolMode.FURNITURE); setSelectedFurniture(FurnitureType.WINDOW);}} icon={<Layout size={20} />} label="หน้าต่าง" />
                 <VisualToolButton active={mode === ToolMode.MEASURE} onClick={() => setMode(ToolMode.MEASURE)} icon={<Ruler size={20} />} label="วัดระยะ" />
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">อ้างอิงจากแบบร่าง</h2>
                
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isImporting}
                  className="w-full flex flex-col items-center gap-2 p-6 rounded-3xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-emerald-500/30 transition group disabled:opacity-50"
                >
                   {isImporting ? (
                     <Loader2 size={24} className="animate-spin text-emerald-500" />
                   ) : (
                     <ImageIcon size={24} className="group-hover:text-emerald-500 transition-transform group-hover:scale-110" />
                   )}
                   <span className="text-[10px] font-black uppercase tracking-widest">
                     {isImporting ? 'กำลังประมวลผล...' : backgroundImage ? 'เปลี่ยนรูปภาพแบบร่าง' : 'อัปโหลดภาพแบบร่าง'}
                   </span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                {backgroundImage && (
                  <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ความโปร่งใส</span>
                      </div>
                      <span className="text-[10px] font-mono font-black text-emerald-500">{Math.round(bgOpacity * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01"
                      value={bgOpacity}
                      onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
           </section>
        )}

        {activeTab === 'furnish' && (
           <section className="space-y-6">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-emerald-500/20 mb-6">
                 <p className="text-[10px] text-emerald-400 font-bold leading-relaxed">
                   <span className="block mb-1">🪑 วิธีแต่งห้อง:</span>
                   คลิกเลือกเฟอร์นิเจอร์ แล้วไปคลิกวางบนแปลนได้เลย!
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {furnitureList.filter(t => t !== FurnitureType.DOOR && t !== FurnitureType.WINDOW).map(type => (
                   <button 
                    key={type}
                    onClick={() => {setMode(ToolMode.FURNITURE); setSelectedFurniture(type);}}
                    className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 transition-all duration-300 relative group overflow-hidden ${selectedFurniture === type && mode === ToolMode.FURNITURE ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-800'}`}
                   >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-active:scale-95 ${selectedFurniture === type && mode === ToolMode.FURNITURE ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800'}`}>
                        {type === FurnitureType.BED && <Bed size={24} />}
                        {type === FurnitureType.SOFA && <Box size={24} />}
                        {type === FurnitureType.TABLE && <Grid3X3 size={24} />}
                        {type === FurnitureType.PLANT && <Waves size={24} />}
                        {![FurnitureType.BED, FurnitureType.SOFA, FurnitureType.TABLE, FurnitureType.PLANT].includes(type) && <Home size={24} />}
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-tight ${selectedFurniture === type && mode === ToolMode.FURNITURE ? 'text-emerald-400' : ''}`}>{type}</span>
                     {selectedFurniture === type && mode === ToolMode.FURNITURE && (
                        <div className="absolute -bottom-1 left-0 w-full h-1 bg-emerald-500" />
                     )}
                   </button>
                 ))}
              </div>
           </section>
        )}

        {activeTab === 'ai' && (
           <section className="space-y-8">
              <div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-950 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                 <Sparkles className="mb-4 text-emerald-300 animate-pulse" size={36} />
                 <h3 className="text-xl font-black tracking-tighter mb-2 uppercase">AI Magic Render</h3>
                 <p className="text-[11px] leading-relaxed opacity-70 font-medium italic">"แค่เลือกสไตล์ที่ชอบ AI จะเนรมิตภาพเสมือนจริงให้ทันที"</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 {STYLES.map(style => (
                   <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`w-full text-left px-8 py-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between border-2 ${selectedStyle === style ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white hover:bg-slate-800 hover:border-white/10'}`}
                   >
                     <span className="flex items-center gap-4">
                       <div className={`w-2 h-2 rounded-full ${selectedStyle === style ? 'bg-white' : 'bg-emerald-500'}`} />
                       {style}
                     </span>
                     {selectedStyle === style && <Zap size={14} className="fill-current animate-bounce" />}
                   </button>
                 ))}
              </div>

              <button 
                onClick={onVisualize}
                className="w-full mt-6 py-5 bg-white text-slate-900 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.25em] transition hover:bg-emerald-500 hover:text-white shadow-2xl flex items-center justify-center gap-3 active:scale-95"
              >
                <Camera size={18} /> กดเพื่อดูภาพ 3D จริง
              </button>
           </section>
        )}

      </div>
      
      {/* Selection Utility */}
      <div className="p-6 bg-slate-900 border-t border-white/5 grid grid-cols-2 gap-4">
         <button onClick={() => setMode(ToolMode.SELECT)} className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${mode === ToolMode.SELECT ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl' : 'border-white/5 text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
            <MousePointer2 size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">ย้าย</span>
         </button>
         <button onClick={() => setMode(ToolMode.ERASE)} className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${mode === ToolMode.ERASE ? 'bg-red-500 border-red-500 text-white shadow-xl shadow-red-900/40' : 'border-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-400'}`}>
            <Trash2 size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">ลบ</span>
         </button>
      </div>
    </div>
  );
};

const VisualToolButton = ({ active, onClick, icon, label, highlight = false }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-4 p-5 rounded-[2rem] border-2 transition-all duration-500 group relative overflow-hidden ${active ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-emerald-500/50 hover:bg-slate-800'}`}
  >
    {highlight && !active && (
       <div className="absolute top-0 right-0 p-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
       </div>
    )}
    <div className={`transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125 ${active ? "text-white" : "text-emerald-500"}`}>{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{label}</span>
  </button>
);

export default Toolbar;
