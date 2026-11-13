import { CurrencyPair } from '../types/market';
import { Position, PendingOrder, OrderSide, OrderType, TradingAccount } from '../types/trading';

/**
 * Institutional calculation engine for NEXTRADE FX.
 * Supports distinct instrument categories (Forex majors, crosses, metals, energies, indices).
 */

export const parseLeverageRatio = (leverageStr: string): number => {
  const parts = leverageStr.split(':');
  if (parts.length === 2) {
    const val = parseFloat(parts[1]);
    if (!isNaN(val) && val > 0) return val;
  }
  return 500; // fallback to 1:500
};

/**
 * Calculate margin requirement according to asset class specifications.
 */
export const calculateMarginRequired = (
  pair: CurrencyPair,
  lots: number,
  executionPrice: number,
  leverageStr: string
): number => {
  const leverage = parseLeverageRatio(leverageStr);

  switch (pair.category) {
    case 'forex': {
      // If pair is USD/JPY, USD/CAD, USD/CHF (base currency is USD)
      if (pair.symbol.startsWith('USD/')) {
        // Margin = (lots * 100,000 USD) / leverage
        return Number(((lots * 100000) / leverage).toFixed(2));
      }
      // If base currency is EUR, GBP, AUD, etc. (quoted in USD)
      // Margin = (lots * 100,000 * executionPrice) / leverage
      return Number(((lots * (pair.lotSize || 100000) * executionPrice) / leverage).toFixed(2));
    }

    case 'commodities': {
      // Metals & Energies
      // XAU/USD (100 oz): margin = (lots * 100 * price) / leverage
      // XAG/USD (5000 oz): margin = (lots * 5000 * price) / leverage
      // USOIL (1000 bbl): margin = (lots * 1000 * price) / leverage
      const contractSize = pair.lotSize || 100;
      return Number(((lots * contractSize * executionPrice) / leverage).toFixed(2));
    }

    case 'indices': {
      // US30, NAS100, GER40
      // Margin = (lots * contractSize * indexPrice) / leverage
      const contractSize = pair.lotSize || 1;
      return Number(((lots * contractSize * executionPrice) / leverage).toFixed(2));
    }

    default:
      return Number(((lots * (pair.lotSize || 100000) * executionPrice) / leverage).toFixed(2));
  }
};

/**
 * Calculate floating P/L and pips according to instrument-specific contract specifications.
 */
export const calculateFloatingPnL = (
  pos: Position,
  pair: CurrencyPair,
  bid: number,
  ask: number
): { currentPrice: number; pips: number; floatingProfit: number } => {
  const currentPrice = pos.side === 'BUY' ? bid : ask;
  const rawDiff = pos.side === 'BUY' ? (currentPrice - pos.openPrice) : (pos.openPrice - currentPrice);

  let pips = Number((rawDiff * pair.pipMultiplier).toFixed(1));
  let floatingProfit = 0;

  if (pair.category === 'forex') {
    if (pair.symbol.startsWith('USD/')) {
      // Quote currency is not USD (e.g., USD/JPY, USD/CAD, USD/CHF)
      // Profit in USD = (Price Difference / Current Price) * lots * Contract Size
      floatingProfit = Number(((rawDiff / (currentPrice || 1)) * pos.lots * (pair.lotSize || 100000)).toFixed(2));
    } else {
      // Quote currency is USD (e.g., EUR/USD, GBP/USD, AUD/USD, NZD/USD)
      // Profit in USD = Price Difference * lots * Contract Size
      floatingProfit = Number((rawDiff * pos.lots * (pair.lotSize || 100000)).toFixed(2));
    }
  } else if (pair.category === 'commodities') {
    // Spot Gold ($/oz * 100 oz/lot), Silver ($/oz * 5000 oz/lot), Crude Oil ($/bbl * 1000 bbl/lot)
    const contractSize = pair.lotSize || 100;
    floatingProfit = Number((rawDiff * pos.lots * contractSize).toFixed(2));
  } else if (pair.category === 'indices') {
    // Index points * point value per lot
    const pointValue = pair.lotSize || 1;
    floatingProfit = Number((rawDiff * pos.lots * pointValue).toFixed(2));
  } else {
    floatingProfit = Number((rawDiff * pos.lots * (pair.lotSize || 100000)).toFixed(2));
  }

  return {
    currentPrice,
    pips,
    floatingProfit
  };
};

/**
 * Validate order params before opening a trade.
 */
export interface OrderValidationResult {
  valid: boolean;
  error?: string;
  marginReq?: number;
}

