import React from 'react';
import { auth, GoogleAuthProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import './Login.css'; // Assuming you're adding a separate CSS file for styling

const Login = () => {
  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome, Please Login or SignUp To continue</h2>
        <button className="google-login-btn" onClick={signInWithGoogle}>
          <img src="google.svg" alt="Google Icon" className="google-icon" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
