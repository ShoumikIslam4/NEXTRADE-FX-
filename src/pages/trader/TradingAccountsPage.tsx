import React, { useState, useEffect } from 'react';
import { useTrading } from '../../contexts/TradingContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldCheck, CheckCircle, ArrowUpRight, ShieldAlert,
  Clock, AlertCircle, FileText, AlertTriangle, PlusCircle
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ResetDemoModal } from '../../components/common/ResetDemoModal';
import { LiveOnboardingModal } from '../../components/account/LiveOnboardingModal';

export const TradingAccountsPage: React.FC = () => {
  const {
    accounts, activeAccount, switchAccount, liveApplication, isDemoExhausted
  } = useTrading();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') === 'live' ? 'live' : 'demo';
  const [activeTab, setActiveTab] = useState<'demo' | 'live'>(initialTab);
  const [liveOnboardingOpen, setLiveOnboardingOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'live' || tabParam === 'demo') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'demo' | 'live') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Strictly ONE Demo Account and ONE Live Account per registered user
  const demoAccounts = accounts.filter((a) => a.mode === 'DEMO').slice(0, 1);
  const liveAccounts = accounts.filter((a) => a.mode === 'LIVE').slice(0, 1);
  const liveAcc = liveAccounts[0];
  const isKycApproved = user?.kycStatus === 'APPROVED';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white">Trading Accounts Management</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold uppercase">
              Strict Demo / Live Isolation
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manage your one-time $1,000 DEMO / SIMULATED account or apply directly for a verified Live Trading Account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isKycApproved ? (
            <Link
              to="/trader/deposit"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm shadow-emerald-600/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Funds (Live Account)</span>
            </Link>
          ) : (
            <button
              onClick={() => {
                handleTabChange('live');
                setLiveOnboardingOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm shadow-amber-600/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Apply for Live Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => handleTabChange('demo')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'demo'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white bg-[#151F30]'
          }`}
        >
          <span>Demo Account (SIMULATED)</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded font-mono">1× $1,000 Rule</span>
        </button>
        <button
          onClick={() => handleTabChange('live')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'live'
              ? 'bg-amber-600 text-white'
              : 'text-slate-400 hover:text-white bg-[#151F30]'
          }`}
        >
          <span>Live Account Console</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-white/20 rounded">
            {isKycApproved ? 'KYC Approved' : 'Direct Registration'}
          </span>
        </button>
      </div>

      {/* TAB 1: SINGLE DEMO ACCOUNT */}
      {activeTab === 'demo' && (
        <div className="space-y-5">
          {/* Policy Notice */}
          <div className="p-4 bg-blue-950/25 border border-blue-500/25 rounded-xl flex items-start gap-3 text-xs text-slate-300">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-white">One-Time $1,000 Demo Policy (DEMO / SIMULATED):</strong> Every registered user receives strictly <strong className="text-blue-300">one Demo Account</strong> funded with $1,000.00 USD in virtual capital. No KYC is required for demo practice. Demo deposits, balance top-ups, balance resets, and second demo accounts are permanently disabled.
            </div>
          </div>

          {/* Exhausted Alert */}
          {isDemoExhausted && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-300">Demo Allocation Exhausted</div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    Your one-time $1,000.00 USD simulated allocation has been exhausted. Apply for a Live Trading Account to proceed with verified onboarding.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  handleTabChange('live');
                  setLiveOnboardingOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shrink-0 transition-colors"
              >
                Apply for Live Account
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {demoAccounts.map((acc) => {
              const isActive = acc.id === activeAccount.id;
              const exhausted = acc.balance <= 0 || acc.freeMargin <= 0;

              return (
                <div
                  key={acc.id}
                  className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                    isActive
                      ? 'bg-[#151F30] border-blue-500/60 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-base">#{acc.accountNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold uppercase">
                          DEMO / SIMULATED
                        </span>
                        {isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{acc.server}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-4">
                      <span>{acc.type}</span>
                      <span className="text-[11px] text-blue-400 font-mono">
                        {exhausted ? 'ALLOCATION EXHAUSTED' : 'No KYC Required'}
                      </span>
                    </div>

                    <div className="space-y-2 py-3 border-y border-slate-800 text-xs tabular-nums">
                      <div className="flex justify-between text-slate-400">
                        <span>Balance (DEMO / SIMULATED):</span>
                        <span className="font-bold text-white font-mono">
                          ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Equity (SIMULATED):</span>
                        <span className="font-bold text-white font-mono">
                          ${acc.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Used Margin:</span>
                        <span className="font-mono text-slate-300">${acc.margin.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Free Margin:</span>
                        <span
                          className={`font-bold font-mono ${
                            exhausted ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          ${acc.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Configured Leverage:</span>
                        <span className="font-mono text-white">{acc.leverage}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-2 mt-4">
                    {exhausted ? (
                      <button
                        onClick={() => {
                          handleTabChange('live');
                          setLiveOnboardingOpen(true);
                        }}
                        className="flex-1 py-2.5 text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                      >
                        Apply for Live Trading Account
                      </button>
                    ) : isActive ? (
                      <Link
                        to="/trader/terminal"
                        className="flex-1 py-2.5 text-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>Trade in Terminal (SIMULATED)</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => switchAccount(acc.id)}
                        className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                      >
                        Select Demo Account
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ACCOUNT CONSOLE */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          <div className="p-5 bg-[#151F30] border border-amber-500/40 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>Live Account Governance & Broker Execution Notice</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Users can apply for Live Trading directly without opening or using a Demo account first. Once KYC is approved, your Live ledger supports verified Add Funds (bKash / Nagad / Rocket, min $10 USD). Actual live market order execution remains disabled until authorized prime-brokerage liquidity connectivity is finalized.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Account Details Card */}
            <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-base">
                    #{liveAcc?.accountNumber || 'NX-LIVE-PENDING'}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border font-semibold uppercase ${
                      isKycApproved
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {isKycApproved ? 'ACTIVE (LEDGER READY)' : liveAcc?.status || 'PENDING VERIFICATION'}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">NEXTRADE-Live-Prime</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums font-mono py-2">
                <div className="p-3 bg-[#0B1220] rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Live Balance</span>
                  <span className="text-base font-bold text-white">
                    ${(liveAcc?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
                <div className="p-3 bg-[#0B1220] rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Live Equity</span>
                  <span className="text-base font-bold text-white">
                    ${(liveAcc?.equity ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
                <div className="p-3 bg-[#0B1220] rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Leverage</span>
                  <span className="text-base font-bold text-white">{liveAcc?.leverage || '1:100'}</span>
                </div>
                <div className="p-3 bg-[#0B1220] rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Order Execution</span>
                  <span className="text-xs font-semibold text-amber-400">Disabled (Broker Gate)</span>
                </div>
              </div>

              <div className="p-4 bg-[#0B1220] border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Application Reference:</span>
                  <span className="font-mono font-bold text-white">{liveApplication.id}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">KYC Verification Status:</span>
                  <span
                    className={`font-semibold uppercase ${
                      isKycApproved
                        ? 'text-emerald-400'
                        : user?.kycStatus === 'REJECTED'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {(user?.kycStatus || liveApplication.status).replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Document Type:</span>
                  <span className="text-white">
                    {user?.kycDocumentType || liveApplication.idType} ({user?.kycDocumentNumber || liveApplication.idNumber || 'Pending'})
                  </span>
                </div>
                {user?.kycNotes && (
                  <div className="pt-2 border-t border-slate-800 text-amber-300 text-[11px]">
                    <strong>Compliance Note:</strong> {user.kycNotes}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLiveOnboardingOpen(true)}
                  className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {liveApplication.status === 'NOT_APPLIED' ? 'Start Live Application' : 'View / Update Onboarding'}
                  </span>
                </button>

                {isKycApproved ? (
                  <Link
                    to="/trader/deposit"
                    className="py-2.5 px-4 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    Add Funds (Live Ledger)
                  </Link>
                ) : (
                  <Link
                    to="/trader/kyc"
                    className="py-2.5 px-4 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    Submit KYC Document
                  </Link>
                )}

                {liveAcc && (
                  <button
                    type="button"
                    onClick={() => switchAccount(liveAcc.id)}
                    className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-colors ${
                      activeAccount.mode === 'LIVE'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {activeAccount.mode === 'LIVE' ? 'Workspace Active' : 'Select Live'}
                  </button>
                )}
              </div>
            </div>

            {/* Approval Pathway */}
            <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Account Approval Pathway</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#0B1220] rounded-lg border border-emerald-500/30 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">1. Account Registration & Onboarding Profile</div>
                    <div className="text-[11px] text-slate-400">Personal & risk profile logged independently of Demo.</div>
                  </div>
                </div>

                <div
                  className={`p-3 bg-[#0B1220] rounded-lg border flex items-start gap-3 ${
                    isKycApproved ? 'border-emerald-500/30' : 'border-amber-500/30'
                  }`}
                >
                  {isKycApproved ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-white">2. KYC Document Approval & Add Funds Ledger</div>
                    <div className="text-[11px] text-slate-400">
                      {isKycApproved
                        ? 'Approved! Eligible to submit Live Add Funds requests (min $10 USD).'
                        : 'Compliance Admin reviews NID / Passport before activating Live funding.'}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#0B1220] rounded-lg border border-slate-800 flex items-start gap-3 opacity-70">
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-300">3. Prime Liquidity Bridge Authorization</div>
                    <div className="text-[11px] text-slate-500">
                      Real market order execution remains gated until licensed FIX/ECN broker integration.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Tier Matrix */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">NEXTRADE FX Account Tier Specifications</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Tier Name</th>
                <th className="py-2.5 px-3">Environment</th>
                <th className="py-2.5 px-3">Capital Rules</th>
                <th className="py-2.5 px-3">KYC Required</th>
                <th className="py-2.5 px-3">Max Leverage</th>
                <th className="py-2.5 px-3">Execution Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-[#151F30]/50">
                <td className="py-2.5 px-3 font-bold text-white font-sans">Raw ECN Demo</td>
                <td className="py-2.5 px-3 text-blue-400 font-sans">DEMO / SIMULATED</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">1× $1,000 USD (No Reset/Top-Up)</td>
                <td className="py-2.5 px-3 text-slate-300 font-sans">No</td>
                <td className="py-2.5 px-3 text-slate-300">1:500</td>
                <td className="py-2.5 px-3 text-blue-400 font-sans">Simulated Market</td>
              </tr>
              <tr className="hover:bg-[#151F30]/50">
                <td className="py-2.5 px-3 font-bold text-amber-400 font-sans">Institutional ECN Live</td>
                <td className="py-2.5 px-3 text-amber-400 font-sans">LIVE ACCOUNT</td>
                <td className="py-2.5 px-3 text-slate-300">Min $10 USD (bKash / Nagad / Rocket)</td>
                <td className="py-2.5 px-3 text-amber-300 font-sans">Yes (Admin Approved)</td>
                <td className="py-2.5 px-3 text-slate-300">1:100</td>
                <td className="py-2.5 px-3 text-amber-400 font-sans">Disabled Until Broker Bridge</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ResetDemoModal />
      <LiveOnboardingModal
        isOpen={liveOnboardingOpen}
        onClose={() => setLiveOnboardingOpen(false)}
      />
    </div>
  );
};
