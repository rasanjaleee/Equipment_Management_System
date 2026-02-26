import { useState, useEffect } from 'react';
import { Plus, Save, X, Package, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import axios from 'axios';

export default function AdminEquipment() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentList, setEquipmentList] = useState([]);
  const [formData, setFormData] = useState({
    equipmentName: '',
    laboratoryName: '',
    category: '',
    totalQuantity: '',
    workingAmount: '',
    underRepair: '',
    broken: ''
  });

  // Fetch equipment list from backend
  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/equipment', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEquipmentList(response.data);
    } catch (err) {
      console.error('Failed to fetch equipment:', err);
      // Keep empty list if fetch fails
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    const total = parseInt(formData.totalQuantity) || 0;
    const working = parseInt(formData.workingAmount) || 0;
    const repair = parseInt(formData.underRepair) || 0;
    const broken = parseInt(formData.broken) || 0;

    if (working + repair + broken !== total) {
      setError('Working + Under Repair + Broken must equal Total Quantity');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/admin/equipment', {
        name: formData.equipmentName,
        laboratory: formData.laboratoryName,
        category: formData.category,
        totalQuantity: parseInt(formData.totalQuantity),
        workingAmount: parseInt(formData.workingAmount),
        underRepair: parseInt(formData.underRepair),
        broken: parseInt(formData.broken)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess('Equipment added successfully!');
      
      // Refresh equipment list
      await fetchEquipment();
      
      // Reset form
      setFormData({
        equipmentName: '',
        laboratoryName: '',
        category: '',
        totalQuantity: '',
        workingAmount: '',
        underRepair: '',
        broken: ''
      });
      
      setTimeout(() => {
        setShowForm(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add equipment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      equipmentName: '',
      laboratoryName: '',
      category: '',
      totalQuantity: '',
      workingAmount: '',
      underRepair: '',
      broken: ''
    });
    setError('');
    setSuccess('');
    setShowForm(false);
  };

  const filteredEquipment = equipmentList.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.laboratory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-xl shadow-lg">
                  <Package className="text-white" size={24} />
                </div>
                Equipment Management
              </h1>
              <p className="text-gray-600 text-sm">Manage and track all laboratory equipment</p>
            </div>
            
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm"
              >
                <Plus size={20} />
                Add New Equipment
              </button>
            )}
          </div>
        </div>

        {/* Equipment Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Plus className="text-yellow-600" size={22} />
                </div>
                Add New Equipment
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 transition p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                  Basic Information
                </h3>
                
                <div className="space-y-6">
                  {/* Equipment Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="equipmentName"
                      value={formData.equipmentName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-sm"
                      placeholder="e.g., Oscilloscope DSO-X 3000"
                      required
                    />
                  </div>

                  {/* Laboratory Name and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Laboratory Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="laboratoryName"
                        value={formData.laboratoryName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-sm"
                        placeholder="e.g., Electronics Lab A"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-sm"
                        placeholder="e.g., Measurement Instruments"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity & Status Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                  Quantity & Status
                </h3>

                <div className="space-y-6">
                  {/* Total Quantity */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Total Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalQuantity"
                      value={formData.totalQuantity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-sm font-semibold"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>

                  {/* Status Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl border-2 border-green-200 shadow-sm">
                      <label className="block text-xs font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Working Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="workingAmount"
                        value={formData.workingAmount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-green-50 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-lg font-bold text-green-700 text-center"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div className="bg-white p-5 rounded-xl border-2 border-orange-200 shadow-sm">
                      <label className="block text-xs font-semibold text-orange-700 mb-3 flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        Under Repair <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="underRepair"
                        value={formData.underRepair}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-lg font-bold text-orange-700 text-center"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div className="bg-white p-5 rounded-xl border-2 border-red-200 shadow-sm">
                      <label className="block text-xs font-semibold text-red-700 mb-3 flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Broken <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="broken"
                        value={formData.broken}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-red-50 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-lg font-bold text-red-700 text-center"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-md">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-sm">{error}</span>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg shadow-md">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-sm">{success}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Save Equipment</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition duration-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Equipment List Section */}
        {!showForm && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200">
            {/* Search and Filter Bar */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search equipment by name, lab, or category..."
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition text-sm"
                  />
                </div>
                <button className="flex items-center gap-2 px-5 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition text-sm">
                  <Filter size={18} />
                  Filter
                </button>
              </div>
            </div>

            {/* Equipment Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-sm">Equipment Name</th>
                    <th className="px-6 py-3 text-left font-bold text-sm">Laboratory</th>
                    <th className="px-6 py-3 text-left font-bold text-sm">Category</th>
                    <th className="px-6 py-3 text-center font-bold text-sm">Total</th>
                    <th className="px-6 py-3 text-center font-bold text-sm">Working</th>
                    <th className="px-6 py-3 text-center font-bold text-sm">Repair</th>
                    <th className="px-6 py-3 text-center font-bold text-sm">Broken</th>
                    <th className="px-6 py-3 text-center font-bold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEquipment.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{item.laboratory}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-800 text-sm">{item.totalQuantity}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-sm">
                          {item.workingAmount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg font-bold text-sm">
                          {item.underRategory}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-800 text-sm">{item.total}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-sm">
                          {item.working}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg font-bold text-sm">
                          {item.repair}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-bold text-sm">
                          {item.broken}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredEquipment.length === 0 && (
              <div className="text-center py-16">
                <Package className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 text-base">No equipment found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}