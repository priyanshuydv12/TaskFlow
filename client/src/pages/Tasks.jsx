import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Filter, RefreshCw, Plus, Calendar, User, Trash2, Edit2, CheckCircle2, AlertCircle, X } from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const socket = useSocket();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await api.get('/tasks', { params });
      if (response.data && response.data.success) {
        setTasks(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (user?.role !== 'admin') return;
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
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    if (!socket) return;

    const handleSocketTaskChange = () => {
      console.log('Real-time sync: updating tasks list...');
      fetchTasks();
    };

    socket.on('task:created', handleSocketTaskChange);
    socket.on('task:updated', handleSocketTaskChange);
    socket.on('task:deleted', handleSocketTaskChange);

    return () => {
      socket.off('task:created', handleSocketTaskChange);
      socket.off('task:updated', handleSocketTaskChange);
      socket.off('task:deleted', handleSocketTaskChange);
    };
  }, [socket]);

  useEffect(() => {
    fetchUsers();
  }, [user]);

  // Handle status update (PATCH)
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (response.data && response.data.success) {
        // Update local state
        setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  // Handle assign change (PATCH)
  const handleAssignChange = async (taskId, userId) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/assign`, { assignedTo: userId || null });
      if (response.data && response.data.success) {
        // Re-fetch list to populate user details properly
        fetchTasks();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign task');
    }
  };

  // Trigger Delete flow
  const confirmDelete = (task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      const response = await api.delete(`/tasks/${taskToDelete._id}`);
      if (response.data && response.data.success) {
        setTasks(tasks.filter(t => t._id !== taskToDelete._id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  // Utility badge styles
  const getPriorityBadgeClass = (prio) => {
    switch (prio) {
      case 'low': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'urgent': return 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusBadgeClass = (stat) => {
    switch (stat) {
      case 'todo': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'in-progress': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(86,115,252,0.06),transparent_50%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative space-y-6">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Tasks
            </h1>
            <p className="text-xs text-slate-500">View and filter assignments</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchTasks}
              className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/tasks/create"
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 px-4 py-3 rounded-xl border border-primary-500/30 font-semibold text-sm transition-all text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-900/30 border border-slate-850 p-4 rounded-2xl">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase">
            <Filter className="w-4 h-4" />
            <span>Filter By:</span>
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-500 transition-colors"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Clear Filters */}
          {(statusFilter || priorityFilter) && (
            <button
              onClick={() => { setStatusFilter(''); setPriorityFilter(''); }}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-60 bg-slate-900/40 border border-slate-850 rounded-2xl p-6 space-y-4">
                <div className="h-6 bg-slate-800 rounded-lg w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800 rounded-lg w-full"></div>
                  <div className="h-4 bg-slate-800 rounded-lg w-5/6"></div>
                </div>
                <div className="h-10 bg-slate-800 rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-slate-900/10 border border-slate-850 border-dashed rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-300">No tasks found</h3>
            <p className="text-xs text-slate-500">No task documents matched your selected query filters or ownership permissions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => {
              const isCreator = task.createdBy?._id === user?._id;
              const canEdit = user?.role === 'admin' || isCreator;
              
              return (
                <div
                  key={task._id}
                  className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm hover:border-slate-700/60 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: badges and delete */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => confirmDelete(task)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="font-bold text-slate-100 line-clamp-1 hover:text-white">
                        <Link to={`/tasks/${task._id}`}>{task.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 mt-1">{task.description}</p>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-2 pt-2 border-t border-slate-850">
                      <div className="flex items-center text-[10px] text-slate-400 space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-[10px] text-slate-400 space-x-2">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Owner: {task.createdBy?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Select dropdowns inside card) */}
                  <div className="space-y-3 pt-4 mt-4 border-t border-slate-850">
                    {/* Quick status change */}
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Quick Status</label>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-[11px] focus:outline-none focus:border-primary-500 transition-colors"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Quick assign change (Admin only in dropdown) */}
                    {user?.role === 'admin' && (
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Delegated Assignee</label>
                        <select
                          value={task.assignedTo?._id || ''}
                          onChange={(e) => handleAssignChange(task._id, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-[11px] focus:outline-none focus:border-primary-500 transition-colors"
                        >
                          <option value="">Unassigned</option>
                          {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-500 hover:text-slate-300 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Delete Task?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete task <span className="text-slate-200 font-semibold">"{taskToDelete?.title}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-xs font-semibold rounded-xl border border-slate-700/50 transition-colors text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-xs font-semibold rounded-xl transition-colors text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
