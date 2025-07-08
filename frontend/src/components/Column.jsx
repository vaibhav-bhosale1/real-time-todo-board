import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import './Column.css';

function Column({ title, tasks, id }) {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          className="column"
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            backgroundColor: snapshot.isDraggingOver ? '#d1d8df' : '#e0e6ed',
          }}
        >
          <h2 className="column-title">{title} ({tasks.length})</h2>
          <div className="task-list">
            {tasks.length === 0 && !snapshot.isDraggingOver ? (
              <p className="no-tasks">No tasks in this column.</p>
            ) : (
              tasks.map((task, index) => (
                <Draggable key={task._id} draggableId={task._id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`task-card-wrapper ${snapshot.isDragging ? 'is-dragging' : ''}`}
                    >
                      <TaskCard task={task} />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}

export default Column;
