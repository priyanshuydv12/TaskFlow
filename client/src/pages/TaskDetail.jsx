import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Calendar, User, Tag, CheckSquare, Clock, ArrowRight } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
        setError(err.response?.data?.message || 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-400">Loading task inspector...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl max-w-md w-full text-center">
          {error || 'Task document not found.'}
        </div>
        <Link to="/tasks" className="text-xs text-primary-400 hover:underline">
          Return to Tasks List
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(86,115,252,0.06),transparent_50%)] pointer-events-none" />

      <div className="relative max-w-2xl w-full bg-slate-900/40 border border-slate-850 rounded-3xl p-8 backdrop-blur-md shadow-2xl space-y-6">
        
        {/* Back Link */}
        <Link to="/tasks" className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-200 transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Tasks</span>
        </Link>

        {/* Task Heading */}
        <div className="border-b border-slate-850 pb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {task.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Task ID: {task._id}</p>
        </div>

        {/* Task Description */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</h4>
          <p className="text-sm text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-slate-900 leading-relaxed">
            {task.description}
          </p>
        </div>

        {/* Task Params Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <Tag className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-xs text-slate-500 block">Priority</span>
                <span className="text-xs font-semibold uppercase">{task.priority}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <CheckSquare className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-xs text-slate-500 block">Status</span>
                <span className="text-xs font-semibold uppercase">{task.status}</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <Clock className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-xs text-slate-500 block">Deadline Date</span>
                <span className="text-xs font-semibold">{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-slate-300">
              <User className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <span className="text-xs text-slate-500 block">Assigned User</span>
                <span className="text-xs font-semibold">{task.assignedTo ? task.assignedTo.name : 'Unassigned'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Creator Info */}
        <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 flex items-center justify-between text-xs text-slate-400">
          <span>Created By: <strong className="text-slate-200">{task.createdBy?.name || 'System'}</strong></span>
          <span>Created At: <strong>{new Date(task.createdAt).toLocaleDateString()}</strong></span>
        </div>

      </div>
    </div>
  );
};

export default TaskDetail;
