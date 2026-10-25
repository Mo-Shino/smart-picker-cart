// Business logic for the picking flow. Pure functions that mutate a plain order object.
// Every mutator returns true when it changed something (so the data layer knows to save).
(function () {
  const SUB_WINDOW = 3 * 60 * 1000;     // customer has 3 minutes to answer a substitution
  const EDIT_WINDOW = 10 * 60 * 1000;   // customer can edit the order for 10 minutes
  const BINS = ['A', 'B', 'C'];
  const now = () => Date.now();
  const uid = p => p + Math.random().toString(36).slice(2, 8);

  function log(o, x) {
    o.log = o.log || [];
    o.log.push({ t: now(), x });
    if (o.log.length > 40) o.log.shift();
  }

  function line(product, qty) {
    return {
      id: uid('i'), productId: product.id, name: product.name, barcode: product.barcode, plu: product.plu,
      dept: product.dept, aisle: product.aisle, shelf: product.shelf, aisleOrder: product.aisleOrder,
      price: product.price, unit: product.unit, type: product.type,
      qty, picked: 0, weight: 0, status: 'pending', sub: false
    };
  }

  function itemTotal(it) {
    if (it.status === 'cancelled' || it.status === 'unavailable') return 0;
    if (it.type === 'weight') return it.price * (it.weight > 0 ? it.weight : it.qty);
    return it.price * (it.status === 'picked' ? it.picked : it.qty);
  }
  const orderTotal = o => Math.round(o.items.reduce((s, it) => s + itemTotal(it), 0) * 100) / 100;
  const liveItems = o => o.items.filter(i => i.status !== 'cancelled');

  function progress(o) {
    const live = liveItems(o);
    const done = live.filter(i => i.status === 'picked').length;
    return { done, total: live.length, pct: live.length ? Math.round(done / live.length * 100) : 0 };
  }

  const pendingSubs = o => (o.subs || []).filter(s => s.status === 'pending');
  const isEditable = (o, t = now()) => ['new', 'picking'].includes(o.status) && t < (o.editUntil || 0);
  const etaMin = o => {
    const left = liveItems(o).filter(i => i.status !== 'picked').length;
    return Math.max(1, Math.round(left * 0.9 + (o.status === 'new' ? 3 : 1)));
  };

  function makeOrder({ id, name, lines, createdAt }) {
    const t = createdAt || now();
    const items = [];
    lines.forEach(l => {
      const p = window.Catalog.byId(l.pid);
      if (p) items.push(line(p, l.qty));
    });
    const o = {
      id: id || 'KF-' + (1000 + Math.floor(Math.random() * 9000)),
      customer: { name: name || 'عميل' }, createdAt: t, status: 'new', cartId: null, bin: null,
      items, subs: [], log: [], editUntil: t + EDIT_WINDOW, total: 0
    };
    o.log.push({ t, x: 'تم استلام الطلب' });
    o.total = orderTotal(o);
    return o;
  }

  // Decide the order state from its items.
  function settle(o) {
    if (['completed', 'cancelled'].includes(o.status)) return;
    const live = liveItems(o);
    if (!live.length && !pendingSubs(o).length) {
      o.status = 'cancelled';
      log(o, 'تم إلغاء الطلب');
    } else if (live.every(i => i.status === 'picked') && !pendingSubs(o).length) {
      if (o.status !== 'ready') { o.status = 'ready'; o.readyAt = now(); log(o, 'اكتمل تجهيز الطلب'); }
    } else if (o.status === 'ready') {
      o.status = o.cartId ? 'picking' : 'new';
      o.readyAt = null;
    }
    o.total = orderTotal(o);
  }

  function claim(o, cartId, bin) {
    if (o.cartId || o.status !== 'new') return false;
    o.cartId = cartId; o.bin = bin; o.status = 'picking'; o.claimedAt = now();
    log(o, 'بدأ تجميع الطلب');
    return true;
  }

  function pick(o, itemId, kg) {
    const it = o.items.find(i => i.id === itemId);
    if (!it || it.status !== 'pending') return false;
    if (it.type === 'weight') { it.weight = Math.round((kg || it.qty) * 1000) / 1000; it.picked = it.qty; it.status = 'picked'; }
    else { it.picked++; if (it.picked >= it.qty) it.status = 'picked'; }
    it.pickedAt = now();
    if (o.status === 'new') o.status = 'picking';
    log(o, 'تم تجميع ' + it.name);
    settle(o);
    return true;
  }

  function requestSub(o, itemId, product) {
    const it = o.items.find(i => i.id === itemId);
    if (!it || it.status !== 'pending') return false;
    it.status = 'unavailable';
    const to = line(product, it.qty);
    o.subs = o.subs || [];
    o.subs.push({ id: uid('s'), itemId, fromName: it.name, fromDept: it.dept, to, status: 'pending', expiresAt: now() + SUB_WINDOW });
    log(o, it.name + ' غير متوفر — اقتراح بديل');
    settle(o);
    return true;
  }

  function markUnavailable(o, itemId) {
    const it = o.items.find(i => i.id === itemId);
    if (!it || it.status !== 'pending') return false;
    it.status = 'cancelled';
    log(o, it.name + ' غير متوفر — تم حذفه');
    settle(o);
    return true;
  }

  function answerSub(o, subId, decision) {
    const s = (o.subs || []).find(x => x.id === subId);
    if (!s || s.status !== 'pending') return false;
    const it = o.items.find(i => i.id === s.itemId);
    s.status = decision;
    if (it) {
      if (decision === 'accepted') {
        Object.assign(it, s.to, { id: it.id, status: 'pending', picked: 0, weight: 0, sub: true });
        log(o, 'وافق العميل على ' + s.to.name);
      } else {
        it.status = 'cancelled';
        log(o, decision === 'expired' ? 'انتهى وقت البديل — تم حذف الصنف' : 'رفض العميل البديل');
      }
    }
    settle(o);
    return true;
  }

  function expireSubs(o, t = now()) {
    let changed = false;
    (o.subs || []).forEach(s => { if (s.status === 'pending' && s.expiresAt <= t) changed = answerSub(o, s.id, 'expired') || changed; });
    return changed;
  }

  function removeItem(o, itemId) {
    if (!isEditable(o)) return false;
    const idx = o.items.findIndex(i => i.id === itemId && i.status === 'pending');
    if (idx < 0) return false;
    log(o, 'حذف ' + o.items[idx].name);
    o.items.splice(idx, 1);
    settle(o);
    return true;
  }

  function addLines(o, lines) {
    if (!isEditable(o)) return false;
    lines.forEach(l => {
      const p = window.Catalog.byId(l.pid);
      if (!p) return;
      const ex = o.items.find(i => i.productId === p.id && i.status === 'pending' && !i.sub);
      if (ex) ex.qty += l.qty; else o.items.push(line(p, l.qty));
    });
    log(o, 'تمت إضافة أصناف للطلب');
    settle(o);
    return true;
  }

  function complete(o) {
    if (o.status !== 'ready') return false;
    o.status = 'completed'; o.completedAt = now();
    o.total = orderTotal(o);
    log(o, 'تم التسليم واعتماد الفاتورة');
    return true;
  }

  // Pending items across the cart's orders, sorted by walking route.
  function route(orders) {
    const list = [];
    orders.forEach(o => o.items.forEach(it => { if (it.status === 'pending') list.push({ order: o, item: it }); }));
    return list.sort((a, b) => a.item.aisleOrder - b.item.aisleOrder || a.order.createdAt - b.order.createdAt);
  }

  // Find which order/item a scanned code belongs to.
  function matchScan(orders, code) {
    const parsed = window.Catalog.parse(code);
    if (!parsed) return { ok: false, reason: 'unknown' };
    const prod = parsed.product;
    const cands = [];
    let seen = false;
    orders.forEach(o => o.items.forEach(it => {
      if (it.productId !== prod.id) return;
      seen = true;
      if (it.status === 'pending') cands.push({ order: o, item: it });
    }));
    if (!cands.length) return { ok: false, reason: seen ? 'done' : 'notneeded', product: prod };
    cands.sort((a, b) => a.order.createdAt - b.order.createdAt);
    return { ok: true, order: cands[0].order, item: cands[0].item, kg: parsed.kg, product: prod };
  }

  function freeBin(orders, cartId) {
    const used = orders.filter(o => o.cartId === cartId && !['completed', 'cancelled'].includes(o.status)).map(o => o.bin);
    return BINS.find(b => !used.includes(b)) || null;
  }

  function seedOrders() {
    const t = now();
    return [
      makeOrder({ id: 'KF-1041', name: 'كريم محمود', createdAt: t - 4 * 60000, lines: [{ pid: 'p01', qty: 1 }, { pid: 'p05', qty: 1 }, { pid: 'p22', qty: 2 }, { pid: 'p18', qty: 1 }] }),
      makeOrder({ id: 'KF-1042', name: 'سلمى حسن', createdAt: t - 2 * 60000, lines: [{ pid: 'p03', qty: 1 }, { pid: 'p22', qty: 1 }, { pid: 'p15', qty: 1 }] })
    ];
  }

  window.Logic = {
    SUB_WINDOW, EDIT_WINDOW, BINS, itemTotal, orderTotal, liveItems, progress, pendingSubs, isEditable, etaMin,
    makeOrder, settle, claim, pick, requestSub, markUnavailable, answerSub, expireSubs, removeItem, addLines, complete,
    route, matchScan, freeBin, seedOrders
  };
})();
