import express from "express";
import cors from "cors";
import crypto from "crypto";

const PORT = 8080;
const app = express();
let database = {
  data: "Hello World",
  hash: "",
  history: [{ data: "Hello World", hash: "" }],
};

app.use(cors());
app.use(express.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes

app.get("/", (req, res) => {
  console.log("Sending current data to client...");
  res.json({ data: database.data, hash: database.hash });
});

app.get("/history", (req, res) => {
  console.log("Sending data history to client...");
  res.json(database.history);
});

app.post("/", (req, res) => {
  console.log("Updating data on server...");
  database.data = req.body.data;
  database.hash = crypto
    .createHash("sha256")
    .update(database.data)
    .digest("hex");
  // Add to history
  database.history.push({ data: database.data, hash: database.hash });
  console.log("Data updated. New hash:", database.hash);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
