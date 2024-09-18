import React, { useState } from 'react';
import { db } from '../firebase'; // Import Firestore
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import './JoinSession.css'

const JoinSession = () => {
  const location = useLocation();
  const { userId, username } = location.state || {}; // Extract userId and username from state
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();
  const joinSession = async () => {
    if (!sessionId || !userId || !username) {
      alert("Please enter a session ID and ensure userId and username are provided.");
      return;
    }

    try {
      const sessionRef = doc(db, 'shoppingSessions', sessionId);
      console.log("UserId: ",userId);
      await updateDoc(sessionRef, {
        // userIds: arrayUnion(userId.userId),
        // users: arrayUnion({ userId: userId.userId, username: username.username }) // Add user object with both userId and username
        userIds: arrayUnion(userId),
        users: arrayUnion({ userId: userId, username: username })
      });

      console.log("Successfully joined session with ID:", sessionId);
      navigate(`/session/${sessionId}`);
    } 
    catch (error) {
      console.error("Error joining session:", error);
      alert("Failed to join the session. Please check the session ID and try again.");
    }
  };
  const closeModal = () => {
    navigate(-1); // Navigate back to the previous page
  };
  return (
    <div className="modal">
    <div className="modal-content">
      <h2>Join an Existing Session</h2>
      <input
        type="text"
        placeholder="Enter Session ID"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        className="input-field"
      />
      <button onClick={joinSession} className="btn btn-primary">Join Session</button>
      <button onClick={closeModal} className="btn btn-secondary">Close</button>
    </div>
  </div>
  );
};

export default JoinSession;

