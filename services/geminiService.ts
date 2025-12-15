import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult, RecommendationResult, StudentProfile, SuccessCase, ReferralResource } from "../types";
import { ATS_CRITERIA_TEXT, PRODUCTS_INFO, REAL_SUCCESS_STORIES, REFERRAL_RESOURCES } from "../constants";

// 获取环境变量中的 API KEY
const apiKey = process.env.API_KEY || '';

// 核心修改：设置 baseUrl 为你的代理地址
// 如果是在本地开发，可能不需要代理（取决于你是否开了全局梯子）
// 如果是生产环境(Production)，必须使用代理
// 这里假设你会在构建时注入 VITE_API_BASE_URL，或者直接硬编码你的 Worker 地址
const proxyUrl = process.env.VITE_API_BASE_URL || 'https://generativelanguage.googleapis.com'; 

// 注意：@google/genai SDK 允许在构造函数中通过 transport 自定义 fetch，或者部分版本支持 baseUrl
// 为了确保兼容性，我们使用 requestOptions 版本（如果 SDK 版本支持）
// 或者更通用的方式：SDK 通常允许传入 baseUrl
const ai = new GoogleGenAI({ 
  apiKey,
  baseUrl: proxyUrl 
});

const MODEL_NAME = 'gemini-2.5-flash';

// ---------------------------------------------------------
// 1. Resume Parsing Service
// ---------------------------------------------------------
export const parseResume = async (base64Data: string, mimeType: string): Promise<Partial<StudentProfile>> => {
  const prompt = `
    Role: ATS Resume Parser.
    Task: Analyze the provided resume image/PDF and extract structured data.
    
    Output JSON Schema:
    {
      "name": "Student Name",
      "university": "University Name",
      "universityLevel": "One of: 985, 211, 双一流, 普通一本, 二本, 海外QS前100, 海外其他",
      "major": "Major Name",
      "majorCategory": "One of: 商科金融, 理工科技, 文史哲法, 医药生化, 艺术设计, 其他",
      "grade": "Current Grade (e.g. 大三, 研一)",
      "graduationYear": "e.g. 2025届",
      "targetRole": "Inferred target role based on experience",
      "internshipCount": "e.g. 1段, 2段",
      "internshipQuality": "One of: 大厂核心, 大厂边缘, 中小企业, 无相关实习",
      "englishLevel": "e.g. 六级550+, 雅思7+, 无",
      "gpaRanking": "e.g. 前10%, 前30%, 中等",
      "atsPreScore": 65 (Estimate ATS score 0-100 based on keyword density and format)
    }
  `;

  try {
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Data } }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = result.text;
    if (!text) throw new Error("Parsing failed");
    return JSON.parse(text);
  } catch (error) {
    console.error("Resume Parsing Error:", error);
    return {};
  }
};

// ---------------------------------------------------------
// 2. Diagnosis Logic
// ---------------------------------------------------------

// Helper to select a relevant success story
const getRelevantStory = (student: StudentProfile): SuccessCase => {
  const match = REAL_SUCCESS_STORIES.find(s => 
    student.major.includes(s.major) || 
    student.targetIndustry.some(i => s.strategy.includes(i))
  );
  return match || REAL_SUCCESS_STORIES[0];
};

// Helper to get relevant referrals
const getRelevantReferrals = (student: StudentProfile): ReferralResource[] => {
    return REFERRAL_RESOURCES.slice(0, 6);
};

