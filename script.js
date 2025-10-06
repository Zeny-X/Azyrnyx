// ============================
// Floating golden Aether Shards
// ============================
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
        void el.offsetWidth; // reflow to restart animation
        el.style.animation = '';
      });
    });
    const activeSection = document.getElementById(target);
    activeSection.classList.add('active');
  });
});

// ============================
// DOM Elements
// ============================
const music = document.getElementById('bg_music.mp3');
const musicToggle = document.getElementById('music-toggle');
const barsContainer = document.getElementById('bars');
let animationInterval; // To store the interval ID for the bars animation

// ============================
// Music Control
// ============================

/**
 * Updates the appearance of the music toggle button based on the music state.
 */
function updateMusicToggle() {
    if (music.muted) {
        musicToggle.textContent = '🎵 Enable Sound (Click)';
        musicToggle.classList.remove('active');
        stopBarAnimation();
    } else {
        musicToggle.textContent = '🔊 Mute Sound (Click)';
        musicToggle.classList.add('active');
        startBarAnimation();
    }
}

// 1. Initially Muted Autoplay Attempt
// The best practice is to start muted for browsers to allow autoplay.
music.muted = true;
music.play()
    .then(() => {
        // Autoplay succeeded (it's muted)
        updateMusicToggle();
        musicToggle.style.display = 'block'; // Show the button
    })
    .catch(error => {
        // Autoplay failed (user must interact first)
        console.warn("Autoplay was prevented. User must click to start music.");
        updateMusicToggle();
        musicToggle.style.display = 'block'; // Show button, it will be in the 'muted' state
    });

// 2. Toggle Music on Click
musicToggle.addEventListener('click', () => {
    // Toggle mute state
    music.muted = !music.muted;
    
    // If we are unmuting, ensure it starts playing if it was paused
    if (!music.muted && music.paused) {
        music.play().catch(e => console.error("Error playing music:", e));
    }
    
    updateMusicToggle();
});

// ============================
// Music Visualiser Bars
// ============================

// 1. Create the bars (using SVG lines as in your original code)
const NUMBER_OF_BARS = 4;
for(let i = 0; i < NUMBER_OF_BARS; i++){
    // Create an SVG line element
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    
    // Set fixed position, the animation will change the y-coordinates (height)
    line.setAttribute("x1", 15 + i * 8);
    line.setAttribute("y1", 25); // Start at middle
    line.setAttribute("x2", 15 + i * 8);
    line.setAttribute("y2", 25); // End at middle (zero height)
    line.classList.add('visualizer-bar');
    
    barsContainer.appendChild(line);
}

// 2. Animate Visualiser Logic
function animateBars() {
    const lines = barsContainer.querySelectorAll(".visualizer-bar");
    lines.forEach(line => {
        // Animate height randomly
        const height = 10 + Math.random() * 15; // Random height between 10 and 25
        line.setAttribute("y1", 25 - height / 2); // Top coordinate
        line.setAttribute("y2", 25 + height / 2); // Bottom coordinate
    });
}

// 3. Start/Stop Animation based on music state
function startBarAnimation() {
    // Clear any existing interval first
    stopBarAnimation();
    // Start animation, updating every 300ms
    animationInterval = setInterval(animateBars, 300);
}

function stopBarAnimation() {
    clearInterval(animationInterval);
    // Reset bars to a flat, non-animated state
    const lines = barsContainer.querySelectorAll(".visualizer-bar");
    lines.forEach(line => {
        line.setAttribute("y1", 25);
        line.setAttribute("y2", 25);
    });
}

// Ensure the initial state is applied
updateMusicToggle();
