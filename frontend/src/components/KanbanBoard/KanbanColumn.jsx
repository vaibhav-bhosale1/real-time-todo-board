import React from 'react';
import TaskCard from './TaskCard'; // Import TaskCard
import './KanbanColumn.css'; // Styling for columns

function KanbanColumn({ title, tasks, id }) { // Receive title, tasks, and id as props
  return (
    <div className="kanban-column">
      <h2 className="kanban-column-title">{title} ({tasks.length})</h2>
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

export default KanbanColumn;