import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#f3f3e8' }}>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Pull down to refresh or tap the button below
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl text-white font-semibold"
            style={{ backgroundColor: '#d30d37' }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
