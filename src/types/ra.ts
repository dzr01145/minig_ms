// リスクアセスメント（RA）の型定義

import { AccidentType, Location } from './index';

// 重篤度（大・中・小）
export type Severity = 'large' | 'medium' | 'small';

export const SEVERITY_RA_LABELS: Record<Severity, string> = {
  large: '大（死亡・重傷）',
  medium: '中（休業）',
  small: '小（軽傷）',
};

// 可能性（大・中・小）
export type Possibility = 'large' | 'medium' | 'small';

export const POSSIBILITY_LABELS: Record<Possibility, string> = {
  large: '大（頻繁）',
  medium: '中（時々）',
  small: '小（まれ）',
};

// リスクレベル
export type RiskLevel = 'very_worried' | 'worried' | 'concerned';

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  very_worried: 'すごく心配',
  worried: '心配',
  concerned: '気になる',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  very_worried: 'bg-danger-100 text-danger-800 border-danger-300',
  worried: 'bg-warning-100 text-warning-800 border-warning-300',
  concerned: 'bg-success-100 text-success-800 border-success-300',
};

// リスクマトリックスによるレベル判定
export function calculateRiskLevel(severity: Severity, possibility: Possibility): RiskLevel {
  if (severity === 'large' && possibility === 'large') return 'very_worried';
  if (severity === 'large' && possibility === 'medium') return 'worried';
  if (severity === 'large' && possibility === 'small') return 'worried';
  if (severity === 'medium' && possibility === 'large') return 'worried';
  if (severity === 'medium' && possibility === 'medium') return 'worried';
  if (severity === 'medium' && possibility === 'small') return 'concerned';
  return 'concerned';
}

// 低減措置の優先順位
export type MeasurePriority = 'essential' | 'engineering' | 'management' | 'ppe';

export const MEASURE_PRIORITY_LABELS: Record<MeasurePriority, string> = {
  essential: '1. 本質安全対策',
  engineering: '2. 工学的対策',
  management: '3. 管理的対策',
  ppe: '4. 個人用保護具',
};

// リスクアセスメント項目
export interface RiskAssessmentItem {
  id: string;
  // 洗い出し
  accidentType: AccidentType;
  workName: string; // 作業名（工程・設備）
  hazardSource: string; // 危険源
  hazardDescription: string; // 危険性又は有害性と発生のおそれのある災害
  causes: string[]; // 考えられる主な原因
  
  // リスク見積もり（低減前）
  severityBefore: Severity;
  possibilityBefore: Possibility;
  riskLevelBefore: RiskLevel;
  
  // 低減措置
  measures: RiskMeasure[];
  
  // リスク見積もり（低減後）
  severityAfter?: Severity;
  possibilityAfter?: Possibility;
  riskLevelAfter?: RiskLevel;
  
  // 残留リスク
  residualRisk?: string;
  
  // 優先度と実施予定
  priority: 'immediate' | 'planned' | 'monitor';
  plannedDate?: string;
  responsiblePerson?: string;
  
  // ステータス
  status: 'identified' | 'measuring' | 'implemented' | 'evaluated';
  
  // ヒヤリハット連携
  linkedHiyariIds?: string[];
  
  // メタ情報
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// 低減措置
export interface RiskMeasure {
  id: string;
  priority: MeasurePriority;
  description: string;
  targetDate?: string;
  completedDate?: string;
  responsible?: string;
  status: 'planned' | 'in_progress' | 'completed';
}

// リスクアセスメント実施記録
export interface RiskAssessmentSession {
  id: string;
  title: string;
  description?: string;
  conductedDate: string;
  participants: string[];
  items: RiskAssessmentItem[];
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed';
  reviewedBy?: string;
  reviewedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 優先度ラベル
export const PRIORITY_LABELS: Record<RiskAssessmentItem['priority'], string> = {
  immediate: '直ちに実施',
  planned: '計画的に実施',
  monitor: '継続監視',
};

// ステータスラベル
export const RA_STATUS_LABELS: Record<RiskAssessmentItem['status'], string> = {
  identified: '洗い出し済',
  measuring: '措置検討中',
  implemented: '措置実施済',
  evaluated: '評価完了',
};
