// サテライトAI 公式API統合サービス
// https://aiboard.sateraitoai.jp/api/public

// サテライトAI設定
const SATELLITE_API_BASE = 'https://aiboard.sateraitoai.jp/api/public';
const ACCESS_TOKEN_KEY = 'satellite-access-token';
const ACCESS_TOKEN_EXPIRES_KEY = 'satellite-access-token-expires';

// サテライトAI API設定の保存・取得
export function setSatelliteApiKey(apiKey: string): void {
  localStorage.setItem('satellite-api-key', apiKey);
}

export function getSatelliteApiKey(): string | null {
  return localStorage.getItem('satellite-api-key');
}

export function clearSatelliteApiKey(): void {
  localStorage.removeItem('satellite-api-key');
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_EXPIRES_KEY);
}

export function setSatelliteTenantId(tenantId: string): void {
  localStorage.setItem('satellite-tenant-id', tenantId);
}

export function getSatelliteTenantId(): string | null {
  return localStorage.getItem('satellite-tenant-id');
}

export function setSatelliteUserId(userId: string): void {
  localStorage.setItem('satellite-user-id', userId);
}

export function getSatelliteUserId(): string | null {
  return localStorage.getItem('satellite-user-id');
}

// アクセストークンの取得・管理
function getStoredAccessToken(): { token: string; expiresAt: number } | null {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const expiresAt = localStorage.getItem(ACCESS_TOKEN_EXPIRES_KEY);
  
  if (!token || !expiresAt) return null;
  
  const expiresAtNum = parseInt(expiresAt);
  if (Date.now() >= expiresAtNum) {
    // 期限切れ
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_KEY);
    return null;
  }
  
  return { token, expiresAt: expiresAtNum };
}

function storeAccessToken(token: string, expiresIn: number): void {
  const expiresAt = Date.now() + (expiresIn * 1000);
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(ACCESS_TOKEN_EXPIRES_KEY, expiresAt.toString());
}

// 詳細エラー情報型
export interface DetailedError {
  message: string;
  details: {
    status?: number;
    statusText?: string;
    responseBody?: any;
    errorCode?: string;
    errorMessage?: string;
    requestUrl?: string;
    requestBody?: any;
    timestamp: string;
  };
}

// エラーを詳細情報付きでスロー
function throwDetailedError(
  message: string,
  status?: number,
  statusText?: string,
  responseBody?: any,
  requestUrl?: string,
  requestBody?: any
): never {
  const error: DetailedError = {
    message,
    details: {
      status,
      statusText,
      responseBody,
      errorCode: responseBody?.error_code,
      errorMessage: responseBody?.error_msg,
      requestUrl,
      requestBody,
      timestamp: new Date().toISOString()
    }
  };
  
  console.error('🔴 サテライトAI API エラー詳細:', error);
  throw new Error(JSON.stringify(error, null, 2));
}

// 認証API
async function authenticate(): Promise<string> {
  const apiKey = getSatelliteApiKey();
  const userId = getSatelliteUserId();
  
  console.log('🔵 サテライトAI 認証開始:', {
    hasApiKey: !!apiKey,
    hasUserId: !!userId,
    apiKeyLength: apiKey?.length,
    userId: userId
  });
  
  if (!apiKey || !userId) {
    throwDetailedError(
      'サテライトAI APIキーまたはユーザーIDが設定されていません',
      undefined,
      undefined,
      { apiKey: !!apiKey, userId: !!userId }
    );
  }
  
  // 既存のトークンをチェック
  const stored = getStoredAccessToken();
  if (stored) {
    console.log('✅ 既存のアクセストークンを使用');
    return stored.token;
  }
  
  // 新しいトークンを取得
  const formData = new URLSearchParams();
  formData.append('api_key', apiKey);
  formData.append('user_id', userId);
  
  const requestUrl = `${SATELLITE_API_BASE}/auth`;
  console.log('🔵 認証リクエスト送信:', {
    url: requestUrl,
    userId: userId
  });
  
  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
  } catch (error) {
    console.error('🔴 ネットワークエラー:', error);
    throwDetailedError(
      `ネットワークエラー: ${error instanceof Error ? error.message : 'Unknown'}`,
      undefined,
      undefined,
      { networkError: error },
      requestUrl
    );
  }
  
  console.log('🔵 認証レスポンス:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });
  
  let responseBody: any;
  try {
    responseBody = await response.json();
    console.log('🔵 認証レスポンスボディ:', responseBody);
  } catch (error) {
    console.error('🔴 JSONパースエラー:', error);
    throwDetailedError(
      'レスポンスのJSONパースに失敗',
      response.status,
      response.statusText,
      { parseError: error },
      requestUrl
    );
  }
  
  if (!response.ok) {
    throwDetailedError(
      `認証エラー: HTTPステータス ${response.status}`,
      response.status,
      response.statusText,
      responseBody,
      requestUrl
    );
  }
  
  if (responseBody.code !== '0') {
    throwDetailedError(
      `認証エラー: ${responseBody.error_msg || responseBody.error_code || 'Unknown error'}`,
      response.status,
      response.statusText,
      responseBody,
      requestUrl
    );
  }
  
  console.log('✅ 認証成功: アクセストークン取得');
  storeAccessToken(responseBody.access_token, responseBody.expires_in);
  return responseBody.access_token;
}

