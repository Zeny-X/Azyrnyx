const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');
const overlay = document.getElementById('overlay');

const loginModal = document.getElementById('login-modal');
const redeemModal = document.getElementById('redeem-modal');
const questModal = document.getElementById('quest-modal');

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const redeemBtn = document.getElementById('redeem-btn');
const claimQuestBtn = document.getElementById('claim-quest-btn');

const loginMsg = document.getElementById('login-msg');
const redeemMsg = document.getElementById('redeem-msg');
const questMsg = document.getElementById('quest-msg');

const shardDisplay = document.getElementById('shards-display');
const shardsCount = document.getElementById('shards-count');

const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');

let loggedInUser = null;

// ========================
// Tabs Switching
// ========================
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// ========================
// Music Control
// ========================
musicToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
});

// ========================
// Show & Hide Modals
// ========================
function showModal(modal) {
  overlay.style.display = 'block';
  modal.style.display = 'block';
}

function hideModal(modal) {
  overlay.style.display = 'none';
  modal.style.display = 'none';
}

overlay.addEventListener('click', () => {
  [loginModal, redeemModal, questModal].forEach(m => hideModal(m));
});

// ========================
// Login System (Local Storage)
// ========================
loginBtn.addEventListener('click', () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (username === "testaccount" && password === "test1234") {
    loggedInUser = username;
    localStorage.setItem('azyrnyxUser', username);
    loginMsg.textContent = "Login successful!";
    logoutBtn.style.display = 'block';
    setTimeout(() => hideModal(loginModal), 1000);
  } else {
    loginMsg.textContent = "Login Failed: Invalid Username or Password";
  }
});

logoutBtn.addEventListener('click', () => {
  loggedInUser = null;
  localStorage.removeItem('azyrnyxUser');
  logoutBtn.style.display = 'none';
  shardsCount.textContent = "0 Aether Shards";
});

// Auto Login Check
window.addEventListener('load', () => {
  const savedUser = localStorage.getItem('azyrnyxUser');
  if (savedUser) {
    loggedInUser = savedUser;
    logoutBtn.style.display = 'block';
  }
});

// ========================
// Shards Click = Redeem or Login
// ========================
shardDisplay.addEventListener('click', () => {
  if (loggedInUser) {
    showModal(redeemModal);
  } else {
    showModal(loginModal);
  }
});

// ========================
// Redeem System
// ========================
redeemBtn.addEventListener('click', () => {
  const code = document.getElementById('redeem-code').value.trim();
  if (code === "ZENYXONTOP" || code === "MYSTICSHARD") {
    shardsCount.textContent = "200 Aether Shards";
    redeemMsg.textContent = "Code Redeemed!";
  } else {
    redeemMsg.textContent = "Invalid Code.";
  }
});

// ========================
// Quest Claim
// ========================
document.getElementById('open-quests').addEventListener('click', () => {
  if (loggedInUser) {
    showModal(questModal);
  } else {
    showModal(loginModal);
  }
});

claimQuestBtn.addEventListener('click', () => {
  questMsg.textContent = "You claimed 50 shards!";
  shardsCount.textContent = "250 Aether Shards";
  setTimeout(() => hideModal(questModal), 1000);
});
