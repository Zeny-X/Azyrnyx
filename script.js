// Floating golden Aether Shards
const shardsContainer = document.getElementById('shards-container');
for(let i=0;i<30;i++){
  const shard = document.createElement('div');
  shard.className = 'shard';
  shard.style.left = Math.random()*window.innerWidth+'px';
  shard.style.top = Math.random()*window.innerHeight+'px';
  shard.style.width = 8 + Math.random()*12+'px';
  shard.style.height = shard.style.width;
  shard.style.animationDuration = 6 + Math.random()*10+'s';
  shardsContainer.appendChild(shard);
}

// Tabs with animated content
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
        void el.offsetWidth; // reflow
        el.style.animation = '';
      });
    });
    const activeSection = document.getElementById(target);
    activeSection.classList.add('active');
  });
});

// Background music toggle & visualiser
const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const barsContainer = document.getElementById('bars');

// Create 4 bars for visualiser
for(let i=0;i<4;i++){
  const line = document.createElementNS("http://www.w3.org/2000/svg","line");
  line.setAttribute("x1", 15 + i*8);
  line.setAttribute("y1", 15);
  line.setAttribute("x2", 15 + i*8);
  line.setAttribute("y2", 35);
  barsContainer.appendChild(line);
}

// Animate visualiser
setInterval(()=>{
  const lines = barsContainer.querySelectorAll("line");
  lines.forEach(line=>{
    const height = 10 + Math.random()*15;
    line.setAttribute("y1", 25 - height/2);
    line.setAttribute("y2", 25 + height/2);
  });
}, 300);

// Click to mute/unmute
musicToggle.addEventListener('click', ()=>{
  music.muted = !music.muted;
});
