import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import WrappedApp from './components/App';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  
  <Router>
    <Routes>
      <Route path="/" element={<WrappedApp />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.register();
