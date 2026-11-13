import React from 'react';
import { Outlet } from 'react-router-dom';
import { TraderSidebar } from '../components/layout/TraderSidebar';
import { TraderNavbar } from '../components/layout/TraderNavbar';
import { ResetDemoModal } from '../components/common/ResetDemoModal';

export const TraderLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B1220] text-[#F8FAFC]">
      <div className="flex-1 flex overflow-hidden">
        <TraderSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TraderNavbar />
          <main className="flex-1 overflow-y-auto bg-[#0B1220] p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <ResetDemoModal />
    </div>
  );
};
