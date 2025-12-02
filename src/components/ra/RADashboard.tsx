import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  PlusCircle,
  Shield,
  TrendingDown,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  RiskAssessmentItem,
  RISK_LEVEL_LABELS,
  RA_STATUS_LABELS,
} from '../../types/ra';
import { ACCIDENT_TYPE_LABELS } from '../../types';

interface RADashboardProps {
  items: RiskAssessmentItem[];
  onNavigate: (page: string) => void;
}

const RISK_COLORS = {
  very_worried: '#ef4444',
  worried: '#f59e0b',
  concerned: '#22c55e',
};

export function RADashboard({ items, onNavigate }: RADashboardProps) {
  // 統計計算
  const totalItems = items.length;
  const veryWorriedCount = items.filter(i => i.riskLevelBefore === 'very_worried').length;
  const worriedCount = items.filter(i => i.riskLevelBefore === 'worried').length;
  const implementedCount = items.filter(i => i.status === 'implemented' || i.status === 'evaluated').length;
  
  // 低減効果の計算
  const reducedCount = items.filter(i => {
    if (!i.riskLevelAfter) return false;
    const levels = ['concerned', 'worried', 'very_worried'];
    return levels.indexOf(i.riskLevelAfter) < levels.indexOf(i.riskLevelBefore);
  }).length;

  // リスクレベル別分布（低減前）
  const riskLevelBeforeData = [
    { name: 'すごく心配', value: veryWorriedCount, key: 'very_worried' },
    { name: '心配', value: worriedCount, key: 'worried' },
    { name: '気になる', value: items.filter(i => i.riskLevelBefore === 'concerned').length, key: 'concerned' },
  ];

  // 事故の型別
  const accidentTypeData = Object.entries(ACCIDENT_TYPE_LABELS).map(([key, label]) => ({
    name: label,
    count: items.filter(i => i.accidentType === key).length,
  })).filter(d => d.count > 0);

  // ステータス別
  const statusData = Object.entries(RA_STATUS_LABELS).map(([key, label]) => ({
    name: label,
    count: items.filter(i => i.status === key).length,
  }));

  // 優先対応リスト（すごく心配 or 心配で未完了）
  const priorityItems = items
    .filter(i => 
      (i.riskLevelBefore === 'very_worried' || i.riskLevelBefore === 'worried') &&
      i.status !== 'evaluated'
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">リスクアセスメント</h2>
          <p className="text-gray-600">危険有害要因の洗い出しと評価</p>
        </div>
        <button
          onClick={() => onNavigate('ra-new')}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          新規RA実施
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">洗い出し項目数</p>
              <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">すごく心配</p>
              <p className="text-3xl font-bold text-danger-600">{veryWorriedCount}</p>
            </div>
            <div className="p-3 bg-danger-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">直ちに対策が必要</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">措置実施済</p>
              <p className="text-3xl font-bold text-success-600">{implementedCount}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {totalItems > 0 ? Math.round((implementedCount / totalItems) * 100) : 0}% 完了
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">リスク低減</p>
              <p className="text-3xl font-bold text-primary-600">{reducedCount}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">レベル改善項目</p>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* リスクレベル分布 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">リスクレベル分布（低減前）</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskLevelBeforeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}件`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskLevelBeforeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.key as keyof typeof RISK_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded-full bg-danger-500" />
              <span>すごく心配</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded-full bg-warning-500" />
              <span>心配</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded-full bg-success-500" />
              <span>気になる</span>
            </div>
          </div>
        </div>

        {/* 事故の型別 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">事故の型別</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accidentTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="件数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* リスクマトリックス表示 */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">リスクマトリックス（PDF P15参照）</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2 bg-gray-50"></th>
                <th className="border border-gray-300 p-2 bg-gray-50 text-center">可能性 大</th>
                <th className="border border-gray-300 p-2 bg-gray-50 text-center">可能性 中</th>
                <th className="border border-gray-300 p-2 bg-gray-50 text-center">可能性 小</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-50 font-medium">重篤度 大</td>
                <td className="border border-gray-300 p-3 bg-danger-100 text-danger-800 text-center font-bold">
                  すごく心配
                </td>
                <td className="border border-gray-300 p-3 bg-warning-100 text-warning-800 text-center font-bold">
                  心配
                </td>
                <td className="border border-gray-300 p-3 bg-warning-100 text-warning-800 text-center font-bold">
                  心配
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-50 font-medium">重篤度 中</td>
                <td className="border border-gray-300 p-3 bg-warning-100 text-warning-800 text-center font-bold">
                  心配
                </td>
                <td className="border border-gray-300 p-3 bg-warning-100 text-warning-800 text-center font-bold">
                  心配
                </td>
                <td className="border border-gray-300 p-3 bg-success-100 text-success-800 text-center font-bold">
                  気になる
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2 bg-gray-50 font-medium">重篤度 小</td>
                <td className="border border-gray-300 p-3 bg-success-100 text-success-800 text-center font-bold">
                  気になる
                </td>
                <td className="border border-gray-300 p-3 bg-success-100 text-success-800 text-center font-bold">
                  気になる
                </td>
                <td className="border border-gray-300 p-3 bg-success-100 text-success-800 text-center font-bold">
                  気になる
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 優先対応リスト */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning-500" />
            優先対応リスト
          </h3>
          <button
            onClick={() => onNavigate('ra-list')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            すべて表示 →
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          リスクレベルが「すごく心配」「心配」で、まだ評価完了していない項目です。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">事故の型</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">作業/危険源</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">リスクレベル</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {priorityItems.map((item) => (
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-4 text-sm">
                    {ACCIDENT_TYPE_LABELS[item.accidentType]}
                  </td>
                  <td className="py-2 px-4 text-sm">
                    <div className="font-medium">{item.workName}</div>
                    <div className="text-gray-500 text-xs">{item.hazardSource}</div>
                  </td>
                  <td className="py-2 px-4 text-sm">
                    <span className={`badge ${
                      item.riskLevelBefore === 'very_worried' 
                        ? 'bg-danger-100 text-danger-800'
                        : 'bg-warning-100 text-warning-800'
                    }`}>
                      {RISK_LEVEL_LABELS[item.riskLevelBefore]}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-sm">
                    <span className={`badge ${
                      item.status === 'identified' ? 'bg-gray-100 text-gray-800' :
                      item.status === 'measuring' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {RA_STATUS_LABELS[item.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {priorityItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    優先対応が必要な項目はありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDCAガイド */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Shield className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h4 className="font-semibold text-primary-900">📋 RAはPDCAサイクルの「P（計画）」段階です</h4>
            <p className="text-primary-800 mt-1">
              リスクアセスメントで洗い出した危険有害要因を評価し、優先順位をつけて低減措置を計画します。
              この結果を「保安目標・保安計画」に反映させましょう。
            </p>
            <div className="mt-3 flex gap-2">
              <button 
                onClick={() => onNavigate('ra-list')}
                className="btn btn-secondary text-sm"
              >
                RA一覧を見る
              </button>
              <button 
                onClick={() => onNavigate('ra-new')}
                className="btn btn-primary text-sm"
              >
                新規RAを実施
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
