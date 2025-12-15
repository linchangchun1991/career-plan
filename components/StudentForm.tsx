import React, { useRef, useState } from 'react';
import { StudentProfile } from '../types';
import { 
  UNIVERSITY_LEVELS, 
  GRADES, 
  TARGET_INDUSTRIES 
} from '../constants';
import { parseResume } from '../services/geminiService';
import { ChevronRight, Upload, FileText, Sparkles, Check, Loader2, Scan } from 'lucide-react';

interface Props {
  data: StudentProfile;
  onChange: (field: keyof StudentProfile, value: any) => void;
  onSubmit: () => void;
}

const StudentForm: React.FC<Props> = ({ data, onChange, onSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Content = base64String.split(',')[1]; // Remove data:application/pdf;base64, prefix
      
      onChange('resumeFile', base64String);
      onChange('resumeFileName', file.name);
      
      // Start Parsing
      setIsParsing(true);
      onChange('isParsing', true);
      
      try {
        const parsedData = await parseResume(base64Content, file.type);
        
        // Auto-fill fields
        if (parsedData.name) onChange('name', parsedData.name);
        if (parsedData.university) onChange('university', parsedData.university);
        if (parsedData.universityLevel) onChange('universityLevel', parsedData.universityLevel);
        if (parsedData.major) onChange('major', parsedData.major);
        if (parsedData.grade) onChange('grade', parsedData.grade);
        if (parsedData.graduationYear) onChange('graduationYear', parsedData.graduationYear);
        if (parsedData.internshipCount) onChange('internshipCount', parsedData.internshipCount);
        if (parsedData.atsPreScore) onChange('atsPreScore', parsedData.atsPreScore);
        
      } catch (e) {
        console.error("Parsing failed", e);
      } finally {
        setIsParsing(false);
        onChange('isParsing', false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(e.target.name as keyof StudentProfile, e.target.value);
  };

  const toggleIndustry = (ind: string) => {
    const current = data.targetIndustry || [];
    if (current.includes(ind)) {
      onChange('targetIndustry', current.filter(i => i !== ind));
    } else {
      onChange('targetIndustry', [...current, ind]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Brand Header */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-cserif font-bold text-white tracking-wider">
          海马职加 <span className="text-gold font-serif">HIGHMARK</span>
        </h1>
        <p className="text-subtle text-base tracking-[0.1em] font-light mt-2 relative inline-block">
          <span className="w-8 h-[1px] bg-gold absolute left-0 top-1/2 -translate-x-full"></span>
          AI驱动的留学生职业规划系统
          <span className="w-8 h-[1px] bg-gold absolute right-0 top-1/2 translate-x-full"></span>
        </p>
      </div>

      <div className="bg-surface border border-white/5 backdrop-blur-xl rounded-lg p-1 shadow-luxury">
        <div className="bg-[#0f172a] rounded-lg p-8 md:p-12 space-y-12">
          
          {/* Section 1: Resume Upload & Parsing */}
          <div className="space-y-6 text-center">
             <div 
              className={`relative border-2 border-dashed rounded-lg p-10 transition-all cursor-pointer group 
                ${dragActive ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-gold/30 hover:bg-white/5'}
                ${isParsing ? 'pointer-events-none opacity-80' : ''}`}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={handleDrop}
              onClick={() => !isParsing && fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
              
              {isParsing ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold animate-spin">
                    <Loader2 size={32} />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1 text-lg">正在进行 ATS 深度解析...</p>
                    <p className="text-subtle text-sm">提取硬性指标 / 评估关键词匹配度 / 识别项目亮点</p>
                  </div>
                </div>
              ) : data.resumeFileName ? (
                <div className="flex flex-col items-center gap-4 animate-fade-in">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success shadow-glow relative">
                    <Check size={32} />
                    {data.atsPreScore && (
                      <div className="absolute -top-2 -right-2 bg-gold text-black text-xs font-bold px-2 py-1 rounded-full border border-white">
                        ATS {data.atsPreScore}分
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium mb-1 text-lg">{data.resumeFileName}</p>
                    <p className="text-success text-sm flex items-center justify-center gap-1">
                      <Sparkles size={14} /> 解析完成，已自动填入信息
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onChange('resumeFile', undefined); onChange('resumeFileName', undefined); onChange('atsPreScore', undefined); }} 
                    className="text-sm text-subtle hover:text-white mt-2 hover:underline">
                    重新上传
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-subtle mx-auto group-hover:text-gold group-hover:bg-gold/10 transition-colors">
                    <Upload size={28} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-bold text-lg">点击上传简历 (支持 PDF/图片/DOCX)</p>
                    <p className="text-sm text-subtle">AI 将自动提取关键信息并预估 ATS 评分</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Verified Information (Auto-filled) */}
          <div className="space-y-8">
            <h2 className="text-lg font-cserif text-gold flex items-center gap-3 opacity-90 border-b border-white/10 pb-2">
              <span className="w-1 h-4 bg-gold"></span>
              关键信息核对 (AI Auto-Filled)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-xs text-subtle uppercase tracking-wider mb-2">学员姓名 Name</label>
                  <input type="text" name="name" value={data.name} onChange={handleChange}
                    className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:border-gold outline-none transition-colors placeholder-white/20 text-lg"
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="group">
                  <label className="block text-xs text-subtle uppercase tracking-wider mb-2">当前年级 Grade</label>
                  <select name="grade" value={data.grade} onChange={handleChange}
                    className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:border-gold outline-none text-base">
                    {GRADES.map(g => <option key={g} value={g} className="bg-surface">{g}</option>)}
                  </select>
                </div>
                <div className="group">
                  <label className="block text-xs text-subtle uppercase tracking-wider mb-2">院校背景 University Tier</label>
                  <select name="universityLevel" value={data.universityLevel} onChange={handleChange}
                    className="w-full bg-transparent border-b border-white/20 py-2 text-white focus:border-gold outline-none text-base">
                    {UNIVERSITY_LEVELS.map(l => <option key={l} value={l} className="bg-surface">{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="group">
                  <label className="block text-xs text-subtle uppercase tracking-wider mb-2">目标行业 Industry (多选)</label>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_INDUSTRIES.map(ind => (
                      <button key={ind} onClick={() => toggleIndustry(ind)}
                        className={`px-3 py-1.5 text-xs border rounded-sm transition-all flex items-center gap-1
                        ${data.targetIndustry.includes(ind) 
                          ? 'bg-gold border-gold text-black font-bold shadow-glow' 
                          : 'border-white/20 text-subtle hover:border-white/40 hover:text-white'}`}>
                        {data.targetIndustry.includes(ind) && <Check size={10} />}
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="group">
                   <label className="block text-xs text-subtle uppercase tracking-wider mb-2">当前背景 Background</label>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <select name="internshipCount" value={data.internshipCount} onChange={handleChange} className="w-full bg-transparent border-b border-white/20 py-2 text-white outline-none text-base">
                          <option value="0段" className="bg-surface">实习: 0段</option>
                          <option value="1段" className="bg-surface">实习: 1段</option>
                          <option value="2段" className="bg-surface">实习: 2段</option>
                          <option value="3段+" className="bg-surface">实习: 3段+</option>
                       </select>
                     </div>
                     <div>
                        <select name="englishLevel" value={data.englishLevel} onChange={handleChange} className="w-full bg-transparent border-b border-white/20 py-2 text-white outline-none text-base">
                          <option value="四级" className="bg-surface">英语: 四级</option>
                          <option value="六级/雅思6.5+" className="bg-surface">英语: 六级/雅思+</option>
                          <option value="无证书" className="bg-surface">英语: 无证书</option>
                       </select>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 text-center">
            <button onClick={onSubmit}
              className="group relative inline-flex items-center justify-center px-16 py-4 bg-gradient-to-r from-gold to-[#B8860B] text-black font-cserif font-bold text-lg tracking-widest shadow-glow hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 rounded-sm overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                生成职业规划报告
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
