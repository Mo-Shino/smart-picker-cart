const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load initial products dataset
const productsFilePath = path.join(__dirname, 'data', 'products.json');
let products = [];
try {
  products = JSON.parse(fs.readFileSync(productsFilePath, 'utf8'));
} catch (err) {
  console.error('Error reading products.json:', err);
}

// In-Memory Database for Orders & Carts
let carts = [
  { id: 'CART-01', name: 'عربة التجميع #01', status: 'idle', currentOrderId: null, battery: 94 },
  { id: 'CART-02', name: 'عربة التجميع #02', status: 'idle', currentOrderId: null, battery: 88 }
];

let orders = [
  {
    id: 'ORD-101',
    customerName: 'كريم محمود',
    customerPhone: '01098765432',
    status: 'assigned', // pending, assigned, picking, ready_for_dispatch, completed
    cartId: 'CART-01',
    pickerName: 'أحمد طارق (مُحضّر)',
    createdAt: new Date().toISOString(),
    totalAmount: 185.00,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        name: 'أرز مصري فاخر 1 كجم',
        barcode: '6221001001011',
        category: 'حبوب وبقوليات',
        aisle: 'ممر 1A - رف 01',
        aisleOrder: 1,
        price: 32.50,
        unit: 'كيس',
        weightType: 'fixed',
        requiredQty: 1,
        pickedQty: 0,
        status: 'pending' // pending, picked, out_of_stock, substituted
      },
      {
        id: 'item-2',
        productId: 'prod-4',
        name: 'زيت ذرة نقي 800 مل',
        barcode: '6221002002018',
        category: 'زيوت وسمن',
        aisle: 'ممر 1A - رف 03',
        aisleOrder: 2,
        price: 75.00,
        unit: 'زجاجة',
        weightType: 'fixed',
        requiredQty: 1,
        pickedQty: 0,
        status: 'pending'
      },
      {
        id: 'item-3',
        productId: 'prod-8',
        name: 'حليب كامل الدسم 1 لتر',
        barcode: '6221004004012',
        category: 'ألبان وأجبان',
        aisle: 'ممر 2A - ثلاجة 01',
        aisleOrder: 4,
        price: 42.00,
        unit: 'عبوة',
        weightType: 'fixed',
        requiredQty: 1,
        pickedQty: 0,
        status: 'pending'
      },
      {
        id: 'item-4',
        productId: 'prod-13',
        name: 'خبز توست أبيض فاخر',
        barcode: '6221006006016',
        category: 'مخبوزات هشة',
        aisle: 'ممر 3A - رف 01',
        aisleOrder: 6,
        price: 25.00,
        unit: 'كيس',
        weightType: 'fixed',
        requiredQty: 1,
        pickedQty: 0,
        status: 'pending'
      },
      {
        id: 'item-5',
        productId: 'prod-16',
        name: 'موز بلدي فاخر (طازج)',
        barcode: '2000016011005',
        category: 'خضار وفواكه طازجة',
        aisle: 'ممر 3B - قسم الفواكه',
        aisleOrder: 7,
        price: 30.00,
        unit: 'كجم',
        weightType: 'variable',
        requiredQty: 1,
        pickedQty: 0,
        status: 'pending'
      }
    ],
    substitutionRequests: []
  }
];

// Helper: Get local IP for easy Wi-Fi mobile testing
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

