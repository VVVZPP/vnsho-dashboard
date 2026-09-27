import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';
import { BLUE, SLATE, INK, SECONDARY, SURFACE, CARD, BORDER, NAVY, ChartNotes } from './shared.jsx';
import { fuelMix, FUEL_MONTHS } from './fuelMix.js';

// EV vs non-EV: how far electric has pulled ahead of (or behind) every other powertrain,
// by volume and by share, for the segment, month range and Top-N selected on the page.
// Non-EV is split into hybrids (incl. plug-in) and petrol/diesel so the reader can see
// what EVs are actually displacing. Colour = entity (EV is the only saturated hue).
const GREY = '#98A6B5';
const SERIES = [
  { key: 'ev',  label: 'Fully electric',           color: BLUE },
  { key: 'hyb', label: 'Hybrid & plug-in hybrid',  color: SLATE },
  { key: 'ice', label: 'Petrol / diesel',          color: GREY },
];
const SEG_NAME = { cars: 'car', motorcycle: 'motorcycle', lgv: 'LGV', hgv: 'HGV', vhgv: 'VHGV', bus: 'bus' };
const fmt = (n) => n.toLocaleString();
const pct = (x, d = 1) => `${(x * 100).toFixed(d)}%`;

function Toggle({ value, onChange }) {
  return (
    <div role="group" aria-label="Measure" style={{ display: 'flex', gap: 4, background: SURFACE, borderRadius: 10, padding: 4, border: `1px solid ${BORDER}` }}>
      {[{ id: 'units', l: 'Units' }, { id: 'share', l: 'Market share' }].map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} aria-pressed={value === o.id}
          style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                   background: value === o.id ? NAVY : 'transparent', color: value === o.id ? '#fff' : SECONDARY }}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Kpi({ label, value, sub, accent }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px', borderLeft: `3px solid ${accent}` }}>
      <div style={{ fontSize: 12, color: SECONDARY, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: INK, lineHeight: 1.15 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: SECONDARY, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function EvVsIce({ seg, months, labels, rangeLabel, limitN }) {
  const [mode, setMode] = useState('units');
  const [rankBy, setRankBy] = useState('ev');
  const [narrow, setNarrow] = useState(typeof window !== 'undefined' && window.innerWidth < 600);
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth < 600);
    window.addEventListener('resize', on); return () => window.removeEventListener('resize', on);
  }, []);
  const data = fuelMix[seg];
  if (!data || !months.length) return null;
  const idx = months.map(m => FUEL_MONTHS.indexOf(m)).filter(i => i >= 0);
  const sum = (arr) => idx.reduce((s, i) => s + (arr[i] || 0), 0);

  const ev = sum(data.market.ev), hyb = sum(data.market.hyb), ice = sum(data.market.ice);
  const non = hyb + ice, total = ev + non;
  const share = total ? ev / total : 0;
  const present = SERIES.filter(s => sum(data.market[s.key]) > 0 || s.key === 'ev');

  // Headline states the finding, not the topic
  const name = SEG_NAME[seg] || seg;
  let headline;
  if (!total) headline = `No ${name} registrations in ${rangeLabel} 2026`;
  else if (ev === 0) headline = `No fully electric ${name}s were registered in ${rangeLabel} 2026`;
  else if (ev >= non) headline = `Electric ${name}s out-registered every other powertrain combined, ${(non ? ev / non : ev).toFixed(1)} to 1`;
  else headline = `Non-electric ${name}s still outsell electric ones ${(non / ev).toFixed(1)} to 1`;

  const monthly = idx.map((i, k) => {
    const row = { month: labels[k] };
    SERIES.forEach(s => { row[s.key] = data.market[s.key][i] || 0; });
    row.total = row.ev + row.hyb + row.ice;
    return row;
  });
  const first = monthly[0], last = monthly[monthly.length - 1];
  const shareOf = (r) => (r && r.total ? r.ev / r.total : 0);
  const shift = monthly.length > 1 ? (shareOf(last) - shareOf(first)) * 100 : null;

  const brands = data.brands
    .map(b => {
      const r = { brand: b.brand };
      SERIES.forEach(s => { r[s.key] = sum(b[s.key]); });
      r.total = r.ev + r.hyb + r.ice;
      return r;
    })
    .filter(b => (rankBy === 'ev' ? b.ev > 0 : b.total > 0))
    .sort((a, b) => rankBy === 'ev' ? (b.ev - a.ev || b.total - a.total) : (b.total - a.total || b.ev - a.ev));
  const shownBrands = brands.slice(0, limitN);
  const isShare = mode === 'share';

  const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const r = payload[0].payload;
    return (
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 16px rgba(8,36,75,0.10)', minWidth: 210 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 6 }}>{label || r.brand}</div>
        {present.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: SECONDARY, marginTop: 3 }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{s.label}</span>
            <span style={{ fontWeight: 700, color: INK }}>{fmt(r[s.key])}</span>
            <span style={{ minWidth: 44, textAlign: 'right' }}>{r.total ? pct(r[s.key] / r.total) : '–'}</span>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 6, paddingTop: 6, fontSize: 13, color: SECONDARY, display: 'flex' }}>
          <span style={{ flex: 1 }}>All registrations</span><span style={{ fontWeight: 700, color: INK }}>{fmt(r.total)}</span>
        </div>
      </div>
    );
  };

  // Label on the top of each column / end of each bar: EV share (the one number that matters)
  const topKey = present[present.length - 1].key;
  const ShareLabel = ({ x, y, width, height, index, horizontal, rows }) => {
    const r = rows[index];
    if (!r || !r.total) return null;
    const sh = r.ev / r.total;
    const text = sh > 0 && sh < 0.005 ? '<1%' : pct(sh, 0);
    return horizontal
      ? <text x={x + width + 8} y={y + height / 2} dy={4} fontSize={13} fontWeight={700} fill={INK}>{isShare || narrow ? text : `${fmt(r.total)} · ${text} EV`}</text>
      : <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={INK}>{text}</text>;
  };

  const bars = (rows, horizontal) => present.map((s, i) => (
    <Bar key={s.key} dataKey={s.key} name={s.label} stackId="p" fill={s.color} stroke={CARD} strokeWidth={1}
         radius={i === present.length - 1 ? (horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]) : 0} isAnimationActive={false}>
      {s.key === topKey && <LabelList content={(p) => <ShareLabel {...p} horizontal={horizontal} rows={rows} />} />}
    </Bar>
  ));
  const pctTick = (v) => `${Math.round(v * 100)}%`;

  return (
    <div style={{ background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}`, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>EV vs non-EV</div>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: INK, margin: 0, lineHeight: 1.3 }}>{headline}</h3>
          <p style={{ fontSize: 14, color: SECONDARY, margin: '6px 0 0' }}>
            New {name} registrations by powertrain, {rangeLabel} 2026 · {isShare ? 'share of all registrations' : 'number of vehicles'}
          </p>
        </div>
        <Toggle value={mode} onChange={setMode} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr 1fr' : 'repeat(auto-fit,minmax(170px,1fr))', gap: narrow ? 8 : 12, marginBottom: 20 }}>
        <Kpi label="Fully electric" value={fmt(ev)} sub={`${pct(share)} of all registrations`} accent={BLUE} />
        <Kpi label="All other powertrains" value={fmt(non)}
             sub={present.length > 2 ? `${fmt(hyb)} hybrid · ${fmt(ice)} petrol/diesel` : `${pct(1 - share)} of all registrations`} accent={SLATE} />
        <Kpi label="EV lead" value={ev >= non ? `+${fmt(ev - non)}` : `−${fmt(non - ev)}`}
             sub={ev >= non ? 'more EVs than all non-EVs combined' : 'fewer EVs than non-EVs'} accent={ev >= non ? BLUE : GREY} />
        {shift !== null && (
          <Kpi label="EV share shift" value={`${shift >= 0 ? '+' : '−'}${Math.abs(shift).toFixed(1)} pts`}
               sub={`${pct(shareOf(first))} in ${first.month} → ${pct(shareOf(last))} in ${last.month}`} accent={NAVY} />
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
        {present.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: s.color }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: SECONDARY }}>{s.label}</span>
          </div>
        ))}
        <span style={{ fontSize: 13, color: SECONDARY }}>Label = EV share of the month</span>
      </div>

      <h4 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '8px 0 6px' }}>Month by month</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthly} stackOffset={isShare ? 'expand' : 'none'} margin={{ top: 24, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid stroke={BORDER} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="month" stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
          <YAxis stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} width={52}
                 tickFormatter={isShare ? pctTick : (v) => v.toLocaleString()} domain={isShare ? [0, 1] : [0, 'auto']} />
          <Tooltip content={<Tip />} cursor={{ fill: 'rgba(34,200,200,0.08)' }} />
          {bars(monthly, false)}
        </BarChart>
      </ResponsiveContainer>

      <h4 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '22px 0 2px' }}>By brand: how electric is each line-up?</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', margin: '0 0 10px' }}>
        <p style={{ fontSize: 13.5, color: SECONDARY, margin: 0 }}>
          {rankBy === 'ev'
            ? <>Top {shownBrands.length} of {brands.length} brands by <strong style={{ color: INK }}>EV registrations</strong> in {rangeLabel} 2026, same brands as the EV rankings below, with their non-EV sales alongside</>
            : <>Top {shownBrands.length} of {brands.length} brands by <strong style={{ color: INK }}>all registrations</strong> in {rangeLabel} 2026, showing how electric the biggest sellers are</>}
        </p>
        <div role="group" aria-label="Rank brands by" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: SECONDARY }}>Rank by:</span>
          <div style={{ display: 'flex', gap: 4, background: SURFACE, borderRadius: 10, padding: 4, border: `1px solid ${BORDER}` }}>
            {[{ id: 'ev', l: 'EV registrations' }, { id: 'all', l: 'All registrations' }].map(o => (
              <button key={o.id} onClick={() => setRankBy(o.id)} aria-pressed={rankBy === o.id}
                style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                         background: rankBy === o.id ? NAVY : 'transparent', color: rankBy === o.id ? '#fff' : SECONDARY }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(220, shownBrands.length * 32 + 40)}>
        <BarChart data={shownBrands} layout="vertical" stackOffset={isShare ? 'expand' : 'none'} margin={{ left: 0, right: isShare || narrow ? 44 : 120, top: 4, bottom: 4 }} barCategoryGap="24%">
          <CartesianGrid stroke={BORDER} horizontal={false} strokeDasharray="3 6" />
          <XAxis type="number" stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false}
                 tickFormatter={isShare ? pctTick : (v) => v.toLocaleString()} domain={isShare ? [0, 1] : [0, 'auto']} />
          <YAxis type="category" dataKey="brand" stroke={INK} tick={{ fontSize: narrow ? 12 : 14, fontWeight: 600 }} width={narrow ? 110 : 128} interval={0} axisLine={false} tickLine={false} />
          <Tooltip content={<Tip />} cursor={{ fill: 'rgba(34,200,200,0.08)' }} />
          {bars(shownBrands, true)}
        </BarChart>
      </ResponsiveContainer>

      <ChartNotes style={{ marginTop: 14 }} bleed={24} padX={24}>
        New registrations only, not the fleet on the road. Fully electric = LTA fuel type "Electric". Hybrid &amp; plug-in hybrid =
        petrol-electric and diesel-electric, including plug-in. Petrol / diesel includes all other fuel types. Authorised-dealer and
        parallel-import volumes are combined. Source: LTA Monthly Vehicle Statistics (M03 cars, M04 motorcycles, M08 goods vehicles
        and buses), Jan{'–'}Aug 2026.
      </ChartNotes>
    </div>
  );
}
