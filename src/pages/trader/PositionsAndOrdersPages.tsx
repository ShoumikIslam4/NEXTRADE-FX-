import React, { useState } from 'react';
import { useTrading } from '../../contexts/TradingContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  ListOrdered, Receipt, History, Search, Filter, 
  X, CheckCircle, ArrowDown, ArrowUp, Download, RefreshCw 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PositionsPage: React.FC = () => {
  const { positions, closePosition, totalFloatingProfit } = useTrading();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');

  const filtered = positions.filter(p => p.symbol.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()));

  const closeAll = () => {
    positions.forEach(p => closePosition(p.id));
    addToast({ type: 'info', title: 'Positions Closed', message: 'All open positions have been liquidated at current market price.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Open Positions (DEMO)</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time valuation of simulated market exposure and active contracts.</p>
        </div>

        <div className="flex items-center gap-3">
          {positions.length > 0 && (
            <button
              onClick={closeAll}
              className="px-3.5 py-2 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 rounded-lg transition-colors"
            >
              Liquidate All ({positions.length})
            </button>
          )}
          <Link
            to="/trader/terminal"
            className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Terminal View
          </Link>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by position ID or symbol..."
              className="w-full bg-[#151F30] border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="text-xs font-mono tabular-nums text-slate-300">
            Floating P/L: <span className={`font-bold ${totalFloatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalFloatingProfit >= 0 ? '+' : ''}${totalFloatingProfit.toFixed(2)} USD
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No matching open positions. Open a position in the Trading Terminal.
            </div>
          ) : (
            <table className="w-full text-left text-xs tabular-nums font-mono">
              <thead className="bg-[#0B1220] text-slate-400 text-[11px] font-sans border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Open Time</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Side</th>
                  <th className="py-3 px-4">Volume (Lots)</th>
                  <th className="py-3 px-4">Open Price</th>
                  <th className="py-3 px-4">Current Price</th>
                  <th className="py-3 px-4">Stop Loss</th>
                  <th className="py-3 px-4">Take Profit</th>
                  <th className="py-3 px-4">Pips</th>
                  <th className="py-3 px-4">Profit (USD)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(pos => (
                  <tr key={pos.id} className="hover:bg-[#151F30]/60">
                    <td className="py-3 px-4 text-slate-400">{pos.id}</td>
                    <td className="py-3 px-4 text-slate-400">{pos.openTime}</td>
                    <td className="py-3 px-4 font-bold text-white">{pos.symbol}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={pos.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                        {pos.side}
                      </span>
                    </td>
                    <td className="py-3 px-4">{pos.lots.toFixed(2)}</td>
                    <td className="py-3 px-4">{pos.openPrice}</td>
                    <td className="py-3 px-4 text-white font-semibold">{pos.currentPrice}</td>
                    <td className="py-3 px-4 text-slate-400">{pos.stopLoss || '—'}</td>
                    <td className="py-3 px-4 text-slate-400">{pos.takeProfit || '—'}</td>
                    <td className={`py-3 px-4 font-bold ${pos.pips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pos.pips >= 0 ? '+' : ''}{pos.pips}
                    </td>
                    <td className={`py-3 px-4 font-bold ${pos.floatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pos.floatingProfit >= 0 ? '+' : ''}${pos.floatingProfit.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => closePosition(pos.id)}
                        className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-colors text-xs font-semibold"
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export const PendingOrdersPage: React.FC = () => {
  const { pendingOrders, cancelPendingOrder } = useTrading();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Pending Orders (DEMO)</h2>
          <p className="text-xs text-slate-400 mt-1">Simulated limit and stop orders awaiting trigger conditions.</p>
        </div>
        <Link
          to="/trader/terminal"
          className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          Place New Order
        </Link>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {pendingOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No active pending orders. Create limit or stop orders in the Terminal.
            </div>
          ) : (
            <table className="w-full text-left text-xs tabular-nums font-mono">
              <thead className="bg-[#0B1220] text-slate-400 text-[11px] font-sans border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Placed Date</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Order Type</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Target Price</th>
                  <th className="py-3 px-4">Market Price</th>
                  <th className="py-3 px-4">Stop Loss</th>
                  <th className="py-3 px-4">Take Profit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingOrders.map(o => (
                  <tr key={o.id} className="hover:bg-[#151F30]/60">
                    <td className="py-3 px-4 text-slate-400">{o.id}</td>
                    <td className="py-3 px-4 text-slate-400">{o.placedTime}</td>
                    <td className="py-3 px-4 font-bold text-white">{o.symbol}</td>
                    <td className="py-3 px-4 font-bold text-blue-400">{o.type} {o.side}</td>
                    <td className="py-3 px-4">{o.lots.toFixed(2)} Lots</td>
                    <td className="py-3 px-4 text-amber-400 font-bold">{o.targetPrice}</td>
                    <td className="py-3 px-4 text-slate-300">{o.currentPrice}</td>
                    <td className="py-3 px-4 text-slate-400">{o.stopLoss || '—'}</td>
                    <td className="py-3 px-4 text-slate-400">{o.takeProfit || '—'}</td>
                    <td className="py-3 px-4 text-amber-400 font-semibold">{o.status}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => cancelPendingOrder(o.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export const TradeHistoryPage: React.FC = () => {
  const { history } = useTrading();
  const { addToast } = useToast();

  const totalRealized = history.reduce((acc, h) => acc + h.profit, 0);
  const winningTrades = history.filter(h => h.profit > 0).length;
  const winRate = history.length > 0 ? ((winningTrades / history.length) * 100).toFixed(1) : '0';

  const exportCSV = () => {
    addToast({ type: 'success', title: 'Export Started', message: 'Simulated trade history exported to CSV.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Trade History (DEMO)</h2>
          <p className="text-xs text-slate-400 mt-1">Audit log of all liquidated simulated trades and executed take profits / stop losses.</p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-200 bg-[#151F30] border border-slate-700 hover:text-white rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Realized P/L</div>
          <div className={`text-xl font-bold font-mono mt-1 ${totalRealized >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalRealized >= 0 ? '+' : ''}${totalRealized.toFixed(2)} USD
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Trades Closed</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{history.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Win Rate (Simulated)</div>
          <div className="text-xl font-bold font-mono text-blue-400 mt-1">{winRate}% ({winningTrades} won)</div>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {history.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No closed trade history yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs tabular-nums font-mono">
              <thead className="bg-[#0B1220] text-slate-400 text-[11px] font-sans border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Close Time</th>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">Side</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Open Price</th>
                  <th className="py-3 px-4">Close Price</th>
                  <th className="py-3 px-4">Pips</th>
                  <th className="py-3 px-4">Profit / Loss (USD)</th>
                  <th className="py-3 px-4 text-right">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map(h => (
                  <tr key={h.id} className="hover:bg-[#151F30]/60">
                    <td className="py-3 px-4 text-slate-400">{h.id}</td>
                    <td className="py-3 px-4 text-slate-400">{h.closeTime}</td>
                    <td className="py-3 px-4 font-bold text-white">{h.symbol}</td>
                    <td className="py-3 px-4 font-bold">
                      <span className={h.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>
                        {h.side}
                      </span>
                    </td>
                    <td className="py-3 px-4">{h.lots.toFixed(2)} Lots</td>
                    <td className="py-3 px-4">{h.openPrice}</td>
                    <td className="py-3 px-4">{h.closePrice}</td>
                    <td className={`py-3 px-4 font-bold ${h.pips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.pips >= 0 ? '+' : ''}{h.pips}
                    </td>
                    <td className={`py-3 px-4 font-bold ${h.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {h.profit >= 0 ? '+' : ''}${h.profit.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-sans">{h.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