// サテライトAI プラン定義
export interface SatelliteAIPlan {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
}

// 主要プラン（2025年8月新プラン体系）
export const SATELLITE_AI_PLANS: SatelliteAIPlan[] = [
  // OpenAI 通常モデル
  {
    id: '__openai_normal_medium_gen_1__',
    name: 'OpenAI 通常 通常プラン 最新版',
    description: 'GPT-5-mini - バランスの取れた性能',
    provider: 'OpenAI',
    model: 'GPT-5-mini'
  },
  {
    id: '__openai_normal_high_gen_1__',
    name: 'OpenAI 通常 高機能プラン 最新版',
    description: 'GPT-5.1 - 最高品質',
    provider: 'OpenAI',
    model: 'GPT-5.1'
  },
  // Google Gemini
  {
    id: '__geminiai_normal_high_gen_1__',
    name: 'Gemini 通常 高機能プラン 最新版',
    description: 'Gemini-2.5-Flash - 高速・高性能',
    provider: 'Google',
    model: 'Gemini-2.5-Flash'
  },
  {
    id: '__geminiai_thinking_high_gen_2__',
    name: 'Gemini 推論 高機能プラン 安定版',
    description: 'Gemini-2.5-Pro - 高度な推論',
    provider: 'Google',
    model: 'Gemini-2.5-Pro'
  },
  // Claude
  {
    id: '__claudeai_normal_medium_gen_1__',
    name: 'Claude 通常 通常プラン 最新版',
    description: 'Claude 4.5 Sonnet - 高品質な対話',
    provider: 'Anthropic',
    model: 'Claude 4.5 Sonnet'
  },
  {
    id: '__claudeai_normal_high_gen_1__',
    name: 'Claude 通常 高機能プラン 最新版',
    description: 'Claude 4.5 Opus - 最高品質',
    provider: 'Anthropic',
    model: 'Claude 4.5 Opus'
  },
  // Azure OpenAI
  {
    id: '__azureai_normal_medium_gen_1__',
    name: 'Azure OpenAI 通常 通常プラン 最新版',
    description: 'GPT-5-mini (Azure) - エンタープライズ',
    provider: 'Azure',
    model: 'GPT-5-mini'
  }
];

// ボード情報
export interface SatelliteBoard {
  board_id: string;
  board_name: string;
}

