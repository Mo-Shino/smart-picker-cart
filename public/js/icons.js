// KartFlow icon + illustration system. Line icons (1.75 stroke), sizes 16/20/24/28. No emoji anywhere.
(function () {
  const P = {
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 7v10"/><path d="M12 7v10"/><path d="M17 7v10"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    store: '<path d="M3 9l1.6-5h14.8L21 9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12.5V20h14v-7.5"/><path d="M10 20v-4.5h4V20"/>',
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-left': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    box: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    swap: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    layout: '<rect width="7" height="9" x="3" y="3" rx="1.5"/><rect width="7" height="5" x="14" y="3" rx="1.5"/><rect width="7" height="9" x="14" y="12" rx="1.5"/><rect width="7" height="5" x="3" y="16" rx="1.5"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-4"/>',
    list: '<path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    keyboard: '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    sparkle: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
    trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'
  };

  function I(name, size = 20, cls = '') {
    const d = P[name] || P.box;
    return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  }

  // Replace <i data-icon="name" data-size="20"></i> placeholders.
  function mount(root = document) {
    root.querySelectorAll('i[data-icon]').forEach(el => {
      el.outerHTML = I(el.dataset.icon, +el.dataset.size || 20, el.className);
    });
  }

  // Brand mark: forest tile, cream cart, gold scan line
  function Logo(size = 44, draw = false) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" class="${draw ? 'logo-draw' : ''}" aria-label="KartFlow">
      <rect width="48" height="48" rx="14" fill="#1E4A44"/>
      <path d="M12.5 15.5h3.2l3.3 12.6h11.4l2.8-8.9H17.4" fill="none" stroke="#F3F0E7" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="21" cy="33" r="2" fill="#F3F0E7"/><circle cx="30.5" cy="33" r="2" fill="#F3F0E7"/>
      <line x1="15.5" y1="24" x2="36.5" y2="24" stroke="#E8B03A" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`;
  }

  // Department illustrations (80x80) — flat shapes in brand colours
  const PARTS = {
    dry: '<path d="M22 32c-2 14-2 26 4 33 8 5 20 5 28 0 6-7 6-19 4-33z" fill="#E3B866"/><path d="M22 32c6-5 30-5 36 0l-3-7c-8 3-22 3-30 0z" fill="#C9962F"/><rect x="33" y="23" width="14" height="6" rx="3" fill="#8A5E12"/><circle cx="40" cy="48" r="10" fill="#FBF3DC"/><path d="M40 55V42" stroke="#1E4A44" stroke-width="1.8" stroke-linecap="round"/><path d="M40 47c-3.5 0-4.5-2-4.5-4 3.5 0 4.5 2 4.5 4zM40 47c3.5 0 4.5-2 4.5-4-3.5 0-4.5 2-4.5 4zM40 52c-3.5 0-4.5-2-4.5-4 3.5 0 4.5 2 4.5 4zM40 52c3.5 0 4.5-2 4.5-4-3.5 0-4.5 2-4.5 4z" fill="#1E4A44"/><path d="M27 40c-.6 8 0 15 2 20" stroke="#fff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round" fill="none"/>',
    oils: '<rect x="34" y="8" width="12" height="10" rx="3" fill="#8A5E12"/><path d="M31 22c0-3 3-4 5-4h8c2 0 5 1 5 4 6 5 7 11 7 20v20c0 4-3 7-7 7H31c-4 0-7-3-7-7V42c0-9 1-15 7-20z" fill="#F3C95E"/><rect x="27" y="40" width="26" height="24" rx="5" fill="#FBF3DC"/><path d="M40 45c-4 5-6 7-6 10a6 6 0 0 0 12 0c0-3-2-5-6-10z" fill="#E8B03A"/><path d="M30 26c-2 8-2 20-1 32" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round" fill="none"/>',
    canned: '<path d="M20 28v34c0 5 9 8 20 8s20-3 20-8V28z" fill="#EE7D5B"/><ellipse cx="40" cy="28" rx="20" ry="7" fill="#F6A98F"/><ellipse cx="40" cy="28" rx="14" ry="4" fill="#EE7D5B" opacity=".5"/><path d="M20 40h40v17H20z" fill="#FBF3DC"/><circle cx="40" cy="48.5" r="6" fill="#D8452F"/><path d="M40 43c0-2 1-3 2.6-3.6" stroke="#2E9E6E" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M24 33c-1 10-1 20 1 28" stroke="#fff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round" fill="none"/>',
    drinks: '<path d="M23 22h34l-4 46c-.2 2-1.7 3-3.5 3H30.5c-1.8 0-3.3-1-3.5-3z" fill="#fff" fill-opacity=".75" stroke="#B9D3CB" stroke-width="2"/><path d="M25.4 36h29.2l-2.6 32c-.2 2-1.7 3-3.5 3H31.5c-1.8 0-3.3-1-3.5-3z" fill="#F3A33A"/><path d="M25.4 36c5 3 9-3 14.600 0s9.600-3 14.600 0" fill="none" stroke="#FBD58A" stroke-width="2.6"/><path d="M47 7l-5 24" stroke="#1E4A44" stroke-width="3" stroke-linecap="round"/><circle cx="57" cy="24" r="10" fill="#F3A33A"/><circle cx="57" cy="24" r="7" fill="#FBD58A"/><path d="M57 17v14M50 24h14M52 19l10 10M62 19L52 29" stroke="#F3A33A" stroke-width="1.5"/>',
    bakery: '<path d="M14 48c-2-14 8-22 20-22h12c12 0 22 8 20 22v10c0 3-2 5-5 5H19c-3 0-5-2-5-5z" fill="#D9A25B"/><path d="M26 36l6 10M38 33l6 12M50 36l6 10" stroke="#FBF3DC" stroke-width="3.4" stroke-linecap="round"/><path d="M20 34c4-4 8-5 13-5" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M15 56h50" stroke="#B97D34" stroke-width="3" stroke-linecap="round" opacity=".55"/>',
    produce: '<path d="M40 27c-6-4-16-4-20 5-4 9-1 22 6 29 4 4 9 4 14 2 5 2 10 2 14-2 7-7 10-20 6-29-4-9-14-9-20-5z" fill="#D8452F"/><path d="M40 27c0-7 3-12 9-15" stroke="#6B4A1E" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M45 21c5-6 13-5 15-4-1 7-8 11-15 4z" fill="#2E9E6E"/><ellipse cx="29" cy="42" rx="3.6" ry="8" transform="rotate(12 29 42)" fill="#fff" fill-opacity=".38"/>',
    dairy: '<path d="M24 30l16-13 16 13z" fill="#B7D2E8"/><path d="M24 30h32v38c0 2-1 3-3 3H27c-2 0-3-1-3-3z" fill="#FFFFFF"/><path d="M45 30h11v38c0 2-1 3-3 3h-8z" fill="#DCE8F2"/><path d="M34 54c0-6 6-9 6-14 0 5 6 8 6 14a6 6 0 0 1-12 0z" fill="#4C8BC4"/><rect x="24" y="30" width="32" height="4" fill="#E8B03A"/>',
    frozen: '<path d="M28 44h24L40 74z" fill="#E0A85A"/><path d="M32 52h16M35 60h10M31 46l15 24M49 46L34 70" stroke="#B97D34" stroke-width="1.6" fill="none" opacity=".75"/><circle cx="40" cy="38" r="15" fill="#F6C6D8"/><circle cx="40" cy="26" r="11" fill="#FBF3DC"/><circle cx="40" cy="14" r="4" fill="#D8452F"/><path d="M40 11c0-3 2-5 5-6" stroke="#2E9E6E" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
  };

  function dept(key, cls = '') {
    return `<svg class="${cls}" viewBox="0 0 80 80" aria-hidden="true">${PARTS[key] || PARTS.dry}</svg>`;
  }

  // Hero / empty-state cart illustration
  function cart(full = true, cls = '') {
    const g = (k, tx, ty, s) => `<g transform="translate(${tx} ${ty}) scale(${s})">${PARTS[k]}</g>`;
    const items = full ? g('dairy', 150, 4, 1.25) + g('oils', 84, 24, 1.2) + g('bakery', 196, 34, 1.1) + g('produce', 124, 56, 0.95) : '';
    return `<svg class="${cls}" viewBox="0 0 320 240" aria-hidden="true">
      <ellipse cx="164" cy="226" rx="108" ry="10" fill="#000" opacity=".16"/>
      ${items}
      <path d="M66 108h192l-22 78c-2 8-8 12-16 12H104c-8 0-14-4-16-12z" fill="#1E4A44"/>
      <path d="M66 108h192l-3.500 12H69.500z" fill="#2B6158"/>
      <path d="M92 134h140M98 160h128" stroke="#F3F0E7" stroke-opacity=".16" stroke-width="2" stroke-linecap="round"/>
      <path d="M130 120v70M162 120v78M194 120v70" stroke="#F3F0E7" stroke-opacity=".12" stroke-width="2" stroke-linecap="round"/>
      <rect x="62" y="102" width="200" height="10" rx="5" fill="#E8B03A"/>
      <path d="M66 106 48 66H26" fill="none" stroke="#E8B03A" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="laser"><line x1="84" y1="150" x2="240" y2="150" stroke="#F4CB65" stroke-width="3.2" stroke-linecap="round"/><line x1="84" y1="150" x2="240" y2="150" stroke="#F4CB65" stroke-width="10" stroke-linecap="round" opacity=".25"/></g>
      <path d="M102 198l10 10M222 198l-10 10" stroke="#0A1D1B" stroke-width="5" stroke-linecap="round"/>
      <circle cx="118" cy="214" r="13" fill="#0A1D1B"/><circle cx="118" cy="214" r="5" fill="#E8B03A"/>
      <circle cx="210" cy="214" r="13" fill="#0A1D1B"/><circle cx="210" cy="214" r="5" fill="#E8B03A"/>
    </svg>`;
  }

  window.I = I;
  window.Logo = Logo;
  window.Art = { dept, cart, parts: PARTS };
  window.Icons = { mount, names: Object.keys(P) };
  document.addEventListener('DOMContentLoaded', () => mount());
})();
