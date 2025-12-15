import React, { useState } from 'react';
import { AppState, StudentProfile, DiagnosisResult, RecommendationResult } from './types';
import { INITIAL_STUDENT_STATE } from './constants';
import { generateDiagnosis, generateRecommendations } from './services/geminiService';
import StudentForm from './components/StudentForm';
import DiagnosisDashboard from './components/DiagnosisDashboard';
import ProductSection from './components/ProductSection';
import SalesAssistant from './components/SalesAssistant';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.INPUT);
  const [student, setStudent] = useState<StudentProfile>(INITIAL_STUDENT_STATE);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");

  const handleFieldChange = (field: keyof StudentProfile, value: any) => {
    setStudent(prev => ({ ...prev, [field]: value }));
  };

  const handleStartAnalysis = async () => {
    setState(AppState.ANALYZING);
    
    try {
      setLoadingStep("正在接入 ATS 系统进行全维评分...");
      const diagResult = await generateDiagnosis(student);
      setDiagnosis(diagResult);
      
      setLoadingStep("正在构建个性化职业竞争策略...");
      const recResult = await generateRecommendations(student, diagResult);
      setRecommendation(recResult);

      setState(AppState.RESULT);
    } catch (e) {
      console.error(e);
      alert("AI 服务繁忙，请稍后重试。");
      setState(AppState.INPUT);
    }
  };

  const handleReset = () => {
    setState(AppState.INPUT);
    setDiagnosis(null);
    setRecommendation(null);
    setStudent(prev => ({...prev, resumeFile: undefined, resumeFileName: undefined}));
  };

  return (
    <div className="min-h-screen bg-background text-platinum font-sans selection:bg-gold selection:text-black pb-24">
      {/* Navbar */}
      <nav className="bg-[#0b1121]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-cserif font-bold text-xl tracking-wider flex items-center gap-3">
             {/* Logo Removed as requested */}
            <div className="flex flex-col">
              <span className="leading-none text-white text-lg">海马职加 <span className="text-gold font-serif">HIGHMARK</span></span>
              <span className="text-[10px] text-subtle tracking-[0.2em] uppercase mt-1">Global Career Consulting</span>
            </div>
          </div>
          {state === AppState.RESULT && (
            <button 
              onClick={handleReset}
              className="group flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-subtle hover:text-gold border border-transparent hover:border-gold/30 rounded-sm transition-all"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
              新咨询 New Session
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {state === AppState.INPUT && (
          <StudentForm 
            data={student} 
            onChange={handleFieldChange} 
            onSubmit={handleStartAnalysis} 
          />
        )}

        {state === AppState.ANALYZING && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-fade-in">
             <div className="relative w-24 h-24">
               <div className="absolute inset-0 border-t-2 border-gold rounded-full animate-spin"></div>
               <div className="absolute inset-2 border-r-2 border-white/20 rounded-full animate-spin [animation-direction:reverse]"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <LayoutDashboard className="text-gold/50" size={32} />
               </div>
             </div>
             <div className="text-center space-y-2">
               <p className="font-cserif text-2xl text-white tracking-wide">{loadingStep}</p>
               <p className="text-xs text-subtle uppercase tracking-[0.3em] animate-pulse">HighMark AI Engine Processing</p>
             </div>
          </div>
        )}

        {state === AppState.RESULT && diagnosis && recommendation && (
          <div className="space-y-16">
             <DiagnosisDashboard result={diagnosis} studentName={student.name} />
             <ProductSection data={recommendation} />
             <SalesAssistant />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
