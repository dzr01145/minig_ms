import { HiyariHatReport, Statistics } from '../types';

// サンプルデータ
export const sampleReports: HiyariHatReport[] = [
  {
    id: '1',
    type: 'near_miss',
    reportDate: '2024-10-15',
    occurredAt: '2024-10-15T10:30:00',
    location: 'crushing',
    locationDetail: 'ベルトコンベア付近',
    accidentType: 'fall',
    accidentTypeOther: '',
    description: 'ベルトコンベアの点検中、歩廊の濡れた箇所で足を滑らせ、転倒しそうになった。手すりにつかまり事なきを得た。',
    cause: 'environment',
    causeDetail: '前日の雨で歩廊が濡れていた。滑り止めマットが劣化していた。',
    severityLevel: 'medium',
    immediateAction: '濡れた箇所を拭き取り、注意喚起の表示を設置',
    suggestedMeasure: '滑り止めマットの交換、水はけの改善',
    reporterName: '山田太郎',
    reporterRole: 'worker',
    status: 'reviewing',
    aiAnalysis: {
      suggestedAccidentType: 'fall',
      confidence: 0.92,
      rootCauseAnalysis: '設備の老朽化（滑り止めマット）と気象条件への対応不足が原因と推定されます。',
      recommendedMeasures: [
        '滑り止めマットの定期点検・交換スケジュールの策定',
        '雨天時の点検手順書の見直し',
        '歩廊の水はけ改善工事の検討'
      ],
      similarCases: [
        { id: 'case1', summary: '雨天後の歩廊での転倒事例', similarity: 0.85 },
        { id: 'case2', summary: 'コンベア周辺での墜落事例', similarity: 0.72 }
      ]
    },
    createdAt: '2024-10-15T11:00:00',
    updatedAt: '2024-10-15T14:30:00'
  },
  {
    id: '2',
    type: 'near_miss',
    reportDate: '2024-10-12',
    occurredAt: '2024-10-12T14:15:00',
    location: 'loading',
    locationDetail: '50tダンプトラック',
    accidentType: 'fall',
    accidentTypeOther: '',
    description: 'ダンプトラックから降車しようとした際、手すりが腐食で破損しており、バランスを崩して落下しそうになった。',
    cause: 'equipment',
    causeDetail: '手すりの腐食が進行していたが報告されていなかった',
    severityLevel: 'high',
    immediateAction: '当該車両の使用を一時停止、応急修理を実施',
    suggestedMeasure: '全車両の手すり点検、定期点検項目への追加',
    reporterName: '佐藤花子',
    reporterRole: 'worker',
    status: 'resolved',
    aiAnalysis: {
      suggestedAccidentType: 'fall',
      confidence: 0.95,
      rootCauseAnalysis: '設備の点検不足と報告体制の問題が根本原因です。',
      recommendedMeasures: [
        '車両点検チェックリストの見直し',
        '不具合報告の促進（報告しやすい環境づくり）',
        '手すり・防護柵の定期点検強化'
      ],
      similarCases: [
        { id: 'case3', summary: '重機からの墜落事例', similarity: 0.88 }
      ]
    },
    createdAt: '2024-10-12T15:00:00',
    updatedAt: '2024-10-14T10:00:00'
  },
  {
    id: '3',
    type: 'near_miss',
    reportDate: '2024-10-10',
    occurredAt: '2024-10-10T09:45:00',
    location: 'crushing',
    locationDetail: 'ベルトコンベア巻取り部',
    accidentType: 'caught',
    accidentTypeOther: '',
    description: 'コンベアの蛇行確認中、土嚢につまづいて手をベルト付近に出してしまった。巻き込まれる直前で手を引いた。',
    cause: 'procedure',
    causeDetail: '蛇行確認時の安全距離が守られていなかった',
    severityLevel: 'high',
    immediateAction: '安全距離の再確認、土嚢の配置を見直し',
    suggestedMeasure: '安全柵の設置、作業手順書の見直し',
    reporterName: '鈴木一郎',
    reporterRole: 'worker',
    status: 'linked_to_ra',
    aiAnalysis: {
      suggestedAccidentType: 'caught',
      confidence: 0.97,
      rootCauseAnalysis: '作業手順の不遵守と作業環境の整理整頓不足が原因です。',
      recommendedMeasures: [
        '安全柵・インターロックの設置',
        '5S活動の強化（土嚢の適切な配置）',
        '作業手順書の見直しと教育'
      ],
      similarCases: [
        { id: 'case4', summary: 'コンベア巻き込まれ事例', similarity: 0.91 },
        { id: 'case5', summary: 'つまづきによる二次災害事例', similarity: 0.78 }
      ]
    },
    createdAt: '2024-10-10T10:30:00',
    updatedAt: '2024-10-11T16:00:00'
  },
  {
    id: '4',
    type: 'near_miss',
    reportDate: '2024-10-08',
    occurredAt: '2024-10-08T11:20:00',
    location: 'blasting',
    locationDetail: '発破警戒区域',
    accidentType: 'flying',
    accidentTypeOther: '',
    description: '発破警戒位置で待避していたが、予想より飛石が飛んできて近くに落下した。ヘルメットを着用していたため無事だった。',
    cause: 'procedure',
    causeDetail: '穿孔曲がりの可能性があったが報告されていなかった',
    severityLevel: 'high',
    immediateAction: '待避位置の見直し、発破パターンの再検討',
    suggestedMeasure: '穿孔曲がり検出時の報告徹底、待避位置の再設定',
    reporterName: '田中次郎',
    reporterRole: 'worker',
    status: 'reviewing',
    aiAnalysis: {
      suggestedAccidentType: 'flying',
      confidence: 0.94,
      rootCauseAnalysis: '穿孔作業時の報告体制と待避距離の設定に問題があります。',
      recommendedMeasures: [
        '穿孔曲がり発生時の報告ルール明確化',
        '待避位置・距離の見直し',
        '飛石防護対策の強化'
      ],
      similarCases: [
        { id: 'case6', summary: '発破飛石による災害事例', similarity: 0.86 }
      ]
    },
    createdAt: '2024-10-08T12:00:00',
    updatedAt: '2024-10-09T09:00:00'
  },
  {
    id: '5',
    type: 'near_miss',
    reportDate: '2024-10-05',
    occurredAt: '2024-10-05T15:30:00',
    location: 'road',
    locationDetail: '運搬道路カーブ地点',
    accidentType: 'trip',
    accidentTypeOther: '',
    description: '運搬道路の巡視中、路面の凹凸でつまづいて転倒しそうになった。',
    cause: 'environment',
    causeDetail: '道路の補修が遅れていた',
    severityLevel: 'low',
    immediateAction: '注意喚起の表示設置',
    suggestedMeasure: '道路補修の実施',
    reporterName: '高橋美咲',
    reporterRole: 'worker',
    status: 'resolved',
    createdAt: '2024-10-05T16:00:00',
    updatedAt: '2024-10-06T10:00:00'
  },
  {
    id: '6',
    type: 'near_miss',
    reportDate: '2024-10-03',
    occurredAt: '2024-10-03T08:45:00',
    location: 'drilling',
    locationDetail: 'クローラードリル',
    accidentType: 'fall',
    accidentTypeOther: '',
    description: 'クローラードリルから降りる際、手すりが滑りやすくなっており、はしごから落ちそうになった。',
    cause: 'equipment',
    causeDetail: '手すりに油分が付着していた',
    severityLevel: 'medium',
    immediateAction: '手すりの清掃',
    suggestedMeasure: '滑り止めテープの貼付、始業前点検の強化',
    reporterName: '伊藤健太',
    reporterRole: 'worker',
    status: 'resolved',
    createdAt: '2024-10-03T09:30:00',
    updatedAt: '2024-10-04T11:00:00'
  },
  {
    id: '7',
    type: 'near_miss',
    reportDate: '2024-09-28',
    occurredAt: '2024-09-28T13:00:00',
    location: 'crushing',
    locationDetail: '一次クラッシャー',
    accidentType: 'flying',
    accidentTypeOther: '',
    description: '破砕作業中、鉱石の破片が飛散して保護メガネに当たった。保護具を着用していたため無事だった。',
    cause: 'environment',
    causeDetail: '飛散防止カバーの一部が破損していた',
    severityLevel: 'medium',
    immediateAction: 'カバーの応急修理',
    suggestedMeasure: 'カバーの交換、飛散防止対策の強化',
    reporterName: '渡辺誠',
    reporterRole: 'worker',
    status: 'reviewing',
    createdAt: '2024-09-28T14:00:00',
    updatedAt: '2024-09-29T10:00:00'
  },
  {
    id: '8',
    type: 'near_miss',
    reportDate: '2024-09-25',
    occurredAt: '2024-09-25T10:15:00',
    location: 'maintenance',
    locationDetail: '整備工場',
    accidentType: 'caught',
    accidentTypeOther: '',
    description: '機械整備中、回転部に衣服が触れそうになった。すぐに離れたため事なきを得た。',
    cause: 'human',
    causeDetail: '作業服のボタンが外れていた',
    severityLevel: 'medium',
    immediateAction: '作業服の点検、作業中止',
    suggestedMeasure: '始業前の服装点検の徹底、注意喚起',
    reporterName: '中村優子',
    reporterRole: 'worker',
    status: 'resolved',
    createdAt: '2024-09-25T11:00:00',
    updatedAt: '2024-09-26T09:00:00'
  }
];

