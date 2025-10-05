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
      // Reset animation
      c.querySelectorAll('h2, p').forEach(el => {
        el.style.animation = 'none';
        void el.offsetWidth; // trigger reflow
        el.style.animation = '';
      });
    });
    const activeSection = document.getElementById(target);
    activeSection.classList.add('active');
  });
});
