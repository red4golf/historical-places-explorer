import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get root locations directory
const LOCATIONS_DIR = path.join(process.cwd(), 'content', 'locations');
const DRAFTS_DIR = path.join(LOCATIONS_DIR, 'drafts');

// Handle draft location submissions
router.post('/locations/draft', async (req, res) => {
  try {
    const locationData = req.body;
    
    // Validate required fields
    if (!locationData.name || !locationData.coordinates) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }
    
    // Save to drafts folder
    const draftPath = path.join(DRAFTS_DIR, `${locationData.id}.json`);
    
    // Ensure drafts directory exists
    await fs.mkdir(DRAFTS_DIR, { recursive: true });
    
    // Save draft location with metadata
    const draftData = {
      ...locationData,
      submittedAt: new Date().toISOString(),
      status: 'pending_review',
      reviewNotes: []
    };
    
    await fs.writeFile(
      draftPath, 
      JSON.stringify(draftData, null, 2)
    );
    
    res.json({ 
      success: true, 
      message: 'Location draft saved successfully',
      id: locationData.id
    });
  } catch (error) {
    console.error('Error saving draft location:', error);
    res.status(500).json({ 
      error: 'Failed to save draft location' 
    });
  }
});

// Get all draft locations
router.get('/locations/drafts', async (req, res) => {
  try {
    // Ensure drafts directory exists
    await fs.mkdir(DRAFTS_DIR, { recursive: true });
    
    // Read all draft files except README.md
    const files = await fs.readdir(DRAFTS_DIR);
    const drafts = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.readFile(
            path.join(DRAFTS_DIR, file), 
            'utf-8'
          );
          return JSON.parse(content);
        })
    );
    
    // Sort by submission date, newest first
    drafts.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.json(drafts);
  } catch (error) {
    console.error('Error reading draft locations:', error);
    res.status(500).json({ 
      error: 'Failed to read draft locations' 
    });
  }
});

// Delete a draft location (reject)
router.delete('/locations/draft/:id', async (req, res) => {
  try {
    const draftPath = path.join(DRAFTS_DIR, `${req.params.id}.json`);
    await fs.unlink(draftPath);
    
    res.json({ 
      success: true, 
      message: 'Draft location deleted successfully' 
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Draft location not found' });
    } else {
      res.status(500).json({ 
        error: 'Failed to delete draft location: ' + error.message 
      });
    }
  }
});

// Add review note to a draft
router.post('/locations/draft/:id/notes', async (req, res) => {
  try {
    const draftPath = path.join(DRAFTS_DIR, `${req.params.id}.json`);
    
    // Read existing draft
    const content = await fs.readFile(draftPath, 'utf-8');
    const draft = JSON.parse(content);
    
    // Add note
    const note = {
      text: req.body.note,
      timestamp: new Date().toISOString()
    };
    
    draft.reviewNotes = draft.reviewNotes || [];
    draft.reviewNotes.push(note);
    
    // Save updated draft
    await fs.writeFile(draftPath, JSON.stringify(draft, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Review note added successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to add review note: ' + error.message 
    });
  }
});

// Approve a draft location
router.post('/locations/draft/:id/approve', async (req, res) => {
  try {
    const draftPath = path.join(DRAFTS_DIR, `${req.params.id}.json`);
    
    // Read draft content
    const content = await fs.readFile(draftPath, 'utf-8');
    const draft = JSON.parse(content);
    
    // Format for approved location
    const approvedLocation = {
      id: draft.id,
      name: draft.name,
      coordinates: draft.coordinates,
      shortDescription: draft.shortDescription,
      historicalPeriods: [],
      tags: [],
      submittedAt: draft.submittedAt,
      approvedAt: new Date().toISOString()
    };
    
    // Save to main locations directory
    const locationPath = path.join(LOCATIONS_DIR, `${draft.id}.json`);
    await fs.writeFile(locationPath, JSON.stringify(approvedLocation, null, 2));
    
    // Delete draft
    await fs.unlink(draftPath);
    
    res.json({ 
      success: true, 
      message: 'Location approved and moved to main locations' 
    });
  } catch (error) {
    console.error('Error approving draft location:', error);
    res.status(500).json({ 
      error: 'Failed to approve location: ' + error.message 
    });
  }
});

export default router;