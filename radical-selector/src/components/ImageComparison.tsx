import React from 'react';
import type { ImageInfo } from '../types';
import './ImageComparison.css';

interface ImageComparisonProps {
  images: ImageInfo[];
  loading: boolean;
  onSelect: (image: ImageInfo) => void;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({ 
  images, 
  loading, 
  onSelect 
}) => {
  const getModelName = (folder: string): string => {
    // Extract model name from folder name and make it readable
    return folder
      .replace('generated-', '')
      .replace(/-[a-f0-9]{8}$/, '') // Remove hash suffix
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="image-comparison loading">
        <h3>Loading images...</h3>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="image-comparison no-images">
        <h3>No images available for this radical</h3>
        <p>Images might not have been generated yet for this radical.</p>
      </div>
    );
  }

  return (
    <div className="image-comparison">
      <h3>Choose the Best Image ({images.length} options)</h3>
      
      <div className="images-grid">
        {images.map((image, index) => (
          <div key={`${image.folder}-${index}`} className="image-card">
            <div className="image-container">
              <img 
                src={`http://localhost:3001${image.url}`} 
                alt={`Radical by ${getModelName(image.folder)}`}
                className="radical-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'image-error';
                    errorDiv.textContent = 'Failed to load image';
                    parent.appendChild(errorDiv);
                  }
                }}
              />
            </div>
            
            <div className="image-info">
              <h4 className="model-name">{getModelName(image.folder)}</h4>
              <p className="folder-name">{image.folder}</p>
            </div>
            
            <button 
              className="select-button"
              onClick={() => onSelect(image)}
            >
              ✓ Select This Image
            </button>
          </div>
        ))}
      </div>
      
      <div className="selection-hint">
        <p>💡 Click "Select This Image" to copy your preferred image and automatically advance to the next radical</p>
      </div>
    </div>
  );
};

export default ImageComparison;
