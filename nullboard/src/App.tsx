import React, { useState } from 'react';

function App() {
  const [showMessage, setShowMessage] = useState(false);
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6">NullBoard Pro</h1>
      <p className="text-xl mb-10">The premium project management tool with absolutely no features.</p>
      
      <div className="flex flex-col gap-6 w-full max-w-md">
        <button 
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-left"
          onClick={() => setShowMessage(true)}
        >
          Create a new task
        </button>
        
        <button 
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-left"
          onClick={() => setShowMessage(true)}
        >
          Add tags
        </button>
        
        <button 
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-left"
          onClick={() => setShowMessage(true)}
        >
          Collaborate with team
        </button>
        
        <button 
          className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-left"
          onClick={() => setShowMessage(true)}
        >
          Save your progress
        </button>
      </div>
      
      {showMessage && (
        <div className="mt-10 p-4 bg-red-900 rounded max-w-md">
          <p className="text-center">
            Sorry, that feature doesn't exist. This is NullBoard Pro - same as NullBoard, but with a fancier name.
          </p>
          <div className="flex justify-center mt-4">
            <button 
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded"
              onClick={() => setShowMessage(false)}
            >
              Accept defeat
            </button>
          </div>
        </div>
      )}
      
      <footer className="mt-auto pt-8 text-gray-500 text-sm">
        <p>NullBoard: Because the backend is the root obstacle to dreams.</p>
        <p>Each interaction will remind you: "Why are you still working on this?"</p>
      </footer>
    </div>
  );
}

export default App;
