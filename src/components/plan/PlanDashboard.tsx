import React, { useMemo } from 'react';
import {
  Target,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  FileText,
  BarChart3,
  ArrowRight,
  Clipboard
} from 'lucide-react';
import { AnnualSafetyPlan, PlanCategory, PLAN_CATEGORY_LABELS, PLAN_STATUS_LABELS, ProgressSummary } from '../../types/plan';

interface PlanDashboardProps {
  plan: AnnualSafetyPlan;
  onNavigate: (page: string) => void;
}

export function PlanDashboard({ plan, onNavigate }: PlanDashboardProps) {
  // 進捗サマリーの計算
  const progressSummary = useMemo<ProgressSummary>(() => {
    const currentMonth = new Date().getMonth() + 1;
    const categories: PlanCategory[] = ['ra', 'meeting', 'equipment', 'activity', 'education', 'other'];
    
    let totalScheduled = 0;
    let completedScheduled = 0;
    let delayedItems = 0;
    
    const byCategory: ProgressSummary['byCategory'] = {} as ProgressSummary['byCategory'];
    
    categories.forEach(cat => {
      const catItems = plan.planItems.filter(item => item.category === cat);
      let catTotal = 0;
      let catCompleted = 0;
      
      catItems.forEach(item => {
        item.schedule.forEach(sch => {
          if (sch.planned) {
            catTotal++;
            totalScheduled++;
            if (sch.completed) {
              catCompleted++;
              completedScheduled++;
            } else {
              // 過去の月で未完了なら遅延
              const scheduleMonth = sch.month;
              const isOverdue = (scheduleMonth >= 4 && scheduleMonth <= currentMonth) ||
                (scheduleMonth < 4 && currentMonth < 4 && scheduleMonth <= currentMonth) ||
                (scheduleMonth < 4 && currentMonth >= 4);
              if (isOverdue) {
                delayedItems++;
              }
            }
          }
        });
      });
      
      byCategory[cat] = {
        total: catTotal,
        completed: catCompleted,
        rate: catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0
      };
    });
    
    return {
      totalItems: totalScheduled,
      completedItems: completedScheduled,
      inProgressItems: totalScheduled - completedScheduled - delayedItems,
      delayedItems,
      completionRate: totalScheduled > 0 ? Math.round((completedScheduled / totalScheduled) * 100) : 0,
      byCategory
    };
  }, [plan]);

  // 今月の予定項目
  const currentMonth = new Date().getMonth() + 1;
  const thisMonthItems = useMemo(() => {
    return plan.planItems.filter(item =>
      item.schedule.some(sch => sch.month === currentMonth && sch.planned)
    ).map(item => ({
      ...item,
      monthSchedule: item.schedule.find(sch => sch.month === currentMonth)!
    }));
  }, [plan, currentMonth]);

  // カテゴリ別の色
  const getCategoryColor = (category: PlanCategory) => {
    const colors: Record<PlanCategory, { bg: string; text: string; border: string }> = {
      ra: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      meeting: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      equipment: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      activity: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      education: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
      other: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
    };
    return colors[category];
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary-600" />
            年間保安計画
          </h1>
          <p className="text-gray-600 mt-1">{plan.fiscalYear}年度 - {PLAN_STATUS_LABELS[plan.status]}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('plan-new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            計画項目追加
          </button>
          <button
            onClick={() => onNavigate('plan-list')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            一覧
          </button>
        </div>
      </div>

      {/* 保安目標カード */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Target className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium mb-1">今年度の保安目標</h2>
            <p className="text-2xl font-bold">{plan.safetyGoal.mainGoal}</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-primary-200 text-xs">災害(4週以上)</p>
                <p className="text-2xl font-bold">{plan.accidentStats.over4weeks}件</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-primary-200 text-xs">災害(4週未満)</p>
                <p className="text-2xl font-bold">{plan.accidentStats.under4weeks}件</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-primary-200 text-xs">ヒヤリ報告</p>
                <p className="text-2xl font-bold">{plan.accidentStats.hiyariCount}件</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-primary-200 text-xs">計画進捗率</p>
                <p className="text-2xl font-bold">{progressSummary.completionRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 進捗サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">計画項目数</p>
              <p className="text-3xl font-bold text-gray-900">{progressSummary.totalItems}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clipboard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">完了</p>
              <p className="text-3xl font-bold text-success-600">{progressSummary.completedItems}</p>
            </div>
            <div className="bg-success-100 p-3 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">進行中</p>
              <p className="text-3xl font-bold text-blue-600">{progressSummary.inProgressItems}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">遅延</p>
              <p className="text-3xl font-bold text-danger-600">{progressSummary.delayedItems}</p>
            </div>
            <div className="bg-danger-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリ別進捗 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            カテゴリ別進捗
          </h3>
          <button
            onClick={() => onNavigate('plan-gantt')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            ガントチャート
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {(Object.keys(PLAN_CATEGORY_LABELS) as PlanCategory[]).map(cat => {
            const data = progressSummary.byCategory[cat];
            const color = getCategoryColor(cat);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className={`${color.text} font-medium`}>{PLAN_CATEGORY_LABELS[cat]}</span>
                  <span className="text-gray-600">{data.completed}/{data.total} ({data.rate}%)</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${data.rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 今月の予定 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary-600" />
          今月の予定 ({currentMonth}月)
        </h3>
        {thisMonthItems.length > 0 ? (
          <div className="space-y-3">
            {thisMonthItems.map(item => {
              const color = getCategoryColor(item.category);
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${color.border} ${color.bg}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text} font-medium border ${color.border}`}>
                        {PLAN_CATEGORY_LABELS[item.category]}
                      </span>
                      {item.monthSchedule.completed ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success-100 text-success-700">完了</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-warning-100 text-warning-700">未完了</span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600 mt-1">担当: {item.responsible}</p>
                  </div>
                  {item.monthSchedule.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-success-600 flex-shrink-0" />
                  ) : (
                    <Clock className="w-6 h-6 text-warning-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>今月の予定項目はありません</p>
          </div>
        )}
      </div>

      {/* 重点項目の目標一覧 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary-600" />
          重点項目と期待する効果
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plan.safetyGoal.priorityItems.map(priority => {
            const color = getCategoryColor(priority.category);
            return (
              <div key={priority.category} className={`p-4 rounded-lg border ${color.border} ${color.bg}`}>
                <h4 className={`font-medium ${color.text} mb-2`}>{PLAN_CATEGORY_LABELS[priority.category]}</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {priority.goals.map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* 保安方針 */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">保安方針</h3>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
          {plan.safetyPolicy}
        </div>
        {plan.approvedBy && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <p>承認者: {plan.approvedBy}</p>
            {plan.approvedDate && <p>承認日: {plan.approvedDate}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
