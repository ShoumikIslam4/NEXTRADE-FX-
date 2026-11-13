import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CurrencyPair } from '../types/market';
import { 
  Position, PendingOrder, TradeHistoryItem, TradingAccount, 
  WalletTransaction, OrderSide, OrderType, LiveApplication, LiveApplicationStatus, AccountMode 
} from '../types/trading';
import { INITIAL_CURRENCY_PAIRS } from '../data/mockMarketData';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { 
  calculateMarginRequired, calculateFloatingPnL, validateOrderParams, 
  checkPendingTrigger, checkPositionExitTrigger 
} from '../services/tradingEngine';

interface PlaceOrderParams {
  symbol: string;
  side: OrderSide;
  lots: number;
  stopLoss?: number;
  takeProfit?: number;
}

interface PlacePendingParams {
  symbol: string;
  type: OrderType;
  side: OrderSide;
  targetPrice: number;
  lots: number;
  stopLoss?: number;
  takeProfit?: number;
}

interface TradingContextType {
  pairs: CurrencyPair[];
  selectedPair: CurrencyPair;
  setSelectedPairSymbol: (symbol: string) => void;
  positions: Position[];
  allPositions: Position[];
  pendingOrders: PendingOrder[];
  history: TradeHistoryItem[];
  accounts: TradingAccount[];
  activeAccount: TradingAccount;
  transactions: WalletTransaction[];
  watchlist: string[];
  liveApplication: LiveApplication;
  toggleWatchlist: (symbol: string) => void;
  openMarketOrder: (params: PlaceOrderParams) => boolean;
  placePendingOrder: (params: PlacePendingParams) => boolean;
  closePosition: (id: string) => void;
  cancelPendingOrder: (id: string) => void;
  depositDemoFunds: (amount: number, method?: string) => void;
  withdrawDemoFunds: (amount: number, method?: string) => boolean;
  switchAccount: (accountId: string) => void;
  createDemoAccount: (params: { type: string; leverage: string }) => TradingAccount;
  submitLiveApplication: (data: Partial<LiveApplication>) => void;
  updateLiveApplicationStatus: (status: LiveApplicationStatus, notes?: string) => void;
  confirmResetDemoAccount: (accountId?: string) => void;
  resetModalOpen: boolean;
  setResetModalOpen: (open: boolean) => void;
  totalFloatingProfit: number;
  todayProfit: number;
  isDemoExhausted: boolean;
  demoExhaustedModalOpen: boolean;
  setDemoExhaustedModalOpen: (open: boolean) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

// Initial Accounts: Strictly ONE Demo Account ($1,000) and ONE Live Account per user
const SEED_ACCOUNTS: TradingAccount[] = [
  {
    id: 'acc-demo-1',
    accountNumber: 'NX-DEMO-809214',
    mode: 'DEMO',
    type: 'Raw ECN Demo',
    server: 'NEXTRADE-Demo-01',
    leverage: '1:500',
    currency: 'USD',
    initialBalance: 1000.0,
    balance: 1000.0,
    equity: 1000.0,
    margin: 0.0,
    freeMargin: 1000.0,
    marginLevel: 0.0,
    floatingProfit: 0.0,
    isPrimary: true,
    status: 'ACTIVE',
    createdAt: '2026-11-10'
  },
  {
    id: 'acc-live-1',
    accountNumber: 'NX-LIVE-10492',
    mode: 'LIVE',
    type: 'Institutional ECN Live',
    server: 'NEXTRADE-Live-Prime',
    leverage: '1:100',
    currency: 'USD',
    initialBalance: 0.0,
    balance: 0.0,
    equity: 0.0,
    margin: 0.0,
    freeMargin: 0.0,
    marginLevel: 0.0,
    floatingProfit: 0.0,
    isPrimary: false,
    status: 'PENDING_VERIFICATION',
    createdAt: '2026-11-11'
  }
];

const SEED_LIVE_APP: LiveApplication = {
  id: 'APP-LIVE-10492',
  fullName: 'Alexander Vance',
  email: 'alexander.vance@institutional-trader.com',
  phone: '+1 (555) 382-9104',
  country: 'United Kingdom',
  employmentStatus: 'Full-time Private Capital / Trader',
  annualIncome: '$100,000 - $250,000',
  tradingExperience: '3-5 Years (Forex & CFDs)',
  riskTolerance: 'Moderate',
  idType: 'Passport',
  idNumber: 'GB-P88291410',
  proofOfAddress: 'Tier 1 Bank Statement (London)',
  status: 'UNDER_REVIEW',
  submittedAt: '2026-11-11 11:30:00',
  brokerConnectivity: 'UNAVAILABLE_PENDING_BROKER_INTEGRATION'
};

const SEED_POSITIONS: Position[] = [
  {
    id: 'pos-101',
    accountId: 'acc-demo-1',
    symbol: 'EUR/USD',
    side: 'BUY',
    lots: 0.1,
    openPrice: 1.08240,
    currentPrice: 1.08437,
    stopLoss: 1.07900,
    takeProfit: 1.09100,
    floatingProfit: 19.70,
    pips: 19.7,
    openTime: '2026-11-11 14:15:20',
    marginUsed: 21.68,
    swap: -0.12,
    commission: 0.35
  },
  {
    id: 'pos-102',
    accountId: 'acc-demo-1',
    symbol: 'XAU/USD',
    side: 'BUY',
    lots: 0.05,
    openPrice: 2736.80,
    currentPrice: 2742.60,
    stopLoss: 2720.00,
    takeProfit: 2765.00,
    floatingProfit: 29.00,
    pips: 58.0,
    openTime: '2026-11-11 15:40:05',
    marginUsed: 27.42,
    swap: -0.34,
    commission: 0.25
  }
];

const SEED_PENDING: PendingOrder[] = [
  {
    id: 'pnd-201',
    accountId: 'acc-demo-1',
    symbol: 'USD/JPY',
    type: 'LIMIT',
    side: 'BUY',
    lots: 0.1,
    targetPrice: 152.900,
    currentPrice: 153.420,
    stopLoss: 152.200,
    takeProfit: 154.500,
    placedTime: '2026-11-11 13:20:00',
    status: 'PENDING'
  }
];

const SEED_HISTORY: TradeHistoryItem[] = [
  {
    id: 'his-301',
    accountId: 'acc-demo-1',
    symbol: 'EUR/USD',
    side: 'BUY',
    lots: 0.2,
    openPrice: 1.07920,
    closePrice: 1.08380,
    openTime: '2026-11-10 09:12:00',
    closeTime: '2026-11-10 18:40:22',
    pips: 46.0,
    profit: 92.0,
    reason: 'Take Profit Hit'
  },
  {
    id: 'his-302',
    accountId: 'acc-demo-1',
    symbol: 'USD/JPY',
    side: 'SELL',
    lots: 0.1,
    openPrice: 154.120,
    closePrice: 153.380,
    openTime: '2026-11-09 11:25:00',
    closeTime: '2026-11-09 15:10:45',
    pips: 74.0,
    profit: 48.24,
    reason: 'Manual Close'
  }
];

const SEED_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TXN-001',
    date: '2026-11-10 08:00:00',
    type: 'DEPOSIT',
    amount: 1000.0,
    currency: 'USD',
    status: 'COMPLETED',
    method: 'Simulated Demo Initial Capital',
    reference: 'SIM-INIT-1000',
    accountNumber: 'NX-DEMO-809214'
  }
];

