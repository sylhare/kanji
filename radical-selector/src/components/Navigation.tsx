import React, { useState } from 'react';
import './Navigation.css';

interface NavigationProps {
  currentIndex: number;
  totalItems: number;
  onNext: () => void;
  onPrevious: () => void;
  onJumpTo: (index: number) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentIndex,
  totalItems,
  onNext,
  onPrevious,
  onJumpTo
}) => {
  const [jumpToValue, setJumpToValue] = useState('');

  const handleJumpTo = (e: React.FormEvent) => {
    e.preventDefault();
    const index = parseInt(jumpToValue) - 1; // Convert to 0-based index
    if (index >= 0 && index < totalItems) {
      onJumpTo(index);
      setJumpToValue('');
    }
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalItems - 1;

  return (
    <nav className="navigation">
      <div className="nav-controls">
        <button 
          onClick={onPrevious} 
          disabled={!canGoPrevious}
          className="nav-button prev-button"
        >
          ← Previous
        </button>

        <div className="jump-to">
          <form onSubmit={handleJumpTo} className="jump-form">
            <input
              type="number"
              min="1"
              max={totalItems}
              value={jumpToValue}
              onChange={(e) => setJumpToValue(e.target.value)}
              placeholder={`1-${totalItems}`}
              className="jump-input"
            />
            <button type="submit" className="jump-button">
              Go to
            </button>
          </form>
        </div>

        <button 
          onClick={onNext} 
          disabled={!canGoNext}
          className="nav-button next-button"
        >
          Next →
        </button>
      </div>

      <div className="keyboard-shortcuts">
        <small>
          Use ← → arrow keys or A/D keys to navigate
        </small>
      </div>
    </nav>
  );
};

export default Navigation;
