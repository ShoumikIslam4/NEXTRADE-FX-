import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTrading } from '../../contexts/TradingContext';
import { useAuth } from '../../contexts/AuthContext';
import { TradingTerminalChart } from '../../components/charts/TradingTerminalChart';
import { AssetCategory } from '../../types/market';
import { OrderSide, OrderType } from '../../types/trading';
import { calculateMarginRequired } from '../../services/tradingEngine';
import { ResetDemoModal } from '../../components/common/ResetDemoModal';
import {
  Search, Star, Clock, ArrowUpRight, ArrowDownRight, X, CheckCircle2,
  AlertCircle, SlidersHorizontal, Activity, ShieldAlert, AlertTriangle, Lock
} from 'lucide-react';

export const TradingTerminalPage: React.FC = () => {
  const {
    pairs, selectedPair, setSelectedPairSymbol,
    positions, pendingOrders, history, accounts, activeAccount,
    watchlist, toggleWatchlist, openMarketOrder, placePendingOrder,
    closePosition, cancelPendingOrder, totalFloatingProfit, switchAccount,
    isDemoExhausted, setDemoExhaustedModalOpen
  } = useTrading();
  const { user, platformSettings } = useAuth();
  const kycGateBlocked =
    Boolean(platformSettings?.requireKycToTrade) &&
    user?.role === 'USER' &&
    user?.kycStatus !== 'APPROVED';

  // Search and category filter for Market Watch
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AssetCategory>('all');

  // Terminal bottom tabs
  const [bottomTab, setBottomTab] = useState<'positions' | 'pending' | 'history'>('positions');

  // Order placement state
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [lots, setLots] = useState<number>(0.1);
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');

  const filteredPairs = pairs.filter((p) => {
    const matchesSearch =
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const executionPrice = orderSide === 'BUY' ? selectedPair.ask : selectedPair.bid;
  const estimatedMargin = calculateMarginRequired(selectedPair, lots, executionPrice, activeAccount.leverage).toFixed(2);
  const estimatedPipValue = useMemo(() => {
    if (selectedPair.category === 'commodities') {
      if (selectedPair.symbol.includes('XAU')) return (lots * 10).toFixed(2);
      if (selectedPair.symbol.includes('XAG')) return (lots * 50).toFixed(2);
      return (lots * 10).toFixed(2);
    }
    if (selectedPair.category === 'indices') {
      return (lots * (selectedPair.lotSize || 1)).toFixed(2);
    }
    return (lots * 10).toFixed(2);
  }, [selectedPair, lots]);

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Live trading remains strictly disabled until broker integration
    if (activeAccount.mode === 'LIVE') {
      return;
    }

    // Demo trading requires NO KYC, only available demo allocation
    if (isDemoExhausted) {
      setDemoExhaustedModalOpen(true);
      return;
    }

    const sl = stopLoss ? parseFloat(stopLoss) : undefined;
    const tp = takeProfit ? parseFloat(takeProfit) : undefined;

    if (orderType === 'MARKET') {
      openMarketOrder({
        symbol: selectedPair.symbol,
        side: orderSide,
        lots,
        stopLoss: sl,
        takeProfit: tp
      });
    } else {
      const price = parseFloat(targetPrice);
      if (isNaN(price) || price <= 0) return;
      placePendingOrder({
        symbol: selectedPair.symbol,
        type: orderType,
        side: orderSide,
        targetPrice: price,
        lots,
        stopLoss: sl,
        takeProfit: tp
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Admin KYC Requirement Banner */}
      {kycGateBlocked && (
        <div className="w-full p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-start sm:items-center gap-2.5 text-amber-200">
            <Lock className="w-5 h-5 shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-amber-300">KYC Verification Required Before Trading:</span>{' '}
              Admin has enabled mandatory KYC verification. Upload both sides (Front &amp; Back) of your NID/ID and wait for Admin approval to execute trades. Current status:{' '}
              <span className="font-mono font-bold uppercase text-white">{(user?.kycStatus || 'UNSUBMITTED').replace(/_/g, ' ')}</span>.
            </div>
          </div>
          <Link
            to="/trader/kyc"
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shrink-0 transition-colors text-center"
          >
            {user?.kycStatus === 'PENDING' ? 'View KYC Status' : 'Verify NID / KYC Now'}
          </Link>
        </div>
      )}

      {/* Demo Allocation Exhausted Banner */}
      {activeAccount.mode === 'DEMO' && isDemoExhausted && (
        <div className="w-full p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-start sm:items-center gap-2.5 text-rose-200">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-rose-300">One-Time Demo Allocation Exhausted:</span>{' '}
              Your single $1,000 USD virtual demo balance is depleted. Demo top-ups, balance resets, and extra demo accounts are disabled. Apply for a Live Trading Account to proceed.
            </div>
          </div>
          <Link
            to="/trader/accounts?tab=live"
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shrink-0 transition-colors text-center"
          >
            Apply for Live Account
          </Link>
        </div>
      )}

      {/* Top Quick Bar */}
      <div className="w-full bg-[#151F30] border border-slate-800 rounded-lg p-3 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWatchlist(selectedPair.symbol)}
              className="text-slate-500 hover:text-amber-400 transition-colors"
              title={watchlist.includes(selectedPair.symbol) ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star className={`w-4 h-4 ${watchlist.includes(selectedPair.symbol) ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white font-mono tracking-tight">{selectedPair.symbol}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold uppercase">
                  DEMO / SIMULATED
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden md:block">{selectedPair.name}</span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

          {/* Simulated Quotes */}
          <div className="flex items-center gap-3 sm:gap-5 tabular-nums text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">BID (SIMULATED)</span>
              <span className="font-bold text-slate-100">{selectedPair.bid.toFixed(selectedPair.pipPrecision)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">ASK (SIMULATED)</span>
              <span className="font-bold text-slate-100">{selectedPair.ask.toFixed(selectedPair.pipPrecision)}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] text-slate-400 block uppercase">Spread</span>
              <span className="font-bold text-blue-400">{selectedPair.spread} pips</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">24H Change</span>
              <span className={`font-bold flex items-center gap-0.5 ${selectedPair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedPair.change24h >= 0 ? '+' : ''}
                {selectedPair.change24h}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Account Summary */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs tabular-nums text-slate-300">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                activeAccount.mode === 'DEMO'
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {activeAccount.mode === 'DEMO' ? 'DEMO / SIMULATED ($1,000 CAP)' : 'LIVE CONSOLE (EXEC LOCKED)'}
            </span>
            <span className="font-mono font-bold text-white hidden sm:inline">#{activeAccount.accountNumber}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Balance ({activeAccount.mode === 'DEMO' ? 'SIM' : 'LIVE'}):</span>
            <span className="font-mono font-bold text-white">
              ${activeAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-slate-400">Free Margin:</span>
            <span className={`font-mono font-bold ${activeAccount.freeMargin <= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              ${activeAccount.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Terminal Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Market Watch */}
        <div className="lg:col-span-3 lg:h-[490px] h-[360px] flex flex-col bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-sm order-2 lg:order-1">
          <div className="p-3 border-b border-slate-800 space-y-2 shrink-0 bg-[#151F30]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                Market Watch
              </span>
              <span className="text-[10px] font-mono text-slate-400">{filteredPairs.length} Symbols</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pair or symbol..."
                className="w-full bg-[#0B1220] border border-slate-700 rounded pl-8 pr-7 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#0B1220] rounded border border-slate-800 text-[10px]">
              {(['all', 'forex', 'commodities', 'indices'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`py-1 rounded font-medium capitalize transition-colors text-center ${
                    categoryFilter === cat ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'commodities' ? 'Metals' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 min-h-0">
            {filteredPairs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No matching symbols found.</div>
            ) : (
              filteredPairs.map((p) => {
                const isSelected = p.symbol === selectedPair.symbol;
                const isFav = watchlist.includes(p.symbol);

                return (
                  <div
                    key={p.symbol}
                    onClick={() => setSelectedPairSymbol(p.symbol)}
                    className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-600/15 border-l-2 border-blue-500' : 'hover:bg-[#151F30]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(p.symbol);
                        }}
                        className="text-slate-500 hover:text-amber-400 shrink-0"
                        title={isFav ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white font-mono leading-tight">{p.symbol}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px] sm:max-w-[150px] lg:max-w-[90px] xl:max-w-[120px]">
                          {p.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right tabular-nums font-mono shrink-0">
                      <div className="text-xs font-bold text-slate-100">{p.bid.toFixed(p.pipPrecision)}</div>
                      <div className="flex items-center justify-end gap-1.5 text-[10px]">
                        <span className="text-slate-400">{p.spread}p</span>
                        <span className={`font-semibold ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {p.change24h >= 0 ? '+' : ''}
                          {p.change24h}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Interactive Chart */}
        <div className="lg:col-span-6 lg:h-[490px] h-[380px] sm:h-[440px] flex flex-col min-w-0 order-1 lg:order-2">
          <TradingTerminalChart pair={selectedPair} className="h-full w-full" />
        </div>

        {/* Order Execution Desk */}
        <div className="lg:col-span-3 lg:h-[490px] min-h-[440px] flex flex-col bg-[#111827] border border-slate-800 rounded-lg p-3.5 gap-3 overflow-y-auto shadow-sm order-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Order Execution
            </span>
            <span className="text-[10px] text-blue-400 uppercase font-semibold font-mono bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/20">
              DEMO / SIMULATED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-[#151F30] p-1 rounded-md border border-slate-800 text-xs shrink-0">
            {(['MARKET', 'LIMIT', 'STOP'] as OrderType[]).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-1 text-center rounded font-semibold text-[11px] transition-colors ${
                  orderType === type ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setOrderSide('SELL')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                orderSide === 'SELL'
                  ? 'border-rose-500 bg-rose-500/15 text-white shadow-sm ring-1 ring-rose-500'
                  : 'border-slate-800 bg-[#151F30] text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-rose-400">
                <span>SELL</span>
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-base font-extrabold font-mono mt-1 text-white truncate">
                {selectedPair.bid.toFixed(selectedPair.pipPrecision)}
              </div>
              <div className="text-[10px] text-slate-400">Simulated Bid</div>
            </button>

            <button
              type="button"
              onClick={() => setOrderSide('BUY')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                orderSide === 'BUY'
                  ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-sm ring-1 ring-emerald-500'
                  : 'border-slate-800 bg-[#151F30] text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                <span>BUY</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-base font-extrabold font-mono mt-1 text-white truncate">
                {selectedPair.ask.toFixed(selectedPair.pipPrecision)}
              </div>
              <div className="text-[10px] text-slate-400">Simulated Ask</div>
            </button>
          </div>

          <form onSubmit={handleExecuteOrder} className="flex-1 flex flex-col justify-between gap-3 text-xs">
            <div className="space-y-3">
              {orderType !== 'MARKET' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Target {orderType} Price ({selectedPair.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    required
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder={executionPrice.toFixed(selectedPair.pipPrecision)}
                    className="w-full bg-[#151F30] border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
                  <span>Volume (Lots)</span>
                  <span className="text-slate-500">{lots} Lot = {(lots * selectedPair.lotSize).toLocaleString()} units</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLots((prev) => Math.max(0.01, Number((prev - 0.1).toFixed(2))))}
                    className="px-2 py-1 bg-[#151F30] border border-slate-700 rounded text-slate-300 hover:text-white text-xs font-mono font-semibold"
                  >
                    -0.1
                  </button>
                  <button
                    type="button"
                    onClick={() => setLots((prev) => Math.max(0.01, Number((prev - 0.01).toFixed(2))))}
                    className="px-2 py-1 bg-[#151F30] border border-slate-700 rounded text-slate-300 hover:text-white text-xs font-mono font-semibold"
                  >
                    -0.01
                  </button>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="50"
                    value={lots}
                    onChange={(e) => setLots(parseFloat(e.target.value) || 0.01)}
                    className="flex-1 bg-[#151F30] border border-slate-700 rounded px-2 py-1 text-center text-white font-bold font-mono focus:outline-none focus:border-blue-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setLots((prev) => Number((prev + 0.01).toFixed(2)))}
                    className="px-2 py-1 bg-[#151F30] border border-slate-700 rounded text-slate-300 hover:text-white text-xs font-mono font-semibold"
                  >
                    +0.01
                  </button>
                  <button
                    type="button"
                    onClick={() => setLots((prev) => Number((prev + 0.1).toFixed(2)))}
                    className="px-2 py-1 bg-[#151F30] border border-slate-700 rounded text-slate-300 hover:text-white text-xs font-mono font-semibold"
                  >
                    +0.1
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Stop Loss (Price)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-[#151F30] border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Take Profit (Price)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-[#151F30] border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#0B1220] border border-slate-800 space-y-1 text-[11px] tabular-nums">
                <div className="flex justify-between text-slate-400">
                  <span>Required Margin ({activeAccount.leverage}):</span>
                  <span className="font-mono text-white">${estimatedMargin} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Simulated Commission:</span>
                  <span className="font-mono text-white">${(lots * 3.5).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pip Value ({selectedPair.category}):</span>
                  <span className="font-mono text-white">${estimatedPipValue} / pip</span>
                </div>
              </div>
            </div>

            {activeAccount.mode === 'LIVE' ? (
              <div className="space-y-2 mt-2">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] leading-relaxed">
                  <div className="flex items-center gap-1 font-bold text-amber-400 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Live Execution Disabled</span>
                  </div>
                  Live market order execution is disabled until authorized broker liquidity integration is enabled.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const demo = accounts.find((a) => a.mode === 'DEMO');
                    if (demo) switchAccount(demo.id);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Switch to Demo Account ($1,000 SIM)
                </button>
              </div>
            ) : isDemoExhausted ? (
              <div className="space-y-2 mt-2">
                <button
                  type="button"
                  onClick={() => setDemoExhaustedModalOpen(true)}
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-rose-900/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 transition-colors"
                >
                  Demo Balance Exhausted — Apply Live
                </button>
              </div>
            ) : kycGateBlocked ? (
              <div className="space-y-2 mt-2">
                <Link
                  to="/trader/kyc"
                  className="block w-full py-2.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white text-center transition-colors shadow-md"
                >
                  {user?.kycStatus === 'PENDING' ? 'KYC Pending Admin Approval' : 'Complete KYC Before Trading'}
                </Link>
              </div>
            ) : (
              <button
                type="submit"
                className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-md mt-2 ${
                  orderSide === 'BUY'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 active:scale-[0.99]'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 active:scale-[0.99]'
                }`}
              >
                DEMO {orderSide} {lots} Lots {selectedPair.symbol}
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Section: Positions, Pending, History */}
      <div className="w-full bg-[#111827] border border-slate-800 rounded-lg flex flex-col min-h-[260px] max-h-[380px] overflow-hidden shadow-sm">
        <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#151F30] border-b border-slate-800 shrink-0 gap-2">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <button
              onClick={() => setBottomTab('positions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                bottomTab === 'positions' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]'
              }`}
            >
              Open Positions ({positions.length})
            </button>
            <button
              onClick={() => setBottomTab('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                bottomTab === 'pending' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]'
              }`}
            >
              Pending Orders ({pendingOrders.length})
            </button>
            <button
              onClick={() => setBottomTab('history')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                bottomTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]'
              }`}
            >
              Trade History ({history.length})
            </button>
          </div>

          <div className="text-xs font-mono tabular-nums flex items-center gap-2">
            <span className="text-slate-400">Floating P/L (DEMO):</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-xs ${
                totalFloatingProfit >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {totalFloatingProfit >= 0 ? '+' : ''}${totalFloatingProfit.toFixed(2)} USD
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
          {bottomTab === 'positions' &&
            (positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
                <AlertCircle className="w-6 h-6 mb-2 text-slate-600" />
                <span>No active DEMO/SIMULATED positions. Execute a simulated order above to begin.</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs tabular-nums min-w-[840px]">
                <thead className="bg-[#0B1220] text-slate-400 text-[11px] sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="py-2 px-3 whitespace-nowrap">Position ID</th>
                    <th className="py-2 px-3 whitespace-nowrap">Time</th>
                    <th className="py-2 px-3 whitespace-nowrap">Symbol</th>
                    <th className="py-2 px-3 whitespace-nowrap">Type</th>
                    <th className="py-2 px-3 whitespace-nowrap">Lots</th>
                    <th className="py-2 px-3 whitespace-nowrap">Open Price</th>
                    <th className="py-2 px-3 whitespace-nowrap">Current Price</th>
                    <th className="py-2 px-3 whitespace-nowrap">Pips</th>
                    <th className="py-2 px-3 whitespace-nowrap">Profit (USD)</th>
                    <th className="py-2 px-3 whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {positions.map((p) => (
                    <tr key={p.id} className="hover:bg-[#151F30]/60 transition-colors">
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{p.id}</td>
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{p.openTime.split(' ')[1] || p.openTime}</td>
                      <td className="py-2 px-3 font-bold text-white whitespace-nowrap">{p.symbol}</td>
                      <td className="py-2 px-3 font-semibold whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            p.side === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {p.side}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">{p.lots.toFixed(2)}</td>
                      <td className="py-2 px-3 whitespace-nowrap">{p.openPrice}</td>
                      <td className="py-2 px-3 whitespace-nowrap">{p.currentPrice}</td>
                      <td className={`py-2 px-3 font-bold whitespace-nowrap ${p.pips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.pips >= 0 ? '+' : ''}
                        {p.pips}
                      </td>
                      <td className={`py-2 px-3 font-bold whitespace-nowrap ${p.floatingProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.floatingProfit >= 0 ? '+' : ''}${p.floatingProfit.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => closePosition(p.id)}
                          className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-colors text-[10px] font-semibold"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}

          {bottomTab === 'pending' &&
            (pendingOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
                <Clock className="w-6 h-6 mb-2 text-slate-600" />
                <span>No active pending limit or stop orders.</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs tabular-nums min-w-[840px]">
                <thead className="bg-[#0B1220] text-slate-400 text-[11px] sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="py-2 px-3 whitespace-nowrap">Order ID</th>
                    <th className="py-2 px-3 whitespace-nowrap">Placed Time</th>
                    <th className="py-2 px-3 whitespace-nowrap">Symbol</th>
                    <th className="py-2 px-3 whitespace-nowrap">Order Type</th>
                    <th className="py-2 px-3 whitespace-nowrap">Lots</th>
                    <th className="py-2 px-3 whitespace-nowrap">Target Price</th>
                    <th className="py-2 px-3 whitespace-nowrap">Current Price</th>
                    <th className="py-2 px-3 whitespace-nowrap">Status</th>
                    <th className="py-2 px-3 whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {pendingOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#151F30]/60 transition-colors">
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{o.id}</td>
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{o.placedTime.split(' ')[1] || o.placedTime}</td>
                      <td className="py-2 px-3 font-bold text-white whitespace-nowrap">{o.symbol}</td>
                      <td className="py-2 px-3 font-semibold text-blue-400 whitespace-nowrap">
                        {o.type} {o.side}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">{o.lots.toFixed(2)}</td>
                      <td className="py-2 px-3 whitespace-nowrap">{o.targetPrice}</td>
                      <td className="py-2 px-3 whitespace-nowrap">{o.currentPrice}</td>
                      <td className="py-2 px-3 text-amber-400 font-semibold whitespace-nowrap">{o.status}</td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => cancelPendingOrder(o.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors text-[10px] border border-slate-700"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}

          {bottomTab === 'history' &&
            (history.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-6 h-6 mb-2 text-slate-600" />
                <span>No closed DEMO/SIMULATED trades yet.</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs tabular-nums min-w-[840px]">
                <thead className="bg-[#0B1220] text-slate-400 text-[11px] sticky top-0 border-b border-slate-800 z-10">
                  <tr>
                    <th className="py-2 px-3 whitespace-nowrap">Trade ID</th>
                    <th className="py-2 px-3 whitespace-nowrap">Close Time</th>
                    <th className="py-2 px-3 whitespace-nowrap">Symbol</th>
                    <th className="py-2 px-3 whitespace-nowrap">Type</th>
                    <th className="py-2 px-3 whitespace-nowrap">Lots</th>
                    <th className="py-2 px-3 whitespace-nowrap">Open Price</th>
                    <th className="py-2 px-3 whitespace-nowrap">Close Price</th>
                    <th className="py-2 px-3 whitespace-nowrap">Pips</th>
                    <th className="py-2 px-3 whitespace-nowrap">Realized P/L</th>
                    <th className="py-2 px-3 whitespace-nowrap text-right">Close Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-[#151F30]/60 transition-colors">
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{h.id}</td>
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{h.closeTime}</td>
                      <td className="py-2 px-3 font-bold text-white whitespace-nowrap">{h.symbol}</td>
                      <td className="py-2 px-3 font-semibold whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            h.side === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {h.side}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">{h.lots.toFixed(2)}</td>
                      <td className="py-2 px-3 whitespace-nowrap">{h.openPrice}</td>
                      <td className="py-2 px-3 whitespace-nowrap">{h.closePrice}</td>
                      <td className={`py-2 px-3 font-bold whitespace-nowrap ${h.pips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {h.pips >= 0 ? '+' : ''}
                        {h.pips}
                      </td>
                      <td className={`py-2 px-3 font-bold whitespace-nowrap ${h.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {h.profit >= 0 ? '+' : ''}${h.profit.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400 font-sans whitespace-nowrap">{h.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
        </div>
      </div>

      <ResetDemoModal />
    </div>
  );
};
