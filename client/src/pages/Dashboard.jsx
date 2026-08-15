import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500">Welcome back, {user?.name || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-xs font-semibold rounded-xl border border-slate-700/50 transition-colors"
          >
            Log Out
          </button>
        </div>
        
        <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-850 space-y-2">
          <p className="text-sm text-slate-400">User Profile Details:</p>
          <p className="text-xs text-slate-500">ID: {user?._id}</p>
          <p className="text-xs text-slate-500">Email: {user?.email}</p>
          <p className="text-xs text-slate-500">Role: <span className="text-primary-400 uppercase font-semibold">{user?.role}</span></p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
