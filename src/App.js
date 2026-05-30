// AuditPro - SAP S/4HANA Inventory Audit System
// ABC Flexible Packaging Ltd.
// Version 2.0 | React + Capacitor (Android + Desktop PWA)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Toast } from '@capacitor/toast';

// ─── USERS DATABASE (in production: fetched from SAP API) ─────────────────
const USERS = {
  'ahmed.khan':    { pass: 'audit123', name: 'Ahmed Khan',      depts: ['Film Store Unit 1'],                           loc: 'Unit 1', auditorId: 'AUD-01', role: 'auditor' },
  'sara.malik':    { pass: 'audit123', name: 'Sara Malik',       depts: ['Film Store Unit 1', 'Lamination Unit 1'],      loc: 'Unit 1', auditorId: 'AUD-02', role: 'auditor' },
  'bilal.raza':    { pass: 'audit123', name: 'Bilal Raza',       depts: ['Flexo Unit 1', 'Inks Unit 1'],                 loc: 'Unit 1', auditorId: 'AUD-03', role: 'auditor' },
  'fatima.s':      { pass: 'audit123', name: 'Fatima Siddiqui',  depts: ['Gravure Unit 1'],                              loc: 'Unit 1', auditorId: 'AUD-04', role: 'auditor' },
  'usman.ali':     { pass: 'audit123', name: 'Usman Ali',        depts: ['Slitting/Packing Unit 1'],                     loc: 'Unit 1', auditorId: 'AUD-05', role: 'auditor' },
  'hina.baig':     { pass: 'audit123', name: 'Hina Baig',        depts: ['Extrusion Unit 2', 'Slitting/Packing Unit 2'], loc: 'Unit 2', auditorId: 'AUD-08', role: 'auditor' },
  'tariq.mehmood': { pass: 'audit123', name: 'Tariq Mehmood',    depts: ['Film Store Unit 2', 'Lamination Unit 2'],      loc: 'Unit 2', auditorId: 'AUD-09', role: 'auditor' },
  'zara.hussain':  { pass: 'audit123', name: 'Zara Hussain',     depts: ['Film Store Unit 2'],                           loc: 'Unit 2', auditorId: 'AUD-10', role: 'auditor' },
  'nadia.iqbal':   { pass: 'audit123', name: 'Nadia Iqbal',      depts: ['Compounding Unit 2', 'Waste Unit 2'],          loc: 'Unit 2', auditorId: 'AUD-14', role: 'auditor' },
  'junaid.mirza':  { pass: 'audit123', name: 'Junaid Mirza',     depts: ['Waste Unit 1', 'Slitting/Packing Unit 1'],     loc: 'Unit 1', auditorId: 'AUD-15', role: 'auditor' },
  'lead.auditor':  { pass: 'lead123',  name: 'Lead Auditor',     depts: [],                                              loc: 'All',    auditorId: 'LEAD-01', role: 'lead' },
  'it.admin':      { pass: 'it123',    name: 'IT Administrator', depts: [],                                              loc: 'All',    auditorId: 'IT-01',   role: 'admin' },
};

