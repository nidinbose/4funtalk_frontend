import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import store from './Redux/store.js'
import Navbar from './Components/Utilities/Navbar.jsx'

// ── Global 401 interceptor ───────────────────────────────────────────────────
// Temporarily disabled aggressive auto-logout so admins are not instantly booted
// if an API endpoint fails auth verification.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // We log the 401 but let the component handle the error gracefully
    // rather than forcing a full page redirect.
    if (error.response?.status === 401) {
      console.warn("API returned 401 Unauthorized, but auto-logout is disabled.");
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      {/* <Navbar/> */}
      <App />
    </Provider>
  </StrictMode>,
)

