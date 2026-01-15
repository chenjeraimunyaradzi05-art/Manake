import * as React from "react";
import { Button } from "./Button";

type CompatibleReactNode = Exclude<React.ReactNode, bigint>;

type ErrorBoundaryProps = {
  children: CompatibleReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error", error, info);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-display text-lg font-bold text-red-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-red-800">
          {error?.message ?? "An unexpected error occurred."}
        </p>
        <div className="mt-4">
          <Button variant="danger" onClick={this.handleReset}>
            Try again
          </Button>
        </div>
      </div>
    );
  }
}
