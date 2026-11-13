import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Globe } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#080D17] border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-base font-bold text-white">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold tracking-wider">NEXTRADE<span className="text-blue-500">FX</span></span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Next-generation institutional-grade simulated foreign exchange and multi-asset trading platform. Ultra-low latency pricing simulation, zero execution slippage demo environment.
            </p>
            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Simulated Sandbox
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Global Currency Desks
              </span>
            </div>
          </div>

          {/* Col 1: Markets */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Markets</h4>
            <ul className="space-y-2">
              <li><Link to="/markets/forex" className="hover:text-white transition-colors">Forex Majors & Minors</Link></li>
              <li><Link to="/markets/commodities" className="hover:text-white transition-colors">Precious Metals & Gold</Link></li>
              <li><Link to="/markets/commodities" className="hover:text-white transition-colors">Crude Oil & Energy</Link></li>
              <li><Link to="/markets/indices" className="hover:text-white transition-colors">Global Equity Indices</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Spreads & Commissions</Link></li>
            </ul>
          </div>

          {/* Col 2: Trading Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Tools & Analytics</h4>
            <ul className="space-y-2">
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing & Spreads</Link></li>
              <li><Link to="/economic-calendar" className="hover:text-white transition-colors">Economic Calendar</Link></li>
              <li><Link to="/analysis" className="hover:text-white transition-colors">Technical Analysis</Link></li>
              <li><Link to="/signals" className="hover:text-white transition-colors">Trading Signals</Link></li>
              <li><Link to="/news" className="hover:text-white transition-colors">Macro News Desk</Link></li>
              <li><Link to="/education" className="hover:text-white transition-colors">Education Academy</Link></li>
            </ul>
          </div>

          {/* Col 3: Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Company & Governance</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/account-types" className="hover:text-white transition-colors">Demo Account Tiers</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Client Support</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/risk-disclosure" className="hover:text-white transition-colors">Risk Disclosure</Link></li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Simulation Disclaimer */}
        <div className="pt-8 border-t border-slate-800/80 space-y-3 text-[11px] text-slate-500 leading-relaxed">
          <p>
            <strong className="text-slate-400">FINANCIAL DEMONSTRATION & REGULATORY DISCLAIMER:</strong> NEXTRADE FX is a software prototype and demonstration interface. All currency quotes, trade executions, order fills, demo account balances, profit and loss calculations, and economic data shown across this website and application are purely simulated for educational and evaluation purposes.
          </p>
          <p>
            No real currency, broker accounts, financial instruments, deposits, or withdrawals are handled by this platform. NEXTRADE FX does not offer investment advice, portfolio management, or real brokerage services. Foreign exchange and CFD trading on real margin involves substantial risk of loss and is not suitable for all investors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-900 gap-2 text-slate-500">
            <div>© 2026 NEXTRADE FX Platform Technologies. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
              <Link to="/risk-disclosure" className="hover:text-slate-400 transition-colors">Risk Warning</Link>
              <Link to="/login" className="hover:text-blue-400 transition-colors">Client Access</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
