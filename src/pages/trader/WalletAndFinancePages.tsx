import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTrading } from '../../contexts/TradingContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Receipt, CheckCircle2, RefreshCw, Lock, AlertTriangle, Info,
  Copy, Check, UploadCloud, FileText, PlusCircle, ShieldAlert
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { activeAccount, accounts, isDemoExhausted } = useTrading();
  const { user } = useAuth();

  const isLive = activeAccount.mode === 'LIVE';
  const isKycApproved = user?.kycStatus === 'APPROVED';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Wallet & Account Ledgers</h2>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                isLive
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}
            >
              {isLive ? 'Live Ledger (Isolated)' : 'DEMO / SIMULATED ($1,000 Rule)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Strictly segregated Demo practice capital and Live Account verified funding ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Link
            to="/trader/deposit"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Funds (Live Account)</span>
          </Link>
          <Link
            to="/trader/accounts?tab=live"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#151F30] border border-slate-700 hover:border-amber-500/50 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <span>Live Onboarding</span>
          </Link>
        </div>
      </div>

      {/* Policy Notice */}
      {!isLive ? (
        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-300">
            <span className="font-semibold text-white">Single $1,000 Demo Allocation Policy (DEMO / SIMULATED):</span> Every registered user receives one free $1,000 USD virtual Demo Account. Demo deposits, balance top-ups, balance resets, and secondary demo accounts are disabled.
            {isDemoExhausted && (
              <span className="block text-rose-400 font-semibold mt-1">
                Your demo allocation is currently exhausted. Apply for a Live Account to proceed with verified Add Funds.
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-300">
            <span className="font-semibold text-amber-300">Live Account Ledger:</span>{' '}
            {isKycApproved
              ? 'Your KYC is approved! Verified Add Funds deposits (bKash / Nagad / Rocket, min $10 USD) credit directly to this Live ledger after Finance verification.'
              : 'Complete KYC verification to unlock Add Funds for your Live Trading Account.'}
          </div>
        </div>
      )}

      {/* Main Balances Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-[#111827] border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">
            {isLive ? 'Live Account Balance' : 'Demo Balance (SIMULATED)'}
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            ${activeAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            #{activeAccount.accountNumber} · {isLive ? 'Isolated Live Ledger' : 'Virtual Practice Funds'}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#111827] border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Free Margin</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            ${activeAccount.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isLive ? 'Live execution disabled pending broker link' : 'Available for simulated trading'}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#111827] border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Current Floating P&amp;L</div>
          <div
            className={`text-2xl font-bold font-mono mt-2 ${
              activeAccount.floatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {activeAccount.floatingProfit >= 0 ? '+' : ''}${activeAccount.floatingProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Equity: ${activeAccount.equity.toFixed(2)} USD</div>
        </div>
      </div>

      {/* Accounts Breakdown Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Isolated Accounts Breakdown</h3>
          <span className="text-xs text-slate-400">Total Accounts: {accounts.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums font-mono">
            <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Account Number</th>
                <th className="py-2.5 px-4">Environment</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Leverage</th>
                <th className="py-2.5 px-4">Balance</th>
                <th className="py-2.5 px-4">Equity</th>
                <th className="py-2.5 px-4">Free Margin</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {accounts.map((acc) => (
                <tr key={acc.id} className={`hover:bg-[#151F30]/60 ${acc.id === activeAccount.id ? 'bg-blue-900/10' : ''}`}>
                  <td className="py-2.5 px-4 font-bold text-white font-mono flex items-center gap-2">
                    {acc.accountNumber}
                    {acc.id === activeAccount.id && (
                      <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.2 rounded font-sans">Active</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-sans">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        acc.mode === 'LIVE' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {acc.mode === 'DEMO' ? 'DEMO / SIMULATED' : 'LIVE'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-300">{acc.type}</td>
                  <td className="py-2.5 px-4 text-slate-400">{acc.leverage}</td>
                  <td className="py-2.5 px-4 text-white font-bold">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-white font-bold">
                    ${acc.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-emerald-400 font-bold">
                    ${acc.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right font-sans">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        acc.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {acc.status}
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

interface PaymentMethodItem {
  id: string;
  method: 'bKash' | 'Nagad' | 'Rocket' | string;
  name?: string;
  accountNumber: string;
  accountType: string;
  feePercent: number;
  minUSD: number;
  instructions: string;
  isActive: boolean;
}

const DEFAULT_METHODS: PaymentMethodItem[] = [
  {
    id: 'pm_bkash',
    method: 'bKash',
    accountNumber: '01712-345678',
    accountType: 'bKash Merchant / Cash Out',
    feePercent: 0,
    minUSD: 10,
    instructions: 'Open bKash app -> Send Money or Cash Out -> Enter Wallet Number -> Submit TrxID below.',
    isActive: true
  },
  {
    id: 'pm_nagad',
    method: 'Nagad',
    accountNumber: '01812-345678',
    accountType: 'Nagad Merchant / Send Money',
    feePercent: 0,
    minUSD: 10,
    instructions: 'Open Nagad app -> Send Money -> Transfer BDT amount -> Enter Sender Number & TrxID.',
    isActive: true
  },
  {
    id: 'pm_rocket',
    method: 'Rocket',
    accountNumber: '01912-345678-9',
    accountType: 'DBBL Rocket Agent / Send Money (*322#)',
    feePercent: 0,
    minUSD: 10,
    instructions: 'Dial *322# or open Rocket app -> Send Money -> Enter Sender & TrxID.',
    isActive: true
  }
];

export const DepositPage: React.FC = () => {
  const { accounts } = useTrading();
  const { user, bdtRate } = useAuth();
  const { addToast } = useToast();

  const [methods, setMethods] = useState<PaymentMethodItem[]>(DEFAULT_METHODS);
  const [selectedMethodName, setSelectedMethodName] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [inputMode, setInputMode] = useState<'BDT' | 'USD'>('BDT');
  const [amountBDT, setAmountBDT] = useState<number>(2500);
  const [amountUSDInput, setAmountUSDInput] = useState<number>(20.41);
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentProofName, setPaymentProofName] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const rate = bdtRate || 122.5;
  const liveAccount = accounts.find((a) => a.mode === 'LIVE');
  const isKycApproved = user?.kycStatus === 'APPROVED';

  const getMethodName = (m: PaymentMethodItem) => (m.method || m.name || 'bKash') as 'bKash' | 'Nagad' | 'Rocket';

  const activeMethods = methods.filter((m) => m.isActive);
  const currentMethod =
    methods.find((m) => getMethodName(m) === selectedMethodName) || activeMethods[0] || DEFAULT_METHODS[0];
  const currentMethodName = getMethodName(currentMethod);

  const minUSD = Math.max(10, currentMethod.minUSD || 10);
  const minBDT = Math.ceil(minUSD * rate);

  const effectiveBDT = inputMode === 'BDT' ? amountBDT : Math.round(amountUSDInput * rate);
  const grossUSD = Number((effectiveBDT / rate).toFixed(2));
  const feePercent = currentMethod.feePercent || 0;
  const feeUSD = Number(((grossUSD * feePercent) / 100).toFixed(2));
  const netUSD = Number((grossUSD - feeUSD).toFixed(2));

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.methods) && data.methods.length > 0) {
          setMethods(data.methods);
          if (!data.methods.some((m: PaymentMethodItem) => getMethodName(m) === selectedMethodName && m.isActive)) {
            setSelectedMethodName(getMethodName(data.methods[0]));
          }
        }
      }
    } catch {
      // keep fallback
    }
  };

  const fetchDeposits = async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch('/api/user/deposits', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.deposits) {
          setDeposits(data.deposits);
        }
      }
    } catch (err) {
      console.warn('[Deposit] Failed to fetch history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
    fetchDeposits();
  }, []);

  const handleBDTChange = (val: number) => {
    setInputMode('BDT');
    setAmountBDT(val);
    setAmountUSDInput(Number((val / rate).toFixed(2)));
  };

  const handleUSDChange = (val: number) => {
    setInputMode('USD');
    setAmountUSDInput(val);
    setAmountBDT(Math.round(val * rate));
  };

  const handleCopyNumber = () => {
    const rawNum = currentMethod.accountNumber.replace(/[^0-9]/g, '');
    navigator.clipboard.writeText(rawNum);
    setCopied(true);
    addToast({
      type: 'info',
      title: 'Wallet Number Copied',
      message: `${currentMethod.accountNumber} copied. Complete payment in ${currentMethodName} app.`
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isKycApproved) {
      addToast({
        type: 'warning',
        title: 'KYC Required for Live Add Funds',
        message: 'Complete Live Account KYC verification before submitting real funding requests.'
      });
      return;
    }

    if (grossUSD < minUSD) {
      addToast({
        type: 'warning',
        title: `Minimum $${minUSD} USD Required`,
        message: `Minimum deposit is $${minUSD} USD equivalent (approx. ৳${minBDT.toLocaleString()} BDT).`
      });
      return;
    }

    if (!senderNumber.trim()) {
      addToast({
        type: 'warning',
        title: 'Sender Number Required',
        message: `Enter your ${currentMethodName} sender wallet number.`
      });
      return;
    }

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      addToast({
        type: 'warning',
        title: 'Valid TrxID Required',
        message: `Enter the Transaction ID received from ${currentMethodName}.`
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch('/api/user/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          method: currentMethodName,
          senderNumber: senderNumber.trim(),
          transactionId: transactionId.trim().toUpperCase(),
          amountBDT: effectiveBDT,
          paymentProofName: paymentProofName || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast({
          type: 'success',
          title: 'Funding Request Logged (PENDING)',
          message: `৳${effectiveBDT.toLocaleString()} BDT (Net $${netUSD} USD) submitted to Finance Desk for Live Account #${liveAccount?.accountNumber || 'LIVE'}.`
        });
        setTransactionId('');
        setPaymentProofName('');
        fetchDeposits();
      } else {
        addToast({
          type: 'error',
          title: 'Submission Failed',
          message: data.message || 'Could not process funding request.'
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to reach payment processing server.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const methodTheme = (name: string) => {
    if (name === 'bKash')
      return {
        bangla: 'বিকাশ',
        gradient: 'from-pink-600 to-rose-700',
        active: 'border-pink-500 text-pink-400 bg-pink-500/10'
      };
    if (name === 'Nagad')
      return {
        bangla: 'নগদ',
        gradient: 'from-orange-600 to-amber-700',
        active: 'border-orange-500 text-orange-400 bg-orange-500/10'
      };
    return {
      bangla: 'রকেট',
      gradient: 'from-purple-600 to-indigo-800',
      active: 'border-purple-500 text-purple-400 bg-purple-500/10'
    };
  };

  const themeStyle = methodTheme(currentMethodName);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl font-bold text-white">Add Funds — Live Trading Account</h2>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            bKash · Nagad · Rocket (Min ${minUSD} USD)
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Submit Bangladeshi Taka (BDT) payment details for Finance verification. Approved funds credit exclusively to your verified <strong className="text-amber-300">Live Account (#{liveAccount?.accountNumber || 'NX-LIVE'})</strong> — never to Demo accounts.
        </p>
      </div>

      {/* KYC Eligibility Check */}
      {!isKycApproved && (
        <div className="p-4 bg-amber-950/35 border border-amber-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5 text-amber-200">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">KYC Approval Required for Live Add Funds:</strong>{' '}
              Your Live Account KYC status is <span className="font-mono uppercase font-bold">{user?.kycStatus || 'UNSUBMITTED'}</span>. Complete identity verification first so Finance Admin can credit verified deposits to your Live ledger.
            </div>
          </div>
          <Link
            to="/trader/kyc"
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shrink-0 text-center transition-colors"
          >
            Verify KYC Now
          </Link>
        </div>
      )}

      {/* Main Add Funds Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl">
        {/* Step 1: Payment Gateway Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5">
            Step 1: Select Active Payment Gateway
          </label>
          <div className="grid grid-cols-3 gap-3">
            {methods.map((m) => {
              const mName = getMethodName(m);
              const t = methodTheme(mName);
              const isSelected = currentMethodName === mName;
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={!m.isActive}
                  onClick={() => setSelectedMethodName(mName)}
                  className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    !m.isActive
                      ? 'opacity-45 cursor-not-allowed border-slate-800 bg-[#0B1220] text-slate-500'
                      : isSelected
                      ? `${t.active} ring-2 ring-offset-2 ring-offset-[#111827] shadow-lg font-bold`
                      : 'border-slate-800 bg-[#151F30] text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-extrabold">{mName}</div>
                  <div className="text-[11px] opacity-80">
                    {m.isActive ? `${t.bangla} · Fee ${m.feePercent}%` : 'Temporarily Disabled'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Payment Instructions & Merchant Wallet */}
        <div className={`p-4 rounded-xl border bg-gradient-to-r ${themeStyle.gradient} text-white space-y-3 shadow-md`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider opacity-90 block">
                Official {currentMethodName} Wallet Number
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-wider mt-0.5">
                {currentMethod.accountNumber}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">{currentMethod.accountType}</div>
            </div>

            <button
              type="button"
              onClick={handleCopyNumber}
              className="self-start sm:self-center px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Number</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-white/20 text-[11px] leading-relaxed opacity-95">
            <strong>Instructions:</strong> {currentMethod.instructions}
          </div>
        </div>

        {/* Step 3: Amount & Currency Calculator */}
        <form onSubmit={handleSubmitDeposit} className="space-y-5 text-xs">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="font-bold text-slate-200 uppercase tracking-wider">
                Step 2: Funding Amount (Min ${minUSD} USD ≈ ৳{minBDT.toLocaleString()})
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode('BDT')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    inputMode === 'BDT' ? 'bg-blue-600 text-white' : 'bg-[#151F30] text-slate-400'
                  }`}
                >
                  Enter BDT (৳)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('USD')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    inputMode === 'USD' ? 'bg-blue-600 text-white' : 'bg-[#151F30] text-slate-400'
                  }`}
                >
                  Enter USD ($)
                </button>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
              {[1500, 2500, 5000, 10000, 25000, 50000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleBDTChange(val)}
                  className={`py-2 px-1 rounded-lg font-mono text-xs font-bold transition-all ${
                    effectiveBDT === val
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                      : 'bg-[#151F30] text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  ৳{val.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">৳</span>
                <input
                  type="number"
                  min={minBDT}
                  step="1"
                  value={effectiveBDT}
                  onChange={(e) => handleBDTChange(Number(e.target.value) || 0)}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-xl pl-8 pr-14 py-2.5 text-white font-mono text-sm font-bold focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-3 top-3 text-[10px] font-bold text-slate-400">BDT</span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-emerald-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  min={minUSD}
                  step="0.01"
                  value={inputMode === 'USD' ? amountUSDInput : grossUSD}
                  onChange={(e) => handleUSDChange(Number(e.target.value) || 0)}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-xl pl-8 pr-14 py-2.5 text-emerald-400 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-3 text-[10px] font-bold text-slate-400">USD</span>
              </div>
            </div>

            {grossUSD < minUSD && (
              <div className="mt-2 text-rose-400 text-[11px] flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Minimum deposit is ${minUSD.toFixed(2)} USD equivalent (৳{minBDT.toLocaleString()} BDT).</span>
              </div>
            )}
          </div>

          {/* Exchange & Fee Breakdown */}
          <div className="p-4 bg-[#0B1220] border border-blue-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Account (Isolated Live Ledger):</span>
              <span className="font-mono text-amber-400 font-bold">#{liveAccount?.accountNumber || 'NX-LIVE'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sending Amount (BDT):</span>
              <span className="font-mono text-white font-bold">৳{effectiveBDT.toLocaleString()} BDT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Marketplace Exchange Rate:</span>
              <span className="font-mono text-slate-300">1 USD = ৳{rate.toFixed(2)} BDT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Gateway Processing Fee ({feePercent}%):</span>
              <span className="font-mono text-slate-300">-${feeUSD.toFixed(2)} USD</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
              <span className="text-emerald-400 font-bold">Net Live Credit (Upon Approval):</span>
              <span className="font-mono text-emerald-400 font-extrabold text-lg">
                ${netUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </span>
            </div>
          </div>

          {/* Step 4: Sender Details, TrxID & Proof */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Your {currentMethodName} Sender Number
              </label>
              <input
                type="text"
                required
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="e.g. 01712345678"
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">SMS Transaction ID (TrxID)</label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. BKA892104"
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs uppercase focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Optional Payment Proof Upload */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Payment Screenshot / Receipt Proof (Optional)
            </label>
            <label className="flex items-center justify-center gap-2 border border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-3 bg-[#0B1220] cursor-pointer transition-colors">
              {paymentProofName ? (
                <>
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold truncate">{paymentProofName}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-400">Attach bKash / Nagad / Rocket payment screenshot</span>
                </>
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPaymentProofName(file.name);
                }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !isKycApproved || grossUSD < minUSD}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Submitting Add Funds Request...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Submit Add Funds Request (৳{effectiveBDT.toLocaleString()} → ${netUSD} USD)
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Deposit History Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Your Live Funding Requests</h3>
          </div>
          <button
            onClick={fetchDeposits}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loadingHistory ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums font-mono">
            <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4">Sender Wallet</th>
                <th className="py-2.5 px-4">TrxID</th>
                <th className="py-2.5 px-4">BDT Paid</th>
                <th className="py-2.5 px-4">Net USD</th>
                <th className="py-2.5 px-4">Notes</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500 font-sans">
                    No Live Add Funds requests submitted yet.
                  </td>
                </tr>
              ) : (
                deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-[#151F30]/60">
                    <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-white font-sans">{d.method}</td>
                    <td className="py-2.5 px-4 text-slate-300">{d.senderNumber}</td>
                    <td className="py-2.5 px-4 text-blue-400 font-bold">{d.transactionId}</td>
                    <td className="py-2.5 px-4 text-white font-bold">৳{d.amountBDT.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-emerald-400 font-bold">
                      ${(d.netUSD ?? d.amountUSD).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-sans max-w-[160px] truncate">
                      {d.adminNotes || d.paymentProofName || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold font-sans ${
                          d.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : d.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const WithdrawalPage: React.FC = () => {
  const { activeAccount } = useTrading();
  const isLive = activeAccount.mode === 'LIVE';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">Withdrawal Portal</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {isLive ? 'Live Account' : 'Demo Funds Non-Withdrawable'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Demo virtual balances ($1,000 SIMULATED) cannot be withdrawn. Live disbursements require verified broker liquidity integration.
        </p>
      </div>

      <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
          <Lock className="w-5 h-5 shrink-0" />
          <span>{isLive ? 'Live Withdrawals Pending Broker Integration' : 'Demo Virtual Capital Cannot Be Withdrawn'}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isLive
            ? `Live Account #${activeAccount.accountNumber} disbursements remain locked pending authorized clearing broker settlement connectivity.`
            : `Demo Account #${activeAccount.accountNumber} holds simulated funds for risk-free strategy evaluation only.`}
        </p>
      </div>
    </div>
  );
};

export const TransactionsPage: React.FC = () => {
  const { transactions } = useTrading();
  const [filterType, setFilterType] = useState('ALL');

  const filtered = transactions.filter((t) => filterType === 'ALL' || t.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Financial Ledger &amp; Transactions</h2>
          <p className="text-xs text-slate-400 mt-1">Audit trail of Demo initial allocation and Live ledger operations.</p>
        </div>

        <div className="flex items-center gap-1 bg-[#151F30] p-1 rounded-lg border border-slate-800 text-xs">
          {['ALL', 'DEPOSIT', 'WITHDRAWAL'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                filterType === type ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums font-mono">
            <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No transactions found for the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#151F30]/60">
                    <td className="py-3 px-4 text-slate-400">{t.id}</td>
                    <td className="py-3 px-4 text-slate-400">{t.date}</td>
                    <td className="py-3 px-4 font-bold text-white">{t.accountNumber}</td>
                    <td className="py-3 px-4 font-semibold">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          t.type === 'DEPOSIT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-200">{t.method}</td>
                    <td className="py-3 px-4 text-slate-500">{t.reference}</td>
                    <td className={`py-3 px-4 font-bold ${t.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'DEPOSIT' ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t.currency}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
