import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrading } from '../../contexts/TradingContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TrendingUp, ArrowUpRight, Search, Sliders, 
  Layers, ShieldCheck, DollarSign, Globe 
} from 'lucide-react';
import { CurrencyPair, AssetCategory } from '../../types/market';

export const MarketsPage: React.FC = () => {
  const { pairs, setSelectedPairSymbol } = useTrading();
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<'all' | AssetCategory>('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = pairs.filter(p => {
    const matchesFilter = filter === 'all' || p.category === filter;
    const matchesSearch = p.symbol.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleTrade = (sym: string) => {
    setSelectedPairSymbol(sym);
    if (isAuthenticated) {
      navigate('/trader/terminal');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Global Tradable Markets</h1>
        <p className="text-sm text-slate-400">
          Access institutional Forex majors, precious metals, commodities, and index CFDs with simulated raw spreads.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#111827] border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1 bg-[#151F30] p-1 rounded-lg border border-slate-800 text-xs">
          {(['all', 'forex', 'commodities', 'indices', 'crypto'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded font-semibold capitalize transition-colors ${
                filter === cat ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'commodities' ? 'Metals & Energy' : cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search instruments..."
            className="w-full bg-[#151F30] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Markets Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums font-mono">
            <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Asset Class</th>
                <th className="py-3 px-4">Live Bid</th>
                <th className="py-3 px-4">Live Ask</th>
                <th className="py-3 px-4">Spread</th>
                <th className="py-3 px-4">24h Change</th>
                <th className="py-3 px-4">Max Leverage</th>
                <th className="py-3 px-4 text-right font-sans">Trading Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(p => (
                <tr key={p.symbol} className="hover:bg-[#151F30]/60">
                  <td className="py-3 px-4 font-bold text-white text-sm">{p.symbol}</td>
                  <td className="py-3 px-4 font-sans text-slate-300">{p.name}</td>
                  <td className="py-3 px-4 font-sans capitalize text-slate-400">{p.category}</td>
                  <td className="py-3 px-4 text-white font-bold">{p.bid.toFixed(p.pipPrecision)}</td>
                  <td className="py-3 px-4 text-white font-bold">{p.ask.toFixed(p.pipPrecision)}</td>
                  <td className="py-3 px-4 text-blue-400 font-bold">{p.spread} pips</td>
                  <td className={`py-3 px-4 font-bold ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {p.change24h >= 0 ? '+' : ''}{p.change24h}%
                  </td>
                  <td className="py-3 px-4 text-slate-300">1:{p.leverageMax}</td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() => handleTrade(p.symbol)}
                      className="px-3 py-1.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                    >
                      <span>Trade</span>
                      <ArrowUpRight className="w-3 h-3" />
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

export const ForexPage: React.FC = () => {
  const { pairs, setSelectedPairSymbol } = useTrading();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const forexPairs = pairs.filter(p => p.category === 'forex');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Currency Markets</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Forex Majors, Minors & Crosses</h1>
        <p className="text-sm text-slate-400">
          Trade over 50 foreign exchange pairs with simulated deep Tier-1 liquidity from 0.0 pips.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {forexPairs.map(p => (
          <div key={p.symbol} className="p-4 bg-[#111827] border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white font-mono">{p.symbol}</span>
                <span className={`text-xs font-bold font-mono ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {p.change24h >= 0 ? '+' : ''}{p.change24h}%
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{p.name}</div>
            </div>

            <div className="my-4 py-3 border-y border-slate-800 font-mono text-xs tabular-nums flex justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">BID</span>
                <span className="font-bold text-white">{p.bid.toFixed(p.pipPrecision)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">SPREAD</span>
                <span className="font-bold text-blue-400">{p.spread}p</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedPairSymbol(p.symbol);
                if (isAuthenticated) {
                  navigate('/trader/terminal');
                } else {
                  navigate('/register');
                }
              }}
              className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
            >
              Launch in Terminal
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CommoditiesPage: React.FC = () => {
  const { pairs, setSelectedPairSymbol } = useTrading();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const commodities = pairs.filter(p => p.category === 'commodities');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Hard & Energy Assets</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Precious Metals & Crude Oil CFDs</h1>
        <p className="text-sm text-slate-400">
          Simulated Spot Gold (XAU/USD), Spot Silver (XAG/USD), and WTI Crude Oil cash benchmark contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {commodities.map(p => (
          <div key={p.symbol} className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white font-mono">{p.symbol}</span>
              <span className={`text-xs font-bold font-mono ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {p.change24h >= 0 ? '+' : ''}{p.change24h}%
              </span>
            </div>
            <p className="text-xs text-slate-400">{p.description}</p>
            <div className="p-3 bg-[#0B1220] rounded-lg font-mono text-xs tabular-nums flex justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">CURRENT PRICE</span>
                <span className="font-bold text-white text-sm">${p.bid.toFixed(p.pipPrecision)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">LEVERAGE</span>
                <span className="font-bold text-amber-400">1:{p.leverageMax}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedPairSymbol(p.symbol);
                if (isAuthenticated) {
                  navigate('/trader/terminal');
                } else {
                  navigate('/register');
                }
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Trade {p.symbol}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const IndicesPage: React.FC = () => {
  const { pairs, setSelectedPairSymbol } = useTrading();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const indices = pairs.filter(p => p.category === 'indices');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Equity Benchmarks</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Global Stock Market Indices</h1>
        <p className="text-sm text-slate-400">
          Trade Wall Street 30, US Tech 100, and European composites with zero simulated commissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {indices.map(p => (
          <div key={p.symbol} className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white font-mono">{p.symbol}</span>
              <span className={`text-xs font-bold font-mono ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {p.change24h >= 0 ? '+' : ''}{p.change24h}%
              </span>
            </div>
            <div className="text-xs text-slate-300 font-semibold">{p.name}</div>
            <p className="text-xs text-slate-400">{p.description}</p>
            <div className="p-3 bg-[#0B1220] rounded-lg font-mono text-xs tabular-nums flex justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">INDEX VALUE</span>
                <span className="font-bold text-white text-base">{p.bid.toFixed(p.pipPrecision)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">SPREAD</span>
                <span className="font-bold text-blue-400">{p.spread} pts</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedPairSymbol(p.symbol);
                if (isAuthenticated) {
                  navigate('/trader/terminal');
                } else {
                  navigate('/register');
                }
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Open Index Chart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PricingPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Transparent Economics</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Pricing, Spreads & Fees</h1>
        <p className="text-sm text-slate-400">
          No hidden fees, no artificial execution markups. Complete transparency on simulated trading costs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase">Standard Demo</div>
          <div className="text-3xl font-extrabold text-white font-mono">0.8 <span className="text-sm font-sans text-slate-400">pips</span></div>
          <p className="text-xs text-slate-400">Spread markups starting from 0.8 pips. 100% commission free.</p>
        </div>
        <div className="p-6 bg-[#151F30] border-2 border-blue-500 rounded-xl space-y-3">
          <div className="text-xs font-bold text-blue-400 uppercase">Raw ECN Demo</div>
          <div className="text-3xl font-extrabold text-white font-mono">0.0 <span className="text-sm font-sans text-slate-400">pips</span></div>
          <p className="text-xs text-slate-300">Raw spread pass-through from interbank feeds + $3.50 per standard lot.</p>
        </div>
        <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase">Deposit / Withdrawal Fees</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">$0.00</div>
          <p className="text-xs text-slate-400">All demo funding and simulated withdrawal operations carry zero processing fees.</p>
        </div>
      </div>
    </div>
  );
};
