import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MOCK_ECONOMIC_EVENTS, MOCK_NEWS_ARTICLES, 
  MOCK_MARKET_ANALYSES, MOCK_TRADING_SIGNALS, MOCK_EDUCATION_COURSES 
} from '../../data/mockMarketData';
import { 
  Calendar, Newspaper, LineChart, Radio, GraduationCap, 
  Clock, ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight 
} from 'lucide-react';

export const PublicEconomicCalendarPage: React.FC = () => {
  const [impactFilter, setImpactFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const filtered = MOCK_ECONOMIC_EVENTS.filter(e => impactFilter === 'all' || e.impact === impactFilter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Macro Intelligence</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Live Economic Calendar</h1>
        <p className="text-sm text-slate-400">
          Track macroeconomic data releases, central bank speeches, and global consensus figures that drive forex volatility.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-[#111827] p-1.5 rounded-xl border border-slate-800 text-xs w-fit">
        {(['all', 'high', 'medium', 'low'] as const).map(imp => (
          <button
            key={imp}
            onClick={() => setImpactFilter(imp)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
              impactFilter === imp ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {imp} Impact
          </button>
        ))}
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
                <th className="py-3 px-4">Indicator</th>
                <th className="py-3 px-4 font-mono">Actual</th>
                <th className="py-3 px-4 font-mono">Consensus</th>
                <th className="py-3 px-4 font-mono">Previous</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-[#151F30]/60">
                  <td className="py-3 px-4 font-bold text-slate-300">{e.time}</td>
                  <td className="py-3 px-4 text-slate-400">{e.date}</td>
                  <td className="py-3 px-4 font-bold text-white">{e.currency}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      e.impact === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      e.impact === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-700/40 text-slate-400'
                    }`}>
                      {e.impact}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">{e.event}</td>
                  <td className="py-3 px-4 font-bold text-white">{e.actual}</td>
                  <td className="py-3 px-4 text-slate-400">{e.forecast}</td>
                  <td className="py-3 px-4 text-slate-400">{e.previous}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const PublicNewsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">News Desk</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Global Macro & FX News</h1>
        <p className="text-sm text-slate-400">
          In-depth market dispatches, central bank policy analysis, and sentiment flows from our research team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_NEWS_ARTICLES.map(article => (
          <div key={article.id} className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="font-bold text-blue-400">{article.category}</span>
                <span>{article.timestamp}</span>
              </div>
              <h2 className="text-lg font-bold text-white hover:text-blue-400 transition-colors cursor-pointer">
                {article.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">{article.summary}</p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{article.source}</span>
              <span className="text-blue-400 font-semibold">{article.readTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PublicAnalysisPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Technical Research</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Institutional Market Analysis</h1>
        <p className="text-sm text-slate-400">
          Actionable technical structures, momentum divergences, and price action setups.
        </p>
      </div>

      <div className="space-y-6">
        {MOCK_MARKET_ANALYSES.map(item => (
          <div key={item.id} className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-bold">{item.pair}</span>
                <span className="text-slate-400">· {item.timeframe}</span>
                <span className={`font-bold ${item.bias === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.bias} Bias
                </span>
              </div>
              <div className="text-xs text-slate-400">{item.author} ({item.authorRole})</div>
            </div>

            <h2 className="text-xl font-bold text-white">{item.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#0B1220] rounded-lg text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">KEY SUPPORT</span>
                <span className="text-emerald-400 font-bold">{item.support}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">KEY RESISTANCE</span>
                <span className="text-rose-400 font-bold">{item.resistance}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Key Technical Takeaways:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {item.keyPoints.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PublicSignalsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Trading Intelligence</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Algorithmic Trading Signals</h1>
        <p className="text-sm text-slate-400">
          Transparent multi-factor trading recommendations generated from statistical liquidity algorithms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_TRADING_SIGNALS.map(sig => (
          <div key={sig.id} className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white font-mono">{sig.pair}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  sig.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {sig.direction}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">{sig.timestamp}</span>
            </div>

            <p className="text-xs text-slate-300">{sig.strategy}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#0B1220] rounded-lg font-mono text-xs tabular-nums">
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

            <Link
              to="/register"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition-colors block"
            >
              Test Signal in Demo Terminal
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PublicEducationPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Trading Academy</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Forex Education Curriculum</h1>
        <p className="text-sm text-slate-400">
          From fundamental pip arithmetic to quantitative portfolio risk modeling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_EDUCATION_COURSES.map(course => (
          <div key={course.id} className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold uppercase">
                {course.level} Tier
              </span>
              <h2 className="text-lg font-bold text-white">{course.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{course.description}</p>
              
              <div className="space-y-1.5 pt-2 text-xs">
                <span className="text-slate-400 font-semibold text-[11px]">Syllabus Modules:</span>
                <ul className="space-y-1 text-slate-300">
                  {course.topics.map((t, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">{course.modulesCount} Modules · {course.duration}</span>
              <Link to="/register" className="text-blue-400 hover:underline font-semibold">
                Start Course Demo
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
