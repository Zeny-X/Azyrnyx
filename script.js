// ---------- Config ----------
const BACKEND_BASE = 'https://azyrnyx-backend.onrender.com'; // change if different

// ---------- Elements ----------
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

// ---------- UI helpers ----------
function openModal(modal){
  overlay.classList.add('active');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden','false');
}
function closeModal(modal){
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden','true');
  setTimeout(()=>{ if (!document.querySelector('.modal.active')) overlay.classList.remove('active'); }, 10);
}
overlay.addEventListener('click', ()=> {
  document.querySelectorAll('.modal.active').forEach(m=>closeModal(m));
});
function showModalMessage(el, text, type='success'){
  if (!el) return;
  el.textContent = text;
  el.classList.remove('success','error');
  el.classList.add(type==='error' ? 'error' : 'success');
  setTimeout(()=> { el.textContent=''; el.classList.remove('success','error'); }, 3500);
}

// ---------- Session storage ----------
function getSession(){ try{ return JSON.parse(localStorage.getItem('azy_session')); }catch(e){return null;} }
function setSession(obj){ localStorage.setItem('azy_session', JSON.stringify(obj)); }
function clearSession(){ localStorage.removeItem('azy_session'); }

// ---------- Update UI ----------
function updateUI(){
  const s = getSession();
  if (s && s.username){
    shardCountSpan.textContent = `${s.shards||0} Aether Shards`;
    logoutBtn.style.display = 'block';
  } else {
    shardCountSpan.textContent = '0 Aether Shards';
    logoutBtn.style.display = 'none';
  }
}

// ---------- Floating shards ----------
(function spawnShards(){
  const container = document.getElementById('shards-container');
  for (let i=0;i<26;i++){
    const d = document.createElement('div');
    d.className = 'shard';
    d.style.left = Math.random() * window.innerWidth + 'px';
    d.style.top = Math.random() * window.innerHeight + 'px';
    const size = 8 + Math.random()*16;
    d.style.width = d.style.height = size + 'px';
    d.style.animationDuration = (8 + Math.random()*10) + 's';
    container.appendChild(d);
  }
})();

// ---------- Tabs ----------
const tabs = document.querySelectorAll('nav .tab');
const contents = document.querySelectorAll('.tab-content');
tabs.forEach(tab => tab.addEventListener('click', ()=> {
  tabs.forEach(t=>t.classList.remove('active'));
  tab.classList.add('active');
  contents.forEach(c=>c.classList.remove('active'));
  const target = tab.getAttribute('data-tab');
  document.getElementById(target).classList.add('active');
}));

// ---------- Music visualiser & autoplay ----------
(function createVisualizer(){
  // create 4 bars inside #bars
  for (let i=0;i<4;i++){
    const ln = document.createElementNS("http://www.w3.org/2000/svg","line");
    ln.setAttribute('x1', 14 + i*8);
    ln.setAttribute('x2', 14 + i*8);
    ln.setAttribute('y1', 18);
    ln.setAttribute('y2', 32);
    barsContainer.appendChild(ln);
  }
  setInterval(()=> {
    const lines = barsContainer.querySelectorAll('line');
    lines.forEach(line => {
      const h = 6 + Math.random()*22;
      line.setAttribute('y1', 25 - h/2);
      line.setAttribute('y2', 25 + h/2);
    });
  }, 260);
})();

// ensure playback starts on first user interaction (most browsers require a gesture)
document.body.addEventListener('click', function _once(){
  document.body.removeEventListener('click', _once);
  music.play().catch(()=>{});
}, { once:true });

// toggle mute/unmute when clicking the visualiser
musicToggle.addEventListener('click', (e)=>{
  e.stopPropagation();
  music.muted = !music.muted;
});

// ---------- Backend API helpers ----------
async function api(path, body){
  try {
    const res = await fetch(`${BACKEND_BASE}${path}`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });
    const j = await res.json();
    return { ok: res.ok, json: j };
  } catch(e){
    return { ok:false, json:{ error: 'Network error' } };
  }
}