// 統計データ生成
export function generateStatistics(reports: HiyariHatReport[]): Statistics {
  const byAccidentType: Record<string, number> = {
    fall: 0,
    caught: 0,
    flying: 0,
    trip: 0,
    other: 0,
  };

  const byLocation: Record<string, number> = {
    drilling: 0,
    blasting: 0,
    loading: 0,
    crushing: 0,
    maintenance: 0,
    office: 0,
    road: 0,
    other: 0,
  };

  const bySeverity: Record<string, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };

  const monthlyMap = new Map<string, { count: number; byType: Record<string, number> }>();

  reports.forEach(report => {
    byAccidentType[report.accidentType]++;
    byLocation[report.location]++;
    bySeverity[report.severityLevel]++;

    const month = report.occurredAt.substring(0, 7);
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, {
        count: 0,
        byType: { fall: 0, caught: 0, flying: 0, trip: 0, other: 0 },
      });
    }
    const monthData = monthlyMap.get(month)!;
    monthData.count++;
    monthData.byType[report.accidentType]++;
  });

  const byMonth = Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => ({
      month,
      count: data.count,
      byAccidentType: data.byType as Record<string, number>,
    }));

  return {
    totalReports: reports.length,
    byAccidentType: byAccidentType as Record<string, number>,
    byLocation: byLocation as Record<string, number>,
    bySeverity: bySeverity as Record<string, number>,
    byMonth: byMonth as any,
    trend: 'stable',
  };
}
