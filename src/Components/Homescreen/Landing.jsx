import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { socket } from "../../socket";
import { logout } from "../../Redux/Features/authSlice";
import ProfileSettings from "./ProfileSettings";
import { AvatarSVG, getAvatarConfig } from "./AvatarBuilder";

// ─── Fake people list ─────────────────────────────────────────────────────────
const fakeUsers = [
  { id: 1, name: "Arjun Mehta",  av: "AM", status: "online",  lang: "Hindi"    },
  { id: 2, name: "Sofia Reyes",  av: "SR", status: "incall",  lang: "Spanish"  },
  { id: 3, name: "Yuki Tanaka",  av: "YT", status: "online",  lang: "Japanese" },
  { id: 4, name: "Lena Fischer", av: "LF", status: "offline", lang: "German"   },
  { id: 5, name: "Priya Sharma", av: "PS", status: "online",  lang: "Tamil"    },
  { id: 6, name: "Omar Hassan",  av: "OH", status: "offline", lang: "Arabic"   },
];

const recentActivity = [
  { id: 1, user: "Arjun Mehta",  action: "Called you",       time: "2 min ago",  icon: "📞" },
  { id: 2, user: "Yuki Tanaka",  action: "Sent a request",   time: "15 min ago", icon: "👋" },
  { id: 3, user: "Sofia Reyes",  action: "Ended call",       time: "1 hr ago",   icon: "🔴" },
  { id: 4, user: "Priya Sharma", action: "Matched with you", time: "2 hr ago",   icon: "✨" },
];

