import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search, Sun, Moon,
  ArrowUpRight, LogOut, Menu
} from 'lucide-react';

interface AdminNavbarProps {
  onOpenMobileMenu?: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const path = location.pathname;
  let sectionTitle = 'Admin Executive Dashboard';
  if (path.includes('users')) sectionTitle = 'User Account Management';
  else if (path.includes('kyc')) sectionTitle = 'KYC & Compliance Verification';
  else if (path.includes('accounts')) sectionTitle = 'Trading Accounts Monitor';
  else if (path.includes('monitor')) sectionTitle = 'Dealing Desk & Exposure Monitor';
  else if (path.includes('orders')) sectionTitle = 'Order Execution Management';
  else if (path.includes('positions')) sectionTitle = 'Open Positions Dealing Desk';
  else if (path.includes('transactions')) sectionTitle = 'All Financial Transactions';
  else if (path.includes('deposits')) sectionTitle = 'Deposits Administration';
  else if (path.includes('withdrawals')) sectionTitle = 'Withdrawal Queue & Approvals';
  else if (path.includes('payment-methods')) sectionTitle = 'Payment Gateways & Settings';
  else if (path.includes('currency-pairs')) sectionTitle = 'Currency Pairs & Assets';
  else if (path.includes('spreads')) sectionTitle = 'Spread Markup Controls';
  else if (path.includes('leverage')) sectionTitle = 'Leverage Rules & Limits';
  else if (path.includes('commissions')) sectionTitle = 'Commission Structures';
  else if (path.includes('signals')) sectionTitle = 'Trading Signals Publisher';
  else if (path.includes('news')) sectionTitle = 'Market News Desk CMS';
  else if (path.includes('calendar')) sectionTitle = 'Economic Calendar Management';
  else if (path.includes('education')) sectionTitle = 'Education Academy Management';
  else if (path.includes('cms')) sectionTitle = 'CMS Website Pages & Copy';
  else if (path.includes('tickets')) sectionTitle = 'Client Support Desk';
  else if (path.includes('notifications')) sectionTitle = 'System Notifications Center';
  else if (path.includes('reports')) sectionTitle = 'Operational & Financial Reports';
  else if (path.includes('staff')) sectionTitle = 'Staff Members & Operators';
  else if (path.includes('roles')) sectionTitle = 'RBAC Permissions Matrix';
  else if (path.includes('audit-logs')) sectionTitle = 'Security Audit Logs';
  else if (path.includes('settings')) sectionTitle = 'Platform Global Settings';

  return (
    <header className="h-14 bg-[#111827] border-b border-slate-800 flex items-center justify-between px-3 sm:px-4 z-20 gap-2 sm:gap-3">
      {/* Left: Hamburger + Section Title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 -ml-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Open Admin Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-amber-500 hidden sm:inline">Admin /</span>
        <h1 className="text-xs sm:text-sm font-bold text-white truncate">{sectionTitle}</h1>
      </div>

      {/* Center: Search Filter */}
      <div className="hidden md:flex items-center flex-1 max-w-xs relative mx-4">
        <Search className="w-3.5 h-3.5 absolute left-3 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search user, account, ticket, IP..."
          className="w-full bg-[#151F30] border border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Right: Quick actions and switcher */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <Link
          to="/trader/terminal"
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors whitespace-nowrap shadow-sm shadow-blue-500/20"
        >
          <span className="hidden sm:inline">Open Trader Terminal</span>
          <span className="sm:hidden">Terminal</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Admin Avatar & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'SA'}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-white">{user?.fullName || 'Super Administrator'}</div>
            <div className="text-[10px] text-amber-400 font-mono">{user?.email || 'info.soumik@gmail.com'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
            title="Sign Out of Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
