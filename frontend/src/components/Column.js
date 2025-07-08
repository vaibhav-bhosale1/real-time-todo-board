import React from 'react';
import TaskCard from './TaskCard';
import './Column.css';

function Column({ title, tasks }) {
  return (
    <div className="column">
      <h2 className="column-title">{title} ({tasks.length})</h2>
      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks in this column.</p>
        ) : (
          tasks.map(task => (
            <TaskCard key={task._id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}

export default Column;