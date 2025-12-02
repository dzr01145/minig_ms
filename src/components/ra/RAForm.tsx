import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Lightbulb,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  RiskAssessmentItem,
  RiskMeasure,
  Severity,
  Possibility,
  MeasurePriority,
  SEVERITY_RA_LABELS,
  POSSIBILITY_LABELS,
  RISK_LEVEL_LABELS,
  MEASURE_PRIORITY_LABELS,
  calculateRiskLevel,
} from '../../types/ra';
import {
  AccidentType,
  ACCIDENT_TYPE_LABELS,
} from '../../types';
import { HiyariHatReport } from '../../types';

interface RAFormProps {
  onSubmit: (item: RiskAssessmentItem) => void;
  onCancel: () => void;
  hiyariReports?: HiyariHatReport[];
}

export function RAForm({ onSubmit, onCancel, hiyariReports = [] }: RAFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    accidentType: '' as AccidentType | '',
    workName: '',
    hazardSource: '',
    hazardDescription: '',
    causes: [''],
    severityBefore: '' as Severity | '',
    possibilityBefore: '' as Possibility | '',
  });
  const [measures, setMeasures] = useState<Partial<RiskMeasure>[]>([
    { priority: 'engineering' as MeasurePriority, description: '', status: 'planned' }
  ]);
  const [afterEvaluation, setAfterEvaluation] = useState({
    severityAfter: '' as Severity | '',
    possibilityAfter: '' as Possibility | '',
    residualRisk: '',
  });
  const [linkedHiyariIds, setLinkedHiyariIds] = useState<string[]>([]);
  const [showHiyariSelector, setShowHiyariSelector] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCauseChange = (index: number, value: string) => {
    setFormData(prev => {
      const newCauses = [...prev.causes];
      newCauses[index] = value;
      return { ...prev, causes: newCauses };
    });
  };

  const addCause = () => {
    setFormData(prev => ({ ...prev, causes: [...prev.causes, ''] }));
  };

  const removeCause = (index: number) => {
    setFormData(prev => ({
      ...prev,
      causes: prev.causes.filter((_, i) => i !== index),
    }));
  };

  const handleMeasureChange = (index: number, field: string, value: string) => {
    setMeasures(prev => {
      const newMeasures = [...prev];
      newMeasures[index] = { ...newMeasures[index], [field]: value };
      return newMeasures;
    });
  };

  const addMeasure = () => {
    setMeasures(prev => [
      ...prev,
      { priority: 'management' as MeasurePriority, description: '', status: 'planned' }
    ]);
  };

  const removeMeasure = (index: number) => {
    setMeasures(prev => prev.filter((_, i) => i !== index));
  };

  const riskLevelBefore = formData.severityBefore && formData.possibilityBefore
    ? calculateRiskLevel(formData.severityBefore, formData.possibilityBefore)
    : null;

  const riskLevelAfter = afterEvaluation.severityAfter && afterEvaluation.possibilityAfter
    ? calculateRiskLevel(afterEvaluation.severityAfter, afterEvaluation.possibilityAfter)
    : null;

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const item: RiskAssessmentItem = {
      id: uuidv4(),
      accidentType: formData.accidentType as AccidentType,
      workName: formData.workName,
      hazardSource: formData.hazardSource,
      hazardDescription: formData.hazardDescription,
      causes: formData.causes.filter(c => c.trim()),
      severityBefore: formData.severityBefore as Severity,
      possibilityBefore: formData.possibilityBefore as Possibility,
      riskLevelBefore: riskLevelBefore!,
      measures: measures.map(m => ({
        id: uuidv4(),
        priority: m.priority as MeasurePriority,
        description: m.description || '',
        targetDate: m.targetDate,
        responsible: m.responsible,
        status: 'planned',
      })),
      severityAfter: afterEvaluation.severityAfter as Severity || undefined,
      possibilityAfter: afterEvaluation.possibilityAfter as Possibility || undefined,
      riskLevelAfter: riskLevelAfter || undefined,
      residualRisk: afterEvaluation.residualRisk || undefined,
      priority: riskLevelBefore === 'very_worried' ? 'immediate' : 
               riskLevelBefore === 'worried' ? 'planned' : 'monitor',
      status: 'identified',
      linkedHiyariIds: linkedHiyariIds.length > 0 ? linkedHiyariIds : undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: '保安管理者',
    };
    onSubmit(item);
  };

  const isStep1Valid = formData.accidentType && formData.workName && formData.hazardSource && formData.hazardDescription;
  const isStep2Valid = formData.severityBefore && formData.possibilityBefore;
  const isStep3Valid = measures.some(m => m.description?.trim());

  // ヒヤリハットからの自動入力
  const importFromHiyari = (report: HiyariHatReport) => {
    setFormData(prev => ({
      ...prev,
      accidentType: report.accidentType,
      hazardDescription: report.description,
      causes: report.causeDetail ? [report.causeDetail] : [''],
    }));
    setLinkedHiyariIds(prev => [...new Set([...prev, report.id])]);
    setShowHiyariSelector(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">新規リスクアセスメント</h2>
            <p className="text-gray-600 text-sm">危険有害要因の洗い出しと評価</p>
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
          {['洗い出し', '見積もり', '低減措置', '確認'].map((label, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step > index + 1
                      ? 'bg-success-600 text-white'
                      : step === index + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > index + 1 ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <span className={`text-sm ${step === index + 1 ? 'font-medium' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
              {index < 3 && (
                <ChevronRight className="w-5 h-5 text-gray-300 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ヒヤリハット連携ボタン */}
        {step === 1 && hiyariReports.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowHiyariSelector(true)}
              className="btn btn-secondary flex items-center gap-2 w-full justify-center"
            >
              <Lightbulb className="w-4 h-4" />
              ヒヤリハット報告から取り込む
            </button>
            {linkedHiyariIds.length > 0 && (
              <p className="text-sm text-success-600 mt-2">
                ✓ {linkedHiyariIds.length}件のヒヤリハットと連携中
              </p>
            )}
          </div>
        )}

        {/* ステップ1: 洗い出し */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
              危険有害要因の洗い出し
            </h3>

            <div>
              <label className="label">
                事故の型 <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(ACCIDENT_TYPE_LABELS).slice(0, 5).map(([key, label]) => (
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
              <p className="text-xs text-gray-500 mt-2">
                ※ 重点3事故の型：墜落転落、はさまれ・巻き込まれ、飛来・落下
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  作業名（工程・設備） <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.workName}
                  onChange={(e) => handleChange('workName', e.target.value)}
                  placeholder="例: 積込運搬 / ダンプトラック"
                  className="input"
                />
              </div>
              <div>
                <label className="label">
                  危険源 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.hazardSource}
                  onChange={(e) => handleChange('hazardSource', e.target.value)}
                  placeholder="例: 50tダンプトラック"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">
                危険性又は有害性と発生のおそれのある災害 <span className="text-danger-500">*</span>
              </label>
              <textarea
                value={formData.hazardDescription}
                onChange={(e) => handleChange('hazardDescription', e.target.value)}
                placeholder="例: 50tダンプトラックの運転席ドア付近の防護柵・手すりが腐食破損しているため、乗降の際に墜落し、頭を強打して死亡する。"
                className="textarea h-24"
              />
              <p className="text-xs text-gray-500 mt-1">
                「～なので、～して、～になる」の形式で記述
              </p>
            </div>

            <div>
              <label className="label">考えられる主な原因</label>
              {formData.causes.map((cause, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={cause}
                    onChange={(e) => handleCauseChange(index, e.target.value)}
                    placeholder={`原因${index + 1}: 例: 防護措置の不備（劣化）`}
                    className="input"
                  />
                  {formData.causes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCause(index)}
                      className="p-2 text-gray-400 hover:text-danger-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addCause}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                原因を追加
              </button>
            </div>
          </div>
        )}

        {/* ステップ2: リスク見積もり */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">リスクの見積もり</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  重篤度 <span className="text-danger-500">*</span>
                </label>
                <div className="space-y-2">
                  {Object.entries(SEVERITY_RA_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleChange('severityBefore', key)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        formData.severityBefore === key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{label.split('（')[0]}</div>
                      <div className="text-xs text-gray-500">
                        （{label.split('（')[1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  可能性 <span className="text-danger-500">*</span>
                </label>
                <div className="space-y-2">
                  {Object.entries(POSSIBILITY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleChange('possibilityBefore', key)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        formData.possibilityBefore === key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{label.split('（')[0]}</div>
                      <div className="text-xs text-gray-500">
                        （{label.split('（')[1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* リスクレベル判定結果 */}
            {riskLevelBefore && (
              <div className={`p-4 rounded-lg border-2 ${
                riskLevelBefore === 'very_worried' 
                  ? 'bg-danger-50 border-danger-300'
                  : riskLevelBefore === 'worried'
                  ? 'bg-warning-50 border-warning-300'
                  : 'bg-success-50 border-success-300'
              }`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${
                    riskLevelBefore === 'very_worried' ? 'text-danger-600' :
                    riskLevelBefore === 'worried' ? 'text-warning-600' :
                    'text-success-600'
                  }`} />
                  <span className="font-bold">
                    リスクレベル: {RISK_LEVEL_LABELS[riskLevelBefore]}
                  </span>
                </div>
                <p className="text-sm mt-1 text-gray-600">
                  {riskLevelBefore === 'very_worried' && '直ちに低減措置が必要です'}
                  {riskLevelBefore === 'worried' && '計画的に低減措置を実施してください'}
                  {riskLevelBefore === 'concerned' && '継続的に監視・管理してください'}
                </p>
              </div>
            )}

            {/* マトリックス表示 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">リスクマトリックス</h4>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-white"></th>
                    <th className="border border-gray-300 p-2 bg-white">可能性 大</th>
                    <th className="border border-gray-300 p-2 bg-white">可能性 中</th>
                    <th className="border border-gray-300 p-2 bg-white">可能性 小</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-white font-medium">重篤度 大</td>
                    <td className={`border border-gray-300 p-2 text-center ${formData.severityBefore === 'large' && formData.possibilityBefore === 'large' ? 'ring-2 ring-primary-500' : ''} bg-danger-100`}>すごく心配</td>
                    <td className={`border border-gray-300 p-2 text-center ${formData.severityBefore === 'large' && formData.possibilityBefore === 'medium' ? 'ring-2 ring-primary-500' : ''} bg-warning-100`}>心配</td>
                    <td className={`border border-gray-300 p-2 text-center ${formData.severityBefore === 'large' && formData.possibilityBefore === 'small' ? 'ring-2 ring-primary-500' : ''} bg-warning-100`}>心配</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-white font-medium">重篤度 中</td>
                    <td className={`border border-gray-300 p-2 text-center ${formData.severityBefore === 'medium' && formData.possibilityBefore === 'large' ? 'ring-2 ring-primary-500' : ''} bg-warning-100`}>心配</td>
                    <td className={`border border-gray-300 p-2 text-center ${formData.severityBefore === 'medium' && formData.possibilityBefore === 'medium' ? 'ring-2 ring-primary-500' : ''} bg-warning-100`}>心配</td>
                    <td className={`border border-gray-300 p-2 text-center ${formData.severityBefore === 'medium' && formData.possibilityBefore === 'small' ? 'ring-2 ring-primary-500' : ''} bg-success-100`}>気になる</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 bg-white font-medium">重篤度 小</td>
                    <td className={`border border-gray-300 p-2 text-center ${formData.severityBefore === 'small' && formData.possibilityBefore === 'large' ? 'ring-2 ring-primary-500' : ''} bg-success-100`}>気になる</td>
                    <td className={`border border-gray-300 p-2 text-center ${formData.severityBefore === 'small' && formData.possibilityBefore === 'medium' ? 'ring-2 ring-primary-500' : ''} bg-success-100`}>気になる</td>
                    <td className={`border border-gray-300 p-2 text-center ${formData.severityBefore === 'small' && formData.possibilityBefore === 'small' ? 'ring-2 ring-primary-500' : ''} bg-success-100`}>気になる</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ステップ3: 低減措置 */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">リスク低減措置</h3>
            <p className="text-sm text-gray-600">
              優先順位: ① 本質安全対策 → ② 工学的対策 → ③ 管理的対策 → ④ 個人用保護具
            </p>

            {measures.map((measure, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">措置 {index + 1}</span>
                  {measures.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMeasure(index)}
                      className="text-gray-400 hover:text-danger-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">優先度</label>
                    <select
                      value={measure.priority || ''}
                      onChange={(e) => handleMeasureChange(index, 'priority', e.target.value)}
                      className="select"
                    >
                      {Object.entries(MEASURE_PRIORITY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">担当者</label>
                    <input
                      type="text"
                      value={measure.responsible || ''}
                      onChange={(e) => handleMeasureChange(index, 'responsible', e.target.value)}
                      placeholder="例: 設備担当"
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">措置内容</label>
                  <textarea
                    value={measure.description || ''}
                    onChange={(e) => handleMeasureChange(index, 'description', e.target.value)}
                    placeholder="具体的な低減措置を記述"
                    className="textarea h-20"
                  />
                </div>
                <div>
                  <label className="label">目標日</label>
                  <input
                    type="date"
                    value={measure.targetDate || ''}
                    onChange={(e) => handleMeasureChange(index, 'targetDate', e.target.value)}
                    className="input w-auto"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addMeasure}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              措置を追加
            </button>

            {/* 低減後の評価（任意） */}
            <div className="border-t pt-6 mt-6">
              <h4 className="font-medium mb-4">低減後の見積もり（任意）</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">重篤度（低減後）</label>
                  <select
                    value={afterEvaluation.severityAfter}
                    onChange={(e) => setAfterEvaluation(prev => ({ ...prev, severityAfter: e.target.value as Severity }))}
                    className="select"
                  >
                    <option value="">未評価</option>
                    {Object.entries(SEVERITY_RA_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">可能性（低減後）</label>
                  <select
                    value={afterEvaluation.possibilityAfter}
                    onChange={(e) => setAfterEvaluation(prev => ({ ...prev, possibilityAfter: e.target.value as Possibility }))}
                    className="select"
                  >
                    <option value="">未評価</option>
                    {Object.entries(POSSIBILITY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {riskLevelAfter && (
                <div className={`mt-4 p-3 rounded-lg ${
                  riskLevelAfter === 'very_worried' 
                    ? 'bg-danger-50'
                    : riskLevelAfter === 'worried'
                    ? 'bg-warning-50'
                    : 'bg-success-50'
                }`}>
                  低減後リスクレベル: <strong>{RISK_LEVEL_LABELS[riskLevelAfter]}</strong>
                  {riskLevelBefore && riskLevelAfter !== riskLevelBefore && (
                    <span className="ml-2 text-success-600">
                      （{RISK_LEVEL_LABELS[riskLevelBefore]} → {RISK_LEVEL_LABELS[riskLevelAfter]}）
                    </span>
                  )}
                </div>
              )}
              <div className="mt-4">
                <label className="label">残留リスク・継続検討事項</label>
                <textarea
                  value={afterEvaluation.residualRisk}
                  onChange={(e) => setAfterEvaluation(prev => ({ ...prev, residualRisk: e.target.value }))}
                  placeholder="低減措置後も残るリスクや継続的な対策について記述"
                  className="textarea h-20"
                />
              </div>
            </div>
          </div>
        )}

        {/* ステップ4: 確認 */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">内容確認</h3>

            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-500">事故の型</label>
                <p className="font-medium">{ACCIDENT_TYPE_LABELS[formData.accidentType as AccidentType]}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">作業名・危険源</label>
                <p className="font-medium">{formData.workName} / {formData.hazardSource}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">危険性・有害性</label>
                <p>{formData.hazardDescription}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">リスクレベル（低減前）</label>
                <span className={`badge ${
                  riskLevelBefore === 'very_worried' 
                    ? 'bg-danger-100 text-danger-800'
                    : riskLevelBefore === 'worried'
                    ? 'bg-warning-100 text-warning-800'
                    : 'bg-success-100 text-success-800'
                }`}>
                  {riskLevelBefore && RISK_LEVEL_LABELS[riskLevelBefore]}
                </span>
              </div>
              <div>
                <label className="text-sm text-gray-500">低減措置 ({measures.length}件)</label>
                <ul className="mt-1">
                  {measures.filter(m => m.description).map((m, i) => (
                    <li key={i} className="text-sm">・{m.description}</li>
                  ))}
                </ul>
              </div>
              {linkedHiyariIds.length > 0 && (
                <div>
                  <label className="text-sm text-gray-500">連携ヒヤリハット</label>
                  <p className="text-sm text-primary-600">{linkedHiyariIds.length}件</p>
                </div>
              )}
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
              <Save className="w-4 h-4" />
              RA項目を保存
            </button>
          )}
        </div>
      </div>

      {/* ヒヤリハット選択モーダル */}
      {showHiyariSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold">ヒヤリハットから取り込む</h3>
              <button
                onClick={() => setShowHiyariSelector(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {hiyariReports.filter(r => r.severityLevel === 'high' || r.severityLevel === 'medium').map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-3 mb-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => importFromHiyari(report)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${
                      report.severityLevel === 'high' ? 'bg-danger-100 text-danger-800' : 'bg-warning-100 text-warning-800'
                    }`}>
                      {report.severityLevel === 'high' ? '重大' : '中程度'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {ACCIDENT_TYPE_LABELS[report.accidentType]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(report.occurredAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <p className="text-sm mt-1 line-clamp-2">{report.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
