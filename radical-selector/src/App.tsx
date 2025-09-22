import { useState, useEffect } from 'react';
import type { Radical, ImageInfo, SelectedImage } from './types';
import { api } from './api';
import RadicalSelector from './components/RadicalSelector';
import ImageComparison from './components/ImageComparison';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const [radicals, setRadicals] = useState<Radical[]>([]);
  const [currentRadicalIndex, setCurrentRadicalIndex] = useState(0);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load radicals on component mount
  useEffect(() => {
    loadRadicals();
  }, []);

  // Load images when radical changes
  useEffect(() => {
    if (radicals.length > 0) {
      loadImages(radicals[currentRadicalIndex].number);
      loadSelectedImage(radicals[currentRadicalIndex].number);
    }
  }, [currentRadicalIndex, radicals]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        return; // Don't interfere with input fields
      }
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          handleRadicalChange(Math.max(currentRadicalIndex - 1, 0));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          handleRadicalChange(Math.min(currentRadicalIndex + 1, radicals.length - 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentRadicalIndex, radicals.length]);

  const loadRadicals = async () => {
    try {
      setLoading(true);
      console.log('Loading radicals...');
      const radicalsData = await api.getRadicals();
      console.log('Radicals loaded:', radicalsData.length);
      setRadicals(radicalsData);
      setError(null);
    } catch (err) {
      console.error('Error loading radicals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load radicals');
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async (radicalNumber: number) => {
    try {
      setLoading(true);
      console.log('Loading images for radical:', radicalNumber);
      const imagesData = await api.getImages(radicalNumber);
      console.log('Images loaded:', imagesData.length);
      setImages(imagesData);
    } catch (err) {
      console.error('Error loading images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedImage = async (radicalNumber: number) => {
    try {
      console.log('Loading selected image for radical:', radicalNumber);
      const selectedImageData = await api.getSelectedImage(radicalNumber);
      console.log('Selected image loaded:', selectedImageData);
      setSelectedImage(selectedImageData);
    } catch (err) {
      console.error('Error loading selected image:', err);
      setSelectedImage(null);
    }
  };

  const handleRadicalChange = (index: number) => {
    setCurrentRadicalIndex(index);
  };

  const handleImageSelect = async (imageInfo: ImageInfo) => {
    try {
      await api.selectImage(
        imageInfo.folder, 
        imageInfo.filename, 
        radicals[currentRadicalIndex].number
      );
      
      // Auto-advance to next radical if not at the end
      if (currentRadicalIndex < radicals.length - 1) {
        handleRadicalChange(currentRadicalIndex + 1);
      }
    } catch (err) {
      alert('Failed to select image: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const currentRadical = radicals[currentRadicalIndex];

  console.log('App render state:', {
    loading,
    error,
    radicalsCount: radicals.length,
    currentRadicalIndex,
    currentRadical: currentRadical?.number,
    imagesCount: images.length
  });

  if (loading && radicals.length === 0) {
    return (
      <div className="app-loading">
        <h2>Loading radicals...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={loadRadicals}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎨 Radical Image Selector</h1>
        <p>Choose the best AI-generated image for each radical</p>
      </header>

      <main className="app-main">
        {currentRadical && (
          <>
            <RadicalSelector
              radical={currentRadical}
              totalRadicals={radicals.length}
              currentIndex={currentRadicalIndex}
              selectedImage={selectedImage}
            />
            
            <Navigation
              currentIndex={currentRadicalIndex}
              totalItems={radicals.length}
              onNext={() => handleRadicalChange(Math.min(currentRadicalIndex + 1, radicals.length - 1))}
              onPrevious={() => handleRadicalChange(Math.max(currentRadicalIndex - 1, 0))}
              onJumpTo={handleRadicalChange}
            />

            <ImageComparison
              images={images}
              loading={loading}
              onSelect={handleImageSelect}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;