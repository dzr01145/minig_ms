import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  FileText,
  ArrowRight
} from 'lucide-react';
import { PlanItem, PlanCategory, PLAN_CATEGORY_LABELS, MonthSchedule } from '../../types/plan';

interface PlanListProps {
  items: PlanItem[];
  onSelectItem: (item: PlanItem) => void;
  onUpdateProgress: (itemId: string, month: number, completed: boolean) => void;
}

export function PlanList({ items, onSelectItem, onUpdateProgress }: PlanListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'pending' | 'delayed'>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const currentMonth = new Date().getMonth() + 1;

  // フィルタリング
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 検索
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // カテゴリ
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      
      // ステータス
      if (selectedStatus !== 'all') {
        const plannedSchedules = item.schedule.filter(s => s.planned);
        const completedCount = plannedSchedules.filter(s => s.completed).length;
        const hasDelayed = plannedSchedules.some(s => {
          if (s.completed) return false;
          const scheduleMonth = s.month;
          return (scheduleMonth >= 4 && scheduleMonth <= currentMonth) ||
            (scheduleMonth < 4 && currentMonth < 4 && scheduleMonth <= currentMonth) ||
            (scheduleMonth < 4 && currentMonth >= 4);
        });
        
        if (selectedStatus === 'completed' && completedCount !== plannedSchedules.length) {
          return false;
        }
        if (selectedStatus === 'pending' && (completedCount === plannedSchedules.length || hasDelayed)) {
          return false;
        }
        if (selectedStatus === 'delayed' && !hasDelayed) {
          return false;
        }
      }
      
      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedStatus, currentMonth]);

  const getCategoryColor = (category: PlanCategory) => {
    const colors: Record<PlanCategory, { bg: string; text: string }> = {
      ra: { bg: 'bg-blue-100', text: 'text-blue-700' },
      meeting: { bg: 'bg-purple-100', text: 'text-purple-700' },
      equipment: { bg: 'bg-orange-100', text: 'text-orange-700' },
      activity: { bg: 'bg-green-100', text: 'text-green-700' },
      education: { bg: 'bg-pink-100', text: 'text-pink-700' },
      other: { bg: 'bg-gray-100', text: 'text-gray-700' }
    };
    return colors[category];
  };

  const getItemStatus = (item: PlanItem) => {
    const plannedSchedules = item.schedule.filter(s => s.planned);
    const completedCount = plannedSchedules.filter(s => s.completed).length;
    const hasDelayed = plannedSchedules.some(s => {
      if (s.completed) return false;
      const scheduleMonth = s.month;
      return (scheduleMonth >= 4 && scheduleMonth <= currentMonth) ||
        (scheduleMonth < 4 && currentMonth < 4 && scheduleMonth <= currentMonth) ||
        (scheduleMonth < 4 && currentMonth >= 4);
    });
    
    if (completedCount === plannedSchedules.length && plannedSchedules.length > 0) {
      return { label: '完了', color: 'bg-success-100 text-success-700', icon: CheckCircle2 };
    }
    if (hasDelayed) {
      return { label: '遅延', color: 'bg-danger-100 text-danger-700', icon: AlertTriangle };
    }
    return { label: '進行中', color: 'bg-blue-100 text-blue-700', icon: Clock };
  };

  // 月順序（4月始まり）
  const monthOrder = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
  const monthLabels = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary-600" />
          年間保安計画一覧
        </h1>
        <div className="text-sm text-gray-600">
          {filteredItems.length} / {items.length} 件
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="キーワード検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
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
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全ステータス</option>
              <option value="completed">完了</option>
              <option value="pending">進行中</option>
              <option value="delayed">遅延</option>
            </select>
          </div>
        </div>
      </div>

      {/* 計画一覧 */}
      <div className="space-y-4">
        {filteredItems.map(item => {
          const categoryColor = getCategoryColor(item.category);
          const status = getItemStatus(item);
          const StatusIcon = status.icon;
          const isExpanded = expandedItem === item.id;
          const plannedSchedules = item.schedule.filter(s => s.planned);
          const completedCount = plannedSchedules.filter(s => s.completed).length;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* メイン情報 */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor.bg} ${categoryColor.text} font-medium`}>
                        {PLAN_CATEGORY_LABELS[item.category]}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status.color} font-medium flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                      {item.targetValue && (
                        <span className="text-xs text-gray-500">
                          目標: {item.targetValue}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {item.responsible}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {completedCount}/{plannedSchedules.length}
                      </span>
                      {item.budget && (
                        <span>予算: ¥{item.budget.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* ミニ進捗バー */}
                    <div className="hidden sm:flex items-center gap-1">
                      {monthOrder.map((month, idx) => {
                        const sch = item.schedule.find(s => s.month === month);
                        if (!sch?.planned) {
                          return <div key={month} className="w-2 h-6 bg-gray-100 rounded-sm" />;
                        }
                        return (
                          <div
                            key={month}
                            className={`w-2 h-6 rounded-sm ${
                              sch.completed ? 'bg-success-500' :
                              (month <= currentMonth || (currentMonth < 4 && month >= 4)) ? 'bg-danger-400' :
                              'bg-warning-300'
                            }`}
                            title={`${monthLabels[idx]}: ${sch.completed ? '完了' : '未完了'}`}
                          />
                        );
                      })}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* 展開詳細 */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  {/* 月別スケジュール */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">月別スケジュール</h4>
                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                      {monthOrder.map((month, idx) => {
                        const sch = item.schedule.find(s => s.month === month);
                        if (!sch) return null;
                        
                        return (
                          <div
                            key={month}
                            className={`p-2 rounded-lg text-center text-xs ${
                              !sch.planned ? 'bg-gray-100 text-gray-400' :
                              sch.completed ? 'bg-success-100 text-success-700' :
                              (month <= currentMonth || (currentMonth < 4 && month >= 4)) ? 'bg-danger-100 text-danger-700' :
                              'bg-warning-100 text-warning-700'
                            }`}
                          >
                            <div className="font-medium">{monthLabels[idx]}</div>
                            {sch.planned && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateProgress(item.id, month, !sch.completed);
                                }}
                                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center mx-auto ${
                                  sch.completed 
                                    ? 'bg-success-500 border-success-500 text-white'
                                    : 'bg-white border-gray-300 hover:border-primary-500'
                                }`}
                              >
                                {sch.completed && <CheckCircle2 className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 期待する効果 */}
                  {item.expectedEffect && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">期待する効果</h4>
                      <p className="text-sm text-gray-600">{item.expectedEffect}</p>
                    </div>
                  )}

                  {/* 評価・改善 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {item.evaluation && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-700 mb-1">評価</h4>
                        <p className="text-sm text-blue-800">{item.evaluation}</p>
                      </div>
                    )}
                    {item.improvement && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-green-700 mb-1">改善点</h4>
                        <p className="text-sm text-green-800">{item.improvement}</p>
                      </div>
                    )}
                  </div>

                  {/* アクションボタン */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      詳細・編集
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">該当する計画項目がありません</p>
        </div>
      )}
    </div>
  );
}