const stats = [
  { label: "Total Calls",  value: "1,284", icon: "📞", color: "from-cyan-500 to-blue-600"     },
  { label: "Languages",    value: "8",     icon: "🌍", color: "from-violet-500 to-purple-700" },
  { label: "Hours Talked", value: "342",   icon: "⏱️", color: "from-emerald-400 to-teal-600" },
  { label: "Friends",      value: "56",    icon: "👥", color: "from-pink-500 to-rose-600"      },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const dot = (s) => {
  if (s === "online") return "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]";
  if (s === "incall") return "bg-amber-400  shadow-[0_0_8px_2px_rgba(251,191,36,0.5)]";
  return "bg-slate-500";
};
const badge = (s) => {
  if (s === "online") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/25";
  if (s === "incall") return "text-amber-400  bg-amber-400/10  border-amber-400/25";
  return "text-slate-400 bg-slate-700/40 border-slate-600/30";
};
const statusLabel = (s) => ({ online: "Online", incall: "In Call", offline: "Offline" }[s] ?? "—");

// ─── Component ────────────────────────────────────────────────────────────────
const Landing = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { token, isAuthenticated, user } = useSelector((s) => s.auth);

  const [liveStatus, setLiveStatus] = useState("online");
  const [activeTab,  setActiveTab]  = useState("people");

  // ── Auth guard ──
  useEffect(() => {
    if (!token || !isAuthenticated) navigate("/login");
  }, [token, isAuthenticated, navigate]);

  // ── Live status from backend socket ──
  useEffect(() => {
    const onStatusChange = ({ userId, status }) => {
      if (userId === user?._id) setLiveStatus(status);
    };
    socket.on("user:statusChange", onStatusChange);
    return () => socket.off("user:statusChange", onStatusChange);
  }, [user?._id]);

  const handleLogout = () => {
    socket.disconnect();
    dispatch(logout());
    navigate("/login");
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-200 font-sans overflow-x-hidden">

      {/* Background glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-cyan-600/8  blur-[160px]" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-violet-600/8 blur-[180px]" />
      </div>

      <div className="relative z-10">

        {/* ═══════════════════ HEADER ═══════════════════ */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5
                           bg-[#070b14]/85 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600
                            flex items-center justify-center text-white font-extrabold text-xs
                            shadow-lg shadow-cyan-500/30">4F</div>
            <span className="text-base font-bold bg-clip-text text-transparent
                             bg-gradient-to-r from-white to-slate-400">4FunTalk</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live user pill */}
            <div className="flex items-center gap-2.5 bg-white/5 px-3 py-1.5 rounded-2xl border border-white/10">
              <div className="relative">
                {/* Always SVG avatar — driven by saved config or gender default */}
                <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center">
                  <AvatarSVG config={getAvatarConfig(user)} size={32}/>
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                                  border-2 border-[#070b14] ${dot(liveStatus)}`} />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">{user?.username ?? "User"}</p>
                <span className={`text-[10px] font-medium border px-1.5 py-0.5 rounded-full capitalize ${badge(liveStatus)}`}>
                  {statusLabel(liveStatus)}
                </span>
              </div>
            </div>

            {/* Admin link */}
            {user?.role === "admin" && (
              <button onClick={() => navigate("/admin")}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-violet-300
                           hover:text-white hover:bg-violet-500/20 border border-violet-500/30
                           hover:border-violet-500/50 transition-all duration-200">
                👑 Admin
              </button>
            )}

            <button onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400
                         hover:text-white hover:bg-rose-500/20 border border-transparent
                         hover:border-rose-500/40 transition-all duration-200">
              Logout
            </button>
          </div>
        </header>

        {/* ═══════════════════ MAIN ═══════════════════ */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Welcome banner */}
          <div className="rounded-3xl bg-gradient-to-br from-cyan-600/15 to-blue-700/15
                          border border-cyan-500/15 p-5 sm:p-6 flex flex-col sm:flex-row
                          items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">
                👋 Welcome back,{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                  {user?.username ?? "Friend"}
                </span>!
              </h1>
              <p className="text-slate-500 mt-0.5 text-xs">
                Status is managed automatically by the server — just stay connected.
              </p>
            </div>
            <button className="shrink-0 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white
                               bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90
                               shadow-lg shadow-cyan-500/25 transition-all active:scale-95">
              🎲 Find a Partner
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label}
                   className="rounded-2xl bg-white/5 border border-white/8 p-4
                              hover:border-white/20 transition-all duration-300 group cursor-default">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color}
                                 flex items-center justify-center text-lg mb-3
                                 shadow-lg group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>
                <p className="text-xl font-extrabold text-white">{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2">
            {[["people", "👥 People"], ["profile", "🪪 My Profile"]].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === key
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "people" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* People list */}
              <div className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/8 p-5">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full inline-block ${dot("online")}`} />
                  People Around You
                </h2>
                <div className="space-y-2.5">
                  {fakeUsers.map((u) => (
                    <div key={u.id}
                         className="flex items-center justify-between p-3 rounded-2xl
                                    bg-white/4 hover:bg-white/8 border border-white/5
                                    hover:border-white/12 transition-all duration-150">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500
                                          to-indigo-600 flex items-center justify-center
                                          text-xs font-bold text-white">{u.av}</div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                                            border-2 border-[#0d1220] ${dot(u.status)}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.lang}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium border px-2 py-0.5 rounded-full capitalize ${badge(u.status)}`}>
                          {statusLabel(u.status)}
                        </span>
                        <button disabled={u.status !== "online"}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl
                                     bg-cyan-500/10 text-cyan-400 border border-cyan-500/20
                                     hover:bg-cyan-500/20 disabled:opacity-25
                                     disabled:cursor-not-allowed transition-all">
                          Call
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="rounded-3xl bg-white/5 border border-white/8 p-5 flex flex-col">
                <h2 className="text-base font-bold mb-4">Recent Activity</h2>
                <div className="space-y-4 flex-1">
                  {recentActivity.map((a) => (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className="w-9 h-9 shrink-0 rounded-xl bg-white/5 flex items-center
                                      justify-center text-lg border border-white/8">{a.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-white">{a.user}</p>
                        <p className="text-xs text-slate-500">{a.action}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          ) : (
            /* ═══════════ MY PROFILE TAB ═══════════ */
            <ProfileSettings />
          )}

        </main>
      </div>
    </div>
  );
};

export default Landing;