// frontend/src/components/KanbanBoard/KanbanColumn.jsx

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard'; // Make sure this path is correct
import './KanbanColumn.css';

// Use React.forwardRef to accept and apply the ref from the parent Droppable
const KanbanColumn = React.forwardRef(({ title, tasks, id, onEditTask, onDeleteTask, onSmartAssign, isDraggingOver, children, ...droppableProps }, ref) => {
  return (
    <div
      className={`kanban-column ${isDraggingOver ? 'is-dragging-over' : ''}`}
      ref={ref} // Attach the forwarded ref directly to the root DOM element
      {...droppableProps} // Apply droppableProps here
    >
      <h2 className="kanban-column-title">{title} ({tasks.length})</h2>
      <div className="task-list">
        {tasks.length === 0 && !isDraggingOver ? ( // Use isDraggingOver from props
          <p className="no-tasks">No tasks in this column.</p>
        ) : tasks.map((task, index) => (
          <Draggable key={task._id} draggableId={task._id} index={index}>
            {(provided, snapshot) => (
              // The div wrapping TaskCard is the one receiving Draggable's props
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`task-card-wrapper ${snapshot.isDragging ? 'is-dragging' : ''}`}
              >
                <TaskCard
                  task={task}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task._id)}
                  onSmartAssign={() => onSmartAssign(task)}
                />
              </div>
            )}
          </Draggable>
        ))}
        {children} {/* This will render provided.placeholder from KanbanBoard's Droppable */}
        {tasks.length === 0 && isDraggingOver && (
          <div className="task-placeholder">Drop tasks here</div>
        )}
      </div>
    </div>
  );
});

export default KanbanColumn;