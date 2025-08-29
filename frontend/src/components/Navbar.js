import React, { useState, useContext } from 'react';
import './Navbar.css';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import { AuthContext } from '../context/AuthContext';

function Navbar({ onHistoryClick, showHistory }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">Colorance</span>
        </div>
        <div className="navbar-links">
          <a href="/" className={!showHistory ? "active" : ""}>Home</a>
          {currentUser && (
            <a href="#" className={showHistory ? "active" : ""} onClick={(e) => {e.preventDefault(); onHistoryClick();}}>History</a>
          )}
          
          {currentUser ? (
            <>
              <span className="user-name">Hello, {currentUser.name}</span>
              <a href="#" onClick={(e) => {e.preventDefault(); logout();}}>Logout</a>
            </>
          ) : (
            <>
              <button className="nav-button" onClick={() => setShowLoginModal(true)}>Login</button>
              <button className="nav-button signup" onClick={() => setShowSignupModal(true)}>Sign Up</button>
            </>
          )}
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