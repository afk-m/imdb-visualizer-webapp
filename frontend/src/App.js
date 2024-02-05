import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataVisualization from './components/DataVisualization';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';
import FloatingModal from './components/git-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [episodeData, setEpisodeData] = useState([]);
  const [showName, setShowName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode', !isDarkMode);
  };

  const imdbSeasonUrlPattern = new RegExp('^https://www\.imdb\.com/title/tt\\d+/$');

  const handleInputChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    
    const isValid = imdbSeasonUrlPattern.test(inputUrl);
    setIsValidUrl(isValid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidUrl) {
      alert("Please enter a valid IMDb series URL.");
      return;
    }
    
    console.log("URL is valid:", url);
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/scrape-and-parse', { urlToScrape: url });

      console.log(response)
      
      const { seriesEpisodeData, showName } = response.data;

      console.log(seriesEpisodeData)
      console.log(showName)

      setEpisodeData(seriesEpisodeData);
      setShowName(showName)
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <FloatingModal/>
      <h1>IMDb TV Data Analysis</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={handleInputChange}
          placeholder="Enter IMDb show URL -> https://www.imdb.com/title/ttxxxxxxx/"
          className={`form-control ${!isValidUrl ? 'is-invalid' : ''}`}
          style={{textAlign: 'center', margin: 10 + 'px'}}
        />
        {!isValidUrl && <div className="invalid-feedback">Please enter a valid IMDb season URL.</div>}
        <button className="btn btn-primary" type="submit" disabled={isLoading}>Scrape</button>
      </form>
      <div className="App">
        <button className="btn btn-secondary" onClick={toggleDarkMode}>
          Toggle Dark Mode
        </button>
        {isLoading ? (
          <p style={{textAlign: 'center', margin: 10 + 'px'}}>Loading...</p>
        ) : (
          <div className="container mt-4">
            <div className="row justify-content-center">
              <div className="col-md-8 px-0">
                <DataVisualization title={`${showName} Ratings Over Time`} data={episodeData} visualizationType="lineGraph" isDarkMode={isDarkMode} />
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-md-8 px-0">
                <DataVisualization title={`Average Rating per ${showName} Season`} data={episodeData} visualizationType="barChart" isDarkMode={isDarkMode} />
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-md-8 px-0">
                <DataVisualization title={`Rating per ${showName} Episode`} data={episodeData} visualizationType="areaChart" isDarkMode={isDarkMode} />
              </div>
            </div>
          </div>
        )}
        <footer className="footer mt-auto py-3 text-center">
          <div className="container">
            <span>Coded by Matthew Nocera-Iozzo. <a href=''>Source Code</a></span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
