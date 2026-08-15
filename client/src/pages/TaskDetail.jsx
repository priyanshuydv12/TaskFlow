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

  // Priority and Status helper classes (Muted)
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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 animate-pulse">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading task inspector...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-4 text-center">
        <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400 text-xs rounded-xl font-medium">
          {error || 'Task document not found.'}
        </div>
        <Link to="/tasks" className="text-xs text-blue-400 hover:underline font-semibold block">
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

      {/* Detail Panel */}
      <div className="bg-slate-900/10 border border-slate-900/80 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-2xl space-y-6">
        
        {/* Task Heading */}
        <div className="border-b border-slate-900/60 pb-5 space-y-2">
          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(task.status)}`}>
              {task.status}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading mt-2">
            {task.title}
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">Task ID: {task._id}</p>
        </div>

        {/* Task Description */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</h4>
          <p className="text-sm text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-slate-900 leading-relaxed font-sans">
            {task.description}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <Tag className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Priority</span>
                <span className="text-xs font-semibold uppercase">{task.priority}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <CheckSquare className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Status</span>
                <span className="text-xs font-semibold uppercase">{task.status}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <Clock className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Deadline Date</span>
                <span className="text-xs font-semibold">{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <User className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Assigned User</span>
                <span className="text-xs font-semibold">{task.assignedTo ? task.assignedTo.name : 'Unassigned'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Creator Metadata */}
        <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 flex flex-wrap gap-4 items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>Created By: <strong className="text-slate-350">{task.createdBy?.name || 'System'}</strong></span>
          <span>Created At: <strong>{new Date(task.createdAt).toLocaleDateString()}</strong></span>
        </div>

      </div>
    </div>
  );
};

export default TaskDetail;
