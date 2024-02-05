// src/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const scrapingRoutes = require('./routes/scrapingRoutes');


// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// Define a simple route for testing
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Use the scraping routes
app.use('/api', scrapingRoutes);