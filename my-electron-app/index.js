import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

// Make React and ReactDOM available globally for debugging
window.React = React;
window.ReactDOM = ReactDOM;

console.log('React version:', React.version);
console.log('ReactDOM version:', ReactDOM.version);

// Error boundary component to catch React rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', margin: '20px' }}>
          <h2>Application Error</h2>
          <p>Something went wrong with the application. Try refreshing the page.</p>
          <div style={{ marginTop: '20px' }}>
            <a 
              href="#/" 
              style={{ 
                display: 'inline-block', 
                padding: '8px 16px', 
                backgroundColor: '#0275d8', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '4px' 
              }}
            >
              Go to Home Page
            </a>
          </div>
          <details style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
          </details>
        </div>
      );
    }

    return this.props.children; 
  }
}

// Use a function to ensure proper mounting
function renderApp() {
  console.log('Attempting to render app...');
  const container = document.getElementById('root');
  
  if (!container) {
    console.error('Root container not found!');
    return;
  }
  
  try {
    console.log('Mounting React app with error boundary...');
    ReactDOM.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>, 
      container
    );
    console.log('React app mounted successfully!');
  } catch (error) {
    console.error('Failed to mount React app:', error);
    container.innerHTML = `
      <div style="padding: 20px; color: red; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; margin: 20px;">
        <h2>Error Rendering Application</h2>
        <p>${error.message}</p>
        <pre>${error.stack}</pre>
        <div style="margin-top:.20px;">
          <a href="#/" style="display: inline-block; padding: 8px 16px; background-color: #0275d8; color: white; text-decoration: none; border-radius: 4px;">
            Go to Home Page
          </a>
        </div>
      </div>
    `;
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}