import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldCheck } from 'lucide-react';
import { COMPANY_BRAND } from '../../constants/branding';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SERS ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('sers_current_role');
      localStorage.removeItem('sers_auth_user');
      window.location.href = window.location.pathname;
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl mx-auto flex items-center justify-center border border-red-100 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{COMPANY_BRAND.name} • Resguardo del Sistema</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Se detectó un problema en la vista
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                El sistema protegió los datos. Puedes restablecer la navegación o recargar para restaurar la visualización de todos los módulos.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 overflow-x-auto max-h-28">
                <p className="font-bold text-red-600">{this.state.error.name}: {this.state.error.message}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Recargar Página
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" /> Inicio Seguro
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
