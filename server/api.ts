import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { AuthenticatedRequest, rateLimit, authenticate, requireSuperAdmin, requirePermission, requireStaffOrAdmin } from './middleware.js';

const router = express.Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number.' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one special character.' };
  }
  return { valid: true };
}

// 1. REGISTER
router.post('/auth/register', rateLimit(10, 10 * 60 * 1000), (req: Request, res: Response): void => {
  try {
    const { fullName, email, password, confirmPassword, phone } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Please provide a valid full name (minimum 2 characters).' });
      return;
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    if (!password || typeof password !== 'string') {
      res.status(400).json({ success: false, message: 'Password is required.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      res.status(400).json({ success: false, message: strength.reason });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.findUserByEmail(cleanEmail);
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in instead.'
      });
      return;
    }

    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.createUser({
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash,
      phone: phone || '+880 1712-000000'
    });

    // Persistent Session: 30 days default so back button or reload never logs user out!
    const session = db.createSession(newUser.id, 30 * 24 * 60 * 60 * 1000, {
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      ua: req.headers['user-agent']
    });

    res.cookie('nextrade_session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome to NEXTRADE FX.',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        kycStatus: newUser.kycStatus,
        country: newUser.country,
        phone: newUser.phone,
        createdAt: newUser.createdAt
      },
      token: session.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal error during registration.' });
  }
});

// 2. LOGIN
router.post('/auth/login', rateLimit(15, 15 * 60 * 1000), (req: Request, res: Response): void => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email address and password.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.findUserByEmail(cleanEmail);

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact support.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
      return;
    }

    // 30 days persistent session
    const durationMs = 30 * 24 * 60 * 60 * 1000;
    const session = db.createSession(user.id, durationMs, {
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
      ua: req.headers['user-agent']
    });

    db.updateLastLogin(user.id);

    const allPermissions = [
      'Dashboard', 'Users', 'Staff', 'Roles', 'Accounts', 'KYC',
      'Deposits', 'Withdrawals', 'Payment Methods', 'Trading',
      'Markets', 'Reports', 'CMS', 'Website Settings',
      'Notifications', 'Support', 'Security', 'Audit Logs'
    ];
    const staffRecord = db.getAllStaff().find(s => s.email.toLowerCase() === user.email.toLowerCase());
    if (staffRecord) {
      db.updateStaff(staffRecord.id, { lastLogin: new Date().toISOString() });
    }
    const permissions = user.role === 'SUPER_ADMIN'
      ? allPermissions
      : (staffRecord && staffRecord.status === 'ACTIVE' ? staffRecord.permissions : []);

    res.cookie('nextrade_session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: durationMs
    });

    res.json({
      success: true,
      message: 'Authentication successful.',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
        kycDocumentType: user.kycDocumentType,
        kycDocumentNumber: user.kycDocumentNumber,
        kycDocumentFileName: user.kycDocumentFileName,
        kycSubmittedAt: user.kycSubmittedAt,
        kycNotes: user.kycNotes,
        country: user.country,
        phone: user.phone,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        permissions,
        staffProfile: staffRecord || null
      },
      token: session.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An internal authentication error occurred.' });
  }
});

// 3. CURRENT USER SESSION
router.get('/auth/me', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const tradingAccounts = db.getUserTradingAccounts(user.id);
  const bdtRate = db.getBdtRate();

  // Determine permissions based on role or staff record
  const allPermissions = [
    'Dashboard', 'Users', 'Staff', 'Roles', 'Accounts', 'KYC', 
    'Deposits', 'Withdrawals', 'Payment Methods', 'Trading', 
    'Markets', 'Reports', 'CMS', 'Website Settings', 
    'Notifications', 'Support', 'Security', 'Audit Logs'
  ];

  const staffRecord = db.getAllStaff().find(s => s.email.toLowerCase() === user.email.toLowerCase());
  const permissions = user.role === 'SUPER_ADMIN' 
    ? allPermissions 
    : (staffRecord && staffRecord.status === 'ACTIVE' ? staffRecord.permissions : []);

  res.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus,
      kycDocumentType: user.kycDocumentType,
      kycDocumentNumber: user.kycDocumentNumber,
      kycDocumentFileName: user.kycDocumentFileName,
      kycSubmittedAt: user.kycSubmittedAt,
      kycNotes: user.kycNotes,
      country: user.country,
      phone: user.phone,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      permissions,
      staffProfile: staffRecord || null
    },
    tradingAccounts,
    bdtRate
  });
});