// ─── SAP POPULATION (in production: fetched via SAP OData API) ────────────
export const SAP_POPULATION = [
  // Film Store Unit 1
  { mat:'MAT-001', desc:'BOPP Film 20µ Clear',       batch:'BTH-2501', sapQty:5000, uom:'KG', dept:'Film Store Unit 1',      loc:'Unit 1', map:850,  mfgDate:'01-Jan-2025', procDate:'15-Jan-2025', bin:'FS1-A01', stockType:'Unrestricted', valClass:'RM-FILM'  },
  { mat:'MAT-001', desc:'BOPP Film 20µ Clear',       batch:'BTH-2502', sapQty:3200, uom:'KG', dept:'Film Store Unit 1',      loc:'Unit 1', map:848,  mfgDate:'10-Jan-2025', procDate:'20-Jan-2025', bin:'FS1-A02', stockType:'Unrestricted', valClass:'RM-FILM'  },
  { mat:'MAT-002', desc:'Polyester Film 12µ',        batch:'BTH-2503', sapQty:4100, uom:'KG', dept:'Film Store Unit 1',      loc:'Unit 1', map:920,  mfgDate:'05-Jan-2025', procDate:'18-Jan-2025', bin:'FS1-B01', stockType:'Unrestricted', valClass:'RM-FILM'  },
  { mat:'MAT-004', desc:'Aluminum Foil 9µ',          batch:'BTH-2507', sapQty:2000, uom:'KG', dept:'Film Store Unit 1',      loc:'Unit 1', map:1450, mfgDate:'20-Dec-2024', procDate:'10-Jan-2025', bin:'FS1-C01', stockType:'Unrestricted', valClass:'RM-FOIL'  },
  { mat:'MAT-019', desc:'BOPP Film 25µ Matte',       batch:'BTH-2522', sapQty:3400, uom:'KG', dept:'Film Store Unit 1',      loc:'Unit 1', map:870,  mfgDate:'15-Jan-2025', procDate:'28-Jan-2025', bin:'FS1-D01', stockType:'Unrestricted', valClass:'RM-FILM'  },
  { mat:'MAT-022', desc:'BOPP Film 30µ Clear (QI)',  batch:'BTH-2525', sapQty:1200, uom:'KG', dept:'Film Store Unit 1',      loc:'Unit 1', map:855,  mfgDate:'01-Mar-2025', procDate:'10-Mar-2025', bin:'FS1-A03', stockType:'QI Stock',     valClass:'RM-FILM'  },
  // Lamination Unit 1
  { mat:'MAT-006', desc:'Laminated Reel BOPP/PE',    batch:'BTH-2510', sapQty:2500, uom:'KG', dept:'Lamination Unit 1',      loc:'Unit 1', map:1280, mfgDate:'18-Feb-2025', procDate:'',           bin:'LAM1-A01', stockType:'Unrestricted', valClass:'SF-LAM'   },
  { mat:'MAT-024', desc:'Adhesive Solvent-based',    batch:'BTH-2527', sapQty:620,  uom:'KG', dept:'Lamination Unit 1',      loc:'Unit 1', map:3800, mfgDate:'10-Feb-2025', procDate:'01-Feb-2025', bin:'LAM1-B01', stockType:'Unrestricted', valClass:'RM-ADH'   },
  // Flexo Unit 1
  { mat:'MAT-007', desc:'Printed Film Flexo 8C',     batch:'BTH-2512', sapQty:1200, uom:'KG', dept:'Flexo Unit 1',           loc:'Unit 1', map:1620, mfgDate:'22-Feb-2025', procDate:'',           bin:'FLX1-A01', stockType:'Unrestricted', valClass:'SF-PRT'   },
  { mat:'MAT-025', desc:'Primer Coat (White)',        batch:'BTH-2528', sapQty:480,  uom:'KG', dept:'Flexo Unit 1',           loc:'Unit 1', map:2950, mfgDate:'12-Feb-2025', procDate:'03-Feb-2025', bin:'FLX1-B01', stockType:'Unrestricted', valClass:'RM-INK'   },
  // Gravure Unit 1
  { mat:'MAT-008', desc:'Gravure Printed Film 10C',  batch:'BTH-2514', sapQty:800,  uom:'KG', dept:'Gravure Unit 1',          loc:'Unit 1', map:1850, mfgDate:'25-Feb-2025', procDate:'',           bin:'GRV1-A01', stockType:'Unrestricted', valClass:'SF-PRT'   },
  { mat:'MAT-018', desc:'Printed Film Gravure 6C',   batch:'BTH-2521', sapQty:760,  uom:'KG', dept:'Gravure Unit 1',          loc:'Unit 1', map:1780, mfgDate:'06-Mar-2025', procDate:'',           bin:'GRV1-B01', stockType:'Unrestricted', valClass:'SF-PRT'   },
  // Slitting Unit 1
  { mat:'MAT-015', desc:'Slit Reel BOPP 100mm',      batch:'BTH-2518', sapQty:1100, uom:'KG', dept:'Slitting/Packing Unit 1',loc:'Unit 1', map:1380, mfgDate:'01-Mar-2025', procDate:'',           bin:'SLT1-A01', stockType:'Unrestricted', valClass:'SF-SLT'   },
  // Inks Unit 1
  { mat:'MAT-010', desc:'Ink Cyan (Process)',         batch:'',         sapQty:450,  uom:'KG', dept:'Inks Unit 1',            loc:'Unit 1', map:2200, mfgDate:'01-Nov-2024', procDate:'01-Dec-2024', bin:'INK1-A01', stockType:'Unrestricted', valClass:'RM-INK'   },
  { mat:'MAT-011', desc:'Ink Magenta (Process)',      batch:'',         sapQty:380,  uom:'KG', dept:'Inks Unit 1',            loc:'Unit 1', map:2180, mfgDate:'01-Nov-2024', procDate:'01-Dec-2024', bin:'INK1-A02', stockType:'Unrestricted', valClass:'RM-INK'   },
  { mat:'MAT-012', desc:'Ink Yellow (Process)',       batch:'',         sapQty:410,  uom:'KG', dept:'Inks Unit 1',            loc:'Unit 1', map:2100, mfgDate:'01-Nov-2024', procDate:'01-Dec-2024', bin:'INK1-A03', stockType:'Unrestricted', valClass:'RM-INK'   },
  { mat:'MAT-013', desc:'Ink Black (Process)',        batch:'',         sapQty:520,  uom:'KG', dept:'Inks Unit 1',            loc:'Unit 1', map:2050, mfgDate:'01-Nov-2024', procDate:'01-Dec-2024', bin:'INK1-A04', stockType:'Unrestricted', valClass:'RM-INK'   },
  { mat:'MAT-026', desc:'Ink Solvent (IPA)',           batch:'',         sapQty:900,  uom:'KG', dept:'Inks Unit 1',            loc:'Unit 1', map:320,  mfgDate:'',            procDate:'15-Jan-2025', bin:'INK1-B01', stockType:'Unrestricted', valClass:'RM-SOL'   },
  // Waste Unit 1
  { mat:'MAT-016', desc:'Waste Film - BOPP',          batch:'',         sapQty:2200, uom:'KG', dept:'Waste Unit 1',           loc:'Unit 1', map:85,   mfgDate:'',            procDate:'',           bin:'WST1-A01', stockType:'Blocked',      valClass:'WS-BPP'   },
  // Extrusion Unit 1
  { mat:'MAT-003', desc:'PE Film 50µ Natural',        batch:'BTH-2505', sapQty:6000, uom:'KG', dept:'Extrusion Unit 1',       loc:'Unit 1', map:320,  mfgDate:'12-Feb-2025', procDate:'01-Feb-2025', bin:'EX1-C01',  stockType:'Unrestricted', valClass:'RM-POLY'  },
  { mat:'MAT-021', desc:'PE Film 80µ Black',          batch:'BTH-2524', sapQty:5200, uom:'KG', dept:'Extrusion Unit 1',       loc:'Unit 1', map:335,  mfgDate:'20-Feb-2025', procDate:'10-Feb-2025', bin:'EX1-D01',  stockType:'Unrestricted', valClass:'RM-POLY'  },
  // Film Store Unit 2
  { mat:'MAT-002', desc:'Polyester Film 12µ',         batch:'BTH-2504', sapQty:2800, uom:'KG', dept:'Film Store Unit 2',      loc:'Unit 2', map:918,  mfgDate:'08-Jan-2025', procDate:'22-Jan-2025', bin:'FS2-B01',  stockType:'Unrestricted', valClass:'RM-FILM'  },
  { mat:'MAT-004', desc:'Aluminum Foil 9µ',           batch:'BTH-2508', sapQty:1500, uom:'KG', dept:'Film Store Unit 2',      loc:'Unit 2', map:1448, mfgDate:'22-Dec-2024', procDate:'12-Jan-2025', bin:'FS2-C01',  stockType:'Unrestricted', valClass:'RM-FOIL'  },
  { mat:'MAT-005', desc:'CPP Film 30µ',               batch:'BTH-2509', sapQty:3800, uom:'KG', dept:'Film Store Unit 2',      loc:'Unit 2', map:760,  mfgDate:'14-Jan-2025', procDate:'25-Jan-2025', bin:'FS2-D01',  stockType:'Unrestricted', valClass:'RM-FILM'  },
  { mat:'MAT-009', desc:'Metallized BOPP 20µ',        batch:'BTH-2516', sapQty:900,  uom:'KG', dept:'Film Store Unit 2',      loc:'Unit 2', map:1118, mfgDate:'28-Feb-2025', procDate:'',           bin:'FS2-E01',  stockType:'Unrestricted', valClass:'SF-MET'   },
  { mat:'MAT-020', desc:'PET Film 15µ',               batch:'BTH-2523', sapQty:2700, uom:'KG', dept:'Film Store Unit 2',      loc:'Unit 2', map:940,  mfgDate:'18-Jan-2025', procDate:'01-Feb-2025', bin:'FS2-F01',  stockType:'Unrestricted', valClass:'RM-FILM'  },
  { mat:'MAT-023', desc:'CPP Film 25µ MetGrade (QI)', batch:'BTH-2526', sapQty:800,  uom:'KG', dept:'Film Store Unit 2',      loc:'Unit 2', map:780,  mfgDate:'05-Mar-2025', procDate:'15-Mar-2025', bin:'FS2-G01',  stockType:'QI Stock',     valClass:'RM-FILM'  },
  // Lamination Unit 2
  { mat:'MAT-006', desc:'Laminated Reel BOPP/PE',     batch:'BTH-2511', sapQty:1800, uom:'KG', dept:'Lamination Unit 2',      loc:'Unit 2', map:1278, mfgDate:'20-Feb-2025', procDate:'',           bin:'LAM2-A01', stockType:'Unrestricted', valClass:'SF-LAM'   },
  { mat:'MAT-017', desc:'Laminated Reel PET/PE',      batch:'BTH-2520', sapQty:1950, uom:'KG', dept:'Lamination Unit 2',      loc:'Unit 2', map:1320, mfgDate:'05-Mar-2025', procDate:'',           bin:'LAM2-B01', stockType:'Unrestricted', valClass:'SF-LAM'   },
  // Flexo Unit 2
  { mat:'MAT-007', desc:'Printed Film Flexo 8C',      batch:'BTH-2513', sapQty:950,  uom:'KG', dept:'Flexo Unit 2',           loc:'Unit 2', map:1618, mfgDate:'24-Feb-2025', procDate:'',           bin:'FLX2-A01', stockType:'Unrestricted', valClass:'SF-PRT'   },
  // Metallizer Unit 2
  { mat:'MAT-009', desc:'Metallized BOPP 20µ',        batch:'BTH-2515', sapQty:1600, uom:'KG', dept:'Metallizer Unit 2',      loc:'Unit 2', map:1120, mfgDate:'26-Feb-2025', procDate:'',           bin:'MET2-A01', stockType:'Unrestricted', valClass:'SF-MET'   },
  // Compounding Unit 2
  { mat:'MAT-014', desc:'PE Compound Natural',        batch:'BTH-2517', sapQty:8000, uom:'KG', dept:'Compounding Unit 2',     loc:'Unit 2', map:295,  mfgDate:'10-Feb-2025', procDate:'05-Feb-2025', bin:'CMP2-A01', stockType:'Unrestricted', valClass:'RM-POLY'  },
  // Extrusion Unit 2
  { mat:'MAT-003', desc:'PE Film 50µ Natural',        batch:'BTH-2506', sapQty:4500, uom:'KG', dept:'Extrusion Unit 2',       loc:'Unit 2', map:318,  mfgDate:'15-Feb-2025', procDate:'05-Feb-2025', bin:'EX2-C01',  stockType:'Unrestricted', valClass:'RM-POLY'  },
  // Slitting Unit 2
  { mat:'MAT-015', desc:'Slit Reel BOPP 100mm',       batch:'BTH-2519', sapQty:880,  uom:'KG', dept:'Slitting/Packing Unit 2',loc:'Unit 2', map:1378, mfgDate:'03-Mar-2025', procDate:'',           bin:'SLT2-A01', stockType:'Unrestricted', valClass:'SF-SLT'   },
  // Waste Unit 2
  { mat:'MAT-016', desc:'Waste Film - BOPP',          batch:'',         sapQty:1800, uom:'KG', dept:'Waste Unit 2',           loc:'Unit 2', map:83,   mfgDate:'',            procDate:'',           bin:'WST2-A01', stockType:'Blocked',      valClass:'WS-BPP'   },
];

