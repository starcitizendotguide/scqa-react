import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import WrappedApp from './components/App';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import * as serviceWorker from './serviceWorker';

const root = createRoot(document.getElementById('root'));
root.render(  
  <Router>
    <Routes>
      <Route path="/" element={<WrappedApp />} />
    </Routes>
  </Router>,)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.register();
