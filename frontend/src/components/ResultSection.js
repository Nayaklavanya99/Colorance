import React from 'react';
import './ResultSection.css';

function ResultSection({ originalImage, colorizedImage, onDownload }) {
  return (
    <section className="result-section">
      <h2>Colorization Result</h2>
      
      <div className="image-comparison">
        <div className="image-container">
          <h3>Original</h3>
          <img src={originalImage} alt="Original black and white" className="result-image" />
        </div>
        
        <div className="image-container">
          <h3>Colorized</h3>
          <img src={colorizedImage} alt="Colorized version" className="result-image" />
        </div>
      </div>
      
      <div className="download-section">
        <button className="download-button" onClick={onDownload}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Colorized Image
        </button>
      </div>
    </section>
  );
}

export default ResultSection;