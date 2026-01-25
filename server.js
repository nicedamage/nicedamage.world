const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));


const DATA_PATH = path.join(__dirname, "messages.json");

if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify([]));
}

app.get("/api/messages", (req, res) => {
  const messages = JSON.parse(fs.readFileSync(DATA_PATH));
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const { username, text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  const messages = JSON.parse(fs.readFileSync(DATA_PATH));
  messages.push({
    username: username || "anonymous",
    text,
    timestamp: Date.now(),
  });

  fs.writeFileSync(DATA_PATH, JSON.stringify(messages, null, 2));
  res.status(201).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
