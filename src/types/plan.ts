// 年間保安計画の型定義

// 重点項目カテゴリ
export type PlanCategory = 
  | 'ra' // リスクアセスメント
  | 'meeting' // 保安会議・保安集会
  | 'equipment' // 設備対策
  | 'activity' // 保安活動
  | 'education' // 保安教育
  | 'other'; // その他

export const PLAN_CATEGORY_LABELS: Record<PlanCategory, string> = {
  ra: '①リスクアセスメント',
  meeting: '②保安会議・保安集会',
  equipment: '③設備対策',
  activity: '④保安活動',
  education: '⑤保安教育',
  other: '⑥その他',
};

// 計画項目
export interface PlanItem {
  id: string;
  category: PlanCategory;
  title: string;
  description: string;
  expectedEffect: string; // 期待する効果
  targetValue?: string; // 目標値
  responsible: string; // 主たる担当者
  
  // 月別スケジュール（1-12月）
  schedule: MonthSchedule[];
  
  // 経営資源
  budget?: number;
  manDays?: number;
  
  // 評価・改善
  evaluation?: string;
  improvement?: string;
  
  createdAt: string;
  updatedAt: string;
}

// 月別スケジュール
export interface MonthSchedule {
  month: number; // 1-12
  planned: boolean;
  completed: boolean;
  completedDate?: string;
  note?: string;
}

// 保安目標
export interface SafetyGoal {
  id: string;
  fiscalYear: number;
  mainGoal: string; // 例: 不休・休業災害ゼロを達成
  priorityItems: PriorityItem[];
  createdAt: string;
  updatedAt: string;
}

// 重点項目
export interface PriorityItem {
  category: PlanCategory;
  goals: string[]; // 期待する効果・目標
}

// 年間保安計画
export interface AnnualSafetyPlan {
  id: string;
  fiscalYear: number;
  safetyPolicy: string; // 保安方針
  safetyGoal: SafetyGoal;
  planItems: PlanItem[];
  
  // 前年度振り返り
  previousYearReview?: string;
  
  // 災害発生状況
  accidentStats: {
    over4weeks: number;
    under4weeks: number;
    hiyariCount: number;
    inspectionIssues?: string;
  };
  
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
  approvedBy?: string;
  approvedDate?: string;
  
  createdAt: string;
  updatedAt: string;
}

// 進捗サマリー
export interface ProgressSummary {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  delayedItems: number;
  completionRate: number;
  byCategory: Record<PlanCategory, {
    total: number;
    completed: number;
    rate: number;
  }>;
}

// ステータスラベル
export const PLAN_STATUS_LABELS: Record<AnnualSafetyPlan['status'], string> = {
  draft: '下書き',
  approved: '承認済',
  in_progress: '実施中',
  completed: '完了',
};