// ボード一覧取得
export async function listBoards(): Promise<SatelliteBoard[]> {
  const accessToken = await authenticate();
  const tenantId = getSatelliteTenantId();
  const userId = getSatelliteUserId();
  
  if (!tenantId || !userId) {
    throw new Error('テナントIDまたはユーザーIDが設定されていません');
  }
  
  const formData = new URLSearchParams();
  formData.append('tenant', tenantId);
  formData.append('user_id', userId);
  
  const response = await fetch(`${SATELLITE_API_BASE}/board/list`, {
    method: 'POST',
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });
  
  if (!response.ok) {
    throw new Error(`ボード一覧取得エラー: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.code !== '0') {
    throw new Error(`ボード一覧取得エラー: ${data.error_msg || data.error_code}`);
  }
  
  return data.data || [];
}

// ボード作成
export async function createBoard(boardName: string): Promise<string> {
  const accessToken = await authenticate();
  const tenantId = getSatelliteTenantId();
  const userId = getSatelliteUserId();
  
  if (!tenantId || !userId) {
    throw new Error('テナントIDまたはユーザーIDが設定されていません');
  }
  
  const formData = new URLSearchParams();
  formData.append('tenant', tenantId);
  formData.append('user_id', userId);
  formData.append('board_name', boardName);
  
  const response = await fetch(`${SATELLITE_API_BASE}/board/create`, {
    method: 'POST',
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });
  
  if (!response.ok) {
    throw new Error(`ボード作成エラー: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.code !== '0') {
    throw new Error(`ボード作成エラー: ${data.error_msg || data.error_code}`);
  }
  
  return data.board_id;
}

// 質問API
export interface SatelliteAskRequest {
  boardId?: string; // 省略時は新規ボード作成
  question: string;
  usePlan: string; // プランID
  language?: string;
  webSearchMode?: boolean;
  newConversation?: boolean;
}

export interface SatelliteAskResponse {
  board_id: string;
  message: string;
  json?: any;
  history_id: string;
  web_search_link?: string[];
  file_id?: string;
  response_time: number;
  reasoning_text?: string;
  additional_data?: any;
}

export async function ask(request: SatelliteAskRequest): Promise<SatelliteAskResponse> {
  console.log('🔵 サテライトAI 質問API開始:', {
    questionLength: request.question.length,
    usePlan: request.usePlan,
    hasBoardId: !!request.boardId
  });
  
  const accessToken = await authenticate();
  const tenantId = getSatelliteTenantId();
  const userId = getSatelliteUserId();
  
  if (!tenantId || !userId) {
    throwDetailedError(
      'テナントIDまたはユーザーIDが設定されていません',
      undefined,
      undefined,
      { tenantId: !!tenantId, userId: !!userId }
    );
  }
  
  const formData = new URLSearchParams();
  formData.append('tenant', tenantId);
  formData.append('user_id', userId);
  
  if (request.boardId) {
    formData.append('board_id', request.boardId);
  }
  
  formData.append('question', request.question);
  formData.append('use_plan', request.usePlan);
  
  if (request.language) {
    formData.append('language', request.language);
  }
  
  if (request.webSearchMode !== undefined) {
    formData.append('web_search_mode', request.webSearchMode ? 'True' : 'False');
  }
  
  if (request.newConversation !== undefined) {
    formData.append('new_conversation', request.newConversation ? 'True' : 'False');
  }
  
  const requestUrl = `${SATELLITE_API_BASE}/board/ask`;
  const requestBody = Object.fromEntries(formData.entries());
  
  console.log('🔵 質問リクエスト送信:', {
    url: requestUrl,
    tenantId,
    userId,
    usePlan: request.usePlan
  });
  
  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
  } catch (error) {
    console.error('🔴 ネットワークエラー:', error);
    throwDetailedError(
      `ネットワークエラー: ${error instanceof Error ? error.message : 'Unknown'}`,
      undefined,
      undefined,
      { networkError: error },
      requestUrl,
      requestBody
    );
  }
  
  console.log('🔵 質問レスポンス:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });
  
  let responseBody: any;
  try {
    responseBody = await response.json();
    console.log('🔵 質問レスポンスボディ:', responseBody);
  } catch (error) {
    console.error('🔴 JSONパースエラー:', error);
    throwDetailedError(
      'レスポンスのJSONパースに失敗',
      response.status,
      response.statusText,
      { parseError: error },
      requestUrl,
      requestBody
    );
  }
  
  if (!response.ok) {
    throwDetailedError(
      `質問エラー: HTTPステータス ${response.status}`,
      response.status,
      response.statusText,
      responseBody,
      requestUrl,
      requestBody
    );
  }
  
  if (responseBody.code !== '0') {
    throwDetailedError(
      `質問エラー: ${responseBody.error_msg || responseBody.error_code}`,
      response.status,
      response.statusText,
      responseBody,
      requestUrl,
      requestBody
    );
  }
  
  console.log('✅ 質問成功');
  return responseBody.data;
}

// 接続テスト
export async function testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  console.log('🔵 サテライトAI 接続テスト開始');
  console.log('🔵 設定情報:', {
    hasApiKey: !!getSatelliteApiKey(),
    hasTenantId: !!getSatelliteTenantId(),
    hasUserId: !!getSatelliteUserId(),
    apiKeyLength: getSatelliteApiKey()?.length,
    tenantId: getSatelliteTenantId(),
    userId: getSatelliteUserId()
  });
  
  try {
    const accessToken = await authenticate();
    console.log('✅ 接続テスト成功');
    return {
      success: true,
      message: `接続成功: アクセストークン取得済み (長さ: ${accessToken.length})`,
      details: {
        tokenLength: accessToken.length,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('🔴 接続テスト失敗:', error);
    
    let errorDetails: any = {};
    let errorMessage = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      try {
        // エラーメッセージがJSON形式の詳細エラーの場合はパース
        const parsed = JSON.parse(error.message);
        errorDetails = parsed.details || {};
        errorMessage = parsed.message || errorMessage;
      } catch {
        // JSON形式でない場合はそのまま使用
      }
    }
    
    return {
      success: false,
      message: `接続失敗: ${errorMessage}`,
      details: errorDetails
    };
  }
}

// ボードIDの取得・設定
const SATELLITE_BOARD_ID_KEY = 'satellite-board-id';

export function setSatelliteBoardId(boardId: string): void {
  localStorage.setItem(SATELLITE_BOARD_ID_KEY, boardId);
}

export function getSatelliteBoardId(): string | null {
  return localStorage.getItem(SATELLITE_BOARD_ID_KEY);
}

export function clearSatelliteBoardId(): void {
  localStorage.removeItem(SATELLITE_BOARD_ID_KEY);
}
