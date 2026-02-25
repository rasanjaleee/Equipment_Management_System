import { useState, useEffect } from 'react';
import { Plus, Save, X, Package, Search, Filter, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

export default function AdminEquipment() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentList, setEquipmentList] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    equipmentName: '',
    laboratory: '',
    model: '',
    serialNumber: '',
    cost: '',
    purchaseDate: '',
    supplier: '',
    status: 'WORKING',
    qrCode: '',
    grnNumber: ''
  });

  // ================= FETCH EQUIPMENT =================
  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        'http://localhost:8080/api/equipment/all',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEquipmentList(res.data);
    } catch (err) {
      console.error('Failed to fetch equipment:', err);
    }
  };

  // ================= FORM HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      const data = new FormData();
      data.append('equipmentName', formData.equipmentName);
      data.append('laboratory', formData.laboratory);
      data.append('model', formData.model);
      data.append('serialNumber', formData.serialNumber);
      data.append('cost', formData.cost);
      data.append('purchaseDate', formData.purchaseDate);
      data.append('supplier', formData.supplier);
      data.append('status', formData.status);
      data.append('qrCode', formData.qrCode);
      data.append('grnNumber', formData.grnNumber);
      if (photo) {
        data.append('photo', photo);
      }

      if (editMode) {
        // UPDATE existing equipment
        await axios.put(
          `http://localhost:8080/api/equipment/update/${editingId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setSuccess('Equipment updated successfully!');
      } else {
        // ADD new equipment
        await axios.post(
          'http://localhost:8080/api/equipment/add',
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setSuccess('Equipment added successfully!');
      }

      await fetchEquipment();
      resetForm();
      setTimeout(() => setShowForm(false), 1500);

    } catch (err) {
      setError(err.response?.data || `Failed to ${editMode ? 'update' : 'add'} equipment`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      equipmentName: '',
      laboratory: '',
      model: '',
      serialNumber: '',
      cost: '',
      purchaseDate: '',
      supplier: '',
      status: 'WORKING',
      qrCode: '',
      grnNumber: ''
    });
    setPhoto(null);
    setError('');
    setSuccess('');
    setEditMode(false);
    setEditingId(null);
  };

  // ================= EDIT HANDLER =================
  const handleEdit = (equipment) => {
    setFormData({
      equipmentName: equipment.equipmentName || '',
      laboratory: equipment.laboratory || '',
      model: equipment.model || '',
      serialNumber: equipment.serialNumber || '',
      cost: equipment.cost || '',
      purchaseDate: equipment.purchaseDate || '',
      supplier: equipment.supplier || '',
      status: equipment.status || 'WORKING',
      qrCode: equipment.qrCode || '',
      grnNumber: equipment.grnNumber || ''
    });
    setEditMode(true);
    setEditingId(equipment.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  // ================= DELETE HANDLER =================
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8080/api/equipment/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      await fetchEquipment();
      setSuccess('Equipment deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to delete equipment');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ================= FILTER =================
  const filteredEquipment = equipmentList.filter(item =>
    item.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.laboratory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= RENDER =================
  return (
   
      <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8 min-h-full">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package /> Equipment Management
            </h1>
            {!showForm && (
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-yellow-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-yellow-600 transition-colors"
              >
                <Plus size={18} /> Add Equipment
              </button>
            )}
          </div>

          {/* ================= FORM ================= */}
          {showForm && (
            <div className="bg-white p-8 rounded-2xl shadow-2xl mb-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    title="Back to equipment list"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <Package className="text-yellow-500" size={28} />
                    {editMode ? 'Edit Equipment' : 'Add New Equipment'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-yellow-500 rounded"></div>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="equipmentName"
                        placeholder="Enter equipment name"
                        value={formData.equipmentName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Laboratory <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="laboratory"
                        placeholder="Enter laboratory name"
                        value={formData.laboratory}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                      </label>
                      <input
                        type="text"
                        name="model"
                        placeholder="Enter model number"
                        value={formData.model}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Serial Number
                      </label>
                      <input
                        type="text"
                        name="serialNumber"
                        placeholder="Enter serial number"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none bg-white cursor-pointer"
                      >
                        <option value="WORKING">Working</option>
                        <option value="UNDER_REPAIR">Under Repair</option>
                        <option value="BROKEN">Broken</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Purchase Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-yellow-500 rounded"></div>
                    Purchase Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost ($)
                      </label>
                      <input
                        type="number"
                        name="cost"
                        placeholder="Enter cost"
                        value={formData.cost}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        placeholder="Enter supplier name"
                        value={formData.supplier}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GRN Number
                      </label>
                      <input
                        type="text"
                        name="grnNumber"
                        placeholder="Enter GRN number"
                        value={formData.grnNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-yellow-500 rounded"></div>
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        QR Code
                      </label>
                      <input
                        type="text"
                        name="qrCode"
                        placeholder="Enter QR code"
                        value={formData.qrCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment Photo {!editMode && <span className="text-red-500">*</span>}
                        {editMode && <span className="text-sm text-gray-500">(Optional - leave empty to keep current)</span>}
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          required={!editMode}
                          onChange={(e) => setPhoto(e.target.files[0])}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer"
                        />
                      </div>
                      {photo && (
                        <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                          <Save size={14} />
                          {photo.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-green-700 font-medium">{success}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    <Save size={20} />
                    {loading ? 'Saving...' : (editMode ? 'Update Equipment' : 'Save Equipment')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(false);
                    }}
                    className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TABLE ================= */}
          {!showForm && (
            <>
              {/* Messages for delete operations */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
                  <p className="text-green-700 font-medium">{success}</p>
                </div>
              )}
              
              <div className="bg-white shadow-2xl overflow-x-auto">
                <table className="w-full text-xs">
                <thead className="bg-yellow-500 text-white">
                  <tr>
                    <th>ID</th>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Lab</th>
                    <th>Model</th>
                    <th>Serial</th>
                    <th>Cost</th>
                    <th>Date</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>QR</th>
                    <th>GRN</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map(item => (
                    <tr key={item.id} className="text-center border-b">
                      <td>{item.id}</td>

                      {/* PHOTO COLUMN */}
                      <td>
                        {item.photoPath ? (
                          <img
                            src={`http://localhost:8080/${item.photoPath}`}
                            alt="equipment"
                            className="w-16 h-16 object-cover mx-auto rounded"
                          />
                        ) : (
                          '-'
                        )}
                      </td>

                      <td>{item.equipmentName}</td>
                      <td>{item.laboratory}</td>
                      <td>{item.model || '-'}</td>
                      <td>{item.serialNumber || '-'}</td>
                      <td>{item.cost ? `$${item.cost}` : '-'}</td>
                      <td>{item.purchaseDate || '-'}</td>
                      <td>{item.supplier || '-'}</td>
                      <td>
                        <span className={`inline-block px-2 py-1 rounded text-white font-semibold ${
                          item.status === 'WORKING' 
                            ? 'bg-green-500' 
                            : item.status === 'UNDER_REPAIR' 
                            ? 'bg-blue-500' 
                            : item.status === 'BROKEN' 
                            ? 'bg-red-500' 
                            : 'bg-gray-500'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.qrCode || '-'}</td>
                      <td>{item.grnNumber || '-'}</td>
                      <td className="py-3">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEquipment.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No equipment found
                </div>
              )}
            </div>
            </>
          )}

        </div>
      </div>
   
  );
}