// OLU CABS mock backend: places, road graph, pricing, simulation helpers, map renderer.
(function () {
  const h = (...a) => window.React.createElement(...a);
  const BASE_T = 10 * 3600 + 42 * 60;
  const P = {
    bia: { name: 'Bandaranaike Intl. Airport', short: 'BIA Airport', area: 'Katunayake', x: 372, y: 150 },
    negombo: { name: 'Jetwing Beach, Negombo', short: 'Negombo', area: 'Negombo', x: 212, y: 92 },
    jaela: { name: 'Ja-Ela Junction', short: 'Ja-Ela', area: 'Ja-Ela', x: 362, y: 420 },
    wattala: { name: 'Wattala Market', short: 'Wattala', area: 'Wattala', x: 298, y: 606 },
    kelaniya: { name: 'Kelaniya Raja Maha Vihara', short: 'Kelaniya', area: 'Kelaniya', x: 452, y: 646 },
    fort: { name: 'Colombo Fort Station', short: 'Fort', area: 'Colombo 01', x: 232, y: 788 },
    kingsbury: { name: 'The Kingsbury Hotel', short: 'Kingsbury', area: 'Colombo 01', x: 218, y: 812 },
    galleface: { name: 'Galle Face Green', short: 'Galle Face', area: 'Colombo 03', x: 238, y: 846 },
    cinnamon: { name: 'Cinnamon Grand', short: 'Cinnamon Grand', area: 'Colombo 03', x: 264, y: 872 },
    borella: { name: 'Borella Junction', short: 'Borella', area: 'Colombo 08', x: 362, y: 852 },
    rajagiriya: { name: 'Rajagiriya Flyover', short: 'Rajagiriya', area: 'Rajagiriya', x: 500, y: 880 },
    majestic: { name: 'Majestic City', short: 'Majestic City', area: 'Bambalapitiya', x: 292, y: 950 },
    nugegoda: { name: 'Nugegoda Junction', short: 'Nugegoda', area: 'Nugegoda', x: 470, y: 1010 },
  };
  const ROADS = [
    { k: 'exp', pts: [[372, 150], [400, 260], [410, 380], [395, 500], [360, 600], [320, 680], [270, 760], [232, 788]] },
    { k: 'main', pts: [[212, 92], [260, 128], [330, 160], [372, 150]] },
    { k: 'main', pts: [[330, 160], [322, 260], [332, 360], [362, 420], [332, 520], [298, 606], [268, 700], [232, 788]] },
    { k: 'main', pts: [[232, 788], [218, 812], [238, 846], [264, 872], [292, 950], [318, 1100]] },
    { k: 'main', pts: [[298, 606], [452, 646], [620, 630], [900, 600]] },
    { k: 'main', pts: [[232, 788], [300, 820], [362, 852], [500, 880], [640, 890], [900, 900]] },
    { k: 'main', pts: [[362, 852], [420, 930], [470, 1010], [520, 1100]] },
    { k: 'main', pts: [[500, 880], [470, 1010]] },
    { k: 'main', pts: [[264, 872], [362, 852]] },
    { k: 'main', pts: [[292, 950], [420, 930]] },
    { k: 'main', pts: [[372, 150], [470, 170], [640, 200], [900, 230]] },
    { k: 'main', pts: [[362, 420], [520, 440], [900, 470]] },
  ];
  const COAST = [[190, -300], [190, 0], [175, 60], [195, 120], [230, 200], [245, 300], [255, 420], [245, 520], [235, 600], [215, 700], [195, 780], [205, 830], [225, 880], [250, 960], [265, 1100], [285, 1500]];
  const MAPC = {
    light: { land: '#EEECE6', sea: '#C9D9E0', minor: '#FFFFFF', mainCase: '#DAD5CA', main: '#FFFFFF', expCase: '#D9B865', exp: '#F2DA98', park: '#DCE5D2', label: '#8B877E', route: '#121519', routeCase: '#FFFFFF', done: '#B3AFA6', halo: '#EEECE6', pin: '#121519', pinRing: '#FFFFFF', text: '#121519' },
    dark: { land: '#171B21', sea: '#0B1016', minor: '#20252D', mainCase: '#12161B', main: '#2D343E', expCase: '#2E2919', exp: '#4E4228', park: '#19231D', label: '#646A73', route: '#E3B23C', routeCase: '#0E1116', done: '#4A505A', halo: '#171B21', pin: '#F3F1EC', pinRing: '#0E1116', text: '#F3F1EC' },
  };
  const AREAS = [['NEGOMBO', 252, 50], ['KATUNAYAKE', 450, 116], ['JA-ELA', 420, 404], ['WATTALA', 352, 584], ['KELANIYA', 512, 616], ['COLOMBO', 312, 744], ['BORELLA', 404, 826], ['RAJAGIRIYA', 572, 856], ['NUGEGODA', 534, 1040]];

  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const PP = (k) => [P[k].x, P[k].y];
  const NODES = {};
  const nk = (p) => Math.round(p[0]) + ',' + Math.round(p[1]);
  function addN(p) { const k = nk(p); if (!NODES[k]) NODES[k] = { p: [Math.round(p[0]), Math.round(p[1])], adj: [] }; return k; }
  function link(a, b, w) { if (a === b) return; NODES[a].adj.push({ k: b, w }); NODES[b].adj.push({ k: a, w }); }
  ROADS.forEach((r) => {
    for (let i = 0; i < r.pts.length - 1; i++) {
      const A = r.pts[i], B = r.pts[i + 1];
      const n = Math.max(1, Math.ceil(dist(A, B) / 34));
      let prev = addN(A);
      for (let j = 1; j <= n; j++) {
        const cur = addN([A[0] + (B[0] - A[0]) * j / n, A[1] + (B[1] - A[1]) * j / n]);
        link(prev, cur, dist(NODES[prev].p, NODES[cur].p) * (r.k === 'exp' ? 0.55 : 1));
        prev = cur;
      }
    }
  });
  const NK = Object.keys(NODES);
  function nearest(p) { let b = null, bd = 1e9; for (const k of NK) { const d = dist(NODES[k].p, p); if (d < bd) { bd = d; b = k; } } return b; }
  function routePts(a, b) {
    const s = nearest(a), t = nearest(b);
    const D = {}, Pv = {}, done = {};
    NK.forEach((k) => (D[k] = Infinity)); D[s] = 0;
    for (;;) {
      let u = null, ud = Infinity;
      for (const k of NK) if (!done[k] && D[k] < ud) { ud = D[k]; u = k; }
      if (u === null || u === t) break;
      done[u] = 1;
      for (const e of NODES[u].adj) { const nd = ud + e.w; if (nd < D[e.k]) { D[e.k] = nd; Pv[e.k] = u; } }
    }
    const path = []; let c = t, g = 0;
    while (c && g++ < 999) { path.unshift(NODES[c].p); if (c === s) break; c = Pv[c]; }
    const pts = [a, ...path, b];
    return pts.filter((p, i) => i === 0 || dist(p, pts[i - 1]) > 0.5);
  }
  function pathLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i]); return L; }
  function walk(pts, t) {
    let target = Math.max(0, Math.min(1, t)) * pathLen(pts);
    for (let i = 1; i < pts.length; i++) {
      const d = dist(pts[i - 1], pts[i]);
      if (target <= d || i === pts.length - 1) {
        const f = d ? Math.min(1, target / d) : 0;
        return { i, x: pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, y: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f, a: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) * 180 / Math.PI + 90 };
      }
      target -= d;
    }
    const p = pts[pts.length - 1]; return { i: pts.length - 1, x: p[0], y: p[1], a: 0 };
  }
  const pointAt = (pts, t) => { const w = walk(pts, t); return [w.x, w.y, w.a]; };
  function splitAt(pts, t) { const w = walk(pts, t); const m = [w.x, w.y]; return [[...pts.slice(0, w.i), m], [m, ...pts.slice(w.i)]]; }
  const KM = 0.042;
  const RC = {};
  function getRoute(f, t) {
    const k = f + '>' + t;
    if (!RC[k]) { const pts = routePts(PP(f), PP(t)); const km = Math.round(pathLen(pts) * KM * 10) / 10; RC[k] = { pts, km, mins: Math.round(km * 1.35 + 4) }; }
    return RC[k];
  }
  function multiRoute(keys) {
    const k = keys.join('>');
    if (!RC[k]) { let pts = [], km = 0; for (let i = 0; i < keys.length - 1; i++) { const r = getRoute(keys[i], keys[i + 1]); pts = pts.length ? pts.concat(r.pts.slice(1)) : r.pts.slice(); km += r.km; } km = Math.round(km * 10) / 10; RC[k] = { pts, km, mins: Math.round(km * 1.35 + 4 + (keys.length - 2) * 5) }; }
    return RC[k];
  }
  const tripRoute = (b) => (b.stops && b.stops.length ? multiRoute([b.from, ...b.stops, b.to]) : getRoute(b.from, b.to));
  const radiusKm = (w) => (w.settings && w.settings.radius) || 7;
  const kmTo = (d, k) => dist([d.x, d.y], PP(k)) * KM * 1.3;
  const remKm = (pts, t) => Math.max(0, Math.round(pathLen(pts) * (1 - t) * KM * 10) / 10);

  // ---------- pricing (user-supplied rate card) ----------
  const PRICING0 = [
    { id: 'mini', name: 'Mini', model: 'Suzuki Wagon R', pax: 3, bags: 1, airport: 2900, oneway: 170, ret: 120, eff: '~16 km/L' },
    { id: 'minivan', name: 'Mini Van', model: 'Suzuki Every', pax: 4, bags: 3, airport: 3300, oneway: 180, ret: 130, eff: '~14 km/L' },
    { id: 'sedan', name: 'Sedan', model: 'Toyota Prius / Axio', pax: 4, bags: 2, airport: 3950, oneway: 190, ret: 140, eff: '~13–14 km/L' },
    { id: 'crossover', name: 'Crossover', model: 'Honda Vezel', pax: 4, bags: 3, airport: 4500, oneway: 190, ret: 140, eff: '~12 km/L' },
    { id: 'suv', name: 'SUV', model: 'Toyota Prado', pax: 6, bags: 4, airport: 5500, oneway: 200, ret: 150, eff: '~10 km/L' },
    { id: 'van', name: 'Van', model: 'Toyota KDH / Hiace', pax: 9, bags: 8, airport: 6500, oneway: 250, ret: 200, eff: '' },
  ];
  const r10 = (n) => Math.round(n / 10) * 10;
  const rs = (n) => 'Rs. ' + Math.round(n || 0).toLocaleString('en-US');
  function quoteFor(pr, svc, from, to, vid, stops, st) {
    const v = pr.find((x) => x.id === vid) || pr[0];
    stops = (stops || []).filter(Boolean);
    const r = stops.length ? multiRoute([from, ...stops, to]) : getRoute(from, to);
    const fee = (st && st.stopFee != null ? Number(st.stopFee) : 300) * stops.length;
    const sl = stops.length ? [[stops.length + ' extra stop' + (stops.length > 1 ? 's' : '') + ' × ' + rs(fee / stops.length), rs(fee)]] : [];
    const fin = (q) => (q.quote ? q : { ...q, total: q.total + fee, lines: q.lines.concat(sl) });
    return fin(quoteCore(v, svc, from, to, r, stops));
  }
  function quoteCore(v, svc, from, to, r, stops) {
    const isAir = from === 'bia' || to === 'bia';
    const base = { km: r.km, mins: r.mins };
    if (svc === 'tour') return { ...base, total: null, quote: true, lines: [] };
    if (svc === 'airport' && isAir) { const extra = stops.length ? Math.max(0, r.km - getRoute(from, to).km) : 0; const ex = r10(extra * v.oneway); return { ...base, total: v.airport + ex, lines: [['Airport transfer · fixed rate', rs(v.airport)]].concat(ex ? [[`Detour · ${extra.toFixed(1)} km × Rs. ${v.oneway}`, rs(ex)]] : []) }; }
    if (svc === 'return') { const t = r10(r.km * 2 * v.ret); return { ...base, total: t, lines: [[`Return · ${(r.km * 2).toFixed(1)} km × Rs. ${v.ret}`, rs(t)]] }; }
    const t = r10(r.km * v.oneway);
    return { ...base, total: t, lines: [[`One way · ${r.km.toFixed(1)} km × Rs. ${v.oneway}`, rs(t)]] };
  }

  // ---------- status model ----------
  const ST = {
    quote: ['Quote requested', 'neutral'], scheduled: ['Scheduled', 'neutral'], awaiting: ['Awaiting driver', 'warning'],
    assigned: ['Driver assigned', 'info'], enroute: ['Driver en route', 'info'], arrived: ['Driver arrived', 'live'],
    ontrip: ['On trip', 'live'], completed: ['Completed', 'success'], cancelled: ['Cancelled', 'danger'],
  };
  const DST = { available: ['Available', 'success'], assigned: ['Assigned', 'info'], enroute: ['En route', 'info'], arrived: ['At pickup', 'live'], ontrip: ['On trip', 'live'], offline: ['Offline', 'neutral'] };
  const TONE = {
    neutral: { bg: '#ECEAE5', fg: '#4A4740', dot: '#8C887F' }, warning: { bg: '#FBEBD0', fg: '#7A4A06', dot: '#D98A10' },
    info: { bg: '#DEE9F6', fg: '#1F4E85', dot: '#2F6FB3' }, live: { bg: '#F7E9C1', fg: '#6E5108', dot: '#C9961C' },
    success: { bg: '#DCEFE3', fg: '#1D5E3A', dot: '#2F8F5B' }, danger: { bg: '#F7DEDA', fg: '#8A2318', dot: '#C8382C' },
  };
  const MCOL = { available: '#2F8F5B', assigned: '#2F6FB3', enroute: '#2F6FB3', arrived: '#C9961C', ontrip: '#C9961C', offline: '#A19D94' };
  const sv = (st) => { const m = ST[st] || ST.scheduled; const t = TONE[m[1]]; return { sLabel: m[0], sBg: t.bg, sFg: t.fg, sDot: t.dot }; };
  const dsv = (st) => { const m = DST[st] || DST.offline; const t = TONE[m[1]]; return { sLabel: m[0], sBg: t.bg, sFg: t.fg, sDot: t.dot }; };

  const pad2 = (n) => String(n).padStart(2, '0');
  const mmss = (sec) => pad2(Math.floor(Math.max(0, sec) / 60)) + ':' + pad2(Math.floor(Math.max(0, sec) % 60));
  const hhmm = (sec) => { const m = Math.floor(sec / 60); return pad2(Math.floor(m / 60) % 24) + ':' + pad2(m % 60); };
  const clk = (w) => hhmm(BASE_T + Math.floor(w.elapsed * 10));
  const initials = (n) => n.split(' ').map((x) => x[0]).slice(0, 2).join('');
  const first = (n) => n.split(' ')[0];

  // ---------- seed data ----------
  const D0 = [
    ['d1', 'Kasun Perera', '+94 77 318 2204', 'Toyota Prius', 'CAB-1234', 'sedan', 4.9, 'available', 300, 905, 0, 0, true],
    ['d2', 'Nimal Fernando', '+94 71 552 1180', 'Toyota Aqua', 'CAD-5521', 'mini', 4.8, 'available', 252, 742, 4, 8640],
    ['d3', 'Tharindu Silva', '+94 76 220 9045', 'Honda Vezel', 'CBA-8810', 'crossover', 4.7, 'ontrip', 0, 0, 2, 9100],
    ['d4', 'Dinesh Jayawardena', '+94 77 640 3321', 'Toyota KDH', 'PH-4471', 'van', 4.9, 'available', 305, 640, 1, 6500],
    ['d5', 'Ruwan Bandara', '+94 70 118 7742', 'Toyota Axio', 'CAR-3090', 'sedan', 4.6, 'available', 246, 770, 5, 12420],
    ['d6', 'Chamara Wickramasinghe', '+94 75 903 4410', 'Toyota Hiace', 'NB-2245', 'van', 4.8, 'offline', 520, 900, 0, 0],
    ['d7', 'Sanjeewa Rathnayake', '+94 72 774 0981', 'Suzuki Wagon R', 'CAF-7712', 'mini', 4.5, 'enroute', 0, 0, 3, 5280],
    ['d8', 'Ishara Gunasekara', '+94 77 455 6620', 'Toyota Prado', 'CAK-0909', 'suv', 5.0, 'available', 388, 196, 2, 11000],
    ['d9', 'Lahiru Dissanayake', '+94 71 300 8812', 'Suzuki Every', 'CAJ-6620', 'minivan', 4.7, 'available', 505, 868, 2, 4310],
    ['d10', 'Pradeep Kumara', '+94 76 881 2093', 'Toyota Prius', 'CAH-4415', 'sedan', 4.8, 'offline', 360, 440, 0, 0],
  ];
  const B0 = [
    ['1039', 'Hasini Gamage', '+94 77 201 4455', 'borella', 'fort', 'ride', 'mini', null, 'Cash', 'cancelled', '07:48', false],
    ['1040', 'Mohamed Rizwan', '+94 75 118 2290', 'negombo', 'bia', 'airport', 'sedan', 'd1', 'Cash', 'completed', '07:05', true],
    ['1041', 'Sarah Collins', '+44 7700 900412', 'bia', 'kingsbury', 'airport', 'sedan', 'd1', 'Card', 'completed', '08:20', true],
    ['1042', 'Ravi Shankar', '+94 71 554 8810', 'fort', 'majestic', 'ride', 'sedan', 'd1', 'Cash', 'completed', '09:40', true],
    ['1043', 'Thomas Müller', '+49 151 2204 118', 'bia', 'kingsbury', 'airport', 'crossover', 'd3', 'Card', 'ontrip', '10:05', false],
    ['1044', 'Dilrukshi Peris', '+94 77 889 0213', 'borella', 'rajagiriya', 'ride', 'mini', 'd7', 'Cash', 'enroute', '10:31', false],
    ['1045', 'Fernando family', '+94 76 334 7781', 'bia', 'negombo', 'airport', 'van', null, 'Cash', 'awaiting', '10:36', false],
    ['1046', 'Ayesha Nazeer', '+94 70 664 1192', 'majestic', 'kelaniya', 'ride', 'mini', null, 'Card', 'awaiting', '10:39', false],
    ['1047', 'Anjali Mehta', '+91 98200 41177', 'cinnamon', 'bia', 'airport', 'suv', null, 'Bank transfer', 'scheduled', '14:30', false],
  ];
  const SPAWN = [
    { at: 32, cust: 'Kavindi Senanayake', phone: '+94 77 902 3318', from: 'kingsbury', to: 'bia', svc: 'airport', veh: 'sedan', pay: 'Card' },
    { at: 70, cust: 'Nuwan Pathirana', phone: '+94 71 245 6690', from: 'fort', to: 'kelaniya', svc: 'ride', veh: 'sedan', pay: 'Cash' },
    { at: 140, cust: 'Emma Laurent', phone: '+33 6 12 44 80 19', from: 'bia', to: 'cinnamon', svc: 'airport', veh: 'crossover', pay: 'Card' },
  ];
  const CUST_HIST = [
    { id: 'OLU-20261006-0012', date: 'Tue 6 Oct · 05:30', route: 'Cinnamon Grand → BIA Airport', veh: 'Sedan', fare: 3950, status: 'scheduled' },
    { id: 'OLU-20260921-0874', date: 'Mon 21 Sep · 22:10', route: 'BIA Airport → Cinnamon Grand', veh: 'Sedan', fare: 3950, status: 'completed' },
    { id: 'OLU-20260912-0611', date: 'Sat 12 Sep · 06:00', route: 'Colombo → Kandy day tour', veh: 'SUV', fare: 24500, status: 'completed' },
    { id: 'OLU-20260830-0402', date: 'Sun 30 Aug · 18:45', route: 'Galle Face → Majestic City', veh: 'Mini', fare: 850, status: 'cancelled' },
  ];

  function initState() {
    const w = { elapsed: 0, bookings: [], activity: [], toasts: [], unread: 3, seq: 1048, spawned: 0, pricing: PRICING0.map((x) => ({ ...x })), commission: 12 };
    w.drivers = D0.map((a) => ({ id: a[0], name: a[1], phone: a[2], car: a[3], plate: a[4], cat: a[5], rating: a[6], status: a[7], x: a[8], y: a[9], a: 0, trips: a[10], earn: a[11], demo: !!a[12], bookingId: null, route: null, t: 0, dur: 20, timer: 0, reqLeft: 0 }));
    w.bookings = B0.map((a) => {
      const [n, cust, phone, from, to, svc, veh, drv, pay, status, created, paid] = a;
      const q = quoteFor(w.pricing, svc, from, to, veh);
      const b = { id: 'OLU-20261004-' + n, cust, phone, from, to, svc, veh, km: q.km, mins: q.mins, fare: q.total || 0, pay, status, driverId: drv, created, when: status === 'scheduled' ? created : 'Now', paid: !!paid, payMethod: paid ? pay : null, paidAmt: paid ? q.total : 0, extras: 0, log: [{ at: created, text: 'Booking created via customer web' }], demo: false, rejected: [], pax: 2, at: {}, stops: [], broadcast: svc === 'ride' || svc === 'return', noNearby: status === 'awaiting' };
      if (drv) b.log.push({ at: created, text: 'Driver assigned by dispatcher' });
      if (status === 'completed') b.log.push({ at: created, text: 'Trip completed · payment recorded · settlement recorded' });
      if (status === 'cancelled') b.log.push({ at: '07:52', text: 'Cancelled by customer' });
      return b;
    }).reverse();
    w.bookings.forEach((b) => { if (b.paid) { const d = w.drivers.find((x) => x.id === b.driverId); d.trips++; d.earn += b.paidAmt; } });
    const d3 = w.drivers.find((d) => d.id === 'd3'); d3.bookingId = 'OLU-20261004-1043'; d3.route = getRoute('bia', 'kingsbury').pts; d3.t = 0.42; d3.dur = 80;
    const d7 = w.drivers.find((d) => d.id === 'd7'); d7.bookingId = 'OLU-20261004-1044'; d7.route = routePts([440, 905], PP('borella')); d7.t = 0.15; d7.dur = 24;
    [d3, d7].forEach((d) => { const p = pointAt(d.route, d.t); d.x = p[0]; d.y = p[1]; d.a = p[2]; });
    w.activity = [
      { id: 1, at: '10:39', text: 'New booking OLU-20261004-1046 from Ayesha Nazeer', kind: 'new' },
      { id: 2, at: '10:36', text: 'New booking OLU-20261004-1045 from Fernando family', kind: 'new' },
      { id: 3, at: '10:31', text: 'Sanjeewa Rathnayake accepted OLU-20261004-1044', kind: 'ok' },
      { id: 4, at: '10:12', text: 'Tharindu Silva started trip OLU-20261004-1043', kind: 'live' },
      { id: 5, at: '09:58', text: 'Admin updated Sedan airport transfer pricing', kind: 'info' },
    ];
    return w;
  }

  // ---------- mutations (operate on a cloned draft "w") ----------
  function clone(s) { return { ...s, drivers: s.drivers.map((d) => ({ ...d })), bookings: s.bookings.map((b) => ({ ...b })), activity: [...s.activity], toasts: [...s.toasts] }; }
  const Dget = (w, id) => w.drivers.find((d) => d.id === id);
  function setSt(w, b, st) { b.status = st; b.at = { ...(b.at || {}), [st]: clk(w) }; }
  function logB(w, b, text, kind) { const at = clk(w); if (b) b.log = [...b.log, { at, text }]; w.activity = [{ id: Math.random(), at, text, kind: kind || 'info' }, ...w.activity].slice(0, 50); w.unread++; }
  function toast(w, app, text, kind) { w.toasts = [...w.toasts, { id: Math.random(), app, text, kind: kind || 'info', ttl: 3.6 }]; }
  function newBooking(w, o) {
    const q = quoteFor(w.pricing, o.svc, o.from, o.to, o.veh, o.stops, w.settings);
    const at = clk(w);
    return { id: 'OLU-20261004-' + w.seq++, cust: o.cust, phone: o.phone, from: o.from, to: o.to, svc: o.svc, veh: o.veh, km: q.km, mins: q.mins, fare: q.total || 0, pay: o.pay, status: o.svc === 'tour' ? 'quote' : 'awaiting', driverId: null, created: at, when: 'Now', paid: false, extras: 0, log: [{ at, text: 'Booking created via customer web' }], demo: !!o.demo, rejected: [], pax: o.pax || 2, notes: o.notes || '', flight: o.flight || '', at: { awaiting: at }, stops: (o.stops || []).filter(Boolean), broadcast: (o.svc === 'ride' || o.svc === 'return') && !(w.settings && w.settings.autoBroadcast === false), noNearby: false, offers: null };
  }
  function clearOffers(w, b, keep) { (b.offers || []).forEach((id) => { const x = Dget(w, id); if (x && x.offer === b.id) { x.offer = null; if (x.demo && id !== keep) toast(w, 'driver', 'Trip request withdrawn', 'info'); } }); b.offers = null; }
  function assign(w, b, d) {
    clearOffers(w, b); d.offer = null;
    setSt(w, b, 'assigned'); b.driverId = d.id; b.wait = 0; d.bookingId = b.id; d.status = 'assigned'; d.timer = 0; d.reqLeft = 20;
    logB(w, b, `Dispatcher assigned ${d.name} to ${b.id}`, 'assign');
    if (b.demo) toast(w, 'customer', 'Driver assigned — confirming your trip', 'info');
    if (d.demo) toast(w, 'driver', 'New trip request', 'live');
  }
  function accept(w, d, b) {
    setSt(w, b, 'enroute'); d.status = 'enroute'; d.route = routePts([d.x, d.y], PP(b.from)); d.t = 0;
    d.dur = Math.max(10, Math.min(26, pathLen(d.route) / 7)); d.timer = 0;
    logB(w, b, `${d.name} accepted ${b.id}`, 'ok'); toast(w, 'admin', `${first(d.name)} accepted ${b.id}`, 'ok');
    if (b.demo) toast(w, 'customer', `${first(d.name)} is on the way`, 'info');
  }
  function claim(w, d, b) {
    const others = (b.offers || []).filter((x) => x !== d.id);
    clearOffers(w, b, d.id);
    others.forEach((id) => { const x = Dget(w, id); if (x && x.demo) toast(w, 'driver', 'Another driver accepted this trip', 'info'); });
    b.driverId = d.id; d.offer = null; d.bookingId = b.id; setSt(w, b, 'assigned');
    logB(w, b, `${d.name} accepted broadcast for ${b.id} (${kmTo(d, b.from).toFixed(1)} km away)`, 'ok');
    accept(w, d, b);
    if (b.demo) toast(w, 'customer', `Driver found · ${d.name} · ${d.car} ${d.plate}`, 'ok');
  }
  function declineOffer(w, d, b, timeout) {
    d.offer = null; b.offers = (b.offers || []).filter((x) => x !== d.id); b.rejected = [...(b.rejected || []), d.id];
    logB(w, b, `${d.name} ${timeout ? 'let the request expire' : 'declined'} ${b.id}`, 'warn');
    if (!b.offers.length) { b.offers = null; b.noNearby = true; logB(w, b, `No driver accepted ${b.id} — sent to dispatcher`, 'warn'); toast(w, 'admin', `No driver accepted ${b.id} · assign manually`, 'warn'); if (b.demo) toast(w, 'customer', 'Dispatch is assigning a driver for you', 'info'); }
  }
  function reject(w, d, b, timeout) {
    setSt(w, b, 'awaiting'); b.driverId = null; b.rejected = [...(b.rejected || []), d.id]; b.wait = 0; d.bookingId = null; d.status = 'available';
    logB(w, b, timeout ? `${d.name} did not respond to ${b.id}` : `${d.name} rejected ${b.id}`, 'warn');
    toast(w, 'admin', timeout ? `Request timed out · reassign ${b.id}` : `${first(d.name)} rejected the trip · reassign ${b.id}`, 'warn');
    if (b.demo) toast(w, 'customer', 'Finding you another driver', 'info');
  }
  function arrive(w, d, b) { setSt(w, b, 'arrived'); d.status = 'arrived'; d.route = null; d.timer = 0; b.arrivedAt = w.elapsed; logB(w, b, `${d.name} arrived at pickup for ${b.id}`, 'live'); if (b.demo) toast(w, 'customer', 'Your driver has arrived', 'live'); }
  function start(w, d, b) { setSt(w, b, 'ontrip'); d.status = 'ontrip'; d.route = tripRoute(b).pts; d.t = 0; d.dur = d.demo ? 36 : 30; d.timer = 0; b.startedAt = w.elapsed; logB(w, b, `Trip ${b.id} started`, 'live'); }
  function complete(w, d, b) { setSt(w, b, 'completed'); d.route = null; d.timer = 0; b.endedAt = w.elapsed; logB(w, b, `Trip ${b.id} completed`, 'ok'); }
  function pay(w, b, method, amt) {
    b.paid = true; b.payMethod = method; b.paidAmt = amt; b.settled = true;
    const d = b.driverId && Dget(w, b.driverId);
    if (d && d.bookingId === b.id) { d.status = 'available'; d.bookingId = null; d.route = null; }
    if (d) { d.trips++; d.earn += amt; }
    logB(w, b, `Payment ${rs(amt)} recorded · ${method}`, 'ok');
    logB(w, b, `Settlement recorded · commission ${rs(amt * w.commission / 100)}`, 'info');
    if (d && d.demo) toast(w, 'driver', 'Payment recorded successfully', 'ok');
    if (b.demo) toast(w, 'customer', 'Payment confirmed — thank you', 'ok');
  }
  function freeDriver(w, b) { const d = b.driverId && Dget(w, b.driverId); if (d && d.bookingId === b.id) { d.bookingId = null; d.status = 'available'; d.route = null; } }
  function cancelB(w, b, who) { clearOffers(w, b); freeDriver(w, b); setSt(w, b, 'cancelled'); logB(w, b, `Booking ${b.id} cancelled by ${who}`, 'danger'); if (b.demo && who !== 'customer') toast(w, 'customer', 'Your booking was cancelled by OLU', 'warn'); if (who === 'customer') toast(w, 'admin', `${b.id} cancelled by customer`, 'warn'); }
  function reassign(w, b) { freeDriver(w, b); setSt(w, b, 'awaiting'); b.driverId = null; b.wait = 0; b.noNearby = !b.broadcast; b.offers = null; logB(w, b, `${b.id} returned to queue for reassignment`, 'warn'); }
  function suggest(w, b) {
    const p = PP(b.from);
    return w.drivers.filter((d) => d.status === 'available' && !d.pending).map((d) => {
      const km = Math.round(dist([d.x, d.y], p) * KM * 1.3 * 10) / 10;
      return { d, km, eta: Math.max(2, Math.round(km * 2.4 + 1)), match: d.cat === b.veh, declined: (b.rejected || []).includes(d.id) };
    }).sort((a, c) => (a.declined - c.declined) || (c.match - a.match) || (a.eta - c.eta));
  }
  function tick(w, dt, auto, real) {
    real = real || 0.2;
    w.elapsed += dt;
    w.toasts = w.toasts.map((t) => ({ ...t, ttl: t.ttl - real })).filter((t) => t.ttl > 0);
    while (w.spawned < SPAWN.length && w.elapsed >= SPAWN[w.spawned].at) {
      const b = newBooking(w, SPAWN[w.spawned++]); w.bookings = [b, ...w.bookings];
      logB(w, null, `New booking ${b.id} from ${b.cust}`, 'new'); toast(w, 'admin', `New booking received · ${b.id}`, 'info');
    }
    w.bookings.forEach((b) => {
      if (b.status !== 'awaiting' || !b.broadcast || b.offers || b.noNearby) return;
      const Rk = radiusKm(w), match = !(w.settings && w.settings.matchClass === false);
      const near = w.drivers.filter((d) => d.status === 'available' && !d.offer && !d.pending && !(b.rejected || []).includes(d.id) && (!match || d.cat === b.veh) && kmTo(d, b.from) <= Rk);
      if (near.length) {
        b.offers = near.map((d) => d.id); b.offerAt = w.elapsed;
        near.forEach((d, i) => { d.offer = b.id; d.reqLeft = (w.settings && w.settings.offerSecs) || 20; d.offerT = 0; d.offerDelay = 13 + i * 3; if (d.demo) toast(w, 'driver', 'New trip request nearby', 'live'); });
        logB(w, b, `${b.id} broadcast to ${near.length} driver${near.length > 1 ? 's' : ''} within ${Rk} km`, 'new');
      } else { b.noNearby = true; logB(w, b, `No available drivers within ${Rk} km of ${P[b.from].short} — ${b.id} needs dispatcher`, 'warn'); toast(w, 'admin', `No drivers within ${Rk} km · assign ${b.id}`, 'warn'); }
    });
    if (auto) w.bookings.forEach((b) => { if (b.status === 'awaiting' && !b.offers) { b.wait = (b.wait || 0) + dt; if (b.wait > 3) { const sg = suggest(w, b).filter((x) => !x.declined)[0]; if (sg) assign(w, b, sg.d); } } });
    w.drivers.forEach((d) => {
      if (d.offer) {
        const ob = w.bookings.find((x) => x.id === d.offer);
        if (!ob || ob.status !== 'awaiting' || !(ob.offers || []).includes(d.id)) d.offer = null;
        else { d.offerT += dt; if (d.demo && !auto) { d.reqLeft -= real; if (d.reqLeft <= 0) declineOffer(w, d, ob, true); } else if (d.offerT > (d.demo ? 2.5 : d.offerDelay)) claim(w, d, ob); }
      }
      if (d.route && d.t < 1) { d.t = Math.min(1, d.t + dt / d.dur); const p = pointAt(d.route, d.t); d.x = p[0]; d.y = p[1]; d.a = p[2]; }
      const b = d.bookingId && w.bookings.find((x) => x.id === d.bookingId);
      if (!b) return;
      d.timer += dt;
      const ai = !d.demo || auto;
      if (b.status === 'assigned') { if (!ai) { d.reqLeft -= real; if (d.reqLeft <= 0) reject(w, d, b, true); } else if (d.timer > 2.5) accept(w, d, b); }
      else if (b.status === 'enroute' && ai && d.t >= 1 && d.timer > 1) arrive(w, d, b);
      else if (b.status === 'arrived' && ai && d.timer > 4) start(w, d, b);
      else if (b.status === 'ontrip' && ai && d.t >= 1) complete(w, d, b);
      else if (b.status === 'completed' && !b.paid && ai && d.timer > 2.5) pay(w, b, b.pay, b.fare + (b.extras || 0));
    });
  }

  // ---------- map ----------
  const pd = (pts) => 'M' + pts.map((p) => (+p[0]).toFixed(1) + ' ' + (+p[1]).toFixed(1)).join('L');
  const BASE = {};
  function baseLayers(th) {
    if (BASE[th]) return BASE[th];
    const c = MAPC[th]; const els = []; let k = 0;
    els.push(h('rect', { key: k++, x: -2000, y: -1000, width: 5000, height: 3600, fill: c.land }));
    const minor = [];
    for (let x = 190; x <= 720; x += 34) minor.push(`M${x} 690L${x + 24} 1140`);
    for (let y = 700; y <= 1140; y += 30) minor.push(`M170 ${y}L740 ${y + 12}`);
    for (let x = 196; x <= 330; x += 26) minor.push(`M${x} 30L${x + 10} 150`);
    for (let y = 40; y <= 150; y += 24) minor.push(`M170 ${y}L330 ${y + 6}`);
    [[300, 560, 430, 560], [260, 500, 390, 470], [300, 300, 430, 320], [420, 700, 560, 760], [560, 700, 600, 840], [380, 980, 560, 990], [430, 200, 560, 260], [440, 520, 560, 560], [400, 120, 520, 100]].forEach((a) => minor.push(`M${a[0]} ${a[1]}L${a[2]} ${a[3]}`));
    els.push(h('path', { key: k++, d: minor.join(''), stroke: c.minor, strokeWidth: 2.4, fill: 'none' }));
    els.push(h('rect', { key: k++, x: 292, y: 880, width: 30, height: 22, rx: 3, fill: c.park }));
    els.push(h('rect', { key: k++, x: 420, y: 300, width: 60, height: 40, rx: 6, fill: c.park }));
    els.push(h('rect', { key: k++, x: 560, y: 980, width: 50, height: 34, rx: 6, fill: c.park }));
    els.push(h('path', { key: k++, d: 'M222 640 C 280 662 330 628 380 650 S 470 682 540 655 S 700 628 900 640', stroke: c.sea, strokeWidth: 7, fill: 'none', strokeLinecap: 'round' }));
    els.push(h('ellipse', { key: k++, cx: 285, cy: 215, rx: 26, ry: 52, fill: c.sea }));
    els.push(h('ellipse', { key: k++, cx: 262, cy: 826, rx: 13, ry: 8, fill: c.sea }));
    els.push(h('ellipse', { key: k++, cx: 548, cy: 930, rx: 30, ry: 16, fill: c.sea }));
    ROADS.forEach((r) => { if (r.k === 'main') els.push(h('path', { key: k++, d: pd(r.pts), stroke: c.mainCase, strokeWidth: 9, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' })); });
    ROADS.forEach((r) => { if (r.k === 'main') els.push(h('path', { key: k++, d: pd(r.pts), stroke: c.main, strokeWidth: 6, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' })); });
    ROADS.forEach((r) => { if (r.k === 'exp') { els.push(h('path', { key: k++, d: pd(r.pts), stroke: c.expCase, strokeWidth: 10, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' })); els.push(h('path', { key: k++, d: pd(r.pts), stroke: c.exp, strokeWidth: 6.5, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' })); } });
    els.push(h('path', { key: k++, d: pd(COAST) + 'L-2000 1500L-2000 -300Z', fill: c.sea }));
    els.push(h('rect', { key: k++, x: 338, y: 128, width: 70, height: 34, rx: 4, fill: 'none', stroke: c.mainCase, strokeWidth: 2, strokeDasharray: '4 3' }));
    return (BASE[th] = els);
  }
  function mapEl(o) {
    const th = o.th || 'light', c = MAPC[th], vb = o.vb, s = vb[2] / 360;
    const ch = [...baseLayers(th)]; let k = 1000;
    const font = { fontFamily: 'Archivo, sans-serif' };
    ch.push(h('text', { key: k++, x: 96, y: 520, fontSize: 11 * s, fontStyle: 'italic', letterSpacing: 3 * s, fill: c.label, transform: 'rotate(-82 96 520)', style: font }, 'INDIAN OCEAN'));
    AREAS.forEach((a) => ch.push(h('text', { key: k++, x: a[1], y: a[2], fontSize: 9.5 * s, fontWeight: 700, letterSpacing: 1.6 * s, fill: c.label, stroke: c.halo, strokeWidth: 3 * s, paintOrder: 'stroke', textAnchor: 'middle', style: font }, a[0])));
    (o.ghost || []).forEach((r) => ch.push(h('path', { key: k++, d: pd(r), stroke: c.route, strokeOpacity: 0.32, strokeWidth: 2.6 * s, fill: 'none', strokeDasharray: `${5 * s} ${4 * s}`, strokeLinecap: 'round', strokeLinejoin: 'round' })));
    if (o.route) {
      const parts = splitAt(o.route, o.t || 0);
      ch.push(h('path', { key: k++, d: pd(o.route), stroke: c.routeCase, strokeWidth: 9 * s, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' }));
      ch.push(h('path', { key: k++, d: pd(parts[0]), stroke: c.done, strokeWidth: 5 * s, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' }));
      ch.push(h('path', { key: k++, d: pd(parts[1]), stroke: c.route, strokeWidth: 5 * s, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' }));
    }
    (o.markers || []).forEach((m) => {
      const r = 7 * s * (m.sz || 1), fill = m.color || c.pin, g = [];
      if (m.type === 'ring') g.push(h('circle', { key: 1, r: m.r, fill: m.color, fillOpacity: 0.07, stroke: m.color, strokeWidth: 1.6 * s, strokeDasharray: `${6 * s} ${4 * s}` }));
      else if (m.type === 'drop') g.push(h('rect', { key: 1, x: -r, y: -r, width: 2 * r, height: 2 * r, rx: 2 * s, fill, stroke: c.pinRing, strokeWidth: 2 * s }), h('rect', { key: 2, x: -r * 0.36, y: -r * 0.36, width: r * 0.72, height: r * 0.72, fill: c.pinRing }));
      else if (m.type === 'me') g.push(h('circle', { key: 1, r: r * 2.5, fill: '#2F6FB3', fillOpacity: 0.16 }), h('circle', { key: 2, r: r * 0.85, fill: '#2F6FB3', stroke: '#fff', strokeWidth: 2.5 * s }));
      else if (m.type === 'req') g.push(h('rect', { key: 1, x: -r * 0.8, y: -r * 0.8, width: r * 1.6, height: r * 1.6, transform: 'rotate(45)', fill, stroke: '#fff', strokeWidth: 1.8 * s }));
      else g.push(h('circle', { key: 1, r, fill, stroke: c.pinRing, strokeWidth: 2 * s }), h('circle', { key: 2, r: r * 0.36, fill: c.pinRing }));
      if (m.label) g.push(h('text', { key: 3, x: r + 5 * s, y: 4 * s, fontSize: 11 * s, fontWeight: 700, fill: c.text, stroke: c.halo, strokeWidth: 3.5 * s, paintOrder: 'stroke', style: font }, m.label));
      ch.push(h('g', { key: k++, transform: `translate(${m.x} ${m.y})`, onClick: m.onClick, style: m.onClick ? { cursor: 'pointer' } : undefined }, g));
    });
    (o.drivers || []).forEach((d) => {
      const r = 6.5 * s * (d.big ? 1.45 : 1), g = [];
      if (d.pulse) g.push(h('circle', { key: 0, r: r * 2.6, fill: d.color, fillOpacity: 0.18 }));
      if (d.sel) g.push(h('circle', { key: 1, r: r * 2.1, fill: 'none', stroke: c.pin, strokeWidth: 2 * s }));
      g.push(h('g', { key: 2, transform: `rotate(${d.a || 0})` }, h('path', { d: `M0 ${-r * 2} L${r * 0.8} ${-r * 1.02} L${-r * 0.8} ${-r * 1.02}Z`, fill: d.color }), h('circle', { r, fill: d.color, stroke: '#fff', strokeWidth: 2.2 * s })));
      if (d.label) g.push(h('text', { key: 3, x: r + 6 * s, y: 4 * s, fontSize: 10.5 * s, fontWeight: 700, fill: c.text, stroke: c.halo, strokeWidth: 3.5 * s, paintOrder: 'stroke', style: font }, d.label));
      ch.push(h('g', { key: 'drv-' + d.id, style: { transform: `translate(${d.x}px, ${d.y}px)`, transition: 'transform .22s linear', cursor: d.onClick ? 'pointer' : 'default' }, onClick: d.onClick }, g));
    });
    return h('svg', { viewBox: vb.map((n) => n.toFixed(1)).join(' '), preserveAspectRatio: o.fit || 'xMidYMid slice', style: { width: '100%', height: '100%', display: 'block' }, role: 'img', 'aria-label': o.label || 'Map' }, ch);
  }
  function fitVB(pts, aspect, pad, minW) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    let w = Math.max(x1 - x0 + pad * 2, minW || 110), hh = Math.max(y1 - y0 + pad * 2, (minW || 110) / aspect);
    if (w / hh < aspect) w = hh * aspect; else hh = w / aspect;
    return [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - hh / 2, w, hh];
  }
  function sheetVB(pts, wpx, topPx, totalPx, pad, minW) { const vb = fitVB(pts, wpx / topPx, pad, minW); return [vb[0], vb[1], vb[2], totalPx * vb[2] / wpx]; }

  window.OLU = { multiRoute, tripRoute, radiusKm, kmTo, claim, declineOffer, clearOffers, BASE_T, P, PP, PRICING0, CUST_HIST, ST, TONE, MCOL, sv, dsv, rs, r10, quoteFor, getRoute, routePts, pathLen, pointAt, remKm, KM, dist, pad2, mmss, hhmm, clk, initials, first, initState, clone, Dget, setSt, logB, toast, newBooking, assign, accept, reject, arrive, start, complete, pay, cancelB, reassign, suggest, tick, mapEl, fitVB, sheetVB };
})();
