const PremiumOrder = require('../models/PremiumOrder');
const User = require('../models/User');
const GlobalSetting = require('../models/GlobalSetting');
const { activateReferralBonus } = require('./referralController');
const { createNotification } = require('./notificationController');

// Helper function to activate user's VPN subscription when order is approved / paid
const activateOrderSubscription = async (order) => {
  try {
    if (!order) return;
    
    const settings = await GlobalSetting.findOne({ configKey: 'main_config' });
    const pkg = settings?.premiumIpPackages?.find(p => p.id === order.packageId);
    
    let days = 30;
    if (pkg) {
      const durationMatch = pkg.duration.match(/(\d+)/);
      if (durationMatch) {
        const val = parseInt(durationMatch[1]);
        if (pkg.duration.toLowerCase().includes('month')) {
          days = val * 30;
        } else if (pkg.duration.toLowerCase().includes('year')) {
          days = val * 365;
        } else {
          days = val;
        }
      }
      
      if (pkg.freeDays) {
        const freeMatch = pkg.freeDays.match(/(\d+)/);
        if (freeMatch) {
          const freeVal = parseInt(freeMatch[1]);
          if (pkg.freeDays.toLowerCase().includes('month')) {
            days += freeVal * 30;
          } else {
            days += freeVal;
          }
        }
      }
    } else {
      const packageDays = { 'month-1': 37, 'month-3': 105, 'month-6': 210, 'year-1': 424 };
      days = packageDays[order.packageId] || 30;
    }

    const userId = order.userId._id || order.userId;
    const user = await User.findById(userId);
    if (!user) return;

    let currentExpiry = user.premiumExpiry ? new Date(user.premiumExpiry) : new Date();
    if (currentExpiry < new Date()) {
      currentExpiry = new Date();
    }
    
    const premiumExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
    
    user.isPremium = true;
    user.premiumExpiry = premiumExpiry;
    user.premiumCountry = order.country || '';
    user.premiumPackageName = order.packageName || '';
    await user.save();

    // Activate referral bonus if applicable
    activateReferralBonus(user._id);

    // Send notification
    createNotification(
      user._id, 
      'Premium Account Activated! ✨', 
      `Your order for ${order.packageName || 'VPN'} has been automatically approved & paid via ZiniPay Auto Gateway! Subscription is active until ${premiumExpiry.toLocaleDateString()}. Total ${days} days added.`,
      'premium'
    );
  } catch (err) {
    console.error('Error in activateOrderSubscription:', err);
  }
};

// ─── 1. Create ZiniPay Invoice ──────────────────────────────────────────────
exports.createInvoice = async (req, res) => {
  try {
    const { packageId, packageName, country, amount } = req.body;

    if (!packageId || !amount) {
      return res.status(400).json({ message: 'Package and amount are required' });
    }

    const settings = await GlobalSetting.findOne({ configKey: 'main_config' });
    if (settings && settings.zinipayEnabled === false) {
      return res.status(400).json({ message: 'ZiniPay payment gateway is currently disabled by Admin.' });
    }

    const apiKey = (settings && settings.zinipayApiKey) ? settings.zinipayApiKey : 'sandbox_test_8f4c9a2e7b31';
    const baseUrl = (settings && settings.zinipayBaseUrl) ? settings.zinipayBaseUrl.replace(/\/+$/, '') : 'https://api.zinipay.com';

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Create pending order
    const order = await PremiumOrder.create({
      userId: user._id,
      packageId,
      packageName: packageName || packageId,
      country: country || '',
      paymentMethod: 'zinipay',
      transactionId: 'PENDING_ZINIPAY',
      amount: Number(amount),
      status: 'pending'
    });

    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const serverOrigin = (host.includes('localhost') || host.includes('127.0.0.1')) ? 'https://zenivio.it.com' : `${protocol}://${host}`;

    const redirect_url = `${serverOrigin}/api/payment/zinipay/redirect?order_id=${order._id}`;
    const cancel_url = `${serverOrigin}/api/payment/zinipay/redirect?order_id=${order._id}&status=cancelled`;
    const webhook_url = `${serverOrigin}/api/payment/zinipay/webhook`;

    const payload = {
      cus_name: user.name || 'Zenivio User',
      cus_email: user.phoneOrEmail && user.phoneOrEmail.includes('@') ? user.phoneOrEmail : 'user@zenivio.it.com',
      amount: Number(amount),
      metadata: {
        order_id: order._id.toString(),
        user_id: user._id.toString()
      },
      redirect_url,
      cancel_url,
      webhook_url
    };

    console.log('Sending ZiniPay Create Invoice Request:', `${baseUrl}/v1/payment/create`, payload);

    const response = await fetch(`${baseUrl}/v1/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'zini-api-key': apiKey,
        'zinipay-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('ZiniPay Create Invoice Response:', data);

    if (data && (data.status === true || data.payment_url)) {
      // Extract invoice_id if possible
      let invoiceId = '';
      if (data.payment_url) {
        const parts = data.payment_url.split('/');
        invoiceId = parts[parts.length - 1];
      }
      if (data.invoice_id) invoiceId = data.invoice_id;

      if (invoiceId) {
        order.zinipayInvoiceId = invoiceId;
        await order.save();
      }

      return res.json({
        success: true,
        message: data.message || 'Invoice created successfully',
        payment_url: data.payment_url,
        orderId: order._id,
        invoiceId
      });
    } else {
      return res.status(400).json({
        message: data.message || 'Failed to create ZiniPay invoice',
        error: data
      });
    }
  } catch (err) {
    console.error('ZiniPay Create Invoice Error:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

// ─── Verification Helper ──────────────────────────────────────────────────
const verifyZiniPayInvoice = async (invoice_id, order_id = null) => {
  try {
    const settings = await GlobalSetting.findOne({ configKey: 'main_config' });
    const apiKey = (settings && settings.zinipayApiKey) ? settings.zinipayApiKey : 'sandbox_test_8f4c9a2e7b31';
    const baseUrl = (settings && settings.zinipayBaseUrl) ? settings.zinipayBaseUrl.replace(/\/+$/, '') : 'https://api.zinipay.com';

    console.log(`Verifying ZiniPay Invoice ${invoice_id} at ${baseUrl}/v1/payment/verify`);

    const response = await fetch(`${baseUrl}/v1/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'zini-api-key': apiKey,
        'zinipay-api-key': apiKey
      },
      body: JSON.stringify({ invoice_id })
    });

    const data = await response.json();
    console.log('ZiniPay Verify Response:', data);

    // Check status: 'COMPLETED' or status === true
    const isCompleted = (data && (data.status === 'COMPLETED' || data.status === 'completed' || data.status === true || data.payment_status === 'COMPLETED'));

    if (isCompleted) {
      let order = null;
      if (order_id) {
        order = await PremiumOrder.findById(order_id);
      }
      if (!order && invoice_id) {
        order = await PremiumOrder.findOne({ zinipayInvoiceId: invoice_id });
      }

      if (order) {
        if (order.status !== 'approved' && order.status !== 'completed') {
          order.status = 'approved';
          order.transactionId = data.transaction_id || data.trx_id || data.invoice_id || invoice_id;
          await order.save();

          // Activate subscription
          await activateOrderSubscription(order);
        }
        return { success: true, verified: true, order, data };
      }
    }

    return { success: false, verified: false, data };
  } catch (err) {
    console.error('verifyZiniPayInvoice Error:', err);
    return { success: false, error: err.message };
  }
};

