import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/App.scss';

import { initCache } from './algoliaCache';

initCache();
const root = createRoot(document.getElementById('root'));
root.render(<App />,);