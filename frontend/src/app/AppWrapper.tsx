import { useState } from 'react';
import { MessageSquare, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';
import App from './App';
import AdminDashboard from './AdminDashboard';

type ViewType = 'chat' | 'dashboard';

export default function AppWrapper() {
  const [currentView, setCurrentView] = useState<ViewType>('chat');

  return (
    <div className="size-full flex flex-col overflow-hidden">
      {/* View Toggle Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-center">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              currentView === 'chat'
                ? 'bg-white text-[#2A6EBB] shadow-sm'
                : 'text-[#004165] hover:text-[#2A6EBB]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">Chat</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              currentView === 'dashboard'
                ? 'bg-white text-[#2A6EBB] shadow-sm'
                : 'text-[#004165] hover:text-[#2A6EBB]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'chat' ? <App /> : <AdminDashboard />}
      </div>
    </div>
  );
}
