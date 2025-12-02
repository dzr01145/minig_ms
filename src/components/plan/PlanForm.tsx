import React, { useState } from 'react';
import {
  Save,
  X,
  Target,
  Calendar,
  User,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { PlanItem, PlanCategory, PLAN_CATEGORY_LABELS, MonthSchedule } from '../../types/plan';

interface PlanFormProps {
  onSubmit: (item: PlanItem) => void;
  onCancel: () => void;
  initialData?: PlanItem;
}

export function PlanForm({ onSubmit, onCancel, initialData }: PlanFormProps) {
  const isEditing = !!initialData;
  
  // 月の初期スケジュール
  const initSchedule = (): MonthSchedule[] => {
    if (initialData) return initialData.schedule;
    return [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3].map(month => ({
      month,
      planned: false,
      completed: false
    }));
  };

  const [formData, setFormData] = useState({
    category: initialData?.category || 'ra' as PlanCategory,
    title: initialData?.title || '',
    description: initialData?.description || '',
    expectedEffect: initialData?.expectedEffect || '',
    targetValue: initialData?.targetValue || '',
    responsible: initialData?.responsible || '',
    budget: initialData?.budget?.toString() || '',
    manDays: initialData?.manDays?.toString() || '',
    evaluation: initialData?.evaluation || '',
    improvement: initialData?.improvement || ''
  });
  
  const [schedule, setSchedule] = useState<MonthSchedule[]>(initSchedule());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const monthLabels = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
  const monthOrder = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleMonthPlanned = (month: number) => {
    setSchedule(prev => prev.map(s => 
      s.month === month ? { ...s, planned: !s.planned, completed: false } : s
    ));
  };

  const toggleMonthCompleted = (month: number) => {
    setSchedule(prev => prev.map(s => 
      s.month === month && s.planned ? { ...s, completed: !s.completed } : s
    ));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = '項目名は必須です';
    }
    if (!formData.description.trim()) {
      newErrors.description = '実施内容は必須です';
    }
    if (!formData.responsible.trim()) {
      newErrors.responsible = '担当者は必須です';
    }
    if (!schedule.some(s => s.planned)) {
      newErrors.schedule = '少なくとも1つの月を選択してください';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const item: PlanItem = {
      id: initialData?.id || `plan-${Date.now()}`,
      category: formData.category,
      title: formData.title.trim(),
      description: formData.description.trim(),
      expectedEffect: formData.expectedEffect.trim(),
      targetValue: formData.targetValue.trim() || undefined,
      responsible: formData.responsible.trim(),
      schedule,
      budget: formData.budget ? parseInt(formData.budget) : undefined,
      manDays: formData.manDays ? parseInt(formData.manDays) : undefined,
      evaluation: formData.evaluation.trim() || undefined,
      improvement: formData.improvement.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSubmit(item);
  };

  // AIによる効果・目標提案（ダミー実装）
  const generateSuggestion = async () => {
    if (!formData.title || !formData.category) return;
    
    setIsGenerating(true);
    // 実際はGemini APIを呼び出す
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions: Record<PlanCategory, { effect: string; target: string }> = {
      ra: {
        effect: '重大リスクの見落としを防ぎ、対策の優先度を明確化',
        target: '新規リスク10件以上洗い出し'
      },
      meeting: {
        effect: '保安情報の共有と問題解決の促進',
        target: '毎月開催、出席率90%以上'
      },
      equipment: {
        effect: '設備起因のリスク低減',
        target: '指摘箇所100%改善'
      },
      activity: {
        effect: '危険予知能力の向上、潜在リスクの顕在化',
        target: '全員参加、ヒヤリ報告30件/年'
      },
      education: {
        effect: '保安意識の向上と技能習得',
        target: '受講率100%'
      },
      other: {
        effect: '従業員の安全と健康の確保',
        target: '実施率100%'
      }
    };
    
    const suggestion = suggestions[formData.category];
    setFormData(prev => ({
      ...prev,
      expectedEffect: prev.expectedEffect || suggestion.effect,
      targetValue: prev.targetValue || suggestion.target
    }));
    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary-600" />
          {isEditing ? '計画項目の編集' : '新規計画項目'}
        </h1>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* 基本情報 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">基本情報</h2>
          
          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ <span className="text-danger-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(PLAN_CATEGORY_LABELS) as PlanCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleChange('category', cat)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    formData.category === cat
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {PLAN_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* 項目名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              項目名 <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="例: 新たなリスクの洗出し、評価、低減措置の検討"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.title ? 'border-danger-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-danger-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* 実施内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              実施内容 <span className="text-danger-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="具体的な実施内容を記載"
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.description ? 'border-danger-500' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-danger-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* 担当者 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              主たる担当者 <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={formData.responsible}
              onChange={(e) => handleChange('responsible', e.target.value)}
              placeholder="例: 保安管理者"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.responsible ? 'border-danger-500' : 'border-gray-300'
              }`}
            />
            {errors.responsible && <p className="text-danger-500 text-sm mt-1">{errors.responsible}</p>}
          </div>
        </div>

        {/* 期待する効果・目標 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h2 className="text-lg font-bold text-gray-900">期待する効果・目標</h2>
            <button
              type="button"
              onClick={generateSuggestion}
              disabled={isGenerating || !formData.title}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'AI生成中...' : 'AI提案'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Target className="w-4 h-4 inline mr-1" />
                期待する効果
              </label>
              <textarea
                value={formData.expectedEffect}
                onChange={(e) => handleChange('expectedEffect', e.target.value)}
                placeholder="この項目を実施することで期待する効果"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目標（値）
              </label>
              <textarea
                value={formData.targetValue}
                onChange={(e) => handleChange('targetValue', e.target.value)}
                placeholder="例: 10件以上洗い出し"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* スケジュール */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
            <Calendar className="w-5 h-5 inline mr-1" />
            月別スケジュール
          </h2>
          {errors.schedule && (
            <div className="flex items-center gap-2 text-danger-500 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {errors.schedule}
            </div>
          )}
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
            {monthOrder.map((month, idx) => {
              const sch = schedule.find(s => s.month === month)!;
              return (
                <div key={month} className="text-center">
                  <div className="text-xs font-medium text-gray-600 mb-1">{monthLabels[idx]}</div>
                  <button
                    type="button"
                    onClick={() => toggleMonthPlanned(month)}
                    className={`w-full aspect-square rounded-lg border-2 flex items-center justify-center transition-colors ${
                      sch.planned
                        ? 'bg-primary-100 border-primary-500 text-primary-700'
                        : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {sch.planned ? '●' : '○'}
                  </button>
                  {sch.planned && (
                    <button
                      type="button"
                      onClick={() => toggleMonthCompleted(month)}
                      className={`mt-1 w-full text-xs px-1 py-0.5 rounded ${
                        sch.completed
                          ? 'bg-success-100 text-success-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {sch.completed ? '済' : '未'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 経営資源 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
            <DollarSign className="w-5 h-5 inline mr-1" />
            経営資源
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                予算（円）
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                placeholder="例: 500000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                工数（人日）
              </label>
              <input
                type="number"
                value={formData.manDays}
                onChange={(e) => handleChange('manDays', e.target.value)}
                placeholder="例: 10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 評価・改善（編集時のみ） */}
        {isEditing && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
              <CheckCircle2 className="w-5 h-5 inline mr-1" />
              評価・改善
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  評価
                </label>
                <textarea
                  value={formData.evaluation}
                  onChange={(e) => handleChange('evaluation', e.target.value)}
                  placeholder="実施結果の評価"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  改善点
                </label>
                <textarea
                  value={formData.improvement}
                  onChange={(e) => handleChange('improvement', e.target.value)}
                  placeholder="次回への改善点"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          {isEditing ? '更新する' : '保存する'}
        </button>
      </div>
    </div>
  );
}
