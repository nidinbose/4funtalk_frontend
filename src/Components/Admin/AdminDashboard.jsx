import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminGetUsers, adminUpdateUser, adminDeleteUser, logout } from "../../Redux/Features/authSlice";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtLastSeen = (iso) => {
  if (!iso) return "Never";
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return fmtDate(iso);
};

const statusDot = (s) => {
  if (s === "online") return "bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]";
  if (s === "incall") return "bg-amber-400  shadow-[0_0_6px_2px_rgba(251,191,36,0.5)]";
  return "bg-slate-600";
};
const statusBadge = (s) => {
  if (s === "online") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/25";
  if (s === "incall") return "text-amber-400  bg-amber-400/10  border-amber-400/25";
  return "text-slate-400 bg-slate-800/60 border-slate-600/30";
};
const acctBadge = (s) => {
  if (s === "active")    return "text-emerald-400 bg-emerald-400/10 border-emerald-400/25";
  if (s === "blocked")   return "text-rose-400   bg-rose-400/10   border-rose-400/25";
  if (s === "suspended") return "text-amber-400  bg-amber-400/10  border-amber-400/25";
  return "text-slate-400 bg-slate-800 border-slate-700";
};
const roleBadge = (r) => {
  if (r === "admin") return "text-violet-300 bg-violet-500/10 border-violet-500/25";
  if (r === "host")  return "text-cyan-300   bg-cyan-500/10   border-cyan-500/25";
  return "text-slate-400 bg-slate-800/60 border-slate-600/30";
};
const initials = (u) => (u?.username ?? "?").slice(0, 2).toUpperCase();

// ─── StatCard ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, gradient, sub }) => (
  <div className="rounded-2xl bg-white/5 border border-white/8 p-5 hover:border-white/15 transition-all duration-300 group">
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-lg mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="text-2xl font-extrabold text-white">{value ?? "—"}</p>
    <p className="text-slate-500 text-xs mt-0.5">{label}</p>
    {sub && <p className="text-[10px] text-slate-600 mt-1">{sub}</p>}
  </div>
);

