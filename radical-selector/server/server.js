const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Serve static images from the radical directories
app.use('/images', express.static(path.join(__dirname, '../../_data/assets/img/radical')));

// Get all radical folders
app.get('/api/folders', async (req, res) => {
  try {
    const radicalsPath = path.join(__dirname, '../../_data/assets/img/radical');
    const entries = await fs.readdir(radicalsPath, { withFileTypes: true });
    
    const folders = entries
      .filter(entry => entry.isDirectory() && entry.name.startsWith('generated-'))
      .map(entry => entry.name)
      .sort();
    
    res.json(folders);
  } catch (error) {
    console.error('Error reading folders:', error);
    res.status(500).json({ error: 'Failed to read folders' });
  }
});

// Get radical metadata
app.get('/api/radicals', async (req, res) => {
  try {
    const guidePath = path.join(__dirname, '../../_data/guide');
    const yamlFiles = await fs.readdir(guidePath);
    const radicals = [];
    
    for (const file of yamlFiles) {
      if (file.endsWith('.yml')) {
        const filePath = path.join(guidePath, file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(content);
        
        if (data && data.radicals) {
          radicals.push(...data.radicals);
        }
      }
    }
    
    // Sort by radical number
    radicals.sort((a, b) => a.number - b.number);
    
    res.json(radicals);
  } catch (error) {
    console.error('Error reading radicals:', error);
    res.status(500).json({ error: 'Failed to read radical data' });
  }
});

// Get images for a specific radical number
app.get('/api/images/:radicalNumber', async (req, res) => {
  try {
    const radicalNumber = parseInt(req.params.radicalNumber);
    const radicalFileName = `radical_${radicalNumber.toString().padStart(3, '0')}.png`;
    
    const radicalsPath = path.join(__dirname, '../../_data/assets/img/radical');
    const entries = await fs.readdir(radicalsPath, { withFileTypes: true });
    
    const images = [];
    
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('generated-')) {
        const imagePath = path.join(radicalsPath, entry.name, radicalFileName);
        
        if (await fs.pathExists(imagePath)) {
          images.push({
            folder: entry.name,
            filename: radicalFileName,
            url: `/images/${entry.name}/${radicalFileName}`
          });
        }
      }
    }
    
    res.json(images);
  } catch (error) {
    console.error('Error reading images:', error);
    res.status(500).json({ error: 'Failed to read images' });
  }
});

// Copy selected image to selected folder
app.post('/api/select-image', async (req, res) => {
  try {
    const { folder, filename, radicalNumber } = req.body;
    
    if (!folder || !filename || !radicalNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const sourcePath = path.join(__dirname, '../../_data/assets/img/radical', folder, filename);
    const selectedDir = path.join(__dirname, '../../_data/assets/img/radical/selected');
    
    // Ensure selected directory exists
    await fs.ensureDir(selectedDir);
    
    const destPath = path.join(selectedDir, filename);
    
    // Copy the file
    await fs.copy(sourcePath, destPath);
    
    res.json({ success: true, message: `Image copied to selected folder` });
  } catch (error) {
    console.error('Error copying image:', error);
    res.status(500).json({ error: 'Failed to copy image' });
  }
});

// Get selected images
app.get('/api/selected', async (req, res) => {
  try {
    const selectedDir = path.join(__dirname, '../../_data/assets/img/radical/selected');
    
    if (!(await fs.pathExists(selectedDir))) {
      return res.json([]);
    }
    
    const files = await fs.readdir(selectedDir);
    const selectedImages = files
      .filter(file => file.startsWith('radical_') && file.endsWith('.png'))
      .map(file => ({
        filename: file,
        url: `/images/selected/${file}`
      }))
      .sort();
    
    res.json(selectedImages);
  } catch (error) {
    console.error('Error reading selected images:', error);
    res.status(500).json({ error: 'Failed to read selected images' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
