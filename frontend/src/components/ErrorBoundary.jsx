import React from 'react';

const isChunkLoadError = (error) => {
  const msg = error?.message || '';
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') ||
    error?.name === 'ChunkLoadError'
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      isChunkError: isChunkLoadError(error),
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error', error, errorInfo);

    // If this is a stale-chunk error and we haven't already auto-reloaded, do it silently
    if (isChunkLoadError(error)) {
      const alreadyReloaded = sessionStorage.getItem('eb_chunk_reload');
      if (!alreadyReloaded) {
        sessionStorage.setItem('eb_chunk_reload', 'true');
        window.location.reload();
        return;
      }
      sessionStorage.removeItem('eb_chunk_reload');
    }
  }

  render() {
    if (this.state.hasError) {
      // If it's a chunk error and we are about to reload, show a loading screen
      if (this.state.isChunkError) {
        return (
          <div
            style={{
              padding: '40px',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              background: '#f8fafc',
              color: '#475569',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>
              Loading updated application…
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
              A new version was deployed. Refreshing automatically.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 8,
                padding: '8px 20px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 0,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Reload now
            </button>
          </div>
        );
      }

      // Generic error screen for non-chunk errors
      return (
        <div
          style={{
            padding: '40px',
            background: '#fef2f2',
            color: '#991b1b',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <h2>Something went wrong in the React Application.</h2>
          <details
            style={{
              whiteSpace: 'pre-wrap',
              background: '#fff',
              padding: '20px',
              borderRadius: '0px',
              maxWidth: '800px',
              overflowX: 'auto',
            }}
          >
            <summary style={{ fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
              Error Details
            </summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
            }}
            style={{
              marginTop: 20,
              padding: '8px 20px',
              background: '#991b1b',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;