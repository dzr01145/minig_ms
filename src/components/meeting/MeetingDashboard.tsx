import React, { useMemo } from 'react';
import {
  Users,
  Calendar,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  FileText,
  Target,
  ArrowRight,
  Clock
} from 'lucide-react';
import { 
  SafetyMeeting, 
  DiagnosisRecord, 
  MEETING_TYPE_LABELS,
  ACTION_STATUS_LABELS,
  DIAGNOSIS_CATEGORY_LABELS,
  DiagnosisCategory
} from '../../types/meeting';
import { diagnosisCheckItems } from '../../data/meetingData';

interface MeetingDashboardProps {
  meetings: SafetyMeeting[];
  diagnosisRecords: DiagnosisRecord[];
  onNavigate: (page: string) => void;
}

export function MeetingDashboard({ meetings, diagnosisRecords, onNavigate }: MeetingDashboardProps) {
  // 最新の会議
  const latestMeeting = meetings[0];
  
  // 最新の自己診断
  const latestDiagnosis = diagnosisRecords[0];
  
  // 未完了のアクションアイテム
  const pendingActions = useMemo(() => {
    return meetings.flatMap(m => 
      m.actionItems.filter(a => a.status !== 'completed')
        .map(a => ({ ...a, meetingTitle: m.title, meetingDate: m.meetingDate }))
    );
  }, [meetings]);

  // 自己診断のカテゴリ別スコア計算
  const diagnosisScores = useMemo(() => {
    if (!latestDiagnosis) return null;
    
    const categories: DiagnosisCategory[] = ['policy', 'plan', 'do', 'check', 'act'];
    const scores: Record<DiagnosisCategory, { total: number; score: number; rate: number }> = {} as any;
    
    categories.forEach(cat => {
      const catItems = diagnosisCheckItems.filter(item => item.category === cat);
      const catResults = latestDiagnosis.results.filter(r => 
        catItems.some(item => item.id === r.itemId)
      );
      const total = catItems.length * 3; // 最大スコア
      const score = catResults.reduce((acc, r) => acc + r.evaluation, 0);
      scores[cat] = { total, score, rate: Math.round((score / total) * 100) };
    });
    
    return scores;
  }, [latestDiagnosis]);

  // 会議出席率の推移
  const attendanceRates = useMemo(() => {
    return meetings.slice(0, 6).map(m => ({
      date: m.meetingDate,
      rate: m.attendanceRate
    })).reverse();
  }, [meetings]);

  // カテゴリ色
  const getCategoryColor = (category: DiagnosisCategory) => {
    const colors: Record<DiagnosisCategory, { bg: string; text: string }> = {
      policy: { bg: 'bg-blue-100', text: 'text-blue-700' },
      plan: { bg: 'bg-purple-100', text: 'text-purple-700' },
      do: { bg: 'bg-green-100', text: 'text-green-700' },
      check: { bg: 'bg-orange-100', text: 'text-orange-700' },
      act: { bg: 'bg-pink-100', text: 'text-pink-700' }
    };
    return colors[category];
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-primary-600" />
            保安会議・自己診断
          </h1>
          <p className="text-gray-600 mt-1">PDCAサイクルの評価（Check）と改善（Act）を支援</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('meeting-new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            会議記録作成
          </button>
          <button
            onClick={() => onNavigate('diagnosis-new')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            自己診断実施
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">今年度会議</p>
              <p className="text-3xl font-bold text-gray-900">{meetings.length}回</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">平均出席率</p>
              <p className="text-3xl font-bold text-primary-600">
                {meetings.length > 0 
                  ? Math.round(meetings.reduce((a, m) => a + m.attendanceRate, 0) / meetings.length)
                  : 0}%
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">未完了アクション</p>
              <p className="text-3xl font-bold text-warning-600">{pendingActions.length}件</p>
            </div>
            <div className="bg-warning-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">自己診断スコア</p>
              <p className="text-3xl font-bold text-success-600">
                {diagnosisScores 
                  ? Math.round(Object.values(diagnosisScores).reduce((a, s) => a + s.rate, 0) / 5)
                  : '-'}%
              </p>
            </div>
            <div className="bg-success-100 p-3 rounded-full">
              <Target className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 自己診断レーダーチャート風表示 */}
      {diagnosisScores && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary-600" />
              自己診断結果（{latestDiagnosis.fiscalYear}年度）
            </h3>
            <button
              onClick={() => onNavigate('diagnosis-list')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              詳細・履歴
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {(Object.keys(DIAGNOSIS_CATEGORY_LABELS) as DiagnosisCategory[]).map(cat => {
              const score = diagnosisScores[cat];
              const color = getCategoryColor(cat);
              return (
                <div key={cat} className={`p-4 rounded-xl ${color.bg}`}>
                  <div className={`text-sm font-medium ${color.text} mb-2`}>
                    {DIAGNOSIS_CATEGORY_LABELS[cat]}
                  </div>
                  <div className="relative h-3 bg-white/50 rounded-full overflow-hidden mb-2">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full ${
                        score.rate >= 80 ? 'bg-success-500' :
                        score.rate >= 60 ? 'bg-warning-500' :
                        'bg-danger-500'
                      }`}
                      style={{ width: `${score.rate}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-gray-900">{score.rate}%</span>
                    <span className="text-xs text-gray-600">{score.score}/{score.total}点</span>
                  </div>
                </div>
              );
            })}
          </div>
          {latestDiagnosis.improvementPlan && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                改善計画
              </h4>
              <p className="text-sm text-yellow-900 whitespace-pre-line">{latestDiagnosis.improvementPlan}</p>
            </div>
          )}
        </div>
      )}

      {/* 最新の会議 & 未完了アクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最新の会議 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              最新の会議
            </h3>
            <button
              onClick={() => onNavigate('meeting-list')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              一覧
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {latestMeeting ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  latestMeeting.meetingType === 'regular' ? 'bg-blue-100 text-blue-700' :
                  latestMeeting.meetingType === 'emergency' ? 'bg-danger-100 text-danger-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {MEETING_TYPE_LABELS[latestMeeting.meetingType]}
                </span>
                <span className="text-sm text-gray-500">{latestMeeting.meetingDate}</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{latestMeeting.title}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  出席率 {latestMeeting.attendanceRate}%
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  議題 {latestMeeting.agendaItems.length}件
                </span>
              </div>
              {latestMeeting.decisions.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">主な決定事項:</p>
                  <ul className="space-y-1">
                    {latestMeeting.decisions.slice(0, 3).map((decision, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                        {decision}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {latestMeeting.aiSummary && (
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <p className="text-xs font-medium text-purple-700 mb-1 flex items-center gap-1">
                    ✨ AI要約
                  </p>
                  <p className="text-sm text-gray-700">{latestMeeting.aiSummary}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>会議記録がありません</p>
            </div>
          )}
        </div>

        {/* 未完了アクション */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning-500" />
            未完了アクション
          </h3>
          {pendingActions.length > 0 ? (
            <div className="space-y-3">
              {pendingActions.slice(0, 5).map(action => {
                const isOverdue = new Date(action.dueDate) < new Date();
                return (
                  <div
                    key={action.id}
                    className={`p-3 rounded-lg border ${
                      isOverdue ? 'border-danger-200 bg-danger-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{action.task}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {action.meetingTitle} | 担当: {action.assignee}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        isOverdue ? 'bg-danger-100 text-danger-700' :
                        action.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {isOverdue ? '期限超過' : ACTION_STATUS_LABELS[action.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      期限: {action.dueDate}
                    </div>
                  </div>
                );
              })}
              {pendingActions.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  他 {pendingActions.length - 5} 件
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-success-300" />
              <p>未完了のアクションはありません</p>
            </div>
          )}
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4">Check/Act フェーズのアクション</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('meeting-new')}
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-left transition-colors"
          >
            <FileText className="w-6 h-6 mb-2" />
            <h4 className="font-medium">会議記録作成</h4>
            <p className="text-sm text-primary-200 mt-1">定例会議・特別会議の記録</p>
          </button>
          <button
            onClick={() => onNavigate('diagnosis-new')}
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-left transition-colors"
          >
            <ClipboardCheck className="w-6 h-6 mb-2" />
            <h4 className="font-medium">自己診断実施</h4>
            <p className="text-sm text-primary-200 mt-1">PDCA各段階の自己評価</p>
          </button>
          <button
            onClick={() => onNavigate('ms-evaluation')}
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-left transition-colors"
          >
            <Target className="w-6 h-6 mb-2" />
            <h4 className="font-medium">MS評価</h4>
            <p className="text-sm text-primary-200 mt-1">システム全体の評価</p>
          </button>
          <button
            onClick={() => onNavigate('improvement-plan')}
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-left transition-colors"
          >
            <TrendingUp className="w-6 h-6 mb-2" />
            <h4 className="font-medium">改善計画</h4>
            <p className="text-sm text-primary-200 mt-1">次年度への改善提案</p>
          </button>
        </div>
      </div>
    </div>
  );
}
