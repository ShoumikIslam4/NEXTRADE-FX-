import { CurrencyPair, EconomicEvent, MarketNewsItem, MarketAnalysisItem, TradingSignal, EducationCourse, CandleData } from '../types/market';

export const INITIAL_CURRENCY_PAIRS: CurrencyPair[] = [
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'forex',
    bid: 1.08425,
    ask: 1.08437,
    spread: 0.12,
    change24h: 0.28,
    high24h: 1.08710,
    low24h: 1.08180,
    pipPrecision: 5,
    pipMultiplier: 10000,
    lotSize: 100000,
    leverageMax: 500,
    description: 'Major European Union single currency against the United States Dollar.'
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'forex',
    bid: 1.29150,
    ask: 1.29168,
    spread: 0.18,
    change24h: -0.41,
    high24h: 1.29820,
    low24h: 1.28910,
    pipPrecision: 5,
    pipMultiplier: 10000,
    lotSize: 100000,
    leverageMax: 500,
    description: 'Cable: Great British Pound against the United States Dollar.'
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'forex',
    bid: 153.420,
    ask: 153.438,
    spread: 0.18,
    change24h: 0.65,
    high24h: 153.880,
    low24h: 152.610,
    pipPrecision: 3,
    pipMultiplier: 100,
    lotSize: 100000,
    leverageMax: 500,
    description: 'United States Dollar against Japanese Yen with BoJ intervention vigilance.'
  },
  {
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    category: 'forex',
    bid: 0.65820,
    ask: 0.65836,
    spread: 0.16,
    change24h: 0.14,
    high24h: 0.66120,
    low24h: 0.65540,
    pipPrecision: 5,
    pipMultiplier: 10000,
    lotSize: 100000,
    leverageMax: 400,
    description: 'Aussie: Commodity currency influenced by Chinese macro demand.'
  },
  {
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    category: 'forex',
    bid: 1.38610,
    ask: 1.38628,
    spread: 0.18,
    change24h: -0.19,
    high24h: 1.39050,
    low24h: 1.38310,
    pipPrecision: 5,
    pipMultiplier: 10000,
    lotSize: 100000,
    leverageMax: 400,
    description: 'Loonie: Strongly correlated with WTI Crude Oil and North American trade.'
  },
  {
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    category: 'forex',
    bid: 0.88420,
    ask: 0.88438,
    spread: 0.18,
    change24h: 0.08,
    high24h: 0.88750,
    low24h: 0.88190,
    pipPrecision: 5,
    pipMultiplier: 10000,
    lotSize: 100000,
    leverageMax: 400,
    description: 'Swissie: Traditional safe haven asset with low historical volatility.'
  },
  {
    symbol: 'NZD/USD',
    name: 'New Zealand Dollar / US Dollar',
    category: 'forex',
    bid: 0.59740,
    ask: 0.59762,
    spread: 0.22,
    change24h: -0.32,
    high24h: 0.60150,
    low24h: 0.59510,
    pipPrecision: 5,
    pipMultiplier: 10000,
    lotSize: 100000,
    leverageMax: 300,
    description: 'Kiwi: Sensitive to dairy export auctions and RBNZ cash rate guidance.'
  },
  {
    symbol: 'EUR/GBP',
    name: 'Euro / British Pound',
    category: 'forex',
    bid: 0.83940,
    ask: 0.83955,
    spread: 0.15,
    change24h: 0.52,
    high24h: 0.84210,
    low24h: 0.83600,
    pipPrecision: 5,
    pipMultiplier: 10000,
    lotSize: 100000,
    leverageMax: 400,
    description: 'Key European cross currency pair reflecting BoE vs ECB rate differentials.'
  },
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    category: 'commodities',
    bid: 2742.60,
    ask: 2742.95,
    spread: 0.35,
    change24h: 1.18,
    high24h: 2758.40,
    low24h: 2724.10,
    pipPrecision: 2,
    pipMultiplier: 10,
    lotSize: 100,
    leverageMax: 200,
    description: 'Precious metal benchmark and global monetary inflation hedge.'
  },
  {
    symbol: 'XAG/USD',
    name: 'Spot Silver / US Dollar',
    category: 'commodities',
    bid: 32.48,
    ask: 32.51,
    spread: 0.03,
    change24h: 1.94,
    high24h: 32.85,
    low24h: 31.72,
    pipPrecision: 3,
    pipMultiplier: 100,
    lotSize: 5000,
    leverageMax: 100,
    description: 'Industrial and monetary precious metal with high beta.'
  },
  {
    symbol: 'USOIL.cash',
    name: 'WTI Crude Oil Cash',
    category: 'commodities',
    bid: 70.85,
    ask: 70.89,
    spread: 0.04,
    change24h: -1.35,
    high24h: 72.40,
    low24h: 70.15,
    pipPrecision: 2,
    pipMultiplier: 100,
    lotSize: 1000,
    leverageMax: 100,
    description: 'West Texas Intermediate crude oil physical spot benchmark.'
  },
  {
    symbol: 'US30.cash',
    name: 'Dow Jones Industrial Average 30',
    category: 'indices',
    bid: 43910.0,
    ask: 43912.5,
    spread: 2.5,
    change24h: 0.45,
    high24h: 44120.0,
    low24h: 43700.0,
    pipPrecision: 1,
    pipMultiplier: 1,
    lotSize: 1,
    leverageMax: 200,
    description: 'Wall Street 30 blue-chip equity benchmark.'
  },
  {
    symbol: 'NAS100.cash',
    name: 'US Tech 100 Index',
    category: 'indices',
    bid: 21085.0,
    ask: 21086.8,
    spread: 1.8,
    change24h: 0.88,
    high24h: 21190.0,
    low24h: 20920.0,
    pipPrecision: 1,
    pipMultiplier: 1,
    lotSize: 1,
    leverageMax: 200,
    description: 'High-growth technology sector composite index.'
  },
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar',
    category: 'crypto',
    bid: 88450.0,
    ask: 88465.0,
    spread: 15.0,
    change24h: 3.42,
    high24h: 89800.0,
    low24h: 85200.0,
    pipPrecision: 2,
    pipMultiplier: 1,
    lotSize: 1,
    leverageMax: 50,
    description: 'Digital asset benchmark traded with deep liquidity.'
  }
];

