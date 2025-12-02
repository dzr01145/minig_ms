// AI API サービス - Gemini & サテライトAI 対応
// マルチモデル選択機能付き・ログ記録機能付き

import { saveLog, createLogEntry, AILogEntry } from './logService';

// AIプロバイダー定義
export type AIProvider = 'gemini' | 'satellite';

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  apiBase: string;
  models: AIModelConfig[];
  requiresKey: boolean;
}

export interface AIModelConfig {
  id: string;
  name: string;
  description: string;
  provider: AIProvider;
}

// サテライトAI設定（ローカル環境用）
const DEFAULT_SATELLITE_API_BASE = 'http://localhost:1234/v1'; // OpenAI互換デフォルト

// サテライトAIのエンドポイント設定
export function setSatelliteEndpoint(endpoint: string): void {
  localStorage.setItem('satellite-endpoint', endpoint);
}

export function getSatelliteEndpoint(): string {
  return localStorage.getItem('satellite-endpoint') || DEFAULT_SATELLITE_API_BASE;
}

// プロバイダー設定
export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    apiBase: 'https://generativelanguage.googleapis.com/v1beta/models',
    requiresKey: true,
    models: [
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: '最高品質の分析・推論能力',
        provider: 'gemini'
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: '高速・コスト効率',
        provider: 'gemini'
      },
      {
        id: 'gemini-3-pro-preview',
        name: 'Gemini 3 Pro Preview',
        description: '次世代プレビューモデル',
        provider: 'gemini'
      },
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash',
        description: '高速・高性能',
        provider: 'gemini'
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: '安定版・長文対応',
        provider: 'gemini'
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: '高速・コスト効率',
        provider: 'gemini'
      }
    ]
  },
  {
    id: 'satellite',
    name: 'サテライトAI（公式API）',
    apiBase: 'https://aiboard.sateraitoai.jp/api/public',
    requiresKey: true,
    models: [
      {
        id: '__geminiai_thinking_high_gen_2__',
        name: 'Gemini 2.5 Pro（推論）',
        description: 'Gemini-2.5-Pro - 高度な推論能力',
        provider: 'satellite'
      },
      {
        id: '__geminiai_normal_high_gen_1__',
        name: 'Gemini 2.5 Flash（高速）',
        description: 'Gemini-2.5-Flash - 高速・高性能',
        provider: 'satellite'
      },
      {
        id: '__openai_normal_high_gen_1__',
        name: 'GPT-5.1（最新）',
        description: 'GPT-5.1 - OpenAI 最高品質',
        provider: 'satellite'
      },
      {
        id: '__openai_normal_medium_gen_1__',
        name: 'GPT-5-mini（通常）',
        description: 'GPT-5-mini - バランス型',
        provider: 'satellite'
      },
      {
        id: '__claudeai_normal_high_gen_1__',
        name: 'Claude 4.5 Opus',
        description: 'Claude 4.5 Opus - 最高品質',
        provider: 'satellite'
      },
      {
        id: '__claudeai_normal_medium_gen_1__',
        name: 'Claude 4.5 Sonnet',
        description: 'Claude 4.5 Sonnet - 高品質な対話',
        provider: 'satellite'
      },
      {
        id: '__azureai_normal_medium_gen_1__',
        name: 'Azure GPT-5-mini',
        description: 'Azure OpenAI - エンタープライズ',
        provider: 'satellite'
      }
    ]
  }
];

// 設定の保存・取得
export function setApiKey(provider: AIProvider, apiKey: string): void {
  localStorage.setItem(`ai-api-key-${provider}`, apiKey);
}

export function getApiKey(provider: AIProvider = 'gemini'): string | null {
  return localStorage.getItem(`ai-api-key-${provider}`);
}

export function clearApiKey(provider: AIProvider): void {
  localStorage.removeItem(`ai-api-key-${provider}`);
}

export function setSelectedModel(modelId: string): void {
  localStorage.setItem('ai-selected-model', modelId);
}

export function getSelectedModel(): string | null {
  return localStorage.getItem('ai-selected-model');
}