export const generateDiagnosis = async (student: StudentProfile): Promise<DiagnosisResult> => {
  const selectedStory = getRelevantStory(student);
  const selectedReferrals = getRelevantReferrals(student);

  const systemInstruction = `
    Role: 海马职加 (HighMark) 顶级职业规划导师 & ATS 算法专家。
    Tone: 极其专业、客观、数据驱动。
    Goal:
    1. 真实性: 目标企业必须分层（冲刺/核心/保底）。
    2. 2026届形势: 金融/大厂缩招严重，对于普通背景学生，核心/保底层必须包含"制造业、出海企业、独角兽、乙方咨询"。
    3. 雷达图(Radar Chart): 必须严格基于ATS算法维度，不要包含"职业素养"这种虚词。使用以下6个维度：
       - 学历门槛 (Education Threshold)
       - 关键词匹配 (Keyword Match)
       - 实习含金量 (Internship Impact)
       - 项目技术栈 (Tech/Skill Stack)
       - 领英/人脉 (Networking)
       - 语言能力 (Global Comm)
    
    ATS Logic:
    ${ATS_CRITERIA_TEXT}
  `;

  const userPrompt = `
    Candidate: ${JSON.stringify(student)}
    
    输出要求 (JSON):
    1. 'atsDetails': 5个维度评分。
    2. 'summary': 背景分析。
    3. 'riskAnalysis': 机会点分析。
    4. 'timeline': 3-4个阶段规划，精确到月。
    5. 'targetCompanies': 分层推荐企业。
    6. 'ptaRecommendation': 针对简历短板，推荐一段具体的PTA/实习项目及JD关键词。
    7. 'salaryProjection': 预测未来薪资。
    8. 'radarData': 6个ATS硬核维度对比 (A=Student, B=Target Job Benchmark).
    
    Context Data:
    - Selected Success Story: ${JSON.stringify(selectedStory)}
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.INTEGER },
      passLine: { type: Type.INTEGER },
      atsDetails: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            score: { type: Type.INTEGER },
            weight: { type: Type.STRING },
            maxScore: { type: Type.INTEGER },
            comment: { type: Type.STRING }
          }
        }
      },
      radarData: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING }, // MUST be the 6 ATS dimensions defined in instruction
            A: { type: Type.INTEGER },
            B: { type: Type.INTEGER },
            fullMark: { type: Type.INTEGER }
          }
        }
      },
      timeline: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stage: { type: Type.STRING },
            time: { type: Type.STRING },
            action: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['upcoming', 'current', 'completed'] }
          }
        }
      },
      hardCriteria: {
        type: Type.OBJECT,
        properties: {
          education: { type: Type.BOOLEAN },
          major: { type: Type.BOOLEAN },
          english: { type: Type.BOOLEAN },
          result: { type: Type.STRING, enum: ['PASS', 'FAIL'] }
        }
      },
      targetCompanies: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['冲刺 Reach', '核心 Match', '保底 Safety'] },
            companies: { type: Type.ARRAY, items: { type: Type.STRING } },
            successRate: { type: Type.STRING },
            comment: { type: Type.STRING }
          }
        }
      },
      ptaRecommendation: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          companies: { type: Type.ARRAY, items: { type: Type.STRING } },
          jdHighlights: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      salaryProjection: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            year: { type: Type.STRING },
            withoutHighMark: { type: Type.NUMBER },
            withHighMark: { type: Type.NUMBER }
          }
        }
      },
      competitorAnalysis: { type: Type.STRING },
      riskAnalysis: { type: Type.STRING },
      summary: { type: Type.STRING }
    }
  };

  try {
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = result.text;
    if (!text) throw new Error("No response");
    
    const parsedData = JSON.parse(text);
    parsedData.successCase = selectedStory;
    parsedData.matchedReferrals = selectedReferrals;

    return parsedData as DiagnosisResult;
  } catch (error) {
    console.error("Diagnosis Error:", error);
    return {
      overallScore: 60,
      passLine: 70,
      atsDetails: [],
      radarData: [],
      timeline: [],
      hardCriteria: { education: true, major: true, english: false, result: 'PASS' },
      targetCompanies: [],
      successCase: selectedStory,
      matchedReferrals: selectedReferrals,
      salaryProjection: [],
      competitorAnalysis: "...",
      riskAnalysis: "...",
      summary: "系统繁忙，请稍后重试。如多次失败，请检查网络连接。",
    };
  }
};

// ---------------------------------------------------------
// 3. Recommendation Logic
// ---------------------------------------------------------
export const generateRecommendations = async (student: StudentProfile, diagnosis: DiagnosisResult): Promise<RecommendationResult> => {
  const prompt = `
    Role: 海马职加 首席课程顾问。
    Task: 为学员制定产品组合方案。
    
    Diagnosis Summary: Score ${diagnosis.overallScore}. 
    
    Output JSON requirements:
    1. 'coreStrategy': 一句话核心策略 (中文)。
    2. 'initialRecommendedProducts': 推荐2-3个产品Key (String Array).
    3. 'salesLogic': 
       - valueProp