// 4. LOGOUT
router.post('/auth/logout', (req: Request, res: Response): void => {
  const cookieSession = req.cookies?.nextrade_session;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const sessionToken = cookieSession || bearerToken;

  if (sessionToken) {
    db.destroySession(sessionToken);
  }

  res.clearCookie('nextrade_session');
  res.json({ success: true, message: 'Signed out successfully.' });
});

// 5. SUBMIT KYC (User)
router.post('/user/kyc', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { documentType, documentNumber, fileName } = req.body;
    const user = req.user!;

    if (!documentType || !documentNumber) {
      res.status(400).json({ success: false, message: 'Document category and document number are required.' });
      return;
    }

    const updated = db.submitKyc(user.id, {
      documentType,
      documentNumber: documentNumber.trim(),
      fileName: fileName || 'National_ID_Bangladesh.pdf'
    });

    db.addAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'KYC_SUBMITTED',
      resource: 'UserKYC',
      details: `User submitted ${documentType} #${documentNumber} for compliance review.`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.json({
      success: true,
      message: 'KYC document submitted successfully. Awaiting Admin review.',
      user: {
        ...user,
        kycStatus: 'PENDING',
        kycDocumentType: documentType,
        kycDocumentNumber: documentNumber,
        kycDocumentFileName: fileName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit KYC.' });
  }
});

// 6. CREATE REAL MONEY DEPOSIT REQUEST (bKash / Nagad / Rocket)
router.post('/user/deposits', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { method, senderNumber, transactionId, amountBDT, paymentProofName } = req.body;
    const user = req.user!;

    if (user.kycStatus !== 'APPROVED' && user.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Live Account KYC verification must be approved before submitting Add Funds deposits. Demo accounts cannot receive deposits.'
      });
      return;
    }

    if (!method || !['bKash', 'Nagad', 'Rocket'].includes(method)) {
      res.status(400).json({ success: false, message: 'Please select a valid payment method (bKash, Nagad, or Rocket).' });
      return;
    }

    if (!senderNumber || !/^01[3-9]\d{8}$/.test(senderNumber.replace(/\D/g, '').slice(-11))) {
      res.status(400).json({ success: false, message: 'Please provide a valid 11-digit Bangladeshi mobile wallet number (e.g., 01712345678).' });
      return;
    }

    if (!transactionId || transactionId.trim().length < 6) {
      res.status(400).json({ success: false, message: 'Please enter the exact Transaction ID (TrxID) received via SMS.' });
      return;
    }

    const bdt = Number(amountBDT);
    const rate = db.getBdtRate();
    const usd = bdt / rate;
    const minBdt = Math.ceil(rate * 10);

    if (isNaN(bdt) || usd < 10) {
      res.status(400).json({ 
        success: false, 
        message: `Minimum funding amount is $10 USD equivalent (৳${minBdt.toLocaleString()} BDT). You entered ৳${bdt} BDT ($${usd.toFixed(2)} USD).` 
      });
      return;
    }

    const deposit = db.createDepositRequest(user.id, {
      method,
      senderNumber: senderNumber.trim(),
      transactionId: transactionId.trim(),
      amountBDT: bdt,
      paymentProofName: paymentProofName ? String(paymentProofName).trim() : undefined
    });

    db.addAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'DEPOSIT_REQUEST_SUBMITTED',
      resource: 'Deposit',
      details: `${user.email} submitted ${method} deposit of ${bdt} BDT ($${deposit.amountUSD} USD) with TrxID: ${deposit.transactionId}`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.status(201).json({
      success: true,
      message: `Deposit request of ৳${bdt} BDT ($${deposit.netUSD ?? deposit.amountUSD} USD) via ${method} submitted. Ledger will credit after Finance verification.`,
      deposit
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to record deposit request.' });
  }
});

