import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API = "http://localhost:8004";  // Changed port to 8004

const Insights = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API}/tasks`);
        setTasks(res.data || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Calculate statistics
  const totals = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = totals - completed;
  
  // Group by priority
  const byPriority = tasks.reduce((acc, t) => {
    const priority = t.priority || "Unspecified";
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});
  
  // Group by category
  const byCategory = tasks.reduce((acc, t) => {
    const category = t.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Calculate completion percentage
  const completionPercentage = totals > 0 ? Math.round((completed / totals) * 100) : 0;

  // Chart data for category distribution
  const categoryChartData = {
    labels: Object.keys(byCategory),
    datasets: [
      {
        label: 'Tasks by Category',
        data: Object.values(byCategory),
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(124, 58, 237, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(124, 58, 237, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for priority distribution
  const priorityChartData = {
    labels: Object.keys(byPriority),
    datasets: [
      {
        label: 'Tasks by Priority',
        data: Object.values(byPriority),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Task Distribution',
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Loading Insights...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Productivity Insights</h1>
          <p className="text-xl text-gray-300">Analyze your task patterns and productivity metrics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass-card p-6 text-center rounded-2xl hover:ai-glow transition-all duration-300">
            <div className="text-4xl font-bold text-indigo-400 mb-3">{totals}</div>
            <div className="text-gray-300">Total Tasks</div>
          </div>
          <div className="glass-card p-6 text-center rounded-2xl hover:ai-glow transition-all duration-300">
            <div className="text-4xl font-bold text-green-400 mb-3">{completed}</div>
            <div className="text-gray-300">Completed</div>
          </div>
          <div className="glass-card p-6 text-center rounded-2xl hover:ai-glow transition-all duration-300">
            <div className="text-4xl font-bold text-yellow-400 mb-3">{pending}</div>
            <div className="text-gray-300">Pending</div>
          </div>
          <div className="glass-card p-6 text-center rounded-2xl hover:ai-glow transition-all duration-300">
            <div className="text-4xl font-bold text-cyan-400 mb-3">{completionPercentage}%</div>
            <div className="text-gray-300">Completion Rate</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Distribution Chart */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Category Distribution</h3>
            <div className="h-80">
              {Object.keys(byCategory).length > 0 ? (
                <Bar data={categoryChartData} options={chartOptions} />
              ) : (
                <p className="text-gray-400 text-center py-6">No tasks categorized yet</p>
              )}
            </div>
          </div>

          {/* Priority Distribution Chart */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Priority Distribution</h3>
            <div className="h-80">
              {Object.keys(byPriority).length > 0 ? (
                <Pie data={priorityChartData} options={chartOptions} />
              ) : (
                <p className="text-gray-400 text-center py-6">No tasks prioritized yet</p>
              )}
            </div>
          </div>

          {/* Productivity Tips */}
          <div className="glass-card p-6 rounded-2xl lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-6">Productivity Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
                <div className="mt-1 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Focus on High Priority Tasks</h4>
                  <p className="text-gray-300 text-sm mt-1">Complete high-priority tasks first to maximize impact</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
                <div className="mt-1 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Balance Your Categories</h4>
                  <p className="text-gray-300 text-sm mt-1">Ensure a healthy balance across different life areas</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
                <div className="mt-1 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Review Regularly</h4>
                  <p className="text-gray-300 text-sm mt-1">Regularly review and update your task priorities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;