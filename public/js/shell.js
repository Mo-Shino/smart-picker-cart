// App shell: navigation (dock on mobile, rail on desktop), sheets, toasts, small helpers.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('en-US');
  const money = n => {
    n = Math.round((+n || 0) * 100) / 100;
    const t = Number.isInteger(n) ? nf.format(n) : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `<span class="num">${t}</span><span class="cur">ج.م</span>`;
  };
  const mmss = ms => { const s = Math.floor(Math.max(0, ms) / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const firstName = n => String(n || '').trim().split(/\s+/)[0] || 'عميل';
  const ago = t => { const m = Math.max(0, Math.round((Date.now() - t) / 60000)); return m < 1 ? 'الآن' : m < 60 ? `منذ ${m} د` : `منذ ${Math.floor(m / 60)} س`; };
  const clock = t => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const qtyText = it => it.type === 'weight' ? `${it.weight > 0 ? it.weight : it.qty} ${it.unit}` : `${it.qty} ${it.unit}`;

  const APPS = [
    { id: 'customer', href: '/customer.html', label: 'تطبيق العميل', icon: 'phone' },
    { id: 'picker', href: '/picker.html', label: 'عربة التجميع', icon: 'cart' },
    { id: 'cashier', href: '/cashier.html', label: 'الكاشير', icon: 'receipt' },
    { id: 'manager', href: '/manager.html', label: 'لوحة المتجر', icon: 'layout' }
  ];

  let cfg = null;
  const views = {};

  function mount(c) {
    cfg = c;
    document.body.classList.toggle('dark', !!c.dark);
    const all = c.tabs.concat(c.center ? [c.center] : []);
    const navItem = t => `<button class="rail-link ${t.cta ? 'cta' : ''}" ${t.act ? `data-act="${t.id}"` : `data-go="${t.id}"`} data-tab="${t.id}">${I(t.icon, 20)}<span>${t.label}</span><span class="nbadge" data-badge="${t.id}" hidden></span></button>`;
    const rail = `<aside class="rail">
      <a class="rail-brand" href="/">${Logo(42)}<div><b>KartFlow</b><small>تجهيز أسرع. طوابير أقل.</small></div></a>
      <nav class="rail-nav">${all.map(navItem).join('')}</nav>
      <div><div class="rail-title">التطبيقات</div><div class="rail-apps">
        ${APPS.map(a => `<a class="rail-app ${a.id === c.role ? 'cur' : ''}" href="${a.href}">${I(a.icon, 18)}<span>${a.label}</span></a>`).join('')}
      </div></div></aside>`;
    $('#app').insertAdjacentHTML('afterbegin', rail);

    const dockItem = t => `<button class="dock-item" data-go="${t.id}" data-tab="${t.id}" aria-label="${t.label}">${I(t.icon, 22)}<span class="lbl">${t.label}</span><span class="nbadge" data-badge="${t.id}" hidden></span></button>`;
    const half = Math.ceil(c.tabs.length / 2);
    const center = c.center ? `<button class="dock-center" ${c.center.act ? `data-act="${c.center.id}"` : `data-go="${c.center.id}"`} data-tab="${c.center.id}" aria-label="${c.center.label}">${I(c.center.icon, 26)}<span class="nbadge" data-badge="${c.center.id}" hidden></span></button>` : '';
    document.body.insertAdjacentHTML('beforeend',
      `<nav class="dock"><div class="dock-pill">${c.tabs.slice(0, half).map(dockItem).join('')}${center}${c.tabs.slice(half).map(dockItem).join('')}</div></nav>`);

    $$('.view').forEach(v => { views[v.dataset.view] = v; });
    document.addEventListener('click', e => {
      const g = e.target.closest('[data-go]');
      if (g) return go(g.dataset.go);
      const a = e.target.closest('[data-act]');
      if (a && cfg.onAction) cfg.onAction(a.dataset.act);
    });
    const start = location.hash.slice(1);
    go(views[start] ? start : c.initial, true);
  }

  function go(id, silent) {
    if (!views[id]) return;
    Object.entries(views).forEach(([k, v]) => v.classList.toggle('active', k === id));
    $$('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    if (!silent) { history.replaceState(null, '', '#' + id); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    cfg.onView && cfg.onView(id);
  }

  function badge(id, n) {
    $$(`[data-badge="${id}"]`).forEach(b => { b.hidden = !n; b.textContent = n > 9 ? '9+' : n; });
  }

  // ----- Sheet -----
  let sheet = null;
  function openSheet({ title, html, onMount, onClose, cls = '' }) {
    closeSheet();
    const ov = document.createElement('div');
    ov.className = 'sheet-ov';
    ov.innerHTML = `<div class="sheet ${cls}" role="dialog" aria-modal="true"><div class="sheet-grab"></div>
      ${title ? `<div class="sheet-head"><h3>${title}</h3><button class="icon-btn sm" data-close aria-label="إغلاق">${I('x', 18)}</button></div>` : ''}
      <div class="sheet-body">${html}</div></div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('open')));
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) closeSheet(); });
    sheet = { ov, onClose };
    const body = $('.sheet-body', ov);
    onMount && onMount(body, ov);
    return body;
  }
  function closeSheet() {
    if (!sheet) return;
    const { ov, onClose } = sheet;
    sheet = null;
    ov.classList.remove('open');
    setTimeout(() => ov.remove(), 450);
    onClose && onClose();
  }
  const sheetBody = () => sheet && $('.sheet-body', sheet.ov);

  // ----- Toast -----
  function toast(msg, { tone = 'ink', icon, ms = 3400 } = {}) {
    let host = $('.toast-host');
    if (!host) { host = document.createElement('div'); host.className = 'toast-host'; document.body.appendChild(host); }
    const el = document.createElement('div');
    el.className = 'toast ' + tone;
    const ic = icon || (tone === 'ok' ? 'check-circle' : tone === 'bad' ? 'alert' : tone === 'warn' ? 'bell' : 'info');
    el.innerHTML = `${I(ic, 20)}<span>${msg}</span>`;
    host.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, ms);
  }

  // Full-screen feedback card (e.g. after a successful scan)
  function burst(html, ms = 1300) {
    const el = document.createElement('div');
    el.className = 'burst';
    el.innerHTML = `<div class="burst-card">${html}</div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, ms);
  }

  function countUp(el, to, { dur = 700, render = v => Math.round(v) } = {}) {
    if (!el) return;
    const from = +el.dataset.v || 0;
    el.dataset.v = to;
    if (from === to) { el.innerHTML = render(to); return; }
    const t0 = performance.now();
    const f = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.innerHTML = render(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  function ring(pct, size = 72, light = false) {
    return `<div class="ring ${light ? 'light-ring' : ''}" style="--p:${pct};--s:${size}px"><svg viewBox="0 0 36 36"><circle class="bg" cx="18" cy="18" r="15.9"/><circle class="fg" cx="18" cy="18" r="15.9" pathLength="100"/></svg><b class="num">${pct}%</b></div>`;
  }
  const tile = (deptId, size = 'md') => { const d = window.Catalog.dept(deptId) || {}; return `<div class="tile tile-${size} t-${d.tint || 'sand'}">${Art.dept(deptId)}</div>`; };

  window.addEventListener('offline', () => toast('لا يوجد اتصال بالإنترنت', { tone: 'warn' }));
  window.addEventListener('online', () => toast('عاد الاتصال', { tone: 'ok' }));

  if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));

  window.Shell = { mount, go, badge, openSheet, closeSheet, sheetBody, toast, burst, countUp, ring, tile, $, $$, esc, money, mmss, firstName, ago, clock, qtyText, APPS };
})();
