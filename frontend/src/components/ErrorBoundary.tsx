import React, { ReactNode, ReactElement } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardBody className="p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-6 break-words">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
              >
                Go Back Home
              </Button>
            </CardBody>
          </Card>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}
