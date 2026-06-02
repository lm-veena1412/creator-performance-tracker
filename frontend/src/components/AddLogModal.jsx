import { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const AddLogModal = ({ isOpen, onClose, onSuccess }) => {
  const [creators, setCreators] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  
  const [formData, setFormData] = useState({
    creator_id: '',
    provided_link: '',
    posted_link: '',
    views_count: ''
  });

  // Whenever the modal opens, fetch the latest list of creators for the dropdown
  useEffect(() => {
    if (isOpen) {
      fetchCreators();
    }
  }, [isOpen]);

  const fetchCreators = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/creators`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreators(res.data);
      // Auto-select the first creator in the list if they exist
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, creator_id: res.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching creators for dropdown:', error);
    } finally {
      setLoadingCreators(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'https://creator-performance-tracker.onrender.com'}/api/performance`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form and close
      setFormData({ creator_id: '', provided_link: '', posted_link: '', views_count: '' });
      onSuccess(); // Refresh the table behind the modal
      onClose();   // Close the modal
    } catch (error) {
      console.error('Error creating log:', error);
      alert('Failed to save log. Make sure you selected a creator.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-gray-800">Add Performance Log</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* THE MAGIC DROPDOWN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Creator *</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              value={formData.creator_id}
              onChange={(e) => setFormData({...formData, creator_id: e.target.value})}
              disabled={loadingCreators}
            >
              <option value="" disabled>-- Select a Creator --</option>
              {creators.map(creator => (
                <option key={creator.id} value={creator.id}>
                  {creator.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provided Link (Original Source)</label>
            <input 
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.provided_link}
              onChange={(e) => setFormData({...formData, provided_link: e.target.value})}
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Posted Link (Live Post)</label>
            <input 
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.posted_link}
              onChange={(e) => setFormData({...formData, posted_link: e.target.value})}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Views Generated *</label>
            <input 
              type="number" required min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.views_count}
              onChange={(e) => setFormData({...formData, views_count: e.target.value})}
              placeholder="e.g. 15000"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
            >
              Save Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLogModal;