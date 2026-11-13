import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

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
  staffId: string; // e.g. NX-STF-001
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
  isSystem: boolean; // System roles cannot be deleted
  permissions: PermissionCategory[];
  userCount: number;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: 'USER' | SystemRoleType;
  isEmailVerified: boolean;
  isActive: boolean;
  country?: string;
  phone?: string;
  kycStatus: 'UNSUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED';
  kycDocumentType?: string;
  kycDocumentNumber?: string;
  kycDocumentFileName?: string;
  kycSubmittedAt?: string;
  kycNotes?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: number; // Unix timestamp ms
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface DepositRequestRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  method: 'bKash' | 'Nagad' | 'Rocket';
  senderNumber: string;
  transactionId: string;
  amountBDT: number;
  rateBDTPerUSD: number;
  amountUSD: number;
  feePercent?: number;
  feeBDT?: number;
  feeUSD?: number;
  netUSD?: number;
  paymentProofName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  processedAt?: string;
}

export interface PaymentMethodConfig {
  id: string;
  method: 'bKash' | 'Nagad' | 'Rocket';
  accountNumber: string;
  accountType: string;
  instructions: string;
  feePercent: number;
  minUSD: number;
  isActive: boolean;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'KYC' | 'DEPOSIT' | 'TRADING' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface PasswordResetTokenRecord {
  token: string;
  userId: string;
  expiresAt: number;
  used: boolean;
}

export interface TradingAccountRecord {
  id: string;
  userId: string;
  accountNumber: string;
  mode: 'DEMO' | 'LIVE';
  type: string;
  server: string;
  leverage: string;
  currency: string;
  initialBalance: number;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  floatingProfit: number;
  isPrimary: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  staff: StaffRecord[];
  roles: RoleRecord[];
  sessions: SessionRecord[];
  depositRequests: DepositRequestRecord[];
  paymentMethods: PaymentMethodConfig[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogRecord[];
  passwordResetTokens: PasswordResetTokenRecord[];
  tradingAccounts: TradingAccountRecord[];
  bdtRatePerUSD: number;
}

const DB_FILE = path.resolve(process.cwd(), 'data', 'nextrade_db.json');

class DatabaseService {
  private data: DatabaseSchema = {
    users: [],
    staff: [],
    roles: [],
    sessions: [],
    depositRequests: [],
    paymentMethods: [],
    notifications: [],
    auditLogs: [],
    passwordResetTokens: [],
    tradingAccounts: [],
    bdtRatePerUSD: 122.50
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.data,
          ...parsed,
          staff: parsed.staff || [],
          roles: parsed.roles || [],
          depositRequests: parsed.depositRequests || [],
          paymentMethods: parsed.paymentMethods || [],
          notifications: parsed.notifications || [],
          bdtRatePerUSD: parsed.bdtRatePerUSD || 122.50
        };
        // Normalize users to have kycStatus if missing
        this.data.users.forEach(u => {
          if (!u.kycStatus) {
            u.kycStatus = u.role === 'SUPER_ADMIN' ? 'APPROVED' : 'UNSUBMITTED';
          }
          if (!u.phone) {
            u.phone = '+880 1712-345678';
          }
        });
      } else {
        this.bootstrap();
        this.save();
      }

      // Ensure roles and staff are populated if empty
      if (!this.data.roles || this.data.roles.length === 0) {
        this.seedRolesAndStaff();
        this.save();
      }
      this.ensureStaffUsersSynced();

