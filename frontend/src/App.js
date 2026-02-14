import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Use environment variable for production readiness
  const API = process.env.REACT_APP_API_URL ;

  const getTasks = async () => {
    try {
      const res = await axios.get(API);
      setTasks(res.data);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  useEffect(() => { getTasks(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!input) return;
    setLoading(true);
    await axios.post(API, { title: input });
    setInput('');
    await getTasks();
    setLoading(false);
  };

  const del = async (id) => {
    await axios.delete(`${API}/${id}`);
    getTasks();
  };

  return (
    <div className="container">
      <div className="glass-card">
        <header>
          <h1>CloudTask <span>v1.0</span></h1>
          <p>Production-Ready MERN Stack</p>
        </header>

        <form className="input-group" onSubmit={add}>
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Add a new production task..."
          />
          <button type="submit" disabled={loading}>
            {loading ? '...' : 'Add Task'}
          </button>
        </form>

        <div className="task-list">
          {tasks.length === 0 && <p className="empty-state">No tasks deployed yet.</p>}
          {tasks.map(t => (
            <div key={t._id} className="task-item">
              <span>{t.title}</span>
              <button className="del-btn" onClick={() => del(t._id)}>Delete</button>
            </div>
          ))}
        </div>
        
        <footer>
          <div className="status-dot"></div> Connected to AWS EKS Cluster (Simulation)
        </footer>
      </div>
    </div>
  );
}
export default App;