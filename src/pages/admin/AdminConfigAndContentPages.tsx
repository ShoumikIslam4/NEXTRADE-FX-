import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { MOCK_ADMIN_PAIR_SETTINGS, MOCK_AUDIT_LOGS, MOCK_STAFF_MEMBERS } from '../../data/mockAdminData';
import { MOCK_ECONOMIC_EVENTS, MOCK_NEWS_ARTICLES, MOCK_TRADING_SIGNALS, MOCK_EDUCATION_COURSES } from '../../data/mockMarketData';
import { 
  Sliders, Percent, DollarSign, Radio, Newspaper, 
  Calendar, GraduationCap, Globe, LifeBuoy, Bell, 
  BarChart3, UserCog, Key, ScrollText, Settings, 
  Plus, Trash2, Edit, CheckCircle2, ShieldCheck, RefreshCw 
} from 'lucide-react';

export const CurrencyPairsAdminPage: React.FC = () => {
  const { addToast } = useToast();
  const [pairs, setPairs] = useState(MOCK_ADMIN_PAIR_SETTINGS);

  const togglePair = (symbol: string) => {
    setPairs(prev => prev.map(p => {
      if (p.symbol === symbol) {
        const next = !p.tradingEnabled;
        addToast({
          type: next ? 'success' : 'warning',
          title: 'Pair Status Changed',
          message: `${symbol} trading is now ${next ? 'ENABLED' : 'HALTED'}`
        });
        return { ...p, tradingEnabled: next };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Currency Pairs & Tradable Assets</h2>
        <p className="text-xs text-slate-400 mt-1">Configure trading enablement, lot contracts, and leverage restrictions.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs tabular-nums font-mono">
          <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Symbol</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Min Spread</th>
              <th className="py-3 px-4">Spread Markup</th>
              <th className="py-3 px-4">Max Leverage</th>
              <th className="py-3 px-4">Commission</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {pairs.map(p => (
              <tr key={p.symbol} className="hover:bg-[#151F30]/60">
                <td className="py-3 px-4 font-bold text-white font-mono">{p.symbol}</td>
                <td className="py-3 px-4 text-slate-300">{p.name}</td>
                <td className="py-3 px-4 text-slate-400">{p.category}</td>
                <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{p.minSpread} pips</td>
                <td className="py-3 px-4 font-mono text-amber-400 font-bold">+{p.spreadMarkup} pips</td>
                <td className="py-3 px-4 font-mono text-white">1:{p.maxLeverage}</td>
                <td className="py-3 px-4 font-mono text-slate-300">${p.commissionPerLot}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    p.tradingEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {p.tradingEnabled ? 'ACTIVE' : 'HALTED'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => togglePair(p.symbol)}
                    className="px-2.5 py-1 rounded bg-[#151F30] border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold"
                  >
                    {p.tradingEnabled ? 'Halt Trading' : 'Enable'}
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

export const SpreadManagementPage: React.FC = () => {
  const { addToast } = useToast();
  const [globalMarkup, setGlobalMarkup] = useState('0.10');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({ type: 'success', title: 'Spread Rules Updated', message: `Global markup set to +${globalMarkup} pips.` });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Spread Management & Markups</h2>
        <p className="text-xs text-slate-400 mt-1">Configure automated dynamic spread markups on raw simulated liquidity feeds.</p>
      </div>

      <form onSubmit={handleSave} className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Standard Account Fixed Markup (pips)</label>
          <input
            type="number"
            step="0.01"
            value={globalMarkup}
            onChange={e => setGlobalMarkup(e.target.value)}
            className="w-full bg-[#0B1220] border border-slate-700 rounded p-2 text-white font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Raw ECN Spread Passthrough</label>
          <div className="p-3 bg-[#0B1220] rounded text-emerald-400 font-mono font-bold">
            0.0 Pips Raw Passthrough + $3.50 commission
          </div>
        </div>
        <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded">
          Update Spread Engine
        </button>
      </form>
    </div>
  );
};

export const LeverageSettingsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Leverage & Margin Call Policies</h2>
        <p className="text-xs text-slate-400 mt-1">Dynamic leverage scaling tiers and liquidation threshold configurations.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0B1220] rounded-lg border border-slate-800">
            <div className="text-slate-400 uppercase text-[10px]">Maximum Dynamic Leverage</div>
            <div className="text-xl font-bold text-white font-mono mt-1">1:500</div>
          </div>
          <div className="p-4 bg-[#0B1220] rounded-lg border border-slate-800">
            <div className="text-slate-400 uppercase text-[10px]">Margin Call Warning Level</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">100% Margin</div>
          </div>
          <div className="p-4 bg-[#0B1220] rounded-lg border border-slate-800">
            <div className="text-slate-400 uppercase text-[10px]">Automatic Stop Out Liquidation</div>
            <div className="text-xl font-bold text-rose-400 font-mono mt-1">50% Margin</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CommissionSettingsPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Commission Structures</h2>
        <p className="text-xs text-slate-400 mt-1">Turnover fee calculation rules per standard lot round-turn.</p>
      </div>
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 text-xs space-y-3 font-mono">
        <div className="flex justify-between py-2 border-b border-slate-800">
          <span className="text-slate-400 font-sans">Raw ECN Standard</span>
          <span className="text-white font-bold">$3.50 / lot ($7.00 round turn)</span>
        </div>
        <div className="flex justify-between py-2 border-b border-slate-800">
          <span className="text-slate-400 font-sans">Institutional Pro Negotiated</span>
          <span className="text-white font-bold">$1.80 / lot ($3.60 round turn)</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-400 font-sans">Index CFDs & Crypto</span>
          <span className="text-emerald-400 font-bold">$0.00 (Commission-Free Spread Included)</span>
        </div>
      </div>
    </div>
  );
};

export const SignalsManagementPage: React.FC = () => {
  const { addToast } = useToast();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Trading Signals Publisher</h2>
          <p className="text-xs text-slate-400 mt-1">Broadcast new quantitative setups directly to the client terminal feed.</p>
        </div>
        <button
          onClick={() => addToast({ type: 'success', title: 'Signal Form', message: 'Ready to publish new trade setup.' })}
          className="px-3.5 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
        >
          Publish New Signal
        </button>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800/80">
        {MOCK_TRADING_SIGNALS.map(s => (
          <div key={s.id} className="p-4 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-white font-mono">{s.pair} · {s.direction} ({s.confidence}% Confidence)</div>
              <div className="text-slate-400 mt-0.5">{s.strategy} · Entry: {s.entryPrice} | SL: {s.stopLoss} | TP: {s.takeProfit1}</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NewsManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Market News CMS</h2>
        <p className="text-xs text-slate-400 mt-1">Draft, schedule, and distribute macroeconomic briefs to the public website.</p>
      </div>
      <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800/80">
        {MOCK_NEWS_ARTICLES.map(n => (
          <div key={n.id} className="p-4 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-white">{n.title}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">{n.category} · {n.timestamp} · Source: {n.source}</div>
            </div>
            <span className="text-xs text-blue-400 font-semibold">{n.readTime}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CalendarManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Economic Calendar Management</h2>
        <p className="text-xs text-slate-400 mt-1">Review scheduled macroeconomic indicators and update consensus estimates.</p>
      </div>
      <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800/80">
        {MOCK_ECONOMIC_EVENTS.map(e => (
          <div key={e.id} className="p-3.5 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="font-bold text-white font-sans mr-2">{e.event}</span>
              <span className="text-slate-400">({e.currency} · {e.time})</span>
            </div>
            <span className="text-amber-400 font-bold font-sans uppercase text-[10px]">{e.impact} impact</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EducationManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Education Hub Curriculum</h2>
        <p className="text-xs text-slate-400 mt-1">Manage institutional syllabus, curriculum modules, and trader guides.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_EDUCATION_COURSES.map(c => (
          <div key={c.id} className="p-5 bg-[#111827] border border-slate-800 rounded-xl">
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold uppercase">{c.level}</span>
            <h3 className="text-sm font-bold text-white mt-2 mb-1">{c.title}</h3>
            <p className="text-xs text-slate-400 mb-3">{c.description}</p>
            <div className="text-[11px] text-slate-500 font-mono">{c.modulesCount} Modules · {c.duration}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CmsContentPage: React.FC = () => {
  const { addToast } = useToast();
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">CMS / Website Content</h2>
        <p className="text-xs text-slate-400 mt-1">Update public portal hero titles, promotional copy, and trading disclaimer text.</p>
      </div>
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Hero Heading Copy</label>
          <input
            type="text"
            defaultValue="Trade Global Forex & CFDs With Institutional Precision"
            className="w-full bg-[#0B1220] border border-slate-700 rounded p-2 text-white"
          />
        </div>
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Global Risk Warning Footer Banner</label>
          <textarea
            rows={3}
            defaultValue="All market prices, quotes, and execution fills are SIMULATED in this demo environment. No real capital is ever used."
            className="w-full bg-[#0B1220] border border-slate-700 rounded p-2 text-white"
          />
        </div>
        <button
          onClick={() => addToast({ type: 'success', title: 'CMS Updated', message: 'Public website copy saved.' })}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded"
        >
          Publish Website Content
        </button>
      </div>
    </div>
  );
};

export const SupportTicketsAdminPage: React.FC = () => {
  const { addToast } = useToast();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Client Support Desk Administration</h2>
        <p className="text-xs text-slate-400 mt-1">Inquiries submitted by traders regarding execution, KYC, and platform features.</p>
      </div>
      <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800/80 text-xs">
        {[
          { id: 'TKT-101', subject: 'Inquire about Gold spread volatility', user: 'Alexander Wright', dept: 'Dealing Desk', status: 'OPEN' },
          { id: 'TKT-102', subject: 'KYC proof of address approval request', user: 'Matteo Rossi', dept: 'Compliance', status: 'IN_PROGRESS' },
        ].map(t => (
          <div key={t.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-bold text-white">{t.subject}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">{t.id} · {t.user} · {t.dept}</div>
            </div>
            <button
              onClick={() => addToast({ type: 'info', title: 'Ticket Assigned', message: `Responding to ${t.id}` })}
              className="px-3 py-1 rounded bg-[#151F30] border border-slate-700 text-slate-200 hover:text-white"
            >
              Reply / Resolve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('nextrade_token');
    fetch('/api/admin/audit-logs', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.logs) {
          setLogs(data.logs);
        } else {
          setLogs(MOCK_AUDIT_LOGS);
        }
      })
      .catch(() => setLogs(MOCK_AUDIT_LOGS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Security & Dealing Audit Logs</h2>
        <p className="text-xs text-slate-400 mt-1">Append-only immutable record of all administrative, user, and authentication events.</p>
      </div>
      <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800/80 font-mono text-xs">
        {logs.map(log => (
          <div key={log.id} className="p-4 hover:bg-[#151F30]/50 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-400">{log.action}</span>
              <span className="text-slate-500">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</span>
            </div>
            <div className="text-slate-200 font-sans text-xs">{log.details}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Actor: {log.actorEmail || log.staffUser} · Resource: {log.resource || log.targetType} · IP: {log.ipAddress}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GeneralSettingsPage: React.FC = () => {
  const { addToast } = useToast();
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">General Broker Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Platform operational status, server cluster routing, and simulated gateway heartbeat.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Platform Brand Title</label>
          <input
            type="text"
            defaultValue="NEXTRADE FX Institutional Platform"
            className="w-full bg-[#0B1220] border border-slate-700 rounded p-2 text-white font-mono"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Demo Simulation Tick Rate</label>
          <select className="w-full bg-[#0B1220] border border-slate-700 rounded p-2 text-white font-mono">
            <option>Ultra-Fast (1200ms Jitter Engine)</option>
            <option>Standard (3000ms Jitter Engine)</option>
            <option>Paused (Static Quotes)</option>
          </select>
        </div>

        <button
          onClick={() => addToast({ type: 'success', title: 'Settings Saved', message: 'Platform parameters updated.' })}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded"
        >
          Save Global Configurations
        </button>
      </div>
    </div>
  );
};
