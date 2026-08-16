import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldAlert, KeyRound } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
      
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">
          Profile Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium">Verify your workspace credentials and system configurations.</p>
      </div>

      {/* Glassmorphic Info Card */}
      <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Name Avatar Header */}
        <div className="flex items-center space-x-4 pb-6 border-b border-white/5">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center font-black text-xl text-violet-400 uppercase font-display">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display">{user?.name}</h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider bg-violet-500/10 text-violet-400 border-violet-500/20">
              {user?.role} Role
            </span>
          </div>
        </div>

        {/* Profile parameters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-sm text-slate-350">
            <Mail className="w-4.5 h-4.5 text-slate-500" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest font-display">Email Address</span>
              <span className="text-xs font-semibold">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm text-slate-350">
            <ShieldAlert className="w-4.5 h-4.5 text-slate-500" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest font-display">Account ID</span>
              <span className="text-xs font-mono select-all">{user?._id}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-sm text-slate-350">
            <KeyRound className="w-4.5 h-4.5 text-slate-500" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest font-display">Security Access Level</span>
              <span className="text-xs font-semibold uppercase">{user?.role === 'admin' ? 'Root Access' : 'Standard Access'}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Profile;
