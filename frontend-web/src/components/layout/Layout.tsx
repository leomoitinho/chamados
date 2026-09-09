import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { NewTicketModal } from '../tickets/NewTicketModal';
import { TicketDetailModal } from '../tickets/TicketDetailModal';

interface LayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedTicketId: number | null;
  setSelectedTicketId: (id: number | null) => void;
  children: React.ReactNode;
  onRefreshData?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  setCurrentTab,
  selectedTicketId,
  setSelectedTicketId,
  children,
  onRefreshData
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <Navbar
          currentTab={currentTab}
          setIsMobileOpen={setIsMobileOpen}
          onOpenNewTicket={() => setIsNewTicketOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onTicketCreated={() => {
          if (onRefreshData) onRefreshData();
        }}
      />

      {/* Global Ticket Detail Modal */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdated={() => {
            if (onRefreshData) onRefreshData();
          }}
        />
      )}
    </div>
  );
};
