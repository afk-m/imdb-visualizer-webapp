const cheerio = require('cheerio');
const moment = require('moment'); // for date parsing
const scrapeData = require('../utils/scrapeData');

const textToNum = (text) => {
    const dic = { 'K': 1000, 'M': 1000000 };
    const lastChar = text[text.length - 1];

    if (lastChar in dic) {
        const num = parseFloat(text.slice(0, -1));
        return num * dic[lastChar];
    } else {
        return parseFloat(text);
    }
};

const parseData = async (htmlData, url) => {
    const soup = cheerio.load(htmlData);
    let seriesRating = soup('span.sc-bde20123-1.cMEQkK').text().trim();
    seriesRating = seriesRating.includes('.') ? parseFloat(seriesRating) : parseInt(seriesRating);
    const seriesVotes = textToNum(soup('div.sc-bde20123-3.gPVQxL').text().trim());

    let overallSeriesData = [seriesRating, seriesVotes];
    console.log(overallSeriesData)

    let seasonTabHtml = await scrapeData(url + 'episodes/?season=');
    console.log(seasonTabHtml)
    let seasonSoup = cheerio.load(seasonTabHtml);
    let seasonTabs = seasonSoup('a[data-testid="tab-season-entry"]');
    let seasons = [];
    seasonTabs.each((i, elem) => {
        try {
            console.log(elem)
            let seasonNumber = parseInt(seasonSoup(elem).text().trim());
            seasons.push(seasonNumber);
        } catch (error) {
            console.error(`Skipping non-integer season tab: ${seasonSoup(elem).text().trim()}`);
        }
    });

    seasons = Array.from({ length: parseInt(seasonTabs.last().text().trim()) }, (_, i) => i + 1);
    const showName = seasonSoup('h2.sc-a885edd8-9.dcErWY').text().trim();
    overallSeriesData.push(showName);

    let posterTag = seasonSoup(`img[alt="${showName}"].ipc-image`);
    let posterUrl = posterTag.length ? posterTag.attr('src') : 'Image not found';

    // regex
    const epnum = /S[0-9]+\.E([0-9]+)/;
    const ratingmatch = /(\d+(?:\.\d+)?)/;
    const votesmatch = /\(([^)]*)\)/;

    let cumulativeEpisodeNumber = 0;
    let seriesEpisodeData = [];
    console.log(seasons)
    console.log(showName)
    for (let season of seasons) {
        let seasonHtml = await scrapeData(url + 'episodes/?season=' + String(season));
        let seasonSoup = cheerio.load(seasonHtml);
        let episodes = seasonSoup('div.kyIRYf');

        episodes.each((i, episode) => {
            let episodeElem = seasonSoup(episode);
            let title = episodeElem.find('div.ipc-title__text').text().trim();
            let episodeNumber = parseInt(title.split(' ∙ ')[0].match(epnum)[1]);
            cumulativeEpisodeNumber += 1;
            title = title.split(' ∙ ')[1];

            try {
                let rating = episodeElem.find('span.ipc-rating-star').text().trim();
                let ratingValue = parseFloat(rating.match(ratingmatch)[1]);
                let votes = textToNum(rating.match(votesmatch)[1]);
                let airDate = moment(episodeElem.find('span.fyHWhz').text().trim(), 'ddd, MMM DD, YYYY').toDate();
                let description = episodeElem.find('div.ipc-html-content-inner-div').text().trim();

                let episodeData = [season, episodeNumber, cumulativeEpisodeNumber, title, airDate, ratingValue, votes, description];
                seriesEpisodeData.push(episodeData);
            } catch (error) {
                console.error('Error parsing episode data:', error);
            }
        });
    }

    console.log(seriesEpisodeData)
    return { seriesEpisodeData, showName };
};

module.exports = parseData;
