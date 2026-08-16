import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { 
  Filter, RefreshCw, Plus, Calendar, User, Trash2, LayoutGrid, List, AlertCircle, X 
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

  // Handle status update
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

  // Handle assign update
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

  // Priority Badges: Restrained Neubrutalist Accents on Urgent/High, muted on others
  const getPriorityBadgeClass = (prio) => {
    switch (prio) {
      case 'urgent': return 'badge-brutalist-urgent px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider block';
      case 'high': return 'badge-brutalist-high px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider block';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase tracking-wider block';
      case 'low': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase tracking-wider block';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase tracking-wider block';
    }
  };

  const getStatusBadgeClass = (stat) => {
    switch (stat) {
      case 'todo': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      case 'in-progress': return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
      case 'completed': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">
            Tasks Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium">Manage and delegate workspace assignments.</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Layout Toggle (Card vs Table) */}
          <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-350'}`}
              title="Card Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-slate-355'}`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => fetchTasks()}
            className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-slate-100"
            title="Refresh List"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
          <Link
            to="/tasks/create"
            className="inline-flex items-center space-x-2 btn-brutalist px-4 py-2.5 rounded-xl font-bold text-xs"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="font-display uppercase tracking-wider">Create Task</span>
          </Link>
        </div>
      </div>

      {/* Query Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white/3 border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center space-x-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest font-display">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
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
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
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
            className="text-xs text-rose-400 hover:text-rose-350 font-semibold hover:underline ml-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Task List Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-56 bg-white/5 border border-white/5 rounded-2xl p-6" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300 font-display">No Tasks Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">No task documents matched your selected query filters or ownership permissions.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* CARD GRID MODE (Glassmorphic containers) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const isCreator = task.createdBy?._id === user?._id;
            const canEdit = user?.role === 'admin' || isCreator;
            
            return (
              <div
                key={task._id}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Badges and Delete */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={getPriorityBadgeClass(task.priority)}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => confirmDelete(task)}
                        className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-slate-100 line-clamp-1 hover:text-white font-display text-base">
                      <Link to={`/tasks/${task._id}`}>{task.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mt-1.5 leading-relaxed font-sans">{task.description}</p>
                  </div>

                  {/* Details metadata */}
                  <div className="space-y-2 pt-3 border-t border-white/5 text-[10px] text-slate-500 font-medium">
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
                <div className="space-y-3 pt-4 mt-4 border-t border-white/5">
                  {/* Quick status */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-display">Status Override</label>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, task.title, e.target.value)}
                      className="w-full bg-slate-950/40 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-slate-350 focus:outline-none focus:border-violet-500 focus:bg-slate-950/80"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Quick assign */}
                  {user?.role === 'admin' && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-display">Delegated Assignee</label>
                      <select
                        value={task.assignedTo?._id || ''}
                        onChange={(e) => handleAssignChange(task._id, task.title, e.target.value)}
                        className="w-full bg-slate-950/40 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-slate-355 focus:outline-none focus:border-violet-500 focus:bg-slate-950/80"
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
        /* RESPONSIVE TABLE MODE (Glassmorphic list panel) */
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/3 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">
                  <th className="p-4">Task Name</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-medium">
                {tasks.map((task) => {
                  const isCreator = task.createdBy?._id === user?._id;
                  const canEdit = user?.role === 'admin' || isCreator;
                  
                  return (
                    <tr key={task._id} className="hover:bg-white/3 transition-colors">
                      <td className="p-4">
                        <Link to={`/tasks/${task._id}`} className="font-bold text-slate-100 hover:text-violet-400 transition-colors font-display block text-sm">
                          {task.title}
                        </Link>
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
                      <td className="p-4 text-slate-400 font-sans">
                        {new Date(task.deadline).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-400">
                        {task.createdBy?.name || 'System'}
                      </td>
                      <td className="p-4 text-right">
                        {canEdit && (
                          <button
                            onClick={() => confirmDelete(task)}
                            className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 rounded-lg transition-all inline-block"
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

      {/* Delete Confirmation Modal (Glassmorphic card panel) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="glass-card rounded-3xl max-w-sm w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-500 hover:text-slate-350 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-display">Delete Task?</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Are you sure you want to delete task <span className="text-slate-205 font-semibold">"{taskToDelete?.title}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl border border-white/10 transition-colors text-slate-300 font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-xs font-semibold rounded-xl transition-colors text-white font-sans border border-rose-500/20 shadow-lg shadow-rose-950/10"
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
