// Data layer: one `orders` collection. Uses Firestore when configured, otherwise a local store
// (same browser, synced across tabs). All business changes go through update(id, mutator).
(function () {
  const LS = 'kf_orders_v2';
  const params = new URLSearchParams(location.search);
  if (params.has('local')) localStorage.setItem('kf_mode', 'local');
  if (params.has('cloud')) localStorage.removeItem('kf_mode');

  let fs = null, cloud = false, cache = [];
  const subs = new Set();
  const chan = window.BroadcastChannel ? new BroadcastChannel('kf_sync') : null;
  let cloudUnsub = null;

  function init() {
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
      if (raw) return JSON.parse(raw);
      const seed = window.Logic ? window.Logic.seedOrders() : [];
      if (seed.length) localStorage.setItem(LS, JSON.stringify(seed));
      return seed;
    } catch (e) { return []; }
  };
  const writeLocal = list => { localStorage.setItem(LS, JSON.stringify(list)); chan && chan.postMessage('c'); emitLocal(); };
  const clone = o => JSON.parse(JSON.stringify(o));
  const sortList = l => l.sort((a, b) => a.createdAt - b.createdAt);

  function emit(list) {
    cache = sortList(list);
    subs.forEach(cb => cb(cache));
  }
  function emitLocal() { if (!cloud) emit(readLocal()); }

  if (chan) chan.onmessage = () => emitLocal();
  window.addEventListener('storage', e => { if (e.key === LS) emitLocal(); });

  function onOrders(cb) {
    subs.add(cb);
    if (!cloud) {
      cb(sortList(readLocal()));
      cache = sortList(readLocal());
    } else {
      const local = readLocal();
      if (!cache.length && local.length) cache = sortList(local);
      cb(cache);
      if (!cloudUnsub) {
        cloudUnsub = fs.collection('orders').onSnapshot(
          snap => {
            const list = snap.docs.map(d => d.data());
            if (list.length) writeLocal(list);
            emit(list);
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
    if (cloud) {
      const snap = await fs.collection('orders').limit(1).get();
      if (!snap.empty) return;
    } else if (readLocal().length) return;
    for (const o of window.Logic.seedOrders()) await put(o);
  }

  async function reset() {
    if (cloud) {
      const snap = await fs.collection('orders').get();
      await Promise.all(snap.docs.map(d => d.ref.delete()));
    } else writeLocal([]);
    for (const o of window.Logic.seedOrders()) await put(o);
  }

  init();
  window.AppDB = { onOrders, put, update, seedIfEmpty, reset, isCloud: () => cloud, all: () => cache };
})();
