import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Activity, FileCheck, Layers, TrendingUp,
  ArrowRight, Clock, ArrowDownCircle, ShieldCheck, ShieldOff, Gift, Mail
} from 'lucide-react';
import { MOCK_ADMIN_USERS, MOCK_KYC_SUBMISSIONS, MOCK_AUDIT_LOGS } from '../../data/mockAdminData';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const AdminOverviewPage: React.FC = () => {
  const { platformSettings, refreshPlatformSettings } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = React.useState<any>(null);
  const [recentLogs, setRecentLogs] = React.useState<any[]>(MOCK_AUDIT_LOGS);
  const [recentUsers, setRecentUsers] = React.useState<any[]>(MOCK_ADMIN_USERS);
  const [togglingKyc, setTogglingKyc] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('nextrade_token');
    fetch('/api/admin/overview-stats', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
          if (data.recentLogs && data.recentLogs.length > 0) setRecentLogs(data.recentLogs);
          if (data.recentUsers && data.recentUsers.length > 0) {
            setRecentUsers(
              data.recentUsers.map((u: any) => ({
                id: u.id,
                name: u.fullName,
                email: u.email,
                country: u.country || 'Bangladesh',
                kycStatus: u.kycStatus || (u.role === 'SUPER_ADMIN' ? 'APPROVED' : 'UNSUBMITTED'),
                totalBalanceDemo: typeof u.demoBalance === 'number' ? u.demoBalance : 1000.0,
                liveBalance: typeof u.liveBalance === 'number' ? u.liveBalance : 0.0,
                status: u.isActive ? 'ACTIVE' : 'SUSPENDED'
              }))
            );
          }
        }
      })
      .catch((err) => console.error('[Admin Overview] Failed to fetch stats', err));
  }, []);

  const handleQuickToggleKyc = async () => {
    try {
      setTogglingKyc(true);
      const nextVal = !platformSettings.requireKycToTrade;
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ requireKycToTrade: nextVal })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshPlatformSettings();
        addToast({
          type: nextVal ? 'warning' : 'success',
          title: `Mandatory KYC to Trade: ${nextVal ? 'ON' : 'OFF'}`,
          message: nextVal
            ? 'Traders must complete KYC verification before placing trades.'
            : 'Traders may place simulated trades without prior KYC approval.'
        });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to toggle KYC policy.' });
    } finally {
      setTogglingKyc(false);
    }
  };

  const kpis = [
    {
      title: 'Total Registered Users',
      value: stats ? stats.totalUsers.toLocaleString() : '—',
      subtitle: 'Database backed accounts',
      icon: Users,
      color: 'text-blue-400',
      border: 'border-blue-500/30'
    },
    {
      title: 'Active Accounts (24h)',
      value: stats ? stats.activeUsers.toLocaleString() : '—',
      subtitle: 'Authorized sessions',
      icon: Activity,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30'
    },
    {
      title: 'Demo & Live Ledgers',
      value: stats ? stats.totalAccounts.toLocaleString() : '—',
      subtitle: 'Isolated account records',
      icon: Layers,
      color: 'text-white',
      border: 'border-slate-800'
    },
    {
      title: 'Demo Volume (24h)',
      value: stats ? `${stats.totalVolumeLots.toLocaleString()} Lots` : '18,450 Lots',
      subtitle: 'Simulated liquidity feed',
      icon: TrendingUp,
      color: 'text-amber-400',
      border: 'border-amber-500/30'
    },
    {
      title: 'Pending KYC Queue',
      value: stats ? stats.pendingKyc.toString() : '0',
      subtitle: 'Live onboarding reviews',
      icon: FileCheck,
      color: 'text-amber-400',
      border: 'border-amber-500/30'
    },
    {
      title: 'Pending Live Deposits',
      value: stats && typeof stats.pendingDeposits === 'number' ? stats.pendingDeposits.toString() : '0',
      subtitle: 'bKash / Nagad / Rocket',
      icon: ArrowDownCircle,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30'
    }
  ];

  const kycRequired = platformSettings.requireKycToTrade;
  const refCfg = platformSettings.referralConfig;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#151F30] border border-slate-800 rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              ADMINISTRATION CONSOLE
            </span>
            <span className="text-xs text-slate-400">· RBAC, KYC Compliance &amp; Live Add Funds Control</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Platform Back-Office Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Telemetry of Demo/Live user ledgers, KYC queues, MFS payment verification, and system audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            to="/admin/kyc"
            className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Review KYC ({stats ? stats.pendingKyc : 0})</span>
          </Link>
          <Link
            to="/admin/deposits"
            className="px-3.5 py-2 text-xs font-bold text-slate-200 bg-[#0B1220] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Deposits Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Controls: Mandatory KYC Toggle, Referral Program, Gmail SMTP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">KYC Before Trading</div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${kycRequired ? 'text-amber-400' : 'text-emerald-400'}`}>
              {kycRequired ? 'ON · KYC Required First' : 'OFF · Trade Without KYC'}
            </div>
          </div>
          <button
            type="button"
            disabled={togglingKyc}
            onClick={handleQuickToggleKyc}
            className={`px-3 py-2 rounded-lg text-xs font-bold text-white shrink-0 flex items-center gap-1.5 transition-colors ${
              kycRequired ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            {kycRequired ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>{kycRequired ? 'Turn OFF' : 'Turn ON'}</span>
          </button>
        </div>

        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-emerald-400" />
              <span>Referral Rewards</span>
            </div>
            <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">
              {refCfg.enabled
                ? `${refCfg.referrerCommissionPercent}% Comm · $${refCfg.referrerSignupBonusUSD} · ${refCfg.referredDiscountPercent}% Off`
                : 'Referral Program Paused'}
            </div>
          </div>
          <Link
            to="/admin/settings"
            className="px-3 py-2 rounded-lg bg-[#151F30] border border-slate-700 hover:border-blue-500 text-xs font-bold text-blue-400 shrink-0"
          >
            Configure
          </Link>
        </div>

        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Gmail Login Alerts</span>
            </div>
            <div className="text-xs font-bold text-white mt-0.5">
              {stats?.emailNotificationsConfigured ? (
                <span className="text-emerald-400">SMTP Connected &amp; Active</span>
              ) : (
                <span className="text-amber-400">In-App Ready (Set SMTP_USER/PASS)</span>
              )}
            </div>
          </div>
          <Link
            to="/admin/settings"
            className="px-3 py-2 rounded-lg bg-[#151F30] border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 shrink-0"
          >
            Details
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-4 bg-[#111827] border ${kpi.border} rounded-lg flex flex-col justify-between`}>
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <span>{kpi.title}</span>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className={`text-xl font-bold font-mono my-2 ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[11px] text-slate-500 truncate">{kpi.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">KYC Compliance Queue</h3>
            </div>
            <Link to="/admin/kyc" className="text-xs text-blue-400 hover:underline">
              Open KYC Desk
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60 flex-1">
            {MOCK_KYC_SUBMISSIONS.slice(0, 3).map((kyc) => (
              <div key={kyc.id} className="p-4 flex items-center justify-between hover:bg-[#151F30]/50 transition-colors">
                <div>
                  <div className="text-xs font-bold text-white">{kyc.userName}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {kyc.userEmail} · {kyc.documentType}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{kyc.notes}</div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      kyc.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : kyc.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {kyc.status}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">{kyc.submittedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">System Audit &amp; RBAC Logs</h3>
            </div>
            <Link to="/admin/audit-logs" className="text-xs text-blue-400 hover:underline">
              Full Audit Trail
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60 flex-1 font-mono text-xs">
            {recentLogs.slice(0, 5).map((log: any) => (
              <div key={log.id} className="p-3.5 hover:bg-[#151F30]/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-400 text-[11px]">{log.action}</span>
                  <span className="text-[10px] text-slate-500">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
                <div className="text-slate-300 font-sans text-xs">{log.details}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Actor: {log.actorEmail || log.staffUser} · IP: {log.ipAddress}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent Trader Accounts</h3>
          <Link to="/admin/users" className="text-xs text-blue-400 hover:underline">
            Manage All Users
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums font-mono">
            <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">User ID</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Country</th>
                <th className="py-2.5 px-4">KYC</th>
                <th className="py-2.5 px-4">Demo (SIM)</th>
                <th className="py-2.5 px-4">Live Ledger</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentUsers.slice(0, 5).map((u: any) => (
                <tr key={u.id} className="hover:bg-[#151F30]/60">
                  <td className="py-2.5 px-4 text-slate-400">{u.id}</td>
                  <td className="py-2.5 px-4 font-bold text-white font-sans">{u.name}</td>
                  <td className="py-2.5 px-4 text-slate-300">{u.email}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-400">{u.country}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        u.kycStatus === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : u.kycStatus === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {u.kycStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-blue-300">
                    ${(u.totalBalanceDemo ?? 1000).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-emerald-400">
                    ${(u.liveBalance ?? 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        u.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
