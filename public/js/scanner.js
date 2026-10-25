// Barcode scanner: phone camera (EAN-13 / QR) + USB/Bluetooth scanner guns that type like a keyboard.
(function () {
  let reader = null, last = { code: '', t: 0 };

  function hardware(onCode) {
    let buf = '', lastKey = 0;
    window.addEventListener('keydown', e => {
      if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
      const t = Date.now();
      if (t - lastKey > 120) buf = '';
      lastKey = t;
      if (e.key === 'Enter') { if (buf.length >= 6) { onCode(buf); } buf = ''; }
      else if (e.key.length === 1) buf += e.key;
    });
  }

  async function start(elId, onCode, onFail) {
    await stop();
    if (!window.Html5Qrcode || !navigator.mediaDevices) { onFail && onFail(); return; }
    try {
      const F = window.Html5QrcodeSupportedFormats;
      reader = new Html5Qrcode(elId, { formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.CODE_128, F.QR_CODE], useBarCodeDetectorIfSupported: true, verbose: false });
      await reader.start({ facingMode: 'environment' }, { fps: 12, aspectRatio: 1.3333 }, code => {
        const t = Date.now();
        if (code === last.code && t - last.t < 1800) return;
        last = { code, t };
        onCode(code);
      }, () => {});
    } catch (e) { reader = null; onFail && onFail(e); }
  }

  async function stop() {
    if (!reader) return;
    const r = reader; reader = null;
    try { await r.stop(); r.clear(); } catch (e) {}
  }

  // Standard scanner sheet body (viewfinder + manual entry)
  function markup({ placeholder = 'أدخل رقم الباركود', demo = false } = {}) {
    return `<div class="stack">
      <div class="viewfinder" id="vf"><div class="reader" id="reader"></div>
        <div class="vf-corners"><i></i><i></i><i></i><i></i></div><div class="vf-laser"></div>
        <div class="vf-state" id="vfState" hidden></div></div>
      <div class="row" style="gap:10px"><input class="input num" id="manualCode" inputmode="numeric" placeholder="${placeholder}" dir="ltr" style="text-align:center">
        <button class="btn btn-ink" id="manualGo" style="padding:0 20px">${I('check', 20)}</button></div>
      ${demo ? `<button class="btn btn-soft block" id="demoScan">${I('zap', 20)}<span>قراءة تجريبية للصنف الحالي</span></button>` : ''}
    </div>`;
  }

  window.Scanner = { hardware, start, stop, markup };
})();
