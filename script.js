// ============================
// Floating golden Aether Shards
// ============================
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

// ============================
// Tabs with animated content
// ============================
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

    const activeSection = document.getElementById(target);
    activeSection.classList.add('active');
  });
});

// ============================
// Background music control
// ============================
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const barsContainer = document.getElementById('bars');

music.muted = true;
music.load();

// Play on first user interaction
document.body.addEventListener('click', () => {
  if (music.paused) {
    music.muted = false;
    music.play().catch(err => console.log('Music play error:', err));
  }
}, { once: true });

// Toggle mute/unmute
musicToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  music.muted = !music.muted;
});

// Music visualiser bars
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

// ============================
// LOGIN & REDEEM MODALS
// ============================

// Create modal container
const modalContainer = document.createElement('div');
modalContainer.id = 'modal-container';
document.body.appendChild(modalContainer);

function showModal(contentHTML) {
  modalContainer.innerHTML = contentHTML;
  modalContainer.classList.add('active');
}

function closeModal() {
  modalContainer.classList.remove('active');
  setTimeout(() => { modalContainer.innerHTML = ''; }, 300);
}

// Overlay blur & vignette handled via CSS on #modal-container.active

// ============================
// Persistent login
// ============================
let currentUser = localStorage.getItem('azyUser') || null;

// Open modal when clicking on shards
const shardBalance = document.querySelector('.shards-balance');
shardBalance.addEventListener('click', () => {
  if (!currentUser) {
    showLoginModal();
  } else {
    showRedeemModal();
  }
});

function showLoginModal() {
  showModal(`
    <div class="modal-content">
      <h2>Login</h2>
      <input type="text" id="login-username" placeholder="Enter username">
      <div class="modal-message" id="login-msg"></div>
      <button id="login-btn">Login</button>
      <button class="close-btn" onclick="closeModal()">Cancel</button>
    </div>
  `);

  document.getElementById('login-btn').addEventListener('click', () => {
    const username = document.getElementById('login-username').value.trim();
    const msg = document.getElementById('login-msg');
    if (username.length < 1) {
      msg.textContent = "Please enter a username";
      msg.classList.add('error');
      return;
    }
    currentUser = username;
    localStorage.setItem('azyUser', username);
    msg.textContent = `Logged in as ${username}`;
    msg.classList.remove('error');
    msg.classList.add('success');

    setTimeout(() => {
      closeModal();
    }, 1500);
  });
}

function showRedeemModal() {
  showModal(`
    <div class="modal-content">
      <h2>Redeem Shards</h2>
      <input type="text" id="redeem-code" placeholder="Enter code">
      <div class="modal-message" id="redeem-msg"></div>
      <button id="redeem-btn">Redeem</button>
      <button class="close-btn" onclick="closeModal()">Close</button>
    </div>
  `);

  document.getElementById('redeem-btn').addEventListener('click', async () => {
    const code = document.getElementById('redeem-code').value.trim();
    const msg = document.getElementById('redeem-msg');

    if (!code) {
      msg.textContent = "Enter a code!";
      msg.classList.add('error');
      return;
    }

    try {
      const res = await fetch(`https://azyrnyx-backend.onrender.com/redeem?user=${currentUser}&code=${code}`);
      const data = await res.json();

      if (data.success) {
        // Update shards balance on page
        const balanceSpan = document.querySelector('.shards-balance span');
        let currentShards = parseInt(balanceSpan.textContent) || 0;
        balanceSpan.textContent = `${currentShards + data.amount} Aether Shards`;
        msg.textContent = data.message;
        msg.classList.remove('error');
        msg.classList.add('success');
      } else {
        msg.textContent = data.message;
        msg.classList.remove('success');
        msg.classList.add('error');
      }
    } catch (err) {
      msg.textContent = "Server error. Try again later.";
      msg.classList.remove('success');
      msg.classList.add('error');
    }
  });
}
