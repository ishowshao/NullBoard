import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Feature, features, zeroAchievement } from './features';
import CopyJoke from './CopyJoke';

function App() {
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [exploredFeatures, setExploredFeatures] = useState<Set<string>>(() => new Set());
  const achievementUnlocked = features.every((feature) => exploredFeatures.has(feature.id));
  const showMessage = activeFeature !== null;
  const feedbackId = useId();
  const [darkMode, setDarkMode] = useState(true);
  const messageTrigger = useRef<HTMLButtonElement | null>(null);
  const buttonFocus = `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${darkMode ? 'focus-visible:outline-white' : 'focus-visible:outline-black'}`;

  const showFeatureMessage = (event: React.MouseEvent<HTMLButtonElement>, feature: Feature) => {
    messageTrigger.current = event.currentTarget;
    setActiveFeature(feature);
    if (features.some((candidate) => candidate.id === feature.id)) {
      setExploredFeatures((explored) => explored.has(feature.id) ? explored : new Set(explored).add(feature.id));
    }
  };

  const dismissMessage = useCallback(() => {
    setActiveFeature(null);
    messageTrigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!showMessage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        dismissMessage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMessage, dismissMessage]);
  
  return (
    <main
      className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} flex flex-col items-center px-4 py-6 sm:px-8`}
    >
      <div className="flex justify-end w-full max-w-5xl mb-10">
        <button 
          type="button"
          aria-pressed={darkMode}
          className={`min-h-[44px] px-3 py-2 rounded ${buttonFocus} ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => setDarkMode((current) => !current)}
        >
          <span aria-hidden="true">{darkMode ? '🌙' : '☀️'} </span>
          Dark mode
          <span aria-hidden="true">: {darkMode ? 'On' : 'Off'}</span>
        </button>
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6">NullBoard Pro Max</h1>
      <p className="text-xl text-center max-w-2xl mb-10">The ultra-premium project management tool with absolutely no features, now with 50% more nothing.</p>
      
      <div className="flex flex-col gap-6 w-full max-w-md">
        {features.map((feature) => (
          <button
            key={feature.id}
            type="button"
            aria-controls={feedbackId}
            aria-expanded={activeFeature?.id === feature.id}
            className={`${feature.premium
              ? (darkMode ? 'bg-purple-800 hover:bg-purple-700' : 'bg-purple-200 hover:bg-purple-300')
              : (darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300')
            } min-h-[44px] px-4 py-2 rounded text-left ${buttonFocus}`}
            onClick={(event) => showFeatureMessage(event, feature)}
          >
            {feature.label}
          </button>
        ))}
      </div>
      
      <div className={showMessage ? `mt-10 p-4 ${darkMode ? 'bg-red-900' : 'bg-red-300'} rounded max-w-md` : ''}>
        <p id={feedbackId} className="text-center" role="status">
          {activeFeature?.message ?? ''}
        </p>
        {activeFeature && (
          <CopyJoke
            key={activeFeature.id}
            message={activeFeature.message}
            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} min-h-[44px] px-4 py-2 rounded ${buttonFocus}`}
          />
        )}
        {showMessage && (
          <div className="flex justify-center mt-4">
            <button 
              type="button"
              className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} min-h-[44px] px-4 py-2 rounded ${buttonFocus}`}
              onClick={dismissMessage}
            >
              Accept defeat
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-6 w-full max-w-md text-center">
        <p className="text-sm">
          {exploredFeatures.size} of {features.length} ways to do nothing discovered.
        </p>
        {!achievementUnlocked && (
          <p className="mt-1 text-sm">Try each different button to unlock a Certificate of Nothing.</p>
        )}
        <p aria-live="polite" aria-atomic="true">
          {achievementUnlocked ? 'Zero achievement unlocked. You tried everything. Nothing happened.' : ''}
        </p>
        {achievementUnlocked && (
          <button
            type="button"
            aria-controls={feedbackId}
            aria-expanded={activeFeature?.id === zeroAchievement.id}
            className={`mt-3 min-h-[44px] px-4 py-2 rounded ${buttonFocus} ${darkMode ? 'bg-purple-800 hover:bg-purple-700' : 'bg-purple-200 hover:bg-purple-300'}`}
            onClick={(event) => showFeatureMessage(event, zeroAchievement)}
          >
            {zeroAchievement.label}
          </button>
        )}
      </div>

      <footer className={`mt-auto pt-8 max-w-2xl text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
        <p>NullBoard: Because the backend is the root obstacle to dreams.</p>
        <p>Each interaction will remind you: "Why are you still working on this?"</p>
      </footer>
    </main>
  );
}

export default App;