async function apiLogin(username, password){
  return await api('/api/login', { username, password });
}
async function apiRedeem(username, token, code){
  return await api('/api/redeem', { username, token, code });
}
async function apiBalance(username, token){
  return await api('/api/balance', { username, token });
}
async function apiClaimQuest(username, token, questId, reward){
  return await api('/api/claim-quest', { username, token, questId, reward });
}

// ---------- Login flow ----------
loginBtn.addEventListener('click', async ()=>{
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  if (!username || !password){ showModalMessage(loginMsg, 'Enter username & password', 'error'); return; }

  const res = await apiLogin(username, password);
  if (!res.ok){
    const err = res.json && (res.json.error || res.json.message) || 'Login failed';
    showModalMessage(loginMsg, `Login failed: ${err}`, 'error');
    return;
  }
  // success — server returns token & shards
  const token = res.json.token || null;
  const shards = typeof res.json.shards === 'number' ? res.json.shards : 0;
  setSession({ username, token, shards });
  updateUI();
  showModalMessage(loginMsg, 'Login successful', 'success');
  setTimeout(()=> closeModal(loginModal), 600);
});

// login cancel
loginCancel.addEventListener('click', ()=> closeModal(loginModal));

// logout
logoutBtn.addEventListener('click', ()=>{
  clearSession();
  updateUI();
  showModalMessage(redeemMsg, 'Logged out', 'success');
});

// ---------- Shards click -> login or redeem ----------
shardsDisplay.addEventListener('click', async ()=>{
  const s = getSession();
  if (!s || !s.username || !s.token){ openModal(loginModal); return; }
  // refresh balance
  const bal = await apiBalance(s.username, s.token);
  if (bal.ok){ setSession({ username: s.username, token: s.token, shards: bal.json.shards }); updateUI(); }
  openModal(redeemModal);
});

// redeem
redeemBtn.addEventListener('click', async ()=>{
  const code = redeemCodeInput.value.trim();
  const s = getSession();
  if (!s || !s.username || !s.token){ showModalMessage(redeemMsg, 'Please log in first', 'error'); return; }
  if (!code){ showModalMessage(redeemMsg, 'Enter a code', 'error'); return; }

  showModalMessage(redeemMsg, 'Checking code...', 'success');
  const r = await apiRedeem(s.username, s.token, code);
  if (r.ok){
    const shards = typeof r.json.shards === 'number' ? r.json.shards : s.shards || 0;
    setSession({ username: s.username, token: s.token, shards });
    updateUI();
    showModalMessage(redeemMsg, r.json.message || 'Redeemed!', 'success');
    redeemCodeInput.value = '';
    setTimeout(()=> closeModal(redeemModal), 900);
  } else {
    showModalMessage(redeemMsg, (r.json && (r.json.error || r.json.message)) || 'Invalid code', 'error');
  }
});
redeemCancel.addEventListener('click', ()=> closeModal(redeemModal));

// ---------- Quests ----------
const DAILY_QUESTS = [
  { id:'daily_login', title:'Daily Login', desc:'Claim daily login', reward:5, type:'instant' },
  { id:'stay_20', title:'Stay 20s', desc:'Stay on the page for 20 seconds', reward:8, type:'timed', duration:20 },
  { id:'puzzle', title:'Puzzle', desc:'Solve a quick puzzle', reward:15, type:'puzzle' },
  { id:'survey', title:'Survey', desc:'Answer a short survey (1/day)', reward:30, type:'survey' }
];

function getClaimedLocal(username){ try{ return JSON.parse(localStorage.getItem(`azy_claims_${username}`)) || {}; }catch(e){return {}; } }
function setClaimedLocal(username, obj){ localStorage.setItem(`azy_claims_${username}`, JSON.stringify(obj)); }

