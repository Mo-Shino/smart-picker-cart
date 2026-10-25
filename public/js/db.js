// Unified Data & Realtime Synchronization Layer
// Supports both: 1) Supabase (Cloud & Vercel deployment), 2) Local/Socket.io Fallback

const AppDB = (() => {
  let supabaseClient = null;
  let activeChannel = null;
  let isSupabaseActive = false;

  // Read saved Supabase credentials from localStorage or global config
  const savedUrl = localStorage.getItem('SP_SUPABASE_URL') || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) || '';
  const savedKey = localStorage.getItem('SP_SUPABASE_KEY') || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.key) || '';

  if (savedUrl && savedKey && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(savedUrl, savedKey);
      isSupabaseActive = true;
      console.log('⚡ Connected to Supabase Realtime Cloud!');
    } catch (e) {
      console.warn('Failed to init Supabase client:', e);
    }
  }

  // Fallback local products dataset
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

  // Helper for Cross-Tab / Cross-Window Local BroadcastChannel
  const broadcastChan = window.BroadcastChannel ? new BroadcastChannel('smart_cart_sync') : null;

  // 1. Fetch Products
  async function getProducts() {
    if (isSupabaseActive) {
      try {
        const { data, error } = await supabaseClient.from('products').select('*').order('aisle_order');
        if (!error && data && data.length > 0) {
          return data.map(p => ({
            id: p.id,
            name: p.name,
            barcode: p.barcode,
            category: p.category,
            aisle: p.aisle,
            aisleOrder: p.aisle_order,
            price: parseFloat(p.price),
            unit: p.unit
          }));
        }
      } catch (e) {
        console.warn('Supabase fetch products error, fallback to local:', e);
      }
    }
    
    // Fallback local API or mock
    try {
      const res = await fetch('/api/products');
      if (res.ok) return await res.json();
    } catch (e) {}

    return localProducts;
  }

  // 2. Fetch Order with Items and Substitutions
  async function getOrder(orderId = 'ORD-101') {
    if (isSupabaseActive) {
      try {
        const { data: orderData, error: orderErr } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (!orderErr && orderData) {
          const { data: itemsData } = await supabaseClient
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)
            .order('aisle_order');

          const { data: subsData } = await supabaseClient
            .from('substitutions')
            .select('*')
            .eq('order_id', orderId);

          return {
            id: orderData.id,
            customerName: orderData.customer_name,
            customerPhone: orderData.customer_phone,
            status: orderData.status,
            cartId: orderData.cart_id,
            totalAmount: parseFloat(orderData.total_amount),
            items: (itemsData || []).map(i => ({
              id: i.id,
              orderId: i.order_id,
              productId: i.product_id,
              name: i.name,
              barcode: i.barcode,
              category: i.category,
              aisle: i.aisle,
              aisleOrder: i.aisle_order,
              price: parseFloat(i.price),
              unit: i.unit,
              requiredQty: i.required_qty,
              pickedQty: i.picked_qty,
              status: i.status
            })),
            substitutionRequests: (subsData || []).map(s => ({
              id: s.id,
              itemId: s.item_id,
              originalItemName: s.original_name,
              substituteProduct: {
                id: s.substitute_product_id,
                name: s.substitute_name,
                price: parseFloat(s.substitute_price)
              },
              status: s.status,
              expiresAt: Number(s.expires_at)
            }))
          };
        }
      } catch (e) {
        console.warn('Supabase fetch order error:', e);
      }
    }

    // Fallback to Local REST API
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    // Fallback to LocalStorage
    const stored = localStorage.getItem(`order_${orderId}`);
    if (stored) return JSON.parse(stored);

    return null;
  }

  // 3. Subscribe to Real-Time Updates (Supabase Realtime OR Socket.io / BroadcastChannel)
  function subscribeOrder(orderId, callback) {
    if (isSupabaseActive) {
      if (activeChannel) {
        supabaseClient.removeChannel(activeChannel);
      }

      activeChannel = supabaseClient.channel(`order-channel-${orderId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, async () => {
          const updated = await getOrder(orderId);
          callback(updated);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items', filter: `order_id=eq.${orderId}` }, async () => {
          const updated = await getOrder(orderId);
          callback(updated);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'substitutions', filter: `order_id=eq.${orderId}` }, async () => {
          const updated = await getOrder(orderId);
          callback(updated);
        })
        .subscribe((status) => {
          console.log(`Supabase Realtime subscription status for ${orderId}:`, status);
        });
    }

    // Also listen on local BroadcastChannel
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
    if (isSupabaseActive) {
      try {
        const order = await getOrder(orderId);
        if (!order) return { success: false, message: 'الأوردر غير موجود' };

        const item = order.items.find(i => i.barcode === barcode.trim());
        if (!item) {
          return { success: false, message: 'الباركود غير موجود في طلب هذا العميل!' };
        }

        if (item.status === 'picked') {
          return { success: false, message: 'تم تجميع هذا الصنف بالكامل مسبقاً!' };
        }

        const newPicked = (item.pickedQty || 0) + 1;
        const newStatus = newPicked >= item.requiredQty ? 'picked' : 'pending';

        // Update in Supabase
        await supabaseClient
          .from('order_items')
          .update({ picked_qty: newPicked, status: newStatus })
          .eq('id', item.id);

        // Check if all are picked
        const allDone = order.items.every(i => (i.id === item.id ? newStatus === 'picked' : (i.status === 'picked' || i.status === 'substituted')));
        const orderStatus = allDone ? 'ready_for_dispatch' : 'picking';

        await supabaseClient
          .from('orders')
          .update({ status: orderStatus })
          .eq('id', orderId);

        const updatedOrder = await getOrder(orderId);
        notifyLocal(orderId, updatedOrder);
        return { success: true, message: `تم مسح الصنف: ${item.name}`, order: updatedOrder };
      } catch (e) {
        console.error('Scan in Supabase error:', e);
      }
    }

    // Fallback to Socket.io or LocalStorage
    if (window.socket) {
      window.socket.emit('scan_item', { orderId, barcode });
      return { success: true, pendingSocket: true };
    }

    return { success: false, message: 'خطأ في معالجة المسح' };
  }

  // 5. Request Substitution
  async function requestSubstitution(orderId, itemId, subProduct) {
    if (isSupabaseActive) {
      try {
        const subId = `SUB-${Date.now()}`;
        const expiresAt = Date.now() + (3 * 60 * 1000);

        // Update item status
        await supabaseClient.from('order_items').update({ status: 'out_of_stock' }).eq('id', itemId);

        // Insert into substitutions table
        await supabaseClient.from('substitutions').insert({
          id: subId,
          order_id: orderId,
          item_id: itemId,
          original_name: subProduct.originalName || 'صنف غير متوفر',
          substitute_product_id: subProduct.id,
          substitute_name: subProduct.name,
          substitute_price: subProduct.price,
          status: 'pending',
          expires_at: expiresAt
        });

        const updatedOrder = await getOrder(orderId);
        notifyLocal(orderId, updatedOrder);
        return { success: true, order: updatedOrder };
      } catch (e) {
        console.error('Substitution error:', e);
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
    if (isSupabaseActive) {
      try {
        await supabaseClient.from('substitutions').update({ status: decision }).eq('id', subRequestId);

        const order = await getOrder(orderId);
        const subReq = order.substitutionRequests.find(s => s.id === subRequestId);

        if (subReq) {
          if (decision === 'accepted') {
            await supabaseClient.from('order_items').update({
              name: `${subReq.substituteProduct.name} (بديل معتمد)`,
              price: subReq.substituteProduct.price,
              status: 'pending',
              picked_qty: 0
            }).eq('id', subReq.itemId);
          } else {
            await supabaseClient.from('order_items').update({
              status: 'cancelled'
            }).eq('id', subReq.itemId);
          }
        }

        const updatedOrder = await getOrder(orderId);
        notifyLocal(orderId, updatedOrder);
        return { success: true, order: updatedOrder };
      } catch (e) {
        console.error('Respond sub error:', e);
      }
    }

    if (window.socket) {
      window.socket.emit('respond_substitution', { orderId, subRequestId, decision });
    }
  }

  // 7. Dispatch Order (Cashier)
  async function dispatchOrder(orderId, cashierId = 'POS-01') {
    if (isSupabaseActive) {
      try {
        await supabaseClient.from('orders').update({
          status: 'completed',
          dispatched_at: new Date().toISOString()
        }).eq('id', orderId);

        const updatedOrder = await getOrder(orderId);
        notifyLocal(orderId, updatedOrder);
        return { success: true, order: updatedOrder };
      } catch (e) {
        console.error('Dispatch error:', e);
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
    isSupabase: () => isSupabaseActive,
    getProducts,
    getOrder,
    subscribeOrder,
    scanItem,
    requestSubstitution,
    respondSubstitution,
    dispatchOrder
  };
})();
