import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFBEA] dark:bg-[#1a1410] p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-[#5C6F4C] dark:text-[#EBDDBF]">
              Oops! Something went wrong
            </h1>
            <p className="text-sm mb-6 text-gray-600 dark:text-gray-400">
              The app encountered an error. This might be because the backend is waking up.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#7A916C] dark:bg-[#3a2e20] text-white rounded-lg hover:opacity-90"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="ml-3 px-6 py-2 bg-gray-500 text-white rounded-lg hover:opacity-90"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
