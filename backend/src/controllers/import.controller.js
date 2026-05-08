export const importOffers = async (req, res) => {
  try {
    const microservicesUrl = process.env.MICROSERVICES_URL || 'http://microservices:5000';
    const response = await fetch(`${microservicesUrl}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Microservices API error: ${response.statusText}`);
    }

    const result = await response.json();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};