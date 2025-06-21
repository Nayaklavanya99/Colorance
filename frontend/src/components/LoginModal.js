import React, { useState } from 'react';
import './Modal.css';

function LoginModal({ onClose, onSignupClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // In a real app, you would send a request to your backend here
    console.log('Login attempt with:', { email });
    
    // For demo purposes, just close the modal
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Login</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="submit-button">Login</button>
        </form>
        
        <div className="modal-footer">
          <p>
            Don't have an account?{' '}
            <button className="text-button" onClick={onSignupClick}>
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;