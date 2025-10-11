// server.js
const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;

// Enable JSON parsing and CORS
app.use(express.json());
app.use(cors());

// Load or create database file
const DB_FILE = './users.json';
let users = {};
if (fs.existsSync(DB_FILE)) {
  users = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
} else {
  fs.writeFileSync(DB_FILE, JSON.stringify(users));
}

// Helper: Save users to file
function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

// =========================
// Signup endpoint
// =========================
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  if (users[username]) return res.status(400).json({ error: 'Username already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const token = crypto.randomBytes(16).toString('hex');

  users[username] = {
    password: hashedPassword,
    token,
    shards: 0,
    quests: {},
    redeemedCodes: []
  };
  saveDB();
  res.json({ message: 'Signup successful', token });
});

// =========================
// Login endpoint
// =========================
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user) return res.status(400).json({ error: 'User not found' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });

  // Generate new session token
  const token = crypto.randomBytes(16).toString('hex');
  user.token = token;
  saveDB();
  res.json({ message: 'Login successful', token, shards: user.shards, quests: user.quests });
});

// =========================
// Middleware: Authenticate by token
// =========================
function authMiddleware(req, res, next) {
  const { username, token } = req.body;
  if (!username || !token) return res.status(400).json({ error: 'Missing username or token' });
  const user = users[username];
  if (!user || user.token !== token) return res.status(403).json({ error: 'Invalid token' });
  req.user = user;
  next();
}

// =========================
// Get user data
// =========================
app.post('/userdata', authMiddleware, (req, res) => {
  const user = req.user;
  res.json({ shards: user.shards, quests: user.quests, redeemedCodes: user.redeemedCodes });
});

// =========================
// Claim quest
// =========================
app.post('/claim-quest', authMiddleware, (req, res) => {
  const { questId, reward } = req.body;
  if (!questId || !reward) return res.status(400).json({ error: 'Missing questId or reward' });

  const user = req.user;

  // Check if quest already claimed
  const lastClaim = user.quests[questId];
  const now = Date.now();
  if (lastClaim && now - lastClaim < 12 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'Quest already claimed or still active' });
  }

  // Update user data
  user.shards += reward;
  user.quests[questId] = now;
  saveDB();
  res.json({ message: 'Quest claimed!', shards: user.shards });
});

// =========================
// Redeem code
// =========================
const validCodes = {
  "AZYR30": 30,
  "WELCOME10": 10,
  "BONUS5": 5
};

app.post('/redeem-code', authMiddleware, (req, res) => {
  const { code } = req.body;
  const user = req.user;

  if (!code || !validCodes[code]) return res.status(400).json({ error: 'Invalid code' });
  if (user.redeemedCodes.includes(code)) return res.status(400).json({ error: 'Code already used' });

  const reward = validCodes[code];
  user.shards += reward;
  user.redeemedCodes.push(code);
  saveDB();
  res.json({ message: `Code redeemed! You earned ${reward} shards`, shards: user.shards });
});

// =========================
// Start server
// =========================
app.listen(PORT, () => {
  console.log(`Azyrnyx backend running on port ${PORT}`);
});
