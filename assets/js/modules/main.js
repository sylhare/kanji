// Main entry point for the Kanji application
// This file bundles all modules and exposes necessary global functions for compatibility

// Import all consolidated modules
import './ui.js';
import './visualization.js';

// The modules automatically initialize their functionality and expose global functions
// ui.js exposes: showSorts, showCategories, show, showAll via window object
// visualization.js exposes: filterGraph, updateSimulation, updateNodeSize via window object

// Export a namespace for potential future use
export const KanjiApp = {
    version: '2.0.0',
    initialized: true
};

// Log successful initialization
console.log('🎌 Kanji app modules loaded');

// Make KanjiApp available globally if needed
if (typeof window !== 'undefined') {
    window.KanjiApp = KanjiApp;
}

