import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, KeyRound, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email.trim() || !password) {
      setLocalError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // AuthContext sets state error, but we catch locally to clear submitting status
      console.error('Login form error:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle organic light glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/10">
            Enterprise Management
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-heading mt-4">
            TaskFlow
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Sign in to access your dashboard metrics.
          </p>
        </div>

        {/* Card Panel */}
        <div className="bg-slate-900/10 border border-slate-900/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
          
          {displayError && (
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs rounded-xl font-medium">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="name@company.com"
                  required
                />
                <Mail className="w-4.5 h-4.5 text-slate-600 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400">Password</label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <KeyRound className="w-4.5 h-4.5 text-slate-600 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-sm font-semibold rounded-xl text-white transition-all duration-150 flex items-center justify-center space-x-2 border border-blue-500/20 shadow-lg shadow-blue-600/10 mt-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Footer */}
        <p className="text-xs text-slate-500 text-center font-medium">
          Need workspace access? <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">Create account</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
