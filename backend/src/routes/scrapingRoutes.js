const express = require('express');
const scrapeData = require('../utils/scrapeData');
const parseData = require('../utils/parseData');
const router = express.Router();

router.post('/scrape-and-parse', async (req, res) => {
  const { urlToScrape } = req.body;
  console.log(urlToScrape)
  try {
    const htmlData = await scrapeData(urlToScrape);
    const { seriesEpisodeData, showName } = await parseData(htmlData, urlToScrape);
    console.log(seriesEpisodeData)
    console.log(showName)
    res.json({ seriesEpisodeData: seriesEpisodeData, showName: showName }) 
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

module.exports = router;
