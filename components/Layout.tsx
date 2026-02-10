
import React from 'react';
import { Home, Bell, User, LayoutGrid, Search, MessageSquareCode } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'schemes' | 'chat' | 'notifications' | 'profile';
  setActiveTab: (tab: any) => void;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, title }) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 overflow-hidden shadow-2xl relative">
      {/* Top Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        <div className="flex gap-3">
          <button className="p-2 hover:bg-blue-600 rounded-full transition-colors">
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 p-4 scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around items-center py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 px-2">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-blue-700 scale-110' : 'text-gray-400'}`}
        >
          <Home size={22} />
          <span className="text-[10px] font-bold uppercase">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('schemes')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'schemes' ? 'text-blue-700 scale-110' : 'text-gray-400'}`}
        >
          <LayoutGrid size={22} />
          <span className="text-[10px] font-bold uppercase">Schemes</span>
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'chat' ? 'text-blue-700 scale-110' : 'text-gray-400'}`}
        >
          <div className="relative">
             <MessageSquareCode size={22} />
             <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <span className="text-[10px] font-bold uppercase">AI Help</span>
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'notifications' ? 'text-blue-700 scale-110' : 'text-gray-400'}`}
        >
          <div className="relative">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">2</span>
          </div>
          <span className="text-[10px] font-bold uppercase">Alerts</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-blue-700 scale-110' : 'text-gray-400'}`}
        >
          <User size={22} />
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