export function getModelConfig(modelId: string): AIModelConfig | undefined {
  for (const provider of AI_PROVIDERS) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) return model;
  }
  return undefined;
}

export function getProviderConfig(provider: AIProvider): AIProviderConfig | undefined {
  return AI_PROVIDERS.find(p => p.id === provider);
}

// APIキーの有効性チェック（Gemini用）
async function validateGeminiApiKey(apiKey: string, modelId: string): Promise<boolean> {
  try {
    const provider = getProviderConfig('gemini');
    if (!provider) return false;

    const response = await fetch(
      `${provider.apiBase}/${modelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      }
    );
    return response.ok;
  } catch (error) {
    console.error('Gemini API key validation failed:', error);
    return false;
  }
}

// サテライトAI接続チェック
async function validateSatelliteConnection(apiKey?: string): Promise<boolean> {
  try {
    const endpoint = getSatelliteEndpoint();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    const response = await fetch(`${endpoint}/models`, {
      method: 'GET',
      headers
    });
    return response.ok;
  } catch (error) {
    console.error('Satellite AI connection failed:', error);
    return false;
  }
}

// 統合バリデーション
export async function validateApiKey(provider: AIProvider, apiKey: string, modelId?: string): Promise<boolean> {
  if (provider === 'gemini') {
    const model = modelId || 'gemini-2.5-pro-preview-05-06';
    return validateGeminiApiKey(apiKey, model);
  } else if (provider === 'satellite') {
    return validateSatelliteConnection(apiKey);
  }
  return false;
}

// Gemini API呼び出し
async function callGeminiAPI(prompt: string, modelId: string, apiKey: string): Promise<string | null> {
  const provider = getProviderConfig('gemini');
  if (!provider) return null;

  try {
    const response = await fetch(
      `${provider.apiBase}/${modelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(errorData.error?.message || 'API call failed');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Failed to call Gemini API:', error);
    throw error;
  }
}

// サテライトAI API呼び出し（公式API使用）
async function callSatelliteAPI(prompt: string, modelId: string): Promise<string | null> {
  try {
    // サテライトAI公式APIサービスをインポート
    const { ask, getSatelliteBoardId, SATELLITE_AI_PLANS } = await import('./satelliteAiService');

    // モデルIDに対応するプランを検索
    const plan = SATELLITE_AI_PLANS.find(p => p.id === modelId || p.model.includes(modelId));
    const usePlan = plan?.id || '__geminiai_normal_high_gen_1__'; // デフォルト

    // 既存のボードIDを取得（なければ新規作成される）
    const boardId = getSatelliteBoardId() || undefined;

    // 質問を実行
    const result = await ask({
      boardId,
      question: prompt,
      usePlan,
      language: '日本語',
      newConversation: false
    });

    // ボードIDを保存
    if (result.board_id) {
      const { setSatelliteBoardId } = await import('./satelliteAiService');
      setSatelliteBoardId(result.board_id);
    }

    return result.message || null;
  } catch (error) {
    console.error('Failed to call Satellite AI:', error);
    throw error;
  }
}

// 現在のリクエストの機能名を保持（ログ用）
let currentFeature = 'general';

export function setCurrentFeature(feature: string): void {
  currentFeature = feature;
}

// 統合API呼び出し（ログ記録付き）
async function callAI(prompt: string): Promise<string | null> {
  const selectedModelId = getSelectedModel();
  if (!selectedModelId) {
    throw new Error('モデルが選択されていません');
  }

  const model = getModelConfig(selectedModelId);
  if (!model) {
    throw new Error('選択されたモデルが見つかりません');
  }

  // ログエントリの基本情報を作成
  const logEntry = createLogEntry(
    model.provider,
    model.id,
    currentFeature,
    prompt
  );

  const startTime = Date.now();
  let response: string | null = null;
  let error: string | undefined;

  try {
    if (model.provider === 'gemini') {
      const apiKey = getApiKey('gemini');
      if (!apiKey) {
        throw new Error('Gemini APIキーが設定されていません');
      }
      response = await callGeminiAPI(prompt, model.id, apiKey);
    } else if (model.provider === 'satellite') {
      response = await callSatelliteAPI(prompt, model.id);
    } else {
      throw new Error('サポートされていないプロバイダーです');
    }

    // 成功ログを保存
    const fullLog: AILogEntry = {
      ...logEntry,
      output: {
        response,
      },
      duration: Date.now() - startTime,
      success: true
    };
    saveLog(fullLog);

    return response;
  } catch (err: any) {
    error = err.message || 'Unknown error';

    // エラーログを保存
    const fullLog: AILogEntry = {
      ...logEntry,
      output: {
        response: null,
        error
      },
      duration: Date.now() - startTime,
      success: false
    };
    saveLog(fullLog);

    throw err;
  }
}

// JSONをパースするヘルパー
function parseJSONResponse<T>(text: string): T | null {
  try {
    // マークダウンのコードブロックを除去
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // 前後の空白を除去
    jsonStr = jsonStr.trim();

    // JSONとしてパース
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse JSON response:', error, text);

    // フォールバック: 最初の中括弧から最後の中括弧までを抽出して試行
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        const extracted = text.substring(start, end + 1);
        return JSON.parse(extracted);
      }
    } catch (retryError) {
      console.error('Retry parsing failed:', retryError);
    }

    return null;
  }
}

