import React, { useState, useEffect } from 'react';
import api, { logout } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import ActivityLog from '../components/ActivityLog';
import Column from '../components/Column';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import io from 'socket.io-client'; // Import Socket.IO client
import './KanbanBoard.css';

// Initialize Socket.IO client
const socket = io('http://localhost:5000'); // Ensure this matches your backend URL

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

    // Clean up socket listeners on component unmount
    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  const handleLogout = () => {
    logout();
    navigate('/login');
    socket.disconnect(); // Disconnect socket on logout
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const draggedTask = tasks.find(task => task._id === draggableId);
    if (!draggedTask) return;

    const newStatus = destination.droppableId;

    // Optimistic update
    const originalTasks = tasks; // Store original state for potential rollback
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
      // Backend will emit 'taskUpdated' via Socket.IO, which will re-sync our state
      // No need to fetchTasks() immediately here, as Socket.IO will handle it.
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err.response?.data?.message || 'Failed to update task status.');
      setTasks(originalTasks); // Revert on error

      if (err.response && err.response.status === 409) {
          alert('Conflict detected! The task was modified by someone else. Reverting your changes to show the latest state.');
          fetchTasks(); // Force a re-fetch to get the true latest state
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
      <ActivityLog /> {/* Add the ActivityLog component here */}
    </div>
  );
}

