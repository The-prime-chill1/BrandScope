import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { dataStore } from './services/dataStore';

const root = ReactDOM.createRoot(document.getElementById('root'));

dataStore.initialize().finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