export function generateInitialCandles(basePrice: number, count: number = 80, pipPrecision: number = 5): CandleData[] {
  const candles: CandleData[] = [];
  let currentPrice = basePrice;
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = 300; // 5 minutes

  // Generate backwards in time
  const points: { open: number; high: number; low: number; close: number; volume: number; time: number }[] = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * intervalSeconds;
    const volatility = basePrice * 0.0012;
    const change = (Math.random() - 0.49) * volatility;
    const open = currentPrice;
    const close = Number((open + change).toFixed(pipPrecision));
    const high = Number((Math.max(open, close) + Math.random() * volatility * 0.8).toFixed(pipPrecision));
    const low = Number((Math.min(open, close) - Math.random() * volatility * 0.8).toFixed(pipPrecision));
    const volume = Math.floor(150 + Math.random() * 800);

    points.push({ time, open, high, low, close, volume });
    currentPrice = close;
  }

  return points;
}

export const MOCK_ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    id: 'eco-1',
    time: '13:30 GMT',
    date: 'Today',
    currency: 'USD',
    event: 'Core PCE Price Index (MoM)',
    impact: 'high',
    actual: '0.3%',
    forecast: '0.3%',
    previous: '0.2%'
  },
  {
    id: 'eco-2',
    time: '14:45 GMT',
    date: 'Today',
    currency: 'USD',
    event: 'S&P Global Manufacturing PMI',
    impact: 'medium',
    actual: '50.2',
    forecast: '49.8',
    previous: '48.9'
  },
  {
    id: 'eco-3',
    time: '18:00 GMT',
    date: 'Today',
    currency: 'USD',
    event: 'FOMC Member Speech (Powell)',
    impact: 'high',
    actual: '-',
    forecast: '-',
    previous: '-'
  },
  {
    id: 'eco-4',
    time: '07:00 GMT',
    date: 'Tomorrow',
    currency: 'EUR',
    event: 'German CPI Preliminary (YoY)',
    impact: 'high',
    actual: '-',
    forecast: '2.1%',
    previous: '2.4%'
  },
  {
    id: 'eco-5',
    time: '09:30 GMT',
    date: 'Tomorrow',
    currency: 'GBP',
    event: 'GDP (QoQ) Preliminary',
    impact: 'high',
    actual: '-',
    forecast: '0.4%',
    previous: '0.6%'
  },
  {
    id: 'eco-6',
    time: '23:30 GMT',
    date: 'Tomorrow',
    currency: 'JPY',
    event: 'Tokyo CPI Ex-Fresh Food',
    impact: 'medium',
    actual: '-',
    forecast: '2.2%',
    previous: '2.1%'
  }
];

