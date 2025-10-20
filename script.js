// -------------------------------
// Azyrnyx frontend script.js
// Desktop only — integrated with backend
// -------------------------------

/* ======== CONFIG ======== */
const BACKEND_BASE = 'https://azyrnyx-backend.onrender.com'; // change if needed

/* ======== ELEMENTS ======== */
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

const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const barsContainer = document.getElementById('bars');

/* ======== UTIL ======== */
function openModal(modal){
  overlay.classList.add('active');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal(modal){
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  setTimeout(()=>{
    const any = document.querySelectorAll('.modal.active').length > 0;
    if (!any) overlay.classList.remove('active');
  }, 10);
}
overlay.addEventListener('click', ()=> {
  document.querySelectorAll('.modal.active').forEach(m => closeModal(m));
});

/* show temporary styled message in modal elements */
function showModalMessage(el, text, type='success'){
  if(!el) return;
  el.textContent = text;
  el.classList.remove('success','error');
  el.classList.add(type === 'error' ? 'error' : 'success');
  // clear after 3.5s
  setTimeout(()=> { el.textContent = ''; el.classList.remove('success','error'); }, 3500);
}

/* ======== Session helpers (localStorage) ======== */
function getSession(){ try { return JSON.parse(localStorage.getItem('azy_session')); } catch(e) { return null; } }
function setSession(obj){ localStorage.setItem('azy_session', JSON.stringify(obj)); }
function clearSession(){ localStorage.removeItem('azy_session'); }

/* update shards UI */
function updateUIAfterLogin(){
  const s = getSession();
  if (s && s.username){
    shardCountSpan.textContent = `${s.shards || 0} Aether Shards`;
    logoutBtn.style.display = 'block';
  } else {
    shardCountSpan.textContent = '0 Aether Shards';
    logoutBtn.style.display = 'none';
  }
}

/* ======== Floating shards (light) ======== */
(function spawnShards(){
  const container = document.getElementById('shards-container');
  const COUNT = 24;
  for (let i=0;i<COUNT;i++){
    const d = document.createElement('div');
    d.className = 'shard';
    d.style.left = Math.random() * window.innerWidth + 'px';
    d.style.top = Math.random() * window.innerHeight + 'px';
    const size = 8 + Math.random() * 16;
    d.style.width = d.style.height = size + 'px';
    d.style.animationDuration = (8 + Math.random()*10) + 's';
    container.appendChild(d);
  }
})();

/* ======== Tabs ======== */
const tabs = document.querySelectorAll('nav .tab');
const contents = document.querySelectorAll('.tab-content');
tabs.forEach(tab => {
  tab.addEventListener('click', ()=> {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.getAttribute('data-tab');
    contents.forEach(c => c.classList.remove('active'));
    const el = document.getElementById(target);
    if (el) el.classList.add('active');
  });
});

/* ======== Music toggle + visualizer ======== */
music.muted = true;
music.load();
document.body.addEventListener('click', ()=> {
  if (music.paused) music.play().catch(()=>{});
}, { once: true });

musicToggle.addEventListener('click', (e)=> {
  e.stopPropagation();
  music.muted = !music.muted;
});

/* bars */
(function createVisualizer(){
  for (let i=0;i<4;i++){
    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", 15 + i*8);
    line.setAttribute("y1", 15);
    line.setAttribute("x2", 15 + i*8);
    line.setAttribute("y2", 35);
    barsContainer.appendChild(line);
  }
  setInterval(()=> {
    const lines = barsContainer.querySelectorAll('line');
    lines.forEach(line => {
      const h = 10 + Math.random()*18;
      line.setAttribute('y1', 25 - h/2);
      line.setAttribute('y2', 25 + h/2);
    });
  }, 300);
})();

/* ======== Backend API helpers ======== */
async function apiLogin(username, password){
  try {
    const r = await fetch(`${BACKEND_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ username, password })
    });
    const j = await r.json();
    if (!r.ok) return { ok:false, error: j.error || j.message || 'Login failed' };
    return { ok:true, data: j };
  } catch(err) {
    return { ok:false, error: err.message || 'Network error' };
  }
}

async function apiGetBalance(username, token){
  try {
    const r = await fetch(`${BACKEND_BASE}/api/balance`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ username, token })
    });
    const j = await r.json();
    if (!r.ok) return { ok:false, error: j.error || 'Failed' };
    return { ok:true, shards: j.shards };
  } catch(err) {
    return { ok:false, error: err.message || 'Network' };
  }
}

async function apiRedeem(username, token, code){
  try {
    const r = await fetch(`${BACKEND_BASE}/api/redeem`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ username, token, code })
    });
    const j = await r.json();
    if (!r.ok) return { ok:false, error: j.error || j.message || 'Invalid' };
    return { ok:true, data: j };
  } catch(err) { return { ok:false, error: err.message || 'Network' }; }
}

async function apiClaimQuest(username, token, questId, reward){
  try {
    const r = await fetch(`${BACKEND_BASE}/api/claim-quest`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ username, token, questId, reward })
    });
    const j = await r.json();
    if (!r.ok) return { ok:false, error: j.error || j.message || 'Claim failed' };
    return { ok:true, data: j };
  } catch(err) { return { ok:false, error: err.message || 'Network' }; }
}

/* ======== Login flow ======== */
async function handleLoginSubmit(){
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  if (!username || !password) { showModalMessage(loginMsg, 'Enter username & password', 'error'); return; }

  const res = await apiLogin(username, password);
  if (res.ok){
    // server returns token & shards
    const token = res.data.token || null;
    const shards = (typeof res.data.shards === 'number') ? res.data.shards : 0;
    setSession({ username, token, shards });
    updateUIAfterLogin();
    showModalMessage(loginMsg, 'Login successful', 'success');
    setTimeout(()=> closeModal(loginModal), 700);
  } else {
    showModalMessage(loginMsg, `Login failed: ${res.error}`, 'error');
  }
}

/* ======== Redeem flow ======== */
async function handleRedeem(){
  const code = redeemCodeInput.value.trim();
  const session = getSession();
  if (!session || !session.username || !session.token) { showModalMessage(redeemMsg, 'Please log in first', 'error'); setTimeout(()=>{ closeModal(redeemModal); openModal(loginModal); },700); return; }
  if (!code) { showModalMessage(redeemMsg, 'Enter a code', 'error'); return; }

  showModalMessage(redeemMsg, 'Checking code...', 'success');
  const r = await apiRedeem(session.username, session.token, code);
  if (r.ok){
    const shards = (r.data && typeof r.data.shards === 'number') ? r.data.shards : (session.shards || 0);
    setSession({ username: session.username, token: session.token, shards });
    updateUIAfterLogin();
    showModalMessage(redeemMsg, r.data.message || 'Redeemed!', 'success');
    redeemCodeInput.value = '';
    setTimeout(()=> closeModal(redeemModal), 900);
  } else {
    showModalMessage(redeemMsg, r.error || 'Invalid code', 'error');
  }
}

/* ======== Daily quests ======== */
const DAILY_QUESTS = [
  { id:'daily_login', title:'Daily Login', desc:'Claim your daily login reward', reward:5, type:'instant' },
  { id:'stay_20', title:'Stay 20s', desc:'Stay on the page for 20 seconds', reward:8, type:'timed', duration:20 },
  { id:'puzzle', title:'Puzzle', desc:'Solve a quick puzzle', reward:15, type:'puzzle' },
  { id:'survey', title:'Survey', desc:'Answer a short survey (1/day)', reward:30, type:'survey' },
  { id:'tabs_explore', title:'Explore Tabs', desc:'Open all tabs once', reward:7, type:'action' }
];

function getClaimedLocal(username){ try { return JSON.parse(localStorage.getItem(`azy_claims_${username}`)) || {}; } catch(e){ return {}; } }
function setClaimedLocal(username, obj){ localStorage.setItem(`azy_claims_${username}`, JSON.stringify(obj)); }

function renderQuestList(){
  const session = getSession();
  const username = session ? session.username : null;
  const claimed = username ? getClaimedLocal(username) : {};
  questListElem.innerHTML = '';
  DAILY_QUESTS.forEach(q => {
    const item = document.createElement('div');
    item.className = 'quest-item';
    const done = !!claimed[q.id];
    item.innerHTML = `
      <div class="desc"><strong>${q.title}</strong><div style="font-size:.9rem;margin-top:6px;color:#ddd">${q.desc}</div></div>
      <div style="text-align:right"><div style="font-weight:bold;color:#ffd">${q.reward} ◈</div>
        <div style="margin-top:8px;"><button class="quest-claim-btn" data-id="${q.id}" ${done ? 'disabled' : ''}>${done ? 'Claimed' : 'Claim'}</button></div></div>`;
    questListElem.appendChild(item);
  });

  questListElem.querySelectorAll('.quest-claim-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const qid = btn.dataset.id;
      const q = DAILY_QUESTS.find(x=>x.id===qid);
      if (!q) return;
      if (q.type === 'timed'){
        showModalMessage(questMsg, `Stay here for ${q.duration} seconds...`, 'success');
        setTimeout(async ()=> { await attemptQuestClaim(qid, q.reward, btn); }, (q.duration||20)*1000);
      } else if (q.type === 'puzzle'){
        const a = Math.floor(Math.random()*10)+1;
        const b = Math.floor(Math.random()*10)+1;
        const ans = prompt(`Solve: ${a} + ${b} = ?`);
        if (ans === null){ showModalMessage(questMsg, 'Canceled', 'error'); return; }
        if (parseInt(ans) === (a+b)) await attemptQuestClaim(qid, q.reward, btn); else showModalMessage(questMsg, 'Wrong answer', 'error');
      } else if (q.type === 'survey'){
        const res = prompt('Survey: Which realm do you prefer? (A/B/C)');
        if (!res){ showModalMessage(questMsg, 'Canceled', 'error'); return; }
        await attemptQuestClaim(qid, q.reward, btn);
      } else {
        await attemptQuestClaim(qid, q.reward, btn);
      }
    });
  });
}

async function attemptQuestClaim(questId, reward, btnElem){
  const sess = getSession();
  if (!sess || !sess.username || !sess.token){ showModalMessage(questMsg, 'Log in to claim', 'error'); return; }
  // try server
  const r = await apiClaimQuest(sess.username, sess.token, questId, reward);
  if (r.ok){
    const shards = (r.data
