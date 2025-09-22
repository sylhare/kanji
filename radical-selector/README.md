# 🎨 Radical Image Selector

A TypeScript React application to help you choose the best AI-generated radical images from different model outputs.

## Features

- 🖼️ **Side-by-side comparison** of radical images from different AI models
- 📝 **Rich metadata display** including radical meaning, composition, and visual elements
- ⌨️ **Keyboard navigation** (arrow keys or A/D keys)
- 💾 **One-click selection** to copy preferred images to a "selected" folder
- 📱 **Responsive design** that works on desktop and mobile
- 🔍 **Jump to specific radicals** with the navigation input

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## How it Works

### Backend Server
- Scans the `../_data/assets/img/radical/` directory for all generated image folders
- Loads radical metadata from YAML files in `../_data/guide/`
- Serves images and handles file copying operations
- Provides REST API endpoints for the frontend

### Frontend Interface
- Displays radical information (number, character, meaning, composition)
- Shows all available images for the current radical in a grid
- Allows you to select and copy the best image to a "selected" folder
- Provides navigation between different radicals

## API Endpoints

- `GET /api/radicals` - Get all radical metadata
- `GET /api/folders` - Get all generated image folders
- `GET /api/images/:number` - Get all images for a specific radical
- `POST /api/select-image` - Copy selected image to selected folder
- `GET /api/selected` - Get all selected images

## File Structure

```
radical-selector/
├── src/
│   ├── components/
│   │   ├── RadicalSelector.tsx    # Displays radical info
│   │   ├── Navigation.tsx         # Navigation controls
│   │   └── ImageComparison.tsx    # Image grid and selection
│   ├── App.tsx                    # Main application
│   ├── api.ts                     # API service layer
│   └── types.ts                   # TypeScript interfaces
├── server/
│   └── server.js                  # Express backend server
└── README.md
```

## Keyboard Shortcuts

- **←** or **A**: Previous radical
- **→** or **D**: Next radical
- Navigate to specific radical using the "Go to" input field

## Data Sources

The application reads from:
- **Radical images**: `../_data/assets/img/radical/generated-*/`
- **Radical metadata**: `../_data/guide/radicals_*.yml`
- **Selected images**: `../_data/assets/img/radical/selected/`

## Development

### Starting individual services:

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

**Both together:**
```bash
npm run dev
```

### Building for production:
```bash
npm run build
```

## Customization

### Adding new model folders:
1. Place generated images in `../_data/assets/img/radical/generated-[model-name]/`
2. Ensure images follow the naming pattern: `radical_001.png`, `radical_002.png`, etc.
3. The application will automatically detect and display the new images

### Modifying the UI:
- Edit component files in `src/components/`
- Update styles in the corresponding `.css` files
- The design uses a modern, responsive layout with CSS Grid and Flexbox

## Troubleshooting

### Images not loading:
- Check that the `../_data/assets/img/radical/` path exists
- Verify image files follow the correct naming convention
- Ensure the backend server is running on port 3001

### YAML metadata not loading:
- Check that `../_data/guide/` directory exists
- Verify YAML files are properly formatted
- Check server console for parsing errors

### Port conflicts:
- Frontend runs on port 5173 (Vite default)
- Backend runs on port 3001
- Modify `vite.config.ts` and `server.js` if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with React, TypeScript, Express, and a lot of ❤️ for Japanese radicals!