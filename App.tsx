
import React, { useState, useCallback } from 'react';
import { User, UserRole } from './types';
import LoginPage from './components/Auth/LoginPage';
import PatientDashboard from './components/Patient/PatientDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import { getCurrentUser, logout } from './services/mockApi';

const App: React.FC = () => {
  // In a real app, you'd likely use a context or library for auth state.
  // We check the mock API to see if a user is "logged in".
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setCurrentUser(null);
  }, []);

  const renderContent = () => {
    if (!currentUser) {
      return <LoginPage onLogin={handleLogin} />;
    }
    
    switch (currentUser.role) {
      case UserRole.Patient:
        return <PatientDashboard user={currentUser} onLogout={handleLogout} />;
      case UserRole.Admin:
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="bg-brand-gray-light min-h-screen font-sans text-gray-800">
      {renderContent()}
    </div>
  );
};

export default App;
   