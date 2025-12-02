import React, { useState } from 'react';
import {
  Save,
  X,
  FileText,
  Users,
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  Clock
} from 'lucide-react';
import {
  SafetyMeeting,
  AgendaItem,
  ActionItem,
  MEETING_TYPE_LABELS
} from '../../types/meeting';

interface MeetingFormProps {
  onSubmit: (meeting: SafetyMeeting) => void;
  onCancel: () => void;
  initialData?: SafetyMeeting;
}

export function MeetingForm({ onSubmit, onCancel, initialData }: MeetingFormProps) {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    meetingDate: initialData?.meetingDate || new Date().toISOString().split('T')[0],
    meetingType: initialData?.meetingType || 'regular' as SafetyMeeting['meetingType'],
    title: initialData?.title || '',
    location: initialData?.location || '',
    participants: initialData?.participants.join(', ') || '',
    totalMembers: initialData?.totalMembers || 6,
    minutes: initialData?.minutes || ''
  });

  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(
    initialData?.agendaItems || []
  );
  const [decisions, setDecisions] = useState<string[]>(
    initialData?.decisions || []
  );
  const [actionItems, setActionItems] = useState<ActionItem[]>(
    initialData?.actionItems || []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState(initialData?.aiSummary || '');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>(
    initialData?.aiImprovementSuggestions || []
  );

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 議題追加
  const addAgendaItem = () => {
    setAgendaItems(prev => [...prev, {
      id: `agenda-${Date.now()}`,
      title: '',
      presenter: '',
      duration: 15,
      content: '',
      discussion: '',
      result: ''
    }]);
  };

  const updateAgendaItem = (index: number, field: string, value: string | number) => {
    setAgendaItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeAgendaItem = (index: number) => {
    setAgendaItems(prev => prev.filter((_, i) => i !== index));
  };

  // 決定事項追加
  const addDecision = () => {
    setDecisions(prev => [...prev, '']);
  };

  const updateDecision = (index: number, value: string) => {
    setDecisions(prev => prev.map((d, i) => i === index ? value : d));
  };

  const removeDecision = (index: number) => {
    setDecisions(prev => prev.filter((_, i) => i !== index));
  };

  // アクション追加
  const addActionItem = () => {
    setActionItems(prev => [...prev, {
      id: `action-${Date.now()}`,
      task: '',
      assignee: '',
      dueDate: '',
      status: 'pending'
    }]);
  };

  const updateActionItem = (index: number, field: string, value: string) => {
    setActionItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeActionItem = (index: number) => {
    setActionItems(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = '会議タイトルは必須です';
    }
    if (!formData.participants.trim()) {
      newErrors.participants = '出席者は必須です';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const participantsList = formData.participants
      .split(',')
      .map(p => p.trim())
      .filter(p => p);

    const meeting: SafetyMeeting = {
      id: initialData?.id || `meeting-${Date.now()}`,
      meetingDate: formData.meetingDate,
      meetingType: formData.meetingType,
      title: formData.title.trim(),
      location: formData.location.trim() || undefined,
      participants: participantsList,
      totalMembers: formData.totalMembers,
      attendanceRate: Math.round((participantsList.length / formData.totalMembers) * 100),
      agendaItems: agendaItems.filter(a => a.title.trim()),
      decisions: decisions.filter(d => d.trim()),
      actionItems: actionItems.filter(a => a.task.trim()),
      aiSummary: aiSummary || undefined,
      aiImprovementSuggestions: aiSuggestions.length > 0 ? aiSuggestions : undefined,
      minutes: formData.minutes.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(meeting);
  };

  // AI要約生成（ダミー）
  const generateAISummary = async () => {
    if (agendaItems.length === 0 && decisions.length === 0) return;

    setIsGeneratingAI(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // ダミーの要約生成
    let summary = `本会議では`;
    if (agendaItems.length > 0) {
      summary += `${agendaItems.length}件の議題について議論。`;
      const mainTopics = agendaItems.slice(0, 2).map(a => a.title).filter(t => t).join('、');
      if (mainTopics) {
        summary += `主な議題は${mainTopics}。`;
      }
    }
    if (decisions.length > 0) {
      summary += `${decisions.length}件の決定事項が承認された。`;
    }
    if (actionItems.length > 0) {
      const pendingCount = actionItems.filter(a => a.status !== 'completed').length;
      summary += `${pendingCount}件のアクションアイテムが設定された。`;
    }

    setAiSummary(summary);

    // ダミーの改善提案
    const suggestions = [
      '次回会議までにアクションアイテムの進捗確認を行うことを推奨',
      '決定事項については関係者への周知徹底を図ること',
      '議事録の早期共有により、欠席者へのフォローアップを実施'
    ];
    setAiSuggestions(suggestions);

    setIsGeneratingAI(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary-600" />
          {isEditing ? '会議記録の編集' : '新規会議記録'}
        </h1>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">基本情報</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              開催日
            </label>
            <input
              type="date"
              value={formData.meetingDate}
              onChange={(e) => handleChange('meetingDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">会議種別</label>
            <select
              value={formData.meetingType}
              onChange={(e) => handleChange('meetingType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {(Object.keys(MEETING_TYPE_LABELS) as Array<keyof typeof MEETING_TYPE_LABELS>).map(type => (
                <option key={type} value={type}>{MEETING_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="例: 本社会議室"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            会議タイトル <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="例: 10月度 定例保安会議"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.title ? 'border-danger-500' : 'border-gray-300'
              }`}
          />
          {errors.title && <p className="text-danger-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4 inline mr-1" />
              出席者 <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={formData.participants}
              onChange={(e) => handleChange('participants', e.target.value)}
              placeholder="例: A社長, 山田, 佐藤（カンマ区切り）"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.participants ? 'border-danger-500' : 'border-gray-300'
                }`}
            />
            {errors.participants && <p className="text-danger-500 text-sm mt-1">{errors.participants}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メンバー総数</label>
            <input
              type="number"
              value={formData.totalMembers}
              onChange={(e) => handleChange('totalMembers', parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* 議題 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">議題</h2>
          <button
            onClick={addAgendaItem}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </div>

        {agendaItems.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">議題を追加してください</p>
        ) : (
          <div className="space-y-4">
            {agendaItems.map((agenda, index) => (
              <div key={agenda.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => removeAgendaItem(index)}
                    className="text-gray-400 hover:text-danger-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={agenda.title}
                      onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                      placeholder="議題タイトル"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={agenda.presenter}
                      onChange={(e) => updateAgendaItem(index, 'presenter', e.target.value)}
                      placeholder="発表者"
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={agenda.duration}
                        onChange={(e) => updateAgendaItem(index, 'duration', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-xs text-gray-500">分</span>
                    </div>
                  </div>
                </div>
                <textarea
                  value={agenda.content}
                  onChange={(e) => updateAgendaItem(index, 'content', e.target.value)}
                  placeholder="内容"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <textarea
                  value={agenda.result || ''}
                  onChange={(e) => updateAgendaItem(index, 'result', e.target.value)}
                  placeholder="結果・決定事項"
                  rows={1}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 決定事項 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">決定事項</h2>
          <button
            onClick={addDecision}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-success-100 text-success-700 rounded-lg hover:bg-success-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </div>

        {decisions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">決定事項を追加してください</p>
        ) : (
          <div className="space-y-2">
            {decisions.map((decision, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-success-500 font-bold">✓</span>
                <input
                  type="text"
                  value={decision}
                  onChange={(e) => updateDecision(index, e.target.value)}
                  placeholder="決定事項を入力"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => removeDecision(index)}
                  className="text-gray-400 hover:text-danger-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* アクションアイテム */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">アクションアイテム</h2>
          <button
            onClick={addActionItem}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-warning-100 text-warning-700 rounded-lg hover:bg-warning-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            追加
          </button>
        </div>

        {actionItems.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">アクションアイテムを追加してください</p>
        ) : (
          <div className="space-y-3">
            {actionItems.map((action, index) => (
              <div key={action.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-warning-500 mt-2" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={action.task}
                        onChange={(e) => updateActionItem(index, 'task', e.target.value)}
                        placeholder="タスク内容"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <input
                      type="text"
                      value={action.assignee}
                      onChange={(e) => updateActionItem(index, 'assignee', e.target.value)}
                      placeholder="担当者"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="date"
                      value={action.dueDate}
                      onChange={(e) => updateActionItem(index, 'dueDate', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <button
                    onClick={() => removeActionItem(index)}
                    className="text-gray-400 hover:text-danger-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI要約 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI要約・改善提案
          </h2>
          <button
            onClick={generateAISummary}
            disabled={isGeneratingAI || (agendaItems.length === 0 && decisions.length === 0)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            {isGeneratingAI ? '生成中...' : 'AI要約を生成'}
          </button>
        </div>

        {aiSummary && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-purple-700 mb-1 block">要約</label>
              <textarea
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>
            {aiSuggestions.length > 0 && (
              <div>
                <label className="text-sm font-medium text-purple-700 mb-1 block">改善提案</label>
                <ul className="space-y-1 text-sm text-gray-700">
                  {aiSuggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 議事録 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">議事録</h2>
          <button
            type="button"
            onClick={() => {
              // AI添削のモック機能
              if (!formData.minutes) return;
              const corrected = formData.minutes + '\n\n[AI添削]: 誤字脱字を修正し、表現をより明確にしました。';
              handleChange('minutes', corrected);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI添削
          </button>
        </div>
        <textarea
          value={formData.minutes}
          onChange={(e) => handleChange('minutes', e.target.value)}
          placeholder="議事録の詳細を入力"
          rows={8}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* アクションボタン */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={() => {
            console.log('Save button clicked');
            console.log('Form Data:', formData);
            console.log('Agenda Items:', agendaItems);
            console.log('Decisions:', decisions);
            console.log('Action Items:', actionItems);
            handleSubmit();
          }}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          {isEditing ? '更新する' : '保存する'}
        </button>
      </div>
    </div>
  );
}
