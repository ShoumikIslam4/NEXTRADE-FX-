import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  TrendingUp, Lock, Mail, User, ShieldAlert, 
  CheckCircle2, RefreshCw, AlertCircle, Gift, Phone
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Authentication Successful',
          message: res.emailAlertSent
            ? 'Welcome back! A sign-in security alert was sent to your Gmail.'
            : 'Welcome back to NEXTRADE FX. Sign-in security alert logged.'
        });

        // Strict role-based redirect:
        // SUPER_ADMIN or Staff roles -> /admin/overview
        // USER -> /trader/overview (or return path if user was navigating)
        if (res.role && res.role !== 'USER') {
          navigate('/admin/overview', { replace: true });
        } else {
          const from = (location.state as any)?.from || '/trader/overview';
          // Prevent normal users from redirecting into admin routes via stale state
          const target = from.startsWith('/admin') ? '/trader/overview' : from;
          navigate(target, { replace: true });
        }
      } else {
        setErrorMsg(res.message);
        addToast({
          type: 'error',
          title: 'Sign In Failed',
          message: res.message
        });
      }
    } catch (err: any) {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
          <TrendingUp className="w-5 h-5 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Client Portal Sign In</h1>
        <p className="text-xs text-slate-400">
          Access your authenticated trading workspace or administrative console.
        </p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@domain.com"
                autoComplete="email"
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Password</label>
              <Link to="/forgot-password" className="text-blue-400 hover:underline">Forgot Password?</Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-[#0B1220] text-blue-600 focus:ring-0"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-white font-bold rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-400 font-semibold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { register, platformSettings } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState(() => (searchParams.get('ref') || '').trim().toUpperCase());
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam.trim().toUpperCase());
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!agreed) {
      setErrorMsg('You must agree to the Terms of Service and Risk Warning.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(
        fullName,
        email,
        password,
        confirmPassword,
        phone.trim() || undefined,
        referralCode.trim() || undefined
      );
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Registration Successful',
          message: res.emailAlertSent
            ? 'Account & $1,000 demo account ready! Welcome alert sent to your Gmail.'
            : 'Your account and $1,000 USD virtual demo account have been provisioned.'
        });
        // Default role is USER, navigate to Trader Dashboard
        navigate('/trader/overview');
      } else {
        setErrorMsg(res.message);
        addToast({
          type: 'error',
          title: 'Registration Failed',
          message: res.message
        });
      }
    } catch (err: any) {
      setErrorMsg('A network error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
          <TrendingUp className="w-5 h-5 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Create NEXTRADE Account</h1>
        <p className="text-xs text-slate-400">
          Sign up to access your personal simulated trading terminal with $1,000 USD virtual capital.
        </p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Md Rahim Uddin"
                autoComplete="name"
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address (Gmail)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  autoComplete="email"
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bangladesh Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+880 17XX-XXXXXX"
                  autoComplete="tel"
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {platformSettings?.referralConfig?.enabled && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Referral Code (Optional)
                {referralCode && (
                  <span className="ml-2 text-emerald-400 font-normal">
                    · {platformSettings.referralConfig.referredDiscountPercent}% deposit fee discount active
                  </span>
                )}
              </label>
              <div className="relative">
                <Gift className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NXTRADER1"
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono uppercase"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                  autoComplete="new-password"
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Password Security Rules Checklist */}
          <div className="p-3 bg-[#0B1220] border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Password Requirements:</span>
            <ul className="list-disc list-inside space-y-0.5">
              <li className={password.length >= 8 ? 'text-emerald-400' : ''}>Minimum 8 characters</li>
              <li className={/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-400' : ''}>Uppercase & lowercase letters</li>
              <li className={/[0-9]/.test(password) ? 'text-emerald-400' : ''}>At least one numeric digit</li>
              <li className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'text-emerald-400' : ''}>At least one special character</li>
            </ul>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer text-slate-400 text-xs select-none">
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-[#0B1220] text-blue-600 focus:ring-0"
              />
              <span>
                I agree to the <Link to="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>, <Link to="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>, and acknowledge the <Link to="/risk-disclosure" className="text-blue-400 hover:underline">Simulation Risk Warning</Link>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-white font-bold rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Creating Account...' : 'Open Practice Account ($1,000 USD)'}</span>
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-400 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setSubmitted(true);
      addToast({
        type: 'info',
        title: 'Instructions Sent',
        message: data.message || 'Recovery instructions dispatched.'
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: 'Could not connect to recovery server.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-white">Reset Account Password</h1>
        <p className="text-xs text-slate-400">Enter your registered email address to receive password recovery instructions.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
        {submitted ? (
          <div className="text-center space-y-3 py-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Recovery Link Dispatched</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a secure, time-expiring recovery link has been generated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Registered Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending Instructions...' : 'Send Recovery Email'}
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-xs text-slate-400">
        <Link to="/login" className="text-blue-400 hover:underline">Return to Sign In</Link>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-6 text-xs text-slate-300 leading-relaxed">
      <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
      <p className="text-slate-400">Effective Date: November 2026</p>
      
      <h2 className="text-base font-bold text-white pt-4">1. Data Collection & Purpose</h2>
      <p>
        NEXTRADE FX is a prototype simulated fintech demonstration platform. Any email addresses, simulated credentials, or account IDs submitted are securely stored and verified against authenticated server records solely for demonstration and research purposes.
      </p>

      <h2 className="text-base font-bold text-white pt-4">2. Cookies & Session Management</h2>
      <p>
        We utilize secure, HTTP-only authentication cookies for session tracking and access control. No third-party tracking pixels or telemetry engines are embedded.
      </p>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-6 text-xs text-slate-300 leading-relaxed">
      <h1 className="text-3xl font-extrabold text-white">Terms & Conditions</h1>
      <p className="text-slate-400">Effective Date: November 2026</p>

      <h2 className="text-base font-bold text-white pt-4">1. Software Prototype Terms</h2>
      <p>
        By accessing the NEXTRADE FX web application, you acknowledge that this portal is strictly a non-commercial software simulation. No real trades, bank accounts, or financial transactions are executed.
      </p>

      <h2 className="text-base font-bold text-white pt-4">2. Intellectual Property</h2>
      <p>
        All interface components, chart visualizations, brand marks, and layout architectures are proprietary prototype assets of NEXTRADE FX Platform Technologies.
      </p>
    </div>
  );
};

export const RiskDisclosurePage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-6 text-xs text-slate-300 leading-relaxed">
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-sm">Regulatory Notice & Financial Risk Statement</h3>
          <p className="text-xs text-amber-200/90 mt-1">
            Foreign exchange and CFD trading on real margin carries a high level of risk and may not be suitable for all investors.
          </p>
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-white pt-2">Full Risk Disclosure</h1>

      <h2 className="text-base font-bold text-white">1. Simulated Market Data</h2>
      <p>
        All market pricing, bid/ask spreads, currency quotes, tick fluctuations, and simulated order fills displayed across the NEXTRADE FX platform are algorithmic approximations created for educational and interface testing purposes only. Past simulated performance is no indicator of real market results.
      </p>

      <h2 className="text-base font-bold text-white">2. High Leverage Risk</h2>
      <p>
        Leverage accelerates both potential gains and potential losses. In real financial markets, trading with high leverage (such as 1:500) can result in the rapid loss of your entire deposited capital.
      </p>

      <h2 className="text-base font-bold text-white">3. Non-Advisory Nature</h2>
      <p>
        NEXTRADE FX does not offer personal financial advice, investment recommendations, or asset management. Any commentary, technical chart analysis, or signals displayed are for illustrative purposes only.
      </p>
    </div>
  );
};
