import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_ADMIN_PAIR_SETTINGS, MOCK_AUDIT_LOGS } from '../../data/mockAdminData';
import { MOCK_ECONOMIC_EVENTS, MOCK_NEWS_ARTICLES, MOCK_TRADING_SIGNALS, MOCK_EDUCATION_COURSES } from '../../data/mockMarketData';
import {
  ShieldCheck, ShieldOff, RefreshCw, Gift, Mail, DollarSign, Save
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums font-mono min-w-[760px]">
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
  const { platformSettings, bdtRate, refreshPlatformSettings, refreshUser } = useAuth();

  const [requireKycToTrade, setRequireKycToTrade] = useState(platformSettings.requireKycToTrade);
  const [refEnabled, setRefEnabled] = useState(platformSettings.referralConfig.enabled);
  const [commissionPct, setCommissionPct] = useState(String(platformSettings.referralConfig.referrerCommissionPercent));
  const [signupBonusUSD, setSignupBonusUSD] = useState(String(platformSettings.referralConfig.referrerSignupBonusUSD));
  const [discountPct, setDiscountPct] = useState(String(platformSettings.referralConfig.referredDiscountPercent));
  const [rateBDT, setRateBDT] = useState(String(bdtRate || 122.5));
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingRate, setSavingRate] = useState(false);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch('/api/admin/settings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setRequireKycToTrade(!!data.settings.requireKycToTrade);
          setRefEnabled(!!data.settings.referralConfig?.enabled);
          setCommissionPct(String(data.settings.referralConfig?.referrerCommissionPercent ?? 10));
          setSignupBonusUSD(String(data.settings.referralConfig?.referrerSignupBonusUSD ?? 5));
          setDiscountPct(String(data.settings.referralConfig?.referredDiscountPercent ?? 20));
        }
        if (data.bdtRate) setRateBDT(String(data.bdtRate));
        setEmailConfigured(!!data.emailNotificationsConfigured);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          requireKycToTrade,
          referralConfig: {
            enabled: refEnabled,
            referrerCommissionPercent: Math.max(0, Math.min(100, Number(commissionPct) || 0)),
            referrerSignupBonusUSD: Math.max(0, Number(signupBonusUSD) || 0),
            referredDiscountPercent: Math.max(0, Math.min(100, Number(discountPct) || 0))
          }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshPlatformSettings();
        addToast({
          type: 'success',
          title: 'Platform Policy & Referral Settings Saved',
          message: 'KYC trading requirement and referral commission/discount rules updated globally.'
        });
      } else {
        addToast({ type: 'error', title: 'Save Failed', message: data.message || 'Could not save settings.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Network Error', message: 'Could not save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRate = async () => {
    try {
      setSavingRate(true);
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch('/api/admin/bdt-rate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ rate: Number(rateBDT) })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshUser();
        await refreshPlatformSettings();
        addToast({
          type: 'success',
          title: 'USD/BDT Rate Updated',
          message: `Marketplace conversion rate is now 1 USD = ৳${data.rate} BDT.`
        });
      } else {
        addToast({ type: 'error', title: 'Update Failed', message: data.message || 'Invalid BDT rate.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Network Error', message: 'Failed to update exchange rate.' });
    } finally {
      setSavingRate(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Platform Policy, KYC Toggle &amp; Referral Control</h2>
        <p className="text-xs text-slate-400 mt-1">
          Control whether KYC is required before trading, edit referral commission/discount percentages anytime, and manage USD/BDT rate.
        </p>
      </div>

      {/* 1. KYC Requirement Before Trading Button */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {requireKycToTrade ? (
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                ) : (
                  <ShieldOff className="w-4 h-4 text-emerald-400" />
                )}
                <span>KYC Verification Required Before Trading</span>
              </h3>
              <p className="text-slate-400 mt-1 leading-relaxed">
                When <strong>ON</strong>, traders cannot execute trades until Admin approves their uploaded NID front &amp; back KYC. When <strong>OFF</strong>, traders can trade without prior KYC.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRequireKycToTrade((prev) => !prev)}
              className={`px-4 py-2.5 rounded-lg font-bold text-white shrink-0 flex items-center gap-2 transition-colors ${
                requireKycToTrade
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <span>{requireKycToTrade ? 'STATUS: ON (REQUIRED)' : 'STATUS: OFF (OPTIONAL)'}</span>
            </button>
          </div>
        </div>

        {/* 2. Referral Program Commission & Discount Rules */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Referral Commission, Bonus &amp; Discount Control</span>
              </h3>
              <p className="text-slate-400 mt-0.5">
                Adjust rewards earned by referrers and deposit fee discounts for invited traders at any time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRefEnabled((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] shrink-0 ${
                refEnabled
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {refEnabled ? 'Program ACTIVE' : 'Program PAUSED'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Referrer Deposit Commission (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Paid when referred user deposit approves</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Referrer Signup Bonus ($ USD)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={signupBonusUSD}
                onChange={(e) => setSignupBonusUSD(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Credited per new signup via link</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Invited User Fee Discount (%)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Fee discount applied for referred traders</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving Policy & Referral Rules...' : 'Save KYC & Referral Configurations'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 3. USD/BDT Rate & Gmail SMTP Environment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Marketplace USD / BDT Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="1"
              value={rateBDT}
              onChange={(e) => setRateBDT(e.target.value)}
              className="flex-1 bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white font-mono font-bold"
            />
            <button
              type="button"
              disabled={savingRate}
              onClick={handleSaveRate}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
            >
              {savingRate ? '...' : 'Update'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Users receive USD based on this live BDT rate during bKash / Nagad / Rocket deposits.
          </p>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Gmail Sign-In Email Alerts</span>
          </div>
          <div className={`font-mono font-bold ${emailConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
            {emailConfigured ? 'ACTIVE · SMTP Connected' : 'ENV REQUIRED (SMTP_USER / SMTP_PASS)'}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Set <code className="text-slate-200">SMTP_USER</code> and <code className="text-slate-200">SMTP_PASS</code> (Gmail App Password) in environment variables to dispatch real Gmail login notifications automatically.
          </p>
        </div>
      </div>
    </div>
  );
};
