import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, ListTodo, User, Users, FolderKanban, LogOut, ChevronLeft, ChevronRight 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: ListTodo },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const adminItems = [
    { to: '/admin/users', label: 'Users Mgt', icon: Users },
    { to: '/admin/tasks', label: 'Tasks Mgt', icon: FolderKanban },
  ];

  const activeClass = 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500';
  const inactiveClass = 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40';

  return (
    <>
      {/* Desktop Sidebar (md and up) */}
      <aside 
        className={`hidden md:flex flex-col justify-between sticky top-0 h-screen border-r border-slate-900 bg-slate-950/20 backdrop-blur-xl transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col space-y-6">
          {/* Logo / Brand */}
          <div className={`p-6 flex items-center justify-between border-b border-slate-900/50 ${isCollapsed ? 'justify-center' : ''}`}>
            {!isCollapsed && (
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                TaskFlow
              </span>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? activeClass : inactiveClass
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={item.label}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}

            {/* Admin Block */}
            {user?.role === 'admin' && (
              <div className="pt-6">
                {!isCollapsed && (
                  <span className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 block mb-2">
                    Administrator
                  </span>
                )}
                <div className="space-y-1">
                  {adminItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => 
                        `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive ? activeClass : inactiveClass
                        } ${isCollapsed ? 'justify-center px-0' : ''}`
                      }
                      title={item.label}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* User Card / Footer */}
        <div className="p-4 border-t border-slate-900/50 flex flex-col space-y-3">
          {!isCollapsed && (
            <div className="px-2 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-xs text-blue-400">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (md and down) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/80 border-t border-slate-900 backdrop-blur-xl z-40 flex items-center justify-around px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center text-xs space-y-1 transition-colors ${
                isActive ? 'text-blue-400' : 'text-slate-500'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin/users"
            className={({ isActive }) => 
              `flex flex-col items-center justify-center text-xs space-y-1 transition-colors ${
                isActive ? 'text-blue-400' : 'text-slate-500'
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-medium">Admin</span>
          </NavLink>
        )}
      </nav>
    </>
  );
};

export default Sidebar;
