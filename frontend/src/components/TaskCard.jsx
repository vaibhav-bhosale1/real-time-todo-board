import React from 'react';
import './TaskCard.css';
import api from '../utils/api'; // Import api instance

function TaskCard({ task, onTaskUpdate, onConflict }) { // Add onTaskUpdate and onConflict props
  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  const handleSmartAssign = async () => {
    try {
      const response = await api.put(`/tasks/${task._id}/smart-assign`, {
        version: task.version, // Send current version for optimistic concurrency control
      });
      console.log('Smart assign response:', response.data);
      // The `taskUpdated` socket event will handle the UI update
      // If you want immediate feedback, you could also call onTaskUpdate here
      // onTaskUpdate(response.data);
    } catch (err) {
      console.error('Error smart assigning task:', err);
      if (err.response && err.response.status === 409) {
        onConflict(task._id, err.response.data); // Pass conflict data to parent
      } else {
        alert(err.response?.data?.message || 'Failed to smart assign task.');
      }
    }
  };

  return (
    <div className="task-card">
      <h3 className="task-title">{task.title}</h3>
      <p className="task-description">{task.description}</p>
      {task.assignedTo && (
        <p className="task-assigned-to">Assigned to: {task.assignedTo.username}</p>
      )}
      <div className="task-meta">
        <span className={`task-priority ${getPriorityClass(task.priority)}`}>
          {task.priority}
        </span>
        <span className="task-status">{task.status}</span>
      </div>
      <div className="task-actions">
        <button onClick={handleSmartAssign} className="smart-assign-button">Smart Assign</button>
        {/* Add Edit/Delete buttons later if needed */}
      </div>
    </div>
  );
}

export default TaskCard;