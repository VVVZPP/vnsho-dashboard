import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { Zap, Battery, TrendingUp, Car, Truck, Bus, Clock, Award,
  AlertCircle, ChevronRight, Activity, X, Send, Sparkles, Loader2,
  Globe, ArrowRight, Search, ShoppingCart, Lock, Mail, Shield, CheckCircle } from 'lucide-react';

export default function SingaporeEVDashboard() {
  // ============ EMAIL GATE STATE ============
  const [gateStage, setGateStage] = useState('email'); // 'email' | 'pin' | 'granted'
  const [gateEmail, setGateEmail] = useState('');
  const [gatePin, setGatePin] = useState('');
  const [gatePinInput, setGatePinInput] = useState('');
  const [gateError, setGateError] = useState('');
  const [gateLoading, setGateLoading] = useState(false);
  const [gateShowPin, setGateShowPin] = useState(false);
  const [emailList, setEmailList] = useState([]);

  // Load saved session and email list from storage
  useEffect(() => {
    (async () => {
      try {
        const session = await Promise.resolve((() => { try { const v = localStorage.getItem('vnsho_session'); return v ? { value: v } : null; } catch { return null; } })());
        if (session && session.value) {
          const parsed = JSON.parse(session.value);
          if (parsed.granted && parsed.email) {
            setGateEmail(parsed.email);
            setGateStage('granted');
          }
        }
      } catch {}
      try {
        const list = await Promise.resolve((() => { try { const v = localStorage.getItem('vnsho_email_list'); return v ? { value: v } : null; } catch { return null; } })());
        if (list && list.value) setEmailList(JSON.parse(list.value));
      } catch {}
    })();
  }, []);

  // Free email domains to reject
  const FREE_DOMAINS = ['gmail.com','yahoo.com','yahoo.co','hotmail.com','outlook.com','live.com','aol.com','icloud.com','me.com','mac.com','mail.com','protonmail.com','zoho.com','yandex.com','gmx.com','163.com','qq.com','sina.com','126.com','foxmail.com','tutanota.com','fastmail.com'];

  const handleEmailSubmit = async () => {
    setGateError('');
    const email = gateEmail.trim().toLowerCase();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setGateError('Please enter a valid email address.');
      return;
    }
    const domain = email.split('@')[1];
    if (FREE_DOMAINS.includes(domain)) {
      setGateError('Please use your work email. Personal email addresses (Gmail, Yahoo, Hotmail, etc.) are not accepted.');
      return;
    }
    setGateLoading(true);
    // Generate 6-digit PIN
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    setGatePin(pin);
    // Save email to list
    const newEntry = { email, domain, timestamp: new Date().toISOString(), company: domain.split('.')[0] };
    const updatedList = [...emailList.filter(e => e.email !== email), newEntry];
    setEmailList(updatedList);
    try { await Promise.resolve((() => { try { localStorage.setItem('vnsho_email_list', JSON.stringify(updatedList)); } catch {} })()); } catch {}
    // In production, this would call a backend API to send the PIN via email
    // For demo in Claude artifact: show PIN on screen (alerts are blocked in iframes)
    setTimeout(() => {
      setGateLoading(false);
      setGateStage('pin');
      setGateShowPin(true);
    }, 1200);
  };

  const handlePinSubmit = async () => {
    setGateError('');
    if (gatePinInput.trim() !== gatePin) {
      setGateError('Incorrect PIN. Please check your email and try again.');
      return;
    }
    setGateStage('granted');
    try { await Promise.resolve((() => { try { localStorage.setItem('vnsho_session', JSON.stringify({ granted: true, email: gateEmail, timestamp: new Date().toISOString() })); } catch {} })()); } catch {}
  };

  const handleLogout = async () => {
    setGateStage('email');
    setGateEmail('');
    setGatePin('');
    setGatePinInput('');
    setGateError('');
    try { await Promise.resolve((() => { try { localStorage.removeItem('vnsho_session'); } catch {} })()); } catch {}
  };

  const [activeTab, setActiveTab] = useState('home');

  // ============ CALCULATOR STATE ============
  const [calcPeriod, setCalcPeriod] = useState('month');   // 'month' | 'year'
  const [co2Eff, setCo2Eff] = useState(6.5);
  const [co2Km, setCo2Km] = useState(1500);
  const [co2Rate, setCo2Rate] = useState(0.35);
  const [petrolConsump, setPetrolConsump] = useState(12);
  const [evCompareEff, setEvCompareEff] = useState(6.7);
  const [costKm, setCostKm] = useState(1500);
  const [petrolPrice, setPetrolPrice] = useState(2.40);
  const [costRate, setCostRate] = useState(0.35);

  // ============ GOOGLE BRAND PALETTE (Material Design 3) ============
  const BLUE       = '#1A73E8';   // Google Blue — primary action
  const BLUE_LIGHT = '#E8F0FE';   // Blue surface tint
  const RED        = '#EA4335';   // Google Red
  const RED_LIGHT  = '#FCE8E6';
  const YELLOW     = '#FBBC04';   // Google Yellow
  const YELLOW_LIGHT = '#FEF7E0';
  const GREEN      = '#34A853';   // Google Green
  const GREEN_LIGHT = '#E6F4EA';
  const INK        = '#202124';   // Google primary text
  const SECONDARY  = '#5F6368';   // Google secondary text
  const SURFACE    = '#F8F9FA';   // Google background
  const CARD       = '#FFFFFF';
  const BORDER     = '#DADCE0';   // Google divider
  const BLUE_MID   = '#4285F4';   // Google Blue (alt)

  const CHART_COLORS = [BLUE, GREEN, YELLOW, RED, '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'];

  // ============ AI CHAT STATE ============
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Singapore EV assistant — powered by Google-quality intelligence.\n\nAsk me anything: fleet stats, brand comparisons, charging networks, buying advice, or the latest EV news. I have the full LTA dashboard data loaded and can search the web for anything newer." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSpecFilter, setActiveSpecFilter] = useState('passenger'); // 'passenger' | 'commercial'
  const [activeBrandFilter, setActiveBrandFilter] = useState('passenger'); // 'passenger' | 'commercial'
  // Compare tab state — must be at top level (Rules of Hooks)
  const [compareSlots, setCompareSlots] = useState([null, null, null]);
  const [compareSearch, setCompareSearch] = useState(['', '', '']);
  const [compareOpenSlot, setCompareOpenSlot] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ============ DATA ============
  const evGrowth = [
    { period: 'Dec 2024', evs: 26225, hybrids: 99157 },
    { period: 'Dec 2025', evs: 49110, hybrids: 118695 },
    { period: 'Jan 2026', evs: 51454, hybrids: 120115 },
    { period: 'Feb 2026', evs: 53688, hybrids: 121398 },
    { period: 'Mar 2026', evs: 56770, hybrids: 122830 },
    { period: 'Apr 2026', evs: 59735, hybrids: 123958 },
  ];

  // Source: LTA M03 — New registration of cars by make, Jan–May 2026 (Electric only)
  const evCarBrands = [
    { brand: 'BYD', units: 5513 },
    { brand: 'Tesla', units: 2043 },
    { brand: 'Chery', units: 999 },
    { brand: 'GAC', units: 754 },
    { brand: 'M.G.', units: 741 },
    { brand: 'Zeekr', units: 565 },
    { brand: 'Xpeng', units: 560 },
    { brand: 'B.M.W.', units: 547 },
    { brand: 'Dongfeng', units: 230 },
    { brand: 'Avatr', units: 168 },
    { brand: 'Maxus', units: 160 },
    { brand: 'Volvo', units: 160 },
    { brand: 'Toyota', units: 145 },
    { brand: 'Leapmotor', units: 134 },
    { brand: 'Geely', units: 118 },
    { brand: 'Porsche', units: 112 },
    { brand: 'Hyundai', units: 69 },
    { brand: 'Mini', units: 65 },
    { brand: 'Audi', units: 64 },
    { brand: 'Deepal', units: 64 },
  ];

  const evCommercialBrands = [
    { brand: 'BYD', units: 66, segment: 'LGV/HGV' },
    { brand: 'Foton', units: 51, segment: 'LGV/HGV' },
    { brand: 'Maxus', units: 50, segment: 'LGV' },
    { brand: 'Toyota', units: 39, segment: 'LGV/HGV' },
    { brand: 'Sany', units: 26, segment: 'HGV/Buses' },
    { brand: 'Citroen', units: 23, segment: 'LGV' },
    { brand: 'Farizon', units: 22, segment: 'LGV/HGV' },
    { brand: 'Volkswagen', units: 19, segment: 'LGV' },
    { brand: 'Higer', units: 16, segment: 'Buses' },
    { brand: 'Mercedes', units: 15, segment: 'LGV' },
  ];

  const evSpecs = [
    { model: 'BYD Atto 3', battery: 60.5, chem: 'LFP (Blade)', ac: 11, dc: 88, range: 420, eff: 6.0, type: 'SUV', segCat: 'Cat A', popular: true },
    { model: 'BYD Sealion 7', battery: 82.5, chem: 'LFP (Blade)', ac: 11, dc: 150, range: 482, eff: 5.0, type: 'SUV', segCat: 'Cat B', popular: true },
    { model: 'BYD Seal', battery: 82.5, chem: 'LFP (Blade)', ac: 11, dc: 150, range: 570, eff: 6.2, type: 'Sedan', segCat: 'Cat B', popular: true },
    { model: 'Tesla Model Y', battery: 75.0, chem: 'NMC', ac: 11, dc: 250, range: 600, eff: 6.7, type: 'SUV', segCat: 'Cat B', popular: true },
    { model: 'Tesla Model 3', battery: 60.0, chem: 'LFP', ac: 11, dc: 170, range: 513, eff: 7.1, type: 'Sedan', segCat: 'Cat B', popular: true },
    { model: 'Hyundai Ioniq 5', battery: 77.4, chem: 'NMC', ac: 11, dc: 350, range: 481, eff: 5.6, type: 'SUV', segCat: 'Cat B' },
    { model: 'Hyundai Ioniq 6', battery: 77.4, chem: 'NMC', ac: 11, dc: 350, range: 614, eff: 7.0, type: 'Sedan', segCat: 'Cat B' },
    { model: 'Kia EV6', battery: 77.4, chem: 'NMC', ac: 11, dc: 350, range: 528, eff: 6.4, type: 'SUV', segCat: 'Cat B' },
    { model: 'MG 4 EV', battery: 51.0, chem: 'LFP', ac: 11, dc: 117, range: 350, eff: 6.4, type: 'Hatch', segCat: 'Cat A' },
    { model: 'MG S5 EV', battery: 64.0, chem: 'LFP', ac: 11, dc: 139, range: 430, eff: 6.4, type: 'SUV', segCat: 'Cat A' },
    { model: 'Xpeng G6', battery: 87.5, chem: 'NMC', ac: 11, dc: 280, range: 570, eff: 6.1, type: 'SUV', segCat: 'Cat B' },
    { model: 'Zeekr X', battery: 66.0, chem: 'NMC', ac: 11, dc: 150, range: 380, eff: 5.5, type: 'SUV', segCat: 'Cat B' },
    { model: 'Zeekr 001', battery: 100.0, chem: 'NMC', ac: 22, dc: 200, range: 580, eff: 5.4, type: 'Wagon', segCat: 'Cat B' },
    { model: 'BMW iX1', battery: 64.7, chem: 'NMC', ac: 11, dc: 130, range: 440, eff: 6.0, type: 'SUV', segCat: 'Cat B' },
    { model: 'BMW i4 eDrive35', battery: 67.1, chem: 'NMC', ac: 11, dc: 180, range: 480, eff: 6.5, type: 'Sedan', segCat: 'Cat B' },
    { model: 'Mercedes EQE', battery: 90.6, chem: 'NMC', ac: 11, dc: 170, range: 590, eff: 5.9, type: 'Sedan', segCat: 'Cat B' },
    { model: 'Volvo EX30', battery: 64.0, chem: 'NMC', ac: 11, dc: 153, range: 460, eff: 6.5, type: 'SUV', segCat: 'Cat B' },
    { model: 'Porsche Taycan', battery: 93.4, chem: 'NMC', ac: 11, dc: 320, range: 503, eff: 4.8, type: 'Sedan', segCat: 'Cat B' },
    { model: 'Porsche Macan EV', battery: 95.0, chem: 'NMC', ac: 11, dc: 270, range: 591, eff: 5.5, type: 'SUV', segCat: 'Cat B' },
    { model: 'GAC Aion Y Plus', battery: 63.2, chem: 'LFP', ac: 6.6, dc: 100, range: 440, eff: 6.4, type: 'SUV', segCat: 'Cat A' },
    { model: 'Chery Omoda E5', battery: 61.1, chem: 'LFP', ac: 9.9, dc: 80, range: 430, eff: 6.7, type: 'SUV', segCat: 'Cat A' },
    { model: 'Avatr 11', battery: 90.0, chem: 'NMC', ac: 11, dc: 240, range: 555, eff: 5.5, type: 'SUV', segCat: 'Cat B' },
  ];

  // Charging operator data updated March 2026:
  // - BlueSG charging brand NO LONGER EXISTS as of 30 Sep 2025 (TotalEnergies shut it down)
  // - 1,465 TotalEnergies/BlueSG stations transferred to other CPOs by end-2025
  //   (primarily to SP Mobility/SP Group — 250 HDB carpark points confirmed Nov 2025)
  // - BlueSG as a car-sharing brand relaunched as "Flexar" in Apr 2026 (no charging ops)
  // Sources: electrive.com 27 Nov 2025; Wikipedia BlueSG article; ComfortDelGro press releases
  const chargingOps = [
    { op: 'Charge+', points: 4000, share: 29, color: BLUE, note: 'Crossed 4,000 Dec 2025. Target 16,000 by 2030.' },
    { op: 'SP Group / SP Mobility', points: 3800, share: 28, color: GREEN, note: 'Absorbed ~1,250 ex-TotalEnergies HDB points Nov–Dec 2025.' },
    { op: 'CDG ENGIE', points: 2100, share: 15, color: '#9C27B0', note: '2,100+ charge points as of Sep 2025 (ComfortDelGro press release).' },
    { op: 'Shell Recharge', points: 1100, share: 8, color: RED, note: 'Expanded DC HPC network in 2025.' },
    { op: 'Others / Private', points: 2650, share: 19, color: YELLOW, note: 'Tesla SC, Quantum, BYD, private carparks, condos.' },
  ];

  // Source: M03 total row — Jan–May 2026 all new car registrations by fuel type
  // Total new cars Jan-May: 22,353
  const adoptionPie = [
    { name: 'Pure EV', value: 7200, color: BLUE },
    { name: 'Hybrid', value: 8100, color: GREEN },
    { name: 'PHEV', value: 310, color: YELLOW },
    { name: 'Petrol', value: 6743, color: '#DADCE0' },
  ];
  const adoptionPieTotal = adoptionPie.reduce((s, e) => s + e.value, 0);

  // Source: LTA M09 — Motor vehicle population by fuel type, as at 30 April 2026
  const fleetCategories = [
    { label: 'Cars', total: 656634, ev: 59735, hybrid: 123958, icon: '🚗' },
    { label: 'Taxis', total: 12280, ev: 586, hybrid: 11610, icon: '🚕' },
    { label: 'Motorcycles', total: 153112, ev: 415, hybrid: 0, icon: '🏍️' },
    { label: 'Goods Vehicles', total: 143042, ev: 7192, hybrid: 6, icon: '🚛' },
    { label: 'Buses', total: 18403, ev: 885, hybrid: 0, icon: '🚌' },
  ];

  // ============ AI CHAT ============
  const dashboardContext = `You are a helpful EV assistant on a Singapore EV Mobility dashboard. Be friendly, clear and informative. Use the data below as your source of truth. Search the web for anything outside it.

SINGAPORE EV DATA (Updated: M03 May 2026, M09 Apr 2026 fleet population, LTA):
- Fleet population (30 Apr 2026, M09): 983,471 vehicles. Pure EVs: 68,813 (7.0%).
- EV Cars: 59,735 (9.1% of 656,634). +128% from Dec 2024.
- Hybrid Cars: 123,958 (18.9%). EV Goods: 7,192 (5.0%). EV Buses: 885. EV Taxis: 586.
- Jan-May 2026 new EV car registrations: ~7,200 (~32% of 22,353 new cars)
- Top brands Jan-May 2026 (M03): BYD 5,513 | Tesla 2,043 | Chery 999 | GAC 754 | MG 741 | Zeekr 565 | Xpeng 560 | BMW 547
- May 2026: BYD 1,091 | Tesla 360 (recovered from 168 in Apr) | Chery 243 | MG 203 | GAC 166 | Xpeng 161 | Zeekr 140 | BMW 120
- Tesla recovered in May (360) but still below Mar peak (617). Zeekr overtook Xpeng (565 vs 560).
- Charging: ~30,500 points. Charge+ 4,000 (29%), SP Mobility 3,800 (28%), CDG ENGIE 2,100 (15%)
- BlueSG charging brand DEFUNCT since Sep 2025. Points absorbed by SP Mobility.
- Incentives: EEAI (S$7.5K), VES A1 (S$25K), HVZES (S$40K for HGV/bus)

Respond without markdown. Be concise. Warm, helpful tone.`;

  const sendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const requestBody = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: dashboardContext,
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      };
      if (webSearchEnabled) requestBody.tools = [{ type: "web_search_20250305", name: "web_search" }];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      const textParts = (data.content || []).filter(i => i.type === "text").map(i => i.text);
      const usedSearch = (data.content || []).some(i => i.type === "server_tool_use" || i.type === "web_search_tool_result");
      const reply = textParts.join('\n\n').replace(/\*\*/g, '').replace(/#{1,4}\s/g, '') || "Sorry, I couldn't get a response. Please try again.";
      setMessages([...newMessages, { role: 'assistant', content: reply, usedSearch }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: "Something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const questionLibrary = {
    "🛒 Buying guide": { questions: ["Which EV is best for HDB residents?","Best EV under S$200K?","Cat A vs Cat B — which to choose?","BYD Atto 3 vs Tesla Model 3","Best family EV with 7 seats?","Buy now or wait?"] },
    "⚡ Performance": { questions: ["Which EV has the best efficiency?","Longest range EV in Singapore?","LFP vs NMC battery differences?","800V architecture — which EVs?","How long do EV batteries last?"] },
    "🔌 Charging": { questions: ["Cost to charge an EV in Singapore?","Which operator has most chargers?","Can I charge at my HDB?","Charge+ vs SP vs Shell — cheapest?","How long does charging take?"] },
    "💰 Costs": { questions: ["How does EEAI rebate work?","VES Band A1 — how much?","EV vs petrol over 10 years?","How does road tax work for EVs?","Monthly savings switching to EV?"] },
    "📊 Market data": { questions: ["What % of cars are EVs in Singapore?","How many EVs in Q1 2026?","Why is BYD outselling Tesla?","Will we hit 60K chargers by 2030?","Chinese brands vs European brands?"] },
    "🚛 Commercial": { questions: ["Best EV for last-mile delivery?","What is HVZES and who qualifies?","BYD T3 vs Maxus eDeliver 3?","Electric buses in Singapore?","Payback period for an electric LGV?"] },
    "🌏 Global": { questions: ["Singapore vs Norway on EV adoption?","BYD global sales 2026?","Solid-state battery news?","What is BYD's 1MW Flash charging?","Tesla Robotaxi update?"] },
    "🔬 Tech": { questions: ["What is regenerative braking?","How does battery thermal management work?","What is Vehicle-to-Load?","OTA software — which EVs have it?","Megawatt chargers — when in Singapore?"] },
  };

  // ============ CUSTOM TOOLTIP ============
  const GoogleTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
        {label && <p style={{ color: SECONDARY, fontSize: 12, marginBottom: 4 }}>{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || INK, fontSize: 13, fontWeight: 500 }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  };

  // ============ COMPONENTS ============
  const TabBtn = ({ id, label, emoji }) => (
    <button
      onClick={() => setActiveTab(id)}
      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap"
      style={{
        color: activeTab === id ? BLUE : SECONDARY,
        background: activeTab === id ? BLUE_LIGHT : 'transparent',
        borderRadius: 50,
        fontFamily: "'Google Sans', 'Inter', sans-serif",
      }}
    >
      <span>{emoji}</span>{label}
    </button>
  );

  const MetricCard = ({ label, value, delta, sub, color = BLUE, bg, icon }) => (
    <div style={{ background: bg || CARD, borderRadius: 20, padding: '24px', border: `1px solid ${BORDER}`, transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {icon && <div className="text-2xl mb-3">{icon}</div>}
      <div style={{ fontSize: 13, color: SECONDARY, fontWeight: 500, marginBottom: 8, letterSpacing: 0.1 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 700, color: INK, lineHeight: 1.1, letterSpacing: -0.5, fontFamily: "'Google Sans', 'Inter', sans-serif" }}>{value}</div>
      {delta && <div style={{ fontSize: 13, fontWeight: 600, color: color, marginTop: 6 }}>{delta}</div>}
      {sub && <div style={{ fontSize: 12, color: SECONDARY, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const SectionLabel = ({ text, color = BLUE }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: color === BLUE ? BLUE_LIGHT : GREEN_LIGHT, borderRadius: 50, padding: '6px 16px', marginBottom: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color, letterSpacing: 0.5 }}>{text}</span>
    </div>
  );

  const SectionHead = ({ chip, title, subtitle, chipColor }) => (
    <div style={{ marginBottom: 32 }}>
      {chip && <SectionLabel text={chip} color={chipColor || BLUE} />}
      <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 700, color: INK, lineHeight: 1.2, margin: '4px 0 10px', fontFamily: "'Google Sans', 'Inter', sans-serif", letterSpacing: -0.3 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 16, color: SECONDARY, lineHeight: 1.6, maxWidth: 640 }}>{subtitle}</p>}
    </div>
  );

  // ============ CALCULATOR DERIVED VALUES (top-level, no hooks) ============
  const calcMul = calcPeriod === 'year' ? 12 : 1;
  const calcPeriodLbl = calcPeriod === 'year' ? '/year' : '/month';
  // CO2 calc
  const calc_co2kWh = (co2Km / co2Eff) * calcMul;
  const calc_evCO2kg = calc_co2kWh * 0.408;
  const calc_petCO2kg = (co2Km * 0.12) * calcMul * 2.31;
  const calc_co2Saved = calc_petCO2kg - calc_evCO2kg;
  const calc_evChargeCost = calc_co2kWh * co2Rate;
  const calc_evBarPct = Math.min(100, Math.round((calc_evCO2kg / calc_petCO2kg) * 100));
  // Cost comparison calc
  const calc_petFuelCost = (costKm / 100) * petrolConsump * petrolPrice * calcMul;
  const calc_evFuelCost = (costKm / evCompareEff) * costRate * calcMul;
  const calc_saving = calc_petFuelCost - calc_evFuelCost;
  const calc_petCO2cost = (costKm / 100) * petrolConsump * 2.31 * calcMul;
  const calc_evCO2cost = (costKm / evCompareEff) * 0.408 * calcMul;
  const calc_co2Reduction = calc_petCO2cost - calc_evCO2cost;
  // Formatters
  const calcFmt = (n, d = 0) => Number(n).toLocaleString('en-SG', { minimumFractionDigits: d, maximumFractionDigits: d });
  const calcFmtS = n => 'S$' + calcFmt(n, 0);
  // Sub-components for calculator (defined at top level — valid)
  const CalcLabel = ({ children }) => <div style={{ fontSize: 13, fontWeight: 500, color: SECONDARY, marginBottom: 6 }}>{children}</div>;
  const CalcSlider = ({ min, max, step, value, onChange, display }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={{ flex: 1 }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: BLUE, minWidth: 68, textAlign: 'right' }}>{display}</div>
    </div>
  );
  const CalcResultRow = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${BORDER}`, fontSize: 13 }}>
      <span style={{ color: SECONDARY }}>{label}</span>
      <span style={{ fontWeight: 600, color: color || INK }}>{value}</span>
    </div>
  );
  const calcEvModelOptions = [['Tesla Model 3',7.1],['Hyundai Ioniq 6',7.0],['Tesla Model Y',6.7],['Chery Omoda E5',6.7],['BMW i4 eDrive35',6.5],['Volvo EX30',6.5],['Kia EV6',6.4],['MG 4 EV',6.4],['BYD Seal',6.2],['BYD Atto 3',6.0],['Mercedes EQE',5.9],['Hyundai Ioniq 5',5.6],['Porsche Macan EV',5.5],['BYD Sealion 7',5.0],['Porsche Taycan',4.8]];
  const calcPetrolOptions = [['Small hatch',15],['Sedan (avg)',12],['Efficient sedan',10],['Hybrid car',8],['SUV petrol',14],['MPV',11],['Performance car',18]];

  // ============ COMPARE TAB DATA (top-level — no hooks) ============
  const compareAllModels = [
    { model: 'BYD Atto 3', battery: 60.5, chem: 'LFP Blade', ac: 11, dc: 88, range: 420, eff: 6.0, type: 'SUV', segCat: 'Cat A', seats: 5, price: '~S$149K', brand: 'BYD', popular: true },
    { model: 'BYD Seal', battery: 82.5, chem: 'LFP Blade', ac: 11, dc: 150, range: 570, eff: 6.2, type: 'Sedan', segCat: 'Cat B', seats: 5, price: '~S$163K', brand: 'BYD', popular: true },
    { model: 'BYD Sealion 7', battery: 82.5, chem: 'LFP Blade', ac: 11, dc: 150, range: 482, eff: 5.0, type: 'SUV', segCat: 'Cat B', seats: 5, price: '~S$171K', brand: 'BYD', popular: true },
    { model: 'BYD Dolphin', battery: 44.9, chem: 'LFP Blade', ac: 7, dc: 60, range: 340, eff: 7.1, type: 'Hatch', segCat: 'Cat A', seats: 5, price: '~S$119K', brand: 'BYD' },
    { model: 'BYD M6', battery: 71.8, chem: 'LFP Blade', ac: 11, dc: 115, range: 420, eff: 5.5, type: 'MPV', segCat: 'Cat B', seats: 7, price: '~S$189K', brand: 'BYD' },
    { model: 'Tesla Model Y', battery: 75.0, chem: 'NMC', ac: 11, dc: 250, range: 600, eff: 6.7, type: 'SUV', segCat: 'Cat B', seats: 5, price: '~S$188K', brand: 'Tesla', popular: true },
    { model: 'Tesla Model 3', battery: 60.0, chem: 'LFP', ac: 11, dc: 170, range: 513, eff: 7.1, type: 'Sedan', segCat: 'Cat B', seats: 5, price: '~S$177K', brand: 'Tesla', popular: true },
    { model: 'Hyundai Ioniq 5', battery: 77.4, chem: 'NMC', ac: 11, dc: 350, range: 481, eff: 5.6, type: 'SUV', segCat: 'Cat B', seats: 5, price: '~S$216K', brand: 'Hyundai' },
    { model: 'Hyundai Ioniq 6', battery: 77.4, chem: 'NMC', ac: 11, dc: 350, range: 614, eff: 7.0, type: 'Sedan', segCat: 'Cat B', seats: 5, price: '~S$214K', brand: 'Hyundai' },
    { model: 'Kia EV6', battery: 77.4, chem: 'NMC', ac: 11, dc: 350, range: 528, eff: 6.4, type: 'SUV', segCat: 'Cat B', seats: 5, price: '~S$218K', brand: 'Kia' },
    { model: 'MG 4 EV', battery: 51.0, chem: 'LFP', ac: 11, dc: 117, range: 350, eff: 6.4, type: 'Hatch', segCat: 'Cat A', seats: 5, price: '~S$118K', brand: 'MG' },
    { model: 'MG S5 EV', battery: 64.0, chem: 'LFP', ac: 11, dc: 139, range: 430, eff: 6.4, type: 'SUV', segCat: 'Cat A', seats: 5, price: '~S$139K', brand: 'MG' },
    { model: 'Xpeng G6', battery: 87.5, chem: 'NMC', ac: 11, dc: 280, range: 570, eff: 6.1, type: 'SUV', segCat: 'Cat B', seats: 5, price: '~S$183K', brand: 'Xpeng' },
    { model: 'Xpeng P7', battery: 80.9, chem: 'NMC', ac: 11, dc: 175, range: 562, eff: 6.6, type: 'Sedan', segCat: 'Cat B', seats: 5, price: '~S$179K', brand: 'Xpeng' },
    { model: 'Zeekr X', battery: 66.0, chem: 'NMC', ac: 11, dc: 150, range: 380, eff: 5.5, type: 'SUV', segCat: 'Cat B', seats: 5, price: '~S$176K', brand: 'Zeekr' },
    { model: 'Zeekr 001', battery: 100.0, chem: 'NMC', ac: 22, dc: 200, range: 580, eff: 5.4, type: 'Wagon', segCat: 'Cat B', seats: 5, price: '~S$242K', brand: 'Zeekr' },
    { model: 'BMW iX1', battery: 64.7, chem: 'NMC', ac: 11, dc: 130, range: 440, eff: 6.0, type: 'SUV', segCat: 'Cat B', seats: 5, price: '~S$238K', brand: 'BMW' },
    { model: 'BMW i4 eDrive35', battery: 67.1, chem: 'NMC', ac: 11, dc: 180, range: 480, eff: 6.5, type: 'Sedan', segCat: 'Cat B', seats: 5, price: '~S$249K', brand: 'BMW' },
    { model: 'BMW i5', battery: 81.2, chem: 'NMC', ac: 11, dc: 205, range: 580, eff: 6.4, type: 'Sedan', segCat: 'Cat B', seats: 5, price: '~S$318K', brand: 'BMW' },
    { model: 'Mercedes EQE', battery: 90.6, chem: 'NMC', ac: 11, dc: 170, range: 590, eff: 5.9, type: 'Sedan', segCat: 'Cat B', seats: 5, price: '~S$338K', brand: 'Mercedes' },
    { model: 'Volvo EX30', battery: 64.0, chem: 'NMC', ac: 11, dc: 153, range: 460, eff: 6.5, type: 'SUV', segCat: 'Cat B', seats: 5, price: '~S$204K', brand: 'Volvo' },
    { model: 'Volvo EX40', battery: 78.0, chem: 'NMC', ac: 11, dc: 200, range: 480, eff: 5.6, type: 'SUV', segCat: 'Cat B', seats: 5, price: '~S$228K', brand: 'Volvo' },
    { model: 'Porsche Taycan', battery: 93.4, chem: 'NMC', ac: 11, dc: 320, range: 503, eff: 4.8, type: 'Sedan', segCat: 'Cat B', seats: 4, price: '~S$448K', brand: 'Porsche' },
    { model: 'Porsche Macan EV', battery: 95.0, chem: 'NMC', ac: 11, dc: 270, range: 591, eff: 5.5, type: 'SUV', segCat: 'Cat B', seats: 5, price: '~S$388K', brand: 'Porsche' },
    { model: 'Chery Omoda E5', battery: 61.1, chem: 'LFP', ac: 9.9, dc: 80, range: 430, eff: 6.7, type: 'SUV', segCat: 'Cat A', seats: 5, price: '~S$136K', brand: 'Chery' },
    { model: 'GAC Aion Y Plus', battery: 63.2, chem: 'LFP', ac: 6.6, dc: 100, range: 440, eff: 6.4, type: 'SUV', segCat: 'Cat A', seats: 5, price: '~S$138K', brand: 'GAC' },
    { model: 'Avatr 11', battery: 90.0, chem: 'NMC', ac: 11, dc: 240, range: 555, eff: 5.5, type: 'SUV', segCat: 'Cat B', seats: 5, price: '~S$228K', brand: 'Avatr' },
  ];
  const compareSpecRows = [
    { key: 'brand',   label: 'Brand',            fmt: v => v,                         num: false },
    { key: 'price',   label: 'Est. Price (OTR)', fmt: v => v,                         num: false },
    { key: 'type',    label: 'Body Type',         fmt: v => v,                         num: false },
    { key: 'segCat',  label: 'COE Category',      fmt: v => v,                         num: false },
    { key: 'seats',   label: 'Seats',             fmt: v => `${v}`,                    num: true  },
    { key: 'battery', label: 'Battery (kWh)',     fmt: v => `${v} kWh`,                num: true  },
    { key: 'chem',    label: 'Chemistry',         fmt: v => v,                         num: false },
    { key: 'ac',      label: 'AC Charging (kW)',  fmt: v => `${v} kW`,                 num: true  },
    { key: 'dc',      label: 'DC Charging (kW)',  fmt: v => `${v} kW`,                 num: true  },
    { key: 'range',   label: 'Range (km)',        fmt: v => `${v} km`,                 num: true  },
    { key: 'eff',     label: 'Efficiency',        fmt: v => `${v.toFixed(1)} km/kWh`,  num: true  },
  ];
  const compareUpdateSlot = (idx, model) => {
    const next = [...compareSlots]; next[idx] = model; setCompareSlots(next);
    setCompareOpenSlot(null);
    const t = [...compareSearch]; t[idx] = ''; setCompareSearch(t);
  };
  const compareClearSlot = idx => { const next = [...compareSlots]; next[idx] = null; setCompareSlots(next); };
  const compareFilledSlots = compareSlots.filter(Boolean);
  const compareSlotColors = [BLUE, GREEN, YELLOW];
  const compareSlotBgs = [BLUE_LIGHT, GREEN_LIGHT, YELLOW_LIGHT];

  return (
    <div style={{ background: SURFACE, minHeight: '100vh', fontFamily: "'Google Sans', 'Inter', system-ui, sans-serif", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Display:wght@400;700&family=Roboto:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        .scroll-table::-webkit-scrollbar { height: 6px; }
        .scroll-table::-webkit-scrollbar-track { background: ${SURFACE}; border-radius: 3px; }
        .scroll-table::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        .g-chip { transition: background 0.15s; }
        .g-chip:hover { filter: brightness(0.96); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .gate-fade { animation: fadeIn 0.5s ease; }
      `}</style>

      {/* ============ EMAIL GATE — frosted overlay on top of dashboard ============ */}
      {gateStage !== 'granted' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(11px) saturate(1.1)', WebkitBackdropFilter: 'blur(11px) saturate(1.1)', background: 'rgba(32,33,36,0.4)', padding: 24 }}>
          <div className="gate-fade" style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
            {/* VNSHO Logo */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: BLUE, marginBottom: 14, boxShadow: '0 4px 24px rgba(26,115,232,0.35)' }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: "'Google Sans',sans-serif" }}>V</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: 3, fontFamily: "'Google Sans',sans-serif" }}>VNSHO</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>EV Mobility Intelligence · Singapore</div>
            </div>

            {/* Gate card */}
            <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: '32px 28px', boxShadow: '0 8px 40px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.3)' }}>

              {gateStage === 'email' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: BLUE_LIGHT, marginBottom: 14 }}>
                    <Lock size={20} color={BLUE} />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, marginBottom: 6 }}>Access the dashboard</h2>
                  <p style={{ fontSize: 13, color: SECONDARY, marginBottom: 24, lineHeight: 1.6 }}>Enter your work email to receive a verification PIN.<br/>Personal emails (Gmail, Yahoo, etc.) are not accepted.</p>

                  <div style={{ position: 'relative', marginBottom: 14 }}>
                    <Mail size={16} color={SECONDARY} style={{ position: 'absolute', left: 14, top: 13 }} />
                    <input
                      type="email"
                      value={gateEmail}
                      onChange={e => { setGateEmail(e.target.value); setGateError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                      placeholder="your.name@company.com"
                      style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 10, border: gateError ? `1.5px solid ${RED}` : `1px solid ${BORDER}`, background: CARD, color: INK, fontSize: 14, outline: 'none' }}
                    />
                  </div>

                  {gateError && (
                    <div style={{ background: RED_LIGHT, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: RED, textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{gateError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleEmailSubmit}
                    disabled={gateLoading}
                    style={{ width: '100%', padding: '12px 20px', borderRadius: 10, background: BLUE, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: gateLoading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: gateLoading ? 0.7 : 1 }}
                  >
                    {gateLoading ? <><Loader2 size={16} className="animate-spin" /> Sending PIN...</> : <>Send verification PIN <ArrowRight size={15} /></>}
                  </button>

                  <div style={{ fontSize: 11, color: SECONDARY, marginTop: 18, lineHeight: 1.6 }}>
                    <Shield size={11} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />
                    Your email is used for verification only.
                  </div>
                </>
              )}

              {gateStage === 'pin' && (
                <>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: GREEN_LIGHT, marginBottom: 14 }}>
                    <Mail size={20} color={GREEN} />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: INK, marginBottom: 6 }}>Check your email</h2>
                  <p style={{ fontSize: 13, color: SECONDARY, marginBottom: 6, lineHeight: 1.5 }}>
                    We sent a 6-digit PIN to
                  </p>
                  <div style={{ fontSize: 14, fontWeight: 600, color: BLUE, marginBottom: 20 }}>{gateEmail}</div>

                  {gateShowPin && (
                    <div style={{ background: YELLOW_LIGHT, border: `1px solid ${YELLOW}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#7A4F00', marginBottom: 4 }}>YOUR VERIFICATION PIN</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: INK, letterSpacing: 8, fontFamily: "'Google Sans', monospace" }}>{gatePin}</div>
                      <div style={{ fontSize: 11, color: '#7A4F00', marginTop: 6 }}>In production, this PIN will be sent to your email via SendGrid/AWS SES</div>
                    </div>
                  )}

                  <input
                    type="text"
                    value={gatePinInput}
                    onChange={e => { setGatePinInput(e.target.value.replace(/\D/g, '').slice(0, 6)); setGateError(''); }}
                    onKeyDown={e => e.key === 'Enter' && gatePinInput.length === 6 && handlePinSubmit()}
                    placeholder="000000"
                    maxLength={6}
                    style={{ width: '100%', padding: '13px 20px', borderRadius: 10, border: gateError ? `1.5px solid ${RED}` : `1px solid ${BORDER}`, background: CARD, color: INK, fontSize: 28, fontWeight: 700, textAlign: 'center', letterSpacing: 10, outline: 'none', fontFamily: "'Google Sans',monospace" }}
                  />

                  {gateError && (
                    <div style={{ background: RED_LIGHT, borderRadius: 10, padding: '10px 14px', marginTop: 10, fontSize: 12, color: RED, textAlign: 'left' }}>
                      {gateError}
                    </div>
                  )}

                  <button
                    onClick={handlePinSubmit}
                    disabled={gatePinInput.length !== 6}
                    style={{ width: '100%', padding: '12px 20px', borderRadius: 10, background: GREEN, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: gatePinInput.length !== 6 ? 0.5 : 1 }}
                  >
                    <CheckCircle size={16} /> Verify {'&'} enter
                  </button>

                  <button
                    onClick={() => { setGateStage('email'); setGatePinInput(''); setGateError(''); }}
                    style={{ background: 'none', border: 'none', color: SECONDARY, fontSize: 12, cursor: 'pointer', marginTop: 14 }}
                  >
                    ← Use a different email
                  </button>
                </>
              )}
            </div>

            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 24 }}>© 2026 VNSHO · Singapore</div>
          </div>
        </div>
      )}


      <header style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="16" fill={BLUE}/>
              <text x="16" y="22" textAnchor="middle" fontFamily="'Google Sans','Inter',sans-serif" fontWeight="700" fontSize="18" fill="#fff">V</text>
            </svg>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.2 }}>VNSHO</div>
              <div style={{ fontSize: 10, color: SECONDARY }}>Singapore · May 2026</div>
            </div>
          </div>
          {/* Tab bar inline */}
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none', flex: 1, justifyContent: 'center' }}>
            <TabBtn id="home"     label="Home"           emoji="🏠" />
            <TabBtn id="overview" label="Overview"       emoji="📊" />
            <TabBtn id="fleet"    label="Fleet by Type"  emoji="🚦" />
            <TabBtn id="brands"   label="Brand Rankings" emoji="🏆" />
            <TabBtn id="specs"    label="EV Specs"       emoji="⚡" />
            <TabBtn id="charging" label="Charging"       emoji="🔌" />
            <TabBtn id="compare"  label="Compare EVs"    emoji="⚖️" />
            <TabBtn id="calculator" label="Calculator"   emoji="🌿" />
          </div>
          {/* Logged-in user + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: SECONDARY, textAlign: 'right', lineHeight: 1.3 }}>
              <div style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>● Logged in</div>
              <div style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gateEmail}</div>
            </div>
            <button onClick={handleLogout} style={{ padding: '6px 14px', borderRadius: 50, background: SURFACE, color: SECONDARY, border: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ============ HOME ============ */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {/* Hero */}
            <section style={{ background: CARD, borderRadius: 20, padding: '56px 40px 48px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE_LIGHT, borderRadius: 50, padding: '7px 18px', marginBottom: 22 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: BLUE, animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: BLUE }}>Live · LTA Data · May 2026</span>
              </div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 700, color: INK, lineHeight: 1.15, marginBottom: 16, fontFamily: "'Google Sans Display','Google Sans',sans-serif", letterSpacing: -0.5 }}>
                Singapore's EV future,<br/><span style={{ color: BLUE }}>in real time.</span>
              </h1>
              <p style={{ fontSize: 17, color: SECONDARY, lineHeight: 1.7, maxWidth: 580, margin: '0 auto 28px' }}>
                Fleet population, brand performance, charging networks and technology benchmarks — sourced from LTA statistics, refreshed every month.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
                <button onClick={() => setActiveTab('overview')} style={{ padding: '12px 26px', borderRadius: 50, background: BLUE, color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Explore the data <ArrowRight size={16} />
                </button>
                <button onClick={() => setActiveTab('calculator')} style={{ padding: '12px 26px', borderRadius: 50, background: CARD, color: INK, border: `1px solid ${BORDER}`, fontSize: 14, cursor: 'pointer' }}>
                  Carbon calculator
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, maxWidth: 860, margin: '0 auto' }}>
                {[{ val: '68,813', lbl: 'Total EVs on roads', c: BLUE }, { val: '32%', lbl: 'of new cars are EVs', c: GREEN }, { val: '30,500', lbl: 'charging points', c: YELLOW }, { val: '+128%', lbl: 'EV growth YoY', c: RED }].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '18px 10px', borderRadius: 14, background: SURFACE }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: s.c, letterSpacing: -0.3 }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: SECONDARY, marginTop: 4 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* EV Charging Technology */}
            <section>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: BLUE_LIGHT, borderRadius: 50, padding: '5px 14px', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: BLUE }}>EV Charging Technology</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 700, color: INK, marginBottom: 8 }}>The charging revolution</h2>
              <p style={{ fontSize: 15, color: SECONDARY, marginBottom: 24 }}>From overnight trickle to 5-minute fills — how charging technology is evolving.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
                {[
                  { icon: '🔌', title: 'AC Charging', body: 'Alternating Current charging uses your car\'s onboard converter. Typical rates: 7–22 kW. Takes 3–10 hrs for a full charge. Best for overnight home or workplace charging.', badge: '7–22 kW · 3–10 hrs', bc: BLUE_LIGHT, btc: BLUE },
                  { icon: '⚡', title: 'DC Fast Charging', body: 'Direct Current bypasses the onboard charger and feeds the battery directly. 50–350 kW units can deliver 10–80% in 20–45 minutes. Found at Shell Recharge, Charge+ and SP stations.', badge: '50–350 kW · 20–45 min', bc: YELLOW_LIGHT, btc: '#7A4F00' },
                  { icon: '🚀', title: 'Megawatt & Flash Charging', body: "BYD's 1MW Flash charging (Yangwang U7, Denza Z9 GT) and CATL Shenxing (600 kW) can deliver 400 km in under 10 minutes — the dawn of near-petrol refuelling speed.", badge: '600–1000 kW · 5–10 min', bc: RED_LIGHT, btc: '#9B1600' },
                ].map(c => (
                  <div key={c.title} style={{ background: CARD, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: INK, marginBottom: 8 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: SECONDARY, lineHeight: 1.6 }}>{c.body}</div>
                    <div style={{ display: 'inline-block', marginTop: 12, padding: '3px 12px', borderRadius: 50, background: c.bc, color: c.btc, fontSize: 11, fontWeight: 700 }}>{c.badge}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {[
                  { icon: '🔋', title: 'LFP vs NMC Batteries', body: "LFP (Lithium Iron Phosphate) — BYD's Blade — is safer, lasts 3,000+ cycles, handles Singapore heat better. NMC (Nickel Manganese Cobalt) offers higher energy density and faster charging. Tesla, Hyundai, Porsche use NMC.", badge: 'LFP: safe & durable', bc: GREEN_LIGHT, btc: '#137333' },
                  { icon: '📡', title: 'OTA Software Updates', body: 'Over-the-Air updates let manufacturers improve range, add features and fix bugs remotely. Tesla, BYD, Xpeng lead OTA capability. Some improve charging speed or unlock V2L (Vehicle-to-Load) after purchase.', badge: 'Tesla · BYD · Xpeng', bc: BLUE_LIGHT, btc: BLUE },
                  { icon: '🔄', title: 'Regenerative Braking', body: "EVs convert kinetic energy back into electricity when decelerating. In Singapore's stop-start traffic, regen can recover 15–25% of energy — extending real-world range significantly beyond lab figures.", badge: '+15–25% real-world range', bc: GREEN_LIGHT, btc: '#137333' },
                ].map(c => (
                  <div key={c.title} style={{ background: CARD, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: INK, marginBottom: 8 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: SECONDARY, lineHeight: 1.6 }}>{c.body}</div>
                    <div style={{ display: 'inline-block', marginTop: 12, padding: '3px 12px', borderRadius: 50, background: c.bc, color: c.btc, fontSize: 11, fontWeight: 700 }}>{c.badge}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Advanced EV Technology */}
            <section>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: BLUE_LIGHT, borderRadius: 50, padding: '5px 14px', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: BLUE }}>Advanced EV Technology</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 700, color: INK, marginBottom: 8 }}>What makes next-gen EVs different</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ background: BLUE_LIGHT, borderRadius: 16, padding: 28, border: `1px solid ${BLUE}` }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: INK, marginBottom: 10 }}>800V Architecture</div>
                  <div style={{ fontSize: 14, color: SECONDARY, lineHeight: 1.7 }}>Cars like the Hyundai Ioniq 5/6 and Kia EV6 use 800V electrical systems — double the traditional 400V. This enables ultra-fast 350 kW DC charging, less heat buildup, and thinner lighter cables. The Porsche Taycan was the first 800V EV in Singapore.</div>
                  <div style={{ marginTop: 14, fontSize: 12, color: BLUE, fontWeight: 600 }}>Ioniq 5 · Ioniq 6 · EV6 · Taycan</div>
                </div>
                <div style={{ background: GREEN_LIGHT, borderRadius: 16, padding: 28, border: `1px solid ${GREEN}` }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>🏠</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: INK, marginBottom: 10 }}>Vehicle-to-Load (V2L)</div>
                  <div style={{ fontSize: 14, color: SECONDARY, lineHeight: 1.7 }}>V2L lets your EV power external devices — laptops, appliances, even another EV. The Ioniq 5 can output 3.6 kW from its charge port. During Singapore power outages, your car becomes a generator. Ioniq 6 supports V2H (home grid).</div>
                  <div style={{ marginTop: 14, fontSize: 12, color: GREEN, fontWeight: 600 }}>Ioniq 5 · Ioniq 6 · GV60 · EV6</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {[
                  { icon: '🌡️', title: 'Heat Pump', body: "Less critical in Singapore's tropics than in cold climates, but saves energy on heavy air-con use. Tesla, Hyundai, BMW include it." },
                  { icon: '🛡️', title: 'Thermal Management', body: "Singapore's 30°C heat stresses batteries. LFP (BYD) handles heat better than NMC. Active liquid cooling in Tesla/Hyundai protects longevity." },
                  { icon: '🧲', title: 'Motor Types', body: 'PMSM motors dominate EVs for efficiency. Single motor = FWD/RWD. Dual motor = AWD with instant torque split and superior traction.' },
                  { icon: '🔮', title: 'Solid-State Batteries', body: 'Next gen — solid electrolyte replaces liquid. Promises 2× energy density, faster charging, no fire risk. Toyota targets 2027–28 production.' },
                ].map(c => (
                  <div key={c.title} style={{ background: CARD, borderRadius: 16, padding: 20, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{c.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginBottom: 6 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: SECONDARY, lineHeight: 1.6 }}>{c.body}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Environmental Impact */}
            <section>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: GREEN_LIGHT, borderRadius: 50, padding: '5px 14px', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>Environmental Impact</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 700, color: INK, marginBottom: 8 }}>EVs {'&'} Singapore's green future</h2>
              <p style={{ fontSize: 15, color: SECONDARY, marginBottom: 20 }}>How electric vehicles support Singapore's net-zero emissions goal by 2050.</p>
              <div style={{ background: SURFACE, borderRadius: 16, padding: 32, border: `1px solid ${BORDER}`, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
                  {[
                    { val: '68%', c: GREEN, lbl: 'less lifecycle CO₂ vs petrol — even accounting for Singapore\'s power grid (natural gas + solar)' },
                    { val: '2M', c: BLUE, lbl: 'tonnes of CO₂ potentially saved annually if all light vehicles in Singapore go electric' },
                    { val: '0', c: RED, lbl: 'tailpipe emissions — eliminating PM2.5 and NOₓ from Singapore\'s roads directly' },
                  ].map((s, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 52, fontWeight: 700, color: s.c, lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: 13, color: SECONDARY, marginTop: 8, lineHeight: 1.6 }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {[
                  { icon: '⚡', title: "Singapore's Grid is Greening", body: "Singapore's electricity grid runs mostly on natural gas (95% efficiency vs petrol's 20–35%). Solar capacity exceeds 1 GWp on JTC and HDB rooftops. Every kW of solar makes EVs cleaner over time.", badge: 'Grid: 0.408 kg CO₂/kWh (2025)' },
                  { icon: '🌱', title: 'Battery Recycling', body: "EV batteries don't just get thrown away. Second-life use in stationary storage extends value. BYD, CATL and Redwood Materials run recycling programs recovering lithium, cobalt and nickel.", badge: '~95% material recovery rate' },
                  { icon: '🏙️', title: 'Urban Air Quality', body: 'EVs produce zero tailpipe emissions — no CO, NOₓ or PM2.5. Transport is Singapore\'s #2 source of air pollution. Electrification directly improves public health and reduces hospital admissions.', badge: 'Zero tailpipe NOₓ & PM2.5' },
                ].map(c => (
                  <div key={c.title} style={{ background: CARD, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: INK, marginBottom: 8 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: SECONDARY, lineHeight: 1.6 }}>{c.body}</div>
                    <div style={{ display: 'inline-block', marginTop: 12, padding: '3px 12px', borderRadius: 50, background: GREEN_LIGHT, color: GREEN, fontSize: 11, fontWeight: 700 }}>{c.badge}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div style={{ background: BLUE, borderRadius: 20, padding: '40px', textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Calculate your carbon footprint {'&'} savings</div>
              <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 24 }}>See exactly how switching to an EV changes your CO₂ output and monthly fuel costs.</div>
              <button onClick={() => setActiveTab('calculator')} style={{ padding: '12px 28px', borderRadius: 50, background: '#fff', color: BLUE, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Open calculator →
              </button>
            </div>
          </div>
        )}

        {/* ============ CALCULATOR ============ */}
        {activeTab === 'calculator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: GREEN_LIGHT, borderRadius: 50, padding: '5px 14px', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>Carbon {'&'} Cost Calculator</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 700, color: INK, marginBottom: 8 }}>Your EV impact calculator</h2>
              <p style={{ fontSize: 15, color: SECONDARY, marginBottom: 16 }}>Calculate monthly/annual CO₂ savings and fuel cost when switching from petrol to EV.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['month','year'].map(p => (
                  <button key={p} onClick={() => setCalcPeriod(p)} style={{ padding: '7px 18px', borderRadius: 50, border: `1px solid ${calcPeriod === p ? BLUE : BORDER}`, background: calcPeriod === p ? BLUE : CARD, color: calcPeriod === p ? '#fff' : SECONDARY, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    {p === 'month' ? 'Monthly' : 'Annual'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* ---- CO2 Calculator ---- */}
              <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>🌿 Carbon footprint calculator</div>
                  <div style={{ fontSize: 13, color: SECONDARY, marginTop: 2 }}>Select an EV or adjust the efficiency slider</div>
                </div>
                <div style={{ padding: 24 }}>
                  <CalcLabel>EV Model</CalcLabel>
                  <select value={co2Eff} onChange={e => setCo2Eff(parseFloat(e.target.value))} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD, fontSize: 13, color: INK, marginBottom: 14 }}>
                    {calcEvModelOptions.map(([m, e]) => <option key={m} value={e}>{m} ({e} km/kWh)</option>)}
                  </select>
                  <CalcLabel>EV efficiency (km/kWh)</CalcLabel>
                  <CalcSlider min={3} max={8} step={0.1} value={co2Eff} onChange={setCo2Eff} display={`${co2Eff.toFixed(1)} km/kWh`} />
                  <CalcLabel>Monthly driving distance</CalcLabel>
                  <CalcSlider min={500} max={4000} step={100} value={co2Km} onChange={setCo2Km} display={`${co2Km.toLocaleString()} km`} />
                  <CalcLabel>Charging rate (S$/kWh)</CalcLabel>
                  <CalcSlider min={0.25} max={0.60} step={0.01} value={co2Rate} onChange={setCo2Rate} display={`S$${co2Rate.toFixed(2)}`} />

                  <div style={{ background: SURFACE, borderRadius: 12, padding: 20, marginTop: 8 }}>
                    <div style={{ fontSize: 13, color: SECONDARY, marginBottom: 6 }}>EV charging cost</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: INK, marginBottom: 16 }}>
                      {calcFmtS(calc_evChargeCost)}
                      <span style={{ fontSize: 13, color: SECONDARY, fontWeight: 400 }}>{calcPeriodLbl}</span>
                    </div>
                    <CalcResultRow label="Energy used" value={`${calcFmt(calc_co2kWh, 0)} kWh`} color={BLUE} />
                    <CalcResultRow label="CO₂ emitted (grid)" value={`${calcFmt(calc_evCO2kg, 1)} kg CO₂`} color={RED} />
                    <CalcResultRow label="CO₂ saved vs petrol" value={`+${calcFmt(calc_co2Saved, 1)} kg saved`} color={GREEN} />
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: SECONDARY, marginBottom: 4 }}>
                        <span>EV CO₂</span><span>Petrol equivalent</span>
                      </div>
                      <div style={{ height: 8, background: BORDER, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${calc_evBarPct}%`, background: BLUE, borderRadius: 99, transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 5 }}>
                        <span style={{ color: BLUE, fontWeight: 600 }}>{calcFmt(calc_evCO2kg, 0)} kg (EV)</span>
                        <span style={{ color: RED, fontWeight: 600 }}>{calcFmt(calc_petCO2kg, 0)} kg (petrol)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ---- Cost Comparison ---- */}
              <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>💰 Petrol vs EV cost comparison</div>
                  <div style={{ fontSize: 13, color: SECONDARY, marginTop: 2 }}>Compare running costs between your petrol car and an EV</div>
                </div>
                <div style={{ padding: 24 }}>
                  <CalcLabel>Petrol car (fuel consumption)</CalcLabel>
                  <select value={petrolConsump} onChange={e => setPetrolConsump(parseFloat(e.target.value))} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD, fontSize: 13, color: INK, marginBottom: 14 }}>
                    {calcPetrolOptions.map(([m, v]) => <option key={m} value={v}>{m} ({v} L/100km)</option>)}
                  </select>
                  <CalcLabel>EV to compare against</CalcLabel>
                  <select value={evCompareEff} onChange={e => setEvCompareEff(parseFloat(e.target.value))} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD, fontSize: 13, color: INK, marginBottom: 14 }}>
                    {calcEvModelOptions.map(([m, e]) => <option key={m} value={e}>{m} ({e} km/kWh)</option>)}
                  </select>
                  <CalcLabel>Monthly km driven</CalcLabel>
                  <CalcSlider min={500} max={4000} step={100} value={costKm} onChange={setCostKm} display={`${costKm.toLocaleString()} km`} />
                  <CalcLabel>Petrol price (S$/L)</CalcLabel>
                  <CalcSlider min={1.80} max={3.20} step={0.05} value={petrolPrice} onChange={setPetrolPrice} display={`S$${petrolPrice.toFixed(2)}`} />
                  <CalcLabel>EV charging rate (S$/kWh)</CalcLabel>
                  <CalcSlider min={0.25} max={0.60} step={0.01} value={costRate} onChange={setCostRate} display={`S$${costRate.toFixed(2)}`} />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div style={{ borderRadius: 14, padding: 18, background: SURFACE, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: SECONDARY, marginBottom: 8 }}>Petrol car</div>
                      <div style={{ fontSize: 26, fontWeight: 700, color: INK }}>{calcFmtS(calc_petFuelCost)}</div>
                      <div style={{ fontSize: 11, color: SECONDARY, marginTop: 4 }}>{calcPeriodLbl}</div>
                    </div>
                    <div style={{ borderRadius: 14, padding: 18, background: BLUE_LIGHT, border: `2px solid ${BLUE}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: BLUE, marginBottom: 8 }}>EV</div>
                      <div style={{ fontSize: 26, fontWeight: 700, color: BLUE }}>{calcFmtS(calc_evFuelCost)}</div>
                      <div style={{ fontSize: 11, color: BLUE, marginTop: 4 }}>{calcPeriodLbl}</div>
                    </div>
                  </div>
                  <div style={{ background: GREEN_LIGHT, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>EV saves you</div>
                      <div style={{ fontSize: 11, color: GREEN }}>{calcPeriodLbl}</div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: GREEN }}>{calcFmtS(Math.abs(calc_saving))}</div>
                  </div>
                  <div style={{ background: SURFACE, borderRadius: 10, padding: 14 }}>
                    <CalcResultRow label="Annual fuel saving" value={calcFmtS(calc_saving * 12 / calcMul) + '/year'} color={GREEN} />
                    <CalcResultRow label={`Petrol CO₂ (${calcPeriodLbl})`} value={`${calcFmt(calc_petCO2cost, 0)} kg`} color={RED} />
                    <CalcResultRow label={`EV CO₂ (${calcPeriodLbl})`} value={`${calcFmt(calc_evCO2cost, 0)} kg`} color={BLUE} />
                    <CalcResultRow label="CO₂ reduction" value={`+${calcFmt(calc_co2Reduction, 0)} kg saved`} color={GREEN} />
                  </div>
                </div>
              </div>
            </div>

            {/* Assumptions */}
            <div style={{ background: SURFACE, borderRadius: 12, padding: '14px 18px', fontSize: 12, color: SECONDARY, lineHeight: 1.7, border: `1px solid ${BORDER}` }}>
              <strong style={{ color: INK }}>Assumptions: </strong>
              Singapore grid emission factor: 0.408 kg CO₂/kWh (EMA 2025). Petrol emission factor: 2.31 kg CO₂/L. Petrol consumption uses typical real-world L/100km figures. EV figures use selected WLTP efficiency. Charging rates reflect public fast charger range (home overnight ≈ S$0.26/kWh via SP Group).
            </div>
          </div>
        )}




        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <section>
              <SectionHead chip="Fleet Snapshot" title="Singapore EVs at a glance." subtitle="Land Transport Authority · M03 updated to May 2026 · M09 fleet data as at Apr 2026" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <MetricCard label="Total EV Cars" value="59,735" delta="↑ 128% year on year" sub="9.1% of car fleet" color={BLUE} bg={BLUE_LIGHT} icon="🚗" />
                <MetricCard label="New EVs — Jan–May 2026" value="7,200+" delta="≈ 32% of new car regs" sub="Jan-May 2026 (LTA M03)" color={GREEN} bg={GREEN_LIGHT} icon="📈" />
                <MetricCard label="Hybrid Cars" value="122,830" delta="↑ 23.9% year on year" sub="18.7% of car fleet" color={YELLOW} bg={YELLOW_LIGHT} icon="⚡" />
                <MetricCard label="Charging Points" value="30,500" delta="50.8% of 2030 target" sub="60,000 target by 2030" color={RED} bg={RED_LIGHT} icon="🔌" />
              </div>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
              <div style={{ background: CARD, borderRadius: 20, padding: 28, border: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>Electrification trajectory</h3>
                  <span style={{ fontSize: 12, background: GREEN_LIGHT, color: GREEN, padding: '4px 12px', borderRadius: 50, fontWeight: 600 }}>Cars only</span>
                </div>
                <p style={{ fontSize: 14, color: SECONDARY, margin: '0 0 24px' }}>EV population doubled in 12 months; hybrids growing steadily</p>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={evGrowth}>
                    <defs>
                      <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={BLUE} stopOpacity={0.3}/>
                        <stop offset="100%" stopColor={BLUE} stopOpacity={0.02}/>
                      </linearGradient>
                      <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={GREEN} stopOpacity={0.2}/>
                        <stop offset="100%" stopColor={GREEN} stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={BORDER} strokeDasharray="3 6" vertical={false}/>
                    <XAxis dataKey="period" stroke={SECONDARY} tick={{ fontSize: 12, fontFamily: 'Google Sans, sans-serif' }} axisLine={false} tickLine={false}/>
                    <YAxis stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<GoogleTooltip/>}/>
                    <Area type="monotone" dataKey="hybrids" stroke={GREEN} strokeWidth={2.5} fill="url(#gGreen)" name="Hybrids"/>
                    <Area type="monotone" dataKey="evs" stroke={BLUE} strokeWidth={3} fill="url(#gBlue)" name="Pure EVs"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: CARD, borderRadius: 20, padding: 28, border: `1px solid ${BORDER}` }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Q1 2026 new cars</h3>
                <p style={{ fontSize: 14, color: SECONDARY, margin: '0 0 8px' }}>By powertrain</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={adoptionPie} dataKey="value" innerRadius={56} outerRadius={90} paddingAngle={3} startAngle={90} endAngle={-270}>
                      {adoptionPie.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0}/>)}
                    </Pie>
                    <Tooltip content={<GoogleTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {adoptionPie.map(e => {
                    const pct = ((e.value / adoptionPieTotal) * 100).toFixed(1);
                    return (
                      <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.color }}/>
                          <span style={{ fontSize: 13, color: INK, fontWeight: 500 }}>{e.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: e.color, background: `${e.color}18`, borderRadius: 50, padding: '2px 8px' }}>{pct}%</span>
                          <span style={{ fontSize: 13, color: SECONDARY, minWidth: 40, textAlign: 'right' }}>{e.value.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section>
              <SectionHead chip="By vehicle type" title="Electrification across the fleet." chipColor={GREEN}/>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                {fleetCategories.map(c => {
                  const evPct = ((c.ev / c.total) * 100).toFixed(1);
                  return (
                    <div key={c.label} style={{ background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: SECONDARY, marginBottom: 4 }}>{c.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: INK, marginBottom: 12, fontFamily: "'Google Sans', sans-serif" }}>{c.total.toLocaleString()}</div>
                      <div style={{ height: 6, background: SURFACE, borderRadius: 99, marginBottom: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.max(parseFloat(evPct) * 6, 2)}%`, background: BLUE, borderRadius: 99 }}/>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: BLUE, fontWeight: 600 }}>{c.ev.toLocaleString()} EV</span>
                        <span style={{ color: SECONDARY }}>{evPct}%</span>
                      </div>
                      {c.hybrid > 0 && (
                        <div style={{ fontSize: 12, color: GREEN, marginTop: 4 }}>+{c.hybrid.toLocaleString()} hybrid</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section style={{ background: BLUE_LIGHT, borderRadius: 24, padding: '36px 40px' }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: INK, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: BLUE, borderRadius: 50, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} color="#fff"/>
                </span>
                Key insights — Q1 2026
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {[
                  { icon: '🚗', bold: 'EVs hit 9.1%', text: 'of the total car fleet, up from 4.0% 16 months ago.' },
                  { icon: '🏆', bold: 'BYD leads Q1', text: 'with 5,513 registrations — ~48% of new EVs Jan–May, outselling Tesla 2:1.' },
                  { icon: '📊', bold: '~32% of new cars', text: 'registered in Q1 were pure EVs; another 36% were hybrids.' },
                  { icon: '🚛', bold: 'Diesel still dominates', text: '85% of LGV/HGV fleet. The biggest electrification gap in Singapore.' },
                  { icon: '💰', bold: 'HVZES launched Jan 2026', text: 'S$40K incentive per zero-emission HGV or bus.' },
                  { icon: '🔌', bold: 'Charge+ hits 4,000', text: 'First operator to cross the milestone. Target: 16,000 by 2030.' },
                ].map((item, i) => (
                  <div key={i} style={{ background: CARD, borderRadius: 16, padding: '20px 22px', display: 'flex', gap: 14 }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{item.bold}</span>
                      <span style={{ fontSize: 14, color: SECONDARY }}> {item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ============ FLEET BY TYPE ============ */}
        {activeTab === 'fleet' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <SectionHead chip="Fleet Composition" title="EV population by vehicle category." subtitle="68,813 pure EVs across all road vehicle types · 30 April 2026 · Source: LTA M09 (Apr 2026)"/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {[
                { label: 'EV Cars', value: '56,770', sub: '86.6% of all EVs', color: BLUE, bg: BLUE_LIGHT, icon: '🚗' },
                { label: 'EV Goods Veh.', value: '6,936', sub: 'LGV/HGV/VHGV', color: YELLOW, bg: YELLOW_LIGHT, icon: '🚛' },
                { label: 'EV Buses', value: '870', sub: 'Public + Charter', color: RED, bg: RED_LIGHT, icon: '🚌' },
                { label: 'EV Taxis', value: '569', sub: 'Of 12,239 taxis', color: GREEN, bg: GREEN_LIGHT, icon: '🚕' },
                { label: 'EV Motorcycles', value: '406', sub: 'Slowest segment', color: SECONDARY, bg: SURFACE, icon: '🏍️' },
              ].map(m => <MetricCard key={m.label} {...m} icon={m.icon}/>)}
            </div>

            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
              <div style={{ padding: '24px 28px', borderBottom: `1px solid ${BORDER}` }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>Fuel type × Vehicle type — full breakdown</h3>
                <p style={{ fontSize: 14, color: SECONDARY, margin: '4px 0 0' }}>Every road vehicle in Singapore by powertrain · March 2026</p>
              </div>
              <div className="scroll-table" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: SURFACE }}>
                      {['Vehicle Type','Petrol','Diesel','Hybrid','PHEV','Pure EV','Total','EV %'].map((h, i) => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: i > 0 ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: SECONDARY, letterSpacing: 0.3, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: 'Cars 🚗', petrol: 457081, diesel: 12986, hybrid: 123958, phev: 2798, ev: 59735, total: 656634 },
                      { type: 'Taxis 🚕', petrol: 3, diesel: 81, hybrid: 11610, phev: 0, ev: 586, total: 12280 },
                      { type: 'Motorcycles 🏍️', petrol: 152697, diesel: 0, hybrid: 0, phev: 0, ev: 415, total: 153112 },
                      { type: 'Goods Vehicles 🚛', petrol: 13771, diesel: 122038, hybrid: 6, phev: 1, ev: 7192, total: 143042 },
                      { type: 'Buses 🚌', petrol: 132, diesel: 17291, hybrid: 50, phev: 45, ev: 885, total: 18403 },
                    ].map((r, ri) => {
                      const pct = ((r.ev / r.total) * 100).toFixed(2);
                      return (
                        <tr key={r.type} style={{ borderBottom: `1px solid ${BORDER}`, background: ri % 2 ? SURFACE : CARD }}>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: INK }}>{r.type}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', color: SECONDARY }}>{r.petrol.toLocaleString()}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', color: SECONDARY }}>{r.diesel.toLocaleString()}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', color: GREEN, fontWeight: 500 }}>{r.hybrid.toLocaleString()}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', color: SECONDARY }}>{r.phev.toLocaleString()}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', color: BLUE, fontWeight: 700 }}>{r.ev.toLocaleString()}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>{r.total.toLocaleString()}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <span style={{ background: BLUE_LIGHT, color: BLUE, fontWeight: 700, borderRadius: 50, padding: '4px 12px', fontSize: 12 }}>{pct}%</span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: BLUE_LIGHT, borderTop: `2px solid ${BLUE}` }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: INK, fontSize: 15 }}>Total Fleet</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>627,684</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>152,396</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: GREEN }}>135,574</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>2,800</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: BLUE, fontSize: 15 }}>68,813</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, fontSize: 15 }}>983,471</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{ background: BLUE, color: '#fff', fontWeight: 700, borderRadius: 50, padding: '4px 12px', fontSize: 12 }}>7.0%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <section>
              <SectionHead chip="Goods Vehicle Drilldown" title="LGV vs HGV vs VHGV." subtitle="Q1 2026 new EV registrations by weight class · LTA M08" chipColor={YELLOW}/>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                {[
                  { cls: 'LGV', weight: '≤ 3.5 t', q1New: 78, desc: 'Fastest-electrifying segment. Last-mile vans and small trucks.', lead: 'Maxus, BYD, Citroën', color: BLUE, bg: BLUE_LIGHT },
                  { cls: 'HGV', weight: '3.5 – 16 t', q1New: 51, desc: 'HVZES (S$40K) launched Jan 2026 is accelerating adoption here.', lead: 'Foton, BYD, Sany', color: YELLOW, bg: YELLOW_LIGHT },
                  { cls: 'VHGV', weight: '> 16 t', q1New: 0, desc: 'Zero EV registrations in Q1 2026. Diesel owns this segment entirely.', lead: 'No EV penetration yet', color: RED, bg: RED_LIGHT },
                ].map(c => (
                  <div key={c.cls} style={{ background: c.bg, borderRadius: 20, padding: 28 }}>
                    <span style={{ background: c.color, color: '#fff', borderRadius: 50, padding: '6px 14px', fontSize: 12, fontWeight: 700 }}>{c.cls} · {c.weight}</span>
                    <div style={{ fontSize: 52, fontWeight: 800, color: c.color, margin: '20px 0 4px', fontFamily: "'Google Sans', sans-serif", lineHeight: 1 }}>{c.q1New}</div>
                    <div style={{ fontSize: 13, color: SECONDARY, marginBottom: 4 }}>new EV registrations Q1 2026</div>
                    <p style={{ fontSize: 14, color: INK, lineHeight: 1.6, margin: '16px 0 12px' }}>{c.desc}</p>
                    <div style={{ fontSize: 13, fontWeight: 600, color: c.color }}>Leading brands: {c.lead}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionHead chip="Penetration" title="EV share of total fleet by vehicle type."/>
              {[
                { type: 'Cars 🚗', ev: 59735, total: 656634, color: BLUE },
                { type: 'Goods Vehicles 🚛', ev: 7192, total: 143042, color: YELLOW },
                { type: 'Buses 🚌', ev: 885, total: 18403, color: RED },
                { type: 'Taxis 🚕', ev: 586, total: 12280, color: GREEN },
                { type: 'Motorcycles 🏍️', ev: 415, total: 153112, color: SECONDARY },
              ].map(r => {
                const pct = (r.ev / r.total) * 100;
                return (
                  <div key={r.type} style={{ background: CARD, borderRadius: 16, padding: '20px 24px', marginBottom: 12, border: `1px solid ${BORDER}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>{r.type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 13, color: SECONDARY }}>{r.ev.toLocaleString()} / {r.total.toLocaleString()}</span>
                        <span style={{ fontSize: 22, fontWeight: 800, color: r.color, fontFamily: "'Google Sans', sans-serif" }}>{pct.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: SURFACE, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.max(pct * 8, 0.5)}%`, background: r.color, borderRadius: 99, transition: 'width 0.8s ease' }}/>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        )}

        {/* ============ BRANDS ============ */}
        {activeTab === 'brands' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {/* Sub-filter toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: SURFACE, borderRadius: 50, padding: 4, alignSelf: 'flex-start', border: `1px solid ${BORDER}` }}>
              {[{ id: 'passenger', label: '🚗 Passenger EVs' }, { id: 'commercial', label: '🚛 Commercial EVs' }].map(f => (
                <button key={f.id} onClick={() => setActiveBrandFilter(f.id)}
                  style={{ padding: '8px 20px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'Google Sans', sans-serif", transition: 'all 0.2s',
                    background: activeBrandFilter === f.id ? BLUE : 'transparent',
                    color: activeBrandFilter === f.id ? '#fff' : SECONDARY,
                  }}>{f.label}</button>
              ))}
            </div>

            {/* ---- PASSENGER EV BRANDS ---- */}
            {activeBrandFilter === 'passenger' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                  <SectionHead chip="Jan–May 2026 · Passenger Cars" title="EV car brand rankings." subtitle="New EV car registrations Jan–May 2026 · Source: LTA M03"/>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: SECONDARY, marginBottom: 4 }}>Total EV cars Jan–May 2026</div>
                    <div style={{ fontSize: 40, fontWeight: 800, color: BLUE, fontFamily: "'Google Sans', sans-serif", letterSpacing: -0.5 }}>7,200+</div>
                  </div>
                </div>
                <div style={{ background: CARD, borderRadius: 20, padding: 28, border: `1px solid ${BORDER}` }}>
                  <ResponsiveContainer width="100%" height={520}>
                    <BarChart data={evCarBrands} layout="vertical" margin={{ left: 8, right: 60, top: 8, bottom: 8 }}>
                      <CartesianGrid stroke={BORDER} horizontal={false} strokeDasharray="3 6"/>
                      <XAxis type="number" stroke={SECONDARY} tick={{ fontSize: 12 }} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="brand" stroke={INK} tick={{ fontSize: 13, fontWeight: 600, fill: INK }} width={80} axisLine={false} tickLine={false}/>
                      <Tooltip content={<GoogleTooltip/>} cursor={{ fill: BLUE_LIGHT }}/>
                      <Bar dataKey="units" name="Registrations" radius={[0, 8, 8, 0]}>
                        {evCarBrands.map((_, i) => <Cell key={i} fill={i === 0 ? BLUE : i === 1 ? GREEN : i === 2 ? YELLOW : i === 3 ? RED : `${BLUE}88`}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                  {[
                    { rank: '1st', brand: 'BYD', value: '5,513', pct: '47.8%', sub: 'Atto 3, Sealion 7, Seal, Dolphin', color: BLUE, bg: BLUE_LIGHT },
                    { rank: '2nd', brand: 'Tesla', value: '2,043', pct: '17.7%', sub: 'Model Y Juniper leading', color: GREEN, bg: GREEN_LIGHT },
                    { rank: '3rd', brand: 'Chery', value: '999', pct: '8.7%', sub: 'Omoda E5 surge', color: YELLOW, bg: YELLOW_LIGHT },
                  ].map(d => (
                    <div key={d.brand} style={{ background: d.bg, borderRadius: 20, padding: 28 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <span style={{ background: d.color, color: '#fff', borderRadius: 50, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{d.rank[0]}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{d.rank} · {d.brand}</span>
                      </div>
                      <div style={{ fontSize: 48, fontWeight: 800, color: INK, fontFamily: "'Google Sans', sans-serif", lineHeight: 1, letterSpacing: -1 }}>{d.value}</div>
                      <div style={{ fontSize: 13, color: d.color, fontWeight: 600, margin: '6px 0 8px' }}>{d.pct} of all new EVs</div>
                      <div style={{ fontSize: 13, color: SECONDARY }}>{d.sub}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <SectionHead title="EV body type mix." subtitle="SUVs dominate Singapore's new EV market at 67%"/>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {[
                      { type: 'SUV 🚙', count: 2842, pct: 67, models: 'BYD Atto 3, Sealion 7 · Tesla Model Y · Chery Omoda E5 · MG S5', color: BLUE },
                      { type: 'Sedan 🚗', count: 1109, pct: 26, models: 'BYD Seal · Tesla Model 3 · Hyundai Ioniq 6 · BMW i4', color: GREEN },
                      { type: 'Hatch / Other 🚘', count: 292, pct: 7, models: 'MG 4 · Mini Cooper E · BYD Dolphin', color: YELLOW },
                    ].map(b => (
                      <div key={b.type} style={{ background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: INK }}>{b.type}</span>
                          <span style={{ fontSize: 28, fontWeight: 800, color: b.color, fontFamily: "'Google Sans', sans-serif" }}>{b.pct}%</span>
                        </div>
                        <div style={{ height: 6, background: SURFACE, borderRadius: 99, marginBottom: 12, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${b.pct}%`, background: b.color, borderRadius: 99 }}/>
                        </div>
                        <div style={{ fontSize: 12, color: SECONDARY, fontWeight: 600, marginBottom: 6 }}>{b.count.toLocaleString()} units</div>
                        <div style={{ fontSize: 13, color: SECONDARY, lineHeight: 1.5 }}>{b.models}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ---- COMMERCIAL EV BRANDS ---- */}
            {activeBrandFilter === 'commercial' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                  <SectionHead chip="Q1 2026 · Commercial" title="Commercial EV brand rankings." subtitle="New EV LGV/HGV/Bus registrations · Source: LTA M08" chipColor={YELLOW}/>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: SECONDARY, marginBottom: 4 }}>Total new commercial EVs Q1</div>
                    <div style={{ fontSize: 40, fontWeight: 800, color: YELLOW, fontFamily: "'Google Sans', sans-serif", letterSpacing: -0.5 }}>243</div>
                  </div>
                </div>
                {/* Fleet snapshot */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <MetricCard label="EV Goods Vehicles" value="6,936" delta="4.85% of fleet" sub="142,960 total" color={YELLOW} bg={YELLOW_LIGHT} icon="🚛"/>
                  <MetricCard label="EV Buses" value="870" delta="4.73% of fleet" sub="18,389 total" color={RED} bg={RED_LIGHT} icon="🚌"/>
                  <MetricCard label="Diesel still rules" value="84%" delta="of LGV/HGV fleet" sub="122,229 diesel goods vehicles" color={SECONDARY} bg={SURFACE} icon="⚠️"/>
                </div>
                {/* Brand bar chart */}
                <div style={{ background: CARD, borderRadius: 20, padding: 28, border: `1px solid ${BORDER}` }}>
                  <ResponsiveContainer width="100%" height={380}>
                    <BarChart data={evCommercialBrands} layout="vertical" margin={{ left: 8, right: 60 }}>
                      <CartesianGrid stroke={BORDER} horizontal={false} strokeDasharray="3 6"/>
                      <XAxis type="number" stroke={SECONDARY} tick={{ fontSize: 12 }} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="brand" stroke={INK} tick={{ fontSize: 13, fontWeight: 600 }} width={80} axisLine={false} tickLine={false}/>
                      <Tooltip content={<GoogleTooltip/>} cursor={{ fill: YELLOW_LIGHT }}/>
                      <Bar dataKey="units" name="Registrations" radius={[0, 8, 8, 0]}>
                        {evCommercialBrands.map((_, i) => <Cell key={i} fill={i === 0 ? YELLOW : i === 1 ? BLUE : i === 2 ? GREEN : `${YELLOW}99`}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Segment mix */}
                <div>
                  <SectionHead title="Segment mix — Q1 2026." subtitle="~12% of new commercial vehicle registrations were electric"/>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {[
                      { seg: 'GPV', label: 'Goods + Passenger', count: 10, share: '7.5%', sample: 'Toyota HiAce EV' },
                      { seg: 'LGV', label: '≤ 3.5 t Light Goods', count: 154, share: '60%', sample: 'Maxus eDeliver, BYD T3, Citroën ë-Berlingo' },
                      { seg: 'HGV', label: '3.5–16 t Heavy', count: 51, share: '23%', sample: 'BYD T6, Foton iBlue, Hino Profia EV' },
                      { seg: 'Bus', label: 'Public + Charter', count: 28, share: '9.5%', sample: 'BYD K9, Higer, Yutong' },
                    ].map(s => (
                      <div key={s.seg} style={{ background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: YELLOW, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{s.seg}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginBottom: 12 }}>{s.label}</div>
                        <div style={{ fontSize: 40, fontWeight: 800, color: BLUE, fontFamily: "'Google Sans', sans-serif", lineHeight: 1, marginBottom: 4 }}>{s.count}</div>
                        <div style={{ fontSize: 12, color: SECONDARY, marginBottom: 12 }}>{s.share} of new EV commercials</div>
                        <div style={{ fontSize: 12, color: SECONDARY, lineHeight: 1.5, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>{s.sample}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* LGV/HGV/VHGV drilldown */}
                <div>
                  <SectionHead title="By weight class." subtitle="Q1 2026 new EV goods vehicle registrations by weight · LTA M08"/>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {[
                      { cls: 'LGV', weight: '≤ 3.5 t', q1New: 78, desc: 'Fastest-electrifying segment. Last-mile delivery vans and small trucks.', lead: 'Maxus, BYD, Citroën', color: BLUE, bg: BLUE_LIGHT },
                      { cls: 'HGV', weight: '3.5 – 16 t', q1New: 51, desc: 'HVZES (S$40K) launched Jan 2026 is accelerating adoption here.', lead: 'Foton, BYD, Sany', color: YELLOW, bg: YELLOW_LIGHT },
                      { cls: 'VHGV', weight: '> 16 t', q1New: 0, desc: 'Zero EV registrations in Q1 2026. Diesel owns this segment entirely.', lead: 'No EV penetration yet', color: RED, bg: RED_LIGHT },
                    ].map(c => (
                      <div key={c.cls} style={{ background: c.bg, borderRadius: 20, padding: 28 }}>
                        <span style={{ background: c.color, color: '#fff', borderRadius: 50, padding: '6px 14px', fontSize: 12, fontWeight: 700 }}>{c.cls} · {c.weight}</span>
                        <div style={{ fontSize: 52, fontWeight: 800, color: c.color, margin: '20px 0 4px', fontFamily: "'Google Sans', sans-serif", lineHeight: 1 }}>{c.q1New}</div>
                        <div style={{ fontSize: 13, color: SECONDARY, marginBottom: 4 }}>new EV registrations Q1 2026</div>
                        <p style={{ fontSize: 14, color: INK, lineHeight: 1.6, margin: '16px 0 12px' }}>{c.desc}</p>
                        <div style={{ fontSize: 13, fontWeight: 600, color: c.color }}>Leading: {c.lead}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* The gap callout */}
                <div style={{ background: YELLOW_LIGHT, borderRadius: 24, padding: 40 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: INK, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ background: YELLOW, borderRadius: 50, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertCircle size={16} color="#fff"/>
                    </span>
                    The commercial electrification gap
                  </h3>
                  <p style={{ fontSize: 15, color: INK, lineHeight: 1.8, marginBottom: 12 }}>
                    122,229 diesel goods vehicles versus only <strong style={{ color: BLUE }}>6,936 electric</strong> — the commercial fleet is 85% diesel as of March 2026. The new <strong>HVZES scheme (S$40K/vehicle)</strong>, launched January 2026, is the most targeted push yet for heavy fleet electrification.
                  </p>
                  <p style={{ fontSize: 13, color: SECONDARY, fontStyle: 'italic' }}>
                    Watch: megawatt truck charging deployment, Lazada/Shopee/FairPrice delivery fleet electrification, SBS Transit and SMRT bus announcements through 2026.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============ SPECS ============ */}
        {activeTab === 'specs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <SectionHead chip="Technical Reference" title="EV specifications." subtitle="Battery, charging speeds, efficiency and range across Singapore-available EVs."/>

            {/* Sub-filter toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: SURFACE, borderRadius: 50, padding: 4, alignSelf: 'flex-start', border: `1px solid ${BORDER}` }}>
              {[{ id: 'passenger', label: '🚗 Passenger Cars' }, { id: 'commercial', label: '🚛 Commercial Vehicles' }].map(f => (
                <button key={f.id} onClick={() => setActiveSpecFilter(f.id)}
                  style={{ padding: '8px 20px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'Google Sans', sans-serif", transition: 'all 0.2s',
                    background: activeSpecFilter === f.id ? BLUE : 'transparent',
                    color: activeSpecFilter === f.id ? '#fff' : SECONDARY,
                  }}>{f.label}</button>
              ))}
            </div>

            <div style={{ background: BLUE_LIGHT, borderRadius: 16, padding: '16px 24px', display: 'flex', flexWrap: 'wrap', gap: '8px 40px', fontSize: 14 }}>
              <div><b style={{ color: BLUE }}>AC kW</b> <span style={{ color: SECONDARY }}>— onboard charger speed (home/destination)</span></div>
              <div><b style={{ color: YELLOW }}>DC kW</b> <span style={{ color: SECONDARY }}>— peak fast-charging rate at public stations</span></div>
              {activeSpecFilter === 'passenger'
                ? <div><b style={{ color: GREEN }}>km/kWh</b> <span style={{ color: SECONDARY }}>— real-world efficiency (higher = greener)</span></div>
                : <div><b style={{ color: GREEN }}>km/kWh</b> <span style={{ color: SECONDARY }}>— range per kWh (trucks/buses are lower due to weight)</span></div>
              }
              <div><b>⭐</b> <span style={{ color: SECONDARY }}>— top sellers in Singapore</span></div>
            </div>

            {/* ---- PASSENGER SPECS ---- */}
            {activeSpecFilter === 'passenger' && (
              <>
                <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                  <div className="scroll-table" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 920, borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ background: SURFACE }}>
                          {['Model','Body','Battery','Chemistry','AC kW','DC kW','km/kWh','Range','COE'].map((h, i) => (
                            <th key={h} style={{ padding: '14px 16px', textAlign: i > 1 ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: SECONDARY, letterSpacing: 0.3, borderBottom: `2px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {evSpecs.map((ev, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 ? SURFACE : CARD, transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = BLUE_LIGHT}
                            onMouseLeave={e => e.currentTarget.style.background = i % 2 ? SURFACE : CARD}
                          >
                            <td style={{ padding: '13px 16px', fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>{ev.popular ? '⭐ ' : ''}{ev.model}</td>
                            <td style={{ padding: '13px 16px', color: SECONDARY, fontSize: 12 }}>{ev.type}</td>
                            <td style={{ padding: '13px 16px', textAlign: 'right', color: INK }}>{ev.battery} <span style={{ color: SECONDARY, fontSize: 11 }}>kWh</span></td>
                            <td style={{ padding: '13px 16px', color: SECONDARY, fontSize: 12, whiteSpace: 'nowrap' }}>{ev.chem}</td>
                            <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 700, color: BLUE }}>{ev.ac}</td>
                            <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 700, color: '#F9AB00' }}>{ev.dc}</td>
                            <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 700, color: GREEN }}>{ev.eff.toFixed(1)}</td>
                            <td style={{ padding: '13px 16px', textAlign: 'right', color: SECONDARY }}>{ev.range} km</td>
                            <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                              <span style={{ padding: '4px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: ev.segCat === 'Cat A' ? GREEN_LIGHT : BLUE_LIGHT, color: ev.segCat === 'Cat A' ? GREEN : BLUE }}>{ev.segCat}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <section>
                  <SectionHead chip="Top 12" title="Efficiency leaderboard." subtitle="km per kWh — higher is better for Singapore's stop-start city driving"/>
                  <div style={{ background: CARD, borderRadius: 20, padding: 28, border: `1px solid ${BORDER}` }}>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={[...evSpecs].sort((a, b) => b.eff - a.eff).slice(0, 12)}>
                        <CartesianGrid stroke={BORDER} vertical={false} strokeDasharray="3 6"/>
                        <XAxis dataKey="model" stroke={SECONDARY} tick={{ fontSize: 11, fill: SECONDARY }} angle={-20} textAnchor="end" height={72} interval={0} axisLine={false} tickLine={false}/>
                        <YAxis stroke={SECONDARY} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} label={{ value: 'km/kWh', angle: -90, position: 'insideLeft', fill: SECONDARY, fontSize: 12 }}/>
                        <Tooltip content={<GoogleTooltip/>}/>
                        <Bar dataKey="eff" name="Efficiency (km/kWh)" radius={[8, 8, 0, 0]}>
                          {[...evSpecs].sort((a, b) => b.eff - a.eff).slice(0, 12).map((_, i) => (
                            <Cell key={i} fill={i === 0 ? BLUE : i === 1 ? GREEN : i === 2 ? YELLOW : `${BLUE}99`}/>
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </>
            )}

            {/* ---- COMMERCIAL SPECS ---- */}
            {activeSpecFilter === 'commercial' && (
              <>
                <div style={{ background: YELLOW_LIGHT, borderRadius: 16, padding: '12px 20px', fontSize: 13, color: INK }}>
                  <b style={{ color: YELLOW }}>Note:</b> <span style={{ color: SECONDARY }}>Commercial EV efficiency is expressed in km/kWh — typical values are much lower than passenger cars due to vehicle weight and payload. LGV 3–5 km/kWh · HGV 1–2 km/kWh · Buses 0.5–0.9 km/kWh.</span>
                </div>
                <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                  <div className="scroll-table" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ background: SURFACE }}>
                          {['Model','Segment','Battery (kWh)','Chemistry','AC kW','DC kW','Range (km)','km/kWh','GVW'].map((h, i) => (
                            <th key={h} style={{ padding: '14px 16px', textAlign: i > 1 ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: SECONDARY, letterSpacing: 0.3, borderBottom: `2px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          // LGVs
                          { model: 'BYD T3', seg: 'LGV', battery: 50.3, chem: 'LFP Blade', ac: 7, dc: 60, range: 300, eff: 4.5, gvw: '≤3.5t', popular: true },
                          { model: 'Maxus eDeliver 3', seg: 'LGV', battery: 50.2, chem: 'NMC', ac: 7, dc: 80, range: 240, eff: 4.0, gvw: '≤3.5t', popular: true },
                          { model: 'Maxus eDeliver 7', seg: 'LGV', battery: 77.0, chem: 'LFP', ac: 11, dc: 120, range: 365, eff: 4.5, gvw: '≤3.5t' },
                          { model: 'Maxus eDeliver 9', seg: 'LGV', battery: 88.5, chem: 'NMC', ac: 11, dc: 80, range: 240, eff: 3.0, gvw: '≤3.5t' },
                          { model: 'Citroën ë-Berlingo', seg: 'LGV', battery: 50.0, chem: 'NMC', ac: 11, dc: 100, range: 280, eff: 4.5, gvw: '≤3.5t', popular: true },
                          { model: 'Peugeot e-Partner', seg: 'LGV', battery: 50.0, chem: 'NMC', ac: 11, dc: 100, range: 275, eff: 4.4, gvw: '≤3.5t' },
                          { model: 'Renault Kangoo E-Tech', seg: 'LGV', battery: 45.0, chem: 'NMC', ac: 22, dc: 80, range: 300, eff: 4.7, gvw: '≤3.5t' },
                          { model: 'Mercedes eVito', seg: 'LGV', battery: 60.0, chem: 'NMC', ac: 11, dc: 80, range: 260, eff: 3.7, gvw: '≤3.5t' },
                          { model: 'Volkswagen ID. Buzz Cargo', seg: 'LGV', battery: 79.0, chem: 'NMC', ac: 11, dc: 170, range: 425, eff: 4.7, gvw: '≤3.5t' },
                          { model: 'Farizon SuperVAN', seg: 'LGV', battery: 67.0, chem: 'LFP', ac: 11, dc: 90, range: 308, eff: 4.6, gvw: '≤3.5t' },
                          { model: 'DFSK EC35', seg: 'LGV', battery: 41.9, chem: 'LFP', ac: 6.6, dc: 60, range: 220, eff: 4.0, gvw: '≤3.5t' },
                          // HGVs
                          { model: 'BYD T6 / T7', seg: 'HGV', battery: 195.0, chem: 'LFP Blade', ac: 22, dc: 80, range: 200, eff: 1.0, gvw: '3.5–16t', popular: true },
                          { model: 'Foton iBlue HGV', seg: 'HGV', battery: 200.0, chem: 'LFP', ac: 22, dc: 100, range: 250, eff: 1.1, gvw: '3.5–16t', popular: true },
                          { model: 'Mitsubishi Fuso eCanter', seg: 'HGV', battery: 124.0, chem: 'NMC', ac: 22, dc: 104, range: 200, eff: 1.4, gvw: '3.5–7.5t' },
                          { model: 'Hino Profia EV', seg: 'HGV', battery: 240.0, chem: 'NMC', ac: 22, dc: 150, range: 300, eff: 1.0, gvw: '7.5–16t' },
                          { model: 'Sany SE320', seg: 'HGV', battery: 282.0, chem: 'LFP', ac: 22, dc: 150, range: 250, eff: 0.9, gvw: '3.5–16t', popular: true },
                          { model: 'Qingling EV Truck', seg: 'HGV', battery: 173.0, chem: 'LFP', ac: 22, dc: 100, range: 200, eff: 1.2, gvw: '3.5–7.5t' },
                          { model: 'Mercedes eActros', seg: 'HGV', battery: 336.0, chem: 'NMC', ac: 22, dc: 160, range: 350, eff: 1.0, gvw: '7.5–16t' },
                          // Buses
                          { model: 'BYD K9 (12m)', seg: 'Bus', battery: 348.0, chem: 'LFP Blade', ac: 40, dc: 150, range: 250, eff: 0.7, gvw: '>16t', popular: true },
                          { model: 'BYD B12D (Double Deck)', seg: 'Bus', battery: 422.0, chem: 'LFP Blade', ac: 80, dc: 240, range: 250, eff: 0.6, gvw: '>16t' },
                          { model: 'Yutong U12', seg: 'Bus', battery: 350.0, chem: 'LFP', ac: 40, dc: 150, range: 270, eff: 0.77, gvw: '>16t', popular: true },
                          { model: 'Higer Azure', seg: 'Bus', battery: 281.0, chem: 'LFP', ac: 40, dc: 150, range: 250, eff: 0.89, gvw: '>16t' },
                          { model: 'Zhong Tong N12', seg: 'Bus', battery: 295.0, chem: 'LFP', ac: 40, dc: 150, range: 240, eff: 0.81, gvw: '>16t' },
                          { model: 'Mercedes eCitaro', seg: 'Bus', battery: 396.0, chem: 'NMC', ac: 22, dc: 150, range: 220, eff: 0.55, gvw: '>16t' },
                          { model: 'Volvo 7900 Electric', seg: 'Bus', battery: 396.0, chem: 'NMC', ac: 22, dc: 300, range: 200, eff: 0.5, gvw: '>16t' },
                        ].map((ev, i) => {
                          const segColor = ev.seg === 'LGV' ? BLUE : ev.seg === 'HGV' ? YELLOW : GREEN;
                          const segBg = ev.seg === 'LGV' ? BLUE_LIGHT : ev.seg === 'HGV' ? YELLOW_LIGHT : GREEN_LIGHT;
                          return (
                            <tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 ? SURFACE : CARD, transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = YELLOW_LIGHT}
                              onMouseLeave={e => e.currentTarget.style.background = i % 2 ? SURFACE : CARD}
                            >
                              <td style={{ padding: '13px 16px', fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>{ev.popular ? '⭐ ' : ''}{ev.model}</td>
                              <td style={{ padding: '13px 16px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: segBg, color: segColor }}>{ev.seg}</span>
                              </td>
                              <td style={{ padding: '13px 16px', textAlign: 'right', color: INK }}>{ev.battery}</td>
                              <td style={{ padding: '13px 16px', color: SECONDARY, fontSize: 12, whiteSpace: 'nowrap' }}>{ev.chem}</td>
                              <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 700, color: BLUE }}>{ev.ac}</td>
                              <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 700, color: '#F9AB00' }}>{ev.dc}</td>
                              <td style={{ padding: '13px 16px', textAlign: 'right', color: SECONDARY }}>{ev.range}</td>
                              <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 700, color: GREEN }}>{ev.eff.toFixed(2)}</td>
                              <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                                <span style={{ padding: '4px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: segBg, color: segColor }}>{ev.gvw}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <section>
                  <SectionHead chip="Range Comparison" title="Commercial EV range by segment." subtitle="Range varies hugely by weight class — buses and HGVs trade range for payload"/>
                  <div style={{ background: CARD, borderRadius: 20, padding: 28, border: `1px solid ${BORDER}` }}>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={[
                        { model: 'VW ID. Buzz', range: 425, seg: 'LGV' }, { model: 'Maxus eD7', range: 365, seg: 'LGV' },
                        { model: 'BYD T3', range: 300, seg: 'LGV' }, { model: 'Citroën ë-Berlingo', range: 280, seg: 'LGV' },
                        { model: 'Hino Profia', range: 300, seg: 'HGV' }, { model: 'Mercedes eActros', range: 350, seg: 'HGV' },
                        { model: 'Foton iBlue', range: 250, seg: 'HGV' }, { model: 'BYD T6/T7', range: 200, seg: 'HGV' },
                        { model: 'Yutong U12', range: 270, seg: 'Bus' }, { model: 'BYD K9', range: 250, seg: 'Bus' },
                        { model: 'Higer Azure', range: 250, seg: 'Bus' }, { model: 'BYD B12D', range: 250, seg: 'Bus' },
                      ]}>
                        <CartesianGrid stroke={BORDER} vertical={false} strokeDasharray="3 6"/>
                        <XAxis dataKey="model" stroke={SECONDARY} tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={64} interval={0} axisLine={false} tickLine={false}/>
                        <YAxis stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'km', angle: -90, position: 'insideLeft', fill: SECONDARY, fontSize: 12 }}/>
                        <Tooltip content={<GoogleTooltip/>}/>
                        <Bar dataKey="range" name="Range (km)" radius={[8, 8, 0, 0]}>
                          {[...Array(4)].map((_, i) => <Cell key={i} fill={BLUE}/>)}
                          {[...Array(4)].map((_, i) => <Cell key={i+4} fill={YELLOW}/>)}
                          {[...Array(4)].map((_, i) => <Cell key={i+8} fill={GREEN}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
                      {[{ color: BLUE, label: 'LGV (≤3.5t)' }, { color: YELLOW, label: 'HGV (3.5–16t)' }, { color: GREEN, label: 'Bus (>16t)' }].map(l => (
                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: SECONDARY }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }}/>{l.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}

            <section>
              <SectionHead chip="Charging Tiers" title="How long does charging take?" subtitle="Approximate 10–80% charge time — the practical range for daily use"/>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                {[
                  { tier: 'Trickle', power: '2.3 kW', time: '20–30 hrs', use: 'Standard wall plug · emergency only', color: SECONDARY, bg: SURFACE },
                  { tier: 'Slow AC', power: '3.7–7 kW', time: '6–10 hrs', use: 'HDB & condo overnight chargers', color: GREEN, bg: GREEN_LIGHT },
                  { tier: 'Fast AC', power: '11–22 kW', time: '3–5 hrs', use: 'Workplace, malls, commercial', color: BLUE, bg: BLUE_LIGHT },
                  { tier: 'DC Fast', power: '50–150 kW', time: '25–45 min', use: 'Petrol station charging bays', color: YELLOW, bg: YELLOW_LIGHT },
                  { tier: 'DC Ultra', power: '150–350 kW', time: '15–25 min', use: 'Tesla Supercharger, Shell HPC', color: RED, bg: RED_LIGHT },
                  { tier: 'DC Hyper', power: '350–500 kW', time: '8–15 min', use: 'Porsche Taycan, Hyundai 800V', color: '#9C27B0', bg: '#F3E5F5' },
                  { tier: 'BYD Flash', power: '1,000 kW', time: '5–9 min', use: 'Yangwang U7, Denza Z9 GT', color: RED, bg: RED_LIGHT },
                  { tier: 'CATL Shenxing', power: '600 kW', time: '~10 min', use: '400 km in 10 min · next-gen LFP', color: BLUE, bg: BLUE_LIGHT },
                ].map(t => (
                  <div key={t.tier} style={{ background: t.bg, borderRadius: 16, padding: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{t.tier}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: INK, fontFamily: "'Google Sans', sans-serif", marginBottom: 4 }}>{t.power}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.color, marginBottom: 8 }}>{t.time}</div>
                    <div style={{ fontSize: 12, color: SECONDARY, lineHeight: 1.5 }}>{t.use}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ============ CHARGING ============ */}
        {activeTab === 'charging' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <SectionHead chip="Singapore Green Plan 2030" title="Charging infrastructure." subtitle="Tracking progress towards 60,000 charging points by 2030"/>

            <div style={{ background: BLUE_LIGHT, borderRadius: 24, padding: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
                <div>
                  <div style={{ fontSize: 13, color: SECONDARY, fontWeight: 500, marginBottom: 8 }}>Deployed as of March 2026</div>
                  <div style={{ fontSize: 72, fontWeight: 800, color: BLUE, lineHeight: 1, fontFamily: "'Google Sans Display', 'Google Sans', sans-serif", letterSpacing: -2 }}>30,500</div>
                  <div style={{ fontSize: 16, color: SECONDARY, marginTop: 8 }}>charging points deployed</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: SECONDARY, marginBottom: 8 }}>2030 target</div>
                  <div style={{ fontSize: 40, fontWeight: 700, color: INK, fontFamily: "'Google Sans', sans-serif" }}>60,000</div>
                  <div style={{ fontSize: 14, color: RED, fontWeight: 600, marginTop: 6 }}>29,500 remaining</div>
                </div>
              </div>
              <div style={{ height: 16, background: 'rgba(255,255,255,0.6)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', width: '50.8%', background: BLUE, borderRadius: 99, transition: 'width 1s ease' }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: BLUE }}>50.8% complete</span>
                <span style={{ fontSize: 13, color: SECONDARY }}>Target: 2030</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
                <div style={{ background: CARD, borderRadius: 16, padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, color: SECONDARY }}>Public car parks</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: INK }}>40,000 <span style={{ fontSize: 12, color: SECONDARY, fontWeight: 400 }}>target</span></div>
                </div>
                <div style={{ background: CARD, borderRadius: 16, padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, color: SECONDARY }}>Private premises</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: INK }}>20,000 <span style={{ fontSize: 12, color: SECONDARY, fontWeight: 400 }}>target</span></div>
                </div>
              </div>
            </div>

            <section>
              <SectionHead title="Operator market share (est.)" subtitle="Data as of Q1 2026. Note: BlueSG charging brand is defunct as of 30 Sep 2025 — its ~1,465 TotalEnergies-operated stations were novated to SP Mobility and other CPOs by end-2025. BlueSG relaunched as car-sharing brand Flexar in Apr 2026 with no charging operations."/>
              {/* Data alert banner */}
              <div style={{ background: YELLOW_LIGHT, borderRadius: 14, padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start', border: `1px solid ${YELLOW}` }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
                <div style={{ fontSize: 13, color: INK, lineHeight: 1.6 }}>
                  <b>BlueSG / TotalEnergies charging network closed 30 Sep 2025.</b> The ~1,465 charge points (originally BlueSG, operated by TotalEnergies from 2021) were transferred to SP Mobility and other CPOs by end-Dec 2025. "BlueSG / Others" no longer exists as a charging operator label. The SP Group / SP Mobility figure above reflects the absorbed points.
                  <span style={{ color: SECONDARY }}> Source: electrive.com 27 Nov 2025; Wikipedia/BlueSG; ComfortDelGro press releases.</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
                <div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={chargingOps} dataKey="share" nameKey="op" innerRadius={70} outerRadius={120} paddingAngle={3} startAngle={90} endAngle={-270}>
                        {chargingOps.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0}/>)}
                      </Pie>
                      <Tooltip content={<GoogleTooltip/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {chargingOps.map(op => (
                    <div key={op.op} style={{ background: CARD, borderRadius: 14, padding: '16px 20px', border: `1px solid ${BORDER}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: op.color }}/>
                          <span style={{ fontWeight: 600, color: INK, fontSize: 14 }}>{op.op}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: op.color }}>{op.points.toLocaleString()}</span>
                          <span style={{ color: SECONDARY, fontSize: 12 }}> · {op.share}%</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: SURFACE, borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                        <div style={{ height: '100%', width: `${op.share}%`, background: op.color, borderRadius: 99 }}/>
                      </div>
                      {op.note && <div style={{ fontSize: 11, color: SECONDARY, lineHeight: 1.4 }}>{op.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <SectionHead chip="Incentives 2026" title="Government rebate schemes." chipColor={GREEN}/>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {[
                  { code: 'EEAI', name: 'EV Early Adoption Incentive', amount: 'Up to S$7,500', desc: '45% ARF rebate, capped at S$7,500 (reduced from S$15,000 in 2025). Combine with VES for up to S$30,000 total.', color: BLUE, bg: BLUE_LIGHT },
                  { code: 'VES Band A1', name: 'Vehicular Emissions Scheme', amount: 'Up to S$25,000', desc: 'Up to S$25,000 rebate for the cleanest Band A1 vehicles. S$2,500 for Band A2.', color: GREEN, bg: GREEN_LIGHT },
                  { code: 'HVZES ★ NEW', name: 'Heavy Vehicle Zero Emissions', amount: 'S$40,000/vehicle', desc: 'S$40,000 per zero-emission HGV or bus. Launched 1 January 2026 to kick-start heavy fleet electrification.', color: RED, bg: RED_LIGHT },
                  { code: 'EHVCG', name: 'Heavy Vehicle Charger Grant', amount: 'Up to S$30,000', desc: '50% co-funding per charger for first 500 units of ≥50 kW heavy-vehicle chargers. Valid through end-2028.', color: YELLOW, bg: YELLOW_LIGHT },
                ].map(s => (
                  <div key={s.code} style={{ background: s.bg, borderRadius: 20, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5, background: 'rgba(255,255,255,0.7)', borderRadius: 50, padding: '4px 10px' }}>{s.code}</span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "'Google Sans', sans-serif", lineHeight: 1.2, marginBottom: 6 }}>{s.amount}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: INK, marginBottom: 10 }}>{s.name}</div>
                    <p style={{ fontSize: 13, color: SECONDARY, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ============ COMMERCIAL ============ */}
        {activeTab === 'commercial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <SectionHead chip={'Goods & Buses'} title="Commercial fleet electrification." subtitle="The segment where the transition still has the furthest to go." chipColor={YELLOW}/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <MetricCard label="EV Goods Vehicles" value="6,936" delta="4.85% of fleet" sub="142,960 total" color={YELLOW} bg={YELLOW_LIGHT} icon="🚛"/>
              <MetricCard label="EV Buses" value="870" delta="4.73% of fleet" sub="18,389 total" color={RED} bg={RED_LIGHT} icon="🚌"/>
              <MetricCard label="Diesel still rules" value="84%" delta="of LGV/HGV fleet" sub="122,229 diesel goods vehicles" color={SECONDARY} bg={SURFACE} icon="⚠️"/>
            </div>

            <div style={{ background: CARD, borderRadius: 20, padding: 28, border: `1px solid ${BORDER}` }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, marginBottom: 4 }}>Commercial EV brand rankings</h3>
              <p style={{ fontSize: 14, color: SECONDARY, margin: '0 0 24px' }}>New EV LGV/HGV/Bus registrations · Q1 2026 · LTA M08</p>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={evCommercialBrands} layout="vertical" margin={{ left: 8, right: 60 }}>
                  <CartesianGrid stroke={BORDER} horizontal={false} strokeDasharray="3 6"/>
                  <XAxis type="number" stroke={SECONDARY} tick={{ fontSize: 12 }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="brand" stroke={INK} tick={{ fontSize: 13, fontWeight: 600 }} width={80} axisLine={false} tickLine={false}/>
                  <Tooltip content={<GoogleTooltip/>} cursor={{ fill: YELLOW_LIGHT }}/>
                  <Bar dataKey="units" name="Registrations" radius={[0, 8, 8, 0]}>
                    {evCommercialBrands.map((_, i) => <Cell key={i} fill={i === 0 ? YELLOW : i === 1 ? BLUE : i === 2 ? GREEN : `${YELLOW}88`}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { seg: 'GPV', label: 'Goods + Passenger', count: 10, share: '7.5%', sample: 'Toyota HiAce EV' },
                { seg: 'LGV', label: '≤ 3.5 t Light Goods', count: 154, share: '60%', sample: 'Maxus eDeliver, BYD T3, Citroën ë-Berlingo' },
                { seg: 'HGV', label: '3.5–16 t Heavy', count: 51, share: '23%', sample: 'BYD T6, Foton iBlue, Hino Profia EV' },
                { seg: 'Bus', label: 'Public + Charter', count: 28, share: '9.5%', sample: 'BYD K9, Higer, Yutong' },
              ].map(s => (
                <div key={s.seg} style={{ background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: YELLOW, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{s.seg}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: INK, marginBottom: 12 }}>{s.label}</div>
                  <div style={{ fontSize: 40, fontWeight: 800, color: BLUE, fontFamily: "'Google Sans', sans-serif", lineHeight: 1, marginBottom: 4 }}>{s.count}</div>
                  <div style={{ fontSize: 12, color: SECONDARY, marginBottom: 12 }}>{s.share} of new EV commercials</div>
                  <div style={{ fontSize: 12, color: SECONDARY, lineHeight: 1.5, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>{s.sample}</div>
                </div>
              ))}
            </div>

            <div style={{ background: YELLOW_LIGHT, borderRadius: 24, padding: 40 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: INK, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: YELLOW, borderRadius: 50, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={16} color="#fff"/>
                </span>
                The commercial electrification gap
              </h3>
              <p style={{ fontSize: 16, color: INK, lineHeight: 1.8, marginBottom: 16 }}>
                Singapore's commercial fleet remains overwhelmingly diesel: <strong>122,229 diesel goods vehicles</strong> versus only <strong style={{ color: BLUE }}>6,936 electric</strong> as of March 2026. This sector accounts for a disproportionate share of road transport emissions.
              </p>
              <p style={{ fontSize: 16, color: INK, lineHeight: 1.8, marginBottom: 16 }}>
                The <strong>Heavy Vehicle Zero Emissions Scheme (HVZES)</strong>, launched 1 January 2026, provides <strong style={{ color: YELLOW }}>S$40,000 per zero-emission HGV or bus</strong>. Early Q1 data shows momentum: BYD, Foton, Maxus and Sany have all expanded LGV/HGV offerings in Singapore.
              </p>
              <p style={{ fontSize: 14, color: SECONDARY, fontStyle: 'italic' }}>
                Watch: megawatt charging for trucks, Lazada/Shopee/FairPrice delivery fleet electrification, SBS Transit and SMRT bus announcements through 2026.
              </p>
            </div>
          </div>
        )}

        {/* ============ COMPARE EVs ============ */}
        {activeTab === 'compare' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <SectionHead chip="Compare EVs" title="Side-by-side comparison." subtitle="Select up to 3 EVs to compare specs, range, charging speed and efficiency."/>

            {/* Slot selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {compareSlots.map((slot, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  {!slot ? (
                    <div>
                      <button onClick={() => setCompareOpenSlot(compareOpenSlot === idx ? null : idx)}
                        style={{ width: '100%', padding: '32px 20px', borderRadius: 20, border: `2px dashed ${compareSlotColors[idx]}`, background: compareSlotBgs[idx], cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: compareSlotColors[idx], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>+</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: compareSlotColors[idx] }}>Select EV {idx + 1}</div>
                        <div style={{ fontSize: 13, color: SECONDARY }}>Tap to choose a model</div>
                      </button>
                      {compareOpenSlot === idx && (
                        <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, zIndex: 100, background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', maxHeight: 340, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
                            <input autoFocus value={compareSearch[idx]}
                              onChange={e => { const t = [...compareSearch]; t[idx] = e.target.value; setCompareSearch(t); }}
                              placeholder="Search model or brand..."
                              style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '8px 12px', fontSize: 13, outline: 'none' }}
                            />
                          </div>
                          <div style={{ overflowY: 'auto', flex: 1 }}>
                            {compareAllModels
                              .filter(m => !compareSlots.some(s => s && s.model === m.model))
                              .filter(m => !compareSearch[idx] || m.model.toLowerCase().includes(compareSearch[idx].toLowerCase()) || m.brand.toLowerCase().includes(compareSearch[idx].toLowerCase()))
                              .map(m => (
                                <button key={m.model} onClick={() => compareUpdateSlot(idx, m)}
                                  style={{ width: '100%', textAlign: 'left', padding: '11px 16px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: `1px solid ${SURFACE}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                  onMouseEnter={e => e.currentTarget.style.background = compareSlotBgs[idx]}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{m.popular ? '⭐ ' : ''}{m.model}</div>
                                    <div style={{ fontSize: 11, color: SECONDARY }}>{m.type} · {m.segCat} · {m.price}</div>
                                  </div>
                                  <div style={{ fontSize: 12, color: SECONDARY, flexShrink: 0 }}>{m.range} km</div>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background: compareSlotBgs[idx], borderRadius: 20, border: `2px solid ${compareSlotColors[idx]}`, padding: '24px 20px', position: 'relative' }}>
                      <button onClick={() => compareClearSlot(idx)} style={{ position: 'absolute', top: 12, right: 12, background: compareSlotColors[idx], border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', color: '#fff', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      <div style={{ fontSize: 11, fontWeight: 700, color: compareSlotColors[idx], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{slot.brand}</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: INK, lineHeight: 1.3, marginBottom: 12 }}>{slot.model}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {[slot.type, slot.segCat, slot.price].map(t => (
                          <span key={t} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 50, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: INK }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {compareFilledSlots.length < 2 && (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: SECONDARY }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: INK, marginBottom: 8 }}>Select at least 2 EVs to compare</div>
                <div style={{ fontSize: 14 }}>Choose models from the cards above — compare up to 3 at once.</div>
              </div>
            )}

            {compareFilledSlots.length >= 2 && (
              <div style={{ background: CARD, borderRadius: 24, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(3,1fr)', background: SURFACE, borderBottom: `2px solid ${BORDER}` }}>
                  <div style={{ padding: '16px 20px', fontSize: 12, fontWeight: 600, color: SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5 }}>Specification</div>
                  {compareSlots.map((slot, idx) => (
                    <div key={idx} style={{ padding: '16px 20px', borderLeft: `1px solid ${BORDER}`, background: slot ? compareSlotBgs[idx] : SURFACE }}>
                      {slot ? (
                        <>
                          <div style={{ fontSize: 11, fontWeight: 700, color: compareSlotColors[idx], textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>{slot.brand}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.3 }}>{slot.model}</div>
                        </>
                      ) : <div style={{ fontSize: 13, color: SECONDARY }}>—</div>}
                    </div>
                  ))}
                </div>

                {/* Spec rows */}
                {compareSpecRows.map((row, ri) => {
                  const nums = compareFilledSlots.map(m => m[row.key]).filter(v => typeof v === 'number');
                  const best = nums.length ? Math.max(...nums) : null;
                  const worst = nums.length > 1 ? Math.min(...nums) : null;
                  const tied = nums.length > 0 && nums.every(v => v === nums[0]);
                  return (
                    <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '200px repeat(3,1fr)', borderBottom: `1px solid ${BORDER}`, background: ri % 2 ? SURFACE : CARD }}>
                      <div style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: SECONDARY, display: 'flex', alignItems: 'center' }}>{row.label}</div>
                      {compareSlots.map((slot, idx) => {
                        if (!slot) return <div key={idx} style={{ padding: '14px 20px', borderLeft: `1px solid ${BORDER}`, fontSize: 13, color: SECONDARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>—</div>;
                        const v = slot[row.key];
                        const isBest  = row.num && !tied && typeof v === 'number' && v === best;
                        const isWorst = row.num && !tied && typeof v === 'number' && v === worst;
                        return (
                          <div key={idx} style={{ padding: '14px 20px', borderLeft: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8, background: isBest ? GREEN_LIGHT : isWorst ? RED_LIGHT : 'transparent' }}>
                            <span style={{ fontSize: 14, fontWeight: isBest || isWorst ? 700 : 500, color: isBest ? GREEN : isWorst ? RED : INK }}>{row.fmt(v)}</span>
                            {isBest && <span style={{ fontSize: 10, background: GREEN, color: '#fff', borderRadius: 50, padding: '2px 8px', fontWeight: 700, flexShrink: 0 }}>BEST</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Visual bar charts */}
                {[
                  { key: 'range', label: 'Range (km)' },
                  { key: 'dc',    label: 'Peak DC charging (kW)' },
                  { key: 'eff',   label: 'Efficiency (km/kWh)' },
                ].map(({ key, label }) => {
                  const maxVal = Math.max(...compareFilledSlots.map(m => m[key]));
                  return (
                    <div key={key} style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, background: CARD }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: SECONDARY, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {compareSlots.map((slot, idx) => !slot ? null : (
                          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 64px', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.model}</div>
                            <div style={{ height: 10, background: SURFACE, borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${(slot[key] / maxVal) * 100}%`, background: compareSlotColors[idx], borderRadius: 99, transition: 'width 0.6s ease' }}/>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: compareSlotColors[idx], textAlign: 'right' }}>{slot[key]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Quick verdict */}
                <div style={{ padding: '24px', background: BLUE_LIGHT }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Quick verdict</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                    {[
                      { label: '🏃 Longest range',    key: 'range', unit: 'km'     },
                      { label: '⚡ Fastest DC charge', key: 'dc',    unit: 'kW'     },
                      { label: '🌿 Most efficient',    key: 'eff',   unit: 'km/kWh' },
                    ].map(v => {
                      if (!compareFilledSlots.length) return null;
                      const winner = compareFilledSlots.reduce((a, b) => a[v.key] > b[v.key] ? a : b);
                      const tied = compareFilledSlots.filter(m => m[v.key] === winner[v.key]).length > 1;
                      return (
                        <div key={v.key} style={{ background: CARD, borderRadius: 14, padding: '14px 16px' }}>
                          <div style={{ fontSize: 12, color: SECONDARY, marginBottom: 4 }}>{v.label}</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{tied ? 'Tied' : winner.model}</div>
                          <div style={{ fontSize: 13, color: BLUE, fontWeight: 600 }}>{winner[v.key]} {v.unit}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ============ FOOTER ============ */}
      <footer style={{ background: SURFACE, borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <svg width="24" height="24" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill={BLUE}/><text x="16" y="22" textAnchor="middle" fontFamily="'Google Sans','Inter',sans-serif" fontWeight="700" fontSize="18" fill="#fff">V</text></svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>VNSHO</span>
              </div>
              <p style={{ fontSize: 13, color: SECONDARY, lineHeight: 1.6 }}>Singapore's open EV mobility data platform.</p>
            </div>
            {[
              { title: 'Data Sources', items: ['LTA Statistics (M03, M08, M09)', 'Ministry of Transport SG', 'Singapore Green Plan 2030', 'Operator disclosures'] },
              { title: 'Methodology', items: ['LTA monthly vehicle population', 'Q1 2026 = Jan + Feb + Mar cumulative', 'Real-world efficiency estimates', 'WLTP-adjusted range figures'] },
              { title: 'Refresh', items: ['LTA updates by 12th each month', 'This dashboard: March 2026', 'Next update: April 2026', 'Source: lta.gov.sg/statistics'] },
            ].map(s => (
              <div key={s.title}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 12 }}>{s.title}</div>
                {s.items.map(i => <div key={i} style={{ fontSize: 13, color: SECONDARY, marginBottom: 6 }}>{i}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: SECONDARY }}>
            <span>© 2026 VNSHO · Singapore</span>
            <span>Generated 12 Jul 2026</span>
          </div>
        </div>
      </footer>

      {/* ============ AI CHAT ============ */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)}
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderRadius: 50, background: BLUE, color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,115,232,0.4)', fontSize: 15, fontWeight: 600, fontFamily: "'Google Sans', sans-serif" }}
        >
          <div style={{ position: 'relative' }}>
            <Sparkles size={20} strokeWidth={2}/>
            <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: GREEN, border: '2px solid #fff' }}/>
          </div>
          Ask EV Assistant
        </button>
      )}

      {chatOpen && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, width: 'min(440px, calc(100vw - 3rem))', height: 'min(660px, calc(100vh - 7rem))', display: 'flex', flexDirection: 'column', background: CARD, borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.2)', border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
          {/* Chat header */}
          <div style={{ padding: '16px 20px', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="#fff"/>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "'Google Sans', sans-serif" }}>EV Assistant</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, display: 'inline-block' }}/>
                  Powered by Claude · LTA data + web search
                </div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} color="#fff"/>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12, background: SURFACE }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '88%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? BLUE : CARD,
                  color: msg.role === 'user' ? '#fff' : INK,
                  fontSize: 14, lineHeight: 1.6,
                  boxShadow: msg.role === 'assistant' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}>
                  {msg.role === 'assistant' && msg.usedSearch && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 11, fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      <Globe size={11}/> Web search used
                    </div>
                  )}
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: CARD, borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <Loader2 size={14} color={BLUE} className="animate-spin"/>
                  <span style={{ fontSize: 13, color: SECONDARY }}>Thinking...</span>
                </div>
              </div>
            )}

            {/* Question library */}
            {messages.length === 1 && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {!activeCategory ? (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, color: SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5, padding: '0 4px' }}>Browse by topic</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {Object.entries(questionLibrary).map(([cat]) => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                          style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 14, border: `1px solid ${BORDER}`, background: CARD, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: INK, transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.target.style.background = BLUE_LIGHT; e.target.style.borderColor = BLUE; e.target.style.color = BLUE; }}
                          onMouseLeave={e => { e.target.style.background = CARD; e.target.style.borderColor = BORDER; e.target.style.color = INK; }}
                        >{cat}</button>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: SECONDARY, textAlign: 'center' }}>or type your own question below</div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: BLUE }}>{activeCategory}</span>
                      <button onClick={() => setActiveCategory(null)} style={{ fontSize: 12, color: SECONDARY, background: 'none', border: 'none', cursor: 'pointer' }}>← All topics</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {questionLibrary[activeCategory].questions.map((q, i) => (
                        <button key={i} onClick={() => { setInput(q); setActiveCategory(null); setTimeout(sendMessage, 50); }}
                          style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 12, border: `1px solid ${BORDER}`, background: CARD, cursor: 'pointer', fontSize: 13, color: INK, display: 'flex', alignItems: 'center', gap: 8 }}
                          onMouseEnter={e => e.currentTarget.style.background = BLUE_LIGHT}
                          onMouseLeave={e => e.currentTarget.style.background = CARD}
                        >
                          <span style={{ color: BLUE, flexShrink: 0 }}>→</span> {q}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* Web search toggle */}
          <div style={{ padding: '8px 16px 4px', background: CARD, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                style={{ width: 36, height: 20, borderRadius: 99, background: webSearchEnabled ? BLUE : BORDER, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, left: webSearchEnabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}/>
              </div>
              <span style={{ fontSize: 12, color: SECONDARY, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Globe size={12}/> Web search {webSearchEnabled ? 'on' : 'off'}
              </span>
            </label>
            <span style={{ fontSize: 11, color: SECONDARY }}>Sonnet 4</span>
          </div>

          {/* Input */}
          <div style={{ padding: '8px 12px 16px', background: CARD }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: SURFACE, borderRadius: 24, border: `1px solid ${BORDER}`, padding: '6px 6px 6px 16px' }}
              onFocus={e => e.currentTarget.style.borderColor = BLUE}
              onBlur={e => e.currentTarget.style.borderColor = BORDER}
            >
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyPress}
                placeholder="Ask about EVs, charging, brands..."
                rows={1} disabled={loading}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: INK, resize: 'none', minHeight: 28, maxHeight: 96, fontFamily: "'Google Sans', 'Inter', sans-serif", paddingTop: 4 }}
              />
              <button onClick={sendMessage} disabled={!input.trim() || loading}
                style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() && !loading ? BLUE : BORDER, color: '#fff', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
                <Send size={15} strokeWidth={2}/>
              </button>
            </div>
            <div style={{ fontSize: 11, color: SECONDARY, textAlign: 'center', marginTop: 8 }}>
              Grounded in LTA dashboard data{webSearchEnabled ? ' · live web search on' : ''}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
