import React, { useState } from 'react';
import './Navbar.css';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';

function Navbar() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">Colorance</span>
        </div>
        <div className="navbar-links">
          <a href="/" className="active">Home</a>
          <button className="nav-button" onClick={() => setShowLoginModal(true)}>Login</button>
          <button className="nav-button signup" onClick={() => setShowSignupModal(true)}>Sign Up</button>
        </div>
      </div>
      
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} onSignupClick={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }} />
      )}
      
      {showSignupModal && (
        <SignupModal onClose={() => setShowSignupModal(false)} onLoginClick={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }} />
      )}
    </nav>
  );
}

export default Navbar;