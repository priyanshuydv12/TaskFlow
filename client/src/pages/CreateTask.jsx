import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const CreateTask = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [deadline, setDeadline] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Fetch users if administrator to populate assignment dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role !== 'admin') {
        // For regular users, assignee is limited to themselves or unassigned
        return;
      }
      setLoadingUsers(true);
      try {
        const response = await api.get('/users');
        if (response.data && response.data.success) {
          setUsers(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load user list for assignment:', err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    // Validations
    if (!title.trim() || !description.trim() || !deadline) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    const selectedDeadline = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDeadline < today) {
      setValidationError('Deadline cannot be in the past.');
      return;
    }

    setSubmitting(true);
    try {
      const taskData = {
        title,
        description,
        priority,
        status,
        deadline,
        assignedTo: assignedTo || null
      };

      const response = await api.post('/tasks', taskData);
      if (response.data && response.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setValidationError(err.response?.data?.message || 'Failed to create task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(86,115,252,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative max-w-xl w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        {/* Back Link */}
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Create New Task
          </h1>
          <p className="text-xs text-slate-500">Configure parameters for task delegation</p>
        </div>

        {/* Errors */}
        {validationError && (
          <div className="p-4 mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="e.g. Implement JWT Verification"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors resize-none"
              placeholder="Provide clean instructions about task targets..."
              required
            />
          </div>

          {/* Grid for parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Deadline *</label>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Assignee</label>
              {loadingUsers ? (
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between text-slate-500">
                  <span className="text-sm">Loading users...</span>
                  <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                </div>
              ) : (
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                >
                  <option value="">Unassigned</option>
                  {user?.role === 'admin' ? (
                    users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))
                  ) : (
                    <option value={user?._id}>Assign to me ({user?.name})</option>
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 disabled:opacity-50 text-sm font-semibold rounded-2xl transition-all border border-primary-500/30 text-white mt-6 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Task...</span>
              </>
            ) : (
              <span>Create Task</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
