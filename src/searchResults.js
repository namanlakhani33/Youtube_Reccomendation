// SearchResults.js
import React from 'react';
import searchResults from './searchResults.json';
import './SearchResults.css';

const SearchResults = () => {
  return (
    <div className="search-results-container">
      {searchResults.map((video, index) => (
        <div key={index} className="video-card">
          <div className="video-thumbnail">
            <img src={video.thumbnail} alt={video.title} />
          </div>
          <div className="video-details">
            <h2 className="video-title">{video.title}</h2>
            <p className="video-info">Channel: {video.channel}</p>
            <p className="video-info">Views: {video.views}</p>
            <p className="video-info">Duration: {video.duration}</p>
            <div className="video-chapters">
              <p className="chapter-title">Chapters:</p>
              <ul>
                {video.chapters.map((chapter, i) => (
                  <li key={i}>{chapter}</li>
                ))}
              </ul>
            </div>
            <p className="watch-video">
              <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                Watch Video
              </a>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
