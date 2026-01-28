import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

import { AuthProvider } from './services/AuthContext';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Leaderboard from './pages/Leaderboard';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
