/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { TradingProvider } from './contexts/TradingContext';
import { ToastContainer } from './components/common/ToastContainer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { TraderLayout } from './layouts/TraderLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { 
  MarketsPage, ForexPage, CommoditiesPage, IndicesPage, PricingPage 
} from './pages/public/MarketsPages';
import { 
  TradingPage, PlatformsPage, AccountTypesPage, AboutPage, ContactPage, FaqPage 
} from './pages/public/TradingAndCompanyPages';
import { 
  PublicEconomicCalendarPage, PublicNewsPage, PublicAnalysisPage, 
  PublicSignalsPage, PublicEducationPage 
} from './pages/public/ResearchAndEducationPages';
import { 
  LoginPage, RegisterPage, ForgotPasswordPage, 
  PrivacyPolicyPage, TermsPage, RiskDisclosurePage 
} from './pages/public/AuthAndLegalPages';

// Trader Pages
import { TraderOverviewPage } from './pages/trader/TraderOverviewPage';
import { TradingTerminalPage } from './pages/trader/TradingTerminalPage';
import { TradingAccountsPage } from './pages/trader/TradingAccountsPage';
import { PositionsPage, PendingOrdersPage, TradeHistoryPage } from './pages/trader/PositionsAndOrdersPages';
import { 
  WatchlistPage, TraderAnalysisPage, TraderSignalsPage, TraderCalendarPage 
} from './pages/trader/WatchlistAndAnalyticsPages';
import { 
  WalletPage, DepositPage, WithdrawalPage, TransactionsPage 
} from './pages/trader/WalletAndFinancePages';
import { 
  KycPage, NotificationsPage, ReportsPage, TicketsPage, 
  ProfilePage, AccountSettingsPage, SecuritySettingsPage 
} from './pages/trader/AccountAndSupportPages';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { UserManagementPage, KycManagementPage, TradingAccountsAdminPage } from './pages/admin/AdminUsersAndKycPages';
import { 
  TradingMonitorPage, OrdersManagementPage, AdminPositionsPage, 
  AdminTransactionsPage, AdminDepositsPage, AdminWithdrawalsPage, PaymentMethodsPage 
} from './pages/admin/AdminDealingAndFinancePages';
import { 
  CurrencyPairsAdminPage, SpreadManagementPage, LeverageSettingsPage, 
  CommissionSettingsPage, SignalsManagementPage, NewsManagementPage, 
  CalendarManagementPage, EducationManagementPage, CmsContentPage, 
  SupportTicketsAdminPage, AuditLogsPage, GeneralSettingsPage 
} from './pages/admin/AdminConfigAndContentPages';
import { StaffManagementPage, RolesPermissionsPage } from './pages/admin/AdminStaffAndRolesPages';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <TradingProvider>
            <BrowserRouter>
              <Routes>
                {/* 1. PUBLIC WEBSITE ROUTES */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="markets" element={<MarketsPage />} />
                  <Route path="markets/forex" element={<ForexPage />} />
                  <Route path="markets/commodities" element={<CommoditiesPage />} />
                  <Route path="markets/indices" element={<IndicesPage />} />
                  <Route path="trading" element={<TradingPage />} />
                  <Route path="account-types" element={<AccountTypesPage />} />
                  <Route path="pricing" element={<PricingPage />} />
                  <Route path="platforms" element={<PlatformsPage />} />
                  <Route path="economic-calendar" element={<PublicEconomicCalendarPage />} />
                  <Route path="news" element={<PublicNewsPage />} />
                  <Route path="analysis" element={<PublicAnalysisPage />} />
                  <Route path="signals" element={<PublicSignalsPage />} />
                  <Route path="education" element={<PublicEducationPage />} />
                  <Route path="faq" element={<FaqPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="privacy" element={<PrivacyPolicyPage />} />
                  <Route path="terms" element={<TermsPage />} />
                  <Route path="risk-disclosure" element={<RiskDisclosurePage />} />
                </Route>

                {/* 2. PROTECTED TRADER DASHBOARD ROUTES */}
                <Route
                  path="/trader"
                  element={
                    <ProtectedRoute>
                      <TraderLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/trader/overview" replace />} />
                  <Route path="overview" element={<TraderOverviewPage />} />
                  <Route path="terminal" element={<TradingTerminalPage />} />
                  <Route path="accounts" element={<TradingAccountsPage />} />
                  <Route path="positions" element={<PositionsPage />} />
                  <Route path="pending-orders" element={<PendingOrdersPage />} />
                  <Route path="history" element={<TradeHistoryPage />} />
                  <Route path="watchlist" element={<WatchlistPage />} />
                  <Route path="analysis" element={<TraderAnalysisPage />} />
                  <Route path="signals" element={<TraderSignalsPage />} />
                  <Route path="calendar" element={<TraderCalendarPage />} />
                  <Route path="wallet" element={<WalletPage />} />
                  <Route path="deposit" element={<DepositPage />} />
                  <Route path="withdrawal" element={<WithdrawalPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="kyc" element={<KycPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="tickets" element={<TicketsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<AccountSettingsPage />} />
                  <Route path="security" element={<SecuritySettingsPage />} />
                </Route>

                {/* 3. PROTECTED ADMIN DASHBOARD ROUTES (ROLE-BASED ACCESS CONTROL) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/overview" replace />} />
                  <Route path="overview" element={<ProtectedRoute requireAdmin requiredPermission="Dashboard"><AdminOverviewPage /></ProtectedRoute>} />
                  <Route path="users" element={<ProtectedRoute requireAdmin requiredPermission="Users"><UserManagementPage /></ProtectedRoute>} />
                  <Route path="kyc" element={<ProtectedRoute requireAdmin requiredPermission="KYC"><KycManagementPage /></ProtectedRoute>} />
                  <Route path="accounts" element={<ProtectedRoute requireAdmin requiredPermission="Accounts"><TradingAccountsAdminPage /></ProtectedRoute>} />
                  <Route path="monitor" element={<ProtectedRoute requireAdmin requiredPermission="Trading"><TradingMonitorPage /></ProtectedRoute>} />
                  <Route path="orders" element={<ProtectedRoute requireAdmin requiredPermission="Trading"><OrdersManagementPage /></ProtectedRoute>} />
                  <Route path="positions" element={<ProtectedRoute requireAdmin requiredPermission="Trading"><AdminPositionsPage /></ProtectedRoute>} />
                  <Route path="transactions" element={<ProtectedRoute requireAdmin requiredPermission="Deposits"><AdminTransactionsPage /></ProtectedRoute>} />
                  <Route path="deposits" element={<ProtectedRoute requireAdmin requiredPermission="Deposits"><AdminDepositsPage /></ProtectedRoute>} />
                  <Route path="withdrawals" element={<ProtectedRoute requireAdmin requiredPermission="Withdrawals"><AdminWithdrawalsPage /></ProtectedRoute>} />
                  <Route path="payment-methods" element={<ProtectedRoute requireAdmin requiredPermission="Payment Methods"><PaymentMethodsPage /></ProtectedRoute>} />
                  <Route path="currency-pairs" element={<ProtectedRoute requireAdmin requiredPermission="Markets"><CurrencyPairsAdminPage /></ProtectedRoute>} />
                  <Route path="spreads" element={<ProtectedRoute requireAdmin requiredPermission="Markets"><SpreadManagementPage /></ProtectedRoute>} />
                  <Route path="leverage" element={<ProtectedRoute requireAdmin requiredPermission="Trading"><LeverageSettingsPage /></ProtectedRoute>} />
                  <Route path="commissions" element={<ProtectedRoute requireAdmin requiredPermission="Trading"><CommissionSettingsPage /></ProtectedRoute>} />
                  <Route path="signals" element={<ProtectedRoute requireAdmin requiredPermission="Markets"><SignalsManagementPage /></ProtectedRoute>} />
                  <Route path="news" element={<ProtectedRoute requireAdmin requiredPermission="CMS"><NewsManagementPage /></ProtectedRoute>} />
                  <Route path="calendar" element={<ProtectedRoute requireAdmin requiredPermission="CMS"><CalendarManagementPage /></ProtectedRoute>} />
                  <Route path="education" element={<ProtectedRoute requireAdmin requiredPermission="CMS"><EducationManagementPage /></ProtectedRoute>} />
                  <Route path="cms" element={<ProtectedRoute requireAdmin requiredPermission="CMS"><CmsContentPage /></ProtectedRoute>} />
                  <Route path="tickets" element={<ProtectedRoute requireAdmin requiredPermission="Support"><SupportTicketsAdminPage /></ProtectedRoute>} />
                  <Route path="notifications" element={<ProtectedRoute requireAdmin requiredPermission="Notifications"><NotificationsPage /></ProtectedRoute>} />
                  <Route path="reports" element={<ProtectedRoute requireAdmin requiredPermission="Reports"><ReportsPage /></ProtectedRoute>} />
                  <Route path="staff" element={<ProtectedRoute requireAdmin requiredPermission="Staff"><StaffManagementPage /></ProtectedRoute>} />
                  <Route path="roles" element={<ProtectedRoute requireAdmin requiredPermission="Roles"><RolesPermissionsPage /></ProtectedRoute>} />
                  <Route path="audit-logs" element={<ProtectedRoute requireAdmin requiredPermission="Audit Logs"><AuditLogsPage /></ProtectedRoute>} />
                  <Route path="settings" element={<ProtectedRoute requireAdmin requiredPermission="Website Settings"><GeneralSettingsPage /></ProtectedRoute>} />
                </Route>

                {/* Compatibility Fallback */}
                <Route path="/dashboard" element={<Navigate to="/trader/overview" replace />} />
                <Route path="/dashboard/*" element={<Navigate to="/trader/overview" replace />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {/* Global Floating Toast Alert Container */}
              <ToastContainer />
            </BrowserRouter>
          </TradingProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
