import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TraderSidebar } from '../components/layout/TraderSidebar';
import { TraderNavbar } from '../components/layout/TraderNavbar';
import { ResetDemoModal } from '../components/common/ResetDemoModal';

export const TraderLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1220] text-[#F8FAFC] overflow-x-hidden">
      <div className="flex-1 flex min-w-0">
        <TraderSidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TraderNavbar onOpenMobileMenu={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0B1220] p-3 sm:p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <ResetDemoModal />
    </div>
  );
};
