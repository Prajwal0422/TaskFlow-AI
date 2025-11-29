import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ tasks, onDeleteTask, onEditTask, onCompleteTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="glass-card text-center py-16 rounded-2xl">
        <div className="text-gray-400 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No tasks yet</h3>
        <p className="text-gray-300 text-lg">Add your first task to get started</p>
      </div>
    );
  }

  return (
    <div className="task-list space-y-5">
      {tasks.map((task, index) => (
        <TaskCard 
          key={task.id || index} 
          task={task} 
          onDeleteTask={onDeleteTask} 
          onEditTask={onEditTask}
          onCompleteTask={onCompleteTask}
        />
      ))}
    </div>
  );
};

export default TaskList;