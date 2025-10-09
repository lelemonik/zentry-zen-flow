import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-background)' }}>
          <Card className="max-w-2xl w-full glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <div>
                  <CardTitle className="text-2xl">Something went wrong</CardTitle>
                  <CardDescription>
                    The application encountered an unexpected error
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="glass p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-destructive">Error Details:</h3>
                  <p className="text-sm font-mono bg-muted p-3 rounded overflow-auto">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              {this.state.errorInfo && (
                <details className="glass p-4 rounded-lg">
                  <summary className="font-semibold cursor-pointer hover:text-primary">
                    Component Stack (Click to expand)
                  </summary>
                  <pre className="text-xs mt-2 bg-muted p-3 rounded overflow-auto max-h-60">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold">Common Solutions:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Check if environment variables are set correctly</li>
                  <li>Verify your internet connection</li>
                  <li>Clear browser cache and reload</li>
                  <li>Check browser console for more details (F12)</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reload Application
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="gap-2"
                >
                  Go to Home
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-4 border-t">
                <p>If this problem persists, please check:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Environment variables in Vercel dashboard</li>
                  <li>Build logs for any deployment errors</li>
                  <li>Browser developer console for detailed error messages</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
