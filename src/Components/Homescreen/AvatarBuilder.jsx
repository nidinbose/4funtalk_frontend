import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../Redux/Features/authSlice';

// ── Palettes ─────────────────────────────────────────────────────────────────
const SKIN  = { light:'#FDDBB4', cream:'#F1C27D', medium:'#C68642', tan:'#8D5524', dark:'#4A2512' };
const HAIRC = { black:'#1C1C1C', brown:'#5C3317', blonde:'#F4C430', red:'#B22222',
                auburn:'#8B4513', gray:'#808080', white:'#F0EEE8', blue:'#4169E1',
                purple:'#8A2BE2', pink:'#FF69B4' };
const EYEC  = { brown:'#5C3317', blue:'#4169E1', green:'#228B22', hazel:'#8B7355', gray:'#708090' };

export const DEFAULT_AVATAR_CONFIG = {
  skinTone:'medium', faceShape:'round', hairStyle:'shortM', hairColor:'black',
  eyeStyle:'default', eyeColor:'brown', eyebrowStyle:'normal',
  mouthStyle:'smile', accessory:'none',
};

// ── Gender-based presets ──────────────────────────────────────────────────────────────
export const GENDER_DEFAULTS = {
  male:   { skinTone:'medium', faceShape:'round', hairStyle:'shortM', hairColor:'black',  eyeStyle:'default', eyeColor:'brown', eyebrowStyle:'normal',  mouthStyle:'smile', accessory:'none' },
  female: { skinTone:'cream',  faceShape:'oval',  hairStyle:'long',   hairColor:'brown',  eyeStyle:'wide',    eyeColor:'brown', eyebrowStyle:'arched',  mouthStyle:'smile', accessory:'none' },
  other:  { skinTone:'medium', faceShape:'round', hairStyle:'shortF', hairColor:'purple', eyeStyle:'default', eyeColor:'green', eyebrowStyle:'normal',  mouthStyle:'smile', accessory:'none' },
};

// Returns saved avatarConfig, or gender-based default, or hard default
export const getAvatarConfig = (user) => {
  if (user?.avatarConfig && Object.keys(user.avatarConfig).length > 0)
    return { ...DEFAULT_AVATAR_CONFIG, ...user.avatarConfig };
  const g = user?.gender;
  if (g && GENDER_DEFAULTS[g]) return { ...GENDER_DEFAULTS[g] };
  return { ...DEFAULT_AVATAR_CONFIG };
};

