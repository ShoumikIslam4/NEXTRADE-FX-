import React from 'react';
import { Link } from 'react-router-dom';
import { useTrading } from '../../contexts/TradingContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Activity, ArrowUpRight, ArrowRight, BarChart2, ShieldAlert, AlertTriangle
} from 'lucide-react';

export const TraderOverviewPage: React.FC = () => {
  const {
    activeAccount, accounts, switchAccount, positions, history, transactions,
    pairs, totalFloatingProfit, todayProfit, setSelectedPairSymbol, isDemoExhausted
  } = useTrading();
  const { user } = useAuth();

  const isLive = activeAccount.mode === 'LIVE';

  const primaryCards = [
    {
      title: isLive ? 'Live Account Balance' : 'Demo Balance (SIMULATED)',
      value: `$${activeAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subtitle: isLive ? 'Isolated Live Ledger (USD)' : `${activeAccount.currency} · Single $1,000 Allocation`,
      accent: isLive ? 'border-amber-500/30' : 'border-blue-500/30'
    },
    {
      title: isLive ? 'Live Equity' : 'Equity (DEMO / SIMULATED)',
      value: `$${activeAccount.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subtitle: isLive ? 'Verified Live Ledger Collateral' : 'Simulated Balance + Floating P/L',
      accent: 'border-emerald-500/30'
    },
    {
      title: isLive ? 'Floating P/L' : 'Floating P/L (DEMO)',
      value: `${totalFloatingProfit >= 0 ? '+' : ''}$${totalFloatingProfit.toFixed(2)}`,
      subtitle: `${positions.length} Active Positions`,
      valueColor: totalFloatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400',
      accent: totalFloatingProfit >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30'
    },
    {
      title: isLive ? "Today's P/L" : "Today's P/L (DEMO)",
      value: `${todayProfit >= 0 ? '+' : ''}$${todayProfit.toFixed(2)}`,
      subtitle: 'Realized + Unrealized Today',
      valueColor: todayProfit >= 0 ? 'text-emerald-400' : 'text-rose-400',
      accent: todayProfit >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30'
    },
    {
      title: 'Free Margin',
      value: `$${activeAccount.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subtitle: `Used Margin: $${activeAccount.margin.toFixed(2)}`,
      accent: 'border-slate-800'
    },
    {
      title: 'Margin Level',
      value: activeAccount.margin > 0 ? `${activeAccount.marginLevel}%` : 'Healthy',
      subtitle: `Leverage ${activeAccount.leverage}`,
      valueColor: activeAccount.marginLevel > 300 ? 'text-emerald-400' : 'text-amber-400',
      accent: 'border-slate-800'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Demo Exhausted Alert Banner */}
      {!isLive && isDemoExhausted && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-300">One-Time Demo Allocation Exhausted</div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                Your single $1,000 USD virtual demo allocation has been exhausted. Per platform policy, demo balance resets, top-ups, and additional demo accounts are disabled. You may apply for a Live Trading Account to continue.
              </div>
            </div>
          </div>
          <Link
            to="/trader/accounts?tab=live"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shrink-0 transition-colors text-center"
          >
            Apply for Live Account
          </Link>
        </div>
      )}

      {/* Live Mode Safety Alert Banner if Live Account is active */}
      {isLive && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300">
                Live Account Workspace · KYC Status: {(user?.kycStatus || 'NOT_APPLIED').replace(/_/g, ' ')}
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                {user?.kycStatus === 'APPROVED'
                  ? 'KYC Approved: Verified Add Funds (bKash / Nagad / Rocket) ledger crediting is unlocked. Live market order execution remains disabled pending authorized broker bridge connectivity.'
                  : 'Complete KYC verification to activate your Live Account ledger for Add Funds. Real-money order execution stays disabled until authorized broker liquidity integration.'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {user?.kycStatus === 'APPROVED' ? (
              <Link
                to="/trader/deposit"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
              >
                Add Funds (Live)
              </Link>
            ) : (
              <Link
                to="/trader/accounts?tab=live"
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
              >
                Live Onboarding / KYC
              </Link>
            )}
            <button
              onClick={() => {
                const demo = accounts.find((a) => a.mode === 'DEMO');
                if (demo) switchAccount(demo.id);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
            >
              Switch to Demo
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Hero Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#151F30] border border-slate-800 rounded-xl gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded font-mono ${
                isLive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}
            >
              {isLive ? 'LIVE ACCOUNT (LEDGER)' : 'DEMO / SIMULATED ($1,000 LIMIT)'} #{activeAccount.accountNumber}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              · {activeAccount.type} ({activeAccount.server})
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Institutional Trader Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isLive
              ? 'Isolated Live Account balance, KYC verification, and Finance-reviewed funding ledger.'
              : 'Simulated demo trading environment with $1,000 single-allocation balance. No KYC required for demo practice.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/trader/accounts?tab=live"
            className="px-3.5 py-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
          >
            Live Account Console
          </Link>

          <Link
            to="/trader/terminal"
            className="px-3.5 py-2 text-xs font-bold text-slate-200 bg-[#0B1220] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Launch Terminal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (6 metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {primaryCards.map((c, i) => (
          <div key={i} className={`p-4 bg-[#111827] border ${c.accent} rounded-lg flex flex-col justify-between`}>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{c.title}</div>
            <div className={`text-xl font-extrabold font-mono tabular-nums my-1.5 ${c.valueColor || 'text-white'}`}>
              {c.value}
            </div>
            <div className="text-[11px] text-slate-500 truncate">{c.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Middle Grid: Open Trades & Market Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Open Trades Panel (7 cols) */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                Active Open Trades ({isLive ? 'LIVE' : 'DEMO / SIMULATED'})
              </h3>
            </div>
            <Link to="/trader/positions" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              View All Positions ({positions.length})
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {positions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No active open trades in this account.</div>
            ) : (
              <table className="w-full text-left text-xs tabular-nums font-mono">
                <thead className="bg-[#0B1220] text-slate-400 text-[11px] border-b border-slate-800 font-sans">
                  <tr>
                    <th className="py-2.5 px-4">Instrument</th>
                    <th className="py-2.5 px-4">Side</th>
                    <th className="py-2.5 px-4">Lots</th>
                    <th className="py-2.5 px-4">Open</th>
                    <th className="py-2.5 px-4">Current</th>
                    <th className="py-2.5 px-4">Pips</th>
                    <th className="py-2.5 px-4 text-right">Floating P/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {positions.slice(0, 5).map((pos) => (
                    <tr key={pos.id} className="hover:bg-[#151F30]/60">
                      <td className="py-2.5 px-4 font-bold text-white">{pos.symbol}</td>
                      <td className="py-2.5 px-4 font-bold">
                        <span className={pos.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>{pos.side}</span>
                      </td>
                      <td className="py-2.5 px-4">{pos.lots.toFixed(2)}</td>
                      <td className="py-2.5 px-4">{pos.openPrice}</td>
                      <td className="py-2.5 px-4">{pos.currentPrice}</td>
                      <td className={`py-2.5 px-4 font-bold ${pos.pips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pos.pips >= 0 ? '+' : ''}
                        {pos.pips}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-bold ${
                          pos.floatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pos.floatingProfit >= 0 ? '+' : ''}${pos.floatingProfit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Market Watch Quick Strip (5 cols) */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Market Watch (SIMULATED FEED)</h3>
            </div>
            <Link to="/trader/terminal" className="text-xs text-blue-400 hover:underline">
              Trade in Terminal
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-800/60 overflow-y-auto max-h-[320px]">
            {pairs.slice(0, 6).map((pair) => (
              <div key={pair.symbol} className="flex items-center justify-between p-3 hover:bg-[#151F30] transition-colors">
                <div>
                  <div className="text-xs font-bold text-white font-mono">{pair.symbol}</div>
                  <div className="text-[11px] text-slate-400">{pair.name}</div>
                </div>

                <div className="flex items-center gap-4 text-right tabular-nums font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">BID</span>
                    <span className="text-white font-bold">{pair.bid.toFixed(pair.pipPrecision)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">24H</span>
                    <span className={pair.change24h >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {pair.change24h >= 0 ? '+' : ''}
                      {pair.change24h}%
                    </span>
                  </div>
                  <Link
                    to="/trader/terminal"
                    onClick={() => setSelectedPairSymbol(pair.symbol)}
                    className="p-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Trading Activity (DEMO / SIMULATED)</h3>
            <Link to="/trader/history" className="text-xs text-blue-400 hover:underline">
              Full History
            </Link>
          </div>
          <div className="divide-y divide-slate-800/60">
            {history.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No closed trades recorded yet.</div>
            ) : (
              history.slice(0, 4).map((h) => (
                <div key={h.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#151F30]/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${
                        h.profit >= 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {h.side}
                    </div>
                    <div>
                      <div className="font-bold text-white font-mono">
                        {h.symbol} · {h.lots} Lots
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {h.closeTime} · {h.reason}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono tabular-nums">
                    <div className={`text-sm font-bold ${h.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.profit >= 0 ? '+' : ''}${h.profit.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-500">{h.pips > 0 ? `+${h.pips}` : h.pips} pips</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Ledger Entries</h3>
            <Link to="/trader/transactions" className="text-xs text-blue-400 hover:underline">
              Ledger
            </Link>
          </div>
          <div className="divide-y divide-slate-800/60">
            {transactions.slice(0, 4).map((t) => (
              <div key={t.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#151F30]/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-mono font-bold text-[10px]">
                    {t.type.slice(0, 3)}
                  </div>
                  <div>
                    <div className="font-bold text-white">{t.method}</div>
                    <div className="text-[11px] text-slate-400">
                      {t.date} · {t.reference}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono tabular-nums">
                  <div className="text-sm font-bold text-white">
                    {t.type === 'DEPOSIT' ? '+' : '-'}${t.amount.toLocaleString()} {t.currency}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
