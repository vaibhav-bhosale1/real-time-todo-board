import React, { useState, useEffect } from 'react';
import './TaskForm.css'; // Dedicated CSS for the form

function TaskForm({ initialData = {}, onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [status, setStatus] = useState(initialData.status || 'Todo');
  const [priority, setPriority] = useState(initialData.priority || 'Medium');
  const [error, setError] = useState('');

  // Update form fields if initialData changes (e.g., when opening for editing)
  useEffect(() => {
    setTitle(initialData.title || '');
    setDescription(initialData.description || '');
    setStatus(initialData.status || 'Todo');
    setPriority(initialData.priority || 'Medium');
    setError(''); // Clear errors when initial data changes
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title cannot be empty.');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      version: initialData.version || 0, // Pass current version for updates, 0 for new
    };
    onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
          aria-label="Task title"
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="3"
          disabled={loading}
          aria-label="Task description"
        ></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
          aria-label="Task status"
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={loading}
          aria-label="Task priority"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {error && <p className="form-error-message">{error}</p>}

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button" disabled={loading}>
          Cancel
        </button>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (initialData._id ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;