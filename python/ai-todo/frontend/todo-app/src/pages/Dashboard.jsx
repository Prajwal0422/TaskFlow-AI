import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import AIBotButton from '../components/AIBotButton';
import AISuggestionsModal from '../components/AISuggestionsModal';
import EditTaskModal from '../components/EditTaskModal';
import UserProfile from '../components/UserProfile';

const API = import.meta.env.VITE_API_URL || "http://localhost:8002";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, completionRate: 0 });

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/tasks`);
      const tasksData = res.data || [];
      setTasks(tasksData);
      
      // Calculate stats
      const total = tasksData.length;
      const completed = tasksData.filter(t => t.completed).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      setStats({ total, completed, completionRate });
    } catch (error) {
      console.error("Error loading tasks:", error);
      alert("Could not load tasks. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/add-task`, taskData);
      // response returns the created task
      const created = res.data.task;
      setTasks(prev => [created, ...prev]);
      
      // Update stats
      const newTotal = tasks.length + 1;
      const completionRate = newTotal > 0 ? Math.round((stats.completed / newTotal) * 100) : 0;
      setStats(prev => ({ ...prev, total: newTotal, completionRate }));
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Add task failed");
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/edit-task`, {
        id: taskId,
        ...taskData
      });
      // Update the task in the state
      setTasks(prev => prev.map(task => task.id === taskId ? res.data.task : task));
      
      // Reload stats
      const updatedTasks = tasks.map(task => task.id === taskId ? res.data.task : task);
      const total = updatedTasks.length;
      const completed = updatedTasks.filter(t => t.completed).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      setStats({ total, completed, completionRate });
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Update task failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      await axios.post(`${API}/delete-task`, { id: taskId });
      // Remove task from state
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Update stats
      const newTotal = updatedTasks.length;
      const completed = updatedTasks.filter(t => t.completed).length;
      const completionRate = newTotal > 0 ? Math.round((completed / newTotal) * 100) : 0;
      setStats({ total: newTotal, completed, completionRate });
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Delete task failed");
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      setLoading(true);
      // Find the task to get its current data
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error("Task not found");
      }
      
      // Update the task as completed
      const res = await axios.post(`${API}/edit-task`, {
        id: taskId,
        user_id: task.user_id || "default_user",
        task: task.task,
        due_date: task.due_date,
        reminders: task.reminders || [],
        recurrence: task.recurrence,
        estimated_minutes: task.estimated_minutes,
        completed: true,
        status: "completed"
      });
      
      // Update the task in the state
      setTasks(prev => prev.map(t => t.id === taskId ? res.data.task : t));
      
      // Reload stats
      const updatedTasks = tasks.map(t => t.id === taskId ? res.data.task : t);
      const total = updatedTasks.length;
      const completed = updatedTasks.filter(t => t.completed).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      setStats({ total, completed, completionRate });
      
      // Show success message
      alert("Task marked as completed!");
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Failed to mark task as completed");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = (taskId, updatedTaskData) => {
    updateTask(taskId, updatedTaskData);
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
  };

  const getAI = async () => {
    try {
      setLoading(true);
      
      // Get user profile (in a real app, this would come from auth)
      const userStats = {
        avg_completion_time: 45,
        priority_completion_rate: {"High":0.7,"Medium":0.5,"Low":0.3},
        category_completion_rate: {"Work":0.6,"Health":0.8}
      };
      
      const res = await axios.post(`${API}/ai-suggest`, {
        tasks: tasks,
        user_stats: userStats,
        now: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        user_input: "What should I do next?"
      });
      setAiSuggestions(res.data);
      setIsModalOpen(true);
      // reload tasks to reflect categories/priorities updated by backend
      await loadTasks();
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      // Check if it's an API key error
      const errorMessage = error?.response?.data?.detail || error.message;
      if (errorMessage.includes("API key")) {
        alert("Google API key not configured. Please set your API key in the backend .env file. " + errorMessage);
      } else if (errorMessage.includes("quota") || errorMessage.includes("429")) {
        alert("Google API quota exceeded. Please check your plan and billing details");
      } else {
        alert("AI suggestion failed: " + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Task Dashboard</h1>
          <p className="text-xl text-gray-300">Manage your tasks with AI-powered insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Task Input and User Profile */}
          <div className="lg:col-span-1 space-y-6">
            <TaskInput onAddTask={addTask} />
            
            <div className="glass-card p-6 text-center rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-3">AI-Powered Insights</h3>
              <p className="text-gray-300 mb-4">
                Get smart suggestions for task prioritization and categorization
              </p>
              <button 
                onClick={getAI}
                className="btn btn-primary w-full rounded-xl font-bold relative overflow-hidden group"
                disabled={loading}
              >
                <span className="relative z-10">
                  {loading ? "Analyzing..." : "Get AI Suggestions"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
            
            <UserProfile />
            
            {/* Stats Card */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Task Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Tasks</span>
                  <span className="text-2xl font-bold text-indigo-400">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Completed</span>
                  <span className="text-2xl font-bold text-green-400">{stats.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Completion Rate</span>
                  <span className="text-2xl font-bold text-cyan-400">{stats.completionRate}%</span>
                </div>
              </div>
              
              {/* Progress Circle */}
              <div className="mt-6 flex justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-700 stroke-current"
                      strokeWidth="10"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    ></circle>
                    <circle
                      className="text-indigo-500 stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * stats.completionRate) / 100}
                      transform="rotate(-90 50 50)"
                    ></circle>
                    <text
                      x="50"
                      y="50"
                      fontFamily="sans-serif"
                      fontSize="20"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      className="text-white"
                    >
                      {stats.completionRate}%
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Task List */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Your Tasks</h2>
                <span className="bg-indigo-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {tasks.length} tasks
                </span>
              </div>
              
              {loading && <div className="text-gray-400 py-4">Loading...</div>}
              
              <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} onEditTask={handleEditTask} onCompleteTask={completeTask} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Bot Button */}
      <AIBotButton onClick={getAI} />

      {/* AI Suggestions Modal */}
      <AISuggestionsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        aiData={aiSuggestions} 
      />

      {/* Edit Task Modal */}
      <EditTaskModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        task={currentTask} 
        onUpdateTask={handleUpdateTask} 
      />
    </div>
  );
};

export default Dashboard;