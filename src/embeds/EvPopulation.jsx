import React, { useState, useRef, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';
import {
  BLUE, BLUE_LIGHT, NAVY, NAVY_LIGHT, INK, SECONDARY, SURFACE, CARD, BORDER, DEEP_CYAN, SLATE, GREEN, YELLOW,
  popMonthly, popAnnual, ChartNotes, MetricCard,
} from './shared.jsx';

// Standalone /embed/ev-population page (also answers the legacy
// /embed/fleet-breakdown path). Split out of the main dashboard (App.jsx)
// into its own file so a Wix visitor loading this one embed only downloads
// this page's code, not the whole dashboard bundle.
export default function EvPopulation() {
  const [popVeh, setPopVeh] = useState('Cars');
  const [popFrom, setPopFrom] = useState('Jan');
  const [popTo, setPopTo] = useState('Aug');
  const [popFuelMode, setPopFuelMode] = useState('abs');
  const [popEvMode, setPopEvMode] = useState('index');
  const [popYFrom, setPopYFrom] = useState(2015);
  const [popYTo, setPopYTo] = useState(2026);
  const [popFuelOff, setPopFuelOff] = useState(['petrol', 'diesel', 'other']);
  const [popEvOff, setPopEvOff] = useState([]);
  const [popAnnOff, setPopAnnOff] = useState([]);

  const POP_FUELS = [
    { k: 'bev',    l: 'Pure electric',  c: BLUE },
    { k: 'phev',   l: 'Plug-in hybrid', c: DEEP_CYAN },
    { k: 'hybrid', l: 'Hybrid',         c: SLATE },
    { k: 'petrol', l: 'Petrol',         c: '#8A94A0' },
    { k: 'diesel', l: 'Diesel',         c: '#B9C0C9' },
    { k: 'other',  l: 'Other',          c: '#C9CED6' },
  ];
  const POP_VEH = ['Cars', 'Taxis', 'Motorcycles', 'Goods', 'Buses'];
  const POP_VCOL = { Cars: BLUE, Taxis: NAVY, Motorcycles: YELLOW, Goods: SLATE, Buses: GREEN };
  const POP_MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'];
  const POP_YEARS = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026];

  const pRow = (v, m) => popMonthly.find(r => r.v === v && r.m === m);
  const pARow = (v, y) => popAnnual.find(r => r.v === v && r.y === y);
  const fi = POP_MON.indexOf(popFrom), ti = POP_MON.indexOf(popTo);
  const ms = POP_MON.slice(Math.min(fi, ti), Math.max(fi, ti) + 1);
  const lastM = ms[ms.length - 1], firstM = ms[0];
  const cur = pRow(popVeh, lastM), base = pRow(popVeh, firstM);
  const share = (a, b) => b ? (100 * a / b) : 0;

  const yLo = Math.min(popYFrom, popYTo), yHi = Math.max(popYFrom, popYTo);
  const yrs = POP_YEARS.filter(y => y >= yLo && y <= yHi);

  const fuelsOn = POP_FUELS.filter(f => !popFuelOff.includes(f.k));
  const evOn = POP_VEH.filter(v => !popEvOff.includes(v));
  const annOn = POP_VEH.filter(v => !popAnnOff.includes(v));
  const flip = (arr, set, k) => set(arr.includes(k) ? arr.filter(x => x !== k) : [...arr, k]);

  const fuelData = ms.map(m => {
    const r = pRow(popVeh, m), o = { month: m };
    POP_FUELS.forEach(f => { o[f.k] = popFuelMode === 'share' ? +share(r[f.k], r.total).toFixed(2) : r[f.k]; });
    return o;
  });
  const evData = ms.map(m => {
    const o = { month: m };
    POP_VEH.forEach(v => {
      const raw = pRow(v, m).bev, b0 = pRow(v, firstM).bev || 1;
      o[v] = popEvMode === 'index' ? +(100 * raw / b0).toFixed(1) : raw;
    });
    return o;
  });
  const annData = yrs.map(y => {
    const o = { year: y === 2026 ? '2026*' : String(y) };
    POP_VEH.forEach(v => { const r = pARow(v, y); o[v] = r ? r.bev : 0; });
    return o;
  });
  const shareData = POP_VEH.map(v => {
    const r = pRow(v, lastM);
    return { type: v, pct: +share(r.bev, r.total).toFixed(2), ev: r.bev, total: r.total };
  }).sort((a, b) => b.pct - a.pct);

  const PopTip = ({ active, payload, label, unit }) => {
    if (!active || !payload || !payload.length) return null;
    const rows = payload.filter(p => p.value !== null && p.value !== undefined)
                        .slice().sort((a, b) => b.value - a.value);
    return (
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 12px', boxShadow: '0 4px 18px rgba(8,36,75,0.14)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 7 }}>{label}</div>
        {rows.map(p => (
          <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: SECONDARY, marginTop: 3 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: p.color, flexShrink: 0 }}/>
            <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{p.name}</span>
            <span style={{ fontWeight: 700, color: INK }}>
              {unit === 'pct' ? p.value.toFixed(2) + '%' : unit === 'idx' ? p.value.toFixed(1) : p.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const Chip = ({ on, color, label, onClick }) => (
    <button onClick={onClick} aria-pressed={on} style={{
      display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: on ? CARD : SURFACE,
      border: `1px solid ${BORDER}`, borderRadius: 999, padding: '5px 11px 5px 8px',
      fontSize: 13, fontWeight: 600, color: SECONDARY, opacity: on ? 1 : 0.45 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: on ? color : SECONDARY, flex: 'none' }}/>
      {label}
    </button>
  );
  const ModeBtn = ({ on, label, onClick }) => (
    <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
      fontSize: 14, fontWeight: 600, background: on ? NAVY : 'transparent', color: on ? '#fff' : SECONDARY }}>{label}</button>
  );
  const panel = { background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}` };
  const subP  = { fontSize: 14, color: SECONDARY, margin: '0 0 16px', lineHeight: 1.5 };
  const rowF  = { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 };
  const segBox= { display: 'flex', gap: 4, background: SURFACE, borderRadius: 10, padding: 4, border: `1px solid ${BORDER}` };
  const selBox= { padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 14, fontWeight: 600, background: CARD, color: INK };

  // Notify the parent window (e.g. a Wix "Embed Code" element) of this page's actual
  // rendered height, so the parent can resize its container to match exactly —
  // avoids a leftover gap or double scrollbars when filters change how much
  // content is shown.
  const wmfEmbedRef = useRef(null);
  useEffect(() => {
    const el = wmfEmbedRef.current;
    if (!el || typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;
    const sendHeight = () => {
      window.parent.postMessage({ type: 'wmf-resize', height: el.scrollHeight }, '*');
    };
    sendHeight();
    const ro = new ResizeObserver(sendHeight);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wmfEmbedRef} className="wmf-embed-wrap" style={{ background: 'transparent', fontFamily: "'Google Sans Flex', 'Inter', system-ui, sans-serif", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: transparent; }
        .wmf-embed-wrap { max-width: 1180px; margin: 0 auto; padding: 24px 32px 56px; }
        @media (max-width: 720px) { .wmf-embed-wrap { padding: 20px 16px 40px; } }
      `}</style>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0 }}>EV population by vehicle type.</h2>
        <p style={{ fontSize: 14, color: SECONDARY, margin: '4px 0 0' }}>
          {pRow('Cars', lastM).bev.toLocaleString()} electric cars of {pRow('Cars', lastM).total.toLocaleString()} {'\u00b7'} as at 31 {lastM} 2026 {'\u00b7'} Source: LTA M09 (monthly) &amp; MVP01-4 (annual)
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', background: SURFACE, borderRadius: 12, padding: 4, border: `1px solid ${BORDER}`, width: 'fit-content', maxWidth: '100%' }}>
          {POP_VEH.map(v => (
            <button key={v} onClick={() => setPopVeh(v)} style={{ padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, background: popVeh === v ? BLUE : 'transparent', color: popVeh === v ? NAVY : SECONDARY }}>{v}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: SECONDARY }}>2026 range:</span>
            <select value={popFrom} onChange={e => setPopFrom(e.target.value)} style={selBox}>
              {POP_MON.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span style={{ fontSize: 14, color: SECONDARY }}>to</span>
            <select value={popTo} onChange={e => setPopTo(e.target.value)} style={selBox}>
              {POP_MON.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <span style={{ fontSize: 13, color: SECONDARY }}>Population as at 31 {lastM} 2026 · {ms.length} month{ms.length > 1 ? 's' : ''} shown</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16 }}>
          <MetricCard label={`Pure EV - ${popVeh}`} value={cur.bev.toLocaleString()}
            delta={`${cur.bev - base.bev >= 0 ? '+' : ''}${(cur.bev - base.bev).toLocaleString()} since ${firstM}`}
            sub={`On the road, 31 ${lastM} 2026`} color={BLUE} bg={BLUE_LIGHT} icon="EV"/>
          <MetricCard label="EV share of fleet" value={`${share(cur.bev, cur.total).toFixed(2)}%`}
            delta={`${share(cur.bev, cur.total) - share(base.bev, base.total) >= 0 ? '+' : ''}${(share(cur.bev, cur.total) - share(base.bev, base.total)).toFixed(2)} pts`}
            sub={`of ${cur.total.toLocaleString()} ${popVeh.toLowerCase()}`} color={NAVY} bg={NAVY_LIGHT} icon="PCT"/>
          <MetricCard label="Hybrid" value={cur.hybrid.toLocaleString()}
            delta={`${share(cur.hybrid, cur.total).toFixed(1)}% of fleet`}
            sub="Petrol- and diesel-electric" color={SLATE} bg={NAVY_LIGHT} icon="HYB"/>
          <MetricCard label="Petrol + diesel" value={(cur.petrol + cur.diesel).toLocaleString()}
            delta={`${((cur.petrol + cur.diesel) - (base.petrol + base.diesel)).toLocaleString()} since ${firstM}`}
            sub={`${share(cur.petrol + cur.diesel, cur.total).toFixed(1)}% of fleet`} color={SECONDARY} bg={SURFACE} icon="ICE"/>
        </div>

        <div style={panel}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Fleet by fuel type {'—'} {popVeh}, 2026</h3>
          <p style={subP}>
            How {popVeh.toLowerCase()} on the road break down by powertrain, month by month. Pure EVs went from{' '}
            <strong style={{ color: INK }}>{base.bev.toLocaleString()}</strong> to <strong style={{ color: INK }}>{cur.bev.toLocaleString()}</strong>{' '}
            while petrol and diesel fell by <strong style={{ color: INK }}>{((base.petrol + base.diesel) - (cur.petrol + cur.diesel)).toLocaleString()}</strong>.
            Click a fuel below to hide it {'—'} dropping petrol rescales the axis so the smaller lines become readable.
          </p>
          <div style={rowF}>
            <div style={segBox}>
              <ModeBtn on={popFuelMode === 'abs'} label="Vehicles" onClick={() => setPopFuelMode('abs')}/>
              <ModeBtn on={popFuelMode === 'share'} label="Share of fleet" onClick={() => setPopFuelMode('share')}/>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {POP_FUELS.map(f => (
                <Chip key={f.k} on={!popFuelOff.includes(f.k)} color={f.c} label={f.l}
                  onClick={() => flip(popFuelOff, setPopFuelOff, f.k)}/>
              ))}
            </div>
          </div>
          {fuelsOn.length === 0 ? (
            <div style={{ padding: '36px 8px', textAlign: 'center', fontSize: 14, color: SECONDARY }}>Nothing selected {'—'} click a fuel above to bring it back.</div>
          ) : popFuelMode === 'share' ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={fuelData}>
                <CartesianGrid stroke={BORDER} strokeDasharray="3 6" vertical={false}/>
                <XAxis dataKey="month" stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false}/>
                <YAxis stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} tickFormatter={v => v + '%'}/>
                <Tooltip content={<PopTip unit="pct"/>}/>
                {fuelsOn.map(f => (
                  <Area key={f.k} type="monotone" dataKey={f.k} name={f.l} stackId="fuel" stroke={f.c} fill={f.c} fillOpacity={0.9}/>
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fuelData}>
                <CartesianGrid stroke={BORDER} strokeDasharray="3 6" vertical={false}/>
                <XAxis dataKey="month" stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false}/>
                <YAxis stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString()}/>
                <Tooltip content={<PopTip/>}/>
                {fuelsOn.map(f => (
                  <Line key={f.k} type="monotone" dataKey={f.k} name={f.l} stroke={f.c} strokeWidth={2.5} dot={{ r: 2.5 }}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={panel}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 4px' }}>EV population by vehicle type {'—'} 2026</h3>
          <p style={subP}>Cars dwarf every other category, so the indexed view ({firstM} = 100) is what shows who is actually growing fastest.</p>
          <div style={rowF}>
            <div style={segBox}>
              <ModeBtn on={popEvMode === 'index'} label="Indexed" onClick={() => setPopEvMode('index')}/>
              <ModeBtn on={popEvMode === 'abs'} label="Absolute" onClick={() => setPopEvMode('abs')}/>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {POP_VEH.map(v => (
                <Chip key={v} on={!popEvOff.includes(v)} color={POP_VCOL[v]} label={v}
                  onClick={() => flip(popEvOff, setPopEvOff, v)}/>
              ))}
            </div>
          </div>
          {evOn.length === 0 ? (
            <div style={{ padding: '36px 8px', textAlign: 'center', fontSize: 14, color: SECONDARY }}>Nothing selected {'—'} click a type above to bring it back.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evData}>
                <CartesianGrid stroke={BORDER} strokeDasharray="3 6" vertical={false}/>
                <XAxis dataKey="month" stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false}/>
                <YAxis stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false}
                  domain={popEvMode === 'index' ? ['auto','auto'] : [0,'auto']} tickFormatter={v => v.toLocaleString()}/>
                <Tooltip content={<PopTip unit={popEvMode === 'index' ? 'idx' : undefined}/>}/>
                {evOn.map(v => (
                  <Line key={v} type="monotone" dataKey={v} name={v} stroke={POP_VCOL[v]} strokeWidth={2.5} dot={{ r: 2.5 }}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={panel}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 4px' }}>EV share of the fleet by vehicle type {'—'} 31 {lastM} 2026</h3>
          <p style={subP}>Pure EVs as a percentage of every vehicle of that type on Singapore roads.</p>
          <ResponsiveContainer width="100%" height={Math.max(240, shareData.length * 46)}>
            <BarChart data={shareData} layout="vertical" margin={{ left: 8, right: 70 }}>
              <CartesianGrid stroke={BORDER} horizontal={false} strokeDasharray="3 6"/>
              <XAxis type="number" stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} tickFormatter={v => v + '%'}/>
              <YAxis type="category" dataKey="type" stroke={INK} tick={{ fontSize: 14, fontWeight: 600 }} width={96} axisLine={false} tickLine={false}/>
              <Tooltip cursor={{ fill: BLUE_LIGHT }} content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 12px', boxShadow: '0 4px 18px rgba(8,36,75,0.14)' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{d.type}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginTop: 4 }}>{d.pct.toFixed(2)}% electric</div>
                    <div style={{ fontSize: 13, color: SECONDARY, marginTop: 3 }}>{d.ev.toLocaleString()} of {d.total.toLocaleString()}</div>
                  </div>
                );
              }}/>
              <Bar dataKey="pct" name="EV share" radius={[0,8,8,0]}>
                {shareData.map(d => <Cell key={d.type} fill={POP_VCOL[d.type]}/>)}
                <LabelList dataKey="pct" position="right" formatter={v => v.toFixed(2) + '%'} style={{ fontSize: 14, fontWeight: 700, fill: INK }}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={panel}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 4px' }}>The adoption curve {'—'} EV population 2015 to 2026</h3>
          <p style={subP}>
            Eleven years of annual year-end population, plus the current position. Cars went from{' '}
            <strong style={{ color: INK }}>1</strong> EV in 2015 to <strong style={{ color: INK }}>{pARow('Cars', 2026).bev.toLocaleString()}</strong> today.
          </p>
          <div style={rowF}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: SECONDARY }}>Years:</span>
              <select value={popYFrom} onChange={e => setPopYFrom(Number(e.target.value))} style={selBox}>
                {POP_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <span style={{ fontSize: 14, color: SECONDARY }}>to</span>
              <select value={popYTo} onChange={e => setPopYTo(Number(e.target.value))} style={selBox}>
                {POP_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {POP_VEH.map(v => (
                <Chip key={v} on={!popAnnOff.includes(v)} color={POP_VCOL[v]} label={v}
                  onClick={() => flip(popAnnOff, setPopAnnOff, v)}/>
              ))}
            </div>
          </div>
          {annOn.length === 0 ? (
            <div style={{ padding: '36px 8px', textAlign: 'center', fontSize: 14, color: SECONDARY }}>Nothing selected {'—'} click a type above to bring it back.</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={annData}>
                <CartesianGrid stroke={BORDER} strokeDasharray="3 6" vertical={false}/>
                <XAxis dataKey="year" stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false}/>
                <YAxis stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString()}/>
                <Tooltip content={<PopTip/>}/>
                {annOn.map(v => (
                  <Line key={v} type="monotone" dataKey={v} name={v} stroke={POP_VCOL[v]} strokeWidth={2.5} dot={{ r: 2.5 }}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: 0 }}>Fuel type {'×'} vehicle type {'—'} 31 {lastM} 2026</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ background: SURFACE }}>
                {['Vehicle type', ...POP_FUELS.map(f => f.l), 'Total', 'EV %'].map((h, i) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: i === 0 ? 'left' : 'right', fontSize: 13, fontWeight: 600, color: SECONDARY, borderBottom: `2px solid ${BORDER}` }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {POP_VEH.map((v, i) => {
                  const r = pRow(v, lastM);
                  return (
                    <tr key={v} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 ? SURFACE : CARD }}>
                      <td style={{ padding: '9px 14px', fontWeight: 600, color: INK }}>{v}</td>
                      {POP_FUELS.map(f => (
                        <td key={f.k} style={{ padding: '9px 14px', textAlign: 'right', color: SECONDARY }}>{r[f.k].toLocaleString()}</td>
                      ))}
                      <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 600, color: INK }}>{r.total.toLocaleString()}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: BLUE }}>{share(r.bev, r.total).toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ChartNotes>
            Population, not registrations: vehicles on the road at each period end, excluding tax-exempt and off-the-road (RU) vehicles.
            2015{'–'}2025 from LTA Annual Vehicle Statistics (MVP01-4); 2026 is as at 31 {lastM} from LTA Monthly Vehicle Statistics (M09)
            and is a part-year position, not a year end. "Hybrid" combines petrol-electric and diesel-electric; "Plug-in hybrid" combines both plug-in variants.
          </ChartNotes>
        </div>
      </div>
    </div>
  );
}
