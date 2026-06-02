import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Download, BarChart2, Award, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Analytics = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topCreators, setTopCreators] = useState([]);
  // NEW: State to hold our new monthly breakdown data
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

  useEffect(() => {
    fetchData();
  }, []);

 const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Fetch general logs safely
      try {
        const logsRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/performance`, 
          config
        );
        
        const allLogs = logsRes.data;
        setLogs(allLogs);
        
        // Calculate Top 5 Creators
        const creatorStats = allLogs.reduce((acc, log) => {
          if (!acc[log.creator_name]) {
            acc[log.creator_name] = 0;
          }
          acc[log.creator_name] += (log.views_count || 0);
          return acc;
        }, {});

        const sortedCreators = Object.entries(creatorStats)
          .map(([name, views]) => ({ name, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        setTopCreators(sortedCreators);
      } catch (logError) {
        console.error('Error fetching general logs:', logError);
      }

      // 2. Fetch monthly stats safely (Won't crash the whole page if it 404s!)
      try {
        const monthlyRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/performance/creator-monthly-stats`, 
          config
        );
        setMonthlyBreakdown(monthlyRes.data);
      } catch (monthError) {
        console.error('Monthly stats endpoint not live yet (404). Waiting for Render to deploy.');
      }

    } catch (error) {
      console.error('Auth configuration error:', error);
    } finally {
      setLoading(false);
    }
  };
  const exportToCSV = () => {
    if (logs.length === 0) return alert("No data to export!");

    const headers = ['Date Logged', 'Creator Name', 'Provided Link', 'Posted Link', 'Total Views'];
    const csvRows = logs.map(log => [
      new Date(log.date_logged).toLocaleDateString(),
      `"${log.creator_name}"`,
      `"${log.provided_link || 'N/A'}"`,
      `"${log.posted_link || 'N/A'}"`,
      log.views_count || 0
    ]);

    const csvContent = [headers, ...csvRows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Creator_Performance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to format the YYYY-MM into a nice readable month
  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            Performance Analytics
          </h1>
          <p className="text-gray-500 mt-1">Deep dive into creator metrics and export reports.</p>
        </div>
        
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
        >
          <Download className="h-5 w-5" />
          Export to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            <Award className="h-6 w-6 text-yellow-500" />
            Top 5 Creators by Views
          </h2>
          
          {topCreators.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-slate-50 rounded-xl border border-dashed">
              Not enough data to generate leaderboard.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCreators} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [value.toLocaleString(), 'Total Views']}
                />
                <Bar dataKey="views" radius={[0, 4, 4, 0]} barSize={32}>
                  {topCreators.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
               </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Insights Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            <BarChart2 className="h-6 w-6 text-blue-600" />
            System Insights
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-1">Total Logs Tracked</p>
              <p className="text-3xl font-black text-blue-900">{logs.length}</p>
            </div>
            
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-1">Highest Single Post</p>
              <p className="text-xl font-bold text-emerald-900">
                {logs.length > 0 
                  ? Math.max(...logs.map(l => l.views_count || 0)).toLocaleString() 
                  : 0} Views
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-sm font-bold text-purple-800 uppercase tracking-wider mb-1">System Status</p>
              <p className="text-gray-700 font-medium">
                Live database connection active. Tracking analytics across {topCreators.length} active creators.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Creator Monthly Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Creator Monthly Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reporting Month</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Creator Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Deliverables</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthlyBreakdown.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No monthly tracking data available yet.
                  </td>
                </tr>
              ) : (
                monthlyBreakdown.map((row, index) => (
                  <tr key={`${row.creator_id}-${row.month}-${index}`} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                      {formatMonth(row.month)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{row.creator_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-sm">
                        {row.posts_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                        {row.total_views.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Analytics;