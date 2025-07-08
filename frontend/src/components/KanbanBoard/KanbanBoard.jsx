import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';
import { fetchAllTasks, createTask, updateTask, deleteTask, smartAssignTask, fetchTaskById } from '../../services/taskService';
import KanbanColumn from './KanbanColumn';
import Modal from '../common/Modal';
import TaskForm from '../common/TaskForm';
import TaskCard from './TaskCard';
import socket from '../../utils/socket';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ActivityLog from '../ActivityLog/ActivityLog'; // Import ActivityLog component
import './KanbanBoard.css';
import '../common/LoadingSpinner.css';

function KanbanBoard() {
  const [tasks, setTasks] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictedTask, setConflictedTask] = useState(null);
  const [latestTaskVersion, setLatestTaskVersion] = useState(null);
  const [attemptedChanges, setAttemptedChanges] = useState(null);

  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllTasks();
      // FIX: Ensure data is always an array. If backend sends null/undefined/non-array on success, default to empty array.
      setTasks(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      // Construct a meaningful error message
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load tasks.';
      setError(errorMessage);
      // FIX: Crucially, if an error occurs, ensure tasks is explicitly set to an empty array
      // This prevents potential issues if 'tasks' somehow became non-array previously
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
      socket.on('taskCreated', (newTask) => {
      console.log('taskCreated event received:', newTask);
      setTasks(prevTasks => [...prevTasks, newTask]);
    });

    socket.on('taskUpdated', (updatedTask) => {
      console.log('taskUpdated event received:', updatedTask);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
      // If the updated task was the one causing a conflict, close the conflict modal
      if (conflictModalOpen && conflictedTask && conflictedTask._id === updatedTask._id) {
          setConflictModalOpen(false);
          setConflictedTask(null);
          setLatestTaskVersion(null);
          setAttemptedChanges(null);
          setError(''); // Clear any conflict error
      }
    });

    socket.on('taskDeleted', (deletedTaskId) => {
      console.log('taskDeleted event received:', deletedTaskId);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== deletedTaskId));
    });

    // Cleanup function for useEffect to prevent memory leaks
    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
      // Note: We don't disconnect the socket here if we want it to persist across component unmounts
      // (e.g., if navigating away from KanbanBoard temporarily).
      // If you want a full disconnect when the component unmounts, add:
      // socket.disconnect();
    };
  }, [fetchTasks, conflictModalOpen, conflictedTask]);

  const handleLogout = () => {
    logout();
      socket.disconnect();
    navigate('/login');
  };

  const handleCreateTask = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        
        setError('');
      } catch (err) {
        console.error('Error deleting task:', err);
        setError(err.response?.data?.message || 'Failed to delete task.');
      }
    }
  };

  const handleSmartAssign = async (task) => {
    try {
      setFormLoading(true);
      await smartAssignTask(task._id, task.version);
      setError('');
    } catch (err) {
      console.error('Error smart assigning task:', err);
      if (err.response && err.response.status === 409) {
        setConflictedTask(task);
        setAttemptedChanges(null);
        try {
          const latest = await fetchTaskById(task._id);
          setLatestTaskVersion(latest);
          setConflictModalOpen(true);
        } catch (fetchErr) {
          console.error("Could not fetch latest task version:", fetchErr);
          setError("Conflict detected, but couldn't fetch latest task. Please refresh.");
        }
      } else {
        setError(err.response?.data?.message || 'Failed to smart assign task.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitTask = async (taskData) => {
    setFormLoading(true);
    try {
      if (currentTask) {
        await updateTask(currentTask._id, { ...taskData, version: currentTask.version });
        setError('');
      } else {
        await createTask(taskData);
        setError('');
      }
      setIsModalOpen(false);
      setCurrentTask(null);
    } catch (err) {
      console.error('Error saving task:', err);
      if (err.response && err.response.status === 409) {
        setConflictedTask(currentTask);
        setAttemptedChanges(taskData);
        try {
          const latest = await fetchTaskById(currentTask._id);
          setLatestTaskVersion(latest);
          setConflictModalOpen(true);
        } catch (fetchErr) {
          console.error("Could not fetch latest task version:", fetchErr);
          setError("Conflict detected, but couldn't fetch latest task. Please refresh.");
        }
      } else {
        setError(err.response?.data?.message || 'Failed to save task.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleConflictResolution = async (overwrite) => {
    if (overwrite) {
      setFormLoading(true);
      try {
        const updatedTaskData = {
          ...attemptedChanges,
          version: latestTaskVersion.version,
        };
        await updateTask(conflictedTask._id, updatedTaskData);
        setError('');
      } catch (err) {
        console.error('Error overwriting task:', err);
        setError(err.response?.data?.message || 'Failed to overwrite task. Please try again.');
      } finally {
        setFormLoading(false);
      }
    } else {
      setConflictModalOpen(false);
      setConflictedTask(null);
      setLatestTaskVersion(null);
      setAttemptedChanges(null);
      setIsModalOpen(false);
      fetchTasks();
      setError('Your changes were discarded. The board has been updated to reflect the latest state.');
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const draggedTask = tasks.find(task => task._id === draggableId);
    if (!draggedTask) return;

    const newStatus = destination.droppableId;
    if (newStatus === draggedTask.status) {
      const columnTasks = tasks.filter(task => task.status === source.droppableId);
      const [removed] = columnTasks.splice(source.index, 1);
      columnTasks.splice(destination.index, 0, removed);

      setTasks(prevTasks => {
        const otherTasks = prevTasks.filter(task => task.status !== source.droppableId);
        return [...otherTasks, ...columnTasks];
      });
      return;
    }

    const originalTasks = [...tasks];

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === draggableId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await updateTask(draggedTask._id, {
        status: newStatus,
        version: draggedTask.version,
      });
      setError('');
    } catch (err) {
      console.error('Error updating task status via drag-and-drop:', err);
      setTasks(originalTasks);
      if (err.response && err.response.status === 409) {
        setConflictedTask(draggedTask);
        setAttemptedChanges({ status: newStatus });
        try {
          const latest = await fetchTaskById(draggedTask._id);
          setLatestTaskVersion(latest);
          setConflictModalOpen(true);
        } catch (fetchErr) {
          console.error("Could not fetch latest task version:", fetchErr);
          setError("Conflict detected, but couldn't fetch latest task. Please refresh.");
        }
      } else {
        setError(err.response?.data?.message || 'Failed to update task status.');
      }
    }
  };

  const getTasksForColumn = (status) => {
    // Defensive check: Ensure tasks is always an array before filtering
    if (!Array.isArray(tasks)) {
      console.warn('Tasks state is not an array in getTasksForColumn, returning empty array.');
      return [];
    }
    return tasks.filter(task => task.status === status);
  };

  if (loading) return <div className="kanban-loading"><div className="spinner"></div>Loading tasks...</div>;
  if (error && !conflictModalOpen) return <div className="kanban-error">{error}</div>;

  return (
    <div className="kanban-board-container">
      <header className="kanban-header">
        <h1>Kanban Board</h1>
        <div>
          <button onClick={handleCreateTask} className="create-task-button">Add New Task</button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-columns-grid">
          {['Todo', 'In Progress', 'Done'].map(status => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <KanbanColumn
                  title={status}
                  id={status}
                  tasks={getTasksForColumn(status)}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  isDraggingOver={snapshot.isDraggingOver}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onSmartAssign={handleSmartAssign}
                >
                  {provided.placeholder}
                </KanbanColumn>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentTask ? 'Edit Task' : 'Create New Task'}
      >
        <TaskForm
          initialData={currentTask || {}}
          onSubmit={handleSubmitTask}
          onCancel={() => setIsModalOpen(false)}
          loading={formLoading}
        />
      </Modal>

      <Modal
        isOpen={conflictModalOpen}
        onClose={() => handleConflictResolution(false)}
        title="Conflict Detected!"
      >
        <div className="conflict-modal-content">
          <p>Another user has updated this task since you started editing it.</p>
          {error && <p className="form-error-message">{error}</p>}
          <div className="conflict-details">
            <div className="conflict-section">
              <h3>Your Attempted Changes</h3>
              {attemptedChanges ? (
                <>
                  <p><strong>Title:</strong> {attemptedChanges.title || conflictedTask?.title || 'N/A'}</p>
                  <p><strong>Description:</strong> {attemptedChanges.description || conflictedTask?.description || 'N/A'}</p>
                  <p><strong>Status:</strong> {attemptedChanges.status || conflictedTask?.status || 'N/A'}</p>
                  <p><strong>Priority:</strong> {attemptedChanges.priority || conflictedTask?.priority || 'N/A'}</p>
                </>
              ) : (
                <p>Changes related to smart assign or status update (no direct input changes).</p>
              )}
            </div>
            <div className="conflict-section">
              <h3>Current Version (from Database)</h3>
              {latestTaskVersion ? (
                <>
                  <p><strong>Title:</strong> {latestTaskVersion.title}</p>
                  <p><strong>Description:</strong> {latestTaskVersion.description}</p>
                  <p><strong>Status:</strong> {latestTaskVersion.status}</p>
                  <p><strong>Priority:</strong> {latestTaskVersion.priority}</p>
                  <p><strong>Last Updated At:</strong> {new Date(latestTaskVersion.updatedAt).toLocaleString()}</p>
                  <p><strong>Last Updated By:</strong> {latestTaskVersion.user?.username || 'Unknown'}</p>
                </>
              ) : (
                <p>Loading latest version...</p>
              )}
            </div>
          </div>
          <div className="conflict-actions">
            <button onClick={() => handleConflictResolution(true)} className="overwrite-button" disabled={formLoading}>
              {formLoading ? 'Overwriting...' : 'Overwrite'}
            </button>
            <button onClick={() => handleConflictResolution(false)} className="discard-button" disabled={formLoading}>
              {formLoading ? 'Discarding...' : 'Discard Changes'}
            </button>
          </div>
        </div>
      </Modal>
      {/* Activity Log will be rendered here */}
      <ActivityLog />
    </div>
  );
}

export default KanbanBoard;
