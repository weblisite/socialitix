import { Router } from 'express';

const router = Router();

// Polar.sh webhook
router.post('/polar', async (req, res) => {
  try {
    res.json({
      message: 'Polar.sh webhook endpoint - implementation coming soon'
    });
  } catch (error) {
    console.error('Polar webhook error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// AssemblyAI webhook
router.post('/assemblyai', async (req, res) => {
  try {
    res.json({
      message: 'AssemblyAI webhook endpoint - implementation coming soon'
    });
  } catch (error) {
    console.error('AssemblyAI webhook error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 