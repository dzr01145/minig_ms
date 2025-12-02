import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
  Search,
  X,
  Download,
  Link as LinkIcon,
} from 'lucide-react';
import {
  HiyariHatReport,
  ReportFilter,
  ACCIDENT_TYPE_LABELS,
  LOCATION_LABELS,
  SEVERITY_LABELS,
  AccidentType,
  Location,
  SeverityLevel,
} from '../types';

interface ReportListProps {
  reports: HiyariHatReport[];
  onSelectReport: (report: HiyariHatReport) => void;
  onUpdateStatus: (id: string, status: HiyariHatReport['status']) => void;
}

const STATUS_LABELS: Record<HiyariHatReport['status'], string> = {
  new: '新規',
  reviewing: '対応中',
  resolved: '解決済',
  linked_to_ra: 'RA連携',
};

const STATUS_COLORS: Record<HiyariHatReport['status'], string> = {
  new: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  linked_to_ra: 'bg-purple-100 text-purple-800',
};

export function ReportList({ reports, onSelectReport, onUpdateStatus }: ReportListProps) {
  const [filter, setFilter] = useState<ReportFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<'occurredAt' | 'severityLevel' | 'status'>('occurredAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedReport, setSelectedReport] = useState<HiyariHatReport | null>(null);

  const filteredReports = useMemo(() => {
    let result = [...reports];

    // フィルタリング
    if (filter.searchText) {
      const text = filter.searchText.toLowerCase();
      result = result.filter(r =>
        r.description.toLowerCase().includes(text) ||
        r.reporterName.toLowerCase().includes(text) ||
        r.locationDetail?.toLowerCase().includes(text)
      );
    }
    if (filter.accidentType) {
      result = result.filter(r => r.accidentType === filter.accidentType);
    }
    if (filter.location) {
      result = result.filter(r => r.location === filter.location);
    }
    if (filter.severityLevel) {
      result = result.filter(r => r.severityLevel === filter.severityLevel);
    }
    if (filter.status) {
      result = result.filter(r => r.status === filter.status);
    }
    if (filter.dateFrom) {
      result = result.filter(r => r.occurredAt >= filter.dateFrom!);
    }
    if (filter.dateTo) {
      result = result.filter(r => r.occurredAt <= filter.dateTo!);
    }

    // ソート
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'occurredAt') {
        comparison = new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
      } else if (sortField === 'severityLevel') {
        const order = { high: 3, medium: 2, low: 1 };
        comparison = order[a.severityLevel] - order[b.severityLevel];
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [reports, filter, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setFilter({});
  };

  const hasActiveFilters = Object.values(filter).some(v => v);

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">報告一覧</h2>
          <p className="text-gray-600">
            {filteredReports.length}件 / 全{reports.length}件
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
          >
            <Filter className="w-4 h-4" />
            フィルタ
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-danger-500 rounded-full" />
            )}
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            エクスポート
          </button>
        </div>
      </div>

      {/* フィルタパネル */}
      {showFilters && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">フィルタ条件</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                クリア
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">キーワード検索</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filter.searchText || ''}
                  onChange={(e) => setFilter(prev => ({ ...prev, searchText: e.target.value }))}
                  placeholder="検索..."
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="label">事故の型</label>
              <select
                value={filter.accidentType || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, accidentType: e.target.value as AccidentType || undefined }))}
                className="select"
              >
                <option value="">すべて</option>
                {Object.entries(ACCIDENT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">発生場所</label>
              <select
                value={filter.location || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, location: e.target.value as Location || undefined }))}
                className="select"
              >
                <option value="">すべて</option>
                {Object.entries(LOCATION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">重篤度</label>
              <select
                value={filter.severityLevel || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, severityLevel: e.target.value as SeverityLevel || undefined }))}
                className="select"
              >
                <option value="">すべて</option>
                {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label.split('（')[0]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">ステータス</label>
              <select
                value={filter.status || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as HiyariHatReport['status'] || undefined }))}
                className="select"
              >
                <option value="">すべて</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">期間（開始）</label>
              <input
                type="date"
                value={filter.dateFrom || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value || undefined }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">期間（終了）</label>
              <input
                type="date"
                value={filter.dateTo || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value || undefined }))}
                className="input"
              />
            </div>
          </div>
        </div>
      )}

      {/* テーブル */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('occurredAt')}
                >
                  <div className="flex items-center gap-1">
                    発生日時
                    <SortIcon field="occurredAt" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">場所</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">事故の型</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">概要</th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('severityLevel')}
                >
                  <div className="flex items-center gap-1">
                    重篤度
                    <SortIcon field="severityLevel" />
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    ステータス
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <td className="py-3 px-4 text-sm">
                    {new Date(report.occurredAt).toLocaleDateString('ja-JP')}
                    <br />
                    <span className="text-gray-500 text-xs">
                      {new Date(report.occurredAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {LOCATION_LABELS[report.location]}
                    {report.locationDetail && (
                      <br />
                    )}
                    {report.locationDetail && (
                      <span className="text-gray-500 text-xs">{report.locationDetail}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className={`w-3 h-3 ${
                        report.accidentType === 'fall' ? 'text-red-500' :
                        report.accidentType === 'caught' ? 'text-orange-500' :
                        report.accidentType === 'flying' ? 'text-yellow-500' :
                        'text-gray-500'
                      }`} />
                      {ACCIDENT_TYPE_LABELS[report.accidentType]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm max-w-xs">
                    <p className="truncate">{report.description}</p>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`badge ${
                      report.severityLevel === 'high' ? 'bg-danger-100 text-danger-800' :
                      report.severityLevel === 'medium' ? 'bg-warning-100 text-warning-800' :
                      'bg-success-100 text-success-800'
                    }`}>
                      {SEVERITY_LABELS[report.severityLevel].split('（')[0]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`badge ${STATUS_COLORS[report.status]}`}>
                      {STATUS_LABELS[report.status]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReport(report);
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="詳細を見る"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    該当する報告がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">報告詳細</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">発生日時</label>
                  <p className="font-medium">
                    {new Date(selectedReport.occurredAt).toLocaleString('ja-JP')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">報告者</label>
                  <p className="font-medium">{selectedReport.reporterName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">発生場所</label>
                  <p className="font-medium">
                    {LOCATION_LABELS[selectedReport.location]}
                    {selectedReport.locationDetail && ` / ${selectedReport.locationDetail}`}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">事故の型</label>
                  <p className="font-medium">{ACCIDENT_TYPE_LABELS[selectedReport.accidentType]}</p>
                </div>
              </div>

              {/* 重篤度・ステータス */}
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm text-gray-500">重篤度</label>
                  <p>
                    <span className={`badge ${
                      selectedReport.severityLevel === 'high' ? 'bg-danger-100 text-danger-800' :
                      selectedReport.severityLevel === 'medium' ? 'bg-warning-100 text-warning-800' :
                      'bg-success-100 text-success-800'
                    }`}>
                      {SEVERITY_LABELS[selectedReport.severityLevel]}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">ステータス</label>
                  <select
                    value={selectedReport.status}
                    onChange={(e) => {
                      onUpdateStatus(selectedReport.id, e.target.value as HiyariHatReport['status']);
                      setSelectedReport(prev => prev ? { ...prev, status: e.target.value as HiyariHatReport['status'] } : null);
                    }}
                    className="select mt-1"
                  >
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 状況詳細 */}
              <div>
                <label className="text-sm text-gray-500">状況の詳細</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedReport.description}</p>
              </div>

              {/* 原因 */}
              {selectedReport.causeDetail && (
                <div>
                  <label className="text-sm text-gray-500">原因</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedReport.causeDetail}</p>
                </div>
              )}

              {/* 対応・対策 */}
              {selectedReport.immediateAction && (
                <div>
                  <label className="text-sm text-gray-500">その場での対応</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedReport.immediateAction}</p>
                </div>
              )}
              {selectedReport.suggestedMeasure && (
                <div>
                  <label className="text-sm text-gray-500">提案対策</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedReport.suggestedMeasure}</p>
                </div>
              )}

              {/* AI分析 */}
              {selectedReport.aiAnalysis && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🤖 AI分析結果</h4>
                  {selectedReport.aiAnalysis.rootCauseAnalysis && (
                    <div className="mb-3">
                      <label className="text-sm text-blue-700">根本原因分析</label>
                      <p className="text-blue-800">{selectedReport.aiAnalysis.rootCauseAnalysis}</p>
                    </div>
                  )}
                  {selectedReport.aiAnalysis.recommendedMeasures && (
                    <div>
                      <label className="text-sm text-blue-700">推奨対策</label>
                      <ul className="mt-1 space-y-1">
                        {selectedReport.aiAnalysis.recommendedMeasures.map((m, i) => (
                          <li key={i} className="text-blue-800">・{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedReport.aiAnalysis.similarCases && selectedReport.aiAnalysis.similarCases.length > 0 && (
                    <div className="mt-3">
                      <label className="text-sm text-blue-700">類似事例</label>
                      <ul className="mt-1 space-y-1">
                        {selectedReport.aiAnalysis.similarCases.map((c, i) => (
                          <li key={i} className="text-blue-800 text-sm">
                            ・{c.summary} （類似度: {(c.similarity * 100).toFixed(0)}%）
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button className="btn btn-secondary flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  RAに連携
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
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
