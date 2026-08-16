import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  CheckCircle2, PlayCircle, Clock, AlertTriangle, ListTodo, Plus, ArrowRight 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      if (response.data && response.data.success) {
        setTasks(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard tasks:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleSocketTaskChange = () => {
      console.log('Real-time sync: updating dashboard tasks...');
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

  // Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  
  const today = new Date();
  const overdueTasks = tasks.filter(t => {
    return t.status !== 'completed' && new Date(t.deadline) < today;
  }).length;

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Chart 1: Status Dataset
  const activeStatusData = [
    { name: 'To Do', value: todoTasks, color: '#475569' },
    { name: 'In Progress', value: inProgressTasks, color: '#8b5cf6' },
    { name: 'Completed', value: completedTasks, color: '#06b6d4' }
  ].filter(item => item.value > 0);

  // Chart 2: Priority Dataset (Clean monochrome-cobalt scale)
  const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
  tasks.forEach(t => {
    if (priorityCounts[t.priority] !== undefined) {
      priorityCounts[t.priority]++;
    }
  });
  const priorityData = [
    { name: 'Low', count: priorityCounts.low, color: '#64748b' },
    { name: 'Medium', count: priorityCounts.medium, color: '#8b5cf6' }, 
    { name: 'High', count: priorityCounts.high, color: '#6366f1' },
    { name: 'Urgent', count: priorityCounts.urgent, color: '#ec4899' }
  ];

  // Chart 3: Weekly Creation Trend (Last 7 days)
  const getWeeklyTrend = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = days[d.getDay()];
      const dayDateStr = d.toDateString();
      const count = tasks.filter(t => new Date(t.createdAt).toDateString() === dayDateStr).length;
      trend.push({ name: dayLabel, count });
    }
    return trend;
  };

  const weeklyTrendData = getWeeklyTrend();

  // Skeleton Loader Component
  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse max-w-6xl mx-auto">
        <div className="h-10 bg-white/5 rounded-2xl w-1/3 border border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-64 bg-white/5 border border-white/5 rounded-3xl md:col-span-2" />
          <div className="h-28 bg-white/5 border border-white/5 rounded-3xl" />
          <div className="h-28 bg-white/5 border border-white/5 rounded-3xl" />
          <div className="h-28 bg-white/5 border border-white/5 rounded-3xl" />
          <div className="h-28 bg-white/5 border border-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      
      {/* Greetings Block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-display">
            Workspace Overview
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time analytics and task completion telemetry.
          </p>
        </div>
        <div>
          <Link
            to="/tasks/create"
            className="inline-flex items-center space-x-2 btn-brutalist px-5 py-3 rounded-xl font-bold text-xs"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="font-display uppercase tracking-wider">Create Task</span>
          </Link>
        </div>
      </div>

      {/* Asymmetric Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Large Bento Card: Completion Rate Radial Donut (col-span-2, row-span-2) */}
        <div className="glass-card rounded-3xl p-6 md:col-span-2 md:row-span-2 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-violet-600/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-widest font-display">Completion Telemetry</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Ratio of closed task credentials</p>
          </div>
          
          {/* Radial Donut Progress with signature gradient */}
          <div className="relative w-44 h-44 flex items-center justify-center mx-auto my-4 z-10">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
              {/* Glowing gradient path */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="url(#neonGradient)" // signature gradient
                strokeWidth="7" 
                fill="transparent" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * completionPercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="neonGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white font-display text-glow">{completionPercentage}%</span>
              <span className="text-[8px] uppercase font-bold text-slate-400 tracking-widest mt-1">Deploy rate</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-medium flex justify-between items-center relative z-10 mt-2">
            <span>{completedTasks} of {totalTasks} tasks closed</span>
            <span className="text-[9px] text-cyan-400 font-bold bg-cyan-950/20 px-2 py-0.5 rounded-full border border-cyan-500/10">Active Sync</span>
          </div>
        </div>

        {/* Small Bento Card: Total Tasks */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[148px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-display">Total Tasks</span>
            <div className="p-2 bg-white/5 rounded-xl text-slate-400 border border-white/5">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-white font-display">{totalTasks}</span>
          </div>
        </div>

        {/* Small Bento Card: To Do */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[148px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-display">To Do</span>
            <div className="p-2 bg-white/5 rounded-xl text-slate-400 border border-white/5">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-slate-300 font-display">{todoTasks}</span>
          </div>
        </div>

        {/* Medium Bento Card: In Progress */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between min-h-[148px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-display">In Progress</span>
            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400 border border-violet-500/20">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-violet-400 font-display">{inProgressTasks}</span>
          </div>
        </div>

        {/* High Weight Card: Overdue tasks (Neubrutalist border accent & bold warning glow) */}
        <div className="bg-rose-950/10 border-2 border-rose-500 rounded-3xl p-6 flex flex-col justify-between min-h-[148px] shadow-[4px_4px_0px_0px_rgba(244,63,94,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(244,63,94,0.4)] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-rose-400 tracking-widest font-display">Overdue</span>
            <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-rose-500 font-display animate-pulse">{overdueTasks}</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Sections (Bento treat, generous spacing, clean Recharts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Weekly Task Creation Trend (Area Chart) */}
        <div className="glass-card rounded-3xl p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-display">Task Creation Rate</h3>
            <p className="text-[10px] text-slate-500 font-medium">Telemetry of new workspace registrations over 7 days</p>
          </div>
          <div className="h-56 mt-6">
            <ResponsiveContainer width="100%" height={224}>
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 5, left: -35, bottom: 0 }}>
                <defs>
                  <linearGradient id="violetGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0f', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#violetGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status distribution (Clean Pie Chart) */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-display">Status Distribution</h3>
            <p className="text-[10px] text-slate-500 font-medium">Summary of active vs complete work items</p>
          </div>
          <div className="h-48 mt-4 flex items-center justify-center">
            {activeStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={activeStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {activeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0f', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-slate-500 text-xs">No active tasks</span>
            )}
          </div>
          {/* Legend */}
          <div className="flex justify-center space-x-6 text-[10px] text-slate-400 mt-2 font-medium">
            {activeStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Priority distribution (Bar Chart) */}
        <div className="glass-card rounded-3xl p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-display">Priority Breakdown</h3>
            <p className="text-[10px] text-slate-500 font-medium">Workload weight grouped by priorities</p>
          </div>
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={priorityData} margin={{ top: 10, right: 5, left: -35, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0f', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                  itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Nav Card */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between text-center min-h-[220px]">
          <div className="text-left w-full">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-display">System Directory</h3>
            <p className="text-[10px] text-slate-500 font-medium">Navigate directly to tasks list index</p>
          </div>
          
          <div className="my-2">
            <Link 
              to="/tasks"
              className="inline-flex items-center space-x-2 btn-brutalist px-5 py-3 rounded-xl text-xs font-bold w-full justify-center group"
            >
              <span className="font-display uppercase tracking-wider">Inspect Tasks Log</span>
              <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="text-[10px] text-slate-500 font-medium">
            <span>Access is scoped based on account roles.</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
