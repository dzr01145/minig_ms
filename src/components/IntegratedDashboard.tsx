import React, { useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Users,
  ClipboardCheck,
  FileText,
  BarChart3,
  ArrowRight,
  Activity,
  Award
} from 'lucide-react';
import { HiyariHatReport } from '../types';
import { RiskAssessmentItem, RISK_LEVEL_LABELS, RiskLevel } from '../types/ra';
import { AnnualSafetyPlan, PlanCategory, PLAN_CATEGORY_LABELS } from '../types/plan';
import { SafetyMeeting, DiagnosisRecord, DIAGNOSIS_CATEGORY_LABELS, DiagnosisCategory } from '../types/meeting';
import { diagnosisCheckItems } from '../data/meetingData';

interface IntegratedDashboardProps {
  reports: HiyariHatReport[];
  raItems: RiskAssessmentItem[];
  annualPlan: AnnualSafetyPlan;
  meetings: SafetyMeeting[];
  diagnosisRecords: DiagnosisRecord[];
  onNavigate: (page: string) => void;
}

export function IntegratedDashboard({
  reports,
  raItems,
  annualPlan,
  meetings,
  diagnosisRecords,
  onNavigate
}: IntegratedDashboardProps) {
  // 各フェーズのサマリー計算
  const summary = useMemo(() => {
    // ヒヤリハット
    const thisMonthReports = reports.filter(r => {
      const reportDate = new Date(r.occurredAt);
      const now = new Date();
      return reportDate.getMonth() === now.getMonth() && 
             reportDate.getFullYear() === now.getFullYear();
    });
    const unresolvedReports = reports.filter(r => r.status !== 'resolved' && r.status !== 'linked_to_ra');

    // RA
    const highRiskItems = raItems.filter(r => r.riskLevelBefore === 'very_worried' || r.riskLevelBefore === 'worried');
    const completedMeasures = raItems.filter(r => r.status === 'implemented' || r.status === 'evaluated');

    // 年間計画進捗
    const totalPlanned = annualPlan.planItems.reduce((acc, item) => 
      acc + item.schedule.filter(s => s.planned).length, 0);
    const completedPlanned = annualPlan.planItems.reduce((acc, item) => 
      acc + item.schedule.filter(s => s.planned && s.completed).length, 0);
    const planProgress = totalPlanned > 0 ? Math.round((completedPlanned / totalPlanned) * 100) : 0;

    // 会議・自己診断
    const pendingActions = meetings.flatMap(m => 
      m.actionItems.filter(a => a.status !== 'completed')
    );
    const latestDiagnosis = diagnosisRecords[0];
    let diagnosisScore = 0;
    if (latestDiagnosis) {
      const categories: DiagnosisCategory[] = ['policy', 'plan', 'do', 'check', 'act'];
      let totalScore = 0;
      let totalMax = 0;
      categories.forEach(cat => {
        const catItems = diagnosisCheckItems.filter(item => item.category === cat);
        const catResults = latestDiagnosis.results.filter(r => 
          catItems.some(item => item.id === r.itemId)
        );
        totalMax += catItems.length * 3;
        totalScore += catResults.reduce((acc, r) => acc + r.evaluation, 0);
      });
      diagnosisScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    }

    return {
      hiyari: {
        total: reports.length,
        thisMonth: thisMonthReports.length,
        unresolved: unresolvedReports.length
      },
      ra: {
        total: raItems.length,
        highRisk: highRiskItems.length,
        completed: completedMeasures.length
      },
      plan: {
        progress: planProgress,
        total: totalPlanned,
        completed: completedPlanned
      },
      meeting: {
        total: meetings.length,
        pendingActions: pendingActions.length,
        diagnosisScore
      }
    };
  }, [reports, raItems, annualPlan, meetings, diagnosisRecords]);

  // PDCAサイクルの状態評価
  const pdcaStatus = useMemo(() => {
    const getStatus = (score: number) => {
      if (score >= 80) return { label: '良好', color: 'text-success-600', bg: 'bg-success-100' };
      if (score >= 60) return { label: '概ね良好', color: 'text-warning-600', bg: 'bg-warning-100' };
      return { label: '要改善', color: 'text-danger-600', bg: 'bg-danger-100' };
    };

    // P: RA完了率 + 計画進捗
    const pScore = Math.min(100, (summary.ra.completed / Math.max(1, summary.ra.total)) * 50 + summary.plan.progress * 0.5);
    // D: ヒヤリ報告率 + アクション完了率
    const dScore = summary.hiyari.total > 0 ? 70 : 30;
    // C: 計画進捗確認
    const cScore = summary.plan.progress;
    // A: 自己診断スコア
    const aScore = summary.meeting.diagnosisScore || 50;

    return {
      plan: { ...getStatus(pScore), score: Math.round(pScore) },
      do: { ...getStatus(dScore), score: Math.round(dScore) },
      check: { ...getStatus(cScore), score: Math.round(cScore) },
      act: { ...getStatus(aScore), score: Math.round(aScore) }
    };
  }, [summary]);

  // リスクレベル分布
  const riskDistribution = useMemo(() => {
    const dist = {
      very_worried: raItems.filter(r => r.riskLevelBefore === 'very_worried').length,
      worried: raItems.filter(r => r.riskLevelBefore === 'worried').length,
      concerned: raItems.filter(r => r.riskLevelBefore === 'concerned').length
    };
    return dist;
  }, [raItems]);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Shield className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">鉱山保安マネジメントシステム</h1>
            <p className="text-primary-200">統合ダッシュボード - {annualPlan.fiscalYear}年度</p>
          </div>
        </div>

        {/* 保安目標 */}
        <div className="bg-white/10 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5" />
            <span className="font-medium">今年度の保安目標</span>
          </div>
          <p className="text-xl font-bold">{annualPlan.safetyGoal.mainGoal}</p>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{annualPlan.accidentStats.over4weeks}</p>
              <p className="text-xs text-primary-200">災害(4週以上)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{annualPlan.accidentStats.under4weeks}</p>
              <p className="text-xs text-primary-200">災害(4週未満)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{summary.hiyari.total}</p>
              <p className="text-xs text-primary-200">ヒヤリ報告</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{summary.plan.progress}%</p>
              <p className="text-xs text-primary-200">計画進捗</p>
            </div>
          </div>
        </div>
      </div>

      {/* PDCAサイクル状態 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          PDCAサイクル状態
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { key: 'plan', label: 'Plan（計画）', icon: ClipboardCheck, desc: 'RA・計画策定' },
            { key: 'do', label: 'Do（実施）', icon: FileText, desc: '活動実施・報告' },
            { key: 'check', label: 'Check（評価）', icon: BarChart3, desc: '進捗確認・分析' },
            { key: 'act', label: 'Act（改善）', icon: TrendingUp, desc: '改善・見直し' }
          ].map(phase => {
            const status = pdcaStatus[phase.key as keyof typeof pdcaStatus];
            const Icon = phase.icon;
            return (
              <div key={phase.key} className={`p-4 rounded-xl border-2 ${status.bg} border-transparent`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${status.color}`} />
                  <span className="font-bold text-gray-900">{phase.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${status.color}`}>{status.score}%</p>
                    <p className="text-xs text-gray-500">{status.label}</p>
                  </div>
                  <p className="text-xs text-gray-500">{phase.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4フェーズ概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Phase 1: ヒヤリハット */}
        <div 
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900">ヒヤリハット</h3>
          <p className="text-sm text-gray-500 mb-3">報告・分析</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">今月の報告</span>
              <span className="font-bold text-orange-600">{summary.hiyari.thisMonth}件</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">未対応</span>
              <span className={`font-bold ${summary.hiyari.unresolved > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                {summary.hiyari.unresolved}件
              </span>
            </div>
          </div>
        </div>

        {/* Phase 2: RA */}
        <div 
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate('ra')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900">リスクアセスメント</h3>
          <p className="text-sm text-gray-500 mb-3">評価・対策</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">登録リスク</span>
              <span className="font-bold text-blue-600">{summary.ra.total}件</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">高リスク</span>
              <span className={`font-bold ${summary.ra.highRisk > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                {summary.ra.highRisk}件
              </span>
            </div>
          </div>
        </div>

        {/* Phase 3: 年間計画 */}
        <div 
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate('plan')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900">年間計画</h3>
          <p className="text-sm text-gray-500 mb-3">進捗管理</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">進捗率</span>
              <span className="font-bold text-purple-600">{summary.plan.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${summary.plan.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Phase 4: 会議・診断 */}
        <div 
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate('meeting')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900">会議・自己診断</h3>
          <p className="text-sm text-gray-500 mb-3">評価・改善</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">会議回数</span>
              <span className="font-bold text-green-600">{summary.meeting.total}回</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">診断スコア</span>
              <span className="font-bold text-green-600">{summary.meeting.diagnosisScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* リスク分布 & アラート */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* リスクレベル分布 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            リスクレベル分布
          </h3>
          <div className="space-y-3">
            {[
              { key: 'very_worried', label: RISK_LEVEL_LABELS.very_worried, color: 'bg-danger-500', count: riskDistribution.very_worried },
              { key: 'worried', label: RISK_LEVEL_LABELS.worried, color: 'bg-warning-500', count: riskDistribution.worried },
              { key: 'concerned', label: RISK_LEVEL_LABELS.concerned, color: 'bg-success-500', count: riskDistribution.concerned }
            ].map(level => {
              const total = raItems.length || 1;
              const percentage = Math.round((level.count / total) * 100);
              return (
                <div key={level.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{level.label}</span>
                    <span className="font-medium">{level.count}件 ({percentage}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${level.color} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* アラート・要対応 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning-500" />
            要対応事項
          </h3>
          <div className="space-y-3">
            {summary.hiyari.unresolved > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-orange-800">未対応ヒヤリハット</span>
                </div>
                <span className="font-bold text-orange-600">{summary.hiyari.unresolved}件</span>
              </div>
            )}
            {summary.ra.highRisk > 0 && (
              <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg border border-danger-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-danger-500" />
                  <span className="text-sm text-danger-800">高リスク項目</span>
                </div>
                <span className="font-bold text-danger-600">{summary.ra.highRisk}件</span>
              </div>
            )}
            {summary.meeting.pendingActions > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-800">未完了アクション</span>
                </div>
                <span className="font-bold text-yellow-600">{summary.meeting.pendingActions}件</span>
              </div>
            )}
            {summary.hiyari.unresolved === 0 && summary.ra.highRisk === 0 && summary.meeting.pendingActions === 0 && (
              <div className="flex items-center justify-center p-6 bg-success-50 rounded-lg border border-success-200">
                <div className="text-center">
                  <CheckCircle2 className="w-10 h-10 text-success-500 mx-auto mb-2" />
                  <p className="text-success-700 font-medium">要対応事項はありません</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* カテゴリ別計画進捗 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          カテゴリ別年間計画進捗
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(Object.keys(PLAN_CATEGORY_LABELS) as PlanCategory[]).map(cat => {
            const catItems = annualPlan.planItems.filter(item => item.category === cat);
            const catPlanned = catItems.reduce((acc, item) => 
              acc + item.schedule.filter(s => s.planned).length, 0);
            const catCompleted = catItems.reduce((acc, item) => 
              acc + item.schedule.filter(s => s.planned && s.completed).length, 0);
            const progress = catPlanned > 0 ? Math.round((catCompleted / catPlanned) * 100) : 0;

            return (
              <div key={cat} className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-xs font-medium text-gray-600 mb-2">{PLAN_CATEGORY_LABELS[cat]}</p>
                <p className={`text-2xl font-bold ${
                  progress >= 80 ? 'text-success-600' :
                  progress >= 50 ? 'text-warning-600' :
                  'text-danger-600'
                }`}>{progress}%</p>
                <p className="text-xs text-gray-500 mt-1">{catCompleted}/{catPlanned}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          クイックアクション
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('report')}
            className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-left transition-colors"
          >
            <AlertTriangle className="w-6 h-6 mb-2" />
            <h4 className="font-medium">ヒヤリ報告</h4>
            <p className="text-xs text-gray-300 mt-1">新規報告を作成</p>
          </button>
          <button
            onClick={() => onNavigate('ra-new')}
            className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-left transition-colors"
          >
            <ClipboardCheck className="w-6 h-6 mb-2" />
            <h4 className="font-medium">RA登録</h4>
            <p className="text-xs text-gray-300 mt-1">リスク評価を追加</p>
          </button>
          <button
            onClick={() => onNavigate('meeting-new')}
            className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-left transition-colors"
          >
            <Users className="w-6 h-6 mb-2" />
            <h4 className="font-medium">会議記録</h4>
            <p className="text-xs text-gray-300 mt-1">議事録を作成</p>
          </button>
          <button
            onClick={() => onNavigate('diagnosis-new')}
            className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-left transition-colors"
          >
            <Target className="w-6 h-6 mb-2" />
            <h4 className="font-medium">自己診断</h4>
            <p className="text-xs text-gray-300 mt-1">MS評価を実施</p>
          </button>
        </div>
      </div>
    </div>
  );
}
