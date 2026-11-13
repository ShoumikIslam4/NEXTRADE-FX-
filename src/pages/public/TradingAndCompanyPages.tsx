import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { 
  TrendingUp, Shield, Zap, Globe, Server, CheckCircle2, 
  ChevronRight, Mail, Phone, MapPin, Send, HelpCircle, Monitor, Smartphone, Search 
} from 'lucide-react';
import { MOCK_FAQS } from '../../data/mockMarketData';
import analystImage from '../../assets/images/analyst_headshot_1794459707183.jpg';

export const TradingPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Trading Environment</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Execution Infrastructure & Conditions</h1>
        <p className="text-sm text-slate-400">
          Engineered for algorithmic high-frequency traders, manual scalpers, and institutional asset managers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
          <Server className="w-8 h-8 text-blue-400" />
          <h3 className="text-base font-bold text-white">Equinix LD4 London Facility</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our simulated matching engine connects directly to the core fiber optic hub in Slough (London), ensuring simulated microsecond route processing.
          </p>
        </div>

        <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
          <Zap className="w-8 h-8 text-emerald-400" />
          <h3 className="text-base font-bold text-white">No Dealing Desk Requotes</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every simulated order executes at top of book or better. Guaranteed no artificial quote stalling, requotes, or asymmetric slippage.
          </p>
        </div>

        <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
          <Globe className="w-8 h-8 text-amber-400" />
          <h3 className="text-base font-bold text-white">Deep Liquidity Aggregation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Simulated liquidity pools aggregated across global market makers with multi-level depth of market (DOM) pricing.
          </p>
        </div>
      </div>
    </div>
  );
};

export const PlatformsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Trading Software</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">NEXTRADE Trading Platforms</h1>
        <p className="text-sm text-slate-400">
          Access the simulated markets anywhere via modern web browsers, mobile viewports, or institutional API bridges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-[#111827] border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <Monitor className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-xl font-bold text-white">NEXTRADE Web Terminal</h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              Full-featured browser trading terminal built on modern React & HTML5 canvas. Features multi-timeframe candlestick charting, indicators, market watch, order execution, and real-time floating P/L.
            </p>
            <div className="space-y-2 my-5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero download required · Works across Mac, Windows, Linux</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>One-click market, limit, and stop order execution</span>
              </div>
            </div>
          </div>
          <Link
            to="/register"
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition-colors block"
          >
            Open Demo Account
          </Link>
        </div>

        <div className="p-8 bg-[#111827] border border-slate-800 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <Smartphone className="w-10 h-10 text-emerald-400 mb-3" />
            <h3 className="text-xl font-bold text-white">Mobile Responsive Web App</h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              Fully optimized touch-first responsive viewport for smartphone and tablet traders. Monitor open positions, modify stop loss levels, and review trade history on the go.
            </p>
            <div className="space-y-2 my-5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant mobile load without app store downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Lightweight streaming quotes with minimal battery drain</span>
              </div>
            </div>
          </div>
          <Link
            to="/register"
            className="w-full py-3 rounded-lg bg-[#151F30] border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs text-center transition-colors block"
          >
            Get Started on Mobile
          </Link>
        </div>
      </div>
    </div>
  );
};

