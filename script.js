const messagesDiv = document.getElementById("messages");
const form = document.getElementById("postForm");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("messageText");

// tokens that belong to THIS browser
const myTokens = JSON.parse(localStorage.getItem("myTokens")) || [];

/* -------------------------
   helpers
------------------------- */

function saveTokens() {
  localStorage.setItem("myTokens", JSON.stringify(myTokens));
}

function timeAgo(ts) {
  const seconds = Math.floor(Date.now() / 1000 - ts);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const date = new Date(ts * 1000);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}


function canDelete(msg) {
  return myTokens.includes(msg.token);
}

/* -------------------------
   fetch + render
------------------------- */

async function loadMessages() {
  const res = await fetch("messages.json", { cache: "no-store" });
  const data = await res.json();

  messagesDiv.innerHTML = "";
  data.forEach(msg => {
    messagesDiv.appendChild(renderMessage(msg));
  });
}

function renderMessage(msg) {
  const el = document.createElement("div");
  el.className = "message";

  el.innerHTML = `
    <div class="meta">
      <strong>${msg.user}</strong>
      <span>${timeAgo(msg.time)}</span>
    </div>
    <p>${msg.text}</p>
  `;

  if (canDelete(msg)) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "delete";
    deleteBtn.className = "delete";
    deleteBtn.onclick = () => deleteMessage(msg.id, msg.token);
    el.appendChild(deleteBtn);
  }

  return el;

  const exactTime = new Date(msg.time * 1000).toLocaleString();

el.innerHTML = `
  <div class="meta">
    <strong>${msg.user}</strong>
    <span class="time" title="${exactTime}">
      ${timeAgo(msg.time)}
    </span>
  </div>
  <p>${msg.text}</p>
`;

}

/* -------------------------
   posting
------------------------- */

async function postMessage(user, text) {
  const token = crypto.randomUUID();

  myTokens.push(token);
  saveTokens();

  const formData = new FormData();
  formData.append("user", user);
  formData.append("text", text);
  formData.append("token", token);

  await fetch("post.php", {
    method: "POST",
    body: formData
  });

  loadMessages();
}

/* -------------------------
   deleting
------------------------- */

async function deleteMessage(id, token) {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("token", token);

  await fetch("delete.php", {
    method: "POST",
    body: formData
  });

  loadMessages();
}

/* -------------------------
   form handler
------------------------- */

form.addEventListener("submit", e => {
  e.preventDefault();

  const user = usernameInput.value.trim() || "anonymous";
  const text = messageInput.value.trim();
  if (!text) return;

  postMessage(user, text);
  form.reset();
});

/* -------------------------
   init
------------------------- */

loadMessages();
