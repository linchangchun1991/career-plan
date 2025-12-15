import { StudentProfile, SuccessCase, ReferralResource } from "./types";

export const INITIAL_STUDENT_STATE: StudentProfile = {
  name: "",
  university: "",
  universityLevel: "普通一本",
  majorCategory: "商科金融",
  major: "",
  grade: "大三",
  graduationYear: "2026届",
  targetIndustry: [],
  targetRole: "",
  targetCity: "不限",
  expectedSalary: "10-15K",
  internshipCount: "0段",
  internshipQuality: "无相关实习",
  projects: "无",
  certificates: "无",
  gpaRanking: "中等",
  englishLevel: "四级",
  status: "刚开始了解",
};

export const TARGET_INDUSTRIES = [
  '金融/券商', '互联网/科技', '咨询/四大', '快消/零售', '传媒/广告', '国企/央企', '医药/生化', '新能源/制造'
];

export const PRODUCTS_INFO: Record<string, {name: string, price: string, desc: string}> = {
  CAREER_PLAN: {
    name: "千里马计划 (全流程)",
    price: "29800",
    desc: "简历+笔试+面试+内推+Offer保障"
  },
  PTA: {
    name: "PTA 名企实战",
    price: "9800",
    desc: "4-8周远程项目，MBB/投行/大厂导师带教"
  },
  HR_TRAINING: {
    name: "500强人事实训",
    price: "6800",
    desc: "真实系统操作，适合HR/行政方向"
  },
  COURSE_1V1: {
    name: "1V1 深度定制课",
    price: "3500",
    desc: "针对性解决单面/群面/职业规划痛点(每课时)"
  },
  SUBMISSION_SERVICE: {
    name: "大厂代投包",
    price: "4500",
    desc: "人工筛选精准投递，涵盖隐形岗位"
  },
  TEST_PRACTICE: {
    name: "笔试/OT通关",
    price: "2000",
    desc: "SHL/PwC真题库+辅助练习"
  }
};

export const UNIVERSITY_LEVELS = [
  "985", "211", "双一流", "普通一本", "二本", "三本/专科", "海外QS前100", "海外QS前200", "海外其他"
];

export const GRADES = [
  "大一", "大二", "大三", "大四", "研一", "研二", "研三", "已毕业"
];

export const ATS_CRITERIA_TEXT = `
海马职加-大厂ATS评分标准 (Moka/北森模型):
1. 硬性门槛 (一票否决): 学历(985/211/QS100优先), 专业相关度, 英语(六级/雅思).
2. 评分权重 (100分制):
   - 教育背景 (15-20%): 院校层次, GPA(前10%加分), 获奖.
   - 专业技能 (25-30%): 技能匹配度, 证书(CPA/CFA等).
   - 项目经验 (20-25%): STAR法则描述, 成果量化, 角色职责.
   - 实习经历 (15-20%): 企业知名度(500强), 岗位相关性, 时长.
   - 综合素质 (10-15%): 领导力, 沟通, 逻辑(AI面试/OT).
3. 筛选阈值: 通常70分通过.
`;

export const OBJECTION_HANDLERS: Record<string, { empathy: string; response: string }> = {
  "价格超出预算": {
    empathy: "我非常理解您的顾虑，留学生的每一分钱都应该花在刀刃上。",
    response: "但这其实是对于职业生涯的一笔'种子投资'。我们不是在消费，而是在置换资源。您可以看下刚才的ROI分析，哪怕起薪提升2k，一年就是2.4万，基本回本。而且我们支持分期，首付压力很小。"
  },
  "想先自己试试": {
    empathy: "您的独立和行动力非常值得肯定，这是优秀职场人的潜质。",
    response: "不过2026届的形势非常特殊，大厂缩招严重，试错成本极高。一旦简历被锁，半年内都无法再投递。我们做的就是帮您'避坑'，利用我们的内推渠道和信息差，确保您的每一次投递都打在点上。"
  },
  "不确定产品效果": {
    empathy: "面对职业选择的慎重是对自己负责的表现。",
    response: "我们的方案是基于数万名留学生成功案例和大厂ATS算法倒推出来的。您可以看刚才展示的真实学员故事，像那位双非逆袭大厂的同学，起初情况比您还严峻。我们的服务是结果导向的，全流程保障。"
  },
  "需要和父母商量": {
    empathy: "这是非常正确且必要的，职业规划是家庭的大事。",
    response: "我稍后会把这份《职业发展规划报告》生成PDF发给您。您可以给父母看里面的数据分析、岗位梯队和薪资预测。父母往往担心的是信息不透明，这份专业的报告能让他们看到实实在在的规划路径。"
  }
};

