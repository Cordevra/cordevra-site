/* Cordevra activity audit log (prototype, demo data only).
   Records account events in each client's Activity feed automatically:
   portal sign-ins, client uploads, bill approvals, request responses, portal messages,
   profile changes, lead -> client conversion, contacts linked/removed, invoices
   created/voided, refunds, A/P bill actions, meetings rescheduled, time logged.
   (Emails, texts, WhatsApp, payments, proposals, forms, signatures, meetings scheduled,
   tasks and file uploads are logged inside the app itself.)
   System entries cannot be edited or deleted.
   Also adds a "Latest activity" card to the Home dashboard (all clients, newest first). */
(function () {
  'use strict';
  if (window.__cdvAudit) return; window.__cdvAudit = true;

  function ready(cb) {
    if (window.__cdvApi) return cb();
    var n = 0, iv = setInterval(function () {
      if (window.__cdvApi || ++n > 400) { clearInterval(iv); if (window.__cdvApi) cb(); }
    }, 50);
  }

  ready(function () {
    var api = window.__cdvApi, log = window.__cdvLog, me = window.__cdvMe;

    function wrap(name, pre, post) {
      var orig = api[name];
      if (typeof orig !== 'function' || orig.__cdv) return;
      var w = async function () {
        var args = [].slice.call(arguments), ctx = null;
        if (pre) { try { ctx = await pre.apply(null, args); } catch (e) { ctx = null; } }
        var res = await orig.apply(this, args);
        try {
          var out = await post(args, res, ctx);
          [].concat(out || []).forEach(function (o) {
            if (o && o.client) log(o.client, o.kind, o.text, o.author === undefined ? me() : o.author);
          });
        } catch (e) { if (window.console) console.warn('[cordevra audit]', name, e); }
        return res;
      };
      w.__cdv = true;
      api[name] = w;
    }

    function money(c) { return '$' + (Math.abs(c || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function clientOf(r) { return r && (r.client_id || (r.client && r.client.id) || (r.data && (r.data.client_id || (r.data.client && r.data.client.id)))); }
    function when(iso) { try { return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return iso; } }
    function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

    /* ---------- client portal (actions by the client) ---------- */
    async function portalWho() {
      var m = await api.portalMe();
      return { client: m.client.id, author: { id: 'contact-' + m.contact.id, name: m.contact.name + ' (client)' } };
    }
    function asClient(who, kind, text) { return who ? { client: who.client, author: who.author, kind: kind, text: text } : null; }

    wrap('portalVerify', null, function (a, r) {
      if (!r || !r.client || !r.contact) return null;
      return { client: r.client.id, author: { id: 'contact-' + r.contact.id, name: r.contact.name + ' (client)' }, kind: 'portal', text: 'Signed in to the client portal' };
    });
    wrap('portalUpload', portalWho, function (a, r, who) {
      var files = a[0] || [];
      return asClient(who, 'upload', 'Uploaded ' + plural(files.length, 'file') + ' in the portal: ' + [].map.call(files, function (f) { return f.name; }).join(', '));
    });
    wrap('portalBillAction', portalWho, function (a, r, who) {
      var verb = { approve: 'approved', hold: 'put on hold', reject: 'rejected' }[a[1]] || a[1];
      return asClient(who, 'billing', plural((a[0] || []).length, 'bill') + ' ' + verb + ' in the portal' + (a[2] ? ': "' + a[2] + '"' : ''));
    });
    wrap('portalRespond', portalWho, function (a, r, who) {
      var d = a[1] || {}, t = d.signature ? 'Signed a request item' : d.file ? 'Uploaded "' + d.file.name + '" for a request' : d.response ? 'Answered a request question' : d.done === false ? 'Reopened a request item' : 'Completed a request item';
      return asClient(who, 'portal', t);
    });
    wrap('portalPost', portalWho, function (a, r, who) { return asClient(who, 'portal', 'Portal message: ' + String(a[1] || '').trim().slice(0, 120)); });
    wrap('portalCreateTopic', portalWho, function (a, r, who) { return asClient(who, 'portal', 'Started a portal conversation: ' + a[0]); });

    /* ---------- staff actions ---------- */
    var SKIP = { cf: 1, updated_at: 1, created_at: 1, assignee_ids: 1, service_ids: 1, tags: 1, tag_ids: 1 };
    function label(k) { k = k.replace(/_id$/, '').replace(/_/g, ' '); return k.charAt(0).toUpperCase() + k.slice(1); }
    function show(v) { if (v == null || v === '') return '(blank)'; if (typeof v === 'object') return Array.isArray(v) ? v.join(', ') : (v.name || JSON.stringify(v)); return String(v); }
    wrap('updateClient', function (id) { return api.client(id); }, function (a, r, old) {
      var changes = [], next = a[1] || {};
      Object.keys(next).forEach(function (k) {
        if (SKIP[k]) return;
        var o = old ? old[k] : undefined;
        if (JSON.stringify(o) === JSON.stringify(next[k])) return;
        changes.push(label(k) + ': ' + show(o) + ' → ' + show(next[k]));
      });
      if (!changes.length) return null;
      return { client: a[0], kind: 'account', text: 'Profile updated. ' + changes.slice(0, 5).join(' · ') + (changes.length > 5 ? ' (+' + (changes.length - 5) + ' more)' : '') };
    });
    wrap('setClientServices', null, function (a) { return { client: a[0], kind: 'account', text: 'Services updated' }; });
    wrap('convertClient', null, function (a) { return { client: a[0], kind: 'account', text: 'Status changed: Lead → Client' }; });
    wrap('linkContact', function (c, id) { return api.contact(id); }, function (a, r, c) {
      return { client: a[0], kind: 'account', text: 'Contact linked: ' + (c && (c.full_name || c.name) || 'contact #' + a[1]) + (a[3] ? ' (main contact)' : '') };
    });
    wrap('unlinkContact', function (c, id) { return api.contact(id); }, function (a, r, c) {
      return { client: a[0], kind: 'account', text: 'Contact removed: ' + (c && (c.full_name || c.name) || 'contact #' + a[1]) };
    });
    wrap('createInvoice', null, function (a, r) {
      var inv = r && (r.data || r);
      return { client: a[0].client_id, kind: 'billing', text: 'Invoice ' + (inv && inv.number ? inv.number + ' ' : '') + 'created (draft)' };
    });
    wrap('voidInvoice', null, function (a, r) { var inv = r && (r.data || r); return { client: clientOf(inv), kind: 'billing', text: 'Invoice ' + (inv.number || '') + ' voided' }; });
    wrap('refundPayment', null, function (a, r) { return { client: clientOf(r), kind: 'billing', text: 'Refund issued: ' + money(a[1]) }; });
    wrap('actOnApBill', null, function (a, r) {
      var b = r && (r.data || r), act = (a[1] || {}).action;
      return { client: clientOf(b), kind: 'billing', text: 'A/P bill ' + ({ approve: 'approved', hold: 'put on hold', reject: 'rejected', pay: 'marked paid' }[act] || act) + (b && b.vendor ? ': ' + b.vendor : '') + (b && b.amount_cents ? ' (' + money(b.amount_cents) + ')' : '') };
    });
    wrap('updateMeeting', null, function (a, r) {
      var q = a[1] || {}; if (!q.starts_at || !r || !clientOf(r)) return null;
      return { client: clientOf(r), kind: 'calendar', text: 'Meeting rescheduled: ' + (r.title || '') + ' (' + when(q.starts_at) + ')' };
    });
    wrap('createTimeEntry', null, function (a) {
      var z = a[0] || {}; if (!z.client_id || !z.minutes) return null;
      var h = Math.floor(z.minutes / 60), m = z.minutes % 60;
      return { client: z.client_id, kind: 'hours', text: 'Time logged: ' + (h ? h + 'h ' : '') + (m ? m + 'm' : '') + (z.description ? ' · ' + z.description : '') };
    });

    /* =====================================================================
       HOME: "Latest activity" across all clients (newest first)
       ===================================================================== */
    var KIND = {
      email: ['Email', '#DBEAFE', '#1D4ED8'], whatsapp: ['WhatsApp', '#DCFCE7', '#15803D'], contact: ['Contact', '#DBEAFE', '#1D4ED8'],
      upload: ['Upload', '#DCFCE7', '#15803D'], portal: ['Portal', '#DBEAFE', '#1D4ED8'], billing: ['Billing', '#DCFCE7', '#15803D'],
      calendar: ['Meeting', '#EDE9FE', '#6D28D9'], call: ['Call', '#EDE9FE', '#6D28D9'], task: ['Task', '#FEF3C7', '#B45309'],
      hours: ['Hours', '#FEF3C7', '#B45309'], account: ['Account', '#F1F5F9', '#475569'], general: ['Note', '#F1F5F9', '#475569'], project: ['Project', '#F1F5F9', '#475569']
    };
    var FROM_CLIENT = /^(Email received from|WhatsApp from|Text message from|Portal message|Uploaded |Signed in to the client portal|Started a portal conversation|Client |Form submitted|Payment of .* received|Proposal ".*" accepted|Signature declined|Document signed)/;
    function who(a) { return a.author ? a.author.name.replace(' (client)', '') : 'Client'; }
    function phrase(a) {
      var b = a.body || '', m;
      if ((m = b.match(/^Email received from (.+?): (.*)$/))) return [m[1] + ' emailed you', m[2]];
      if ((m = b.match(/^(WhatsApp|Text message) from (.+?): (.*)$/))) return [m[2] + ' sent a ' + (m[1] === 'WhatsApp' ? 'WhatsApp message' : 'text message'), '“' + m[3] + '”'];
      if ((m = b.match(/^Portal message: (.*)$/))) return [who(a) + ' sent a portal message', '“' + m[1] + '”'];
      if ((m = b.match(/^Uploaded (.*) in the portal: (.*)$/))) return [who(a) + ' uploaded ' + m[1], m[2]];
      if (/^Signed in to the client portal/.test(b)) return [who(a) + ' signed in to the portal', ''];
      if ((m = b.match(/^Profile updated\. (.*)$/))) return ['Profile updated' + (a.author ? ' by ' + a.author.name : ''), m[1]];
      if ((m = b.match(/^Email sent: (.*)$/))) return ['Email sent' + (a.author ? ' by ' + a.author.name : ''), m[1]];
      var i = b.indexOf(': ');
      return i > 0 && i < 60 ? [b.slice(0, i), b.slice(i + 2)] : [b, ''];
    }
    function ago(iso) {
      var s = (Date.now() - new Date(iso).getTime()) / 1000;
      if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' h ago';
      if (s < 7 * 86400) return Math.floor(s / 86400) + (s < 2 * 86400 ? ' day ago' : ' days ago');
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    var HCSS = '.cdva{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:18px;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;color:#1E293B}' +
      '.cdva-h{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px}.cdva-h h2{margin:0;font-size:16px;font-weight:700;color:#0E1A2B}' +
      '.cdva-f{display:flex;gap:6px}.cdva-f button{height:30px;padding:0 12px;border-radius:999px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;background:#fff;color:#334155;border:1px solid #E2E8F0}' +
      '.cdva-f button[aria-pressed=true]{background:#0E1A2B;color:#fff;border-color:#0E1A2B}' +
      '.cdva-i{display:flex;flex-direction:column;gap:3px;width:100%;padding:10px 4px;border:0;border-top:1px solid #F1F5F9;background:none;text-align:left;font-family:inherit;cursor:pointer;color:inherit}.cdva-i:hover{background:#F8FAFC}' +
      '.cdva-top{display:flex;align-items:center;gap:8px;min-width:0}.cdva-c{flex:1;min-width:0;font-size:13px;font-weight:600;color:#0E1A2B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.cdva-t{font-size:14px;color:#1E293B}.cdva-d{font-size:12px;color:#64748B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}' +
      '.cdva-k{flex-shrink:0;font-size:11px;font-weight:600;border-radius:999px;padding:2px 8px}' +
            '.cdva-w{flex-shrink:0;font-size:12px;color:#64748B;white-space:nowrap}' +
      '.cdva-e{font-size:13px;color:#64748B;padding:10px 0}' +
      '.cdva-col{flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:16px}.cdva-col>.cdvh-meet{flex:none}' +
      '';
    var feed = { items: [], at: 0, filter: 'clients', card: null, loading: false };
    function E(tag, cls, txt) { var x = document.createElement(tag); if (cls) x.className = cls; if (txt != null) x.textContent = txt; return x; }
    async function loadFeed() {
      if (feed.loading) return; feed.loading = true;
      try {
        var cs = await api.clients({}); var list = (cs && cs.data) || cs || [];
        var all = [];
        await Promise.all(list.map(async function (c) {
          try { (await api.clientActivity(c.id, '')).forEach(function (a) { all.push({ a: a, client: c }); }); } catch (e) {}
        }));
        all.sort(function (x, y) { return String(y.a.created_at).localeCompare(String(x.a.created_at)); });
        feed.items = all; feed.at = Date.now();
      } catch (e) { feed.items = []; feed.at = Date.now(); }
      feed.loading = false; drawFeed();
    }
    function drawFeed() {
      var c = feed.card; if (!c) return;
      c.innerHTML = '';
      var head = E('div', 'cdva-h'); head.appendChild(E('h2', null, 'Latest activity'));
      var f = E('div', 'cdva-f'); f.setAttribute('role', 'group'); f.setAttribute('aria-label', 'Show');
      [['clients', 'From clients'], ['all', 'All activity']].forEach(function (o) {
        var b = E('button', null, o[1]); b.type = 'button'; b.setAttribute('aria-pressed', String(feed.filter === o[0]));
        b.addEventListener('click', function () { feed.filter = o[0]; drawFeed(); }); f.appendChild(b);
      });
      head.appendChild(f); c.appendChild(head);
      var rows = feed.items.filter(function (x) { return feed.filter === 'all' || FROM_CLIENT.test(x.a.body || '') || (x.a.author && / \(client\)$/.test(x.a.author.name)); }).slice(0, 6);
      if (!rows.length) { c.appendChild(E('div', 'cdva-e', !feed.at ? 'Loading…' : 'No activity yet.')); return; }
      rows.forEach(function (x) {
        var k = KIND[x.a.kind] || KIND.general, ph = phrase(x.a);
        var b = E('button', 'cdva-i'); b.type = 'button'; b.title = 'Open ' + x.client.name;
        var kb = E('span', 'cdva-k', k[0]); kb.style.background = k[1]; kb.style.color = k[2];
        var top = E('span', 'cdva-top'); top.appendChild(kb); top.appendChild(E('b', 'cdva-c', x.client.name)); top.appendChild(E('span', 'cdva-w', ago(x.a.created_at)));
        b.appendChild(top); b.appendChild(E('span', 'cdva-t', ph[0]));
        if (ph[1]) b.appendChild(E('span', 'cdva-d', ph[1]));
        b.addEventListener('click', function () { if (window.__cdvNav) window.__cdvNav('/clients/' + x.client.id); });
        c.appendChild(b);
      });
    }
    function mountFeed() {
      var home = document.getElementById('cdv-home'); if (!home || home.style.display === 'none') return;
      var meet = home.querySelector('.cdvh-meet');
      if (!meet) return;
      if (!feed.card) { feed.card = E('section', 'cdva'); feed.card.setAttribute('aria-label', 'Latest activity'); }
      /* right-hand column: Upcoming meetings on top, Latest activity underneath (fills the space beside My tasks) */
      var col = meet.parentNode;
      if (!col.classList.contains('cdva-col')) {
        col = E('div', 'cdva-col'); meet.parentNode.insertBefore(col, meet); col.appendChild(meet);
      }
      if (feed.card.parentNode !== col || feed.card.previousSibling !== meet) { col.appendChild(feed.card); drawFeed(); }
      if (Date.now() - feed.at > 5000) loadFeed();
    }
    if (!document.getElementById('cdva-css')) { var st = document.createElement('style'); st.id = 'cdva-css'; st.textContent = HCSS; document.head.appendChild(st); }
    var queued = false;
    new MutationObserver(function () { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; mountFeed(); }); })
      .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    mountFeed();
  });
})();
