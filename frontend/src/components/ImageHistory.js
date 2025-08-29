import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './ImageHistory.css';

function ImageHistory() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
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

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/images/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Remove the image from the local state
      setImages(images.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    }
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
                    onClick={() => setPreviewImage({src: `data:image/jpeg;base64,${image.original_image}`, title: 'Original Image'})}
                  />
                </div>
                <div className="history-image-container">
                  <h4>Colorized</h4>
                  <img 
                    src={`data:image/jpeg;base64,${image.colorized_image}`} 
                    alt="Colorized" 
                    className="history-image" 
                    onClick={() => setPreviewImage({src: `data:image/jpeg;base64,${image.colorized_image}`, title: 'Colorized Image'})}
                  />
                </div>
              </div>
              <div className="history-actions">
                <div className="action-buttons">
                  <button 
                    className="download-button small" 
                    onClick={() => handleDownload(image.colorized_image, `colorized-${image.id}.jpg`)}
                  >
                    Download
                  </button>
                  <button 
                    className="delete-button small" 
                    onClick={() => handleDelete(image.id)}
                  >
                    Delete
                  </button>
                </div>
                <span className="history-date">
                  {new Date(image.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {previewImage && (
        <div className="preview-modal" onClick={() => setPreviewImage(null)}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={() => setPreviewImage(null)}>×</button>
            <h3>{previewImage.title}</h3>
            <img src={previewImage.src} alt={previewImage.title} className="preview-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageHistory;