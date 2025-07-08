import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import './KanbanColumn.css';

function KanbanColumn({ title, tasks, id, onEditTask, onDeleteTask, onSmartAssign }) {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          className={`kanban-column ${snapshot.isDraggingOver ? 'is-dragging-over' : ''}`}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <h2 className="kanban-column-title">{title} ({tasks.length})</h2>
          <div className="task-list">
            {tasks.length === 0 && !snapshot.isDraggingOver ? (
              <p className="no-tasks">No tasks in this column.</p>
            ) : tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided, snapshot) => (
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
            {provided.placeholder}
            {tasks.length === 0 && snapshot.isDraggingOver && (
              <div className="task-placeholder">Drop tasks here</div>
            )}
          </div>
        </div>
      )}
    </Droppable>
  );
}

export default KanbanColumn;
