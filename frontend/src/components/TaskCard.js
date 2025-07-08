import React from 'react';
import './TaskCard.css';

function TaskCard({ task }) {
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
      {/* Placeholder for future buttons/actions */}
      <div className="task-actions">
        {/* <button>Edit</button>
        <button>Delete</button> */}
      </div>
    </div>
  );
}

export default TaskCard;