export const AccountTypesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Trading Tiers</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Demo Account Types & Features</h1>
        <p className="text-sm text-slate-400">
          Compare simulated spreads, execution routing, and leverage caps across our tier matrix.
        </p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs tabular-nums font-mono">
          <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Feature / Specification</th>
              <th className="py-3 px-4">Standard Demo</th>
              <th className="py-3 px-4 text-blue-400 font-bold">Raw ECN Demo</th>
              <th className="py-3 px-4 text-amber-400 font-bold">Institutional Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            <tr>
              <td className="py-3 px-4 font-bold text-slate-300">Spreads on EUR/USD</td>
              <td className="py-3 px-4 font-mono text-white">From 0.8 pips</td>
              <td className="py-3 px-4 font-mono text-emerald-400 font-bold">From 0.0 pips (Raw)</td>
              <td className="py-3 px-4 font-mono text-emerald-400 font-bold">From 0.0 pips (Deep)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-slate-300">Commission</td>
              <td className="py-3 px-4 font-mono text-emerald-400 font-bold">$0.00 (Zero)</td>
              <td className="py-3 px-4 font-mono text-white">$3.50 / Lot per side</td>
              <td className="py-3 px-4 font-mono text-white">$1.80 / Lot per side</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-slate-300">Maximum Leverage</td>
              <td className="py-3 px-4 font-mono text-white">1:500</td>
              <td className="py-3 px-4 font-mono text-white">1:500</td>
              <td className="py-3 px-4 font-mono text-white">1:500</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-slate-300">Minimum Order Size</td>
              <td className="py-3 px-4 font-mono text-white">0.01 micro-lots</td>
              <td className="py-3 px-4 font-mono text-white">0.01 micro-lots</td>
              <td className="py-3 px-4 font-mono text-white">0.10 mini-lots</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-slate-300">Execution Server Location</td>
              <td className="py-3 px-4 text-slate-400">Equinix LD4 (Simulated)</td>
              <td className="py-3 px-4 text-slate-400">Equinix LD4 (Simulated)</td>
              <td className="py-3 px-4 text-slate-400">Equinix LD4 & NY4 Dedicated</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-slate-300">Initial Demo Balance</td>
              <td className="py-3 px-4 font-mono text-white">$10,000 USD</td>
              <td className="py-3 px-4 font-mono text-white">$50,000 USD</td>
              <td className="py-3 px-4 font-mono text-white">$250,000 USD</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      <div className="max-w-3xl space-y-4">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">About NEXTRADE FX</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Reinventing Simulated Forex & CFD Trading Infrastructure
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          NEXTRADE FX was created to give quantitative traders and retail investors uncompromised access to institutional market dynamics without monetary risk. Our platform delivers ultra-responsive candlestick charting, realistic pip precision, and simulated dealing operations.
        </p>
      </div>

      {/* Leadership / Analyst Highlight */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 sm:p-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4">
            <div className="rounded-xl overflow-hidden border border-slate-700/80 aspect-square max-w-xs mx-auto">
              <img
                src={analystImage}
                alt="Marcus Vance, Head of Market Strategy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-8 space-y-3">
            <div className="text-xs font-semibold text-blue-400 uppercase">Chief Market Strategist</div>
            <h2 className="text-2xl font-bold text-white">Marcus Vance, CMT</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Our mission with NEXTRADE FX is to establish a rigorous, authentic trading arena where technical models, risk sizing parameters, and macroeconomic hypotheses can be pressure-tested against real-time simulated order book liquidity before executing real capital."
            </p>
            <div className="pt-2 text-xs font-mono text-slate-400">
              Former Senior FX Desk Strategist · 18+ Years Institutional Currency Experience
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Message Sent',
      message: 'Thank you for contacting NEXTRADE FX. Our support team will reply within 24 hours.'
    });
    setName('');
    setEmail('');
    setMsg('');
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <div className="max-w-2xl space-y-2">
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Get in Touch</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Contact NEXTRADE FX Support</h1>
        <p className="text-sm text-slate-400">
          Our global institutional client service desks operate 24/5 to assist with demo terminal setup and technical inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>London Dealing Center</span>
            </div>
            <p className="text-xs text-slate-400">
              100 Bishopsgate, Level 24<br />London, EC2N 4AG, United Kingdom
            </p>
          </div>

          <div className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Direct Inquiries</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              support@nextradefx.io<br />dealing@nextradefx.io
            </p>
          </div>
        </div>

        <div className="md:col-span-7 bg-[#111827] border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Send an Inquest to Our Support Desk</h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full bg-[#0B1220] border border-slate-700 rounded p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="s.jenkins@company.com"
                className="w-full bg-[#0B1220] border border-slate-700 rounded p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="How can our technical team assist your demo trading experience?"
                className="w-full bg-[#0B1220] border border-slate-700 rounded p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const FaqPage: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filtered = MOCK_FAQS.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-400">Everything you need to know about the NEXTRADE FX simulated platform.</p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions or keywords..."
          className="w-full bg-[#111827] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((faq, idx) => (
          <div key={idx} className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
              className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-blue-400 transition-colors"
            >
              <span>{faq.q}</span>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeIdx === idx ? 'rotate-90' : ''}`} />
            </button>
            {activeIdx === idx && (
              <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