// ── SVG Renderer ─────────────────────────────────────────────────────────────
export const AvatarSVG = ({ config = {}, size = 180 }) => {
  const cfg  = { ...DEFAULT_AVATAR_CONFIG, ...config };
  const skin = SKIN[cfg.skinTone]  || SKIN.medium;
  const hair = HAIRC[cfg.hairColor] || HAIRC.black;
  const eyeC = EYEC[cfg.eyeColor]   || EYEC.brown;

  const Face = () => {
    if (cfg.faceShape === 'oval')   return <ellipse cx="100" cy="138" rx="56" ry="83" fill={skin}/>;
    if (cfg.faceShape === 'square') return <path d="M40,72 Q40,60 56,60 L144,60 Q160,60 160,72 L160,210 Q160,218 148,218 L52,218 Q40,218 40,210 Z" fill={skin}/>;
    if (cfg.faceShape === 'heart')  return <path d="M100,212 C45,180 20,148 20,112 Q20,78 52,72 Q76,68 100,96 Q124,68 148,72 Q180,78 180,112 C180,148 155,180 100,212 Z" fill={skin}/>;
    return <ellipse cx="100" cy="138" rx="68" ry="78" fill={skin}/>;
  };

  const HairBack = () => {
    if (cfg.hairStyle === 'bald')     return null;
    if (cfg.hairStyle === 'afro')     return <circle cx="100" cy="80" r="82" fill={hair}/>;
    if (cfg.hairStyle === 'curly')    return <>{[[100,58,30],[65,64,26],[135,64,26],[46,82,22],[154,82,22],[76,48,22],[124,48,22]].map(([cx,cy,r],i)=><circle key={i} cx={cx} cy={cy} r={r} fill={hair}/>)}</>;
    if (cfg.hairStyle === 'long')     return <><ellipse cx="100" cy="82" rx="74" ry="65" fill={hair}/><rect x="24" y="110" width="30" height="112" rx="15" fill={hair}/><rect x="146" y="110" width="30" height="112" rx="15" fill={hair}/></>;
    if (cfg.hairStyle === 'ponytail') return <><ellipse cx="100" cy="82" rx="74" ry="65" fill={hair}/><path d="M160,88 Q196,96 185,150 Q180,170 168,156 Q175,124 158,108 Z" fill={hair}/></>;
    return <ellipse cx="100" cy="82" rx="74" ry="65" fill={hair}/>;
  };

  const HairFront = () => {
    if (cfg.hairStyle === 'bald') return null;
    if (cfg.hairStyle === 'bob')  return <><ellipse cx="38" cy="148" rx="20" ry="34" fill={hair}/><ellipse cx="162" cy="148" rx="20" ry="34" fill={hair}/><ellipse cx="100" cy="106" rx="66" ry="26" fill={skin}/></>;
    if (cfg.hairStyle === 'mohawk') return <><ellipse cx="100" cy="106" rx="66" ry="28" fill={skin}/><rect x="88" y="14" width="24" height="78" rx="12" fill={hair}/></>;
    return <ellipse cx="100" cy="106" rx="66" ry="26" fill={skin}/>;
  };

  const Eye = ({ cx }) => {
    const p = <><circle cx={cx} cy="130" r="3.5" fill="#111"/><circle cx={cx+2} cy="128" r="1.5" fill="white"/></>;
    if (cfg.eyeStyle === 'wide')   return <><ellipse cx={cx} cy="130" rx="14" ry="13" fill="white"/><circle cx={cx} cy="130" r="8" fill={eyeC}/>{p}</>;
    if (cfg.eyeStyle === 'sleepy') return <><ellipse cx={cx} cy="133" rx="13" ry="8" fill="white"/><path d={`M${cx-13},130 Q${cx},123 ${cx+13},130`} fill="#1C1C1C"/><circle cx={cx} cy="131" r="5" fill={eyeC}/>{p}</>;
    if (cfg.eyeStyle === 'wink')   return cx < 100
      ? <path d={`M${cx-12},130 Q${cx},124 ${cx+12},130`} stroke="#1C1C1C" strokeWidth="3" fill="none" strokeLinecap="round"/>
      : <><ellipse cx={cx} cy="130" rx="12" ry="11" fill="white"/><circle cx={cx} cy="130" r="7" fill={eyeC}/>{p}</>;
    return <><ellipse cx={cx} cy="130" rx="12" ry="11" fill="white" stroke="#e5e7eb" strokeWidth="0.5"/><circle cx={cx} cy="130" r="7" fill={eyeC}/>{p}</>;
  };

  const browPaths = { normal:['M58,112 Q72,107 86,112','M114,112 Q128,107 142,112'], thick:['M57,112 Q72,105 87,112','M113,112 Q128,105 143,112'], arched:['M60,115 Q72,103 85,112','M115,112 Q128,103 140,115'], worried:['M60,110 Q72,117 86,111','M114,111 Q128,117 140,110'] };
  const bw = cfg.eyebrowStyle === 'thick' ? 5 : 3;
  const bp = browPaths[cfg.eyebrowStyle] || browPaths.normal;

  const Mouth = () => {
    if (cfg.mouthStyle === 'grin')    return <><path d="M70,167 Q100,190 130,167" fill="white" stroke="#1C1C1C" strokeWidth="2"/><path d="M70,167 Q100,190 130,167" fill="none" stroke="#1C1C1C" strokeWidth="2"/></>;
    if (cfg.mouthStyle === 'neutral') return <path d="M78,170 Q100,173 122,170" stroke="#1C1C1C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>;
    if (cfg.mouthStyle === 'sad')     return <path d="M76,178 Q100,164 124,178" stroke="#1C1C1C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>;
    return <path d="M75,165 Q100,185 125,165" stroke="#1C1C1C" strokeWidth="2.5" fill="none" strokeLinecap="round"/>;
  };

  const Accessory = () => {
    if (cfg.accessory === 'glasses')    return <><circle cx="72" cy="130" r="16" fill="none" stroke="#555" strokeWidth="2.5"/><circle cx="128" cy="130" r="16" fill="none" stroke="#555" strokeWidth="2.5"/><line x1="88" y1="130" x2="112" y2="130" stroke="#555" strokeWidth="2.5"/><line x1="56" y1="127" x2="44" y2="123" stroke="#555" strokeWidth="2"/><line x1="144" y1="127" x2="156" y2="123" stroke="#555" strokeWidth="2"/></>;
    if (cfg.accessory === 'sunglasses') return <><ellipse cx="72" cy="130" rx="18" ry="13" fill="#111" fillOpacity=".88"/><ellipse cx="128" cy="130" rx="18" ry="13" fill="#111" fillOpacity=".88"/><line x1="90" y1="130" x2="110" y2="130" stroke="#111" strokeWidth="3"/><line x1="54" y1="126" x2="42" y2="122" stroke="#111" strokeWidth="2"/><line x1="146" y1="126" x2="158" y2="122" stroke="#111" strokeWidth="2"/></>;
    if (cfg.accessory === 'beard')      return <path d="M38,168 Q44,224 100,228 Q156,224 162,168 Q130,176 100,176 Q70,176 38,168 Z" fill={hair}/>;
    if (cfg.accessory === 'mustache')   return <path d="M78,158 Q88,151 100,158 Q112,151 122,158 Q112,166 100,163 Q88,166 78,158 Z" fill={hair}/>;
    return null;
  };

  return (
    <svg viewBox="0 0 200 240" width={size} height={size * 1.2} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30"  cy="138" rx="13" ry="19" fill={skin}/>
      <ellipse cx="170" cy="138" rx="13" ry="19" fill={skin}/>
      <ellipse cx="30"  cy="138" rx="7"  ry="12" fill={`${skin}AA`}/>
      <ellipse cx="170" cy="138" rx="7"  ry="12" fill={`${skin}AA`}/>
      <HairBack/>
      <Face/>
      <HairFront/>
      <ellipse cx="100" cy="152" rx="6" ry="4" fill={`${skin}88`}/>
      {bp.map((d,i) => <path key={i} d={d} stroke={hair} strokeWidth={bw} fill="none" strokeLinecap="round"/>)}
      <Eye cx={72}/><Eye cx={128}/>
      <Mouth/>
      <Accessory/>
    </svg>
  );
};

