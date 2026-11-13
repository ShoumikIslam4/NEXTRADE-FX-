import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrading } from '../../contexts/TradingContext';
import { ShieldAlert, X, AlertTriangle, ArrowRight, Lock } from 'lucide-react';

export const ResetDemoModal: React.FC = () => {
  const {
    resetModalOpen,
    setResetModalOpen,
    demoExhaustedModalOpen,
    setDemoExhaustedModalOpen,
    isDemoExhausted,
    activeAccount,
    accounts,
    switchAccount
  } = useTrading();
  const navigate = useNavigate();

  const isOpen = resetModalOpen || demoExhaustedModalOpen;
  if (!isOpen) return null;

  const handleClose = () => {
    setResetModalOpen(false);
    setDemoExhaustedModalOpen(false);
  };

  const handleApplyLive = () => {
    const liveAcc = accounts.find((a) => a.mode === 'LIVE');
    if (liveAcc) switchAccount(liveAcc.id);
    handleClose();
    navigate('/trader/accounts?tab=live');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#111827] border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative space-y-5">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDemoExhausted || demoExhaustedModalOpen
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
            }`}
          >
            {isDemoExhausted || demoExhaustedModalOpen ? (
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Lock className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isDemoExhausted || demoExhaustedModalOpen
                ? 'One-Time Demo Allocation Exhausted'
                : 'Strict Single Demo Allocation Policy'}
            </h3>
            <p className="text-xs text-slate-400">
              DEMO / SIMULATED Account #{activeAccount.accountNumber}
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="bg-[#151F30] border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
          <div className="flex items-start gap-2 text-amber-300 font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {isDemoExhausted || demoExhaustedModalOpen
                ? 'Your one-time $1,000.00 USD demo allocation has been exhausted.'
                : 'Demo Resets & Top-Ups Are Permanently Disabled'}
            </span>
          </div>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
            <li>
              Every registered user is granted strictly <strong className="text-white">one Demo Account</strong> with an initial <strong className="text-white">$1,000.00 USD</strong> virtual balance.
            </li>
            <li>
              Demo balance resets, top-ups, additional demo credits, and second demo accounts are <strong className="text-rose-400">not permitted</strong>.
            </li>
            <li>
              Your demo equity and history persist across sessions under <strong className="text-blue-400">DEMO / SIMULATED</strong> rules.
            </li>
            <li>
              To continue with real capital onboarding, you may apply for a <strong className="text-emerald-400">Live Trading Account</strong> and complete KYC verification.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-700 bg-[#0B1220] hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleApplyLive}
            className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
          >
            <span>Apply for Live Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
