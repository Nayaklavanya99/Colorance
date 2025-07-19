import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './ImageHistory.css';

function ImageHistory() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchImages = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/images/history');
        setImages(response.data.images);
      } catch (err) {
        console.error('Error fetching image history:', err);
        setError('Failed to load image history');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [currentUser]);

  const handleDownload = (imageData, filename) => {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${imageData}`;
    link.download = filename || 'colorized-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentUser) {
    return (
      <div className="history-container">
        <h2>Please log in to view your image history</h2>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>Your Image History</h2>
      
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your images...</p>
        </div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : images.length === 0 ? (
        <p className="no-images">You haven't colorized any images yet</p>
      ) : (
        <div className="history-grid">
          {images.map((image) => (
            <div key={image.id} className="history-item">
              <div className="history-images">
                <div className="history-image-container">
                  <h4>Original</h4>
                  <img 
                    src={`data:image/jpeg;base64,${image.original_image}`} 
                    alt="Original" 
                    className="history-image" 
                  />
                </div>
                <div className="history-image-container">
                  <h4>Colorized</h4>
                  <img 
                    src={`data:image/jpeg;base64,${image.colorized_image}`} 
                    alt="Colorized" 
                    className="history-image" 
                  />
                </div>
              </div>
              <div className="history-actions">
                <button 
                  className="download-button small" 
                  onClick={() => handleDownload(image.colorized_image, `colorized-${image.id}.jpg`)}
                >
                  Download
                </button>
                <span className="history-date">
                  {new Date(image.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageHistory;