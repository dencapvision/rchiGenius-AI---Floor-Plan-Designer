
import React from 'react';
import { Box, Home, Bath, ChefHat, Bed, Warehouse, Car, Plus, Search, HelpCircle, LogIn, ChevronRight, Settings, Compass, LayoutGrid, Sparkles } from 'lucide-react';

interface TemplateSelectorProps {
  onSelect: (type: string) => void;
}

const TEMPLATES = [
  { id: 'residential', name: 'Elite Residential', icon: <Home size={40} /> },
  { id: 'bathroom', name: 'Spa & Bath', icon: <Bath size={40} /> },
  { id: 'kitchen', name: 'Gourmet Kitchen', icon: <ChefHat size={40} /> },
  { id: 'basement', name: 'Subterranean Suite', icon: <Warehouse size={40} /> },
  { id: 'garage', name: 'Collector Garage', icon: <Car size={40} /> },
  { id: 'bedroom', name: 'Master Sanctuary', icon: <Bed size={40} />, active: true },
];

const CATEGORIES = [
  'Concept Drafting',
  'Interior Architecture',
  'Exterior Systems',
  'Commercial Spaces',
  'Luxury Residential',
  'Infrastructure',
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex h-screen bg-[#020617] font-sans text-slate-100 overflow-hidden">
      {/* Designer Glass Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-slate-950/50 backdrop-blur-3xl flex flex-col relative z-10">
        <div className="p-8 flex items-center gap-3 mb-12">
          <div className="bg-emerald-500 p-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Compass size={28} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">Studio<span className="text-emerald-500">Aura</span></span>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 space-y-2 no-scrollbar">
          <button className="w-full text-left px-5 py-3 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest transition flex items-center justify-between shadow-lg shadow-emerald-900/20">
            <span>Start Design</span>
            <Plus size={16} />
          </button>
          
          <div className="py-6 space-y-1">
            {['Portfolio', 'Team Shared', 'Asset Hub', 'Archive'].map(item => (
              <button key={item} className="w-full text-left px-5 py-3 rounded-xl hover:bg-white/5 text-[11px] font-bold text-slate-400 hover:text-white transition flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                {item}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            <h3 className="px-5 text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6">Expert Suites</h3>
            {CATEGORIES.map(item => (
              <button key={item} className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition mb-1 ${item === 'Luxury Residential' ? 'bg-white/5 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                {item}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-8 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 hover:text-white cursor-pointer transition uppercase tracking-widest">
            <Settings size={14} /> System
          </div>
          <button className="w-full py-3.5 border border-emerald-500/30 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition flex items-center justify-center gap-3">
            <LogIn size={14} /> Designer Portal
          </button>
        </div>
      </aside>

      {/* Gallery Content */}
      <main className="flex-1 bg-gradient-to-br from-[#020617] to-[#0f172a] overflow-y-auto p-16 no-scrollbar relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-end justify-between mb-16">
            <div>
               <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Gallery<span className="text-emerald-500">Studio</span></h1>
               <p className="text-slate-400 text-sm font-medium tracking-wide">Select a foundational blueprint to begin your architectural journey.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search blueprints..." 
                className="pl-12 pr-6 py-4 bg-slate-900/50 border border-white/10 rounded-2xl shadow-2xl w-80 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition backdrop-blur-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {TEMPLATES.map(template => (
              <div 
                key={template.id} 
                onClick={() => onSelect(template.id)}
                className={`group relative bg-slate-900/40 rounded-[2.5rem] p-10 cursor-pointer border-2 transition-all duration-500 flex flex-col items-center justify-center aspect-square ${template.active ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 'border-white/5 hover:border-emerald-500/50 hover:bg-slate-900/60'}`}
              >
                <div className={`p-8 rounded-[2rem] transition-transform duration-500 group-hover:scale-110 ${template.active ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-emerald-400'}`}>
                   {template.icon}
                </div>
                
                <div className="mt-8 text-center">
                  <h3 className="text-lg font-black tracking-tight mb-1">{template.name}</h3>
                  <div className="flex items-center gap-2 justify-center">
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">Launch Editor</span>
                     <ChevronRight size={10} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {template.active && (
                   <div className="absolute top-6 left-6 flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <Sparkles size={10} className="text-emerald-500" />
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Premium Choice</span>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TemplateSelector;
