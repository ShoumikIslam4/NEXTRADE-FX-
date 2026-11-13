import { AdminUser, AdminKycSubmission, AdminPairSetting, AdminAuditLog, StaffMember } from '../types/admin';

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'USR-8910',
    name: 'Alexander Wright',
    email: 'a.wright@hedgefund-alpha.com',
    country: 'United Kingdom',
    registeredDate: '2026-09-14',
    kycStatus: 'APPROVED',
    status: 'ACTIVE',
    totalDemoAccounts: 2,
    totalBalanceDemo: 54200.0,
    totalVolumeLots: 142.5,
    phone: '+44 7911 123456',
    ipAddress: '185.122.45.10'
  },
  {
    id: 'USR-8911',
    name: 'Sophia Chen',
    email: 'sophia.chen@pacific-capital.sg',
    country: 'Singapore',
    registeredDate: '2026-10-02',
    kycStatus: 'APPROVED',
    status: 'ACTIVE',
    totalDemoAccounts: 1,
    totalBalanceDemo: 102500.0,
    totalVolumeLots: 310.0,
    phone: '+65 9123 4567',
    ipAddress: '103.24.12.89'
  },
  {
    id: 'USR-8912',
    name: 'Matteo Rossi',
    email: 'm.rossi@milano-fx.it',
    country: 'Italy',
    registeredDate: '2026-10-18',
    kycStatus: 'PENDING',
    status: 'ACTIVE',
    totalDemoAccounts: 1,
    totalBalanceDemo: 10000.0,
    totalVolumeLots: 18.2,
    phone: '+39 02 8765432',
    ipAddress: '93.45.67.12'
  },
  {
    id: 'USR-8913',
    name: 'Julian Larsson',
    email: 'j.larsson@nordic-trade.se',
    country: 'Sweden',
    registeredDate: '2026-10-25',
    kycStatus: 'APPROVED',
    status: 'ACTIVE',
    totalDemoAccounts: 3,
    totalBalanceDemo: 250000.0,
    totalVolumeLots: 840.0,
    phone: '+46 8 123 4567',
    ipAddress: '81.230.12.4'
  },
  {
    id: 'USR-8914',
    name: 'Tariq Al-Mansoor',
    email: 'tariq@gulf-invest.ae',
    country: 'United Arab Emirates',
    registeredDate: '2026-11-01',
    kycStatus: 'PENDING',
    status: 'ACTIVE',
    totalDemoAccounts: 1,
    totalBalanceDemo: 50000.0,
    totalVolumeLots: 45.0,
    phone: '+971 4 321 0000',
    ipAddress: '94.200.15.8'
  },
  {
    id: 'USR-8915',
    name: 'Carlos Mendez',
    email: 'carlos.m@iberian-traders.es',
    country: 'Spain',
    registeredDate: '2026-11-04',
    kycStatus: 'REJECTED',
    status: 'FLAGGED',
    totalDemoAccounts: 1,
    totalBalanceDemo: 1000.0,
    totalVolumeLots: 2.5,
    phone: '+34 91 123 4567',
    ipAddress: '194.224.11.2'
  }
];

export const MOCK_KYC_SUBMISSIONS: AdminKycSubmission[] = [
  {
    id: 'KYC-501',
    userId: 'USR-8912',
    userName: 'Matteo Rossi',
    userEmail: 'm.rossi@milano-fx.it',
    documentType: 'PASSPORT',
    documentNumber: 'IT9928172',
    submittedAt: '2026-11-10 14:22',
    status: 'PENDING',
    riskScore: 'LOW',
    notes: 'High-res biometric page uploaded, face verification match 98%.'
  },
  {
    id: 'KYC-502',
    userId: 'USR-8914',
    userName: 'Tariq Al-Mansoor',
    userEmail: 'tariq@gulf-invest.ae',
    documentType: 'NATIONAL_ID',
    documentNumber: 'ARE-784-1985-1234567',
    submittedAt: '2026-11-11 08:45',
    status: 'PENDING',
    riskScore: 'LOW',
    notes: 'Emirates ID front and reverse submitted.'
  },
  {
    id: 'KYC-503',
    userId: 'USR-8915',
    userName: 'Carlos Mendez',
    userEmail: 'carlos.m@iberian-traders.es',
    documentType: 'DRIVING_LICENSE',
    documentNumber: 'ES-09182374',
    submittedAt: '2026-11-08 19:10',
    status: 'REJECTED',
    riskScore: 'HIGH',
    notes: 'Document expired in 2025; requested updated proof of address.'
  },
  {
    id: 'KYC-504',
    userId: 'USR-8910',
    userName: 'Alexander Wright',
    userEmail: 'a.wright@hedgefund-alpha.com',
    documentType: 'PASSPORT',
    documentNumber: 'GB-554901823',
    submittedAt: '2026-09-14 11:00',
    status: 'APPROVED',
    riskScore: 'LOW',
    notes: 'Fully verified via automated e-KYC provider.'
  }
];

