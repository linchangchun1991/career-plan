import React, { useState } from 'react';
import { MessageSquare, X, ChevronRight, HelpCircle } from 'lucide-react';
import { OBJECTION_HANDLERS } from '../constants';

const SalesAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedObjection, setSelectedObjection] = useState<string | null>(null);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div className={`bg-[#020617] border border-white/10 shadow-2xl w-80 mb-4 transition-all duration-300 pointer-events-auto rounded-sm overflow-hidden ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-surface px-5 py-4 flex justify-between items-center border-b border-white/5">
          <span className="font-cserif text-white flex items-center gap-2 font-bold">
            销售助手 <span className="text-gold text-xs font-sans font-normal uppercase mt-1">Assistant</span>
          </span>
          <button onClick={() => { setIsOpen(false); setSelectedObjection(null); }} className="text-subtle hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-5 max-h-[400px] overflow-y-auto">
          {!selectedObjection ? (
            <div className="space-y-2">
              <p className="text-xs text-subtle mb-4 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle size={12} /> 常见异议处理
              </p>
              {Object.keys(OBJECTION_HANDLERS).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedObjection(key)}
                  className="w-full text-left px-4 py-3 bg-white/5 hover:bg-gold/10 border-l-2 border-transparent hover:border-gold text-sm text-slate-300 hover:text-white transition-all flex justify-between items-center group rounded-r-sm"
                >
                  {key}
                  <ChevronRight size={14} className="text-subtle group-hover:text-gold" />
                </button>
              ))}
            </div>
          ) : (
             <div className="animate-fade-in">
                <button 
                  onClick={() => setSelectedObjection(null)} 
                  className="text-xs text-gold mb-4 hover:underline uppercase tracking-wide flex items-center gap-1"
                >
                  &larr; 返回列表 Back
                </button>
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-subtle uppercase tracking-wider block mb-2">共情话术 Empathy</span>
                    <p className="text-sm text-slate-300 italic border-l border-white/20 pl-3 leading-relaxed">
                      "{OBJECTION_HANDLERS[selectedObjection].empathy}"
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider block mb-2">回击要点 Response</span>
                    <p className="text-sm text-white leading-relaxed">
                      {OBJECTION_HANDLERS[selectedObjection].response}
                    </p>
                  </div>
                </div>
             </div>
          )}
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-gradient-to-br from-gold to-[#B8860B] hover:to-yellow-600 text-black rounded-full p-4 shadow-glow transition-transform hover:-translate-y-1 active:scale-95"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
};

export default SalesAssistant;
