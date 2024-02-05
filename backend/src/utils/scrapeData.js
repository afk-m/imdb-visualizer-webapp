// src/utils/scrapeData.js
const axios = require('axios');

const scrapeData = async (url) => {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };
    const response = await axios.get(url, {headers});
    // console.log(response.data)
    return response.data; // HTML content
  } catch (error) {
    console.error('Error scraping data:', error);
    throw error;
  }
};

module.exports = scrapeData;