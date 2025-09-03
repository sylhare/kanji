import type { Radical, ImageInfo, SelectedImage } from './types';

const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api';

export const api = {
  // Get all radical folders
  async getFolders(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/folders`);
    if (!response.ok) throw new Error('Failed to fetch folders');
    return response.json();
  },

  // Get radical metadata
  async getRadicals(): Promise<Radical[]> {
    const response = await fetch(`${API_BASE}/radicals`);
    if (!response.ok) throw new Error('Failed to fetch radicals');
    return response.json();
  },

  // Get images for a specific radical number
  async getImages(radicalNumber: number): Promise<ImageInfo[]> {
    const response = await fetch(`${API_BASE}/images/${radicalNumber}`);
    if (!response.ok) throw new Error('Failed to fetch images');
    return response.json();
  },

  // Select an image (copy to selected folder)
  async selectImage(folder: string, filename: string, radicalNumber: number): Promise<void> {
    const response = await fetch(`${API_BASE}/select-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder, filename, radicalNumber }),
    });
    if (!response.ok) throw new Error('Failed to select image');
  },

  // Get selected images
  async getSelectedImages(): Promise<SelectedImage[]> {
    const response = await fetch(`${API_BASE}/selected`);
    if (!response.ok) throw new Error('Failed to fetch selected images');
    return response.json();
  }
};
