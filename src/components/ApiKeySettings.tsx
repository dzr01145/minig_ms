import React, { useState, useEffect } from 'react';
import { Key, Check, X, AlertTriangle, Sparkles, ExternalLink, RefreshCw, Cpu, Cloud, Server, Globe, Clock } from 'lucide-react';
import { 
  getApiKey, 
  setApiKey, 
  clearApiKey, 
  validateApiKey,
  getSelectedModel,
  setSelectedModel,
  getSatelliteEndpoint,
  setSatelliteEndpoint,
  AI_PROVIDERS,
  AIProvider
} from '../services/geminiService';
import {
  getSatelliteApiKey,
  setSatelliteApiKey as saveSatelliteApiKey,
  getSatelliteTenantId,
  setSatelliteTenantId,
  getSatelliteUserId,
  setSatelliteUserId,
  testConnection as testSatelliteConnection
} from '../services/satelliteAiService';

interface ApiKeySettingsProps {
  onClose: () => void;
  onOpenLogViewer?: () => void;
}

export function ApiKeySettings({ onClose, onOpenLogViewer }: ApiKeySettingsProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  
  // Gemini設定
  const [geminiApiKey, setGeminiApiKey] = useState('');
  
  // サテライトAI設定
  const [satelliteEndpoint, setSatelliteEndpointState] = useState('');
  const [satelliteApiKey, setSatelliteApiKey] = useState('');
  const [satelliteTenantId, setSatelliteTenantId] = useState('');
  const [satelliteUserId, setSatelliteUserId] = useState('');
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    initializeSettings();
  }, []);

  const initializeSettings = async () => {
    setIsChecking(true);
    
    // Gemini APIキーを取得
    const savedGeminiKey = getApiKey('gemini');
    if (savedGeminiKey) {
      setGeminiApiKey(maskKey(savedGeminiKey));
    }
    
    // サテライトAI設定を取得
    const savedSatelliteEndpoint = getSatelliteEndpoint();
    setSatelliteEndpointState(savedSatelliteEndpoint);
    
    const savedSatelliteKey = getSatelliteApiKey();
    if (savedSatelliteKey) {
      setSatelliteApiKey(maskKey(savedSatelliteKey));
    }
    
    const savedTenantId = getSatelliteTenantId();
    if (savedTenantId) {
      setSatelliteTenantId(savedTenantId);
    }
    
    const savedUserId = getSatelliteUserId();
    if (savedUserId) {
      setSatelliteUserId(savedUserId);
    }
    
    // 保存されているモデルを取得
    const savedModelId = getSelectedModel();
    if (savedModelId) {
      setSelectedModelId(savedModelId);
      
      // プロバイダーを特定
      for (const provider of AI_PROVIDERS) {
        const model = provider.models.find(m => m.id === savedModelId);
        if (model) {
          setSelectedProvider(model.provider);
          
          // 接続状態を確認
          const apiKey = model.provider === 'gemini' ? savedGeminiKey : savedSatelliteKey;
          const isValid = await validateApiKey(model.provider, apiKey || '', savedModelId);
          setIsConnected(isValid);
          break;
        }
      }
    } else {
      // デフォルト設定
      setSelectedProvider('gemini');
      setSelectedModelId('gemini-2.5-pro-preview-05-06');
    }
    
    setIsChecking(false);
  };

  const maskKey = (key: string): string => {
    if (key.length <= 8) return key;
    return key.substring(0, 6) + '...' + key.substring(key.length - 4);
  };

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setSelectedModelId('');
    setIsConnected(false);
    setError('');
    setSuccess('');
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    setIsConnected(false);
    setError('');
  };

  const handleSave = async () => {
    if (!selectedModelId) {
      setError('モデルを選択してください');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (selectedProvider === 'gemini') {
        // Geminiの場合
        if (!geminiApiKey || geminiApiKey.includes('...')) {
          setError('Gemini APIキーを入力してください');
          setIsLoading(false);
          return;
        }
        
        const isValid = await validateApiKey('gemini', geminiApiKey, selectedModelId);
        
        if (isValid) {
          setApiKey('gemini', geminiApiKey);
          setSelectedModel(selectedModelId);
          setGeminiApiKey(maskKey(geminiApiKey));
          
          const modelConfig = AI_PROVIDERS[0].models.find(m => m.id === selectedModelId);
          setSuccess(`${modelConfig?.name}を設定しました！`);
          setIsConnected(true);
          
          setTimeout(() => onClose(), 2000);
        } else {
          setError('Gemini APIキーが無効です。Google AI Studioで確認してください。');
        }
      } else {
        // サテライトAIの場合
        const apiKeyToUse = satelliteApiKey.includes('...') ? getSatelliteApiKey() || '' : satelliteApiKey;
        
        if (!apiKeyToUse || apiKeyToUse.includes('...')) {
          setError('APIキーを入力してください');
          return;
        }
        
        if (!satelliteTenantId) {
          setError('テナントIDを入力してください');
          return;
        }
        
        if (!satelliteUserId) {
          setError('ユーザーID（メールアドレス）を入力してください');
          return;
        }
        
        // サテライトAI設定を保存
        saveSatelliteApiKey(apiKeyToUse);
        setSatelliteTenantId(satelliteTenantId);
        setSatelliteUserId(satelliteUserId);
        
        // 接続テスト
        const connectionTest = await testSatelliteConnection();
        
        if (connectionTest.success) {
          setSelectedModel(selectedModelId);
          
          const modelConfig = AI_PROVIDERS.find(p => p.id === 'satellite')?.models.find(m => m.id === selectedModelId);
          setSuccess(`${modelConfig?.name}を設定しました！\n${connectionTest.message}`);
          setIsConnected(true);
          
          setTimeout(() => onClose(), 2000);
        } else {
          setError(`サテライトAIに接続できません。\n${connectionTest.message}`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'API検証中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = (provider: AIProvider) => {
    clearApiKey(provider);
    if (provider === 'gemini') {
      setGeminiApiKey('');
    } else {
      setSatelliteApiKey('');
    }
    setIsConnected(false);
    setSuccess(`${provider === 'gemini' ? 'Gemini' : 'サテライトAI'}の設定を削除しました`);
  };

  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI設定</h2>
                <p className="text-purple-200 text-sm">プロバイダー・モデル・APIキーを設定</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* ステータス */}
          {isChecking ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 text-gray-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>設定を確認中...</span>
            </div>
          ) : (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {isConnected ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>AI機能が有効です</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span>設定を完了してください</span>
                </>
              )}
            </div>
          )}

          {/* プロバイダー選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">1. AIプロバイダーを選択</label>
            <div className="grid grid-cols-2 gap-3">
              {AI_PROVIDERS.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderChange(provider.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedProvider === provider.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {provider.id === 'gemini' ? (
                      <Cloud className="w-6 h-6 text-purple-600" />
                    ) : (
                      <Server className="w-6 h-6 text-blue-600" />
                    )}
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{provider.name}</div>
                      <div className="text-xs text-gray-500">
                        {provider.id === 'gemini' ? 'クラウドAPI' : 'ローカル/リモート'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Gemini設定 */}
          {selectedProvider === 'gemini' && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-4">
              <h3 className="font-medium text-purple-800 flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Google Gemini 設定
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Key className="w-4 h-4 inline mr-1" />
                  Gemini APIキー <span className="text-red-500">*</span>
                </label>
                <input
                  type={geminiApiKey.includes('...') ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => {
                    setGeminiApiKey(e.target.value);
                    setError('');
                  }}
                  placeholder="AIza..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="flex items-center justify-between mt-2">
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline inline-flex items-center gap-1"
                  >
                    Google AI Studio でAPIキーを取得
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {geminiApiKey && (
                    <button
                      onClick={() => handleClear('gemini')}
                      className="text-xs text-red-500 hover:underline"
                    >
                      キーを削除
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* サテライトAI設定 */}
          {selectedProvider === 'satellite' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
              <h3 className="font-medium text-blue-800 flex items-center gap-2">
                <Server className="w-5 h-5" />
                サテライトAI 公式API設定
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Key className="w-4 h-4 inline mr-1" />
                  APIキー <span className="text-red-500">*</span>
                </label>
                <input
                  type={satelliteApiKey.includes('...') ? 'text' : 'password'}
                  value={satelliteApiKey}
                  onChange={(e) => {
                    setSatelliteApiKey(e.target.value);
                    setError('');
                  }}
                  placeholder="サテライトAI APIキーを入力"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  AIボードダッシュボードの「API設定」で発行したAPIキー
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Server className="w-4 h-4 inline mr-1" />
                  テナントID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={satelliteTenantId}
                  onChange={(e) => {
                    setSatelliteTenantId(e.target.value);
                    setError('');
                  }}
                  placeholder="テナントIDを入力"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  サテライトAIのテナントID
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-4 h-4 inline mr-1" />
                  ユーザーID（メールアドレス） <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={satelliteUserId}
                  onChange={(e) => {
                    setSatelliteUserId(e.target.value);
                    setError('');
                  }}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  サテライトAIのユーザーID（メールアドレス）
                </p>
              </div>

              {satelliteApiKey && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleClear('satellite')}
                    className="text-xs text-red-500 hover:underline"
                  >
                    設定をクリア
                  </button>
                </div>
              )}

              <div className="bg-white p-3 rounded-lg text-sm text-blue-700">
                <p className="font-medium mb-1">サテライトAI公式APIについて</p>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• 複数のAIモデル（GPT-5.1, Gemini 2.5 Pro, Claude 4.5等）に対応</li>
                  <li>• エンタープライズグレードのセキュリティとサポート</li>
                  <li>• 詳細: <a href="https://aiboard.sateraitoai.jp" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://aiboard.sateraitoai.jp</a></li>
                </ul>
              </div>
            </div>
          )}

          {/* モデル選択 */}
          {currentProvider && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Cpu className="w-4 h-4 inline mr-1" />
                2. モデルを選択
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentProvider.models.map(model => (
                  <button
                    key={model.id}
                    onClick={() => handleModelChange(model.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedModelId === model.id
                        ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">{model.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{model.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* エラー・成功メッセージ */}
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-line">{error}</div>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* ログ履歴へのリンク */}
          {onOpenLogViewer && (
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={onOpenLogViewer}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Clock className="w-4 h-4" />
                AIログ履歴を表示
              </button>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !selectedModelId}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  検証中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  保存して有効化
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
