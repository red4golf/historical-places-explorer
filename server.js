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

// Serve the static files directly
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets')));

// Serve media files
app.use('/content/media', express.static(path.join(__dirname, 'content', 'media')));

// Add the route handlers
app.use('/api', draftLocationsRouter);
app.use('/api', storiesRouter);

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

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const VALID_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
];

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const type = req.body.type || 'image';
        if (type === 'image' && !VALID_IMAGE_TYPES.includes(file.mimetype)) {
            cb(new Error('Invalid image type. Use JPG, PNG, or GIF'));
            return;
        }
        if (type === 'document' && !VALID_DOCUMENT_TYPES.includes(file.mimetype)) {
            cb(new Error('Invalid document type. Use PDF, DOC, DOCX, TXT, or MD'));
            return;
        }
        cb(null, true);
    }
});

// API Routes
// Locations API endpoints
const LOCATIONS_DIR = path.join(__dirname, 'content', 'locations');

async function getAllLocations() {
    const files = await fs.readdir(LOCATIONS_DIR);
    return Promise.all(
        files
            .filter(file => file.endsWith('.json'))
            .map(async file => {
                const content = await fs.readFile(path.join(LOCATIONS_DIR, file), 'utf8');
                return JSON.parse(content);
            })
    );
}

async function saveLocation(locationData) {
    const filePath = path.join(LOCATIONS_DIR, `${locationData.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(locationData, null, 2));
}

// API Routes
app.get('/api/locations', async (req, res) => {
    try {
        // Ensure the locations directory exists
        await fs.mkdir(LOCATIONS_DIR, { recursive: true });
        const locations = await getAllLocations();
        res.json(locations);
    } catch (error) {
        console.error('Error loading locations:', error);
        res.status(500).json({ error: 'Error loading locations: ' + error.message });
    }
});

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

app.post('/api/locations/:id', async (req, res) => {
    try {
        await saveLocation(req.body);
        res.json({ message: 'Location saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error saving location: ' + error.message });
    }
});

app.delete('/api/locations/:id', async (req, res) => {
    try {
        const filePath = path.join(LOCATIONS_DIR, `${req.params.id}.json`);
        await fs.unlink(filePath);
        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Location not found' });
        } else {
            res.status(500).json({ error: 'Error deleting location: ' + error.message });
        }
    }
});

// Media handling endpoints
app.post('/api/media/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }
        res.json({
            filename: req.file.filename,
            path: `/content/media/${req.body.type || 'image'}/${req.file.filename}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete media file
app.delete('/api/media/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const types = ['image', 'document'];
        
        for (const type of types) {
            const filePath = path.join(__dirname, 'content', 'media', type, filename);
            try {
                await fs.access(filePath);
                await fs.unlink(filePath);
                return res.json({ message: 'File deleted successfully' });
            } catch (err) {
                continue;
            }
        }
        
        throw new Error('File not found');
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// This should be the LAST route
app.get('*', (req, res) => {
    // Log requested URL for debugging
    console.log('Requested URL:', req.url);
    
    // Determine which HTML file to serve
    if (req.url.startsWith('/admin')) {
        res.sendFile(path.join(__dirname, 'dist', 'admin.html'));
    } else {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
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
- Serving static files from: ${path.join(__dirname, 'dist')}
- Media files from: ${path.join(__dirname, 'content', 'media')}
- API routes enabled
- React routing enabled

Ready to explore local history!
`);
});

// Helper function to get local IP address
function getLocalIP() {
    const nets = os.networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip internal and non-IPv4 addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}