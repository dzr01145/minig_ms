// ヒヤリハット報告の型定義

// 事故の型（3つの重点事故型 + その他）
export type AccidentType = 
  | 'fall' // 墜落転落
  | 'caught' // はさまれ・巻き込まれ
  | 'flying' // 飛来・落下
  | 'trip' // 転倒
  | 'other'; // その他

export const ACCIDENT_TYPE_LABELS: Record<AccidentType, string> = {
  fall: '墜落転落',
  caught: 'はさまれ・巻き込まれ',
  flying: '飛来・落下',
  trip: '転倒',
  other: 'その他',
};

// 発生場所
export type Location = 
  | 'drilling' // 穿孔場
  | 'blasting' // 発破場
  | 'loading' // 積込運搬
  | 'crushing' // 砕鉱・選鉱場
  | 'maintenance' // 整備場
  | 'office' // 事務所
  | 'road' // 運搬道路
  | 'other'; // その他

export const LOCATION_LABELS: Record<Location, string> = {
  drilling: '穿孔場',
  blasting: '発破場',
  loading: '積込運搬',
  crushing: '砕鉱・選鉱場',
  maintenance: '整備場',
  office: '事務所',
  road: '運搬道路',
  other: 'その他',
};

// 重大度レベル
export type SeverityLevel = 'high' | 'medium' | 'low';

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  high: '重大（すごく心配）',
  medium: '中程度（心配）',
  low: '軽微（気になる）',
};

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  high: 'bg-danger-100 text-danger-800 border-danger-300',
  medium: 'bg-warning-100 text-warning-800 border-warning-300',
  low: 'bg-success-100 text-success-800 border-success-300',
};

// 原因カテゴリ
export type CauseCategory = 
  | 'equipment' // 設備・機械の不備
  | 'procedure' // 作業手順の問題
  | 'human' // ヒューマンエラー
  | 'environment' // 作業環境
  | 'management' // 管理体制
  | 'other'; // その他

export const CAUSE_LABELS: Record<CauseCategory, string> = {
  equipment: '設備・機械の不備',
  procedure: '作業手順の問題',
  human: 'ヒューマンエラー',
  environment: '作業環境',
  management: '管理体制',
  other: 'その他',
};

// ヒヤリハット報告
export interface HiyariHatReport {
  id: string;
  reportDate: string; // ISO形式
  occurredAt: string; // ISO形式
  location: Location;
  locationDetail?: string;
  accidentType: AccidentType;
  accidentTypeOther?: string;
  description: string;
  cause: CauseCategory;
  causeDetail?: string;
  severityLevel: SeverityLevel;
  immediateAction?: string;
  suggestedMeasure?: string;
  reporterName: string;
  reporterRole: 'worker' | 'manager' | 'executive';
  status: 'new' | 'reviewing' | 'resolved' | 'linked_to_ra';
  aiAnalysis?: AIAnalysis;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

// AI分析結果
export interface AIAnalysis {
  suggestedAccidentType: AccidentType;
  confidence: number;
  similarCases: SimilarCase[];
  rootCauseAnalysis?: string;
  recommendedMeasures?: string[];
}

// 類似事例
export interface SimilarCase {
  id: string;
  summary: string;
  similarity: number;
}

// 統計データ
export interface Statistics {
  totalReports: number;
  byAccidentType: Record<AccidentType, number>;
  byLocation: Record<Location, number>;
  bySeverity: Record<SeverityLevel, number>;
  byMonth: MonthlyStats[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface MonthlyStats {
  month: string;
  count: number;
  byAccidentType: Record<AccidentType, number>;
}

// フィルター
export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  accidentType?: AccidentType;
  location?: Location;
  severityLevel?: SeverityLevel;
  status?: HiyariHatReport['status'];
  searchText?: string;
}

// ユーザー役割
export type UserRole = 'worker' | 'manager' | 'executive';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  worker: '鉱山労働者',
  manager: '保安管理者',
  executive: '経営トップ・保安統括者',
};
