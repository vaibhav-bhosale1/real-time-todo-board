import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import api, { logout } from '../utils/api';
import Column from '../components/Column';
import './KanbanBoard.css';

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination || (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )) {
      return;
    }

    const draggedTask = tasks.find(task => task._id === draggableId);
    if (!draggedTask) return;

    const newStatus = destination.droppableId;

    const updatedTasks = tasks.map(task =>
      task._id === draggableId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    try {
      await api.put(`/tasks/${draggableId}`, {
        status: newStatus,
        version: draggedTask.version,
      });
      fetchTasks(); // Refresh to get updated versions
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err.response?.data?.message || 'Failed to update task status.');
      setTasks(tasks); // Revert UI

      if (err.response?.status === 409) {
        alert('Conflict detected! Fetching latest version of tasks.');
        fetchTasks();
      }
    }
  };

  const todoTasks = tasks.filter(task => task.status === 'Todo');
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const doneTasks = tasks.filter(task => task.status === 'Done');

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="kanban-board-container">
      <header className="kanban-header">
        <h1>Kanban Board</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board-grid">
          <Column title="Todo" tasks={todoTasks} id="Todo" />
          <Column title="In Progress" tasks={inProgressTasks} id="In Progress" />
          <Column title="Done" tasks={doneTasks} id="Done" />
        </div>
      </DragDropContext>
    </div>
  );
}

export default KanbanBoard;
