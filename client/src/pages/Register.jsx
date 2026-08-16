import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, KeyRound, Mail, User, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!name.trim() || !email.trim() || !password) {
      setLocalError('Please complete all registration fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must contain at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration form error:', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Subtle animated gradient blob behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-violet-600/10 to-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[6000ms]" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent px-3 py-1 rounded-full border border-violet-500/20 bg-violet-950/10">
            System Telemetry
          </span>
          <h1 className="text-5xl font-black tracking-tight text-white font-display mt-2 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Create Profile
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Register your team access profile.
          </p>
        </div>

        {/* Glassmorphic Panel */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl space-y-6">
          
          {displayError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-350 text-xs rounded-xl font-medium">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors focus:bg-white/10 focus:border-violet-500"
                  placeholder="John Doe"
                  required
                />
                <User className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors focus:bg-white/10 focus:border-violet-500"
                  placeholder="name@company.com"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors focus:bg-white/10 focus:border-violet-500"
                  placeholder="••••••••"
                  required
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Action button: Neubrutalist CTA styling */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 btn-brutalist text-sm font-bold rounded-xl flex items-center justify-center space-x-2 mt-6 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="font-sans">Processing...</span>
                </>
              ) : (
                <>
                  <span className="font-display uppercase tracking-wider">Deploy Account</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Footer */}
        <p className="text-xs text-slate-500 text-center font-medium">
          Already registered? <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors font-semibold">Login</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
