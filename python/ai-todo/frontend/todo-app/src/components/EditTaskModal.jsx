import React, { useState, useEffect } from 'react';

const EditTaskModal = ({ isOpen, onClose, task, onUpdateTask }) => {
  const [editedTask, setEditedTask] = useState({
    task: '',
    category: 'General',
    priority: 'Medium',
    due_date: '',
    estimated_minutes: '',
    completed: false,
    status: 'pending',
    reminders: ['']
  });
  
  const [reminders, setReminders] = useState(['']);
  
  const addReminderField = () => {
    setReminders([...reminders, '']);
  };
  
  const removeReminderField = (index) => {
    const newReminders = reminders.filter((_, i) => i !== index);
    setReminders(newReminders);
  };
  
  const updateReminderField = (index, value) => {
    const newReminders = [...reminders];
    newReminders[index] = value;
    setReminders(newReminders);
  };

  useEffect(() => {
    if (task) {
      setEditedTask({
        task: task.task || '',
        category: task.category || 'General',
        priority: task.priority || 'Medium',
        due_date: task.due_date || '',
        estimated_minutes: task.estimated_minutes || '',
        completed: task.completed || false,
        status: task.status || 'pending'
      });
      
      // Initialize reminders from task
      if (task.reminders && task.reminders.length > 0) {
        setReminders(task.reminders);
      } else {
        setReminders(['']);
      }
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editedTask.task.trim()) {
      // Filter out empty reminders
      const validReminders = reminders.filter(r => r.trim() !== '');
      
      onUpdateTask(task.id, {
        ...editedTask,
        user_id: "default_user", // In a real app, this would come from auth
        reminders: validReminders
      });
      onClose();
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal ai-glow rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold text-white">Edit Task</h2>
          <button 
            onClick={onClose}
            className="btn-icon w-10 h-10 min-w-10 min-h-10 rounded-xl"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-6">
              <div>
                <label htmlFor="task" className="block text-gray-300 mb-2 font-medium">Task Description</label>
                <input
                  type="text"
                  id="task"
                  value={editedTask.task}
                  onChange={(e) => setEditedTask({...editedTask, task: e.target.value})}
                  className="input-field w-full py-3 px-4 rounded-xl text-white"
                  placeholder="What needs to be done?"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-gray-300 mb-2 font-medium">Category</label>
                  <select
                    id="category"
                    value={editedTask.category}
                    onChange={(e) => setEditedTask({...editedTask, category: e.target.value})}
                    className="input-field w-full py-3 px-4 rounded-xl text-white"
                  >
                    <option value="General">General</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                    <option value="Study">Study</option>
                    <option value="Finance">Finance</option>
                    <option value="Home">Home</option>
                    <option value="Errand">Errand</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-gray-300 mb-2 font-medium">Priority</label>
                  <select
                    id="priority"
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({...editedTask, priority: e.target.value})}
                    className="input-field w-full py-3 px-4 rounded-xl text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="due_date" className="block text-gray-300 mb-2 font-medium">Due Date</label>
                  <input
                    type="date"
                    id="due_date"
                    value={editedTask.due_date}
                    onChange={(e) => setEditedTask({...editedTask, due_date: e.target.value})}
                    className="input-field w-full py-3 px-4 rounded-xl text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="estimated_minutes" className="block text-gray-300 mb-2 font-medium">Estimated Minutes</label>
                  <input
                    type="number"
                    id="estimated_minutes"
                    value={editedTask.estimated_minutes}
                    onChange={(e) => setEditedTask({...editedTask, estimated_minutes: e.target.value})}
                    className="input-field w-full py-3 px-4 rounded-xl text-white"
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-gray-300 font-medium">Reminders</label>
                  <button 
                    type="button"
                    onClick={addReminderField}
                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                  >
                    + Add Reminder
                  </button>
                </div>
                
                {reminders.map((reminder, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={reminder}
                      onChange={(e) => updateReminderField(index, e.target.value)}
                      className="input-field w-full py-3 px-4 rounded-xl text-white"
                    />
                    {reminders.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeReminderField(index)}
                        className="btn btn-secondary px-3 rounded-xl"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="status" className="block text-gray-300 mb-2 font-medium">Status</label>
                  <select
                    id="status"
                    value={editedTask.status}
                    onChange={(e) => setEditedTask({...editedTask, status: e.target.value})}
                    className="input-field w-full py-3 px-4 rounded-xl text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="reminded">Reminded</option>
                    <option value="snoozed">Snoozed</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={editedTask.completed}
                    onChange={(e) => setEditedTask({...editedTask, completed: e.target.checked})}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="completed" className="ml-2 block text-gray-300 font-medium">
                    Completed
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary rounded-xl">Cancel</button>
            <button type="submit" className="btn btn-primary rounded-xl">Update Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;