// REST API Endpoints
app.get('/api/info', (req, res) => {
  res.json({
    appName: 'Smart Picker Cart (ISEF Prototype)',
    localIps: getLocalIpAddresses(),
    port: PORT,
    activeOrdersCount: orders.filter(o => o.status !== 'completed').length
  });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Create new customer order
app.post('/api/orders', (req, res) => {
  const { customerName, customerPhone, items } = req.body;
  const orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;

  let calculatedTotal = 0;
  const formattedItems = (items || []).map((it, idx) => {
    const prod = products.find(p => p.id === it.productId) || it;
    const qty = it.quantity || 1;
    calculatedTotal += (prod.price || 0) * qty;
    return {
      id: `item-${idx + 1}`,
      productId: prod.id,
      name: prod.name,
      barcode: prod.barcode,
      category: prod.category,
      aisle: prod.aisle,
      aisleOrder: prod.aisleOrder || 99,
      price: prod.price,
      unit: prod.unit,
      weightType: prod.weightType || 'fixed',
      requiredQty: qty,
      pickedQty: 0,
      status: 'pending'
    };
  });

  // Sort items automatically by aisle order for optimal routing!
  formattedItems.sort((a, b) => a.aisleOrder - b.aisleOrder);

  const newOrder = {
    id: orderId,
    customerName: customerName || 'عميل تجريبي',
    customerPhone: customerPhone || '01000000000',
    status: 'assigned',
    cartId: 'CART-01',
    pickerName: 'أحمد طارق (مُحضّر)',
    createdAt: new Date().toISOString(),
    totalAmount: calculatedTotal,
    items: formattedItems,
    substitutionRequests: []
  };

  orders.unshift(newOrder);
  io.emit('new_order_placed', newOrder);
  res.json(newOrder);
});

// Socket.IO Real-Time Handlers
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  socket.on('cart_identify', (cartId) => {
    socket.join(`cart_${cartId}`);
    console.log(`Socket joined cart_${cartId}`);
    const activeOrder = orders.find(o => o.cartId === cartId && o.status !== 'completed');
    socket.emit('cart_synced', { cartId, activeOrder });
  });

  socket.on('customer_join', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Customer socket joined order_${orderId}`);
    const order = orders.find(o => o.id === orderId);
    if (order) socket.emit('order_synced', order);
  });

  // Picker scans barcode
  socket.on('scan_item', ({ orderId, barcode }) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return socket.emit('scan_result', { success: false, message: 'الأوردر غير موجود' });
    }

    // Find item matching barcode
    const item = order.items.find(i => i.barcode === barcode.trim());
    if (!item) {
      return socket.emit('scan_result', { 
        success: false, 
        message: 'الباركود غير موجود في قائمة طلب هذا العميل!',
        scannedBarcode: barcode 
      });
    }

    if (item.status === 'picked') {
      return socket.emit('scan_result', { 
        success: false, 
        message: 'تم تجميع هذا الصنف بالكامل مسبقاً!',
        item 
      });
    }

    // Increment picked quantity
    item.pickedQty = (item.pickedQty || 0) + 1;
    if (item.pickedQty >= item.requiredQty) {
      item.status = 'picked';
    }

    // Check if entire order is complete
    const allPicked = order.items.every(i => i.status === 'picked' || i.status === 'substituted');
    if (allPicked) {
      order.status = 'ready_for_dispatch';
    } else {
      order.status = 'picking';
    }

    // Emit live updates to everyone interested
    io.to(`order_${orderId}`).emit('order_updated', order);
    io.to(`cart_${order.cartId}`).emit('order_updated', order);
    io.emit('global_order_update', order);

    socket.emit('scan_result', { 
      success: true, 
      message: `تم التحقق بنجاح: ${item.name}`, 
      item, 
      order 
    });
  });

  // Picker marks item as out of stock
  socket.on('request_substitution', ({ orderId, itemId, suggestedSubstituteId }) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const item = order.items.find(i => i.id === itemId);
    if (!item) return;

    item.status = 'out_of_stock';
    const subProduct = products.find(p => p.id === suggestedSubstituteId) || products[0];

    const subRequest = {
      id: `SUB-${Date.now()}`,
      itemId: item.id,
      originalItemName: item.name,
      originalBarcode: item.barcode,
      originalPrice: item.price,
      substituteProduct: subProduct,
      status: 'pending', // pending, accepted, rejected, expired
      expiresAt: Date.now() + (3 * 60 * 1000) // 3 minutes countdown
    };

    order.substitutionRequests.push(subRequest);

    io.to(`order_${orderId}`).emit('substitution_alert', { orderId, subRequest, order });
    io.to(`cart_${order.cartId}`).emit('order_updated', order);
    io.emit('global_order_update', order);
  });

  // Customer responds to substitution
  socket.on('respond_substitution', ({ orderId, subRequestId, decision }) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const subReq = order.substitutionRequests.find(s => s.id === subRequestId);
    if (!subReq) return;

    subReq.status = decision; // 'accepted' or 'rejected'
    const item = order.items.find(i => i.id === subReq.itemId);

    if (decision === 'accepted' && item) {
      item.name = `${subReq.substituteProduct.name} (بديل معتمد)`;
      item.barcode = subReq.substituteProduct.barcode;
      item.price = subReq.substituteProduct.price;
      item.status = 'pending'; // Picker will scan it when in that aisle!
      item.pickedQty = 0;
    } else if (decision === 'rejected' && item) {
      item.status = 'cancelled';
    }

    // Recalculate total
    order.totalAmount = order.items
      .filter(i => i.status !== 'cancelled')
      .reduce((sum, i) => sum + (i.price * i.requiredQty), 0);

    io.to(`order_${orderId}`).emit('order_updated', order);
    io.to(`cart_${order.cartId}`).emit('substitution_resolved', { subRequestId, decision, order });
    io.emit('global_order_update', order);
  });

  // Cashier / Dispatcher scans Master Clearance QR Code
  socket.on('dispatch_clearance', ({ orderId, cashierId }) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return socket.emit('clearance_result', { success: false, message: 'رمز الأوردر غير صالح' });
    }

    order.status = 'completed';
    order.dispatchedAt = new Date().toISOString();
    order.cashierId = cashierId || 'POS-01';

    io.to(`order_${orderId}`).emit('order_completed', order);
    io.to(`cart_${order.cartId}`).emit('order_completed', order);
    io.emit('global_order_update', order);

    socket.emit('clearance_result', {
      success: true,
      message: 'تم اعتماد وخروج الطلب بنجاح!',
      order
    });
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log(`=======================================================`);
  console.log(`🛒 Smart Picker Cart Server Running!`);
  console.log(`📡 Local Host:       http://localhost:${PORT}`);
  ips.forEach(ip => {
    console.log(`📱 Mobile/Wi-Fi URL:  http://${ip}:${PORT}`);
  });
  console.log(`=======================================================`);
});
