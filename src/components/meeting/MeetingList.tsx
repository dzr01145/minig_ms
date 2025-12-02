import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  SafetyMeeting, 
  MEETING_TYPE_LABELS, 
  ACTION_STATUS_LABELS 
} from '../../types/meeting';

interface MeetingListProps {
  meetings: SafetyMeeting[];
  onSelectMeeting: (meeting: SafetyMeeting) => void;
  onUpdateActionStatus: (meetingId: string, actionId: string, status: 'pending' | 'in_progress' | 'completed') => void;
}

export function MeetingList({ meetings, onSelectMeeting, onUpdateActionStatus }: MeetingListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SafetyMeeting['meetingType'] | 'all'>('all');
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);

  // フィルタリング
  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      if (searchQuery && !meeting.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedType !== 'all' && meeting.meetingType !== selectedType) {
        return false;
      }
      return true;
    });
  }, [meetings, searchQuery, selectedType]);

  const getMeetingTypeColor = (type: SafetyMeeting['meetingType']) => {
    const colors = {
      regular: 'bg-blue-100 text-blue-700',
      emergency: 'bg-danger-100 text-danger-700',
      special: 'bg-purple-100 text-purple-700'
    };
    return colors[type];
  };

  const getActionStatusColor = (status: 'pending' | 'in_progress' | 'completed', dueDate: string) => {
    if (status === 'completed') return 'bg-success-100 text-success-700';
    const isOverdue = new Date(dueDate) < new Date();
    if (isOverdue) return 'bg-danger-100 text-danger-700';
    if (status === 'in_progress') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary-600" />
          保安会議記録一覧
        </h1>
        <div className="text-sm text-gray-600">
          {filteredMeetings.length} / {meetings.length} 件
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="会議タイトルで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">全タイプ</option>
            {(Object.keys(MEETING_TYPE_LABELS) as Array<keyof typeof MEETING_TYPE_LABELS>).map(type => (
              <option key={type} value={type}>{MEETING_TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 会議一覧 */}
      <div className="space-y-4">
        {filteredMeetings.map(meeting => {
          const isExpanded = expandedMeeting === meeting.id;
          const pendingActions = meeting.actionItems.filter(a => a.status !== 'completed');
          const completedActions = meeting.actionItems.filter(a => a.status === 'completed');

          return (
            <div
              key={meeting.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* ヘッダー部分 */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedMeeting(isExpanded ? null : meeting.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getMeetingTypeColor(meeting.meetingType)}`}>
                        {MEETING_TYPE_LABELS[meeting.meetingType]}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {meeting.meetingDate}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        出席率 {meeting.attendanceRate}%
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{meeting.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>議題: {meeting.agendaItems.length}件</span>
                      <span>決定事項: {meeting.decisions.length}件</span>
                      {pendingActions.length > 0 && (
                        <span className="text-warning-600 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          未完了: {pendingActions.length}件
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.aiSummary && (
                      <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI要約あり
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* 展開コンテンツ */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  {/* 出席者 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">出席者</h4>
                    <div className="flex flex-wrap gap-2">
                      {meeting.participants.map((p, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-white rounded-full border border-gray-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 議題 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">議題</h4>
                    <div className="space-y-2">
                      {meeting.agendaItems.map((agenda, idx) => (
                        <div key={agenda.id} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-start gap-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{agenda.title}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                発表者: {agenda.presenter} | {agenda.duration}分
                              </p>
                              {agenda.result && (
                                <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                                  結果: {agenda.result}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 決定事項 */}
                  {meeting.decisions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">決定事項</h4>
                      <ul className="space-y-1">
                        {meeting.decisions.map((decision, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                            {decision}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* アクションアイテム */}
                  {meeting.actionItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">アクションアイテム</h4>
                      <div className="space-y-2">
                        {meeting.actionItems.map(action => {
                          const isOverdue = action.status !== 'completed' && new Date(action.dueDate) < new Date();
                          return (
                            <div
                              key={action.id}
                              className={`bg-white p-3 rounded-lg border ${
                                isOverdue ? 'border-danger-200' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{action.task}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    担当: {action.assignee} | 期限: {action.dueDate}
                                  </p>
                                </div>
                                <select
                                  value={action.status}
                                  onChange={(e) => onUpdateActionStatus(
                                    meeting.id,
                                    action.id,
                                    e.target.value as typeof action.status
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`text-xs px-2 py-1 rounded border-0 ${getActionStatusColor(action.status, action.dueDate)}`}
                                >
                                  <option value="pending">未着手</option>
                                  <option value="in_progress">進行中</option>
                                  <option value="completed">完了</option>
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* AI要約 */}
                  {meeting.aiSummary && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI要約
                      </h4>
                      <p className="text-sm text-gray-700">{meeting.aiSummary}</p>
                      {meeting.aiImprovementSuggestions && meeting.aiImprovementSuggestions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-purple-700 mb-1">改善提案:</p>
                          <ul className="space-y-1">
                            {meeting.aiImprovementSuggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="text-purple-500">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 詳細ボタン */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => onSelectMeeting(meeting)}
                      className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      詳細・編集
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredMeetings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">会議記録がありません</p>
        </div>
      )}
    </div>
  );
}
