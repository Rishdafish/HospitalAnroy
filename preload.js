// Preload script for Electron
// Set up debug logging to file
const fs = require('fs');
const path = require('path');
const logPath = path.join(__dirname, 'debug_log.txt');
// Start fresh log
try { fs.writeFileSync(logPath, `=== DEBUG LOG ${new Date().toISOString()} ===\n`); } catch (e) {}
// Override console.error to capture into debug log
const origConsoleError = console.error;
console.error = function(...args) {
  try {
    const line = `[${new Date().toISOString()}] ${args.map(arg => (
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    )).join(' ')}\n`;
    fs.appendFileSync(logPath, line);
  } catch (e) {
    // ignore file errors
  }
  origConsoleError.apply(console, args);
};
// Initialize DOM content handler
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  
  // Add debugging information to the page
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found!');
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found!</div>';
    return;
  }
  
  // If the page stays white, this will at least show something
  if (!rootElement.children || rootElement.children.length === 0) {
    console.log('Root element is empty, adding fallback content');
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1 style="color: #333; margin-bottom: 20px;">Loading Application...</h1>
        <p>If this message persists, there may be an issue with React initialization.</p>
        <div id="debug-info" style="margin-top: 20px; font-size: 12px; color: #666;"></div>
      </div>
    `;
    
    // Show debugging information
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
      debugInfo.innerHTML = `
        <p>App Version: 1.0.0</p>
        <p>Platform: ${navigator.platform}</p>
        <p>User Agent: ${navigator.userAgent}</p>
        <p>Window Size: ${window.innerWidth}x${window.innerHeight}</p>
      `;
    }
  }
  
  // Display React and ReactDOM versions for debugging
  console.log('React version:', window.React ? window.React.version : 'Not loaded');
  console.log('ReactDOM version:', window.ReactDOM ? window.ReactDOM.version : 'Not loaded');
  
  // Add extra error handling for React router issues
  window.addEventListener('error', (event) => {
    // Suppress devtools protocol loadNetworkResource unsupported URL scheme errors
    if (event.error && typeof event.error.message === 'string' &&
        (event.error.message.includes('Unsupported URL scheme') ||
         event.error.message.includes('Network.loadNetworkResource'))) {
      return;
    }
    console.error('Global error caught:', event.error);
    
    // Look for React Router related errors
    if (event.error && event.error.message && 
        (event.error.message.includes('Router') || 
         event.error.message.includes('route') || 
         event.error.message.includes('history'))) {
      
      console.error('React Router error detected, attempting to recover...');
      
      // Try to provide some useful information to the user
      const errorInfo = document.createElement('div');
      errorInfo.style.padding = '20px';
      errorInfo.style.backgroundColor = '#fff3cd';
      errorInfo.style.color = '#856404';
      errorInfo.style.border = '1px solid #ffeeba';
      errorInfo.style.borderRadius = '4px';
      errorInfo.style.margin = '20px';
      
      errorInfo.innerHTML = `
        <h3>Navigation Error Detected</h3>
        <p>There was a problem navigating to this page. Try refreshing or going back to the home page.</p>
        <a href="#/" style="display: inline-block; margin-top: 10px; padding: 5px 10px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Go Home</a>
      `;
      
      // Try to append to root or body
      if (rootElement && rootElement.children.length === 0) {
        rootElement.appendChild(errorInfo);
      } else {
        document.body.appendChild(errorInfo);
      }
    }
  });
  
  // You can expose node modules to the renderer process here if needed
  window.electron = {
    // Add any functions you want to expose to your React app
    isMac: navigator.platform.includes('Mac'),
    isWindows: navigator.platform.includes('Win'),
    goToRoute: (route) => {
      window.location.hash = route;
    }
  };
});