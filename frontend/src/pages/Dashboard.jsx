import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Users, Link as LinkIcon, Eye, LogOut, Plus, Pencil, BarChart3, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CreatorDetailsModal from '../components/CreatorDetailsModal';
import AddLogModal from '../components/AddLogModal';
import EditLogModal from '../components/EditLogModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalCreators: 0,
    totalProvidedLinks: 0,
    totalPostedLinks: 0,
    totalViews: 0
  });
  const [performanceLogs, setPerformanceLogs] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // FIX: Explicitly grab the token to prevent 401 Unauthorized errors
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [statsRes, logsRes, monthlyRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/performance/stats`, config),
        axios.get(`${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/performance`, config),
        axios.get(`${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/performance/monthly-stats`, config)
      ]);
      
      setStats(statsRes.data);
      setPerformanceLogs(logsRes.data);
      setMonthlyStats(monthlyRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        logout(); // Auto-logout if token is truly expired
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewCreator = async (creatorId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [creatorRes, logsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/creators/${creatorId}`, config),
        axios.get(`${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/performance/creator/${creatorId}`, config)
      ]);
      
      setSelectedCreator({
        ...creatorRes.data,
        performanceHistory: logsRes.data
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching creator details:', error);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this performance log?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/performance/${logId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-lg p-6 text-white transform transition-all hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-extrabold">{value}</p>
        </div>
        <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading Command Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Performance Command Center</h1>
              <p className="text-sm text-gray-500 font-medium">Administrator: {user?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium border border-transparent hover:border-red-100"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Creators" value={stats.totalCreators} icon={Users} gradient="from-blue-500 to-blue-700" />
          <StatCard title="Links Provided" value={stats.totalProvidedLinks} icon={LinkIcon} gradient="from-emerald-400 to-emerald-600" />
          <StatCard title="Links Posted" value={stats.totalPostedLinks} icon={LinkIcon} gradient="from-violet-500 to-purple-700" />
          <StatCard title="Total Views" value={stats.totalViews.toLocaleString()} icon={Eye} gradient="from-orange-400 to-red-500" />
        </div>

        {/* Analytics Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Monthly Growth Analytics
          </h2>
          
          {monthlyStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-slate-50 rounded-xl border-2 border-dashed border-gray-200">
              <BarChart3 className="h-12 w-12 mb-3 text-gray-300" />
              <p>No analytics data available yet. Start tracking performance logs to generate insights.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#64748b', fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => {
                    if (!value) return '';
                    const [year, month] = value.split('-');
                    const date = new Date(year, month - 1);
                    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
                  }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <Tooltip 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(value) => {
                    if (!value) return '';
                    const [year, month] = value.split('-');
                    const date = new Date(year, month - 1);
                    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total_views" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#2563eb' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-xl font-bold text-gray-800">Recent Tracking Logs</h2>
            <button 
              onClick={() => setIsAddLogModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 hover:shadow-md transition-all"
            >
              <Plus className="h-5 w-5" />
              Add New Log
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Creator Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Provided Link</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Posted Link</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Views</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {performanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-slate-50/50">
                      No tracking logs found. Click "Add New Log" to populate the table.
                    </td>
                  </tr>
                ) : (
                  performanceLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{log.creator_name}</div>
                        <div className="text-xs text-gray-500">{new Date(log.date_logged).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.provided_link ? (
                          <a href={log.provided_link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">View Source</a>
                        ) : <span className="text-gray-400 text-sm">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.posted_link ? (
                          <a href={log.posted_link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline">View Post</a>
                        ) : <span className="text-gray-400 text-sm">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {log.views_count.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleViewCreator(log.creator_id)} className="text-gray-400 hover:text-blue-600 transition-colors" title="View Details"><Eye className="h-5 w-5" /></button>
                          <button onClick={() => { setSelectedLog(log); setIsEditModalOpen(true); }} className="text-gray-400 hover:text-emerald-600 transition-colors" title="Edit Log"><Pencil className="h-5 w-5" /></button>
                          <button onClick={() => handleDeleteLog(log.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete Log">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals remain the same */}
      <CreatorDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} creator={selectedCreator} />
      <AddLogModal isOpen={isAddLogModalOpen} onClose={() => setIsAddLogModalOpen(false)} onSuccess={fetchDashboardData} />
      <EditLogModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} log={selectedLog} onSuccess={fetchDashboardData} />
    </div>
  );
};

export default Dashboard;