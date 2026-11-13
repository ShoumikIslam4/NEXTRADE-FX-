import React, { useState } from 'react';
import { useTrading } from '../../contexts/TradingContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  MOCK_ECONOMIC_EVENTS, MOCK_MARKET_ANALYSES, MOCK_TRADING_SIGNALS 
} from '../../data/mockMarketData';
import { 
  Star, Search, ArrowUpRight, TrendingUp, TrendingDown, 
  Calendar, Clock, Radio, CheckCircle, AlertTriangle, Layers, BookmarkCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const WatchlistPage: React.FC = () => {
  const { pairs, watchlist, toggleWatchlist, setSelectedPairSymbol } = useTrading();
  const navigate = useNavigate();

  const watchlistPairs = pairs.filter(p => watchlist.includes(p.symbol));

  const handleTrade = (symbol: string) => {
    setSelectedPairSymbol(symbol);
    navigate('/trader/terminal');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Custom Watchlist & Quotes</h2>
          <p className="text-xs text-slate-400 mt-1">Starred currency pairs and simulated CFDs for continuous price surveillance.</p>
        </div>
        <Link
          to="/trader/terminal"
          className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
        >
          Open in Terminal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlistPairs.map(p => (
          <div key={p.symbol} className="p-4 bg-[#111827] border border-slate-800 rounded-xl flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <span>{p.symbol}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-sans uppercase">
                    {p.category}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{p.name}</div>
              </div>
              <button onClick={() => toggleWatchlist(p.symbol)} className="text-amber-400 hover:opacity-80">
                <Star className="w-4 h-4 fill-amber-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-slate-800/80 font-mono tabular-nums text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">BID</span>
                <span className="text-base font-bold text-slate-100">{p.bid.toFixed(p.pipPrecision)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">ASK</span>
                <span className="text-base font-bold text-slate-100">{p.ask.toFixed(p.pipPrecision)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">SPREAD</span>
                <span className="text-blue-400 font-bold">{p.spread} pips</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">24H RANGE</span>
                <span className={p.change24h >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {p.change24h >= 0 ? '+' : ''}{p.change24h}%
                </span>
              </div>
            </div>

            <button
              onClick={() => handleTrade(p.symbol)}
              className="w-full py-2 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <span>Trade {p.symbol}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TraderAnalysisPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Institutional Market Analysis</h2>
        <p className="text-xs text-slate-400 mt-1">Technical perspectives, key pivot levels, and macro research from NEXTRADE analysts.</p>
      </div>

      <div className="space-y-4">
        {MOCK_MARKET_ANALYSES.map(item => (
          <div key={item.id} className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs font-bold">
                  {item.pair}
                </span>
                <span className="text-xs text-slate-400">· {item.timeframe}</span>
                <span className="text-slate-500">·</span>
                <span className={`text-xs font-bold ${item.bias === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.bias} Bias
                </span>
              </div>
              <div className="text-xs text-slate-400">{item.author} ({item.authorRole})</div>
            </div>

            <h3 className="text-base font-bold text-white">{item.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#0B1220] border border-slate-800/80 rounded-lg text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">KEY SUPPORT LEVELS</span>
                <span className="text-emerald-400 font-bold">{item.support}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">KEY RESISTANCE LEVELS</span>
                <span className="text-rose-400 font-bold">{item.resistance}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400">Actionable Key Points:</span>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                {item.keyPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TraderSignalsPage: React.FC = () => {
  const { openMarketOrder, setSelectedPairSymbol } = useTrading();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleCopySignal = (sig: typeof MOCK_TRADING_SIGNALS[0]) => {
    setSelectedPairSymbol(sig.pair);
    openMarketOrder({
      symbol: sig.pair,
      side: sig.direction,
      lots: 1.0,
      stopLoss: sig.stopLoss,
      takeProfit: sig.takeProfit1
    });
    navigate('/trader/terminal');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Algorithmic & Technical Trading Signals</h2>
          <p className="text-xs text-slate-400 mt-1">High-probability multi-timeframe setups calculated on simulated live price feeds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_TRADING_SIGNALS.map(sig => (
          <div key={sig.id} className="p-5 bg-[#111827] border border-slate-800 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white font-mono">{sig.pair}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    sig.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {sig.direction}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400">{sig.timestamp}</div>
              </div>

              <div className="text-xs text-slate-300 mb-3">{sig.strategy}</div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#0B1220] border border-slate-800/80 rounded-lg text-xs font-mono tabular-nums mb-3">
                <div>
                  <span className="text-[10px] text-slate-500 block">ENTRY</span>
                  <span className="font-bold text-white">{sig.entryPrice}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">STOP LOSS</span>
                  <span className="font-bold text-rose-400">{sig.stopLoss}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">TARGET 1</span>
                  <span className="font-bold text-emerald-400">{sig.takeProfit1}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">CONFIDENCE</span>
                  <span className="font-bold text-blue-400">{sig.confidence}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCopySignal(sig)}
              className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Execute 1.0 Lot ({sig.direction}) in Terminal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TraderCalendarPage: React.FC = () => {
  const [filterImpact, setFilterImpact] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filtered = MOCK_ECONOMIC_EVENTS.filter(e => filterImpact === 'all' || e.impact === filterImpact);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Economic Calendar</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time macro schedule of central bank decisions, inflation prints, and labor reports.</p>
        </div>

        <div className="flex items-center gap-1 bg-[#151F30] p-1 rounded-lg border border-slate-800 text-xs">
          {(['all', 'high', 'medium', 'low'] as const).map(imp => (
            <button
              key={imp}
              onClick={() => setFilterImpact(imp)}
              className={`px-3 py-1 rounded font-medium capitalize transition-colors ${
                filterImpact === imp ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {imp} Impact
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums">
            <thead className="bg-[#0B1220] text-slate-400 text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4">Impact</th>
                <th className="py-3 px-4">Event Description</th>
                <th className="py-3 px-4 font-mono">Actual</th>
                <th className="py-3 px-4 font-mono">Forecast</th>
                <th className="py-3 px-4 font-mono">Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map(evt => (
                <tr key={evt.id} className="hover:bg-[#151F30]/60">
                  <td className="py-3 px-4 font-bold text-slate-300">{evt.time}</td>
                  <td className="py-3 px-4 text-slate-400">{evt.date}</td>
                  <td className="py-3 px-4 font-bold text-white">{evt.currency}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      evt.impact === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      evt.impact === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-700/40 text-slate-400'
                    }`}>
                      {evt.impact}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-200 font-medium">{evt.event}</td>
                  <td className="py-3 px-4 font-bold text-white">{evt.actual}</td>
                  <td className="py-3 px-4 text-slate-400">{evt.forecast}</td>
                  <td className="py-3 px-4 text-slate-400">{evt.previous}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