// Extracted from PDF
export const REAL_SUCCESS_STORIES: SuccessCase[] = [
  {
    id: "01",
    profile: "24届 本科毕业生",
    major: "物流/供应链",
    before: "方向摇摆，简历缺乏针对性，面试转化率低",
    after: "斩获 贝法易 (14k+) Offer",
    strategy: "挖掘实习中150柜物流方案优化经历，改写为量化成果；模拟SHEIN面试。"
  },
  {
    id: "19",
    profile: "26届 硕士",
    major: "计算机/后端",
    before: "目标明确但竞争激烈，需硬核技术加持",
    after: "斩获 字节跳动/游戏大厂 实习Offer",
    strategy: "大厂技术总监1v1规划八股文+中间件项目，内推加速筛选。"
  },
  {
    id: "34",
    profile: "25届 毕业生",
    major: "车辆工程/市场营销",
    before: "不想做研发，纯市场岗卷不过文商科",
    after: "斩获 理想汽车 产品运营 Offer",
    strategy: "打造'懂技术的市场人'人设，突出三电系统理解，降维打击纯文科生。"
  },
  {
    id: "89",
    profile: "25届 毕业生",
    major: "管理/经济",
    before: "投递中金屡屡受挫，想做一级市场无门路",
    after: "斩获 普华永道 ESG咨询 Offer",
    strategy: "锁定ESG新赛道，挂载实战项目，避开传统红海竞争。"
  },
  {
    id: "105",
    profile: "25届 毕业生",
    major: "人力资源",
    before: "担心回国只能做基础HR，容易被替代",
    after: "斩获 京东 HR管培生 Offer",
    strategy: "定位拔高至OD/HRBP方向，面试展示业务思维和组织架构调整逻辑。"
  },
  {
    id: "144",
    profile: "25届 毕业生",
    major: "工业工程",
    before: "未知专业背景",
    after: "斩获 Apple 制造设计工程师 (MDE) Offer",
    strategy: "全英实战模拟，重点强化Influence without Authority软技能。"
  }
];

// Extracted from Image
export const REFERRAL_RESOURCES: ReferralResource[] = [
  { company: "叮咚买菜", position: "供应链/运营管培", location: "上海", type: "校招" },
  { company: "中国商飞", position: "软件开发/机载系统", location: "上海", type: "校招" },
  { company: "路特斯", position: "市场/采购/结构工程", location: "深圳/武汉", type: "校招" },
  { company: "奥海科技", position: "研发/运营/职能", location: "东莞/全球", type: "校招" },
  { company: "字节跳动", position: "推荐产品运营/电商", location: "北京/上海", type: "校招" },
  { company: "StarThing", position: "全栈开发/门店管理", location: "广州", type: "社招" },
  { company: "叠纸游戏", position: "3D特效/场景/原画", location: "上海", type: "校招" },
  { company: "立景创新", position: "研发/工程/职能", location: "广州/深圳", type: "校招" },
  { company: "大疆创新", position: "嵌入式/算法", location: "深圳", type: "实习" },
  { company: "蔚来汽车", position: "区域营销/产品", location: "武汉/上海", type: "校招" },
  { company: "普华永道", position: "审计/咨询", location: "北京/上海", type: "校招" },
  { company: "中信证券", position: "投行/主要部门", location: "北京/深圳", type: "实习" },
  { company: "网易游戏", position: "游戏策划/开发", location: "广州/杭州", type: "校招" },
  { company: "米哈游", position: "HRBP/社区运营", location: "上海", type: "社招" }
];
