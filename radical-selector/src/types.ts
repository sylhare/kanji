export interface Radical {
  number: number;
  radical: string;
  meaning: string;
  svg_description?: {
    composition?: string;
    visual_elements?: string;
  };
  strokes?: number;
  frequency?: number;
  jlpt_level?: string;
}

export interface ImageInfo {
  folder: string;
  filename: string;
  url: string;
}

export interface SelectedImage {
  filename: string;
  url: string;
  radicalNumber?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
