import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  TrendingUp, LayoutDashboard, Monitor, Layers, ListOrdered, 
  History, Star, LineChart, Radio, Calendar, Wallet, 
  ArrowDownCircle, ArrowUpCircle, Receipt, UserCheck, 
  Bell, FileText, LifeBuoy, User, Settings, Shield, ChevronLeft, ChevronRight
} from 'lucide-react';

export const TraderSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navGroups = [
    {
      title: 'Trading Core',
      items: [
        { label: 'Overview', to: '/trader/overview', icon: LayoutDashboard },
        { label: 'Trading Terminal', to: '/trader/terminal', icon: Monitor, badge: 'Simulated Ticks' },
        { label: 'Trading Accounts', to: '/trader/accounts', icon: Layers },
        { label: 'Open Positions', to: '/trader/positions', icon: ListOrdered },
        { label: 'Pending Orders', to: '/trader/pending-orders', icon: Receipt },
        { label: 'Trade History', to: '/trader/history', icon: History },
        { label: 'Watchlist', to: '/trader/watchlist', icon: Star },
      ]
    },
    {
      title: 'Market Intelligence',
      items: [
        { label: 'Market Analysis', to: '/trader/analysis', icon: LineChart },
        { label: 'Trading Signals', to: '/trader/signals', icon: Radio },
        { label: 'Economic Calendar', to: '/trader/calendar', icon: Calendar },
      ]
    },
    {
      title: 'Live Funds & Finance',
      items: [
        { label: 'Wallet Ledger', to: '/trader/wallet', icon: Wallet },
        { label: 'Add Funds (Live)', to: '/trader/deposit', icon: ArrowDownCircle },
        { label: 'Withdraw (Live)', to: '/trader/withdrawal', icon: ArrowUpCircle },
        { label: 'Transactions', to: '/trader/transactions', icon: Receipt },
      ]
    },
    {
      title: 'Account & Support',
      items: [
        { label: 'Verification / KYC', to: '/trader/kyc', icon: UserCheck },
        { label: 'Notifications', to: '/trader/notifications', icon: Bell },
        { label: 'Performance Reports', to: '/trader/reports', icon: FileText },
        { label: 'Support Tickets', to: '/trader/tickets', icon: LifeBuoy },
        { label: 'Profile', to: '/trader/profile', icon: User },
        { label: 'Account Settings', to: '/trader/settings', icon: Settings },
        { label: 'Security & 2FA', to: '/trader/security', icon: Shield },
      ]
    }
  ];

  return (
    <aside
      className={`bg-[#111827] border-r border-slate-800 flex flex-col transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand & Collapse Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-800">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2 font-bold text-white tracking-wide">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-sm font-extrabold tracking-wider">NEXTRADE<span className="text-blue-500">FX</span></span>
          </Link>
        )}

        {collapsed && (
          <div className="mx-auto w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white">
            <TrendingUp className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navGroups.map((group, gIdx) => (
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
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-[#151F30]'
                      } ${collapsed ? 'justify-center px-0' : ''}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
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

      {/* Demo Account Indicator in Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800 bg-[#0B1220]/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Trading Mode:</span>
            <span className="text-amber-400 font-semibold uppercase tracking-wider">SIMULATED DEMO</span>
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            Zero real monetary risk. Simulated order matching.
          </div>
        </div>
      )}
    </aside>
  );
};
