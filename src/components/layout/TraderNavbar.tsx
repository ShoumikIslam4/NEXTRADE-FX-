import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTrading } from '../../contexts/TradingContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bell, Sun, Moon, ChevronDown, PlusCircle,
  LogOut, Menu
} from 'lucide-react';

interface BackendNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  read: boolean;
  createdAt: string;
}

interface TraderNavbarProps {
  onOpenMobileMenu?: () => void;
}

export const TraderNavbar: React.FC<TraderNavbarProps> = ({ onOpenMobileMenu }) => {
  const { activeAccount, accounts, switchAccount, totalFloatingProfit } = useTrading();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isStaffOrAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);

  const fetchNotifications = useCallback(() => {
    const token = localStorage.getItem('nextrade_token');
    fetch('/api/user/notifications', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include'
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [location.pathname, fetchNotifications]);

  useEffect(() => {
    const handler = () => fetchNotifications();
    window.addEventListener('nextrade:notifications-updated', handler);
    return () => window.removeEventListener('nextrade:notifications-updated', handler);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Derive route title
  const path = location.pathname;
  let pageTitle = 'Trader Overview';
  if (path.includes('terminal')) pageTitle = 'Trading Terminal';
  else if (path.includes('accounts')) pageTitle = 'Trading Accounts';
  else if (path.includes('positions')) pageTitle = 'Open Positions';
  else if (path.includes('pending')) pageTitle = 'Pending Orders';
  else if (path.includes('history')) pageTitle = 'Trade History';
  else if (path.includes('watchlist')) pageTitle = 'Watchlist & Quotes';
  else if (path.includes('analysis')) pageTitle = 'Market Analysis';
  else if (path.includes('signals')) pageTitle = 'Trading Signals';
  else if (path.includes('calendar')) pageTitle = 'Economic Calendar';
  else if (path.includes('wallet')) pageTitle = 'Wallet Ledger';
  else if (path.includes('deposit')) pageTitle = 'Deposit';
  else if (path.includes('withdrawal')) pageTitle = 'Withdraw';
  else if (path.includes('transactions')) pageTitle = 'Financial Ledger';
  else if (path.includes('referrals')) pageTitle = 'Refer & Earn';
  else if (path.includes('kyc')) pageTitle = 'KYC Verification';
  else if (path.includes('notifications')) pageTitle = 'System Notifications';
  else if (path.includes('reports')) pageTitle = 'Performance Reports';
  else if (path.includes('tickets')) pageTitle = 'Support Tickets';
  else if (path.includes('profile')) pageTitle = 'Trader Profile';
  else if (path.includes('settings')) pageTitle = 'Account Settings';
  else if (path.includes('security')) pageTitle = 'Security & 2FA';

  const isDemo = activeAccount.mode === 'DEMO';
  const kycBadge =
    user?.kycStatus === 'APPROVED'
      ? 'KYC Approved'
      : user?.kycStatus === 'PENDING'
      ? 'KYC Under Review'
      : user?.kycStatus === 'ADDITIONAL_INFO_REQUIRED'
      ? 'Info Requested'
      : user?.kycStatus === 'REJECTED'
      ? 'KYC Rejected'
      : 'Not Applied';

  return (
    <header className="h-14 bg-[#111827] border-b border-slate-800 flex items-center justify-between px-3 sm:px-4 z-20 gap-2 sm:gap-3">
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 -ml-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-xs font-semibold text-slate-400 hidden sm:inline">Trader Portal /</div>
        <h1 className="text-xs sm:text-sm font-bold text-white truncate">{pageTitle}</h1>
      </div>

      {/* Center: Live Financial KPI Strip */}
      <div className="hidden xl:flex items-center gap-6 text-xs tabular-nums">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">
            Balance ({isDemo ? 'DEMO/SIMULATED' : 'LIVE'}):
          </span>
          <span className="font-semibold text-white">
            ${activeAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Equity:</span>
          <span className="font-semibold text-white">
            ${activeAccount.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Floating P/L:</span>
          <span className={`font-semibold ${totalFloatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalFloatingProfit >= 0 ? '+' : ''}${totalFloatingProfit.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Free Margin:</span>
          <span className="font-semibold text-slate-300">
            ${activeAccount.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Right: Account Switcher & Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Clean Deposit CTA (no Demo/Live tag) */}
        <button
          onClick={() => navigate('/trader/deposit')}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 rounded transition-colors whitespace-nowrap"
          title="Deposit via bKash, Nagad or Rocket"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Deposit</span>
        </button>

        {/* Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setAccountMenuOpen(!accountMenuOpen);
              setNotificationsOpen(false);
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-2 py-1 text-xs bg-[#151F30] border border-slate-700 hover:border-slate-600 rounded text-slate-200 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full ${isDemo ? 'bg-blue-400' : 'bg-amber-400'}`} />
            <div className="text-left font-mono flex items-center gap-1">
              <span
                className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                  isDemo ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {isDemo ? 'DEMO' : 'LIVE'}
              </span>
              <span className="font-bold hidden sm:inline">{activeAccount.accountNumber}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {accountMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-[calc(100vw-1.5rem)] max-w-80 bg-[#151F30] border border-slate-700 rounded-lg shadow-2xl p-2 z-50 space-y-2">
              {/* Demo Account Section (Single $1,000 Account) */}
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                  <span>Demo Account (SIMULATED)</span>
                  <span className="text-blue-400 font-mono">1× $1,000 Limit</span>
                </div>
                {accounts
                  .filter((a) => a.mode === 'DEMO')
                  .map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        switchAccount(acc.id);
                        setAccountMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded text-xs transition-colors flex items-center justify-between ${
                        acc.id === activeAccount.id
                          ? 'bg-blue-600/20 text-blue-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-mono flex items-center gap-1.5">
                          <span>{acc.accountNumber}</span>
                          {acc.id === activeAccount.id && (
                            <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-400">ACTIVE</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {acc.type} · {acc.leverage}
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px] font-bold text-white">
                        ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <span className="block text-[9px] text-blue-400 font-normal">SIMULATED</span>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Live Account Section */}
              <div className="pt-1 border-t border-slate-800">
                <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                  <span>Live Trading Account</span>
                  <span className="text-amber-400 font-mono">{kycBadge}</span>
                </div>
                {accounts
                  .filter((a) => a.mode === 'LIVE')
                  .map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        switchAccount(acc.id);
                        setAccountMenuOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded text-xs transition-colors flex items-center justify-between ${
                        acc.id === activeAccount.id
                          ? 'bg-amber-600/20 text-amber-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-mono flex items-center gap-1.5">
                          <span>{acc.accountNumber}</span>
                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-400">
                            {user?.kycStatus === 'APPROVED' ? 'FUNDING READY' : acc.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {acc.type} · {acc.leverage}
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px] font-bold text-white">
                        ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <span className="block text-[9px] text-amber-400 font-normal">Exec Disabled</span>
                      </div>
                    </button>
                  ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between px-2">
                <Link
                  to="/trader/accounts?tab=live"
                  onClick={() => setAccountMenuOpen(false)}
                  className="text-[11px] text-emerald-400 hover:underline font-semibold"
                >
                  Live Onboarding
                </Link>
                <Link
                  to="/trader/accounts"
                  onClick={() => setAccountMenuOpen(false)}
                  className="text-[11px] text-blue-400 hover:underline font-semibold"
                >
                  Manage Accounts
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Notifications bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setAccountMenuOpen(false);
              setUserMenuOpen(false);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />}
          </button>

          {notificationsOpen && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-full sm:mt-1.5 w-[calc(100vw-1.5rem)] sm:w-80 bg-[#151F30] border border-slate-700 rounded-lg shadow-2xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="font-semibold text-white">
                  Notifications {unreadCount > 0 ? `(${unreadCount} new)` : ''}
                </span>
                <Link
                  to="/trader/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-2 rounded bg-[#0B1220]/60 border border-slate-800 text-slate-400 text-[11px]">
                    No recent system notifications. Account &amp; trade alerts will appear here.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded border ${
                        n.read ? 'bg-[#0B1220]/40 border-slate-800' : 'bg-blue-950/30 border-blue-500/30'
                      }`}
                    >
                      <div className="font-semibold text-slate-200 flex items-center justify-between gap-2">
                        <span className="truncate">{n.title}</span>
                        <span className="text-[9px] font-mono text-blue-400 shrink-0">{n.category}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User profile avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setAccountMenuOpen(false);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center border border-blue-500/40 uppercase">
              {user?.fullName
                ? user.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                : 'TR'}
            </div>
          </button>

          {userMenuOpen && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-full sm:mt-1.5 w-60 bg-[#151F30] border border-slate-700 rounded-lg shadow-2xl p-2 z-50 text-xs">
              <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                <div className="font-semibold text-white truncate">{user?.fullName || 'Trader'}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Role: {user?.role}</div>
              </div>
              <Link
                to="/trader/profile"
                onClick={() => setUserMenuOpen(false)}
                className="block px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200"
              >
                My Profile
              </Link>
              <Link
                to="/trader/referrals"
                onClick={() => setUserMenuOpen(false)}
                className="block px-2 py-1.5 rounded hover:bg-slate-800 text-emerald-400 font-medium"
              >
                Refer &amp; Earn
              </Link>
              <Link
                to="/trader/settings"
                onClick={() => setUserMenuOpen(false)}
                className="block px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200"
              >
                Account Settings
              </Link>
              <Link
                to="/trader/security"
                onClick={() => setUserMenuOpen(false)}
                className="block px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200"
              >
                Security &amp; 2FA
              </Link>
              {isStaffOrAdmin && (
                <Link
                  to="/admin/overview"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-2 py-1.5 rounded hover:bg-slate-800 text-amber-400 font-semibold"
                >
                  Switch to Admin Back-Office
                </Link>
              )}
              <div className="border-t border-slate-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-rose-500/10 text-rose-400 flex items-center gap-1.5 font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
