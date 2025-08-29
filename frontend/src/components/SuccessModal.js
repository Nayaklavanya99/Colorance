import React, { useEffect } from 'react';
import './Modal.css';

function SuccessModal({ message, onClose, autoCloseTime = 2000 }) {
  useEffect(() => {
    // Auto close after specified time
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseTime);
    
    return () => clearTimeout(timer);
  }, [onClose, autoCloseTime]);

  return (
    <div className="modal-overlay">
      <div className="modal success-modal">
        <div className="modal-header">
          <h2>Success</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="success-content">
          <div className="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;