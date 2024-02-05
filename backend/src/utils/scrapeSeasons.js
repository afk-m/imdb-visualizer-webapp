const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to scrape a single season's data
const scrapeSeasonData = async (baseUrl, seasonNum, headers) => {
  const seasonUrl = `${baseUrl}episodes/?season=${seasonNum}`;
  try {
    const response = await axios.get(seasonUrl, { headers });
    const soup = cheerio.load(response.data);
    // Process the season's data here, for example:
    // const episodes = soup('...').map(...).get();
    // return episodes or any relevant data extracted from the season page
  } catch (error) {
    console.error(`Error scraping season ${seasonNum} data:`, error);
    throw error;
  }
};

const scrapeSeasons = async (tvUrl) => {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  };

  try {
    const response = await axios.get(tvUrl, { headers });
    const soup = cheerio.load(response.data);

    const seasontabs = soup('li[data-testid="tab-season-entry"]');
    const seasons = [];
    seasontabs.each((i, elem) => {
      seasons.push(parseInt(soup(elem).text().trim()));
    });

    const maxSeason = Math.max(...seasons);
    const allSeasons = Array.from({ length: maxSeason }, (_, i) => i + 1);

    const showName = soup('h2.sc-a885edd8-9.dcErWY').text().trim();

    // New: Loop over each season and scrape its data
    const seasonsData = [];
    for (const seasonNum of allSeasons) {
      const seasonData = await scrapeSeasonData(tvUrl, seasonNum, headers);
      seasonsData.push({ season: seasonNum, data: seasonData });
    }

    return { showName, seasonsData };
  } catch (error) {
    console.error('Error scraping season list:', error);
    throw error;
  }
};

module.exports = scrapeSeasons;
