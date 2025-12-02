// AIログ保存サービス
// サーバーサイド（ローカルファイル）とクライアントサイド（IndexedDB）の両方に対応

export interface AILogEntry {
  id: string;
  timestamp: string;
  provider: 'gemini' | 'satellite';
  model: string;
  feature: string;
  input: {
    prompt: string;
    parameters?: Record<string, any>;
  };
  output: {
    response: string | null;
    parsed?: any;
    error?: string;
  };
  duration: number;
  success: boolean;
}

// ストレージモード
export type StorageMode = 'server' | 'browser' | 'both';

// 設定
const STORAGE_MODE_KEY = 'ai-log-storage-mode';
const SERVER_URL_KEY = 'ai-log-server-url';
const DEFAULT_SERVER_URL = 'http://localhost:3001';

// IndexedDB設定
const DB_NAME = 'ai-logs-db';
const DB_VERSION = 1;
const STORE_NAME = 'logs';

// ストレージモードを取得
export function getStorageMode(): StorageMode {
  return (localStorage.getItem(STORAGE_MODE_KEY) as StorageMode) || 'browser';
}

// ストレージモードを設定
export function setStorageMode(mode: StorageMode): void {
  localStorage.setItem(STORAGE_MODE_KEY, mode);
}

// サーバーURLを取得
export function getServerUrl(): string {
  return localStorage.getItem(SERVER_URL_KEY) || DEFAULT_SERVER_URL;
}

// サーバーURLを設定
export function setServerUrl(url: string): void {
  localStorage.setItem(SERVER_URL_KEY, url);
}

// サーバー接続テスト
export async function testServerConnection(url?: string): Promise<{ connected: boolean; message: string }> {
  const serverUrl = url || getServerUrl();
  try {
    const response = await fetch(`${serverUrl}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    if (response.ok) {
      const data = await response.json();
      return { connected: true, message: `サーバー接続成功: ${data.logFile}` };
    }
    return { connected: false, message: `サーバーエラー: ${response.status}` };
  } catch (error) {
    return { connected: false, message: `接続失敗: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// ========================================
// IndexedDB操作
// ========================================

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('provider', 'provider', { unique: false });
        store.createIndex('feature', 'feature', { unique: false });
        store.createIndex('success', 'success', { unique: false });
      }
    };
  });
}

async function getLogsFromIndexedDB(): Promise<AILogEntry[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      
      const logs: AILogEntry[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          logs.push(cursor.value);
          cursor.continue();
        } else {
          resolve(logs);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get logs from IndexedDB:', error);
    return [];
  }
}

async function saveLogToIndexedDB(entry: AILogEntry): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(entry);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to save log to IndexedDB:', error);
  }
}

async function deleteLogFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to delete log from IndexedDB:', error);
  }
}

async function clearIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to clear IndexedDB:', error);
  }
}

// ========================================
// サーバーAPI操作
// ========================================

async function getLogsFromServer(page = 1, pageSize = 50): Promise<{ logs: AILogEntry[]; total: number; hasMore: boolean }> {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/logs?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to get logs from server:', error);
    return { logs: [], total: 0, hasMore: false };
  }
}

async function saveLogToServer(entry: AILogEntry): Promise<boolean> {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to save log to server:', error);
    return false;
  }
}

async function deleteLogFromServer(id: string): Promise<boolean> {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/logs/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to delete log from server:', error);
    return false;
  }
}

async function clearServerLogs(): Promise<boolean> {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/logs`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to clear server logs:', error);
    return false;
  }
}

async function getServerStats(): Promise<{
  total: number;
  successCount: number;
  errorCount: number;
  byProvider: Record<string, number>;
  byFeature: Record<string, number>;
  fileSize: number;
  fileSizeFormatted: string;
} | null> {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/logs/stats`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to get server stats:', error);
    return null;
  }
}

// ========================================
// 統合API（モードに応じて動作）
// ========================================

// ログを取得（ページネーション対応）
export async function getLogsPaginated(
  page: number = 1,
  pageSize: number = 50
): Promise<{ logs: AILogEntry[]; total: number; hasMore: boolean }> {
  const mode = getStorageMode();
  
  if (mode === 'server' || mode === 'both') {
    const serverResult = await getLogsFromServer(page, pageSize);
    if (serverResult.logs.length > 0 || mode === 'server') {
      return serverResult;
    }
  }
  
  // ブラウザモードまたはサーバー接続失敗時のフォールバック
  const allLogs = await getLogsFromIndexedDB();
  const total = allLogs.length;
  const startIndex = (page - 1) * pageSize;
  const logs = allLogs.slice(startIndex, startIndex + pageSize);
  
  return {
    logs,
    total,
    hasMore: startIndex + pageSize < total
  };
}

// ログを保存
export async function saveLog(entry: AILogEntry): Promise<void> {
  const mode = getStorageMode();
  
  if (mode === 'server' || mode === 'both') {
    await saveLogToServer(entry);
  }
  
  if (mode === 'browser' || mode === 'both') {
    await saveLogToIndexedDB(entry);
  }
}

// ログを削除（単一）
export async function deleteLog(id: string): Promise<void> {
  const mode = getStorageMode();
  
  if (mode === 'server' || mode === 'both') {
    await deleteLogFromServer(id);
  }
  
  if (mode === 'browser' || mode === 'both') {
    await deleteLogFromIndexedDB(id);
  }
}

// 全ログを削除
export async function clearLogs(): Promise<void> {
  const mode = getStorageMode();
  
  if (mode === 'server' || mode === 'both') {
    await clearServerLogs();
  }
  
  if (mode === 'browser' || mode === 'both') {
    await clearIndexedDB();
  }
}

