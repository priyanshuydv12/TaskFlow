import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Calendar, User, Tag, CheckSquare, Clock } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        if (response.data && response.data.success) {
          setTask(response.data.data);
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to load task details';
        setError(errMsg);
        addToast(errMsg, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id, addToast]);

  // Priority and Status Badges: Restrained Neubrutalist Accents on Urgent/High, muted on others
  const getPriorityBadgeClass = (prio) => {
    switch (prio) {
      case 'urgent': return 'badge-brutalist-urgent px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider inline-block';
      case 'high': return 'badge-brutalist-high px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider inline-block';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase tracking-wider inline-block';
      case 'low': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase tracking-wider inline-block';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase tracking-wider inline-block';
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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 animate-pulse">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading task inspector...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-4 text-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 text-rose-350 text-xs rounded-xl font-medium">
          {error || 'Task document not found.'}
        </div>
        <Link to="/tasks" className="text-xs text-violet-400 hover:underline font-semibold block">
          Return to Tasks directory
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
      
      {/* Back Link */}
      <Link to="/tasks" className="inline-flex items-center space-x-2 text-xs text-slate-500 hover:text-slate-300 transition-colors group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Tasks directory</span>
      </Link>

      {/* Glassmorphic Detail Panel */}
      <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Task Heading */}
        <div className="border-b border-white/5 pb-5 space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className={getPriorityBadgeClass(task.priority)}>
              {task.priority}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(task.status)}`}>
              {task.status}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display mt-2">
            {task.title}
          </h1>
          <p className="text-[10px] text-slate-500 font-mono">Task ID: {task._id}</p>
        </div>

        {/* Task Description */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">Description</h4>
          <p className="text-sm text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-white/5 leading-relaxed font-sans">
            {task.description}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <Tag className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider font-display">Priority</span>
                <span className="text-xs font-semibold uppercase">{task.priority}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <CheckSquare className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider font-display">Status</span>
                <span className="text-xs font-semibold uppercase">{task.status}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <Clock className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider font-display">Deadline Date</span>
                <span className="text-xs font-semibold font-sans">{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <User className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider font-display">Assigned User</span>
                <span className="text-xs font-semibold">{task.assignedTo ? task.assignedTo.name : 'Unassigned'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Creator Metadata */}
        <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 flex flex-wrap gap-4 items-center justify-between text-[10px] text-slate-500 font-medium font-sans">
          <span>Created By: <strong className="text-slate-350">{task.createdBy?.name || 'System'}</strong></span>
          <span>Created At: <strong>{new Date(task.createdAt).toLocaleDateString()}</strong></span>
        </div>

      </div>
    </div>
  );
};

export default TaskDetail;