// 7. GET USER'S DEPOSITS
router.get('/user/deposits', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const deposits = db.getUserDepositRequests(req.user!.id);
  res.json({ success: true, deposits });
});

// 7B. USER NOTIFICATIONS
router.get('/user/notifications', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const notifications = db.getUserNotifications(req.user!.id);
  res.json({ success: true, notifications });
});

router.put('/user/notifications/read', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  db.markNotificationsRead(req.user!.id);
  res.json({ success: true });
});

// 7C. LIVE ACCOUNT APPLICATION & DEMO RESTRICTIONS (PHASE 1)
router.post('/user/live-application', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { fullName, phone, country, idType, idNumber, fileName } = req.body;

    if (fullName || phone || country) {
      db.updateUser(user.id, {
        ...(fullName ? { fullName: String(fullName).trim() } : {}),
        ...(phone ? { phone: String(phone).trim() } : {}),
        ...(country ? { country: String(country).trim() } : {})
      });
    }

    if (idType && idNumber) {
      db.submitKyc(user.id, {
        documentType: idType,
        documentNumber: String(idNumber).trim(),
        fileName: fileName || `${idType}_Document.pdf`
      });
    }

    const liveAccount = db.createLiveTradingAccount(user.id);
    db.addNotification(
      user.id,
      'Live Trading Account Application Received',
      `Your Live Account #${liveAccount.accountNumber} onboarding application is now in Compliance review. Live order execution stays disabled until KYC approval and authorized broker connectivity.`,
      'KYC'
    );

    db.addAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'LIVE_APPLICATION_SUBMITTED',
      resource: 'LiveAccount',
      details: `User applied directly for Live Trading Account (${liveAccount.accountNumber}) with ${idType || 'KYC'} documentation.`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.status(201).json({
      success: true,
      message: 'Live account application submitted successfully.',
      liveAccount
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to submit live application.' });
  }
});

router.put('/user/demo-account/sync', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  const { balance } = req.body;
  const num = Number(balance);
  if (isNaN(num) || num < 0) {
    res.status(400).json({ success: false, message: 'Invalid demo balance value.' });
    return;
  }
  const updated = db.syncDemoAccountBalance(req.user!.id, num);
  res.json({ success: true, account: updated });
});

router.post('/user/accounts/demo', authenticate, (_req: AuthenticatedRequest, res: Response): void => {
  res.status(403).json({
    success: false,
    message: 'Maximum one Demo Account ($1,000 USD) is allowed per registered user. Additional demo accounts or credits are prohibited.'
  });
});

router.post('/user/accounts/demo/reset', authenticate, (_req: AuthenticatedRequest, res: Response): void => {
  res.status(403).json({
    success: false,
    message: 'Demo balance resets and top-ups are strictly prohibited. Once your $1,000 demo balance is exhausted, please apply for a Live Trading Account.'
  });
});

// 8. GET USD/BDT CONVERSION RATE & ACTIVE PAYMENT METHODS
router.get('/market/bdt-rate', (req: Request, res: Response): void => {
  const rate = db.getBdtRate();
  res.json({
    success: true,
    currency: 'USD/BDT',
    rate,
    lastUpdated: new Date().toISOString()
  });
});

router.get('/payment-methods', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    methods: db.getActivePaymentMethods(),
    bdtRate: db.getBdtRate()
  });
});

