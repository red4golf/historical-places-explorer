import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import { readJson } from './src/utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Configure paths
const CONTENT_DIR = path.join(__dirname, 'content');
const LOCATIONS_DIR = path.join(CONTENT_DIR, 'locations');
const DRAFTS_DIR = path.join(LOCATIONS_DIR, 'drafts');
const MEDIA_DIR = path.join(CONTENT_DIR, 'media');
const STORIES_DIR = path.join(CONTENT_DIR, 'stories');

// Ensure directories exist
await Promise.all([
  fs.mkdir(CONTENT_DIR, { recursive: true }),
  fs.mkdir(LOCATIONS_DIR, { recursive: true }),
  fs.mkdir(DRAFTS_DIR, { recursive: true }),
  fs.mkdir(MEDIA_DIR, { recursive: true }),
  fs.mkdir(STORIES_DIR, { recursive: true })
]);

// Get all locations (both verified and drafts)
app.get('/api/locations', async (req, res) => {
  try {
    console.log('Getting all locations...');
    
    // Get verified locations
    const verifiedFiles = await fs.readdir(LOCATIONS_DIR);
    const verifiedLocations = await Promise.all(
      verifiedFiles
        .filter(file => file.endsWith('.json') && !file.startsWith('.'))
        .map(async file => {
          try {
            const location = await readJson(path.join(LOCATIONS_DIR, file));
            console.log('Loaded verified location:', location.name);
            return { ...location, isDraft: false };
          } catch (error) {
            console.error('Error reading location file:', file, error);
            return null;
          }
        })
    );

    // Get draft locations
    const draftFiles = await fs.readdir(DRAFTS_DIR);
    const draftLocations = await Promise.all(
      draftFiles
        .filter(file => file.endsWith('.json') && !file.startsWith('.'))
        .map(async file => {
          try {
            const location = await readJson(path.join(DRAFTS_DIR, file));
            console.log('Loaded draft location:', location.name);
            return { ...location, isDraft: true };
          } catch (error) {
            console.error('Error reading draft file:', file, error);
            return null;
          }
        })
    );

    // Filter out any failed reads and combine locations
    const allLocations = [...verifiedLocations, ...draftLocations]
      .filter(location => location !== null);
    
    console.log(`Sending ${allLocations.length} locations`);
    res.json(allLocations);
  } catch (error) {
    console.error('Error loading locations:', error);
    res.status(500).json({ error: 'Failed to load locations', details: error.message });
  }
});

// Serve everything in /dist if it exists (for production)
app.use(express.static('dist'));

// Handle client-side routing
app.get('*', (req, res) => {
  // Send the index.html for any requests that don't match an API route or static file
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
Historical Places Explorer API Server
-------------------------------
API server running at: http://localhost:${PORT}

Content Directories:
- Locations: ${LOCATIONS_DIR}
- Drafts: ${DRAFTS_DIR}
- Media: ${MEDIA_DIR}
- Stories: ${STORIES_DIR}

Ready to serve location data!
`);
});
