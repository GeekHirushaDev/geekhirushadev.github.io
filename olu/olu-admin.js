// OLU CABS admin modules: seed data + view-model builder for the generic module screen.
(function () {
  const MONO = "'IBM Plex Mono',monospace";
  const MODS = ['Bookings', 'Dispatch', 'Drivers', 'Customers', 'Pricing', 'Payments', 'Reports', 'Settings', 'Audit logs'];
  const PT = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export'];
  const ROLES = ['Super Admin', 'Admin', 'Dispatcher', 'Accountant', 'Manager'];
  function perms() {
    const rule = {
      'Super Admin': () => true,
      Admin: (m, p) => !(m === 'Audit logs' && p === 'Delete'),
      Dispatcher: (m, p) => (['Bookings', 'Dispatch', 'Customers'].includes(m) && p !== 'Delete' && p !== 'Approve') || (m === 'Drivers' && p === 'View'),
      Accountant: (m, p) => m === 'Payments' || (m === 'Reports' && (p === 'View' || p === 'Export')) || (m === 'Bookings' && p === 'View'),
      Manager: (m, p) => p === 'View' || p === 'Export' || p === 'Approve',
    };
    const o = {}; ROLES.forEach((r) => { o[r] = {}; MODS.forEach((m) => PT.forEach((p) => { o[r][m + '|' + p] = !!rule[r](m, p); })); });
    return o;
  }
  function initExtra(pr) {
    const O = window.OLU;
    const zone = (z, area, km, fixed) => ({ id: z, zone: z, area, km, active: true, prices: Object.fromEntries(pr.map((v) => [v.id, fixed ? v.airport : O.r10(Math.max(v.airport, km * v.oneway))])) });
    return {
      settings: { radius: 7, offerSecs: 20, stopFee: 300, freeWait: 10, waitRate: 15, cancelFee: 500, autoBroadcast: true, matchClass: true, sms: true, email: true, wa: true, cash: true, card: true, bank: true, twofa: true, session: 30, bizName: 'OLU Cabs (Pvt) Ltd', bizPhone: '+94 11 250 4400', bizEmail: 'hello@olucabs.lk', bizAddr: '42 Galle Road, Colombo 03', branches: 'Colombo HQ, Negombo, Kandy' },
      vehiclesX: [{ plate: 'CAL-2210', car: 'Toyota Axio', cat: 'sedan', driverId: null, status: 'active', docs: 'Valid' }, { plate: 'PH-7781', car: 'Toyota KDH', cat: 'van', driverId: null, status: 'maintenance', docs: 'Fitness due 10 Oct' }],
      vehStatus: {},
      customersX: [{ name: 'Amaya Wijesinghe', phone: '+94 77 412 6630', email: 'amaya.w@gmail.com', since: 'Mar 2025', places: 'Home · Rajagiriya, Work · WTC Colombo 01' }],
      custNotes: { 'Amaya Wijesinghe': 'Frequent BIA transfers. Prefers sedan.' }, custBlocked: {},
      zones: [zone('Negombo', 'Negombo · Katunayake', 12, true), zone('Colombo 01–07', 'Fort · Kollupitiya · Cinnamon Gdns', 33, true), zone('Colombo 08–15', 'Borella · Rajagiriya · Wellawatte', 37, true), zone('Mount Lavinia', 'Dehiwala · Mount Lavinia', 45, false), zone('Kandy', 'Kandy city', 112, false), zone('Galle', 'Galle · Unawatuna', 150, false), zone('Sigiriya / Dambulla', 'Cultural triangle', 150, false)],
      airport: { night: 20, nightHrs: '22:00–05:00', wait: 45, paxFee: 500, meet: 1000 },
      tours: [
        { id: 'TR-01', name: 'Kandy Heritage Day Tour', days: '1 day', price: 24500, dest: 'Pinnawala · Temple of the Tooth · Peradeniya', veh: 'Sedan, SUV, Van', inc: 'Driver, fuel, expressway tolls', exc: 'Entry tickets, meals', status: 'active', month: 14 },
        { id: 'TR-02', name: 'Sigiriya & Dambulla', days: '1 day', price: 27500, dest: 'Dambulla Cave Temple · Sigiriya Rock', veh: 'Sedan, SUV, Van', inc: 'Driver, fuel, water', exc: 'Entry tickets', status: 'active', month: 11 },
        { id: 'TR-03', name: 'Galle Fort & South Coast', days: '1 day', price: 21000, dest: 'Bentota · Galle Fort · Unawatuna', veh: 'Sedan, Crossover, Van', inc: 'Driver, fuel, tolls', exc: 'Meals, boat ride', status: 'active', month: 9 },
        { id: 'TR-04', name: 'Ella Hill Country', days: '2 days', price: 58000, dest: 'Nuwara Eliya · Ella · Nine Arch Bridge', veh: 'SUV, Van', inc: 'Driver stay, fuel', exc: 'Hotel, meals', status: 'active', month: 5 },
        { id: 'TR-05', name: 'Yala Safari Escape', days: '2 days', price: 64000, dest: 'Tissamaharama · Yala National Park', veh: 'SUV, Van', inc: 'Driver stay, fuel', exc: 'Jeep safari, park fees', status: 'active', month: 3 },
        { id: 'TR-06', name: 'Colombo City Highlights', days: 'Half day', price: 9500, dest: 'Gangaramaya · Galle Face · Pettah', veh: 'Mini, Sedan', inc: 'Driver, fuel', exc: 'Entry tickets', status: 'inactive', month: 0 },
      ],
      quotes: [
        { id: 'QT-0419', cust: 'Hotel Galadari', trip: 'Weekly airport shuttle · Oct', from: 'fort', to: 'bia', req: '6 Oct', created: '4 Oct', amt: null, status: 'Draft', veh: 'van' },
        { id: 'QT-0418', cust: 'Lukas Becker', trip: 'Colombo → Sigiriya → Kandy · 2 days', from: 'cinnamon', to: 'kandy', req: '12 Oct', created: '2 Oct', amt: 61500, status: 'Sent', veh: 'suv' },
        { id: 'QT-0417', cust: 'Priya Raman', trip: 'Galle Fort day tour', from: 'kingsbury', to: 'galle', req: '9 Oct', created: '1 Oct', amt: 22000, status: 'Approved', veh: 'sedan' },
        { id: 'QT-0416', cust: 'Virtusa HR', trip: 'Staff offsite · 3 vans', from: 'rajagiriya', to: 'negombo', req: '15 Oct', created: '30 Sep', amt: 54000, status: 'Viewed', veh: 'van' },
        { id: 'QT-0415', cust: 'Chen Wei', trip: 'Yala Safari Escape', from: 'cinnamon', to: 'yala', req: '28 Sep', created: '20 Sep', amt: 66000, status: 'Expired', veh: 'suv' },
        { id: 'QT-0414', cust: 'Fernando wedding', trip: 'Wedding fleet · 4 sedans', from: 'kelaniya', to: 'majestic', req: '26 Sep', created: '18 Sep', amt: 48000, status: 'Converted', veh: 'sedan' },
      ],
      stl: { d1: 'Pending', d2: 'Submitted', d3: 'Approved', d4: 'Paid', d5: 'Disputed', d6: 'Paid', d7: 'Submitted', d8: 'Pending', d9: 'Approved', d10: 'Pending' },
      users: [
        { id: 'u1', name: 'Ashan Wijeratne', email: 'ashan@olucabs.lk', role: 'Super Admin', last: 'Today 09:12', active: true },
        { id: 'u2', name: 'Dilani Ratnayake', email: 'dilani@olucabs.lk', role: 'Dispatcher', last: 'Online now', active: true },
        { id: 'u3', name: 'Kevin Mendis', email: 'kevin@olucabs.lk', role: 'Admin', last: 'Today 08:40', active: true },
        { id: 'u4', name: 'Malsha Herath', email: 'malsha@olucabs.lk', role: 'Accountant', last: 'Yesterday 17:55', active: true },
        { id: 'u5', name: 'Roshan Peiris', email: 'roshan@olucabs.lk', role: 'Manager', last: '2 Oct 16:20', active: true },
        { id: 'u6', name: 'Sachini Alwis', email: 'sachini@olucabs.lk', role: 'Dispatcher', last: '28 Sep 22:10', active: false },
      ],
      perms: perms(),
      applications: [{ id: 'APP-0091', name: 'Ravindu Karunaratne', phone: '+94 77 645 2290', nic: '199512304567', cat: 'crossover', model: 'Toyota Raize', plate: 'CBK-4412', docs: 'Licence · Insurance', status: 'pending', at: '09:20' }],
      auditSeed: [
        { at: '3 Oct 18:42', user: 'Malsha Herath', text: 'Accountant approved driver settlement — Dinesh Jayawardena', module: 'Settlements' },
        { at: '3 Oct 16:05', user: 'Kevin Mendis', text: 'Admin created tour package Yala Safari Escape', module: 'Tours' },
        { at: '3 Oct 11:30', user: 'Dilani Ratnayake', text: 'Dispatcher reassigned booking OLU-20261003-1024', module: 'Dispatch' },
        { at: '2 Oct 20:14', user: 'Ashan Wijeratne', text: 'Super Admin changed Dispatcher role permissions', module: 'Users' },
      ],
    };
  }

  const stop = (fn) => (e) => { if (e && e.stopPropagation) e.stopPropagation(); fn && fn(e); };
  const btn = (label, onClick, kind) => ({ label, onClick: stop(onClick), bg: kind === 'p' ? '#121519' : '#FFFFFF', fg: kind === 'p' ? '#FFFFFF' : kind === 'd' ? '#8A2318' : '#121519', bd: kind === 'p' ? '#121519' : kind === 'd' ? '#E8B9B2' : '#DAD6CE' });
  const badge = (label, tone) => { const t = window.OLU.TONE[tone] || window.OLU.TONE.neutral; return { isBadge: true, label, bg: t.bg, fg: t.fg, dot: t.dot }; };
  const tx = (t, sub, o) => { o = o || {}; return { isText: true, t: t == null ? '' : String(t), s: sub || '', hasS: !!sub, ff: o.mono ? MONO : 'inherit', fw: o.b ? 800 : o.m ? 600 : 500, ta: o.r ? 'right' : 'left', fs: o.mono ? '11.5px' : '12.5px', fg: o.fg || '#121519' }; };
  const tog = (on, onClick) => ({ isTog: true, on, onClick: stop(onClick), bg: on ? '#121519' : '#CFCBC3', left: on ? '18px' : '2px' });
  const col = (label, r) => ({ label, ta: r ? 'right' : 'left' });
  const chip = (label, active, onClick, n) => ({ label, n: n == null ? '' : String(n), bg: active ? '#121519' : '#FFFFFF', fg: active ? '#FFFFFF' : '#4A4740', bd: active ? '#121519' : '#E1DED7', onClick });
  const field = (label, value, onChange, o) => {
    o = o || {};
    const opts = (o.opts || []).map((x) => (typeof x === 'string' ? { v: x, l: x } : x));
    return { label, sub: o.sub || '', hasSub: !!o.sub, isText: !o.opts && !o.tog, isSelect: !!o.opts, isTog: !!o.tog, value: value == null ? '' : String(value), on: !!value, onChange: (e) => onChange(e.target.value), onToggle: () => onChange(!value), opts, tbg: value ? '#121519' : '#CFCBC3', tleft: value ? '20px' : '2px', suffix: o.suffix || '', hasSuffix: !!o.suffix, prefix: o.prefix || '', hasPrefix: !!o.prefix, ph: o.ph || '', bd: o.err ? '#C8382C' : '#DAD6CE', w: o.w || '100%' };
  };
  function csv(name, head, rows) {
    const body = [head].concat(rows).map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' })); a.download = name; a.click();
  }
  const nearestPlace = (x, y) => { const P = window.OLU.P; let b = null, bd = 1e9; for (const k in P) { const d = Math.hypot(P[k].x - x, P[k].y - y); if (d < bd) { bd = d; b = k; } } return P[b].short; };

  function build(self, s) {
    const O = window.OLU, P = O.P, rs = O.rs;
    const as = s.aScreen;
    const set = (o) => () => self.setState(o);
    const mut = (fn) => self.mutate(fn);
    const audit = (w, text, module, user) => { w.activity = [{ id: Math.random(), at: O.clk(w), text, kind: 'info', user: user || 'Dilani Ratnayake', module }, ...w.activity].slice(0, 120); };
    const vehName = (id) => (s.pricing.find((v) => v.id === id) || {}).name || id;
    const catOpts = s.pricing.map((v) => ({ v: v.id, l: v.name }));
    const filt = s.mFilter || 'All', q = (s.mQuery || '').trim().toLowerCase();
    const D = s.drawer;
    const dval = (k) => (D && D.data ? D.data[k] : '');
    const dset = (k) => (v) => self.setState((st) => ({ drawer: { ...st.drawer, err: '', data: { ...st.drawer.data, [k]: v } } }));
    const dfld = (label, k, o) => field(label, dval(k), dset(k), o);
    const openD = (kind, id, title, data, sub) => self.setState({ drawer: { kind, id, title, sub: sub || '', data: { ...data }, err: '' } });
    const closeD = () => self.setState({ drawer: null });
    const derr = (m) => self.setState((st) => ({ drawer: { ...st.drawer, err: m } }));
    const fd = s.formDraft && s.formDraft._scr === as ? s.formDraft : null;
    const fset = (base) => (k) => (v) => self.setState((st) => ({ formDraft: { ...(st.formDraft && st.formDraft._scr === as ? st.formDraft : { ...base, _scr: as }), [k]: v } }));
    const M = { title: '', sub: '', actions: [], chips: null, chips2: null, search: false, metrics: null, chart: null, cols: null, rows: null, cards: null, matrix: null, form: null, empty: 'Nothing to show.' };
    const chips = (list, key, counts) => list.map((c) => chip(c, (s[key] || list[0]) === c, set({ [key]: c }), counts ? counts[c] : null));
    let dr = null; // drawer view model

    if (as === 'vehicles') {
      const vs = s.drivers.map((d) => ({ key: d.plate, plate: d.plate, car: d.car, cat: d.cat, driver: d, status: (s.vehStatus || {})[d.plate] || 'active', docs: d.id === 'd1' ? 'Insurance due 22 Oct' : 'Valid', own: true, loc: nearestPlace(d.x, d.y) }))
        .concat((s.vehiclesX || []).map((v) => ({ ...v, key: v.plate, driver: v.driverId ? s.drivers.find((d) => d.id === v.driverId) : null, own: false, loc: 'Colombo HQ yard' })));
      const ST = { active: ['Active', 'success'], maintenance: ['Maintenance', 'warning'], inactive: ['Inactive', 'neutral'] };
      const F = { All: () => true, Active: (v) => v.status === 'active', Maintenance: (v) => v.status === 'maintenance', Inactive: (v) => v.status === 'inactive' };
      const list = vs.filter(F[filt] || F.All).filter((v) => !q || (v.plate + v.car + (v.driver ? v.driver.name : '')).toLowerCase().includes(q));
      Object.assign(M, { title: 'Vehicles', sub: 'Every vehicle in the fleet, its driver and document status.', search: true, chips: Object.keys(F).map((k) => chip(k, filt === k, set({ mFilter: k }), vs.filter(F[k]).length)) });
      M.metrics = [['Fleet size', vs.length, 'vehicles registered'], ['Active', vs.filter((v) => v.status === 'active').length, 'available for dispatch'], ['On a job', s.drivers.filter((d) => ['assigned', 'enroute', 'arrived', 'ontrip'].includes(d.status)).length, 'right now'], ['Needs attention', vs.filter((v) => v.status === 'maintenance' || v.docs !== 'Valid').length, 'maintenance or documents']];
      M.actions = [btn('Add vehicle', () => openD('veh-new', null, 'Add vehicle', { plate: '', car: '', cat: 'sedan', driverId: '', status: 'active' }), 'p')];
      M.cols = [col('Vehicle'), col('Class'), col('Driver'), col('Capacity'), col('Location'), col('Documents'), col('Status')];
      M.rows = list.map((v) => {
        const pr = s.pricing.find((x) => x.id === v.cat) || {};
        return { cells: [tx(v.plate, v.car, { mono: false, m: true }), tx(vehName(v.cat)), tx(v.driver ? v.driver.name : 'Unassigned', v.driver ? O.dsv(v.driver.status).sLabel : '', { fg: v.driver ? '#121519' : '#A0620A' }), tx(`${pr.pax || '-'} pax · ${pr.bags || '-'} bags`), tx(v.loc), tx(v.docs, '', { fg: v.docs === 'Valid' ? '#1D5E3A' : '#7A4A06', m: true }), badge(...ST[v.status])],
          actions: [btn('Edit', () => openD('veh', v.key, 'Edit ' + v.plate, { car: v.car, cat: v.cat, status: v.status, driverId: v.driverId || '' }, v.own ? 'Driver-owned · ' + v.driver.name : 'Company vehicle')), v.status === 'inactive' ? btn('Activate', () => saveVeh(v, { status: 'active' })) : btn('Deactivate', () => saveVeh(v, { status: 'inactive' }), 'd')] };
      });
      M.empty = 'No vehicles match.';
      function saveVeh(v, patch) {
        mut((w) => {
          if (v.own) { const d = O.Dget(w, v.driver.id); if (patch.car) d.car = patch.car; if (patch.cat) d.cat = patch.cat; if (patch.status) { w.vehStatus = { ...(w.vehStatus || {}), [v.plate]: patch.status }; if (patch.status !== 'active' && d.status === 'available') d.status = 'offline'; } }
          else w.vehiclesX = w.vehiclesX.map((x) => (x.plate === v.plate ? { ...x, ...patch, driverId: patch.driverId !== undefined ? patch.driverId || null : x.driverId } : x));
          audit(w, `Admin updated vehicle ${v.plate}${patch.status ? ' · ' + patch.status : ''}`, 'Vehicles', 'Kevin Mendis');
          O.toast(w, 'admin', `Vehicle ${v.plate} updated`, 'ok');
        });
      }
      if (D && (D.kind === 'veh' || D.kind === 'veh-new')) {
        const v = vs.find((x) => x.key === D.id);
        const isNew = D.kind === 'veh-new';
        const drvOpts = [{ v: '', l: 'Unassigned' }].concat(s.drivers.map((d) => ({ v: d.id, l: d.name })));
        dr = { fields: [isNew ? dfld('Registration number', 'plate', { ph: 'CAB-1234' }) : null, dfld('Make & model', 'car', { ph: 'Toyota Prius' }), dfld('Vehicle class', 'cat', { opts: catOpts }), dfld('Status', 'status', { opts: [{ v: 'active', l: 'Active' }, { v: 'maintenance', l: 'Maintenance' }, { v: 'inactive', l: 'Inactive' }] }), isNew || (v && !v.own) ? dfld('Assigned driver', 'driverId', { opts: drvOpts }) : null].filter(Boolean),
          btns: [btn(isNew ? 'Add vehicle' : 'Save changes', () => {
            const d = D.data;
            if (isNew && !/^[A-Z]{2,3}-\d{4}$/.test((d.plate || '').trim().toUpperCase())) return derr('Registration must look like CAB-1234');
            if (isNew && vs.some((x) => x.plate === d.plate.trim().toUpperCase())) return derr('That registration is already in the fleet');
            if (!String(d.car || '').trim()) return derr('Enter the make and model');
            if (isNew) mut((w) => { const plate = d.plate.trim().toUpperCase(); w.vehiclesX = [...w.vehiclesX, { plate, car: d.car.trim(), cat: d.cat, driverId: d.driverId || null, status: d.status, docs: 'Pending upload' }]; audit(w, `Admin added vehicle ${plate} (${vehName(d.cat)})`, 'Vehicles', 'Kevin Mendis'); O.toast(w, 'admin', `Vehicle ${plate} added to fleet`, 'ok'); });
            else saveVeh(v, { car: d.car.trim(), cat: d.cat, status: d.status, driverId: d.driverId });
            closeD();
          }, 'p'), btn('Cancel', closeD)] };
      }
    }

    if (as === 'customers') {
      const map = {};
      (s.customersX || []).forEach((c) => { map[c.name] = { ...c, bookings: [], reg: true }; });
      s.bookings.forEach((b) => { if (!map[b.cust]) map[b.cust] = { name: b.cust, phone: b.phone, email: b.cust.toLowerCase().replace(/[^a-z]+/g, '.') + '@mail.com', since: 'Oct 2026', places: '—', bookings: [] }; map[b.cust].bookings.push(b); });
      const all = Object.values(map).map((c) => ({ ...c, spent: c.bookings.filter((b) => b.paid).reduce((a, b) => a + b.paidAmt, 0), last: c.bookings[0] ? c.bookings[0].created : '—', blocked: !!(s.custBlocked || {})[c.name] }));
      const F = { All: () => true, Active: (c) => !c.blocked, Blocked: (c) => c.blocked, Registered: (c) => c.reg };
      const list = all.filter(F[filt] || F.All).filter((c) => !q || (c.name + c.phone + c.email).toLowerCase().includes(q));
      Object.assign(M, { title: 'Customers', sub: 'Everyone who has booked or registered, with history and notes.', search: true, chips: Object.keys(F).map((k) => chip(k, filt === k, set({ mFilter: k }), all.filter(F[k]).length)) });
      M.metrics = [['Customers', all.length, 'with an account or booking'], ['Booked today', all.filter((c) => c.bookings.length).length, 'unique customers'], ['Revenue', rs(all.reduce((a, c) => a + c.spent, 0)), 'paid today'], ['Registered', all.filter((c) => c.reg).length, 'via web / PWA']];
      M.cols = [col('Customer'), col('Email'), col('Bookings', 1), col('Total spent', 1), col('Last booking'), col('Status')];
      const toggleBlock = (c) => mut((w) => { w.custBlocked = { ...(w.custBlocked || {}), [c.name]: !c.blocked }; audit(w, `Admin ${c.blocked ? 'unblocked' : 'blocked'} customer ${c.name}`, 'Customers', 'Kevin Mendis'); O.toast(w, 'admin', `${c.name} ${c.blocked ? 'unblocked' : 'blocked'}`, c.blocked ? 'ok' : 'warn'); });
      const view = (c) => openD('cust', c.name, c.name, { notes: (s.custNotes || {})[c.name] || '' }, `${c.phone} · ${c.email}`);
      M.rows = list.map((c) => ({ onClick: () => view(c), cells: [tx(c.name, c.phone, { m: true }), tx(c.email), tx(c.bookings.length, '', { r: true }), tx(rs(c.spent), '', { r: true, b: true }), tx(c.last, '', { mono: true }), c.blocked ? badge('Blocked', 'danger') : badge(c.reg ? 'Registered' : 'Guest', c.reg ? 'success' : 'neutral')], actions: [btn('View', () => view(c)), btn(c.blocked ? 'Unblock' : 'Block', () => toggleBlock(c), c.blocked ? null : 'd')] }));
      if (D && D.kind === 'cust') {
        const c = all.find((x) => x.name === D.id);
        if (c) dr = { rows: [['Customer since', c.since], ['Saved places', c.places], ['Total spent', rs(c.spent)]].concat(c.bookings.map((b) => [b.id.slice(-4) + ' · ' + P[b.from].short + ' → ' + P[b.to].short, (b.status === 'quote' ? 'Quote' : rs(b.fare)) + ' · ' + O.sv(b.status).sLabel])).map(([k, v]) => ({ k, v })),
          fields: [dfld('Internal notes', 'notes', { ph: 'Preferences, VIP, special handling…' })],
          btns: [btn('Save notes', () => { mut((w) => { w.custNotes = { ...(w.custNotes || {}), [c.name]: D.data.notes }; audit(w, `Admin updated notes for ${c.name}`, 'Customers', 'Kevin Mendis'); O.toast(w, 'admin', 'Customer notes saved', 'ok'); }); closeD(); }, 'p'), btn('Close', closeD)] };
      }
    }

    if (as === 'airport') {
      const show = ['mini', 'sedan', 'suv', 'van'];
      Object.assign(M, { title: 'Airport transfers', sub: 'Fixed BIA fares by zone and vehicle class. Colombo zones follow the airport drop rate in Pricing.' });
      M.cols = [col('Zone'), col('From BIA', 1)].concat(show.map((k) => col(vehName(k), 1))).concat([col('Active')]);
      M.rows = s.zones.map((z) => ({ onClick: () => openD('zone', z.id, z.zone, { ...z.prices, active: z.active }, z.area + ' · ' + z.km + ' km'), cells: [tx(z.zone, z.area, { m: true }), tx(z.km + ' km', '', { r: true })].concat(show.map((k) => tx(rs(z.prices[k]), '', { r: true, b: true }))).concat([tog(z.active, () => mut((w) => { w.zones = w.zones.map((x) => (x.id === z.id ? { ...x, active: !x.active } : x)); audit(w, `Admin ${z.active ? 'disabled' : 'enabled'} airport zone ${z.zone}`, 'Pricing', 'Kevin Mendis'); O.toast(w, 'admin', `${z.zone} ${z.active ? 'disabled' : 'enabled'}`, 'ok'); }))]), actions: [btn('Edit', () => openD('zone', z.id, z.zone, { ...z.prices, active: z.active }, z.area + ' · ' + z.km + ' km'))] }));
      const base = s.airport, cur = fd || base, f = fset(base);
      M.form = [{ title: 'Airport rules', fields: [field('Night surcharge', cur.night, f('night'), { suffix: '%', w: '120px' }), field('Night hours', cur.nightHrs, f('nightHrs'), { w: '160px' }), field('Free waiting at arrivals', cur.wait, f('wait'), { suffix: 'min', w: '120px' }), field('Extra passenger fee', cur.paxFee, f('paxFee'), { prefix: 'Rs.', w: '140px', sub: 'Above vehicle capacity' }), field('Meet & greet', cur.meet, f('meet'), { prefix: 'Rs.', w: '140px' })] }];
      M.formSave = () => { if (!fd) return; const { _scr, ...v } = fd; if ([v.night, v.wait, v.paxFee, v.meet].some((x) => !(Number(x) >= 0) || x === '')) return mut((w) => O.toast(w, 'admin', 'Enter valid numbers for every rule', 'warn')); mut((w) => { w.airport = { ...v }; w.formDraft = null; audit(w, 'Admin changed airport transfer rules', 'Pricing', 'Kevin Mendis'); O.toast(w, 'admin', 'Airport rules saved', 'ok'); }); };
      if (D && D.kind === 'zone') {
        dr = { fields: s.pricing.map((v) => dfld(v.name, v.id, { prefix: 'Rs.' })).concat([dfld('Zone active', 'active', { tog: true })]),
          btns: [btn('Save zone', () => { const d = D.data; if (s.pricing.some((v) => !(Number(d[v.id]) > 0))) return derr('Every price must be greater than zero'); mut((w) => { w.zones = w.zones.map((z) => (z.id === D.id ? { ...z, active: !!d.active, prices: Object.fromEntries(s.pricing.map((v) => [v.id, Number(d[v.id])])) } : z)); audit(w, `Admin changed ${D.id} airport transfer pricing`, 'Pricing', 'Kevin Mendis'); O.toast(w, 'admin', `${D.id} pricing saved`, 'ok'); }); closeD(); }, 'p'), btn('Cancel', closeD)] };
      }
    }

    if (as === 'tours') {
      const F = { All: () => true, Active: (t) => t.status === 'active', Inactive: (t) => t.status !== 'active' };
      const list = s.tours.filter(F[filt] || F.All).filter((t) => !q || (t.name + t.dest).toLowerCase().includes(q));
      Object.assign(M, { title: 'Tours & packages', sub: 'Packages shown on the customer site. Inactive packages are hidden from booking.', search: true, chips: Object.keys(F).map((k) => chip(k, filt === k, set({ mFilter: k }), s.tours.filter(F[k]).length)) });
      M.metrics = [['Active packages', s.tours.filter((t) => t.status === 'active').length, 'bookable now'], ['Booked this month', s.tours.reduce((a, t) => a + t.month, 0), 'tour bookings'], ['Tour revenue', rs(s.tours.reduce((a, t) => a + t.month * t.price, 0)), 'October to date']];
      const blank = { name: '', days: '1 day', price: '', dest: '', veh: 'Sedan, SUV, Van', inc: 'Driver, fuel', exc: '', status: 'active' };
      M.actions = [btn('Create package', () => openD('tour-new', null, 'Create package', blank), 'p')];
      M.cards = list.map((t) => ({ name: t.name, days: t.days, price: 'from ' + rs(t.price), dest: t.dest, veh: t.veh, month: t.month + ' booked this month', ...(() => { const b = badge(t.status === 'active' ? 'Active' : 'Inactive', t.status === 'active' ? 'success' : 'neutral'); return { bBg: b.bg, bFg: b.fg, bLabel: b.label }; })(), edit: () => openD('tour', t.id, 'Edit package', t, t.id), toggleLabel: t.status === 'active' ? 'Deactivate' : 'Activate', toggle: () => mut((w) => { w.tours = w.tours.map((x) => (x.id === t.id ? { ...x, status: x.status === 'active' ? 'inactive' : 'active' } : x)); audit(w, `Admin ${t.status === 'active' ? 'deactivated' : 'activated'} package ${t.name}`, 'Tours', 'Kevin Mendis'); O.toast(w, 'admin', `${t.name} ${t.status === 'active' ? 'hidden from customers' : 'is now bookable'}`, 'ok'); }) }));
      M.empty = 'No packages match.';
      if (D && (D.kind === 'tour' || D.kind === 'tour-new')) {
        const isNew = D.kind === 'tour-new';
        dr = { fields: [dfld('Package name', 'name', { ph: 'e.g. Kandy Heritage Day Tour' }), dfld('Duration', 'days', { opts: ['Half day', '1 day', '2 days', '3 days', '5 days'] }), dfld('Base price', 'price', { prefix: 'Rs.' }), dfld('Destinations & stops', 'dest', { ph: 'Separate with ·' }), dfld('Vehicle categories', 'veh'), dfld('Included', 'inc'), dfld('Excluded', 'exc'), dfld('Status', 'status', { opts: [{ v: 'active', l: 'Active' }, { v: 'inactive', l: 'Inactive' }] })],
          btns: [btn('Save package', () => { const d = D.data; if (!String(d.name).trim()) return derr('Give the package a name'); if (!(Number(d.price) > 0)) return derr('Base price must be greater than zero'); if (!String(d.dest).trim()) return derr('Add at least one destination'); mut((w) => { if (isNew) w.tours = [{ ...d, id: 'TR-' + String(w.tours.length + 1).padStart(2, '0'), price: Number(d.price), month: 0 }, ...w.tours]; else w.tours = w.tours.map((x) => (x.id === D.id ? { ...x, ...d, price: Number(d.price) } : x)); audit(w, `Admin ${isNew ? 'created' : 'updated'} tour package ${d.name}`, 'Tours', 'Kevin Mendis'); O.toast(w, 'admin', `Package ${isNew ? 'created' : 'saved'} · ${d.name}`, 'ok'); }); closeD(); }, 'p'), isNew ? btn('Cancel', closeD) : btn('Delete package', () => { mut((w) => { w.tours = w.tours.filter((x) => x.id !== D.id); audit(w, `Admin deleted tour package ${D.data.name}`, 'Tours', 'Kevin Mendis'); O.toast(w, 'admin', 'Package deleted', 'warn'); }); closeD(); }, 'd')] };
      }
    }

    if (as === 'quotes') {
      const live = s.bookings.filter((b) => b.svc === 'tour').map((b) => ({ id: 'QR-' + b.id.slice(-4), bookingId: b.id, cust: b.cust, trip: [b.from, ...(b.stops || []), b.to].map((k) => P[k].short).join(' → '), from: b.from, to: b.to, req: 'Today', created: b.created, amt: b.quote ? b.quote.amt : null, status: b.status !== 'quote' ? 'Converted' : b.quote ? b.quote.status : 'Requested', veh: b.veh, km: b.km }));
      const all = live.concat(s.quotes);
      const TONE = { Requested: 'warning', Draft: 'neutral', Sent: 'info', Viewed: 'info', Approved: 'success', Rejected: 'danger', Expired: 'neutral', Converted: 'live' };
      const F = ['All', 'Requested', 'Draft', 'Sent', 'Approved', 'Expired', 'Converted'];
      const list = all.filter((x) => filt === 'All' || x.status === filt || (filt === 'Sent' && x.status === 'Viewed')).filter((x) => !q || (x.id + x.cust + x.trip).toLowerCase().includes(q));
      Object.assign(M, { title: 'Quotations', sub: 'Tour and custom-trip requests from customers. Build a price, send it, convert on approval.', search: true, chips: F.map((k) => chip(k, filt === k, set({ mFilter: k }), k === 'All' ? all.length : all.filter((x) => x.status === k).length)) });
      const openQ = (x) => { const v = s.pricing.find((p) => p.id === x.veh) || s.pricing[2]; const base = x.amt || O.r10((x.km || 60) * v.oneway * 1.1); openD('quote', x.id, 'Quotation ' + x.id, { veh: x.veh, days: '1', base: String(base), extras: '0', disc: '0', valid: '11 Oct 2026', notes: '' }, x.cust + ' · ' + x.trip); };
      const convert = (x, amt) => mut((w) => {
        if (x.bookingId) { const b = w.bookings.find((y) => y.id === x.bookingId); if (!b) return; b.fare = amt; b.quote = { ...(b.quote || {}), amt, status: 'Converted' }; O.setSt(w, b, 'awaiting'); b.broadcast = false; b.noNearby = true; O.logB(w, b, `Quotation converted to booking ${b.id} · ${rs(amt)}`, 'ok'); if (b.demo) O.toast(w, 'customer', 'Your quotation is confirmed as a booking', 'ok'); }
        else { w.quotes = w.quotes.map((y) => (y.id === x.id ? { ...y, status: 'Converted', amt } : y)); const nb = O.newBooking(w, { cust: x.cust, phone: '+94 77 000 0000', from: x.from, to: x.to, svc: 'ride', veh: x.veh, pay: 'Bank transfer' }); nb.fare = amt; nb.status = 'scheduled'; nb.when = x.req; nb.broadcast = false; w.bookings = [nb, ...w.bookings]; O.logB(w, nb, `Quotation ${x.id} converted to booking ${nb.id}`, 'ok'); }
        audit(w, `Admin converted quotation ${x.id} to a booking`, 'Quotations', 'Kevin Mendis'); O.toast(w, 'admin', `${x.id} converted to booking`, 'ok');
      });
      M.cols = [col('Quote'), col('Customer'), col('Trip'), col('Travel date'), col('Created'), col('Amount', 1), col('Status')];
      M.rows = list.map((x) => ({ onClick: ['Requested', 'Draft', 'Sent', 'Viewed'].includes(x.status) ? () => openQ(x) : null, cells: [tx(x.id, '', { mono: true }), tx(x.cust, '', { m: true }), tx(x.trip), tx(x.req), tx(x.created, '', { mono: true }), tx(x.amt ? rs(x.amt) : '—', '', { r: true, b: true }), badge(x.status, TONE[x.status])],
        actions: ['Requested', 'Draft', 'Sent', 'Viewed'].includes(x.status) ? [btn(x.status === 'Requested' ? 'Build quote' : 'Open', () => openQ(x), x.status === 'Requested' ? 'p' : null)] : x.status === 'Approved' ? [btn('Convert', () => convert(x, x.amt), 'p')] : [] }));
      if (D && D.kind === 'quote') {
        const x = all.find((y) => y.id === D.id);
        const d = D.data; const total = Math.max(0, O.r10((Number(d.base) || 0) * (Number(d.days) || 1) + (Number(d.extras) || 0)) * (1 - (Number(d.disc) || 0) / 100));
        const valid = () => { if (!(Number(d.base) > 0)) { derr('Base price must be greater than zero'); return false; } if (Number(d.disc) > 40) { derr('Discounts above 40% need Manager approval'); return false; } return true; };
        const saveQ = (status) => mut((w) => {
          if (x.bookingId) { const b = w.bookings.find((y) => y.id === x.bookingId); if (b) { b.quote = { amt: O.r10(total), status, valid: d.valid, veh: d.veh }; O.logB(w, b, `Quotation ${status === 'Sent' ? 'sent' : 'saved'} for ${b.id} · ${rs(total)}`, 'info'); if (status === 'Sent' && b.demo) O.toast(w, 'customer', `Your quotation is ready · ${rs(total)}`, 'live'); } }
          else w.quotes = w.quotes.map((y) => (y.id === x.id ? { ...y, amt: O.r10(total), status } : y));
          audit(w, `Admin ${status === 'Sent' ? 'sent' : 'saved draft'} quotation ${x.id} · ${rs(total)}`, 'Quotations', 'Kevin Mendis'); O.toast(w, 'admin', status === 'Sent' ? `Quotation sent to ${x.cust}` : 'Draft saved', 'ok');
        });
        if (x) dr = { fields: [dfld('Vehicle', 'veh', { opts: catOpts }), dfld('Days', 'days', { opts: ['1', '2', '3', '4', '5'] }), dfld('Price per day', 'base', { prefix: 'Rs.' }), dfld('Extras (tolls, permits, stay)', 'extras', { prefix: 'Rs.' }), dfld('Discount', 'disc', { suffix: '%' }), dfld('Valid until', 'valid'), dfld('Notes to customer', 'notes', { ph: 'Includes driver accommodation…' })],
          total: rs(total), btns: [btn('Send quote', () => { if (valid()) { saveQ('Sent'); closeD(); } }, 'p'), btn('Save draft', () => { if (valid()) { saveQ('Draft'); closeD(); } }), btn('Convert to booking', () => { if (valid()) { convert(x, O.r10(total)); closeD(); } })] };
      }
    }

    if (as === 'settlements') {
      const WK = [18, 14, 16, 11, 19, 0, 12, 9, 13, 0];
      const rows = s.drivers.filter((d) => !d.pending).map((d, i) => {
        let trips, gross, cash, exp;
        if (d.id === 'd1') { const kt = s.bookings.filter((b) => b.driverId === 'd1' && b.paid); const g = kt.reduce((a, b) => a + b.paidAmt, 0); trips = 18 + kt.length; gross = 64350 + g; cash = 41200 + kt.filter((b) => b.payMethod === 'Cash').reduce((a, b) => a + b.paidAmt, 0); exp = 11400; }
        else { trips = (WK[i] || 6) + d.trips; gross = trips * 3650; cash = Math.round(gross * 0.62); exp = trips * 520; }
        const comm = gross * s.commission / 100, net = comm - (gross - cash);
        return { d, trips, gross, cash, exp, comm, net, status: (s.stl || {})[d.id] || 'Pending' };
      });
      const TONE = { Pending: 'neutral', Submitted: 'warning', Approved: 'info', Paid: 'success', Disputed: 'danger', Rejected: 'danger' };
      const F = ['All', 'Pending', 'Submitted', 'Approved', 'Paid', 'Disputed'];
      const list = rows.filter((r) => filt === 'All' || r.status === filt || (filt === 'Disputed' && r.status === 'Rejected'));
      Object.assign(M, { title: 'Driver settlements', sub: 'Week 28 Sep – 4 Oct · commission ' + s.commission + '% · cash held by drivers is offset against card payouts.', chips: F.map((k) => chip(k, filt === k, set({ mFilter: k }), k === 'All' ? rows.length : rows.filter((r) => r.status === k).length)) });
      M.metrics = [['Awaiting approval', rows.filter((r) => r.status === 'Submitted' || r.status === 'Disputed').length, 'settlements'], ['Collect from drivers', rs(rows.filter((r) => r.net > 0 && r.status !== 'Paid').reduce((a, r) => a + r.net, 0)), 'commission on cash trips'], ['Pay out to drivers', rs(rows.filter((r) => r.net < 0 && r.status !== 'Paid').reduce((a, r) => a - r.net, 0)), 'card & bank trips'], ['Settled', rows.filter((r) => r.status === 'Paid').length, 'this week']];
      const setSt = (r, st, verb) => mut((w) => { w.stl = { ...w.stl, [r.d.id]: st }; audit(w, `Accountant ${verb} driver settlement — ${r.d.name}`, 'Settlements', 'Malsha Herath'); O.toast(w, 'admin', `Settlement ${verb} · ${r.d.name}`, st === 'Rejected' ? 'warn' : 'ok'); if (r.d.demo) O.toast(w, 'driver', `Your settlement was ${verb}`, st === 'Rejected' ? 'warn' : 'ok'); });
      M.cols = [col('Driver'), col('Trips', 1), col('Gross', 1), col('Cash collected', 1), col('Commission', 1), col('Expenses', 1), col('Net', 1), col('Status')];
      M.rows = list.map((r) => ({ cells: [tx(r.d.name, r.d.plate, { m: true }), tx(r.trips, '', { r: true }), tx(rs(r.gross), '', { r: true }), tx(rs(r.cash), '', { r: true }), tx(rs(r.comm), '', { r: true }), tx(rs(r.exp), '', { r: true }), tx(rs(Math.abs(r.net)), r.net >= 0 ? 'Driver owes OLU' : 'OLU pays driver', { r: true, b: true }), badge(r.status, TONE[r.status])],
        actions: r.status === 'Submitted' || r.status === 'Disputed' ? [btn('Approve', () => setSt(r, 'Approved', 'approved'), 'p'), btn('Reject', () => setSt(r, 'Rejected', 'rejected'), 'd')] : r.status === 'Approved' ? [btn('Mark paid', () => setSt(r, 'Paid', 'marked paid'), 'p')] : r.status === 'Pending' || r.status === 'Rejected' ? [btn('Remind', () => mut((w) => { O.toast(w, 'admin', `Reminder sent to ${r.d.name}`, 'info'); if (r.d.demo) O.toast(w, 'driver', 'Accounts: please submit your weekly settlement', 'info'); }))] : [] }));
      M.exportFn = () => { csv('olu-settlements-week40.csv', ['Driver', 'Trips', 'Gross', 'Cash', 'Commission', 'Expenses', 'Net', 'Direction', 'Status'], rows.map((r) => [r.d.name, r.trips, r.gross, r.cash, Math.round(r.comm), r.exp, Math.round(Math.abs(r.net)), r.net >= 0 ? 'Driver owes' : 'OLU pays', r.status])); mut((w) => O.toast(w, 'admin', 'Settlements exported to CSV', 'ok')); };
      M.actions = [btn('Export CSV', () => M.exportFn())];
    }

    if (as === 'reports') {
      const TYPES = ['Revenue', 'Bookings', 'Driver performance', 'Cash collection', 'Tour sales', 'Cancellations'];
      const RANGES = ['Today', 'Last 7 days', 'Last 30 days'];
      const t = s.mReport || 'Revenue', rg = s.mRange || 'Today';
      const mult = rg === 'Today' ? 0 : rg === 'Last 7 days' ? 1 : 4.3;
      const paid = s.bookings.filter((b) => b.paid);
      let bars = [], cols = [], rows = [], csvRows = [], head = [], title = '', fmt = (v) => rs(v);
      if (t === 'Revenue') {
        title = 'Revenue by vehicle class';
        const seed = [38000, 21000, 182000, 64000, 88000, 96000];
        const data = s.pricing.map((v, i) => { const live = paid.filter((b) => b.veh === v.id); const rev = live.reduce((a, b) => a + b.paidAmt, 0) + Math.round(seed[i] * mult); const n = live.length + Math.round((seed[i] / v.airport) * mult); return { l: v.name, rev, n }; });
        bars = data.map((d) => ({ l: d.l, v: d.rev })); head = ['Class', 'Trips', 'Revenue', 'Avg fare', 'Commission'];
        csvRows = data.map((d) => [d.l, d.n, d.rev, d.n ? Math.round(d.rev / d.n) : 0, Math.round(d.rev * s.commission / 100)]);
        rows = csvRows.map((r) => [tx(r[0], '', { m: true }), tx(r[1], '', { r: true }), tx(rs(r[2]), '', { r: true, b: true }), tx(rs(r[3]), '', { r: true }), tx(rs(r[4]), '', { r: true })]);
      } else if (t === 'Bookings') {
        title = 'Bookings by service'; fmt = (v) => String(v);
        const SV = [['airport', 'Airport transfer', 31], ['ride', 'City ride', 54], ['return', 'Return trip', 9], ['tour', 'Tour / custom', 6]];
        const data = SV.map(([k, l, sd]) => { const live = s.bookings.filter((b) => b.svc === k); return { l, n: live.length + Math.round(sd * mult), done: live.filter((b) => b.status === 'completed').length + Math.round(sd * mult * 0.9), canc: live.filter((b) => b.status === 'cancelled').length + Math.round(sd * mult * 0.06) }; });
        bars = data.map((d) => ({ l: d.l, v: d.n })); head = ['Service', 'Bookings', 'Completed', 'Cancelled', 'Completion'];
        csvRows = data.map((d) => [d.l, d.n, d.done, d.canc, d.n ? Math.round(d.done / d.n * 100) + '%' : '—']);
        rows = csvRows.map((r) => [tx(r[0], '', { m: true }), tx(r[1], '', { r: true, b: true }), tx(r[2], '', { r: true }), tx(r[3], '', { r: true }), tx(r[4], '', { r: true })]);
      } else if (t === 'Driver performance') {
        title = 'Earnings by driver';
        const data = s.drivers.filter((d) => !d.pending).map((d, i) => ({ l: d.name, n: d.trips + Math.round((8 + i) * mult), e: d.earn + Math.round((8 + i) * 3600 * mult), r: d.rating, acc: 96 - (i % 4) * 3 }));
        bars = data.map((d) => ({ l: O.first(d.l), v: d.e })); head = ['Driver', 'Trips', 'Earnings', 'Rating', 'Acceptance'];
        csvRows = data.map((d) => [d.l, d.n, d.e, d.r.toFixed(1), d.acc + '%']);
        rows = csvRows.map((r) => [tx(r[0], '', { m: true }), tx(r[1], '', { r: true }), tx(rs(r[2]), '', { r: true, b: true }), tx('★ ' + r[3], '', { r: true }), tx(r[4], '', { r: true })]);
      } else if (t === 'Cash collection') {
        title = 'Cash held by drivers';
        const data = s.drivers.filter((d) => !d.pending).map((d, i) => { const c = s.bookings.filter((b) => b.driverId === d.id && b.paid && b.payMethod === 'Cash').reduce((a, b) => a + b.paidAmt, 0) + Math.round((6 + i) * 2300 * mult); return { l: d.name, c, st: (s.stl || {})[d.id] || 'Pending' }; });
        bars = data.map((d) => ({ l: O.first(d.l), v: d.c })); head = ['Driver', 'Cash collected', 'Commission due', 'Settlement'];
        csvRows = data.map((d) => [d.l, d.c, Math.round(d.c * s.commission / 100), d.st]);
        rows = csvRows.map((r) => [tx(r[0], '', { m: true }), tx(rs(r[1]), '', { r: true, b: true }), tx(rs(r[2]), '', { r: true }), tx(r[3])]);
      } else if (t === 'Tour sales') {
        title = 'Tour package sales'; 
        const data = s.tours.map((x) => { const n = Math.round(x.month * (rg === 'Today' ? 0.1 : rg === 'Last 7 days' ? 0.3 : 1)); return { l: x.name, n, rev: n * x.price }; });
        bars = data.map((d) => ({ l: d.l.split(' ')[0], v: d.rev })); head = ['Package', 'Bookings', 'Revenue'];
        csvRows = data.map((d) => [d.l, d.n, d.rev]);
        rows = csvRows.map((r) => [tx(r[0], '', { m: true }), tx(r[1], '', { r: true }), tx(rs(r[2]), '', { r: true, b: true })]);
      } else {
        title = 'Cancellations by reason'; fmt = (v) => String(v);
        const live = s.bookings.filter((b) => b.status === 'cancelled').length;
        const data = [['Customer changed plans', 2 + live], ['Driver no-show', 1], ['Long wait for driver', 1], ['Duplicate booking', 1], ['Payment issue', 0]].map(([l, n], i) => ({ l, n: n + Math.round((5 - i) * 2 * mult) }));
        bars = data.map((d) => ({ l: d.l.split(' ')[0], v: d.n })); head = ['Reason', 'Cancellations'];
        csvRows = data.map((d) => [d.l, d.n]);
        rows = csvRows.map((r) => [tx(r[0], '', { m: true }), tx(r[1], '', { r: true, b: true })]);
      }
      const mx = Math.max(1, ...bars.map((b) => b.v));
      M.chart = { title: title + ' · ' + rg.toLowerCase(), bars: bars.map((b) => ({ label: b.l, val: fmt(b.v), hgt: Math.max(3, Math.round(b.v / mx * 150)) + 'px' })) };
      Object.assign(M, { title: 'Reports', sub: 'Live operational data. Today updates in real time; longer ranges include historical records.', chips: TYPES.map((k) => chip(k, t === k, set({ mReport: k }))), chips2: RANGES.map((k) => chip(k, rg === k, set({ mRange: k }))) });
      M.cols = head.map((h, i) => col(h, i > 0 && !['Settlement'].includes(h)));
      M.rows = rows.map((cells) => ({ cells, actions: [] }));
      M.actions = [btn('Export CSV', () => { csv(`olu-report-${t.toLowerCase().replace(/ /g, '-')}.csv`, head, csvRows); mut((w) => O.toast(w, 'admin', `${t} report exported to CSV`, 'ok')); }), btn('Export PDF', () => { mut((w) => O.toast(w, 'admin', `${t} report PDF generated`, 'ok')); })];
    }

    if (as === 'users') {
      const role = s.mRole || 'Dispatcher';
      Object.assign(M, { title: 'Users & roles', sub: 'Staff accounts and what each role can do. Changes apply on the user’s next action.' });
      M.actions = [btn('Invite user', () => openD('user-new', null, 'Invite user', { name: '', email: '', role: 'Dispatcher' }), 'p')];
      M.cols = [col('User'), col('Role'), col('Last active'), col('Active')];
      M.rows = s.users.map((u) => ({ cells: [tx(u.name, u.email, { m: true }), badge(u.role, u.role === 'Super Admin' ? 'live' : 'neutral'), tx(u.last), tog(u.active, () => mut((w) => { w.users = w.users.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)); audit(w, `Super Admin ${u.active ? 'suspended' : 'reactivated'} user ${u.name}`, 'Users', 'Ashan Wijeratne'); O.toast(w, 'admin', `${u.name} ${u.active ? 'suspended' : 'reactivated'}`, u.active ? 'warn' : 'ok'); }))], actions: [btn('Edit', () => openD('user', u.id, 'Edit ' + u.name, { role: u.role, name: u.name, email: u.email }))] }));
      const pm = s.perms[role];
      M.matrix = { roles: ROLES.map((r) => chip(r, r === role, set({ mRole: r }))), cols: PT, locked: role === 'Super Admin', rows: MODS.map((m) => ({ module: m, cells: PT.map((p) => { const on = !!pm[m + '|' + p]; return { on, label: `${role} · ${m} · ${p}`, bg: on ? '#121519' : '#FFFFFF', bd: on ? '#121519' : '#CFCBC3', mark: on ? '✓' : '', onClick: () => mut((w) => { if (role === 'Super Admin') return O.toast(w, 'admin', 'Super Admin always has full access', 'info'); w.perms = { ...w.perms, [role]: { ...w.perms[role], [m + '|' + p]: !on } }; audit(w, `Super Admin ${on ? 'revoked' : 'granted'} ${p} on ${m} for ${role}`, 'Users', 'Ashan Wijeratne'); O.toast(w, 'admin', `${role}: ${p} ${m} ${on ? 'revoked' : 'granted'}`, 'ok'); }) }; }) })) };
      if (D && (D.kind === 'user' || D.kind === 'user-new')) {
        const isNew = D.kind === 'user-new';
        dr = { fields: [isNew ? dfld('Full name', 'name') : null, isNew ? dfld('Work email', 'email', { ph: 'name@olucabs.lk' }) : null, dfld('Role', 'role', { opts: ROLES })].filter(Boolean),
          btns: [btn(isNew ? 'Send invite' : 'Save role', () => { const d = D.data; if (isNew && !String(d.name).trim()) return derr('Enter a name'); if (isNew && !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email || '')) return derr('Enter a valid email address'); mut((w) => { if (isNew) w.users = [...w.users, { id: 'u' + (w.users.length + 1), name: d.name.trim(), email: d.email.trim(), role: d.role, last: 'Invited', active: true }]; else w.users = w.users.map((x) => (x.id === D.id ? { ...x, role: d.role } : x)); audit(w, isNew ? `Super Admin invited ${d.name} as ${d.role}` : `Super Admin changed ${d.name} role to ${d.role}`, 'Users', 'Ashan Wijeratne'); O.toast(w, 'admin', isNew ? `Invite sent to ${d.email}` : 'Role updated', 'ok'); }); closeD(); }, 'p'), btn('Cancel', closeD)] };
      }
    }

    if (as === 'audit') {
      const modOf = (a) => a.module || (/pricing/i.test(a.text) ? 'Pricing' : /payment/i.test(a.text) ? 'Payments' : /settlement/i.test(a.text) ? 'Settlements' : /assigned|accepted|declined|rejected|broadcast|reassign|did not respond|let the request|dispatcher/i.test(a.text) ? 'Dispatch' : /went (on|off)line|signed|registered|application/i.test(a.text) ? 'Drivers' : /booking|trip|arrived|cancel/i.test(a.text) ? 'Bookings' : 'System');
      const names = s.drivers.map((d) => d.name);
      const userOf = (a) => a.user || names.find((n) => a.text.startsWith(n)) || (/^New booking|by customer|Quotation requested/.test(a.text) ? 'Customer web' : /^Dispatcher|reassignment|back in queue/.test(a.text) ? 'Dilani Ratnayake' : /^Admin/.test(a.text) ? 'Kevin Mendis' : 'System');
      const devOf = (u) => (u === 'System' ? 'Server · dispatch engine' : u === 'Customer web' ? 'Web · Safari iOS' : names.includes(u) ? 'OLU Driver · Android' : 'Chrome · 10.0.4.' + (u.length * 7 % 200));
      const all = s.activity.map((a) => ({ at: 'Today ' + a.at, user: userOf(a), text: a.text, module: modOf(a) })).concat(s.auditSeed);
      const MOD = ['All', 'Bookings', 'Dispatch', 'Drivers', 'Pricing', 'Payments', 'Settlements', 'Quotations', 'Users', 'System'];
      const list = all.filter((a) => filt === 'All' || a.module === filt).filter((a) => !q || (a.text + a.user).toLowerCase().includes(q));
      Object.assign(M, { title: 'Audit log', sub: 'Every operational and administrative action, newest first. Entries cannot be edited.', search: true, chips: MOD.map((k) => chip(k, filt === k, set({ mFilter: k }), k === 'All' ? all.length : all.filter((a) => a.module === k).length)) });
      M.cols = [col('Timestamp'), col('User'), col('Action'), col('Module'), col('Record'), col('Device / IP')];
      M.rows = list.slice(0, 80).map((a) => { const rec = (a.text.match(/OLU-\d{8}-\d{4}|QT-\d{4}|QR-\d{4}|APP-\d{4}/) || ['—'])[0]; return { cells: [tx(a.at, '', { mono: true }), tx(a.user, '', { m: true }), tx(a.text), badge(a.module, 'neutral'), tx(rec, '', { mono: true }), tx(devOf(a.user), '', { fg: '#5F5C56' })], actions: [] }; });
      M.actions = [btn('Export CSV', () => { csv('olu-audit-log.csv', ['Timestamp', 'User', 'Action', 'Module', 'Device'], list.map((a) => [a.at, a.user, a.text, a.module, devOf(a.user)])); mut((w) => O.toast(w, 'admin', 'Audit log exported', 'ok')); })];
      M.empty = 'No audit entries match.';
    }

    if (as === 'settings') {
      const base = s.settings, cur = fd || base, f = fset(base);
      Object.assign(M, { title: 'Settings', sub: 'Business rules used by booking, dispatch and payments across all three apps.' });
      M.form = [
        { title: 'Business profile', fields: [field('Company name', cur.bizName, f('bizName')), field('Hotline', cur.bizPhone, f('bizPhone')), field('Email', cur.bizEmail, f('bizEmail')), field('Address', cur.bizAddr, f('bizAddr')), field('Branches', cur.branches, f('branches'), { sub: 'Comma separated' })] },
        { title: 'Driver dispatch rules', fields: [field('Auto-broadcast city rides', cur.autoBroadcast, f('autoBroadcast'), { tog: true, sub: 'Offer new rides to nearby drivers before the dispatcher' }), field('Broadcast radius', cur.radius, f('radius'), { suffix: 'km', w: '120px' }), field('Driver response time', cur.offerSecs, f('offerSecs'), { suffix: 'sec', w: '120px' }), field('Only offer matching vehicle class', cur.matchClass, f('matchClass'), { tog: true })] },
        { title: 'Booking, waiting & cancellation', fields: [field('Extra stop fee', cur.stopFee, f('stopFee'), { prefix: 'Rs.', w: '140px' }), field('Free waiting time', cur.freeWait, f('freeWait'), { suffix: 'min', w: '120px' }), field('Waiting charge', cur.waitRate, f('waitRate'), { prefix: 'Rs.', suffix: '/min', w: '160px' }), field('Late cancellation fee', cur.cancelFee, f('cancelFee'), { prefix: 'Rs.', w: '140px', sub: 'After a driver is assigned' })] },
        { title: 'Payment methods', fields: [field('Cash', cur.cash, f('cash'), { tog: true }), field('Card', cur.card, f('card'), { tog: true }), field('Bank transfer', cur.bank, f('bank'), { tog: true })] },
        { title: 'Notifications', fields: [field('SMS trip updates', cur.sms, f('sms'), { tog: true }), field('Email receipts', cur.email, f('email'), { tog: true }), field('WhatsApp integration', cur.wa, f('wa'), { tog: true, sub: 'Business API · +94 77 250 4400' })] },
        { title: 'Security', fields: [field('Two-factor sign-in for staff', cur.twofa, f('twofa'), { tog: true }), field('Session timeout', cur.session, f('session'), { suffix: 'min', w: '120px' })] },
      ];
      M.formSave = () => {
        if (!fd) return; const { _scr, ...v } = fd;
        const bad = !(Number(v.radius) >= 1 && Number(v.radius) <= 25) ? 'Broadcast radius must be 1–25 km' : !(Number(v.offerSecs) >= 10 && Number(v.offerSecs) <= 60) ? 'Response time must be 10–60 seconds' : !(v.cash || v.card || v.bank) ? 'Keep at least one payment method on' : [v.stopFee, v.freeWait, v.waitRate, v.cancelFee, v.session].some((x) => x === '' || !(Number(x) >= 0)) ? 'Enter valid numbers' : '';
        if (bad) return mut((w) => O.toast(w, 'admin', bad, 'warn'));
        mut((w) => { w.settings = { ...v, radius: Number(v.radius), offerSecs: Number(v.offerSecs), stopFee: Number(v.stopFee) }; w.formDraft = null; audit(w, 'Admin updated business settings', 'System', 'Kevin Mendis'); O.toast(w, 'admin', 'Settings saved · applied to new bookings', 'ok'); });
      };
    }

    // view model
    const rv = {
      mTitle: M.title, mSub: M.sub, mActions: M.actions, mHasActions: M.actions.length > 0,
      mHasChips: !!M.chips, mChips: M.chips || [], mHasChips2: !!M.chips2, mChips2: M.chips2 || [],
      mHasSearch: M.search, mQuery: s.mQuery || '', onMQuery: (e) => self.setState({ mQuery: e.target.value }),
      mHasMetrics: !!M.metrics, mMetrics: (M.metrics || []).map(([label, value, sub]) => ({ label, value, sub })),
      mHasChart: !!M.chart, mChartTitle: M.chart ? M.chart.title : '', mBars: M.chart ? M.chart.bars : [],
      mHasTable: !!M.cols, mCols: M.cols || [], mRows: (M.rows || []).map((r) => ({ ...r, hasActions: (r.actions || []).length > 0, cursor: r.onClick ? 'pointer' : 'default' })), mTableEmpty: !!M.cols && !(M.rows || []).length, mEmpty: M.empty, mActCol: (M.rows || []).some((r) => (r.actions || []).length),
      mHasCards: !!M.cards, mCards: M.cards || [], mCardsEmpty: !!M.cards && !M.cards.length,
      mHasMatrix: !!M.matrix, mRoles: M.matrix ? M.matrix.roles : [], mPerm: PT, mMatrixRows: M.matrix ? M.matrix.rows : [], mMatrixLocked: M.matrix ? M.matrix.locked : false,
      mHasForm: !!M.form, mForm: M.form || [], mFormDirty: !!fd, mFormClean: !fd, mFormSave: M.formSave || (() => {}), mFormDiscard: () => self.setState({ formDraft: null }), mFormStatus: fd ? 'Unsaved changes' : 'All changes saved', mFormFg: fd ? '#7A4A06' : '#1D5E3A', mFormOp: fd ? 1 : 0.45,
      dOpen: !!(dr && D), dTitle: D ? D.title : '', dSub: D ? D.sub : '', dHasSub: !!(D && D.sub), dFields: dr && dr.fields ? dr.fields : [], dRows: dr && dr.rows ? dr.rows : [], dHasRows: !!(dr && dr.rows), dHasTotal: !!(dr && dr.total), dTotal: dr && dr.total ? dr.total : '', dBtns: dr ? dr.btns : [], dErr: D ? D.err : '', dHasErr: !!(D && D.err), dClose: closeD,
    };
    return rv;
  }
  window.OLUAdmin = { initExtra, build };
})();
