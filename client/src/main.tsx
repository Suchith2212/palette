import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { AuthProvider } from './context/AuthContext';
import { getApiOrigin } from './config/api'
import App from './App'
import './index.css'
import './theme.css'

const apiOrigin = getApiOrigin();
if (apiOrigin) {
  axios.defaults.baseURL = apiOrigin;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap App with AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
