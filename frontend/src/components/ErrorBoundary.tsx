import React, { ReactNode, ReactElement } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
          <div className="card shadow-lg" style={{ maxWidth: '440px', width: '100%' }}>
            <div className="card-body p-5 text-center">
              <div className="text-danger mb-3 d-flex justify-content-center" aria-hidden>
                <AlertTriangle size={56} strokeWidth={1.5} />
              </div>
              <h2 className="fw-bold mb-2">Something went wrong</h2>
              <p className="text-muted mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                className="btn btn-primary px-4"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
              >
                Go Back Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}
