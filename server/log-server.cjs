/**
 * AIログ保存サーバー
 * ローカル環境でログをファイルに保存し、複数人で共有可能
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 設定
const PORT = process.env.LOG_SERVER_PORT || 3001;
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'ai-logs.json');
const MAX_LOG_SIZE = process.env.MAX_LOG_SIZE || 100 * 1024 * 1024; // 100MB

// ログディレクトリ作成
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ログファイル初期化
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, JSON.stringify({ logs: [], metadata: { created: new Date().toISOString(), version: 1 } }, null, 2));
}

// ログデータを読み込み
function readLogs() {
  try {
    const data = fs.readFileSync(LOG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read logs:', error);
    return { logs: [], metadata: { created: new Date().toISOString(), version: 1 } };
  }
}

// ログデータを書き込み
function writeLogs(data) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to write logs:', error);
    return false;
  }
}

// ログファイルをローテーション（サイズ超過時）
function rotateLogIfNeeded() {
  try {
    const stats = fs.statSync(LOG_FILE);
    if (stats.size > MAX_LOG_SIZE) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archivePath = path.join(LOG_DIR, `ai-logs-${timestamp}.json`);
      fs.renameSync(LOG_FILE, archivePath);
      fs.writeFileSync(LOG_FILE, JSON.stringify({ logs: [], metadata: { created: new Date().toISOString(), version: 1 } }, null, 2));
      console.log(`Log rotated to ${archivePath}`);
    }
  } catch (error) {
    console.error('Log rotation error:', error);
  }
}

// CORSヘッダーを設定
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// JSONレスポンスを送信
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// リクエストボディを取得
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// HTTPサーバー
const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);
  
  // プリフライトリクエスト
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  try {
    // ログ一覧取得（ページネーション対応）
    if (pathname === '/api/logs' && req.method === 'GET') {
      const page = parseInt(query.page) || 1;
      const pageSize = parseInt(query.pageSize) || 50;
      const provider = query.provider;
      const success = query.success;

      const data = readLogs();
      let logs = data.logs || [];

      // フィルタリング
      if (provider && provider !== 'all') {
        logs = logs.filter(log => log.provider === provider);
      }
      if (success === 'true') {
        logs = logs.filter(log => log.success === true);
      } else if (success === 'false') {
        logs = logs.filter(log => log.success === false);
      }

      // 新しい順にソート
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const total = logs.length;
      const startIndex = (page - 1) * pageSize;
      const paginatedLogs = logs.slice(startIndex, startIndex + pageSize);

      sendJson(res, 200, {
        logs: paginatedLogs,
        total,
        page,
        pageSize,
        hasMore: startIndex + pageSize < total
      });
      return;
    }

    // ログ追加
    if (pathname === '/api/logs' && req.method === 'POST') {
      rotateLogIfNeeded();
      
      const logEntry = await getRequestBody(req);
      
      if (!logEntry.id || !logEntry.timestamp) {
        sendJson(res, 400, { error: 'Invalid log entry: id and timestamp required' });
        return;
      }

      const data = readLogs();
      data.logs.push(logEntry);
      
      if (writeLogs(data)) {
        sendJson(res, 201, { success: true, id: logEntry.id });
      } else {
        sendJson(res, 500, { error: 'Failed to save log' });
      }
      return;
    }

    // ログ削除（単一）
    if (pathname.startsWith('/api/logs/') && req.method === 'DELETE') {
      const logId = pathname.split('/').pop();
      
      const data = readLogs();
      const initialLength = data.logs.length;
      data.logs = data.logs.filter(log => log.id !== logId);
      
      if (data.logs.length < initialLength) {
        writeLogs(data);
        sendJson(res, 200, { success: true, deleted: 1 });
      } else {
        sendJson(res, 404, { error: 'Log not found' });
      }
      return;
    }

    // 全ログ削除
    if (pathname === '/api/logs' && req.method === 'DELETE') {
      const data = { logs: [], metadata: { created: new Date().toISOString(), version: 1, cleared: new Date().toISOString() } };
      writeLogs(data);
      sendJson(res, 200, { success: true });
      return;
    }

    // 古いログ削除
    if (pathname === '/api/logs/cleanup' && req.method === 'POST') {
      const body = await getRequestBody(req);
      const keepCount = parseInt(body.keepCount) || 100;

      const data = readLogs();
      data.logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      const deletedCount = Math.max(0, data.logs.length - keepCount);
      data.logs = data.logs.slice(0, keepCount);
      
      writeLogs(data);
      sendJson(res, 200, { success: true, deleted: deletedCount });
      return;
    }

    // 統計情報取得
    if (pathname === '/api/logs/stats' && req.method === 'GET') {
      const data = readLogs();
      const logs = data.logs || [];

      const stats = {
        total: logs.length,
        successCount: logs.filter(l => l.success).length,
        errorCount: logs.filter(l => !l.success).length,
        byProvider: {},
        byFeature: {},
        fileSize: fs.statSync(LOG_FILE).size,
        fileSizeFormatted: formatBytes(fs.statSync(LOG_FILE).size)
      };

      logs.forEach(log => {
        stats.byProvider[log.provider] = (stats.byProvider[log.provider] || 0) + 1;
        stats.byFeature[log.feature] = (stats.byFeature[log.feature] || 0) + 1;
      });

      sendJson(res, 200, stats);
      return;
    }

    // エクスポート（JSON）
    if (pathname === '/api/logs/export/json' && req.method === 'GET') {
      const data = readLogs();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ai-logs-${new Date().toISOString().split('T')[0]}.json"`
      });
      res.end(JSON.stringify(data.logs, null, 2));
      return;
    }

    // エクスポート（CSV）
    if (pathname === '/api/logs/export/csv' && req.method === 'GET') {
      const data = readLogs();
      const logs = data.logs || [];

      const headers = ['ID', 'タイムスタンプ', 'プロバイダー', 'モデル', '機能', '入力プロンプト', '出力', '処理時間(ms)', '成功'];
      const rows = logs.map(log => [
        log.id,
        log.timestamp,
        log.provider,
        log.model,
        log.feature,
        `"${(log.input?.prompt || '').replace(/"/g, '""')}"`,
        `"${(log.output?.response || log.output?.error || '').replace(/"/g, '""')}"`,
        log.duration,
        log.success
      ]);

      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ai-logs-${new Date().toISOString().split('T')[0]}.csv"`
      });
      res.end('\uFEFF' + csv); // BOMを追加してExcel対応
      return;
    }

    // ヘルスチェック
    if (pathname === '/api/health' && req.method === 'GET') {
      sendJson(res, 200, { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        logFile: LOG_FILE,
        logDir: LOG_DIR
      });
      return;
    }

    // 404
    sendJson(res, 404, { error: 'Not found' });

  } catch (error) {
    console.error('Server error:', error);
    sendJson(res, 500, { error: error.message });
  }
});

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           AI Log Server Started                           ║
╠═══════════════════════════════════════════════════════════╣
║  URL:      http://localhost:${PORT}                         ║
║  Log Dir:  ${LOG_DIR.padEnd(43)}║
║  Log File: ${LOG_FILE.padEnd(43)}║
╚═══════════════════════════════════════════════════════════╝

API Endpoints:
  GET    /api/logs          - ログ一覧取得（?page=1&pageSize=50）
  POST   /api/logs          - ログ追加
  DELETE /api/logs/:id      - ログ削除（単一）
  DELETE /api/logs          - 全ログ削除
  POST   /api/logs/cleanup  - 古いログ削除（body: {keepCount: 100}）
  GET    /api/logs/stats    - 統計情報
  GET    /api/logs/export/json - JSONエクスポート
  GET    /api/logs/export/csv  - CSVエクスポート
  GET    /api/health        - ヘルスチェック
`);
});

// 終了処理
process.on('SIGINT', () => {
  console.log('\nShutting down log server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
