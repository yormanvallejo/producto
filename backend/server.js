const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Database Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      // Replace with your DB user
  password: 'password', // Replace with your DB password
  database: 'treinta_pos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- Categories ---
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/categories', async (req, res) => {
  const { id, name, description } = req.body;
  const newId = id || uuidv4();
  try {
    await pool.query('INSERT INTO categories (id, name, description) VALUES (?, ?, ?)', [newId, name, description]);
    res.json({ id: newId, name, description });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Products ---
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    // Convert numeric strings back to numbers if necessary
    const products = rows.map(p => ({...p, price: Number(p.price), cost: Number(p.cost), stock: Number(p.stock)}));
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', async (req, res) => {
  const p = req.body;
  const newId = p.id || uuidv4();
  try {
    const sql = `INSERT INTO products (id, name, category, price, cost, stock, unit, sku, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, category=?, price=?, cost=?, stock=?, unit=?, sku=?, image=?`;
    const values = [newId, p.name, p.category, p.price, p.cost, p.stock, p.unit, p.sku, p.image, p.name, p.category, p.price, p.cost, p.stock, p.unit, p.sku, p.image];
    await pool.query(sql, values);
    res.json({ ...p, id: newId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Sales (Orders) ---
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY date DESC');
    // Fetch items implies N+1, for simplicity in this example we might fetch separately or just fetch basic info
    // A production app would use JOINs.
    res.json(orders.map(o => ({...o, total: Number(o.total)})));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { items, paymentMethod, total, clientId } = req.body;
    const orderId = uuidv4();
    const date = new Date();

    // 1. Create Order
    await conn.query('INSERT INTO orders (id, date, total, payment_method, status, client_id) VALUES (?, ?, ?, ?, ?, ?)', 
      [orderId, date, total, paymentMethod, 'completed', clientId]);

    // 2. Items & Stock deduction
    for (const item of items) {
       await conn.query('INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
         [orderId, item.id, item.name, item.quantity, item.price]);
       
       await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
    }

    // 3. Update Client
    if (clientId) {
      await conn.query('UPDATE clients SET total_spent = total_spent + ?, visits = visits + 1 WHERE id = ?', [total, clientId]);
    }

    // 4. Transaction
    await conn.query('INSERT INTO transactions (id, date, type, category, amount, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uuidv4(), date, 'INCOME', 'Venta', total, `Venta #${orderId}`, orderId]);

    // 5. Cash Register
    if (paymentMethod === 'Efectivo') {
       await conn.query('UPDATE cash_register SET current_amount = current_amount + ?, expected_amount = expected_amount + ? WHERE is_open = TRUE ORDER BY id DESC LIMIT 1', [total, total]);
    }

    await conn.commit();
    res.json({ success: true, orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// --- Purchases ---
app.get('/api/purchases', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM purchases');
        const purchases = [];
        for(let row of rows) {
             const [items] = await pool.query('SELECT * FROM purchase_items WHERE purchase_id = ?', [row.id]);
             purchases.push({ ...row, items: items.map(i => ({...i, total: Number(i.total), cost: Number(i.cost)})) });
        }
        res.json(purchases);
    } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/purchases', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const { date, supplierId, supplierName, items, total } = req.body;
        const purchaseId = uuidv4();

        // 1. Create Purchase
        await conn.query('INSERT INTO purchases (id, date, supplier_id, supplier_name, total) VALUES (?, ?, ?, ?, ?)', 
          [purchaseId, new Date(date), supplierId, supplierName, total]);

        // 2. Items & Stock Addition
        for(const item of items) {
            await conn.query('INSERT INTO purchase_items (purchase_id, product_id, product_name, quantity, cost, total) VALUES (?, ?, ?, ?, ?, ?)',
              [purchaseId, item.productId, item.productName, item.quantity, item.cost, item.total]);
            
            // Update stock and cost price
            await conn.query('UPDATE products SET stock = stock + ?, cost = ? WHERE id = ?', 
               [item.quantity, item.cost, item.productId]);
        }

        // 3. Transaction
        await conn.query('INSERT INTO transactions (id, date, type, category, amount, description, reference_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [uuidv4(), new Date(date), 'EXPENSE', 'Compra de Inventario', total, `Compra a ${supplierName}`, purchaseId]);

        await conn.commit();
        res.json({ success: true, purchaseId });
    } catch(err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// --- Others (Clients, Suppliers, Transactions, CashRegister) ---
// Simplified endpoints for brevity
app.get('/api/clients', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM clients');
    res.json(rows.map(r => ({...r, totalSpent: Number(r.total_spent)})));
});

app.get('/api/suppliers', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM suppliers');
    res.json(rows);
});

app.get('/api/transactions', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM transactions');
    res.json(rows.map(r => ({...r, amount: Number(r.amount)})));
});

app.get('/api/cash-register', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM cash_register ORDER BY id DESC LIMIT 1');
    if (rows.length > 0) {
        const r = rows[0];
        res.json({
            isOpen: !!r.is_open,
            openedAt: r.opened_at,
            initialAmount: Number(r.initial_amount),
            currentAmount: Number(r.current_amount),
            expectedAmount: Number(r.expected_amount)
        });
    } else {
        res.json(null);
    }
});

app.post('/api/cash-register/toggle', async (req, res) => {
    const { amount, isOpen } = req.body;
    // Logic to insert new row for Open or update existing for Close would go here
    // For simplicity, just insert new open
    if (isOpen) {
        await pool.query('INSERT INTO cash_register (is_open, opened_at, initial_amount, current_amount, expected_amount) VALUES (1, NOW(), ?, ?, ?)', [amount, amount, amount]);
    } else {
        await pool.query('UPDATE cash_register SET is_open = 0 WHERE is_open = 1');
    }
    res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});