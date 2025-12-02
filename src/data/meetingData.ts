import { 
  DiagnosisCheckItem, 
  DiagnosisRecord, 
  SafetyMeeting, 
  MSEvaluationItem,
  DiagnosisCategory 
} from '../types/meeting';

// 自己診断チェックリスト項目（ガイドブックより）
export const diagnosisCheckItems: DiagnosisCheckItem[] = [
  // 保安方針
  { id: 'policy-1', category: 'policy', question: '保安方針を定めていますか？', order: 1 },
  { id: 'policy-2', category: 'policy', question: '保安方針はすべての鉱山労働者に周知されていますか？', order: 2 },
  { id: 'policy-3', category: 'policy', question: '経営トップが保安に対して率先してリーダーシップを発揮していますか？', order: 3 },
  { id: 'policy-4', category: 'policy', question: '保安方針は定期的に見直しを行っていますか？', order: 4 },
  
  // P（計画）
  { id: 'plan-1', category: 'plan', question: 'リスクアセスメントを実施していますか？', order: 1, description: '危険有害要因の洗出しと評価' },
  { id: 'plan-2', category: 'plan', question: '３つの事故の型（墜落転落、はさまれ巻込まれ、飛来落下）に着目したRAを行っていますか？', order: 2 },
  { id: 'plan-3', category: 'plan', question: '保安目標を設定していますか？', order: 3, description: '具体的な数値目標の設定' },
  { id: 'plan-4', category: 'plan', question: '年間保安計画を作成していますか？', order: 4 },
  { id: 'plan-5', category: 'plan', question: '計画には担当者と実施時期を明記していますか？', order: 5 },
  { id: 'plan-6', category: 'plan', question: '必要な経営資源（人・物・金）を計画に組み込んでいますか？', order: 6 },
  
  // D（実施）
  { id: 'do-1', category: 'do', question: '年間計画に基づいた保安活動を実施していますか？', order: 1 },
  { id: 'do-2', category: 'do', question: '保安会議を定期的に開催していますか？', order: 2 },
  { id: 'do-3', category: 'do', question: 'KY（危険予知）活動を実施していますか？', order: 3 },
  { id: 'do-4', category: 'do', question: 'ヒヤリハット活動を実施していますか？', order: 4 },
  { id: 'do-5', category: 'do', question: '保安パトロールを実施していますか？', order: 5 },
  { id: 'do-6', category: 'do', question: '保安教育を計画的に実施していますか？', order: 6 },
  { id: 'do-7', category: 'do', question: '設備対策を計画的に実施していますか？', order: 7 },
  
  // C（評価）
  { id: 'check-1', category: 'check', question: '保安目標の達成状況を評価していますか？', order: 1 },
  { id: 'check-2', category: 'check', question: '年間計画の実施状況を確認していますか？', order: 2 },
  { id: 'check-3', category: 'check', question: '残留リスクの評価を行っていますか？', order: 3 },
  { id: 'check-4', category: 'check', question: '災害・ヒヤリハットの原因分析を行っていますか？', order: 4 },
  { id: 'check-5', category: 'check', question: 'MS全体の評価を行っていますか？', order: 5 },
  
  // A（改善）
  { id: 'act-1', category: 'act', question: '評価結果に基づいて改善を行っていますか？', order: 1 },
  { id: 'act-2', category: 'act', question: '是正措置を確実に実施していますか？', order: 2 },
  { id: 'act-3', category: 'act', question: '改善点を次年度計画に反映させていますか？', order: 3 },
  { id: 'act-4', category: 'act', question: '好事例の水平展開を行っていますか？', order: 4 },
];

