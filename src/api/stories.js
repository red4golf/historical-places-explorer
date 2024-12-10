import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get a story by filename
router.get('/stories/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    console.log('Requested story filename:', filename);
    
    const storyPath = path.join(process.cwd(), 'content', 'stories', filename);
    console.log('Full story path:', storyPath);
    
    const content = await fs.readFile(storyPath, 'utf-8');
    console.log('Story content loaded successfully');
    
    // Set explicit headers to prevent HTML interpretation
    res.set('Content-Type', 'text/markdown');
    res.set('X-Content-Type-Options', 'nosniff');
    
    res.send(content);
  } catch (error) {
    console.error('Error reading story:', error);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Story not found' });
    } else {
      res.status(500).json({ error: 'Error loading story: ' + error.message });
    }
  }
});

export default router;