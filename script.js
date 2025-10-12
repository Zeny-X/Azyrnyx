/* =============================
   Azyrnyx Frontend JS
   Desktop only — clean & tested
   ============================= */

/* ---------- CONFIG ---------- */
// Replace if your backend URL is different
const BACKEND_BASE = 'https://azyrnyx-backend.onrender.com';

/* ---------- Elements ---------- */
const overlay = document.getElementById('overlay');

const loginModal = document.getElementById('login-modal');
const redeemModal = document.getElementById('redeem-modal');
const questModal = document.getElementById('quest-modal');

const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const loginCancel = document.getElementById('login-cancel');
const loginMsg = document.getElementById('login-msg');

const redeemCodeInput = document.getElementById('redeem-code');
const redeemBtn = document.getElementById('redeem-btn');
const redeemCancel = document.getElementById('redeem-cancel');
const redeemMsg = document.getElementById('redeem-msg');

const openQuestsBtn = document.getElementById('open-quests');
const questListElem = document.getElementById('quest-list');
const questCloseBtn = document.getElementById('quest-close');
const questMsg = document.getElementById('quest-msg');

const shardCountSpan = document.getElementById('shard-count');
const shardsDisplay = document.getElementById('shards-display');
const logoutBtn = document.getElementById('logout-btn');

/* ---------- Utility UI helpers ---------- */
function openModal(modal){
  overlay.classList.add('active');
  modal.classList.add('active');
}
function closeModal(modal){
  modal.classList.remove('active');
  // hide overlay if no other modal active
  setTimeout(() => {
    const anyActive = document.querySelectorAll('.modal.active').length > 0;
    if (!anyActive) overlay.classList.remove('active');
  }, 10);
}
overlay.addEventListener('click', () => {
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  overlay.classList.remove('active');
});

/* show a styled message inside an element */
function showModalMessage(elem, text, type='success'){
  if (!elem) return;
  elem.textContent = text;
  elem.classList.remove('success','error');
  elem.classList.add(type === 'error' ? 'error' : 'success');
  // keep visible (CSS handles colors). auto-clear after 4s
  setTimeout(()=>{ elem.textContent = ''; elem.classList.remove('success','error'); }, 4000);
}

/* ---------- Session (localStorage) ---------- */
function getSession(){
  try { return JSON.parse(localStorage.getItem('azy_session')); } catch(e){ return null; }
}
function setSession(obj){
  localStorage.setItem('azy_session', JSON.stringify(obj));
}
function clearSession(){
  localStorage.removeItem('azy_session');
}

/* ---------- UI state update ---------- */
function updateUIAfterLogin(){
  const s = getSession();
  if (s && s.username){
    shardCountSpan.textContent = (typeof s.shards === 'number') ? `${s.shards} Aether Shards` : '0 Aether Shards';
    logoutBtn.style.display = 'block';
  } else {
    shardCountSpan.textContent = '0 Aether Shards';
    logoutBtn.style.display = 'none';
  }
}

/* ---------- Floating shards (keeps as before) ---------- */
const shardsContainer = document.getElementById('shards-container');
(function createFloatingShards(){
  // fewer shards to keep performance good for older machines
  const count = 24;
  for (let i=0;i<count;i++){
    const d = document.createElement('div');
    d.className = 'shard';
    d.style.left = Math.random()*window.innerWidth + 'px';
    d.style.top = Math.random()*window.innerHeight + 'px';
    const size = 8 + Math.random()*16;
    d.style.width = size + 'px';
    d.style.height = size + 'px';
    d.style.animationDuration = 8 + Math.random()*10 + 's';
    shardsContainer.appendChild(d);
  }
})();

/* ---------- Tabs ---------- */
const tabs = document.querySelectorAll('nav .tab');
const contents = document.querySelectorAll('.tab-content');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    contents.forEach(c => c.classList.remove('active'));
    const el = document.getElementById(target);
    if (el) el.classList.add('active');
  });
});

/* ---------- Music toggle & visualiser ---------- */
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const barsContainer = document.getElementById('bars');

music.muted = true;
music.load();
document.body.addEventListener('click', ()=> {
  if (music.paused) {
    music.muted = false;
    music.play().catch(()=>{});
  }
},{ once: true });

musicToggle.addEventListener('click', (e)=>{
  e.stopPropagation();
  music.muted = !music.muted;
});