export const MOCK_NEWS_ARTICLES: MarketNewsItem[] = [
  {
    id: 'news-1',
    title: 'Dollar Index Consolidates Above 104.50 Ahead of Crucial PCE Data',
    category: 'Forex',
    summary: 'Greenback holds weekly gains as bond yields stabilize. Cross-asset desks price an 84% probability of a 25bps Fed cut.',
    timestamp: '18 minutes ago',
    readTime: '3 min read',
    source: 'NEXTRADE Institutional Research',
    sentiment: 'bullish',
    impactPair: 'EUR/USD'
  },
  {
    id: 'news-2',
    title: 'Gold Tests All-Time Highs on Escalating Middle East Tensions & Reserve Allocations',
    category: 'Commodities',
    summary: 'Spot Gold (XAU/USD) touched $2,758 during London turnover as global central bank balance sheet allocations remain aggressive.',
    timestamp: '42 minutes ago',
    readTime: '4 min read',
    source: 'Commodity Desk Brief',
    sentiment: 'bullish',
    impactPair: 'XAU/USD'
  },
  {
    id: 'news-3',
    title: 'Bank of Japan Signals Readiness for Rate Hike If Wage Growth Broadens',
    category: 'Central Banks',
    summary: 'Governor Ueda reaffirmed that real interest rates remain deeply negative in Tokyo, pushing USD/JPY off session highs.',
    timestamp: '2 hours ago',
    readTime: '5 min read',
    source: 'Asia-Pacific Macro Dispatch',
    sentiment: 'bearish',
    impactPair: 'USD/JPY'
  },
  {
    id: 'news-4',
    title: 'European Central Bank Officials Debate Terminal Rate Target Amid Disinflation',
    category: 'Central Banks',
    summary: 'Services inflation in the Eurozone moderates to 3.8%, opening door for back-to-back quarterly rate reductions in Frankfurt.',
    timestamp: '3 hours ago',
    readTime: '3 min read',
    source: 'Eurozone Desk',
    sentiment: 'neutral',
    impactPair: 'EUR/GBP'
  }
];

export const MOCK_MARKET_ANALYSES: MarketAnalysisItem[] = [
  {
    id: 'ana-1',
    title: 'EUR/USD Technical Outlook: Ascending Channel Support at 1.0820 Under Scrutiny',
    pair: 'EUR/USD',
    timeframe: '4H Chart',
    bias: 'Bullish',
    support: '1.0820 / 1.0775',
    resistance: '1.0885 / 1.0930',
    author: 'Marcus Vance, CMT',
    authorRole: 'Head of Technical Strategy',
    date: 'November 2026',
    summary: 'The EUR/USD pair has retested the 50-period EMA on the 4H timeframe with bullish divergence printing on RSI(14). A sustained break above 1.0870 confirms continuation toward psychological 1.0900.',
    keyPoints: [
      'Ascending trendline intact from 1.0760 swing lows',
      'RSI momentum printed positive divergence on the latest swing',
      'Watch 1.0820 invalidation for a deeper pullback'
    ]
  },
  {
    id: 'ana-2',
    title: 'XAU/USD Momentum Analysis: Bull Flag Consolidation Above $2,735',
    pair: 'XAU/USD',
    timeframe: 'Daily Chart',
    bias: 'Bullish',
    support: '$2,720 / $2,700',
    resistance: '$2,760 / $2,800',
    author: 'Elena Rostova, CFA',
    authorRole: 'Senior Commodities Strategist',
    date: 'November 2026',
    summary: 'Gold continues to print higher lows on the daily chart. Structural institutional accumulation remains evident through high volume nodes on pullbacks.',
    keyPoints: [
      'Clean breakout retest at previous resistance $2,725',
      'MACD histogram ticking positive on the 4H timeframe',
      'Fibonacci extension 1.618 projects $2,810 next target'
    ]
  },
  {
    id: 'ana-3',
    title: 'GBP/USD Breakdown Alert: Double Top Formation Near 1.3000 Resistance',
    pair: 'GBP/USD',
    timeframe: '1H Chart',
    bias: 'Bearish',
    support: '1.2880 / 1.2830',
    resistance: '1.2950 / 1.3000',
    author: 'David Sterling',
    authorRole: 'Chief FX Strategist',
    date: 'November 2026',
    summary: 'Cable failed to hold the 1.2980 breakout zone and formed an intraday neckline breakdown at 1.2920. Risk-reward favors short setups targeting 1.2880.',
    keyPoints: [
      'Failure to sustain above key psychological 1.3000 handle',
      'Bearish engulfing candle on 1H closing below 20 EMA',
      'Target 1.2880 with stop loss placed strictly above 1.2955'
    ]
  }
];

