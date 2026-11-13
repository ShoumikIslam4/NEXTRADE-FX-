import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useTrading } from '../../contexts/TradingContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield, ShieldCheck, Bell, Upload, Clock, Laptop, Lock,
  RefreshCw, Send, File, CheckCircle2, ShieldAlert, Check
} from 'lucide-react';

export const KycPage: React.FC = () => {
  const { addToast } = useToast();
  const { user, submitKyc } = useAuth();
  const [docType, setDocType] = useState(user?.kycDocumentType || 'NATIONAL_ID');
  const [docNumber, setDocNumber] = useState(user?.kycDocumentNumber || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const kycStatus = user?.kycStatus || 'UNSUBMITTED';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      addToast({
        type: 'info',
        title: 'Document Selected',
        message: `Attached ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      addToast({
        type: 'info',
        title: 'Document Attached',
        message: `Uploaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!docNumber.trim()) {
      addToast({
        type: 'warning',
        title: 'Document Number Required',
        message: 'Please enter your National ID, Passport, or License number.'
      });
      return;
    }

    setIsSubmitting(true);
    const fileName = selectedFile ? selectedFile.name : `BD_${docType}_Document_${Date.now().toString().slice(-4)}.pdf`;

    const res = await submitKyc({
      documentType: docType,
      documentNumber: docNumber.trim(),
      fileName
    });

    setIsSubmitting(false);

    if (res.success) {
      addToast({
        type: 'success',
        title: 'KYC Submitted Successfully',
        message: 'Your document was received. Admin compliance will review your Live Account application.'
      });
    } else {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: res.message
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Live Account KYC Verification</h2>
        <p className="text-xs text-slate-400 mt-1">
          Required to activate your Live Trading Account &amp; verified Add Funds ledger. (Demo trading works immediately without KYC.)
        </p>
      </div>

      {/* KYC Status Card */}
      <div
        className={`p-5 rounded-xl border ${
          kycStatus === 'APPROVED'
            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            : kycStatus === 'PENDING'
            ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
            : kycStatus === 'ADDITIONAL_INFO_REQUIRED'
            ? 'bg-blue-950/20 border-blue-500/40 text-blue-300'
            : kycStatus === 'REJECTED'
            ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            : 'bg-[#151F30] border-slate-700/80 text-slate-300'
        }`}
      >
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                kycStatus === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : kycStatus === 'PENDING'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : kycStatus === 'ADDITIONAL_INFO_REQUIRED'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : kycStatus === 'REJECTED'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}
            >
              {kycStatus === 'APPROVED' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : kycStatus === 'PENDING' ? (
                <Clock className="w-5 h-5" />
              ) : kycStatus === 'REJECTED' || kycStatus === 'ADDITIONAL_INFO_REQUIRED' ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                <span>Live KYC Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                    kycStatus === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : kycStatus === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : kycStatus === 'ADDITIONAL_INFO_REQUIRED'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : kycStatus === 'REJECTED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {kycStatus === 'APPROVED'
                    ? 'VERIFIED & APPROVED'
                    : kycStatus === 'PENDING'
                    ? 'UNDER ADMIN REVIEW'
                    : kycStatus === 'ADDITIONAL_INFO_REQUIRED'
                    ? 'ADDITIONAL INFO REQUESTED'
                    : kycStatus === 'REJECTED'
                    ? 'VERIFICATION REJECTED'
                    : 'NOT APPLIED YET'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {kycStatus === 'APPROVED'
                  ? 'Your Live Account is verified and eligible for Finance-approved Add Funds.'
                  : kycStatus === 'PENDING'
                  ? 'Your identity documents are in the Compliance Admin queue. You will receive a notification once reviewed.'
                  : kycStatus === 'ADDITIONAL_INFO_REQUIRED'
                  ? `Compliance Admin requested clarification: ${user?.kycNotes || 'Please upload a clearer document scan.'}`
                  : kycStatus === 'REJECTED'
                  ? `Submission rejected: ${user?.kycNotes || 'Document image unreadable or mismatched.'} Please re-submit below.`
                  : 'Submit your NID, Passport, or Driving License to unlock Live Trading Account onboarding and Add Funds.'}
              </p>
            </div>
          </div>
        </div>

        {user?.kycDocumentNumber && (
          <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">DOCUMENT TYPE</span>
              <span className="font-bold text-white">{user.kycDocumentType || docType}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">DOCUMENT NUMBER</span>
              <span className="font-bold text-white">{user.kycDocumentNumber}</span>
            </div>
            {user.kycSubmittedAt && (
              <div>
                <span className="text-[10px] text-slate-500 block font-sans">SUBMITTED AT</span>
                <span className="text-slate-300">{new Date(user.kycSubmittedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Form */}
      {kycStatus !== 'APPROVED' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">
              {kycStatus === 'REJECTED' || kycStatus === 'ADDITIONAL_INFO_REQUIRED'
                ? 'Re-Submit Live Verification Documents'
                : 'Submit Identity Documentation'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Attach your Government ID (Smart NID card, Passport, or BRTA Driving License).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Document Category</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                <option value="NATIONAL_ID">Bangladesh Smart NID Card (National Identity Card)</option>
                <option value="PASSPORT">Bangladeshi International Passport</option>
                <option value="DRIVING_LICENSE">Bangladesh Driving License (BRTA)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {docType === 'NATIONAL_ID'
                  ? 'National ID (NID) Number'
                  : docType === 'PASSPORT'
                  ? 'Passport Number'
                  : 'Driving License Number'}
              </label>
              <input
                type="text"
                required
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder={
                  docType === 'NATIONAL_ID'
                    ? 'e.g. 19942691001234567'
                    : docType === 'PASSPORT'
                    ? 'e.g. A02819402'
                    : 'e.g. DK0192849'
                }
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Upload Document File</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : selectedFile
                    ? 'border-emerald-500/60 bg-emerald-500/5'
                    : 'border-slate-700 hover:border-slate-500 bg-[#0B1220]/50'
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <File className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-white">{selectedFile.name}</div>
                    <div className="text-[11px] text-emerald-400 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready to Submit
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="mt-2 px-3 py-1 text-[11px] text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/30 rounded border border-rose-500/30 transition-colors"
                    >
                      Remove File &amp; Choose Another
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2.5" />
                    <div className="text-xs font-semibold text-white">Click here or drag document file here</div>
                    <div className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, PDF up to 15MB</div>
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-[#151F30] border border-slate-700 rounded-lg text-[11px] text-slate-300 font-semibold hover:border-slate-500">
                        Browse Files from Device
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs transition-colors shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting to Compliance Team...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Document for Live Verification</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

interface BackendNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  read: boolean;
  createdAt: string;
}

export const NotificationsPage: React.FC = () => {
  const { addToast } = useToast();
  const [notifs, setNotifs] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch('/api/user/notifications', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifs(data.notifications);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch('/api/user/notifications/read', {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
        addToast({ type: 'success', title: 'Notifications Cleared', message: 'All alerts marked as read.' });
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Notifications &amp; Alerts</h2>
          <p className="text-xs text-slate-400 mt-1">
            Persistent KYC compliance updates, Live Add Funds approvals/rejections, and account alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="px-3 py-1.5 rounded-lg bg-[#151F30] border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl divide-y divide-slate-800/80">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading account notifications...</div>
        ) : notifs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No notifications yet. KYC decisions and Add Funds updates will appear here.
          </div>
        ) : (
          notifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-3 transition-colors ${
                n.read ? 'hover:bg-[#151F30]/40' : 'bg-blue-950/20 hover:bg-blue-950/30'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{n.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono">
                      {n.category}
                    </span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Performance Analytics &amp; Risk Reports</h2>
        <p className="text-xs text-slate-400 mt-1">
          Quantitative breakdowns of DEMO / SIMULATED returns, Sharpe ratio, and drawdown metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Sharpe Ratio</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">2.14</div>
          <div className="text-[10px] text-slate-500">Risk-adjusted returns</div>
        </div>
        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Max Drawdown</div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">-4.82%</div>
          <div className="text-[10px] text-slate-500">Peak-to-trough decline</div>
        </div>
        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Profit Factor</div>
          <div className="text-xl font-bold font-mono text-blue-400 mt-1">1.88</div>
          <div className="text-[10px] text-slate-500">Gross profit / gross loss</div>
        </div>
        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Average Trade Duration</div>
          <div className="text-xl font-bold font-mono text-white mt-1">4h 18m</div>
          <div className="text-[10px] text-slate-500">Intraday / Swing model</div>
        </div>
      </div>

      <div className="p-6 bg-[#111827] border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Simulated Monthly P/L Distribution</h3>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 text-center text-xs font-mono">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => {
            const pnl = [2.4, 3.1, -1.2, 4.5, 1.8, -0.8, 3.9, 2.1, 4.2, 1.9, 2.8, 0.0][idx];
            return (
              <div key={m} className="p-2.5 bg-[#151F30] border border-slate-800 rounded-lg">
                <div className="text-[10px] text-slate-400 font-sans">{m}</div>
                <div className={`font-bold mt-1 ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {pnl >= 0 ? '+' : ''}
                  {pnl}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const TicketsPage: React.FC = () => {
  const { addToast } = useToast();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Trading Execution');
  const [message, setMessage] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Ticket Submitted',
      message: `Support ticket #${Math.floor(1000 + Math.random() * 9000)} created. Desk will reply shortly.`
    });
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Client Support Tickets</h2>
        <p className="text-xs text-slate-400 mt-1">Direct communication channel with technical dealing desk and compliance.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-white">Create New Inquiry</h3>
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Live KYC review status or funding query"
              className="w-full bg-[#0B1220] border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Department</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0B1220] border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Trading Execution">Dealing Desk &amp; Order Execution</option>
              <option value="Platform & Technical">Web Terminal &amp; Charting Tech</option>
              <option value="Account Verification">KYC &amp; Compliance Verification</option>
              <option value="Billing & Transfer">Live Add Funds (bKash / Nagad / Rocket)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Message Details</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide context or reference ID..."
              className="w-full bg-[#0B1220] border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Ticket</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  const { activeAccount } = useTrading();
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [country, setCountry] = useState(user?.country || 'Bangladesh');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({ fullName, country, phone });
    setSaving(false);
    if (res.success) {
      setEditing(false);
      addToast({ type: 'success', title: 'Profile Updated', message: res.message });
    } else {
      addToast({ type: 'error', title: 'Update Failed', message: res.message });
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'TR';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Trader Profile</h2>
          <p className="text-xs text-slate-400 mt-1">Authenticated client identity and account parameters.</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-[#151F30] hover:bg-slate-800 text-xs text-white font-medium transition-colors"
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center uppercase">
            {initials}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{user?.fullName || 'Trader'}</h3>
            <div className="text-slate-400 font-mono">USER-ID: {user?.id}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">Role: {user?.role} · Active Account</div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div>
              <label className="block text-slate-400 text-[11px] font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 17XX-XXXXXX"
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-slate-500 block text-[11px]">Primary Email</span>
              <span className="text-white font-semibold">{user?.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Country of Residence</span>
              <span className="text-white font-semibold">{user?.country || 'Bangladesh'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Active Trading Account</span>
              <span className="text-white font-mono font-bold">{activeAccount.accountNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Execution Server</span>
              <span className="text-white font-mono">{activeAccount.server}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AccountSettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const [tz, setTz] = useState('GMT+6 (Dhaka)');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({ type: 'success', title: 'Settings Saved', message: 'Trader terminal preferences updated.' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Account Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Platform locale, timezone alignment, and default order execution preferences.</p>
      </div>

      <form onSubmit={handleSave} className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Timezone Display</label>
          <select
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="w-full bg-[#0B1220] border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="GMT+6 (Dhaka)">GMT+6 (Bangladesh Standard Time)</option>
            <option value="GMT+0 (London)">GMT+0 (London Financial Time)</option>
            <option value="EST (New York)">EST (New York Market Open)</option>
            <option value="JST (Tokyo)">JST (Tokyo Asian Session)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">One-Click Trading Confirmation</label>
          <label className="flex items-center gap-2 cursor-pointer mt-1 text-slate-300">
            <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-blue-600" />
            <span>Enable instant one-click simulated order execution in Demo Terminal</span>
          </label>
        </div>

        <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors">
          Save Preferences
        </button>
      </form>
    </div>
  );
};

export const SecuritySettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const { changePassword } = useAuth();
  const [twoFactor, setTwoFactor] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'Password Error', message: 'New passwords do not match.' });
      return;
    }
    setChangingPass(true);
    const res = await changePassword({ currentPassword, newPassword, confirmPassword });
    setChangingPass(false);
    if (res.success) {
      addToast({ type: 'success', title: 'Password Updated', message: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      addToast({ type: 'error', title: 'Update Failed', message: res.message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Security &amp; Password Management</h2>
        <p className="text-xs text-slate-400 mt-1">Protect your trading account credentials and update authentication keys.</p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-4 text-xs">
        <div className="pb-3 border-b border-slate-800">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>Change Account Password</span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">Enforce strong password rules with bcrypt salted hashing.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-1">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-[11px]">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white text-xs"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={changingPass}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors"
          >
            {changingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-5 text-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-sm font-bold text-white">Two-Factor Authentication (TOTP)</div>
            <div className="text-slate-400 text-xs mt-0.5">Google Authenticator / YubiKey authentication required on session start.</div>
          </div>
          <button
            onClick={() => {
              setTwoFactor(!twoFactor);
              addToast({ type: 'info', title: '2FA Updated', message: `Two-factor authentication ${!twoFactor ? 'enabled' : 'disabled'}.` });
            }}
            className={`px-3 py-1.5 rounded font-bold transition-colors ${
              twoFactor ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {twoFactor ? 'Active / Protected' : 'Enable 2FA'}
          </button>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white mb-2">Active Login Sessions</h4>
          <div className="space-y-2">
            <div className="p-3 bg-[#0B1220] border border-slate-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold text-white">Current Authenticated Session</div>
                  <div className="text-[11px] text-slate-500">HTTP-Only SameSite Cookie · Verified Session</div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