// 9. UPDATE USER PROFILE
router.put('/user/profile', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { fullName, phone, country } = req.body;
    const updates: Partial<any> = {};

    if (fullName && fullName.trim().length >= 2) updates.fullName = fullName.trim();
    if (phone) updates.phone = phone.trim();
    if (country) updates.country = country.trim();

    const updated = db.updateUser(user.id, updates);
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated?.id,
        fullName: updated?.fullName,
        email: updated?.email,
        phone: updated?.phone,
        country: updated?.country,
        kycStatus: updated?.kycStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// 10. ADMIN: KYC REVIEW (APPROVE / REJECT)
// 10. ADMIN: KYC REVIEW (APPROVE / REJECT / ADDITIONAL_INFO_REQUIRED)
router.post('/admin/kyc/:id/review', authenticate, requirePermission('KYC'), (req: AuthenticatedRequest, res: Response): void => {
  const targetUserId = req.params.id;
  const { status, notes } = req.body;

  if (!status || !['APPROVED', 'REJECTED', 'ADDITIONAL_INFO_REQUIRED'].includes(status)) {
    res.status(400).json({ success: false, message: 'Status must be APPROVED, REJECTED, or ADDITIONAL_INFO_REQUIRED.' });
    return;
  }

  const updated = db.reviewKyc(targetUserId, status, notes);
  if (!updated) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  db.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: `KYC_${status}`,
    resource: 'UserKYC',
    details: `Staff/Admin marked KYC of ${updated.email} as ${status}. Notes: ${notes || 'None'}`,
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
  });

  res.json({
    success: true,
    message: `User KYC marked as ${status}.${status === 'APPROVED' ? ' Live Trading Account activated.' : ''}`,
    user: updated
  });
});

// 11. ADMIN: GET ALL DEPOSITS & REVIEW
router.get('/admin/deposits', authenticate, requirePermission('Deposits'), (req: AuthenticatedRequest, res: Response): void => {
  const deposits = db.getDepositRequests();
  res.json({ success: true, deposits });
});

router.post('/admin/deposits/:id/review', authenticate, requirePermission('Deposits'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const depositId = req.params.id;
    const { status, notes } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED.' });
      return;
    }

    const updated = db.reviewDeposit(depositId, status, notes, req.user!.email);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Deposit request not found.' });
      return;
    }

    db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: `DEPOSIT_${status}`,
      resource: 'Deposit',
      details: `Staff/Admin ${status} ${updated.method} deposit #${updated.id} of ৳${updated.amountBDT} ($${updated.netUSD ?? updated.amountUSD} USD) for ${updated.userEmail}`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.json({
      success: true,
      message: `Deposit #${depositId} marked as ${status}. ${status === 'APPROVED' ? `Credited $${(updated.netUSD ?? updated.amountUSD).toFixed(2)} USD to user Live account.` : ''}`,
      deposit: updated
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Could not process deposit review.' });
  }
});

// 11B. ADMIN: PAYMENT METHODS MANAGEMENT (bKash / Nagad / Rocket)
router.get('/admin/payment-methods', authenticate, requirePermission('Payment Methods'), (_req: AuthenticatedRequest, res: Response): void => {
  res.json({ success: true, methods: db.getPaymentMethods() });
});

router.put('/admin/payment-methods/:id', authenticate, requirePermission('Payment Methods'), (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id;
  const updated = db.updatePaymentMethod(id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Payment method not found.' });
    return;
  }

  db.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'PAYMENT_METHOD_UPDATED',
    resource: 'PaymentMethod',
    details: `Updated ${updated.method} (${updated.accountNumber}, fee ${updated.feePercent}%, active: ${updated.isActive}).`,
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
  });

  res.json({ success: true, message: `${updated.method} settings updated.`, method: updated });
});

// 12. ADMIN: BDT RATE MANAGEMENT
router.put('/admin/bdt-rate', authenticate, requirePermission('Website Settings'), (req: AuthenticatedRequest, res: Response): void => {
  const { rate } = req.body;
  const numRate = Number(rate);
  if (isNaN(numRate) || numRate <= 0) {
    res.status(400).json({ success: false, message: 'Valid positive exchange rate required.' });
    return;
  }

  db.setBdtRate(numRate);
  db.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'BDT_RATE_UPDATED',
    resource: 'ExchangeRate',
    details: `Admin updated USD/BDT rate to ৳${numRate}`,
    ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
  });

  res.json({ success: true, message: `Exchange rate set to ৳${numRate} BDT per USD.`, rate: numRate });
});

