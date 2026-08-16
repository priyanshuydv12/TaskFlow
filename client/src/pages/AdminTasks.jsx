import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { Trash2, AlertCircle, Calendar, User, Tag, CheckSquare, RefreshCw } from 'lucide-react';

const AdminTasks = () => {
  const { addToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const fetchTasks = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/tasks');
      if (response.data && response.data.success) {
        setTasks(response.data.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load system tasks', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data && response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load user list:', err.message);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const handleStatusChange = async (taskId, title, newStatus) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (response.data && response.data.success) {
        setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        addToast(`Task "${title}" status updated to ${newStatus.toUpperCase()}`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleAssignChange = async (taskId, title, userId) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/assign`, { assignedTo: userId || null });
      if (response.data && response.data.success) {
        fetchTasks(true);
        addToast(`Task "${title}" assignment updated`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to assign task', 'error');
    }
  };

  const handleDeleteTask = async (taskId, title) => {
    if (!window.confirm(`Are you sure you want to delete task "${title}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/tasks/${taskId}`);
      if (response.data && response.data.success) {
        setTasks(tasks.filter(t => t._id !== taskId));
        addToast(`Task "${title}" deleted successfully`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete task', 'error');
    }
  };

  // Badges styling: Restrained Neubrutalist Accents on Urgent/High, muted on others
  const getPriorityBadgeClass = (prio) => {
    switch (prio) {
      case 'urgent': return 'badge-brutalist-urgent px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider inline-block';
      case 'high': return 'badge-brutalist-high px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider inline-block';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase tracking-wider inline-block';
      case 'low': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase tracking-wider inline-block';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase tracking-wider inline-block';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 animate-pulse">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading system task log...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">
            Task Administration
          </h1>
          <p className="text-xs text-slate-500 font-medium">Review and moderate all tasks created in the workspace.</p>
        </div>
        <button
          onClick={() => fetchTasks()}
          className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-slate-100"
          title="Refresh List"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Directory Table (Glassmorphic) */}
      {tasks.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-350 font-display">No Workspace Tasks</h3>
          <p className="text-xs text-slate-500">There are no tasks registered in the system database.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/3 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">
                  <th className="p-4">Title</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status Override</th>
                  <th className="p-4">Delegated Assignee</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-355 font-medium">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-white/3 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-100 font-display block text-sm">
                        {task.title}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{task._id}</span>
                    </td>
                    <td className="p-4">
                      <span className={getPriorityBadgeClass(task.priority)}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, task.title, e.target.value)}
                        className="bg-slate-950/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={task.assignedTo?._id || ''}
                        onChange={(e) => handleAssignChange(task._id, task.title, e.target.value)}
                        className="bg-slate-950/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                      >
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-slate-400">
                      {task.createdBy?.name || 'Unknown'}
                    </td>
                    <td className="p-4 text-slate-400 font-sans">
                      {new Date(task.deadline).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteTask(task._id, task.title)}
                        className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 rounded-lg transition-all inline-block"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTasks;
