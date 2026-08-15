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

  // Chart 1: Status Dataset (Clean palette matching accent guidelines)
  const statusData = [
    { name: 'To Do', value: todoTasks, color: '#475569' }, // slate-600
    { name: 'In Progress', value: inProgressTasks, color: '#8b5cf6' }, // purple-500
    { name: 'Completed', value: completedTasks, color: '#10b981' } // emerald-500
  ];
  const activeStatusData = [
    { name: 'To Do', value: todoTasks, color: '#475569' },
    { name: 'In Progress', value: inProgressTasks, color: '#8b5cf6' },
    { name: 'Completed', value: completedTasks, color: '#10b981' }
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
    { name: 'Medium', count: priorityCounts.medium, color: '#3b82f6' }, // cobalt primary
    { name: 'High', count: priorityCounts.high, color: '#2563eb' },
    { name: 'Urgent', count: priorityCounts.urgent, color: '#1d4ed8' }
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
        <div className="h-10 bg-slate-900/40 rounded-2xl w-1/3 border border-slate-900/60" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="h-28 bg-slate-900/40 border border-slate-900/60 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-900/40 border border-slate-900/60 rounded-3xl md:col-span-2" />
          <div className="h-80 bg-slate-900/40 border border-slate-900/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      
      {/* Greetings Block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Overview
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time analytics and task completion telemetry.
          </p>
        </div>
        <div>
          <Link
            to="/tasks/create"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border border-blue-500/20 shadow-lg shadow-blue-600/5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid (Visual Weight differences applied) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Tasks Card */}
        <div className="bg-slate-900/10 border border-slate-900/80 rounded-2xl p-5 hover:-translate-y-0.5 transition-transform duration-150 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Tasks</span>
            <span className="text-3xl font-extrabold text-white block font-heading">{totalTasks}</span>
          </div>
          <div className="p-2.5 bg-slate-950/40 rounded-xl text-slate-500 border border-slate-900">
            <ListTodo className="w-4 h-4" />
          </div>
        </div>

        {/* To Do Card */}
        <div className="bg-slate-900/10 border border-slate-900/80 rounded-2xl p-5 hover:-translate-y-0.5 transition-transform duration-150 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">To Do</span>
            <span className="text-3xl font-extrabold text-slate-300 block font-heading">{todoTasks}</span>
          </div>
          <div className="p-2.5 bg-slate-950/40 rounded-xl text-slate-500 border border-slate-900">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* In Progress Card */}
        <div className="bg-slate-900/10 border border-slate-900/80 rounded-2xl p-5 hover:-translate-y-0.5 transition-transform duration-150 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">In Progress</span>
            <span className="text-3xl font-extrabold text-purple-400 block font-heading">{inProgressTasks}</span>
          </div>
          <div className="p-2.5 bg-purple-500/5 rounded-xl text-purple-400 border border-purple-500/10">
            <PlayCircle className="w-4 h-4" />
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-slate-900/10 border border-slate-900/80 rounded-2xl p-5 hover:-translate-y-0.5 transition-transform duration-150 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Completed</span>
            <span className="text-3xl font-extrabold text-emerald-400 block font-heading">{completedTasks}</span>
          </div>
          <div className="p-2.5 bg-emerald-500/5 rounded-xl text-emerald-400 border border-emerald-500/10">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Overdue Card (Has high visual weight: rose borders, glowing pulse, and warning indicators) */}
        <div className="bg-rose-950/5 border border-rose-500/15 rounded-2xl p-5 hover:-translate-y-0.5 transition-transform duration-150 flex items-center justify-between col-span-2 md:col-span-1 shadow-lg shadow-rose-950/5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-500/60 tracking-wider">Overdue</span>
            <span className="text-3xl font-black text-rose-400 block font-heading animate-pulse">{overdueTasks}</span>
          </div>
          <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections (Generous spacing, clean Recharts styling, no gridlines) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Weekly Task Creation Trend (Area Chart) */}
        <div className="bg-slate-900/10 border border-slate-900/60 rounded-3xl p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-heading">Task Creation Rate</h3>
            <p className="text-[10px] text-slate-500 font-medium">Summary of new items registered over the last 7 days</p>
          </div>
          <div className="h-56 mt-6">
            <ResponsiveContainer width="100%" height={224}>
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 5, left: -35, bottom: 0 }}>
                <defs>
                  <linearGradient id="cobaltGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                {/* Clean: Gridlines omitted for visual simplicity */}
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#cobaltGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Rate Radial Gauge */}
        <div className="bg-slate-900/10 border border-slate-900/60 rounded-3xl p-6 flex flex-col items-center justify-between text-center">
          <div className="w-full text-left">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-heading">Completion Rate</h3>
            <p className="text-[10px] text-slate-500 font-medium">Telemetry on closed task assignments</p>
          </div>
          
          {/* Radial Donut Progress */}
          <div className="relative w-36 h-36 flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#101726" strokeWidth="6" fill="transparent" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                stroke="#3b82f6" // cobalt accent
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * completionPercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white font-heading">{completionPercentage}%</span>
              <span className="text-[8px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">Closed</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-medium">
            <span>{completedTasks} of {totalTasks} tasks closed</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Status distribution (Clean Pie Chart) */}
        <div className="bg-slate-900/10 border border-slate-900/60 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-heading">Status Distribution</h3>
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
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-slate-500 text-xs">No active tasks</span>
            )}
          </div>
          {/* Muted inline legend */}
          <div className="flex justify-center space-x-6 text-[10px] text-slate-400 mt-2 font-medium">
            {activeStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority distribution (Bar Chart) */}
        <div className="bg-slate-900/10 border border-slate-900/60 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-heading">Priority Breakdown</h3>
            <p className="text-[10px] text-slate-500 font-medium">Workload weight grouped by priorities</p>
          </div>
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={priorityData} margin={{ top: 10, right: 5, left: -35, bottom: 0 }}>
                {/* Clean: Gridlines and axis lines hidden */}
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
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

      </div>

      {/* Primary Navigation link */}
      <div className="text-center pt-2">
        <Link 
          to="/tasks"
          className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-200 transition-colors font-semibold group"
        >
          <span>Navigate to Tasks list directory</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

    </div>
  );
};

export default Dashboard;
