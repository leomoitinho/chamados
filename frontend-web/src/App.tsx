import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tickets } from './pages/Tickets';
import { UsersManagement } from './pages/Users';
import { CompaniesManagement } from './pages/Companies';
import { CategoriesPage } from './pages/Categories';
import { Profile } from './pages/Profile';
import { Layout } from './components/layout/Layout';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [ticketFilters, setTicketFilters] = useState<{
    status?: string;
    priority?: string;
    company?: string;
    my_tickets?: boolean;
  }>({});

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNavigateToTicketsWithFilters = (filters?: { status?: string; priority?: string; company?: string; my_tickets?: boolean }) => {
    setTicketFilters(filters || {});
    setCurrentTab('tickets');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="animate-spin w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full mb-4" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            key={refreshTrigger}
            onSelectTicket={(id) => setSelectedTicketId(id)}
            onNavigateToTickets={handleNavigateToTicketsWithFilters}
          />
        );
      case 'tickets':
        return (
          <Tickets
            key={`${refreshTrigger}-${ticketFilters.status || ''}-${ticketFilters.priority || ''}-${ticketFilters.company || ''}-${ticketFilters.my_tickets ? '1' : '0'}`}
            onSelectTicket={(id) => setSelectedTicketId(id)}
            initialStatus={ticketFilters.status}
            initialPriority={ticketFilters.priority}
            initialCompany={ticketFilters.company}
            initialMyTickets={ticketFilters.my_tickets}
            onOpenNewTicket={() => {
              // Handled through layout button or tab
            }}
          />
        );
      case 'users':
        return <UsersManagement key={refreshTrigger} />;
      case 'companies':
        return <CompaniesManagement key={refreshTrigger} />;
      case 'categories':
        return <CategoriesPage key={refreshTrigger} />;
      case 'profile':
        return <Profile key={refreshTrigger} />;
      default:
        return (
          <Dashboard
            key={refreshTrigger}
            onSelectTicket={(id) => setSelectedTicketId(id)}
            onNavigateToTickets={handleNavigateToTicketsWithFilters}
          />
        );
    }
  };

  return (
    <Layout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      selectedTicketId={selectedTicketId}
      setSelectedTicketId={setSelectedTicketId}
      onRefreshData={triggerRefresh}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
