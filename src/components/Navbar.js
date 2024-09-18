import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Firebase Auth import
import { signOut } from 'firebase/auth'; // Firebase signOut
import './Navbar.css';

const Navbar = ({ username }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login page after signout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-name">meesho</span>
      </div>
      <div className="navbar-links">
        {username ? (
          <>
            <span className="username-display">Welcome, {username}</span>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="btn btn-light"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
