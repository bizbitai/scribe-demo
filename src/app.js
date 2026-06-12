import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff, FileText, Download, Copy, Mail, LogOut, Plus, Search, User,
  Clock, CheckCircle2, Loader2, Shield, ArrowLeft, Settings, Menu, ChevronRight, X
} from 'lucide-react';

// BizBitAI Node logo — inline SVG component
function NodeLogo({ size = 40 }) {
  return (
    <img
      src="https://tnq589.csb.app/node_logo.png"
      alt="BizBitAI"
      style={{ width: size, height: size, objectFit: 'contain' }}
      onError={(e) => {
        // Fallback: simple circuit node drawn inline
        e.target.style.display = 'none';
      }}
    />
  );
}

// Inline circuit node SVG (no external dependency)
function NodeIcon({ size = 40 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#1B5919" />
      {/* horizontal lines */}
      <line x1="2" y1="50" x2="20" y2="50" stroke="white" strokeWidth="3.5" />
      <line x1="80" y1="50" x2="98" y2="50" stroke="white" strokeWidth="3.5" />
      {/* vertical lines */}
      <line x1="50" y1="2" x2="50" y2="20" stroke="white" strokeWidth="3.5" />
      <line x1="50" y1="80" x2="50" y2="98" stroke="white" strokeWidth="3.5" />
      {/* diagonal branches */}
      <line x1="20" y1="50" x2="30" y2="30" stroke="white" strokeWidth="3" />
      <line x1="20" y1="50" x2="30" y2="70" stroke="white" strokeWidth="3" />
      <line x1="80" y1="50" x2="70" y2="30" stroke="white" strokeWidth="3" />
      <line x1="80" y1="50" x2="70" y2="70" stroke="white" strokeWidth="3" />
      {/* nodes */}
      <circle cx="50" cy="50" r="8" fill="white" />
      <circle cx="30" cy="30" r="5" fill="none" stroke="white" strokeWidth="3" />
      <circle cx="30" cy="70" r="5" fill="none" stroke="white" strokeWidth="3" />
      <circle cx="70" cy="30" r="5" fill="none" stroke="white" strokeWidth="3" />
      <circle cx="70" cy="70" r="5" fill="none" stroke="white" strokeWidth="3" />
      <circle cx="2" cy="50" r="4" fill="none" stroke="white" strokeWidth="2.5" />
      <circle cx="98" cy="50" r="4" fill="none" stroke="white" strokeWidth="2.5" />
      <circle cx="50" cy="2" r="4" fill="none" stroke="white" strokeWidth="2.5" />
      <circle cx="50" cy="98" r="4" fill="none" stroke="white" strokeWidth="2.5" />
    </svg>
  );
}

// ============================================================
// BIZBITAI SCRIBE — STANDALONE PROTOTYPE
// Brand: Navy #160E70, Green #1B5919, Playfair Display + Lato
// ============================================================

const BRAND = {
  navy: '#160E70',
  navyLight: '#281bb1',
  green: '#1B5919',
  greenLight: '#4e9e28',
  dark: '#333333',
  white: '#FFFFFF',
  bg: '#F7F8FC',
  border: '#E5E7EB',
};

// Sample pre-scripted SOAP note for Demo Mode
const DEMO_SOAP_NOTE = {
  subjective: `Patient is a 54-year-old male presenting with a 3-day history of progressive chest tightness and shortness of breath, worse with exertion. Denies radiating pain, nausea, or diaphoresis. Reports mild intermittent cough, non-productive. No fever. History of hypertension and type 2 diabetes. Takes lisinopril 20mg daily and metformin 1000mg BID. No known drug allergies. Non-smoker, occasional alcohol use.`,
  objective: `Vital Signs: BP 142/88, HR 82, RR 18, SpO2 96% on room air, Temp 98.4°F.
General: Alert and oriented, in no acute distress.
Cardiovascular: Regular rate and rhythm, no murmurs, rubs, or gallops. No peripheral edema.
Pulmonary: Clear to auscultation bilaterally, no wheezing or rales.
Abdomen: Soft, non-tender, non-distended.
Extremities: Warm, well-perfused, 2+ pulses throughout.`,
  assessment: `1. Chest tightness with exertion — likely cardiac etiology given risk factors (HTN, DM, age). Rule out angina / early ischemic heart disease.
2. Hypertension — suboptimally controlled today, BP 142/88.
3. Type 2 diabetes mellitus — stable per patient report, pending A1C.`,
  plan: `1. ECG in office today — results pending.
2. Order lipid panel, BMP, HbA1c, and troponin.
3. Referral to cardiology for stress test evaluation within 1–2 weeks.
4. Increase lisinopril to 40mg daily; recheck BP in 2 weeks.
5. Patient counseled on warning signs requiring ER visit (crushing chest pain, severe SOB, syncope).
6. Follow-up appointment in 2 weeks or sooner if symptoms worsen.`,
};

