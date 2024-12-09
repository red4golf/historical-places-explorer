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
    const storyPath = path.join(process.cwd(), 'content', 'stories', req.params.filename);
    const content = await fs.readFile(storyPath, 'utf-8');
    res.type('text/markdown').send(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Story not found' });
    } else {
      res.status(500).json({ error: 'Error loading story: ' + error.message });
    }
  }
});

export default router;