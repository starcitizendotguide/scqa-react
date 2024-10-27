import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import video_background from './styles/assets/background.webm';
import video_poster from './styles/assets/header.webp';

import Home from './pages/Home';
import Star from './pages/Star';
import GenericNotFound from './pages/GenericNotFound';

const App = () => {
  return (
    <Router>
      <div className="z-[-1] fixed w-full h-full overflow-hidden inset-y-0">
        <video autoPlay muted loop poster={video_poster} className="object-cover w-screen h-screen fixed left-0 top-0">
          <source src={video_background} type="video/webm" />
        </video>
      </div>

      <div className="md:container md:mx-auto">
        <Routes>
          <Route exact path="/" Component={Home} />
          <Route exact path="/star/:id" Component={Star} />

          <Route exact path="/404" Component={GenericNotFound} />
          <Route path="*" element={<Navigate to='/404' />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;