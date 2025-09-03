import React from 'react';
import type { Radical } from '../types';
import './RadicalSelector.css';

interface RadicalSelectorProps {
  radical: Radical;
  totalRadicals: number;
  currentIndex: number;
}

const RadicalSelector: React.FC<RadicalSelectorProps> = ({ 
  radical, 
  totalRadicals, 
  currentIndex 
}) => {
  return (
    <div className="radical-selector">
      <div className="radical-info">
        <div className="radical-header">
          <div className="radical-number">#{radical.number}</div>
          <div className="radical-character">{radical.radical}</div>
          <div className="progress">{currentIndex + 1} / {totalRadicals}</div>
        </div>
        
        <div className="radical-details">
          <div className="meaning">
            <strong>Meaning:</strong> {radical.meaning}
          </div>
          
          {radical.svg_description?.composition && (
            <div className="composition">
              <strong>Composition:</strong> {radical.svg_description.composition}
            </div>
          )}
          
          {radical.svg_description?.visual_elements && (
            <div className="visual-elements">
              <strong>Visual Elements:</strong> {radical.svg_description.visual_elements}
            </div>
          )}
          
          <div className="meta-info">
            {radical.strokes && <span className="strokes">Strokes: {radical.strokes}</span>}
            {radical.jlpt_level && <span className="jlpt">JLPT: {radical.jlpt_level}</span>}
            {radical.frequency && <span className="frequency">Frequency: {radical.frequency}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadicalSelector;