// ─── AUDIT STATE STORE ────────────────────────────────────────────────────
const STORAGE_KEY = 'auditpro_state_v2';

function loadState() {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
}
function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

// ─── HOOKS ────────────────────────────────────────────────────────────────
function useAuditStore() {
  const [store, setStore] = useState(loadState);
  const update = useCallback((updater) => {
    setStore(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveState(next);
      return next;
    });
  }, []);
  return [store, update];
}

// ─── RECONCILIATION ENGINE ────────────────────────────────────────────────
export function reconcile(population, auditEntries) {
  const results = [];
  const entryMap = {};
  auditEntries.forEach(e => { entryMap[e.key] = e; });

  population.forEach(item => {
    const key = item.batch || `${item.mat}::${item.dept}`;
    const entry = entryMap[key];
    if (!entry) {
      results.push({ ...item, key, physQty: null, auditor: null, status: 'not_counted', exception: 'Not Counted', variance: null, valueDiff: null });
      return;
    }
    if (entry.isDuplicate) return; // Duplicate: silently excluded
    const physQty = entry.physQty;
    const variance = physQty - item.sapQty;
    const varPct = item.sapQty > 0 ? variance / item.sapQty : 0;
    const valueDiff = variance * item.map;
    let exception = 'No Exception';
    if (entry.auditDept && entry.auditDept !== item.dept) exception = 'Location Mismatch';
    else if (physQty === 0 && item.sapQty > 0) exception = 'Missing from Floor';
    else if (variance !== 0) exception = 'Quantity Variance';
    results.push({ ...item, key, physQty, auditor: entry.auditor, auditDept: entry.auditDept, variance, varPct, valueDiff, exception, status: exception === 'No Exception' ? 'match' : 'exception', countMode: entry.mode, countedAt: entry.countedAt });
  });

  // Not-in-SAP items
  auditEntries.filter(e => e.notInSap && !e.isDuplicate).forEach(e => {
    results.push({ mat: 'UNKNOWN', desc: e.desc || 'Unknown Material', batch: e.key, sapQty: 0, physQty: e.physQty, uom: e.uom || 'KG', dept: e.auditDept, loc: e.loc, map: 0, key: e.key, auditor: e.auditor, exception: 'Not in SAP', status: 'exception', variance: e.physQty, valueDiff: 0 });
  });

  return results;
}

