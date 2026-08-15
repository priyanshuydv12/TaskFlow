import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  CheckCircle2, PlayCircle, Clock, AlertTriangle, ListTodo, Plus, LogOut, LayoutDashboard 
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
  const statusData = [
    { name: 'To Do', value: todoTasks, color: '#64748b' }, // Slate
    { name: 'In Progress', value: inProgressTasks, color: '#a855f7' }, // Purple
    { name: 'Completed', value: completedTasks, color: '#10b981' } // Emerald
  ].filter(item => item.value > 0);

  // Chart 2: Priority Dataset
  const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
  tasks.forEach(t => {
    if (priorityCounts[t.priority] !== undefined) {
      priorityCounts[t.priority]++;
    }
  });
  const priorityData = [
    { name: 'Low', count: priorityCounts.low, color: '#475569' },
    { name: 'Medium', count: priorityCounts.medium, color: '#3b82f6' },
    { name: 'High', count: priorityCounts.high, color: '#f59e0b' },
    { name: 'Urgent', count: priorityCounts.urgent, color: '#f43f5e' }
  ];

  // Chart 3: Weekly Creation Trend (Last 7 days)
  const getWeeklyTrend = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trend = [];
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = days[d.getDay()];
      const dayDateStr = d.toDateString();
      
      // Count tasks created on this specific day
      const count = tasks.filter(t => {
        const createdDate = new Date(t.createdAt).toDateString();
        return createdDate === dayDateStr;
      }).length;

      trend.push({ name: dayLabel, count });
    }
    return trend;
  };

  const weeklyTrendData = getWeeklyTrend();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 relative">
      {/* Glow backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(86,115,252,0.06),transparent_50%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative">
        
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-400 border border-primary-500/20">
              <LayoutDashboard className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Task Manager
              </h1>
              <p className="text-xs text-slate-500">Welcome, {user?.name || 'User'} ({user?.role})</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/tasks"
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors"
            >
              <ListTodo className="w-4 h-4" />
              <span>View Tasks</span>
            </Link>
            <Link
              to="/tasks/create"
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 active:bg-primary-700 px-4 py-2.5 rounded-xl border border-primary-500/30 font-semibold text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-2.5 rounded-xl font-semibold text-xs text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="h-24 bg-slate-900/40 border border-slate-850 rounded-2xl animate-pulse"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80 bg-slate-900/40 border border-slate-850 rounded-2xl animate-pulse"></div>
              <div className="h-80 bg-slate-900/40 border border-slate-850 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Total Card */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 hover:border-slate-800 transition-all flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Tasks</span>
                  <span className="text-2xl font-bold mt-1 block">{totalTasks}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl text-slate-400 border border-slate-800">
                  <ListTodo className="w-5 h-5" />
                </div>
              </div>

              {/* Todo Card */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 hover:border-slate-800 transition-all flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">To Do</span>
                  <span className="text-2xl font-bold mt-1 block text-slate-300">{todoTasks}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl text-slate-400 border border-slate-800">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              {/* In Progress Card */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 hover:border-slate-800 transition-all flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">In Progress</span>
                  <span className="text-2xl font-bold mt-1 block text-purple-400">{inProgressTasks}</span>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                  <PlayCircle className="w-5 h-5" />
                </div>
              </div>

              {/* Completed Card */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 hover:border-slate-800 transition-all flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Completed</span>
                  <span className="text-2xl font-bold mt-1 block text-emerald-400">{completedTasks}</span>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              {/* Overdue Card */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 hover:border-slate-800 transition-all flex items-center justify-between col-span-2 md:col-span-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Overdue</span>
                  <span className="text-2xl font-bold mt-1 block text-rose-400">{overdueTasks}</span>
                </div>
                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart: Status Breakdown */}
              <div className="bg-slate-900/30 border border-slate-850 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-200">Tasks By Status</h3>
                  <p className="text-[10px] text-slate-500">Distribution of active vs complete work items</p>
                </div>
                <div className="h-60 mt-4 flex items-center justify-center">
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                          itemStyle={{ color: '#f1f5f9', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-slate-500 text-xs">Create tasks to view breakdown.</span>
                  )}
                </div>
                {/* Custom Legends */}
                <div className="flex justify-center space-x-6 text-[11px] text-slate-400 mt-2">
                  {statusData.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart: Priority Breakdown */}
              <div className="bg-slate-900/30 border border-slate-850 rounded-3xl p-6">
                <div>
                  <h3 className="font-bold text-slate-200">Tasks By Priority</h3>
                  <p className="text-[10px] text-slate-500">Quantity of work items mapped by priority level</p>
                </div>
                <div className="h-60 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#f1f5f9', fontSize: '12px' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
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

            {/* Weekly trend & Completion percentage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Line Chart: Weekly Trend (Takes 2/3 space on desktop) */}
              <div className="bg-slate-900/30 border border-slate-850 rounded-3xl p-6 md:col-span-2">
                <div>
                  <h3 className="font-bold text-slate-200">Weekly Task Creation</h3>
                  <p className="text-[10px] text-slate-500">Number of tasks created over the last 7 days</p>
                </div>
                <div className="h-52 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5673fc" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#5673fc" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#f1f5f9', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#5673fc" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Completion Rate Gauge */}
              <div className="bg-slate-900/30 border border-slate-850 rounded-3xl p-6 flex flex-col items-center justify-between text-center">
                <div className="w-full text-left">
                  <h3 className="font-bold text-slate-200">Completion rate</h3>
                  <p className="text-[10px] text-slate-500">Percentage of tasks fully closed</p>
                </div>
                
                {/* Big Donut style progress */}
                <div className="relative w-36 h-36 flex items-center justify-center mt-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="#5673fc" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 - (251.2 * completionPercentage) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-100">{completionPercentage}%</span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5">Finished</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 mt-2">
                  <span>{completedTasks} of {totalTasks} tasks completed</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