// 古いログを削除
export async function deleteOldLogs(keepCount: number): Promise<number> {
  const mode = getStorageMode();
  let deletedCount = 0;
  
  if (mode === 'server' || mode === 'both') {
    try {
      const serverUrl = getServerUrl();
      const response = await fetch(`${serverUrl}/api/logs/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keepCount })
      });
      if (response.ok) {
        const result = await response.json();
        deletedCount = result.deleted || 0;
      }
    } catch (error) {
      console.error('Failed to cleanup server logs:', error);
    }
  }
  
  if (mode === 'browser' || mode === 'both') {
    const logs = await getLogsFromIndexedDB();
    if (logs.length > keepCount) {
      const logsToDelete = logs.slice(keepCount);
      for (const log of logsToDelete) {
        await deleteLogFromIndexedDB(log.id);
      }
      deletedCount = Math.max(deletedCount, logsToDelete.length);
    }
  }
  
  return deletedCount;
}

// ログの統計情報を取得
export async function getLogStats(): Promise<{
  total: number;
  successCount: number;
  errorCount: number;
  byProvider: Record<string, number>;
  byFeature: Record<string, number>;
  totalSize: number;
  fileSize?: number;
  fileSizeFormatted?: string;
}> {
  const mode = getStorageMode();
  
  if (mode === 'server' || mode === 'both') {
    const serverStats = await getServerStats();
    if (serverStats) {
      return {
        ...serverStats,
        totalSize: serverStats.fileSize
      };
    }
  }
  
  // ブラウザモードまたはサーバー接続失敗時
  const logs = await getLogsFromIndexedDB();
  
  const stats = {
    total: logs.length,
    successCount: logs.filter(l => l.success).length,
    errorCount: logs.filter(l => !l.success).length,
    byProvider: {} as Record<string, number>,
    byFeature: {} as Record<string, number>,
    totalSize: 0
  };
  
  logs.forEach(log => {
    stats.byProvider[log.provider] = (stats.byProvider[log.provider] || 0) + 1;
    stats.byFeature[log.feature] = (stats.byFeature[log.feature] || 0) + 1;
    stats.totalSize += JSON.stringify(log).length;
  });
  
  return stats;
}

// ログをJSON形式でエクスポート
export async function exportLogsAsJSON(): Promise<string> {
  const mode = getStorageMode();
  
  if (mode === 'server' || mode === 'both') {
    try {
      const serverUrl = getServerUrl();
      const response = await fetch(`${serverUrl}/api/logs/export/json`);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.error('Failed to export from server:', error);
    }
  }
  
  const logs = await getLogsFromIndexedDB();
  return JSON.stringify(logs, null, 2);
}

// ログをCSV形式でエクスポート
export async function exportLogsAsCSV(): Promise<string> {
  const mode = getStorageMode();
  
  if (mode === 'server' || mode === 'both') {
    try {
      const serverUrl = getServerUrl();
      const response = await fetch(`${serverUrl}/api/logs/export/csv`);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.error('Failed to export from server:', error);
    }
  }
  
  const logs = await getLogsFromIndexedDB();
  
  const headers = [
    'ID',
    'タイムスタンプ',
    'プロバイダー',
    'モデル',
    '機能',
    '入力プロンプト',
    '出力',
    '処理時間(ms)',
    '成功'
  ];
  
  const rows = logs.map(log => [
    log.id,
    log.timestamp,
    log.provider,
    log.model,
    log.feature,
    `"${(log.input.prompt || '').replace(/"/g, '""')}"`,
    `"${(log.output.response || log.output.error || '').replace(/"/g, '""')}"`,
    log.duration.toString(),
    log.success ? 'true' : 'false'
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// ファイルとしてダウンロード
export async function downloadLogs(format: 'json' | 'csv'): Promise<void> {
  const content = format === 'json' ? await exportLogsAsJSON() : await exportLogsAsCSV();
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  const filename = `ai-logs-${new Date().toISOString().split('T')[0]}.${format}`;
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ストレージ使用量を取得
export async function getStorageUsage(): Promise<{ 
  used: number; 
  formatted: string;
  mode: StorageMode;
  serverConnected?: boolean;
}> {
  const mode = getStorageMode();
  const stats = await getLogStats();
  const used = stats.totalSize || stats.fileSize || 0;
  
  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };
  
  let serverConnected = false;
  if (mode === 'server' || mode === 'both') {
    const test = await testServerConnection();
    serverConnected = test.connected;
  }
  
  return {
    used,
    formatted: stats.fileSizeFormatted || formatBytes(used),
    mode,
    serverConnected
  };
}

// ログエントリを作成するヘルパー
export function createLogEntry(
  provider: 'gemini' | 'satellite',
  model: string,
  feature: string,
  prompt: string,
  parameters?: Record<string, any>
): Omit<AILogEntry, 'output' | 'duration' | 'success'> {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    provider,
    model,
    feature,
    input: {
      prompt,
      parameters
    }
  };
}

// 機能名のラベル
export const FEATURE_LABELS: Record<string, string> = {
  'improvement-suggestion': '改善提案',
  'hiyari-analysis': 'ヒヤリハット分析',
  'ra-measures': 'RA低減措置提案',
  'meeting-summary': '会議要約',
  'annual-plan': '年間計画提案',
  'general': '汎用テキスト生成'
};

// プロバイダー名のラベル
export const PROVIDER_LABELS: Record<string, string> = {
  'gemini': 'Google Gemini',
  'satellite': 'サテライトAI'
};

// ストレージモードのラベル
export const STORAGE_MODE_LABELS: Record<StorageMode, string> = {
  'server': 'サーバー保存（ローカルファイル）',
  'browser': 'ブラウザ保存（IndexedDB）',
  'both': '両方に保存'
};