      // Ensure payment methods are seeded
      if (!this.data.paymentMethods || this.data.paymentMethods.length === 0) {
        this.seedPaymentMethods();
        this.save();
      }
    } catch (err) {
      console.error('[DB] Failed to load database file, creating fresh store', err);
      this.bootstrap();
      this.save();
    }
  }

  private seedPaymentMethods() {
    this.data.paymentMethods = [
      {
        id: 'pm_bkash',
        method: 'bKash',
        accountNumber: '01712-345678',
        accountType: 'bKash Merchant / Cash Out (Personal & Agent)',
        instructions: 'Open your bKash app -> Select Send Money or Cash Out -> Transfer exact BDT amount -> Copy SMS TrxID and attach payment screenshot/proof.',
        feePercent: 0,
        minUSD: 10,
        isActive: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'pm_nagad',
        method: 'Nagad',
        accountNumber: '01812-345678',
        accountType: 'Nagad Merchant / Send Money (Personal & Agent)',
        instructions: 'Open your Nagad app -> Select Send Money or Merchant Pay -> Transfer exact BDT amount -> Copy SMS TrxID and attach payment screenshot/proof.',
        feePercent: 0,
        minUSD: 10,
        isActive: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'pm_rocket',
        method: 'Rocket',
        accountNumber: '01912-345678-9',
        accountType: 'DBBL Rocket Agent / Send Money (*322#)',
        instructions: 'Open DBBL Rocket app or dial *322# -> Send Money to agent number -> Copy SMS TrxID and attach payment screenshot/proof.',
        feePercent: 0,
        minUSD: 10,
        isActive: true,
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private seedRolesAndStaff() {
    const allPermissions: PermissionCategory[] = [
      'Dashboard', 'Users', 'Staff', 'Roles', 'Accounts', 'KYC', 
      'Deposits', 'Withdrawals', 'Payment Methods', 'Trading', 
      'Markets', 'Reports', 'CMS', 'Website Settings', 
      'Notifications', 'Support', 'Security', 'Audit Logs'
    ];

    const defaultRoles: RoleRecord[] = [
      {
        id: 'role_super_admin',
        name: 'Super Administrator',
        roleKey: 'SUPER_ADMIN',
        description: 'Complete unrestricted platform administration, security management, staff and financial control.',
        isSystem: true,
        permissions: allPermissions,
        userCount: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: 'role_finance_admin',
        name: 'Finance Admin',
        roleKey: 'FINANCE_ADMIN',
        description: 'Deposit approval, payment verification, transaction monitoring, financial ledgers, and funding records.',
        isSystem: true,
        permissions: ['Dashboard', 'Deposits', 'Withdrawals', 'Payment Methods', 'Reports', 'Accounts'],
        userCount: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: 'role_kyc_manager',
        name: 'KYC & Compliance Manager',
        roleKey: 'KYC_MANAGER',
        description: 'Review KYC applications, verify national ID/passports, approve/reject verifications, and request additional documents.',
        isSystem: true,
        permissions: ['Dashboard', 'KYC', 'Users', 'Reports', 'Audit Logs'],
        userCount: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: 'role_customer_support',
        name: 'Customer Support Lead',
        roleKey: 'CUSTOMER_SUPPORT',
        description: 'View user profiles and account statuses, manage support tickets, reply to customer inquiries.',
        isSystem: true,
        permissions: ['Dashboard', 'Support', 'Users', 'Accounts', 'Notifications'],
        userCount: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: 'role_trading_manager',
        name: 'Trading & Dealing Manager',
        roleKey: 'TRADING_MANAGER',
        description: 'Monitor trading accounts, open positions, order books, instrument availability, and trading reports.',
        isSystem: true,
        permissions: ['Dashboard', 'Trading', 'Markets', 'Accounts', 'Reports'],
        userCount: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: 'role_content_manager',
        name: 'Content & CMS Manager',
        roleKey: 'CONTENT_MANAGER',
        description: 'Manage website pages, banners, announcements, news, FAQs, educational content, and navigation.',
        isSystem: true,
        permissions: ['Dashboard', 'CMS', 'Markets', 'Website Settings', 'Notifications'],
        userCount: 1,
        createdAt: new Date().toISOString()
      }
    ];

    this.data.roles = defaultRoles;

    if (!this.data.staff || this.data.staff.length === 0) {
      this.data.staff = [
        {
          id: 'stf_001',
          staffId: 'NX-STF-001',
          name: 'Soumik Sarkar',
          email: 'info.soumik@gmail.com',
          phone: '+880 1819-223344',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          department: 'Executive',
          jobTitle: 'Chief Executive & Principal Architect',
          assignedRole: 'SUPER_ADMIN',
          status: 'ACTIVE',
          permissions: allPermissions,
          lastLogin: new Date().toISOString(),
          createdAt: '2026-01-10T08:00:00Z',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'stf_002',
          staffId: 'NX-STF-002',
          name: 'Tariq Rahman',
          email: 'tariq.finance@nextrade.io',
          phone: '+880 1711-987654',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
          department: 'Finance',
          jobTitle: 'Head of Treasury & Settlement',
          assignedRole: 'FINANCE_ADMIN',
          status: 'ACTIVE',
          permissions: ['Dashboard', 'Deposits', 'Withdrawals', 'Payment Methods', 'Reports', 'Accounts'],
          lastLogin: '2026-11-12T00:45:00Z',
          createdAt: '2026-02-15T09:30:00Z',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'stf_003',
          staffId: 'NX-STF-003',
          name: 'Anika Tabassum',
          email: 'anika.kyc@nextrade.io',
          phone: '+880 1912-334455',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
          department: 'Compliance',
          jobTitle: 'Compliance & AML Verification Manager',
          assignedRole: 'KYC_MANAGER',
          status: 'ACTIVE',
          permissions: ['Dashboard', 'KYC', 'Users', 'Reports', 'Audit Logs'],
          lastLogin: '2026-11-11T22:15:00Z',
          createdAt: '2026-03-01T10:00:00Z',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'stf_004',
          staffId: 'NX-STF-004',
          name: 'Farhan Ahmed',
          email: 'farhan.desk@nextrade.io',
          phone: '+880 1610-887766',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
          department: 'Dealing Desk',
          jobTitle: 'Senior Risk & Liquidity Specialist',
          assignedRole: 'TRADING_MANAGER',
          status: 'ACTIVE',
          permissions: ['Dashboard', 'Trading', 'Markets', 'Accounts', 'Reports'],
          lastLogin: '2026-11-12T01:10:00Z',
          createdAt: '2026-03-12T11:00:00Z',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'stf_005',
          staffId: 'NX-STF-005',
          name: 'Sadia Chowdhury',
          email: 'sadia.support@nextrade.io',
          phone: '+880 1722-112233',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
          department: 'Support',
          jobTitle: 'Senior Customer Support Representative',
          assignedRole: 'CUSTOMER_SUPPORT',
          status: 'ACTIVE',
          permissions: ['Dashboard', 'Support', 'Users', 'Accounts', 'Notifications'],
          lastLogin: '2026-11-11T19:30:00Z',
          createdAt: '2026-04-05T08:00:00Z',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'stf_006',
          staffId: 'NX-STF-006',
          name: 'Kamal Hossain',
          email: 'kamal.content@nextrade.io',
          phone: '+880 1833-445566',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
          department: 'Marketing',
          jobTitle: 'Content & Education Portal Lead',
          assignedRole: 'CONTENT_MANAGER',
          status: 'ACTIVE',
          permissions: ['Dashboard', 'CMS', 'Markets', 'Website Settings', 'Notifications'],
          lastLogin: '2026-11-10T14:20:00Z',
          createdAt: '2026-05-18T12:00:00Z',
          updatedAt: new Date().toISOString()
        }
      ];
    }
  }

  private ensureStaffUsersSynced() {
    if (!this.data.staff || this.data.staff.length === 0) return;
    let changed = false;
    const defaultStaffHash = bcrypt.hashSync('StaffSecure2026!', 10);

    for (const s of this.data.staff) {
      const normalizedEmail = s.email.toLowerCase().trim();
      const existing = this.findUserByEmail(normalizedEmail);
      if (!existing) {
        this.data.users.push({
          id: `usr_${s.id}`,
          fullName: s.name,
          email: normalizedEmail,
          passwordHash: defaultStaffHash,
          role: s.assignedRole as any,
          isEmailVerified: true,
          isActive: s.status === 'ACTIVE',
          country: 'Bangladesh',
          phone: s.phone || '+880 1700-000000',
          kycStatus: 'APPROVED',
          createdAt: s.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        changed = true;
      } else if (existing.role !== s.assignedRole || existing.isActive !== (s.status === 'ACTIVE')) {
        existing.role = s.assignedRole as any;
        existing.isActive = s.status === 'ACTIVE';
        existing.updatedAt = new Date().toISOString();
        changed = true;
      }
    }

    if (changed) {
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to persist database', err);
    }
  }

  public bootstrap() {
    const adminEmails = [
      (process.env.ADMIN_EMAIL || 'info.soumik@gmail.com').toLowerCase().trim(),
      'info.soumikk@gmail.com'
    ];

    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'SuperAdmin#Nextrade2026!';
    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(initialPassword, salt);

    adminEmails.forEach((email, idx) => {
      const existing = this.data.users.find(u => u.email.toLowerCase() === email);
      if (!existing) {
        const adminUser: UserRecord = {
          id: `usr_superadmin_0${idx + 1}`,
          fullName: 'Super Administrator',
          email,
          passwordHash: hash,
          role: 'SUPER_ADMIN',
          isEmailVerified: true,
          isActive: true,
          country: 'Bangladesh',
          phone: '+880 1819-223344',
          kycStatus: 'APPROVED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.data.users.push(adminUser);
      }
    });

    // Seed Demo User account for standard simulation user
    const demoEmail = 'alex.wright@nextrade.io';
    const existingDemo = this.data.users.find(u => u.email.toLowerCase() === demoEmail);
    if (!existingDemo) {
      const userSalt = bcrypt.genSaltSync(10);
      const userHash = bcrypt.hashSync('TraderPass2026!', userSalt);
      const demoUser: UserRecord = {
        id: 'usr_demo_trader_01',
        fullName: 'Alex Wright',
        email: demoEmail,
        passwordHash: userHash,
        role: 'USER',
        isEmailVerified: true,
        isActive: true,
        country: 'Bangladesh',
        phone: '+880 1712-889900',
        kycStatus: 'APPROVED', // Pre-approved demo
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.data.users.push(demoUser);

      this.data.tradingAccounts.push({
        id: 'acc-demo-1',
        userId: demoUser.id,
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
        createdAt: new Date().toISOString()
      });
    }
  }

  // Rate USD/BDT
  public getBdtRate(): number {
    return this.data.bdtRatePerUSD || 122.50;
  }

  public setBdtRate(rate: number): void {
    this.data.bdtRatePerUSD = rate;
    this.save();
  }

  // User Operations
  public findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getAllUsers(): Omit<UserRecord, 'passwordHash'>[] {
    return this.data.users.map(({ passwordHash, ...rest }) => rest);
  }

  public createUser(userData: {
    fullName: string;
    email: string;
    passwordHash: string;
    phone?: string;
  }): UserRecord {
    const user: UserRecord = {
      id: 'usr_' + crypto.randomUUID(),
      fullName: userData.fullName.trim(),
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      role: 'USER',
      isEmailVerified: true,
      isActive: true,
      country: 'Bangladesh',
      phone: userData.phone || '+880 1700-000000',
      kycStatus: 'UNSUBMITTED', // Must submit KYC to trade
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.users.push(user);

    // Initial demo trading account ($1,000 USD virtual balance)
    const accNum = 'NX-DEMO-' + Math.floor(100000 + Math.random() * 900000);
    this.data.tradingAccounts.push({
      id: 'acc_' + crypto.randomUUID(),
      userId: user.id,
      accountNumber: accNum,
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
      createdAt: new Date().toISOString()
    });

    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return undefined;

    if (updates.role && updates.role !== user.role) {
      throw new Error('Direct role modification is prohibited.');
    }

    Object.assign(user, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    this.save();
    return user;
  }

  // KYC Submission & Review
  public submitKyc(userId: string, data: {
    documentType: string;
    documentNumber: string;
    fileName?: string;
  }): UserRecord | undefined {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return undefined;

    user.kycStatus = 'PENDING';
    user.kycDocumentType = data.documentType;
    user.kycDocumentNumber = data.documentNumber;
    user.kycDocumentFileName = data.fileName || 'national_id_document.pdf';
    user.kycSubmittedAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    this.save();
    return user;
  }

  public reviewKyc(userId: string, status: 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED', notes?: string): UserRecord | undefined {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return undefined;

    user.kycStatus = status;
    user.kycNotes = notes;
    user.updatedAt = new Date().toISOString();

    // If KYC approved, automatically provision or activate Live Trading Account
    if (status === 'APPROVED') {
      let liveAcc = this.data.tradingAccounts.find(a => a.userId === userId && a.mode === 'LIVE');
      if (!liveAcc) {
        liveAcc = {
          id: 'acc_live_' + crypto.randomUUID().slice(0, 8),
          userId: user.id,
          accountNumber: 'NX-LIVE-' + Math.floor(10000 + Math.random() * 90000),
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
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        };
        this.data.tradingAccounts.push(liveAcc);
      } else {
        liveAcc.status = 'ACTIVE';
      }
      this.addNotification(
        userId,
        'KYC Verified & Live Account Activated',
        'Your identity documents were approved. Your Live Trading Account is now activated for Add Funds onboarding (live order execution remains pending authorized broker connectivity).',
        'KYC'
      );
    } else if (status === 'ADDITIONAL_INFO_REQUIRED') {
      this.addNotification(
        userId,
        'Additional KYC Documents Requested',
        notes || 'Compliance requires an updated or clearer identity document to verify your Live Account.',
        'KYC'
      );
    } else {
      this.addNotification(
        userId,
        'KYC Verification Rejected',
        notes || 'Your submitted KYC verification was rejected. Please re-submit clear identity documentation.',
        'KYC'
      );
    }

    this.save();
    return user;
  }

  // Notifications
  public addNotification(
    userId: string,
    title: string,
    message: string,
    category: NotificationRecord['category']
  ): NotificationRecord {
    const notif: NotificationRecord = {
      id: 'ntf_' + crypto.randomUUID().slice(0, 8),
      userId,
      title,
      message,
      category,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    if (this.data.notifications.length > 1000) {
      this.data.notifications = this.data.notifications.slice(0, 1000);
    }
    this.save();
    return notif;
  }

  public getUserNotifications(userId: string): NotificationRecord[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  public markNotificationsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  // Payment Methods Configuration (bKash, Nagad, Rocket)
  public getPaymentMethods(): PaymentMethodConfig[] {
    return this.data.paymentMethods;
  }

  public getActivePaymentMethods(): PaymentMethodConfig[] {
    return this.data.paymentMethods.filter(m => m.isActive);
  }

  public updatePaymentMethod(id: string, updates: Partial<PaymentMethodConfig>): PaymentMethodConfig | undefined {
    const pm = this.data.paymentMethods.find(m => m.id === id || m.method === id);
    if (!pm) return undefined;
    Object.assign(pm, {
      ...updates,
      minUSD: Math.max(10, Number(updates.minUSD ?? pm.minUSD)),
      feePercent: Math.max(0, Number(updates.feePercent ?? pm.feePercent)),
      updatedAt: new Date().toISOString()
    });
    this.save();
    return pm;
  }

  // Mobile Banking Deposits (bKash, Nagad, Rocket)
  public createDepositRequest(userId: string, data: {
    method: 'bKash' | 'Nagad' | 'Rocket';
    senderNumber: string;
    transactionId: string;
    amountBDT: number;
    paymentProofName?: string;
  }): DepositRequestRecord {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    const pm = this.data.paymentMethods.find(m => m.method === data.method);
    if (pm && !pm.isActive) {
      throw new Error(`${data.method} gateway is currently disabled by administrator.`);
    }

    const rate = this.getBdtRate();
    const amountUSD = Number((data.amountBDT / rate).toFixed(2));
    const minUSD = pm?.minUSD || 10;

    if (amountUSD < minUSD) {
      throw new Error(`Minimum deposit amount is $${minUSD} USD equivalent (৳${Math.ceil(rate * minUSD)} BDT).`);
    }

    const feePercent = pm?.feePercent || 0;
    const feeBDT = Number(((data.amountBDT * feePercent) / 100).toFixed(2));
    const feeUSD = Number(((amountUSD * feePercent) / 100).toFixed(2));
    const netUSD = Number((amountUSD - feeUSD).toFixed(2));

    const deposit: DepositRequestRecord = {
      id: 'DEP-' + Math.floor(100000 + Math.random() * 900000),
      userId,
      userEmail: user.email,
      userName: user.fullName,
      method: data.method,
      senderNumber: data.senderNumber,
      transactionId: data.transactionId.toUpperCase().trim(),
      amountBDT: data.amountBDT,
      rateBDTPerUSD: rate,
      amountUSD,
      feePercent,
      feeBDT,
      feeUSD,
      netUSD,
      paymentProofName: data.paymentProofName,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.data.depositRequests.unshift(deposit);
    this.addNotification(
      userId,
      `Deposit Request Submitted (${deposit.id})`,
      `Your ${deposit.method} deposit of ৳${deposit.amountBDT.toLocaleString()} BDT ($${deposit.netUSD?.toFixed(2)} USD net) is pending Finance review. Your Live account ledger will only be credited upon verified approval.`,
      'DEPOSIT'
    );
    this.save();
    return deposit;
  }

  public getDepositRequests(): DepositRequestRecord[] {
    return this.data.depositRequests;
  }

  public getUserDepositRequests(userId: string): DepositRequestRecord[] {
    return this.data.depositRequests.filter(d => d.userId === userId);
  }

  public reviewDeposit(depositId: string, status: 'APPROVED' | 'REJECTED', adminNotes?: string, reviewedBy?: string): DepositRequestRecord | undefined {
    const dep = this.data.depositRequests.find(d => d.id === depositId);
    if (!dep) return undefined;
    if (dep.status !== 'PENDING') {
      throw new Error(`Deposit #${depositId} has already been processed (${dep.status}).`);
    }

    if (status === 'APPROVED') {
      const user = this.data.users.find(u => u.id === dep.userId);
      if (!user || (user.kycStatus !== 'APPROVED' && user.role !== 'SUPER_ADMIN')) {
        throw new Error('Cannot approve deposit: Trader KYC verification is not yet approved for a Live Account.');
      }

      const liveAcc = this.data.tradingAccounts.find(a => a.userId === dep.userId && a.mode === 'LIVE');
      if (!liveAcc || liveAcc.status !== 'ACTIVE') {
        throw new Error('Cannot approve deposit: User does not have an active eligible Live Trading Account.');
      }

      const creditAmount = dep.netUSD ?? dep.amountUSD;
      liveAcc.balance = Number((liveAcc.balance + creditAmount).toFixed(2));
      liveAcc.equity = Number((liveAcc.equity + creditAmount).toFixed(2));
      liveAcc.freeMargin = Number((liveAcc.freeMargin + creditAmount).toFixed(2));

      this.addNotification(
        dep.userId,
        `Deposit Approved (+$${creditAmount.toFixed(2)} USD)`,
        `Your ${dep.method} deposit (${dep.id}, TrxID ${dep.transactionId}) has been verified and credited to Live Account #${liveAcc.accountNumber}.`,
        'DEPOSIT'
      );
    } else {
      this.addNotification(
        dep.userId,
        `Deposit Rejected (${dep.id})`,
        `Your ${dep.method} deposit of ৳${dep.amountBDT.toLocaleString()} BDT was rejected. Reason: ${adminNotes || 'Transaction verification failed.'}`,
        'DEPOSIT'
      );
    }

    dep.status = status;
    dep.adminNotes = adminNotes;
    dep.reviewedBy = reviewedBy;
    dep.processedAt = new Date().toISOString();

    this.save();
    return dep;
  }

  public updatePassword(userId: string, newPasswordHash: string): boolean {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public updateLastLogin(userId: string): void {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      this.save();
    }
  }

  // Session Operations (Persistent token store)
  public createSession(userId: string, durationMs: number = 30 * 24 * 60 * 60 * 1000, meta?: { ip?: string; ua?: string }): SessionRecord {
    const now = Date.now();
    this.data.sessions = this.data.sessions.filter(s => s.expiresAt > now);

    const session: SessionRecord = {
      id: crypto.randomBytes(32).toString('hex'),
      userId,
      expiresAt: now + durationMs,
      createdAt: new Date().toISOString(),
      ipAddress: meta?.ip,
      userAgent: meta?.ua
    };

    this.data.sessions.push(session);
    this.save();
    return session;
  }

  public findSession(sessionId: string): SessionRecord | undefined {
    const now = Date.now();
    const session = this.data.sessions.find(s => s.id === sessionId);
    if (!session) return undefined;
    if (session.expiresAt <= now) {
      this.destroySession(sessionId);
      return undefined;
    }
    return session;
  }

  public destroySession(sessionId: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.id !== sessionId);
    this.save();
  }

  // Audit Logs
  public addAuditLog(entry: {
    actorId: string;
    actorEmail: string;
    actorRole: string;
    action: string;
    resource: string;
    details: string;
    ipAddress?: string;
  }): void {
    const log: AuditLogRecord = {
      id: 'log_' + crypto.randomUUID(),
      actorId: entry.actorId,
      actorEmail: entry.actorEmail,
      actorRole: entry.actorRole,
      action: entry.action,
      resource: entry.resource,
      details: entry.details,
      ipAddress: entry.ipAddress || '127.0.0.1',
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.save();
  }

  public getAuditLogs(limit: number = 100): AuditLogRecord[] {
    return this.data.auditLogs.slice(0, limit);
  }

  // Trading Accounts
  public getUserTradingAccounts(userId: string): TradingAccountRecord[] {
    return this.data.tradingAccounts.filter(a => a.userId === userId);
  }

  public resetTradingAccountBalance(userId: string, accountId: string): TradingAccountRecord | null {
    const acc = this.data.tradingAccounts.find(a => a.id === accountId && a.userId === userId);
    if (!acc) return null;
    if (acc.mode === 'DEMO') {
      throw new Error('Demo balance resets are strictly prohibited under institutional risk rules. Once your one-time $1,000 demo allocation is exhausted, please apply for a Live Trading Account.');
    }
    return acc;
  }

  public createLiveTradingAccount(userId: string): TradingAccountRecord {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found');
    
    const existingLive = this.data.tradingAccounts.find(a => a.userId === userId && a.mode === 'LIVE');
    if (existingLive) return existingLive;

    const acc: TradingAccountRecord = {
      id: 'acc_live_' + crypto.randomUUID().slice(0, 8),
      userId,
      accountNumber: 'NX-LIVE-' + Math.floor(10000 + Math.random() * 90000),
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
      status: user.kycStatus === 'APPROVED' ? 'ACTIVE' : 'PENDING',
      createdAt: new Date().toISOString()
    };
    this.data.tradingAccounts.push(acc);
    this.save();
    return acc;
  }

  public syncDemoAccountBalance(userId: string, balance: number): TradingAccountRecord | undefined {
    const demoAcc = this.data.tradingAccounts.find(a => a.userId === userId && a.mode === 'DEMO');
    if (!demoAcc) return undefined;
    // Clamp non-negative and prevent resetting back to 1000 after exhaustion unless realized trade PnL
    const cleanBalance = Math.max(0, Number(balance.toFixed(2)));
    demoAcc.balance = cleanBalance;
    demoAcc.equity = cleanBalance;
    demoAcc.freeMargin = cleanBalance;
    this.save();
    return demoAcc;
  }

  public getAllTradingAccounts(): TradingAccountRecord[] {
    return this.data.tradingAccounts;
  }

  // Staff Management System
  public getAllStaff(): StaffRecord[] {
    return this.data.staff;
  }

  public getStaffById(id: string): StaffRecord | undefined {
    return this.data.staff.find(s => s.id === id || s.staffId === id);
  }

  public createStaff(data: {
    name: string;
    email: string;
    phone?: string;
    department: StaffRecord['department'];
    jobTitle: string;
    assignedRole: string;
    permissions?: PermissionCategory[];
    initialPassword?: string;
  }): StaffRecord {
    const existing = this.data.staff.find(s => s.email.toLowerCase() === data.email.toLowerCase().trim());
    if (existing) {
      throw new Error('Staff member with this email address already exists.');
    }

    const roleObj = this.data.roles.find(r => r.roleKey === data.assignedRole || r.name === data.assignedRole);
    const perms = data.permissions && data.permissions.length > 0 ? data.permissions : (roleObj?.permissions || ['Dashboard']);

    const staffId = 'NX-STF-' + String(this.data.staff.length + 1).padStart(3, '0');
    const newStaff: StaffRecord = {
      id: 'stf_' + crypto.randomUUID(),
      staffId,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone || '+880 1700-000000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      department: data.department,
      jobTitle: data.jobTitle.trim(),
      assignedRole: data.assignedRole,
      status: 'ACTIVE',
      permissions: perms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.staff.push(newStaff);

    // Also register user record for staff login
    const existingUser = this.findUserByEmail(newStaff.email);
    if (!existingUser) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(data.initialPassword || 'StaffSecure2026!', salt);
      this.data.users.push({
        id: 'usr_' + crypto.randomUUID(),
        fullName: newStaff.name,
        email: newStaff.email,
        passwordHash,
        role: (newStaff.assignedRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : newStaff.assignedRole) as any,
        isEmailVerified: true,
        isActive: true,
        country: 'Bangladesh',
        phone: newStaff.phone,
        kycStatus: 'APPROVED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    this.save();
    return newStaff;
  }

  public updateStaff(id: string, updates: Partial<StaffRecord>): StaffRecord | undefined {
    const staff = this.data.staff.find(s => s.id === id || s.staffId === id);
    if (!staff) return undefined;

    // Protect Super Admin
    if (staff.assignedRole === 'SUPER_ADMIN' && updates.assignedRole && updates.assignedRole !== 'SUPER_ADMIN') {
      throw new Error('Cannot modify or downgrade Super Administrator role.');
    }

    Object.assign(staff, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    const user = this.findUserByEmail(staff.email);
    if (user) {
      if (updates.name) user.fullName = updates.name;
      if (updates.assignedRole) user.role = updates.assignedRole as any;
      if (updates.status) user.isActive = updates.status === 'ACTIVE';
    }

    this.save();
    return staff;
  }

  public deleteStaff(id: string): boolean {
    const staff = this.data.staff.find(s => s.id === id || s.staffId === id);
    if (!staff) return false;
    if (staff.assignedRole === 'SUPER_ADMIN') {
      throw new Error('Super Administrator account cannot be deleted or revoked.');
    }
    this.data.staff = this.data.staff.filter(s => s.id !== id && s.staffId !== id);
    this.save();
    return true;
  }

  public updateStaffStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'): StaffRecord | undefined {
    const staff = this.data.staff.find(s => s.id === id || s.staffId === id);
    if (!staff) return undefined;
    if (staff.assignedRole === 'SUPER_ADMIN' && status !== 'ACTIVE') {
      throw new Error('Super Administrator account cannot be suspended or deactivated.');
    }
    staff.status = status;
    staff.updatedAt = new Date().toISOString();

    const user = this.findUserByEmail(staff.email);
    if (user) {
      user.isActive = status === 'ACTIVE';
    }

    this.save();
    return staff;
  }

  public resetStaffPassword(id: string): { tempPassword: string } {
    const staff = this.data.staff.find(s => s.id === id || s.staffId === id);
    if (!staff) throw new Error('Staff member not found.');

    const tempPassword = 'TempPass#' + Math.floor(100000 + Math.random() * 900000);
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(tempPassword, salt);

    const user = this.findUserByEmail(staff.email);
    if (user) {
      user.passwordHash = hash;
      user.updatedAt = new Date().toISOString();
    }

    this.save();
    return { tempPassword };
  }

  // RBAC Roles Management
  public getAllRoles(): RoleRecord[] {
    return this.data.roles;
  }

  public createRole(data: {
    name: string;
    description: string;
    permissions: PermissionCategory[];
  }): RoleRecord {
    const roleKey = 'CUSTOM_' + data.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const newRole: RoleRecord = {
      id: 'role_' + crypto.randomUUID().slice(0, 8),
      name: data.name.trim(),
      roleKey,
      description: data.description.trim(),
      isSystem: false,
      permissions: data.permissions,
      userCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.roles.push(newRole);
    this.save();
    return newRole;
  }

  public updateRole(id: string, updates: Partial<RoleRecord>): RoleRecord | undefined {
    const role = this.data.roles.find(r => r.id === id || r.roleKey === id);
    if (!role) return undefined;
    if (role.isSystem && role.roleKey === 'SUPER_ADMIN') {
      throw new Error('Super Administrator role cannot be modified.');
    }
    Object.assign(role, updates);
    this.save();
    return role;
  }

  public deleteRole(id: string): boolean {
    const role = this.data.roles.find(r => r.id === id || r.roleKey === id);
    if (!role) return false;
    if (role.isSystem) {
      throw new Error('System built-in roles cannot be deleted.');
    }
    this.data.roles = this.data.roles.filter(r => r.id !== id && r.roleKey !== id);
    this.save();
    return true;
  }
}

export const db = new DatabaseService();
