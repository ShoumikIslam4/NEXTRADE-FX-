import React, { useState, useEffect } from 'react';
import { useTrading } from '../../contexts/TradingContext';
import { useToast } from '../../contexts/ToastContext';
import { X, Edit3 } from 'lucide-react';

export const TradingMonitorPage: React.FC = () => {
  const exposures = [
    { pair: 'EUR/USD', longLots: 42.5, shortLots: 38.0, netLots: '+4.5 Long', risk: 'LOW' },
    { pair: 'GBP/USD', longLots: 18.0, shortLots: 29.5, netLots: '-11.5 Short', risk: 'MEDIUM' },
    { pair: 'USD/JPY', longLots: 55.0, shortLots: 22.0, netLots: '+33.0 Long', risk: 'HIGH' },
    { pair: 'XAU/USD', longLots: 120.5, shortLots: 84.0, netLots: '+36.5 Long', risk: 'HIGH' },
    { pair: 'US30.cash', longLots: 14.0, shortLots: 12.0, netLots: '+2.0 Long', risk: 'LOW' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Dealing Desk &amp; Exposure Monitor</h2>
        <p className="text-xs text-slate-400 mt-1">
          Aggregated net risk exposure across simulated client books.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Long Exposure</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">250.0 Lots</div>
          <div className="text-[11px] text-slate-500 mt-1">~$25M Simulated Notional</div>
        </div>

        <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Short Exposure</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">185.5 Lots</div>
          <div className="text-[11px] text-slate-500 mt-1">~$18.5M Simulated Notional</div>
        </div>

        <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">Net Warehouse Skew</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">+64.5 Lots Long</div>
          <div className="text-[11px] text-slate-500 mt-1">A-Book Hedged Ratio: 85%</div>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Asset Class Exposure Breakdown</h3>
        </div>
        <table className="w-full text-left text-xs tabular-nums font-mono">
          <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Instrument</th>
              <th className="py-3 px-4">Client Long Volume</th>
              <th className="py-3 px-4">Client Short Volume</th>
              <th className="py-3 px-4">Net Exposure</th>
              <th className="py-3 px-4 text-right">Risk Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {exposures.map((exp) => (
              <tr key={exp.pair} className="hover:bg-[#151F30]/60">
                <td className="py-3 px-4 font-bold text-white font-mono">{exp.pair}</td>
                <td className="py-3 px-4 text-emerald-400">{exp.longLots} Lots</td>
                <td className="py-3 px-4 text-rose-400">{exp.shortLots} Lots</td>
                <td className="py-3 px-4 font-bold text-white">{exp.netLots}</td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold font-sans ${
                      exp.risk === 'LOW'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : exp.risk === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {exp.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const OrdersManagementPage: React.FC = () => {
  const { pendingOrders, cancelPendingOrder } = useTrading();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Orders Management</h2>
        <p className="text-xs text-slate-400 mt-1">Audit and supervise all pending limit and stop orders.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs tabular-nums font-mono">
          <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Time Placed</th>
              <th className="py-3 px-4">Symbol</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Lots</th>
              <th className="py-3 px-4">Target Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Admin Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {pendingOrders.map((o) => (
              <tr key={o.id} className="hover:bg-[#151F30]/60">
                <td className="py-3 px-4 text-slate-400">{o.id}</td>
                <td className="py-3 px-4 text-slate-400">{o.placedTime}</td>
                <td className="py-3 px-4 font-bold text-white">{o.symbol}</td>
                <td className="py-3 px-4 text-blue-400 font-bold">
                  {o.type} {o.side}
                </td>
                <td className="py-3 px-4">{o.lots} Lots</td>
                <td className="py-3 px-4 text-amber-400 font-bold">{o.targetPrice}</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{o.status}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => cancelPendingOrder(o.id)}
                    className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-colors text-xs font-sans font-semibold"
                  >
                    Force Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AdminPositionsPage: React.FC = () => {
  const { positions, closePosition } = useTrading();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Dealing Desk Open Positions</h2>
        <p className="text-xs text-slate-400 mt-1">Streaming position monitor across simulated Demo client accounts.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs tabular-nums font-mono">
          <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Position Ticket</th>
              <th className="py-3 px-4">Open Time</th>
              <th className="py-3 px-4">Instrument</th>
              <th className="py-3 px-4">Side</th>
              <th className="py-3 px-4">Lots</th>
              <th className="py-3 px-4">Open Price</th>
              <th className="py-3 px-4">Current Price</th>
              <th className="py-3 px-4">Floating P/L</th>
              <th className="py-3 px-4 text-right">Dealing Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {positions.map((p) => (
              <tr key={p.id} className="hover:bg-[#151F30]/60">
                <td className="py-3 px-4 text-slate-400">{p.id}</td>
                <td className="py-3 px-4 text-slate-400">{p.openTime}</td>
                <td className="py-3 px-4 font-bold text-white">{p.symbol}</td>
                <td className="py-3 px-4 font-bold">
                  <span className={p.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>{p.side}</span>
                </td>
                <td className="py-3 px-4">{p.lots.toFixed(2)}</td>
                <td className="py-3 px-4">{p.openPrice}</td>
                <td className="py-3 px-4 font-bold text-white">{p.currentPrice}</td>
                <td className={`py-3 px-4 font-bold ${p.floatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {p.floatingProfit >= 0 ? '+' : ''}${p.floatingProfit.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => closePosition(p.id)}
                    className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-colors text-xs font-sans font-semibold"
                  >
                    Force Liquidate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AdminTransactionsPage: React.FC = () => {
  const { transactions } = useTrading();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Transaction Management (Admin)</h2>
        <p className="text-xs text-slate-400 mt-1">Master financial log of account balances and allocations.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs tabular-nums font-mono">
          <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">TX ID</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Gateway</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-[#151F30]/60">
                <td className="py-3 px-4 text-slate-400">{t.id}</td>
                <td className="py-3 px-4 text-slate-400">{t.date}</td>
                <td className="py-3 px-4 font-bold text-white">{t.accountNumber}</td>
                <td className="py-3 px-4 font-bold text-blue-400">{t.type}</td>
                <td className="py-3 px-4 font-sans text-slate-300">{t.method}</td>
                <td className={`py-3 px-4 font-bold ${t.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.type === 'DEPOSIT' ? '+' : '-'}${t.amount.toLocaleString()} {t.currency}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-sans font-bold">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AdminDepositsPage: React.FC = () => {
  const { addToast } = useToast();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bdtRate, setBdtRate] = useState<number>(122.5);
  const [newRate, setNewRate] = useState<string>('122.50');
  const [updatingRate, setUpdatingRate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [rejectModal, setRejectModal] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('Invalid TrxID or sender verification mismatch.');

  const fetchDepositsAndRate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nextrade_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [depRes, rateRes] = await Promise.all([
        fetch('/api/admin/deposits', { headers, credentials: 'include' }),
        fetch('/api/market/bdt-rate')
      ]);

      if (depRes.ok) {
        const depData = await depRes.json();
        if (depData.success && depData.deposits) {
          setDeposits(depData.deposits);
        }
      }

      if (rateRes.ok) {
        const rateData = await rateRes.json();
        if (rateData.success && rateData.rate) {
          setBdtRate(rateData.rate);
          setNewRate(rateData.rate.toString());
        }
      }
    } catch (err) {
      console.error('[Admin] Error fetching deposits', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepositsAndRate();
  }, []);

  const handleReviewDeposit = async (id: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    try {
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch(`/api/admin/deposits/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ status, notes: notes || '' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast({
          type: status === 'APPROVED' ? 'success' : 'warning',
          title: `Deposit ${status}`,
          message: data.message
        });
        setRejectModal(null);
        fetchDepositsAndRate();
      } else {
        addToast({
          type: 'error',
          title: 'Review Failed',
          message: data.message || 'Could not update deposit status.'
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Network error processing deposit review.'
      });
    }
  };

  const handleUpdateBdtRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newRate);
    if (isNaN(parsed) || parsed <= 0) {
      addToast({ type: 'warning', title: 'Invalid Rate', message: 'Please enter a valid positive number.' });
      return;
    }

    try {
      setUpdatingRate(true);
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch('/api/admin/bdt-rate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ rate: parsed })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBdtRate(parsed);
        addToast({
          type: 'success',
          title: 'Exchange Rate Updated',
          message: `USD/BDT rate updated to ৳${parsed} BDT per 1 USD.`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: data.message || 'Could not update rate.'
        });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Network error updating rate.' });
    } finally {
      setUpdatingRate(false);
    }
  };

  const filtered = deposits.filter((d) => statusFilter === 'ALL' || d.status === statusFilter);
  const pendingCount = deposits.filter((d) => d.status === 'PENDING').length;
  const approvedTotalUSD = deposits
    .filter((d) => d.status === 'APPROVED')
    .reduce((sum, d) => sum + (d.netUSD ?? d.amountUSD ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Live Add Funds Verification (bKash / Nagad / Rocket)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit incoming funding requests (min $10 USD). Approved requests credit strictly to verified client Live Account ledgers.
          </p>
        </div>
      </div>

      {/* Top Stats & Rate Control */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-semibold">Pending Review</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{pendingCount}</div>
          <div className="text-[10px] text-slate-500">Requires Finance approval</div>
        </div>

        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-semibold">Approved Live Credits</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${approvedTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500">Credited strictly to Live Ledgers</div>
        </div>

        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-semibold">Live USD/BDT Rate</div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">৳{bdtRate.toFixed(2)}</div>
          <div className="text-[10px] text-slate-500">Marketplace conversion</div>
        </div>

        <div className="p-4 bg-[#151F30] border border-slate-700 rounded-xl">
          <div className="text-xs text-slate-300 font-semibold mb-2">Adjust USD/BDT Rate</div>
          <form onSubmit={handleUpdateBdtRate} className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="w-full bg-[#0B1220] border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
            />
            <button
              type="submit"
              disabled={updatingRate}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shrink-0 transition-colors"
            >
              Update
            </button>
          </form>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white">Incoming MFS Funding Requests</h3>

          <div className="flex items-center gap-1.5 text-xs">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  statusFilter === st ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-[#151F30]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums font-mono">
            <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Trader Email</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Sender Wallet</th>
                <th className="py-3 px-4">TrxID / Proof</th>
                <th className="py-3 px-4">BDT Paid</th>
                <th className="py-3 px-4">Net Live USD</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right font-sans">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-500 font-sans">
                    Loading funding requests...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-500 font-sans">
                    No funding requests in this view.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-[#151F30]/60">
                    <td className="py-3 px-4 text-slate-400">{d.id}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">{d.userEmail}</td>
                    <td className="py-3 px-4 font-bold text-white font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          d.method === 'bKash'
                            ? 'bg-pink-500/20 text-pink-300'
                            : d.method === 'Nagad'
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {d.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-bold">{d.senderNumber}</td>
                    <td className="py-3 px-4">
                      <div className="text-blue-400 font-bold tracking-wider">{d.transactionId}</div>
                      {d.paymentProofName && (
                        <div className="text-[10px] text-slate-400 font-sans truncate max-w-[140px]">
                          Proof: {d.paymentProofName}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white font-bold">৳{d.amountBDT.toLocaleString()}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      ${(d.netUSD ?? d.amountUSD).toFixed(2)} USD
                      {d.feePercent > 0 && (
                        <span className="block text-[10px] text-slate-400 font-sans">Fee {d.feePercent}%</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold font-sans ${
                          d.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : d.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {d.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReviewDeposit(d.id, 'APPROVED')}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                          >
                            Approve Live Credit
                          </button>
                          <button
                            onClick={() => {
                              setRejectModal(d);
                              setRejectReason('Invalid TrxID or sender verification mismatch.');
                            }}
                            className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 font-semibold text-xs transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-sans">
                          {d.reviewedBy ? `By ${d.reviewedBy}` : d.adminNotes || 'Reviewed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Reason Modal (Replaces window.prompt) */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151F30] border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Reject Funding Request</h3>
              <button onClick={() => setRejectModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <div>
                Trader: <strong className="text-white">{rejectModal.userEmail}</strong>
              </div>
              <div>
                TrxID: <strong className="font-mono text-blue-400">{rejectModal.transactionId}</strong> (৳
                {rejectModal.amountBDT.toLocaleString()})
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Rejection Reason</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewDeposit(rejectModal.id, 'REJECTED', rejectReason)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminWithdrawalsPage: React.FC = () => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState([
    {
      id: 'WTH-881',
      client: 'Alexander Wright',
      account: 'NX-LIVE-10492',
      amount: 250,
      method: 'bKash Payout (Pending Broker)',
      time: '2026-11-11 11:30',
      status: 'PENDING'
    }
  ]);

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)));
    addToast({
      type: action === 'APPROVED' ? 'success' : 'warning',
      title: `Withdrawal ${action}`,
      message: `Request ${id} marked as ${action}.`
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Withdrawal Requests Queue</h2>
        <p className="text-xs text-slate-400 mt-1">Review client Live withdrawal requests.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs tabular-nums font-mono">
          <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Request ID</th>
              <th className="py-3 px-4">Trader Name</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Amount (USD)</th>
              <th className="py-3 px-4">Destination</th>
              <th className="py-3 px-4">Requested At</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-[#151F30]/60">
                <td className="py-3 px-4 text-slate-400">{r.id}</td>
                <td className="py-3 px-4 font-bold text-white font-sans">{r.client}</td>
                <td className="py-3 px-4 font-bold">{r.account}</td>
                <td className="py-3 px-4 font-bold text-rose-400">${r.amount.toLocaleString()}</td>
                <td className="py-3 px-4 font-sans text-slate-300">{r.method}</td>
                <td className="py-3 px-4 text-slate-400">{r.time}</td>
                <td className="py-3 px-4">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold font-sans ${
                      r.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : r.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {r.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-1.5 font-sans">
                      <button
                        onClick={() => handleAction(r.id, 'APPROVED')}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(r.id, 'REJECTED')}
                        className="px-2 py-1 rounded bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 font-semibold text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const PaymentMethodsPage: React.FC = () => {
  const { addToast } = useToast();
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<any | null>(null);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch('/api/admin/payment-methods', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.methods) setMethods(data.methods);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const updateGateway = async (id: string, patch: any) => {
    try {
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch(`/api/admin/payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify(patch)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ type: 'success', title: 'Gateway Saved', message: data.message });
        setEditingMethod(null);
        fetchMethods();
      } else {
        addToast({ type: 'error', title: 'Update Failed', message: data.message || 'Could not save payment gateway.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Network Error', message: 'Could not reach payment method config API.' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Payment Methods &amp; Gateways (bKash / Nagad / Rocket)</h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure receiving MFS wallet numbers, fee %, $10 USD minimum thresholds, instructions, and gateway availability.
        </p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs tabular-nums font-mono">
          <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Gateway</th>
              <th className="py-3 px-4">Wallet Number</th>
              <th className="py-3 px-4">Account Type</th>
              <th className="py-3 px-4">Fee %</th>
              <th className="py-3 px-4">Min Deposit</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right font-sans">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  Loading gateway configurations...
                </td>
              </tr>
            ) : (
              methods.map((m) => (
                <tr key={m.id} className="hover:bg-[#151F30]/60">
                  <td className="py-3 px-4 font-bold text-white">{m.method || m.name}</td>
                  <td className="py-3 px-4 font-mono text-blue-300 font-bold">{m.accountNumber}</td>
                  <td className="py-3 px-4 text-slate-400">{m.accountType}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{m.feePercent}%</td>
                  <td className="py-3 px-4 font-mono text-white">${m.minUSD} USD</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        m.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.isActive ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingMethod({ ...m })}
                        className="px-2.5 py-1 rounded bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600 hover:text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => updateGateway(m.id, { isActive: !m.isActive })}
                        className="px-2.5 py-1 rounded bg-[#151F30] border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold"
                      >
                        {m.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Gateway Modal */}
      {editingMethod && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151F30] border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Configure {editingMethod.method || editingMethod.name} Gateway</h3>
              <button onClick={() => setEditingMethod(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Receiving Wallet Number</label>
                <input
                  type="text"
                  value={editingMethod.accountNumber}
                  onChange={(e) => setEditingMethod({ ...editingMethod, accountNumber: e.target.value })}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Type Label</label>
                <input
                  type="text"
                  value={editingMethod.accountType}
                  onChange={(e) => setEditingMethod({ ...editingMethod, accountType: e.target.value })}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Processing Fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={editingMethod.feePercent}
                    onChange={(e) => setEditingMethod({ ...editingMethod, feePercent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Deposit (USD, ≥ $10)</label>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    value={editingMethod.minUSD}
                    onChange={(e) =>
                      setEditingMethod({ ...editingMethod, minUSD: Math.max(10, parseFloat(e.target.value) || 10) })
                    }
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Instructions</label>
                <textarea
                  rows={3}
                  value={editingMethod.instructions}
                  onChange={(e) => setEditingMethod({ ...editingMethod, instructions: e.target.value })}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMethod(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  updateGateway(editingMethod.id, {
                    accountNumber: editingMethod.accountNumber,
                    accountType: editingMethod.accountType,
                    feePercent: editingMethod.feePercent,
                    minUSD: editingMethod.minUSD,
                    instructions: editingMethod.instructions,
                    isActive: editingMethod.isActive
                  })
                }
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Save Gateway Config
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
