import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { auth } from './firebase';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CreateSession from './components/CreateSession';
import Login from './components/Login';
import SessionDetail from './components/SessionDetail';
import JoinSession from './components/JoinSession'; // Import the JoinSession component

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={user ? <CreateSession userId={user.uid} /> : <Navigate to="/login" />} />
        <Route path="/session/:sessionId" element={<SessionDetail />} />
        <Route path="/join" element={<JoinSession userId={user ? user.uid : null} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
