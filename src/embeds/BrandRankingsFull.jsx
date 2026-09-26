import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, LabelList,
} from 'recharts';
import {
  BLUE, BLUE_LIGHT, NAVY, NAVY_LIGHT, INK, SECONDARY, SURFACE, CARD, BORDER, DEEP_CYAN, SLATE, GREEN, YELLOW, YELLOW_LIGHT,
  getSegmentBrands, GoogleTooltip, MetricCard, ChartNotes,
} from './shared.jsx';

// Standalone /embed/brand-rankings-full page — the entire Brand Rankings
// experience (highlight boxes, segment tabs, key stats, monthly trend,
// monthly table, cumulative-by-make chart). Split out of the main dashboard
// (App.jsx) into its own file so a Wix visitor loading this one embed only
// downloads this page's code, not the whole dashboard bundle.
export default function BrandRankingsFull() {
  const [activeBrandFilter, setActiveBrandFilter] = useState('cars');
  const [brandLimit, setBrandLimit] = useState('top10');
  const [brandRangeFrom, setBrandRangeFrom] = useState('jan');
  const [brandRangeTo, setBrandRangeTo] = useState('jul');
  const [lifeFrom, setLifeFrom] = useState(2023);
  const [lifeTo, setLifeTo] = useState(2026);
  const [lifeLimit, setLifeLimit] = useState('top10');
  const brandLimitN = brandLimit === 'top10' ? 10 : brandLimit === 'top20' ? 20 : 999;

  const newRegByType = [
    { type: 'Cars', segId: 'cars', ev: 20148, totalNew: 32097 },
    { type: 'Motorcycle', segId: 'motorcycle', ev: 49, totalNew: 7547 },
    { type: 'LGV', segId: 'lgv', ev: 788, totalNew: 1189 },
    { type: 'HGV', segId: 'hgv', ev: 602, totalNew: 2111 },
    { type: 'VHGV', segId: 'vhgv', ev: 0, totalNew: 1295 },
    { type: 'Bus', segId: 'bus', ev: 175, totalNew: 319 },
  ];

  const segBrands = getSegmentBrands(activeBrandFilter);

  // Notify the parent window (e.g. a Wix "Embed Code" element) of this page's actual
  // rendered height, so the parent can resize its container to match exactly —
  // avoids double scrollbars when filters change how much content is shown.
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
        <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>World Mobility Forum</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0 }}>EV brand performance by vehicle type.</h2>
        <p style={{ fontSize: 14, color: SECONDARY, margin: '4px 0 0' }}>Source: LTA M03 / M08 - New registrations, Jan-Jul 2026</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 20 }}>
        {newRegByType.map(v => {
          const pct = ((v.ev / v.totalNew) * 100).toFixed(1);
          return (
            <div key={v.type} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ fontSize: 13, color: SECONDARY, fontWeight: 600, marginBottom: 6 }}>{v.type}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: INK, fontFamily: "'Google Sans Flex',sans-serif" }}>{v.ev.toLocaleString()} units</div>
              <div style={{ fontSize: 13, color: BLUE, fontWeight: 700, marginTop: 4 }}>{pct}% of all new registrations</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', background: SURFACE, borderRadius: 12, padding: 4, border: `1px solid ${BORDER}`, alignSelf: 'flex-start', marginBottom: 20 }}>
        {[
          { id: 'cars', label: 'Cars' }, { id: 'motorcycle', label: 'Motorcycle' },
          { id: 'lgv', label: 'LGV' }, { id: 'hgv', label: 'HGV' }, { id: 'vhgv', label: 'VHGV' }, { id: 'bus', label: 'Bus' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveBrandFilter(t.id)} style={{ padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: activeBrandFilter === t.id ? BLUE : 'transparent', color: activeBrandFilter === t.id ? NAVY : SECONDARY }}>{t.label}</button>
        ))}
      </div>

      {segBrands.length === 0 ? (
        <div style={{ background: YELLOW_LIGHT, borderRadius: 16, padding: 24, fontSize: 14, color: INK }}>
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
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 4, background: SURFACE, borderRadius: 10, padding: 4, border: `1px solid ${BORDER}` }}>
                {[{id:'top10',l:'Top 10'},{id:'top20',l:'Top 20'},{id:'all',l:'All'}].map(f => (
                  <button key={f.id} onClick={() => setBrandLimit(f.id)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: brandLimit === f.id ? NAVY : 'transparent', color: brandLimit === f.id ? '#fff' : SECONDARY }}>{f.l}</button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: SECONDARY }}>2026 range:</span>
                <select value={brandRangeFrom} onChange={e => setBrandRangeFrom(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 14, fontWeight: 600, background: CARD, color: INK }}>
                  {monthOrder.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                </select>
                <span style={{ fontSize: 14, color: SECONDARY }}>to</span>
                <select value={brandRangeTo} onChange={e => setBrandRangeTo(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 14, fontWeight: 600, background: CARD, color: INK }}>
                  {monthOrder.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                </select>
              </div>
              <span style={{ fontSize: 13, color: SECONDARY }}>Showing {limited.length} of {segBrands.length} brands · {rangeLabel} 2026</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginBottom: 20 }}>
              <MetricCard label={`Total EV - ${activeBrandFilter.toUpperCase()}`} value={limited.reduce((s,b)=>s+b.rangeUnit,0).toLocaleString()} delta={`${rangeLabel} 2026`} sub="New registrations" color={BLUE} bg={BLUE_LIGHT} icon="STAT"/>
              <MetricCard label="Top brand" value={topBrand ? topBrand.brand : '-'} delta={topBrand ? `${topBrand.rangeUnit.toLocaleString()} units` : ''} sub={`Ranked by ${rangeLabel} total`} color={NAVY} bg={NAVY_LIGHT} icon="TOP"/>
              <MetricCard label="Fastest growing" value={fastestGrowing ? fastestGrowing.brand : '-'} delta={fastestGrowing && rangeMonths.length > 1 ? `+${(fastestGrowing[rangeMonths[rangeMonths.length-1]] - fastestGrowing[rangeMonths[0]])} units (${rangeLabel})` : 'Select a range > 1 month'} sub="Within selected range" color={SLATE} bg={NAVY_LIGHT} icon="UP"/>
            </div>

            <div style={{ background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}`, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 16px' }}>Monthly registration trend {'\u2014'} {rangeLabel} 2026</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={rangeMonths.map((m,idx) => {
                  const row = { month: rangeLabels[idx] };
                  limited.forEach(b => { row[b.brand] = b[m]; });
                  return row;
                })}>
                  <CartesianGrid stroke={BORDER} strokeDasharray="3 6" vertical={false}/>
                  <XAxis dataKey="month" stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false}/>
                  <YAxis stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<GoogleTooltip/>}/>
                  {limited.map((b,i) => (
                    <Line key={b.brand} type="monotone" dataKey={b.brand} stroke={[BLUE,NAVY,SLATE,DEEP_CYAN,'#6B93B0','#1A8A94',GREEN,YELLOW,'#8B5CF6','#E36414','#5B7DB1','#2E8B7A','#B0416E','#4A6741','#9B59B6','#16A085','#D35400','#7F8C8D','#2980B9','#C0392B'][i % 20]} strokeWidth={2} dot={{ r: 2 }}/>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: 0 }}>Monthly breakdown by brand {'\u2014'} {rangeLabel} 2026</h3>
              </div>
               <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 520 }}>
                <table style={{ width: '100%', minWidth: 500 + rangeMonths.length * 70, borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead><tr style={{ background: SURFACE }}>{['#','Brand', ...rangeLabels, 'Total'].map((h,i) => (<th key={h+i} style={{ padding: '10px 14px', textAlign: i>1?'right':'left', fontSize: 13, fontWeight: 600, color: SECONDARY, borderBottom: `2px solid ${BORDER}` }}>{h}</th>))}</tr></thead>
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
              <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Accumulative total by brand</h3>
              <p style={{ fontSize: 14, color: SECONDARY, margin: '0 0 16px' }}>{rangeLabel} 2026, all brand names shown in full</p>
              <ResponsiveContainer width="100%" height={Math.max(240, limited.length * 32)}>
                <BarChart data={limited} layout="vertical" margin={{ left: 8, right: 64 }}>
                  <CartesianGrid stroke={BORDER} horizontal={false} strokeDasharray="3 6"/>
                  <XAxis type="number" stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="brand" stroke={INK} tick={{ fontSize: 14, fontWeight: 700 }} width={130} interval={0} axisLine={false} tickLine={false}/>
                  <Tooltip content={<GoogleTooltip/>} cursor={{ fill: BLUE_LIGHT }}/>
                  <Bar dataKey="rangeUnit" name={`${rangeLabel} units`} radius={[0,8,8,0]} fill={BLUE}>
                    <LabelList dataKey="rangeUnit" position="right" formatter={(v) => v.toLocaleString()} style={{ fontSize: 14, fontWeight: 700, fill: INK }}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      })()}
              {/* ===== Cumulative EV registrations by make, filterable by year ===== */}
      {(() => {
        const lifetimeByMake = [
            { brand: 'BYD',            y2023:  1416, y2024:  6191, y2025: 10780, y2026:  7461 },
            { brand: 'Tesla',          y2023:   941, y2024:  2384, y2025:  3476, y2026:  3260 },
            { brand: 'B.M.W.',         y2023:   789, y2024:  1636, y2025:  1495, y2026:   724 },
            { brand: 'M.G.',           y2023:   178, y2024:   461, y2025:   907, y2026:  1197 },
            { brand: 'GAC',            y2023:     0, y2024:   310, y2025:  1050, y2026:  1073 },
            { brand: 'Xpeng',          y2023:     0, y2024:   336, y2025:   940, y2026:   910 },
            { brand: 'Chery',          y2023:     0, y2024:   113, y2025:   623, y2026:  1361 },
            { brand: 'Hyundai',        y2023:   694, y2024:   708, y2025:   376, y2026:    91 },
            { brand: 'Mercedes-Benz',  y2023:   537, y2024:   441, y2025:   574, y2026:   257 },
            { brand: 'Zeekr',          y2023:     0, y2024:    99, y2025:   764, y2026:   830 },
            { brand: 'Volvo',          y2023:   159, y2024:   319, y2025:   391, y2026:   244 },
            { brand: 'Porsche',        y2023:   131, y2024:   225, y2025:   379, y2026:   159 },
            { brand: 'Dongfeng',       y2023:     0, y2024:    22, y2025:   320, y2026:   378 },
            { brand: 'Maxus',          y2023:    10, y2024:    90, y2025:   212, y2026:   358 },
            { brand: 'Polestar',       y2023:   101, y2024:   140, y2025:   146, y2026:    51 },
            { brand: 'Audi',           y2023:    61, y2024:   136, y2025:   155, y2026:    82 },
            { brand: 'Avatr',          y2023:     0, y2024:     0, y2025:    76, y2026:   301 },
            { brand: 'Deepal',         y2023:     0, y2024:     0, y2025:   135, y2026:   212 },
            { brand: 'Volkswagen',     y2023:     2, y2024:   190, y2025:   123, y2026:    31 },
            { brand: 'Great Wall',     y2023:    54, y2024:   147, y2025:    96, y2026:    40 },
            { brand: 'Mini',           y2023:     9, y2024:   103, y2025:   134, y2026:    87 },
            { brand: 'Toyota',         y2023:    43, y2024:    46, y2025:    19, y2026:   218 },
            { brand: 'Opel',           y2023:   106, y2024:    38, y2025:    74, y2026:    71 },
            { brand: 'Leapmotor',      y2023:     0, y2024:     0, y2025:    43, y2026:   214 },
            { brand: 'Kia',            y2023:    53, y2024:    48, y2025:    82, y2026:    67 },
            { brand: 'Geely',          y2023:     0, y2024:     0, y2025:    42, y2026:   189 },
            { brand: 'Peugeot',        y2023:   119, y2024:    59, y2025:    20, y2026:     0 },
            { brand: 'Citroen',        y2023:    20, y2024:    79, y2025:    39, y2026:    20 },
            { brand: 'Smart',          y2023:     1, y2024:    41, y2025:    66, y2026:    40 },
            { brand: 'Skoda',          y2023:     2, y2024:    38, y2025:    17, y2026:     5 },
            { brand: 'Cupra',          y2023:     0, y2024:     0, y2025:    38, y2026:    23 },
            { brand: 'Mazda',          y2023:    11, y2024:     4, y2025:     1, y2026:    35 },
            { brand: 'Nissan',         y2023:    10, y2024:    11, y2025:    16, y2026:    14 },
            { brand: 'Subaru',         y2023:     0, y2024:     0, y2025:     1, y2026:    39 },
            { brand: 'NIO',            y2023:     0, y2024:     0, y2025:     1, y2026:    34 },
            { brand: 'Lotus',          y2023:     1, y2024:    11, y2025:    14, y2026:     5 },
            { brand: 'Hongqi',         y2023:     0, y2024:     0, y2025:     0, y2026:    30 },
            { brand: 'EVeasy',         y2023:     0, y2024:     0, y2025:    17, y2026:    11 },
            { brand: 'Skyworth',       y2023:     0, y2024:     0, y2025:    22, y2026:     6 },
            { brand: 'Honda',          y2023:     8, y2024:     4, y2025:     2, y2026:     5 },
            { brand: 'Rolls-Royce',    y2023:     0, y2024:    13, y2025:     4, y2026:     1 },
            { brand: 'Jaguar',         y2023:     8, y2024:     2, y2025:     1, y2026:     1 },
            { brand: 'Suzuki',         y2023:     0, y2024:     0, y2025:     0, y2026:    10 },
            { brand: 'Seres',          y2023:     0, y2024:     1, y2025:     8, y2026:     0 },
            { brand: 'Neta',           y2023:     0, y2024:     2, y2025:     3, y2026:     0 },
            { brand: 'Fiat',           y2023:     4, y2024:     0, y2025:     0, y2026:     0 },
            { brand: 'KGM',            y2023:     0, y2024:     0, y2025:     0, y2026:     3 },
            { brand: 'SEAT',           y2023:     0, y2024:     0, y2025:     1, y2026:     0 },
            { brand: 'SsangYong',      y2023:     0, y2024:     0, y2025:     1, y2026:     0 },
        ];

        const ALL_BANDS = [
          { key: 'y2023', year: 2023, label: '2023', color: NAVY },
          { key: 'y2024', year: 2024, label: '2024', color: SLATE },
          { key: 'y2025', year: 2025, label: '2025', color: DEEP_CYAN },
          { key: 'y2026', year: 2026, label: '2026 (Jan–Jul)', color: BLUE },
        ];

        const loY = Math.min(lifeFrom, lifeTo), hiY = Math.max(lifeFrom, lifeTo);
        const bands = ALL_BANDS.filter(b => b.year >= loY && b.year <= hiY);
        const fullRange = loY === 2023 && hiY === 2026;
        const yearLabel = loY === hiY
          ? (loY === 2026 ? '2026 (Jan–Jul)' : String(loY))
          : `${loY}–${hiY === 2026 ? '2026 (Jan–Jul)' : hiY}`;

        const ranked = lifetimeByMake
          .map(b => ({ ...b, total: bands.reduce((s, bd) => s + b[bd.key], 0) }))
          .filter(b => b.total > 0)
          .sort((a, b) => b.total - a.total);
        const lifeLimitN = lifeLimit === 'top10' ? 10 : lifeLimit === 'top20' ? 20 : 999;
        const shown = ranked.slice(0, lifeLimitN);
        const grandTotal = ranked.reduce((s, b) => s + b.total, 0);

        const LifeTooltip = ({ active, label }) => {
          if (!active) return null;
          const row = shown.find(r => r.brand === label);
          if (!row) return null;
          return (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 14px', boxShadow: '0 4px 16px rgba(8,36,75,0.10)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: BLUE, marginBottom: 8 }}>{row.total.toLocaleString()} EVs {'·'} {yearLabel}</div>
              {bands.map(b => (
                <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: SECONDARY, marginTop: 3 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: b.color, flexShrink: 0 }}/>
                  <span style={{ flex: 1 }}>{b.label}</span>
                  <span style={{ fontWeight: 700, color: INK }}>{row[b.key].toLocaleString()}</span>
                  <span style={{ minWidth: 38, textAlign: 'right' }}>{row.total ? ((row[b.key] / row.total) * 100).toFixed(0) : 0}%</span>
                </div>
              ))}
            </div>
          );
        };

        return (
          <div style={{ background: CARD, borderRadius: 20, padding: 24, border: `1px solid ${BORDER}`, marginTop: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 4px' }}>
              Cumulative EV car registrations by make {'—'} {yearLabel}
            </h3>
            <p style={{ fontSize: 14, color: SECONDARY, margin: '0 0 16px', lineHeight: 1.5 }}>
              Bar length is every pure-electric car each make registered in the selected years; colour shows which year.
              {' '}<strong style={{ color: INK }}>{grandTotal.toLocaleString()}</strong> cars across {ranked.length} makes
              {fullRange ? ', covering 92% of the 69,190 EV cars in the fleet today' : ''}
              {' · '}passenger cars only, independent of the filters above.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 4, background: SURFACE, borderRadius: 10, padding: 4, border: `1px solid ${BORDER}` }}>
                {[{id:'top10',l:'Top 10'},{id:'top20',l:'Top 20'},{id:'all',l:'All'}].map(f => (
                  <button key={f.id} onClick={() => setLifeLimit(f.id)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: lifeLimit === f.id ? NAVY : 'transparent', color: lifeLimit === f.id ? '#fff' : SECONDARY }}>{f.l}</button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: SECONDARY }}>Years:</span>
                <select value={lifeFrom} onChange={e => setLifeFrom(Number(e.target.value))} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 14, fontWeight: 600, background: CARD, color: INK }}>
                  {ALL_BANDS.map(b => <option key={b.year} value={b.year}>{b.year}</option>)}
                </select>
                <span style={{ fontSize: 14, color: SECONDARY }}>to</span>
                <select value={lifeTo} onChange={e => setLifeTo(Number(e.target.value))} style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 14, fontWeight: 600, background: CARD, color: INK }}>
                  {ALL_BANDS.map(b => <option key={b.year} value={b.year}>{b.year}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {bands.map(b => (
                  <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 11, height: 11, borderRadius: 3, background: b.color }}/>
                    <span style={{ fontSize: 13, fontWeight: 600, color: SECONDARY }}>{b.label}</span>
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 13, color: SECONDARY }}>
                Showing top {shown.length} of {ranked.length} makes
              </span>
            </div>

            <ResponsiveContainer width="100%" height={Math.max(300, shown.length * 34 + 40)}>
              <BarChart data={shown} layout="vertical" margin={{ left: 8, right: 76, top: 4, bottom: 4 }}>
                <CartesianGrid stroke={BORDER} horizontal={false} strokeDasharray="3 6"/>
                <XAxis type="number" stroke={SECONDARY} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString()}/>
                <YAxis type="category" dataKey="brand" stroke={INK} tick={{ fontSize: 14, fontWeight: 600 }} width={128} axisLine={false} tickLine={false}/>
                <Tooltip content={<LifeTooltip/>} cursor={{ fill: BLUE_LIGHT }}/>
                {bands.map((b, i) => (
                  <Bar key={b.key} dataKey={b.key} name={b.label} stackId="life" fill={b.color}
                       radius={i === bands.length - 1 ? [0,8,8,0] : [0,0,0,0]}>
                    {i === bands.length - 1 && (
                      <LabelList dataKey="total" position="right" formatter={v => v.toLocaleString()}
                                 style={{ fontSize: 14, fontWeight: 700, fill: INK }}/>
                    )}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>

            <ChartNotes style={{ marginTop: 14 }} bleed={24} padX={24}>
              Cumulative new registrations of pure-electric cars, not the registered fleet: vehicles registered before 2023 and those
              since deregistered are excluded. Authorised-dealer and parallel-import volumes are combined. Ranking and the Top 10 / 20 / All cut both recalculate for the
              selected years. 2023{'–'}2025 from LTA Annual Vehicle Statistics (MVP02-2, new cars by make); 2026 from LTA Monthly
              Vehicle Statistics (M03), Jan{'–'}Jul.
            </ChartNotes>
          </div>
        );
      })()}
      
    </div>
  );
}
