import { useState, useEffect } from 'react';
import api from './api/axios';
import { Activity, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [errorMessage, setErrorMessage] = useState('');

  const checkHealth = async () => {
    setBackendStatus('checking');
    setErrorMessage('');
    try {
      const response = await api.get('/health');
      if (response.data && response.data.success) {
        setBackendStatus('online');
      } else {
        setBackendStatus('error');
        setErrorMessage('Unexpected response status');
      }
    } catch (err) {
      setBackendStatus('offline');
      setErrorMessage(err.message || 'Unable to connect to backend server');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-primary-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(86,115,252,0.15),transparent_50%)] pointer-events-none" />

      <div className="relative max-w-xl w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-slate-700/80">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-400 border border-primary-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              MERN Task Manager
            </h1>
            <p className="text-xs text-slate-500">Phase 1: Project Scaffolding & Verification</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-950/60 rounded-2xl border border-slate-850 p-5 space-y-4 mb-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800/60">
            <span className="text-sm text-slate-400 font-medium">Vite + React Dev Client</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400 font-medium">Express + Socket.io Server</span>
            <div>
              {backendStatus === 'checking' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Checking...
                </span>
              )}
              {backendStatus === 'online' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Online
                </span>
              )}
              {backendStatus === 'offline' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> Offline
                </span>
              )}
              {backendStatus === 'error' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> API Error
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Connection status/actions */}
        {backendStatus !== 'online' && (
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl mb-6">
            <p className="text-xs text-slate-400">
              {backendStatus === 'checking' && "Checking availability of API Server on port 5000..."}
              {(backendStatus === 'offline' || backendStatus === 'error') && (
                <span className="text-rose-400/90 font-medium flex items-start space-x-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage || "Make sure server is running. Launch node server from server/ and refresh status."}</span>
                </span>
              )}
            </p>
          </div>
        )}

        {/* Interactive Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={checkHealth}
            disabled={backendStatus === 'checking'}
            className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700/80 active:bg-slate-800 disabled:opacity-50 text-sm font-semibold rounded-2xl transition-all flex items-center justify-center space-x-2 border border-slate-700/50"
          >
            <RefreshCw className={`w-4 h-4 ${backendStatus === 'checking' ? 'animate-spin' : ''}`} />
            <span>Test API Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
