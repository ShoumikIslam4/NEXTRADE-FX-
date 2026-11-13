import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrading } from '../../contexts/TradingContext';
import { 
  TrendingUp, Shield, Zap, Globe, Layers, ArrowUpRight, 
  CheckCircle2, ChevronRight, BarChart2, Award, Users, BookOpen, 
  HelpCircle, ArrowRight, Activity, Terminal 
} from 'lucide-react';
import { MOCK_FAQS, MOCK_MARKET_ANALYSES, MOCK_EDUCATION_COURSES } from '../../data/mockMarketData';
import heroImage from '../../assets/images/trading_hero_platform_1794459706047.jpg';
import terminalPreview from '../../assets/images/institutional_terminal_preview_1794459707163.jpg';

export const HomePage: React.FC = () => {
  const { pairs, setSelectedPairSymbol } = useTrading();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <div className="w-full overflow-x-clip space-y-14 sm:space-y-20 lg:space-y-24 pb-16 sm:pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 md:pt-16 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[350px] bg-blue-600/10 blur-[130px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Transparent Notice Banner */}
          <div className="mb-5 sm:mb-6 inline-flex max-w-full flex-wrap items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl sm:rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-[10px] sm:text-[11px] font-medium leading-snug">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
            <span>Simulated FinTech Platform · 100% Virtual Capital · Zero Financial Risk</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs text-slate-400">
                <span className="font-semibold text-blue-400">Simulated Trading Infrastructure</span>
                <span className="text-slate-600">·</span>
                <span>Virtual Order Matching Engine</span>
                <span className="text-slate-600 hidden sm:inline">·</span>
                <span className="hidden sm:inline">Educational Sandbox</span>
              </div>

              <h1 className="text-[26px] sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] text-balance break-words">
                Practice Forex &amp; CFDs With <span className="text-blue-500">Simulated</span> Institutional Precision
              </h1>

              <p className="text-xs sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-xl text-balance">
                Experience simulated spreads from 0.0 pips, virtual order books, and simulated trade execution in our high-performance sandbox environment. No real funds required, 100% demo capital.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  to="/register"
                  className="px-5 sm:px-6 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-center"
                >
                  <Terminal className="w-4 h-4 shrink-0" />
                  <span>Open Free Demo Account</span>
                </Link>

                <Link
                  to="/account-types"
                  className="px-5 sm:px-6 py-3 sm:py-3.5 bg-[#151F30] hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <span>Explore Demo Account Tiers</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-5 sm:pt-6 border-t border-slate-800/80 text-xs">
                <div>
                  <div className="text-lg sm:text-2xl font-black font-mono text-white">0.0<span className="text-blue-500 text-xs sm:text-sm">p</span></div>
                  <div className="text-slate-400 mt-0.5 text-[10px] sm:text-xs leading-tight">Simulated Spreads</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black font-mono text-white">1:500</div>
                  <div className="text-slate-400 mt-0.5 text-[10px] sm:text-xs leading-tight">Simulated Leverage</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black font-mono text-white">&lt;12<span className="text-emerald-500 text-xs sm:text-sm">ms</span></div>
                  <div className="text-slate-400 mt-0.5 text-[10px] sm:text-xs leading-tight">Engine Latency</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual / Terminal Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#111827] group">
                <img
                  src={heroImage}
                  alt="NEXTRADE FX institutional trading environment"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3.5 sm:p-4 rounded-xl bg-[#0B1220]/85 backdrop-blur-md border border-slate-700/80">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs mb-1">
                    <span className="font-bold text-white">NEXTRADE Terminal v4.2</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold uppercase tracking-wider">
                      SIMULATED MARKET DATA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Interactive candlestick charting with simulated price volatility, multi-timeframe indicators, and simulated order execution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE MARKET OVERVIEW TICKER STRIP */}
      <section className="w-full overflow-hidden border-y border-slate-800 bg-[#0F172A]/70 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex items-center gap-3 sm:gap-6 min-w-max text-xs font-mono tabular-nums">
            <span className="text-slate-500 font-sans font-semibold text-[11px] uppercase tracking-wider shrink-0">
              Simulated Market Quotes:
            </span>
            {pairs.slice(0, 8).map(p => (
              <Link
                key={p.symbol}
                to="/markets"
                onClick={() => setSelectedPairSymbol(p.symbol)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#151F30]/80 hover:bg-[#1E293B] border border-slate-800 transition-colors shrink-0"
              >
                <span className="font-bold text-white">{p.symbol}</span>
                <span className="text-slate-300 font-semibold">{p.bid.toFixed(p.pipPrecision)}</span>
                <span className={`text-[11px] font-bold ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {p.change24h >= 0 ? '+' : ''}{p.change24h}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRADING ADVANTAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">Engineered for Practice</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-balance">Why Traders Practice on NEXTRADE FX</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed text-balance">
            Our multi-asset simulated architecture bridges the gap between desktop charting and institutional-style order mechanics without risking real capital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-600/15 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Simulated Trade Execution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience simulated sub-millisecond execution modeling with instant virtual order confirmation and zero real-world financial liability.
            </p>
          </div>

          <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Simulated Spreads From 0.0 Pips</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyze realistic bid/ask spreads modeled on interbank price feeds with transparent virtual commission accounting and real-time pip valuation.
            </p>
          </div>

          <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-600/15 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Simulated Margin Safeguards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Practice position sizing with automated margin call calculations, customizable leverage settings, and real-time free margin monitoring.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM SHOWCASE / TERMINAL PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Demo Trading Terminal</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-balance">
                Built For Practicing Technical & Discretionary Trading
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seamlessly toggle timeframes from 1-minute scalping up to daily trend analysis. Overlay technical indicators, draw key support and resistance zones, and practice disciplined order placement in a risk-free environment.
              </p>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive candlestick charting with simulated micro-tick price updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Simulated Buy & Sell panels with dynamic bid/ask spreads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Integrated Stop Loss & Take Profit calculators for simulated risk sizing</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-2"
                >
                  <span>Open Free Demo Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl">
                <img
                  src={terminalPreview}
                  alt="Nextrade FX simulated trading workstation"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACCOUNT TYPES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">Virtual Tiers</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Simulated Account Options</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed text-balance">
            Explore diverse simulated trading structures to test your strategy requirements. All balances and executions are 100% demo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Standard Demo */}
          <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Beginner & Strategy Testing</div>
              <h3 className="text-xl font-bold text-white mt-1">Standard Demo</h3>
              <p className="text-xs text-slate-400 mt-2">Zero-commission simulated trading with clean spread modeling.</p>
              
              <div className="my-6 py-4 border-y border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Simulated Spreads:</span>
                  <span className="font-mono font-bold text-white">From 0.8 pips</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Virtual Commission:</span>
                  <span className="font-mono font-bold text-emerald-400">$0.00 / Lot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Simulated Leverage:</span>
                  <span className="font-mono text-white">1:500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Minimum Order:</span>
                  <span className="font-mono text-white">0.01 Micro-lot</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              className="w-full py-2.5 rounded-lg bg-[#151F30] border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs text-center transition-colors block"
            >
              Test Standard Demo Tier
            </Link>
          </div>

          {/* Raw ECN Demo (Featured) */}
          <div className="p-6 bg-[#151F30] border-2 border-blue-500 rounded-xl flex flex-col justify-between space-y-6 relative shadow-xl shadow-blue-500/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider">
              Most Popular Demo
            </span>

            <div>
              <div className="text-xs font-bold text-blue-400 uppercase">Scalping & Algorithmic Practice</div>
              <h3 className="text-xl font-bold text-white mt-1">Raw ECN Demo</h3>
              <p className="text-xs text-slate-300 mt-2">Simulated raw spread modeling with virtual commission accounting.</p>
              
              <div className="my-6 py-4 border-y border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Simulated Spreads:</span>
                  <span className="font-mono font-bold text-emerald-400">From 0.0 pips (Raw)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Virtual Commission:</span>
                  <span className="font-mono font-bold text-white">$3.50 / Lot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Simulated Leverage:</span>
                  <span className="font-mono text-white">1:500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Routing Model:</span>
                  <span className="font-mono text-white">Equinix LD4 (Simulated)</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition-colors block"
            >
              Launch Raw ECN Terminal
            </Link>
          </div>

          {/* Institutional Pro */}
          <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">High-Volume Strategy Testing</div>
              <h3 className="text-xl font-bold text-white mt-1">Institutional Pro Demo</h3>
              <p className="text-xs text-slate-400 mt-2">Simulated high-volume deep book modeling and institutional risk parameters.</p>
              
              <div className="my-6 py-4 border-y border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Simulated Spreads:</span>
                  <span className="font-mono font-bold text-emerald-400">From 0.0 pips (Deep)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Virtual Commission:</span>
                  <span className="font-mono font-bold text-white">$1.80 / Lot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Simulated Leverage:</span>
                  <span className="font-mono text-white">1:500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Simulation Protocol:</span>
                  <span className="font-mono text-white">Simulated FIX 4.4 / REST</span>
                </div>
              </div>
            </div>

            <Link
              to="/register"
              className="w-full py-2.5 rounded-lg bg-[#151F30] border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs text-center transition-colors block"
            >
              Explore Institutional Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 6. RESEARCH & ANALYSIS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">Market Intelligence</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Simulated Market Analysis & Technical Outlook</h2>
          </div>
          <Link to="/analysis" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
            Browse All Reports
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_MARKET_ANALYSES.map(item => (
            <div key={item.id} className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                  <span className="font-bold text-blue-400">{item.pair}</span>
                  <span className={item.bias === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}>
                    {item.bias}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-2">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{item.summary}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>{item.author}</span>
                <span>{item.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">Got Questions?</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {MOCK_FAQS.map((faq, idx) => (
            <div key={idx} className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-blue-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-90' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. CALL TO ACTION FOOTER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-900/30 via-[#151F30] to-blue-900/20 border border-blue-500/30 rounded-2xl p-6 sm:p-10 lg:p-12 text-center space-y-4 sm:space-y-5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white text-balance">
            Start Practicing on NEXTRADE FX Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed text-balance">
            Explore institutional-style charting, indicators, and simulated order execution with zero capital at risk. No deposits, no credit card required.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-all shadow-xl shadow-blue-500/25 inline-flex items-center justify-center gap-2"
            >
              <span>Create Practice Account ($1,000 USD)</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
