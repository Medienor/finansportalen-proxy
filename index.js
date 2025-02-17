require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Basic authentication for Finansportalen API
const auth = Buffer.from(
  `${process.env.FEED_USERNAME}:${process.env.FEED_PASSWORD}`
).toString('base64');

app.get('/api/savings', async (req, res) => {
  try {
    const response = await axios.get(
      'https://www.finansportalen.no/services/feed/v3/bank/banksparing.atom',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});