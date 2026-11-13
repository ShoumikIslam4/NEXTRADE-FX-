import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  TrendingUp, LayoutDashboard, Monitor, Layers, ListOrdered,
  History, Star, LineChart, Radio, Calendar, Wallet,
  ArrowDownCircle, ArrowUpCircle, Receipt, UserCheck,
  Bell, FileText, LifeBuoy, User, Settings, Shield, ChevronLeft, ChevronRight,
  Gift, X
} from 'lucide-react';

interface TraderSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const TraderSidebar: React.FC<TraderSidebarProps> = ({ mobileOpen = false, onClose }) => {
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
      title: 'Funds & Finance',
      items: [
        { label: 'Wallet Ledger', to: '/trader/wallet', icon: Wallet },
        { label: 'Deposit', to: '/trader/deposit', icon: ArrowDownCircle },
        { label: 'Withdraw', to: '/trader/withdrawal', icon: ArrowUpCircle },
        { label: 'Transactions', to: '/trader/transactions', icon: Receipt },
      ]
    },
    {
      title: 'Account & Support',
      items: [
        { label: 'Refer & Earn', to: '/trader/referrals', icon: Gift },
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

  const isCollapsedDesktop = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:static bg-[#111827] border-r border-slate-800 flex flex-col transition-all duration-300 shrink-0 ${
          mobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsedDesktop ? 'lg:w-16' : 'lg:w-64'}`}
      >
        {/* Brand & Collapse Header */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-800">
          {!isCollapsedDesktop && (
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-2 font-bold text-white tracking-wide"
            >
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-sm font-extrabold tracking-wider">
                NEXTRADE<span className="text-blue-500">FX</span>
              </span>
            </Link>
          )}

          {isCollapsedDesktop && (
            <div className="mx-auto w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white">
              <TrendingUp className="w-4 h-4" />
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:inline-flex p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsedDesktop && (
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
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2.5 py-2 lg:py-1.5 rounded-md text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-[#151F30]'
                        } ${isCollapsedDesktop ? 'justify-center px-0' : ''}`
                      }
                      title={isCollapsedDesktop ? item.label : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isCollapsedDesktop && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {!isCollapsedDesktop && item.badge && (
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

        {/* Footer Mode Notice */}
        {!isCollapsedDesktop && (
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
    </>
  );
};
