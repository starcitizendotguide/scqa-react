import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import video_background from './styles/assets/background.webm';
import video_poster from './styles/assets/header.webp';
import './styles/App.scss';

import Home from './pages/Home';
import Star from './pages/Star';
import GenericNotFound from './pages/GenericNotFound';

const App = () => {
  return (
    <Router>
      <div className="video-container">
        <video autoPlay muted loop poster={video_poster} className="background-video">
          <source src={video_background} type="video/webm" />
        </video>
      </div>

      <div className="md:container md:mx-auto">
        <Routes>
          <Route exact path="/" element={<Home />} />

          <Route exact path="/star/:id" Component={Star} />
          <Route exact path="/404" Component={GenericNotFound} />
          <Route path="*" element={<Navigate to='/404' />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;