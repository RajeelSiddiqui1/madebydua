import { useState, useEffect } from 'react';
import { testimonialAPI } from '../../services/api';
import { Plus, Edit, Trash2, X, Star } from 'lucide-react';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({ name: '', reviewText: '', rating: 5, active: true });
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialAPI.getAll();
      setTestimonials(response.data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('reviewText', formData.reviewText);
      data.append('rating', formData.rating);
      data.append('active', formData.active);
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      if (editingId) {
        await testimonialAPI.update(editingId, data);
      } else {
        await testimonialAPI.create(data);
      }
      setIsModalOpen(false);
      setSelectedFile(null);
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await testimonialAPI.delete(id);
        fetchTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await testimonialAPI.toggleStatus(id);
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const openModal = (testimonial = null) => {
    if (testimonial) {
      setFormData({
        name: testimonial.name,
        reviewText: testimonial.reviewText,
        rating: testimonial.rating,
        active: testimonial.active
      });
      setEditingId(testimonial._id);
    } else {
      setFormData({ name: '', reviewText: '', rating: 5, active: true });
      setEditingId(null);
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Reviews & Testimonials</h1>
        <div className="flex gap-4 mb-4 border-b border-border">
          <button 
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-muted-foreground'}`}
          >
            All Reviews
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`pb-2 px-4 ${activeTab === 'active' ? 'border-b-2 border-green-600 text-green-600 font-medium' : 'text-muted-foreground'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab('inactive')}
            className={`pb-2 px-4 ${activeTab === 'inactive' ? 'border-b-2 border-red-600 text-red-600 font-medium' : 'text-muted-foreground'}`}
          >
            Inactive
          </button>
        </div>
        {/* <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} /> Add Review
        </button> */}
      </div>

      <div className="bg-white rounded-lg border border-border overflow-x-auto shadow-sm">
        <table className="min-w-[800px] w-full divide-y divide-border">
             <thead className="bg-white">
             <tr>
               <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Image</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Review</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rating</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Source</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
               <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-border">
             {testimonials
               .filter(test => {
                 if (activeTab === 'active') return test.active;
                 if (activeTab === 'inactive') return !test.active;
                 return true;
               })
               .map((test) => (
              <tr key={test._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                   {test.image ? (
                     <img 
                       src={`${import.meta.env.VITE_BACKEND_URL?.replace('/api', '/uploads/testimonial')}/${test.image}`} 
                       alt={test.name} 
                       className="w-10 h-10 rounded-full object-cover"
                     />
                   ) : (
                     <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-muted-foreground">
                       <Plus size={16} />
                     </div>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{test.name}</td>
                <td className="px-6 py-4 max-w-xs truncate">{test.reviewText}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < test.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap">
                   <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 py-1 text-xs rounded-full ${test.source === 'website' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                       {test.source === 'website' ? '🌐 Website' : '👤 Admin'}
                     </span>
                   </td>
                      </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <button 
                       onClick={() => handleToggleStatus(test._id)}
                       className={`px-3 py-1 text-xs rounded-full cursor-pointer transition ${test.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                     >
                       {test.active ? '✓ Active' : '🔴 Inactive'}
                     </button>
                   </td>
              
                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                   {/* {test.source === 'admin' && (
                     <button onClick={() => openModal(test)} className="text-blue-600 hover:text-blue-900 mr-3">
                       <Edit size={18} />
                     </button>
                   )} */}
                   <button onClick={() => handleDelete(test._id)} className="text-red-600 hover:text-red-900">
                     <Trash2 size={18} />
                   </button>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Review' : 'Add Review'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">User Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Review Text</label>
                <textarea
                  required
                  rows="4"
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  className="w-full p-2 border rounded-md"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  required
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <label htmlFor="active" className="text-sm font-medium">Show on Homepage</label>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
