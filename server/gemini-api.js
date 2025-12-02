import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

// APIキーは環境変数から取得
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

let genAI = null;
let model = null;

// 初期化
function initializeGemini(apiKey) {
  if (!apiKey) {
    console.warn('Gemini API key not set');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-preview-06-05' });
    console.log('Gemini API initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    return false;
  }
}

// APIキー設定エンドポイント
app.post('/api/set-api-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }
  const success = initializeGemini(apiKey);
  if (success) {
    res.json({ success: true, message: 'API key set successfully' });
  } else {
    res.status(500).json({ error: 'Failed to initialize Gemini API' });
  }
});

// API状態確認
app.get('/api/status', (req, res) => {
  res.json({ 
    initialized: !!model,
    hasApiKey: !!GEMINI_API_KEY || !!model
  });
});

// ヒヤリハット分析
app.post('/api/analyze-hiyari', async (req, res) => {
  if (!model) {
    return res.status(400).json({ error: 'Gemini API not initialized. Please set API key first.' });
  }
  
  try {
    const { description, location, workProcess } = req.body;
    
    const prompt = `あなたは鉱山保安の専門家です。以下のヒヤリハット報告を分析してください。

【報告内容】
場所: ${location || '未指定'}
作業工程: ${workProcess || '未指定'}
状況: ${description}

以下の形式でJSON形式で回答してください：
{
  "accidentType": "墜落・転落" | "はさまれ・巻き込まれ" | "飛来・落下" | "転倒" | "激突" | "切れ・こすれ" | "その他",
  "severity": "high" | "medium" | "low",
  "causes": ["原因1", "原因2", ...],
  "preventiveMeasures": ["対策1", "対策2", ...],
  "riskAssessmentNeeded": true | false,
  "summary": "分析の要約"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      res.json(analysis);
    } else {
      res.json({ raw: text });
    }
  } catch (error) {
    console.error('Error analyzing hiyari:', error);
    res.status(500).json({ error: error.message });
  }
});

// リスクアセスメント提案
app.post('/api/suggest-ra-measures', async (req, res) => {
  if (!model) {
    return res.status(400).json({ error: 'Gemini API not initialized' });
  }
  
  try {
    const { hazardSource, hazardDescription, accidentType, currentMeasures } = req.body;
    
    const prompt = `あなたは鉱山保安のリスクアセスメント専門家です。以下の危険有害要因に対するリスク低減措置を提案してください。

【危険有害要因】
事故の型: ${accidentType}
危険源: ${hazardSource}
想定される災害: ${hazardDescription}
${currentMeasures ? `現在の対策: ${currentMeasures}` : ''}

以下の優先順位で対策を提案してください：
1. 本質安全対策（危険源の除去・代替）
2. 工学的対策（防護装置、安全装置）
3. 管理的対策（作業手順、教育訓練）
4. 個人用保護具（PPE）

JSON形式で回答してください：
{
  "measures": [
    {
      "priority": "essential" | "engineering" | "management" | "ppe",
      "description": "対策内容",
      "expectedEffect": "期待される効果",
      "implementationDifficulty": "easy" | "medium" | "hard"
    }
  ],
  "residualRisk": "残留リスクの説明",
  "additionalRecommendations": ["追加の推奨事項"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.json({ raw: text });
    }
  } catch (error) {
    console.error('Error suggesting measures:', error);
    res.status(500).json({ error: error.message });
  }
});

// 会議要約生成
app.post('/api/summarize-meeting', async (req, res) => {
  if (!model) {
    return res.status(400).json({ error: 'Gemini API not initialized' });
  }
  
  try {
    const { agendaItems, decisions, actionItems } = req.body;
    
    const prompt = `あなたは鉱山保安会議の議事録作成者です。以下の会議内容を要約してください。

【議題】
${agendaItems.map((a, i) => `${i + 1}. ${a.title}: ${a.content || a.result || ''}`).join('\n')}

【決定事項】
${decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

【アクションアイテム】
${actionItems.map((a, i) => `${i + 1}. ${a.task} (担当: ${a.assignee}, 期限: ${a.dueDate})`).join('\n')}

以下のJSON形式で回答してください：
{
  "summary": "会議の要約（100-200字程度）",
  "keyPoints": ["重要ポイント1", "重要ポイント2", ...],
  "improvementSuggestions": ["改善提案1", "改善提案2", ...],
  "followUpItems": ["フォローアップ事項1", ...]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.json({ raw: text });
    }
  } catch (error) {
    console.error('Error summarizing meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

// 自己診断改善提案
app.post('/api/suggest-improvements', async (req, res) => {
  if (!model) {
    return res.status(400).json({ error: 'Gemini API not initialized' });
  }
  
  try {
    const { diagnosisResults, categoryScores } = req.body;
    
    const prompt = `あなたは鉱山保安マネジメントシステムのコンサルタントです。以下の自己診断結果に基づいて改善提案を行ってください。

【カテゴリ別スコア】
${Object.entries(categoryScores).map(([cat, score]) => `${cat}: ${score.rate}%`).join('\n')}

【低スコア項目の詳細】
${diagnosisResults.filter(r => r.evaluation <= 1).map(r => `- ${r.itemId}: 評価${r.evaluation} ${r.comment || ''}`).join('\n')}

以下のJSON形式で回答してください：
{
  "overallAssessment": "全体評価",
  "priorityAreas": ["優先改善領域1", "優先改善領域2"],
  "actionPlan": [
    {
      "category": "カテゴリ",
      "action": "改善アクション",
      "timeline": "実施時期",
      "expectedOutcome": "期待される効果"
    }
  ],
  "longTermRecommendations": ["中長期的な推奨事項"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.json({ raw: text });
    }
  } catch (error) {
    console.error('Error suggesting improvements:', error);
    res.status(500).json({ error: error.message });
  }
});

// 年間計画提案
app.post('/api/suggest-annual-plan', async (req, res) => {
  if (!model) {
    return res.status(400).json({ error: 'Gemini API not initialized' });
  }
  
  try {
    const { category, currentGoals, previousYearReview } = req.body;
    
    const prompt = `あなたは鉱山保安の年間計画策定の専門家です。以下の情報に基づいて年間計画の提案を行ってください。

【カテゴリ】${category}
【現在の目標】${currentGoals || '未設定'}
【前年度振り返り】${previousYearReview || 'なし'}

以下のJSON形式で回答してください：
{
  "suggestedGoals": ["目標1", "目標2"],
  "planItems": [
    {
      "title": "計画項目名",
      "description": "実施内容",
      "expectedEffect": "期待する効果",
      "targetValue": "目標値",
      "suggestedMonths": [4, 5, 6]
    }
  ],
  "kpis": ["KPI1", "KPI2"],
  "risks": ["想定されるリスク"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.json({ raw: text });
    }
  } catch (error) {
    console.error('Error suggesting annual plan:', error);
    res.status(500).json({ error: error.message });
  }
});

// 起動時にAPIキーがあれば初期化
if (GEMINI_API_KEY) {
  initializeGemini(GEMINI_API_KEY);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gemini API server running on port ${PORT}`);
});
