import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Pencil, Trash2, Mail, Phone, MapPin, X } from 'lucide-react';

const Creators = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState(null);
  
  // Form state matches your backend controller perfectly
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchCreators();
  }, []);

  // Standard config to prevent those 401 errors!
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchCreators = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/creators`, 
        getAuthHeader()
      );
      setCreators(res.data);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCreator) {
        // Update existing creator
        await axios.put(
          `${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/creators/${editingCreator.id}`,
          formData,
          getAuthHeader()
        );
      } else {
        // Create new creator
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/creators`,
          formData,
          getAuthHeader()
        );
      }
      
      closeModal();
      fetchCreators(); // Refresh the table
    } catch (error) {
      console.error('Error saving creator:', error);
      alert('Failed to save creator. Check console for details.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This might fail if they have existing performance logs.`)) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/creators/${id}`,
        getAuthHeader()
      );
      fetchCreators();
    } catch (error) {
      console.error('Error deleting creator:', error);
      alert(error.response?.data?.message || 'Failed to delete creator.');
    }
  };

  const openEditModal = (creator) => {
    setEditingCreator(creator);
    setFormData({
      name: creator.name || '',
      email: creator.email || '',
      phone: creator.phone || '',
      address: creator.address || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCreator(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Creator Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your creator roster and contact details.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Add New Creator
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Creator</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {creators.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No creators found. Add your first creator to get started.
                  </td>
                </tr>
              ) : (
                creators.map((creator) => (
                  <tr key={creator.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {creator.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{creator.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {creator.email && (
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {creator.email}
                        </div>
                      )}
                      {creator.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {creator.phone}
                        </div>
                      )}
                      {!creator.email && !creator.phone && <span className="text-gray-400 italic">No contact info</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {creator.address ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{creator.address}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => openEditModal(creator)}
                          className="p-2 text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(creator.id, creator.name)}
                          className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCreator ? 'Edit Creator' : 'Add New Creator'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Marques Brownlee"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="creator@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                <textarea 
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter studio or office address"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                >
                  {editingCreator ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Creators;