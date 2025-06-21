import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Dropzone from './components/Dropzone';
import Navbar from './components/Navbar';
import ResultSection from './components/ResultSection';

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [colorizedImage, setColorizedImage] = useState(null);
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (file) => {
    setLoading(true);
    setError('');
    setColorizedImage(null);
    
    try {
      // Display the original image
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target.result);
      };
      reader.readAsDataURL(file);

      // Send the image to the backend for colorization
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/colorize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 seconds timeout for large images
      });

      // Display the colorized image
      setColorizedImage(`data:image/jpeg;base64,${response.data.colorized_image}`);
      setFilename(response.data.filename);
    } catch (err) {
      console.error('Error colorizing image:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The image might be too large or the server is busy.');
      } else if (!navigator.onLine) {
        setError('You appear to be offline. Please check your internet connection.');
      } else {
        setError('Failed to colorize image. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (colorizedImage) {
      const link = document.createElement('a');
      link.href = colorizedImage;
      link.download = filename || 'colorized-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <section className="hero">
          <h1>Transform Black & White Images with AI</h1>
          <p>Upload your image and watch the magic happen</p>
        </section>

        <Dropzone onImageUpload={handleImageUpload} />

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing your image...</p>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {originalImage && colorizedImage && (
          <ResultSection 
            originalImage={originalImage} 
            colorizedImage={colorizedImage} 
            onDownload={handleDownload} 
          />
        )}
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Colorance. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;