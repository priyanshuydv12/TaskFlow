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

  // Badge Style helpers
  const getPriorityBadgeClass = (prio) => {
    switch (prio) {
      case 'low': return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/10';
      case 'high': return 'bg-amber-500/10 text-amber-400 border-amber-500/10';
      case 'urgent': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 animate-pulse">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading system task log...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Task Administration
          </h1>
          <p className="text-xs text-slate-500 font-medium">Review and moderate all tasks created in the workspace.</p>
        </div>
        <button
          onClick={() => fetchTasks()}
          className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-100"
          title="Refresh List"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Directory Table */}
      {tasks.length === 0 ? (
        <div className="bg-slate-900/10 border border-slate-900/50 border-dashed rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-350 font-heading">No Workspace Tasks</h3>
          <p className="text-xs text-slate-500">There are no tasks registered in the system database.</p>
        </div>
      ) : (
        <div className="bg-slate-900/10 border border-slate-900/80 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/45 border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="p-4">Title</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status Override</th>
                  <th className="p-4">Delegated Assignee</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-xs text-slate-350 font-medium">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-100 font-heading block">
                        {task.title}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{task._id}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, task.title, e.target.value)}
                        className="bg-slate-950/60 border border-slate-900 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
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
                        className="bg-slate-950/60 border border-slate-900 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
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
                    <td className="p-4 text-slate-400">
                      {new Date(task.deadline).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteTask(task._id, task.title)}
                        className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 rounded-lg transition-all inline-block"
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
