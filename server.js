const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DATABASE SETUP
const DB_PATH = path.join(__dirname, "messages.db");
const db = new sqlite3.Database(DB_PATH);

// Create table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      text TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `);
});

// GET messages
app.get("/api/messages", (req, res) => {
  db.all("SELECT * FROM messages ORDER BY timestamp ASC", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch messages." });
    }
    res.json(rows);
  });
});

// POST message
app.post("/api/messages", (req, res) => {
  const { username, text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  if (text.length > 300) {
    return res.status(400).json({ error: "Message too long." });
  }

  const timestamp = Date.now();
  db.run(
    "INSERT INTO messages (username, text, timestamp) VALUES (?, ?, ?)",
    [username || "anonymous", text, timestamp],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to save message." });
      }
      res.status(201).json({ success: true, id: this.lastID });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
