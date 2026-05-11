export async function importOffers(req, res) {
  try {
    const response = await fetch('http://microservices:5000/api/ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Error in microservices ingestion',
        details: await response.text(),
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error importing offers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function importLocalJSON(req, res) {
  try {
    const response = await fetch('http://microservices:5000/api/ingest/local', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Error in microservices ingestion',
        details: await response.text(),
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error importing local JSON:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
