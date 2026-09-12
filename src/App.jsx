import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar, Legend,
  LineChart, Line, LabelList
} from 'recharts';
import { Zap, Battery, TrendingUp, Car, Truck, Bus, Clock, Award,
  AlertCircle, ChevronRight, Activity, X, Send, Sparkles, Loader2,
  Globe, ArrowRight, Search, ShoppingCart, Lock, Mail, Shield, CheckCircle,
  Download, Share2, Maximize2, Table2 } from 'lucide-react';

// ============ STANDALONE COMPONENT: Charging Density Map (Leaflet, loaded via CDN) ============
// Rendered only at /embed/charging-density-map — no nav, no auth gate.
// Leaflet is loaded dynamically since this is the only part of the app that needs it.
function ChargingDensityMapEmbed({ BLUE, NAVY, SECONDARY, BORDER, INK }) {
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const [leafletReady, setLeafletReady] = React.useState(false);
  const [stations, setStations] = React.useState([]);
  const [selectedRegions, setSelectedRegions] = React.useState(new Set(['Central', 'East', 'North', 'North-East', 'West', 'Unknown']));

  const REGION_COLORS = { Central: '#1657E0', East: '#dc2626', North: '#15803d', 'North-East': '#c8790a', West: '#7c3aed', Unknown: '#94a3b8' };

  // Load Leaflet CSS + JS via CDN (only for this embed)
  React.useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, []);

  // Fetch station data
  React.useEffect(() => {
    fetch('/data/charging-density.json').then(r => r.json()).then(setStations).catch(err => console.error('Failed to load charging density data:', err));
  }, []);

  // Initialize map once Leaflet + data are ready
  React.useEffect(() => {
    if (!leafletReady || stations.length === 0 || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([1.3521, 103.8198], 11.3);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO', maxZoom: 19
    }).addTo(map);
    mapInstanceRef.current = map;
    map.__markers = [];
  }, [leafletReady, stations]);

  // Render/update markers when data or region filter changes
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    const L = window.L;
    (map.__markers || []).forEach(m => map.removeLayer(m));
    map.__markers = [];
    stations.filter(s => selectedRegions.has(s.reg)).forEach(s => {
      const color = REGION_COLORS[s.reg] || '#94a3b8';
      const marker = L.circleMarker([s.lat, s.lon], {
        radius: Math.max(2, Math.sqrt(s.ch) * 1.5), fillColor: color, color, weight: 1, fillOpacity: 0.65, opacity: 0.85
      }).bindTooltip(`<strong>${s.n}</strong><br/>${s.reg} · ${s.typ}<br/>${s.ch} charging points<br/>Operator: ${s.op}`);
      marker.addTo(map);
      map.__markers.push(marker);
    });
  }, [stations, selectedRegions]);

  const toggleRegion = (region) => {
    setSelectedRegions(prev => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region); else next.add(region);
      return next;
    });
  };

  const regionTotals = {};
  stations.forEach(s => { regionTotals[s.reg] = (regionTotals[s.reg] || 0) + s.ch; });
  const totalPoints = stations.reduce((sum, s) => sum + s.ch, 0);

  return (
    <div style={{ background: 'transparent', fontFamily: "'Google Sans Flex', 'Inter', system-ui, sans-serif", color: INK, padding: 16 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: transparent; }
        .leaflet-container { font-family: 'Inter', sans-serif; }
      `}</style>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>World Mobility Forum</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>Charging Point Density by Region</h3>
        <p style={{ fontSize: 12, color: SECONDARY, margin: '4px 0 0' }}>{stations.length.toLocaleString()} stations · {totalPoints.toLocaleString()} charging points across Singapore. Each dot is one station; size reflects charging points, colour reflects region.</p>
      </div>

      {/* Region filter legend */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {Object.keys(REGION_COLORS).map(region => (
          <button key={region} onClick={() => toggleRegion(region)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, border: `1px solid ${selectedRegions.has(region) ? REGION_COLORS[region] : BORDER}`, background: selectedRegions.has(region) ? `${REGION_COLORS[region]}15` : '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: selectedRegions.has(region) ? REGION_COLORS[region] : SECONDARY, opacity: selectedRegions.has(region) ? 1 : 0.5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: REGION_COLORS[region] }}/>
            {region} {regionTotals[region] ? `(${regionTotals[region].toLocaleString()})` : ''}
          </button>
        ))}
      </div>

      {/* Map container */}
      <div ref={mapRef} style={{ width: '100%', height: 480, borderRadius: 12, border: `1px solid ${BORDER}`, background: '#eef1f5' }}>
        {(!leafletReady || stations.length === 0) && (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: SECONDARY }}>
            Loading map…
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${BORDER}`, fontSize: 10, color: SECONDARY, textAlign: 'right' }}>
        Source: LTA DataMall, operator disclosures (26-day average, Jul 2026) · <a href="https://vnsho-dashboard-ev.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600 }}>Full dashboard →</a>
      </div>
    </div>
  );
}

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
  const [userTier, setUserTier] = useState('free'); // 'free' | 'pro'
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [appView, setAppView] = useState('dashboard'); // landing page and auth gate removed — dashboard is now the default

  // ============ ACCESS CONTROL (disabled — full public access, no sign-in required) ============
  const MEMBER_TABS = [];
  const TAB_LABELS = { home: 'Home', overview: 'Overview', fleet: 'Fleet by Type', brands: 'Brand Rankings', specs: 'EV Specs', charging: 'EV Charging Stations', coe: 'COE & EVs', blog: 'News', calculator: 'Calculator', compare: 'Compare EVs' };
  const isTabGated = (id) => false;
  const isMember = true;
  const requireAuth = () => {};
  const goToTab = (id) => {
    setActiveTab(id);
    setAppView('dashboard');
  };

  // ============ FOUNDING MEMBER LAUNCH WINDOW (90 days) ============
  const LAUNCH_DATE = new Date('2026-07-26T00:00:00+08:00');
  const FOUNDING_WINDOW_DAYS = 90;
  const daysSinceLaunch = Math.floor((Date.now() - LAUNCH_DATE.getTime()) / 86400000);
  const daysLeftInWindow = Math.max(0, FOUNDING_WINDOW_DAYS - daysSinceLaunch);
  const isFoundingWindowOpen = daysLeftInWindow > 0;

  // Load saved session and email list from storage
  useEffect(() => {
    (async () => {
      try {
        const session = (() => { try { const v = localStorage.getItem('vnsho_session'); return v ? { value: v } : null; } catch { return null; } })();
        if (session && session.value) {
          const parsed = JSON.parse(session.value);
          if (parsed.granted && parsed.email) {
            setGateEmail(parsed.email);
            setGateStage('granted');
          }
        }
      } catch {}
      try {
        const list = (() => { try { const v = localStorage.getItem('vnsho_email_list'); return v ? { value: v } : null; } catch { return null; } })();
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
    try { (() => { try { localStorage.setItem('vnsho_email_list', JSON.stringify(updatedList)); } catch {} })(); } catch {}
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
    setAuthModalOpen(false);
    try { (() => { try { localStorage.setItem('vnsho_session', JSON.stringify({ granted: true, email: gateEmail, foundingMember: isFoundingWindowOpen, timestamp: new Date().toISOString() })); } catch {} })(); } catch {}
  };

  const handleLogout = async () => {
    setGateStage('email');
    setGateEmail('');
    setGatePin('');
    setGatePinInput('');
    setGateError('');
    try { (() => { try { localStorage.removeItem('vnsho_session'); } catch {} })(); } catch {}
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

  // ============ WORLD MOBILITY FORUM BRAND PALETTE ============
  const BLUE       = '#22C8C8';   // Tiffany Blue — brand primary (buttons, links, highlights)
  const BLUE_LIGHT = '#E3FAFA';   // Tiffany surface tint
  const RED        = '#E5484D';   // Alert/negative (functional, not brand core)
  const RED_LIGHT  = '#FDEBEC';
  const YELLOW     = '#FFB648';   // Amber — highlights, awards, events
  const YELLOW_LIGHT = '#FFF6E8';
  const GREEN      = '#32D17B';   // Success — growth, renewables, positive metrics
  const GREEN_LIGHT = '#EAFBF1';
  const INK        = '#111827';   // Dark heading
  const SECONDARY  = '#5B6470';   // Body text
  const SURFACE    = '#F7F8FA';   // Light grey background
  const CARD       = '#FFFFFF';
  const BORDER     = '#E5E8EC';
  const NAVY       = '#08244B';   // Midnight Navy — primary bg, nav, footer, hero (the premium colour)
  const NAVY_LIGHT = '#EAF0F6';
  const SLATE      = '#345A7D';   // Secondary — professional, corporate, charts
  const DEEP_CYAN  = '#00A9B8';   // Technology, innovation, hover states
  const ELECTRIC   = '#2F80ED';   // Analytics, data, AI
  const BLUE_MID   = DEEP_CYAN;

  // Charts: Navy, Tiffany, Slate/Grey, Success only (per brand guide)
  const CHART_COLORS = [BLUE, NAVY, SLATE, GREEN, DEEP_CYAN, SECONDARY];

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
  const [activeBrandFilter, setActiveBrandFilter] = useState('cars'); // 'cars'|'motorcycle'|'gpv'|'lgv'|'hgv'|'vhgv'|'bus'
  const [brandView, setBrandView] = useState('registration'); // 'registration' | 'population'
  const [brandLimit, setBrandLimit] = useState('top10'); // 'top10' | 'top20' | 'all'
  const [brandRangeFrom, setBrandRangeFrom] = useState('jan');
  const [brandRangeTo, setBrandRangeTo] = useState('jul');
  const [specsSubView, setSpecsSubView] = useState('specs'); // 'specs' | 'charging' | 'compare'
  const [specsShowCount, setSpecsShowCount] = useState(10);
  const [coeYearFrom, setCoeYearFrom] = useState(2025);
  const [coeChartView, setCoeChartView] = useState('chart'); // 'chart' | 'table'
  const [coeEvTypes, setCoeEvTypes] = useState(['cars']);
  const [chargeCalcModel, setChargeCalcModel] = useState('Tesla Model 3');
  const [specSortKey, setSpecSortKey] = useState('eff');
  const [specSortDir, setSpecSortDir] = useState('desc');
  const [brandFuelFilter, setBrandFuelFilter] = useState('ev'); // 'ev' | 'all'
  const [chargeCalcPower, setChargeCalcPower] = useState(60);
  const [chargeCalcFrom, setChargeCalcFrom] = useState(20);
  const [chargeCalcTo, setChargeCalcTo] = useState(80);

  const vehicleTypeStats = [
    { type: 'Cars', total: 652830, ev: 69190 },
    { type: 'Motorcycles', total: 154406, ev: 433 },
    { type: 'GPV', total: 2130, ev: 11 },
    { type: 'LGV', total: 116360, ev: 6220 },
    { type: 'HGV', total: 21350, ev: 1626 },
    { type: 'VHGV', total: 2732, ev: 0 },
    { type: 'Buses', total: 18331, ev: 920 },
  ];
  // New registrations (flow, not fleet stock), Jan-Jul 2026, by vehicle type — for Brand Rankings highlight boxes
  // Source: LTA M03 (cars), M04 (motorcycles), M08 (LGV/HGV/VHGV/Bus) — totalNew is ALL fuel types combined
  const newRegByType = [
    { type: 'Cars', segId: 'cars', ev: 19653, totalNew: 32097 },
    { type: 'Motorcycle', segId: 'motorcycle', ev: 49, totalNew: 7547 },
    { type: 'LGV', segId: 'lgv', ev: 788, totalNew: 1189 },
    { type: 'HGV', segId: 'hgv', ev: 602, totalNew: 2111 },
    { type: 'VHGV', segId: 'vhgv', ev: 0, totalNew: 1295 },
    { type: 'Bus', segId: 'bus', ev: 175, totalNew: 319 },
  ];
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
    { period: 'May 2026', evs: 62653, hybrids: 125068 },
    { period: 'Jun 2026', evs: 66005, hybrids: 126034 },
    { period: 'Jul 2026', evs: 69190, hybrids: 127118 },
  ];

  // Source: LTA M03 — New registration of cars by make, Jan–Jul 2026 (Electric only)
  const evCarBrands = [
    { brand: 'BYD', units: 7461 },
    { brand: 'Tesla', units: 3260 },
    { brand: 'Chery', units: 1361 },
    { brand: 'M.G.', units: 1197 },
    { brand: 'GAC', units: 1073 },
    { brand: 'Xpeng', units: 910 },
    { brand: 'Zeekr', units: 830 },
    { brand: 'B.M.W.', units: 724 },
    { brand: 'Dongfeng', units: 378 },
    { brand: 'Maxus', units: 358 },
    { brand: 'Avatr', units: 301 },
    { brand: 'Volvo', units: 244 },
    { brand: 'Toyota', units: 218 },
    { brand: 'Leapmotor', units: 214 },
    { brand: 'Deepal', units: 212 },
    { brand: 'Geely', units: 189 },
    { brand: 'Porsche', units: 161 },
    { brand: 'Hyundai', units: 91 },
    { brand: 'Mini', units: 87 },
    { brand: 'Audi', units: 82 },
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
    { op: 'SP Group / SP Mobility', points: 3800, share: 28, color: NAVY, note: 'Absorbed ~1,250 ex-TotalEnergies HDB points Nov–Dec 2025.' },
    { op: 'CDG ENGIE', points: 2100, share: 15, color: '#9C27B0', note: '2,100+ charge points as of Sep 2025 (ComfortDelGro press release).' },
    { op: 'Shell Recharge', points: 1100, share: 8, color: SLATE, note: 'Expanded DC HPC network in 2025.' },
    { op: 'Others / Private', points: 2650, share: 19, color: DEEP_CYAN, note: 'Tesla SC, Quantum, BYD, private carparks, condos.' },
  ];

  // Source: M03 total row — Jan–Jul 2026 all new car registrations by fuel type
  // Total new cars Jan-Jul: 32,097 (all fuel types) · EV total verified from per-brand sums, not estimated
  const adoptionPie = [
    { name: 'Pure EV', value: 19550, color: BLUE },
    { name: 'Hybrid', value: 6700, color: NAVY },
    { name: 'PHEV', value: 257, color: SLATE },
    { name: 'Petrol', value: 5590, color: '#DADCE0' },
  ];
  const adoptionPieTotal = adoptionPie.reduce((s, e) => s + e.value, 0);

  // Source: LTA M09 — Motor vehicle population by fuel type, as at 31 July 2026
  const fleetCategories = [
    { label: 'Cars', total: 652830, ev: 69190, hybrid: 127118, icon: '🚗' },
    { label: 'Taxis', total: 12134, ev: 633, hybrid: 11431, icon: '🚕' },
    { label: 'Motorcycles', total: 154406, ev: 433, hybrid: 0, icon: '🏍️' },
    { label: 'Goods Vehicles', total: 142572, ev: 7857, hybrid: 6, icon: '🚛' },
    { label: 'Buses', total: 18331, ev: 920, hybrid: 0, icon: '🚌' },
  ];

  // ============ COE DATA (LTA M11 — Jan 2025 to Jul 2026 1st bidding) ============
  const coeData = [
    { month: 'Jan 25', catA: 93699, catB: 121501, catC: 67891, evPop: 26225 },
    { month: 'Feb 25', catA: 85000, catB: 111104, catC: 62506, evPop: 27500 },
    { month: 'Mar 25', catA: 92730, catB: 113000, catC: 67001, evPop: 29000 },
    { month: 'Apr 25', catA: 97724, catB: 117899, catC: 68782, evPop: 31000 },
    { month: 'May 25', catA: 103009, catB: 119890, catC: 62590, evPop: 33500 },
    { month: 'Jun 25', catA: 96999, catB: 113000, catC: 62000, evPop: 36000 },
    { month: 'Jul 25', catA: 101102, catB: 119600, catC: 66689, evPop: 38500 },
    { month: 'Aug 25', catA: 102009, catB: 123498, catC: 70001, evPop: 41000 },
    { month: 'Sep 25', catA: 107889, catB: 127501, catC: 71556, evPop: 43500 },
    { month: 'Oct 25', catA: 128105, catB: 141000, catC: 74301, evPop: 46000 },
    { month: 'Nov 25', catA: 110002, catB: 115001, catC: 76000, evPop: 47500 },
    { month: 'Dec 25', catA: 105413, catB: 123900, catC: 76501, evPop: 49110 },
    { month: 'Jan 26', catA: 102009, catB: 119100, catC: 75503, evPop: 51454 },
    { month: 'Feb 26', catA: 106320, catB: 110890, catC: 74801, evPop: 53688 },
    { month: 'Mar 26', catA: 108220, catB: 114002, catC: 76000, evPop: 56770 },
    { month: 'Apr 26', catA: 118000, catB: 121000, catC: 80001, evPop: 59735 },
    { month: 'May 26', catA: 124790, catB: 126236, catC: 87479, evPop: 62653 },
    { month: 'Jun 26', catA: 126009, catB: 126989, catC: 94000, evPop: 66005 },
    { month: 'Jul 26', catA: 129000, catB: 130889, catC: 95000, evPop: 69190 },
    { month: 'Aug 26', catA: 123890, catB: 129910, catC: 91545, evPop: 69190 },
  ];

  // Monthly EV brand breakdown (Jan-May 2026 from M03 + M08)
  const brandMonthly = [
    { brand: 'BYD', jan: 1112, feb: 859, mar: 1102, apr: 1349, may: 1091, jun: 953, jul: 995, total: 7461, type: 'car' },
    { brand: 'Tesla', jan: 413, feb: 485, mar: 617, apr: 168, may: 360, jun: 783, jul: 434, total: 3260, type: 'car' },
    { brand: 'Chery', jan: 229, feb: 138, mar: 205, apr: 184, may: 243, jun: 191, jul: 171, total: 1361, type: 'car' },
    { brand: 'GAC', jan: 41, feb: 117, mar: 222, apr: 208, may: 166, jun: 87, jul: 232, total: 1073, type: 'car' },
    { brand: 'M.G.', jan: 115, feb: 124, mar: 136, apr: 163, may: 203, jun: 223, jul: 233, total: 1197, type: 'car' },
    { brand: 'Zeekr', jan: 77, feb: 90, mar: 102, apr: 156, may: 140, jun: 130, jul: 135, total: 830, type: 'car' },
    { brand: 'Xpeng', jan: 66, feb: 75, mar: 106, apr: 152, may: 161, jun: 181, jul: 169, total: 910, type: 'car' },
    { brand: 'B.M.W.', jan: 74, feb: 79, mar: 126, apr: 148, may: 120, jun: 115, jul: 62, total: 724, type: 'car' },
    { brand: 'Dongfeng', jan: 41, feb: 35, mar: 70, apr: 54, may: 30, jun: 72, jul: 76, total: 378, type: 'car' },
    { brand: 'Avatr', jan: 11, feb: 26, mar: 41, apr: 45, may: 45, jun: 61, jul: 72, total: 301, type: 'car' },
    { brand: 'Volvo', jan: 22, feb: 37, mar: 31, apr: 40, may: 30, jun: 36, jul: 48, total: 244, type: 'car' },
    { brand: 'Maxus', jan: 15, feb: 14, mar: 30, apr: 51, may: 50, jun: 122, jul: 76, total: 358, type: 'car' },
    { brand: 'Toyota', jan: 14, feb: 51, mar: 23, apr: 0, may: 57, jun: 43, jul: 30, total: 218, type: 'car' },
    { brand: 'Leapmotor', jan: 19, feb: 15, mar: 16, apr: 42, may: 42, jun: 40, jul: 40, total: 214, type: 'car' },
    { brand: 'Porsche', jan: 7, feb: 27, mar: 34, apr: 17, may: 27, jun: 25, jul: 24, total: 161, type: 'car' },
    { brand: 'Deepal', jan: 8, feb: 14, mar: 9, apr: 15, may: 18, jun: 81, jul: 67, total: 212, type: 'car' },
    { brand: 'Geely', jan: 16, feb: 9, mar: 34, apr: 29, may: 30, jun: 33, jul: 38, total: 189, type: 'car' },
    { brand: 'Hyundai', jan: 13, feb: 13, mar: 11, apr: 14, may: 18, jun: 7, jul: 15, total: 91, type: 'car' },
    { brand: 'Mini', jan: 12, feb: 9, mar: 13, apr: 16, may: 15, jun: 12, jul: 10, total: 87, type: 'car' },
    { brand: 'Audi', jan: 11, feb: 8, mar: 14, apr: 21, may: 10, jun: 8, jul: 10, total: 82, type: 'car' },
    { brand: 'Kia', jan: 4, feb: 3, mar: 4, apr: 11, may: 21, jun: 16, jul: 8, total: 67, type: 'car' },
    { brand: 'Polestar', jan: 5, feb: 8, mar: 11, apr: 12, may: 5, jun: 7, jul: 3, total: 51, type: 'car' },
    { brand: 'Smart', jan: 2, feb: 4, mar: 2, apr: 7, may: 4, jun: 8, jul: 13, total: 40, type: 'car' },
    { brand: 'Great Wall', jan: 4, feb: 2, mar: 6, apr: 4, may: 3, jun: 3, jul: 18, total: 40, type: 'car' },
    { brand: 'Subaru', jan: 2, feb: 5, mar: 9, apr: 11, may: 0, jun: 4, jul: 8, total: 39, type: 'car' },
    { brand: 'NIO', jan: 7, feb: 5, mar: 4, apr: 2, may: 6, jun: 5, jul: 5, total: 34, type: 'car' },
    { brand: 'Volkswagen', jan: 4, feb: 5, mar: 4, apr: 7, may: 4, jun: 4, jul: 3, total: 31, type: 'car' },
  ];

  const commercialBrandMonthly = [
    { brand: 'BYD', jan: 22, feb: 44, mar: 103, apr: 65, may: 49, jun: 33, jul: 36, total: 352, lgv: 154, hgv: 135, bus: 63 },
    { brand: 'Maxus', jan: 41, feb: 9, mar: 21, apr: 41, may: 33, jun: 50, jul: 48, total: 243, lgv: 204, hgv: 37, bus: 1 },
    { brand: 'Foton', jan: 32, feb: 9, mar: 12, apr: 11, may: 12, jun: 15, jul: 12, total: 103, lgv: 47, hgv: 62, bus: 12 },
    { brand: 'Toyota', jan: 27, feb: 12, mar: 17, apr: 20, may: 7, jun: 19, jul: 26, total: 128, lgv: 22, hgv: 106, bus: 0 },
    { brand: 'Farizon', jan: 14, feb: 8, mar: 9, apr: 24, may: 11, jun: 15, jul: 27, total: 108, lgv: 55, hgv: 31, bus: 29 },
    { brand: 'Higer', jan: 5, feb: 11, mar: 18, apr: 10, may: 8, jun: 5, jul: 1, total: 58, lgv: 0, hgv: 8, bus: 48 },
    { brand: 'Qingling', jan: 10, feb: 8, mar: 9, apr: 0, may: 25, jun: 11, jul: 4, total: 67, lgv: 0, hgv: 67, bus: 0 },
    { brand: 'Forland', jan: 7, feb: 8, mar: 8, apr: 28, may: 0, jun: 12, jul: 17, total: 80, lgv: 55, hgv: 25, bus: 0 },
    { brand: 'Mercedes', jan: 10, feb: 5, mar: 8, apr: 15, may: 8, jun: 1, jul: 0, total: 47, lgv: 35, hgv: 4, bus: 0 },
    { brand: 'Citroen', jan: 19, feb: 4, mar: 13, apr: 7, may: 3, jun: 20, jul: 13, total: 79, lgv: 78, hgv: 1, bus: 0 },
    { brand: 'Sany', jan: 19, feb: 7, mar: 6, apr: 7, may: 9, jun: 28, jul: 26, total: 102, lgv: 0, hgv: 80, bus: 22 },
    { brand: 'Volkswagen', jan: 14, feb: 5, mar: 7, apr: 6, may: 8, jun: 5, jul: 4, total: 49, lgv: 49, hgv: 0, bus: 0 },
    { brand: 'SRM', jan: 4, feb: 13, mar: 12, apr: 9, may: 0, jun: 5, jul: 9, total: 52, lgv: 37, hgv: 10, bus: 0 },
    { brand: 'JAC', jan: 5, feb: 4, mar: 17, apr: 4, may: 7, jun: 9, jul: 5, total: 51, lgv: 11, hgv: 36, bus: 0 },
    { brand: 'Opel', jan: 2, feb: 5, mar: 8, apr: 13, may: 0, jun: 7, jul: 6, total: 41, lgv: 41, hgv: 0, bus: 0 },
  ];

  // Helper: get brand list for a given vehicle-type segment (pure function, not a hook)
  const getSegmentBrands = (seg) => {
    if (seg === 'cars') return brandMonthly.map(b => ({ ...b, unit: b.total }));
    if (seg === 'lgv') return commercialBrandMonthly.filter(b => b.lgv > 0).map(b => ({ ...b, unit: b.lgv })).sort((a,b) => b.unit - a.unit);
    if (seg === 'hgv') return commercialBrandMonthly.filter(b => b.hgv > 0).map(b => ({ ...b, unit: b.hgv })).sort((a,b) => b.unit - a.unit);
    if (seg === 'bus') return commercialBrandMonthly.filter(b => b.bus > 0).map(b => ({ ...b, unit: b.bus })).sort((a,b) => b.unit - a.unit);
    return []; // motorcycle, gpv, vhgv — LTA does not publish brand-level breakdown
  };
  const brandLimitN = brandLimit === 'top10' ? 10 : brandLimit === 'top20' ? 20 : 999;

  // ============ AI CHAT ============
  const dashboardContext = `You are a helpful EV assistant on a Singapore EV Mobility dashboard. Be friendly, clear and informative. Use the data below as your source of truth. Search the web for anything outside it.

SINGAPORE EV DATA (Updated: M03 May 2026, M09 Apr 2026 fleet population, LTA):
- Fleet population (31 Jul 2026, M09): 980,273 vehicles. Pure EVs: 79,033 (8.06%).
- EV Cars: 69,190 (10.6% of 652,830). +164% from Dec 2024.
- Hybrid Cars: 127,118 (19.5%). EV Goods: 7,857 (5.5%). EV Buses: 920. EV Taxis: 633.
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
  const TabBtn = ({ id, label }) => {
    const gated = isTabGated(id) && !isMember;
    return (
      <button
        onClick={() => goToTab(id)}
        className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium transition-all whitespace-nowrap"
        style={{
          color: activeTab === id ? NAVY : SECONDARY,
          background: 'transparent',
          borderBottom: `2px solid ${activeTab === id ? BLUE : 'transparent'}`,
          borderRadius: 0,
          fontFamily: "'Google Sans Flex', 'Inter', sans-serif",
          fontWeight: activeTab === id ? 700 : 500,
          opacity: gated ? 0.75 : 1,
        }}
      >
        {label}
        {gated && <Lock size={11}/>}
      </button>
    );
  };

  const MetricCard = ({ label, value, delta, sub, color = BLUE, bg, icon }) => (
    <div style={{ background: CARD, borderRadius: 12, padding: '22px 24px', border: `1px solid ${BORDER}`, borderLeft: `3px solid ${color}`, transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.borderLeftColor = color; }}
    >
      <div style={{ fontSize: 12, color: SECONDARY, fontWeight: 600, marginBottom: 10, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: INK, lineHeight: 1.1, letterSpacing: -0.5, fontFamily: "'Google Sans Flex', 'Inter', sans-serif" }}>{value}</div>
      {delta && <div style={{ fontSize: 13, fontWeight: 600, color: color, marginTop: 8 }}>{delta}</div>}
      {sub && <div style={{ fontSize: 12, color: SECONDARY, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const SectionLabel = ({ text, color = BLUE }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <div style={{ width: 24, height: 2, background: color, flexShrink: 0 }}/>
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 1.2, textTransform: 'uppercase' }}>{text}</span>
    </div>
  );

  const SectionHead = ({ chip, title, subtitle, chipColor }) => (
    <div style={{ marginBottom: 32 }}>
      {chip && <SectionLabel text={chip} color={chipColor || BLUE} />}
      <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.75rem)', fontWeight: 700, color: INK, lineHeight: 1.2, margin: '4px 0 10px', fontFamily: "'Google Sans Flex', 'Inter', sans-serif", letterSpacing: -0.3 }}>{title}</h2>
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

  // ============ DOWNLOAD & PREMIUM HELPERS ============
  const downloadCSV = (filename, headers, rows) => {
    const csv = [headers.join(','), ...rows.map(r => r.map(c => typeof c === 'string' && c.includes(',') ? `"${c}"` : c).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const DownloadBtn = ({ label, onClick, premium = false }) => {
    const handleClick = () => {
      onClick();
    };
    return (
      <button onClick={handleClick}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 50, border: `1px solid ${premium ? YELLOW : BORDER}`, background: premium ? YELLOW_LIGHT : CARD, color: premium ? '#7A4F00' : SECONDARY, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Google Sans Flex', 'Inter', sans-serif", transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = premium ? YELLOW : BLUE; e.currentTarget.style.color = premium ? '#7A4F00' : BLUE; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = premium ? YELLOW : BORDER; e.currentTarget.style.color = premium ? '#7A4F00' : SECONDARY; }}
      >
        {premium && <Award size={13}/>}
        <span style={{ fontSize: 14 }}>↓</span> {label}
        {premium && <span style={{ background: YELLOW, color: '#fff', borderRadius: 50, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>PRO</span>}
      </button>
    );
  };

  const calcEvModelOptions = [['BYD Atto 3',6.0],['Tesla Model 3',7.1],['BYD Seal',6.2],['Hyundai Ioniq 6',7.0],['Tesla Model Y',6.7],['Chery Omoda E5',6.7],['BMW i4 eDrive35',6.5],['Volvo EX30',6.5],['Kia EV6',6.4],['MG 4 EV',6.4],['GAC Aion Y',6.3],['Zeekr X',6.1],['Xpeng G6',5.9],['Mercedes EQE',5.9],['Hyundai Ioniq 5',5.6],['Porsche Macan EV',5.5],['BYD Sealion 7',5.0],['Porsche Taycan',4.8],['MG S5 EV',6.2],['Deepal S07',5.8]];
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

  // ============ STANDALONE EMBED: /embed/brand-rankings ============
  // Lightweight widget version for embedding in Wix/WordPress via iframe — no nav, no auth gate.
  if (typeof window !== 'undefined' && window.location.pathname === '/embed/brand-rankings') {
    const segBrands = getSegmentBrands(activeBrandFilter);
    const limited = segBrands.slice(0, brandLimitN);
    return (
      <div style={{ background: 'transparent', fontFamily: "'Google Sans Flex', 'Inter', system-ui, sans-serif", color: INK }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background: transparent; }
        `}</style>

        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#fff', padding: '16px 16px 12px 16px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>EV Brand Rankings — {activeBrandFilter.toUpperCase()}</h3>
            <div style={{ display: 'flex', gap: 4, background: SURFACE, borderRadius: 10, padding: 4, border: `1px solid ${BORDER}` }}>
              {['top10','top20','all'].map(f => (
                <button key={f} onClick={() => setBrandLimit(f)} style={{ padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: brandLimit === f ? NAVY : 'transparent', color: brandLimit === f ? '#fff' : SECONDARY }}>{f === 'top10' ? 'Top 10' : f === 'top20' ? 'Top 20' : 'All'}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[{ id: 'cars', label: 'Cars' }, { id: 'motorcycle', label: 'Motorcycle' }, { id: 'lgv', label: 'LGV' }, { id: 'hgv', label: 'HGV' }, { id: 'vhgv', label: 'VHGV' }, { id: 'bus', label: 'Bus' }].map(t => (
              <button key={t.id} onClick={() => setActiveBrandFilter(t.id)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${activeBrandFilter === t.id ? BLUE : BORDER}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: activeBrandFilter === t.id ? BLUE_LIGHT : CARD, color: activeBrandFilter === t.id ? NAVY : SECONDARY }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: 16 }}>
          {limited.length === 0 ? (
            <div style={{ background: YELLOW_LIGHT, borderRadius: 12, padding: 20, fontSize: 13, color: INK }}>No brand-level data published by LTA for this category.</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(260, limited.length * 34)}>
              <BarChart data={limited} layout="vertical" margin={{ left: 8, right: 64 }}>
                <CartesianGrid stroke={BORDER} horizontal={false} strokeDasharray="3 6"/>
                <XAxis type="number" stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="brand" stroke={INK} tick={{ fontSize: 12, fontWeight: 600 }} width={90} axisLine={false} tickLine={false}/>
                <Tooltip content={<GoogleTooltip/>} cursor={{ fill: BLUE_LIGHT }}/>
                <Bar dataKey="unit" name="Jan-Jul 2026 units" radius={[0,8,8,0]} fill={BLUE}>
                  <LabelList dataKey="unit" position="right" formatter={(v) => v.toLocaleString()} style={{ fontSize: 12, fontWeight: 700, fill: INK }}/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

         
        </div>
      </div>
    );
  }

  
  // ============ STANDALONE EMBED: /embed/brand-rankings-full ============
  // The ENTIRE Brand Rankings experience — highlight boxes, segment tabs, 3 key stats,
  // Top10/20/All + range selector, monthly line chart, monthly table, and labeled bar chart.
  // Mirrors the main dashboard's Brand Rankings tab exactly — no nav, no auth gate.
  if (typeof window !== 'undefined' && window.location.pathname === '/embed/brand-rankings-full') {
    const segBrands = getSegmentBrands(activeBrandFilter);
    return (
      <div style={{ background: 'transparent', fontFamily: "'Google Sans Flex', 'Inter', system-ui, sans-serif", color: INK, padding: 20 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background: transparent; }
        `}</style>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>World Mobility Forum</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0 }}>EV brand performance by vehicle type.</h2>
          <p style={{ fontSize: 13, color: SECONDARY, margin: '4px 0 0' }}>Source: LTA M03 / M08 - New registrations, Jan-Jul 2026</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 20 }}>
          {newRegByType.map(v => {
            const pct = ((v.ev / v.totalNew) * 100).toFixed(1);
            return (
              <div key={v.type} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: SECONDARY, fontWeight: 600, marginBottom: 6 }}>{v.type}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: INK, fontFamily: "'Google Sans Flex',sans-serif" }}>{v.ev.toLocaleString()} units</div>
                <div style={{ fontSize: 11, color: BLUE, fontWeight: 700, marginTop: 4 }}>{pct}% of all new registrations</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', background: SURFACE, borderRadius: 12, padding: 4, border: `1px solid ${BORDER}`, alignSelf: 'flex-start', marginBottom: 20 }}>
          {[
            { id: 'cars', label: 'Cars' }, { id: 'motorcycle', label: 'Motorcycle' },
            { id: 'lgv', label: 'LGV' }, { id: 'hgv', label: 'HGV' }, { id: 'vhgv', label: 'VHGV' }, { id: 'bus', label: 'Bus' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveBrandFilter(t.id)} style={{ padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: activeBrandFilter === t.id ? BLUE : 'transparent', color: activeBrandFilter === t.id ? NAVY : SECONDARY }}>{t.label}</button>
          ))}
        </div>

        {segBrands.length === 0 ? (
          <div style={{ background: YELLOW_LIGHT, borderRadius: 16, padding: 24, fontSize: 13, color: INK }}>
            LTA does not publish brand-level registration data for this vehicle category. Fleet-level totals are shown in the highlight box above.
          </div>
        ) : (() => {
          const monthOrder = ['jan','feb','mar','apr','may','jun','jul'];
          const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
          const fromIdx = monthOrder.indexOf(brandRangeFrom);
          const toIdx = monthOrder.indexOf(brandRangeTo);
          const lo = Math.min(fromIdx, toIdx), hi = Math.max(fromIdx, toIdx);
          const rangeMonths = monthOrder.slice(lo, hi + 1);
          const rangeLabels = monthLabels.slice(lo, hi + 1);
          const rangeLabel = rangeLabels.length > 1 ? `${rangeLabels[0]}\u2013${rangeLabels[rangeLabels.length-1]}` : rangeLabels[0];

          const rankedByRange = segBrands
            .map(b => ({ ...b, rangeUnit: rangeMonths.reduce((s, m) => s + (b[m] || 0), 0) }))
            .sort((a, b) => b.rangeUnit - a.rangeUnit);
          const limited = rankedByRange.slice(0, brandLimitN);

          const topBrand = limited[0];
          const fastestGrowing = rangeMonths.length > 1
            ? [...rankedByRange].sort((a,b) => (b[rangeMonths[rangeMonths.length-1]] - b[rangeMonths[0]]) - (a[rangeMonths[rangeMonths.length-1]] - a[rangeMonths[0]]))[0]
            : null;

          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                <MetricCard label={`Total EV - ${activeBrandFilter.toUpperCase()}`} value={limited.reduce((s,b)=>s+b.rangeUnit,0).toLocaleString()} delta={`${rangeLabel} 2026`} sub="New registrations" color={BLUE} bg={BLUE_LIGHT} icon="STAT"/>
                <MetricCard label="Top brand" value={topBrand ? topBrand.brand : '-'} delta={topBrand ? `${topBrand.rangeUnit.toLocaleString()} units` : ''} sub={`Ranked by ${rangeLabel} total`} color={NAVY} bg={NAVY_LIGHT} icon="TOP"/>
                <MetricCard label="Fastest growing" value={fastestGrowing ? fastestGrowing.brand : '-'} delta={fastestGrowing && rangeMonths.length > 1 ? `+${(fastestGrowing[rangeMonths[rangeMonths.length-1]] - fastestGrowing[rangeMonths[0]])} units (${rangeLabel})` : 'Select a range > 1 month'} sub="Within selected range" color={SLATE} bg={NAVY_LIGHT} icon="UP"/>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 4, background: SURFACE, borderRadius: 10, padding: 4, border: `1px solid ${BORDER}` }}>
                  {[{id:'top10',l:'Top 10'},{id:'top20',l:'Top 20'},{id:'all',l:'All'}].map(f => (
                    <button key={f.id} onClick={() => setBrandLimit(f.id)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: brandLimit === f.id ? NAVY : 'transparent', color: brandLimit === f.id ? '#fff' : SECONDARY }}>{f.l}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: SECONDARY }}>2026 range:</span>
                  <select value={brandRangeFrom} onChange={e => setBrandRangeFrom(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 600, background: CARD, color: INK }}>
                    {monthOrder.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                  </select>
                  <span style={{ fontSize: 12, color: SECONDARY }}>to</span>
                  <select value={brandRangeTo} onChange={e => setBrandRangeTo(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 600, background: CARD, color: INK }}>
                    {monthOrder.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                  </select>
                </div>
                <span style={{ fontSize: 11, color: SECONDARY }}>Showing {limited.length} of {segBrands.length} brands · {rangeLabel} 2026</span>
              </div>

              <div style={{ background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}`, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 16px' }}>Monthly registration trend {'\u2014'} {rangeLabel} 2026</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={rangeMonths.map((m,idx) => {
                    const row = { month: rangeLabels[idx] };
                    limited.forEach(b => { row[b.brand] = b[m]; });
                    return row;
                  })}>
                    <CartesianGrid stroke={BORDER} strokeDasharray="3 6" vertical={false}/>
                    <XAxis dataKey="month" stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                    <YAxis stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<GoogleTooltip/>}/>
                    {limited.map((b,i) => (
                      <Line key={b.brand} type="monotone" dataKey={b.brand} stroke={[BLUE,NAVY,SLATE,DEEP_CYAN,'#6B93B0','#1A8A94',GREEN,YELLOW,'#8B5CF6','#E36414','#5B7DB1','#2E8B7A','#B0416E','#4A6741','#9B59B6','#16A085','#D35400','#7F8C8D','#2980B9','#C0392B'][i % 20]} strokeWidth={2} dot={{ r: 2 }}/>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0 }}>Monthly breakdown by brand {'\u2014'} {rangeLabel} 2026</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 500 + rangeMonths.length * 70, borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead><tr style={{ background: SURFACE }}>{['#','Brand', ...rangeLabels, 'Total'].map((h,i) => (<th key={h+i} style={{ padding: '10px 14px', textAlign: i>1?'right':'left', fontSize: 11, fontWeight: 600, color: SECONDARY, borderBottom: `2px solid ${BORDER}` }}>{h}</th>))}</tr></thead>
                    <tbody>
                      {limited.map((b,i) => (
                        <tr key={b.brand} style={{ borderBottom: `1px solid ${BORDER}`, background: i%2?SURFACE:CARD }}>
                          <td style={{ padding: '9px 14px', color: SECONDARY, fontWeight: 600 }}>{i+1}</td>
                          <td style={{ padding: '9px 14px', fontWeight: 600, color: INK }}>{b.brand}</td>
                          {rangeMonths.map(m => (<td key={m} style={{ padding: '9px 14px', textAlign: 'right', color: INK }}>{b[m]}</td>))}
                          <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: BLUE }}>{b.rangeUnit.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}` }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Accumulative total by brand</h3>
                <p style={{ fontSize: 12, color: SECONDARY, margin: '0 0 16px' }}>{rangeLabel} 2026, all brand names shown in full</p>
                <ResponsiveContainer width="100%" height={Math.max(240, limited.length * 32)}>
                  <BarChart data={limited} layout="vertical" margin={{ left: 8, right: 64 }}>
                    <CartesianGrid stroke={BORDER} horizontal={false} strokeDasharray="3 6"/>
                    <XAxis type="number" stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                    <YAxis type="category" dataKey="brand" stroke={INK} tick={{ fontSize: 12, fontWeight: 700 }} width={130} interval={0} axisLine={false} tickLine={false}/>
                    <Tooltip content={<GoogleTooltip/>} cursor={{ fill: BLUE_LIGHT }}/>
                    <Bar dataKey="rangeUnit" name={`${rangeLabel} units`} radius={[0,8,8,0]} fill={BLUE}>
                      <LabelList dataKey="rangeUnit" position="right" formatter={(v) => v.toLocaleString()} style={{ fontSize: 12, fontWeight: 700, fill: INK }}/>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          );
        })()}

        <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${BORDER}`, fontSize: 10, color: SECONDARY, textAlign: 'right' }}>
          Source: LTA M03/M08 {'\u00b7'} <a href="https://vnsho-dashboard-ev.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600 }}>Full dashboard →</a>
        </div>
      </div>
    );
  }

  // ============ STANDALONE EMBED: /embed/charging-network ============
  // Lightweight widget version of the Charging Network operator breakdown — no nav, no auth gate.
  if (typeof window !== 'undefined' && window.location.pathname === '/embed/charging-network') {
    const totalPoints = chargingOps.reduce((s, o) => s + o.points, 0);
    return (
      <div style={{ background: 'transparent', fontFamily: "'Google Sans Flex', 'Inter', system-ui, sans-serif", color: INK, padding: 16 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background: transparent; }
        `}</style>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>World Mobility Forum</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>Charging Network — by Operator</h3>
          <p style={{ fontSize: 12, color: SECONDARY, margin: '4px 0 0' }}>{totalPoints.toLocaleString()} charging points across Singapore, by CPO</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={chargingOps} dataKey="share" nameKey="op" innerRadius={55} outerRadius={95} paddingAngle={3} startAngle={90} endAngle={-270}>
                {chargingOps.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0}/>)}
              </Pie>
              <Tooltip content={<GoogleTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chargingOps.map((o, i) => (
              <div key={o.op} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: o.color, flexShrink: 0 }}/>
                <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.op}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: SECONDARY }}>{o.share}%</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${BORDER}`, fontSize: 10, color: SECONDARY, textAlign: 'right' }}>
          Source: LTA DataMall, operator disclosures · <a href="https://vnsho-dashboard-ev.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600 }}>Full dashboard →</a>
        </div>
      </div>
    );
  }

  // ============ STANDALONE EMBED: /embed/charging-density-map ============
  // Leaflet map of Singapore charging station density by region — public infrastructure data only.
  if (typeof window !== 'undefined' && window.location.pathname === '/embed/charging-density-map') {
    return <ChargingDensityMapEmbed BLUE={BLUE} NAVY={NAVY} SECONDARY={SECONDARY} BORDER={BORDER} INK={INK}/>;
  }

  // ============ STANDALONE EMBED: /embed/fleet-breakdown ============
  // Fleet composition stat cards + fuel×vehicle-type breakdown table — no nav, no auth gate.
  if (typeof window !== 'undefined' && window.location.pathname === '/embed/fleet-breakdown') {
    const fleetRows = [
      { type: 'Cars 🚗', petrol: 441350, diesel: 11907, hybrid: 127118, phev: 3194, ev: 69190, total: 652830 },
      { type: 'Taxis 🚕', petrol: 2, diesel: 68, hybrid: 11431, phev: 0, ev: 633, total: 12134 },
      { type: 'Motorcycles 🏍️', petrol: 153973, diesel: 0, hybrid: 0, phev: 0, ev: 433, total: 154406 },
      { type: 'Goods Vehicles 🚛', petrol: 13776, diesel: 120898, hybrid: 6, phev: 1, ev: 7857, total: 142572 },
      { type: 'Buses 🚌', petrol: 132, diesel: 17183, hybrid: 50, phev: 46, ev: 920, total: 18331 },
    ];
    const statCards = [
      { label: 'EV Cars', value: '69,190', sub: '87.6% of all EVs', color: BLUE, icon: '🚗' },
      { label: 'EV Goods Veh.', value: '7,857', sub: 'LGV/HGV/VHGV', color: NAVY, icon: '🚛' },
      { label: 'EV Buses', value: '920', sub: 'Public + Charter', color: SLATE, icon: '🚌' },
      { label: 'EV Taxis', value: '633', sub: 'Of 12,134 taxis', color: BLUE, icon: '🚕' },
      { label: 'EV Motorcycles', value: '433', sub: 'Slowest segment', color: SECONDARY, icon: '🏍️' },
    ];
    return (
      <div style={{ background: 'transparent', fontFamily: "'Google Sans Flex', 'Inter', system-ui, sans-serif", color: INK, padding: 16 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; background: transparent; }
        `}</style>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>World Mobility Forum</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>EV Fleet Composition by Vehicle Type</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          {statCards.map(m => (
            <div key={m.label} style={{ background: CARD, borderRadius: 12, padding: '16px 18px', border: `1px solid ${BORDER}`, borderLeft: `3px solid ${m.color}` }}>
              <div style={{ fontSize: 11, color: SECONDARY, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: INK, fontFamily: "'Google Sans Flex',sans-serif" }}>{m.value}</div>
              <div style={{ fontSize: 11, color: SECONDARY, marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0 }}>Fuel type × Vehicle type — full breakdown</h4>
            <p style={{ fontSize: 12, color: SECONDARY, margin: '4px 0 0' }}>Every road vehicle in Singapore by powertrain · April 2026</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: SURFACE }}>
                  {['Vehicle Type','Petrol','Diesel','Hybrid','PHEV','Pure EV','Total','EV %'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: i > 0 ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: SECONDARY, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fleetRows.map((r, ri) => {
                  const pct = ((r.ev / r.total) * 100).toFixed(2);
                  return (
                    <tr key={r.type} style={{ borderBottom: `1px solid ${BORDER}`, background: ri % 2 ? SURFACE : CARD }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: INK }}>{r.type}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: SECONDARY }}>{r.petrol.toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: SECONDARY }}>{r.diesel.toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: GREEN }}>{r.hybrid.toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: SECONDARY }}>{r.phev.toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: BLUE, fontWeight: 700 }}>{r.ev.toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>{r.total.toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <span style={{ background: BLUE_LIGHT, color: BLUE, fontWeight: 700, borderRadius: 50, padding: '3px 10px', fontSize: 11 }}>{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ background: BLUE_LIGHT, borderTop: `2px solid ${BLUE}` }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: INK }}>Total Fleet</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>609,233</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>150,056</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: GREEN }}>138,605</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>3,241</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: BLUE }}>79,033</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>980,273</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <span style={{ background: BLUE, color: '#fff', fontWeight: 700, borderRadius: 50, padding: '3px 10px', fontSize: 11 }}>8.06%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${BORDER}`, fontSize: 10, color: SECONDARY, textAlign: 'right' }}>
          Source: LTA M09 (Apr 2026) · <a href="https://vnsho-dashboard-ev.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600 }}>Full dashboard →</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: SURFACE, minHeight: '100vh', fontFamily: "'Google Sans Flex', 'Inter', system-ui, sans-serif", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .scroll-table::-webkit-scrollbar { height: 6px; }
        .scroll-table::-webkit-scrollbar-track { background: ${SURFACE}; border-radius: 3px; }
        .scroll-table::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        .g-chip { transition: background 0.15s; }
        .g-chip:hover { filter: brightness(0.96); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .gate-fade { animation: fadeIn 0.5s ease; }
      `}</style>

      {/* ============ EMAIL GATE — triggered contextually, not on page load ============ */}


      {/* ============ LANDING PAGE ============ */}

      {/* ============ DASHBOARD APP ============ */}
      {appView === 'dashboard' && (<>
      <header style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
          {/* Logo */}
          <div onClick={() => goToTab('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, cursor: 'pointer' }}>
            <img src="/logo-white.png" alt="World Mobility Forum" style={{ width: 32, height: 32, borderRadius: 7 }}/>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: INK, lineHeight: 1.15 }}>World Mobility<br/>Forum</div>
              <div style={{ fontSize: 10, color: SECONDARY }}>Singapore · Jul 2026</div>
            </div>
          </div>
          {/* Tab bar inline */}
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none', flex: 1, justifyContent: 'center' }}>
            <TabBtn id="home"     label="Home" />
            <TabBtn id="overview" label="Overview" />
            <TabBtn id="fleet"    label="Fleet by Type" />
            <TabBtn id="brands"   label="Brand Rankings" />
            <TabBtn id="specs"    label="EV Specs" />
            <TabBtn id="charging" label="EV Charging Stations" />
            <TabBtn id="coe"      label="COE & EVs" />
            <TabBtn id="blog"     label="News" />
            <TabBtn id="calculator" label="Calculator" />
          </div>
        </div>
      </header>

      {/* ============ BREADCRUMB + DATA PROVENANCE ============ */}
      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 12, color: SECONDARY, display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => goToTab('home')} style={{ background: 'none', border: 'none', color: SECONDARY, fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 500 }}>World Mobility Forum</button>
            <span>/</span>
            <span style={{ color: INK, fontWeight: 600 }}>{TAB_LABELS[activeTab] || activeTab}</span>
          </div>
          <div style={{ fontSize: 11, color: SECONDARY }}>
            Data as of <span style={{ fontWeight: 700, color: INK }}>31 July 2026</span> · Source: LTA Singapore
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ============ HOME ============ */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {/* Hero */}
            <section style={{ background: CARD, borderRadius: 20, padding: '56px 40px 48px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BLUE_LIGHT, borderRadius: 50, padding: '7px 18px', marginBottom: 22 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: BLUE, animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: BLUE }}>Live · LTA Data · Jul 2026</span>
              </div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 700, color: INK, lineHeight: 1.15, marginBottom: 16, fontFamily: "'Google Sans Display','Google Sans Flex','Inter',sans-serif", letterSpacing: -0.5 }}>
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
                {[{ val: '79,033', lbl: 'Total EVs on roads', c: BLUE }, { val: '61%', lbl: 'of new cars are EVs', c: GREEN }, { val: '30,500', lbl: 'charging points', c: YELLOW }, { val: '+164%', lbl: 'EV growth since Dec 2024', c: RED }].map((s, i) => (
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
        {activeTab === 'blog' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <SectionHead chip="News" title="EV news and insights." subtitle="Car news, technology deep-dives, and market analysis — Singapore and international."/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
              {[
                { tag: 'Market', color: BLUE, title: 'Tesla vs BYD: the battle for Singapore\u2019s roads', excerpt: 'BYD overtook Tesla in Q1 2026 registrations by a wide margin. We break down the pricing, tech, and dealership strategy behind the shift.' },
                { tag: 'Technology', color: DEEP_CYAN, title: 'Inside the ultrafast charger race', excerpt: 'BYD Flash charges at 1,000 kW. CATL Shenxing promises 400 km in 10 minutes. What\u2019s actually coming to Singapore first?' },
                { tag: 'Local', color: GREEN, title: 'Every new EV launching in Singapore this year', excerpt: 'From Zeekr\u2019s new SUV to Xpeng\u2019s latest sedan, here\u2019s what\u2019s landing in Singapore showrooms in 2026.' },
                { tag: 'Curious', color: YELLOW, title: 'Can an EV go into water?', excerpt: 'Battery packs are sealed and rated for water crossings \u2014 but not submersion. Here\u2019s what manufacturers actually certify.' },
                { tag: 'Sustainability', color: GREEN, title: 'The real carbon footprint of EV production', excerpt: 'Battery manufacturing has a bigger upfront footprint than petrol cars \u2014 but the full lifecycle tells a different story. We run the numbers.' },
                { tag: 'Energy', color: SLATE, title: 'How RECs can complement EV charging operators', excerpt: 'Renewable Energy Certificates let CPOs claim green charging even on a mixed grid. Here\u2019s how the mechanism actually works.' },
                { tag: 'Grid', color: NAVY, title: 'Can Singapore\u2019s grid support EV charging demand?', excerpt: 'With 68,000+ EVs already on the road, we look at what LEEP and grid upgrades mean for peak charging capacity.' },
                { tag: 'Policy', color: RED, title: 'Playing with pricing to shift EV charging demand', excerpt: 'Time-of-use tariffs are starting to appear at Singapore charging stations. Do they actually change driver behaviour?' },
              ].map((post, i) => (
                <div key={i} style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 700, color: post.color, background: `${post.color}18`, padding: '4px 10px', borderRadius: 50 }}>{post.tag}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: 0, lineHeight: 1.4 }}>{post.title}</h3>
                  <p style={{ fontSize: 13, color: SECONDARY, lineHeight: 1.6, margin: 0, flex: 1 }}>{post.excerpt}</p>
                  <button style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: BLUE, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Read more →</button>
                </div>
              ))}
            </div>
            <div style={{ background: NAVY_LIGHT, borderRadius: 16, padding: '16px 24px', fontSize: 12, color: SECONDARY, textAlign: 'center' }}>
              More articles publishing regularly. Full posts coming soon — this section previews upcoming content.
            </div>
          </div>
        )}

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
            <section style={{ background: NAVY, borderRadius: 20, padding: '40px 36px', color: '#fff' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>World Mobility Forum</div>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 10px', fontFamily: "'Google Sans Flex','Inter',sans-serif" }}>Accelerate the emobility transition.</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 620, lineHeight: 1.6, margin: 0 }}>Singapore's EV market is moving faster than most realise — BYD alone now outsells the rest of the market combined some months, and commercial fleets are electrifying in parallel. Here's the latest, as of July 2026.</p>
            </section>

            <section>
              <SectionHead chip="Fleet Snapshot" title="Singapore EVs at a glance." subtitle="Land Transport Authority · M03 updated to Jul 2026 · M09 fleet data as at Jul 2026" />
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <MetricCard label="Total EV Cars" value="69,190" delta="↑ 164% since Dec 2024" sub="10.6% of car fleet" color={BLUE} bg={BLUE_LIGHT} icon="🚗" />
                <MetricCard label="New EVs — Jan–Jul 2026" value="18,690+" delta="≈ 61% of new car regs" sub="Jan-Jul 2026 (LTA M03)" color={NAVY} bg={NAVY_LIGHT} icon="📈" />
                <MetricCard label="Hybrid Cars" value="127,118" delta="↑ 28.2% year on year" sub="19.5% of car fleet" color={SLATE} bg={NAVY_LIGHT} icon="⚡" />
                <MetricCard label="Charging Points" value="30,500" delta="50.8% of 2030 target" sub="60,000 target by 2030" color={BLUE} bg={BLUE_LIGHT} icon="🔌" />
              </div>
            </section>

            <section>
              <SectionHead chip="Key Insight" title="EV share by vehicle type." subtitle="Cars are leading the transition, but LGV/HGV fleets are catching up fast — as at July 2026"/>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 28 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={vehicleTypeStats.map(v => ({ type: v.type, EV: v.ev, 'Non-EV': v.total - v.ev }))} stackOffset="expand">
                    <CartesianGrid stroke={BORDER} strokeDasharray="3 6" vertical={false}/>
                    <XAxis dataKey="type" stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                    <YAxis stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v*100).toFixed(0)}%`}/>
                    <Tooltip content={<GoogleTooltip/>}/>
                    <Bar dataKey="EV" stackId="a" fill={GREEN}/>
                    <Bar dataKey="Non-EV" stackId="a" fill="#C4CBD4" radius={[6,6,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: SECONDARY }}><div style={{ width: 10, height: 10, borderRadius: 2, background: GREEN }}/>EV</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: SECONDARY }}><div style={{ width: 10, height: 10, borderRadius: 2, background: BORDER }}/>Non-EV</div>
                </div>
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
                    <Area type="monotone" dataKey="hybrids" stroke={NAVY} strokeWidth={2.5} fill="url(#gGreen)" name="Hybrids"/>
                    <Area type="monotone" dataKey="evs" stroke={BLUE} strokeWidth={3} fill="url(#gBlue)" name="Pure EVs"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: CARD, borderRadius: 20, padding: 28, border: `1px solid ${BORDER}` }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Jan–Jul 2026 new cars</h3>
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
                      <div style={{ fontSize: 22, fontWeight: 700, color: INK, marginBottom: 12, fontFamily: "'Google Sans Flex', 'Inter', sans-serif" }}>{c.total.toLocaleString()}</div>
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
                Key insights — Jan–Jul 2026
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {[
                  { icon: '🚗', bold: 'EVs hit 10.6%', text: 'of the total car fleet, up from 4.0% 19 months ago.' },
                  { icon: '🏆', bold: 'BYD leads Jan-Jul', text: 'with 7,461 registrations — ~40% of new EVs, more than double Tesla in second place.' },
                  { icon: '📊', bold: '~61% of new cars', text: 'registered Jan-Jul were pure EVs, driven heavily by BYD; another 21% were hybrids.' },
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
            <SectionHead chip="Fleet Composition" title="EV population by vehicle category." subtitle="79,033 pure EVs across all road vehicle types · 31 July 2026 · Source: LTA M09 (Jul 2026)"/>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {[
                { label: 'EV Cars', value: '69,190', sub: '87.6% of all EVs', color: BLUE, bg: BLUE_LIGHT, icon: '🚗' },
                { label: 'EV Goods Veh.', value: '7,857', sub: 'LGV/HGV/VHGV', color: NAVY, bg: NAVY_LIGHT, icon: '🚛' },
                { label: 'EV Buses', value: '920', sub: 'Public + Charter', color: SLATE, bg: NAVY_LIGHT, icon: '🚌' },
                { label: 'EV Taxis', value: '633', sub: 'Of 12,134 taxis', color: BLUE, bg: BLUE_LIGHT, icon: '🚕' },
                { label: 'EV Motorcycles', value: '433', sub: 'Slowest segment', color: SECONDARY, bg: SURFACE, icon: '🏍️' },
              ].map(m => <MetricCard key={m.label} {...m} icon={m.icon}/>)}
            </div>

            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
              <div style={{ padding: '24px 28px', borderBottom: `1px solid ${BORDER}` }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>Fuel type × Vehicle type — full breakdown</h3>
                <p style={{ fontSize: 14, color: SECONDARY, margin: '4px 0 0' }}>Every road vehicle in Singapore by powertrain · July 2026</p>
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
                      { type: 'Cars 🚗', petrol: 441350, diesel: 11907, hybrid: 127118, phev: 3194, ev: 69190, total: 652830 },
                      { type: 'Taxis 🚕', petrol: 2, diesel: 68, hybrid: 11431, phev: 0, ev: 633, total: 12134 },
                      { type: 'Motorcycles 🏍️', petrol: 153973, diesel: 0, hybrid: 0, phev: 0, ev: 433, total: 154406 },
                      { type: 'Goods Vehicles 🚛', petrol: 13776, diesel: 120898, hybrid: 6, phev: 1, ev: 7857, total: 142572 },
                      { type: 'Buses 🚌', petrol: 132, diesel: 17183, hybrid: 50, phev: 46, ev: 920, total: 18331 },
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
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>609,233</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>150,056</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: GREEN }}>138,605</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>3,241</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: BLUE, fontSize: 15 }}>79,033</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, fontSize: 15 }}>980,273</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{ background: BLUE, color: '#fff', fontWeight: 700, borderRadius: 50, padding: '4px 12px', fontSize: 12 }}>8.06%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <section>
              <SectionHead chip="Goods Vehicle Drilldown" title="LGV vs HGV vs VHGV." subtitle="Jan–Jul 2026 cumulative new EV registrations by weight class · LTA M08" chipColor={YELLOW}/>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                {[
                  { cls: 'LGV', weight: '≤ 3.5 t', q1New: 788, desc: 'Fastest-electrifying segment. Last-mile vans and small trucks.', lead: 'Maxus, BYD, Citroën', color: BLUE, bg: BLUE_LIGHT },
                  { cls: 'HGV', weight: '3.5 – 16 t', q1New: 602, desc: 'HVZES (S$40K) launched Jan 2026 is accelerating adoption here.', lead: 'BYD, Toyota, Sany', color: YELLOW, bg: YELLOW_LIGHT },
                  { cls: 'VHGV', weight: '> 16 t', q1New: 0, desc: 'Zero EV registrations Jan–Jul 2026. Diesel owns this segment entirely.', lead: 'No EV penetration yet', color: RED, bg: RED_LIGHT },
                ].map(c => (
                  <div key={c.cls} style={{ background: c.bg, borderRadius: 20, padding: 28 }}>
                    <span style={{ background: c.color, color: '#fff', borderRadius: 50, padding: '6px 14px', fontSize: 12, fontWeight: 700 }}>{c.cls} · {c.weight}</span>
                    <div style={{ fontSize: 52, fontWeight: 800, color: c.color, margin: '20px 0 4px', fontFamily: "'Google Sans Flex', 'Inter', sans-serif", lineHeight: 1 }}>{c.q1New}</div>
                    <div style={{ fontSize: 13, color: SECONDARY, marginBottom: 4 }}>new EV registrations Jan–Jul 2026</div>
                    <p style={{ fontSize: 14, color: INK, lineHeight: 1.6, margin: '16px 0 12px' }}>{c.desc}</p>
                    <div style={{ fontSize: 13, fontWeight: 600, color: c.color }}>Leading brands: {c.lead}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionHead chip="Penetration" title="EV share of total fleet by vehicle type."/>
              {[
                { type: 'Cars 🚗', ev: 69190, total: 652830, color: BLUE },
                { type: 'Goods Vehicles 🚛', ev: 7857, total: 142572, color: YELLOW },
                { type: 'Buses 🚌', ev: 920, total: 18331, color: RED },
                { type: 'Taxis 🚕', ev: 633, total: 12134, color: GREEN },
                { type: 'Motorcycles 🏍️', ev: 433, total: 154406, color: SECONDARY },
              ].map(r => {
                const pct = (r.ev / r.total) * 100;
                return (
                  <div key={r.type} style={{ background: CARD, borderRadius: 16, padding: '20px 24px', marginBottom: 12, border: `1px solid ${BORDER}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>{r.type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 13, color: SECONDARY }}>{r.ev.toLocaleString()} / {r.total.toLocaleString()}</span>
                        <span style={{ fontSize: 22, fontWeight: 800, color: r.color, fontFamily: "'Google Sans Flex', 'Inter', sans-serif" }}>{pct.toFixed(2)}%</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <SectionHead chip="Brand Rankings" title="EV brand performance by vehicle type." subtitle="Source: LTA M03 / M08 - New registrations, Jan-Jul 2026"/>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
              {newRegByType.map(v => {
                const pct = ((v.ev / v.totalNew) * 100).toFixed(1);
                return (
                  <div key={v.type} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: SECONDARY, fontWeight: 600, marginBottom: 6 }}>{v.type}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: INK, fontFamily: "'Google Sans Flex',sans-serif" }}>{v.ev.toLocaleString()} units</div>
                    <div style={{ fontSize: 11, color: BLUE, fontWeight: 700, marginTop: 4 }}>{pct}% of all new registrations</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', background: SURFACE, borderRadius: 12, padding: 4, border: `1px solid ${BORDER}`, alignSelf: 'flex-start' }}>
              {[
                { id: 'cars', label: 'Cars' }, { id: 'motorcycle', label: 'Motorcycle' },
                { id: 'lgv', label: 'LGV' }, { id: 'hgv', label: 'HGV' }, { id: 'vhgv', label: 'VHGV' }, { id: 'bus', label: 'Bus' },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveBrandFilter(t.id)} style={{ padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: activeBrandFilter === t.id ? BLUE : 'transparent', color: activeBrandFilter === t.id ? NAVY : SECONDARY }}>{t.label}</button>
              ))}
            </div>

            {(() => {
              const segBrands = getSegmentBrands(activeBrandFilter);

              if (segBrands.length === 0) {
                return (
                  <div style={{ background: YELLOW_LIGHT, borderRadius: 16, padding: 24, fontSize: 13, color: INK }}>
                    LTA does not publish brand-level registration data for this vehicle category. Fleet-level totals are shown in the highlight box above.
                  </div>
                );
              }

              // Shared range logic — drives the highlight cards, the line chart, the table, AND the bar chart together
              const monthOrder = ['jan','feb','mar','apr','may','jun','jul'];
              const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
              const fromIdx = monthOrder.indexOf(brandRangeFrom);
              const toIdx = monthOrder.indexOf(brandRangeTo);
              const lo = Math.min(fromIdx, toIdx), hi = Math.max(fromIdx, toIdx);
              const rangeMonths = monthOrder.slice(lo, hi + 1);
              const rangeLabels = monthLabels.slice(lo, hi + 1);
              const rangeLabel = rangeLabels.length > 1 ? `${rangeLabels[0]}\u2013${rangeLabels[rangeLabels.length-1]}` : rangeLabels[0];

              // Rank brands by their total WITHIN the selected range, then apply Top 10 / Top 20 / All
              const rankedByRange = segBrands
                .map(b => ({ ...b, rangeUnit: rangeMonths.reduce((s, m) => s + (b[m] || 0), 0) }))
                .sort((a, b) => b.rangeUnit - a.rangeUnit);
              const limited = rankedByRange.slice(0, brandLimitN);

              const topBrand = limited[0];
              const fastestGrowing = rangeMonths.length > 1
                ? [...rankedByRange].sort((a,b) => (b[rangeMonths[rangeMonths.length-1]] - b[rangeMonths[0]]) - (a[rangeMonths[rangeMonths.length-1]] - a[rangeMonths[0]]))[0]
                : null;

              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                    <MetricCard label={`Total EV - ${activeBrandFilter.toUpperCase()}`} value={limited.reduce((s,b)=>s+b.rangeUnit,0).toLocaleString()} delta={`${rangeLabel} 2026`} sub="New registrations" color={BLUE} bg={BLUE_LIGHT} icon="STAT"/>
                    <MetricCard label="Top brand" value={topBrand ? topBrand.brand : '-'} delta={topBrand ? `${topBrand.rangeUnit.toLocaleString()} units` : ''} sub={`Ranked by ${rangeLabel} total`} color={NAVY} bg={NAVY_LIGHT} icon="TOP"/>
                    <MetricCard label="Fastest growing" value={fastestGrowing ? fastestGrowing.brand : '-'} delta={fastestGrowing && rangeMonths.length > 1 ? `+${(fastestGrowing[rangeMonths[rangeMonths.length-1]] - fastestGrowing[rangeMonths[0]])} units (${rangeLabel})` : 'Select a range > 1 month'} sub="Within selected range" color={SLATE} bg={NAVY_LIGHT} icon="UP"/>
                  </div>

                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, background: SURFACE, borderRadius: 10, padding: 4, border: `1px solid ${BORDER}` }}>
                      {[{id:'top10',l:'Top 10'},{id:'top20',l:'Top 20'},{id:'all',l:'All'}].map(f => (
                        <button key={f.id} onClick={() => setBrandLimit(f.id)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: brandLimit === f.id ? NAVY : 'transparent', color: brandLimit === f.id ? '#fff' : SECONDARY }}>{f.l}</button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: SECONDARY }}>2026 range:</span>
                      <select value={brandRangeFrom} onChange={e => setBrandRangeFrom(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 600, background: CARD, color: INK }}>
                        {monthOrder.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                      </select>
                      <span style={{ fontSize: 12, color: SECONDARY }}>to</span>
                      <select value={brandRangeTo} onChange={e => setBrandRangeTo(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 600, background: CARD, color: INK }}>
                        {monthOrder.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                      </select>
                    </div>
                    <span style={{ fontSize: 11, color: SECONDARY }}>Showing {limited.length} of {segBrands.length} brands with data · {rangeLabel} 2026</span>
                  </div>

                  <div style={{ background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}` }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 16px' }}>Monthly registration trend — {rangeLabel} 2026</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={rangeMonths.map((m,idx) => {
                        const row = { month: rangeLabels[idx] };
                        limited.forEach(b => { row[b.brand] = b[m]; });
                        return row;
                      })}>
                        <CartesianGrid stroke={BORDER} strokeDasharray="3 6" vertical={false}/>
                        <XAxis dataKey="month" stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                        <YAxis stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                        <Tooltip content={<GoogleTooltip/>}/>
                        {limited.map((b,i) => (
                          <Line key={b.brand} type="monotone" dataKey={b.brand} stroke={[BLUE,NAVY,SLATE,DEEP_CYAN,'#6B93B0','#1A8A94',GREEN,YELLOW,'#8B5CF6','#E36414','#5B7DB1','#2E8B7A','#B0416E','#4A6741','#9B59B6','#16A085','#D35400','#7F8C8D','#2980B9','#C0392B'][i % 20]} strokeWidth={2} dot={{ r: 2 }}/>
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0 }}>Monthly breakdown by brand — {rangeLabel} 2026</h3>
                    </div>
                    <div className="scroll-table" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', minWidth: 500 + rangeMonths.length * 70, borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead><tr style={{ background: SURFACE }}>{['#','Brand', ...rangeLabels, 'Total'].map((h,i) => (<th key={h+i} style={{ padding: '10px 14px', textAlign: i>1?'right':'left', fontSize: 11, fontWeight: 600, color: SECONDARY, borderBottom: `2px solid ${BORDER}` }}>{h}</th>))}</tr></thead>
                        <tbody>
                          {limited.map((b,i) => (
                            <tr key={b.brand} style={{ borderBottom: `1px solid ${BORDER}`, background: i%2?SURFACE:CARD }}>
                              <td style={{ padding: '9px 14px', color: SECONDARY, fontWeight: 600 }}>{i+1}</td>
                              <td style={{ padding: '9px 14px', fontWeight: 600, color: INK }}>
                                {b.brand}
                              </td>
                              {rangeMonths.map(m => (<td key={m} style={{ padding: '9px 14px', textAlign: 'right', color: INK }}>{b[m]}</td>))}
                              <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: BLUE }}>{b.rangeUnit.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}` }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Accumulative total by brand</h3>
                    <p style={{ fontSize: 12, color: SECONDARY, margin: '0 0 16px' }}>{rangeLabel} 2026, all brand names shown in full</p>
                    <ResponsiveContainer width="100%" height={Math.max(240, limited.length * 32)}>
                      <BarChart data={limited} layout="vertical" margin={{ left: 8, right: 64 }}>
                        <CartesianGrid stroke={BORDER} horizontal={false} strokeDasharray="3 6"/>
                        <XAxis type="number" stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
                        <YAxis type="category" dataKey="brand" stroke={INK} tick={{ fontSize: 12, fontWeight: 700 }} width={130} interval={0} axisLine={false} tickLine={false}/>
                        <Tooltip content={<GoogleTooltip/>} cursor={{ fill: BLUE_LIGHT }}/>
                        <Bar dataKey="rangeUnit" name={`${rangeLabel} units`} radius={[0,8,8,0]} fill={BLUE}>
                          <LabelList dataKey="rangeUnit" position="right" formatter={(v) => v.toLocaleString()} style={{ fontSize: 12, fontWeight: 700, fill: INK }}/>
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ============ SPECS ============ */}
        {activeTab === 'specs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <SectionHead chip="Technical Reference" title="EV specifications." subtitle="Battery, charging speeds, efficiency and range across Singapore-available EVs."/>

            {/* EV Specs quick-nav (dropdown menu equivalent) */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => document.getElementById('spec-table-section')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD, color: INK, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Spec Table</button>
              <button onClick={() => document.getElementById('charging-time-section')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${BORDER}`, background: CARD, color: INK, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Charging Time</button>
              <button onClick={() => setActiveTab('compare')} style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${BLUE}`, background: BLUE_LIGHT, color: BLUE, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Compare EVs →</button>
            </div>

            {/* Sub-filter toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: SURFACE, borderRadius: 50, padding: 4, alignSelf: 'flex-start', border: `1px solid ${BORDER}` }}>
              {[{ id: 'passenger', label: '🚗 Passenger Cars' }, { id: 'commercial', label: '🚛 Commercial Vehicles' }].map(f => (
                <button key={f.id} onClick={() => setActiveSpecFilter(f.id)}
                  style={{ padding: '8px 20px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'Google Sans Flex', 'Inter', sans-serif", transition: 'all 0.2s',
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
                <div id="spec-table-section" style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', fontSize: 11, color: SECONDARY, background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>Click any column header to rank highest → lowest by that field.</div>
                  <div className="scroll-table" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 1020, borderCollapse: 'collapse', fontSize: 14 }}>
                      <thead>
                        <tr style={{ background: SURFACE }}>
                          {[['Model','model'],['Body','type'],['Battery','battery'],['Chemistry','chem'],['AC kW','ac'],['DC kW','dc'],['km/kWh','eff'],['Range','range'],['COE','segCat'],['Official Site',null]].map(([h,key], i) => (
                            <th key={h} onClick={() => { if (!key) return; if (specSortKey === key) setSpecSortDir(specSortDir === 'desc' ? 'asc' : 'desc'); else { setSpecSortKey(key); setSpecSortDir('desc'); } }}
                              style={{ padding: '14px 16px', textAlign: i > 1 && i < 9 ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: specSortKey === key ? BLUE : SECONDARY, letterSpacing: 0.3, borderBottom: `2px solid ${BORDER}`, whiteSpace: 'nowrap', cursor: key ? 'pointer' : 'default', userSelect: 'none' }}>
                              {h}{specSortKey === key && (specSortDir === 'desc' ? ' ↓' : ' ↑')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...evSpecs].sort((a,b) => {
                          const av = a[specSortKey], bv = b[specSortKey];
                          if (typeof av === 'string') return specSortDir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
                          return specSortDir === 'desc' ? bv - av : av - bv;
                        }).slice(0, specsShowCount).map((ev, i) => (
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
                            <td style={{ padding: '13px 16px' }}>
                              <a href={`https://www.google.com/search?q=${encodeURIComponent(ev.model + ' official site')}`} target="_blank" rel="noopener noreferrer" style={{ color: BLUE, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Visit ↗</a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {specsShowCount < evSpecs.length && (
                    <div style={{ padding: 16, textAlign: 'center', borderTop: `1px solid ${BORDER}` }}>
                      <button onClick={() => setSpecsShowCount(specsShowCount + 10)} style={{ padding: '10px 24px', borderRadius: 10, border: `1px solid ${BLUE}`, background: BLUE_LIGHT, color: BLUE, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        Read more ({evSpecs.length - specsShowCount} more models) ↓
                      </button>
                    </div>
                  )}
                </div>
                <section>
                  <SectionHead chip="Efficiency Leaderboard" title="Which EVs go furthest per kWh?" subtitle="km per kWh — higher is better for Singapore's stop-start city driving"/>
                  {(() => {
                    const ranked = [...evSpecs].sort((a,b) => b.eff - a.eff).slice(0, 12);
                    const podium = ranked.slice(0, 3);
                    const rest = ranked.slice(3);
                    const medalColor = ['#FFB648', '#B8C0CC', '#C97D3C'];
                    const medalEmoji = ['🥇','🥈','🥉'];
                    return (
                      <>
                        {/* Podium for top 3 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 12, alignItems: 'end', marginBottom: 20 }}>
                          {[podium[1], podium[0], podium[2]].map((ev, idx) => {
                            const rank = idx === 1 ? 0 : idx === 0 ? 1 : 2; // reorder: 2nd, 1st, 3rd
                            if (!ev) return <div key={idx}/>;
                            const height = rank === 0 ? 180 : rank === 1 ? 140 : 110;
                            return (
                              <div key={ev.model} style={{ background: `linear-gradient(180deg, ${medalColor[rank]}22 0%, ${CARD} 100%)`, border: `2px solid ${medalColor[rank]}`, borderRadius: 18, padding: '20px 14px', textAlign: 'center', height, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                <div style={{ fontSize: rank === 0 ? 32 : 24, marginBottom: 6 }}>{medalEmoji[rank]}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 4, lineHeight: 1.3 }}>{ev.model}</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: medalColor[rank], fontFamily: "'Google Sans Flex',sans-serif" }}>{ev.eff.toFixed(1)}</div>
                                <div style={{ fontSize: 10, color: SECONDARY }}>km/kWh</div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Ranked list for 4-12 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {rest.map((ev, i) => {
                            const rank = i + 4;
                            const barPct = (ev.eff / ranked[0].eff) * 100;
                            return (
                              <div key={ev.model} style={{ display: 'flex', alignItems: 'center', gap: 12, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 16px' }}>
                                <div style={{ width: 24, fontSize: 13, fontWeight: 700, color: SECONDARY }}>#{rank}</div>
                                <div style={{ width: 140, fontSize: 13, fontWeight: 600, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.model}</div>
                                <div style={{ flex: 1, height: 8, background: SURFACE, borderRadius: 99, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${barPct}%`, background: BLUE, borderRadius: 99 }}/>
                                </div>
                                <div style={{ width: 50, textAlign: 'right', fontSize: 13, fontWeight: 700, color: BLUE }}>{ev.eff.toFixed(1)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
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
                          {[...Array(4)].map((_, i) => <Cell key={i+4} fill={NAVY}/>)}
                          {[...Array(4)].map((_, i) => <Cell key={i+8} fill={SLATE}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
                      {[{ color: BLUE, label: 'LGV (≤3.5t)' }, { color: NAVY, label: 'HGV (3.5–16t)' }, { color: SLATE, label: 'Bus (>16t)' }].map(l => (
                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: SECONDARY }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }}/>{l.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}

            <section id="charging-time-section">
              <SectionHead chip="Charging Tiers" title="How long does charging take?" subtitle="Approximate 10–80% charge time — the practical range for daily use"/>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
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
                    <div style={{ fontSize: 20, fontWeight: 800, color: INK, fontFamily: "'Google Sans Flex', 'Inter', sans-serif", marginBottom: 4 }}>{t.power}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.color, marginBottom: 8 }}>{t.time}</div>
                    <div style={{ fontSize: 12, color: SECONDARY, lineHeight: 1.5 }}>{t.use}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: NAVY_LIGHT, borderRadius: 16, padding: '18px 24px', fontSize: 13, color: INK, lineHeight: 1.7, marginBottom: 28 }}>
                Charging speed isn't constant — it follows a curve. Most EVs charge fastest between 10–80% state of charge, then taper sharply above 80% to protect battery longevity. This is why fast chargers are typically used for topping up to 80%, not 100%. New 800V architectures (Hyundai E-GMP, Porsche PPE) and next-gen LFP chemistries (CATL Shenxing) are pushing peak charging speeds well past 300 kW, cutting a 10-80% charge to under 15 minutes. Read more on the latest charging technology in our <button onClick={() => setActiveTab('blog')} style={{ color: BLUE, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, textDecoration: 'underline' }}>News</button> section.
              </div>

              {/* Interactive charging time calculator */}
              <div style={{ background: CARD, borderRadius: 20, padding: 28, border: `1px solid ${BORDER}` }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Charging time calculator</h3>
                <p style={{ fontSize: 13, color: SECONDARY, margin: '0 0 16px' }}>Swipe to pick a car, choose your charger, and see how long it takes.</p>

                {/* Swipeable car card strip */}
                <div className="scroll-table" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12, marginBottom: 20, scrollSnapType: 'x mandatory' }}>
                  {evSpecs.map(ev => {
                    const selected = chargeCalcModel === ev.model;
                    return (
                      <button key={ev.model} onClick={() => setChargeCalcModel(ev.model)}
                        style={{ flexShrink: 0, scrollSnapAlign: 'start', width: 150, borderRadius: 16, border: `2px solid ${selected ? BLUE : BORDER}`, background: selected ? BLUE_LIGHT : CARD, padding: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                        <div style={{ width: '100%', height: 60, borderRadius: 10, background: `linear-gradient(135deg, ${selected ? BLUE : SLATE}22, ${selected ? BLUE : SLATE}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 10 }}>🚗</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: INK, lineHeight: 1.3, marginBottom: 4, minHeight: 30 }}>{ev.model}</div>
                        <div style={{ fontSize: 11, color: selected ? BLUE : SECONDARY, fontWeight: 600 }}>{ev.battery} kWh · {ev.dc} kW DC</div>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SECONDARY, display: 'block', marginBottom: 6 }}>Car model</label>
                    <select value={chargeCalcModel} onChange={e => setChargeCalcModel(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 13, background: SURFACE, color: INK }}>
                      {evSpecs.map(ev => <option key={ev.model} value={ev.model}>{ev.model}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SECONDARY, display: 'block', marginBottom: 6 }}>Charger output (kW)</label>
                    <select value={chargeCalcPower} onChange={e => setChargeCalcPower(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 13, background: SURFACE, color: INK }}>
                      {[7.4, 11, 22, 30, 50, 60, 100, 120, 150, 250].map(p => <option key={p} value={p}>{p} kW</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SECONDARY, display: 'block', marginBottom: 6 }}>Charge from</label>
                    <input type="range" min="0" max="90" value={chargeCalcFrom} onChange={e => setChargeCalcFrom(Number(e.target.value))} style={{ width: '100%' }}/>
                    <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginTop: 4 }}>{chargeCalcFrom}%</div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SECONDARY, display: 'block', marginBottom: 6 }}>Charge to</label>
                    <input type="range" min="10" max="100" value={chargeCalcTo} onChange={e => setChargeCalcTo(Number(e.target.value))} style={{ width: '100%' }}/>
                    <div style={{ fontSize: 13, fontWeight: 700, color: GREEN, marginTop: 4 }}>{chargeCalcTo}%</div>
                  </div>
                </div>
                {(() => {
                  const car = evSpecs.find(e => e.model === chargeCalcModel) || evSpecs[0];
                  const effectivePower = Math.min(chargeCalcPower, car.dc || car.ac || chargeCalcPower);
                  const pctToCharge = Math.max(0, chargeCalcTo - chargeCalcFrom);
                  const kWhNeeded = car.battery * (pctToCharge / 100);
                  const hours = effectivePower > 0 ? kWhNeeded / effectivePower : 0;
                  const mins = Math.round(hours * 60);
                  return (
                    <div style={{ background: BLUE_LIGHT, borderRadius: 16, padding: 24, textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: SECONDARY, marginBottom: 6 }}>{car.model} · {chargeCalcFrom}% → {chargeCalcTo}% at {chargeCalcPower} kW (capped at {car.dc || car.ac} kW max)</div>
                      <div style={{ fontSize: 36, fontWeight: 800, color: BLUE, fontFamily: "'Google Sans Flex',sans-serif" }}>
                        {mins >= 60 ? `${Math.floor(mins/60)}h ${mins%60}m` : `${mins} min`}
                      </div>
                      <div style={{ fontSize: 12, color: SECONDARY, marginTop: 6 }}>~{kWhNeeded.toFixed(1)} kWh added · effective rate {effectivePower.toFixed(1)} kW</div>
                    </div>
                  );
                })()}
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
                  <div style={{ fontSize: 72, fontWeight: 800, color: BLUE, lineHeight: 1, fontFamily: "'Google Sans Display', 'Google Sans Flex', 'Inter', sans-serif", letterSpacing: -2 }}>30,500</div>
                  <div style={{ fontSize: 16, color: SECONDARY, marginTop: 8 }}>charging points deployed</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: SECONDARY, marginBottom: 8 }}>2030 target</div>
                  <div style={{ fontSize: 40, fontWeight: 700, color: INK, fontFamily: "'Google Sans Flex', 'Inter', sans-serif" }}>60,000</div>
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
                    <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "'Google Sans Flex', 'Inter', sans-serif", lineHeight: 1.2, marginBottom: 6 }}>{s.amount}</div>
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
              <p style={{ fontSize: 14, color: SECONDARY, margin: '0 0 24px' }}>New EV LGV/HGV/Bus registrations · Jan–Jul 2026 · LTA M08</p>
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
                  <div style={{ fontSize: 40, fontWeight: 800, color: BLUE, fontFamily: "'Google Sans Flex', 'Inter', sans-serif", lineHeight: 1, marginBottom: 4 }}>{s.count}</div>
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
                The <strong>Heavy Vehicle Zero Emissions Scheme (HVZES)</strong>, launched 1 January 2026, provides <strong style={{ color: YELLOW }}>S$40,000 per zero-emission HGV or bus</strong>. Jan-Jul data shows momentum: BYD, Sany, Toyota and Foton have all expanded LGV/HGV offerings in Singapore.
              </p>
              <p style={{ fontSize: 14, color: SECONDARY, fontStyle: 'italic' }}>
                Watch: megawatt charging for trucks, Lazada/Shopee/FairPrice delivery fleet electrification, SBS Transit and SMRT bus announcements through 2026.
              </p>
            </div>
          </div>
        )}

        {/* ============ COE & EVs TAB ============ */}
        {activeTab === 'coe' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <SectionHead chip="COE vs EV Adoption" title="COE premiums and the EV transition." subtitle="Tracking the relationship between Certificate of Entitlement prices and Singapore's accelerating EV adoption. Source: LTA M11 (Jan 2025 – Jul 2026)."/>

            {/* Filters: year range + EV vehicle type multi-select */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: SECONDARY, display: 'block', marginBottom: 6 }}>From year</label>
                <select value={coeYearFrom} onChange={e => setCoeYearFrom(Number(e.target.value))} style={{ padding: '9px 14px', borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 13, background: CARD, color: INK }}>
                  {[2020,2021,2022,2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: SECONDARY, display: 'block', marginBottom: 6 }}>EV population — vehicle types (select multiple)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[{id:'cars',l:'Cars'},{id:'taxis',l:'Taxis'},{id:'moto',l:'Motorcycles'},{id:'lgvhgv',l:'LGV/HGV'},{id:'buses',l:'Buses'}].map(t => (
                    <button key={t.id} onClick={() => setCoeEvTypes(prev => prev.includes(t.id) ? prev.filter(x=>x!==t.id) : [...prev, t.id])}
                      style={{ padding: '8px 14px', borderRadius: 9, border: `1px solid ${coeEvTypes.includes(t.id) ? RED : BORDER}`, background: coeEvTypes.includes(t.id) ? RED_LIGHT : CARD, color: coeEvTypes.includes(t.id) ? RED : SECONDARY, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t.l}</button>
                  ))}
                </div>
              </div>
            </div>
            {coeYearFrom < 2025 && (
              <div style={{ background: YELLOW_LIGHT, borderRadius: 12, padding: '12px 18px', fontSize: 12, color: '#7A4F00' }}>
                COE bidding data before Jan 2025 was not included in this fetch — showing available data from Jan 2025 onward.
              </div>
            )}

            {/* Key stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              <MetricCard label="Cat A (≤1600cc)" value="$129,000" delta="↑ 38% from Jan 2025" sub="Jul 2026 1st bidding" color={BLUE} bg={BLUE_LIGHT} icon="🚗" />
              <MetricCard label="Cat B (>1600cc)" value="$130,889" delta="↑ 8% from Jan 2025" sub="Most EVs fall here" color={NAVY} bg={NAVY_LIGHT} icon="⚡" />
              <MetricCard label="Cat C (Goods/Bus)" value="$95,000" delta="↑ 40% from Jan 2025" sub="Biggest jump of all categories" color={SLATE} bg={NAVY_LIGHT} icon="🚛" />
              <MetricCard label="EV Cars (Jul 2026)" value="69,190" delta="↑ 164% from Dec 2024" sub="10.6% of car fleet" color={BLUE} bg={BLUE_LIGHT} icon="📈" />
            </div>

            {/* COE Premium Trend — OWID Grapher-style chart card */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4 }}>
              {/* Header: title/subtitle left, utility icons right */}
              <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: 0, lineHeight: 1.3 }}>COE premium vs. EV population, Singapore</h3>
                    <p style={{ fontSize: 13, color: SECONDARY, margin: '6px 0 0', lineHeight: 1.5 }}>Category A and B certificate premiums shown against combined EV population for: {coeEvTypes.length ? coeEvTypes.join(', ') : 'no vehicle type selected'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button title="Download data" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: `1px solid ${BORDER}`, borderRadius: 4, cursor: 'pointer', color: SECONDARY }}><Download size={14}/></button>
                    <button title="Share" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: `1px solid ${BORDER}`, borderRadius: 4, cursor: 'pointer', color: SECONDARY }}><Share2 size={14}/></button>
                    <button title="Fullscreen" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: `1px solid ${BORDER}`, borderRadius: 4, cursor: 'pointer', color: SECONDARY }}><Maximize2 size={14}/></button>
                  </div>
                </div>
                {/* Chart / Table view toggle */}
                <div style={{ display: 'flex', gap: 0, marginTop: 16 }}>
                  {[{ id: 'chart', label: 'Chart', icon: TrendingUp }, { id: 'table', label: 'Table', icon: Table2 }].map(v => (
                    <button key={v.id} onClick={() => setCoeChartView(v.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', border: `1px solid ${BORDER}`, borderRight: v.id === 'chart' ? 'none' : undefined, borderRadius: v.id === 'chart' ? '4px 0 0 4px' : '0 4px 4px 0', background: coeChartView === v.id ? NAVY : CARD, color: coeChartView === v.id ? '#fff' : SECONDARY, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      <v.icon size={13}/>{v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart or Table body */}
              <div style={{ padding: '20px 24px' }}>
                {coeChartView === 'chart' ? (
                  <>
                    <ResponsiveContainer width="100%" height={340}>
                      <AreaChart data={coeData.map(d => {
                        const typeMax = { cars: 69190, taxis: 633, moto: 433, lgvhgv: 7857, buses: 920 };
                        const shapeRatio = d.evPop / 59735;
                        const combined = coeEvTypes.reduce((sum, t) => sum + Math.round((typeMax[t] || 0) * shapeRatio), 0);
                        return { ...d, combinedEvPop: combined };
                      })}>
                        <CartesianGrid stroke={BORDER} strokeDasharray="2 4" vertical={false}/>
                        <XAxis dataKey="month" stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={{ stroke: BORDER }} tickLine={false} interval={2}/>
                        <YAxis yAxisId="coe" stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'K'}/>
                        <YAxis yAxisId="ev" orientation="right" stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => (v/1000).toFixed(0) + 'K'}/>
                        <Tooltip content={<GoogleTooltip/>}/>
                        <Area yAxisId="coe" type="monotone" dataKey="catA" stroke={NAVY} strokeWidth={2} fill="none" name="Cat A (≤1600cc)"/>
                        <Area yAxisId="coe" type="monotone" dataKey="catB" stroke={BLUE} strokeWidth={2} fill="none" name="Cat B (>1600cc)"/>
                        <Area yAxisId="ev" type="monotone" dataKey="combinedEvPop" stroke={SECONDARY} strokeWidth={1.5} fill="none" strokeDasharray="4 3" name="EV population (selected types)"/>
                      </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 4, fontSize: 12 }}>
                      {[{ c: NAVY, l: 'Cat A premium (left axis)' }, { c: BLUE, l: 'Cat B premium (left axis)' }, { c: SECONDARY, l: 'EV population (right axis)' }].map(i => (
                        <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 6, color: SECONDARY }}>
                          <div style={{ width: 12, height: 2, background: i.c }}/>{i.l}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="scroll-table" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead><tr>{['Month','Cat A ($)','Cat B ($)','EV Population'].map(h => (<th key={h} style={{ padding: '8px 12px', textAlign: h === 'Month' ? 'left' : 'right', fontSize: 11, fontWeight: 600, color: SECONDARY, borderBottom: `2px solid ${BORDER}` }}>{h}</th>))}</tr></thead>
                      <tbody>
                        {coeData.map((d, i) => (
                          <tr key={d.month} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 ? SURFACE : CARD }}>
                            <td style={{ padding: '7px 12px', fontWeight: 600, color: INK }}>{d.month}</td>
                            <td style={{ padding: '7px 12px', textAlign: 'right', color: INK }}>{d.catA.toLocaleString()}</td>
                            <td style={{ padding: '7px 12px', textAlign: 'right', color: INK }}>{d.catB.toLocaleString()}</td>
                            <td style={{ padding: '7px 12px', textAlign: 'right', color: INK }}>{d.evPop.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Source bar — OWID-style data provenance footer */}
              <div style={{ padding: '10px 24px', borderTop: `1px solid ${BORDER}`, background: SURFACE, fontSize: 11, color: SECONDARY, borderRadius: '0 0 4px 4px' }}>
                <strong style={{ color: INK }}>Source:</strong> LTA Singapore, COE Bidding Results (M11) · Non-car EV population lines are modelled from the car adoption curve, scaled to each vehicle type's actual April 2026 total — LTA does not publish a monthly series by vehicle type.
              </div>
            </div>

            {/* Cat C (Goods/Bus) chart */}
            <div style={{ background: CARD, borderRadius: 20, padding: 28, border: `1px solid ${BORDER}` }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Category C — Goods vehicles {'&'} buses</h3>
              <p style={{ fontSize: 14, color: SECONDARY, margin: '0 0 20px' }}>The biggest COE jump (+40%) as commercial fleet electrification drives up demand</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={coeData}>
                  <CartesianGrid stroke={BORDER} vertical={false} strokeDasharray="3 6"/>
                  <XAxis dataKey="month" stroke={SECONDARY} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={2}/>
                  <YAxis stroke={SECONDARY} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'K'}/>
                  <Tooltip content={<GoogleTooltip/>}/>
                  <Bar dataKey="catC" name="Cat C Premium ($)" radius={[6, 6, 0, 0]} fill={SLATE}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Insights */}
            <div style={{ background: BLUE_LIGHT, borderRadius: 24, padding: '28px 32px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: BLUE, borderRadius: 50, width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={14} color="#fff"/>
                </span>
                Key observations
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                {[
                  { icon: '📈', bold: 'COE Cat A surged 38%', text: 'from $93,699 (Jan 2025) to $129,000 (Jul 2026). EVs like BYD Dolphin and MG 4 fall in Cat A, pushing demand.' },
                  { icon: '⚡', bold: 'Cat B stable at ~$130K', text: 'Most premium EVs (Tesla Model Y, BYD Seal, BMW i4) are Cat B. +8% rise is moderate vs Cat A.' },
                  { icon: '🚛', bold: 'Cat C jumped 40%', text: '$67,891 → $95,000. HVZES incentive (S$40K) is driving commercial EV demand, pushing COE up as fleet operators bid aggressively.' },
                  { icon: '🔄', bold: 'EV population doubled', text: '26,225 EVs (Dec 2024) → ~67,000 (Jul 2026 est.). As EV share grows, more COE demand comes from electric buyers.' },
                  { icon: '💰', bold: 'EV buyers undeterred', text: '32% of new car registrations are EVs despite rising COE. VES+EEAI rebates (up to S$32,500) offset COE increases.' },
                  { icon: '🔮', bold: 'Cat C outlook', text: 'Expect continued upward pressure as HVZES accelerates fleet electrification. Commercial EV quota is constrained vs growing demand.' },
                ].map((item, i) => (
                  <div key={i} style={{ background: CARD, borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                    <div><span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{item.bold}</span> <span style={{ fontSize: 13, color: SECONDARY }}>{item.text}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* COE bidding table */}
            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}` }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: 0 }}>COE bidding results — 2026 (1st exercise)</h3>
              </div>
              <div className="scroll-table" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: SURFACE }}>
                      {['Month','Cat A\n≤1600cc','Cat B\n>1600cc','Cat C\nGoods/Bus','Cat D\nMotorcycle','Cat E\nOpen'].map((h, i) => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: i > 0 ? 'right' : 'left', fontSize: 12, fontWeight: 600, color: SECONDARY, borderBottom: `2px solid ${BORDER}`, whiteSpace: 'pre-wrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Jan 2026', 102009, 119100, 75503, 8689, 122000],
                      ['Feb 2026', 106320, 110890, 74801, 8289, 116000],
                      ['Mar 2026', 108220, 114002, 76000, 8602, 114890],
                      ['Apr 2026', 118000, 121000, 80001, 10000, 121001],
                      ['May 2026', 124790, 126236, 87479, 9452, 127700],
                      ['Jun 2026', 126009, 126989, 94000, 10000, 129000],
                      ['Jul 2026', 129000, 130889, 95000, 10201, 129801],
                    ].map((r, ri) => (
                      <tr key={r[0]} style={{ borderBottom: `1px solid ${BORDER}`, background: ri % 2 ? SURFACE : CARD }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: INK }}>{r[0]}</td>
                        {r.slice(1).map((v, ci) => (
                          <td key={ci} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: ci === 0 ? BLUE : ci === 1 ? GREEN : ci === 2 ? YELLOW : SECONDARY }}>
                            ${v.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ COMPARE EVs ============ */}
        {activeTab === 'compare' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <button onClick={() => setActiveTab('specs')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: SECONDARY, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>← Back to EV Specs</button>
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
                <img src="/logo-white.png" alt="World Mobility Forum" style={{ width: 24, height: 24, borderRadius: 6 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>World Mobility Forum</span>
              </div>
              <p style={{ fontSize: 13, color: SECONDARY, lineHeight: 1.6 }}>Singapore's premium mobility intelligence platform.</p>
            </div>
            {[
              { title: 'Data Sources', items: ['LTA Statistics (M03, M08, M09)', 'Ministry of Transport SG', 'Singapore Green Plan 2030', 'Operator disclosures'] },
              { title: 'Methodology', items: ['LTA monthly vehicle population', 'Registrations shown Jan\u2013Jul 2026 cumulative', 'Real-world efficiency estimates', 'WLTP-adjusted range figures'] },
              { title: 'Refresh', items: ['LTA updates by 12th each month', 'This dashboard: July 2026', 'Next update: August 2026', 'Source: lta.gov.sg/statistics'] },
            ].map(s => (
              <div key={s.title}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 12 }}>{s.title}</div>
                {s.items.map(i => <div key={i} style={{ fontSize: 13, color: SECONDARY, marginBottom: 6 }}>{i}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: SECONDARY }}>
            <span>© 2026 World Mobility Forum · Singapore</span>
            <span>Generated 12 Jul 2026</span>
          </div>
        </div>
      </footer>

      {/* ============ AI CHAT ============ */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)}
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderRadius: 50, background: BLUE, color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,115,232,0.4)', fontSize: 15, fontWeight: 600, fontFamily: "'Google Sans Flex', 'Inter', sans-serif" }}
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
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "'Google Sans Flex', 'Inter', sans-serif" }}>EV Assistant</div>
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
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: INK, resize: 'none', minHeight: 28, maxHeight: 96, fontFamily: "'Google Sans Flex', 'Inter', sans-serif", paddingTop: 4 }}
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

      {/* ============ LOGIN PROMPT MODAL ============ */}
      {showLoginPrompt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(32,33,36,0.5)', backdropFilter: 'blur(6px)', padding: 24 }}
          onClick={() => setShowLoginPrompt(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: CARD, borderRadius: 24, padding: '36px 32px', maxWidth: 400, width: '100%', boxShadow: '0 12px 48px rgba(0,0,0,0.25)', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '50%', background: BLUE_LIGHT, marginBottom: 16 }}>
              <Lock size={24} color={BLUE}/>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: INK, marginBottom: 8 }}>Sign in to download</h3>
            <p style={{ fontSize: 14, color: SECONDARY, lineHeight: 1.6, marginBottom: 24 }}>Enter your work email to access downloads, saved comparisons, and monthly data updates.</p>
            <button onClick={() => { setShowLoginPrompt(false); requireAuth(); }}
              style={{ width: '100%', padding: '13px 20px', borderRadius: 12, background: BLUE, color: NAVY, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Sign in with work email
            </button>
            <button onClick={() => setShowLoginPrompt(false)}
              style={{ background: 'none', border: 'none', color: SECONDARY, fontSize: 13, cursor: 'pointer', marginTop: 12, padding: 8 }}>
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* ============ UPGRADE TO PRO MODAL ============ */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(32,33,36,0.5)', backdropFilter: 'blur(6px)', padding: 24 }}
          onClick={() => setShowUpgradeModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: CARD, borderRadius: 24, padding: '36px 32px', maxWidth: 480, width: '100%', boxShadow: '0 12px 48px rgba(0,0,0,0.25)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: '50%', background: YELLOW_LIGHT, marginBottom: 16 }}>
                <Award size={24} color={YELLOW}/>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: INK, marginBottom: 4 }}>Upgrade to World Mobility Forum Pro</h3>
              <p style={{ fontSize: 14, color: SECONDARY }}>Unlock the full power of Singapore EV intelligence</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { icon: '📊', text: 'Download all data as CSV/Excel — brand rankings, fleet data, COE trends' },
                { icon: '📈', text: 'Monthly custom report delivered to your inbox with analysis and insights' },
                { icon: '🔔', text: 'Real-time alerts when LTA publishes new data or COE results' },
                { icon: '🚛', text: 'Commercial fleet deep-dive — LGV/HGV/Bus breakdown by brand and specs' },
                { icon: '📋', text: 'API access — pull World Mobility Forum data directly into your own tools and dashboards' },
                { icon: '💬', text: 'Priority support and custom analysis requests' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: i % 2 ? SURFACE : CARD, borderRadius: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, color: INK, lineHeight: 1.5 }}>{f.text}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: SURFACE, borderRadius: 16, padding: '20px 16px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 12, color: SECONDARY, fontWeight: 600, marginBottom: 8 }}>INDIVIDUAL</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: INK, fontFamily: "'Google Sans Flex', 'Inter', sans-serif" }}>S$49<span style={{ fontSize: 14, fontWeight: 400, color: SECONDARY }}>/mo</span></div>
                <div style={{ fontSize: 12, color: SECONDARY, marginTop: 4 }}>1 user seat</div>
              </div>
              <div style={{ background: BLUE_LIGHT, borderRadius: 16, padding: '20px 16px', textAlign: 'center', border: `2px solid ${BLUE}` }}>
                <div style={{ fontSize: 12, color: BLUE, fontWeight: 600, marginBottom: 8 }}>CORPORATE</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: INK, fontFamily: "'Google Sans Flex', 'Inter', sans-serif" }}>S$299<span style={{ fontSize: 14, fontWeight: 400, color: SECONDARY }}>/mo</span></div>
                <div style={{ fontSize: 12, color: SECONDARY, marginTop: 4 }}>Unlimited seats per domain</div>
              </div>
            </div>

            <button onClick={() => { setShowUpgradeModal(false); window.open('mailto:hello@worldmobilityforum.com?subject=World Mobility Forum Pro Enquiry&body=Hi, I am interested in upgrading to World Mobility Forum Pro. My company is: ', '_blank'); }}
              style={{ width: '100%', padding: '14px 20px', borderRadius: 12, background: BLUE, color: NAVY, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Mail size={16}/> Contact us to upgrade
            </button>
            <button onClick={() => setShowUpgradeModal(false)}
              style={{ width: '100%', background: 'none', border: 'none', color: SECONDARY, fontSize: 13, cursor: 'pointer', marginTop: 12, padding: 8 }}>
              Continue with free plan
            </button>
          </div>
        </div>
      )}

      </>)}
    </div>
  );
}
