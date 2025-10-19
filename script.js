const backendURL = "https://azyrnyx-backend.onrender.com";
const overlay = document.getElementById("overlay");
const loginModal = document.getElementById("login-modal");
const redeemModal = document.getElementById("redeem-modal");
const shardsDisplay = document.getElementById("shards-display").querySelector("span");

let currentUser = localStorage.getItem("azyrnyx_user") || null;
if (currentUser) {
  currentUser = JSON.parse(currentUser);
  syncShards();
}

// Show login modal
function showLogin() {
  overlay.style.display = "block";
  loginModal.style.display = "flex";
}

// Close modals
function closeModals() {
  overlay.style.display = "none";
  loginModal.style.display = "none";
  redeemModal.style.display = "none";
}

// Shard click to open redeem/login
document.getElementById("shards-container").addEventListener("click", () => {
  if (!currentUser) showLogin();
  else {
    overlay.style.display = "block";
    redeemModal.style.display = "flex";
  }
});

// Login
document.getElementById("login-btn").addEventListener("click", async () => {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const msg = document.getElementById("login-msg");

  if (!username || !password) {
    msg.textContent = "Please fill all fields.";
    return;
  }

  try {
    const res = await fetch(`${backendURL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.success) {
      msg.textContent = data.message;
      currentUser = { username, shards: data.shards };
      localStorage.setItem("azyrnyx_user", JSON.stringify(currentUser));
      updateShardsDisplay(data.shards);
      setTimeout(closeModals, 1000);
      document.getElementById("logout-btn").style.display = "block";
    } else {
      msg.textContent = data.message;
    }
  } catch (err) {
    msg.textContent = "Server error. Try again.";
  }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("azyrnyx_user");
  currentUser = null;
  updateShardsDisplay(0);
  document.getElementById("logout-btn").style.display = "none";
});

// Redeem Code
document.getElementById("redeem-btn").addEventListener("click", async () => {
  const code = document.getElementById("redeem-code").value.trim();
  const msg = document.getElementById("redeem-msg");

  if (!code) {
    msg.textContent = "Enter a code.";
    return;
  }

  try {
    const res = await fetch(`${backendURL}/api/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser.username, code }),
    });

    const data = await res.json();
    msg.textContent = data.message;
    if (data.success) {
      currentUser.shards = data.shards;
      localStorage.setItem("azyrnyx_user", JSON.stringify(currentUser));
      updateShardsDisplay(data.shards);
    }
  } catch (err) {
    msg.textContent = "Server error.";
  }
});

// Sync shards on reload
async function syncShards() {
  try {
    const res = await fetch(`${backendURL}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: currentUser.username }),
    });

    const data = await res.json();
    if (data.success) {
      currentUser.shards = data.shards;
      localStorage.setItem("azyrnyx_user", JSON.stringify(currentUser));
      updateShardsDisplay(data.shards);
      document.getElementById("logout-btn").style.display = "block";
    }
  } catch (err) {
    console.log("Sync error", err);
  }
}

// Update Shards UI
function updateShardsDisplay(amount) {
  shardsDisplay.textContent = `${amount} Aether Shards`;
}

// Close modals on overlay click
overlay.addEventListener("click", closeModals);
