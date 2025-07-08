import React from 'react';
import './TaskCard.css'; // Styling for individual task cards

function TaskCard({ task }) { // `task` object will be passed as a prop
  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) { // Use optional chaining in case priority is null/undefined
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-default'; // Default style for unknown priority
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
        {/* Placeholder for future buttons */}
        {/* <button className="edit-button">Edit</button>
        <button className="delete-button">Delete</button>
        <button className="smart-assign-button">Smart Assign</button> */}
      </div>
    </div>
  );
}

export default TaskCard;