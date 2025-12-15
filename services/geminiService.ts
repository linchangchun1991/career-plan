import { DiagnosisResult, RecommendationResult, StudentProfile, SuccessCase, ReferralResource } from "../types";
import { ATS_CRITERIA_TEXT, PRODUCTS_INFO, REAL_SUCCESS_STORIES, REFERRAL_RESOURCES } from "../constants";

// 阿里通义千问配置
// 注意：在 Vercel 部署时，建议将此 Key 放入 Environment Variables，这里为了演示直接使用您提供的Key
const API_KEY = process.env.API_KEY || 'sk-668c28bae516493d9ea8a3662118ec98';

// 关键点：直接在前端请求 dashscope.aliyuncs.com 会触发 CORS 错误。
// 解决方案：使用相对路径 '/api/proxy'，并在部署平台(Vercel/Vite)配置反向代理指向阿里云。
// 如果你在本地开发且没有配置代理，这可能会失败。
// 部署上线时，我们将使用 Vercel Rewrites 来转发这个请求。
const BASE_URL = '/api/proxy/chat/completions';

// ---------------------------------------------------------
// Helper: Qwen Fetcher
// ---------------------------------------------------------
const callQwen = async (messages: any[], model: string, jsonMode: boolean = true) => {
  const payload: any = {
    model: model,
    messages: messages,
    stream: false
  };

  if (jsonMode && !model.includes('vl')) {
    // qwen-vl models do not support response_format json_object yet in some endpoints, 
    // but qwen-plus does.
    payload.response_format = { type: "json_object" };
  }

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Qwen API Error:", err);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) throw new Error("No content in response");
    
    // Clean up markdown code blocks if present
    const cleanJson = content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Call Qwen Failed:", error);
    throw error;
  }
};

// ---------------------------------------------------------
// 1. Resume Parsing Service (Qwen-VL-Max)
// ---------------------------------------------------------
export const parseResume = async (base64Data: string, mimeType: string): Promise<Partial<StudentProfile>> => {
  // Qwen-VL requires the image as a base64 string or URL
  // We need to ensure the format is correct data URI
  const dataUri = base64Data.startsWith('data:') ? base64Data : `data:${mimeType};base64,${base64Data}`;

  const prompt = `
    Role: ATS Resume Parser.
    Task: Extract structured data from this resume image.
    
    Return strict JSON (no markdown):
    {
      "name": "Student Name (or '同学' if not found)",
      "university": "University Name",
      "universityLevel": "One of: 985, 211, 双一流, 普通一本, 二本, 海外QS前100, 海外其他",
      "major": "Major Name",
      "majorCategory": "One of: 商科金融, 理工科技, 文史哲法, 医药生化, 艺术设计, 其他",
      "grade": "Current Grade (e.g. 大三, 研一)",
      "graduationYear": "e.g. 2025届",
      "internshipCount": "e.g. 1段, 2段",
      "englishLevel": "e.g. 六级550+, 雅思7+, 无",
      "gpaRanking": "e.g. 前10%, 前30%, 中等",
      "atsPreScore": 65 (Integer 0-100)
    }
  `;

  try {
    // 使用 qwen-vl-max 进行视觉理解
    // 注意：qwen-vl-max 的 json mode 支持有限，我们通过 Prompt 强约束
    const messages = [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUri } },
          { type: "text", text: prompt }
        ]
      }
    ];

    const result = await callQwen(messages, "qwen-vl-max", false);
    return result;
  } catch (error) {
    console.error("Resume Parsing Error:", error);
    return {
      name: "未知学员",
      atsPreScore: 60
    };
  }
};

// ---------------------------------------------------------
// 2. Diagnosis Logic (Qwen-Plus)
// ---------------------------------------------------------
const getRelevantStory = (student: StudentProfile): SuccessCase => {
  const match = REAL_SUCCESS_STORIES.find(s => 
    student.major.includes(s.major) || 
    student.targetIndustry.some(i => s.strategy.includes(i))
  );
  return match || REAL_SUCCESS_STORIES[0];
};

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
    3. 雷达图: 严格基于以下6个ATS维度 (0-100分):
       - 学历门槛
       - 关键词匹配
       - 实习含金量
       - 项目技术栈
       - 领英/人脉
       - 语言能力
    
    ATS Logic:
    ${ATS_CRITERIA_TEXT}
  `;

  const userPrompt = `
    Candidate: ${JSON.stringify(student)}
    
    Output Strict JSON:
    {
      "overallScore": 65,
      "summary": "...",
      "riskAnalysis": "...",
      "atsDetails": [{"category": "教育背景", "score": 80, "maxScore": 100, "weight": "20%", "comment": "..."}],
      "radarData": [{"subject": "学历门槛", "A": 80, "B": 90, "fullMark": 100}],
      "timeline": [{"stage": "S1", "time": "...", "action": "...", "status": "upcoming"}],
      "targetCompanies": [{"type": "冲刺 Reach", "companies": ["A", "B"], "successRate": "10%"}],
      "ptaRecommendation": {"role": "...", "companies": ["..."], "jdHighlights": ["..."]},
      "salaryProjection": [{"year": "1年", "withoutHighMark": 15, "withHighMark": 25}]
    }
  `;

  try {
    const messages = [
      { role: "system", content: systemInstruction },
      { role: "user", content: userPrompt }
    ];

    const result = await callQwen(messages, "qwen-plus");
    
    // Inject local static data
    result.successCase = selectedStory;
    result.matchedReferrals = selectedReferrals;
    // Fallback for hardCriteria if AI missed it
    if (!result.hardCriteria) {
        result.hardCriteria = { education: true, major: true, english: false, result: 'PASS' };
    }

    return result as DiagnosisResult;
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
      summary: "系统繁忙，请检查网络或重试。",
    };
  }
};

// ---------------------------------------------------------
// 3. Recommendation Logic (Qwen-Plus)
// ---------------------------------------------------------
export const generateRecommendations = async (student: StudentProfile, diagnosis: DiagnosisResult): Promise<RecommendationResult> => {
  const prompt = `
    Role: 海马职加 首席课程顾问。
    Diagnosis Score: ${diagnosis.overallScore}.
    Task: Create a sales proposal JSON.
    
    Structure:
    {
      "coreStrategy": "String",
      "initialRecommendedProducts": ["PTA", "CAREER_PLAN"],
      "salesLogic": {
        "valueProp": ["String", "String"],
        "timing": ["String", "String"],
        "scarcity": ["String", "String"]
      },
      "closingScript": "String"
    }
  `;

  try {
    const messages = [
      { role: "user", content: prompt }
    ];
    
    return await callQwen(messages, "qwen-plus");
  } catch (error) {
    return {
      coreStrategy: "背景提升与精准投递并行。",
      initialRecommendedProducts: ["PTA", "CAREER_PLAN"],
      salesLogic: {
        valueProp: ["独家内推网络", "大厂导师1v1辅导", "全流程结果保障"],
        timing: ["秋招补录黄金期", "春招提前批即将开启", "错峰竞争最佳时机"],
        scarcity: ["热门岗位内推名额仅剩个位数", "导师排期紧张"]
      },
      closingScript: "求职是一场概率游戏，海马职加不能保证100%成功，但我们能用系统的打法，将您进入名企的概率从自然投递的5%提升至85%以上。"
    };
  }
};
