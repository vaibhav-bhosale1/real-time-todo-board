import React, { useState, useEffect } from 'react';
import api, { logout } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import Column from '../components/Column';
import './KanbanBoard.css'; // For Kanban board specific styles

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const todoTasks = tasks.filter(task => task.status === 'Todo');
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const doneTasks = tasks.filter(task => task.status === 'Done');

  if (loading) return <div className="loading-spinner"></div>; // We'll style this later
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="kanban-board-container">
      <header className="kanban-header">
        <h1>Kanban Board</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>
      <div className="kanban-board-grid">
        <Column title="Todo" tasks={todoTasks} />
        <Column title="In Progress" tasks={inProgressTasks} />
        <Column title="Done" tasks={doneTasks} />
      </div>
    </div>
  );
}

export default KanbanBoard;