// ヒヤリハット分析
export interface HiyariAnalysis {
  accidentType: string;
  severity: 'high' | 'medium' | 'low';
  causes: string[];
  preventiveMeasures: string[];
  riskAssessmentNeeded: boolean;
  summary: string;
}

export async function analyzeHiyari(
  description: string,
  location?: string,
  workProcess?: string
): Promise<HiyariAnalysis | null> {
  setCurrentFeature('hiyari-analysis');
  const prompt = `あなたは鉱山保安の専門家です。以下のヒヤリハット報告を分析してください。

【報告内容】
${description}
${location ? `【発生場所】${location}` : ''}
${workProcess ? `【作業工程】${workProcess}` : ''}

以下のJSON形式で回答してください：
\`\`\`json
{
  "accidentType": "事故の型（可能な限り「その他」は避け、以下のリストから最も近いものを選択してください：墜落、転落/はさまれ、巻き込まれ/飛来、落下/転倒/激突/崩壊、倒壊/激突され/切れ、こすれ/踏み抜き/おぼれ/高温・低温の物との接触/有害物等との接触/感電/爆発/破裂/火災/交通事故（道路）/交通事故（その他）/動作の反動、無理な動作/その他/分類不能）",
  "severity": "重篤度（high/medium/low）",
  "causes": ["原因1", "原因2"],
  "preventiveMeasures": ["防止措置1", "防止措置2"],
  "riskAssessmentNeeded": true または false,
  "summary": "分析要約（100字程度）"
}
\`\`\``;

  try {
    const response = await callAI(prompt);
    if (!response) return null;
    return parseJSONResponse<HiyariAnalysis>(response);
  } catch (error) {
    console.error('Failed to analyze hiyari:', error);
    return null;
  }
}

// リスク低減措置提案
export interface RAMeasureSuggestion {
  measures: Array<{
    priority: 'essential' | 'engineering' | 'management' | 'ppe';
    description: string;
    expectedEffect: string;
    implementationDifficulty: 'easy' | 'medium' | 'hard';
  }>;
  residualRisk: string;
  additionalRecommendations: string[];
}

