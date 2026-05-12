import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { store } from './app/store'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'font-body text-sm',
            style: {
              background: '#0D0D0D',
              color: '#FAFAF8',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#E8FF47', secondary: '#0D0D0D' } },
            error:   { iconTheme: { primary: '#FF4444', secondary: '#FAFAF8' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
