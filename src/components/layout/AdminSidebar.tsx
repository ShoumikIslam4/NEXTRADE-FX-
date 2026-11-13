import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionCategory } from '../../types/admin';
import { 
  ShieldCheck, LayoutDashboard, Users, FileCheck, Layers, 
  Activity, ListOrdered, Receipt, ArrowDownCircle, ArrowUpCircle, 
  CreditCard, Sliders, DollarSign, Percent, Radio, 
  Newspaper, Calendar, GraduationCap, LifeBuoy, Bell, 
  BarChart3, Globe, UserCog, Key, ScrollText, Settings, 
  ChevronLeft, ChevronRight, Eye
} from 'lucide-react';

interface AdminNavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: PermissionCategory;
  badge?: string;
}

export const AdminSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, hasPermission } = useAuth();

  const groups: Array<{ title: string; items: AdminNavItem[] }> = [
    {
      title: 'Administration',
      items: [
        { label: 'Admin Overview', to: '/admin/overview', icon: LayoutDashboard, permission: 'Dashboard' },
        { label: 'Reports & Analytics', to: '/admin/reports', icon: BarChart3, permission: 'Reports' },
      ]
    },
    {
      title: 'Users & Compliance',
      items: [
        { label: 'User Management', to: '/admin/users', icon: Users, permission: 'Users' },
        { label: 'KYC Management', to: '/admin/kyc', icon: FileCheck, permission: 'KYC' },
        { label: 'Trading Accounts', to: '/admin/accounts', icon: Layers, permission: 'Accounts' },
      ]
    },
    {
      title: 'Dealing & Risk Monitor',
      items: [
        { label: 'Trading Monitor', to: '/admin/monitor', icon: Activity, permission: 'Trading' },
        { label: 'Orders Management', to: '/admin/orders', icon: ListOrdered, permission: 'Trading' },
        { label: 'Open Positions', to: '/admin/positions', icon: Eye, permission: 'Trading' },
      ]
    },
    {
      title: 'Finance & Payments',
      items: [
        { label: 'All Transactions', to: '/admin/transactions', icon: Receipt, permission: 'Deposits' },
        { label: 'Deposits', to: '/admin/deposits', icon: ArrowDownCircle, permission: 'Deposits' },
        { label: 'Withdrawals', to: '/admin/withdrawals', icon: ArrowUpCircle, permission: 'Withdrawals' },
        { label: 'Payment Gateways', to: '/admin/payment-methods', icon: CreditCard, permission: 'Payment Methods' },
      ]
    },
    {
      title: 'Broker Configurations',
      items: [
        { label: 'Currency Pairs', to: '/admin/currency-pairs', icon: Sliders, permission: 'Markets' },
        { label: 'Spread Management', to: '/admin/spreads', icon: Sliders, permission: 'Markets' },
        { label: 'Leverage Settings', to: '/admin/leverage', icon: Percent, permission: 'Trading' },
        { label: 'Commission Rules', to: '/admin/commissions', icon: DollarSign, permission: 'Trading' },
      ]
    },
    {
      title: 'Content & Research',
      items: [
        { label: 'Trading Signals', to: '/admin/signals', icon: Radio, permission: 'Markets' },
        { label: 'Market News', to: '/admin/news', icon: Newspaper, permission: 'CMS' },
        { label: 'Economic Calendar', to: '/admin/calendar', icon: Calendar, permission: 'CMS' },
        { label: 'Education Hub', to: '/admin/education', icon: GraduationCap, permission: 'CMS' },
        { label: 'CMS Website Content', to: '/admin/cms', icon: Globe, permission: 'CMS' },
      ]
    },
    {
      title: 'System & Security',
      items: [
        { label: 'Support Tickets', to: '/admin/tickets', icon: LifeBuoy, permission: 'Support' },
        { label: 'System Notifications', to: '/admin/notifications', icon: Bell, permission: 'Notifications' },
        { label: 'Staff Management', to: '/admin/staff', icon: UserCog, permission: 'Staff' },
        { label: 'Roles & Permissions', to: '/admin/roles', icon: Key, permission: 'Roles' },
        { label: 'Audit Logs', to: '/admin/audit-logs', icon: ScrollText, permission: 'Audit Logs' },
        { label: 'General Settings', to: '/admin/settings', icon: Settings, permission: 'Website Settings' },
      ]
    }
  ];

  const visibleGroups = groups
    .map(g => ({
      ...g,
      items: g.items.filter(item => hasPermission(item.permission))
    }))
    .filter(g => g.items.length > 0);

  return (
    <aside
      className={`bg-[#111827] border-r border-slate-800 flex flex-col transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Admin Brand & Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-800">
        {!collapsed && (
          <Link to="/admin" className="flex items-center gap-2 font-bold text-white tracking-wide">
            <div className="w-7 h-7 rounded bg-amber-600 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-white">NEXTRADE <span className="text-amber-400">ADMIN</span></div>
              <div className="text-[9px] text-slate-500 font-mono">BACK-OFFICE SUITE</div>
            </div>
          </Link>
        )}

        {collapsed && (
          <div className="mx-auto w-7 h-7 rounded bg-amber-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Admin Sidebar"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {visibleGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {group.title}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={idx}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#151F30]'
                      } ${collapsed ? 'justify-center px-0' : ''}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Mode Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800 bg-[#0B1220]/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Role:</span>
            <span className="text-emerald-400 font-semibold uppercase tracking-wider font-mono text-[10px]">
              {(user?.role || 'STAFF').replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {user?.staffProfile?.jobTitle || 'Role-based back-office governance.'}
          </div>
        </div>
      )}
    </aside>
  );
};