export async function suggestRAMeasures(
  hazardSource: string,
  hazardDescription: string,
  accidentType: string,
  currentMeasures?: string
): Promise<RAMeasureSuggestion | null> {
  setCurrentFeature('ra-measures');
  const prompt = `あなたは鉱山保安のリスクアセスメント専門家です。以下の危険要因に対するリスク低減措置を提案してください。

【危険有害要因】${hazardSource}
【詳細】${hazardDescription}
【事故の型】${accidentType}
${currentMeasures ? `【現在の対策】${currentMeasures}` : ''}

リスク低減措置は以下の優先順位で検討してください：
1. 本質安全化（危険源の除去・代替）
2. 工学的対策（安全装置、防護柵など）
3. 管理的対策（作業手順、教育訓練など）
4. 個人用保護具（PPE）

以下のJSON形式で回答してください：
\`\`\`json
{
  "measures": [
    {
      "priority": "essential/engineering/management/ppe",
      "description": "対策内容",
      "expectedEffect": "期待効果",
      "implementationDifficulty": "easy/medium/hard"
    }
  ],
  "residualRisk": "残留リスクの説明",
  "additionalRecommendations": ["追加推奨事項1", "追加推奨事項2"]
}
\`\`\``;

  try {
    const response = await callAI(prompt);
    if (!response) return null;
    return parseJSONResponse<RAMeasureSuggestion>(response);
  } catch (error) {
    console.error('Failed to suggest measures:', error);
    return null;
  }
}

// 会議要約
export interface MeetingSummary {
  summary: string;
  keyPoints: string[];
  improvementSuggestions: string[];
  followUpItems: string[];
}

export async function summarizeMeeting(
  agendaItems: Array<{ title: string; content?: string; result?: string }>,
  decisions: string[],
  actionItems: Array<{ task: string; assignee: string; dueDate: string }>
): Promise<MeetingSummary | null> {
  setCurrentFeature('meeting-summary');
  const prompt = `あなたは鉱山保安会議の議事録作成支援者です。以下の会議内容を要約してください。

【議題】
${agendaItems.map((item, i) => `${i + 1}. ${item.title}${item.content ? `\n   内容: ${item.content}` : ''}${item.result ? `\n   結果: ${item.result}` : ''}`).join('\n')}

【決定事項】
${decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

【アクションアイテム】
${actionItems.map((item, i) => `${i + 1}. ${item.task}（担当: ${item.assignee}、期限: ${item.dueDate}）`).join('\n')}

以下のJSON形式で回答してください：
\`\`\`json
{
  "summary": "会議の要約（200字程度）",
  "keyPoints": ["重要ポイント1", "重要ポイント2"],
  "improvementSuggestions": ["改善提案1", "改善提案2"],
  "followUpItems": ["フォローアップ事項1", "フォローアップ事項2"]
}
\`\`\``;

  try {
    const response = await callAI(prompt);
    if (!response) return null;
    return parseJSONResponse<MeetingSummary>(response);
  } catch (error) {
    console.error('Failed to summarize meeting:', error);
    return null;
  }
}

// 改善提案
export interface ImprovementSuggestion {
  overallAssessment: string;
  priorityAreas: string[];
  actionPlan: Array<{
    category: string;
    action: string;
    timeline: string;
    expectedOutcome: string;
  }>;
  longTermRecommendations: string[];
}

export async function suggestImprovements(
  diagnosisResults: Array<{ category: string; itemId: string; question: string; evaluation: number; comment?: string }>,
  categoryScores: Record<string, { rate: number; score: number; total: number }>
): Promise<ImprovementSuggestion | null> {
  setCurrentFeature('improvement-suggestion');
  const categoryLabels: Record<string, string> = {
    policy: '方針・目標',
    plan: '計画（Plan）',
    do: '実施（Do）',
    check: '評価（Check）',
    act: '改善（Act）'
  };

  const prompt = `あなたは鉱山保安マネジメントシステム（MS）の専門家です。以下の自己診断結果に基づいて改善提案を行ってください。

【カテゴリ別スコア】
${Object.entries(categoryScores).map(([cat, score]) =>
    `・${categoryLabels[cat] || cat}: ${score.rate}%（${score.score}/${score.total}点）`
  ).join('\n')}

【診断結果詳細】
${diagnosisResults.map(r =>
    `・[${categoryLabels[r.category] || r.category}] ${r.question}: ${r.evaluation}/3点${r.comment ? ` (${r.comment})` : ''}`
  ).join('\n')}

PDCAサイクルの観点から、中小規模鉱山の保安担当者が実施可能な具体的な改善策を提案してください。

以下のJSON形式で回答してください：
\`\`\`json
{
  "overallAssessment": "全体評価（200字程度）",
  "priorityAreas": ["優先改善領域1", "優先改善領域2"],
  "actionPlan": [
    {
      "category": "カテゴリ名",
      "action": "具体的なアクション",
      "timeline": "実施時期（例：1ヶ月以内）",
      "expectedOutcome": "期待される成果"
    }
  ],
  "longTermRecommendations": ["長期的な推奨事項1", "長期的な推奨事項2"]
}
\`\`\``;

  try {
    const response = await callAI(prompt);
    if (!response) return null;
    return parseJSONResponse<ImprovementSuggestion>(response);
  } catch (error) {
    console.error('Failed to suggest improvements:', error);
    return null;
  }
}

