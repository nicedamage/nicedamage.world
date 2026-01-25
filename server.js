const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------------
   MIDDLEWARE
------------------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------------
   DATA FILE
------------------------- */
const DATA_PATH = path.join(__dirname, "messages.json");

if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify([]));
}

/* -------------------------
   ROUTES
------------------------- */

// GET all messages
app.get("/api/messages", (req, res) => {
  try {
    const messages = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    res.json(messages);
  } catch (err) {
    console.error("READ ERROR:", err);
    res.status(500).json({ error: "Failed to read messages." });
  }
});

// POST a new messageapp.post("/api/messages", (req, res) => {
  console.log("POST BODY:", req.body);

  const { username, text } = req.body;

  //  empty message check
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  //  message length cap (ADD THIS)
  if (text.length > 300) {
    return res.status(400).json({ error: "Message too long." });
  }

  const messages = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

  messages.push({
    username: username || "anonymous",
    text,
    timestamp: Date.now(),
  });

  fs.writeFileSync(DATA_PATH, JSON.stringify(messages, null, 2));

  res.status(201).json({ success: true });


/* -------------------------
   START SERVER
------------------------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
