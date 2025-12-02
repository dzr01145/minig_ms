import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  MapPin,
  Mic,
  Send,
  User,
  X,
} from 'lucide-react';
import {
  HiyariHatReport,
  AccidentType,
  Location,
  SeverityLevel,
  CauseCategory,
  ACCIDENT_TYPE_LABELS,
  LOCATION_LABELS,
  SEVERITY_LABELS,
  CAUSE_LABELS,
  UserRole,
  USER_ROLE_LABELS,
} from '../types';

interface ReportFormProps {
  onSubmit: (report: HiyariHatReport) => void;
  onCancel: () => void;
}

export function ReportForm({ onSubmit, onCancel }: ReportFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    occurredAt: new Date().toISOString().slice(0, 16),
    location: '' as Location | '',
    locationDetail: '',
    accidentType: '' as AccidentType | '',
    accidentTypeOther: '',
    description: '',
    cause: '' as CauseCategory | '',
    causeDetail: '',
    severityLevel: '' as SeverityLevel | '',
    immediateAction: '',
    suggestedMeasure: '',
    reporterName: '',
    reporterRole: 'worker' as UserRole,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    accidentType?: AccidentType;
    severity?: SeverityLevel;
    measures?: string[];
  } | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const analyzeWithAI = async () => {
    if (!formData.description) return;
    
    setIsAnalyzing(true);
    // AI分析のシミュレーション（実際はGemini APIを呼び出す）
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 簡易的な自動判定ロジック
    let suggestedType: AccidentType = 'other';
    let suggestedSeverity: SeverityLevel = 'medium';
    const measures: string[] = [];
    
    const desc = formData.description.toLowerCase();
    
    if (desc.includes('墜落') || desc.includes('転落') || desc.includes('落ち') || desc.includes('滑') || desc.includes('手すり')) {
      suggestedType = 'fall';
      measures.push('手すり・防護柵の点検強化');
      measures.push('滑り止め対策の実施');
    } else if (desc.includes('巻き込') || desc.includes('挟ま') || desc.includes('はさ') || desc.includes('コンベア')) {
      suggestedType = 'caught';
      measures.push('安全柵・インターロックの設置');
      measures.push('作業手順書の見直し');
      suggestedSeverity = 'high';
    } else if (desc.includes('飛来') || desc.includes('落下') || desc.includes('飛石') || desc.includes('破片')) {
      suggestedType = 'flying';
      measures.push('保護具着用の徹底');
      measures.push('飛散防止対策の強化');
    } else if (desc.includes('つまづ') || desc.includes('転倒') || desc.includes('転ん')) {
      suggestedType = 'trip';
      measures.push('5S活動の強化');
      measures.push('通路の整備');
    }
    
    if (desc.includes('死亡') || desc.includes('重傷') || desc.includes('危うく')) {
      suggestedSeverity = 'high';
    } else if (desc.includes('軽傷') || desc.includes('かすり')) {
      suggestedSeverity = 'low';
    }
    
    setAiSuggestion({
      accidentType: suggestedType,
      severity: suggestedSeverity,
      measures,
    });
    setIsAnalyzing(false);
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setFormData(prev => ({
        ...prev,
        accidentType: aiSuggestion.accidentType || prev.accidentType,
        severityLevel: aiSuggestion.severity || prev.severityLevel,
        suggestedMeasure: aiSuggestion.measures?.join('\n') || prev.suggestedMeasure,
      }));
      setAiSuggestion(null);
    }
  };

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const report: HiyariHatReport = {
      id: uuidv4(),
      reportDate: now.split('T')[0],
      occurredAt: formData.occurredAt,
      location: formData.location as Location,
      locationDetail: formData.locationDetail,
      accidentType: formData.accidentType as AccidentType,
      accidentTypeOther: formData.accidentTypeOther,
      description: formData.description,
      cause: formData.cause as CauseCategory,
      causeDetail: formData.causeDetail,
      severityLevel: formData.severityLevel as SeverityLevel,
      immediateAction: formData.immediateAction,
      suggestedMeasure: formData.suggestedMeasure,
      reporterName: formData.reporterName,
      reporterRole: formData.reporterRole,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };
    onSubmit(report);
  };

  const isStep1Valid = formData.occurredAt && formData.location && formData.reporterName;
  const isStep2Valid = formData.accidentType && formData.description;
  const isStep3Valid = formData.severityLevel && formData.cause;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">ヒヤリハット報告</h2>
            <p className="text-gray-600 text-sm">安全のために、気づいたことを報告してください</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ステップ1: 基本情報 */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              基本情報
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  発生日時 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.occurredAt}
                  onChange={(e) => handleChange('occurredAt', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  発生場所 <span className="text-danger-500">*</span>
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="select"
                >
                  <option value="">選択してください</option>
                  {Object.entries(LOCATION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">場所の詳細</label>
              <input
                type="text"
                value={formData.locationDetail}
                onChange={(e) => handleChange('locationDetail', e.target.value)}
                placeholder="例: ベルトコンベア付近、50tダンプ など"
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  報告者名 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.reporterName}
                  onChange={(e) => handleChange('reporterName', e.target.value)}
                  placeholder="お名前"
                  className="input"
                />
              </div>

              <div>
                <label className="label">役割</label>
                <select
                  value={formData.reporterRole}
                  onChange={(e) => handleChange('reporterRole', e.target.value)}
                  className="select"
                >
                  {Object.entries(USER_ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ステップ2: 状況詳細 */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
              何が起きたか
            </h3>

            <div>
              <label className="label">
                事故の型 <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(ACCIDENT_TYPE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleChange('accidentType', key)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      formData.accidentType === key
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                状況の詳細 <span className="text-danger-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="何が起きたか、具体的に記述してください。&#10;例: ベルトコンベアの点検中、歩廊の濡れた箇所で足を滑らせ、転倒しそうになった。"
                  className="textarea h-32"
                />
                <button
                  type="button"
                  className="absolute bottom-2 right-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="音声入力"
                >
                  <Mic className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* AI分析ボタン */}
            {formData.description && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={analyzeWithAI}
                  disabled={isAnalyzing}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  {isAnalyzing ? 'AI分析中...' : 'AIで分析する'}
                </button>
              </div>
            )}

            {/* AI提案 */}
            {aiSuggestion && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">🤖 AI分析結果</h4>
                    <ul className="mt-2 space-y-1 text-sm text-blue-800">
                      <li>
                        事故の型: <strong>{ACCIDENT_TYPE_LABELS[aiSuggestion.accidentType!]}</strong>
                      </li>
                      <li>
                        推定重篤度: <strong>{SEVERITY_LABELS[aiSuggestion.severity!]}</strong>
                      </li>
                      {aiSuggestion.measures && aiSuggestion.measures.length > 0 && (
                        <li>
                          推奨対策:
                          <ul className="ml-4 mt-1">
                            {aiSuggestion.measures.map((m, i) => (
                              <li key={i}>・{m}</li>
                            ))}
                          </ul>
                        </li>
                      )}
                    </ul>
                    <button
                      type="button"
                      onClick={applyAISuggestion}
                      className="mt-3 btn btn-primary text-sm"
                    >
                      この提案を適用
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="label">写真を追加</label>
              <button
                type="button"
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 transition-colors flex items-center justify-center gap-2 text-gray-600"
              >
                <Camera className="w-5 h-5" />
                クリックして写真を追加
              </button>
            </div>
          </div>
        )}

        {/* ステップ3: 評価・原因 */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary-600" />
              評価と原因
            </h3>

            <div>
              <label className="label">
                重篤度の評価 <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleChange('severityLevel', key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.severityLevel === key
                        ? key === 'high'
                          ? 'border-danger-500 bg-danger-50'
                          : key === 'medium'
                          ? 'border-warning-500 bg-warning-50'
                          : 'border-success-500 bg-success-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{label.split('（')[0]}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {label.includes('（') ? `（${label.split('（')[1]}` : ''}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                原因カテゴリ <span className="text-danger-500">*</span>
              </label>
              <select
                value={formData.cause}
                onChange={(e) => handleChange('cause', e.target.value)}
                className="select"
              >
                <option value="">選択してください</option>
                {Object.entries(CAUSE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">原因の詳細</label>
              <textarea
                value={formData.causeDetail}
                onChange={(e) => handleChange('causeDetail', e.target.value)}
                placeholder="なぜこの状況が発生したと思いますか？"
                className="textarea h-24"
              />
            </div>
          </div>
        )}

        {/* ステップ4: 対策 */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success-600" />
              対策
            </h3>

            <div>
              <label className="label">その場で実施した対応</label>
              <textarea
                value={formData.immediateAction}
                onChange={(e) => handleChange('immediateAction', e.target.value)}
                placeholder="例: 注意喚起の表示を設置、応急修理を実施 など"
                className="textarea h-24"
              />
            </div>

            <div>
              <label className="label">提案する対策</label>
              <textarea
                value={formData.suggestedMeasure}
                onChange={(e) => handleChange('suggestedMeasure', e.target.value)}
                placeholder="再発防止のために必要と思われる対策を記載してください"
                className="textarea h-24"
              />
            </div>

            {/* 確認 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">報告内容の確認</h4>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-gray-600">発生日時:</dt>
                <dd>{new Date(formData.occurredAt).toLocaleString('ja-JP')}</dd>
                <dt className="text-gray-600">発生場所:</dt>
                <dd>{LOCATION_LABELS[formData.location as Location]} {formData.locationDetail}</dd>
                <dt className="text-gray-600">事故の型:</dt>
                <dd>{ACCIDENT_TYPE_LABELS[formData.accidentType as AccidentType]}</dd>
                <dt className="text-gray-600">重篤度:</dt>
                <dd>{SEVERITY_LABELS[formData.severityLevel as SeverityLevel]}</dd>
                <dt className="text-gray-600">報告者:</dt>
                <dd>{formData.reporterName}</dd>
              </dl>
            </div>
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
            className="btn btn-secondary"
          >
            {step === 1 ? 'キャンセル' : '戻る'}
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                (step === 3 && !isStep3Valid)
              }
              className="btn btn-primary"
            >
              次へ
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-success flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              報告を送信
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
