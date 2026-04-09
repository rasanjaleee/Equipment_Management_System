import { useState, useEffect } from 'react';
import { Plus, Save, X, Package, Edit, Trash2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminEquipment() {
  const navigate = useNavigate();
  const CUSTOM_EQUIPMENT_OPTION = '__CUSTOM__';

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLaboratoryFilter, setSelectedLaboratoryFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [equipmentList, setEquipmentList] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [equipmentNameSelection, setEquipmentNameSelection] = useState('');

  const ITEMS_PER_PAGE = 10;

  const sampleEquipmentNames = [
    'Digital Oscilloscope',
    'Function Generator',
    'Digital Multimeter',
    'Power Supply Unit',
    'Clamp Meter',
    'Spectrum Analyzer',
    'Signal Generator',
    'DC Motor Trainer',
    'PLC Trainer',
    'Soldering Station'
  ];

  const laboratoriesList = [
    'Electrical Machines and Power Electronics Laboratory',
    'Power Systems and High Voltage Laboratory',
    'Electronics and Measurements Laboratory',
    'Control Systems Laboratory',
    'Communication Systems Laboratory',
    'Computer Networks Laboratory'
  ];

  const [formData, setFormData] = useState({
    equipmentName: '',
    laboratory: '',
    model: '',
    serialNumber: '',
    cost: '',
    purchaseDate: '',
    supplier: '',
    status: 'WORKING',
    grnNumber: ''
  });

  const normalizeName = (value) =>
    (value || '').trim().replace(/\s+/g, ' ').toLowerCase();

  const equipmentNamesMap = [...sampleEquipmentNames, ...equipmentList.map((item) => item.equipmentName)]
    .filter(Boolean)
    .reduce((acc, name) => {
      const cleanedName = name.trim().replace(/\s+/g, ' ');
      const key = normalizeName(cleanedName);
      if (key && !acc[key]) {
        acc[key] = cleanedName;
      }
      return acc;
    }, {});

  const availableEquipmentNames = Object.values(equipmentNamesMap);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/equipment/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipmentList(res.data);
    } catch (err) {
      console.error('Failed to fetch equipment:', err);
    }
  };

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
      const cleanedEquipmentName = formData.equipmentName.trim().replace(/\s+/g, ' ');

      if (!cleanedEquipmentName) {
        setError('Equipment name is required');
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append('equipmentName', cleanedEquipmentName);
      data.append('laboratory', formData.laboratory);
      data.append('model', formData.model);
      data.append('serialNumber', formData.serialNumber);
      data.append('cost', formData.cost);
      data.append('purchaseDate', formData.purchaseDate);
      data.append('supplier', formData.supplier);
      data.append('status', formData.status);
      data.append('grnNumber', formData.grnNumber);

      if (photo) {
        data.append('photo', photo);
      }

      if (editMode) {
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
      grnNumber: ''
    });
    setPhoto(null);
    setError('');
    setSuccess('');
    setEditMode(false);
    setEditingId(null);
    setEquipmentNameSelection('');
  };

  const handleEquipmentNameSelectionChange = (e) => {
    const selectedValue = e.target.value;
    setEquipmentNameSelection(selectedValue);

    if (selectedValue === CUSTOM_EQUIPMENT_OPTION) {
      setFormData((prev) => ({ ...prev, equipmentName: '' }));
      return;
    }

    setFormData((prev) => ({ ...prev, equipmentName: selectedValue }));
    setError('');
  };

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
      grnNumber: equipment.grnNumber || ''
    });

    setEditMode(true);
    setEditingId(equipment.id);
    setShowForm(true);

    const matchedOption = availableEquipmentNames.find(
      (name) => normalizeName(name) === normalizeName(equipment.equipmentName)
    );
    setEquipmentNameSelection(matchedOption || CUSTOM_EQUIPMENT_OPTION);

    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/equipment/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchEquipment();
      setSuccess('Equipment deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data || 'Failed to delete equipment');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredEquipment = equipmentList.filter(item =>
    item.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedLaboratoryFilter === '' || item.laboratory === selectedLaboratoryFilter) &&
    (selectedStatusFilter === '' || item.status === selectedStatusFilter)
  );

  const filterLaboratories = [
    ...new Set(
      equipmentList
        .map((item) => (item.laboratory || '').trim())
        .filter(Boolean)
    )
  ];

  const filterStatuses = [
    ...new Set(
      equipmentList
        .map((item) => (item.status || '').trim())
        .filter(Boolean)
    )
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLaboratoryFilter, selectedStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEquipment = filteredEquipment.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );
  // PRINT QR
const handlePrintQR = (item) => {
  const qrUrl = `http://localhost:8080/${item.qrCode}`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Print QR</title>
        <style>
          body {
            text-align: center;
            font-family: Arial;
            padding: 20px;
          }
          img {
            width: 200px;
            height: 200px;
          }
        </style>
      </head>
      <body>
        <h3>${item.equipmentName}</h3>
        <p>${item.equipmentCode || 'EQ-' + item.id}</p>
        <img src="${qrUrl}" />
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
};