// ─── HELPER: Haptic feedback (graceful fallback for web) ──────────────────
async function hapticFeedback(type = 'light') {
  try { await Haptics.impact({ style: type === 'heavy' ? ImpactStyle.Heavy : ImpactStyle.Light }); } catch {}
}

// ─── HELPER: Toast (Capacitor or DOM fallback) ────────────────────────────
async function showToast(text, duration = 'short') {
  try { await Toast.show({ text, duration }); } catch {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1F3864;color:#fff;padding:8px 18px;border-radius:8px;font-size:13px;z-index:9999;max-width:300px;text-align:center';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration === 'long' ? 3500 : 2000);
  }
}

export default function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [store, updateStore] = useAuditStore();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // USB scanner: keyboard wedge listens globally
  useEffect(() => {
    if (!user || screen !== 'scan') return;
    let buffer = '';
    let lastKey = Date.now();
    const handler = (e) => {
      const now = Date.now();
      if (now - lastKey > 100) buffer = '';
      lastKey = now;
      if (e.key === 'Enter' && buffer.length > 3) {
        window.dispatchEvent(new CustomEvent('usb-scan', { detail: buffer.trim() }));
        buffer = '';
      } else if (e.key.length === 1) buffer += e.key;
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [user, screen]);

  const go = useCallback((s) => setScreen(s), []);

  const logout = useCallback(() => {
    if (!user) return;
    const myItems = SAP_POPULATION.filter(d => user.depts.includes(d.dept));
    const auditEntries = store[user.auditorId] || [];
    const counted = auditEntries.filter(e => !e.isDuplicate).map(e => e.key);
    const remaining = myItems.filter(d => {
      const k = d.batch || `${d.mat}::${d.dept}`;
      return !counted.includes(k);
    });
    if (remaining.length > 0) {
      showToast(`⛔ Cannot sign out. ${remaining.length} item(s) uncounted in your deployment.`, 'long');
      return;
    }
    setUser(null);
    go('login');
  }, [user, store, go]);

  const addEntry = useCallback((entry) => {
    if (!user) return;
    updateStore(prev => {
      const existing = (prev[user.auditorId] || []);
      const isDup = existing.some(e => e.key === entry.key && !e.isDuplicate);
      if (isDup) {
        hapticFeedback('heavy');
        showToast('⚠ Duplicate scan – this batch was already counted.', 'long');
        return prev;
      }
      hapticFeedback();
      return { ...prev, [user.auditorId]: [...existing, entry] };
    });
  }, [user, updateStore]);

  const myEntries = user ? (store[user.auditorId] || []) : [];
  const myItems = user ? SAP_POPULATION.filter(d => user.depts.includes(d.dept)) : [];
  const countedKeys = myEntries.filter(e => !e.isDuplicate).map(e => e.key);
  const remaining = myItems.filter(d => !countedKeys.includes(d.batch || `${d.mat}::${d.dept}`)).length;
  const progress = myItems.length > 0 ? Math.round((myItems.length - remaining) / myItems.length * 100) : 0;
  const reconciliation = user ? reconcile(myItems, myEntries.filter(e => !e.isDuplicate)) : [];
  const exceptions = reconciliation.filter(r => r.status === 'exception');
  const matched = reconciliation.filter(r => r.status === 'match');

  const screenProps = { user, go, logout, store, updateStore, addEntry, myItems, myEntries, remaining, progress, reconciliation, exceptions, matched, isDesktop };

  return (
    <div className={`app-root ${isDesktop ? 'desktop' : 'mobile'}`}>
      {screen === 'login'      && <LoginScreen      {...screenProps} setUser={setUser} />}
      {screen === 'home'       && <HomeScreen       {...screenProps} />}
      {screen === 'scan'       && <ScanScreen       {...screenProps} />}
      {screen === 'manual'     && <ManualCountScreen {...screenProps} />}
      {screen === 'population' && <PopulationScreen  {...screenProps} />}
      {screen === 'report'     && <ReportScreen      {...screenProps} />}
      {screen === 'desktop-add'&& <DesktopAddScreen  {...screenProps} />}
    </div>
  );
}

// ─── SCREEN: LOGIN ────────────────────────────────────────────────────────
function LoginScreen({ go, setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('mobile');

  const login = () => {
    const u = USERS[username.toLowerCase().trim()];
    if (!u || u.pass !== password) { setError('Invalid credentials'); return; }
    setUser({ ...u, username: username.toLowerCase().trim() });
    go('home');
  };

  return (
    <div className="screen login-screen">
      {/* ... Login JSX here ... */}
      <div className="login-hero"><h1>AuditPro</h1><p>SAP S/4HANA Inventory Audit</p></div>
      <div className="login-form">
        <label>Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. ahmed.khan" />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
        <label>Login Mode</label>
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option value="mobile">Mobile (Android APK)</option>
          <option value="desktop">Desktop / Laptop</option>
        </select>
        <button onClick={login}>Sign In</button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

// ─── SCREEN: HOME ─────────────────────────────────────────────────────────
function HomeScreen({ user, go, logout, myItems, remaining, progress, exceptions, matched, isDesktop }) {
  return (
    <div className="screen home-screen">
      <div className="user-card">
        <div className="user-info">
          <h2>{user.name}</h2>
          <p>{user.depts.join(' · ')} · {user.loc}</p>
        </div>
        <button onClick={logout} className="logout-btn">Sign Out</button>
        <div className="progress-bar">
          <span>{progress}% complete</span>
          <div className="prog-track"><div className="prog-fill" style={{ width: progress + '%' }} /></div>
        </div>
      </div>
      <div className="stats-row">
        <div className="stat matched">{matched.length}<span>Matched</span></div>
        <div className="stat exception">{exceptions.length}<span>Exceptions</span></div>
        <div className="stat remaining">{remaining}<span>Remaining</span></div>
      </div>
      {remaining > 0 && <div className="lock-banner">⛔ {remaining} items uncounted – sign-out locked</div>}
      <div className="mode-grid">
        <button onClick={() => go('scan')} className="mode-card primary"><i>📷</i><span>Scan Mode</span><small>Barcode / USB scanner</small></button>
        <button onClick={() => go('manual')} className="mode-card"><i>🔍</i><span>Manual Count</span><small>Search & enter qty</small></button>
        <button onClick={() => go('report')} className="mode-card"><i>📊</i><span>My Report</span><small>Reconciliation</small></button>
        <button onClick={() => go('population')} className="mode-card"><i>📋</i><span>Population</span><small>Full SAP list</small></button>
        {isDesktop && <button onClick={() => go('desktop-add')} className="mode-card"><i>🖥️</i><span>Desktop Entry</span><small>Bulk inventory add</small></button>}
      </div>
    </div>
  );
}

// ─── SCREEN: SCAN ─────────────────────────────────────────────────────────
function ScanScreen({ user, go, addEntry, myEntries }) {
  const [batchInput, setBatchInput] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const inputRef = useRef(null);

  // USB scanner handler
  useEffect(() => {
    const handler = (e) => { setBatchInput(e.detail); setTimeout(() => process(e.detail), 50); };
    window.addEventListener('usb-scan', handler);
    return () => window.removeEventListener('usb-scan', handler);
  }, [myEntries]);

  const process = (batch) => {
    const b = (batch || batchInput).trim().toUpperCase();
    if (!b) return;
    const sapItem = SAP_POPULATION.find(d => d.batch && d.batch.toUpperCase() === b);
    const isDup = myEntries.some(e => e.key === b && !e.isDuplicate);
    if (isDup) {
      setLastResult({ batch: b, status: 'duplicate', msg: 'Already scanned – not counted again.' });
      setBatchInput('');
      return;
    }
    const auditDept = user.depts[0];
    const entry = {
      key: b,
      batch: b,
      auditor: user.name,
      auditorId: user.auditorId,
      auditDept,
      loc: user.loc,
      mode: 'scan',
      countedAt: new Date().toISOString(),
      notInSap: !sapItem,
      physQty: sapItem ? sapItem.sapQty : 0,
      desc: sapItem ? sapItem.desc : 'Unknown',
      uom: sapItem ? sapItem.uom : 'KG',
    };
    const locMismatch = sapItem && !user.depts.includes(sapItem.dept);
    const result = {
      batch: b,
      sapItem,
      status: !sapItem ? 'not_in_sap' : locMismatch ? 'location_mismatch' : 'match',
      auditDept,
    };
    addEntry(entry);
    setLastResult(result);
    setBatchInput('');
    inputRef.current?.focus();
  };

  // Camera scan
  const cameraScan = async () => {
    try {
      const photo = await Camera.getPhoto({ resultType: CameraResultType.Base64, source: CameraSource.Camera, quality: 90 });
      // In production: decode QR/barcode from photo.base64String using a barcode library
      showToast('Camera scan: integrate ZXing or ML Kit for production barcode decode');
    } catch { showToast('Camera not available in web preview'); }
  };

  return (
    <div className="screen scan-screen">
      <div className="navbar"><button onClick={() => go('home')}>← Back</button><h1>Scan Mode</h1></div>
      <div className="scan-content">
        <div className="scan-box" onClick={cameraScan}>
          <span>📷 Tap for Camera Scan</span>
          <small>Or use USB scanner (auto-detected)</small>
        </div>
        <div className="batch-row">
          <input ref={inputRef} value={batchInput} onChange={e => setBatchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && process(batchInput)}
            placeholder="Type/scan batch no. (e.g. BTH-2501)" autoFocus />
          <button onClick={() => process(batchInput)}>Submit</button>
        </div>
        {lastResult && <ScanResult result={lastResult} user={user} />}
        <h3>Scanned this session ({myEntries.filter(e => !e.isDuplicate).length})</h3>
        {myEntries.slice(-10).reverse().map((e, i) => (
          <div key={i} className={`log-item ${e.notInSap ? 'not-in-sap' : 'match'}`}>
            <span>{e.key}</span><span>{e.desc}</span><span>{e.isDuplicate ? '⚠ Dup' : e.notInSap ? '⚠ Not SAP' : '✓'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScanResult({ result, user }) {
  const s = result.sapItem;
  if (result.status === 'duplicate') return <div className="result-card dup">⚠ Duplicate – this batch was already counted and has been skipped.</div>;
  if (result.status === 'not_in_sap') return <div className="result-card not-in-sap">⚠ Batch {result.batch} not found in SAP. Recorded as physical finding.</div>;
  if (result.status === 'location_mismatch') return (
    <div className="result-card mismatch">
      <b>Location Mismatch</b><br />
      Scanned in: {result.auditDept}<br />
      SAP Dept: {s.dept}<br />
      Material: {s.desc} | SAP Qty: {s.sapQty.toLocaleString()} {s.uom}
    </div>
  );
  return (
    <div className="result-card match">
      ✅ Match – {s.desc}<br />
      Batch: {s.batch} | Qty: {s.sapQty.toLocaleString()} {s.uom}<br />
      Dept: {s.dept} | MAP: PKR {s.map.toLocaleString()}/KG
      {s.mfgDate && <><br />MFG: {s.mfgDate}</>}
    </div>
  );
}

// ─── SCREEN: MANUAL COUNT ────────────────────────────────────────────────
function ManualCountScreen({ user, go, addEntry, myEntries }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [physQtys, setPhysQtys] = useState({});

  const grouped = SAP_POPULATION.reduce((acc, item) => {
    const key = `${item.mat}::${item.desc}`;
    if (!acc[key]) acc[key] = { mat: item.mat, desc: item.desc, locations: [] };
    acc[key].locations.push(item);
    return acc;
  }, {});

  const filtered = Object.values(grouped).filter(g =>
    !query || g.desc.toLowerCase().includes(query.toLowerCase()) || g.mat.toLowerCase().includes(query.toLowerCase())
  );

  const saveCount = () => {
    if (!selected) return;
    let saved = 0;
    selected.locations.forEach(loc => {
      const qty = physQtys[`${loc.mat}::${loc.dept}`];
      if (qty === undefined || qty === '') return;
      const key = loc.batch || `${loc.mat}::${loc.dept}`;
      const isDup = myEntries.some(e => e.key === key && !e.isDuplicate);
      addEntry({
        key, batch: loc.batch, auditor: user.name, auditorId: user.auditorId,
        auditDept: loc.dept, loc: loc.loc, mode: 'manual', isDuplicate: isDup,
        physQty: parseFloat(qty), desc: loc.desc, uom: loc.uom, countedAt: new Date().toISOString(),
      });
      saved++;
    });
    if (saved > 0) showToast(`✓ Count saved for ${saved} location(s)`);
    setSelected(null); setPhysQtys({});
  };

  return (
    <div className="screen manual-screen">
      <div className="navbar"><button onClick={() => go('home')}>← Back</button><h1>Manual Count</h1></div>
      <div className="search-wrap">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search material name or code…" />
      </div>
      {!selected && filtered.slice(0, 15).map(g => (
        <div key={g.mat} className="material-card" onClick={() => setSelected(g)}>
          <strong>{g.desc}</strong> <code>{g.mat}</code>
          <div className="loc-pills">
            {g.locations.map((l, i) => <span key={i} className={`pill ${l.loc === 'Unit 1' ? 'u1' : 'u2'}`}>{l.dept} · {l.sapQty.toLocaleString()} KG</span>)}
          </div>
        </div>
      ))}
      {selected && (
        <div className="count-entry-panel">
          <h3>{selected.desc} ({selected.mat})</h3>
          {selected.locations.map((loc, i) => {
            const k = `${loc.mat}::${loc.dept}`;
            const physQty = physQtys[k] ?? '';
            const diff = physQty !== '' ? parseFloat(physQty) - loc.sapQty : null;
            return (
              <div key={i} className="loc-row">
                <div className="loc-info">
                  <strong>{loc.dept}</strong>
                  <small>SAP: {loc.sapQty.toLocaleString()} {loc.uom} {loc.batch ? `| Batch: ${loc.batch}` : ''} | Bin: {loc.bin}</small>
                </div>
                <input type="number" value={physQty} onChange={e => setPhysQtys(p => ({ ...p, [k]: e.target.value }))} placeholder="Qty" min="0" />
                {diff !== null && <span className={`var ${diff < 0 ? 'neg' : diff > 0 ? 'pos' : 'zero'}`}>{diff > 0 ? '+' : ''}{Math.round(diff)}</span>}
              </div>
            );
          })}
          <button onClick={saveCount} className="save-btn">Save Count</button>
          <button onClick={() => setSelected(null)} className="cancel-btn">Back to Search</button>
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: POPULATION ──────────────────────────────────────────────────
function PopulationScreen({ user, go, myEntries }) {
  const [query, setQuery] = useState('');
  const countedKeys = myEntries.filter(e => !e.isDuplicate).map(e => e.key);
  const filtered = SAP_POPULATION.filter(d =>
    !query || d.desc.toLowerCase().includes(query.toLowerCase()) || d.mat.toLowerCase().includes(query.toLowerCase()) || (d.batch && d.batch.toLowerCase().includes(query.toLowerCase()))
  );
  const myDepts = user?.depts || [];
  return (
    <div className="screen pop-screen">
      <div className="navbar"><button onClick={() => go('home')}>← Back</button><h1>SAP Population</h1><span>{filtered.length} items</span></div>
      <div className="search-wrap"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter…" /></div>
      <div className="pop-list">
        {filtered.map((d, i) => {
          const key = d.batch || `${d.mat}::${d.dept}`;
          const counted = countedKeys.includes(key);
          return (
            <div key={i} className={`pop-item ${myDepts.includes(d.dept) ? 'mine' : ''}`}>
              <div className="pi-info">
                <strong>{d.desc}</strong>
                <small>{d.mat} {d.batch ? `· ${d.batch}` : ''} · {d.sapQty.toLocaleString()} {d.uom}</small>
                <small>{d.dept} · {d.stockType} · Bin: {d.bin}</small>
                {(d.mfgDate || d.procDate) && <small>MFG: {d.mfgDate || '—'} | Proc: {d.procDate || '—'}</small>}
              </div>
              <span className={`status-chip ${counted ? 'done' : 'pending'}`}>{counted ? '✓' : '…'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCREEN: REPORT ──────────────────────────────────────────────────────
function ReportScreen({ go, reconciliation, exceptions, matched, user }) {
  const totalSapVal = reconciliation.reduce((s, r) => s + r.sapQty * r.map, 0);
  const totalVarVal = reconciliation.reduce((s, r) => s + (r.valueDiff || 0), 0);
  return (
    <div className="screen report-screen">
      <div className="navbar"><button onClick={() => go('home')}>← Back</button><h1>Reconciliation Report</h1></div>
      <div className="report-content">
        <div className="rpt-stats">
          <div className="rs match">{matched.length}<span>Match</span></div>
          <div className="rs exception">{exceptions.length}<span>Exceptions</span></div>
          <div className="rs">{reconciliation.filter(r => r.status === 'not_counted').length}<span>Uncounted</span></div>
        </div>
        <div className="rpt-val">
          <span>SAP Value: PKR {totalSapVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className={totalVarVal < 0 ? 'neg' : totalVarVal > 0 ? 'pos' : 'zero'}>
            Variance: PKR {totalVarVal > 0 ? '+' : ''}{totalVarVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
        <h3>Exceptions ({exceptions.length})</h3>
        {exceptions.map((e, i) => (
          <div key={i} className={`exc-card ${e.exception.toLowerCase().replace(/ /g, '-')}`}>
            <div className="ec-top"><strong>{e.desc}</strong><span className="exc-badge">{e.exception}</span></div>
            <small>{e.batch || e.mat} · {e.dept}</small>
            {e.physQty !== null && <div className="ec-qty">SAP: {e.sapQty.toLocaleString()} KG | Physical: {(e.physQty || 0).toLocaleString()} KG | Δ {e.variance > 0 ? '+' : ''}{(e.variance || 0).toLocaleString()} KG</div>}
          </div>
        ))}
        {exceptions.length === 0 && <p className="no-exc">No exceptions found. Count more items to see results.</p>}
        <h3>Matched ({matched.length})</h3>
        {matched.slice(0, 8).map((m, i) => (
          <div key={i} className="match-item">
            <span>{m.desc}</span><span className="chip-done">✓ {m.sapQty.toLocaleString()} KG</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SCREEN: DESKTOP ADD (bulk inventory entry) ───────────────────────────
function DesktopAddScreen({ go, addEntry, user }) {
  const [rows, setRows] = useState([{ plant: '', mat: '', desc: '', batch: '', uom: 'KG', sapQty: '', procDate: '', mfgDate: '', dept: '', loc: '', physQty: '' }]);
  const addRow = () => setRows(r => [...r, { plant: '', mat: '', desc: '', batch: '', uom: 'KG', sapQty: '', procDate: '', mfgDate: '', dept: '', loc: '', physQty: '' }]);
  const update = (i, field, val) => setRows(r => r.map((row, j) => j === i ? { ...row, [field]: val } : row));
  const submit = () => {
    rows.filter(r => r.mat && r.physQty !== '').forEach(r => {
      const key = r.batch || `${r.mat}::${r.dept}`;
      addEntry({ key, batch: r.batch, auditor: user.name, auditorId: user.auditorId, auditDept: r.dept, loc: r.loc, mode: 'desktop', physQty: parseFloat(r.physQty), desc: r.desc, uom: r.uom, countedAt: new Date().toISOString() });
    });
    showToast(`✓ ${rows.length} rows submitted`);
    go('home');
  };

  const fields = ['plant', 'mat', 'desc', 'batch', 'uom', 'sapQty', 'procDate', 'mfgDate', 'dept', 'loc', 'physQty'];
  const labels = ['Plant', 'Material Code', 'Description', 'Batch Number', 'UOM', 'SAP Qty', 'Procurement Date', 'MFG Date', 'Dept / Storage Loc', 'Location', 'Physical Qty'];

  return (
    <div className="screen desktop-screen">
      <div className="navbar"><button onClick={() => go('home')}>← Back</button><h1>Desktop Inventory Entry</h1></div>
      <div className="desktop-content">
        <p className="desktop-note">Enter or paste inventory data below. All fields from SAP MB52/MCHB. Click Submit to send to reconciliation engine.</p>
        <div className="desktop-table-wrap">
          <table className="desktop-table">
            <thead><tr>{labels.map((l, i) => <th key={i}>{l}</th>)}</tr></thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>{fields.map((f, j) => (
                  <td key={j}><input value={row[f]} onChange={e => update(i, f, e.target.value)} placeholder={labels[j]} /></td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="desktop-btns">
          <button onClick={addRow}>+ Add Row</button>
          <button onClick={submit} className="primary">Submit All Entries</button>
        </div>
      </div>
    </div>
  );
}
