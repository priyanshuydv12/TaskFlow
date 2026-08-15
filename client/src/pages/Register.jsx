import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { register, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
        {error && <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="Your Name"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-sm font-semibold rounded-xl transition-all border border-primary-500/30 text-white mt-6"
          >
            Sign Up
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-6 text-center">
          Already have an account? <Link to="/login" className="text-primary-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