// 年間計画提案
export interface AnnualPlanSuggestion {
  suggestedGoals: string[];
  planItems: Array<{
    title: string;
    description: string;
    expectedEffect: string;
    targetValue: string;
    suggestedMonths: number[];
  }>;
  kpis: string[];
  risks: string[];
}

export async function suggestAnnualPlan(
  category: string,
  currentGoals?: string,
  previousYearReview?: string
): Promise<AnnualPlanSuggestion | null> {
  setCurrentFeature('annual-plan');
  const categoryLabels: Record<string, string> = {
    ra: 'リスクアセスメント',
    meeting: '会議・打合せ',
    equipment: '設備・保守',
    activity: '保安活動',
    education: '教育・訓練',
    other: 'その他'
  };

  const prompt = `あなたは鉱山保安の年間計画策定の専門家です。以下のカテゴリの年間計画を提案してください。

【カテゴリ】${categoryLabels[category] || category}
${currentGoals ? `【現在の目標】${currentGoals}` : ''}
${previousYearReview ? `【前年度の振り返り】${previousYearReview}` : ''}

中小規模鉱山の実情を考慮し、実現可能な計画を提案してください。

以下のJSON形式で回答してください：
\`\`\`json
{
  "suggestedGoals": ["推奨目標1", "推奨目標2"],
  "planItems": [
    {
      "title": "計画項目名",
      "description": "詳細説明",
      "expectedEffect": "期待効果",
      "targetValue": "目標値（例：年2回実施）",
      "suggestedMonths": [4, 10]
    }
  ],
  "kpis": ["KPI1", "KPI2"],
  "risks": ["リスク・注意点1", "リスク・注意点2"]
}
\`\`\``;

  try {
    const response = await callAI(prompt);
    if (!response) return null;
    return parseJSONResponse<AnnualPlanSuggestion>(response);
  } catch (error) {
    console.error('Failed to suggest annual plan:', error);
    return null;
  }
}

// 汎用的なテキスト生成
export async function generateText(prompt: string, feature: string = 'general'): Promise<string | null> {
  setCurrentFeature(feature);
  return callAI(prompt);
}

// 後方互換性のための関数
export async function initializeGeminiServer(apiKey: string): Promise<boolean> {
  const isValid = await validateApiKey('gemini', apiKey);
  if (isValid) {
    setApiKey('gemini', apiKey);
  }
  return isValid;
}

export async function checkApiStatus(): Promise<{ initialized: boolean; hasApiKey: boolean }> {
  const selectedModelId = getSelectedModel();
  if (!selectedModelId) {
    return { initialized: false, hasApiKey: false };
  }

  const model = getModelConfig(selectedModelId);
  if (!model) {
    return { initialized: false, hasApiKey: false };
  }

  if (model.provider === 'gemini') {
    const apiKey = getApiKey('gemini');
    if (!apiKey) {
      return { initialized: false, hasApiKey: false };
    }
    const isValid = await validateApiKey('gemini', apiKey, model.id);
    return { initialized: isValid, hasApiKey: true };
  } else if (model.provider === 'satellite') {
    const isValid = await validateSatelliteConnection();
    return { initialized: isValid, hasApiKey: true };
  }

  return { initialized: false, hasApiKey: false };
}
