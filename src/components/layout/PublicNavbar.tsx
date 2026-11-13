import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Menu, X, ChevronDown, Sun, Moon, Shield, LayoutDashboard, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [marketsDropdown, setMarketsDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isStaffOrAdmin, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1220]/95 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-3.5">
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2 text-sm sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-500 transition-colors shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
          <span className="font-extrabold tracking-wider">NEXTRADE<span className="text-blue-500">FX</span></span>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {/* Markets with hover dropdown */}
          <div
            onMouseEnter={() => setMarketsDropdown(true)}
            onMouseLeave={() => setMarketsDropdown(false)}
            className="relative py-2 flex items-center"
          >
            <Link
              to="/markets"
              className={`flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                isActive('/markets') || location.pathname.startsWith('/markets') ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              <span>Markets</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${marketsDropdown ? 'rotate-180' : ''}`} />
            </Link>

            {marketsDropdown && (
              <div className="absolute top-full left-0 w-48 bg-[#151F30] border border-slate-800 rounded-lg shadow-2xl py-2 z-50 flex flex-col">
                <Link
                  to="/markets"
                  onClick={() => setMarketsDropdown(false)}
                  className="px-4 py-2 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white"
                >
                  All Markets Overview
                </Link>
                <Link
                  to="/markets/forex"
                  onClick={() => setMarketsDropdown(false)}
                  className="px-4 py-2 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white"
                >
                  Forex Majors & Minors
                </Link>
                <Link
                  to="/markets/commodities"
                  onClick={() => setMarketsDropdown(false)}
                  className="px-4 py-2 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white"
                >
                  Precious Metals & Oil
                </Link>
                <Link
                  to="/markets/indices"
                  onClick={() => setMarketsDropdown(false)}
                  className="px-4 py-2 text-xs text-slate-200 hover:bg-slate-800/80 hover:text-white"
                >
                  Global Stock Indices
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/trading"
            className={`py-2 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              isActive('/trading') ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Trading
          </Link>

          <Link
            to="/account-types"
            className={`py-2 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              isActive('/account-types') ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Account Types
          </Link>

          <Link
            to="/education"
            className={`py-2 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              isActive('/education') ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Education
          </Link>

          <Link
            to="/analysis"
            className={`py-2 hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              isActive('/analysis') ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Analysis & News
          </Link>
        </nav>

        {/* Zone 3: Auth & Action Area */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isStaffOrAdmin ? (
                <Link
                  to="/admin/overview"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-sm shadow-amber-600/30 whitespace-nowrap"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Portal</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              ) : (
                <Link
                  to="/trader/overview"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-500/20 whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Trader Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-rose-400 px-2.5 py-1.5 rounded hover:bg-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/login"
                className="text-[11px] sm:text-xs font-semibold text-slate-300 hover:text-white px-2 sm:px-3 py-1.5 sm:py-2 transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">Client Login</span>
                <span className="sm:hidden">Login</span>
              </Link>

              <Link
                to="/register"
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-500/20 whitespace-nowrap shrink-0"
              >
                <span className="hidden sm:inline">Create Account</span>
                <span className="sm:hidden">Sign Up</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0B1220] px-6 py-4 flex flex-col gap-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-slate-300 hover:text-white py-1"
          >
            Home
          </Link>
          <Link
            to="/markets"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-slate-300 hover:text-white py-1"
          >
            Markets (Forex, Metals, Indices)
          </Link>
          <Link
            to="/trading"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-slate-300 hover:text-white py-1"
          >
            Trading Platforms & Conditions
          </Link>
          <Link
            to="/account-types"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-slate-300 hover:text-white py-1"
          >
            Account Types & Spreads
          </Link>
          <Link
            to="/economic-calendar"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-slate-300 hover:text-white py-1"
          >
            Economic Calendar
          </Link>
          <Link
            to="/analysis"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-slate-300 hover:text-white py-1"
          >
            Market Analysis & Signals
          </Link>
          <Link
            to="/education"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-slate-300 hover:text-white py-1"
          >
            Education Center
          </Link>
          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium text-slate-300 hover:text-white py-1"
          >
            FAQ & Support
          </Link>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                {isStaffOrAdmin ? (
                  <Link
                    to="/admin/overview"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-500"
                  >
                    Go to Admin Back-Office ({user?.fullName || 'Admin'})
                  </Link>
                ) : (
                  <Link
                    to="/trader/overview"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500"
                  >
                    Go to Trader Dashboard ({user?.fullName || 'Trader'})
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2.5 text-xs font-semibold text-rose-400 bg-[#151F30] border border-rose-500/30 rounded-lg hover:bg-rose-500/10"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-semibold text-slate-300 bg-[#151F30] border border-slate-700 rounded-lg hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

