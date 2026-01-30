import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = join(__dirname, '.data');
const USERS_FILE = join(DATA_DIR, 'users.json');
const CATEGORIES_FILE = join(DATA_DIR, 'categories.json');
const ITEMS_FILE = join(DATA_DIR, 'items.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize default data
const initData = () => {
  if (!existsSync(CATEGORIES_FILE)) {
    const defaultCategories = [
      { id: '1', name: 'Financial Reporting', description: 'Financial statements, disclosures, and reporting requirements', color: '#dc2626', created_at: new Date().toISOString() },
      { id: '2', name: 'Tax Compliance', description: 'Tax filings, payments, and regulatory tax requirements', color: '#dc2626', created_at: new Date().toISOString() },
      { id: '3', name: 'Audit & Controls', description: 'Internal controls, audit requirements, and risk management', color: '#000000', created_at: new Date().toISOString() },
      { id: '4', name: 'Regulatory Compliance', description: 'Banking regulations, SOX, GAAP, and other financial regulations', color: '#dc2626', created_at: new Date().toISOString() },
      { id: '5', name: 'Budget & Forecasting', description: 'Budget compliance, forecasting accuracy, and variance analysis', color: '#000000', created_at: new Date().toISOString() },
      { id: '6', name: 'Accounts Payable/Receivable', description: 'AP/AR processes, payment terms, and collection compliance', color: '#dc2626', created_at: new Date().toISOString() },
      { id: '7', name: 'Capital Management', description: 'Capital allocation, debt compliance, and liquidity requirements', color: '#000000', created_at: new Date().toISOString() },
    ];
    writeFileSync(CATEGORIES_FILE, JSON.stringify(defaultCategories, null, 2));
  }
  if (!existsSync(USERS_FILE)) {
    writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!existsSync(ITEMS_FILE)) {
    writeFileSync(ITEMS_FILE, JSON.stringify([], null, 2));
  }
};

initData();

// Helper functions
const readJSON = (file) => {
  try {
    const data = readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeJSON = (file, data) => {
  writeFileSync(file, JSON.stringify(data, null, 2));
};

// Middleware
app.use(cors());
app.use(express.json());

// Simple session storage (in-memory for demo)
const sessions = new Map();

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = sessions.get(token);
  next();
};

// Auth routes
app.post('/auth/v1/signup', async (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS_FILE);
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const user = {
    id: `user_${Date.now()}`,
    email,
    created_at: new Date().toISOString(),
  };

  users.push({ ...user, password }); // In production, hash password
  writeJSON(USERS_FILE, users);

  const token = `token_${Date.now()}_${Math.random()}`;
  sessions.set(token, user);

  res.json({
    user,
    session: { access_token: token, user },
  });
});

app.post('/auth/v1/token', async (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = `token_${Date.now()}_${Math.random()}`;
  sessions.set(token, { id: user.id, email: user.email });

  res.json({
    user: { id: user.id, email: user.email, created_at: user.created_at },
    session: { access_token: token, user: { id: user.id, email: user.email } },
  });
});

app.post('/auth/v1/logout', authenticate, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  sessions.delete(token);
  res.json({ message: 'Logged out' });
});

app.get('/auth/v1/user', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Categories routes
app.get('/rest/v1/compliance_categories', authenticate, (req, res) => {
  const categories = readJSON(CATEGORIES_FILE);
  res.json(categories);
});

app.post('/rest/v1/compliance_categories', authenticate, (req, res) => {
  const categories = readJSON(CATEGORIES_FILE);
  const newCategory = {
    id: `cat_${Date.now()}`,
    ...req.body,
    created_at: new Date().toISOString(),
  };
  categories.push(newCategory);
  writeJSON(CATEGORIES_FILE, categories);
  res.json(newCategory);
});

// Compliance items routes
app.get('/rest/v1/compliance_items', authenticate, (req, res) => {
  const items = readJSON(ITEMS_FILE);
  const userItems = items.filter(item => item.user_id === req.user.id);
  
  // Join with categories
  const categories = readJSON(CATEGORIES_FILE);
  const enriched = userItems.map(item => ({
    ...item,
    compliance_categories: categories.find(cat => cat.id === item.category_id) || null,
  }));

  res.json(enriched);
});

app.post('/rest/v1/compliance_items', authenticate, (req, res) => {
  const items = readJSON(ITEMS_FILE);
  const newItem = {
    id: `item_${Date.now()}`,
    user_id: req.user.id,
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  items.push(newItem);
  writeJSON(ITEMS_FILE, items);
  res.json(newItem);
});

app.patch('/rest/v1/compliance_items', authenticate, (req, res) => {
  const { id, ...updates } = req.body;
  const items = readJSON(ITEMS_FILE);
  const index = items.findIndex(item => item.id === id && item.user_id === req.user.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  items[index] = {
    ...items[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  writeJSON(ITEMS_FILE, items);
  res.json(items[index]);
});

app.delete('/rest/v1/compliance_items', authenticate, (req, res) => {
  const { id } = req.query;
  const items = readJSON(ITEMS_FILE);
  const filtered = items.filter(item => !(item.id === id && item.user_id === req.user.id));
  writeJSON(ITEMS_FILE, filtered);
  res.json({ message: 'Deleted' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/rest/v1/`);
});
