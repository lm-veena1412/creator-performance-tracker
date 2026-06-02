import { useState, useEffect } from 'react';
import axios from 'axios';
import { ListChecks, Plus, Search, Pencil, Trash2, ExternalLink } from 'lucide-react';
import AddLogModal from '../components/AddLogModal';
import EditLogModal from '../components/EditLogModal';

const PerformanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/performance`,
        getAuthHeader()
      );
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this performance log?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/performance/${id}`,
        getAuthHeader()
      );
      fetchLogs(); // Refresh the table
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Failed to delete log.');
    }
  };

  const openEditModal = (log) => {
    setSelectedLog(log);
    setIsEditModalOpen(true);
  };

  // Filter logs based on the search bar input
  const filteredLogs = logs.filter(log => 
    log.creator_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ListChecks className="h-8 w-8 text-blue-600" />
            Performance Logs
          </h1>
          <p className="text-gray-500 mt-1">Track and manage all creator deliverables and views.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Add New Log
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Creator</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Provided Link</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Posted Link</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Views</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No performance logs found matching your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {new Date(log.date_logged).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{log.creator_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.provided_link ? (
                        <a href={log.provided_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                          View Source <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : <span className="text-gray-400 text-sm">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.posted_link ? (
                        <a href={log.posted_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline">
                          View Post <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : <span className="text-gray-400 text-sm">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-200">
                        {log.views_count?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(log)}
                          className="p-2 text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Log"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(log.id)}
                          className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Log"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Reusing your existing Modals */}
      <AddLogModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchLogs} 
      />
      
      <EditLogModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        log={selectedLog} 
        onSuccess={fetchLogs} 
      />
    </div>
  );
};

export default PerformanceLogs;