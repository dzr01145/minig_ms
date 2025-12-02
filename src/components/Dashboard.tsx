import React from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  FileText,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  HiyariHatReport,
  ACCIDENT_TYPE_LABELS,
  LOCATION_LABELS,
  SEVERITY_LABELS,
  AccidentType,
} from '../types';

interface DashboardProps {
  reports: HiyariHatReport[];
  onNavigate: (page: string) => void;
}

const COLORS: Record<AccidentType, string> = {
  fall: '#ef4444', // Red
  caught: '#f97316', // Orange
  flying: '#eab308', // Yellow
  trip: '#22c55e', // Green
  crash: '#06b6d4', // Cyan
  collapse: '#3b82f6', // Blue
  hit_by: '#6366f1', // Indigo
  cut_abrasion: '#8b5cf6', // Violet
  step_on: '#d946ef', // Fuchsia
  drown: '#f43f5e', // Rose
  contact_temp: '#f59e0b', // Amber
  contact_harmful: '#84cc16', // Lime
  electric_shock: '#10b981', // Emerald
  explosion: '#14b8a6', // Teal
  burst: '#0ea5e9', // Sky
  fire: '#ef4444', // Red (same as fall/danger)
  traffic_road: '#64748b', // Slate
  traffic_other: '#71717a', // Zinc
  reaction: '#a1a1aa', // Zinc light
  other: '#9ca3af', // Gray
  unclassifiable: '#d1d5db', // Gray light
};

const SEVERITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

export function Dashboard({ reports, onNavigate }: DashboardProps) {
  // 統計計算
  const totalReports = reports.length;
  const thisMonth = new Date().toISOString().substring(0, 7);
  const thisMonthReports = reports.filter(r => r.occurredAt.substring(0, 7) === thisMonth).length;

  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substring(0, 7);
  const lastMonthReports = reports.filter(r => r.occurredAt.substring(0, 7) === lastMonth).length;

  const monthChange = lastMonthReports > 0
    ? ((thisMonthReports - lastMonthReports) / lastMonthReports * 100).toFixed(1)
    : '0';

  const highSeverityCount = reports.filter(r => r.severityLevel === 'high').length;
  const reviewingCount = reports.filter(r => r.status === 'reviewing' || r.status === 'new').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved' || r.status === 'linked_to_ra').length;

  // 事故の型別集計
  const accidentTypeData = Object.entries(ACCIDENT_TYPE_LABELS).map(([key, label]) => ({
    name: label,
    value: reports.filter(r => r.accidentType === key).length,
    key,
  })).filter(d => d.value > 0);

  // 場所別集計
  const locationData = Object.entries(LOCATION_LABELS).map(([key, label]) => ({
    name: label,
    count: reports.filter(r => r.location === key).length,
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);

  // 月別推移
  const monthlyData = (() => {
    const months = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().substring(0, 7);
      months.set(key, 0);
    }
    reports.forEach(r => {
      const month = r.occurredAt.substring(0, 7);
      if (months.has(month)) {
        months.set(month, months.get(month)! + 1);
      }
    });
    return Array.from(months.entries()).map(([month, count]) => ({
      month: month.substring(5) + '月',
      count,
    }));
  })();

  // 重篤度別集計
  const severityData = Object.entries(SEVERITY_LABELS).map(([key, label]) => ({
    name: label.split('（')[0],
    value: reports.filter(r => r.severityLevel === key).length,
    key,
  }));

  // 最近の報告
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
          <p className="text-gray-600">ヒヤリハット報告の概況</p>
        </div>
        <button
          onClick={() => onNavigate('report')}
          className="btn btn-primary flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          新規報告
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総報告件数</p>
              <p className="text-3xl font-bold text-gray-900">{totalReports}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-gray-500">今月: {thisMonthReports}件</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">前月比</p>
              <p className="text-3xl font-bold text-gray-900">{thisMonthReports}件</p>
            </div>
            <div className={`p-3 rounded-lg ${Number(monthChange) >= 0 ? 'bg-warning-100' : 'bg-success-100'}`}>
              {Number(monthChange) >= 0 ? (
                <ArrowUp className={`w-6 h-6 ${Number(monthChange) >= 0 ? 'text-warning-600' : 'text-success-600'}`} />
              ) : (
                <ArrowDown className="w-6 h-6 text-success-600" />
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className={Number(monthChange) >= 0 ? 'text-warning-600' : 'text-success-600'}>
              {Number(monthChange) >= 0 ? '+' : ''}{monthChange}%
            </span>
            <span className="text-gray-500 ml-1">（前月: {lastMonthReports}件）</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">重大ヒヤリ</p>
              <p className="text-3xl font-bold text-danger-600">{highSeverityCount}</p>
            </div>
            <div className="p-3 bg-danger-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            要注意案件
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">対応状況</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-success-600">解決: {resolvedCount}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-warning-600">対応中: {reviewingCount}</span>
          </div>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 事故の型別 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">事故の型別分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accidentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {accidentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.key as AccidentType] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {Object.entries(ACCIDENT_TYPE_LABELS).slice(0, 4).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[key as AccidentType] }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 月別推移 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">月別推移（過去6ヶ月）</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                  name="件数"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 場所別 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">発生場所別（上位5箇所）</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="件数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 重篤度別 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">重篤度別分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}件`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.key as keyof typeof SEVERITY_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded-full bg-danger-500" />
              <span>重大</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded-full bg-warning-500" />
              <span>中程度</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded-full bg-success-500" />
              <span>軽微</span>
            </div>
          </div>
        </div>
      </div>

      {/* 最近の報告 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">最近の報告</h3>
          <button
            onClick={() => onNavigate('list')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            すべて表示 →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">日時</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">場所</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">事故の型</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">重篤度</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">
                    {new Date(report.occurredAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="py-3 px-4 text-sm">{LOCATION_LABELS[report.location]}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ color: COLORS[report.accidentType] }}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {ACCIDENT_TYPE_LABELS[report.accidentType]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`badge ${report.severityLevel === 'high' ? 'bg-danger-100 text-danger-800' :
                        report.severityLevel === 'medium' ? 'bg-warning-100 text-warning-800' :
                          'bg-success-100 text-success-800'
                      }`}>
                      {report.severityLevel === 'high' ? '重大' :
                        report.severityLevel === 'medium' ? '中程度' : '軽微'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`badge ${report.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                      }`}>
                      {report.status === 'new' ? '新規' :
                        report.status === 'reviewing' ? '対応中' :
                          report.status === 'resolved' ? '解決済' : 'RA連携'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AIアシスタントメッセージ */}
      {highSeverityCount > 0 && (
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h4 className="font-semibold text-primary-900">💬 AIアシスタント</h4>
              <p className="text-primary-800 mt-1">
                重大ヒヤリハットが{highSeverityCount}件報告されています。
                {accidentTypeData[0] && (
                  <>「{accidentTypeData[0].name}」が最も多く、</>
                )}
                早急な対策検討をお勧めします。
                リスクアセスメント（RA）への連携を検討してください。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