// サンプル自己診断記録
export const sampleDiagnosisRecords: DiagnosisRecord[] = [
  {
    id: 'diag-2024-1',
    fiscalYear: 2024,
    diagnosisDate: '2024-10-15',
    diagnosedBy: '保安管理者 山田',
    results: [
      { itemId: 'policy-1', evaluation: 3, comment: '毎年4月に見直し、周知している' },
      { itemId: 'policy-2', evaluation: 2, comment: '新入社員への周知が遅れがち' },
      { itemId: 'policy-3', evaluation: 3, comment: '社長自ら保安集会で表明' },
      { itemId: 'policy-4', evaluation: 2, comment: '毎年見直しているが形式的' },
      { itemId: 'plan-1', evaluation: 3, comment: '年3回実施' },
      { itemId: 'plan-2', evaluation: 2, comment: '墜落転落は重点的だが他は不十分' },
      { itemId: 'plan-3', evaluation: 3, comment: '不休・休業災害ゼロを目標' },
      { itemId: 'plan-4', evaluation: 3, comment: '年度初めに作成' },
      { itemId: 'plan-5', evaluation: 2, comment: '担当者は明記、時期は曖昧な項目あり' },
      { itemId: 'plan-6', evaluation: 2, comment: '予算は限定的' },
      { itemId: 'do-1', evaluation: 2, comment: '概ね実施しているが遅延あり' },
      { itemId: 'do-2', evaluation: 3, comment: '毎月開催' },
      { itemId: 'do-3', evaluation: 2, comment: 'マンネリ化の傾向' },
      { itemId: 'do-4', evaluation: 2, comment: '件数目標未達' },
      { itemId: 'do-5', evaluation: 3, comment: '月2回実施' },
      { itemId: 'do-6', evaluation: 2, comment: '計画的だが参加率に課題' },
      { itemId: 'do-7', evaluation: 2, comment: '予算制約で一部未実施' },
      { itemId: 'check-1', evaluation: 2, comment: '評価しているが深掘りが不十分' },
      { itemId: 'check-2', evaluation: 3, comment: '毎月確認' },
      { itemId: 'check-3', evaluation: 2, comment: '一部リスクの評価漏れ' },
      { itemId: 'check-4', evaluation: 2, comment: 'なぜなぜ分析が浅い' },
      { itemId: 'check-5', evaluation: 1, comment: '今回初めて実施' },
      { itemId: 'act-1', evaluation: 2, comment: '改善はしているが追跡不十分' },
      { itemId: 'act-2', evaluation: 2, comment: '是正後の確認が弱い' },
      { itemId: 'act-3', evaluation: 2, comment: '反映しているが具体性に欠ける' },
      { itemId: 'act-4', evaluation: 1, comment: '水平展開の仕組みがない' },
    ],
    overallComment: '基本的なPDCAは回っているが、C/A段階の深化が課題。特にMS評価と水平展開の仕組み構築が必要。',
    improvementPlan: '1. MS評価チェックリストを導入\n2. 好事例共有会を四半期ごとに開催\n3. なぜなぜ分析の研修実施',
    createdAt: '2024-10-15T09:00:00',
    updatedAt: '2024-10-15T09:00:00',
  }
];

// サンプル保安会議記録
export const sampleMeetings: SafetyMeeting[] = [
  {
    id: 'meeting-2024-10',
    meetingDate: '2024-10-07',
    meetingType: 'regular',
    title: '10月度 定例保安会議',
    location: '本社会議室',
    participants: ['A社長', '保安管理者 山田', '設備担当 佐藤', '作業員代表 鈴木', '作業員代表 田中'],
    totalMembers: 6,
    attendanceRate: 83.3,
    agendaItems: [
      {
        id: 'agenda-1',
        title: '9月度災害・ヒヤリハット報告',
        presenter: '保安管理者 山田',
        duration: 15,
        content: '9月度は災害ゼロ、ヒヤリハット3件。内訳：墜落転落リスク1件、飛来落下1件、その他1件',
        discussion: '墜落転落リスクの件は手すり点検時の事例。再発防止策について議論。',
        result: '手すり点検時の二人作業ルールを徹底'
      },
      {
        id: 'agenda-2',
        title: '年間計画進捗確認',
        presenter: '保安管理者 山田',
        duration: 20,
        content: '9月末時点で進捗率72%。設備対策の一部に遅延あり。',
        discussion: '手すり補修の予算超過について対応を検討。',
        result: '追加予算50万円を申請。11月までに完了予定'
      },
      {
        id: 'agenda-3',
        title: 'リスクアセスメント結果報告',
        presenter: '作業員代表 鈴木',
        duration: 25,
        content: '10月RAで新たに3件のリスクを特定。いずれもリスクレベル「心配」',
        discussion: '運搬道路の段差リスクについて優先対応を検討。',
        result: '11月中に段差解消工事を実施'
      }
    ],
    decisions: [
      '手すり点検時は二人作業を必須とする',
      '手すり補修の追加予算50万円を承認',
      '運搬道路段差解消を11月優先実施'
    ],
    actionItems: [
      { id: 'action-1', task: '手すり点検手順書の改訂', assignee: '保安管理者 山田', dueDate: '2024-10-15', status: 'completed', completedDate: '2024-10-12' },
      { id: 'action-2', task: '追加予算申請書の作成', assignee: '設備担当 佐藤', dueDate: '2024-10-10', status: 'completed', completedDate: '2024-10-09' },
      { id: 'action-3', task: '段差解消工事の発注', assignee: '設備担当 佐藤', dueDate: '2024-10-20', status: 'in_progress' }
    ],
    aiSummary: '本会議では9月度の保安実績確認と年間計画の進捗管理、新規リスク対応を議論。設備対策の予算追加と手すり点検の安全対策強化を決定。運搬道路の段差リスクは早期対応として11月実施を決定した。',
    aiImprovementSuggestions: [
      '手すり点検の二人作業ルールは作業手順書に明記し、朝礼での周知を推奨',
      '段差解消工事後は効果検証のためのフォローアップRAを実施することを推奨',
      '予算超過の再発防止として、四半期ごとの予算見直しを検討'
    ],
    minutes: '【10月度定例保安会議議事録】\n\n日時：2024年10月7日 9:00-10:30\n場所：本社会議室\n出席者：A社長、山田、佐藤、鈴木、田中\n欠席者：高橋（出張）\n\n1. 9月度災害・ヒヤリハット報告\n（内容略）\n\n2. 年間計画進捗確認\n（内容略）\n\n3. リスクアセスメント結果報告\n（内容略）\n\n次回：11月4日（月）9:00～',
    createdAt: '2024-10-07T10:30:00',
    updatedAt: '2024-10-12T09:00:00',
  },
  {
    id: 'meeting-2024-09',
    meetingDate: '2024-09-02',
    meetingType: 'regular',
    title: '9月度 定例保安会議',
    location: '本社会議室',
    participants: ['A社長', '保安管理者 山田', '設備担当 佐藤', '作業員代表 鈴木', '作業員代表 田中', '作業員代表 高橋'],
    totalMembers: 6,
    attendanceRate: 100,
    agendaItems: [
      {
        id: 'agenda-1',
        title: '8月度災害・ヒヤリハット報告',
        presenter: '保安管理者 山田',
        duration: 15,
        content: '8月度は災害ゼロ、ヒヤリハット2件',
        result: '継続監視'
      },
      {
        id: 'agenda-2',
        title: '残留リスク評価結果',
        presenter: '保安管理者 山田',
        duration: 30,
        content: '9月評価の結果、「心配」レベルの残留リスク2件',
        result: '次年度計画に反映'
      }
    ],
    decisions: [
      '残留リスク2件は次年度の設備対策で対応',
      '危険体感教育を10月に実施'
    ],
    actionItems: [
      { id: 'action-1', task: '危険体感教育の準備', assignee: '安全担当', dueDate: '2024-09-30', status: 'completed', completedDate: '2024-09-28' }
    ],
    createdAt: '2024-09-02T10:00:00',
    updatedAt: '2024-09-28T09:00:00',
  }
];

