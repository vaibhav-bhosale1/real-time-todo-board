import React, { useState, useEffect } from 'react';
import api, { logout } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import ActivityLog from '../components/ActivityLog';
import Column from '../components/Column';
import { DragDropContext } from '@hello-pangea/dnd';
import io from 'socket.io-client';
import './KanbanBoard.css';

// Initialize Socket.IO client
const socket = io('http://localhost:5000'); // Adjust if deployed elsewhere

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

    // Socket.IO event listeners
    socket.on('taskCreated', (newTask) => {
      console.log('Task created via Socket.IO:', newTask);
      setTasks(prevTasks => [...prevTasks, newTask]);
    });

    socket.on('taskUpdated', (updatedTask) => {
      console.log('Task updated via Socket.IO:', updatedTask);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    socket.on('taskDeleted', (deletedTaskId) => {
      console.log('Task deleted via Socket.IO:', deletedTaskId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== deletedTaskId));
    });

    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    socket.disconnect();
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination || (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )) return;

    const draggedTask = tasks.find(task => task._id === draggableId);
    if (!draggedTask) return;

    const newStatus = destination.droppableId;
    const originalTasks = tasks;

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === draggableId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await api.put(`/tasks/${draggableId}`, {
        status: newStatus,
        version: draggedTask.version,
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err.response?.data?.message || 'Failed to update task status.');
      setTasks(originalTasks);

      if (err.response && err.response.status === 409) {
        alert('Conflict detected! The task was modified by someone else. Reverting your changes to show the latest state.');
        fetchTasks();
      }
    }
  };

  const handleConflict = async (taskId, conflictDetails) => {
    alert(`Conflict detected for task "${conflictDetails.task.title}"!
Your attempted changes: (e.g., smart assign)
Current database state:
Status: ${conflictDetails.task.status}
Assigned to: ${conflictDetails.task.assignedTo?.username || 'None'}
Please refresh or resolve manually.`);
    fetchTasks();
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
          <Column
            title="Todo"
            tasks={todoTasks}
            id="Todo"
            onTaskUpdate={fetchTasks}
            onConflict={handleConflict}
          />
          <Column
            title="In Progress"
            tasks={inProgressTasks}
            id="In Progress"
            onTaskUpdate={fetchTasks}
            onConflict={handleConflict}
          />
          <Column
            title="Done"
            tasks={doneTasks}
            id="Done"
            onTaskUpdate={fetchTasks}
            onConflict={handleConflict}
          />
        </div>
      </DragDropContext>
      <ActivityLog />
    </div>
  );
}

export default KanbanBoard;
