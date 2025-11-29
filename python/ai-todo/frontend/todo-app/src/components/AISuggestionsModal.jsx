import React from 'react';

const AISuggestionsModal = ({ isOpen, onClose, aiData }) => {
  if (!isOpen) return null;
  if (!aiData) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal ai-glow rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold text-white">AI Analysis</h2>
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
        <div className="modal-body">
          <p className="text-gray-400">No data</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary rounded-xl">Close</button>
        </div>
      </div>
    </div>
  );

  const categorized = aiData.categorized || [];
  const schedulePlan = aiData.schedule_plan || [];
  const reminderRecs = aiData.reminder_recs || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal ai-glow rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold text-white">AI Analysis</h2>
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
        
        <div className="modal-body">
          <div className="space-y-8">
            {/* Categorized Tasks */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Categorized Tasks</h3>
              {categorized.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {categorized.map((item, index) => (
                    <div key={index} className="glass-card p-5 rounded-2xl hover:ai-glow transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-lg">{item.task}</div>
                        <div className="flex gap-3 items-center">
                          <span className="category-tag">{item.category || 'Uncategorized'}</span>
                          <span className={`priority-badge priority-${item.priority?.toLowerCase() || 'low'}`}>
                            {item.priority || '—'}
                          </span>
                          {item.score && (
                            <span className="text-gray-400 text-sm">Score: {item.score.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No categorized tasks available</p>
              )}
            </div>
            
            {/* Schedule Plan */}
            {schedulePlan.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Suggested Schedule</h3>
                <div className="grid grid-cols-1 gap-4">
                  {schedulePlan.map((item, index) => (
                    <div key={index} className="glass-card p-5 rounded-2xl hover:ai-glow transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-lg">{item.task}</div>
                          <div className="text-gray-400 text-sm mt-1">{item.reason}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-cyan-400 font-medium">
                            {new Date(item.start_iso).toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-sm">
                            to {new Date(item.end_iso).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reminder Recommendations */}
            {reminderRecs.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Reminder Recommendations</h3>
                <div className="grid grid-cols-1 gap-4">
                  {reminderRecs.map((item, index) => (
                    <div key={index} className="glass-card p-5 rounded-2xl hover:ai-glow transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-lg">{item.task}</div>
                          <div className="text-gray-400 text-sm mt-1">Method: {item.method}</div>
                        </div>
                        <div className="text-cyan-400 font-medium">
                          {new Date(item.reminder_iso).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Next Suggested Task */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Next Suggested Task</h3>
              {aiData.next_task ? (
                <div className="glass-card p-8 text-center rounded-2xl ai-glow">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Recommended Next Task</h4>
                  <p className="text-xl text-cyan-400 font-bold mb-4">{aiData.next_task}</p>
                  {aiData.explanation && (
                    <p className="text-gray-300 text-lg">{aiData.explanation}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">No next task suggestion available</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary rounded-xl">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AISuggestionsModal;