import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ReportForm } from './components/ReportForm';
import { ReportList } from './components/ReportList';
import { Analysis } from './components/Analysis';
import { RADashboard } from './components/ra/RADashboard';
import { RAList } from './components/ra/RAList';
import { RAForm } from './components/ra/RAForm';
import { PlanDashboard } from './components/plan/PlanDashboard';
import { PlanList } from './components/plan/PlanList';
import { PlanForm } from './components/plan/PlanForm';
import { GanttChart } from './components/plan/GanttChart';
import { MeetingDashboard } from './components/meeting/MeetingDashboard';
import { MeetingList } from './components/meeting/MeetingList';
import { MeetingForm } from './components/meeting/MeetingForm';
import { DiagnosisForm } from './components/meeting/DiagnosisForm';
import { IntegratedDashboard } from './components/IntegratedDashboard';
import { ApiKeySettings } from './components/ApiKeySettings';
import { AILogViewer } from './components/AILogViewer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { sampleReports } from './data/sampleData';
import { sampleRAItems } from './data/raData';
import { sampleAnnualPlan } from './data/planData';
import { sampleMeetings, sampleDiagnosisRecords } from './data/meetingData';
import { HiyariHatReport } from './types';
import { RiskAssessmentItem } from './types/ra';
import { AnnualSafetyPlan, PlanItem } from './types/plan';
import { SafetyMeeting, DiagnosisRecord } from './types/meeting';
import { CheckCircle } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [reports, setReports] = useLocalStorage<HiyariHatReport[]>('hiyari-hat-reports', sampleReports);
  const [raItems, setRAItems] = useLocalStorage<RiskAssessmentItem[]>('ra-items', sampleRAItems);
  const [annualPlan, setAnnualPlan] = useLocalStorage<AnnualSafetyPlan>('annual-plan', sampleAnnualPlan);
  const [meetings, setMeetings] = useLocalStorage<SafetyMeeting[]>('safety-meetings', sampleMeetings);
  const [diagnosisRecords, setDiagnosisRecords] = useLocalStorage<DiagnosisRecord[]>('diagnosis-records', sampleDiagnosisRecords);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [showLogViewer, setShowLogViewer] = useState(false);

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page);
  }, []);

  const showSuccessModal = (message: string, redirectTo: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCurrentPage(redirectTo);
    }, 2000);
  };

  const handleSubmitReport = useCallback((report: HiyariHatReport) => {
    setReports(prev => [report, ...prev]);
    showSuccessModal('報告を送信しました', 'dashboard');
  }, [setReports]);

  const handleUpdateStatus = useCallback((id: string, status: HiyariHatReport['status']) => {
    setReports(prev => prev.map(r => 
      r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
    ));
  }, [setReports]);

  const handleSubmitRA = useCallback((item: RiskAssessmentItem) => {
    setRAItems(prev => [item, ...prev]);
    showSuccessModal('RA項目を保存しました', 'ra');
  }, [setRAItems]);

  const handleUpdateRAItem = useCallback((item: RiskAssessmentItem) => {
    setRAItems(prev => prev.map(i => 
      i.id === item.id ? { ...item, updatedAt: new Date().toISOString() } : i
    ));
  }, [setRAItems]);

  // Plan handlers
  const handleSubmitPlanItem = useCallback((item: PlanItem) => {
    setAnnualPlan(prev => ({
      ...prev,
      planItems: [item, ...prev.planItems.filter(i => i.id !== item.id)],
      updatedAt: new Date().toISOString()
    }));
    showSuccessModal('計画項目を保存しました', 'plan');
  }, [setAnnualPlan]);

  const handleUpdatePlanProgress = useCallback((itemId: string, month: number, completed: boolean) => {
    setAnnualPlan(prev => ({
      ...prev,
      planItems: prev.planItems.map(item => 
        item.id === itemId 
          ? {
              ...item,
              schedule: item.schedule.map(s => 
                s.month === month 
                  ? { ...s, completed, completedDate: completed ? new Date().toISOString().split('T')[0] : undefined }
                  : s
              ),
              updatedAt: new Date().toISOString()
            }
          : item
      ),
      updatedAt: new Date().toISOString()
    }));
  }, [setAnnualPlan]);

  // Meeting handlers
  const handleSubmitMeeting = useCallback((meeting: SafetyMeeting) => {
    setMeetings(prev => {
      const exists = prev.find(m => m.id === meeting.id);
      if (exists) {
        return prev.map(m => m.id === meeting.id ? meeting : m);
      }
      return [meeting, ...prev];
    });
    showSuccessModal('会議記録を保存しました', 'meeting');
  }, [setMeetings]);

  const handleUpdateActionStatus = useCallback((meetingId: string, actionId: string, status: 'pending' | 'in_progress' | 'completed') => {
    setMeetings(prev => prev.map(m => 
      m.id === meetingId 
        ? {
            ...m,
            actionItems: m.actionItems.map(a => 
              a.id === actionId 
                ? { ...a, status, completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined }
                : a
            ),
            updatedAt: new Date().toISOString()
          }
        : m
    ));
  }, [setMeetings]);

  const handleSubmitDiagnosis = useCallback((record: DiagnosisRecord) => {
    setDiagnosisRecords(prev => {
      const exists = prev.find(r => r.id === record.id);
      if (exists) {
        return prev.map(r => r.id === record.id ? record : r);
      }
      return [record, ...prev];
    });
    showSuccessModal('自己診断を保存しました', 'meeting');
  }, [setDiagnosisRecords]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <IntegratedDashboard
            reports={reports}
            raItems={raItems}
            annualPlan={annualPlan}
            meetings={meetings}
            diagnosisRecords={diagnosisRecords}
            onNavigate={handleNavigate}
          />
        );
      case 'hiyari':
        return <Dashboard reports={reports} onNavigate={handleNavigate} />;
      case 'report':
        return (
          <ReportForm 
            onSubmit={handleSubmitReport} 
            onCancel={() => setCurrentPage('dashboard')} 
          />
        );
      case 'list':
        return (
          <ReportList 
            reports={reports} 
            onSelectReport={(report) => console.log('Selected:', report)}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      case 'analysis':
        return <Analysis reports={reports} />;
      case 'ra':
        return <RADashboard items={raItems} onNavigate={handleNavigate} />;
      case 'ra-list':
        return (
          <RAList
            items={raItems}
            onSelectItem={(item) => console.log('Selected RA:', item)}
            onUpdateItem={handleUpdateRAItem}
          />
        );
      case 'ra-new':
        return (
          <RAForm
            onSubmit={handleSubmitRA}
            onCancel={() => setCurrentPage('ra')}
            hiyariReports={reports}
          />
        );
      case 'plan':
        return <PlanDashboard plan={annualPlan} onNavigate={handleNavigate} />;
      case 'plan-list':
        return (
          <PlanList
            items={annualPlan.planItems}
            onSelectItem={(item) => console.log('Selected Plan:', item)}
            onUpdateProgress={handleUpdatePlanProgress}
          />
        );
      case 'plan-new':
        return (
          <PlanForm
            onSubmit={handleSubmitPlanItem}
            onCancel={() => setCurrentPage('plan')}
          />
        );
      case 'plan-gantt':
        return (
          <GanttChart
            items={annualPlan.planItems}
            fiscalYear={annualPlan.fiscalYear}
            onNavigate={handleNavigate}
          />
        );
      case 'meeting':
        return (
          <MeetingDashboard
            meetings={meetings}
            diagnosisRecords={diagnosisRecords}
            onNavigate={handleNavigate}
          />
        );
      case 'meeting-list':
        return (
          <MeetingList
            meetings={meetings}
            onSelectMeeting={(meeting) => console.log('Selected Meeting:', meeting)}
            onUpdateActionStatus={handleUpdateActionStatus}
          />
        );
      case 'meeting-new':
        return (
          <MeetingForm
            onSubmit={handleSubmitMeeting}
            onCancel={() => setCurrentPage('meeting')}
          />
        );
      case 'diagnosis-new':
        return (
          <DiagnosisForm
            onSubmit={handleSubmitDiagnosis}
            onCancel={() => setCurrentPage('meeting')}
            onOpenApiSettings={() => setShowApiSettings(true)}
          />
        );
      default:
        return (
          <IntegratedDashboard
            reports={reports}
            raItems={raItems}
            annualPlan={annualPlan}
            meetings={meetings}
            diagnosisRecords={diagnosisRecords}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <>
      <Layout 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        onOpenSettings={() => setShowApiSettings(true)}
      >
        {renderPage()}
      </Layout>

      {/* 送信成功メッセージ */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center animate-pulse">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-success-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{successMessage}</h3>
            <p className="text-gray-600 mt-2">ありがとうございます</p>
          </div>
        </div>
      )}

      {/* APIキー設定モーダル */}
      {showApiSettings && (
        <ApiKeySettings 
          onClose={() => setShowApiSettings(false)} 
          onOpenLogViewer={() => {
            setShowApiSettings(false);
            setShowLogViewer(true);
          }}
        />
      )}

      {/* ログビューワー */}
      {showLogViewer && (
        <AILogViewer onClose={() => setShowLogViewer(false)} />
      )}
    </>
  );
}

export default App;
