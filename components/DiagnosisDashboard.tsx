import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { DiagnosisResult } from '../types';
import { CheckCircle, XCircle, Target, TrendingUp, Building2, UserCheck, Briefcase, Download, Share2 } from 'lucide-react';

interface Props {
  result: DiagnosisResult;
  studentName: string;
}

const DiagnosisDashboard: React.FC<Props> = ({ result, studentName }) => {
  
  const handleExportPDF = () => {
    // Hide buttons before print
    document.body.classList.add('printing');
    
    const element = document.getElementById('dashboard-content');
    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right
      filename: `${studentName || '学员'}_海马职加_职业规划发展报告.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
         document.body.classList.remove('printing');
      });
    } else {
      alert("PDF生成组件加载中，请稍后再试");
      document.body.classList.remove('printing');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto relative">
      
      {/* Floating Action Buttons */}
      <div className="absolute -top-12 right-0 flex gap-4 no-print">
         <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-gold text-black rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-[#b8952b] transition-colors shadow-glow">
            <Download size={16} /> 导出报告 PDF
         </button>
      </div>

      <div id="dashboard-content" className="bg-white text-slate-900 shadow-luxury animate-fade-in relative overflow-hidden rounded-lg">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0b1121] via-gold to-[#0b1121]"></div>

        {/* Header */}
        <div className="bg-[#0b1121] text-white p-8 md:p-10 border-b border-white/10 print:bg-[#0b1121] print:text-white print-break-inside-avoid">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="font-cserif text-3xl md:text-4xl font-bold tracking-wide mb-2">
                {studentName || '学员'} · 职业发展规划报告
              </h1>
              <p className="text-subtle text-xs uppercase tracking-[0.2em] font-light">
                HighMark Career Development Strategy Report
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-2">
                 <span className="text-sm text-subtle font-light">ATS 综合竞争力</span>
                 <span className="text-6xl font-serif text-white">{result.overallScore}</span>
              </div>
              <div className={`mt-2 inline-flex items-center px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${result.overallScore >= 70 ? 'bg-success/20 text-success border border-success/30' : 'bg-warning/20 text-warning border border-warning/30'}`}>
                {result.overallScore >= 70 ? 'Competent 竞争力良好' : 'Improvement Needed 需重点提升'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f8fafc] p-8 md:p-10 grid lg:grid-cols-12 gap-10">
          
          {/* Left Column: Analysis (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Executive Summary */}
            <div className="print-break-inside-avoid">
              <h3 className="flex items-center gap-3 font-cserif text-xl font-bold text-[#0b1121] mb-6">
                <span className="w-1.5 h-6 bg-gold"></span>
                背景分析与核心摘要
              </h3>
              <div className="bg-white border-l-4 border-gold/50 p-6 shadow-sm rounded-r-lg">
                 <div className="text-slate-700 leading-relaxed text-justify font-serif whitespace-pre-line">
                   {result.summary}
                 </div>
                 <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-3">
                   <Target size={18} className="text-gold shrink-0 mt-1" />
                   <div>
                      <span className="text-sm font-bold text-[#0b1121] block mb-1">关键机会点 (Opportunity Points):</span>
                      <span className="text-sm text-slate-600">{result.riskAnalysis}</span>
                   </div>
                 </div>
              </div>
            </div>

            {/* Target Companies Tier */}
            {result.targetCompanies && (
              <div className="print-break-inside-avoid">
                <h3 className="flex items-center gap-3 font-cserif text-xl font-bold text-[#0b1121] mb-6">
                  <span className="w-1.5 h-6 bg-gold"></span>
                  名企定校梯队 (Target Company Pool)
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {result.targetCompanies.map((tier, idx) => (
                    <div key={idx} className={`p-5 rounded-lg border flex flex-col ${idx === 0 ? 'bg-[#0b1121] text-white border-gold' : 'bg-white border-slate-200'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <span className={`text-sm font-bold uppercase tracking-wider ${idx === 0 ? 'text-gold' : 'text-slate-500'}`}>{tier.type}</span>
                        <span className="text-xs opacity-70">成功率 {tier.successRate}</span>
                      </div>
                      <div className="space-y-3 flex-grow">
                        {tier.companies.map((co, cIdx) => (
                          <div key={cIdx} className="flex items-center gap-2">
                            <Building2 size={14} className={idx === 0 ? 'text-gold' : 'text-slate-400'} />
                            <span className={`font-serif font-bold ${idx === 0 ? 'text-white' : 'text-slate-800'}`}>{co}</span>
                          </div>
                        ))}
                      </div>
                      {tier.comment && (
                        <div className={`mt-4 pt-3 border-t text-[10px] italic leading-tight ${idx === 0 ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                           {tier.comment}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PTA Recommendation */}
            {result.ptaRecommendation && (
              <div className="print-break-inside-avoid">
                <h3 className="flex items-center gap-3 font-cserif text-xl font-bold text-[#0b1121] mb-6">
                  <span className="w-1.5 h-6 bg-gold"></span>
                  建议补充实习/PTA方向
                </h3>
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row gap-8">
                   <div className="flex-1">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Recommended Role</div>
                      <div className="text-xl font-bold text-[#0b1121] mb-2">{result.ptaRecommendation.role}</div>
                      <div className="flex flex-wrap gap-2 mb-4">
                         {result.ptaRecommendation.companies.map((co, i) => (
                           <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-bold border border-slate-200">{co}</span>
                         ))}
                      </div>
                   </div>
                   <div className="flex-1 border-l border-slate-100 pl-8">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">JD 核心关键词 (Keywords)</div>
                      <div className="space-y-2">
                         {result.ptaRecommendation.jdHighlights.map((hl, i) => (
                           <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                             <div className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0"></div>
                             {hl}
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            )}
            
            {/* Exclusive Referral Resources */}
            {result.matchedReferrals && result.matchedReferrals.length > 0 && (
                <div className="print-break-inside-avoid">
                  <h3 className="flex items-center gap-3 font-cserif text-xl font-bold text-[#0b1121] mb-6">
                    <span className="w-1.5 h-6 bg-gold"></span>
                    海马独家内推资源 (Exclusive Referrals)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {result.matchedReferrals.map((ref, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-3 rounded hover:border-gold/50 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-800 text-sm truncate pr-2">{ref.company}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${ref.type === '校招' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{ref.type}</span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium mb-1 truncate">{ref.position}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Building2 size={10} /> {ref.location}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            )}

            {/* Timeline */}
            {result.timeline && (
              <div className="print-break-inside-avoid">
                <h3 className="flex items-center gap-3 font-cserif text-xl font-bold text-[#0b1121] mb-6">
                  <span className="w-1.5 h-6 bg-gold"></span>
                  职业规划时间轴
                </h3>
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 py-2">
                  {result.timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-8">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${item.status === 'completed' ? 'bg-green-500 border-green-500' : item.status === 'current' ? 'bg-gold border-gold' : 'bg-white border-slate-300'}`}></div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 hover:border-gold/30 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-[#0b1121]">{item.stage}</span>
                          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">{item.time}</span>
                        </div>
                        <p className="text-sm text-slate-600">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Visuals & ROI (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* ROI/Salary Projection */}
            {result.salaryProjection && (
              <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-md print-break-inside-avoid">
                  <h4 className="font-cserif text-[#0b1121] font-bold mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-600" />
                    职业回报预测 (ROI)
                  </h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.salaryProjection}>
                        <defs>
                          <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{backgroundColor: '#0b1121', border: 'none', borderRadius: '4px', fontSize: '12px', color: '#fff'}}
                          formatter={(value: number) => [`¥${value}万`, '年薪']}
                        />
                        <Area type="monotone" dataKey="withHighMark" stroke="#D4AF37" fillOpacity={1} fill="url(#colorHigh)" name="海马规划" />
                        <Area type="monotone" dataKey="withoutHighMark" stroke="#94a3b8" fillOpacity={0.1} fill="#94a3b8" name="自然发展" strokeDasharray="3 3" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    *基于行业大数据模型推演，仅供参考
                  </p>
              </div>
            )}

            {/* Radar Chart */}
            <div className="bg-[#0b1121] p-6 text-white relative overflow-hidden rounded-lg shadow-luxury print:bg-[#0b1121] print:text-white print-break-inside-avoid">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h4 className="font-cserif text-lg text-gold mb-6 border-b border-white/10 pb-2">六维能力模型</h4>
                
                <div className="w-full h-64 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={result.radarData}>
                      <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Candidate" dataKey="A" stroke="#f1f5f9" strokeWidth={2} fill="#f1f5f9" fillOpacity={0.1} />
                      <Radar name="Benchmark" dataKey="B" stroke="#D4AF37" strokeWidth={1} strokeDasharray="4 4" fill="transparent" />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* Success Case (Trust Building) */}
            {result.successCase && (
              <div className="bg-[#f0f9ff] border border-blue-100 p-6 rounded-lg print-break-inside-avoid">
                  <h4 className="font-cserif text-[#0b1121] font-bold mb-4 flex items-center gap-2">
                    <UserCheck size={18} className="text-blue-600" />
                    真实学员成功案例
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                         {result.successCase.id || "01"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0b1121]">{result.successCase.profile}</div>
                        <div className="text-xs text-slate-500">{result.successCase.major}</div>
                      </div>
                    </div>
                    
                    <div className="relative pl-4 border-l-2 border-slate-200 space-y-3">
                       <div className="text-xs">
                         <span className="font-bold text-slate-400 block mb-1">规划前 (Before)</span> 
                         <span className="text-slate-600">{result.successCase.before}</span>
                       </div>
                       <div className="text-xs">
                         <span className="font-bold text-blue-600 block mb-1">规划后 (After)</span> 
                         <span className="text-blue-800 font-bold">{result.successCase.after}</span>
                       </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded text-xs text-blue-900 italic leading-relaxed border border-blue-100">
                      "核心策略：{result.successCase.strategy}"
                    </div>
                  </div>
              </div>
            )}

            {/* ATS Table */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm print-break-inside-avoid">
                <h4 className="font-cserif text-[#0b1121] font-bold mb-4 text-sm border-b border-slate-100 pb-2">
                  ATS 维度评分表
                </h4>
                <div className="space-y-3">
                  {result.atsDetails.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">{item.category}</span>
                        <span className="font-bold text-[#0b1121]">{item.score}/{item.maxScore}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-gold" style={{ width: `${(item.score / item.maxScore) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DiagnosisDashboard;
