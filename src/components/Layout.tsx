import React from 'react';
import { 
  AlertTriangle, 
  BarChart3, 
  Calendar,
  ClipboardCheck,
  FileText, 
  Home,
  PlusCircle,
  Settings,
  Shield,
  Users
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenSettings?: () => void;
}

export function Layout({ children, currentPage, onNavigate, onOpenSettings }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Home },
    { id: 'report', label: '新規報告', icon: PlusCircle },
    { id: 'list', label: '報告一覧', icon: FileText },
    { id: 'analysis', label: '分析', icon: BarChart3 },
    { id: 'ra', label: 'リスクアセスメント', icon: ClipboardCheck },
    { id: 'plan', label: '年間計画', icon: Calendar },
    { id: 'meeting', label: '会議・診断', icon: Users },
  ];

  const isRAPage = currentPage.startsWith('ra');
  const isPlanPage = currentPage.startsWith('plan');
  const isMeetingPage = currentPage.startsWith('meeting') || currentPage.startsWith('diagnosis');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-primary-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-lg font-bold">鉱山保安マネジメントシステム</h1>
                <p className="text-xs text-primary-200">PDCA支援ツール</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">A鉱山</p>
                <p className="text-xs text-primary-200">保安管理者</p>
              </div>
              <button 
                onClick={onOpenSettings}
                className="p-2 hover:bg-primary-600 rounded-lg transition-colors"
                title="AI設定"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* PDCAインジケーター */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-gray-500">PDCA:</span>
            <span className={`px-2 py-1 rounded ${isRAPage || isPlanPage ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-500'}`}>
              P 計画
            </span>
            <span className="text-gray-300">→</span>
            <span className={`px-2 py-1 rounded ${currentPage === 'report' || currentPage === 'list' ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-500'}`}>
              D 実施
            </span>
            <span className="text-gray-300">→</span>
            <span className={`px-2 py-1 rounded ${currentPage === 'analysis' || isMeetingPage ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-500'}`}>
              C 評価
            </span>
            <span className="text-gray-300">→</span>
            <span className={`px-2 py-1 rounded ${isMeetingPage ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-500'}`}>
              A 改善
            </span>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id || 
                (item.id === 'ra' && currentPage.startsWith('ra')) ||
                (item.id === 'plan' && currentPage.startsWith('plan')) ||
                (item.id === 'meeting' && (currentPage.startsWith('meeting') || currentPage.startsWith('diagnosis')));
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                    border-b-2 -mb-px
                    ${isActive 
                      ? 'border-primary-600 text-primary-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>© 2024 鉱山保安マネジメントシステム</p>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-500" />
              <span>PDCAサイクルで安全を守る</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
