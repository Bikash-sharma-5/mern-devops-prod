import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Fallback to localhost only if the environment variable is missing during build
  // We append /api/tasks here so you don't have to repeat it in every axios call
  // Replace your API definition with this:
const BASE_URL = process.env.REACT_APP_API_URL || "http://a35de4649e77d4657be95b923d8dfe83-311472493.us-east-1.elb.amazonaws.com:5000";
const API = `${BASE_URL}/api/tasks`;

console.log("FINAL ATTEMPT API URL:", API);
  const getTasks = async () => {
    try {
      const res = await axios.get(API);
      setTasks(res.data);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  useEffect(() => { 
    getTasks(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!input) return;
    setLoading(true);
    try {
      await axios.post(API, { title: input });
      setInput('');
      await getTasks();
    } catch (err) {
      console.error("Add Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      await getTasks();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  return (
    <div className="container">
      <div className="glass-card">
        <header>
          <h1>CloudTask <span>v1.0</span></h1>
          <p>Production-Ready MERN Stack</p>
          <small style={{color: '#aaa'}}>Endpoint: {BASE_URL}</small>
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
          <div className="status-dot"></div> Connected to AWS EKS Cluster
        </footer>
      </div>
    </div>
  );
}

export default App;