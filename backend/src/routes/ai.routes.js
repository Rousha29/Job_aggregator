import express from 'express';

const router = express.Router();

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8000';

router.post('/compare', async (req, res) => {
      try {
            const response = await fetch(`${AI_BASE_URL}/compare`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(req.body),
            });

            const text = await response.text();
            res.status(response.status).type(response.headers.get('content-type') || 'application/json').send(text);
      } catch (error) {
            res.status(502).json({ error: 'AI service unavailable' });
      }
});

export default router;
