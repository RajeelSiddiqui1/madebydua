import { useEffect, useState } from 'react';
import { settingsAPI } from '../../services/api';
import { Upload, Shield, Heart, Package, Truck, Save, X } from 'lucide-react';

const iconOptions = [
  { value: 'Shield', label: 'Shield', icon: Shield },
  { value: 'Heart', label: 'Heart', icon: Heart },
  { value: 'Package', label: 'Package', icon: Package },
  { value: 'Truck', label: 'Truck', icon: Truck },
];

const defaultFeatures = [
  { icon: 'Shield', title: 'Repeated Customer', description: '10% off on your next purchase' },
  { icon: 'Heart', title: 'Careful Packaging', description: 'Securely packed for safe arrival' },
  { icon: 'Package', title: 'Prepaid Order', description: 'Enjoy free shopping on order above 3499' },
  { icon: 'Truck', title: 'Nationwide Delivery', description: 'Delivery available across Pakistan' },
];

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImage, setHeroImage] = useState('');
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [features, setFeatures] = useState(defaultFeatures);
  const [previewUrl, setPreviewUrl] = useState('');
  const UPLOADS_URL = import.meta.env.VITE_BACKEND_URL ? 
    import.meta.env.VITE_BACKEND_URL.replace('/api', '/uploads/settings') : 
    'http://localhost:5007/uploads/settings';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.get();
      if (res.data) {
        setHeroImage(res.data.heroImage || '');
        setFeatures(res.data.features?.length ? res.data.features : defaultFeatures);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...features];
    newFeatures[index][field] = value;
    setFeatures(newFeatures);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (heroImageFile) {
        const formData = new FormData();
        formData.append('image', heroImageFile);
        await settingsAPI.uploadHero(formData);
      }
      await settingsAPI.update({ heroImage, features });
      alert('Settings saved successfully!');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
      setHeroImageFile(null);
      setPreviewUrl('');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${UPLOADS_URL}/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold mb-4">Website Settings</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Hero Image Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Hero Section Image</h2>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-64 h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
              {previewUrl || heroImage ? (
                <img 
                  src={previewUrl || getImageUrl(heroImage)} 
                  alt="Hero Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="text-gray-400" size={32} />
              )}
            </div>
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Upload New Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-2">
                Recommended size: 1920x1080px
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Features / Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const IconComponent = iconOptions.find(opt => opt.value === feature.icon)?.icon || Shield;
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent size={20} className="text-blue-600" />
                    <span className="text-sm font-medium">Feature {index + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      value={feature.icon}
                      onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {iconOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                      placeholder="Title"
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
