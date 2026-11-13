export type AssetCategory = 'forex' | 'commodities' | 'indices' | 'crypto';

export interface CurrencyPair {
  symbol: string;
  name: string;
  category: AssetCategory;
  bid: number;
  ask: number;
  spread: number; // in pips or points
  change24h: number; // percentage
  high24h: number;
  low24h: number;
  pipPrecision: number; // e.g. 5 for EURUSD (0.00001), 3 for USDJPY (0.001)
  pipMultiplier: number; // 10000 for 4/5 digit, 100 for JPY
  lotSize: number; // usually 100,000 for standard forex
  leverageMax: number;
  description: string;
}

export interface CandleData {
  time: number; // timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'low' | 'medium' | 'high';
  actual: string;
  forecast: string;
  previous: string;
  date: string;
}

export interface MarketNewsItem {
  id: string;
  title: string;
  category: 'Forex' | 'Central Banks' | 'Commodities' | 'Global Macro';
  summary: string;
  timestamp: string;
  readTime: string;
  source: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impactPair: string;
}

export interface MarketAnalysisItem {
  id: string;
  title: string;
  pair: string;
  timeframe: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  support: string;
  resistance: string;
  author: string;
  authorRole: string;
  date: string;
  summary: string;
  keyPoints: string[];
}

export interface TradingSignal {
  id: string;
  pair: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  status: 'ACTIVE' | 'TARGET_HIT' | 'STOPPED_OUT' | 'EXPIRED';
  timestamp: string;
  confidence: number; // percentage
  strategy: string;
}

export interface EducationCourse {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Institutional';
  duration: string;
  modulesCount: number;
  description: string;
  topics: string[];
}
