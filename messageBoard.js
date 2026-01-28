/* -------------------------
   MESSAGE BOARD STORAGE (FIREBASE)
------------------------- */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAB31uVhbEXrHgQt7Fg7f-X0B4dI3pXZkM",
  authDomain: "nicedamage-world-messageboard.firebaseapp.com",
  projectId: "nicedamage-world-messageboard",
  storageBucket: "nicedamage-world-messageboard.firebasestorage.app",
  messagingSenderId: "617723191000",
  appId: "1:617723191000:web:c365d0ac28ea32da42c1ad"
};

// init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const messagesContainer = document.getElementById("messages");
const postForm = document.getElementById("postForm");
const usernameInput = document.getElementById("username");
const messageTextInput = document.getElementById("messageText");
const messageError = document.getElementById("message-error");

const MAX_MESSAGE_LENGTH = 300;

// ---------- LOAD MESSAGES ----------
const q = query(
  collection(db, "messages"),
  orderBy("createdAt", "asc")
);

onSnapshot(q, (snapshot) => {
  messagesContainer.innerHTML = "";

  snapshot.forEach((doc) => {
    const msg = doc.data();

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");

    msgDiv.innerHTML = `
      <strong>${msg.username || "anon"}</strong>
      <p>${msg.text}</p>
    `;

    messagesContainer.appendChild(msgDiv);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// ---------- POST MESSAGE ----------
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const text = messageTextInput.value.trim();

  messageError.textContent = "";

  if (!text) return;

  if (text.length > MAX_MESSAGE_LENGTH) {
    messageError.textContent = `Message too long. Max ${MAX_MESSAGE_LENGTH} characters.`;
    return;
  }

  try {
    await addDoc(collection(db, "messages"), {
      username: username || "anon",
      text,
      createdAt: serverTimestamp()
    });

    postForm.reset();
  } catch (err) {
    console.error("Failed to post message", err);
  }
});