// ── Builder UI ────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id:'skin',  label:'🎨 Skin',   key:'skinTone',     opts: Object.keys(SKIN),  type:'color', palette: SKIN  },
  { id:'face',  label:'😊 Face',   key:'faceShape',    opts: ['round','oval','square','heart'], type:'label' },
  { id:'hair',  label:'💇 Hair',   key:'hairStyle',    opts: ['bald','shortM','shortF','long','curly','afro','bob','ponytail','mohawk'], type:'label' },
  { id:'hairc', label:'🎨 H.Color',key:'hairColor',    opts: Object.keys(HAIRC), type:'color', palette: HAIRC },
  { id:'eyes',  label:'👁️ Eyes',  key:'eyeStyle',     opts: ['default','wide','sleepy','wink'], type:'label' },
  { id:'eyec',  label:'🎨 E.Color',key:'eyeColor',     opts: Object.keys(EYEC),  type:'color', palette: EYEC  },
  { id:'brows', label:'〰️ Brows',  key:'eyebrowStyle', opts: ['normal','thick','arched','worried'], type:'label' },
  { id:'mouth', label:'😄 Mouth',  key:'mouthStyle',   opts: ['smile','grin','neutral','sad'], type:'label' },
  { id:'acc',   label:'🕶️ Extras', key:'accessory',    opts: ['none','glasses','sunglasses','beard','mustache'], type:'label' },
];

