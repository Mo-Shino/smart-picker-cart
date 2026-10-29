// Data layer: one `orders` collection. Uses Firestore when configured, otherwise a local store
// (same browser, synced across tabs). All business changes go through update(id, mutator).
(function () {
  const LS = 'kf_orders_v3';
  const params = new URLSearchParams(location.search);
  if (params.has('local')) localStorage.setItem('kf_mode', 'local');
  if (params.has('cloud')) localStorage.removeItem('kf_mode');

  let fs = null, cloud = false, cache = [], seeding = false;
  const subs = new Set();
  const chan = window.BroadcastChannel ? new BroadcastChannel('kf_sync') : null;
  let cloudUnsub = null;

  // Validate that an order matches the v3 schema (guards against legacy v1 docs like ORD-101 in Firestore)
  function isValidOrder(o) {
    return !!(
      o &&
      typeof o.id === 'string' &&
      o.customer &&
      typeof o.customer.name === 'string' &&
      Array.isArray(o.items) &&
      o.items.every(it => it && typeof it.id === 'string' && typeof it.dept === 'string')
    );
  }

  function init() {
    // Clean legacy localStorage key if present
    try { localStorage.removeItem('kf_orders_v2'); } catch (e) {}
    const cfg = window.FIREBASE_CONFIG;
    if (localStorage.getItem('kf_mode') !== 'local' && cfg && cfg.apiKey && window.firebase) {
      try {
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        fs = firebase.firestore();
        cloud = true;
      } catch (e) { console.warn('cloud unavailable, using local mode', e); }
    }
  }

  const readLocal = () => {
    try {
      const raw = localStorage.getItem(LS);
      if (raw) {
        const parsed = JSON.parse(raw).filter(isValidOrder);
        if (parsed.length) return parsed;
      }
      const seed = window.Logic ? window.Logic.seedOrders() : [];
      if (seed.length) localStorage.setItem(LS, JSON.stringify(seed));
      return seed;
    } catch (e) { return window.Logic ? window.Logic.seedOrders() : []; }
  };
  const writeLocal = list => {
    const valid = (list || []).filter(isValidOrder);
    localStorage.setItem(LS, JSON.stringify(valid));
    chan && chan.postMessage('c');
    emitLocal();
  };
  const clone = o => JSON.parse(JSON.stringify(o));
  const sortList = l => l.filter(isValidOrder).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  function emit(list) {
    cache = sortList(list);
    subs.forEach(cb => {
      try { cb(cache); } catch (e) { console.error(e); }
    });
  }
  function emitLocal() { if (!cloud) emit(readLocal()); }

  if (chan) chan.onmessage = () => emitLocal();
  window.addEventListener('storage', e => { if (e.key === LS) emitLocal(); });

  function onOrders(cb) {
    subs.add(cb);
    if (!cloud) {
      cache = sortList(readLocal());
      cb(cache);
    } else {
      const local = readLocal();
      if (!cache.length && local.length) cache = sortList(local);
      cb(cache);
      if (!cloudUnsub) {
        cloudUnsub = fs.collection('orders').onSnapshot(
          async snap => {
            const rawDocs = snap.docs;
            const validList = [];
            const invalidRefs = [];
            rawDocs.forEach(d => {
              const data = d.data();
              if (isValidOrder(data)) validList.push(data);
              else invalidRefs.push(d.ref);
            });
            // Automatically remove legacy v1 docs from Firestore
            if (invalidRefs.length) {
              Promise.all(invalidRefs.map(r => r.delete().catch(() => {})));
            }
            if (validList.length) {
              writeLocal(validList);
              emit(validList);
            } else if (!seeding && window.Logic) {
              seeding = true;
              try {
                const seeded = window.Logic.seedOrders();
                for (const o of seeded) await fs.collection('orders').doc(o.id).set(clone(o));
                writeLocal(seeded);
                emit(seeded);
              } catch (e) {
                emit(readLocal());
              } finally {
                seeding = false;
              }
            }
          },
          err => { console.warn('cloud sync failed, switching to local mode', err); cloud = false; cloudUnsub = null; emitLocal(); }
        );
      }
    }
    return () => subs.delete(cb);
  }

  async function put(order) {
    const o = clone(order);
    if (cloud) await fs.collection('orders').doc(o.id).set(o);
    else { const l = readLocal().filter(x => x.id !== o.id); l.push(o); writeLocal(l); }
    return o;
  }

  // Safe concurrent update: mutator(order) returns true when it changed the order.
  async function update(id, mutator) {
    if (cloud) {
      const ref = fs.collection('orders').doc(id);
      return fs.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists) return false;
        const o = snap.data();
        if (!isValidOrder(o)) return false;
        const changed = mutator(o);
        if (changed) tx.set(ref, clone(o));
        return !!changed;
      });
    }
    const list = readLocal();
    const i = list.findIndex(o => o.id === id);
    if (i < 0) return false;
    const o = clone(list[i]);
    const changed = mutator(o);
    if (changed) { list[i] = o; writeLocal(list); }
    return !!changed;
  }

  async function seedIfEmpty() {
    if (seeding) return;
    if (cloud) {
      const snap = await fs.collection('orders').get();
      const valid = snap.docs.filter(d => isValidOrder(d.data()));
      if (valid.length > 0) return;
      seeding = true;
      try {
        // Delete any invalid legacy docs
        await Promise.all(snap.docs.filter(d => !isValidOrder(d.data())).map(d => d.ref.delete().catch(() => {})));
        for (const o of window.Logic.seedOrders()) await put(o);
      } finally {
        seeding = false;
      }
    } else if (!readLocal().length) {
      for (const o of window.Logic.seedOrders()) await put(o);
    }
  }

  async function reset() {
    seeding = true;
    try {
      if (cloud) {
        const snap = await fs.collection('orders').get();
        await Promise.all(snap.docs.map(d => d.ref.delete()));
      } else writeLocal([]);
      for (const o of window.Logic.seedOrders()) await put(o);
    } finally {
      seeding = false;
    }
  }

  init();
  window.AppDB = { onOrders, put, update, seedIfEmpty, reset, isCloud: () => cloud, all: () => cache };
})();
