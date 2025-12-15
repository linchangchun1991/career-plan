export interface StudentProfile {
  name: string;
  university: string;
  universityLevel: string;
  majorCategory: string;
  major: string;
  grade: string;
  graduationYear: string;
  
  targetIndustry: string[];
  targetRole: string;
  targetCity: string;
  expectedSalary: string;
  
  internshipCount: string;
  internshipQuality: string;
  projects: string;
  certificates: string;
  gpaRanking: string;
  englishLevel: string;
  
  status: string;
  resumeFile?: string; // Base64 string
  resumeFileName?: string;
  
  // New fields for AI Parsing
  isParsing?: boolean;
  atsPreScore?: number; // Initial score from resume parsing
  atsMissingKeywords?: string[]; // Keywords missing from resume
}

export interface RadarMetric {
  subject: string;
  A: number; // Student score
  B: number; // Target score
  fullMark: number;
}

export interface AtsScoreDetail {
  category: string;
  score: number;
  weight: string; // e.g. "20%"
  maxScore: number;
  comment: string;
}

export interface TimelineItem {
  stage: string; // e.g. "S1 储备期"
  time: string; // e.g. "2024.05 - 2024.06"
  action: string;
  status: 'upcoming' | 'current' | 'completed';
}

export interface CompanyTier {
  type: '冲刺 Reach' | '核心 Match' | '保底 Safety';
  companies: string[];
  successRate: string;
  comment?: string; // Reason for this tier
}

export interface SuccessCase {
  id?: string;
  profile: string; // "某UCL硕士同学"
  major: string;
  before: string; // "0实习，迷茫"
  after: string; // "斩获中金IBD Offer"
  strategy: string; // "通过PTA补充一段核心经历..."
  offerImage?: string; // Optional image reference
}

export interface SalaryProjection {
  year: string; // "1年", "3年", "5年"
  withoutHighMark: number; // Annual salary
  withHighMark: number;
}

export interface ReferralResource {
  company: string;
  position: string;
  location: string;
  type: '校招' | '实习' | '社招';
}

export interface DiagnosisResult {
  overallScore: number;
  passLine: number; // 70 usually
  atsDetails: AtsScoreDetail[]; // Breakdown based on ATS logic
  radarData: RadarMetric[];
  timeline: TimelineItem[]; // New timeline
  hardCriteria: {
    education: boolean;
    major: boolean;
    english: boolean;
    result: 'PASS' | 'FAIL';
  };
  targetCompanies: CompanyTier[]; // New: Target Company Tiers
  successCase: SuccessCase; // New: Similar Success Case
  matchedReferrals: ReferralResource[]; // New: Matched exclusive resources
  salaryProjection: SalaryProjection[]; // New: ROI Visualization
  competitorAnalysis: string;
  riskAnalysis: string; // "Opportunity Points" in tone
  ptaRecommendation?: {
     role: string;
     companies: string[];
     jdHighlights: string[]; // Key skills needed
  };
  summary: string;
}

// Product Item Structure for the Cart
export interface ProductItem {
  id: string;
  name: string;
  desc: string;
  originalPrice: number;
  finalPrice: number; // Price after consultant edit
  isSelected: boolean;
  isCustom?: boolean; // If added manually by consultant
}

// Initial suggestion from AI, but fully editable in UI
export interface RecommendationResult {
  coreStrategy: string;
  // Instead of static arrays, we initialize the cart with these
  initialRecommendedProducts: string[]; 
  salesLogic: {
    valueProp: string[]; // Changed to array for bullet points
    timing: string[];    // Changed to array
    scarcity: string[];  // Changed to array
  };
  closingScript: string;
}

export enum AppState {
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
}