const AvatarBuilder = () => {
  const dispatch = useDispatch();
  const { user, profileLoading } = useSelector(s => s.auth);

  const [cfg, setCfg] = useState(() => getAvatarConfig(user));
  const [activeSection, setActiveSection] = useState('skin');
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState(null);

  // Sync when user's saved config arrives (e.g. after fetchProfile resolves)
  useEffect(() => {
    setCfg(getAvatarConfig(user));
  }, [user?.avatarConfig, user?.gender]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await dispatch(updateProfile({ avatarConfig: cfg }));
    setSaving(false);
    if (res.meta.requestStatus === 'fulfilled') showToast('Avatar saved!');
    else showToast(res.payload ?? 'Save failed', 'error');
  };

  const section = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

      {/* ── Preview panel ── */}
      <div className="lg:col-span-2 rounded-3xl bg-white/5 border border-white/8 p-6 flex flex-col items-center gap-5">
        <h3 className="text-sm font-bold text-white self-start">🎭 Your Avatar</h3>

        {/* Avatar display */}
        <div className="w-44 h-52 rounded-3xl bg-gradient-to-br from-cyan-600/20 to-violet-600/20
                        border border-white/10 flex items-center justify-center shadow-xl
                        shadow-cyan-500/10 overflow-hidden">
          <AvatarSVG config={cfg} size={160}/>
        </div>

        {/* Current config chips */}
        <div className="w-full flex flex-wrap gap-1.5">
          {Object.entries(cfg).map(([k, v]) => (
            <span key={k} className="text-[10px] font-mono bg-white/5 border border-white/8
                                     text-slate-400 px-2 py-0.5 rounded-full">
              {k}: {v}
            </span>
          ))}
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving || profileLoading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
                     text-white text-sm font-bold shadow-lg shadow-cyan-500/20
                     hover:opacity-90 disabled:opacity-50 transition-all">
          {saving
            ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving…</span>
            : '💾 Save Avatar to Profile'}
        </button>

        {/* Reset */}
        <button onClick={() => setCfg({ ...DEFAULT_AVATAR_CONFIG })}
          className="w-full py-2 rounded-xl border border-white/10 text-slate-400 text-xs
                     font-semibold hover:text-white hover:bg-white/5 transition-all">
          ↩ Reset to Default
        </button>
      </div>

      {/* ── Customiser panel ── */}
      <div className="lg:col-span-3 rounded-3xl bg-white/5 border border-white/8 p-6 space-y-5">
        <h3 className="text-sm font-bold text-white">✏️ Customise</h3>

        {/* Gender presets */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">⚡ Quick Presets by Gender</p>
          <div className="flex gap-3">
            {Object.entries(GENDER_DEFAULTS).map(([gender, preset]) => (
              <button key={gender} onClick={() => setCfg({ ...preset })}
                className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/8
                           bg-white/[0.03] hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all">
                <AvatarSVG config={preset} size={52}/>
                <span className="text-xs text-slate-400 capitalize font-semibold">{gender}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section tabs — scrollable row */}
        <div className="flex gap-1.5 flex-wrap">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeSection === s.id
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 border-white/8 text-slate-400 hover:text-white hover:border-white/20'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Active section options */}
        {section && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">
              {section.label}
            </p>

            {section.type === 'color' ? (
              /* Colour swatches */
              <div className="flex flex-wrap gap-3">
                {section.opts.map(opt => {
                  const hex = section.palette[opt];
                  const active = cfg[section.key] === opt;
                  return (
                    <button key={opt} onClick={() => setCfg(c => ({ ...c, [section.key]: opt }))}
                      title={opt}
                      className={`relative w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 ${
                        active ? 'border-cyan-400 scale-110 shadow-lg shadow-cyan-400/30' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: hex }}>
                      {active && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold drop-shadow">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Label buttons */
              <div className="flex flex-wrap gap-2">
                {section.opts.map(opt => {
                  const active = cfg[section.key] === opt;
                  return (
                    <button key={opt} onClick={() => setCfg(c => ({ ...c, [section.key]: opt }))}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border capitalize transition-all ${
                        active
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/25'
                      }`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Mini live previews for all styles */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs text-slate-600 mb-3 uppercase tracking-wider font-semibold">All Variations Preview</p>
          <div className="flex flex-wrap gap-3">
            {section?.opts.map(opt => {
              const previewCfg = { ...cfg, [section.key]: opt };
              const active = cfg[section.key] === opt;
              return (
                <button key={opt} onClick={() => setCfg(c => ({ ...c, [section.key]: opt }))}
                  title={opt}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all ${
                    active
                      ? 'bg-violet-500/15 border-violet-500/40'
                      : 'bg-white/[0.03] border-white/8 hover:border-white/20'
                  }`}>
                  <AvatarSVG config={previewCfg} size={56}/>
                  <span className="text-[9px] text-slate-500 capitalize">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
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

export default AvatarBuilder;