// DOWNLOAD QR
const handleDownloadQR = async (item) => {
  const url = `http://localhost:8080/${item.qrCode}`;
  const response = await fetch(url);
  const blob = await response.blob();

  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `QR_${item.equipmentCode || item.id}.png`;
  link.click();
};

  return (
    <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 min-h-full w-full">
      <div className="w-full max-w-none mx-auto px-1 sm:px-2 lg:px-0">

        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package /> Equipment Management
          </h1>

          {!showForm && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/admin/equipment/bulk-upload')}
                className="btn btn-primary"
              >
                Bulk Upload
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="btn btn-primary"
              >
                <Plus size={18} /> Add Equipment
              </button>
            </div>
          )}
        </div>

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
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
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
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-yellow-500 rounded"></div>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={equipmentNameSelection}
                      onChange={handleEquipmentNameSelectionChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none bg-white cursor-pointer"
                    >
                      <option value="">Select Equipment Name</option>
                      {availableEquipmentNames.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                      <option value={CUSTOM_EQUIPMENT_OPTION}>Other (Type custom name)</option>
                    </select>

                    {equipmentNameSelection === CUSTOM_EQUIPMENT_OPTION && (
                      <input
                        type="text"
                        name="equipmentName"
                        placeholder="Enter custom equipment name"
                        value={formData.equipmentName}
                        onChange={handleChange}
                        required
                        className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Laboratory <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="laboratory"
                      value={formData.laboratory}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none bg-white cursor-pointer"
                    >
                      <option value="">Select Laboratory</option>
                      {laboratoriesList.map((lab, index) => (
                        <option key={index} value={lab}>{lab}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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

              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-yellow-500 rounded"></div>
                  Purchase Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost ($)</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">GRN Number</label>
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

              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-yellow-500 rounded"></div>
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-800">QR Code</p>
                    <p className="text-sm text-blue-700 mt-1">
                      QR code will be generated automatically after saving the equipment.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Photo {!editMode && <span className="text-red-500">*</span>}
                      {editMode && <span className="text-sm text-gray-500"> (Optional - leave empty to keep current)</span>}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required={!editMode}
                      onChange={(e) => setPhoto(e.target.files[0])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer"
                    />
                    {photo && (
                      <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                        <Save size={14} />
                        {photo.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

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

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-accent flex-1"
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
                  className="btn btn-secondary px-6"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!showForm && (
          <>
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

            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search by Equipment Name
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter equipment name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Laboratory
                  </label>
                  <select
                    value={selectedLaboratoryFilter}
                    onChange={(e) => setSelectedLaboratoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">All Laboratories</option>
                    {filterLaboratories.map((lab) => (
                      <option key={lab} value={lab}>
                        {lab}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Working Status
                  </label>
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">All Statuses</option>
                    {filterStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-gray-600">
                  Showing {filteredEquipment.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}
                  {' '}-{' '}
                  {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredEquipment.length)} of {filteredEquipment.length}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedLaboratoryFilter('');
                    setSelectedStatusFilter('');
                  }}
                  className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <div className="bg-white shadow-2xl overflow-x-auto rounded-lg">
              <table className="w-full table-fixed text-xs">
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
                  {paginatedEquipment.map(item => (
                    <tr key={item.id} className="text-center border-b">
                      <td>{item.id}</td>

                      <td>
                        {item.photoPath ? (
                          <img
                            src={`http://localhost:8080/${item.photoPath}`}
                            alt="equipment"
                            className="w-16 h-16 object-cover mx-auto rounded"
                          />
                        ) : '-'}
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

                     <td>
  {item.qrCode ? (
    <div className="flex flex-col items-center gap-1">
      
      {/* QR IMAGE */}
      <img
        src={`http://localhost:8080/${item.qrCode}`}
        alt="QR code"
        className="w-16 h-16 object-contain"
      />

      {/* BUTTONS */}
      <div className="flex gap-1">
        <button
          onClick={() => handlePrintQR(item)}
          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
        >
          Print
        </button>

        <button
          onClick={() => handleDownloadQR(item)}
          className="text-xs bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700"
        >
          Download
        </button>
      </div>

    </div>
  ) : '-'}
</td>

                      <td>{item.grnNumber || '-'}</td>

                      <td className="py-3">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn-icon text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn-icon text-red-600 hover:text-red-800"
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

              {filteredEquipment.length > 0 && (
                <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={safeCurrentPage === 1}
                    className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded border text-sm ${
                        safeCurrentPage === page
                          ? 'bg-yellow-500 text-white border-yellow-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={safeCurrentPage === totalPages}
                    className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}