function renderQuestList(){
  const session = getSession();
  const username = session ? session.username : null;
  const claimed = username ? getClaimedLocal(username) : {};
  questListElem.innerHTML = '';
  DAILY_QUESTS.forEach(q=>{
    const item = document.createElement('div');
    item.className = 'quest-item';
    const done = !!claimed[q.id];
    item.innerHTML = `<div class="desc"><strong>${q.title}</strong><div style="font-size:.9rem;margin-top:6px;color:#ddd">${q.desc}</div></div>
      <div style="text-align:right"><div style="font-weight:bold;color:#ffd">${q.reward} ◈</div>
      <div style="margin-top:8px;"><button class="quest-claim-btn" data-id="${q.id}" ${done? 'disabled':''}>${done? 'Claimed':'Claim'}</button></div></div>`;
    questListElem.appendChild(item);
  });

  questListElem.querySelectorAll('.quest-claim-btn').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const qid = btn.dataset.id;
      const q = DAILY_QUESTS.find(x=>x.id===qid);
      if (!q) return;
      if (q.type === 'timed'){
        showModalMessage(questMsg, `Stay on this page for ${q.duration} seconds...`, 'success');
        setTimeout(async ()=> { await attemptQuestClaim(qid,q.reward,btn); }, (q.duration||20)*1000);
      } else if (q.type === 'puzzle'){
        const a=Math.floor(Math.random()*10)+1, b=Math.floor(Math.random()*10)+1;
        const ans = prompt(`Solve: ${a} + ${b} = ?`);
        if (ans===null){ showModalMessage(questMsg,'Canceled','error'); return; }
        if (parseInt(ans) === a+b) await attemptQuestClaim(qid,q.reward,btn); else showModalMessage(questMsg,'Wrong answer','error');
      } else if (q.type === 'survey'){
        const res = prompt('Survey: Which realm do you prefer? (A/B/C)');
        if (!res){ showModalMessage(questMsg,'Canceled','error'); return; }
        await attemptQuestClaim(qid,q.reward,btn);
      } else {
        await attemptQuestClaim(qid,q.reward,btn);
      }
    });
  });
}

async function attemptQuestClaim(questId, reward, btnElem){
  const s = getSession();
  if (!s || !s.username || !s.token){ showModalMessage(questMsg,'Log in to claim','error'); return; }
  const r = await apiClaimQuest(s.username, s.token, questId, reward);
  if (r.ok){
    const shards = typeof r.json.shards === 'number' ? r.json.shards : s.shards || 0;
    setSession({ username: s.username, token: s.token, shards });
    updateUI();
    showModalMessage(questMsg, `Claimed ${reward} Aether Shards`, 'success');
    btnElem.disabled = true;
    const claimed = getClaimedLocal(s.username); claimed[questId] = Date.now(); setClaimedLocal(s.username, claimed);
  } else {
    // fallback local
    const claimed = getClaimedLocal(s.username);
    if (claimed[questId]){ showModalMessage(questMsg,'Already claimed','error'); btnElem.disabled = true; return; }
    s.shards = (s.shards||0) + reward;
    setSession(s);
    updateUI();
    showModalMessage(questMsg, `Claimed ${reward} Aether Shards (local)`, 'success');
    claimed[questId] = Date.now(); setClaimedLocal(s.username, claimed);
    btnElem.disabled = true;
  }
}

// open quests
openQuestsBtn.addEventListener('click', ()=> {
  const s = getSession();
  if (!s || !s.username || !s.token) { openModal(loginModal); return; }
  renderQuestList();
  openModal(questModal);
});
questCloseBtn.addEventListener('click', ()=> closeModal(questModal));

// ---------- Init ----------
window.addEventListener('DOMContentLoaded', async ()=>{
  // Sync session with server if session exists
  const s = getSession();
  if (s && s.username && s.token){
    const bal = await apiBalance(s.username, s.token);
    if (bal.ok){ setSession({ username: s.username, token: s.token, shards: bal.json.shards }); }
  }
  updateUI();
});
