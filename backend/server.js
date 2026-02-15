const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: [
    'http://a9126bcfccd0f41e1822255e22dd5a2d-1170289972.us-east-1.elb.amazonaws.com', // Your Frontend URL
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Task Schema
const Task = mongoose.model('Task', new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false }
}));

// Connect to MongoDB (using the service name 'database' from docker-compose)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/tasks';
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));
app.get('/', (req, res) => res.status(200).send('Pre-DB Check OK'));
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

app.listen(5000, '0.0.0.0', () => console.log("🚀 Server on port 5000"));