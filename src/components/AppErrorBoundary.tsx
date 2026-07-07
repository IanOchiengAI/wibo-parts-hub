import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Application error", { error, errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10">
            <AlertTriangle className="h-9 w-9 text-destructive" />
          </div>

          <p className="font-display text-sm uppercase tracking-[0.24em] text-primary/90">
            WIBO Parts Hub
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
            Something stalled
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The page hit an unexpected problem. Your cart and account stay protected while you reload or return home.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={this.handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
