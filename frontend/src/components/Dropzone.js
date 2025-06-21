import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import './Dropzone.css';

function Dropzone({ onImageUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setFileError('');
    
    if (rejectedFiles && rejectedFiles.length > 0) {
      setFileError('Please upload a valid image file (JPG, PNG, BMP, TIFF)');
      return;
    }
    
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        setFileError('Please upload an image file');
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError('Image size should be less than 10MB');
        return;
      }
      
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => {
      setIsDragging(false);
      setFileError('Please upload a valid image file (JPG, PNG, BMP, TIFF)');
    }
  });

  return (
    <>
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h3>Drag & Drop your black and white image here</h3>
          <p>or click to browse files</p>
          <p className="file-info">Supports JPG, PNG, BMP, TIFF (max 10MB)</p>
        </div>
      </div>
      {fileError && <div className="file-error">{fileError}</div>}
    </>
  );
}

export default Dropzone;