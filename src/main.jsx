import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { SettingsProvider } from './context/SettingsContext'
import './styles/global.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      const isDev = import.meta.env.DEV
      return (
        <div style={{
          padding: '2rem', fontFamily: 'sans-serif',
          background: '#EAEAF0', minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1rem'
        }}>
          <h2 style={{ color: '#E85050' }}>Something went wrong</h2>
          <p style={{ color: '#44445A', fontSize: '0.9rem' }}>
            Please refresh the page. If the problem continues, contact support.
          </p>
          {isDev && (
            <pre style={{
              background: '#fff', padding: '1.5rem', borderRadius: '8px',
              border: '1px solid #C8C8D8', maxWidth: '700px', width: '100%',
              overflow: 'auto', fontSize: '0.85rem', color: '#1A1A2E'
            }}>
              {this.state.error?.message}{'\n\n'}{this.state.error?.stack}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem', background: '#1D4ED8',
              color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </BrowserRouter>
  </ErrorBoundary>
)