export const validateOrderParams = (
  symbol: string,
  side: OrderSide,
  type: OrderType,
  lots: number,
  pair: CurrencyPair,
  account: TradingAccount,
  targetPrice?: number,
  stopLoss?: number,
  takeProfit?: number
): OrderValidationResult => {
  if (account.mode === 'LIVE') {
    return {
      valid: false,
      error: 'Live Trading Unavailable: Live account onboarding is pending broker integration and regulatory compliance. Use Demo Account to practice.'
    };
  }

  if (lots < 0.01) {
    return { valid: false, error: 'Minimum trade volume is 0.01 lots.' };
  }

  if (lots > 20.0) {
    return { valid: false, error: 'Maximum single trade volume is 20.00 lots.' };
  }

  const executionPrice = side === 'BUY' ? pair.ask : pair.bid;
  const marginReq = calculateMarginRequired(pair, lots, executionPrice, account.leverage);

  if (type === 'MARKET') {
    if (account.freeMargin < marginReq) {
      return {
        valid: false,
        error: `Insufficient demo free margin. Required: $${marginReq.toFixed(2)}, Available: $${account.freeMargin.toFixed(2)} USD.`
      };
    }
  }

  // Validate SL and TP
  if (stopLoss !== undefined && stopLoss > 0) {
    if (side === 'BUY' && stopLoss >= executionPrice) {
      return { valid: false, error: 'For BUY positions, Stop Loss must be set below current ask price.' };
    }
    if (side === 'SELL' && stopLoss <= executionPrice) {
      return { valid: false, error: 'For SELL positions, Stop Loss must be set above current bid price.' };
    }
  }

  if (takeProfit !== undefined && takeProfit > 0) {
    if (side === 'BUY' && takeProfit <= executionPrice) {
      return { valid: false, error: 'For BUY positions, Take Profit must be set above current ask price.' };
    }
    if (side === 'SELL' && takeProfit >= executionPrice) {
      return { valid: false, error: 'For SELL positions, Take Profit must be set below current bid price.' };
    }
  }

  // Pending order price validation
  if (type !== 'MARKET' && targetPrice !== undefined) {
    if (targetPrice <= 0) {
      return { valid: false, error: 'Target price must be greater than zero.' };
    }
    if (type === 'LIMIT') {
      if (side === 'BUY' && targetPrice >= pair.ask) {
        return { valid: false, error: 'Buy Limit price must be lower than the current ask price.' };
      }
      if (side === 'SELL' && targetPrice <= pair.bid) {
        return { valid: false, error: 'Sell Limit price must be higher than the current bid price.' };
      }
    }
    if (type === 'STOP') {
      if (side === 'BUY' && targetPrice <= pair.ask) {
        return { valid: false, error: 'Buy Stop price must be higher than the current ask price.' };
      }
      if (side === 'SELL' && targetPrice >= pair.bid) {
        return { valid: false, error: 'Sell Stop price must be lower than the current bid price.' };
      }
    }
  }

  return { valid: true, marginReq };
};

/**
 * Check if a pending order should trigger given updated bid/ask quotes.
 */
export const checkPendingTrigger = (order: PendingOrder, pair: CurrencyPair): boolean => {
  if (order.status !== 'PENDING') return false;

  if (order.type === 'LIMIT') {
    if (order.side === 'BUY' && pair.ask <= order.targetPrice) return true;
    if (order.side === 'SELL' && pair.bid >= order.targetPrice) return true;
  }

  if (order.type === 'STOP') {
    if (order.side === 'BUY' && pair.ask >= order.targetPrice) return true;
    if (order.side === 'SELL' && pair.bid <= order.targetPrice) return true;
  }

  return false;
};

/**
 * Check if an open position triggered its Stop Loss or Take Profit.
 */
export const checkPositionExitTrigger = (
  pos: Position,
  pair: CurrencyPair
): { hit: boolean; reason?: 'Stop Loss Hit' | 'Take Profit Hit'; exitPrice?: number } => {
  if (pos.side === 'BUY') {
    if (pos.stopLoss && pair.bid <= pos.stopLoss) {
      return { hit: true, reason: 'Stop Loss Hit', exitPrice: pos.stopLoss };
    }
    if (pos.takeProfit && pair.bid >= pos.takeProfit) {
      return { hit: true, reason: 'Take Profit Hit', exitPrice: pos.takeProfit };
    }
  }

  if (pos.side === 'SELL') {
    if (pos.stopLoss && pair.ask >= pos.stopLoss) {
      return { hit: true, reason: 'Stop Loss Hit', exitPrice: pos.stopLoss };
    }
    if (pos.takeProfit && pair.ask <= pos.takeProfit) {
      return { hit: true, reason: 'Take Profit Hit', exitPrice: pos.takeProfit };
    }
  }

  return { hit: false };
};
