require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const TOKEN_URL = 'https://finans-api.forbrukerradet.no/auth/token';
const DEPOSITS_URL = 'https://finans-api.forbrukerradet.no/feed/bank-deposits/all';

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const response = await axios.post(TOKEN_URL, {
    grantType: 'external_consumer',
    clientId: process.env.FINANSPORTALEN_CLIENT_ID,
    clientSecret: process.env.FINANSPORTALEN_CLIENT_SECRET,
  }, {
    headers: { 'Content-Type': 'application/json' },
  });

  cachedToken = response.data.accessToken;
  tokenExpiresAt = Date.now() + (response.data.expiresIn - 60) * 1000;
  return cachedToken;
}

app.get('/api/savings', async (req, res) => {
  try {
    const token = await getAccessToken();
    const response = await axios.get(DEPOSITS_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
