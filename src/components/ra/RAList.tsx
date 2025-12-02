import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Link as LinkIcon,
  Search,
  X,
} from 'lucide-react';
import {
  RiskAssessmentItem,
  RISK_LEVEL_LABELS,
  RA_STATUS_LABELS,
  PRIORITY_LABELS,
  SEVERITY_RA_LABELS,
  POSSIBILITY_LABELS,
  calculateRiskLevel,
  RiskLevel,
} from '../../types/ra';
import { ACCIDENT_TYPE_LABELS, AccidentType } from '../../types';

interface RAListProps {
  items: RiskAssessmentItem[];
  onSelectItem: (item: RiskAssessmentItem) => void;
  onUpdateItem: (item: RiskAssessmentItem) => void;
}

export function RAList({ items, onSelectItem, onUpdateItem }: RAListProps) {
  const [searchText, setSearchText] = useState('');
  const [filterAccidentType, setFilterAccidentType] = useState<AccidentType | ''>('');
  const [filterRiskLevel, setFilterRiskLevel] = useState<RiskLevel | ''>('');
  const [filterStatus, setFilterStatus] = useState<RiskAssessmentItem['status'] | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<RiskAssessmentItem | null>(null);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (searchText) {
      const text = searchText.toLowerCase();
      result = result.filter(i =>
        i.workName.toLowerCase().includes(text) ||
        i.hazardSource.toLowerCase().includes(text) ||
        i.hazardDescription.toLowerCase().includes(text)
      );
    }

    if (filterAccidentType) {
      result = result.filter(i => i.accidentType === filterAccidentType);
    }

    if (filterRiskLevel) {
      result = result.filter(i => i.riskLevelBefore === filterRiskLevel);
    }

    if (filterStatus) {
      result = result.filter(i => i.status === filterStatus);
    }

    // リスクレベル順（高い順）でソート
    const riskOrder = { very_worried: 3, worried: 2, concerned: 1 };
    result.sort((a, b) => riskOrder[b.riskLevelBefore] - riskOrder[a.riskLevelBefore]);

    return result;
  }, [items, searchText, filterAccidentType, filterRiskLevel, filterStatus]);

  const hasFilters = searchText || filterAccidentType || filterRiskLevel || filterStatus;

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">RA実施結果一覧</h2>
          <p className="text-gray-600">
            {filteredItems.length}件 / 全{items.length}件
          </p>
        </div>
      </div>

      {/* フィルター */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">キーワード検索</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="作業名、危険源など..."
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label">事故の型</label>
            <select
              value={filterAccidentType}
              onChange={(e) => setFilterAccidentType(e.target.value as AccidentType | '')}
              className="select"
            >
              <option value="">すべて</option>
              {Object.entries(ACCIDENT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">リスクレベル</label>
            <select
              value={filterRiskLevel}
              onChange={(e) => setFilterRiskLevel(e.target.value as RiskLevel | '')}
              className="select"
            >
              <option value="">すべて</option>
              {Object.entries(RISK_LEVEL_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">ステータス</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as RiskAssessmentItem['status'] | '')}
              className="select"
            >
              <option value="">すべて</option>
              {Object.entries(RA_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        {hasFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearchText('');
                setFilterAccidentType('');
                setFilterRiskLevel('');
                setFilterStatus('');
              }}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              フィルターをクリア
            </button>
          </div>
        )}
      </div>

      {/* リスト */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`card p-0 overflow-hidden border-l-4 ${
              item.riskLevelBefore === 'very_worried' ? 'border-l-danger-500' :
              item.riskLevelBefore === 'worried' ? 'border-l-warning-500' :
              'border-l-success-500'
            }`}
          >
            {/* ヘッダー行 */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <button className="mt-1">
                    {expandedId === item.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        item.riskLevelBefore === 'very_worried' 
                          ? 'bg-danger-100 text-danger-800'
                          : item.riskLevelBefore === 'worried'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-success-100 text-success-800'
                      }`}>
                        {RISK_LEVEL_LABELS[item.riskLevelBefore]}
                      </span>
                      <span className="text-sm text-gray-500">
                        {ACCIDENT_TYPE_LABELS[item.accidentType]}
                      </span>
                    </div>
                    <h4 className="font-medium mt-1">{item.workName}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.hazardDescription}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge ${
                    item.status === 'identified' ? 'bg-gray-100 text-gray-800' :
                    item.status === 'measuring' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'implemented' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {RA_STATUS_LABELS[item.status]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="詳細を見る"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* 展開詳細 */}
            {expandedId === item.id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 左カラム：洗い出し情報 */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">危険源</label>
                      <p className="font-medium">{item.hazardSource}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">考えられる原因</label>
                      <ul className="mt-1">
                        {item.causes.map((cause, i) => (
                          <li key={i} className="text-sm">・{cause}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">リスク見積もり（低減前）</label>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm">
                          重篤度: <strong>{SEVERITY_RA_LABELS[item.severityBefore].split('（')[0]}</strong>
                        </span>
                        <span className="text-sm">
                          可能性: <strong>{POSSIBILITY_LABELS[item.possibilityBefore].split('（')[0]}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 右カラム：低減措置 */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">低減措置</label>
                      <div className="mt-1 space-y-2">
                        {item.measures.map((measure) => (
                          <div key={measure.id} className="flex items-start gap-2 text-sm">
                            <span className={`badge text-xs ${
                              measure.status === 'completed' ? 'bg-green-100 text-green-800' :
                              measure.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {measure.status === 'completed' ? '完了' : 
                               measure.status === 'in_progress' ? '進行中' : '計画'}
                            </span>
                            <span>{measure.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {item.riskLevelAfter && (
                      <div>
                        <label className="text-sm text-gray-500">リスク見積もり（低減後）</label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge ${
                            item.riskLevelAfter === 'very_worried' 
                              ? 'bg-danger-100 text-danger-800'
                              : item.riskLevelAfter === 'worried'
                              ? 'bg-warning-100 text-warning-800'
                              : 'bg-success-100 text-success-800'
                          }`}>
                            {RISK_LEVEL_LABELS[item.riskLevelAfter]}
                          </span>
                          {item.riskLevelAfter !== item.riskLevelBefore && (
                            <span className="text-sm text-success-600">
                              ↓ レベル低減
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {item.residualRisk && (
                      <div>
                        <label className="text-sm text-gray-500">残留リスク・継続検討事項</label>
                        <p className="text-sm mt-1 p-2 bg-yellow-50 rounded border border-yellow-200">
                          {item.residualRisk}
                        </p>
                      </div>
                    )}
                    {item.linkedHiyariIds && item.linkedHiyariIds.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-primary-600">
                        <LinkIcon className="w-4 h-4" />
                        ヒヤリハット {item.linkedHiyariIds.length}件と連携
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="card text-center py-8 text-gray-500">
            該当する項目がありません
          </div>
        )}
      </div>

      {/* 詳細モーダル */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">RA項目詳細</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* 基本情報 */}
              <div className="flex items-center gap-4">
                <span className={`badge ${
                  selectedItem.riskLevelBefore === 'very_worried' 
                    ? 'bg-danger-100 text-danger-800'
                    : selectedItem.riskLevelBefore === 'worried'
                    ? 'bg-warning-100 text-warning-800'
                    : 'bg-success-100 text-success-800'
                }`}>
                  {RISK_LEVEL_LABELS[selectedItem.riskLevelBefore]}
                </span>
                <span className="badge bg-gray-100 text-gray-800">
                  {ACCIDENT_TYPE_LABELS[selectedItem.accidentType]}
                </span>
                <span className={`badge ${
                  selectedItem.status === 'identified' ? 'bg-gray-100 text-gray-800' :
                  selectedItem.status === 'measuring' ? 'bg-blue-100 text-blue-800' :
                  selectedItem.status === 'implemented' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {RA_STATUS_LABELS[selectedItem.status]}
                </span>
              </div>

              {/* 洗い出し情報 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium">危険有害要因の洗い出し</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-500">作業名（工程・設備）</label>
                    <p className="font-medium">{selectedItem.workName}</p>
                  </div>
                  <div>
                    <label className="text-gray-500">危険源</label>
                    <p className="font-medium">{selectedItem.hazardSource}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <label className="text-gray-500">危険性又は有害性と発生のおそれのある災害</label>
                  <p className="mt-1">{selectedItem.hazardDescription}</p>
                </div>
                <div className="text-sm">
                  <label className="text-gray-500">考えられる主な原因</label>
                  <ul className="mt-1">
                    {selectedItem.causes.map((cause, i) => (
                      <li key={i}>・{cause}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* リスク見積もり */}
              <div className="grid grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">低減前</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">重篤度</span>
                      <span className="font-medium">{SEVERITY_RA_LABELS[selectedItem.severityBefore]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">可能性</span>
                      <span className="font-medium">{POSSIBILITY_LABELS[selectedItem.possibilityBefore]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">リスクレベル</span>
                      <span className={`badge ${
                        selectedItem.riskLevelBefore === 'very_worried' 
                          ? 'bg-danger-100 text-danger-800'
                          : selectedItem.riskLevelBefore === 'worried'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-success-100 text-success-800'
                      }`}>
                        {RISK_LEVEL_LABELS[selectedItem.riskLevelBefore]}
                      </span>
                    </div>
                  </div>
                </div>
                {selectedItem.riskLevelAfter && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="font-medium mb-3">低減後</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">重篤度</span>
                        <span className="font-medium">{SEVERITY_RA_LABELS[selectedItem.severityAfter!]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">可能性</span>
                        <span className="font-medium">{POSSIBILITY_LABELS[selectedItem.possibilityAfter!]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">リスクレベル</span>
                        <span className={`badge ${
                          selectedItem.riskLevelAfter === 'very_worried' 
                            ? 'bg-danger-100 text-danger-800'
                            : selectedItem.riskLevelAfter === 'worried'
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-success-100 text-success-800'
                        }`}>
                          {RISK_LEVEL_LABELS[selectedItem.riskLevelAfter]}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 低減措置 */}
              <div>
                <h4 className="font-medium mb-3">低減措置</h4>
                <div className="space-y-3">
                  {selectedItem.measures.map((measure) => (
                    <div key={measure.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {measure.priority === 'essential' ? '①本質安全' :
                               measure.priority === 'engineering' ? '②工学的' :
                               measure.priority === 'management' ? '③管理的' : '④保護具'}
                            </span>
                            <span className={`badge text-xs ${
                              measure.status === 'completed' ? 'bg-green-100 text-green-800' :
                              measure.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {measure.status === 'completed' ? '完了' : 
                               measure.status === 'in_progress' ? '進行中' : '計画'}
                            </span>
                          </div>
                          <p className="mt-1">{measure.description}</p>
                        </div>
                      </div>
                      {(measure.targetDate || measure.responsible) && (
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          {measure.targetDate && <span>目標: {measure.targetDate}</span>}
                          {measure.responsible && <span>担当: {measure.responsible}</span>}
                          {measure.completedDate && <span className="text-success-600">完了: {measure.completedDate}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 残留リスク */}
              {selectedItem.residualRisk && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">残留リスク・継続検討事項</h4>
                  <p className="text-yellow-700">{selectedItem.residualRisk}</p>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button className="btn btn-secondary flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  編集
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="btn btn-primary"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