// ─── 2. Handle Redirect Endpoint ───────────────────────────────────────────
exports.handleRedirect = async (req, res) => {
  try {
    const invoice_id = req.query.invoice_id || req.body?.invoice_id;
    const order_id = req.query.order_id || req.body?.order_id;
    const statusParam = req.query.status || req.body?.status;

    console.log('ZiniPay Redirect Called:', { invoice_id, order_id, statusParam, query: req.query });

    if (invoice_id) {
      await verifyZiniPayInvoice(invoice_id, order_id);
    } else if (order_id && statusParam !== 'cancelled') {
      const order = await PremiumOrder.findById(order_id);
      if (order && order.zinipayInvoiceId) {
        await verifyZiniPayInvoice(order.zinipayInvoiceId, order_id);
      }
    }

    // Redirect user back to web app with payment status flag
    return res.redirect(`https://zenivio.it.com/?payment_status=completed&invoice_id=${invoice_id || ''}`);
  } catch (err) {
    console.error('ZiniPay Redirect Error:', err);
    return res.redirect(`https://zenivio.it.com/?payment_status=error`);
  }
};

// ─── 3. Handle Webhook Endpoint ────────────────────────────────────────────
exports.handleWebhook = async (req, res) => {
  try {
    const invoice_id = req.body?.invoice_id || req.query?.invoice_id;
    console.log('ZiniPay Webhook Triggered:', { body: req.body, query: req.query });

    if (!invoice_id) {
      return res.status(400).json({ message: 'Missing invoice_id' });
    }

    const result = await verifyZiniPayInvoice(invoice_id);
    return res.json({ status: true, message: 'Webhook processed', result });
  } catch (err) {
    console.error('ZiniPay Webhook Error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// ─── 4. Check Status ───────────────────────────────────────────────────────
exports.checkStatus = async (req, res) => {
  try {
    const { orderId, invoiceId } = req.body;
    let order = null;

    if (orderId) order = await PremiumOrder.findById(orderId);
    if (!order && invoiceId) order = await PremiumOrder.findOne({ zinipayInvoiceId: invoiceId });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'approved' || order.status === 'completed') {
      return res.json({ status: 'completed', isPremium: true, order });
    }

    const targetInvoiceId = invoiceId || order.zinipayInvoiceId;
    if (targetInvoiceId) {
      const verifyRes = await verifyZiniPayInvoice(targetInvoiceId, order._id);
      if (verifyRes.success) {
        return res.json({ status: 'completed', isPremium: true, order: verifyRes.order });
      }
    }

    return res.json({ status: order.status, isPremium: false, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
