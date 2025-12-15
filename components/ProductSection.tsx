import React, { useState, useEffect } from 'react';
import { RecommendationResult } from '../types';
import { PRODUCTS_INFO } from '../constants';
import { Edit2, Check, Save, Calculator, MinusCircle, PlusCircle, Trash2, Plus } from 'lucide-react';

interface Props {
  data: RecommendationResult;
}

// Internal state for the cart
interface CartItem {
  id: string; // 'PTA', 'CAREER_PLAN' or 'CUSTOM_1'
  name: string;
  desc: string;
  originalPrice: number;
  finalPrice: number;
  isSelected: boolean;
  isCustom: boolean;
}

const ProductSection: React.FC<Props> = ({ data }) => {
  const [strategy, setStrategy] = useState(data.coreStrategy);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [salesLogic, setSalesLogic] = useState(data.salesLogic);
  const [closingScript, setClosingScript] = useState(data.closingScript);
  
  // Consultant Mode Toggle
  const [isConsultantMode, setIsConsultantMode] = useState(true); // Default to true so they can edit immediately
  
  // Pricing
  const [manualDiscount, setManualDiscount] = useState<number>(0);

  // Initialize Cart from AI Recommendations
  useEffect(() => {
    const initialItems: CartItem[] = [];
    
    // Add standard products
    Object.entries(PRODUCTS_INFO).forEach(([key, info]) => {
      const priceNum = parseInt(info.price.replace(/[^0-9]/g, '')) || 0;
      
      initialItems.push({
        id: key,
        name: info.name,
        desc: info.desc,
        originalPrice: priceNum,
        finalPrice: priceNum,
        isSelected: data.initialRecommendedProducts?.includes(key) || false,
        isCustom: false
      });
    });
    
    setCartItems(initialItems);
  }, [data]);

  // Toggle selection
  const toggleSelection = (id: string) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, isSelected: !item.isSelected } : item
    ));
  };

  // Update item price
  const updateItemPrice = (id: string, newPrice: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, finalPrice: newPrice } : item
    ));
  };

  // Add Custom Item
  const addCustomItem = () => {
    const newId = `CUSTOM_${Date.now()}`;
    const newItem: CartItem = {
      id: newId,
      name: "新增服务项 (Custom)",
      desc: "点击编辑描述",
      originalPrice: 0,
      finalPrice: 0,
      isSelected: true,
      isCustom: true
    };
    setCartItems([...cartItems, newItem]);
  };

  // Remove Custom Item
  const removeCustomItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate Totals
  const selectedItems = cartItems.filter(i => i.isSelected);
  const standardTotal = selectedItems.reduce((sum, item) => sum + item.originalPrice, 0);
  const finalTotal = selectedItems.reduce((sum, item) => sum + item.finalPrice, 0);
  const grandTotal = finalTotal - manualDiscount;

  return (
    <div className="space-y-12 animate-fade-in-up delay-200 mt-12 pb-20 print:break-inside-avoid">
      
      {/* Strategy Header */}
      <div className="max-w-4xl mx-auto text-center space-y-6 relative group">
        <h2 className="text-3xl font-cserif font-bold text-white">
          解决方案与策略 <span className="text-gold">Strategic Solution</span>
        </h2>
        <div className="w-24 h-[1px] bg-gold mx-auto"></div>
        
        {isConsultantMode ? (
          <textarea 
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full bg-surface/50 border border-white/20 text-slate-300 text-lg p-4 rounded-lg focus:border-gold outline-none text-center"
            rows={2}
          />
        ) : (
          <p className="text-lg text-slate-300 font-light leading-relaxed px-8">
            {strategy}
          </p>
        )}
      </div>

      {/* Main Grid: Products + Benefits */}
      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        
        {/* Left: Interactive Quote Builder */}
        <div className={`bg-[#0f172a] border border-white/10 rounded-lg p-8 shadow-luxury relative overflow-hidden transition-all h-full flex flex-col`}>
           
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-cserif text-white font-bold">推荐方案配置 (Quote)</h3>
             {/* Mode Toggle */}
             <button 
                onClick={() => setIsConsultantMode(!isConsultantMode)}
                className={`text-[10px] px-2 py-1 rounded uppercase font-bold tracking-widest border ${isConsultantMode ? 'bg-gold text-black border-gold' : 'text-subtle border-white/10'}`}
             >
                {isConsultantMode ? 'Edit Mode' : 'View Mode'}
             </button>
           </div>
           
           {/* Product List */}
           <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
             {cartItems.map((item) => (
               <div 
                  key={item.id}
                  onClick={() => toggleSelection(item.id)}
                  className={`relative p-4 rounded-md border transition-all flex flex-col gap-2 cursor-pointer
                    ${item.isSelected 
                      ? 'bg-gold/5 border-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                      : isConsultantMode 
                        ? 'bg-surface border-white/10 opacity-60 hover:opacity-100' 
                        : 'hidden' 
                    }
                  `}
               >
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${item.isSelected ? 'bg-gold border-gold text-black' : 'border-white/30'}`}>
                           {item.isSelected && <Check size={12} />}
                        </div>
                        
                        <div className="flex-grow">
                          {isConsultantMode && item.isCustom ? (
                              <input 
                                type="text" 
                                value={item.name}
                                onChange={(e) => setCartItems(prev => prev.map(p => p.id === item.id ? {...p, name: e.target.value} : p))}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-transparent border-b border-white/20 text-white font-bold outline-none w-full"
                                placeholder="输入服务名称"
                              />
                          ) : (
                              <div className="text-white font-bold text-base">{item.name}</div>
                          )}
                          <div className="text-xs text-subtle mt-0.5">{item.desc}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                       {/* Price Input */}
                       <div className="flex items-center bg-black/20 rounded px-2 py-1">
                          <span className="text-xs text-subtle mr-1">¥</span>
                          {isConsultantMode ? (
                             <input 
                               type="number" 
                               value={item.finalPrice}
                               onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                               onClick={(e) => e.stopPropagation()}
                               className="bg-transparent text-gold font-mono text-right w-16 focus:outline-none text-sm font-bold"
                             />
                          ) : (
                             <span className="text-gold font-serif font-bold text-lg">{item.finalPrice.toLocaleString()}</span>
                          )}
                       </div>
                       
                       {/* Delete Button */}
                       {isConsultantMode && item.isCustom && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); removeCustomItem(item.id); }}
                             className="text-red-400 hover:text-red-300 p-1"
                           >
                             <Trash2 size={14} />
                           </button>
                       )}
                    </div>
                 </div>
               </div>
             ))}
             
             {/* Add Custom Button */}
             {isConsultantMode && (
                 <button 
                   onClick={addCustomItem}
                   className="w-full py-3 border-2 border-dashed border-white/10 rounded-md text-subtle hover:text-gold hover:border-gold/50 flex items-center justify-center gap-2 transition-all text-sm mt-2"
                 >
                   <PlusCircle size={16} /> 添加自定义服务 (Add Custom)
                 </button>
             )}
           </div>
           
           {/* Total Calculation */}
           <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
             {standardTotal !== finalTotal && (
                 <div className="flex justify-between items-center text-sm text-subtle">
                    <span>标准原价 (Standard)</span>
                    <span className="line-through decoration-white/30">¥{standardTotal.toLocaleString()}</span>
                 </div>
             )}
             
             <div className="flex justify-between items-center text-sm text-green-400">
                <span className="flex items-center gap-2 font-bold">
                    <MinusCircle size={14} /> 优惠减免 (Discount)
                </span>
                <div className="flex items-center gap-1 border-b border-green-500/50">
                  <span>- ¥</span>
                  {isConsultantMode ? (
                      <input 
                        type="number" 
                        value={manualDiscount} 
                        onChange={(e) => setManualDiscount(Number(e.target.value))}
                        className="bg-transparent text-right w-20 outline-none text-green-400 font-mono font-bold"
                      />
                  ) : (
                      <span className="font-mono font-bold">{manualDiscount.toLocaleString()}</span>
                  )}
                </div>
             </div>

             <div className="flex justify-between items-end pt-4 border-t border-white/5">
               <div className="text-white font-bold text-lg">方案总投入 (Total)</div>
               <div className="text-4xl font-serif text-gold font-bold tracking-tight text-glow">
                 <span className="text-xl mr-1">¥</span>
                 {grandTotal.toLocaleString()}
               </div>
             </div>
           </div>
        </div>

        {/* Right: Core Benefits (Fixed Layout) */}
        <div className="grid grid-rows-3 gap-4 h-full">
           {[
             { label: '核心权益 (Key Benefits)', key: 'valueProp' as const, color: 'text-white' },
             { label: '为何是现在 (Why Now)', key: 'timing' as const, color: 'text-warning' },
             { label: '海马独家 (Exclusive)', key: 'scarcity' as const, color: 'text-gold' }
           ].map((section) => (
             <div key={section.key} className="bg-surface border border-white/5 p-5 rounded-lg hover:border-white/20 transition-colors group relative flex flex-col justify-center">
               <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${section.color} flex justify-between items-center`}>
                 {section.label}
               </h4>
               
               <ul className="space-y-2">
                 {salesLogic[section.key].map((point, idx) => (
                   <li key={idx} className="flex items-start gap-2">
                     <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${section.key === 'scarcity' ? 'bg-gold' : 'bg-slate-500'}`}></span>
                     {isConsultantMode ? (
                       <input 
                         type="text"
                         value={point}
                         onChange={(e) => {
                           const newArray = [...salesLogic[section.key]];
                           newArray[idx] = e.target.value;
                           setSalesLogic({...salesLogic, [section.key]: newArray});
                         }}
                         className="w-full bg-transparent border-b border-white/10 text-slate-300 text-sm outline-none focus:border-gold"
                       />
                     ) : (
                       <span className="text-slate-300 text-sm leading-snug">{point}</span>
                     )}
                   </li>
                 ))}
               </ul>
             </div>
           ))}
        </div>

      </div>

      {/* Closing Script */}
      <div className="max-w-4xl mx-auto mt-16 relative bg-gradient-to-r from-transparent via-white/5 to-transparent p-8 rounded-lg">
        <div className="text-center">
           <span className="text-gold text-3xl font-serif block mb-4">❝</span>
           {isConsultantMode ? (
             <textarea 
               value={closingScript}
               onChange={(e) => setClosingScript(e.target.value)}
               className="w-full bg-transparent text-white text-xl font-cserif text-center outline-none border-b border-white/20 pb-2 leading-relaxed"
               rows={3}
             />
           ) : (
             <p className="font-cserif text-xl md:text-2xl text-white italic opacity-90 leading-relaxed px-8">
              {closingScript}
             </p>
           )}
           <span className="text-gold text-3xl font-serif block mt-4">❞</span>
        </div>
      </div>
    </div>
  );
};

export default ProductSection;