// 13. ADMIN OVERVIEW STATS
router.get('/admin/overview-stats', authenticate, requireStaffOrAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const allUsers = db.getAllUsers();
  const allAccounts = db.getAllTradingAccounts();
  const deposits = db.getDepositRequests();
  const auditLogs = db.getAuditLogs(10);

  const pendingKycCount = allUsers.filter(u => u.kycStatus === 'PENDING').length;
  const pendingDepositsCount = deposits.filter(d => d.status === 'PENDING').length;

  res.json({
    success: true,
    stats: {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.isActive).length,
      totalAccounts: allAccounts.length,
      totalVolumeLots: 1420.5,
      pendingKyc: pendingKycCount,
      pendingDeposits: pendingDepositsCount,
      bdtRate: db.getBdtRate()
    },
    recentUsers: allUsers.slice(-5).reverse(),
    recentLogs: auditLogs,
    pendingDeposits: deposits.filter(d => d.status === 'PENDING')
  });
});

// 14. ADMIN: USER MANAGEMENT
router.get('/admin/users', authenticate, requirePermission('Users'), (req: AuthenticatedRequest, res: Response): void => {
  const users = db.getAllUsers().map(u => {
    const accs = db.getUserTradingAccounts(u.id);
    const demoAcc = accs.find(a => a.mode === 'DEMO');
    const liveAcc = accs.find(a => a.mode === 'LIVE');
    return {
      ...u,
      demoBalance: demoAcc ? demoAcc.balance : 0,
      liveBalance: liveAcc ? liveAcc.balance : 0,
      hasDemoAccount: !!demoAcc,
      hasLiveAccount: !!liveAcc
    };
  });
  res.json({ success: true, users });
});

router.put('/admin/users/:id/status', authenticate, requirePermission('Users'), (req: AuthenticatedRequest, res: Response): void => {
  const targetId = req.params.id;
  const { isActive } = req.body;
  const targetUser = db.findUserById(targetId);

  if (!targetUser) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }
  if (targetUser.role === 'SUPER_ADMIN') {
    res.status(400).json({ success: false, message: 'Cannot deactivate Super Administrator accounts.' });
    return;
  }

  db.updateUser(targetId, { isActive: !!isActive });
  res.json({ success: true, message: `User status updated to ${isActive ? 'ACTIVE' : 'SUSPENDED'}.` });
});

// 15. STAFF MANAGEMENT SYSTEM (PHASE 2)
router.get('/admin/staff', authenticate, requirePermission('Staff'), (req: AuthenticatedRequest, res: Response): void => {
  const staff = db.getAllStaff();
  res.json({ success: true, staff });
});

router.post('/admin/staff', authenticate, requirePermission('Staff'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { name, email, phone, department, jobTitle, assignedRole, permissions, initialPassword } = req.body;

    if (!name || !email || !department || !jobTitle || !assignedRole) {
      res.status(400).json({ success: false, message: 'Name, email, department, job title, and assigned role are required.' });
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Please provide a valid staff email address.' });
      return;
    }

    const newStaff = db.createStaff({
      name,
      email,
      phone,
      department,
      jobTitle,
      assignedRole,
      permissions,
      initialPassword
    });

    db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'STAFF_CREATED',
      resource: 'StaffManagement',
      details: `Created new staff member ${newStaff.name} (${newStaff.staffId}) with role [${newStaff.assignedRole}].`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.status(201).json({
      success: true,
      message: `Staff member ${newStaff.name} (${newStaff.staffId}) created successfully.`,
      staff: newStaff
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to create staff member.' });
  }
});

router.put('/admin/staff/:id', authenticate, requirePermission('Staff'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const staffId = req.params.id;
    const updates = req.body;
    const updated = db.updateStaff(staffId, updates);

    if (!updated) {
      res.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }

    db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'STAFF_UPDATED',
      resource: 'StaffManagement',
      details: `Updated profile details for staff member ${updated.name} (${updated.staffId}).`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.json({
      success: true,
      message: `Staff member ${updated.name} profile updated.`,
      staff: updated
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to update staff member.' });
  }
});

router.put('/admin/staff/:id/status', authenticate, requirePermission('Staff'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const staffId = req.params.id;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be ACTIVE, SUSPENDED, or INACTIVE.' });
      return;
    }

    const updated = db.updateStaffStatus(staffId, status);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }

    db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: `STAFF_${status}`,
      resource: 'StaffManagement',
      details: `Staff member ${updated.name} status changed to ${status}.`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.json({
      success: true,
      message: `Staff account status changed to ${status}.`,
      staff: updated
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to update status.' });
  }
});

router.post('/admin/staff/:id/reset-password', authenticate, requirePermission('Staff'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const staffId = req.params.id;
    const result = db.resetStaffPassword(staffId);

    db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'STAFF_PASSWORD_RESET',
      resource: 'StaffManagement',
      details: `Temporary password generated for staff member ID ${staffId}.`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.json({
      success: true,
      message: `Temporary password generated: ${result.tempPassword}. Share securely with the staff member.`,
      tempPassword: result.tempPassword
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to reset password.' });
  }
});

router.delete('/admin/staff/:id', authenticate, requireSuperAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const staffId = req.params.id;
    const success = db.deleteStaff(staffId);
    if (!success) {
      res.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }

    db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'STAFF_DELETED',
      resource: 'StaffManagement',
      details: `Staff record ID ${staffId} deleted by Super Admin.`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.json({ success: true, message: 'Staff member removed successfully.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to delete staff member.' });
  }
});