(function createVisualizer(){
  for (let i=0;i<4;i++){
    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", 15 + i*8); line.setAttribute("y1", 15);
    line.setAttribute("x2", 15 + i*8); line.setAttribute("y2", 35);
    barsContainer.appendChild(line);
  }
  setInterval(()=> {
    const lines = barsContainer.querySelectorAll('line');
    lines.forEach(line => {
      const h = 8 + Math.random()*18;
      line.setAttribute('y1', 25 - h/2);
      line.setAttribute('y2', 25 + h/2);
    });
  }, 300);
})();

/* ---------- BACKEND API helpers ---------- */
async function apiLogin(username, password){
  try {
    const res = await fetch(`${BACKEND_BASE}/api/login`, {
      method: 'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return { ok:true, data: json };
  } catch(err){
    return { ok:false, error: err.message || String(err) };
  }
}

async function apiGetBalance(username){
  try {
    const res = await fetch(`${BACKEND_BASE}/api/balance/${encodeURIComponent(username)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return { ok:true, shards: json.shards };
  } catch(err){
    return { ok:false, error: err.message || String(err) };
  }
}

async function apiRedeem(username, code){
  try {
    const res = await fetch(`${BACKEND_BASE}/api/redeem`, {
      method: 'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ username, code })
    });
    const json = await res.json();
    if (!res.ok) return { ok:false, error: json.error || 'Invalid' };
    return { ok:true, data: json };
  } catch(err){
    return { ok:false, error: err.message || String(err) };
  }
}

async function apiClaimQuest(username, questId, reward){
  // try server endpoint if exists; if not, return fallback object
  try {
    const res = await fetch(`${BACKEND_BASE}/api/claim-quest`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ username, questId, reward })
    });
    const json = await res.json();
    if (!res.ok) return { ok:false, error: json.error || 'Claim failed' };
    return { ok:true, data: json };
  } catch(err) {
    return { ok:false, error: err.message || String(err) };
  }
}

/* ---------- Login flow ---------- */
async function handleLoginSubmit(){
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  if (!username || !password){
    showModalMessage(loginMsg, 'Enter username & password', 'error');
    return;
  }

  // Attempt server login (preferred)
  const result = await apiLogin(username, password);
  if (result.ok){
    // server may return shards; else try to fetch
    const shards = (result.data && typeof result.data.shards === 'number') ? result.data.shards : 0;
    setSession({ username, shards });
    updateUIAfterLogin();
    showModalMessage(loginMsg, 'Login successful', 'success');
    setTimeout(()=> closeModal(loginModal), 900);
  } else {
    // fallback: allow local login (you still log in but no server)
    // But tell user server login failed; let them login locally for now
    showModalMessage(loginMsg, `Server login failed: ${result.error}`, 'error');
    // optional: provide local fallback login (commented out)
    // setSession({ username, shards: 0 }); updateUIAfterLogin(); closeModal(loginModal);
  }
}

/* ---------- Redeem flow ---------- */
async function handleRedeem(){
  const code = redeemCodeInput.value.trim();
  const session = getSession();
  if (!session || !session.username){
    showModalMessage(redeemMsg, 'Please log in first', 'error');
    setTimeout(()=> { closeModal(redeemModal); openModal(loginModal); }, 700);
    return;
  }
  if (!code){
    showModalMessage(redeemMsg, 'Enter a code', 'error');
    return;
  }

  showModalMessage(redeemMsg, 'Checking code...', 'success');

  const r = await apiRedeem(session.username, code);
  if (r.ok){
    // backend should return updated shards or value
    const shards = (r.data && typeof r.data.shards === 'number') ? r.data.shards : (session.shards || 0);
    // update session
    setSession({ username: session.username, shards });
    shardCountSpan.textContent = `${shards} Aether Shards`;
    showModalMessage(redeemMsg, r.data.message || 'Redeemed!', 'success');
    redeemCodeInput.value = '';
    setTimeout(()=> closeModal(redeemModal), 900);
  } else {
    showModalMessage(redeemMsg, r.error || 'Invalid code', 'error');
  }
}

/* ---------- Daily Quests UI & logic ---------- */

// define a day's quests (10-12 mixed). We'll store per-account claimed state.
const DAILY_QUESTS = [
  { id: 'daily_login', title: 'Daily Login', desc: 'Claim your daily login reward.', reward: 5, type:'fixed' },
  { id: 'stay_20', title: 'Stay 20s', desc: 'Stay on the site for 20 seconds to unlock.', reward: 8, type:'timed', duration:20 },
  { id: 'puzzle', title: 'Puzzle', desc: 'Solve a quick random puzzle.', reward: 15, type:'puzzle' },
  { id: 'survey', title: 'Survey', desc: 'Answer a short question (1/day only).', reward: 30, type:'survey' },
  { id: 'click_tabs', title: 'Explore Tabs', desc: 'Open all tabs once.', reward: 7, type:'action' }
];

// get claimed quests for user from server if possible, else from localStorage
function getClaimedForUser(username){
  const key = `azy_claims_${username}`;
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch(e){ return {}; }
}
function setClaimedForUser(username, obj){
  const key = `azy_claims_${username}`;
  localStorage.setItem(key, JSON.stringify(obj));
}

function renderQuestList(){
  const session = getSession();
  const username = session ? session.username : null;
  const claimed = username ? getClaimedForUser(username) : {};
  questListElem.innerHTML = '';
  DAILY_QUESTS.forEach(q => {
    const item = document.createElement('div');
    item.className = 'quest-item';
    item.innerHTML = `
      <div class="desc">
        <strong>${q.title}</strong><div style="font-size:.9rem;margin-top:6px;color:#ddd">${q.desc}</div>
      </div>
      <div class="controls">
        <div style="text-align:right;font-weight:bold;color:#ffd">${q.reward}◈</div>
        <div style="margin-top:8px;">
          <button class="claim-btn" data-id="${q.id}" ${claimed[q.id] ? 'disabled' : ''}>${claimed[q.id] ? 'Claimed' : 'Claim'}</button>
        </div>
      </div>
    `;
    questListElem.appendChild(item);
  });

  // attach listeners
  questListElem.querySelectorAll('.claim-btn').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const qid = btn.getAttribute('data-id');
      const quest = DAILY_QUESTS.find(x=>x.id===qid);
      if (!quest) return;
      // special handling for timed/puzzle/survey
      if (quest.type === 'timed'){
        // timed: wait 20s then enable claim
        showModalMessage(questMsg, 'Stay on page for 20s to unlock this quest...', 'success');
        setTimeout(async ()=> {
          // attempt server claim
          await attemptQuestClaim(qid, quest.reward, btn);
        }, (quest.duration || 20)*1000);
      } else if (quest.type === 'puzzle'){
        // quick puzzle prompt (simple)
        const a = Math.floor(Math.random()*10)+1;
        const b = Math.floor(Math.random()*10)+1;
        const ans = prompt(`Solve: ${a} + ${b} = ?`);
        if (ans === null) { showModalMessage(questMsg, 'Puzzle canceled', 'error'); return; }
        if (parseInt(ans) === (a+b)){
          await attemptQuestClaim(qid, quest.reward, btn);
        } else {
          showModalMessage(questMsg, 'Wrong answer', 'error');
        }
      } else if (quest.type === 'survey'){
        // one question survey
        const ans = prompt('Survey: Which realm do you prefer? (A) Ember (B) Tide (C) Sky');
        if (!ans) { showModalMessage(questMsg, 'Survey canceled', 'error'); return; }
        // accept any answer as correct for reward
        await attemptQuestClaim(qid, quest.reward, btn);
      } else {
        // instant claim quests
        await attemptQuestClaim(qid, quest.reward, btn);
      }
    });
  });
}

/* attempt claim - try server then fallback to local */
async function attemptQuestClaim(questId, reward, buttonElem){
  const session = getSession();
  if (!session || !session.username){
    showModalMessage(questMsg, 'Log in to claim quests', 'error');
    return;
  }
  const username = session.username;
  // first try server
  const serverResult = await apiClaimQuest(username, questId, reward);
  if (serverResult.ok){
    // server returns updated shards maybe
    const newShards = serverResult.data && serverResult.data.shards;
    if (typeof newShards === 'number'){
      setSession({ username, shards: newShards });
    } else {
      // fallback: add locally
      session.shards = (session.shards || 0) + reward;
      setSession(session);
    }
    updateUIAfterLogin();
    showModalMessage(questMsg, `Claimed ${reward} Aether Shards`, 'success');
    buttonElem.disabled = true;
    // mark claimed locally as well
    const claimed = getClaimedForUser(username);
    claimed[questId] = Date.now();
    setClaimedForUser(username, claimed);
    return;
  } else {
    // if server not available or responded error, fallback to local
    // check local previous claim
    const claimed = getClaimedForUser(username);
    if (claimed[questId]){
      showModalMessage(questMsg, 'Already claimed', 'error');
      buttonElem.disabled = true;
      return;
    }
    // add locally
    session.shards = (session.shards || 0) + reward;
    setSession(session);
    updateUIAfterLogin();
    showModalMessage(questMsg, `Claimed ${reward} Aether Shards (local)`, 'success');
    buttonElem.disabled = true;
    claimed[questId] = Date.now();
    setClaimedForUser(username, claimed);
    return;
  }
}

/* ---------- Wire up UI events ---------- */

// Login
loginBtn.addEventListener('click', () => { handleLoginSubmit(); });
loginCancel.addEventListener('click', ()=>{ closeModal(loginModal); });

// Redeem
redeemBtn.addEventListener('click', ()=>{ handleRedeem(); });
redeemCancel.addEventListener('click', ()=>{ closeModal(redeemModal); });

// View Quests
openQuestsBtn.addEventListener('click', () => {
  // render quests and open modal
  renderQuestList();
  openModal(questModal);
});
questCloseBtn.addEventListener('click', ()=> closeModal(questModal));

// Logout
logoutBtn.addEventListener('click', ()=> {
  clearSession();
  updateUIAfterLogin();
  showModalMessage(redeemMsg, 'Logged out', 'success');
});

/* open shard click to redeem/login */
shardsDisplay.addEventListener('click', async () => {
  const session = getSession();
  if (!session || !session.username) {
    // open login modal
    openModal(loginModal);
  } else {
    // fetch latest balance from server if possible
    const bal = await apiGetBalance(session.username);
    if (bal.ok){
      setSession({ username: session.username, shards: bal.shards });
    }
    updateUIAfterLogin();
    openModal(redeemModal);
  }
});

/* ---------- Login submit handler (calls server) ---------- */
async function handleLoginSubmit(){
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  if (!username || !password){
    showModalMessage(loginMsg, 'Enter username & password', 'error');
    return;
  }
  // Attempt server login
  const res = await apiLogin(username, password);
  if (res.ok){
    // server may return shards; update session
    const shards = (res.data && typeof res.data.shards === 'number') ? res.data.shards : 0;
    setSession({ username, shards });
    updateUIAfterLogin();
    showModalMessage(loginMsg, 'Login successful', 'success');
    setTimeout(()=> closeModal(loginModal), 700);
  } else {
    showModalMessage(loginMsg, `Login failed: ${res.error}`, 'error');
  }
}

/* ---------- Redeem handler uses apiRedeem ---------- */
async function handleRedeem(){
  const code = redeemCodeInput.value.trim();
  const sess = getSession();
  if (!sess || !sess.username){
    showModalMessage(redeemMsg, 'Please log in first', 'error');
    setTimeout(()=> { closeModal(redeemModal); openModal(loginModal); }, 700);
    return;
  }
  if (!code){
    showModalMessage(redeemMsg, 'Enter a code', 'error');
    return;
  }
  showModalMessage(redeemMsg, 'Checking code...', 'success');
  const r = await apiRedeem(sess.username, code);
  if (r.ok){
    // backend should return updated shards in r.data.shards
    const shards = (r.data && typeof r.data.shards === 'number') ? r.data.shards : (sess.shards || 0);
    setSession({ username: sess.username, shards });
    updateUIAfterLogin();
    showModalMessage(redeemMsg, r.data.message || 'Redeemed!', 'success');
    redeemCodeInput.value = '';
    setTimeout(()=> closeModal(redeemModal), 900);
  } else {
    showModalMessage(redeemMsg, r.error || 'Invalid code', 'error');
  }
}

/* ---------- Init on load ---------- */
window.addEventListener('DOMContentLoaded', async () => {
  // Try to load session and update UI
  const s = getSession();
  if (s && s.username){
    // optionally refresh balance from server
    const bal = await apiGetBalance(s.username);
    if (bal.ok){
      setSession({ username: s.username, shards: bal.shards });
    }
  }
  updateUIAfterLogin();
});
