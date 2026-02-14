const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Task Schema
const Task = mongoose.model('Task', new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false }
}));

// Connect to MongoDB (using the service name 'database' from docker-compose)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://database:27017/tasks';
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// Routes
app.get('/api/tasks', async (req, res) => res.json(await Task.find()));
app.post('/api/tasks', async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});
app.delete('/api/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(5000, () => console.log("🚀 Server on port 5000"));