export const MOCK_ADMIN_PAIR_SETTINGS: AdminPairSetting[] = [
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'Forex Major',
    spreadMarkup: 0.1,
    minSpread: 0.08,
    maxLeverage: 500,
    commissionPerLot: 3.5,
    tradingEnabled: true,
    swapLong: -4.2,
    swapShort: 1.8
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'Forex Major',
    spreadMarkup: 0.15,
    minSpread: 0.12,
    maxLeverage: 500,
    commissionPerLot: 3.5,
    tradingEnabled: true,
    swapLong: -5.1,
    swapShort: 2.1
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'Forex Major',
    spreadMarkup: 0.15,
    minSpread: 0.12,
    maxLeverage: 500,
    commissionPerLot: 3.5,
    tradingEnabled: true,
    swapLong: 8.4,
    swapShort: -12.6
  },
  {
    symbol: 'XAU/USD',
    name: 'Spot Gold / USD',
    category: 'Commodities',
    spreadMarkup: 0.25,
    minSpread: 0.2,
    maxLeverage: 200,
    commissionPerLot: 5.0,
    tradingEnabled: true,
    swapLong: -18.5,
    swapShort: 9.2
  },
  {
    symbol: 'US30.cash',
    name: 'Dow Jones 30 Index',
    category: 'Indices',
    spreadMarkup: 1.5,
    minSpread: 1.2,
    maxLeverage: 200,
    commissionPerLot: 0.0,
    tradingEnabled: true,
    swapLong: -9.8,
    swapShort: 3.4
  }
];

export const MOCK_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'LOG-991',
    timestamp: '2026-11-11 19:42:15',
    staffUser: 'admin@nextradefx.internal',
    action: 'SPREAD_ADJUSTMENT',
    targetType: 'CurrencyPair',
    targetId: 'EUR/USD',
    details: 'Lowered raw ECN spread markup from 0.15 to 0.10 pips.',
    ipAddress: '10.0.4.12'
  },
  {
    id: 'LOG-992',
    timestamp: '2026-11-11 18:15:02',
    staffUser: 'compliance@nextradefx.internal',
    action: 'KYC_STATUS_UPDATE',
    targetType: 'KycSubmission',
    targetId: 'KYC-504',
    details: 'Approved Alexander Wright verification after biometric check.',
    ipAddress: '10.0.4.18'
  },
  {
    id: 'LOG-993',
    timestamp: '2026-11-11 16:30:44',
    staffUser: 'risk@nextradefx.internal',
    action: 'LEVERAGE_CAP_APPLIED',
    targetType: 'TradingAccount',
    targetId: 'ACC-10029',
    details: 'Restricted maximum leverage on weekend Gold exposure.',
    ipAddress: '10.0.4.9'
  },
  {
    id: 'LOG-994',
    timestamp: '2026-11-11 14:02:11',
    staffUser: 'admin@nextradefx.internal',
    action: 'SIGNAL_PUBLISHED',
    targetType: 'Signal',
    targetId: 'sig-1',
    details: 'Published EUR/USD 4H long recommendation with 88% confidence score.',
    ipAddress: '10.0.4.12'
  }
];

export const MOCK_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'STF-01',
    name: 'Dominic Sterling',
    email: 'd.sterling@nextradefx.internal',
    role: 'Super Administrator',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastLogin: '2026-11-11 20:10'
  },
  {
    id: 'STF-02',
    name: 'Helena Berg',
    email: 'h.berg@nextradefx.internal',
    role: 'Risk Manager',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastLogin: '2026-11-11 19:45'
  },
  {
    id: 'STF-03',
    name: 'Farhan Zaidi',
    email: 'f.zaidi@nextradefx.internal',
    role: 'Compliance Officer',
    status: 'ACTIVE',
    twoFactorEnabled: true,
    lastLogin: '2026-11-11 18:20'
  },
  {
    id: 'STF-04',
    name: 'Sarah Jenkins',
    email: 's.jenkins@nextradefx.internal',
    role: 'Support Agent',
    status: 'ACTIVE',
    twoFactorEnabled: false,
    lastLogin: '2026-11-11 16:05'
  }
];
