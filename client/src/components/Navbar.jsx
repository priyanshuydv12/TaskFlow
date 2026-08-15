import { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { User, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/tasks/create')) return 'Create Task';
    if (path.startsWith('/tasks/')) return 'Task Details';
    if (path.startsWith('/tasks')) return 'Tasks List';
    if (path.startsWith('/profile')) return 'Profile Settings';
    if (path.startsWith('/admin/users')) return 'System User Directory';
    if (path.startsWith('/admin/tasks')) return 'System Task Overrides';
    return 'Task Manager';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-900/60 bg-slate-950/20 backdrop-blur-xl px-6 flex items-center justify-between">
      {/* Title / Breadcrumb */}
      <div>
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider outfit">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Real-time Notification Bell */}
        <NotificationBell />

        {/* User Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-1.5 hover:bg-slate-900/40 rounded-xl transition-all border border-transparent hover:border-slate-800"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-blue-400 uppercase">
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-300">{user?.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl z-50 py-2 divide-y divide-slate-850">
              <div className="px-4 py-2 text-xs">
                <span className="block font-bold text-slate-200">{user?.name}</span>
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{user?.role}</span>
              </div>
              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </Link>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setDropdownOpen(false); handleLogout(); }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
