import React from 'react';

const TaskCard = ({ task, index, onDeleteTask, onEditTask, onCompleteTask }) => {
  // Default values if not provided by AI
  const category = task.category || 'General';
  const priority = task.priority || 'Medium';
  const status = task.status || 'pending';

  // Get priority class
  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  // Get category class
  const getCategoryClass = (category) => {
    return 'category-tag';
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'reminded': 'Reminded',
      'snoozed': 'Snoozed'
    };
    
    const statusColors = {
      'pending': 'bg-gray-500',
      'in-progress': 'bg-blue-500',
      'completed': 'bg-green-500',
      'reminded': 'bg-yellow-500',
      'snoozed': 'bg-purple-500'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[status] || 'bg-gray-500'}`}>
        {statusMap[status] || status}
      </span>
    );
  };

  // Function to open calendar link
  const openCalendar = (calendarUrl) => {
    if (calendarUrl) {
      window.open(calendarUrl, '_blank');
    }
  };

  return (
    <div className={`task-card p-5 rounded-2xl border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 ${task.completed ? 'opacity-70' : ''}`}>
      <div className="task-content">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-1">
            <h3 className={`font-bold text-lg mb-2 ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
              {task.task}
              {task.completed && <span className="ml-2 text-green-400">✓</span>}
            </h3>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={getCategoryClass(category)}>{category}</span>
              <span className={`${getPriorityClass(priority)} priority-badge`}>
                {priority}
              </span>
              {task.due_date && (
                <span className="category-tag">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
              {task.estimated_minutes && (
                <span className="category-tag">
                  {task.estimated_minutes} min
                </span>
              )}
              {task.last_ai_score && (
                <span className="category-tag">
                  Score: {task.last_ai_score.toFixed(2)}
                </span>
              )}
              {getStatusBadge(status)}
            </div>
            
            {/* Reminders */}
            {task.reminders && task.reminders.length > 0 && (
              <div className="mt-3">
                <div className="text-sm text-gray-400">Reminders:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.reminders.map((reminder, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {new Date(reminder).toLocaleString()}
                      </span>
                      <button 
                        onClick={() => openCalendar(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.task)}&details=${encodeURIComponent(`Reminder for: ${task.task}`)}&dates=${new Date(reminder).toISOString().replace(/-|:|\.\d\d\d/g, '')}`)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                        title="Add to Calendar"
                      >
                        📅
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!task.completed && (
              <button 
                onClick={() => onCompleteTask(task.id)} 
                className="btn btn-primary w-10 h-10 min-w-10 min-h-10 rounded-xl"
                aria-label="Complete task"
              >
                ✓
              </button>
            )}
            <button 
              onClick={() => onEditTask(task)} 
              className="btn-icon w-10 h-10 min-w-10 min-h-10 rounded-xl"
              aria-label="Edit task"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              onClick={() => onDeleteTask(task.id)} 
              className="btn-icon w-10 h-10 min-w-10 min-h-10 rounded-xl"
              aria-label="Delete task"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;