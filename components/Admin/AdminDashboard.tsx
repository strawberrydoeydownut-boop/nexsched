
import React, { useState } from 'react';
import { User } from '../../types';
import Header from '../Layout/Header';
import FullCalendar from './FullCalendar';
import Reports from './Reports';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type AdminView = 'calendar' | 'reports';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<AdminView>('calendar');

  return (
    <div>
      <Header user={user} onLogout={onLogout} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveView('calendar')}
              className={`${
                activeView === 'calendar'
                  ? 'border-brand-blue text-brand-blue-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Calendar Dashboard
            </button>
            <button
              onClick={() => setActiveView('reports')}
              className={`${
                activeView === 'reports'
                  ? 'border-brand-blue text-brand-blue-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Reports
            </button>
          </nav>
        </div>

        <div>
            {activeView === 'calendar' && <FullCalendar />}
            {activeView === 'reports' && <Reports />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
   