router.get('/admin/staff/:id/logs', authenticate, requirePermission('Staff'), (req: AuthenticatedRequest, res: Response): void => {
  const staff = db.getStaffById(req.params.id);
  if (!staff) {
    res.status(404).json({ success: false, message: 'Staff member not found.' });
    return;
  }
  const allLogs = db.getAuditLogs(500);
  const logs = allLogs.filter(l => l.actorEmail.toLowerCase() === staff.email.toLowerCase() || l.details.includes(staff.staffId) || l.details.includes(staff.email));
  res.json({ success: true, logs });
});

// 16. RBAC ROLES MANAGEMENT (PHASE 2)
router.get('/admin/roles', authenticate, requirePermission('Roles'), (req: AuthenticatedRequest, res: Response): void => {
  const roles = db.getAllRoles();
  res.json({ success: true, roles });
});

router.post('/admin/roles', authenticate, requireSuperAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { name, description, permissions } = req.body;
    if (!name || !description || !Array.isArray(permissions)) {
      res.status(400).json({ success: false, message: 'Role name, description, and permissions array are required.' });
      return;
    }

    const newRole = db.createRole({ name, description, permissions });
    db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ROLE_CREATED',
      resource: 'RoleManagement',
      details: `Created custom role [${newRole.name}] with ${permissions.length} granular permissions.`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.status(201).json({
      success: true,
      message: `Custom role [${newRole.name}] created successfully.`,
      role: newRole
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to create role.' });
  }
});

router.put('/admin/roles/:id', authenticate, requireSuperAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const roleId = req.params.id;
    const updates = req.body;
    const updated = db.updateRole(roleId, updates);

    if (!updated) {
      res.status(404).json({ success: false, message: 'Role not found.' });
      return;
    }

    db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ROLE_UPDATED',
      resource: 'RoleManagement',
      details: `Updated permissions/details for role [${updated.name}].`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.json({
      success: true,
      message: `Role [${updated.name}] updated successfully.`,
      role: updated
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to update role.' });
  }
});

router.delete('/admin/roles/:id', authenticate, requireSuperAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const roleId = req.params.id;
    const success = db.deleteRole(roleId);
    if (!success) {
      res.status(404).json({ success: false, message: 'Role not found.' });
      return;
    }

    db.addAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'ROLE_DELETED',
      resource: 'RoleManagement',
      details: `Role ID ${roleId} deleted by Super Admin.`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
    });

    res.json({ success: true, message: 'Custom role deleted successfully.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed to delete role.' });
  }
});

// 17. AUDIT LOGS
router.get('/admin/audit-logs', authenticate, requirePermission('Audit Logs'), (req: AuthenticatedRequest, res: Response): void => {
  const logs = db.getAuditLogs(200);
  res.json({ success: true, logs });
});

export default router;
