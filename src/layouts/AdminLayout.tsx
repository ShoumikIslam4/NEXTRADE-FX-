import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminNavbar } from '../components/layout/AdminNavbar';

export const AdminLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full max-w-full flex flex-col bg-[#0B1220] text-[#F8FAFC] overflow-x-clip">
      <div className="flex-1 flex min-w-0">
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 max-w-full">
          <AdminNavbar onOpenMobileMenu={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 min-w-0 max-w-full overflow-y-auto overflow-x-clip bg-[#0B1220] p-3 sm:p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