// Patients use demographic descriptors (industry standard for SOAP notes)
const SAMPLE_PATIENTS = [
  { id: 1, name: '54-year-old male', visitType: 'Follow-up visit', mrn: 'BB-00142', lastVisit: '2026-04-15', status: 'Active' },
  { id: 2, name: '32-year-old female', visitType: 'Annual physical', mrn: 'BB-00138', lastVisit: '2026-04-12', status: 'Active' },
  { id: 3, name: '67-year-old female', visitType: 'Chronic care management', mrn: 'BB-00129', lastVisit: '2026-04-10', status: 'Active' },
  { id: 4, name: '45-year-old male', visitType: 'New patient consultation', mrn: 'BB-00121', lastVisit: '2026-04-08', status: 'Active' },
  { id: 5, name: '28-year-old female', visitType: 'Acute visit', mrn: 'BB-00115', lastVisit: '2026-04-05', status: 'Active' },
];

export default function BizBitAIScribe() {
  const [screen, setScreen] = useState('login'); // login | dashboard | patients | note
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [user] = useState({ name: 'Dr. Demo', role: 'Provider' });

  return (
    <div style={{ fontFamily: "'Lato', -apple-system, sans-serif", minHeight: '100vh', background: BRAND.bg, color: BRAND.dark }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'Lato', -apple-system, sans-serif; }
        @keyframes pulse-rec { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .fade-in { animation: fade-in 0.4s ease-out; }
        .shimmer { background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        button { font-family: inherit; cursor: pointer; transition: all 0.2s ease; }
        input, textarea { font-family: inherit; }
      `}</style>

      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fdf8ea', borderBottom: '1px solid #e7d7a8', color: '#8a6d1b', fontSize: '12.5px', fontWeight: 600, textAlign: 'center', padding: '8px 16px' }}>
        Demonstration only · Sample data · Do not enter real patient information
      </div>

      {screen === 'login' && <LoginScreen onLogin={() => setScreen('dashboard')} />}
      {screen === 'dashboard' && <Dashboard user={user} onNavigate={setScreen} onLogout={() => setScreen('login')} />}
      {screen === 'patients' && <PatientList user={user} onBack={() => setScreen('dashboard')} onSelect={(p) => { setSelectedPatient(p); setScreen('note'); }} />}
      {screen === 'note' && <NoteScreen user={user} patient={selectedPatient} onBack={() => setScreen('patients')} />}
    </div>
  );
}

// ============================================================
// LOGIN SCREEN
// ============================================================
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('dr.demo@bizbitai.io');
  const [password, setPassword] = useState('••••••••••');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyLight} 100%)` }}>
      <div className="fade-in" style={{ background: BRAND.white, borderRadius: '16px', padding: '48px 40px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <NodeIcon size={44} />
            <h1 className="font-display" style={{ margin: 0, fontSize: '36px', color: BRAND.navy, fontWeight: 700 }}>BizBitAI</h1>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: BRAND.greenLight, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Scribe</p>
          <p style={{ margin: '12px 0 0', fontSize: '14px', color: '#6B7280' }}>The AI Platform Built for Small Clinics</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: BRAND.dark, marginBottom: '6px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', border: `1px solid ${BRAND.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = BRAND.navy}
            onBlur={(e) => e.target.style.borderColor = BRAND.border}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: BRAND.dark, marginBottom: '6px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', border: `1px solid ${BRAND.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = BRAND.navy}
            onBlur={(e) => e.target.style.borderColor = BRAND.border}
          />
        </div>

        <button
          onClick={onLogin}
          style={{ width: '100%', padding: '14px', background: BRAND.navy, color: BRAND.white, border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, letterSpacing: '0.3px' }}
          onMouseOver={(e) => e.currentTarget.style.background = BRAND.navyLight}
          onMouseOut={(e) => e.currentTarget.style.background = BRAND.navy}
        >
          Sign In
        </button>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${BRAND.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
          <Shield size={13} />
          <span>Demonstration — sample data only</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ user, onNavigate, onLogout }) {
  const [modal, setModal] = useState(null); // 'notes' | 'avgtime' | 'queue' | 'week' | null

  const notesToday = [
    { patient: '54-year-old male', visitType: 'Follow-up', time: '10:32 AM', noteTime: '2:08', status: 'Exported to PDF' },
    { patient: '32-year-old female', visitType: 'New Patient', time: '9:15 AM', noteTime: '2:44', status: 'Copied' },
    { patient: '67-year-old female', visitType: 'Sick Visit', time: '8:50 AM', noteTime: '1:58', status: 'Emailed' },
    { patient: '45-year-old male', visitType: 'Follow-up', time: '8:20 AM', noteTime: '2:01', status: 'Exported to PDF' },
    { patient: '28-year-old female', visitType: 'Annual Physical', time: '8:00 AM', noteTime: '2:52', status: 'Copied' },
  ];

  const queueToday = [
    { patient: '45-year-old male', mrn: 'BB-00129', visitType: 'Annual Physical', time: '11:00 AM' },
    { patient: '67-year-old female', mrn: 'BB-00121', visitType: 'Follow-up', time: '11:30 AM' },
    { patient: '54-year-old male', mrn: 'BB-00115', visitType: 'Sick Visit', time: '12:00 PM' },
  ];

  const weekData = [
    { day: 'Mon', notes: 8, avg: '2:10' },
    { day: 'Tue', notes: 7, avg: '2:14' },
    { day: 'Wed', notes: 9, avg: '2:05' },
    { day: 'Thu', notes: 6, avg: '2:22' },
    { day: 'Fri', notes: 4, avg: '2:18' },
  ];

  const modalStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px',
  };
  const cardStyle = {
    background: BRAND.white, borderRadius: '16px',
    width: '100%', maxWidth: '520px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    animation: 'fade-in 0.2s ease-out',
    overflow: 'hidden',
  };
  const modalHeader = (title, sub) => (
    <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${BRAND.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: BRAND.navy }}>{title}</div>
        {sub && <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{sub}</div>}
      </div>
      <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: '#9CA3AF', padding: '4px', cursor: 'pointer' }}>
        <X size={18} />
      </button>
    </div>
  );

  return (
    <div>
      <TopNav user={user} onLogout={onLogout} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }} className="fade-in">
        <div style={{ marginBottom: '32px' }}>
          <h1 className="font-display" style={{ margin: 0, fontSize: '36px', color: BRAND.navy, fontWeight: 700 }}>Good morning, {user.name}</h1>
          <p style={{ margin: '6px 0 0', color: '#6B7280', fontSize: '15px' }}>Here's what's happening today.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <StatCard label="Notes Today" value="7" trend="+2 vs yesterday" onClick={() => setModal('notes')} />
          <StatCard label="Avg. Note Time" value="2:14" trend="−68% vs manual" highlight onClick={() => setModal('avgtime')} />
          <StatCard label="Queue" value="3" trend="Pending review" onClick={() => setModal('queue')} />
          <StatCard label="This Week" value="34" trend="Notes completed" onClick={() => setModal('week')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <ActionCard
            title="Create New Note"
            description="Record a patient encounter and generate a structured SOAP note in under 3 minutes."
            icon={<Plus size={22} />}
            primary
            onClick={() => onNavigate('patients')}
          />
          <ActionCard
            title="Patient Records"
            description="Browse your patient list and access prior visit notes."
            icon={<User size={22} />}
            onClick={() => onNavigate('patients')}
          />
          <ActionCard
            title="Smart Scheduling"
            description="AI-powered appointment reminders and no-show prediction."
            icon={<Clock size={22} />}
            comingSoon
          />
        </div>

        <div style={{ marginTop: '40px' }}>
          <h2 className="font-display" style={{ fontSize: '22px', color: BRAND.navy, fontWeight: 600, margin: '0 0 16px' }}>Recent Notes</h2>
          <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, overflow: 'hidden' }}>
            {[
              { patient: '54-year-old male', time: '10:32 AM', status: 'Exported to PDF', type: 'Follow-up' },
              { patient: '32-year-old female', time: '9:15 AM', status: 'Copied', type: 'Annual physical' },
              { patient: '67-year-old female', time: 'Yesterday', status: 'Emailed', type: 'Chronic care' },
            ].map((n, i) => (
              <div key={i} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < 2 ? `1px solid ${BRAND.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: BRAND.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={16} color={BRAND.navy} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{n.patient}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{n.type} • {n.time}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: BRAND.green, fontWeight: 600 }}>
                  <CheckCircle2 size={14} />
                  {n.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODAL: Notes Today ── */}
      {modal === 'notes' && (
        <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div style={cardStyle}>
            {modalHeader('Notes Today', '5 notes completed · Monday, June 8')}
            <div style={{ padding: '8px 0' }}>
              {notesToday.map((n, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', borderBottom: i < notesToday.length - 1 ? `1px solid ${BRAND.border}` : 'none' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: BRAND.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND.white, fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                    {n.patient.split('-year-old ')[1]?.slice(0, 1).toUpperCase() || 'P'}
                  </div>
                  <div style={{ marginLeft: '12px', flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: BRAND.dark }}>{n.patient}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{n.visitType} · {n.time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-display" style={{ fontSize: '16px', fontWeight: 700, color: BRAND.navy }}>{n.noteTime}</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>note time</div>
                  </div>
                  <div style={{ marginLeft: '14px', fontSize: '11px', color: BRAND.green, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> {n.status}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 24px', borderTop: `1px solid ${BRAND.border}`, display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280' }}>
              <span>Average note time today</span>
              <span className="font-display" style={{ fontWeight: 700, color: BRAND.navy, fontSize: '14px' }}>2:21</span>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Avg Note Time ── */}
      {modal === 'avgtime' && (
        <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div style={cardStyle}>
            {modalHeader('Average Note Time', 'AI documentation vs. manual charting')}
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: BRAND.bg, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Manual Charting</div>
                  <div className="font-display" style={{ fontSize: '32px', fontWeight: 700, color: '#9CA3AF' }}>12:30</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>industry average</div>
                </div>
                <div style={{ background: '#EAF3DE', border: `2px solid ${BRAND.green}`, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: BRAND.green, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>BizBitAI Scribe</div>
                  <div className="font-display" style={{ fontSize: '32px', fontWeight: 700, color: BRAND.navy }}>2:14</div>
                  <div style={{ fontSize: '11px', color: BRAND.green, fontWeight: 700, marginTop: '4px' }}>82% faster</div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
                  <span>Time per note</span>
                </div>
                {[{ label: 'Manual', pct: 100, val: '12:30', color: '#D1D5DB' }, { label: 'BizBitAI Scribe', pct: 18, val: '2:14', color: BRAND.green }].map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', width: '110px', color: '#6B7280' }}>{r.label}</div>
                    <div style={{ flex: 1, height: '8px', background: BRAND.bg, borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: '4px' }} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: BRAND.dark, width: '36px' }}>{r.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: BRAND.bg, borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Time saved today</div>
                  <div className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: BRAND.navy }}>1.2 hrs</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>based on 7 notes</div>
                </div>
                <div style={{ background: BRAND.bg, borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Time saved this week</div>
                  <div className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: BRAND.navy }}>5.8 hrs</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>based on 34 notes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Queue ── */}
      {modal === 'queue' && (
        <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div style={cardStyle}>
            {modalHeader("Today's Queue", `3 patients remaining · Monday, June 8`)}
            <div style={{ padding: '8px 0' }}>
              {queueToday.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: i < queueToday.length - 1 ? `1px solid ${BRAND.border}` : 'none' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: BRAND.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND.white, fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                    {p.patient.split('-year-old ')[1]?.slice(0, 2).toUpperCase() || 'P'}
                  </div>
                  <div style={{ marginLeft: '12px', flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: BRAND.dark }}>{p.patient}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>MRN {p.mrn} · {p.visitType}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: BRAND.dark }}>{p.time}</div>
                    <div style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 600 }}>⏳ Pending note</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 24px', borderTop: `1px solid ${BRAND.border}` }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Start a note for any patient from the Patient List screen</div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: This Week ── */}
      {modal === 'week' && (
        <div style={modalStyle} onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div style={cardStyle}>
            {modalHeader('This Week', 'Notes completed April 14–18, 2026')}
            <div style={{ padding: '20px 24px' }}>
              {/* Bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '80px', marginBottom: '8px' }}>
                {weekData.map((d, i) => {
                  const maxNotes = Math.max(...weekData.map(x => x.notes));
                  const h = Math.round((d.notes / maxNotes) * 72);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '100%', height: `${h}px`, background: BRAND.navy, borderRadius: '4px 4px 0 0' }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {weekData.map((d, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: BRAND.navy }}>{d.notes}</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{d.avg}</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{d.day}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Total Notes', val: '34' },
                  { label: 'Avg Per Day', val: '6.8' },
                  { label: 'Avg Note Time', val: '2:14' },
                  { label: 'Est. Hours Saved', val: '5.9 hrs' },
                ].map((s, i) => (
                  <div key={i} style={{ background: BRAND.bg, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
                    <div className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: BRAND.navy, marginTop: '4px' }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PATIENT LIST
// ============================================================
function PatientList({ user, onBack, onSelect }) {
  const [query, setQuery] = useState('');
  const filtered = SAMPLE_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.mrn.toLowerCase().includes(query.toLowerCase()) ||
    p.visitType.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <TopNav user={user} />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }} className="fade-in">
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: BRAND.navy, fontSize: '14px', fontWeight: 600, padding: '6px 0', marginBottom: '16px' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 className="font-display" style={{ margin: 0, fontSize: '32px', color: BRAND.navy, fontWeight: 700 }}>Select a Patient</h1>
        <p style={{ margin: '6px 0 24px', color: '#6B7280', fontSize: '15px' }}>Choose an existing patient or add a new one to start a note.</p>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by description, MRN, or visit type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', padding: '14px 14px 14px 44px', border: `1px solid ${BRAND.border}`, borderRadius: '10px', fontSize: '14px', outline: 'none', background: BRAND.white }}
            onFocus={(e) => e.target.style.borderColor = BRAND.navy}
            onBlur={(e) => e.target.style.borderColor = BRAND.border}
          />
        </div>

        <button
          style={{ width: '100%', padding: '16px', background: BRAND.white, border: `2px dashed ${BRAND.green}`, borderRadius: '10px', color: BRAND.green, fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}
        >
          <Plus size={18} /> Add New Patient
        </button>

        <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>No patients found.</div>
          ) : filtered.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', borderBottom: i < filtered.length - 1 ? `1px solid ${BRAND.border}` : 'none', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onMouseOver={(e) => e.currentTarget.style.background = BRAND.bg}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND.white }}>
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: BRAND.dark }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>MRN {p.mrn} • {p.visitType} • Last visit {p.lastVisit}</div>
                </div>
              </div>
              <ChevronRight size={18} color="#9CA3AF" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// NOTE SCREEN — the core demo moment
// ============================================================
function NoteScreen({ user, patient, onBack }) {
  const [phase, setPhase] = useState('ready'); // ready | recording | processing | generated
  const [transcript, setTranscript] = useState('');
  const [soapNote, setSoapNote] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [exportMsg, setExportMsg] = useState('');
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startRecording = async () => {
    setElapsed(0);
    setPhase('recording');
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  const stopRecording = async () => {
    clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setPhase('processing');

    const fakeTranscript = `Patient is a 54-year-old male, been having chest tightness and shortness of breath for about three days, worse when he walks up stairs or exerts himself. No radiating pain, no nausea, no sweating. Mild non-productive cough. No fever. History of hypertension, type two diabetes. On lisinopril 20 milligrams daily, metformin 1000 milligrams twice a day. No allergies. Non-smoker. Vitals: BP 142 over 88, heart rate 82, O2 sat 96 on room air. Heart sounds regular, no murmurs. Lungs clear bilaterally. Plan: getting an ECG today, ordering lipid panel, BMP, A1C, troponin. Referring to cardiology for stress test. Increasing lisinopril to 40 milligrams daily. Follow-up in two weeks.`;
    setTranscript(fakeTranscript);

    setTimeout(() => {
      setSoapNote(DEMO_SOAP_NOTE);
      setPhase('generated');
    }, 2200);
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const fullNoteText = () => {
    if (!soapNote) return '';
    return `SOAP NOTE — ${patient.name} (MRN ${patient.mrn})
Visit type: ${patient.visitType}
Date: ${new Date().toLocaleString()}
Provider: ${user.name}

SUBJECTIVE
${soapNote.subjective}

OBJECTIVE
${soapNote.objective}

ASSESSMENT
${soapNote.assessment}

PLAN
${soapNote.plan}

---
Generated by BizBitAI Scribe`;
  };

  const showMsg = (msg) => {
    setExportMsg(msg);
    setTimeout(() => setExportMsg(''), 2500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullNoteText());
      showMsg('Copied to clipboard');
    } catch {
      showMsg('Copy failed — try selecting manually');
    }
  };

  const safeFilename = (s) => s.replace(/[^a-zA-Z0-9]/g, '_');

  const handleDownloadTxt = () => {
    const blob = new Blob([fullNoteText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOAP_${safeFilename(patient.name)}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showMsg('Downloaded as .txt');
  };

  const handleDownloadDocx = () => {
    const rtf = `{\\rtf1\\ansi\\deff0 {\\fonttbl{\\f0 Arial;}} \\f0\\fs22 ${fullNoteText().replace(/\n/g, '\\par ')}}`;
    const blob = new Blob([rtf], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOAP_${safeFilename(patient.name)}_${Date.now()}.rtf`;
    a.click();
    URL.revokeObjectURL(url);
    showMsg('Downloaded as .rtf (opens in Word)');
  };

  const handleDownloadPdf = () => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>SOAP Note — ${patient.name}</title>
      <style>
        body { font-family: Georgia, serif; padding: 40px; max-width: 700px; margin: auto; color: #333; }
        h1 { color: ${BRAND.navy}; border-bottom: 2px solid ${BRAND.green}; padding-bottom: 8px; }
        h2 { color: ${BRAND.navy}; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 24px; }
        .header { display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 20px; }
        .footer { margin-top: 40px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 12px; }
        p { white-space: pre-wrap; }
      </style></head><body>
      <h1>SOAP Note</h1>
      <div class="header">
        <div><strong>${patient.name}</strong> • MRN ${patient.mrn} • ${patient.visitType}</div>
        <div>${new Date().toLocaleString()}</div>
      </div>
      <div>Provider: ${user.name}</div>
      <h2>Subjective</h2><p>${soapNote.subjective}</p>
      <h2>Objective</h2><p>${soapNote.objective}</p>
      <h2>Assessment</h2><p>${soapNote.assessment}</p>
      <h2>Plan</h2><p>${soapNote.plan}</p>
      <div class="footer">Generated by BizBitAI Scribe • The AI Platform Built for Small Clinics</div>
      <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    w.document.close();
    showMsg('Opening print dialog — save as PDF');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`SOAP Note — ${patient.name} (${new Date().toLocaleDateString()})`);
    const body = encodeURIComponent(fullNoteText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    showMsg('Opening email...');
  };

  return (
    <div>
      <TopNav user={user} />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }} className="fade-in">
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: BRAND.navy, fontSize: '14px', fontWeight: 600, padding: '6px 0', marginBottom: '12px' }}
        >
          <ArrowLeft size={16} /> Back to Patients
        </button>

        <div style={{ background: BRAND.white, borderRadius: '12px', padding: '20px 24px', border: `1px solid ${BRAND.border}`, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND.white }}>
              <User size={22} />
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: BRAND.dark }}>{patient.name}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>MRN {patient.mrn} • {patient.visitType}</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {phase === 'ready' && (
          <div style={{ background: BRAND.white, borderRadius: '16px', padding: '60px 40px', border: `1px solid ${BRAND.border}`, textAlign: 'center' }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: BRAND.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Mic size={38} color={BRAND.navy} />
            </div>
            <h2 className="font-display" style={{ fontSize: '26px', color: BRAND.navy, fontWeight: 700, margin: '0 0 8px' }}>Ready to record</h2>
            <p style={{ color: '#6B7280', fontSize: '15px', margin: '0 0 28px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
              Start dictating the encounter. Scribe will generate a structured SOAP note when you're done.
            </p>
            <button
              onClick={startRecording}
              style={{ padding: '16px 36px', background: BRAND.green, color: BRAND.white, border: 'none', borderRadius: '999px', fontSize: '15px', fontWeight: 700, letterSpacing: '0.3px', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: `0 6px 20px ${BRAND.green}50` }}
              onMouseOver={(e) => e.currentTarget.style.background = BRAND.greenLight}
              onMouseOut={(e) => e.currentTarget.style.background = BRAND.green}
            >
              <Mic size={18} /> Start Recording
            </button>
          </div>
        )}

        {phase === 'recording' && (
          <div style={{ background: BRAND.white, borderRadius: '16px', padding: '60px 40px', border: `1px solid ${BRAND.border}`, textAlign: 'center' }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#FEE2E2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', animation: 'pulse-rec 1.5s infinite' }}>
              <Mic size={38} color="#DC2626" />
            </div>
            <h2 className="font-display" style={{ fontSize: '26px', color: BRAND.navy, fontWeight: 700, margin: '0 0 8px' }}>Recording...</h2>
            <div style={{ fontSize: '32px', fontWeight: 300, color: BRAND.dark, fontVariantNumeric: 'tabular-nums', marginBottom: '28px', letterSpacing: '2px' }}>
              {formatTime(elapsed)}
            </div>
            <button
              onClick={stopRecording}
              style={{ padding: '14px 32px', background: BRAND.navy, color: BRAND.white, border: 'none', borderRadius: '999px', fontSize: '15px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '10px' }}
            >
              <MicOff size={18} /> Stop & Generate Note
            </button>
          </div>
        )}

        {phase === 'processing' && (
          <div style={{ background: BRAND.white, borderRadius: '16px', padding: '60px 40px', border: `1px solid ${BRAND.border}`, textAlign: 'center' }}>
            <Loader2 size={44} color={BRAND.navy} style={{ animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 className="font-display" style={{ fontSize: '24px', color: BRAND.navy, fontWeight: 700, margin: '0 0 8px' }}>Generating SOAP note</h2>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
              Processing encounter...
            </p>
            <div style={{ marginTop: '28px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
              <div className="shimmer" style={{ height: '12px', borderRadius: '6px', marginBottom: '10px' }} />
              <div className="shimmer" style={{ height: '12px', borderRadius: '6px', marginBottom: '10px', width: '85%' }} />
              <div className="shimmer" style={{ height: '12px', borderRadius: '6px', width: '70%' }} />
            </div>
          </div>
        )}

        {phase === 'generated' && soapNote && (
          <div className="fade-in">
            <div style={{ padding: '14px 20px', background: '#ECFDF5', border: `1px solid ${BRAND.greenLight}`, borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color={BRAND.green} />
              <div>
                <div style={{ fontWeight: 700, color: BRAND.green, fontSize: '14px' }}>Note generated in {formatTime(elapsed)}</div>
                <div style={{ fontSize: '12px', color: '#065F46' }}>Review, edit as needed, then export below.</div>
              </div>
            </div>

            <div style={{ background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BRAND.border}`, background: BRAND.bg }}>
                <h2 className="font-display" style={{ margin: 0, fontSize: '22px', color: BRAND.navy, fontWeight: 700 }}>SOAP Note</h2>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                  {patient.name} • {new Date().toLocaleString()} • {user.name}
                </div>
              </div>

              <SoapSection label="Subjective" text={soapNote.subjective} onEdit={(v) => setSoapNote({...soapNote, subjective: v})} />
              <SoapSection label="Objective" text={soapNote.objective} onEdit={(v) => setSoapNote({...soapNote, objective: v})} />
              <SoapSection label="Assessment" text={soapNote.assessment} onEdit={(v) => setSoapNote({...soapNote, assessment: v})} />
              <SoapSection label="Plan" text={soapNote.plan} onEdit={(v) => setSoapNote({...soapNote, plan: v})} last />
            </div>

            <div style={{ marginTop: '20px', padding: '20px 24px', background: BRAND.white, borderRadius: '12px', border: `1px solid ${BRAND.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: BRAND.dark }}>Export Note</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>No EHR connection required — works alongside any existing system.</div>
                </div>
                {exportMsg && (
                  <div style={{ fontSize: '13px', color: BRAND.green, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={14} /> {exportMsg}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <ExportBtn icon={<Download size={16} />} label="PDF" onClick={handleDownloadPdf} primary />
                <ExportBtn icon={<Copy size={16} />} label="Copy" onClick={handleCopy} />
                <ExportBtn icon={<FileText size={16} />} label=".txt" onClick={handleDownloadTxt} />
                <ExportBtn icon={<FileText size={16} />} label=".docx" onClick={handleDownloadDocx} />
                <ExportBtn icon={<Mail size={16} />} label="Email" onClick={handleEmail} />
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: BRAND.bg, borderRadius: '8px', fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>
                  Export to EHR <span style={{ padding: '2px 6px', background: BRAND.greenLight, color: BRAND.white, borderRadius: '4px', fontSize: '10px' }}>Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================
function TopNav({ user, onLogout }) {
  return (
    <div style={{ background: BRAND.white, borderBottom: `1px solid ${BRAND.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <NodeIcon size={32} />
        <div>
          <div className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: BRAND.navy, lineHeight: 1 }}>BizBitAI</div>
          <div style={{ fontSize: '10px', color: BRAND.greenLight, letterSpacing: '1.5px', fontWeight: 600, marginTop: '2px' }}>SCRIBE</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: BRAND.dark, lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>{user.role}</div>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND.white, fontWeight: 700, fontSize: '12px' }}>
              DD
            </div>
            {onLogout && (
              <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#6B7280', padding: '6px' }} title="Log out">
                <LogOut size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, small }) {
  const w = small ? 32 : 40;
  const h = small ? 18 : 22;
  const knob = small ? 14 : 18;
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{ width: `${w}px`, height: `${h}px`, borderRadius: `${h}px`, background: checked ? BRAND.green : '#D1D5DB', border: 'none', position: 'relative', padding: 0, flexShrink: 0 }}
    >
      <div style={{ width: `${knob}px`, height: `${knob}px`, borderRadius: '50%', background: BRAND.white, position: 'absolute', top: '2px', left: checked ? `${w - knob - 2}px` : '2px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

function StatCard({ label, value, trend, highlight, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: BRAND.white, borderRadius: '12px', padding: '18px 20px',
        border: `1px solid ${BRAND.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onMouseOver={(e) => { if (onClick) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(22,14,112,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div className="font-display" style={{ fontSize: '30px', fontWeight: 700, color: highlight ? BRAND.green : BRAND.navy, margin: '6px 0 2px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: highlight ? BRAND.green : '#6B7280', fontWeight: 600 }}>{trend}</div>
      {onClick && <div style={{ fontSize: '10px', color: '#C4C9D4', marginTop: '4px' }}>View details →</div>}
    </div>
  );
}

function ActionCard({ title, description, icon, primary, onClick, comingSoon }) {
  const bg = primary ? BRAND.navy : BRAND.white;
  const fg = primary ? BRAND.white : BRAND.dark;
  const sub = primary ? '#B8B5E8' : '#6B7280';
  return (
    <button
      onClick={comingSoon ? undefined : onClick}
      disabled={comingSoon}
      style={{ background: bg, border: `1px solid ${primary ? BRAND.navy : BRAND.border}`, borderRadius: '14px', padding: '22px', textAlign: 'left', cursor: comingSoon ? 'not-allowed' : 'pointer', opacity: comingSoon ? 0.6 : 1, position: 'relative' }}
      onMouseOver={(e) => !comingSoon && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {comingSoon && (
        <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', fontWeight: 700, color: BRAND.white, background: BRAND.greenLight, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>COMING SOON</span>
      )}
      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: primary ? 'rgba(255,255,255,0.15)' : BRAND.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: primary ? BRAND.white : BRAND.navy, marginBottom: '14px' }}>
        {icon}
      </div>
      <div className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: fg, margin: '0 0 6px' }}>{title}</div>
      <div style={{ fontSize: '13px', color: sub, lineHeight: 1.5 }}>{description}</div>
    </button>
  );
}

function SoapSection({ label, text, onEdit, last }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(text);

  useEffect(() => setVal(text), [text]);

  return (
    <div style={{ padding: '18px 24px', borderBottom: last ? 'none' : `1px solid ${BRAND.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: BRAND.navy, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</div>
        <button
          onClick={() => { if (editing) onEdit(val); setEditing(!editing); }}
          style={{ background: 'none', border: 'none', color: BRAND.navy, fontSize: '12px', fontWeight: 600, padding: '4px 8px' }}
        >
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          style={{ width: '100%', minHeight: '120px', padding: '10px', border: `1px solid ${BRAND.navy}`, borderRadius: '6px', fontSize: '14px', lineHeight: 1.6, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
        />
      ) : (
        <div style={{ fontSize: '14px', lineHeight: 1.7, color: BRAND.dark, whiteSpace: 'pre-wrap' }}>{text}</div>
      )}
    </div>
  );
}

function ExportBtn({ icon, label, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '10px 16px', background: primary ? BRAND.navy : BRAND.white, color: primary ? BRAND.white : BRAND.navy, border: `1px solid ${primary ? BRAND.navy : BRAND.border}`, borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
      onMouseOver={(e) => { if (!primary) e.currentTarget.style.background = BRAND.bg; else e.currentTarget.style.background = BRAND.navyLight; }}
      onMouseOut={(e) => { if (!primary) e.currentTarget.style.background = BRAND.white; else e.currentTarget.style.background = BRAND.navy; }}
    >
      {icon} {label}
    </button>
  );
}
