import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle className="w-10 h-10" />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Well, this is awkward.</h1>
            <p className="text-slate-500 font-bold mb-8 leading-relaxed">
              Something went wrong while rendering this page. Our team has been notified.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-black transition flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20"
              >
                <RefreshCw className="w-4 h-4" /> Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-slate-50 transition flex items-center justify-center gap-3"
              >
                <Home className="w-4 h-4" /> Go to Homepage
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 pt-8 border-t border-slate-50 text-left">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Error Details</p>
                <code className="text-[10px] text-red-400 font-mono break-all">{this.state.error?.toString()}</code>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;
