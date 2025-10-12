// =======================================
// Floating Aether Shards Effect
// =======================================
const shardsContainer = document.getElementById('shards-container');
for (let i = 0; i < 30; i++) {
  const shard = document.createElement('div');
  shard.className = 'shard';
  shard.style.left = Math.random() * window.innerWidth + 'px';
  shard.style.top = Math.random() * window.innerHeight + 'px';
  shard.style.width = 8 + Math.random() * 12 + 'px';
  shard.style.height = shard.style.width;
  shard.style.animationDuration = 6 + Math.random() * 10 + 's';
  shardsContainer.appendChild(shard);
}

// =======================================
// Tabs
// =======================================
const tabs = document.querySelectorAll('nav .tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    contents.forEach(c => {
      c.classList.remove('active');
      c.querySelectorAll('h2, p').forEach(el => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      });
    });
    document.getElementById(target).classList.add('active');
  });
});

// =======================================
// Background Music
// =======================================
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const barsContainer = document.getElementById('bars');

music.muted = true;
music.load();

document.body.addEventListener('click', () => {
  if (music.paused) {
    music.muted = false;
    music.play().catch(err => console.log('Music play error:', err));
  }
}, { once: true });

musicToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  music.muted = !music.muted;
});

for (let i = 0; i < 4; i++) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", 15 + i * 8);
  line.setAttribute("y1", 15);
  line.setAttribute("x2", 15 + i * 8);
  line.setAttribute("y2", 35);
  barsContainer.appendChild(line);
}

setInterval(() => {
  const lines = barsContainer.querySelectorAll("line");
  lines.forEach(line => {
    const height = 10 + Math.random() * 15;
    line.setAttribute("y1", 25 - height / 2);
    line.setAttribute("y2", 25 + height / 2);
  });
}, 300);

// =======================================
// UI Modals (Login / Redeem / Quests)
// =======================================
const loginModal = document.getElementById('login-modal');
const redeemModal = document.getElementById('redeem-modal');
const questModal = document.getElementById('quest-modal');
const overlay = document.getElementById('overlay');

function openModal(modal) {
  modal.classList.add('active');
  overlay.classList.add('active');
}
function closeModal(modal) {
  modal.classList.remove('active');
  overlay.classList.remove('active');
}

overlay.addEventListener('click', () => {
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  overlay.classList.remove('active');
});

// =======================================
// Login System
// =======================================
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const shardIcon = document.getElementById('aether-shard-icon');
const loginMsg = document.getElementById('login-msg');

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('azyrnyxUser'));
}

function setCurrentUser(username) {
  localStorage.setItem('azyrnyxUser', JSON.stringify({ username }));
}

function clearCurrentUser() {
  localStorage.removeItem('azyrnyxUser');
}

shardIcon.addEventListener('click', () => {
  const user = getCurrentUser();
  if (!user) {
    openModal(loginModal);
  } else {
    openModal(redeemModal);
  }
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (username && password) {
    setCurrentUser(username);
    loginMsg.textContent = `✨ Welcome, ${username}!`;
    closeModal(loginModal);
  } else {
    loginMsg.textContent = `⚠️ Please enter both username & password.`;
  }
});

logoutBtn.addEventListener('click', () => {
  clearCurrentUser();
  loginMsg.textContent = `Logged out successfully.`;
});

// =======================================
// Redeem Code System
// =======================================
const redeemForm = document.getElementById('redeem-form');
const redeemMsg = document.getElementById('redeem-msg');
const redeemCodeInput = document.getElementById('redeem-code');

redeemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = redeemCodeInput.value.trim();
  const user = getCurrentUser();
  if (!user) {
    redeemMsg.textContent = '⚠️ Please log in first.';
    return;
  }

  try {
    const res = await fetch('https://azyrnyx-backend.onrender.com/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, code })
    });

    const data = await res.json();
    if (res.ok) {
      redeemMsg.textContent = `✅ ${data.message}`;
      redeemCodeInput.value = '';
    } else {
      redeemMsg.textContent = `❌ ${data.message}`;
    }
  } catch (err) {
    redeemMsg.textContent = '❌ Error connecting to server.';
  }
});

// =======================================
// Daily Quest System
// =======================================
const questBtn = document.querySelector('.view-quests-btn');
const questContent = document.getElementById('quest-content');
const questMsg = document.getElementById('quest-msg');

questBtn.addEventListener('click', () => {
  generateQuest();
  openModal(questModal);
});

function generateQuest() {
  const puzzles = [
    "Solve this riddle: I have keys but no locks. What am I?",
    "Unscramble this word: 'EHTRAE'",
    "What's 15 × 3 + 7 ?",
    "What color do you get when you mix blue and yellow?"
  ];
  const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  questContent.textContent = puzzle;
}

document.getElementById('quest-complete-btn').addEventListener('click', () => {
  questMsg.textContent = '✅ Quest completed! +30 Shards rewarded.';
  closeModal(questModal);
});
