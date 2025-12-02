import React, { useState, useMemo } from 'react';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Download,
  FileText,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  HiyariHatReport,
  ACCIDENT_TYPE_LABELS,
  LOCATION_LABELS,
  CAUSE_LABELS,
  AccidentType,
} from '../types';

interface AnalysisProps {
  reports: HiyariHatReport[];
}

const COLORS = {
  fall: '#ef4444',
  caught: '#f97316',
  flying: '#eab308',
  trip: '#22c55e',
  other: '#6b7280',
};

const CHART_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

export function Analysis({ reports }: AnalysisProps) {
  const [period, setPeriod] = useState<'all' | '6months' | '3months' | '1month'>('all');

  // 期間でフィルタリング
  const filteredReports = useMemo(() => {
    if (period === 'all') return reports;
    
    const now = new Date();
    const months = period === '6months' ? 6 : period === '3months' ? 3 : 1;
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
    
    return reports.filter(r => new Date(r.occurredAt) >= cutoff);
  }, [reports, period]);

  // 事故の型別トレンド（月別）
  const monthlyTrendData = useMemo(() => {
    const months = new Map<string, Record<string, number>>();
    const now = new Date();
    
    // 過去6ヶ月分の枠を作成
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().substring(0, 7);
      months.set(key, { fall: 0, caught: 0, flying: 0, trip: 0, other: 0 });
    }
    
    filteredReports.forEach(r => {
      const month = r.occurredAt.substring(0, 7);
      if (months.has(month)) {
        months.get(month)![r.accidentType]++;
      }
    });
    
    return Array.from(months.entries()).map(([month, data]) => ({
      month: month.substring(5) + '月',
      ...data,
    }));
  }, [filteredReports]);

  // 場所×事故の型クロス集計
  const locationAccidentCross = useMemo(() => {
    const cross = new Map<string, Record<string, number>>();
    
    filteredReports.forEach(r => {
      if (!cross.has(r.location)) {
        cross.set(r.location, { fall: 0, caught: 0, flying: 0, trip: 0, other: 0 });
      }
      cross.get(r.location)![r.accidentType]++;
    });
    
    return Array.from(cross.entries())
      .map(([location, data]) => ({
        location: LOCATION_LABELS[location as keyof typeof LOCATION_LABELS],
        ...data,
        total: Object.values(data).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredReports]);

  // 原因別分析
  const causeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredReports.forEach(r => {
      counts[r.cause] = (counts[r.cause] || 0) + 1;
    });
    return Object.entries(CAUSE_LABELS)
      .map(([key, label]) => ({
        name: label,
        value: counts[key] || 0,
      }))
      .filter(d => d.value > 0);
  }, [filteredReports]);

  // 曜日別分析
  const dayOfWeekData = useMemo(() => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const counts = days.map(() => 0);
    
    filteredReports.forEach(r => {
      const day = new Date(r.occurredAt).getDay();
      counts[day]++;
    });
    
    return days.map((name, i) => ({ name, count: counts[i] }));
  }, [filteredReports]);

  // 時間帯別分析
  const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0);
    
    filteredReports.forEach(r => {
      const hour = new Date(r.occurredAt).getHours();
      hours[hour]++;
    });
    
    return [
      { name: '6-9時', count: hours.slice(6, 9).reduce((a, b) => a + b, 0) },
      { name: '9-12時', count: hours.slice(9, 12).reduce((a, b) => a + b, 0) },
      { name: '12-15時', count: hours.slice(12, 15).reduce((a, b) => a + b, 0) },
      { name: '15-18時', count: hours.slice(15, 18).reduce((a, b) => a + b, 0) },
      { name: 'その他', count: hours.slice(0, 6).reduce((a, b) => a + b, 0) + hours.slice(18).reduce((a, b) => a + b, 0) },
    ];
  }, [filteredReports]);

  // レーダーチャート用データ（リスク評価）
  const riskRadarData = useMemo(() => {
    const accidentTypes = ['fall', 'caught', 'flying', 'trip'] as const;
    
    return accidentTypes.map(type => {
      const typeReports = filteredReports.filter(r => r.accidentType === type);
      const total = typeReports.length;
      const highSeverity = typeReports.filter(r => r.severityLevel === 'high').length;
      
      return {
        type: ACCIDENT_TYPE_LABELS[type],
        件数: total,
        重大率: total > 0 ? Math.round((highSeverity / total) * 100) : 0,
      };
    });
  }, [filteredReports]);

  // AI洞察の生成
  const aiInsights = useMemo(() => {
    const insights: string[] = [];
    
    // 最も多い事故の型
    const typeCounts = Object.entries(ACCIDENT_TYPE_LABELS).map(([key]) => ({
      type: key as AccidentType,
      count: filteredReports.filter(r => r.accidentType === key).length,
    })).sort((a, b) => b.count - a.count);
    
    if (typeCounts[0]?.count > 0) {
      insights.push(`「${ACCIDENT_TYPE_LABELS[typeCounts[0].type]}」が最も多く報告されています（${typeCounts[0].count}件）。重点的な対策を検討してください。`);
    }
    
    // 重大ヒヤリの傾向
    const highSeverityCount = filteredReports.filter(r => r.severityLevel === 'high').length;
    if (highSeverityCount > 0) {
      const highSeverityRate = ((highSeverityCount / filteredReports.length) * 100).toFixed(1);
      insights.push(`重大ヒヤリハットが${highSeverityCount}件（${highSeverityRate}%）報告されています。リスクアセスメント（RA）への連携を推奨します。`);
    }
    
    // 場所別の傾向
    const locationCounts = Object.entries(LOCATION_LABELS).map(([key]) => ({
      location: key,
      count: filteredReports.filter(r => r.location === key).length,
    })).sort((a, b) => b.count - a.count);
    
    if (locationCounts[0]?.count >= 3) {
      insights.push(`「${LOCATION_LABELS[locationCounts[0].location as keyof typeof LOCATION_LABELS]}」での発生が集中しています。現場環境の見直しを検討してください。`);
    }
    
    // 原因別の傾向
    const causeCounts = Object.entries(CAUSE_LABELS).map(([key]) => ({
      cause: key,
      count: filteredReports.filter(r => r.cause === key).length,
    })).sort((a, b) => b.count - a.count);
    
    if (causeCounts[0]?.count >= 2) {
      insights.push(`原因として「${CAUSE_LABELS[causeCounts[0].cause as keyof typeof CAUSE_LABELS]}」が多く見られます。根本原因の分析と対策が必要です。`);
    }
    
    return insights;
  }, [filteredReports]);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">分析</h2>
          <p className="text-gray-600">ヒヤリハット報告の傾向分析</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="select w-40"
          >
            <option value="all">全期間</option>
            <option value="6months">過去6ヶ月</option>
            <option value="3months">過去3ヶ月</option>
            <option value="1month">過去1ヶ月</option>
          </select>
          <button className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            レポート出力
          </button>
        </div>
      </div>

      {/* 集計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-600">分析対象期間</p>
          <p className="text-2xl font-bold">
            {period === 'all' ? '全期間' : 
             period === '6months' ? '過去6ヶ月' :
             period === '3months' ? '過去3ヶ月' : '過去1ヶ月'}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">対象件数</p>
          <p className="text-2xl font-bold">{filteredReports.length}件</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">重大ヒヤリ</p>
          <p className="text-2xl font-bold text-danger-600">
            {filteredReports.filter(r => r.severityLevel === 'high').length}件
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-600">RA連携済</p>
          <p className="text-2xl font-bold text-primary-600">
            {filteredReports.filter(r => r.status === 'linked_to_ra').length}件
          </p>
        </div>
      </div>

      {/* AI洞察 */}
      {aiInsights.length > 0 && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">💡 AI分析インサイト</h3>
              <ul className="mt-2 space-y-2">
                {aiInsights.map((insight, i) => (
                  <li key={i} className="text-blue-800 flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 月別トレンド */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">事故の型別 月別推移</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="fall" name="墜落転落" stackId="a" fill={COLORS.fall} />
                <Bar dataKey="caught" name="はさまれ" stackId="a" fill={COLORS.caught} />
                <Bar dataKey="flying" name="飛来落下" stackId="a" fill={COLORS.flying} />
                <Bar dataKey="trip" name="転倒" stackId="a" fill={COLORS.trip} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 場所×事故の型 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">場所別 事故の型（上位5箇所）</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationAccidentCross} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="location" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="fall" name="墜落転落" stackId="a" fill={COLORS.fall} />
                <Bar dataKey="caught" name="はさまれ" stackId="a" fill={COLORS.caught} />
                <Bar dataKey="flying" name="飛来落下" stackId="a" fill={COLORS.flying} />
                <Bar dataKey="trip" name="転倒" stackId="a" fill={COLORS.trip} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 原因別 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">原因カテゴリ別</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={causeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {causeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* リスクレーダーチャート */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">事故の型別 リスク評価</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="type" />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                <Radar name="件数" dataKey="件数" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="重大率(%)" dataKey="重大率" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 曜日別 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">曜日別発生傾向</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="件数" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 時間帯別 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">時間帯別発生傾向</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="件数" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RA連携推奨リスト */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning-500" />
          リスクアセスメント連携推奨案件
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          重大度が高く、まだRAに連携されていない案件です。PDCAサイクルのPlan（計画）段階で活用してください。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">発生日</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">場所</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">事故の型</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">概要</th>
                <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">重篤度</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports
                .filter(r => r.severityLevel === 'high' && r.status !== 'linked_to_ra')
                .slice(0, 5)
                .map((report) => (
                  <tr key={report.id} className="border-t border-gray-100">
                    <td className="py-2 px-4 text-sm">
                      {new Date(report.occurredAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-2 px-4 text-sm">{LOCATION_LABELS[report.location]}</td>
                    <td className="py-2 px-4 text-sm">{ACCIDENT_TYPE_LABELS[report.accidentType]}</td>
                    <td className="py-2 px-4 text-sm max-w-xs truncate">{report.description}</td>
                    <td className="py-2 px-4 text-sm">
                      <span className="badge bg-danger-100 text-danger-800">重大</span>
                    </td>
                  </tr>
                ))}
              {filteredReports.filter(r => r.severityLevel === 'high' && r.status !== 'linked_to_ra').length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    該当する案件はありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