// LocalStorage Persistence Helper
function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`LocalStorage read error for ${key}:`, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`LocalStorage write error for ${key}:`, e);
  }
}

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const { user, serverTradingAccounts, refreshUser } = useAuth();
  const userScope = user?.id || 'guest';

  const [pairs, setPairs] = useState<CurrencyPair[]>(INITIAL_CURRENCY_PAIRS);
  const [selectedPairSymbol, setSelectedPairSymbol] = useState<string>('EUR/USD');

  // Persistent States (scoped per userId for strict Demo/Live & multi-user isolation)
  const [accounts, setAccounts] = useState<TradingAccount[]>(() =>
    loadStorage(`nextrade_${userScope}_accounts_v4`, SEED_ACCOUNTS)
  );

  const [activeAccountId, setActiveAccountId] = useState<string>(() =>
    loadStorage(`nextrade_${userScope}_active_acc_id_v4`, 'acc-demo-1')
  );

  const [allPositions, setAllPositions] = useState<Position[]>(() =>
    loadStorage(`nextrade_${userScope}_positions_v4`, SEED_POSITIONS)
  );

  const [allPendingOrders, setAllPendingOrders] = useState<PendingOrder[]>(() =>
    loadStorage(`nextrade_${userScope}_pending_v4`, SEED_PENDING)
  );

  const [allHistory, setAllHistory] = useState<TradeHistoryItem[]>(() =>
    loadStorage(`nextrade_${userScope}_history_v4`, SEED_HISTORY)
  );

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() =>
    loadStorage(`nextrade_${userScope}_transactions_v4`, SEED_TRANSACTIONS)
  );

  const [liveApplication, setLiveApplication] = useState<LiveApplication>(() =>
    loadStorage(`nextrade_${userScope}_live_app_v4`, SEED_LIVE_APP)
  );

  const [watchlist, setWatchlist] = useState<string[]>(['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'US30.cash']);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [demoExhaustedModalOpen, setDemoExhaustedModalOpen] = useState(false);

  // Reload per-user state when authenticated user switches
  useEffect(() => {
    const scope = user?.id || 'guest';
    const isFreshUser = user && user.id !== 'usr_demo_trader_01';
    const defaultDemoOnly: TradingAccount[] = [
      {
        ...SEED_ACCOUNTS[0],
        id: serverTradingAccounts.find(a => a.mode === 'DEMO')?.id || 'acc-demo-1',
        accountNumber: serverTradingAccounts.find(a => a.mode === 'DEMO')?.accountNumber || 'NX-DEMO-809214',
        balance: serverTradingAccounts.find(a => a.mode === 'DEMO')?.balance ?? 1000.0,
        equity: serverTradingAccounts.find(a => a.mode === 'DEMO')?.balance ?? 1000.0,
        freeMargin: serverTradingAccounts.find(a => a.mode === 'DEMO')?.balance ?? 1000.0,
      }
    ];
    const storedAccs = loadStorage<TradingAccount[] | null>(`nextrade_${scope}_accounts_v4`, null);
    let nextAccs = storedAccs || (isFreshUser ? defaultDemoOnly : SEED_ACCOUNTS);

    // Reconcile with canonical backend trading accounts (Demo balance & Live account provisioning/balance)
    if (serverTradingAccounts && serverTradingAccounts.length > 0) {
      const srvDemo = serverTradingAccounts.find(a => a.mode === 'DEMO');
      const srvLive = serverTradingAccounts.find(a => a.mode === 'LIVE');
      if (srvDemo) {
        const localDemoIdx = nextAccs.findIndex(a => a.mode === 'DEMO');
        if (localDemoIdx >= 0) {
          nextAccs = nextAccs.map((a, idx) =>
            idx === localDemoIdx
              ? { ...a, id: srvDemo.id, accountNumber: srvDemo.accountNumber, balance: storedAccs ? Math.min(a.balance, srvDemo.balance === 1000 && a.balance < 1000 ? a.balance : srvDemo.balance) : srvDemo.balance }
              : a
          );
        } else {
          nextAccs = [{
            id: srvDemo.id,
            accountNumber: srvDemo.accountNumber,
            mode: 'DEMO',
            type: srvDemo.type,
            server: srvDemo.server,
            leverage: srvDemo.leverage,
            currency: 'USD',
            initialBalance: 1000.0,
            balance: srvDemo.balance,
            equity: srvDemo.equity,
            margin: 0,
            freeMargin: srvDemo.freeMargin,
            marginLevel: 0,
            floatingProfit: 0,
            isPrimary: true,
            status: 'ACTIVE',
            createdAt: srvDemo.createdAt
          }, ...nextAccs];
        }
      }
      if (srvLive) {
        const mappedLiveStatus: TradingAccount['status'] =
          srvLive.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING_VERIFICATION';
        const localLiveIdx = nextAccs.findIndex(a => a.mode === 'LIVE');
        const liveObj: TradingAccount = {
          id: srvLive.id,
          accountNumber: srvLive.accountNumber,
          mode: 'LIVE',
          type: srvLive.type,
          server: srvLive.server,
          leverage: srvLive.leverage,
          currency: 'USD',
          initialBalance: 0,
          balance: srvLive.balance,
          equity: srvLive.balance,
          margin: 0,
          freeMargin: srvLive.balance,
          marginLevel: 0,
          floatingProfit: 0,
          isPrimary: false,
          status: mappedLiveStatus,
          createdAt: srvLive.createdAt
        };
        if (localLiveIdx >= 0) {
          nextAccs = nextAccs.map((a, idx) => (idx === localLiveIdx ? liveObj : a));
        } else {
          nextAccs = [...nextAccs, liveObj];
        }
      }
    }

    setAccounts(nextAccs);
    const storedActive = loadStorage<string | null>(`nextrade_${scope}_active_acc_id_v4`, null);
    if (storedActive && nextAccs.some(a => a.id === storedActive)) {
      setActiveAccountId(storedActive);
    } else if (nextAccs[0]) {
      setActiveAccountId(nextAccs[0].id);
    }

    setAllPositions(loadStorage(`nextrade_${scope}_positions_v4`, isFreshUser ? [] : SEED_POSITIONS));
    setAllPendingOrders(loadStorage(`nextrade_${scope}_pending_v4`, isFreshUser ? [] : SEED_PENDING));
    setAllHistory(loadStorage(`nextrade_${scope}_history_v4`, isFreshUser ? [] : SEED_HISTORY));
    setTransactions(loadStorage(`nextrade_${scope}_transactions_v4`, isFreshUser ? [] : SEED_TRANSACTIONS));

    const storedApp = loadStorage<LiveApplication>(`nextrade_${scope}_live_app_v4`, {
      ...SEED_LIVE_APP,
      fullName: user?.fullName || SEED_LIVE_APP.fullName,
      email: user?.email || SEED_LIVE_APP.email,
      phone: user?.phone || SEED_LIVE_APP.phone,
      country: user?.country || 'Bangladesh',
      status: 'NOT_APPLIED',
      idNumber: user?.kycDocumentNumber || '',
    });

    // Map server kycStatus to LiveApplicationStatus
    let mappedStatus: LiveApplicationStatus = storedApp.status;
    if (user?.kycStatus === 'APPROVED') mappedStatus = 'APPROVED_PENDING_BROKER';
    else if (user?.kycStatus === 'PENDING') mappedStatus = 'UNDER_REVIEW';
    else if (user?.kycStatus === 'ADDITIONAL_INFO_REQUIRED') mappedStatus = 'DOCS_REQUESTED';
    else if (user?.kycStatus === 'REJECTED') mappedStatus = 'REJECTED';
    else if (user?.kycStatus === 'UNSUBMITTED' && !storedApp.idNumber) mappedStatus = 'NOT_APPLIED';

    setLiveApplication({
      ...storedApp,
      fullName: user?.fullName || storedApp.fullName,
      email: user?.email || storedApp.email,
      phone: user?.phone || storedApp.phone,
      status: mappedStatus,
      rejectionReason: user?.kycNotes || storedApp.rejectionReason
    });
  }, [user?.id, user?.kycStatus, user?.kycNotes, serverTradingAccounts]);

  // Sync to user-scoped LocalStorage
  useEffect(() => {
    saveStorage(`nextrade_${userScope}_accounts_v4`, accounts);
  }, [accounts, userScope]);

  useEffect(() => {
    saveStorage(`nextrade_${userScope}_active_acc_id_v4`, activeAccountId);
  }, [activeAccountId, userScope]);

  useEffect(() => {
    saveStorage(`nextrade_${userScope}_positions_v4`, allPositions);
  }, [allPositions, userScope]);

  useEffect(() => {
    saveStorage(`nextrade_${userScope}_pending_v4`, allPendingOrders);
  }, [allPendingOrders, userScope]);

  useEffect(() => {
    saveStorage(`nextrade_${userScope}_history_v4`, allHistory);
  }, [allHistory, userScope]);

  useEffect(() => {
    saveStorage(`nextrade_${userScope}_transactions_v4`, transactions);
  }, [transactions, userScope]);

  useEffect(() => {
    saveStorage(`nextrade_${userScope}_live_app_v4`, liveApplication);
  }, [liveApplication, userScope]);

  const accountsRef = useRef(accounts);
  accountsRef.current = accounts;

  const syncDemoBalanceToServer = useCallback((balance: number) => {
    if (!user) return;
    const token = localStorage.getItem('nextrade_token');
    fetch('/api/user/demo-account/sync', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify({ balance })
    }).catch(() => {});
  }, [user]);

  // Positions scoped strictly to active account (Demo vs Live data isolation)
  const positions = useMemo(() => {
    return allPositions.filter(p => p.accountId === activeAccountId);
  }, [allPositions, activeAccountId]);

  // Pending orders scoped strictly to active account
  const pendingOrders = useMemo(() => {
    return allPendingOrders.filter(o => o.accountId === activeAccountId);
  }, [allPendingOrders, activeAccountId]);

  // History scoped strictly to active account
  const history = useMemo(() => {
    return allHistory.filter(h => h.accountId === activeAccountId);
  }, [allHistory, activeAccountId]);

  const selectedPair = useMemo(() => {
    return pairs.find(p => p.symbol === selectedPairSymbol) || pairs[0];
  }, [pairs, selectedPairSymbol]);

  const totalFloatingProfit = useMemo(() => {
    return Number(positions.reduce((acc, p) => acc + (p.floatingProfit || 0), 0).toFixed(2));
  }, [positions]);

  const activeUsedMargin = useMemo(() => {
    return Number(positions.reduce((acc, p) => acc + (p.marginUsed || 0), 0).toFixed(2));
  }, [positions]);

  // Active account derived with live computed equity, margin, freeMargin, marginLevel, floatingProfit
  const activeAccount: TradingAccount = useMemo(() => {
    const raw = accounts.find(a => a.id === activeAccountId) || accounts[0] || SEED_ACCOUNTS[0];
    const newEquity = Number((raw.balance + totalFloatingProfit).toFixed(2));
    const freeMargin = Number((newEquity - activeUsedMargin).toFixed(2));
    const marginLevel = activeUsedMargin > 0 ? Number(((newEquity / activeUsedMargin) * 100).toFixed(1)) : 0;
    return {
      ...raw,
      equity: newEquity,
      margin: activeUsedMargin,
      freeMargin,
      marginLevel,
      floatingProfit: totalFloatingProfit
    };
  }, [accounts, activeAccountId, totalFloatingProfit, activeUsedMargin]);

  // Strict single-allocation Demo exhaustion check
  const isDemoExhausted = useMemo(() => {
    return activeAccount.mode === 'DEMO' && (activeAccount.balance <= 0 || activeAccount.freeMargin <= 0);
  }, [activeAccount]);

  // Computed accounts list providing live metrics for all accounts
  const computedAccounts: TradingAccount[] = useMemo(() => {
    return accounts.map(raw => {
      if (raw.id === activeAccountId) return activeAccount;
      const accPositions = allPositions.filter(p => p.accountId === raw.id);
      const m = Number(accPositions.reduce((acc, p) => acc + (p.marginUsed || 0), 0).toFixed(2));
      const fp = Number(accPositions.reduce((acc, p) => acc + (p.floatingProfit || 0), 0).toFixed(2));
      const eq = Number((raw.balance + fp).toFixed(2));
      const free = Number((eq - m).toFixed(2));
      const lvl = m > 0 ? Number(((eq / m) * 100).toFixed(1)) : 0;
      return {
        ...raw,
        equity: eq,
        margin: m,
        freeMargin: free,
        marginLevel: lvl,
        floatingProfit: fp
      };
    });
  }, [accounts, activeAccountId, activeAccount, allPositions]);

  const todayProfit = useMemo(() => {
    const closedToday = history
      .filter(h => h.closeTime.startsWith('2026-11-11'))
      .reduce((acc, h) => acc + h.profit, 0);
    return Number((closedToday + totalFloatingProfit).toFixed(2));
  }, [history, totalFloatingProfit]);

  // Tick Engine + Auto SL/TP + Auto Pending Order Triggering
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update pair ticks
      setPairs(currentPairs => {
        return currentPairs.map(pair => {
          if (Math.random() > 0.45) return pair;

          const tickDirection = Math.random() > 0.49 ? 1 : -1;
          const minPip = Math.pow(10, -pair.pipPrecision);
          const pipJitter = (Math.floor(Math.random() * 2) + 1) * minPip * tickDirection;

          let newBid = Number((pair.bid + pipJitter).toFixed(pair.pipPrecision));
          let newAsk = Number((newBid + (pair.spread / pair.pipMultiplier)).toFixed(pair.pipPrecision));
          let newHigh = Math.max(pair.high24h, newAsk);
          let newLow = Math.min(pair.low24h, newBid);

          return {
            ...pair,
            bid: newBid,
            ask: newAsk,
            high24h: newHigh,
            low24h: newLow
          };
        });
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Price updates reaction: P/L calculation, SL/TP auto-exit, and Pending Order activation
  // Strictly decoupled from accounts state to prevent infinite update depth loops
  useEffect(() => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let newlyActivatedPositions: Position[] = [];

    // 1. Check Pending Orders for Activation
    setAllPendingOrders(prevPending => {
      const remainingPending: PendingOrder[] = [];
      const activated: Position[] = [];

      for (const order of prevPending) {
        const pair = pairs.find(p => p.symbol === order.symbol);
        if (!pair || order.status !== 'PENDING') {
          remainingPending.push(order);
          continue;
        }

        const isTriggered = checkPendingTrigger(order, pair);
        if (isTriggered) {
          const acc = accountsRef.current.find(a => a.id === order.accountId) || accountsRef.current[0];
          const execPrice = order.side === 'BUY' ? pair.ask : pair.bid;
          const marginReq = calculateMarginRequired(pair, order.lots, execPrice, acc.leverage);

          activated.push({
            id: `pos-${Math.floor(1000 + Math.random() * 9000)}`,
            accountId: order.accountId,
            symbol: order.symbol,
            side: order.side,
            lots: order.lots,
            openPrice: order.targetPrice,
            currentPrice: execPrice,
            stopLoss: order.stopLoss,
            takeProfit: order.takeProfit,
            floatingProfit: 0.0,
            pips: 0.0,
            openTime: nowStr,
            marginUsed: marginReq,
            swap: 0.0,
            commission: Number((order.lots * 3.5).toFixed(2))
          });

          addToast({
            type: 'info',
            title: 'Pending Order Activated (DEMO)',
            message: `${order.type} ${order.side} ${order.lots} Lots ${order.symbol} triggered @ ${order.targetPrice}`
          });
        } else {
          remainingPending.push(order);
        }
      }

      newlyActivatedPositions = activated;
      return remainingPending;
    });

    // 2. Check Positions for P/L updates and SL/TP hits
    setAllPositions(prevPositions => {
      const basePositions = newlyActivatedPositions.length > 0
        ? [...newlyActivatedPositions, ...prevPositions]
        : prevPositions;

      const remaining: Position[] = [];
      const exitedHistory: TradeHistoryItem[] = [];
      let balanceDelta = 0;
      let targetAccId = '';

      for (const pos of basePositions) {
        const pair = pairs.find(p => p.symbol === pos.symbol);
        if (!pair) {
          remaining.push(pos);
          continue;
        }

        // Instrument-specific P/L calculation
        const { currentPrice, pips, floatingProfit } = calculateFloatingPnL(
          pos, pair, pair.bid, pair.ask
        );

        // Check SL/TP exit
        const exitCheck = checkPositionExitTrigger(pos, pair);
        if (exitCheck.hit && exitCheck.reason) {
          targetAccId = pos.accountId || 'acc-demo-1';
          const realized = floatingProfit - pos.commission;
          balanceDelta += realized;

          exitedHistory.push({
            id: `his-${Math.floor(1000 + Math.random() * 9000)}`,
            accountId: pos.accountId,
            symbol: pos.symbol,
            side: pos.side,
            lots: pos.lots,
            openPrice: pos.openPrice,
            closePrice: exitCheck.exitPrice || currentPrice,
            openTime: pos.openTime,
            closeTime: nowStr,
            pips,
            profit: Number(realized.toFixed(2)),
            reason: exitCheck.reason
          });

          const isProfit = realized >= 0;
          const pnlBdt = Math.round(realized * 122.50);
          addToast({
            type: isProfit ? 'success' : 'error',
            title: isProfit ? `🎉 ${exitCheck.reason} (+৳${pnlBdt.toLocaleString()} BDT)` : `⚠️ ${exitCheck.reason} (-৳${Math.abs(pnlBdt).toLocaleString()} BDT)`,
            message: `Closed ${pos.side} ${pos.lots} lots ${pos.symbol} @ ${currentPrice} with ${isProfit ? '+' : ''}$${realized.toFixed(2)} USD (${isProfit ? '+' : ''}৳${pnlBdt.toLocaleString()} BDT)`
          });
        } else {
          remaining.push({
            ...pos,
            currentPrice,
            pips,
            floatingProfit
          });
        }
      }

      // If any positions closed via SL/TP, record history and update account balance
      if (exitedHistory.length > 0) {
        setAllHistory(h => [...exitedHistory, ...h]);
        if (targetAccId) {
          setAccounts(accs =>
            accs.map(a => {
              if (a.id === targetAccId) {
                const newBal = Math.max(0, Number((a.balance + balanceDelta).toFixed(2)));
                if (a.mode === 'DEMO') {
                  syncDemoBalanceToServer(newBal);
                }
                return { ...a, balance: newBal };
              }
              return a;
            })
          );
        }
      }

      return remaining;
    });
  }, [pairs, addToast, syncDemoBalanceToServer]);

  // Watchlist Toggle
  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => {
      if (prev.includes(symbol)) {
        addToast({ type: 'info', title: 'Watchlist', message: `Removed ${symbol} from watchlist.` });
        return prev.filter(s => s !== symbol);
      } else {
        addToast({ type: 'success', title: 'Watchlist', message: `Added ${symbol} to watchlist.` });
        return [...prev, symbol];
      }
    });
  }, [addToast]);

  // Open Market Order
  const openMarketOrder = useCallback(({ symbol, side, lots, stopLoss, takeProfit }: PlaceOrderParams): boolean => {
    // Phase 1 Live Execution Restriction
    if (activeAccount.mode === 'LIVE') {
      addToast({
        type: 'warning',
        title: 'Live Execution Disabled',
        message: 'Actual live trade execution remains disabled until an authorized broker integration and regulatory licensing are active. Ledger funding and KYC remain fully functional.'
      });
      return false;
    }

    // Phase 1 Demo Exhaustion Check
    if (activeAccount.mode === 'DEMO' && (activeAccount.freeMargin <= 0 || activeAccount.balance <= 0)) {
      addToast({
        type: 'error',
        title: 'Demo Allocation Exhausted',
        message: 'Your one-time $1,000 USD demo allocation has been exhausted. Additional demo credits are prohibited under risk rules. Please apply for a Live Trading Account.'
      });
      setDemoExhaustedModalOpen(true);
      return false;
    }

    const pair = pairs.find(p => p.symbol === symbol);
    if (!pair) {
      addToast({ type: 'error', title: 'Order Failed', message: `Symbol ${symbol} not recognized.` });
      return false;
    }

    const validation = validateOrderParams(
      symbol, side, 'MARKET', lots, pair, activeAccount, undefined, stopLoss, takeProfit
    );

    if (!validation.valid) {
      addToast({ type: 'error', title: 'Order Rejected', message: validation.error || 'Invalid order parameters.' });
      return false;
    }

    const price = side === 'BUY' ? pair.ask : pair.bid;
    const marginReq = validation.marginReq || calculateMarginRequired(pair, lots, price, activeAccount.leverage);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newPos: Position = {
      id: `pos-${Math.floor(1000 + Math.random() * 9000)}`,
      accountId: activeAccountId,
      symbol,
      side,
      lots,
      openPrice: price,
      currentPrice: price,
      stopLoss,
      takeProfit,
      floatingProfit: 0.0,
      pips: 0.0,
      openTime: now,
      marginUsed: marginReq,
      swap: 0.0,
      commission: Number((lots * 3.5).toFixed(2))
    };

    setAllPositions(prev => [newPos, ...prev]);
    addToast({
      type: 'success',
      title: 'Order Executed (DEMO / SIMULATED)',
      message: `${side} ${lots} Lots ${symbol} @ ${price.toFixed(pair.pipPrecision)}`
    });
    return true;
  }, [pairs, activeAccount, activeAccountId, addToast]);

  // Place Pending Order
  const placePendingOrder = useCallback(({ symbol, type, side, targetPrice, lots, stopLoss, takeProfit }: PlacePendingParams): boolean => {
    // Phase 1 Live Execution Restriction
    if (activeAccount.mode === 'LIVE') {
      addToast({
        type: 'warning',
        title: 'Live Execution Disabled',
        message: 'Actual live trade execution remains disabled until authorized broker connectivity is active.'
      });
      return false;
    }

    // Phase 1 Demo Exhaustion Check
    if (activeAccount.mode === 'DEMO' && (activeAccount.freeMargin <= 0 || activeAccount.balance <= 0)) {
      addToast({
        type: 'error',
        title: 'Demo Allocation Exhausted',
        message: 'Your one-time $1,000 USD demo allocation has been exhausted. Additional demo credits are prohibited. Please apply for a Live Trading Account.'
      });
      setDemoExhaustedModalOpen(true);
      return false;
    }

    const pair = pairs.find(p => p.symbol === symbol);
    if (!pair) return false;

    const validation = validateOrderParams(
      symbol, side, type, lots, pair, activeAccount, targetPrice, stopLoss, takeProfit
    );

    if (!validation.valid) {
      addToast({ type: 'error', title: 'Pending Order Rejected', message: validation.error || 'Invalid order parameters.' });
      return false;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const order: PendingOrder = {
      id: `pnd-${Math.floor(1000 + Math.random() * 9000)}`,
      accountId: activeAccountId,
      symbol,
      type,
      side,
      lots,
      targetPrice,
      currentPrice: side === 'BUY' ? pair.ask : pair.bid,
      stopLoss,
      takeProfit,
      placedTime: now,
      status: 'PENDING'
    };

    setAllPendingOrders(prev => [order, ...prev]);
    addToast({
      type: 'success',
      title: 'Pending Order Placed (DEMO)',
      message: `${type} ${side} ${lots} Lots ${symbol} @ ${targetPrice.toFixed(pair.pipPrecision)}`
    });
    return true;
  }, [pairs, activeAccount, activeAccountId, addToast]);

  // Close Position Manually
  const closePosition = useCallback((id: string) => {
    const pos = allPositions.find(p => p.id === id);
    if (!pos) return;

    const closePrice = pos.currentPrice;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const historyRecord: TradeHistoryItem = {
      id: `his-${Math.floor(1000 + Math.random() * 9000)}`,
      accountId: pos.accountId,
      symbol: pos.symbol,
      side: pos.side,
      lots: pos.lots,
      openPrice: pos.openPrice,
      closePrice,
      openTime: pos.openTime,
      closeTime: now,
      pips: pos.pips,
      profit: pos.floatingProfit,
      reason: 'Manual Close'
    };

    // Update account balance & persist Demo balance to server
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === pos.accountId) {
          const newBal = Math.max(0, Number((acc.balance + pos.floatingProfit - pos.commission).toFixed(2)));
          if (acc.mode === 'DEMO') {
            syncDemoBalanceToServer(newBal);
          }
          return {
            ...acc,
            balance: newBal
          };
        }
        return acc;
      })
    );

    setAllHistory(prev => [historyRecord, ...prev]);
    setAllPositions(prev => prev.filter(p => p.id !== id));

    const isProfit = pos.floatingProfit >= 0;
    const pnlBdt = Math.round(pos.floatingProfit * 122.50);
    addToast({
      type: isProfit ? 'success' : 'error',
      title: isProfit ? `🎉 Profit Alert (+৳${pnlBdt.toLocaleString()} BDT)` : `⚠️ Loss Alert (-৳${Math.abs(pnlBdt).toLocaleString()} BDT)`,
      message: `${isProfit ? 'Profit' : 'Loss'} of ${isProfit ? '+' : ''}$${pos.floatingProfit.toFixed(2)} USD (${isProfit ? '+' : ''}৳${pnlBdt.toLocaleString()} BDT) on ${pos.side} ${pos.lots} lots ${pos.symbol}`
    });
  }, [allPositions, addToast, syncDemoBalanceToServer]);

  // Cancel Pending Order
  const cancelPendingOrder = useCallback((id: string) => {
    setAllPendingOrders(prev => prev.filter(o => o.id !== id));
    addToast({
      type: 'info',
      title: 'Order Cancelled',
      message: 'Pending order successfully cancelled.'
    });
  }, [addToast]);

  // Demo Funds Deposit - Enforce Strictly No Top-Up Policy
  const depositDemoFunds = useCallback((_amount?: number, _method?: string) => {
    addToast({
      type: 'error',
      title: 'Demo Top-Up Prohibited',
      message: 'Demo accounts operate under a strict, non-renewable $1,000 allocation. Balance top-ups and demo deposits are prohibited under institutional risk rules. When exhausted, please apply for a Live Trading Account.'
    });
  }, [addToast]);

  // Demo Funds Withdrawal
  const withdrawDemoFunds = useCallback((amount: number, method: string = 'Simulated Wire'): boolean => {
    if (activeAccount.mode === 'LIVE') {
      addToast({
        type: 'error',
        title: 'Action Unavailable',
        message: 'Live broker withdrawals are unavailable until institutional clearing is connected.'
      });
      return false;
    }

    if (amount > activeAccount.freeMargin) {
      addToast({
        type: 'error',
        title: 'Withdrawal Failed',
        message: 'Withdrawal amount exceeds available demo free margin.'
      });
      return false;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === activeAccountId) {
          return {
            ...acc,
            balance: acc.balance - amount,
            equity: acc.equity - amount,
            freeMargin: acc.freeMargin - amount
          };
        }
        return acc;
      })
    );

    const newTxn: WalletTransaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: now,
      type: 'WITHDRAWAL',
      amount,
      currency: 'USD',
      status: 'COMPLETED',
      method,
      reference: `SIM-WTH-${Math.floor(100000 + Math.random() * 900000)}`,
      accountNumber: activeAccount.accountNumber
    };

    setTransactions(prev => [newTxn, ...prev]);
    addToast({
      type: 'success',
      title: 'Demo Withdrawal Processed',
      message: `-$${amount.toLocaleString()} deducted from demo balance.`
    });
    return true;
  }, [activeAccount, activeAccountId, addToast]);

  // Switch Active Account
  const switchAccount = useCallback((accountId: string) => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return;

    setActiveAccountId(accountId);
    addToast({
      type: acc.mode === 'LIVE' ? 'warning' : 'info',
      title: `Switched to ${acc.mode} Account`,
      message: `${acc.accountNumber} (${acc.type}) is now active.${acc.mode === 'LIVE' ? ' (Live execution safely disabled)' : ''}`
    });
  }, [accounts, addToast]);

  // Create Demo Account - Strictly ONE Demo Account Rule
  const createDemoAccount = useCallback(({ type, leverage }: { type?: string; leverage?: string }): TradingAccount => {
    const existingDemo = accounts.find(a => a.mode === 'DEMO');
    if (existingDemo) {
      addToast({
        type: 'warning',
        title: 'Single Demo Account Policy',
        message: `Every registered user can receive only ONE Demo Account. You already hold active Demo #${existingDemo.accountNumber}. Second demo accounts are strictly prohibited.`
      });
      setActiveAccountId(existingDemo.id);
      return existingDemo;
    }

    const randNum = Math.floor(100000 + Math.random() * 900000);
    const newAcc: TradingAccount = {
      id: `acc-demo-${randNum}`,
      accountNumber: `NX-DEMO-${randNum}`,
      mode: 'DEMO',
      type: type || 'Raw ECN Demo',
      server: 'NEXTRADE-Demo-01',
      leverage: leverage || '1:500',
      currency: 'USD',
      initialBalance: 1000.0,
      balance: 1000.0,
      equity: 1000.0,
      margin: 0.0,
      freeMargin: 1000.0,
      marginLevel: 0.0,
      floatingProfit: 0.0,
      isPrimary: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAccounts(prev => [...prev, newAcc]);
    setActiveAccountId(newAcc.id);
    addToast({
      type: 'success',
      title: 'Demo Account Created',
      message: `Account #${newAcc.accountNumber} created with exactly $1,000 USD virtual demo balance.`
    });
    return newAcc;
  }, [accounts, addToast]);

  // Submit Live Account Application (Direct Live registration without requiring Demo first)
  const submitLiveApplication = useCallback((data: Partial<LiveApplication>) => {
    const newApp: LiveApplication = {
      ...liveApplication,
      ...data,
      id: `APP-LIVE-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'UNDER_REVIEW',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      brokerConnectivity: 'UNAVAILABLE_PENDING_BROKER_INTEGRATION'
    };

    setLiveApplication(newApp);

    // Persist Live application & KYC to backend
    const token = localStorage.getItem('nextrade_token');
    fetch('/api/user/live-application', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      credentials: 'include',
      body: JSON.stringify({
        fullName: newApp.fullName,
        phone: newApp.phone,
        country: newApp.country,
        idType: newApp.idType === 'National ID' ? 'NATIONAL_ID' : newApp.idType === 'Driver License' ? 'DRIVING_LICENSE' : 'PASSPORT',
        idNumber: newApp.idNumber,
        fileName: `${newApp.idType}_${newApp.idNumber}.pdf`
      })
    })
      .then(() => refreshUser())
      .catch(() => {});

    // Update or ensure a live account exists with PENDING_VERIFICATION
    setAccounts(prev => {
      const existingLive = prev.find(a => a.mode === 'LIVE');
      if (existingLive) {
        return prev.map(a => a.id === existingLive.id ? { ...a, status: 'PENDING_VERIFICATION' } : a);
      } else {
        const randNum = Math.floor(10000 + Math.random() * 90000);
        const liveAcc: TradingAccount = {
          id: `acc-live-${randNum}`,
          accountNumber: `NX-LIVE-${randNum}`,
          mode: 'LIVE',
          type: 'Institutional ECN Live',
          server: 'NEXTRADE-Live-Prime',
          leverage: '1:100',
          currency: 'USD',
          initialBalance: 0.0,
          balance: 0.0,
          equity: 0.0,
          margin: 0.0,
          freeMargin: 0.0,
          marginLevel: 0.0,
          floatingProfit: 0.0,
          isPrimary: false,
          status: 'PENDING_VERIFICATION',
          createdAt: new Date().toISOString().split('T')[0]
        };
        return [...prev, liveAcc];
      }
    });

    addToast({
      type: 'info',
      title: 'Live Application Submitted',
      message: 'KYC documents and financial profile submitted for institutional compliance review.'
    });
  }, [liveApplication, addToast, refreshUser]);

  // Update Live Application Status (Admin action)
  const updateLiveApplicationStatus = useCallback((status: LiveApplicationStatus, notes?: string) => {
    setLiveApplication(prev => ({
      ...prev,
      status,
      reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      rejectionReason: notes
    }));

    setAccounts(prev =>
      prev.map(a => {
        if (a.mode === 'LIVE') {
          return {
            ...a,
            status: status === 'APPROVED_PENDING_BROKER' ? 'ACTIVE' : 'PENDING_VERIFICATION'
          };
        }
        return a;
      })
    );

    addToast({
      type: 'info',
      title: 'Application Status Updated',
      message: `Live application status updated to: ${status}`
    });
  }, [addToast]);

  // Reset Demo Account - Strictly Prohibited Under Platform Rules
  const confirmResetDemoAccount = useCallback((_targetAccountId?: string) => {
    addToast({
      type: 'error',
      title: 'Demo Balance Reset Prohibited',
      message: 'Demo balance resets are strictly prohibited under platform risk policy. Each trader receives exactly one non-renewable $1,000 USD practice allocation. Once exhausted, please apply for a Live Trading Account.'
    });
    setResetModalOpen(false);
  }, [addToast]);

  return (
    <TradingContext.Provider
      value={{
        pairs,
        selectedPair,
        setSelectedPairSymbol,
        positions,
        allPositions,
        pendingOrders,
        history,
        accounts: computedAccounts,
        activeAccount,
        transactions,
        watchlist,
        liveApplication,
        toggleWatchlist,
        openMarketOrder,
        placePendingOrder,
        closePosition,
        cancelPendingOrder,
        depositDemoFunds,
        withdrawDemoFunds,
        switchAccount,
        createDemoAccount,
        submitLiveApplication,
        updateLiveApplicationStatus,
        confirmResetDemoAccount,
        resetModalOpen,
        setResetModalOpen,
        totalFloatingProfit,
        todayProfit,
        isDemoExhausted,
        demoExhaustedModalOpen,
        setDemoExhaustedModalOpen
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within TradingProvider');
  }
  return context;
};
