// 保安会議・自己診断の型定義

// 自己診断チェック項目のカテゴリ
export type DiagnosisCategory = 
  | 'policy' // 保安方針
  | 'plan' // 計画
  | 'do' // 実施
  | 'check' // 評価
  | 'act'; // 改善

export const DIAGNOSIS_CATEGORY_LABELS: Record<DiagnosisCategory, string> = {
  policy: '保安方針',
  plan: 'P（計画）',
  do: 'D（実施）',
  check: 'C（評価）',
  act: 'A（改善）'
};

// 評価レベル
export type EvaluationLevel = 0 | 1 | 2 | 3;

export const EVALUATION_LEVEL_LABELS: Record<EvaluationLevel, { label: string; description: string; color: string }> = {
  0: { label: '未実施', description: '取り組みを行っていない', color: 'bg-gray-100 text-gray-600' },
  1: { label: '不十分', description: '一部実施しているが不十分', color: 'bg-danger-100 text-danger-700' },
  2: { label: '概ね良好', description: '概ね実施できている', color: 'bg-warning-100 text-warning-700' },
  3: { label: '良好', description: '十分に実施できている', color: 'bg-success-100 text-success-700' }
};

// 自己診断チェック項目
export interface DiagnosisCheckItem {
  id: string;
  category: DiagnosisCategory;
  question: string;
  description?: string;
  order: number;
}

// 自己診断結果
export interface DiagnosisResult {
  itemId: string;
  evaluation: EvaluationLevel;
  comment?: string;
}

// 自己診断記録
export interface DiagnosisRecord {
  id: string;
  fiscalYear: number;
  diagnosisDate: string;
  diagnosedBy: string;
  results: DiagnosisResult[];
  overallComment?: string;
  improvementPlan?: string;
  createdAt: string;
  updatedAt: string;
}

// 保安会議
export interface SafetyMeeting {
  id: string;
  meetingDate: string;
  meetingType: 'regular' | 'emergency' | 'special'; // 定例・緊急・特別
  title: string;
  location?: string;
  
  // 参加者
  participants: string[];
  totalMembers: number;
  attendanceRate: number;
  
  // 議題
  agendaItems: AgendaItem[];
  
  // 決定事項
  decisions: string[];
  
  // 次回アクション
  actionItems: ActionItem[];
  
  // AI要約（オプション）
  aiSummary?: string;
  aiImprovementSuggestions?: string[];
  
  // メタ情報
  minutes?: string; // 議事録
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// 議題
export interface AgendaItem {
  id: string;
  title: string;
  presenter: string;
  duration: number; // 分
  content: string;
  discussion?: string;
  result?: string;
}

// アクション項目
export interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedDate?: string;
}

// MS評価項目（Check/Act段階での詳細評価）
export interface MSEvaluationItem {
  id: string;
  category: DiagnosisCategory;
  section: string;
  question: string;
  order: number;
}

// MS評価結果
export interface MSEvaluation {
  id: string;
  fiscalYear: number;
  evaluationDate: string;
  evaluatedBy: string;
  results: {
    itemId: string;
    status: 'yes' | 'no' | 'partial';
    evidence?: string;
    improvement?: string;
  }[];
  summary: {
    policy: { yes: number; no: number; partial: number };
    plan: { yes: number; no: number; partial: number };
    do: { yes: number; no: number; partial: number };
    check: { yes: number; no: number; partial: number };
    act: { yes: number; no: number; partial: number };
  };
  createdAt: string;
  updatedAt: string;
}

// 会議種別ラベル
export const MEETING_TYPE_LABELS: Record<SafetyMeeting['meetingType'], string> = {
  regular: '定例会議',
  emergency: '緊急会議',
  special: '特別会議'
};

// アクションステータスラベル
export const ACTION_STATUS_LABELS: Record<ActionItem['status'], string> = {
  pending: '未着手',
  in_progress: '進行中',
  completed: '完了'
};
