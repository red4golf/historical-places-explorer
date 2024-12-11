import express from 'express';
import multer from 'multer';
import { LocationFileHandler } from '../utils/locationFileHandler.js';
import { validateLocation } from '../utils/locationHelpers.js';

const router = express.Router();
const fileHandler = new LocationFileHandler(process.env.BASE_PATH);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'content/media/images');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  }
});

// Get all locations (both verified and drafts)
router.get('/locations', async (req, res) => {
  try {
    const verifiedLocations = await fileHandler.getAllLocations(false);
    const draftLocations = await fileHandler.getAllLocations(true);
    res.json({ verified: verifiedLocations, drafts: draftLocations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new draft location
router.post('/locations/draft', async (req, res) => {
  try {
    const locationData = req.body;
    const { isValid, errors } = validateLocation(locationData);
    
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const filename = await fileHandler.createDraftLocation(locationData);
    res.status(201).json({ filename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update existing location
router.put('/locations/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { isDraft } = req.query;
    const locationData = req.body;
    
    const { isValid, errors } = validateLocation(locationData);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    const newFilename = await fileHandler.updateLocation(filename, locationData, Boolean(isDraft));
    res.json({ filename: newFilename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify draft location
router.post('/locations/verify/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const locationData = req.body;
    
    const newFilename = await fileHandler.verifyLocation(filename, locationData);
    res.json({ filename: newFilename });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete location
router.delete('/locations/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { isDraft } = req.query;
    
    await fileHandler.deleteLocation(filename, Boolean(isDraft));
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload media
router.post('/locations/media', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { caption } = req.body;
    const filename = req.file.filename;
    const path = `/content/media/images/${filename}`;

    res.json({ filename, path, caption });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;