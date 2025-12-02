import React, { useState, useMemo } from 'react';
import {
  Save,
  X,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Key,
  Settings
} from 'lucide-react';
import { 
  DiagnosisRecord, 
  DiagnosisResult,
  DiagnosisCategory,
  EvaluationLevel,
  DIAGNOSIS_CATEGORY_LABELS,
  EVALUATION_LEVEL_LABELS
} from '../../types/meeting';
import { diagnosisCheckItems } from '../../data/meetingData';
import { 
  getApiKey, 
  suggestImprovements, 
  ImprovementSuggestion,
  getSelectedModel,
  getModelConfig,
  AIProvider
} from '../../services/geminiService';

interface DiagnosisFormProps {
  onSubmit: (record: DiagnosisRecord) => void;
  onCancel: () => void;
  initialData?: DiagnosisRecord;
  onOpenApiSettings?: () => void;
}

export function DiagnosisForm({ onSubmit, onCancel, initialData, onOpenApiSettings }: DiagnosisFormProps) {
  const isEditing = !!initialData;
  const currentYear = new Date().getFullYear();

  const initResults = (): DiagnosisResult[] => {
    if (initialData) return initialData.results;
    return diagnosisCheckItems.map(item => ({
      itemId: item.id,
      evaluation: 0 as EvaluationLevel,
      comment: ''
    }));
  };

  const [formData, setFormData] = useState({
    fiscalYear: initialData?.fiscalYear || currentYear,
    diagnosisDate: initialData?.diagnosisDate || new Date().toISOString().split('T')[0],
    diagnosedBy: initialData?.diagnosedBy || '',
    overallComment: initialData?.overallComment || '',
    improvementPlan: initialData?.improvementPlan || ''
  });

  const [results, setResults] = useState<DiagnosisResult[]>(initResults());
  const [expandedCategory, setExpandedCategory] = useState<DiagnosisCategory | null>('policy');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<ImprovementSuggestion | null>(null);

  // カテゴリ別にグループ化
  const groupedItems = useMemo(() => {
    const categories: DiagnosisCategory[] = ['policy', 'plan', 'do', 'check', 'act'];
    return categories.map(cat => ({
      category: cat,
      items: diagnosisCheckItems.filter(item => item.category === cat)
    }));
  }, []);

  // カテゴリ別スコア
  const categoryScores = useMemo(() => {
    const scores: Record<DiagnosisCategory, { total: number; score: number; rate: number }> = {} as any;
    groupedItems.forEach(group => {
      const catResults = results.filter(r => 
        group.items.some(item => item.id === r.itemId)
      );
      const total = group.items.length * 3;
      const score = catResults.reduce((acc, r) => acc + r.evaluation, 0);
      scores[group.category] = { total, score, rate: Math.round((score / total) * 100) };
    });
    return scores;
  }, [results, groupedItems]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEvaluationChange = (itemId: string, evaluation: EvaluationLevel) => {
    setResults(prev => prev.map(r =>
      r.itemId === itemId ? { ...r, evaluation } : r
    ));
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    setResults(prev => prev.map(r =>
      r.itemId === itemId ? { ...r, comment } : r
    ));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.diagnosedBy.trim()) {
      newErrors.diagnosedBy = '診断実施者は必須です';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const record: DiagnosisRecord = {
      id: initialData?.id || `diag-${Date.now()}`,
      fiscalYear: formData.fiscalYear,
      diagnosisDate: formData.diagnosisDate,
      diagnosedBy: formData.diagnosedBy.trim(),
      results,
      overallComment: formData.overallComment.trim() || undefined,
      improvementPlan: formData.improvementPlan.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(record);
  };

  // AI改善提案生成（マルチプロバイダー対応）
  const generateAISuggestion = async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    setAiSuggestion(null);
    
    // モデル設定チェック
    const selectedModelId = getSelectedModel();
    if (!selectedModelId) {
      setAiError('AIモデルが設定されていません。設定ボタンからプロバイダーとモデルを選択してください。');
      setIsGeneratingAI(false);
      return;
    }

    const modelConfig = getModelConfig(selectedModelId);
    if (!modelConfig) {
      setAiError('選択されたモデルが見つかりません。');
      setIsGeneratingAI(false);
      return;
    }

    // Geminiの場合はAPIキーをチェック
    if (modelConfig.provider === 'gemini') {
      const apiKey = getApiKey('gemini');
      if (!apiKey) {
        setAiError('Gemini APIキーが設定されていません。設定ボタンからAPIキーを入力してください。');
        setIsGeneratingAI(false);
        return;
      }
    }

    try {
      // 診断結果をAPIに送信するためのデータを構築
      const diagnosisData = results.map(r => {
        const item = diagnosisCheckItems.find(i => i.id === r.itemId);
        return {
          category: item?.category || '',
          itemId: r.itemId,
          question: item?.question || '',
          evaluation: r.evaluation,
          comment: r.comment
        };
      });

      // Gemini APIを呼び出し
      const suggestion = await suggestImprovements(diagnosisData, categoryScores);
      
      if (suggestion) {
        setAiSuggestion(suggestion);
        
        // 改善計画テキストを生成
        const modelName = modelConfig?.name || 'AI';
        let planText = `【AIによる改善提案】 (${modelName})\n\n`;
        planText += `【全体評価】\n${suggestion.overallAssessment}\n\n`;
        
        if (suggestion.priorityAreas.length > 0) {
          planText += `【優先改善領域】\n${suggestion.priorityAreas.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n`;
        }
        
        if (suggestion.actionPlan.length > 0) {
          planText += `【アクションプラン】\n`;
          suggestion.actionPlan.forEach((action, i) => {
            planText += `${i + 1}. [${action.category}] ${action.action}\n`;
            planText += `   実施時期: ${action.timeline}\n`;
            planText += `   期待される成果: ${action.expectedOutcome}\n`;
          });
          planText += '\n';
        }
        
        if (suggestion.longTermRecommendations.length > 0) {
          planText += `【長期的な推奨事項】\n${suggestion.longTermRecommendations.map((r, i) => `・${r}`).join('\n')}`;
        }
        
        setFormData(prev => ({ ...prev, improvementPlan: planText }));
      } else {
        setAiError('AI提案の生成に失敗しました。再度お試しください。');
      }
    } catch (error: any) {
      console.error('AI suggestion error:', error);
      setAiError(error.message || 'AI提案の生成中にエラーが発生しました。');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // フォールバック用のローカル提案生成
  const generateLocalSuggestion = () => {
    const lowScoreCategories = Object.entries(categoryScores)
      .filter(([_, score]) => score.rate < 70)
      .map(([cat, _]) => DIAGNOSIS_CATEGORY_LABELS[cat as DiagnosisCategory]);
    
    let suggestion = '';
    if (lowScoreCategories.length > 0) {
      suggestion = `【改善が必要な領域】\n${lowScoreCategories.join('、')}のスコアが低くなっています。\n\n`;
      suggestion += '【推奨アクション】\n';
      if (categoryScores.check?.rate < 70) {
        suggestion += '1. 評価（Check）段階の強化: 定期的な目標達成状況の確認会議を設定\n';
      }
      if (categoryScores.act?.rate < 70) {
        suggestion += '2. 改善（Act）段階の強化: 是正措置の追跡管理システムの導入\n';
      }
      if (categoryScores.plan?.rate < 70) {
        suggestion += '3. 計画（Plan）段階の強化: リスクアセスメントの実施頻度と範囲の見直し\n';
      }
      suggestion += '\n【次年度への提案】\n';
      suggestion += '・MS評価チェックリストの定期運用（四半期ごと）\n';
      suggestion += '・改善事例の共有会の開催\n';
      suggestion += '・外部研修への参加検討';
    } else {
      suggestion = '全体的に良好な状態です。\n\n【維持・向上のポイント】\n';
      suggestion += '・現在の取り組みを継続\n';
      suggestion += '・好事例の文書化と共有\n';
      suggestion += '・新たなリスクへの対応力強化';
    }
    
    setFormData(prev => ({ ...prev, improvementPlan: suggestion }));
  };

  const getCategoryColor = (category: DiagnosisCategory) => {
    const colors: Record<DiagnosisCategory, { bg: string; text: string; border: string }> = {
      policy: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      plan: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      do: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      check: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      act: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' }
    };
    return colors[category];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-primary-600" />
          {isEditing ? '自己診断の編集' : '自己診断チェックリスト'}
        </h1>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">基本情報</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年度</label>
            <select
              value={formData.fiscalYear}
              onChange={(e) => handleChange('fiscalYear', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                <option key={year} value={year}>{year}年度</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">診断日</label>
            <input
              type="date"
              value={formData.diagnosisDate}
              onChange={(e) => handleChange('diagnosisDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              診断実施者 <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={formData.diagnosedBy}
              onChange={(e) => handleChange('diagnosedBy', e.target.value)}
              placeholder="例: 保安管理者 山田"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.diagnosedBy ? 'border-danger-500' : 'border-gray-300'
              }`}
            />
            {errors.diagnosedBy && (
              <p className="text-danger-500 text-sm mt-1">{errors.diagnosedBy}</p>
            )}
          </div>
        </div>
      </div>

      {/* スコアサマリー */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">現在のスコア</h2>
        <div className="grid grid-cols-5 gap-4">
          {(Object.keys(DIAGNOSIS_CATEGORY_LABELS) as DiagnosisCategory[]).map(cat => {
            const score = categoryScores[cat];
            const color = getCategoryColor(cat);
            return (
              <div key={cat} className={`p-3 rounded-lg ${color.bg} text-center`}>
                <div className={`text-xs font-medium ${color.text} mb-1`}>
                  {DIAGNOSIS_CATEGORY_LABELS[cat]}
                </div>
                <div className="text-2xl font-bold text-gray-900">{score.rate}%</div>
                <div className="text-xs text-gray-600">{score.score}/{score.total}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* チェックリスト */}
      <div className="space-y-4">
        {groupedItems.map(group => {
          const isExpanded = expandedCategory === group.category;
          const color = getCategoryColor(group.category);
          const score = categoryScores[group.category];

          return (
            <div key={group.category} className={`bg-white rounded-xl shadow-sm border ${color.border} overflow-hidden`}>
              <button
                className={`w-full flex items-center justify-between p-4 ${color.bg} hover:opacity-90 transition-opacity`}
                onClick={() => setExpandedCategory(isExpanded ? null : group.category)}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${color.text}`}>
                    {DIAGNOSIS_CATEGORY_LABELS[group.category]}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({group.items.length}項目)
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{score.rate}%</span>
                    <span className="text-xs text-gray-500 ml-2">({score.score}/{score.total})</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 space-y-4">
                  {group.items.map(item => {
                    const result = results.find(r => r.itemId === item.id)!;
                    return (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="mb-3">
                          <p className="font-medium text-gray-900">{item.question}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {([0, 1, 2, 3] as EvaluationLevel[]).map(level => (
                            <button
                              key={level}
                              onClick={() => handleEvaluationChange(item.id, level)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                result.evaluation === level
                                  ? EVALUATION_LEVEL_LABELS[level].color + ' ring-2 ring-offset-1 ring-gray-400'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {EVALUATION_LEVEL_LABELS[level].label}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="コメント（任意）"
                          value={result.comment || ''}
                          onChange={(e) => handleCommentChange(item.id, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 総評・改善計画 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">総評・改善計画</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">総評コメント</label>
          <textarea
            value={formData.overallComment}
            onChange={(e) => handleChange('overallComment', e.target.value)}
            placeholder="全体的な評価コメント"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">改善計画</label>
            <div className="flex items-center gap-2">
              {!getSelectedModel() && onOpenApiSettings && (
                <button
                  onClick={onOpenApiSettings}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
                >
                  <Key className="w-3 h-3" />
                  AI設定
                </button>
              )}
              {getSelectedModel() && onOpenApiSettings && (
                <button
                  onClick={onOpenApiSettings}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title="AI設定"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={generateAISuggestion}
                disabled={isGeneratingAI || !getSelectedModel()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingAI ? 'AI分析中...' : 'AI提案を生成'}
              </button>
              <button
                onClick={generateLocalSuggestion}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                title="ローカル提案（API不要）"
              >
                簡易版
              </button>
            </div>
          </div>

          {/* 選択中のモデル表示 */}
          {getSelectedModel() && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">
                  使用中: <span className="font-medium">{getModelConfig(getSelectedModel()!)?.name}</span>
                </span>
              </div>
            </div>
          )}

          {/* AIエラーメッセージ */}
          {aiError && (
            <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700">{aiError}</p>
                  {onOpenApiSettings && (
                    <button
                      onClick={onOpenApiSettings}
                      className="mt-2 text-sm text-purple-600 hover:underline flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" />
                      AI設定を開く
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI生成中のローディング */}
          {isGeneratingAI && (
            <div className="mb-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                <div>
                  <p className="text-sm text-purple-700 font-medium">
                    {getModelConfig(getSelectedModel()!)?.name || 'AI'} で分析中...
                  </p>
                  <p className="text-xs text-purple-500">診断結果を分析して改善提案を生成しています</p>
                </div>
              </div>
            </div>
          )}

          <textarea
            value={formData.improvementPlan}
            onChange={(e) => handleChange('improvementPlan', e.target.value)}
            placeholder="今後の改善計画（AI提案を生成するか、手動で入力してください）"
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          
          {formData.improvementPlan && formData.improvementPlan.includes('【AIによる改善提案】') && (
            <p className="text-xs text-purple-500 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              この提案はAIによって生成されました
            </p>
          )}
        </div>
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
