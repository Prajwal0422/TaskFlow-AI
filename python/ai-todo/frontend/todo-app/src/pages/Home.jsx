import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-cyan-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-4 py-16 relative z-10">
        <div className="container text-center max-w-4xl">
          {/* AI Hologram Animation */}
          <div className="mb-12 flex justify-center">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30 animate-float">
                <div className="w-40 h-40 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-400/30">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-400/30">
                    <div className="text-4xl">🤖</div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 rounded-full bg-cyan-400 opacity-20 blur-xl animate-pulse"></div>
            </div>
          </div>

          {/* Tagline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-indigo-200">
            Smart Tasks. Smarter Decisions.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Powered by AI. Designed for productivity. Built for the future.
          </p>

          {/* CTA Button */}
          <div className="mb-16">
            <Link 
              to="/dashboard" 
              className="btn btn-primary text-lg px-8 py-4 rounded-2xl font-bold relative overflow-hidden group"
            >
              <span className="relative z-10">Start Now → Dashboard</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <div className="glass-card p-6 rounded-2xl hover:ai-glow transition-all duration-300">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2 text-white">AI Categorization</h3>
              <p className="text-gray-300">Automatically sorts tasks into relevant categories using advanced AI</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl hover:ai-glow transition-all duration-300">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-white">Smart Prioritization</h3>
              <p className="text-gray-300">Intelligently assigns priority levels based on context and deadlines</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl hover:ai-glow transition-all duration-300">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2 text-white">Productivity Insights</h3>
              <p className="text-gray-300">Gain valuable analytics to improve your productivity and workflow</p>
            </div>
            
            <div className="glass-card p-6 rounded-2xl hover:ai-glow transition-all duration-300">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2 text-white">Natural Language</h3>
              <p className="text-gray-300">Interact with your tasks using conversational AI commands</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;