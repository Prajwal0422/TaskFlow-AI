import React from 'react';

const AIBotButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="floating-btn btn-icon w-16 h-16 rounded-2xl ai-glow pulse animate-float"
      aria-label="AI Assistant"
    >
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
      </div>
    </button>
  );
};

export default AIBotButton;