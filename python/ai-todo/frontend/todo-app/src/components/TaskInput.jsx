import React, { useState } from 'react';

const TaskInput = ({ onAddTask }) => {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [reminders, setReminders] = useState(['']);
  const [recurrence, setRecurrence] = useState('');
  
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim()) {
      // Filter out empty reminders
      const validReminders = reminders.filter(r => r.trim() !== '');
      
      onAddTask({ 
        user_id: "default_user", // In a real app, this would come from auth
        task: task.trim(),
        due_date: dueDate || null,
        estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        reminders: validReminders,
        recurrence: recurrence || null
      });
      
      // Reset form
      setTask('');
      setDueDate('');
      setEstimatedMinutes('');
      setReminders(['']);
      setRecurrence('');
      
      // Show success message for reminders
      if (validReminders.length > 0) {
        alert('Task added successfully with reminders updated!');
      } else {
        alert('Task added successfully!');
      }
    }
  };

  // Function to open calendar with task details
  const openCalendar = () => {
    // Create a calendar event URL (Google Calendar example)
    const title = encodeURIComponent(task);
    const details = encodeURIComponent(`Task: ${task}`);
    const startDate = dueDate || new Date().toISOString().split('T')[0];
    
    // Google Calendar event creation URL
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startDate}/${startDate}`;
    
    // Open in new tab
    window.open(calendarUrl, '_blank');
  };

  // Function to add reminder to calendar
  const addReminderToCalendar = (reminderDateTime) => {
    if (reminderDateTime) {
      const title = encodeURIComponent(`Reminder: ${task}`);
      const details = encodeURIComponent(`Reminder for task: ${task}`);
      const dateTime = new Date(reminderDateTime);
      const formattedDateTime = dateTime.toISOString().replace(/-|:|\.\d\d\d/g, '');
      
      // Google Calendar event creation URL for reminder
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${formattedDateTime}/${formattedDateTime}`;
      
      // Open in new tab
      window.open(calendarUrl, '_blank');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card ai-glow p-6 rounded-2xl border-2 border-indigo-500/30">
      <h3 className="text-2xl font-bold text-white mb-4">Add New Task</h3>
      <div className="space-y-4">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What do you need to do?"
          className="w-full input-field py-4 px-5 text-white placeholder-gray-400 font-medium text-lg rounded-xl"
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input-field py-3 px-4 text-white rounded-xl"
            placeholder="Due date"
          />
          <input
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            className="input-field py-3 px-4 text-white rounded-xl"
            placeholder="Est. minutes"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-white font-medium">Recurrence</label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className="input-field py-3 px-4 text-white rounded-xl w-full"
          >
            <option value="">No recurrence</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-white font-medium">Reminders</label>
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
                className="input-field py-3 px-4 text-white rounded-xl flex-1"
              />
              {reminder && (
                <button 
                  type="button"
                  onClick={() => addReminderToCalendar(reminder)}
                  className="btn btn-secondary px-3 rounded-xl"
                  title="Add to Calendar"
                >
                  📅
                </button>
              )}
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
        
        <div className="flex gap-3">
          <button 
            type="submit" 
            className="btn btn-primary flex-1 py-4 font-bold text-lg rounded-xl text-white relative overflow-hidden group"
            disabled={!task.trim()}
          >
            <span className="relative z-10">Add Task</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <button 
            type="button" 
            onClick={openCalendar}
            className="btn btn-secondary py-4 px-6 font-bold text-lg rounded-xl text-white relative overflow-hidden group"
            disabled={!task.trim()}
          >
            <span className="relative z-10">📅</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaskInput;