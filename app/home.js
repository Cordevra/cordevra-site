/* Cordevra Home dashboard (prototype; tasks/meetings are demo data, Latest activity reads the app's live demo data).
   Opens on load and whenever the Cordevra logo is clicked.
   Hides itself as soon as any other page is opened. */
(function () {
  'use strict';

  var CSS = [
    '.cdvh{min-width:0;flex:1 1 0%;overflow-y:auto;padding:24px;box-sizing:border-box;background:#F8FAFC;color:#1E293B;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif}',
    '@media (max-width:640px){.cdvh{padding:16px}}',
    '.cdvh *{box-sizing:border-box}',
    '.cdvh-wrap{display:flex;flex-direction:column;gap:20px}',
    '.cdvh-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px}',
    '.cdvh-date{font-size:13px;color:#64748B;font-weight:500}',
    '.cdvh h1{margin:4px 0 0;font-size:24px;font-weight:700;color:#0E1A2B}',
    '.cdvh h2{margin:0;font-size:16px;font-weight:700;color:#0E1A2B}',
    '.cdvh-seg{display:flex;background:#F1F5F9;border-radius:8px;padding:3px}',
    '.cdvh-seg button{border:0;height:32px;padding:0 14px;border-radius:6px;font-size:13px;font-weight:600;line-height:1;font-family:inherit;cursor:pointer;background:transparent;color:#475569}',
    '.cdvh-seg button[aria-pressed=true]{background:#fff;color:#0E1A2B;box-shadow:0 1px 2px rgba(15,23,42,.12)}',
    '.cdvh-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}',
    '.cdvh-kpi{display:flex;flex-direction:column;gap:6px;background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:16px;text-align:left;cursor:pointer;font-family:inherit;color:#1E293B}',
    '.cdvh-kpi:hover{border-color:#99F6E4}',
    '.cdvh-kpi .l{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#475569}',
    '.cdvh-kpi .d{width:8px;height:8px;border-radius:999px}',
    '.cdvh-kpi .n{font-size:30px;font-weight:700;line-height:1.1;color:#0E1A2B}',
    '.cdvh-kpi .s{font-size:12px;color:#64748B}',
    '.cdvh-row{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}',
    '.cdvh-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:18px;min-width:0}',
    '.cdvh-main{flex:2 1 520px;min-width:0;display:flex;flex-direction:column;gap:16px}.cdvh-side{flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:16px}',
    '.cdvh-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;align-items:start}',
    /* fixed columns like the client Dashboard tab, sized to the page area (not the window): 1 column when narrow, 2 medium, 3 wide */
    '.cdvh-wrap{container-type:inline-size}',
    '.cdvh-cols{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:start}',
    '.cdvh-col{min-width:0;display:flex;flex-direction:column;gap:16px}',
    '@container (min-width:860px){.cdvh-cols{grid-template-columns:minmax(0,2fr) minmax(0,1fr)}.cdvh-col3{grid-column:1 / -1;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));align-items:start}}',
    '@container (min-width:1400px){.cdvh-cols{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) minmax(0,1fr)}.cdvh-col3{grid-column:auto;display:flex;align-items:stretch}}',
    '.cdvh-ch{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}',
    '.cdvh-tabs{display:flex;gap:6px;flex-wrap:wrap}',
    '.cdvh-tabs button{display:flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;background:#fff;color:#334155;border:1px solid #E2E8F0}',
    '.cdvh-tabs button .c{font-size:11px;font-weight:700;border-radius:999px;padding:1px 7px;background:#F1F5F9;color:#475569}',
    '.cdvh-tabs button.red .c{background:#FEE4E2;color:#B42318}',
    '.cdvh-tabs button[aria-selected=true]{background:#0E1A2B;color:#fff;border-color:#0E1A2B}',
    '.cdvh-tabs button[aria-selected=true] .c{background:#22324A;color:#fff}',
    '.cdvh-task{display:flex;align-items:center;gap:12px;padding:11px 0;border-top:1px solid #F1F5F9;flex-wrap:wrap}',
    '.cdvh-box{width:20px;height:20px;flex-shrink:0;border-radius:4px;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;background:#fff;border:1.5px solid #94A3B8}',
    '.cdvh-box[aria-pressed=true]{background:#14B8A6;border-color:#14B8A6}',
    '.cdvh-tt{flex:1 1 220px;min-width:0;display:flex;flex-direction:column;gap:2px}',
    '.cdvh-tt .t{font-size:14px;font-weight:500;color:#1E293B}',
    '.cdvh-task.done .t{color:#94A3B8;text-decoration:line-through}',
    '.cdvh-sub{font-size:12px;color:#64748B}',
    '.cdvh-due{font-size:12px;font-weight:600;white-space:nowrap;border-radius:999px;padding:3px 10px;background:#F1F5F9;color:#475569}',
    '.cdvh-due.late{background:#FEF3F2;color:#B42318}.cdvh-due.today{background:#ECFDF5;color:#047857}',
    '.cdvh-task.done .cdvh-due{background:#F1F5F9;color:#64748B}',
    '.cdvh-av{width:26px;height:26px;border-radius:999px;background:#E0E7FF;color:#3730A3;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.cdvh-link{background:none;border:0;padding:0;font-size:13px;font-weight:600;font-family:inherit;color:#0F766E;cursor:pointer}',
    '.cdvh-link:hover{text-decoration:underline;color:#115E59}',
    '.cdvh-foot{border-top:1px solid #F1F5F9;padding:12px 0 0}',
    '.cdvh-mlist{display:flex;flex-direction:column;gap:10px}',
    '.cdvh-m{display:flex;gap:12px;padding:12px;border-radius:10px;border:1px solid #E2E8F0;background:#fff}',
    '.cdvh-m.soon{background:#F0FDFA;border-color:#99F6E4}',
    '.cdvh-md{width:52px;flex-shrink:0;text-align:center;border-right:1px solid #E2E8F0;padding-right:10px}',
    '.cdvh-md .w{font-size:11px;font-weight:600;color:#64748B}.cdvh-md .n{font-size:18px;font-weight:700;color:#0E1A2B}',
    '.cdvh-mi{flex-grow:1;min-width:0;display:flex;flex-direction:column;gap:2px}',
    '.cdvh-mi .t{font-size:14px;font-weight:600;color:#0E1A2B}.cdvh-mi .w{font-size:12px;color:#475569}',
    '.cdvh-join{align-self:center;font-size:13px;font-weight:600;font-family:inherit;color:#fff;background:#0F766E;border:0;border-radius:6px;padding:8px 12px;cursor:pointer}',
    '.cdvh-grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;align-items:start}',
    '.cdvh-bar{display:flex;gap:2px;height:12px;border-radius:6px;overflow:hidden;margin:14px 0}',
    '.cdvh-leg{display:flex;align-items:center;gap:10px;font-size:14px;padding:4px 0}',
    '.cdvh-leg .sq{width:10px;height:10px;border-radius:3px}.cdvh-leg .x{flex-grow:1}.cdvh-leg b{font-weight:600}',
    '.cdvh-li{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid #F1F5F9}',
    '.cdvh-li .x{flex-grow:1;min-width:0;display:flex;flex-direction:column;gap:2px}',
    '.cdvh-li .t{font-size:14px;font-weight:500}',
    '.cdvh-dl{width:56px;flex-shrink:0;font-size:12px;font-weight:700;color:#0F766E}',
    '.cdvh-pg{font-size:12px;font-weight:600;color:#475569;white-space:nowrap}',
    '.cdvh-muted{font-size:13px;color:#64748B}',
    '.cdvh-act{display:flex;flex-direction:column;gap:3px;width:100%;padding:10px 2px;border:0;border-top:1px solid #F1F5F9;background:none;text-align:left;font-family:inherit;cursor:pointer;color:#1E293B}',
    '.cdvh-act:hover{background:#F8FAFC}',
    '.cdvh-act .top{display:flex;align-items:center;gap:8px;min-width:0}',
    '.cdvh-act .k{flex-shrink:0;font-size:11px;font-weight:600;border-radius:999px;padding:2px 8px}',
    '.cdvh-act b{flex:1;min-width:0;font-size:13px;font-weight:600;color:#0E1A2B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.cdvh-act .w{flex-shrink:0;font-size:12px;color:#64748B;white-space:nowrap}',
    '.cdvh-act .t{font-size:14px}',
    '@media (min-width:900px){.cdvh-main .cdvh-act{display:grid;grid-template-columns:minmax(0,220px) minmax(0,1fr);column-gap:16px;align-items:baseline}.cdvh-main .cdvh-act .top{grid-row:span 2}.cdvh-main .cdvh-act .top .w{display:none}.cdvh-main .cdvh-act .t::after{content:attr(data-w);float:right;font-size:12px;color:#64748B}}',
    '.cdvh-act .d{font-size:12px;color:#64748B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}',
    /* logo = Home */
    '[data-cdv-logo]{cursor:pointer;border-radius:8px;padding-top:6px!important;padding-bottom:6px!important;transition:background .15s}',
    '[data-cdv-logo]:hover{background:rgba(34,50,74,.6)}',
    'body.cdv-home [data-cdv-logo]{background:#22324A}',
    '[data-cdv-sep]{font-size:0!important;display:inline-block!important;width:1px;height:20px;background:#CBD5E1;margin:0 14px!important;vertical-align:middle;align-self:center}',
    'body.cdv-home aside nav a{background:transparent!important;box-shadow:none!important;color:#cbd5e1!important}'
  ].join('\n');

  /* ---------- helpers ---------- */
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var DAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var DAYL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var MONL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function addDays(n) { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; }
  function md(d) { return MON[d.getMonth()] + ' ' + d.getDate(); }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'on') for (var ev in attrs.on) e.addEventListener(ev, attrs.on[ev]);
      else if (k === 'style') e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function svg(d, size, stroke, sw) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('width', size); s.setAttribute('height', size); s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', stroke); s.setAttribute('stroke-width', sw);
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); s.appendChild(p);
    return s;
  }
  /* open another page of the app by clicking its sidebar link */
  function go(label) {
    var a = [].slice.call(document.querySelectorAll('aside nav a, nav a')).filter(function (x) {
      return x.textContent.trim().indexOf(label) === 0;
    })[0];
    if (a) { hide(); a.click(); }
  }

  /* ---------- demo data (dates relative to today) ---------- */
  function late(n) { return md(addDays(-n)) + ' \u00b7 ' + n + (n === 1 ? ' day' : ' days') + ' late'; }
  function soon(n) { var d = addDays(n); return DAY[d.getDay()] + ', ' + md(d); }
  var TASKS = {
    overdue: [
      ['o1', 'Reconcile operating account', 'Harbor Dental Group', 'Bookkeeping', late(4), 'RB'],
      ['o2', 'File Q3 sales tax return', 'Coastal HVAC Services', 'Sales Tax', late(4), 'DO'],
      ['o3', 'Approve 4 client A/P bills', 'Maple Street Realty', 'Payables', late(3), 'DO'],
      ['o4', 'Follow up on missing bank statements', 'Ironwood Construction', 'Cleanup & Catch-Up', late(2), 'RB'],
      ['o5', 'Review payroll tax deposit', 'Northwind Logistics', 'Payroll', late(2), 'DO'],
      ['o6', 'Close last month\u2019s books', 'Cedar & Pine Law PLLC', 'Bookkeeping', late(1), 'RB'],
      ['o7', 'Send onboarding form', 'Brightpath Tutoring', 'Onboarding', late(1), 'DO']
    ],
    today: [
      ['t1', 'Review uncategorized transactions', 'Atlas Fitness Studio', 'Bookkeeping', 'Today', 'DO'],
      ['t2', 'Prepare monthly management report', 'Riverside Pediatrics', 'Advisory', 'Today', 'DO'],
      ['t3', 'Reconcile credit card', 'Bluefin Charters', 'Bookkeeping', 'Today', 'RB'],
      ['t4', 'Call with new lead \u00b7 3:00 PM', 'Summit Yoga Co (Lead)', 'Sales', 'Today', 'DO'],
      ['t5', 'Approve payroll run', 'Northwind Logistics', 'Payroll', 'Today', 'RB']
    ],
    upcoming: [
      ['u1', '1099 vendor review', 'Cedar & Pine Law PLLC', 'Bookkeeping', soon(2), 'RB'],
      ['u2', 'File monthly sales tax', 'Atlas Fitness Studio', 'Sales Tax', soon(3), 'DO'],
      ['u3', 'Quarterly advisory meeting prep', 'Harbor Dental Group', 'Advisory', soon(4), 'DO'],
      ['u4', 'Reconcile operating account', 'Maple Street Realty', 'Bookkeeping', soon(5), 'RB'],
      ['u5', 'Send engagement letter', 'Summit Yoga Co (Lead)', 'Onboarding', soon(6), 'DO'],
      ['u6', 'Kick off month-end close', 'All bookkeeping clients', 'Month End', soon(9), 'DO']
    ]
  };
  var FIRM_EXTRA = ['o8', 'Collect W-9s', 'Bluefin Charters', 'Bookkeeping', late(5), 'RB'];

  var state = { tab: 'overdue', scope: 'mine', done: {}, reminded: {} };
  var root = null;

  function taskList() {
    var l = TASKS[state.tab].slice();
    if (state.tab === 'overdue' && state.scope === 'firm') l.unshift(FIRM_EXTRA);
    return l;
  }

  /* signed-in user's first name, read from the app's own state (falls back to no name) */
  function firstName() {
    function scan(v, d) {
      if (!v || typeof v !== 'object' || d > 3) return null;
      try {
        if (typeof v.name === 'string' && typeof v.email === 'string' && 'role' in v) return v.name;
        for (var k in v) {
          if (k === '_owner' || k === 'return' || k === 'child' || k === 'stateNode' || k === '$$typeof') continue;
          var s = scan(v[k], d + 1); if (s) return s;
        }
      } catch (e) {}
      return null;
    }
    try {
      var m = mainEl || findMain(); if (!m) return '';
      var key = Object.keys(m).filter(function (x) { return x.indexOf('__reactFiber') === 0; })[0];
      var f = key && m[key], r = null;
      for (var n = 0; n < 40 && f && !r; n++) {
        var h = f.memoizedState, j = 0;
        while (h && j < 40 && !r) { r = scan(h.memoizedState, 0); h = h.next; j++; }
        if (!r && f.memoizedProps) r = scan(f.memoizedProps, 1);
        f = f.return;
      }
      return r ? String(r).trim().split(/\s+/)[0] : '';
    } catch (e) { return ''; }
  }

  /* ---------- Latest activity: newest events across all clients (live data from the app) ---------- */
  var ACT_KIND = {
    email: ['Email', '#DBEAFE', '#1D4ED8'], whatsapp: ['WhatsApp', '#DCFCE7', '#15803D'], contact: ['Contact', '#DBEAFE', '#1D4ED8'],
    upload: ['Upload', '#DCFCE7', '#15803D'], portal: ['Portal', '#DBEAFE', '#1D4ED8'], billing: ['Billing', '#DCFCE7', '#15803D'],
    calendar: ['Meeting', '#EDE9FE', '#6D28D9'], call: ['Call', '#EDE9FE', '#6D28D9'], task: ['Task', '#FEF3C7', '#B45309'],
    hours: ['Hours', '#FEF3C7', '#B45309'], account: ['Account', '#F1F5F9', '#475569'], general: ['Note', '#F1F5F9', '#475569'], project: ['Project', '#F1F5F9', '#475569']
  };
  /* events the client started (shown under "From clients") */
  var ACT_FROM_CLIENT = /^(Email received from|WhatsApp from|Text message from|Portal message|Uploaded |Signed in to the client portal|Started a portal conversation|Client |Form submitted|Payment of .* received|Proposal ".*" accepted|Signature declined|Document signed)/;
  var act = { items: [], at: 0, loading: false, filter: 'clients' };

  function actWho(a) { return a.author ? a.author.name.replace(' (client)', '') : 'Client'; }
  function actPhrase(a) {
    var b = a.body || '', m;
    if ((m = b.match(/^Email received from (.+?): (.*)$/))) return [m[1] + ' emailed you', m[2]];
    if ((m = b.match(/^(WhatsApp|Text message) from (.+?): (.*)$/))) return [m[2] + ' sent a ' + (m[1] === 'WhatsApp' ? 'WhatsApp message' : 'text message'), '“' + m[3] + '”'];
    if ((m = b.match(/^Portal message: (.*)$/))) return [actWho(a) + ' sent a portal message', '“' + m[1] + '”'];
    if ((m = b.match(/^Uploaded (.*) in the portal: (.*)$/))) return [actWho(a) + ' uploaded ' + m[1], m[2]];
    if (/^Signed in to the client portal/.test(b)) return [actWho(a) + ' signed in to the portal', ''];
    if ((m = b.match(/^Profile updated\. (.*)$/))) return ['Profile updated' + (a.author ? ' by ' + a.author.name : ''), m[1]];
    if ((m = b.match(/^Email sent: (.*)$/))) return ['Email sent' + (a.author ? ' by ' + a.author.name : ''), m[1]];
    var i = b.indexOf(': ');
    return i > 0 && i < 60 ? [b.slice(0, i), b.slice(i + 2)] : [b, ''];
  }
  function actAgo(iso) {
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    if (s < 7 * 86400) return Math.floor(s / 86400) + (s < 2 * 86400 ? ' day ago' : ' days ago');
    return md(new Date(iso));
  }
  function actLoad() {
    var api = window.__cdvApi;
    if (!api || act.loading) return;
    act.loading = true;
    Promise.resolve(api.clients({})).then(function (cs) {
      var list = (cs && cs.data) || cs || [], all = [];
      return Promise.all(list.map(function (c) {
        return api.clientActivity(c.id, '').then(function (rows) { rows.forEach(function (a) { all.push({ a: a, client: c }); }); }, function () {});
      })).then(function () {
        all.sort(function (x, y) { return String(y.a.created_at).localeCompare(String(x.a.created_at)); });
        act.items = all;
      });
    }).catch(function () { act.items = []; }).then(function () {
      act.at = Date.now(); act.loading = false;
      if (root && root.style.display !== 'none') render();
    });
  }
  function activityCard() {
    if (Date.now() - act.at > 5000) setTimeout(actLoad, 0);
    var rows = act.items.filter(function (x) {
      return act.filter === 'all' || ACT_FROM_CLIENT.test(x.a.body || '') || (x.a.author && / \(client\)$/.test(x.a.author.name));
    }).slice(0, 6);
    var filters = el('div', { 'class': 'cdvh-tabs', role: 'group', 'aria-label': 'Show' }, [['clients', 'From clients'], ['all', 'All']].map(function (f) {
      return el('button', { type: 'button', 'aria-selected': String(act.filter === f[0]), text: f[1], on: { click: function () { act.filter = f[0]; render(); } } });
    }));
    var body = rows.length ? rows.map(function (x) {
      var k = ACT_KIND[x.a.kind] || ACT_KIND.general, ph = actPhrase(x.a);
      return el('button', { type: 'button', 'class': 'cdvh-act', title: 'Open ' + x.client.name, on: { click: function () { if (window.__cdvNav) { window.__cdvNav('/clients/' + x.client.id); hide(); } } } }, [
        el('span', { 'class': 'top' }, [
          el('span', { 'class': 'k', style: 'background:' + k[1] + ';color:' + k[2], text: k[0] }),
          el('b', { text: x.client.name }),
          el('span', { 'class': 'w', text: actAgo(x.a.created_at) })
        ]),
        el('span', { 'class': 't', 'data-w': actAgo(x.a.created_at), text: ph[0] }),
        ph[1] ? el('span', { 'class': 'd', text: ph[1] }) : null
      ]);
    }) : [el('p', { 'class': 'cdvh-muted', style: 'margin:8px 0', text: act.at ? 'No activity yet.' : 'Loading…' })];
    return el('section', { 'class': 'cdvh-card', 'aria-label': 'Latest activity' }, [
      el('div', { 'class': 'cdvh-ch' }, [el('h2', { text: 'Latest activity' }), filters])
    ].concat(body));
  }

  /* ---------- render ---------- */
  function render() {
    if (!root) return;
    var scrollTop = root.scrollTop;
    root.innerHTML = '';
    var now = new Date();
    var h = now.getHours();
    var greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    var fn = firstName(); if (fn) greet += ', ' + fn;
    var overdueN = TASKS.overdue.length + (state.scope === 'firm' ? 1 : 0);
    var weekEnd = addDays(6);

    var wrap = el('div', { 'class': 'cdvh-wrap' });

    /* header */
    var seg = el('div', { 'class': 'cdvh-seg', role: 'group', 'aria-label': 'Scope' },
      [['mine', 'My work'], ['firm', 'Whole firm']].map(function (s) {
        return el('button', { type: 'button', 'aria-pressed': String(state.scope === s[0]), text: s[1],
          on: { click: function () { state.scope = s[0]; render(); } } });
      }));
    wrap.appendChild(el('div', { 'class': 'cdvh-head' }, [
      el('div', null, [
        el('div', { 'class': 'cdvh-date', text: DAYL[now.getDay()] + ', ' + MONL[now.getMonth()] + ' ' + now.getDate() }),
        el('h1', { text: greet })
      ]), seg
    ]));

    /* KPI tiles */
    var kpis = [
      ['Overdue', overdueN, 'Oldest is ' + (state.scope === 'firm' ? 5 : 4) + ' days late', '#F04438', '#B42318', 'overdue'],
      ['Due today', 5, 'Across 5 clients', '#14B8A6', null, 'today'],
      ['Due this week', 18, 'Through ' + DAY[weekEnd.getDay()] + ', ' + md(weekEnd), '#3B82F6', null, 'upcoming'],
      ['Meetings', 4, '1 today \u00b7 next at 3:00 PM', '#8B5CF6', null, 'Calendar'],
      ['Waiting on clients', 9, '3 waiting over a week', '#F59E0B', null, 'Communications']
    ];
    wrap.appendChild(el('div', { 'class': 'cdvh-kpis' }, kpis.map(function (k) {
      return el('button', { type: 'button', 'class': 'cdvh-kpi', on: { click: function () {
        if (TASKS[k[5]]) { state.tab = k[5]; render(); var t = root.querySelector('.cdvh-tasks'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        else go(k[5]);
      } } }, [
        el('span', { 'class': 'l' }, [el('span', { 'class': 'd', style: 'background:' + k[3] }), k[0]]),
        el('span', { 'class': 'n', style: k[4] ? 'color:' + k[4] : '', text: String(k[1]) }),
        el('span', { 'class': 's', text: k[2] })
      ]);
    })));

    /* tasks card */
    var counts = { overdue: overdueN, today: TASKS.today.length, upcoming: 18 };
    var tabs = el('div', { 'class': 'cdvh-tabs', role: 'tablist', 'aria-label': 'Task filter' },
      [['overdue', 'Overdue'], ['today', 'Today'], ['upcoming', 'Upcoming']].map(function (t) {
        return el('button', { type: 'button', role: 'tab', 'class': t[0] === 'overdue' ? 'red' : '',
          'aria-selected': String(state.tab === t[0]),
          on: { click: function () { state.tab = t[0]; render(); } } },
          [t[1] + ' ', el('span', { 'class': 'c', text: String(counts[t[0]]) })]);
      }));
    var dueCls = state.tab === 'overdue' ? 'late' : state.tab === 'today' ? 'today' : '';
    var rows = taskList().map(function (r) {
      var done = !!state.done[r[0]];
      var box = el('button', { type: 'button', 'class': 'cdvh-box', 'aria-pressed': String(done),
        'aria-label': (done ? 'Mark not done: ' : 'Mark done: ') + r[1],
        on: { click: function () { state.done[r[0]] = !state.done[r[0]]; render(); } } },
        [done ? svg('M5 12l5 5 9-10', 12, '#fff', 3.5) : null]);
      return el('div', { 'class': 'cdvh-task' + (done ? ' done' : '') }, [
        box,
        el('div', { 'class': 'cdvh-tt' }, [el('span', { 'class': 't', text: r[1] }), el('span', { 'class': 'cdvh-sub', text: r[2] + ' \u00b7 ' + r[3] })]),
        el('span', { 'class': 'cdvh-due ' + dueCls, text: r[4] }),
        el('span', { 'class': 'cdvh-av', title: 'Assigned to ' + r[5], 'aria-label': 'Assigned to ' + r[5], text: r[5] })
      ]);
    });
    var tasksCard = el('section', { 'class': 'cdvh-card cdvh-tasks', 'aria-label': 'Tasks', style: 'padding-bottom:12px' }, [
      el('div', { 'class': 'cdvh-ch' }, [el('h2', { text: 'Tasks' }), tabs])
    ].concat(rows).concat([
      el('div', { 'class': 'cdvh-foot' }, [el('button', { type: 'button', 'class': 'cdvh-link', text: 'Open Work Management \u2192', on: { click: function () { go('Work Management'); } } })])
    ]));

    /* meetings card */
    var meetings = [
      [0, 'Discovery call', '3:00 \u2013 3:30 PM', 'Summit Yoga Co (Lead)', 'Video call', true],
      [2, 'Monthly financial review', '10:00 \u2013 10:45 AM', 'Harbor Dental Group', 'Video call'],
      [2, 'Tax planning session', '2:00 \u2013 2:30 PM', 'Coastal HVAC Services', 'Phone'],
      [3, 'Onboarding kickoff', '11:30 AM \u2013 12:00 PM', 'Brightpath Tutoring', 'Video call']
    ];
    var meetCard = el('section', { 'class': 'cdvh-card cdvh-meet', 'aria-label': 'Upcoming meetings' }, [
      el('div', { 'class': 'cdvh-ch', style: 'margin-bottom:12px' }, [el('h2', { text: 'Upcoming meetings' }),
        el('button', { type: 'button', 'class': 'cdvh-link', text: 'Calendar', on: { click: function () { go('Calendar'); } } })]),
      el('div', { 'class': 'cdvh-mlist' }, meetings.map(function (m) {
        var d = addDays(m[0]);
        return el('div', { 'class': 'cdvh-m' + (m[5] ? ' soon' : '') }, [
          el('div', { 'class': 'cdvh-md' }, [el('div', { 'class': 'w', text: m[0] === 0 ? 'TODAY' : DAY[d.getDay()].toUpperCase() }), el('div', { 'class': 'n', text: String(d.getDate()) })]),
          el('div', { 'class': 'cdvh-mi' }, [el('span', { 'class': 't', text: m[1] }), el('span', { 'class': 'w', text: m[2] + ' \u00b7 ' + m[3] }), el('span', { 'class': 'cdvh-sub', text: m[4] })]),
          m[5] ? el('button', { type: 'button', 'class': 'cdvh-join', text: 'Join' }) : null
        ]);
      }))
    ]);

    /* bottom row */
    var status = [['Not started', 12, '#94A3B8'], ['In progress', 21, '#3B82F6'], ['Waiting on client', 9, '#F59E0B'], ['Ready for review', 6, '#0F766E']];
    var statusCard = el('section', { 'class': 'cdvh-card', 'aria-label': 'Open work by status' }, [
      el('div', { 'class': 'cdvh-ch', style: 'margin-bottom:0' }, [el('h2', { text: 'Open work by status' }), el('span', { 'class': 'cdvh-muted', text: '48 jobs' })]),
      el('div', { 'class': 'cdvh-bar', role: 'img', 'aria-label': status.map(function (s) { return s[0] + ' ' + s[1]; }).join(', ') },
        status.map(function (s) { return el('span', { style: 'flex:' + s[1] + ' 1 0;background:' + s[2] }); })),
      el('div', null, status.map(function (s) {
        return el('div', { 'class': 'cdvh-leg' }, [el('span', { 'class': 'sq', style: 'background:' + s[2] }), el('span', { 'class': 'x', text: s[0] }), el('b', { text: String(s[1]) })]);
      }))
    ]);

    var waiting = [
      ['w1', 'Bank statements (last 2 months)', 'Ironwood Construction', 'requested 9 days ago'],
      ['w2', 'Review 12 uncategorized transactions', 'Atlas Fitness Studio', 'sent 5 days ago'],
      ['w3', 'Approve 4 A/P bills', 'Maple Street Realty', 'sent 3 days ago'],
      ['w4', 'Sign engagement letter', 'Brightpath Tutoring', 'sent 2 days ago']
    ];
    var waitCard = el('section', { 'class': 'cdvh-card', 'aria-label': 'Waiting on clients' }, [
      el('div', { 'class': 'cdvh-ch' }, [el('h2', { text: 'Waiting on clients' }), el('span', { 'class': 'cdvh-muted', text: '9 open' })])
    ].concat(waiting.map(function (w) {
      var sent = !!state.reminded[w[0]];
      return el('div', { 'class': 'cdvh-li' }, [
        el('div', { 'class': 'x' }, [el('span', { 'class': 't', text: w[1] }), el('span', { 'class': 'cdvh-sub', text: w[2] + ' \u00b7 ' + w[3] })]),
        sent ? el('span', { 'class': 'cdvh-pg', style: 'color:#047857', text: 'Reminder sent' })
             : el('button', { type: 'button', 'class': 'cdvh-link', style: 'font-size:12px;white-space:nowrap', text: 'Remind',
                 on: { click: function () { state.reminded[w[0]] = true; render(); } } })
      ]);
    })));

    var dl = [[6, 'Month-end close complete', '10 bookkeeping clients', '7 of 10'],
              [7, 'Quarterly payroll filings', '3 payroll clients', '1 of 3'],
              [27, 'Monthly sales tax returns', '4 sales tax clients', '0 of 4'],
              [37, 'Advisory reviews', '2 advisory clients', '0 of 2']];
    var dlCard = el('section', { 'class': 'cdvh-card', 'aria-label': 'Key deadlines' }, [
      el('div', { 'class': 'cdvh-ch' }, [el('h2', { text: 'Key deadlines' }),
        el('button', { type: 'button', 'class': 'cdvh-link', text: 'Month End', on: { click: function () { go('Month End'); } } })])
    ].concat(dl.map(function (x) {
      return el('div', { 'class': 'cdvh-li', style: 'gap:12px' }, [
        el('span', { 'class': 'cdvh-dl', text: md(addDays(x[0])).toUpperCase() }),
        el('div', { 'class': 'x' }, [el('span', { 'class': 't', text: x[1] }), el('span', { 'class': 'cdvh-sub', text: x[2] })]),
        el('span', { 'class': 'cdvh-pg', text: x[3] })
      ]);
    })));
    /* fixed columns, full width (same idea as the client Dashboard tab):
       Tasks + Latest activity | Upcoming meetings + Waiting on clients | Open work by status + Key deadlines.
       Medium screens: two columns with the third pair underneath; small screens: one column. */
    wrap.appendChild(el('div', { 'class': 'cdvh-cols' }, [
      el('div', { 'class': 'cdvh-col cdvh-main' }, [tasksCard, activityCard()]),
      el('div', { 'class': 'cdvh-col' }, [meetCard, waitCard]),
      el('div', { 'class': 'cdvh-col cdvh-col3' }, [statusCard, dlCard])
    ]));

    root.appendChild(wrap);
    root.scrollTop = scrollTop;
  }

  /* ---------- show / hide ---------- */
  var mainEl = null, mainSnap = '', watcher = null;
  function findMain() { return document.querySelector('main'); }
  function snap(m) { return (m && m.innerText || '').slice(0, 200); }

  function show() {
    var m = findMain();
    if (!m) return;
    if (!root) { root = el('div', { 'class': 'cdvh', id: 'cdv-home', role: 'main', 'aria-label': 'Home' }); }
    if (root.parentNode !== m.parentNode) m.parentNode.insertBefore(root, m.nextSibling);
    mainEl = m;
    m.style.display = 'none';
    root.style.display = '';
    document.body.classList.add('cdv-home');
    render();
    root.scrollTop = 0;
    if (watcher) { watcher.disconnect(); watcher = null; }
    /* if the app switches page by any other route (search, a button, etc.), get out of the way.
       Start watching after the page underneath has settled. */
    setTimeout(function () {
      if (!document.body.classList.contains('cdv-home') || mainEl !== m) return;
      mainSnap = snap(m);
      if (watcher) watcher.disconnect();
      watcher = new MutationObserver(function () { if (snap(mainEl) !== mainSnap) hide(); });
      watcher.observe(m, { childList: true, subtree: true, characterData: true });
    }, 800);
  }
  function hide() {
    if (watcher) { watcher.disconnect(); watcher = null; }
    if (root) root.style.display = 'none';
    var m = findMain(); if (m) m.style.display = '';
    document.body.classList.remove('cdv-home');
  }

  /* ---------- wire up ---------- */
  function markLogos() {
    /* [data-home-link] is set by the app on the sidebar logo, so this also works when the sidebar is minimized */
    [].slice.call(document.querySelectorAll('[data-home-link], nav > div:first-child')).forEach(function (d) {
      if (d.hasAttribute('data-cdv-logo')) return;
      if (d.hasAttribute('data-home-link') || (d.querySelector('svg') && /cordevra/i.test(d.textContent))) {
        d.setAttribute('data-cdv-logo', '');
        d.setAttribute('role', 'link');
        d.setAttribute('tabindex', '0');
        d.setAttribute('aria-label', 'Home');
        d.setAttribute('title', 'Home');
      }
    });
  }

  document.addEventListener('click', function (e) {
    var logo = e.target.closest && e.target.closest('[data-cdv-logo]');
    if (logo) { e.preventDefault(); show(); return; }
    /* any sidebar link leaves Home */
    var link = e.target.closest && e.target.closest('aside a, nav a');
    if (link && document.body.classList.contains('cdv-home') && !(root && root.contains(link))) hide();
  }, true);
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute && e.target.hasAttribute('data-cdv-logo')) { e.preventDefault(); show(); }
  });

  /* page-title separators: replace the "/" between Clients / Leads / Contacts with a thin divider */
  function markSeps() {
    var m = findMain(); if (!m) return;
    [].slice.call(m.querySelectorAll('span,div,i')).forEach(function (e) {
      if (e.children.length === 0 && e.textContent.trim() === '/' && !e.hasAttribute('data-cdv-sep')) {
        e.setAttribute('data-cdv-sep', ''); e.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function boot() {
    /* booking links + client booking page live in their own file */
    if (!document.querySelector('script[src="/booking.js"]')) {
      var bs = document.createElement('script'); bs.src = '/booking.js'; bs.defer = true; document.head.appendChild(bs);
    }
    if (/^\/book(\/|$)/.test(location.pathname)) return; /* public booking page: no Home */
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    var shownFor = null; /* the app shell <main> we last auto-opened Home on */
    function tick() {
      markLogos();
      markSeps();
      var m = findMain();
      /* Home is the landing page: open it once each time the app shell appears (first load, after sign-in) */
      if (m && m !== shownFor && document.querySelector('[data-cdv-logo]')) { shownFor = m; show(); }
    }
    var queued = false;
    new MutationObserver(function () {
      if (queued) return; queued = true;
      requestAnimationFrame(function () { queued = false; tick(); });
    }).observe(document.body, { childList: true, subtree: true });
    tick();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
