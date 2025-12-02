import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Trash2,
  Clock,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileJson,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Cloud,
  Server,
  ChevronLeft,
  ChevronRight,
  Database,
  BarChart3,
  Settings,
  HardDrive,
  Wifi,
  WifiOff
} from 'lucide-react';
import {
  getLogsPaginated,
  clearLogs,
  deleteLog,
  deleteOldLogs,
  downloadLogs,
  getLogStats,
  getStorageUsage,
  testServerConnection,
  getStorageMode,
  setStorageMode,
  getServerUrl,
  setServerUrl,
  AILogEntry,
  StorageMode,
  FEATURE_LABELS,
  PROVIDER_LABELS,
  STORAGE_MODE_LABELS
} from '../services/logService';

interface AILogViewerProps {
  onClose: () => void;
}

export function AILogViewer({ onClose }: AILogViewerProps) {
  const [logs, setLogs] = useState<AILogEntry[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterSuccess, setFilterSuccess] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState<{
    used: string;
    mode: StorageMode;
    serverConnected?: boolean;
  }>({ used: '', mode: 'browser' });
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    successCount: number;
    errorCount: number;
    byProvider: Record<string, number>;
    byFeature: Record<string, number>;
  } | null>(null);

  // 設定関連
  const [currentMode, setCurrentMode] = useState<StorageMode>(getStorageMode());
  const [serverUrlInput, setServerUrlInput] = useState(getServerUrl());
  const [serverStatus, setServerStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [currentPage]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const result = await getLogsPaginated(currentPage, pageSize);
      setLogs(result.logs);
      setTotalLogs(result.total);
      setHasMore(result.hasMore);
      
      const usage = await getStorageUsage();
      setStorageInfo({
        used: usage.formatted,
        mode: usage.mode,
        serverConnected: usage.serverConnected
      });
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getLogStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleClearAll = async () => {
    if (confirm('すべてのログを削除しますか？この操作は取り消せません。')) {
      await clearLogs();
      setCurrentPage(1);
      await loadLogs();
      await loadStats();
    }
  };

  const handleDeleteOld = async () => {
    const keepCount = prompt('保持する件数を入力してください（それ以外は削除されます）:', '100');
    if (keepCount) {
      const count = parseInt(keepCount);
      if (!isNaN(count) && count > 0) {
        const deleted = await deleteOldLogs(count);
        alert(`${deleted}件のログを削除しました`);
        setCurrentPage(1);
        await loadLogs();
        await loadStats();
      }
    }
  };

  const handleDeleteLog = async (id: string) => {
    await deleteLog(id);
    await loadLogs();
    await loadStats();
  };

  const handleDownload = async (format: 'json' | 'csv') => {
    await downloadLogs(format);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    const result = await testServerConnection(serverUrlInput);
    setServerStatus(result);
    setIsTesting(false);
  };

  const handleSaveSettings = () => {
    setStorageMode(currentMode);
    setServerUrl(serverUrlInput);
    setShowSettings(false);
    loadLogs();
    loadStats();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // クライアントサイドフィルタリング
  const filteredLogs = logs.filter(log => {
    if (filterProvider !== 'all' && log.provider !== filterProvider) return false;
    if (filterSuccess === 'success' && !log.success) return false;
    if (filterSuccess === 'error' && log.success) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesFeature = (FEATURE_LABELS[log.feature] || log.feature).toLowerCase().includes(query);
      const matchesModel = log.model.toLowerCase().includes(query);
      const matchesPrompt = log.input.prompt?.toLowerCase().includes(query);
      const matchesResponse = log.output.response?.toLowerCase().includes(query);
      if (!matchesFeature && !matchesModel && !matchesPrompt && !matchesResponse) return false;
    }
    
    return true;
  });

  const totalPages = Math.ceil(totalLogs / pageSize);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">AIログ履歴</h2>
              <p className="text-gray-300 text-sm flex items-center gap-2">
                {totalLogs.toLocaleString()}件のログ • {storageInfo.used}
                {storageInfo.mode === 'server' && (
                  storageInfo.serverConnected ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <Wifi className="w-3 h-3" /> サーバー
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400">
                      <WifiOff className="w-3 h-3" /> 切断
                    </span>
                  )
                )}
                {storageInfo.mode === 'browser' && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <HardDrive className="w-3 h-3" /> ブラウザ
                  </span>
                )}
                {storageInfo.mode === 'both' && (
                  <span className="flex items-center gap-1 text-purple-400">
                    <Database className="w-3 h-3" /> 両方
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-white/20' : 'hover:bg-white/10'}`}
              title="ストレージ設定"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-2 rounded-lg transition-colors ${showStats ? 'bg-white/20' : 'hover:bg-white/10'}`}
              title="統計情報"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 設定パネル */}
        {showSettings && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              ストレージ設定
            </h3>
            
            <div className="space-y-4">
              {/* ストレージモード選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">保存先</label>
                <div className="space-y-2">
                  {(['browser', 'server', 'both'] as StorageMode[]).map((mode) => (
                    <label key={mode} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="storageMode"
                        value={mode}
                        checked={currentMode === mode}
                        onChange={(e) => setCurrentMode(e.target.value as StorageMode)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{STORAGE_MODE_LABELS[mode]}</span>
                      {mode === 'browser' && <HardDrive className="w-4 h-4 text-gray-400" />}
                      {mode === 'server' && <Server className="w-4 h-4 text-gray-400" />}
                      {mode === 'both' && <Database className="w-4 h-4 text-gray-400" />}
                    </label>
                  ))}
                </div>
              </div>

              {/* サーバーURL設定 */}
              {(currentMode === 'server' || currentMode === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ログサーバーURL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={serverUrlInput}
                      onChange={(e) => setServerUrlInput(e.target.value)}
                      placeholder="http://localhost:3001"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isTesting ? '接続中...' : '接続テスト'}
                    </button>
                  </div>
                  {serverStatus && (
                    <div className={`mt-2 text-sm flex items-center gap-2 ${serverStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                      {serverStatus.connected ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {serverStatus.message}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    ※ サーバーモードを使用するには、ローカルPCで log-server.js を起動してください
                  </p>
                </div>
              )}

              {/* 保存ボタン */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  設定を保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 統計情報パネル */}
        {showStats && stats && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</div>
                <div className="text-sm text-gray-500">総ログ数</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{stats.successCount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">成功</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{stats.errorCount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">エラー</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{storageInfo.used}</div>
                <div className="text-sm text-gray-500">使用容量</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">プロバイダー別</div>
                <div className="space-y-1">
                  {Object.entries(stats.byProvider).map(([provider, count]) => (
                    <div key={provider} className="flex justify-between text-sm">
                      <span className="text-gray-600">{PROVIDER_LABELS[provider] || provider}</span>
                      <span className="font-medium">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">機能別</div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {Object.entries(stats.byFeature).map(([feature, count]) => (
                    <div key={feature} className="flex justify-between text-sm">
                      <span className="text-gray-600">{FEATURE_LABELS[feature] || feature}</span>
                      <span className="font-medium">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ツールバー */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索（機能名、モデル名、内容など）"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">すべてのプロバイダー</option>
              <option value="gemini">Google Gemini</option>
              <option value="satellite">サテライトAI</option>
            </select>

            <select
              value={filterSuccess}
              onChange={(e) => setFilterSuccess(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">すべてのステータス</option>
              <option value="success">成功のみ</option>
              <option value="error">エラーのみ</option>
            </select>

            <div className="flex-1" />

            <button
              onClick={loadLogs}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              更新
            </button>

            <button
              onClick={() => handleDownload('json')}
              disabled={totalLogs === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>

            <button
              onClick={() => handleDownload('csv')}
              disabled={totalLogs === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </button>

            <button
              onClick={handleDeleteOld}
              disabled={totalLogs === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-sm disabled:opacity-50"
              title="古いログを削除"
            >
              <Database className="w-4 h-4" />
              整理
            </button>

            <button
              onClick={handleClearAll}
              disabled={totalLogs === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              全削除
            </button>
          </div>
        </div>

        {/* ログ一覧 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <RefreshCw className="w-12 h-12 mx-auto mb-3 animate-spin opacity-50" />
              <p>読み込み中...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>ログがありません</p>
              <p className="text-sm mt-1">AI機能を使用するとログが記録されます</p>
            </div>
          ) : (
            filteredLogs.map(log => {
              const isExpanded = expandedId === log.id;
              return (
                <div
                  key={log.id}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    log.success ? 'border-gray-200' : 'border-red-200'
                  }`}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className={`w-full p-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      log.success ? '' : 'bg-red-50'
                    }`}
                  >
                    {log.success ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}

                    {log.provider === 'gemini' ? (
                      <Cloud className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    ) : (
                      <Server className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {FEATURE_LABELS[log.feature] || log.feature}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                          {log.model}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {truncateText(log.input.prompt, 80)}
                      </div>
                    </div>

                    <div className="text-right text-sm text-gray-500 flex-shrink-0">
                      <div>{formatDate(log.timestamp)}</div>
                      <div>{formatDuration(log.duration)}</div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">入力プロンプト</span>
                          <span className="text-xs text-gray-500">
                            ({log.input.prompt?.length.toLocaleString() || 0}文字)
                          </span>
                        </div>
                        <pre className="bg-white p-3 rounded border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto max-h-60">
                          {log.input.prompt}
                        </pre>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {log.success ? '出力結果' : 'エラー'}
                          </span>
                          {log.output.response && (
                            <span className="text-xs text-gray-500">
                              ({log.output.response.length.toLocaleString()}文字)
                            </span>
                          )}
                        </div>
                        <pre className={`p-3 rounded border text-sm whitespace-pre-wrap overflow-x-auto max-h-60 ${
                          log.success 
                            ? 'bg-white border-gray-200 text-gray-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                          {log.output.response || log.output.error || '(出力なし)'}
                        </pre>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          このログを削除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ページネーション */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {totalLogs > 0 ? (
              <>
                {((currentPage - 1) * pageSize + 1).toLocaleString()} - {Math.min(currentPage * pageSize, totalLogs).toLocaleString()} / {totalLogs.toLocaleString()}件
              </>
            ) : (
              '0件'
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-sm text-gray-600">
              {currentPage} / {Math.max(1, totalPages)}
            </span>

            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!hasMore || isLoading}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <span className="text-sm text-gray-500">
            {storageInfo.mode === 'server' && '※ サーバーに保存'}
            {storageInfo.mode === 'browser' && '※ ブラウザに保存'}
            {storageInfo.mode === 'both' && '※ 両方に保存'}
          </span>
        </div>
      </div>
    </div>
  );
}
