import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { PlanItem, PlanCategory, PLAN_CATEGORY_LABELS } from '../../types/plan';

interface GanttChartProps {
  items: PlanItem[];
  fiscalYear: number;
  onNavigate: (page: string) => void;
}

export function GanttChart({ items, fiscalYear, onNavigate }: GanttChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory | 'all'>('all');
  const [zoom, setZoom] = useState<'month' | 'quarter'>('month');

  const currentMonth = new Date().getMonth() + 1;
  const currentDate = new Date();

  // 月順序（4月始まり）
  const months = [
    { month: 4, label: '4月', quarter: 'Q1' },
    { month: 5, label: '5月', quarter: 'Q1' },
    { month: 6, label: '6月', quarter: 'Q1' },
    { month: 7, label: '7月', quarter: 'Q2' },
    { month: 8, label: '8月', quarter: 'Q2' },
    { month: 9, label: '9月', quarter: 'Q2' },
    { month: 10, label: '10月', quarter: 'Q3' },
    { month: 11, label: '11月', quarter: 'Q3' },
    { month: 12, label: '12月', quarter: 'Q3' },
    { month: 1, label: '1月', quarter: 'Q4' },
    { month: 2, label: '2月', quarter: 'Q4' },
    { month: 3, label: '3月', quarter: 'Q4' }
  ];

  // フィルタリング
  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  // カテゴリ別に整理
  const groupedItems = (Object.keys(PLAN_CATEGORY_LABELS) as PlanCategory[]).map(category => ({
    category,
    items: filteredItems.filter(item => item.category === category)
  })).filter(group => group.items.length > 0);

  const getCategoryColor = (category: PlanCategory) => {
    const colors: Record<PlanCategory, { bg: string; border: string; text: string; light: string }> = {
      ra: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-700', light: 'bg-blue-100' },
      meeting: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-700', light: 'bg-purple-100' },
      equipment: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-700', light: 'bg-orange-100' },
      activity: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-700', light: 'bg-green-100' },
      education: { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-700', light: 'bg-pink-100' },
      other: { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-700', light: 'bg-gray-100' }
    };
    return colors[category];
  };

  // 現在の月インデックス
  const currentMonthIndex = months.findIndex(m => m.month === currentMonth);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary-600" />
            年間計画ガントチャート
          </h1>
          <p className="text-gray-600 mt-1">{fiscalYear}年度</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as PlanCategory | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全カテゴリ</option>
            {(Object.keys(PLAN_CATEGORY_LABELS) as PlanCategory[]).map(cat => (
              <option key={cat} value={cat}>{PLAN_CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
          <button
            onClick={() => onNavigate('plan')}
            className="px-4 py-2 text-primary-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ダッシュボードへ戻る
          </button>
        </div>
      </div>

      {/* 凡例 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium text-gray-700">凡例:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success-500" />
            <span>完了</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-danger-400" />
            <span>遅延</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning-300" />
            <span>予定</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200" />
            <span>未計画</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-red-500" />
            <span>今月</span>
          </div>
        </div>
      </div>

      {/* ガントチャート */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            {/* ヘッダー */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-700 w-64 min-w-64">
                  計画項目
                </th>
                {months.map((m, idx) => (
                  <th
                    key={m.month}
                    className={`px-2 py-3 text-center text-xs font-medium min-w-16 ${
                      idx === currentMonthIndex ? 'bg-red-50' : ''
                    } ${m.month === 4 || m.month === 7 || m.month === 10 || m.month === 1 ? 'border-l border-gray-300' : ''}`}
                  >
                    <div className={idx === currentMonthIndex ? 'text-red-600 font-bold' : 'text-gray-600'}>
                      {m.label}
                    </div>
                    {(m.month === 4 || m.month === 7 || m.month === 10 || m.month === 1) && (
                      <div className="text-xs text-gray-400 mt-1">{m.quarter}</div>
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 w-24">
                  進捗
                </th>
              </tr>
            </thead>
            
            {/* ボディ */}
            <tbody>
              {groupedItems.map(group => (
                <React.Fragment key={group.category}>
                  {/* カテゴリヘッダー */}
                  <tr className={`${getCategoryColor(group.category).light}`}>
                    <td
                      colSpan={14}
                      className={`px-4 py-2 text-sm font-bold ${getCategoryColor(group.category).text} sticky left-0 z-10`}
                    >
                      {PLAN_CATEGORY_LABELS[group.category]}
                    </td>
                  </tr>
                  
                  {/* アイテム行 */}
                  {group.items.map(item => {
                    const plannedSchedules = item.schedule.filter(s => s.planned);
                    const completedCount = plannedSchedules.filter(s => s.completed).length;
                    const progress = plannedSchedules.length > 0
                      ? Math.round((completedCount / plannedSchedules.length) * 100)
                      : 0;
                    
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        {/* 項目名 */}
                        <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-4 py-3">
                          <div className="max-w-60">
                            <p className="text-sm font-medium text-gray-900 truncate" title={item.title}>
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate" title={item.responsible}>
                              担当: {item.responsible}
                            </p>
                          </div>
                        </td>
                        
                        {/* 月別バー */}
                        {months.map((m, idx) => {
                          const sch = item.schedule.find(s => s.month === m.month);
                          const isCurrentMonth = idx === currentMonthIndex;
                          
                          let cellClass = 'bg-gray-100'; // 未計画
                          let icon = null;
                          
                          if (sch?.planned) {
                            if (sch.completed) {
                              cellClass = 'bg-success-500';
                              icon = <CheckCircle2 className="w-4 h-4 text-white" />;
                            } else {
                              // 過去の月なら遅延
                              const isOverdue = (m.month >= 4 && m.month < currentMonth) ||
                                (m.month < 4 && currentMonth < 4 && m.month < currentMonth) ||
                                (m.month < 4 && currentMonth >= 4);
                              
                              if (isOverdue) {
                                cellClass = 'bg-danger-400';
                                icon = <AlertTriangle className="w-4 h-4 text-white" />;
                              } else {
                                cellClass = 'bg-warning-300';
                                icon = <Clock className="w-4 h-4 text-warning-700" />;
                              }
                            }
                          }
                          
                          return (
                            <td
                              key={m.month}
                              className={`px-1 py-2 ${isCurrentMonth ? 'bg-red-50' : ''} ${m.month === 4 || m.month === 7 || m.month === 10 || m.month === 1 ? 'border-l border-gray-200' : ''}`}
                            >
                              <div className="relative">
                                {isCurrentMonth && (
                                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500 -ml-0.5" />
                                )}
                                <div
                                  className={`h-8 rounded ${cellClass} flex items-center justify-center transition-all hover:opacity-80 cursor-pointer`}
                                  title={`${m.label}: ${sch?.planned ? (sch.completed ? '完了' : '未完了') : '未計画'}${sch?.note ? ` (${sch.note})` : ''}`}
                                >
                                  {icon}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                        
                        {/* 進捗 */}
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${progress === 100 ? 'bg-success-500' : progress > 0 ? 'bg-primary-500' : 'bg-gray-300'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600 w-10 text-right">
                              {progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(Object.keys(PLAN_CATEGORY_LABELS) as PlanCategory[]).map(cat => {
          const catItems = filteredItems.filter(item => item.category === cat);
          const totalPlanned = catItems.reduce((acc, item) => 
            acc + item.schedule.filter(s => s.planned).length, 0);
          const totalCompleted = catItems.reduce((acc, item) => 
            acc + item.schedule.filter(s => s.planned && s.completed).length, 0);
          const rate = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
          const color = getCategoryColor(cat);
          
          if (catItems.length === 0) return null;
          
          return (
            <div key={cat} className={`${color.light} rounded-xl p-4`}>
              <div className={`text-xs font-medium ${color.text} mb-1`}>
                {PLAN_CATEGORY_LABELS[cat]}
              </div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-gray-900">{rate}%</div>
                <div className="text-xs text-gray-600">{totalCompleted}/{totalPlanned}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
