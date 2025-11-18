import React, { useState, useContext } from 'react';
import './Modal.css';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import SuccessModal from './SuccessModal';

function LoginModal({ onClose, onSignupClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { login } = useContext(AuthContext);
  
  // Validation pattern: alphanumeric, minimum 7 chars
  const VALID_PATTERN = /^[A-Za-z0-9]{7,}$/;
  const [passwordValid, setPasswordValid] = useState(null);

  const validatePassword = (val) => {
    const ok = VALID_PATTERN.test(val);
    setPasswordValid(ok);
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Client-side validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be alphanumeric and at least 7 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/login', {
        email,
        password
      });
      
      // Store token and user data
      login(response.data.token, response.data.user);
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Close modal after success modal is shown
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); validatePassword(e.target.value); }}
              placeholder="Enter your password (alphanumeric, min 7)"
              disabled={loading}
              className={passwordValid === true ? 'input-valid' : passwordValid === false ? 'input-invalid' : ''}
            />
            <div className="validation-row">
              {passwordValid === true && <div className="validation-success"><span className="validation-icon">✔️</span><span>Looks good</span></div>}
              {passwordValid === false && <div className="validation-error"><span className="validation-icon">❌</span><span>Password must be alphanumeric, min 7</span></div>}
              {passwordValid === null && <div className="validation-hint">Use 7+ letters and numbers</div>}
            </div>
          </div>
          
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="modal-footer">
          <p>
            Don't have an account?{' '}
            <button className="text-button" onClick={onSignupClick} disabled={loading}>
              Sign up
            </button>
          </p>
        </div>
      </div>
      
      {showSuccessModal && (
        <SuccessModal
          message="Login successful!"
          onClose={() => setShowSuccessModal(false)}
          autoCloseTime={2000}
        />
      )}
      
    </div>
  );
}

export default LoginModal;