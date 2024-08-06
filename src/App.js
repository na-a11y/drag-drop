import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

const ItemTypes = {
  CARD: 'card',
};

const initialTasks = {
  todo: [],
  done: [],
  inProgress: []
};

const TaskCard = ({ task, index, moveTask, columnId }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { index, columnId, type: ItemTypes.CARD },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="task-card"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {task.title}
    </div>
  );
};

const KanbanColumn = ({ title, tasks, columnId, moveTask, addTask }) => {
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    drop: (item) => {
      if (item.columnId !== columnId) {
        moveTask(item.index, item.columnId, columnId);
        item.columnId = columnId;
      }
    },
  });

  return (
    <div ref={drop} className="kanban-column">
      <h3>{title.toUpperCase()}</h3>
      {tasks.map((task, index) => (
        <TaskCard key={task.id} task={task} index={index} moveTask={moveTask} columnId={columnId} />
      ))}
      {columnId === 'todo' && (
        <div className="create-issue">
          <input
            type="text"
            placeholder="Create issue"
            value={addTask.newTaskTitle}
            onChange={(e) => addTask.setNewTaskTitle(e.target.value)}
          />
          <button onClick={addTask.handleAddTask}>Add</button>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') return;
    const newTask = { id: Date.now().toString(), title: newTaskTitle };
    setTasks((prevTasks) => ({
      ...prevTasks,
      todo: [...prevTasks.todo, newTask]
    }));
    setNewTaskTitle('');
  };

  const moveTask = (taskIndex, sourceColumnId, destinationColumnId) => {
    if (!tasks[sourceColumnId] || !tasks[destinationColumnId]) {
      console.error(`Invalid column ID: ${sourceColumnId} or ${destinationColumnId}`);
      return;
    }

    const sourceTasks = [...tasks[sourceColumnId]];
    const [movedTask] = sourceTasks.splice(taskIndex, 1);
    const destinationTasks = [...tasks[destinationColumnId], movedTask];
    setTasks({
      ...tasks,
      [sourceColumnId]: sourceTasks,
      [destinationColumnId]: destinationTasks,
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="kanban-board">
        <KanbanColumn
          title="TO DO "
          tasks={tasks.todo}
          columnId="todo"
          moveTask={moveTask}
          addTask={{ handleAddTask, newTaskTitle, setNewTaskTitle }}
        />
        <KanbanColumn
          title="IN PROGRESS"
          tasks={tasks.inProgress}
          columnId="inProgress"
          moveTask={moveTask}
        />
        <KanbanColumn
          title="DONE"
          tasks={tasks.done}
          columnId="done"
          moveTask={moveTask}
        />
      </div>
    </DndProvider>
  );
};

export default App;
