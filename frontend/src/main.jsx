import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// YENİ: i18n konfigürasyonunu import et
import './i18n/i18n.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);



//import { StrictMode } from 'react'
//import { createRoot } from 'react-dom/client'
//import './index.css'
//import App from './App.jsx'

//createRoot(document.getElementById('root')).render(
// <StrictMode>
    //<App />
  //</StrictMode>,
//)
