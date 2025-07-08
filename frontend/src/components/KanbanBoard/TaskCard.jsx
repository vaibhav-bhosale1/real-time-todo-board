import React from 'react';
import './TaskCard.css';

// Added props: onEdit, onDelete, onSmartAssign
function TaskCard({ task, onEdit, onDelete, onSmartAssign }) {
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-default';
    }
  };

  return (
    <div className="task-card">
      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-description">{task.description}</p>}
      {task.assignedTo && task.assignedTo.username && (
        <p className="task-assigned-to">Assigned to: <strong>{task.assignedTo.username}</strong></p>
      )}
      <div className="task-meta">
        <span className={`task-priority ${getPriorityClass(task.priority)}`}>
          {task.priority || 'No Priority'}
        </span>
        <span className="task-status">{task.status}</span>
      </div>
      <div className="task-actions">
        <button onClick={onEdit} className="edit-button" aria-label="Edit Task">Edit</button>
        <button onClick={onDelete} className="delete-button" aria-label="Delete Task">Delete</button>
        <button onClick={onSmartAssign} className="smart-assign-button" aria-label="Smart Assign Task">Smart Assign</button>
      </div>
    </div>
  );
}

export default TaskCard;