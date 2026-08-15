import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const CreateTask = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
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
      if (user?.role !== 'admin') return;
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
        addToast(`Task "${title}" created successfully`, 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create task';
      setValidationError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-xl mx-auto space-y-6">
      
      {/* Back Link */}
      <Link to="/tasks" className="inline-flex items-center space-x-2 text-xs text-slate-500 hover:text-slate-300 transition-colors group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Tasks list</span>
      </Link>

      {/* Heading */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
          Create Task
        </h1>
        <p className="text-xs text-slate-500 font-medium">Configure parameters for task delegation.</p>
      </div>

      {/* Errors */}
      {validationError && (
        <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs rounded-xl flex items-start space-x-2 font-medium">
          <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Form Panel */}
      <div className="bg-slate-900/10 border border-slate-900/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Implement JWT Verification"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
              placeholder="Provide clean instructions about task targets..."
              required
            />
          </div>

          {/* Parameters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Deadline *</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none [color-scheme:dark]"
                required
              />
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Assignee</label>
              {loadingUsers ? (
                <div className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-3 flex items-center justify-between text-slate-500">
                  <span className="text-sm">Loading users...</span>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              ) : (
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-900 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none"
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
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-sm font-semibold rounded-xl text-white transition-all duration-150 flex items-center justify-center space-x-2 border border-blue-500/20 shadow-lg shadow-blue-600/5 mt-6"
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
