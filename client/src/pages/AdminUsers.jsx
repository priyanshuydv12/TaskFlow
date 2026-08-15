import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users, Trash2, ArrowRight, ShieldCheck, Mail, Calendar, UserCheck } from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data && response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to retrieve user directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, userName, newRole) => {
    try {
      const response = await api.put(`/users/${userId}`, { role: newRole });
      if (response.data && response.data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        addToast(`User "${userName}" role updated to ${newRole.toUpperCase()}`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user role', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === currentUser._id) {
      addToast('Self-deletion is blocked.', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/users/${userId}`);
      if (response.data && response.data.success) {
        setUsers(users.filter(u => u._id !== userId));
        addToast(`User "${userName}" deleted successfully`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user account', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 animate-pulse">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading user directory...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
          User Administration
        </h1>
        <p className="text-xs text-slate-500 font-medium">Modify account roles or delete workspace access keys.</p>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900/10 border border-slate-900/80 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/45 border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role Designation</th>
                <th className="p-4">Account ID</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 text-xs text-slate-350 font-medium">
              {users.map((u) => {
                const isSelf = u._id === currentUser._id;
                
                return (
                  <tr key={u._id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase">
                          {u.name.slice(0, 2)}
                        </div>
                        <span className="font-bold text-slate-100 font-heading">{u.name} {isSelf && <span className="text-[9px] text-blue-500 lowercase">(you)</span>}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">
                      {u.email}
                    </td>
                    <td className="p-4">
                      {isSelf ? (
                        <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/10 px-2 py-0.5 rounded-md">
                          {u.role}
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, u.name, e.target.value)}
                          className="bg-slate-950/60 border border-slate-900 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[10px]">
                      {u._id}
                    </td>
                    <td className="p-4 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 rounded-lg transition-all inline-block"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminUsers;
