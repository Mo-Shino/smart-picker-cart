// Universal Data & Realtime Sync Layer: Powered by Google Firebase Firestore (with Local Fallback)

const AppDB = (() => {
  let firestore = null;
  let isFirebaseActive = false;
  let activeUnsubscribe = null;

  // Initial demo order structure
  const defaultOrder = {
    id: 'ORD-101',
    customerName: 'كريم محمود',
    customerPhone: '01098765432',
    status: 'assigned',
    cartId: 'CART-01',
    pickerName: 'أحمد طارق (مُحضّر)',
    totalAmount: 204.50,
    createdAt: new Date().toISOString(),
    items: [
      { id: 'item-1', productId: 'prod-1', name: 'أرز مصري فاخر 1 كجم', barcode: '6221001001011', category: 'حبوب وبقوليات', aisle: 'ممر 1A - رف 01', aisleOrder: 1, price: 32.50, unit: 'كيس', requiredQty: 1, pickedQty: 0, status: 'pending' },
      { id: 'item-2', productId: 'prod-4', name: 'زيت ذرة نقي 800 مل', barcode: '6221002002018', category: 'زيوت وسمن', aisle: 'ممر 1A - رف 03', aisleOrder: 2, price: 75.00, unit: 'زجاجة', requiredQty: 1, pickedQty: 0, status: 'pending' },
      { id: 'item-3', productId: 'prod-8', name: 'حليب كامل الدسم 1 لتر', barcode: '6221004004012', category: 'ألبان وأجبان', aisle: 'ممر 2A - ثلاجة 01', aisleOrder: 4, price: 42.00, unit: 'عبوة', requiredQty: 1, pickedQty: 0, status: 'pending' },
      { id: 'item-4', productId: 'prod-13', name: 'خبز توست أبيض فاخر', barcode: '6221006006016', category: 'مخبوزات هشة', aisle: 'ممر 3A - رف 01', aisleOrder: 6, price: 25.00, unit: 'كيس', requiredQty: 1, pickedQty: 0, status: 'pending' },
      { id: 'item-5', productId: 'prod-16', name: 'موز بلدي فاخر (طازج)', barcode: '2000016011005', category: 'خضار وفواكه طازجة', aisle: 'ممر 3B - قسم الفواكه', aisleOrder: 7, price: 30.00, unit: 'كجم', requiredQty: 1, pickedQty: 0, status: 'pending' }
    ],
    substitutionRequests: []
  };

  const localProducts = [
    { id: 'prod-1', name: 'أرز مصري فاخر 1 كجم', barcode: '6221001001011', category: 'حبوب وبقوليات', aisle: 'ممر 1A - رف 01', aisleOrder: 1, price: 32.50, unit: 'كيس' },
    { id: 'prod-2', name: 'أرز بسمتي هندي 1 كجم', barcode: '6221001001028', category: 'حبوب وبقوليات', aisle: 'ممر 1A - رف 01', aisleOrder: 1, price: 68.00, unit: 'كيس' },
    { id: 'prod-3', name: 'مكرونة فرن فاخرة 400 جم', barcode: '6221001001035', category: 'حبوب وبقوليات', aisle: 'ممر 1A - رف 02', aisleOrder: 1, price: 14.00, unit: 'كيس' },
    { id: 'prod-4', name: 'زيت ذرة نقي 800 مل', barcode: '6221002002018', category: 'زيوت وسمن', aisle: 'ممر 1A - رف 03', aisleOrder: 2, price: 75.00, unit: 'زجاجة' },
    { id: 'prod-5', name: 'زيت عباد الشمس 800 مل', barcode: '6221002002025', category: 'زيوت وسمن', aisle: 'ممر 1A - رف 03', aisleOrder: 2, price: 65.00, unit: 'زجاجة' },
    { id: 'prod-6', name: 'صلصة طماطم معلبة 360 جم', barcode: '6221003003015', category: 'معلبات وصلصات', aisle: 'ممر 1B - رف 02', aisleOrder: 3, price: 18.50, unit: 'برطمان' },
    { id: 'prod-7', name: 'معجون طماطم بيوريه 300 جم', barcode: '6221003003022', category: 'معلبات وصلصات', aisle: 'ممر 1B - رف 02', aisleOrder: 3, price: 16.00, unit: 'علبة' },
    { id: 'prod-8', name: 'حليب كامل الدسم 1 لتر', barcode: '6221004004012', category: 'ألبان وأجبان', aisle: 'ممر 2A - ثلاجة 01', aisleOrder: 4, price: 42.00, unit: 'عبوة' },
    { id: 'prod-9', name: 'حليب خالي الدسم 1 لتر', barcode: '6221004004029', category: 'ألبان وأجبان', aisle: 'ممر 2A - ثلاجة 01', aisleOrder: 4, price: 42.00, unit: 'عبوة' },
    { id: 'prod-10', name: 'جبنة فيتا طبيعية 500 جم', barcode: '6221004004036', category: 'ألبان وأجبان', aisle: 'ممر 2A - ثلاجة 03', aisleOrder: 4, price: 38.00, unit: 'علبة' },
    { id: 'prod-11', name: 'عصير برتقال طبيعي 1 لتر', barcode: '6221005005019', category: 'مشروبات وعصائر', aisle: 'ممر 2B - رف 02', aisleOrder: 5, price: 28.00, unit: 'زجاجة' },
    { id: 'prod-12', name: 'عصير مانجو طبيعي 1 لتر', barcode: '6221005005026', category: 'مشروبات وعصائر', aisle: 'ممر 2B - رف 02', aisleOrder: 5, price: 30.00, unit: 'زجاجة' },
    { id: 'prod-13', name: 'خبز توست أبيض فاخر', barcode: '6221006006016', category: 'مخبوزات هشة', aisle: 'ممر 3A - رف 01', aisleOrder: 6, price: 25.00, unit: 'كيس' },
    { id: 'prod-14', name: 'خبز توست أسمر بالردة', barcode: '6221006006023', category: 'مخبوزات هشة', aisle: 'ممر 3A - رف 01', aisleOrder: 6, price: 27.00, unit: 'كيس' },
    { id: 'prod-15', name: 'تفاح أحمر سكري (طازج)', barcode: '2000015012503', category: 'خضار وفواكه طازجة', aisle: 'ممر 3B - قسم الفواكه', aisleOrder: 7, price: 55.00, unit: 'كجم' },
    { id: 'prod-16', name: 'موز بلدي فاخر (طازج)', barcode: '2000016011005', category: 'خضار وفواكه طازجة', aisle: 'ممر 3B - قسم الفواكه', aisleOrder: 7, price: 30.00, unit: 'كجم' }
  ];

  // Try to load Firebase config
  let firebaseConfig = null;
  const savedConfigStr = localStorage.getItem('SP_FIREBASE_CONFIG');
  if (savedConfigStr) {
    try { firebaseConfig = JSON.parse(savedConfigStr); } catch (e) {}
  }
  if (!firebaseConfig && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) {
    firebaseConfig = window.FIREBASE_CONFIG;
  }

  // Initialize Firebase if config exists
  if (firebaseConfig && firebaseConfig.apiKey && window.firebase) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      firestore = firebase.firestore();
      isFirebaseActive = true;
      console.log('🔥 Connected to Google Firebase Firestore Realtime Cloud!');
    } catch (err) {
      console.warn('Firebase initialization error:', err);
    }
  }

  const broadcastChan = window.BroadcastChannel ? new BroadcastChannel('smart_cart_sync') : null;

  // 1. Get Products
  async function getProducts() {
    if (isFirebaseActive) {
      try {
        const snap = await firestore.collection('products').orderBy('aisleOrder').get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {}
    }
    return localProducts;
  }

  // 2. Get Order & Auto-Seed if new
  async function getOrder(orderId = 'ORD-101') {
    if (isFirebaseActive) {
      try {
        const docRef = firestore.collection('orders').doc(orderId);
        const doc = await docRef.get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        } else {
          // Auto-seed initial order into Firebase!
          await docRef.set(defaultOrder);
          return defaultOrder;
        }
      } catch (e) {
        console.warn('Firebase getOrder error:', e);
      }
    }

    // Local / Socket fallback
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    const stored = localStorage.getItem(`order_${orderId}`);
    if (stored) return JSON.parse(stored);

    return defaultOrder;
  }

  // 3. Subscribe to Real-Time Updates (Firebase onSnapshot)
  function subscribeOrder(orderId, callback) {
    if (isFirebaseActive) {
      if (activeUnsubscribe) activeUnsubscribe();
      
      const docRef = firestore.collection('orders').doc(orderId);
      activeUnsubscribe = docRef.onSnapshot((doc) => {
        if (doc.exists) {
          const data = { id: doc.id, ...doc.data() };
          callback(data);
        } else {
          docRef.set(defaultOrder);
        }
      }, (err) => {
        console.warn('Firestore onSnapshot error:', err);
      });
    }

    if (broadcastChan) {
      broadcastChan.onmessage = (evt) => {
        if (evt.data && evt.data.orderId === orderId && evt.data.order) {
          callback(evt.data.order);
        }
      };
    }
  }

  // 4. Scan Item Action
  async function scanItem(orderId, barcode) {
    if (isFirebaseActive) {
      try {
        const docRef = firestore.collection('orders').doc(orderId);
        const doc = await docRef.get();
        if (!doc.exists) return { success: false, message: 'الأوردر غير موجود' };

        const order = doc.data();
        const item = order.items.find(i => i.barcode === barcode.trim());
        if (!item) {
          return { success: false, message: 'الباركود غير موجود في طلب هذا العميل!' };
        }

        if (item.status === 'picked') {
          return { success: false, message: 'تم تجميع هذا الصنف بالكامل مسبقاً!' };
        }

        item.pickedQty = (item.pickedQty || 0) + 1;
        if (item.pickedQty >= item.requiredQty) {
          item.status = 'picked';
        }

        const allDone = order.items.every(i => i.status === 'picked' || i.status === 'substituted');
        order.status = allDone ? 'ready_for_dispatch' : 'picking';

        await docRef.set(order, { merge: true });
        notifyLocal(orderId, order);
        return { success: true, message: `تم مسح الصنف: ${item.name}`, order };
      } catch (e) {
        console.error('Scan in Firebase error:', e);
      }
    }

    if (window.socket) {
      window.socket.emit('scan_item', { orderId, barcode });
      return { success: true, pendingSocket: true };
    }

    return { success: false, message: 'خطأ في معالجة المسح' };
  }

  // 5. Request Substitution
  async function requestSubstitution(orderId, itemId, subProduct) {
    if (isFirebaseActive) {
      try {
        const docRef = firestore.collection('orders').doc(orderId);
        const doc = await docRef.get();
        if (!doc.exists) return;

        const order = doc.data();
        const item = order.items.find(i => i.id === itemId);
        if (item) item.status = 'out_of_stock';

        const subReq = {
          id: `SUB-${Date.now()}`,
          itemId,
          originalItemName: item ? item.name : 'صنف غير متوفر',
          substituteProduct: {
            id: subProduct.id,
            name: subProduct.name,
            price: subProduct.price
          },
          status: 'pending',
          expiresAt: Date.now() + (3 * 60 * 1000)
        };

        order.substitutionRequests = order.substitutionRequests || [];
        order.substitutionRequests.push(subReq);

        await docRef.set(order, { merge: true });
        notifyLocal(orderId, order);
        return { success: true, order };
      } catch (e) {
        console.error('Firebase sub error:', e);
      }
    }

    if (window.socket) {
      window.socket.emit('request_substitution', {
        orderId,
        itemId,
        suggestedSubstituteId: subProduct.id
      });
      return { success: true };
    }
  }

  // 6. Respond to Substitution
  async function respondSubstitution(orderId, subRequestId, decision) {
    if (isFirebaseActive) {
      try {
        const docRef = firestore.collection('orders').doc(orderId);
        const doc = await docRef.get();
        if (!doc.exists) return;

        const order = doc.data();
        const subReq = (order.substitutionRequests || []).find(s => s.id === subRequestId);
        if (subReq) {
          subReq.status = decision;
          const item = order.items.find(i => i.id === subReq.itemId);
          if (item) {
            if (decision === 'accepted') {
              item.name = `${subReq.substituteProduct.name} (بديل معتمد)`;
              item.price = subReq.substituteProduct.price;
              item.status = 'pending';
              item.pickedQty = 0;
            } else {
              item.status = 'cancelled';
            }
          }
        }

        // Recalculate Total
        order.totalAmount = order.items
          .filter(i => i.status !== 'cancelled')
          .reduce((sum, i) => sum + (i.price * i.requiredQty), 0);

        await docRef.set(order, { merge: true });
        notifyLocal(orderId, order);
        return { success: true, order };
      } catch (e) {
        console.error('Firebase respond sub error:', e);
      }
    }

    if (window.socket) {
      window.socket.emit('respond_substitution', { orderId, subRequestId, decision });
    }
  }

  // 7. Dispatch Order (Cashier)
  async function dispatchOrder(orderId, cashierId = 'POS-01') {
    if (isFirebaseActive) {
      try {
        const docRef = firestore.collection('orders').doc(orderId);
        await docRef.update({
          status: 'completed',
          dispatchedAt: new Date().toISOString(),
          cashierId
        });

        const updatedDoc = await docRef.get();
        const order = updatedDoc.data();
        notifyLocal(orderId, order);
        return { success: true, order };
      } catch (e) {
        console.error('Firebase dispatch error:', e);
      }
    }

    if (window.socket) {
      window.socket.emit('dispatch_clearance', { orderId, cashierId });
    }
  }

  function notifyLocal(orderId, order) {
    if (broadcastChan) {
      broadcastChan.postMessage({ orderId, order });
    }
    localStorage.setItem(`order_${orderId}`, JSON.stringify(order));
  }

  return {
    isCloudActive: () => isFirebaseActive,
    getProducts,
    getOrder,
    subscribeOrder,
    scanItem,
    requestSubstitution,
    respondSubstitution,
    dispatchOrder
  };
})();
