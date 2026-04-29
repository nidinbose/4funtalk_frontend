import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, fetchProfile } from '../../Redux/Features/authSlice';
import AvatarBuilder, { AvatarSVG, getAvatarConfig } from './AvatarBuilder';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const fmtLastSeen = (iso) => {
  if (!iso) return '—';
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return fmtDate(iso);
};

const Badge = ({ color = 'slate', children }) => {
  const map = {
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
    amber:   'text-amber-400  bg-amber-400/10  border-amber-400/25',
    rose:    'text-rose-400   bg-rose-400/10   border-rose-400/25',
    violet:  'text-violet-400 bg-violet-400/10 border-violet-400/25',
    cyan:    'text-cyan-400   bg-cyan-400/10   border-cyan-400/25',
    slate:   'text-slate-400  bg-slate-700/40  border-slate-600/30',
  };
  return (
    <span className={`text-xs font-semibold border px-2.5 py-0.5 rounded-full capitalize ${map[color]}`}>
      {children}
    </span>
  );
};

const InputField = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      {hint && <span className="text-[10px] text-slate-600 italic">{hint}</span>}
    </div>
    {children}
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const ProfileSettings = () => {
  const dispatch = useDispatch();
  const { user, profileLoading } = useSelector((s) => s.auth);

  const initials = (user?.username ?? '?').slice(0, 2).toUpperCase();

  // Fetch fresh profile on mount (gets latest avatarConfig from DB)
  useEffect(() => { dispatch(fetchProfile()); }, [dispatch]);

  // ── Tabs ──
  const [activeTab, setActiveTab] = useState('profile');

  // ── Editable form ──
  const [form, setForm] = useState({
    username:     user?.username ?? '',
    gender:       user?.gender   ?? '',
    dob:          user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    motherTongue: Array.isArray(user?.motherTongue)
      ? user.motherTongue.join(', ')
      : (user?.motherTongue ?? ''),
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Toast ──
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Save profile ──
  const [profileSaving, setProfileSaving] = useState(false);
  const handleProfileSave = async () => {
    const payload = {};
    const trimU = form.username.trim();
    if (trimU && trimU !== user?.username) payload.username = trimU;
    if (form.gender && form.gender !== (user?.gender ?? '')) payload.gender = form.gender;
    if (form.dob) {
      const existing = user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '';
      if (form.dob !== existing) payload.dob = form.dob;
    }
    const mt = form.motherTongue.split(',').map((s) => s.trim()).filter(Boolean);
    const curMt = Array.isArray(user?.motherTongue) ? user.motherTongue : [];
    if (JSON.stringify(mt) !== JSON.stringify(curMt)) payload.motherTongue = mt;

    if (!Object.keys(payload).length) { showToast('No changes detected', 'error'); return; }
    setProfileSaving(true);
    const res = await dispatch(updateProfile(payload));
    setProfileSaving(false);
    if (res.meta.requestStatus === 'fulfilled') showToast('Profile saved!');
    else showToast(res.payload ?? 'Save failed', 'error');
  };

  // ── Status ──
  const currentStatus = user?.userCurrentStatus ?? 'offline';
  const statusStyles = {
    online:  { dot: 'bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,.5)]', active: 'bg-emerald-400/10 border-emerald-400/40 text-emerald-300', emoji: '🟢' },
    incall:  { dot: 'bg-amber-400  shadow-[0_0_6px_2px_rgba(251,191,36,.5)]',  active: 'bg-amber-400/10  border-amber-400/40  text-amber-300',  emoji: '🟡' },
    offline: { dot: 'bg-slate-500',                                              active: 'bg-slate-700/60  border-slate-500/40  text-slate-300',  emoji: '⚫' },
  };

  // Effective avatar config — saved config > gender default > hard default
  const avatarCfg = getAvatarConfig(user);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* ════ LEFT — Identity card ════ */}
      <div className="space-y-4">

        {/* Avatar + name */}
        <div className="rounded-3xl bg-white/5 border border-white/8 p-6 flex flex-col items-center gap-4">

          {/* SVG Avatar — always shown, based on saved config or gender default */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-slate-900
                            border-4 border-cyan-500/30 shadow-xl shadow-cyan-500/20
                            overflow-hidden flex items-center justify-center">
              <AvatarSVG config={avatarCfg} size={88}/>
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full
                              border-2 border-[#070b14] ${statusStyles[currentStatus]?.dot}`}/>
          </div>

          <div className="text-center">
            <h2 className="text-lg font-extrabold text-white leading-tight">{user?.username ?? '—'}</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{user?.phone ?? '—'}</p>
            {user?.gender && (
              <span className="text-xs text-slate-400 capitalize mt-1 inline-block">
                {user.gender === 'male' ? '♂' : user.gender === 'female' ? '♀' : '⚧'} {user.gender}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            <Badge color={user?.role === 'admin' ? 'violet' : user?.role === 'host' ? 'cyan' : 'slate'}>
              {user?.role ?? 'user'}
            </Badge>
            <Badge color={user?.status === 'active' ? 'emerald' : 'rose'}>
              {user?.status ?? '—'}
            </Badge>
            {user?.isVerified && <Badge color="emerald">✓ Verified</Badge>}
          </div>

          {/* Avatar source label */}
          <p className="text-[10px] text-slate-600 text-center">
            {user?.avatarConfig && Object.keys(user.avatarConfig).length > 0
              ? '🎨 Custom avatar (saved)'
              : `🤖 Gender default${user?.gender ? ` (${user.gender})` : ''} — customise in Avatar Builder`}
          </p>
        </div>

        {/* Quick info */}
        <div className="rounded-3xl bg-white/5 border border-white/8 p-5 space-y-3">
          {[
            { label: 'Member Since',  value: fmtDate(user?.createdAt) },
            { label: 'Last Seen',     value: fmtLastSeen(user?.lastSeen) },
            { label: 'Gender',        value: user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '—' },
            { label: 'DOB',           value: fmtDate(user?.dob) },
            { label: 'Mother Tongue', value: Array.isArray(user?.motherTongue) && user.motherTongue.length ? user.motherTongue.join(', ') : '—' },
            { label: 'User ID',       value: user?._id ? `${user._id.slice(0, 10)}…` : '—', mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium shrink-0">{label}</span>
              <span className={`text-xs font-semibold text-slate-300 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Auto-detected status — read-only, driven by socket */}
        <div className="rounded-3xl bg-white/5 border border-white/8 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live Status</p>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
            currentStatus === 'online'  ? 'bg-emerald-400/8  border-emerald-400/25' :
            currentStatus === 'incall'  ? 'bg-amber-400/8   border-amber-400/25'   :
                                         'bg-slate-700/20  border-slate-600/20'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusStyles[currentStatus]?.dot}`}/>
            <div>
              <p className={`text-sm font-bold capitalize ${
                currentStatus === 'online' ? 'text-emerald-400' :
                currentStatus === 'incall' ? 'text-amber-400'   : 'text-slate-400'
              }`}>{currentStatus}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">
                {currentStatus === 'online'  ? 'Connected — socket active' :
                 currentStatus === 'incall'  ? 'Currently in a call' :
                                              'Not connected'}
              </p>
            </div>
            <span className="ml-auto text-[10px] text-slate-600 italic">auto-detected</span>
          </div>
        </div>
      </div>

      {/* ════ RIGHT — Tabbed edit panels ════ */}
      <div className="lg:col-span-2 space-y-5">

        {/* Tab switcher */}
        <div className="flex gap-1.5 bg-white/5 border border-white/8 rounded-2xl p-1">
          {[['profile', '✏️ Edit Profile'], ['avatar', '🎨 Avatar Builder']].map(([key, lbl]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}>{lbl}</button>
          ))}
        </div>

        {activeTab === 'avatar' ? (

          /* ── AVATAR BUILDER ── */
          <AvatarBuilder/>

        ) : (

          /* ── EDIT PROFILE ── */
          <div className="space-y-5">

            {/* Editable fields */}
            <div className="rounded-3xl bg-white/5 border border-white/8 p-6 space-y-5">
              <h3 className="text-sm font-bold text-white">✏️ Edit Profile</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <InputField label="Username" hint="10-day cooldown">
                  <input value={form.username} onChange={(e) => set('username', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                               focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"/>
                </InputField>

                <InputField label="Gender">
                  <select value={form.gender} onChange={(e) => set('gender', e.target.value)}
                    className="w-full bg-[#0d1220] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                               focus:outline-none focus:border-cyan-500/50 transition-all">
                    <option value="">— Select —</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </InputField>

                <InputField label="Date of Birth">
                  <input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                               focus:outline-none focus:border-cyan-500/50 transition-all [color-scheme:dark]"/>
                </InputField>

                <InputField label="Mother Tongue" hint="comma-separated">
                  <input value={form.motherTongue} onChange={(e) => set('motherTongue', e.target.value)}
                    placeholder="e.g. Hindi, Tamil"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                               placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"/>
                </InputField>
              </div>

              <button onClick={handleProfileSave} disabled={profileSaving || profileLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600
                           text-white text-sm font-bold shadow-lg shadow-violet-500/20
                           hover:opacity-90 disabled:opacity-50 transition-all">
                {profileSaving
                  ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving…</span>
                  : '💾 Save Profile'}
              </button>
            </div>

            {/* Read-only account info */}
            <div className="rounded-3xl bg-white/5 border border-white/8 p-6">
              <h3 className="text-sm font-bold text-white mb-4">
                🔒 Account Info <span className="text-slate-600 font-normal text-xs">(managed by server)</span>
              </h3>
              <div className="divide-y divide-white/5">
                {[
                  { label: 'Phone',          value: user?.phone ?? '—' },
                  { label: 'Role',           badge: true, color: user?.role === 'admin' ? 'violet' : user?.role === 'host' ? 'cyan' : 'slate', value: user?.role ?? '—' },
                  { label: 'Account Status', badge: true, color: user?.status === 'active' ? 'emerald' : 'rose', value: user?.status ?? '—' },
                  { label: 'Verified',       badge: true, color: user?.isVerified ? 'emerald' : 'slate', value: user?.isVerified ? '✓ Verified' : '✗ Not verified' },
                ].map(({ label, value, badge, color }) => (
                  <div key={label} className="flex items-center justify-between py-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</span>
                    {badge
                      ? <Badge color={color}>{value}</Badge>
                      : <span className="text-sm font-semibold text-slate-300 font-mono">{value}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl
                         text-sm font-semibold shadow-2xl border pointer-events-none ${
                           toast.type === 'error'
                             ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                             : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                         }`}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
