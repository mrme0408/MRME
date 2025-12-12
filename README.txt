
MR_LEON_PRO_PACKAGE
-------------------
Files included:
- index.html
- dashboard.html
- admin.html
- verify.html
- payment-success.html
- styles.css
- script.js
- README.txt

Quick start:
1. Upload all files to your GitHub Pages repository (root or docs folder).
2. Replace Razorpay test key in script.js (search for 'rzp_test_your_key_here') with your test/live key.
3. For production payments: implement a server that creates Razorpay orders with your RAZORPAY_SECRET and verifies signatures (example stub provided below in this README).
4. For real auth & storage: replace client-side auth with Firebase Authentication + Firestore. I can provide exact code for that next.

Serverless Razorpay example (Node.js/Express)
--------------------------------------------
const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const razorpay = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_KEY_SECRET' });

app.post('/create-order', async (req, res) => {
  const { amount, currency='INR', receipt='rcptid_1' } = req.body;
  try {
    const order = await razorpay.orders.create({ amount, currency, receipt });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// verify signature endpoint would go here

Start server and call /create-order from the client to get order_id, then pass order_id to Razorpay options.
