import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { AuthProvider } from "./providers/AuthProvider"
import { LoadingProvider } from "./providers/LoadingProvider"
import { DataProvider } from "./providers/DataProvider"

import App from './App.jsx'
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <LoadingProvider>
            <App />
          </LoadingProvider>
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  </StrictMode >,
)
