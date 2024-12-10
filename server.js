import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import route handlers
import draftLocationsRouter from './src/api/draftLocations.js';
import storiesRouter from './src/api/stories.js';

const app = express();

// Add JSON body parsing
app.use(express.json());

// Configure multer for media uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.body.type || 'image';
        const dir = path.join(__dirname, 'content', 'media', type);
        fs.mkdir(dir, { recursive: true })
            .then(() => cb(null, dir))
            .catch(err => cb(err));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${path.parse(file.originalname).name}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage });

// API Routes
const LOCATIONS_DIR = path.join(__dirname, 'content', 'locations');

// Get all locations
app.get('/api/locations', async (req, res) => {
    try {
        await fs.mkdir(LOCATIONS_DIR, { recursive: true });
        const files = await fs.readdir(LOCATIONS_DIR);
        const locations = await Promise.all(
            files
                .filter(file => file.endsWith('.json') && !file.startsWith('.'))
                .map(async file => {
                    const content = await fs.readFile(path.join(LOCATIONS_DIR, file), 'utf8');
                    return JSON.parse(content);
                })
        );
        res.json(locations);
    } catch (error) {
        console.error('Error loading locations:', error);
        res.status(500).json({ error: 'Error loading locations: ' + error.message });
    }
});

// Get a single location
app.get('/api/locations/:id', async (req, res) => {
    try {
        const filePath = path.join(LOCATIONS_DIR, `${req.params.id}.json`);
        const content = await fs.readFile(filePath, 'utf8');
        res.json(JSON.parse(content));
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Location not found' });
        } else {
            res.status(500).json({ error: 'Error loading location: ' + error.message });
        }
    }
});

// Add the route handlers
app.use('/api', draftLocationsRouter);
app.use('/api', storiesRouter);

// Get a story
app.get('/api/stories/:filename', async (req, res) => {
    try {
        const storyPath = path.join(__dirname, 'content', 'stories', req.params.filename);
        console.log('Loading story from:', storyPath);
        const content = await fs.readFile(storyPath, 'utf-8');
        res.set('Content-Type', 'text/markdown');
        res.send(content);
    } catch (error) {
        console.error('Error reading story:', error);
        res.status(500).json({ error: 'Error loading story' });
    }
});

// Media file upload
app.post('/api/media/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
        filename: req.file.filename,
        path: `/media/${req.file.filename}`
    });
});

// Static file serving
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/content/media', express.static(path.join(__dirname, 'content', 'media')));

// Catch-all route for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
Historical Places Explorer Server
-------------------------------
Local: http://localhost:${PORT}
Network: http://${getLocalIP()}:${PORT}

Server Details:
- API routes enabled
- Static files: ${path.join(__dirname, 'dist')}
- Media files: ${path.join(__dirname, 'content', 'media')}
- Stories: ${path.join(__dirname, 'content', 'stories')}

Ready to explore local history!
`);
});

function getLocalIP() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}