import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { 
  Filter, RefreshCw, Plus, Calendar, User, Trash2, LayoutGrid, List, AlertCircle, X, CheckSquare 
} from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const { addToast } = useToast();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const fetchTasks = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await api.get('/tasks', { params });
      if (response.data && response.data.success) {
        setTasks(response.data.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch tasks', 'error');
    } finally {
      if (!silent) setLoading(false);
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
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleSocketTaskChange = (data) => {
      console.log('Real-time sync: updating tasks list...');
      fetchTasks(true); // silent update
      if (data && data.title) {
        addToast(`Task update synced: "${data.title}"`, 'success');
      } else {
        addToast('Task list refreshed live.', 'success');
      }
    };

    socket.on('task:created', handleSocketTaskChange);
    socket.on('task:updated', handleSocketTaskChange);
    socket.on('task:deleted', handleSocketTaskChange);

    return () => {
      socket.off('task:created', handleSocketTaskChange);
      socket.off('task:updated', handleSocketTaskChange);
      socket.off('task:deleted', handleSocketTaskChange);
    };
  }, [socket, addToast]);

  // Handle status update (PATCH)
  const handleStatusChange = async (taskId, title, newStatus) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (response.data && response.data.success) {
        setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        addToast(`Task "${title}" status updated to ${newStatus.toUpperCase()}`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update task status', 'error');
    }
  };

  // Handle assign update (PATCH)
  const handleAssignChange = async (taskId, title, userId) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/assign`, { assignedTo: userId || null });
      if (response.data && response.data.success) {
        fetchTasks(true);
        addToast(`Task "${title}" assignee updated`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to assign task', 'error');
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
        addToast(`Task "${taskToDelete.title}" deleted successfully`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete task', 'error');
    } finally {
      setDeleteModalOpen(false);
      setTaskToDelete(null);
    }
  };

  // Visual Priority and Status Styles (Muted, premium, HSL tailwind colors)
  const getPriorityBadgeClass = (prio) => {
    switch (prio) {
      case 'low': return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/10';
      case 'high': return 'bg-amber-500/10 text-amber-400 border-amber-500/10';
      case 'urgent': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
    }
  };

  const getStatusBadgeClass = (stat) => {
    switch (stat) {
      case 'todo': return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
      case 'in-progress': return 'bg-purple-500/10 text-purple-400 border-purple-500/10';
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Tasks Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium">Manage and delegate workspace assignments.</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Layout Toggle (Card vs Table) */}
          <div className="bg-slate-900 border border-slate-850 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="Card Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => fetchTasks()}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-100"
            title="Refresh List"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
          <Link
            to="/tasks/create"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2.5 rounded-xl border border-blue-500/20 font-semibold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </Link>
        </div>
      </div>

      {/* Query Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/10 border border-slate-900/60 p-4 rounded-2xl">
        <div className="flex items-center space-x-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950/60 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
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
          className="bg-slate-950/60 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
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
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold hover:underline ml-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Task List Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-56 bg-slate-900/40 border border-slate-900/60 rounded-2xl p-6" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-slate-900/10 border border-slate-900/50 border-dashed rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300 font-heading">No Tasks Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">No task documents matched your selected query filters or ownership permissions.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* CARD GRID MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isCreator = task.createdBy?._id === user?._id;
            const canEdit = user?.role === 'admin' || isCreator;
            
            return (
              <div
                key={task._id}
                className="bg-slate-900/10 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-sm hover:border-slate-800 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Badges and Delete */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => confirmDelete(task)}
                        className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-slate-100 line-clamp-1 hover:text-white font-heading">
                      <Link to={`/tasks/${task._id}`}>{task.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">{task.description}</p>
                  </div>

                  {/* Details metadata */}
                  <div className="space-y-2 pt-3 border-t border-slate-900/40 text-[10px] text-slate-500 font-medium">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-slate-600" />
                      <span>Creator: {task.createdBy?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Inline modifications */}
                <div className="space-y-3 pt-4 mt-4 border-t border-slate-900/40">
                  {/* Quick status */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Status Override</label>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, task.title, e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-900 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Quick assign (Admins only dropdown) */}
                  {user?.role === 'admin' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Delegated Assignee</label>
                      <select
                        value={task.assignedTo?._id || ''}
                        onChange={(e) => handleAssignChange(task._id, task.title, e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-900 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none"
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
      ) : (
        /* RESPONSIVE TABLE MODE */
        <div className="bg-slate-900/10 border border-slate-900/80 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/45 border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="p-4">Task Name</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-xs text-slate-300 font-medium">
                {tasks.map((task) => {
                  const isCreator = task.createdBy?._id === user?._id;
                  const canEdit = user?.role === 'admin' || isCreator;
                  
                  return (
                    <tr key={task._id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="p-4">
                        <Link to={`/tasks/${task._id}`} className="font-bold text-slate-100 hover:text-blue-400 transition-colors font-heading block">
                          {task.title}
                        </Link>
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
                      <td className="p-4 text-slate-400">
                        {new Date(task.deadline).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-400">
                        {task.createdBy?.name || 'System'}
                      </td>
                      <td className="p-4 text-right">
                        {canEdit && (
                          <button
                            onClick={() => confirmDelete(task)}
                            className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 rounded-lg transition-all inline-block"
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
      )}

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
              <h3 className="text-lg font-bold text-slate-100 font-heading">Delete Task?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to delete task <span className="text-slate-200 font-semibold">"{taskToDelete?.title}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-xs font-semibold rounded-xl border border-slate-700/50 transition-colors text-slate-300 font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-xs font-semibold rounded-xl transition-colors text-white font-sans shadow-lg shadow-rose-950/15"
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
