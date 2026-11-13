export interface AdminUser {
  id: string;
  name: string;
  email: string;
  country: string;
  registeredDate: string;
  kycStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'UNSUBMITTED';
  status: 'ACTIVE' | 'SUSPENDED' | 'FLAGGED';
  totalDemoAccounts: number;
  totalBalanceDemo: number;
  totalVolumeLots: number;
  phone: string;
  ipAddress: string;
}

export interface AdminKycSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  documentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID';
  documentNumber: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
}

export interface AdminPairSetting {
  symbol: string;
  name: string;
  category: string;
  spreadMarkup: number; // in pips
  minSpread: number;
  maxLeverage: number;
  commissionPerLot: number;
  tradingEnabled: boolean;
  swapLong: number;
  swapShort: number;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  staffUser: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string;
}

export type SystemRoleType = 
  | 'SUPER_ADMIN' 
  | 'FINANCE_ADMIN' 
  | 'KYC_MANAGER' 
  | 'CUSTOMER_SUPPORT' 
  | 'TRADING_MANAGER' 
  | 'CONTENT_MANAGER' 
  | 'CUSTOM_ROLE';

export type PermissionCategory = 
  | 'Dashboard' 
  | 'Users' 
  | 'Staff' 
  | 'Roles' 
  | 'Accounts' 
  | 'KYC' 
  | 'Deposits' 
  | 'Withdrawals' 
  | 'Payment Methods' 
  | 'Trading' 
  | 'Markets' 
  | 'Reports' 
  | 'CMS' 
  | 'Website Settings' 
  | 'Notifications' 
  | 'Support' 
  | 'Security' 
  | 'Audit Logs';

export interface StaffRecord {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  department: 'Executive' | 'Finance' | 'Compliance' | 'Dealing Desk' | 'Support' | 'IT / Security' | 'Marketing';
  jobTitle: string;
  assignedRole: SystemRoleType | string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  permissions: PermissionCategory[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleRecord {
  id: string;
  name: string;
  roleKey: SystemRoleType | string;
  description: string;
  isSystem: boolean;
  permissions: PermissionCategory[];
  userCount: number;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  twoFactorEnabled: boolean;
  lastLogin: string;
}
