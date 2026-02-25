import { useState, useEffect } from 'react';
import { Plus, Save, X, Package, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
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
      data.append('photo', photo); // REQUIRED by backend

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
      await fetchEquipment();

      resetForm();
      setTimeout(() => setShowForm(false), 1500);

    } catch (err) {
      setError(err.response?.data || 'Failed to add equipment');
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
    <AdminLayout pageTitle="Equipment Management">
      <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8 min-h-full">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package /> Equipment Management
            </h1>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-yellow-500 text-white px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <Plus size={18} /> Add Equipment
              </button>
            )}
          </div>

          {/* ================= FORM ================= */}
          {showForm && (
            <div className="bg-white p-8 rounded-2xl shadow-2xl mb-8">
              <form onSubmit={handleSubmit} className="space-y-4">

                <input type="text" name="equipmentName" placeholder="Equipment Name" value={formData.equipmentName} onChange={handleChange} required />
                <input type="text" name="laboratory" placeholder="Laboratory" value={formData.laboratory} onChange={handleChange} required />
                <input type="text" name="model" placeholder="Model" value={formData.model} onChange={handleChange} />
                <input type="text" name="serialNumber" placeholder="Serial Number" value={formData.serialNumber} onChange={handleChange} />
                <input type="number" name="cost" placeholder="Cost" value={formData.cost} onChange={handleChange} />
                <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
                <input type="text" name="supplier" placeholder="Supplier" value={formData.supplier} onChange={handleChange} />
                <input type="text" name="qrCode" placeholder="QR Code" value={formData.qrCode} onChange={handleChange} />
                <input type="text" name="grnNumber" placeholder="GRN Number" value={formData.grnNumber} onChange={handleChange} />

                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="WORKING">WORKING</option>
                  <option value="UNDER_REPAIR">UNDER_REPAIR</option>
                  <option value="BROKEN">BROKEN</option>
                </select>

                {/* PHOTO */}
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setPhoto(e.target.files[0])}
                />

                {error && <p className="text-red-600">{error}</p>}
                {success && <p className="text-green-600">{success}</p>}

                <div className="flex gap-4">
                  <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-3 rounded-xl">
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="border px-6 py-3 rounded-xl">
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ================= TABLE ================= */}
          {!showForm && (
            <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto">
              <table className="w-full">
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
                      <td>{item.status}</td>
                      <td>{item.qrCode || '-'}</td>
                      <td>{item.grnNumber || '-'}</td>
                      <td className="flex justify-center gap-2">
                        <Eye size={16} />
                        <Edit size={16} />
                        <Trash2 size={16} />
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
          )}

        </div>
      </div>
    </AdminLayout>
  );
}