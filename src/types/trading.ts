export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP';
export type PositionStatus = 'OPEN' | 'CLOSED';
export type PendingOrderStatus = 'PENDING' | 'TRIGGERED' | 'CANCELLED';

export interface Position {
  id: string;
  accountId?: string;
  symbol: string;
  side: OrderSide;
  lots: number;
  openPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  floatingProfit: number; // floating P/L in USD (DEMO)
  pips: number;
  openTime: string;
  marginUsed: number;
  swap: number;
  commission: number;
}

export interface PendingOrder {
  id: string;
  accountId?: string;
  symbol: string;
  type: OrderType;
  side: OrderSide;
  lots: number;
  targetPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  placedTime: string;
  status: PendingOrderStatus;
}

export interface TradeHistoryItem {
  id: string;
  accountId?: string;
  symbol: string;
  side: OrderSide;
  lots: number;
  openPrice: number;
  closePrice: number;
  openTime: string;
  closeTime: string;
  pips: number;
  profit: number; // realized P/L in USD (DEMO)
  reason: 'Manual Close' | 'Take Profit Hit' | 'Stop Loss Hit';
}

export type AccountMode = 'DEMO' | 'LIVE';
export type LiveApplicationStatus = 'NOT_APPLIED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'DOCS_REQUESTED' | 'APPROVED_PENDING_BROKER' | 'REJECTED';

export interface TradingAccount {
  id: string;
  accountNumber: string;
  mode: AccountMode;
  type: string;
  server: string;
  leverage: string;
  currency: 'USD';
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number; // percentage
  floatingProfit: number;
  isPrimary: boolean;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'RESTRICTED';
  initialBalance: number; // For demo: strictly 1,000 USD
  createdAt?: string;
}

export interface LiveApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  employmentStatus: string;
  annualIncome: string;
  tradingExperience: string;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
  idType: 'Passport' | 'National ID' | 'Driver License';
  idNumber: string;
  proofOfAddress: string;
  status: LiveApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  brokerConnectivity: 'UNAVAILABLE_PENDING_BROKER_INTEGRATION';
}

export interface WalletTransaction {
  id: string;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INTERNAL_TRANSFER' | 'CREDIT_BONUS' | 'RESET';
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING' | 'REJECTED';
  method: string;
  reference: string;
  accountNumber: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'Trading Execution' | 'Platform & Technical' | 'Account Verification' | 'Billing & Transfer';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  lastReply: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'support';
    name: string;
    text: string;
    timestamp: string;
  }>;
}
