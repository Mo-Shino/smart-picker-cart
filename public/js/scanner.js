// Universal Barcode Scanner Engine: Supports Camera, Hardware Laser Guns, and Simulation
const BarcodeScanner = (() => {
  let isScanning = false;
  let videoStream = null;
  let onScanCallback = null;
  let html5QrScanner = null;
  let hardwareBuffer = '';
  let hardwareLastKeyTime = 0;

  // Initialize Hardware Scanner Listener (USB / Bluetooth Laser Scanners)
  function initHardwareScanner(callback) {
    onScanCallback = callback;

    window.addEventListener('keydown', (e) => {
      const currentTime = Date.now();
      
      // Hardware scanners typically input characters within 20-40ms intervals
      if (currentTime - hardwareLastKeyTime > 150) {
        hardwareBuffer = '';
      }
      hardwareLastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (hardwareBuffer.length >= 4) {
          e.preventDefault();
          const code = hardwareBuffer.trim();
          hardwareBuffer = '';
          if (onScanCallback) onScanCallback(code);
        }
      } else if (e.key.length === 1) {
        hardwareBuffer += e.key;
      }
    });
  }

  // Start Camera Barcode Scanner
  async function startCameraScanner(elementId, callback) {
    onScanCallback = callback;
    isScanning = true;

    // Check if Html5Qrcode library is loaded
    if (window.Html5Qrcode) {
      try {
        html5QrScanner = new Html5Qrcode(elementId);
        const config = {
          fps: 15,
          qrbox: { width: 250, height: 180 },
          aspectRatio: 1.333
        };

        await html5QrScanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            stopCameraScanner();
            if (onScanCallback) onScanCallback(decodedText);
          },
          (errorMessage) => {
            // normal frame-by-frame scan attempt
          }
        );
        return;
      } catch (err) {
        console.warn('Html5Qrcode camera start error, falling back to native stream:', err);
      }
    }

    // Native Camera Fallback with native BarcodeDetector if available
    try {
      const container = document.getElementById(elementId);
      if (!container) return;
      container.innerHTML = `
        <video id="nativeScannerVideo" autoplay playsinline muted style="width:100%; height:100%; object-fit:cover;"></video>
        <div class="laser-line"></div>
      `;
      const video = document.getElementById('nativeScannerVideo');
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      video.srcObject = videoStream;

      if ('BarcodeDetector' in window) {
        const barcodeDetector = new BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'qr_code', 'code_128', 'upc_a', 'upc_e']
        });
        const detectFrame = async () => {
          if (!isScanning) return;
          try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              stopCameraScanner();
              if (onScanCallback) onScanCallback(code);
              return;
            }
          } catch (e) {}
          requestAnimationFrame(detectFrame);
        };
        video.onloadedmetadata = () => {
          requestAnimationFrame(detectFrame);
        };
      }
    } catch (err) {
      console.error('Cannot access camera:', err);
      alert('تعذر فتح الكاميرا، يرجى التأكد من إعطاء صلاحية الكاميرا للمتصفح.');
      stopCameraScanner();
    }
  }

  // Stop Camera Scanner
  async function stopCameraScanner() {
    isScanning = false;
    if (html5QrScanner) {
      try {
        await html5QrScanner.stop();
        html5QrScanner.clear();
      } catch (e) {}
      html5QrScanner = null;
    }
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
    }
  }

  return {
    initHardware: initHardwareScanner,
    startCamera: startCameraScanner,
    stopCamera: stopCameraScanner,
    simulateScan: (code) => {
      if (onScanCallback) onScanCallback(code);
    }
  };
})();
