import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { StaffRecord, RoleRecord, PermissionCategory } from '../../types/admin';
import {
  UserCog, Key, Plus, Search, ShieldCheck, ShieldAlert,
  Edit, Trash2, Lock, Unlock, RefreshCw, History, X, Check,
  ChevronLeft, ChevronRight, Copy, ArrowUpDown, Users
} from 'lucide-react';

const ALL_PERMISSIONS: PermissionCategory[] = [
  'Dashboard', 'Users', 'Staff', 'Roles', 'Accounts', 'KYC',
  'Deposits', 'Withdrawals', 'Payment Methods', 'Trading',
  'Markets', 'Reports', 'CMS', 'Website Settings',
  'Notifications', 'Support', 'Security', 'Audit Logs'
];

const DEPARTMENTS: StaffRecord['department'][] = [
  'Executive', 'Finance', 'Compliance', 'Dealing Desk', 'Support', 'IT / Security', 'Marketing'
];

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('nextrade_token');
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export const StaffManagementPage: React.FC = () => {
  const { addToast } = useToast();
  const { isAdmin } = useAuth();

  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filters, Sorting, Pagination
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'name' | 'staffId' | 'department' | 'assignedRole' | 'createdAt'>('staffId');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffRecord | null>(null);
  const [permTarget, setPermTarget] = useState<StaffRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffRecord | null>(null);
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ staff: StaffRecord; tempPassword: string } | null>(null);
  const [logsTarget, setLogsTarget] = useState<{ staff: StaffRecord; logs: any[] } | null>(null);

  // Add/Edit form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+880 17',
    department: 'Support' as StaffRecord['department'],
    jobTitle: '',
    assignedRole: 'CUSTOMER_SUPPORT',
    initialPassword: 'StaffSecure#2026!',
    permissions: [] as PermissionCategory[]
  });

  const fetchStaffAndRoles = async () => {
    try {
      setLoading(true);
      const headers = authHeaders();
      const [stRes, rlRes] = await Promise.all([
        fetch('/api/admin/staff', { headers, credentials: 'include' }),
        fetch('/api/admin/roles', { headers, credentials: 'include' })
      ]);
      if (stRes.ok) {
        const d = await stRes.json();
        if (d.success && Array.isArray(d.staff)) setStaff(d.staff);
      }
      if (rlRes.ok) {
        const d = await rlRes.json();
        if (d.success && Array.isArray(d.roles)) setRoles(d.roles);
      }
    } catch (err) {
      console.error('[Staff] Load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAndRoles();
  }, []);

  const openAddModal = () => {
    const defaultRole = roles.find(r => r.roleKey === 'CUSTOMER_SUPPORT') || roles[0];
    setFormData({
      name: '',
      email: '',
      phone: '+880 17',
      department: 'Support',
      jobTitle: '',
      assignedRole: defaultRole?.roleKey || 'CUSTOMER_SUPPORT',
      initialPassword: 'StaffSecure#2026!',
      permissions: defaultRole?.permissions || ['Dashboard', 'Support']
    });
    setAddModalOpen(true);
  };

  const handleRoleSelectInForm = (roleKey: string) => {
    const r = roles.find(x => x.roleKey === roleKey);
    setFormData(prev => ({
      ...prev,
      assignedRole: roleKey,
      permissions: r ? [...r.permissions] : prev.permissions
    }));
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ type: 'success', title: 'Staff Created', message: data.message });
        setAddModalOpen(false);
        fetchStaffAndRoles();
      } else {
        addToast({ type: 'error', title: 'Creation Failed', message: data.message || 'Could not add staff member.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Network Error', message: 'Server unreachable.' });
    }
  };

  const openEditModal = (s: StaffRecord) => {
    setEditTarget(s);
    setFormData({
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      department: s.department,
      jobTitle: s.jobTitle,
      assignedRole: s.assignedRole,
      initialPassword: '',
      permissions: [...s.permissions]
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      const res = await fetch(`/api/admin/staff/${editTarget.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
          jobTitle: formData.jobTitle,
          assignedRole: formData.assignedRole
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ type: 'success', title: 'Staff Updated', message: data.message });
        setEditTarget(null);
        fetchStaffAndRoles();
      } else {
        addToast({ type: 'error', title: 'Update Failed', message: data.message });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update staff.' });
    }
  };

  const handleSavePermissions = async () => {
    if (!permTarget) return;
    try {
      const res = await fetch(`/api/admin/staff/${permTarget.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ permissions: permTarget.permissions })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ type: 'success', title: 'Permissions Saved', message: `Updated ${permTarget.permissions.length} granular permissions for ${permTarget.name}.` });
        setPermTarget(null);
        fetchStaffAndRoles();
      } else {
        addToast({ type: 'error', title: 'Failed', message: data.message });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Could not update permissions.' });
    }
  };

  const handleToggleStatus = async (s: StaffRecord) => {
    const nextStatus = s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/staff/${s.id}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ type: nextStatus === 'ACTIVE' ? 'success' : 'warning', title: 'Status Updated', message: data.message });
        fetchStaffAndRoles();
      } else {
        addToast({ type: 'error', title: 'Action Denied', message: data.message });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Network error.' });
    }
  };

  const handleResetPassword = async (s: StaffRecord) => {
    try {
      const res = await fetch(`/api/admin/staff/${s.id}/reset-password`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTempPasswordInfo({ staff: s, tempPassword: data.tempPassword });
        addToast({ type: 'success', title: 'Temporary Password Issued', message: `Password reset for ${s.name}.` });
      } else {
        addToast({ type: 'error', title: 'Failed', message: data.message });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Network error.' });
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/staff/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ type: 'warning', title: 'Staff Revoked', message: data.message });
        setDeleteTarget(null);
        fetchStaffAndRoles();
      } else {
        addToast({ type: 'error', title: 'Action Denied', message: data.message });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Network error.' });
    }
  };

  const handleViewLogs = async (s: StaffRecord) => {
    try {
      const res = await fetch(`/api/admin/staff/${s.id}/logs`, {
        headers: authHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      setLogsTarget({ staff: s, logs: data.logs || [] });
    } catch {
      setLogsTarget({ staff: s, logs: [] });
    }
  };

  const filteredAndSorted = useMemo(() => {
    return staff
      .filter(s => {
        const q = search.toLowerCase();
        const matchesSearch =
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.staffId.toLowerCase().includes(q) ||
          s.jobTitle.toLowerCase().includes(q);
        const matchesDept = deptFilter === 'ALL' || s.department === deptFilter;
        const matchesRole = roleFilter === 'ALL' || s.assignedRole === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
        return matchesSearch && matchesDept && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        const av = String(a[sortField] || '').toLowerCase();
        const bv = String(b[sortField] || '').toLowerCase();
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [staff, search, deptFilter, roleFilter, statusFilter, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginated = filteredAndSorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Staff Management &amp; Access Control</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase">
              {staff.length} Operators
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Provision back-office operators, enforce departmental role boundaries, manage granular permissions, and audit staff activity.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Staff</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{staff.length}</div>
        </div>
        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Active Operators</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {staff.filter(s => s.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Suspended</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {staff.filter(s => s.status === 'SUSPENDED').length}
          </div>
        </div>
        <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Configured Roles</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{roles.length}</div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, email, Staff ID, or job title..."
              className="w-full bg-[#0B1220] border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
            className="bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Roles</option>
            {roles.map(r => <option key={r.roleKey} value={r.roleKey}>{r.name}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[920px]">
            <thead className="bg-[#0B1220] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort('staffId')} className="flex items-center gap-1 hover:text-white">
                    <span>Staff ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-white">
                    <span>Staff Member</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort('department')} className="flex items-center gap-1 hover:text-white">
                    <span>Department &amp; Title</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">
                  <button onClick={() => toggleSort('assignedRole')} className="flex items-center gap-1 hover:text-white">
                    <span>Assigned Role</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                    Loading staff directory...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No staff members match your current filters.
                  </td>
                </tr>
              ) : (
                paginated.map(s => {
                  const isSuper = s.assignedRole === 'SUPER_ADMIN';
                  return (
                    <tr key={s.id} className="hover:bg-[#151F30]/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-300 font-bold">{s.staffId}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                            alt={s.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white">{s.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{s.email}</div>
                            {s.phone && <div className="text-[10px] text-slate-500 font-mono">{s.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-semibold">{s.department}</div>
                        <div className="text-[11px] text-slate-400">{s.jobTitle}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                          isSuper
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        }`}>
                          {s.assignedRole}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => !isSuper && setPermTarget({ ...s })}
                          disabled={isSuper}
                          className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors ${
                            isSuper
                              ? 'bg-slate-800/40 border-slate-800 text-amber-400 cursor-not-allowed'
                              : 'bg-[#0B1220] border-slate-700 text-slate-200 hover:border-amber-500 hover:text-amber-300'
                          }`}
                          title={isSuper ? 'Super Admin privileges cannot be downgraded' : 'Manage granular permissions'}
                        >
                          {s.permissions.length} / {ALL_PERMISSIONS.length} Modules
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() : 'Never'}
                        <div className="text-[10px] text-slate-500">
                          Joined {new Date(s.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : s.status === 'SUSPENDED'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewLogs(s)}
                            className="p-1.5 rounded bg-[#0B1220] border border-slate-700 text-slate-300 hover:text-white"
                            title="Activity History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 rounded bg-[#0B1220] border border-slate-700 text-slate-300 hover:text-blue-400"
                            title="Edit Staff Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(s)}
                            className="p-1.5 rounded bg-[#0B1220] border border-slate-700 text-slate-300 hover:text-amber-400"
                            title="Reset Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          {!isSuper && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(s)}
                                className={`p-1.5 rounded bg-[#0B1220] border border-slate-700 ${
                                  s.status === 'ACTIVE' ? 'text-amber-400 hover:text-rose-400' : 'text-emerald-400 hover:text-emerald-300'
                                }`}
                                title={s.status === 'ACTIVE' ? 'Suspend Staff' : 'Activate Staff'}
                              >
                                {s.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => setDeleteTarget(s)}
                                  className="p-1.5 rounded bg-[#0B1220] border border-slate-700 text-rose-400 hover:bg-rose-600 hover:text-white"
                                  title="Revoke / Delete Staff"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {paginated.length} of {filteredAndSorted.length} staff members
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-[#0B1220] border border-slate-700 disabled:opacity-40 hover:text-white"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono">Page {page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded bg-[#0B1220] border border-slate-700 disabled:opacity-40 hover:text-white"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#111827] border border-amber-500/40 rounded-2xl p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Provision New Staff Account</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Nadia Islam"
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nadia.compliance@nextrade.io"
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1712-000000"
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Initial Password</label>
                  <input
                    type="text"
                    required
                    value={formData.initialPassword}
                    onChange={e => setFormData({ ...formData, initialPassword: e.target.value })}
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as any })}
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g. Junior AML Officer"
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                <select
                  value={formData.assignedRole}
                  onChange={e => handleRoleSelectInForm(e.target.value)}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white font-mono"
                >
                  {roles.map(r => (
                    <option key={r.roleKey} value={r.roleKey}>
                      {r.name} ({r.roleKey})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Granular Module Permissions ({formData.permissions.length} selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 bg-[#0B1220] border border-slate-800 rounded-lg">
                  {ALL_PERMISSIONS.map(perm => {
                    const checked = formData.permissions.includes(perm);
                    return (
                      <label key={perm} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setFormData(prev => ({
                              ...prev,
                              permissions: checked
                                ? prev.permissions.filter(p => p !== perm)
                                : [...prev.permissions, perm]
                            }));
                          }}
                          className="rounded border-slate-700 bg-slate-900 text-amber-500"
                        />
                        <span>{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Create Staff Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111827] border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Staff Profile ({editTarget.staffId})</h3>
              <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value as any })}
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                <select
                  disabled={editTarget.assignedRole === 'SUPER_ADMIN'}
                  value={formData.assignedRole}
                  onChange={e => setFormData({ ...formData, assignedRole: e.target.value })}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2 text-white font-mono disabled:opacity-60"
                >
                  {roles.map(r => (
                    <option key={r.roleKey} value={r.roleKey}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Granular Permissions Modal */}
      {permTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#111827] border border-amber-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Granular Permissions — {permTarget.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">{permTarget.staffId} · Role: {permTarget.assignedRole}</p>
              </div>
              <button onClick={() => setPermTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-[#0B1220] border border-slate-800 rounded-xl text-xs">
              {ALL_PERMISSIONS.map(perm => {
                const enabled = permTarget.permissions.includes(perm);
                return (
                  <label
                    key={perm}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      enabled
                        ? 'bg-amber-500/10 border-amber-500/40 text-white font-semibold'
                        : 'bg-[#111827] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => {
                        setPermTarget(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            permissions: enabled
                              ? prev.permissions.filter(p => p !== perm)
                              : [...prev.permissions, perm]
                          };
                        });
                      }}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500"
                    />
                    <span className="truncate">{perm}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setPermTarget(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs">
                Cancel
              </button>
              <button onClick={handleSavePermissions} className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs">
                Apply Permissions ({permTarget.permissions.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111827] border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Revoke Staff Access?</h3>
                <p className="text-xs text-slate-400">{deleteTarget.name} ({deleteTarget.staffId})</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently remove <strong className="text-white">{deleteTarget.email}</strong> from active administrative operators. All historical audit trail records remain preserved.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs">
                Cancel
              </button>
              <button onClick={handleDeleteStaff} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs">
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Password Modal */}
      {tempPasswordInfo && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111827] border border-emerald-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Temporary Password Generated</h3>
              <button onClick={() => setTempPasswordInfo(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Share this one-time temporary credential securely with <strong className="text-white">{tempPasswordInfo.staff.name}</strong> ({tempPasswordInfo.staff.email}):
            </p>
            <div className="p-3 bg-[#0B1220] border border-slate-700 rounded-lg flex items-center justify-between font-mono text-sm font-bold text-emerald-400">
              <span>{tempPasswordInfo.tempPassword}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tempPasswordInfo.tempPassword);
                  addToast({ type: 'info', title: 'Copied', message: 'Temporary password copied to clipboard.' });
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1 font-sans"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
            <button
              onClick={() => setTempPasswordInfo(null)}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Staff Activity History Modal */}
      {logsTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111827] border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Operator Activity Log — {logsTarget.staff.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">{logsTarget.staff.email}</p>
              </div>
              <button onClick={() => setLogsTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 text-xs font-mono">
              {logsTarget.logs.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-sans">
                  No recorded back-office actions for this operator yet.
                </div>
              ) : (
                logsTarget.logs.map((l: any) => (
                  <div key={l.id} className="py-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-amber-400 font-bold">{l.action}</span>
                      <span className="text-slate-500">{new Date(l.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-200 font-sans">{l.details}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const RolesPermissionsPage: React.FC = () => {
  const { addToast } = useToast();
  const { isAdmin } = useAuth();

  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleRecord | null>(null);
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<RoleRecord | null>(null);

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: ['Dashboard'] as PermissionCategory[]
  });

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/roles', {
        headers: authHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.roles)) {
        setRoles(data.roles);
      }
    } catch {
      console.error('[Roles] Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(roleForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ type: 'success', title: 'Custom Role Created', message: data.message });
        setCreateOpen(false);
        setRoleForm({ name: '', description: '', permissions: ['Dashboard'] });
        fetchRoles();
      } else {
        addToast({ type: 'error', title: 'Error', message: data.message });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create role.' });
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRole) return;
    try {
      const res = await fetch(`/api/admin/roles/${editRole.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          name: editRole.name,
          description: editRole.description,
          permissions: editRole.permissions
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ type: 'success', title: 'Role Updated', message: data.message });
        setEditRole(null);
        fetchRoles();
      } else {
        addToast({ type: 'error', title: 'Error', message: data.message });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update role.' });
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleTarget) return;
    try {
      const res = await fetch(`/api/admin/roles/${deleteRoleTarget.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast({ type: 'warning', title: 'Custom Role Deleted', message: data.message });
        setDeleteRoleTarget(null);
        fetchRoles();
      } else {
        addToast({ type: 'error', title: 'Denied', message: data.message });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete role.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">RBAC Roles &amp; 18-Category Permission Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure system-level and custom staff roles. Super Administrator privileges remain strictly protected.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        )}
      </div>

      {/* Role Cards Grid */}
      {loading ? (
        <div className="p-10 text-center text-slate-400 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
          Loading RBAC role matrix...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map(role => {
            const isSuper = role.roleKey === 'SUPER_ADMIN';
            return (
              <div
                key={role.id}
                className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
                  isSuper
                    ? 'bg-[#151F30] border-amber-500/40'
                    : 'bg-[#111827] border-slate-800'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{role.name}</h3>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          role.isSystem ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {role.isSystem ? 'SYSTEM' : 'CUSTOM'}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{role.roleKey}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B1220] border border-slate-700 text-emerald-400 font-bold">
                      {role.permissions.length} / {ALL_PERMISSIONS.length}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{role.description}</p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {role.permissions.slice(0, 8).map(p => (
                      <span
                        key={p}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#0B1220] border border-slate-800 text-slate-300"
                      >
                        {p}
                      </span>
                    ))}
                    {role.permissions.length > 8 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold">
                        +{role.permissions.length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {role.userCount} assigned
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={isSuper}
                        onClick={() => setEditRole({ ...role, permissions: [...role.permissions] })}
                        className="px-2.5 py-1 rounded bg-[#0B1220] border border-slate-700 text-slate-200 hover:text-white disabled:opacity-40 text-[11px] font-semibold"
                      >
                        {isSuper ? 'Protected' : 'Edit Matrix'}
                      </button>
                      {!role.isSystem && (
                        <button
                          onClick={() => setDeleteRoleTarget(role)}
                          className="p-1.5 rounded bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30"
                          title="Delete Custom Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Custom Role Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#111827] border border-amber-500/40 rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Custom RBAC Role</h3>
              <button onClick={() => setCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  value={roleForm.name}
                  onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="e.g. Regional Compliance Auditor"
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Scope &amp; Responsibility</label>
                <textarea
                  rows={2}
                  required
                  value={roleForm.description}
                  onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Describe what actions this role is authorized to perform..."
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-semibold">18-Category Permission Matrix</span>
                  <div className="flex gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setRoleForm(p => ({ ...p, permissions: [...ALL_PERMISSIONS] }))}
                      className="text-amber-400 hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleForm(p => ({ ...p, permissions: ['Dashboard'] }))}
                      className="text-slate-400 hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#0B1220] border border-slate-800 rounded-xl">
                  {ALL_PERMISSIONS.map(perm => {
                    const checked = roleForm.permissions.includes(perm);
                    return (
                      <label key={perm} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setRoleForm(prev => ({
                              ...prev,
                              permissions: checked
                                ? prev.permissions.filter(p => p !== perm)
                                : [...prev.permissions, perm]
                            }));
                          }}
                          className="rounded border-slate-700 bg-slate-900 text-amber-500"
                        />
                        <span>{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold">
                  Create Custom Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Matrix Modal */}
      {editRole && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#111827] border border-blue-500/40 rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Edit Role Matrix — {editRole.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">{editRole.roleKey}</p>
              </div>
              <button onClick={() => setEditRole(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateRole} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={editRole.description}
                  onChange={e => setEditRole({ ...editRole, description: e.target.value })}
                  className="w-full bg-[#0B1220] border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#0B1220] border border-slate-800 rounded-xl">
                {ALL_PERMISSIONS.map(perm => {
                  const checked = editRole.permissions.includes(perm);
                  return (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setEditRole(prev => prev ? ({
                            ...prev,
                            permissions: checked
                              ? prev.permissions.filter(p => p !== perm)
                              : [...prev.permissions, perm]
                          }) : null);
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-blue-500"
                      />
                      <span>{perm}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditRole(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold">
                  Save Role Matrix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Role Modal */}
      {deleteRoleTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#111827] border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Custom Role?</h3>
            <p className="text-xs text-slate-300">
              Delete <strong className="text-white">{deleteRoleTarget.name}</strong> ({deleteRoleTarget.roleKey})? Built-in system roles remain protected.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteRoleTarget(null)} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs">
                Cancel
              </button>
              <button onClick={handleDeleteRole} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