// MS評価チェックリスト項目（ガイドブックのシステム評価より）
export const msEvaluationItems: MSEvaluationItem[] = [
  // 保安方針
  { id: 'ms-policy-1', category: 'policy', section: '保安方針', question: '経営トップの保安に対する基本姿勢を定めたものになっていますか？', order: 1 },
  { id: 'ms-policy-2', category: 'policy', section: '保安方針', question: '危害および鉱害の防止について述べていますか？', order: 2 },
  { id: 'ms-policy-3', category: 'policy', section: '保安方針', question: '法令等の遵守について述べていますか？', order: 3 },
  { id: 'ms-policy-4', category: 'policy', section: '保安方針', question: 'MSの継続的な改善について述べていますか？', order: 4 },
  { id: 'ms-policy-5', category: 'policy', section: '保安方針', question: '鉱山労働者への周知がされていますか？', order: 5 },
  
  // P（計画）
  { id: 'ms-plan-1', category: 'plan', section: 'リスクアセスメント', question: '危険有害要因を洗い出していますか？', order: 1 },
  { id: 'ms-plan-2', category: 'plan', section: 'リスクアセスメント', question: 'リスク低減措置を検討していますか？', order: 2 },
  { id: 'ms-plan-3', category: 'plan', section: '保安目標', question: '保安目標を設定していますか？', order: 3 },
  { id: 'ms-plan-4', category: 'plan', section: '保安目標', question: '保安目標は具体的な値（数値目標など）を定めていますか？', order: 4 },
  { id: 'ms-plan-5', category: 'plan', section: '年間計画', question: '年間保安計画を作成していますか？', order: 5 },
  { id: 'ms-plan-6', category: 'plan', section: '年間計画', question: '担当者を明記していますか？', order: 6 },
  { id: 'ms-plan-7', category: 'plan', section: '年間計画', question: '実施時期を明記していますか？', order: 7 },
  
  // D（実施）
  { id: 'ms-do-1', category: 'do', section: '組織体制', question: '保安管理体制は明確ですか？', order: 1 },
  { id: 'ms-do-2', category: 'do', section: '保安活動', question: '計画に基づいた活動を実施していますか？', order: 2 },
  { id: 'ms-do-3', category: 'do', section: '保安教育', question: '保安教育を計画的に実施していますか？', order: 3 },
  { id: 'ms-do-4', category: 'do', section: '文書管理', question: '記録は適切に保管・管理されていますか？', order: 4 },
  
  // C（評価）
  { id: 'ms-check-1', category: 'check', section: '目標達成評価', question: '保安目標の達成状況を評価していますか？', order: 1 },
  { id: 'ms-check-2', category: 'check', section: '計画実施評価', question: '年間計画の実施状況を評価していますか？', order: 2 },
  { id: 'ms-check-3', category: 'check', section: 'システム評価', question: 'MS全体の有効性を評価していますか？', order: 3 },
  
  // A（改善）
  { id: 'ms-act-1', category: 'act', section: '是正措置', question: '問題点に対する是正措置を実施していますか？', order: 1 },
  { id: 'ms-act-2', category: 'act', section: '継続的改善', question: '評価結果を次年度計画に反映していますか？', order: 2 },
  { id: 'ms-act-3', category: 'act', section: 'マネジメントレビュー', question: '経営トップによる見直しを行っていますか？', order: 3 },
];
