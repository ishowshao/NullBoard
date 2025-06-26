import React, { useState } from 'react';

function App() {
  const [showMessage, setShowMessage] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} flex flex-col items-center justify-center p-4`}>
      <div className="absolute top-4 right-4">
        <button 
          className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
      
      <h1 className="text-4xl font-bold mb-6">NullBoard Pro Max</h1>
      <p className="text-xl mb-10">The ultra-premium project management tool with absolutely no features, now with 50% more nothing.</p>
      
      <div className="flex flex-col gap-6 w-full max-w-md">
        <button 
          className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded text-left`}
          onClick={() => setShowMessage(true)}
        >
          Create a new task
        </button>
        
        <button 
          className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded text-left`}
          onClick={() => setShowMessage(true)}
        >
          Add tags
        </button>
        
        <button 
          className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded text-left`}
          onClick={() => setShowMessage(true)}
        >
          Collaborate with team
        </button>
        
        <button 
          className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded text-left`}
          onClick={() => setShowMessage(true)}
        >
          Save your progress
        </button>
        
        <button 
          className={`${darkMode ? 'bg-purple-800 hover:bg-purple-700' : 'bg-purple-200 hover:bg-purple-300'} px-4 py-2 rounded text-left`}
          onClick={() => setShowMessage(true)}
        >
          ✨ Premium AI Assistant (New!)
        </button>
      </div>
      
      {showMessage && (
        <div className={`mt-10 p-4 ${darkMode ? 'bg-red-900' : 'bg-red-300'} rounded max-w-md`}>
          <p className="text-center">
            Sorry, that feature doesn't exist. This is NullBoard Pro Max - same as NullBoard Pro, but with an even fancier name and 50% more disappointment.
          </p>
          <div className="flex justify-center mt-4">
            <button 
              className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded`}
              onClick={() => setShowMessage(false)}
            >
              Accept defeat
            </button>
          </div>
        </div>
      )}
      
      <footer className={`mt-auto pt-8 ${darkMode ? 'text-gray-500' : 'text-gray-600'} text-sm`}>
        <p>NullBoard: Because the backend is the root obstacle to dreams.</p>
        <p>Each interaction will remind you: "Why are you still working on this?"</p>
      </footer>
    </div>
  );
}

export default App;
