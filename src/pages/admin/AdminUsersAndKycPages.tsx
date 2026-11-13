import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useTrading } from '../../contexts/TradingContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search, CheckCircle2, XCircle, HelpCircle, X, ShieldCheck, ShieldOff, Eye, ZoomIn
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nextrade_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/users', { headers, credentials: 'include' });
      const data = await res.json();
      if (data.success && data.users) {
        const mapped = data.users.map((u: any) => ({
          id: u.id,
          name: u.fullName,
          email: u.email,
          role: u.role,
          country: u.country || 'Bangladesh',
          registeredDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-11-10',
          kycStatus: u.kycStatus || (u.role === 'SUPER_ADMIN' ? 'APPROVED' : 'UNSUBMITTED'),
          status: u.isActive ? 'ACTIVE' : 'SUSPENDED',
          demoBalance: typeof u.demoBalance === 'number' ? u.demoBalance : 1000.0,
          liveBalance: typeof u.liveBalance === 'number' ? u.liveBalance : 0.0,
          hasDemoAccount: u.hasDemoAccount !== false,
          hasLiveAccount: !!u.hasLiveAccount,
          phone: u.phone || '+880 1712-000000'
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.error('[Admin] Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const nextActive = target.status !== 'ACTIVE';

    try {
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: nextActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({
          type: nextActive ? 'success' : 'warning',
          title: 'User Status Updated',
          message: data.message
        });
        fetchUsers();
      } else {
        addToast({
          type: 'error',
          title: 'Action Denied',
          message: data.message || 'Could not update user status.'
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Network error updating user status.'
      });
    }
  };

  const filtered = users.filter((u: any) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.id || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Trader User Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Inspect client KYC status, isolated Demo ($1,000 limit) vs Live account balances, and account access.
          </p>
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or user ID..."
              className="w-full bg-[#151F30] border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Status:</span>
            {['ALL', 'ACTIVE', 'SUSPENDED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  statusFilter === st ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-[#151F30]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums font-mono">
            <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Client ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">KYC Status</th>
                <th className="py-3 px-4">Demo (SIM)</th>
                <th className="py-3 px-4">Live Ledger</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-500 font-sans">
                    Loading client records...
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-[#151F30]/60">
                    <td className="py-3 px-4 text-slate-400">{u.id}</td>
                    <td className="py-3 px-4 font-bold text-white font-sans">{u.name}</td>
                    <td className="py-3 px-4 text-slate-300">{u.email}</td>
                    <td className="py-3 px-4 font-sans text-slate-400">{u.country}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          u.kycStatus === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : u.kycStatus === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : u.kycStatus === 'ADDITIONAL_INFO_REQUIRED'
                            ? 'bg-blue-500/20 text-blue-400'
                            : u.kycStatus === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-300">${u.demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">${u.liveBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          u.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2 py-1 rounded bg-[#151F30] text-slate-200 hover:text-white border border-slate-700 text-xs font-sans"
                        >
                          Inspect
                        </button>
                        {u.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`px-2 py-1 rounded text-xs font-sans font-semibold ${
                              u.status === 'ACTIVE'
                                ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
                                : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151F30] border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">{selectedUser.name}</h3>
                <div className="text-xs text-slate-400 font-mono">
                  {selectedUser.id} · {selectedUser.email}
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                {selectedUser.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#0B1220] rounded-lg">
                <div>
                  <span className="text-slate-500 block text-[11px]">Phone</span>
                  <span className="text-white font-mono">{selectedUser.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">KYC Status</span>
                  <span className="text-white font-mono">{selectedUser.kycStatus}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Demo Balance (SIM)</span>
                  <span className="text-blue-400 font-mono font-bold">${selectedUser.demoBalance.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Live Balance</span>
                  <span className="text-emerald-400 font-mono font-bold">${selectedUser.liveBalance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const KycManagementPage: React.FC = () => {
  const { addToast } = useToast();
  const { platformSettings, refreshPlatformSettings } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingPolicy, setTogglingPolicy] = useState(false);
  const [reviewModal, setReviewModal] = useState<{
    user: any;
    action: 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED';
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [previewDocUser, setPreviewDocUser] = useState<any | null>(null);
  const [zoomImage, setZoomImage] = useState<{ label: string; src: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('nextrade_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/users', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.users) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error('[Admin] Error fetching users for KYC', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
    refreshPlatformSettings();
  }, [refreshPlatformSettings]);

  const handleToggleKycRequirement = async () => {
    try {
      setTogglingPolicy(true);
      const nextVal = !platformSettings.requireKycToTrade;
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ requireKycToTrade: nextVal })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await refreshPlatformSettings();
        addToast({
          type: nextVal ? 'warning' : 'success',
          title: `KYC Before Trading: ${nextVal ? 'ON (MANDATORY)' : 'OFF (OPTIONAL)'}`,
          message: nextVal
            ? 'New & unverified traders must now pass KYC approval before placing trades.'
            : 'Traders can now place demo trades without waiting for KYC approval.'
        });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update KYC requirement setting.' });
    } finally {
      setTogglingPolicy(false);
    }
  };

  const handleReviewKyc = async (
    userId: string,
    status: 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED',
    notes?: string
  ) => {
    try {
      const token = localStorage.getItem('nextrade_token');
      const res = await fetch(`/api/admin/kyc/${userId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ status, notes: notes || '' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast({
          type: status === 'APPROVED' ? 'success' : 'warning',
          title: `KYC ${status.replace(/_/g, ' ')}`,
          message: data.message
        });
        setReviewModal(null);
        setReviewNotes('');
        fetchUsers();
      } else {
        addToast({
          type: 'error',
          title: 'Review Failed',
          message: data.message || 'Could not update KYC status.'
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Network error processing KYC review.'
      });
    }
  };

  const pendingUsers = users.filter(
    (u) =>
      u.kycStatus === 'PENDING' ||
      u.kycStatus === 'ADDITIONAL_INFO_REQUIRED' ||
      (u.kycDocumentNumber && u.kycStatus !== 'APPROVED')
  );
  const approvedUsers = users.filter((u) => u.kycStatus === 'APPROVED' && u.role === 'USER');

  const kycRequired = platformSettings.requireKycToTrade;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#151F30] border border-slate-800 rounded-xl p-4 sm:p-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">KYC Document Verification &amp; Policy Control</h2>
          <p className="text-xs text-slate-400 mt-1">
            Inspect NID Front &amp; Back photos submitted by traders, approve/reject KYC, and toggle mandatory KYC before trading.
          </p>
        </div>

        {/* One-Click KYC Before Trading ON / OFF Switch */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="px-3 py-2 rounded-lg bg-[#0B1220] border border-slate-700 text-xs">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Trade KYC Gate</div>
            <div className={`font-bold font-mono ${kycRequired ? 'text-amber-400' : 'text-emerald-400'}`}>
              {kycRequired ? 'ON · KYC Required to Trade' : 'OFF · Open Trading Allowed'}
            </div>
          </div>
          <button
            type="button"
            disabled={togglingPolicy}
            onClick={handleToggleKycRequirement}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md ${
              kycRequired
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            {kycRequired ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{kycRequired ? 'Turn OFF KYC Requirement' : 'Turn ON KYC Requirement'}</span>
          </button>
        </div>
      </div>

      {/* Pending Submissions Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Pending &amp; Follow-up Queue</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
              {pendingUsers.length} Pending
            </span>
          </h3>
          <button onClick={fetchUsers} className="text-xs text-slate-400 hover:text-white transition-colors">
            {loading ? 'Refreshing...' : 'Refresh Queue'}
          </button>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-8 bg-[#111827] border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="font-semibold text-white">No Pending Submissions</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              All submitted Live KYC verifications have been processed.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingUsers.map((u) => (
              <div key={u.id} className="p-5 bg-[#111827] border border-slate-800 rounded-xl space-y-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-white">{u.fullName}</div>
                    <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      u.kycStatus === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-400'
                        : u.kycStatus === 'ADDITIONAL_INFO_REQUIRED'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {u.kycStatus || 'PENDING'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-[#0B1220] border border-slate-800 rounded-lg text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">DOCUMENT TYPE</span>
                    <span className="font-bold text-slate-200">{u.kycDocumentType || 'NATIONAL_ID'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">DOCUMENT NUMBER</span>
                    <span className="font-bold text-white">{u.kycDocumentNumber || 'Pending'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">FILES ATTACHED</span>
                    <span className="text-blue-400 font-bold truncate block">
                      {u.kycFrontFileName || u.kycDocumentFileName || 'Front'} / {u.kycBackFileName || 'Back'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">PHONE</span>
                    <span className="text-slate-300">{u.phone || '—'}</span>
                  </div>
                </div>

                {/* NID Front & Back Image Previews */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                      <span>NID Front Side</span>
                      {u.kycFrontImage && (
                        <button
                          type="button"
                          onClick={() => setZoomImage({ label: `${u.fullName} — NID Front`, src: u.kycFrontImage })}
                          className="text-blue-400 hover:text-white flex items-center gap-0.5"
                        >
                          <ZoomIn className="w-3 h-3" />
                          <span>Zoom</span>
                        </button>
                      )}
                    </div>
                    {u.kycFrontImage ? (
                      <img
                        src={u.kycFrontImage}
                        alt="NID Front"
                        onClick={() => setZoomImage({ label: `${u.fullName} — NID Front`, src: u.kycFrontImage })}
                        className="w-full h-28 object-cover rounded cursor-pointer border border-slate-700 hover:border-blue-500 transition-colors"
                      />
                    ) : (
                      <div className="h-28 rounded border border-dashed border-slate-800 flex items-center justify-center text-[11px] text-slate-500 text-center px-2">
                        No Front Image Uploaded
                      </div>
                    )}
                  </div>

                  <div className="bg-[#0B1220] border border-slate-800 rounded-lg p-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                      <span>NID Back Side</span>
                      {u.kycBackImage && (
                        <button
                          type="button"
                          onClick={() => setZoomImage({ label: `${u.fullName} — NID Back`, src: u.kycBackImage })}
                          className="text-blue-400 hover:text-white flex items-center gap-0.5"
                        >
                          <ZoomIn className="w-3 h-3" />
                          <span>Zoom</span>
                        </button>
                      )}
                    </div>
                    {u.kycBackImage ? (
                      <img
                        src={u.kycBackImage}
                        alt="NID Back"
                        onClick={() => setZoomImage({ label: `${u.fullName} — NID Back`, src: u.kycBackImage })}
                        className="w-full h-28 object-cover rounded cursor-pointer border border-slate-700 hover:border-blue-500 transition-colors"
                      />
                    ) : (
                      <div className="h-28 rounded border border-dashed border-slate-800 flex items-center justify-center text-[11px] text-slate-500 text-center px-2">
                        No Back Image Uploaded
                      </div>
                    )}
                  </div>
                </div>

                {u.kycNotes && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/20 border border-amber-500/20 rounded-lg p-2.5">
                    <strong>Note:</strong> {u.kycNotes}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleReviewKyc(u.id, 'APPROVED')}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Live KYC</span>
                  </button>
                  <button
                    onClick={() => {
                      setReviewModal({ user: u, action: 'ADDITIONAL_INFO_REQUIRED' });
                      setReviewNotes('Please upload a clearer front & back scan of your Government ID.');
                    }}
                    className="px-3 py-2 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Request Info</span>
                  </button>
                  <button
                    onClick={() => {
                      setReviewModal({ user: u, action: 'REJECTED' });
                      setReviewNotes('Document unreadable or identity mismatch.');
                    }}
                    className="px-3 py-2 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Users Overview */}
      <div className="pt-4">
        <h3 className="text-sm font-bold text-white mb-3">Approved KYC Traders ({approvedUsers.length})</h3>
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums font-mono min-w-[640px]">
              <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Trader Name</th>
                  <th className="py-2.5 px-4">Email</th>
                  <th className="py-2.5 px-4">Document Category</th>
                  <th className="py-2.5 px-4">Document ID</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">NID Photos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {approvedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      No approved trader KYC profiles yet.
                    </td>
                  </tr>
                ) : (
                  approvedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#151F30]/60">
                      <td className="py-2.5 px-4 font-bold text-white">{u.fullName}</td>
                      <td className="py-2.5 px-4 text-slate-300 font-mono">{u.email}</td>
                      <td className="py-2.5 px-4 text-slate-400">{u.kycDocumentType || 'NATIONAL_ID'}</td>
                      <td className="py-2.5 px-4 font-mono text-white">{u.kycDocumentNumber || 'Verified'}</td>
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          APPROVED
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {(u.kycFrontImage || u.kycBackImage) ? (
                          <button
                            type="button"
                            onClick={() => setPreviewDocUser(u)}
                            className="px-2.5 py-1 rounded bg-[#151F30] border border-slate-700 text-blue-400 hover:text-white text-[11px] font-semibold inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View NID</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold">Live Ledger Unlocked</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inspect Approved User Front/Back NID Modal */}
      {previewDocUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151F30] border border-slate-700 rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">{previewDocUser.fullName} — NID Verification Photos</h3>
                <div className="text-[11px] text-slate-400 font-mono">
                  {previewDocUser.kycDocumentType} · #{previewDocUser.kycDocumentNumber}
                </div>
              </div>
              <button onClick={() => setPreviewDocUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-semibold block">NID Front Side</span>
                {previewDocUser.kycFrontImage ? (
                  <img src={previewDocUser.kycFrontImage} alt="NID Front" className="w-full rounded-lg border border-slate-700" />
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">Not available</div>
                )}
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-semibold block">NID Back Side</span>
                {previewDocUser.kycBackImage ? (
                  <img src={previewDocUser.kycBackImage} alt="NID Back" className="w-full rounded-lg border border-slate-700" />
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">Not available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-[#111827] border border-slate-700 rounded-xl max-w-3xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{zoomImage.label}</span>
              <button onClick={() => setZoomImage(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={zoomImage.src} alt={zoomImage.label} className="w-full max-h-[75vh] object-contain rounded-lg bg-black" />
          </div>
        </div>
      )}

      {/* Review Notes Modal (Replaces window.prompt) */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151F30] border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {reviewModal.action === 'REJECTED' ? 'Reject KYC Verification' : 'Request Additional Documents'}
              </h3>
              <button onClick={() => setReviewModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-300">
              Applicant: <strong className="text-white">{reviewModal.user.fullName}</strong> ({reviewModal.user.email})
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Compliance Reason / Instructions</label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="Enter reason or requested document details..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewKyc(reviewModal.user.id, reviewModal.action, reviewNotes)}
                className={`px-4 py-2 rounded-lg text-white text-xs font-bold ${
                  reviewModal.action === 'REJECTED' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                Confirm {reviewModal.action === 'REJECTED' ? 'Rejection' : 'Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TradingAccountsAdminPage: React.FC = () => {
  const { accounts } = useTrading();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Trading Accounts &amp; Risk Monitor</h2>
        <p className="text-xs text-slate-400 mt-1">
          Distinguish isolated Demo ($1,000 one-time rule) from Live Trading Accounts.
        </p>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-[#151F30] border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Client Accounts Ledger ({accounts.length} Total Accounts)
          </span>
          <span className="text-[11px] text-blue-400 font-mono">Demo Rule: 1× $1,000 Starting Virtual Capital</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums font-mono min-w-[700px]">
            <thead className="bg-[#0B1220] text-slate-400 font-sans border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Account Number</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Server</th>
                <th className="py-3 px-4">Leverage</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Equity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {accounts.map((a) => (
                <tr key={a.id} className="hover:bg-[#151F30]/60">
                  <td className="py-3 px-4 font-bold text-white">{a.accountNumber}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold font-sans ${
                        a.mode === 'DEMO' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {a.mode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300 font-semibold">{a.type}</td>
                  <td className="py-3 px-4 text-slate-400">{a.server}</td>
                  <td className="py-3 px-4">{a.leverage}</td>
                  <td className="py-3 px-4 font-bold text-white">${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 font-bold text-white">${a.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-4 font-sans">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        a.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        a.mode === 'DEMO' ? 'text-blue-400 bg-blue-500/10' : 'text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {a.mode === 'DEMO' ? 'Simulated Feed' : 'Exec Disabled (Broker)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
