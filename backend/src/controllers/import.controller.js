// Ingestion depuis le frontend (avec body)
const triggerIndexing = () => {
  const aiUrl = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
  fetch(`${aiUrl}/index`, { method: 'POST' })
    .then((r) => {
      if (!r.ok) console.error('Indexation failed:', r.status);
    })
    .catch((err) => console.error('Indexation error:', err));
};

export async function importOffers(req, res) {
  try {
    // 1. Ingestion via microservice
    const ingestResponse = await fetch('http://microservices:5000/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!ingestResponse.ok) {
      return res.status(ingestResponse.status).json({
        error: 'Error in microservices ingestion',
        details: await ingestResponse.text(),
      });
    }

    const data = await ingestResponse.json();

    // 2. Indexation IA — fire and forget (intentionnel)
    // On ne bloque pas la réponse, mais on log clairement les erreurs
    triggerIndexing();

    res.json(data);
  } catch (error) {
    console.error('Error importing offers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Ingestion depuis un fichier JSON local
export async function importLocalJSON(req, res) {
  try {
    const response = await fetch('http://microservices:5000/api/ingest/local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Error in microservices ingestion',
        details: await response.text(),
      });
    }

    const data = await response.json();

    // Indexation IA après ingestion locale
    triggerIndexing();

    res.json(data);
  } catch (error) {
    console.error('Error importing local JSON:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
