import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService'; // Import logout from authService
import api from '../../services/api'; // Our configured axios instance
import KanbanColumn from './KanbanColumn'; // Component for each column
import './KanbanBoard.css'; // Styling for the board

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/tasks'); // Fetch all tasks
      console.log('Fetched tasks response:', response.data);

      // ✅ Adjust depending on your actual API shape
      const data = response.data;
      const fetchedTasks = Array.isArray(data) ? data : data.tasks || [];

      setTasks(fetchedTasks);
      setError('');
    } catch (err) {
      console.error('Error fetching tasks:', err);

      if (err.response && err.response.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load tasks. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // In a later step, you might add Socket.IO listeners here
  }, []);

  const handleLogout = () => {
    logout(); // Clear JWT token
    navigate('/login'); // Redirect to login page
  };

  // ✅ Filter tasks into their respective columns safely
  const todoTasks = tasks.filter(task => task.status === 'Todo');
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const doneTasks = tasks.filter(task => task.status === 'Done');

  if (loading) return <div className="kanban-loading">Loading tasks...</div>;
  if (error) return <div className="kanban-error">{error}</div>;

  return (
    <div className="kanban-board-container">
      <header className="kanban-header">
        <h1>Kanban Board</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>
      <div className="kanban-columns-grid">
        <KanbanColumn title="Todo" tasks={todoTasks} id="Todo" />
        <KanbanColumn title="In Progress" tasks={inProgressTasks} id="In Progress" />
        <KanbanColumn title="Done" tasks={doneTasks} id="Done" />
      </div>
    </div>
  );
}

export default KanbanBoard;