// ─── EditModal ────────────────────────────────────────────────────────────────
const EditModal = ({ user, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    username: user.username ?? "",
    phone:    user.phone    ?? "",
    role:     user.role     ?? "user",
    status:   user.status   ?? "active",
    gender:   user.gender   ?? "",
    motherTongue: Array.isArray(user.motherTongue) ? user.motherTongue.join(", ") : (user.motherTongue ?? ""),
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    const updates = {
      ...form,
      motherTongue: form.motherTongue ? form.motherTongue.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    onSave(user._id, updates);
  };

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0d1220] border border-white/10 p-6 shadow-2xl"
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600
                            flex items-center justify-center text-sm font-bold text-white">
              {initials(user)}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user.username}</p>
              <p className="text-xs text-slate-500">{user.phone}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500
                       hover:text-white hover:bg-white/10 transition-all">✕</button>
        </div>

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Username</label>
            <input value={form.username} onChange={e => set("username", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                         focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Phone</label>
            <input value={form.phone} onChange={e => set("phone", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                         focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Role */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Role</label>
              <select value={form.role} onChange={e => set("role", e.target.value)}
                className="w-full bg-[#0d1220] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                           focus:outline-none focus:border-violet-500/50 transition-all">
                <option value="user">User</option>
                <option value="host">Host</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Account Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className="w-full bg-[#0d1220] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                           focus:outline-none focus:border-cyan-500/50 transition-all">
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Gender</label>
              <select value={form.gender} onChange={e => set("gender", e.target.value)}
                className="w-full bg-[#0d1220] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white
                           focus:outline-none focus:border-cyan-500/50 transition-all">
                <option value="">—</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Mother Tongue */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1">Mother Tongue</label>
              <input value={form.motherTongue} onChange={e => set("motherTongue", e.target.value)}
                placeholder="e.g. Hindi, Tamil"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                           focus:outline-none focus:border-cyan-500/50 transition-all" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-semibold
                       hover:bg-white/5 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
                       text-white text-sm font-bold shadow-lg shadow-cyan-500/20
                       hover:opacity-90 disabled:opacity-50 transition-all">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DeleteConfirm ────────────────────────────────────────────────────────────
const DeleteConfirm = ({ user, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
    <div className="w-full max-w-sm rounded-3xl bg-[#0d1220] border border-rose-500/20 p-6 shadow-2xl"
         onClick={e => e.stopPropagation()}>
      <div className="text-3xl mb-3 text-center">⚠️</div>
      <h3 className="text-base font-bold text-white text-center mb-1">Delete User?</h3>
      <p className="text-xs text-slate-500 text-center mb-5">
        <span className="text-rose-400 font-semibold">@{user.username}</span> will be permanently removed. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-semibold
                     hover:bg-white/5 hover:text-white transition-all">
          Cancel
        </button>
        <button onClick={() => onConfirm(user._id)} disabled={deleting}
          className="flex-1 py-2.5 rounded-xl bg-rose-500/80 hover:bg-rose-500
                     text-white text-sm font-bold transition-all disabled:opacity-50">
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, token, isAuthenticated, adminUsers, adminStats, adminPagination, adminLoading, adminError } =
    useSelector(s => s.auth);

  // Filters
  const [search,    setSearch]    = useState("");
  const [roleF,     setRoleF]     = useState("");
  const [statusF,   setStatusF]   = useState("");
  const [onlineF,   setOnlineF]   = useState("");
  const [page,      setPage]      = useState(1);
  const [sortBy,    setSortBy]    = useState("-createdAt");

  // Modal state
  const [editUser,   setEditUser]   = useState(null);
  const [delUser,    setDelUser]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [toast,      setToast]      = useState(null);

  // ── Auth guard ──
  useEffect(() => {
    if (!isAuthenticated || !token) { navigate("/login"); return; }
    if (user?.role !== "admin")     { navigate("/home"); return; }
  }, [isAuthenticated, token, user, navigate]);

  // ── Load users ──
  const load = useCallback(() => {
    const params = { page, limit: 15, sort: sortBy };
    if (search)  params.search            = search;
    if (roleF)   params.role              = roleF;
    if (statusF) params.status            = statusF;
    if (onlineF) params.userCurrentStatus = onlineF;
    dispatch(adminGetUsers(params));
  }, [dispatch, page, search, roleF, statusF, onlineF, sortBy]);

  useEffect(() => { load(); }, [load]);

  // ── Debounce search ──
  const [searchTmp, setSearchTmp] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchTmp); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchTmp]);

  // ── Toast helper ──
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Save edit ──
  const handleSave = async (userId, updates) => {
    setSaving(true);
    const res = await dispatch(adminUpdateUser({ userId, updates }));
    setSaving(false);
    if (res.meta.requestStatus === "fulfilled") {
      setEditUser(null);
      showToast("User updated successfully");
    } else {
      showToast(res.payload ?? "Update failed", "error");
    }
  };

  // ── Delete ──
  const handleDelete = async (userId) => {
    setDeleting(true);
    const res = await dispatch(adminDeleteUser(userId));
    setDeleting(false);
    if (res.meta.requestStatus === "fulfilled") {
      setDelUser(null);
      showToast("User deleted");
      if (adminUsers.length <= 1 && page > 1) setPage(p => p - 1);
    } else {
      showToast(res.payload ?? "Delete failed", "error");
    }
  };

  // ── Quick block/unblock ──
  const handleToggleBlock = async (u) => {
    const newStatus = u.status === "blocked" ? "active" : "blocked";
    const res = await dispatch(adminUpdateUser({ userId: u._id, updates: { status: newStatus } }));
    if (res.meta.requestStatus === "fulfilled") {
      showToast(`User ${newStatus === "blocked" ? "blocked" : "unblocked"}`);
    }
  };

  if (!isAuthenticated || user?.role !== "admin") return null;

  const totalPages = adminPagination?.pages ?? 1;

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-200 font-sans overflow-x-hidden">

      {/* Background glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-violet-600/6 blur-[180px]" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-cyan-600/6 blur-[160px]" />
      </div>

      <div className="relative z-10">

        {/* ═══ HEADER ═══ */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5
                           bg-[#070b14]/85 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600
                            flex items-center justify-center text-white font-extrabold text-xs
                            shadow-lg shadow-violet-500/30">AD</div>
            <div>
              <span className="text-base font-bold bg-clip-text text-transparent
                               bg-gradient-to-r from-white to-slate-400">Admin Dashboard</span>
              <span className="ml-2 text-[10px] font-semibold text-violet-400 bg-violet-500/10
                               border border-violet-500/30 px-1.5 py-0.5 rounded-full">4FunTalk</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/home")}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400
                         hover:text-white hover:bg-white/10 border border-transparent
                         hover:border-white/10 transition-all">
              ← Back to App
            </button>
            <button onClick={() => { dispatch(logout()); navigate("/login"); }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400
                         hover:text-white hover:bg-rose-500/20 border border-transparent
                         hover:border-rose-500/40 transition-all">
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Title banner */}
          <div className="rounded-3xl bg-gradient-to-br from-violet-600/15 to-indigo-700/15
                          border border-violet-500/15 p-5 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-extrabold">
              👑 Welcome,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                {user?.username}
              </span>
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Manage all users, change roles, block/unblock accounts, and monitor platform health.
            </p>
          </div>

          {/* Stats */}
          {adminStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard label="Total Users"    value={adminStats.totalAll} icon="👥" gradient="from-cyan-500 to-blue-600" />
              <StatCard label="Online Now"     value={adminStats.online}   icon="🟢" gradient="from-emerald-400 to-teal-600" />
              <StatCard label="Blocked"        value={adminStats.blocked}  icon="🚫" gradient="from-rose-500 to-red-600" />
              <StatCard label="Admins"         value={adminStats.admins}   icon="👑" gradient="from-violet-500 to-purple-700" />
              <StatCard label="Hosts"          value={adminStats.hosts}    icon="🎙️" gradient="from-amber-400 to-orange-500" />
            </div>
          )}

          {/* Filters bar */}
          <div className="rounded-2xl bg-white/5 border border-white/8 p-4 flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
              <input
                id="admin-search"
                value={searchTmp}
                onChange={e => setSearchTmp(e.target.value)}
                placeholder="Search username or phone…"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white
                           placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>

            {/* Role filter */}
            <select value={roleF} onChange={e => { setRoleF(e.target.value); setPage(1); }}
              className="bg-[#0d1220] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300
                         focus:outline-none focus:border-violet-500/50 transition-all">
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="host">Host</option>
              <option value="admin">Admin</option>
            </select>

            {/* Account status filter */}
            <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}
              className="bg-[#0d1220] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300
                         focus:outline-none focus:border-cyan-500/50 transition-all">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Online status filter */}
            <select value={onlineF} onChange={e => { setOnlineF(e.target.value); setPage(1); }}
              className="bg-[#0d1220] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300
                         focus:outline-none focus:border-emerald-500/50 transition-all">
              <option value="">All Presence</option>
              <option value="online">Online</option>
              <option value="incall">In Call</option>
              <option value="offline">Offline</option>
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="bg-[#0d1220] border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300
                         focus:outline-none focus:border-white/20 transition-all">
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="username">A–Z</option>
              <option value="-username">Z–A</option>
            </select>

            {/* Refresh */}
            <button onClick={load}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm
                         hover:text-white hover:bg-white/10 transition-all">
              🔄
            </button>
          </div>

          {/* Error */}
          {adminError && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 px-5 py-3 text-sm">
              ⚠️ {adminError}
            </div>
          )}

          {/* Users Table */}
          <div className="rounded-3xl bg-white/5 border border-white/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">User</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 hidden sm:table-cell">Phone</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Role</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5">Account</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Presence</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Last Seen</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Joined</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-slate-600">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                          <span className="text-xs">Loading users…</span>
                        </div>
                      </td>
                    </tr>
                  ) : adminUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-slate-600 text-sm">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    adminUsers.map((u, i) => (
                      <tr key={u._id}
                          className={`border-b border-white/4 hover:bg-white/4 transition-colors duration-100
                                      ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                        {/* User */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              {u.avatar ? (
                                <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600
                                                flex items-center justify-center text-xs font-bold text-white">
                                  {initials(u)}
                                </div>
                              )}
                              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full
                                                border border-[#070b14] ${statusDot(u.userCurrentStatus)}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm leading-tight">{u.username}</p>
                              <p className="text-[10px] text-slate-600 font-mono">{u._id.slice(0, 8)}…</p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <span className="text-slate-400 font-mono text-xs">{u.phone}</span>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full capitalize ${roleBadge(u.role)}`}>
                            {u.role}
                          </span>
                        </td>

                        {/* Account status */}
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full capitalize ${acctBadge(u.status)}`}>
                            {u.status}
                          </span>
                        </td>

                        {/* Presence */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full capitalize ${statusBadge(u.userCurrentStatus)}`}>
                            {u.userCurrentStatus ?? "offline"}
                          </span>
                        </td>

                        {/* Last seen */}
                        <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-slate-500">
                          {fmtLastSeen(u.lastSeen)}
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-slate-500">
                          {fmtDate(u.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {/* Block toggle */}
                            <button
                              onClick={() => handleToggleBlock(u)}
                              title={u.status === "blocked" ? "Unblock" : "Block"}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all
                                ${u.status === "blocked"
                                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25"
                                  : "bg-amber-500/10  text-amber-400  hover:bg-amber-500/20  border border-amber-500/25"}`}>
                              {u.status === "blocked" ? "✓" : "🚫"}
                            </button>

                            {/* Edit */}
                            <button onClick={() => setEditUser(u)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs
                                         bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20
                                         border border-cyan-500/25 transition-all">
                              ✏️
                            </button>

                            {/* Delete — protect yourself */}
                            {u._id !== user?._id && (
                              <button onClick={() => setDelUser(u)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs
                                           bg-rose-500/10 text-rose-400 hover:bg-rose-500/20
                                           border border-rose-500/25 transition-all">
                                🗑️
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/5">
                <p className="text-xs text-slate-500">
                  Page {page} of {totalPages} · {adminPagination?.total ?? 0} users
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10
                               text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all">
                    ← Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10
                               text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ── Modals ── */}
      {editUser && (
        <EditModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSave} saving={saving} />
      )}
      {delUser && (
        <DeleteConfirm user={delUser} onClose={() => setDelUser(null)} onConfirm={handleDelete} deleting={deleting} />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl text-sm font-semibold
                         shadow-2xl border transition-all duration-300 ${
                           toast.type === "error"
                             ? "bg-rose-500/20 border-rose-500/30 text-rose-300"
                             : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                         }`}>
          {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
