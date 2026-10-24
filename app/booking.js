/* Cordevra booking links (prototype, demo data only).
   1) In the app: "Calendar | Calendar settings | Booking page" in the Calendar title (like Clients | Leads | Contacts). Calendar settings is a manager where each firm
      turns meeting types on/off, edits them, picks staff and availability, or adds its own.
   2) Public page at /book/<firm>: clients pick a meeting type, a staff member, a time, and book.
   Settings are kept in this browser (localStorage) so the booking page reflects them. */
(function () {
  'use strict';
  if (window.__cdvBooking) return; window.__cdvBooking = true;

  var FIRM = { name: 'Demo Bookkeeping Co', slug: 'demo-bookkeeping-co' };
  var STAFF = [
    { name: 'Demo Owner', role: 'Owner' },
    { name: 'Jamie Admin', role: 'Client success' },
    { name: 'Riley Bookkeeper', role: 'Bookkeeper' },
    { name: 'Morgan Reviewer', role: 'Senior reviewer' }
  ];
  var LOC = { video: 'Google Meet', phone: 'Phone call', inperson: 'In person' };
  var ICON = {
    video: 'M3 7h12v10H3zM15 10l6-3v10l-6-3',
    phone: 'M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
    inperson: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5',
    clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7v5l3 2',
    back: 'M15 18l-6-6 6-6',
    check: 'M5 12l5 5 9-10',
    link: 'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
    edit: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',
    globe: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
    users: 'M9 11a3 3 0 1 0 0-6a3 3 0 1 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M16 5a3 3 0 0 1 0 6M18 15c2 .5 3 2 3 5'
  };
  var ALL = STAFF.map(function (s) { return s.name; });
  var DEFAULTS = [
    { id: 'discovery', name: 'Discovery call', duration: 30, location: 'video', on: true, audience: 'everyone',
      description: 'A short intro call to talk about your business, what you need, and how we can help.',
      staff: ['Demo Owner', 'Jamie Admin'], days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' },
    { id: 'onboarding', name: 'Onboarding kickoff', duration: 60, location: 'video', on: true, audience: 'clients',
      description: 'For new clients: we walk through access, documents and your first deliverables.',
      staff: ['Demo Owner', 'Riley Bookkeeper'], days: [1, 2, 3, 4], start: '10:00', end: '16:00' },
    { id: 'client-meeting', name: 'Client meeting', duration: 30, location: 'video', on: true, audience: 'clients',
      description: 'For existing clients: questions, updates, or anything about your books.',
      staff: ALL.slice(), days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' },
    { id: 'financial-review', name: 'Financial review', duration: 45, location: 'video', on: true, audience: 'clients',
      description: 'Go over your financial statements, key numbers and what they mean for your business.',
      staff: ['Demo Owner', 'Morgan Reviewer'], days: [2, 3, 4], start: '09:00', end: '15:00' },
    { id: 'tax-planning', name: 'Tax planning', duration: 45, location: 'video', on: true, audience: 'clients',
      description: 'Plan ahead for estimated payments, deductions and year-end decisions.',
      staff: ['Demo Owner'], days: [2, 4], start: '10:00', end: '15:00' },
    { id: 'quick-question', name: 'Quick question', duration: 15, location: 'phone', on: false, audience: 'clients',
      description: 'A short call for a quick question that is easier to talk through.',
      staff: ['Jamie Admin', 'Riley Bookkeeper'], days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' }
  ];
  var KEY = 'cordevra.bookingTypes.v1';
  function load() {
    try { var v = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(v) && v.length) return v; } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
  var types = load();

  /* ---------- helpers ---------- */
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'text') e.textContent = v;
      else if (k === 'on') for (var ev in v) e.addEventListener(ev, v[ev]);
      else if (k === 'style') e.style.cssText = v;
      else if (k === 'value') e.value = v;
      else if (k === 'checked') e.checked = !!v;
      else e.setAttribute(k, v === true ? '' : v);
    }
    (kids || []).forEach(function (c) { if (c != null && c !== false) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function icon(name, size, color) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('width', size || 16); s.setAttribute('height', size || 16); s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', color || 'currentColor'); s.setAttribute('stroke-width', '1.8');
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', ICON[name] || ''); s.appendChild(p);
    return s;
  }
  function initials(n) { return n.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); }
  function slugify(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'meeting'; }
  function bookingUrl(t) { return location.origin + '/book/' + FIRM.slug + (t ? '/' + t.id : ''); }
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAYSL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function fmtTime(mins) { var h = Math.floor(mins / 60), m = mins % 60, ap = h >= 12 ? 'PM' : 'AM'; var hh = h % 12 || 12; return hh + ':' + (m < 10 ? '0' : '') + m + ' ' + ap; }
  function toMin(t) { var p = String(t).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  function toast(msg) {
    var t = el('div', { 'class': 'cdvb-toast', role: 'status', text: msg });
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200);
  }

  var CSS = [
    '.cdvb,.cdvb-modal,.cdvp{font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;color:#1E293B}',
    '.cdvb *,.cdvb-modal *,.cdvp *{box-sizing:border-box}',
    '.cdvb{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:16px}',
    '.cdvb.cdvb-full{max-width:760px;padding:20px}',
    '.cdvb.cdvb-pp{max-width:none}',
    '.cdvb-frame{display:block;width:100%;height:calc(100vh - 260px);min-height:560px;border:1px solid #E2E8F0;border-radius:10px;background:#F8FAFC}',
    '.cdvb-ttabs{display:inline}',
    '.cdvb-sep{display:inline-block;width:1px;height:20px;background:#CBD5E1;margin:0 14px;vertical-align:-3px}',
    '.cdvb-tt{border:0;background:none;padding:0;font:inherit;color:#94A3B8;cursor:pointer}.cdvb-tt:hover{color:#475569}',
    '.cdvb-tt[aria-pressed=true]{color:#0E1A2B}',
    'h1.cdvb-off{color:#94A3B8;cursor:pointer}h1.cdvb-off:hover{color:#475569}h1.cdvb-off .cdvb-tt:hover{color:#475569}h1.cdvb-off .cdvb-tt[aria-pressed=true]{color:#0E1A2B;cursor:default}',
    '.cdvb-h{display:flex;align-items:center;justify-content:space-between;gap:8px}',
    '.cdvb-h h2{margin:0;font-size:15px;font-weight:700;color:#0E1A2B}',
    '.cdvb-sub{font-size:12px;color:#64748B;margin:6px 0 10px}',
    '.cdvb-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:6px;border:1px solid #E2E8F0;background:#fff;color:#1E293B;font-weight:600;font-size:13px;line-height:1;font-family:inherit;cursor:pointer;text-decoration:none}',
    '.cdvb-btn:hover{border-color:#94A3B8}',
    '.cdvb-btn.pri{background:#0F766E;border-color:#0F766E;color:#fff}.cdvb-btn.pri:hover{background:#115E59}',
    '.cdvb-btn.ghost{border-color:transparent;background:transparent;color:#0F766E;padding:0 6px}',
    '.cdvb-btn.danger{color:#B42318}',
    '.cdvb-page{display:flex;align-items:center;gap:8px;background:#F0FDFA;border:1px solid #99F6E4;border-radius:8px;padding:8px 10px;margin-bottom:10px}',
    '.cdvb-page .u{flex:1;min-width:0;font-size:12px;color:#0F766E;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.cdvb-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #F1F5F9}',
    '.cdvb-item .ic{width:30px;height:30px;border-radius:8px;background:#F1F5F9;color:#475569;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.cdvb-item.on .ic{background:#CCFBF1;color:#0F766E}',
    '.cdvb-item .x{flex:1;min-width:0}',
    '.cdvb-item .n{font-size:13px;font-weight:600;color:#0E1A2B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.cdvb-item:not(.on) .n{color:#64748B}',
    '.cdvb-item .m{font-size:11px;color:#64748B}',
    '.cdvb-sw{position:relative;width:34px;height:20px;border-radius:999px;border:0;background:#CBD5E1;cursor:pointer;flex-shrink:0;padding:0}',
    '.cdvb-sw::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:999px;background:#fff;transition:left .15s;box-shadow:0 1px 2px rgba(0,0,0,.2)}',
    '.cdvb-sw[aria-checked=true]{background:#0F766E}.cdvb-sw[aria-checked=true]::after{left:16px}',
    '.cdvb-icon{width:30px;height:30px;border:0;background:transparent;border-radius:6px;color:#475569;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.cdvb-icon:hover{background:#F1F5F9;color:#0E1A2B}',
    '.cdvb-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0E1A2B;color:#fff;font:600 13px "Plus Jakarta Sans",system-ui,sans-serif;padding:10px 16px;border-radius:8px;z-index:100000;box-shadow:0 8px 24px rgba(15,23,42,.25)}',
    /* modal */
    '.cdvb-modal{position:fixed;inset:0;background:rgba(14,26,43,.45);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto}',
    '.cdvb-dlg{background:#fff;border-radius:14px;width:100%;max-width:560px;box-shadow:0 20px 50px rgba(15,23,42,.3)}',
    '.cdvb-dh{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid #E2E8F0}',
    '.cdvb-dh h2{margin:0;font-size:17px;font-weight:700;color:#0E1A2B}',
    '.cdvb-db{padding:18px 20px;display:flex;flex-direction:column;gap:14px}',
    '.cdvb-df{padding:14px 20px;border-top:1px solid #E2E8F0;display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap}',
    '.cdvb-f{display:flex;flex-direction:column;gap:6px}',
    '.cdvb-f>label,.cdvb-f>.lb{font-size:13px;font-weight:600;color:#334155}',
    '.cdvb-in{height:38px;border:1px solid #CBD5E1;border-radius:8px;padding:0 10px;font-size:14px;font-family:inherit;color:#1E293B;background:#fff;width:100%}',
    'textarea.cdvb-in{height:auto;min-height:70px;padding:8px 10px;resize:vertical}',
    '.cdvb-in:focus{outline:2px solid #14B8A6;outline-offset:0;border-color:#14B8A6}',
    '.cdvb-row2{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}',
    '.cdvb-chips{display:flex;flex-wrap:wrap;gap:6px}',
    '.cdvb-chip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:999px;border:1px solid #CBD5E1;background:#fff;font-weight:500;font-size:13px;font-family:inherit;color:#334155;cursor:pointer}',
    '.cdvb-chip[aria-pressed=true]{background:#0E1A2B;border-color:#0E1A2B;color:#fff}',
    '.cdvb-hint{font-size:12px;color:#64748B}',
    '.cdvb-team{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px}',
    '.cdvb-chip.sm{height:28px;padding:0 9px;font-size:11px;font-weight:700}',
    /* public booking page */
    '.cdvp{position:fixed;inset:0;z-index:2147483000;background:#F8FAFC;overflow-y:auto}',
    '.cdvp-top{background:#fff;border-bottom:1px solid #E2E8F0}',
    '.cdvp-top .in{max-width:960px;margin:0 auto;padding:16px;display:flex;align-items:center;gap:12px}',
    '.cdvp-firm{display:flex;flex-direction:column}.cdvp-firm b{font-size:16px;color:#0E1A2B}.cdvp-firm span{font-size:12px;color:#64748B}',
    '.cdvp-main{max-width:960px;margin:0 auto;padding:28px 16px 48px}',
    '.cdvp h1{margin:0 0 6px;font-size:26px;font-weight:700;color:#0E1A2B}',
    '.cdvp-lead{margin:0 0 24px;font-size:15px;color:#475569}',
    '.cdvp-steps{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}',
    '.cdvp-step{font-size:12px;font-weight:600;color:#64748B;background:#F1F5F9;border-radius:999px;padding:4px 10px}',
    '.cdvp-step.cur{background:#0E1A2B;color:#fff}.cdvp-step.done{background:#CCFBF1;color:#0F766E}',
    '.cdvp-types{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}',
    '.cdvp-type{display:flex;flex-direction:column;gap:10px;text-align:left;background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:18px;cursor:pointer;font-family:inherit;color:#1E293B;transition:border-color .15s,box-shadow .15s}',
    '.cdvp-type:hover{border-color:#14B8A6;box-shadow:0 6px 18px rgba(15,118,110,.12)}',
    '.cdvp-type .t{font-size:16px;font-weight:700;color:#0E1A2B}',
    '.cdvp-type .d{font-size:13px;color:#475569;line-height:1.5}',
    '.cdvp-meta{display:flex;flex-wrap:wrap;gap:12px;font-size:13px;color:#475569}',
    '.cdvp-meta span{display:inline-flex;align-items:center;gap:6px}',
    '.cdvp-card{background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:20px}',
    '.cdvp-back{display:inline-flex;align-items:center;gap:4px;border:0;background:none;color:#0F766E;font-weight:600;font-size:14px;font-family:inherit;cursor:pointer;padding:0;margin-bottom:16px}',
    '.cdvp-sum{display:flex;flex-direction:column;gap:6px;padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid #E2E8F0}',
    '.cdvp-sum .t{font-size:18px;font-weight:700;color:#0E1A2B}',
    '.cdvp-staff{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}',
    '.cdvp-person{display:flex;align-items:center;gap:12px;text-align:left;background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:14px;cursor:pointer;font-family:inherit;color:#1E293B}',
    '.cdvp-person:hover{border-color:#14B8A6}',
    '.cdvp-av{width:40px;height:40px;border-radius:999px;background:#E0E7FF;color:#3730A3;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
    '.cdvp-av.any{background:#CCFBF1;color:#0F766E}',
    '.cdvp-person b{display:block;font-size:14px;color:#0E1A2B}.cdvp-person span{font-size:12px;color:#64748B}',
    '.cdvp-pick{display:flex;flex-wrap:wrap;gap:24px}',
    '.cdvp-cal{flex:1 1 300px;min-width:0}',
    '.cdvp-calh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}',
    '.cdvp-calh b{font-size:15px;color:#0E1A2B}',
    '.cdvp-nav{width:34px;height:34px;border:1px solid #E2E8F0;background:#fff;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#334155}',
    '.cdvp-nav:disabled{opacity:.35;cursor:default}',
    '.cdvp-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;text-align:center}',
    '.cdvp-grid .wd{font-size:11px;font-weight:600;color:#64748B;padding:4px 0}',
    '.cdvp-day{height:42px;border-radius:999px;border:0;background:transparent;font-weight:500;font-size:14px;font-family:inherit;color:#CBD5E1;cursor:default}',
    '.cdvp-day.av{color:#0F766E;background:#F0FDFA;font-weight:700;cursor:pointer}',
    '.cdvp-day.av:hover{background:#CCFBF1}',
    '.cdvp-day.sel{background:#0F766E!important;color:#fff!important}',
    '.cdvp-times{flex:1 1 220px;min-width:0;display:flex;flex-direction:column;gap:8px}',
    '.cdvp-times .h{font-size:14px;font-weight:700;color:#0E1A2B;margin-bottom:4px}',
    '.cdvp-slot{height:42px;border:1px solid #14B8A6;background:#fff;color:#0F766E;border-radius:8px;font-weight:600;font-size:14px;font-family:inherit;cursor:pointer}',
    '.cdvp-slot:hover{background:#F0FDFA}',
    '.cdvp-tz{display:flex;align-items:center;gap:6px;font-size:12px;color:#64748B;margin-top:12px}',
    '.cdvp-form{display:flex;flex-direction:column;gap:14px;max-width:520px}',
    '.cdvp-ok{text-align:center;max-width:520px;margin:0 auto}',
    '.cdvp-okic{width:56px;height:56px;border-radius:999px;background:#CCFBF1;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}',
    '.cdvp-foot{text-align:center;font-size:12px;color:#94A3B8;padding:24px 0}',
    '.cdvp-empty{font-size:14px;color:#64748B;padding:8px 0}',
    '.cdvp-team{display:flex;gap:10px;overflow-x:auto;padding:2px 2px 6px;margin-bottom:20px}',
    '.cdvp-tm{display:flex;align-items:center;gap:10px;flex-shrink:0;min-height:52px;padding:8px 14px 8px 8px;border-radius:999px;border:1px solid #E2E8F0;background:#fff;cursor:pointer;font-family:inherit;color:#1E293B;text-align:left}',
    '.cdvp-tm:hover{border-color:#14B8A6}',
    '.cdvp-tm[aria-pressed=true]{background:#0E1A2B;border-color:#0E1A2B;color:#fff}',
    '.cdvp-tm .tx{display:flex;flex-direction:column}.cdvp-tm b{font-size:13px}.cdvp-tm .tx span{font-size:11px;color:#64748B}',
    '.cdvp-tm[aria-pressed=true] .tx span{color:#CBD5E1}',
    '.cdvp-av.sm{width:34px;height:34px;font-size:12px}',
    '.cdvp-av.xs{width:26px;height:26px;font-size:10px;border:2px solid #fff;margin-left:-6px}',
    '.cdvp-faces{display:flex;padding-left:6px;margin-top:2px}',
    /* meeting notes in activity */
    'section.cdvm-only ol>li:not([data-cdv-meet]){display:none!important}',
    'section.cdvm-hide ol>li[data-cdv-meet]{display:none!important}',
    '[data-cdv-meet]{font-family:inherit}',
    '.cdvm-dot{position:absolute;left:-25px;top:4px;width:10px;height:10px;border-radius:999px;border:2px solid #fff;background:#0F766E}',
    '.cdvm-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:12px;color:#64748B}',
    '.cdvm-badge{display:inline-flex;align-items:center;border-radius:999px;padding:2px 8px;font-size:12px;font-weight:500;background:#CCFBF1;color:#115E59}',
    '.cdvm-box{margin-top:6px;border:1px solid #E2E8F0;border-radius:10px;padding:12px 14px;background:#FCFDFD}',
    '.cdvm-title{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}',
    '.cdvm-title b{font-size:14px;color:#0E1A2B;letter-spacing:.01em}',
    '.cdvm-src{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:#475569}',
    '.cdvm-rule{border:0;border-top:1px dashed #94A3B8;margin:8px 0 10px}',
    '.cdvm-h{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#64748B;margin:10px 0 4px}',
    '.cdvm-p{margin:0;font-size:14px;color:#1E293B;line-height:1.5}',
    '.cdvm-ul{margin:0;padding-left:18px;font-size:14px;color:#1E293B;line-height:1.6}',
    '.cdvm-act li span{margin-right:8px}',
    '.cdvm-own{display:inline-block;font-size:11px;font-weight:600;color:#3730A3;background:#E0E7FF;border-radius:999px;padding:1px 8px}',
    '.cdvm-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;padding-top:8px;border-top:1px solid #F1F5F9}',
    '.cdvm-hint{font-size:12px;color:#64748B}',
    '.cdvm-link{border:0;background:none;padding:0;font-size:12px;font-weight:600;color:#0F766E;cursor:pointer;font-family:inherit}',
    '.cdvm-tr{margin-top:8px;font-size:13px;color:#334155;background:#F8FAFC;border-radius:8px;padding:8px 10px}.cdvm-tr p{margin:4px 0}',
    '.cdvb-int{display:flex;align-items:center;gap:10px;border:1px solid #E2E8F0;border-radius:8px;padding:8px 10px;margin-bottom:8px}',
    '.cdvb-int .x{flex:1;min-width:0}.cdvb-int b{display:block;font-size:13px;color:#0E1A2B}.cdvb-int span{font-size:11px;color:#64748B}'
  ].join('\n');

  function injectCss() {
    if (document.getElementById('cdvb-css')) return;
    var st = document.createElement('style'); st.id = 'cdvb-css'; st.textContent = CSS; document.head.appendChild(st);
  }

  /* =====================================================================
     1) APP: booking link manager on the Calendar page
     ===================================================================== */
  var card = null;

  function findOriginalCard() {
    var main = document.querySelector('main'); if (!main) return null;
    var head = [].slice.call(main.querySelectorAll('h1,h2,h3,h4,div,span,p')).filter(function (e) {
      return e.children.length === 0 && e.textContent.trim() === 'Booking links' && !(card && card.contains(e));
    })[0];
    if (!head) return null;
    var c = head;
    while (c.parentElement && c.parentElement !== main && c.parentElement.textContent.indexOf('Next 30 days') === -1) c = c.parentElement;
    return c;
  }

  function renderCard() {
    if (!card) card = el('section', { 'class': 'cdvb', 'aria-label': 'Booking links', id: 'cdvb-card' });
    card.innerHTML = '';
    var onCount = types.filter(function (t) { return t.on; }).length;
    card.appendChild(el('div', { 'class': 'cdvb-h' }, [
      el('h2', { text: 'Booking links' }),
      el('button', { type: 'button', 'class': 'cdvb-btn', on: { click: function () { openEditor(null); } } }, ['+ Add'])
    ]));
    card.appendChild(el('p', { 'class': 'cdvb-sub', text: 'Meeting types clients and prospects can book. ' + onCount + ' of ' + types.length + ' are on your booking page.' }));
    card.appendChild(el('div', { 'class': 'cdvb-page' }, [
      icon('globe', 16, '#0F766E'),
      el('span', { 'class': 'u', text: bookingUrl().replace(/^https?:\/\//, '') }),
      el('button', { type: 'button', 'class': 'cdvb-btn ghost', text: 'Copy', on: { click: function () { copy(bookingUrl()); } } }),
      el('a', { 'class': 'cdvb-btn ghost', href: bookingUrl(), target: '_blank', rel: 'noopener', text: 'Open' })
    ]));
    var gmOn = meetOn();
    card.appendChild(el('div', { 'class': 'cdvb-int' }, [
      el('span', { 'class': 'cdvb-item', style: 'padding:0;border:0' }, [el('span', { 'class': 'ic', style: 'background:#CCFBF1;color:#0F766E;width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center' }, [icon('video', 16)])]),
      el('div', { 'class': 'x' }, [el('b', { text: 'Google Meet' }), el('span', { text: gmOn ? 'Video meetings get a Meet link. Notes go to the client\u2019s Activity.' : 'Meeting notes are off.' })]),
      el('button', { type: 'button', role: 'switch', 'class': 'cdvb-sw', 'aria-checked': String(gmOn), 'aria-label': 'Add Google Meet notes to client Activity',
        on: { click: function () { try { localStorage.setItem(MEET_KEY, gmOn ? 'off' : 'on'); } catch (e) {} renderCard(); } } })
    ]));
    card.appendChild(el('div', { 'class': 'cdvb-team' }, [el('span', { 'class': 'cdvb-hint', text: 'Personal links:' })].concat(STAFF.map(function (p) {
      return el('button', { type: 'button', 'class': 'cdvb-chip sm', title: 'Copy ' + p.name + '\u2019s booking link', text: initials(p.name),
        'aria-label': 'Copy ' + p.name + '\u2019s booking link', on: { click: function () { copy(location.origin + '/book/' + FIRM.slug + '/with/' + slugify(p.name)); } } });
    }))));
    types.forEach(function (t) {
      var sw = el('button', { type: 'button', role: 'switch', 'class': 'cdvb-sw', 'aria-checked': String(!!t.on), 'aria-label': (t.on ? 'Turn off ' : 'Turn on ') + t.name,
        on: { click: function () { t.on = !t.on; save(types); renderCard(); } } });
      card.appendChild(el('div', { 'class': 'cdvb-item' + (t.on ? ' on' : '') }, [
        el('span', { 'class': 'ic' }, [icon(t.location, 16)]),
        el('div', { 'class': 'x' }, [
          el('div', { 'class': 'n', text: t.name }),
          el('div', { 'class': 'm', text: t.duration + ' min \u00b7 ' + LOC[t.location] + ' \u00b7 ' + (t.staff.length === STAFF.length ? 'Whole team' : t.staff.length + (t.staff.length === 1 ? ' person' : ' people')) })
        ]),
        el('button', { type: 'button', 'class': 'cdvb-icon', 'aria-label': 'Copy link: ' + t.name, title: 'Copy link', on: { click: function () { copy(bookingUrl(t)); } } }, [icon('link', 15)]),
        el('button', { type: 'button', 'class': 'cdvb-icon', 'aria-label': 'Edit ' + t.name, title: 'Edit', on: { click: function () { openEditor(t); } } }, [icon('edit', 15)]),
        sw
      ]));
    });
    card.appendChild(el('div', { style: 'border-top:1px solid #F1F5F9;padding-top:10px;display:flex;justify-content:flex-end' }, [
      el('button', { type: 'button', 'class': 'cdvb-btn ghost', style: 'font-size:12px;color:#64748B', text: 'Reset to defaults',
        on: { click: function () { if (confirm('Reset booking links to the default meeting types?')) { types = JSON.parse(JSON.stringify(DEFAULTS)); save(types); renderCard(); } } } })
    ]));
  }

  function copy(text) {
    var done = function () { toast('Link copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { prompt('Copy this link', text); });
    else prompt('Copy this link', text);
  }

  /* Calendar module title works like "Clients | Leads | Contacts":
     Calendar | Calendar settings | Booking page.
     Calendar settings = booking links (meeting types, staff, availability, Google Meet, personal links).
     Booking page = the firm's public booking page (link to share + live preview). */
  var calView = 'calendar', calHead = null, pagePanel = null;
  var CAL_SUB = { settings: 'Meeting types clients and prospects can book, who takes them, and when.', page: 'The page clients and prospects use to book a meeting with your firm.' };
  function calendarHeader() {
    var main = document.querySelector('main'); if (!main) return null;
    var h = main.querySelector('h1');
    return h && (h.firstChild && h.firstChild.nodeType === 3 ? h.firstChild.nodeValue.trim() : h.textContent.trim()) === 'Calendar' ? h : null;
  }
  function renderPagePanel() {
    if (!pagePanel) pagePanel = el('section', { 'class': 'cdvb cdvb-full cdvb-pp', 'aria-label': 'Booking page' });
    pagePanel.innerHTML = '';
    var onN = types.filter(function (t) { return t.on; }).length;
    pagePanel.appendChild(el('div', { 'class': 'cdvb-page' }, [
      icon('globe', 16, '#0F766E'),
      el('span', { 'class': 'u', text: bookingUrl().replace(/^https?:\/\//, '') }),
      el('button', { type: 'button', 'class': 'cdvb-btn ghost', text: 'Copy link', on: { click: function () { copy(bookingUrl()); } } }),
      el('a', { 'class': 'cdvb-btn ghost', href: bookingUrl(), target: '_blank', rel: 'noopener', text: 'Open \u2197' })
    ]));
    pagePanel.appendChild(el('p', { 'class': 'cdvb-sub', text: onN + ' of ' + types.length + ' meeting types are on this page. Change them in Calendar settings. Personal links (one person only) are in Calendar settings too.' }));
    pagePanel.appendChild(el('iframe', { 'class': 'cdvb-frame', src: bookingUrl() + '?embed=1', title: 'Booking page preview' }));
  }
  function mountCard() {
    var orig = findOriginalCard();
    if (orig) { orig.setAttribute('data-cdvb-hidden', ''); orig.style.display = 'none'; }
    var h = calendarHeader();
    if (!h) { calHead = null; calView = 'calendar'; return; }
    if (h !== calHead) { calHead = h; calView = 'calendar'; }
    var tabs = h.querySelector('.cdvb-ttabs');
    if (!tabs) {
      tabs = el('span', { 'class': 'cdvb-ttabs' }, [
        el('span', { 'class': 'cdvb-sep', 'aria-hidden': 'true' }),
        el('button', { type: 'button', 'class': 'cdvb-tt', 'data-v': 'settings', text: 'Calendar settings', on: { click: function (e) { e.stopPropagation(); setView('settings'); } } }),
        el('span', { 'class': 'cdvb-sep', 'aria-hidden': 'true' }),
        el('button', { type: 'button', 'class': 'cdvb-tt', 'data-v': 'page', text: 'Booking page', on: { click: function (e) { e.stopPropagation(); setView('page'); } } })
      ]);
      h.appendChild(tabs);
      h.addEventListener('click', function (e) { if (e.target === h) setView('calendar'); });
    }
    var head = h.closest('.mb-5') || h.parentNode.parentNode;
    var page = head.parentNode;
    h.classList.toggle('cdvb-off', calView !== 'calendar');
    [].forEach.call(tabs.querySelectorAll('.cdvb-tt'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === calView)); });
    /* "+ New meeting" belongs to the calendar view */
    var acts = head.children.length > 1 ? head.lastElementChild : null;
    if (acts && !acts.contains(h)) acts.style.visibility = calView === 'calendar' ? '' : 'hidden';
    var sub = head.querySelector('p');
    if (sub) {
      if (!sub.hasAttribute('data-cal-sub')) sub.setAttribute('data-cal-sub', sub.textContent);
      var want = CAL_SUB[calView] || sub.getAttribute('data-cal-sub');
      if (sub.textContent !== want) sub.textContent = want;
    }
    [].slice.call(page.children).forEach(function (c) {
      if (c === head || c === card || c === pagePanel) return;
      if (calView !== 'calendar') { if (c.style.display !== 'none') { c.setAttribute('data-cdvb-cal', ''); c.style.display = 'none'; } }
      else if (c.hasAttribute('data-cdvb-cal')) { c.removeAttribute('data-cdvb-cal'); c.style.display = ''; }
    });
    if (calView === 'settings') {
      if (!card || card.parentNode !== page) { renderCard(); page.insertBefore(card, head.nextSibling); }
      card.classList.add('cdvb-full');
    } else if (card && card.parentNode) card.parentNode.removeChild(card);
    if (calView === 'page') {
      if (!pagePanel || pagePanel.parentNode !== page) { renderPagePanel(); page.insertBefore(pagePanel, head.nextSibling); }
    } else if (pagePanel && pagePanel.parentNode) pagePanel.parentNode.removeChild(pagePanel);
  }
  function setView(v) { if (calView === v) return; calView = v; mountCard(); }

  /* ---------- editor modal ---------- */
  function openEditor(existing) {
    var isNew = !existing;
    var d = existing ? JSON.parse(JSON.stringify(existing)) : { id: '', name: '', duration: 30, location: 'video', on: true, audience: 'clients', description: '', staff: ['Demo Owner'], days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' };
    var prevFocus = document.activeElement;
    var modal = el('div', { 'class': 'cdvb-modal', on: { mousedown: function (e) { if (e.target === modal) close(); } } });
    function close() { modal.remove(); document.removeEventListener('keydown', onKey, true); if (prevFocus && prevFocus.focus) prevFocus.focus(); }
    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    document.addEventListener('keydown', onKey, true);

    var name = el('input', { 'class': 'cdvb-in', id: 'cdvb-name', value: d.name, placeholder: 'e.g. Year-end planning' });
    var desc = el('textarea', { 'class': 'cdvb-in', id: 'cdvb-desc', placeholder: 'What clients should expect from this meeting' });
    desc.value = d.description;
    var dur = el('select', { 'class': 'cdvb-in', id: 'cdvb-dur' }, [15, 20, 30, 45, 60, 90].map(function (m) { return el('option', { value: String(m), text: m + ' minutes' }); }));
    dur.value = String(d.duration);
    var loc = el('select', { 'class': 'cdvb-in', id: 'cdvb-loc' }, Object.keys(LOC).map(function (k) { return el('option', { value: k, text: LOC[k] }); }));
    loc.value = d.location;
    var aud = el('select', { 'class': 'cdvb-in', id: 'cdvb-aud' }, [el('option', { value: 'everyone', text: 'Anyone (prospects and clients)' }), el('option', { value: 'clients', text: 'Clients only' })]);
    aud.value = d.audience;
    var st = el('input', { 'class': 'cdvb-in', type: 'time', id: 'cdvb-st', value: d.start });
    var en = el('input', { 'class': 'cdvb-in', type: 'time', id: 'cdvb-en', value: d.end });

    function chipGroup(label, items, isOn, toggle) {
      var wrap = el('div', { 'class': 'cdvb-chips', role: 'group', 'aria-label': label });
      function draw() {
        wrap.innerHTML = '';
        items.forEach(function (it) {
          wrap.appendChild(el('button', { type: 'button', 'class': 'cdvb-chip', 'aria-pressed': String(isOn(it.v)), text: it.l, on: { click: function () { toggle(it.v); draw(); } } }));
        });
      }
      draw(); return wrap;
    }
    var staffChips = chipGroup('Staff', STAFF.map(function (s) { return { v: s.name, l: s.name }; }),
      function (v) { return d.staff.indexOf(v) > -1; },
      function (v) { var i = d.staff.indexOf(v); if (i > -1) d.staff.splice(i, 1); else d.staff.push(v); });
    var dayChips = chipGroup('Days', [1, 2, 3, 4, 5, 6, 0].map(function (n) { return { v: n, l: DAYS[n] }; }),
      function (v) { return d.days.indexOf(v) > -1; },
      function (v) { var i = d.days.indexOf(v); if (i > -1) d.days.splice(i, 1); else d.days.push(v); });
    var err = el('div', { role: 'alert', style: 'font-size:13px;color:#B42318;min-height:0' });

    function submit() {
      d.name = name.value.trim(); d.description = desc.value.trim();
      d.duration = +dur.value; d.location = loc.value; d.audience = aud.value; d.start = st.value || '09:00'; d.end = en.value || '17:00';
      if (!d.name) { err.textContent = 'Give the meeting a name.'; name.focus(); return; }
      if (!d.staff.length) { err.textContent = 'Pick at least one staff member.'; return; }
      if (!d.days.length) { err.textContent = 'Pick at least one day.'; return; }
      if (toMin(d.end) - toMin(d.start) < d.duration) { err.textContent = 'The available hours are shorter than the meeting.'; return; }
      if (isNew) {
        var base = slugify(d.name), id = base, n = 2;
        while (types.some(function (t) { return t.id === id; })) id = base + '-' + (n++);
        d.id = id; types.push(d);
      } else {
        for (var i = 0; i < types.length; i++) if (types[i].id === d.id) types[i] = d;
      }
      save(types); renderCard(); close(); toast(isNew ? 'Meeting type added' : 'Changes saved');
    }

    var foot = el('div', { 'class': 'cdvb-df' }, [
      isNew ? el('span') : el('button', { type: 'button', 'class': 'cdvb-btn danger', text: 'Delete', on: { click: function () {
        if (confirm('Delete "' + existing.name + '"?')) { types = types.filter(function (t) { return t.id !== existing.id; }); save(types); renderCard(); close(); toast('Meeting type deleted'); }
      } } }),
      el('div', { style: 'display:flex;gap:8px' }, [
        el('button', { type: 'button', 'class': 'cdvb-btn', text: 'Cancel', on: { click: close } }),
        el('button', { type: 'button', 'class': 'cdvb-btn pri', text: isNew ? 'Add meeting type' : 'Save', on: { click: submit } })
      ])
    ]);

    var dlg = el('div', { 'class': 'cdvb-dlg', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cdvb-dt' }, [
      el('div', { 'class': 'cdvb-dh' }, [el('h2', { id: 'cdvb-dt', text: isNew ? 'New meeting type' : 'Edit meeting type' }),
        el('button', { type: 'button', 'class': 'cdvb-icon', 'aria-label': 'Close', on: { click: close } }, [el('span', { 'aria-hidden': 'true', style: 'font-size:20px;line-height:1', text: '\u00d7' })])]),
      el('div', { 'class': 'cdvb-db' }, [
        el('div', { 'class': 'cdvb-f' }, [el('label', { 'for': 'cdvb-name', text: 'Name' }), name]),
        el('div', { 'class': 'cdvb-f' }, [el('label', { 'for': 'cdvb-desc', text: 'Description' }), desc]),
        el('div', { 'class': 'cdvb-row2' }, [
          el('div', { 'class': 'cdvb-f' }, [el('label', { 'for': 'cdvb-dur', text: 'Length' }), dur]),
          el('div', { 'class': 'cdvb-f' }, [el('label', { 'for': 'cdvb-loc', text: 'Where' }), loc])
        ]),
        el('div', { 'class': 'cdvb-f' }, [el('label', { 'for': 'cdvb-aud', text: 'Who can book' }), aud]),
        el('div', { 'class': 'cdvb-f' }, [el('span', { 'class': 'lb', text: 'Staff who take this meeting' }), staffChips,
          el('span', { 'class': 'cdvb-hint', text: 'Clients can pick one of these people, or the first one available.' })]),
        el('div', { 'class': 'cdvb-f' }, [el('span', { 'class': 'lb', text: 'Available days' }), dayChips]),
        el('div', { 'class': 'cdvb-row2' }, [
          el('div', { 'class': 'cdvb-f' }, [el('label', { 'for': 'cdvb-st', text: 'From' }), st]),
          el('div', { 'class': 'cdvb-f' }, [el('label', { 'for': 'cdvb-en', text: 'To' }), en])
        ]),
        err
      ]),
      foot
    ]);
    modal.appendChild(dlg);
    document.body.appendChild(modal);
    name.focus();
  }

  /* =====================================================================
     2) PUBLIC: client booking page at /book/<firm>[/<type>]
     ===================================================================== */
  function bookingPage() {
    var parts = location.pathname.split('/').filter(Boolean); /* ['book', firm, type?] */
    var root = el('div', { 'class': 'cdvp', id: 'cdvp' });
    document.body.appendChild(root);
    var appRoot = document.getElementById('root'); if (appRoot) appRoot.style.display = 'none';
    document.title = 'Book a meeting \u00b7 ' + FIRM.name;

    function fresh() { return { step: 'type', person: null, type: null, staff: null, month: null, date: null, time: null, booked: null }; }
    var s = fresh();
    var live = types.filter(function (t) { return t.on; });
    function personSlug(n) { return slugify(n); }
    if (parts[2] === 'with' && parts[3]) {
      var who = STAFF.filter(function (p) { return personSlug(p.name) === parts[3]; })[0];
      if (who) s.person = who.name;
    } else if (parts[2]) {
      var pre = live.filter(function (t) { return t.id === parts[2]; })[0];
      if (pre) { s.type = pre; if (pre.staff.length > 1) s.step = 'staff'; else { s.staff = pre.staff[0]; s.step = 'time'; } }
    }

    function busy(dateKey, staffName, mins) {
      /* deterministic fake calendar: roughly a third of slots are taken */
      var str = dateKey + '|' + staffName + '|' + mins, h = 0;
      for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
      return h % 3 === 0;
    }
    function dk(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function slotsFor(date) {
      var t = s.type, out = [];
      if (t.days.indexOf(date.getDay()) === -1) return out;
      var people = s.staff ? [s.staff] : t.staff;
      var now = new Date(), minLead = new Date(now.getTime() + 4 * 3600 * 1000);
      for (var m = toMin(t.start); m + t.duration <= toMin(t.end); m += 30) {
        var dt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(m / 60), m % 60);
        if (dt < minLead) continue;
        var who = people.filter(function (p) { return !busy(dk(date), p, m); })[0];
        if (who) out.push({ m: m, who: who });
      }
      return out;
    }

    function header() {
      return el('div', { 'class': 'cdvp-top' }, [el('div', { 'class': 'in' }, [
        (function () { var x = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); x.setAttribute('width', '40'); x.setAttribute('height', '40'); x.setAttribute('viewBox', '0 0 64 64'); x.setAttribute('aria-hidden', 'true');
          x.innerHTML = '<rect width="64" height="64" rx="14" fill="#0E1A2B"></rect><path d="M44 18.5A19 19 0 1 0 44 45.5" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"></path><circle cx="49" cy="32" r="5" fill="#14B8A6"></circle>'; return x; })(),
        el('div', { 'class': 'cdvp-firm' }, [el('b', { text: FIRM.name }), el('span', { text: 'Book a meeting' })])
      ])]);
    }
    function steps() {
      var order = ['type', 'staff', 'time', 'details'], labels = { type: '1. Meeting', staff: '2. Who', time: '3. Time', details: '4. Your details' };
      var cur = order.indexOf(s.step);
      return el('div', { 'class': 'cdvp-steps', 'aria-label': 'Steps' }, order.map(function (k, i) {
        return el('span', { 'class': 'cdvp-step' + (i === cur ? ' cur' : i < cur ? ' done' : ''), 'aria-current': i === cur ? 'step' : null, text: labels[k] });
      }));
    }
    function back(to) { return el('button', { type: 'button', 'class': 'cdvp-back', on: { click: function () { s.step = to; draw(); } } }, [icon('back', 16), 'Back']); }
    function meta(t, extra) {
      return el('div', { 'class': 'cdvp-meta' }, [
        el('span', null, [icon('clock', 15), t.duration + ' min']),
        el('span', null, [icon(t.location, 15), LOC[t.location]]),
        extra || null
      ]);
    }
    function summary() {
      var whoTxt = s.staff || 'First available';
      var extra = el('span', null, [icon('users', 15), whoTxt]);
      var kids = [el('span', { 'class': 't', text: s.type.name }), meta(s.type, extra)];
      if (s.date && s.time != null && s.step === 'details') kids.push(el('div', { style: 'font-size:14px;font-weight:600;color:#0F766E', text: DAYSL[s.date.getDay()] + ', ' + MONL[s.date.getMonth()] + ' ' + s.date.getDate() + ' \u00b7 ' + fmtTime(s.time.m) + ' with ' + s.time.who }));
      return el('div', { 'class': 'cdvp-sum' }, kids);
    }

    function draw() {
      root.innerHTML = '';
      root.appendChild(header());
      var main = el('main', { 'class': 'cdvp-main' });
      root.appendChild(main);

      if (s.booked) {
        var b = s.booked;
        main.appendChild(el('div', { 'class': 'cdvp-card cdvp-ok' }, [
          el('div', { 'class': 'cdvp-okic' }, [icon('check', 28, '#0F766E')]),
          el('h1', { text: 'You\u2019re booked' }),
          el('p', { 'class': 'cdvp-lead', text: 'A confirmation was sent to ' + b.email + '.' }),
          el('div', { 'class': 'cdvp-sum', style: 'text-align:left;border:1px solid #E2E8F0;border-radius:12px;padding:16px' }, [
            el('span', { 'class': 't', text: b.type.name }),
            el('div', { style: 'font-size:14px;color:#334155', text: DAYSL[b.date.getDay()] + ', ' + MONL[b.date.getMonth()] + ' ' + b.date.getDate() + ' \u00b7 ' + fmtTime(b.time.m) + ' \u2013 ' + fmtTime(b.time.m + b.type.duration) }),
            el('div', { style: 'font-size:14px;color:#334155', text: 'With ' + b.time.who + ' \u00b7 ' + LOC[b.type.location] })
          ]),
          el('button', { type: 'button', 'class': 'cdvb-btn', text: 'Book another meeting', on: { click: function () { s = fresh(); draw(); } } })
        ]));
        main.appendChild(el('div', { 'class': 'cdvp-foot', text: 'Scheduling by cordevra' }));
        return;
      }

      main.appendChild(steps());

      if (s.step === 'type') {
        var team = STAFF.filter(function (p) { return live.some(function (t) { return t.staff.indexOf(p.name) > -1; }); });
        var shown = s.person ? live.filter(function (t) { return t.staff.indexOf(s.person) > -1; }) : live;
        main.appendChild(el('h1', { text: s.person ? 'Book a meeting with ' + s.person : 'What would you like to meet about?' }));
        main.appendChild(el('p', { 'class': 'cdvp-lead', text: s.person ? 'Here are the meetings ' + s.person.split(' ')[0] + ' is available for.' : 'Choose someone on our team, or pick a meeting type to see everyone\u2019s open times.' }));
        /* team filter */
        var teamRow = el('div', { 'class': 'cdvp-team', role: 'group', 'aria-label': 'Filter by team member' });
        [{ any: true, name: 'Everyone' }].concat(team).forEach(function (p) {
          var on = p.any ? !s.person : s.person === p.name;
          teamRow.appendChild(el('button', { type: 'button', 'class': 'cdvp-tm', 'aria-pressed': String(on), on: { click: function () {
            s.person = p.any ? null : p.name;
            try { history.replaceState(null, '', '/book/' + FIRM.slug + (s.person ? '/with/' + personSlug(s.person) : '')); } catch (e) {}
            draw();
          } } }, [
            el('span', { 'class': 'cdvp-av sm' + (p.any ? ' any' : '') }, [p.any ? icon('users', 15) : initials(p.name)]),
            el('span', { 'class': 'tx' }, [el('b', { text: p.name }), p.role ? el('span', { text: p.role }) : el('span', { text: live.length + ' meeting types' })])
          ]));
        });
        main.appendChild(teamRow);
        if (!shown.length) main.appendChild(el('p', { 'class': 'cdvp-empty', text: 'No meeting types are open for booking right now.' }));
        main.appendChild(el('div', { 'class': 'cdvp-types' }, shown.map(function (t) {
          var people = STAFF.filter(function (p) { return t.staff.indexOf(p.name) > -1; });
          return el('button', { type: 'button', 'class': 'cdvp-type', on: { click: function () {
            s.type = t; s.date = null; s.month = null;
            if (s.person) { s.staff = s.person; s.step = 'time'; }
            else if (t.staff.length === 1) { s.staff = t.staff[0]; s.step = 'time'; }
            else { s.staff = null; s.step = 'staff'; }
            draw();
          } } }, [
            el('span', { 'class': 't', text: t.name }),
            meta(t),
            t.description ? el('span', { 'class': 'd', text: t.description }) : null,
            s.person ? null : el('span', { 'class': 'cdvp-faces', 'aria-label': 'With ' + people.map(function (p) { return p.name; }).join(', ') },
              people.slice(0, 4).map(function (p) { return el('span', { 'class': 'cdvp-av xs', title: p.name, text: initials(p.name) }); }))
          ]);
        })));
      }

      else if (s.step === 'staff') {
        main.appendChild(back('type'));
        var c1 = el('div', { 'class': 'cdvp-card' }, [summary(), el('h1', { style: 'font-size:20px', text: 'Who would you like to meet with?' }), el('p', { 'class': 'cdvp-lead', style: 'font-size:14px;margin-bottom:16px', text: 'Choose a person, or take the first available time with anyone on the team.' })]);
        var opts = [{ any: true }].concat(STAFF.filter(function (p) { return s.type.staff.indexOf(p.name) > -1; }));
        c1.appendChild(el('div', { 'class': 'cdvp-staff' }, opts.map(function (p) {
          return el('button', { type: 'button', 'class': 'cdvp-person', on: { click: function () { s.staff = p.any ? null : p.name; s.step = 'time'; s.date = null; draw(); } } }, [
            el('span', { 'class': 'cdvp-av' + (p.any ? ' any' : '') }, [p.any ? icon('users', 18) : initials(p.name)]),
            el('span', null, [el('b', { text: p.any ? 'First available' : p.name }), el('span', { text: p.any ? 'Most times to choose from' : p.role })])
          ]);
        })));
        main.appendChild(c1);
      }

      else if (s.step === 'time') {
        main.appendChild(back(!s.person && s.type.staff.length > 1 ? 'staff' : 'type'));
        var today = new Date(); today.setHours(0, 0, 0, 0);
        if (!s.month) s.month = new Date(today.getFullYear(), today.getMonth(), 1);
        var last = new Date(today.getTime() + 60 * 86400000);
        var c2 = el('div', { 'class': 'cdvp-card' }, [summary()]);
        var pick = el('div', { 'class': 'cdvp-pick' });
        /* month grid */
        var y = s.month.getFullYear(), mo = s.month.getMonth();
        var first = new Date(y, mo, 1), startPad = (first.getDay() + 6) % 7, daysIn = new Date(y, mo + 1, 0).getDate();
        var prevOk = new Date(y, mo, 1) > new Date(today.getFullYear(), today.getMonth(), 1);
        var nextOk = new Date(y, mo + 1, 1) <= last;
        var grid = el('div', { 'class': 'cdvp-grid', role: 'grid', 'aria-label': MONL[mo] + ' ' + y }, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (w) { return el('div', { 'class': 'wd', text: w }); }));
        for (var i = 0; i < startPad; i++) grid.appendChild(el('span'));
        var firstAvail = null;
        for (var dnum = 1; dnum <= daysIn; dnum++) {
          (function (date) {
            var ok = date >= today && date <= last && slotsFor(date).length > 0;
            if (ok && !firstAvail) firstAvail = date;
            var sel = s.date && dk(s.date) === dk(date);
            grid.appendChild(el('button', { type: 'button', 'class': 'cdvp-day' + (ok ? ' av' : '') + (sel ? ' sel' : ''), disabled: !ok,
              'aria-label': DAYSL[date.getDay()] + ', ' + MONL[date.getMonth()] + ' ' + date.getDate() + (ok ? '' : ', no times'), 'aria-pressed': sel ? 'true' : null,
              text: String(date.getDate()), on: { click: function () { s.date = date; draw(); } } }));
          })(new Date(y, mo, dnum));
        }
        if (!s.date && firstAvail) s.date = firstAvail;
        if (s.date && !(s.date.getMonth() === mo && s.date.getFullYear() === y)) s.date = firstAvail;
        if (s.date) [].slice.call(grid.querySelectorAll('.cdvp-day')).forEach(function (b) { if (+b.textContent === s.date.getDate()) { b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); } });
        var cal = el('div', { 'class': 'cdvp-cal' }, [
          el('div', { 'class': 'cdvp-calh' }, [
            el('button', { type: 'button', 'class': 'cdvp-nav', 'aria-label': 'Previous month', disabled: !prevOk, on: { click: function () { s.month = new Date(y, mo - 1, 1); s.date = null; draw(); } } }, [icon('back', 16)]),
            el('b', { text: MONL[mo] + ' ' + y }),
            el('button', { type: 'button', 'class': 'cdvp-nav', 'aria-label': 'Next month', disabled: !nextOk, on: { click: function () { s.month = new Date(y, mo + 1, 1); s.date = null; draw(); } } }, [(function () { var ic = icon('back', 16); ic.style.transform = 'scaleX(-1)'; return ic; })()])
          ]),
          grid,
          el('div', { 'class': 'cdvp-tz' }, [icon('globe', 14), 'Times shown in ' + (Intl.DateTimeFormat().resolvedOptions().timeZone || 'your time zone').replace(/_/g, ' ')])
        ]);
        var times = el('div', { 'class': 'cdvp-times' });
        if (s.date) {
          times.appendChild(el('div', { 'class': 'h', text: DAYSL[s.date.getDay()] + ', ' + MONL[s.date.getMonth()] + ' ' + s.date.getDate() }));
          slotsFor(s.date).forEach(function (sl) {
            times.appendChild(el('button', { type: 'button', 'class': 'cdvp-slot', 'aria-label': fmtTime(sl.m) + (s.staff ? '' : ' with ' + sl.who), text: fmtTime(sl.m),
              on: { click: function () { s.time = sl; s.step = 'details'; draw(); } } }));
          });
        } else {
          times.appendChild(el('p', { 'class': 'cdvp-empty', text: 'No open times this month. Try the next month.' }));
        }
        pick.appendChild(cal); pick.appendChild(times);
        c2.appendChild(el('h1', { style: 'font-size:20px;margin-bottom:16px', text: 'Pick a date and time' }));
        c2.appendChild(pick);
        main.appendChild(c2);
      }

      else if (s.step === 'details') {
        main.appendChild(back('time'));
        var nm = el('input', { 'class': 'cdvb-in', id: 'cdvp-n', autocomplete: 'name', required: true });
        var em = el('input', { 'class': 'cdvb-in', id: 'cdvp-e', type: 'email', autocomplete: 'email', required: true });
        var co = el('input', { 'class': 'cdvb-in', id: 'cdvp-c', autocomplete: 'organization' });
        var nt = el('textarea', { 'class': 'cdvb-in', id: 'cdvp-t', placeholder: 'Anything you\u2019d like us to know before we meet' });
        var er = el('div', { role: 'alert', style: 'font-size:13px;color:#B42318' });
        var form = el('form', { 'class': 'cdvp-form', novalidate: true, on: { submit: function (e) {
          e.preventDefault();
          if (!nm.value.trim()) { er.textContent = 'Please enter your name.'; nm.focus(); return; }
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value.trim())) { er.textContent = 'Please enter a valid email.'; em.focus(); return; }
          s.booked = { type: s.type, date: s.date, time: s.time, email: em.value.trim() }; draw(); root.scrollTop = 0;
        } } }, [
          el('div', { 'class': 'cdvb-f' }, [el('label', { 'for': 'cdvp-n', text: 'Your name' }), nm]),
          el('div', { 'class': 'cdvb-f' }, [el('label', { 'for': 'cdvp-e', text: 'Email' }), em]),
          el('div', { 'class': 'cdvb-f' }, [el('label', { 'for': 'cdvp-c', text: 'Business name (optional)' }), co]),
          el('div', { 'class': 'cdvb-f' }, [el('label', { 'for': 'cdvp-t', text: 'Notes (optional)' }), nt]),
          er,
          el('div', null, [el('button', { type: 'submit', 'class': 'cdvb-btn pri', style: 'height:44px;padding:0 20px;font-size:15px', text: 'Confirm booking' })])
        ]);
        main.appendChild(el('div', { 'class': 'cdvp-card' }, [summary(), el('h1', { style: 'font-size:20px;margin-bottom:16px', text: 'Your details' }), form]));
      }
      main.appendChild(el('div', { 'class': 'cdvp-foot', text: 'Scheduling by cordevra' }));
    }
    draw();
  }


  /* =====================================================================
     3) GOOGLE MEET NOTES in each client's Activity feed + "Meeting notes" filter
     ===================================================================== */
  var MEET_KEY = 'cordevra.meetNotes.on';
  function meetOn() { try { return localStorage.getItem(MEET_KEY) !== 'off'; } catch (e) { return true; } }
  var actFilter = '';

  function notesFor(client, contact) {
    var who = contact || 'the client';
    var now = new Date();
    function ago(d, h) { var x = new Date(now); x.setDate(x.getDate() - d); x.setHours(h, 0, 0, 0); return x; }
    return [
      { date: ago(3, 10), title: 'Financial review', mins: 45, staff: 'Demo Owner', with: who,
        summary: 'Walked through last month\u2019s financial statements. Revenue was up, payroll costs were higher than planned, and cash is healthy.',
        points: ['Revenue up about 8% over the prior month', 'Payroll ran over budget because of overtime', 'Wants a simple monthly cash forecast going forward'],
        actions: [['Send the updated budget vs. actual report', 'Demo Owner'], ['Upload missing credit card statements', who], ['Set up a monthly cash forecast', 'Riley Bookkeeper']] },
      { date: ago(19, 14), title: 'Client meeting', mins: 30, staff: 'Riley Bookkeeper', with: who,
        summary: 'Checked in on open questions about uncategorized transactions and the new receipt process.',
        points: ['Agreed to send receipts weekly through the client portal', 'Two vendor payments need to be reclassified'],
        actions: [['Reclassify the two vendor payments', 'Riley Bookkeeper'], ['Review uncategorized transactions in the portal', who]] }
    ];
  }

  function meetLi(n) {
    var D = n.date;
    var dateTxt = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][D.getMonth()] + ' ' + D.getDate() + ', ' + D.getFullYear();
    var tr = el('div', { 'class': 'cdvm-tr', hidden: true }, [
      el('p', null, [el('b', { text: n.staff.split(' ')[0] + ': ' }), 'Thanks for making time. Let\u2019s start with last month\u2019s numbers.']),
      el('p', null, [el('b', { text: (n.with === 'the client' ? 'Client' : n.with.split(' ')[0]) + ': ' }), 'Sounds good. I mainly want to understand the payroll jump.']),
      el('p', { 'class': 'cdvm-hint', text: 'Transcript excerpt \u00b7 full transcript is saved with the recording.' })
    ]);
    var trBtn = el('button', { type: 'button', 'class': 'cdvm-link', 'aria-expanded': 'false', text: 'Show transcript', on: { click: function () {
      var open = tr.hidden; tr.hidden = !open; trBtn.setAttribute('aria-expanded', String(open)); trBtn.textContent = open ? 'Hide transcript' : 'Show transcript';
    } } });
    return el('li', { 'class': 'group relative', 'data-cdv-meet': '', 'data-ts': String(D.getTime()) }, [
      el('span', { 'class': 'cdvm-dot', 'aria-hidden': 'true' }),
      el('div', { 'class': 'cdvm-head' }, [
        el('span', { 'class': 'cdvm-badge', text: 'Meeting notes' }),
        el('span', { text: 'with ' + n.with }), el('span', { text: n.staff }), '\u00b7', el('span', { title: D.toLocaleString(), text: dateTxt })
      ]),
      el('div', { 'class': 'cdvm-box' }, [
        el('div', { 'class': 'cdvm-title' }, [el('b', { text: 'Meeting Notes' }), el('span', { 'class': 'cdvm-src' }, [icon('video', 14), 'Google Meet \u00b7 ' + n.title + ' \u00b7 ' + n.mins + ' min'])]),
        el('hr', { 'class': 'cdvm-rule' }),
        el('div', { 'class': 'cdvm-h', text: 'Summary' }), el('p', { 'class': 'cdvm-p', text: n.summary }),
        el('div', { 'class': 'cdvm-h', text: 'Key points' }), el('ul', { 'class': 'cdvm-ul' }, n.points.map(function (p) { return el('li', { text: p }); })),
        el('div', { 'class': 'cdvm-h', text: 'Action items' }), el('ul', { 'class': 'cdvm-ul cdvm-act' }, n.actions.map(function (a) {
          return el('li', null, [el('span', { text: a[0] }), el('span', { 'class': 'cdvm-own', text: a[1] })]);
        })),
        el('div', { 'class': 'cdvm-foot' }, [el('span', { 'class': 'cdvm-hint', text: 'Notes taken by Google Meet and added automatically.' }), trBtn]),
        tr
      ])
    ]);
  }

  function enhanceActivity() {
    var sel = document.querySelector('main select[aria-label="Activity type"]');
    if (!sel) return;
    var sec = sel.closest('section');
    /* filter option */
    if (!sel.querySelector('option[value="meeting"]')) {
      var opt = el('option', { value: 'meeting', text: 'Meeting notes' });
      var gen = sel.querySelector('option[value="general"]');
      sel.insertBefore(opt, gen ? gen.nextSibling : null);
      [].forEach.call(sel.querySelectorAll('option'), function (o) { if (o.value === 'general' && o.textContent === 'General') o.textContent = 'General notes'; });
    }
    if (!sel.hasAttribute('data-cdvm')) {
      sel.setAttribute('data-cdvm', '');
      actFilter = sel.value || '';
    }
    if (actFilter === 'meeting' && sel.value !== 'meeting') sel.value = 'meeting';
    sec.classList.toggle('cdvm-only', actFilter === 'meeting');
    sec.classList.toggle('cdvm-hide', actFilter !== '' && actFilter !== 'meeting');
    if (!meetOn()) { [].forEach.call(sec.querySelectorAll('[data-cdv-meet]'), function (x) { x.remove(); }); return; }
    var ol = sec.querySelector('ol');
    if (!ol || ol.querySelector('[data-cdv-meet]')) return;
    var h1 = document.querySelector('main h1');
    var client = h1 ? h1.textContent.trim() : '';
    var m = sec.textContent.match(/with ([A-Z][a-z]+ [A-Z][a-z]+)/);
    notesFor(client, m ? m[1] : '').forEach(function (n) {
      var li = meetLi(n);
      var before = [].slice.call(ol.children).filter(function (x) {
        if (x.hasAttribute('data-cdv-meet')) return +x.getAttribute('data-ts') < n.date.getTime();
        var t = x.querySelector('span[title]'); var d = t ? new Date(t.getAttribute('title').replace(/,\s*(\d{1,2}:\d{2})/, ' $1')) : null;
        return d && !isNaN(d) && d.getTime() < n.date.getTime();
      })[0];
      ol.insertBefore(li, before || null);
    });
  }
  /* keep React's own filter state at "All" while "Meeting notes" is chosen */
  function onSelChange(e) {
    var t = e.target;
    if (!t || !t.matches || !t.matches('select[aria-label="Activity type"]')) return;
    actFilter = t.value;
    if (t.value === 'meeting') e.stopImmediatePropagation();
    enhanceActivity();
  }
  window.addEventListener('change', onSelChange, true);
  window.addEventListener('input', function (e) { var t = e.target; if (t && t.matches && t.matches('select[aria-label="Activity type"]') && t.value === 'meeting') e.stopImmediatePropagation(); }, true);

  /* ---------- boot ---------- */
  function boot() {
    injectCss();
    if (/^\/book(\/|$)/.test(location.pathname)) { bookingPage(); return; }
    var q = false;
    new MutationObserver(function () {
      if (q) return; q = true;
      requestAnimationFrame(function () { q = false; mountCard(); enhanceActivity(); });
    }).observe(document.body, { childList: true, subtree: true });
    mountCard(); enhanceActivity();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