export const MOCK_TRADING_SIGNALS: TradingSignal[] = [
  {
    id: 'sig-1',
    pair: 'EUR/USD',
    direction: 'BUY',
    entryPrice: 1.0840,
    stopLoss: 1.0805,
    takeProfit1: 1.0890,
    takeProfit2: 1.0935,
    status: 'ACTIVE',
    timestamp: '15 mins ago',
    confidence: 88,
    strategy: 'Orderblock Rejection + 4H EMA Confluence'
  },
  {
    id: 'sig-2',
    pair: 'XAU/USD',
    direction: 'BUY',
    entryPrice: 2740.0,
    stopLoss: 2728.0,
    takeProfit1: 2758.0,
    takeProfit2: 2775.0,
    status: 'ACTIVE',
    timestamp: '1 hour ago',
    confidence: 92,
    strategy: 'Bull Flag Breakout + Volume Spike'
  },
  {
    id: 'sig-3',
    pair: 'GBP/USD',
    direction: 'SELL',
    entryPrice: 1.2930,
    stopLoss: 1.2965,
    takeProfit1: 1.2885,
    takeProfit2: 1.2840,
    status: 'ACTIVE',
    timestamp: '2 hours ago',
    confidence: 81,
    strategy: 'Liquidity Sweep of Asian Highs'
  },
  {
    id: 'sig-4',
    pair: 'USD/JPY',
    direction: 'BUY',
    entryPrice: 152.80,
    stopLoss: 152.20,
    takeProfit1: 153.60,
    takeProfit2: 154.20,
    status: 'TARGET_HIT',
    timestamp: 'Yesterday',
    confidence: 85,
    strategy: 'Yield Spread Divergence'
  }
];

export const MOCK_EDUCATION_COURSES: EducationCourse[] = [
  {
    id: 'edu-1',
    title: 'Institutional Forex Foundations',
    level: 'Beginner',
    duration: '4.5 Hours',
    modulesCount: 8,
    description: 'Master bid/ask dynamics, pip calculation, leverage risk, and order mechanics without the jargon.',
    topics: ['What is Forex & FX Market Structure', 'Pips, Lots, and Margin Arithmetic', 'Understanding Spreads and Swaps', 'Executing Market vs Limit Orders']
  },
  {
    id: 'edu-2',
    title: 'Price Action & Liquidity Engineering',
    level: 'Intermediate',
    duration: '6.0 Hours',
    modulesCount: 12,
    description: 'Learn institutional order flow, fair value gaps, liquidity sweeps, and high-probability entry patterns.',
    topics: ['Order Blocks & Market Structure Shifts', 'Fair Value Gaps (FVG) Identification', 'Multi-Timeframe Top-Down Analysis', 'Session Open Liquidity Sweeps']
  },
  {
    id: 'edu-3',
    title: 'Quantitative Risk & Capital Preservation',
    level: 'Advanced',
    duration: '5.0 Hours',
    modulesCount: 9,
    description: 'The mathematics of position sizing, Value-at-Risk (VaR), correlation hedging, and drawdown containment.',
    topics: ['Fixed Fractional Risk Modeling', 'Currency Correlation Matrices', 'Maximum Drawdown Recovery Formulas', 'Risk of Ruin Calculations']
  },
  {
    id: 'edu-4',
    title: 'Central Bank Policy & Macro Forecasting',
    level: 'Institutional',
    duration: '7.5 Hours',
    modulesCount: 14,
    description: 'Decipher interest rate swaps, yield curve inversions, inflation breakevens, and Fed balance sheet shifts.',
    topics: ['Fed, ECB & BoJ Policy Reaction Functions', 'Real Yields vs Currency Valuation', 'Interpreting PCE, CPI & NFP Reports', 'Carry Trade Dynamics']
  }
];

export const MOCK_FAQS = [
  {
    q: 'What is NEXTRADE FX and how does the demo platform work?',
    a: 'NEXTRADE FX is a prototype institutional-grade Forex trading portal. The demo environment lets you trade major currency pairs, commodities, and indices using simulated real-time ticks with zero financial risk. No real capital is ever used.'
  },
  {
    q: 'Are market prices on NEXTRADE FX live or simulated?',
    a: 'All market prices, quotes, and execution fills are SIMULATED in this demo environment. They reflect realistic pricing spreads and pip precision for educational and testing purposes.'
  },
  {
    q: 'What account types are supported in the demo platform?',
    a: 'We offer three simulated account tiers: Standard Demo (from 0.8 pips, zero commission), Raw ECN Demo (raw spreads from 0.0 pips + $3.50 simulated commission per lot), and Institutional Pro Demo (bespoke liquidity simulation, 1:500 max leverage).'
  },
  {
    q: 'How do I place orders on the Trading Terminal?',
    a: 'Navigate to the Trader Dashboard > Trading Terminal. Choose your desired instrument from the Market Watch, set your lot size (from 0.01 micro-lots up to 10.0 standard lots), specify optional Stop Loss or Take Profit targets, and execute Instant Market Buy or Sell.'
  },
  {
    q: 'Can I reset my demo balance if I incur drawdowns?',
    a: 'Yes, inside the Trader Dashboard > Wallet page, you can simulate depositing or resetting your demo funds with a single click at any time.'
  },
  {
    q: 'Can I access the Admin Dashboard to test back-office features?',
    a: 'Yes, click the Admin link in the header or navigate to /admin. You can inspect simulated user records, review KYC submissions, adjust simulated spreads, manage currency pairs, and configure risk parameters.'
  }
];
