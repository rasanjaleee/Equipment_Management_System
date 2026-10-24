import { useState, useEffect } from 'react';

import {Plus,Save,X,Package,Edit,Trash2,ArrowLeft,Eye,QrCode} from 'lucide-react';

import axios from 'axios';

import Swal from 'sweetalert2';

import { API_BASE_URL, getImageUrl } from '../../services/api';
import { useData } from '../../context/DataContext';

import { useNavigate } from 'react-router-dom';

export default function AdminEquipment() {

  const navigate = useNavigate();
  const { equipmentList, loadingEquipment, refreshEquipment } = useData();

  const CUSTOM_EQUIPMENT_OPTION = '__CUSTOM__';

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedLaboratoryFilter, setSelectedLaboratoryFilter] = useState('');

  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [photo, setPhoto] = useState(null);

  const [editMode, setEditMode] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [accessories, setAccessories] = useState([]);
const [accessoriesLoading, setAccessoriesLoading] = useState(false);
const [showAccessoryForm, setShowAccessoryForm] = useState(false);
const [editingAccessoryId, setEditingAccessoryId] = useState(null);

const [accessoryForm, setAccessoryForm] = useState({
  accessoryName: '',
  quantity: 1,
  status: 'AVAILABLE',
  description: ''
});

  const [viewingItem, setViewingItem] = useState(null);

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

  const formatCost = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    return isNaN(num) ? `Rs. ${val}` : `Rs. ${num.toLocaleString()}`;
  };

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



  const fetchEquipment = async (forceRefresh = false) => {
    return refreshEquipment(forceRefresh);
  };

const fetchAccessories = async (equipmentId) => {
  try {
    setAccessoriesLoading(true);

    const res = await axios.get(
      `${API_BASE_URL}/api/equipment-accessories/equipment/${equipmentId}`
    );

    setAccessories(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error(
      'Failed to fetch accessories:',
      err.response?.status,
      err.response?.data || err.message
    );

    setAccessories([]);
  } finally {
    setAccessoriesLoading(false);
  }
};

const openEquipmentView = async (item) => {
  setViewingItem(item);

  setAccessories([]);
  setShowAccessoryForm(false);
  setEditingAccessoryId(null);

  setAccessoryForm({
    accessoryName: '',
    quantity: 1,
    status: 'AVAILABLE',
    description: ''
  });

  await fetchAccessories(item.id);
};

const resetAccessoryForm = () => {
  setAccessoryForm({
    accessoryName: '',
    quantity: 1,
    status: 'AVAILABLE',
    description: ''
  });

  setEditingAccessoryId(null);
  setShowAccessoryForm(false);
};

const handleAddAccessory = async () => {
  if (!accessoryForm.accessoryName.trim()) {
    alert('Please enter accessory name.');
    return;
  }

  if (Number(accessoryForm.quantity) < 1) {
    alert('Quantity must be at least 1.');
    return;
  }

  if (!viewingItem) return;

  try {
    const token = localStorage.getItem('token');

    await axios.post(
      `${API_BASE_URL}/api/equipment-accessories/equipment/${viewingItem.id}`,
      {
        accessoryName: accessoryForm.accessoryName.trim(),
        quantity: Number(accessoryForm.quantity),
        status: accessoryForm.status,
        description: accessoryForm.description.trim()
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    await fetchAccessories(viewingItem.id);
    resetAccessoryForm();

  } catch (err) {
    console.error('Failed to add accessory:', err);

    alert(
      err.response?.data?.message ||
      err.response?.data ||
      'Failed to add accessory.'
    );
  }
};

const handleEditAccessory = (accessory) => {
  setEditingAccessoryId(accessory.id);

  setAccessoryForm({
    accessoryName: accessory.accessoryName || '',
    quantity: accessory.quantity || 1,
    status: accessory.status || 'AVAILABLE',
    description: accessory.description || ''
  });

  setShowAccessoryForm(true);
};

const handleUpdateAccessory = async () => {
  if (!accessoryForm.accessoryName.trim()) {
    alert('Please enter accessory name.');
    return;
  }

  if (Number(accessoryForm.quantity) < 1) {
    alert('Quantity must be at least 1.');
    return;
  }

  if (!viewingItem || !editingAccessoryId) return;

  try {
    const token = localStorage.getItem('token');

    await axios.put(
      `${API_BASE_URL}/api/equipment-accessories/${editingAccessoryId}`,
      {
        accessoryName: accessoryForm.accessoryName.trim(),
        quantity: Number(accessoryForm.quantity),
        status: accessoryForm.status,
        description: accessoryForm.description.trim()
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    await fetchAccessories(viewingItem.id);
    resetAccessoryForm();

  } catch (err) {
    console.error('Failed to update accessory:', err);

    alert(
      err.response?.data?.message ||
      err.response?.data ||
      'Failed to update accessory.'
    );
  }
};

const handleDeleteAccessory = async (accessory) => {
  if (!viewingItem) return;

  const result = await Swal.fire({
    title: 'Delete Accessory?',
    text: `Are you sure you want to delete "${accessory.accessoryName}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    reverseButtons: true
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    const token = localStorage.getItem('token');

    await axios.delete(
      `${API_BASE_URL}/api/equipment-accessories/${accessory.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    await fetchAccessories(viewingItem.id);

    await Swal.fire({
      title: 'Deleted!',
      text: 'Accessory deleted successfully.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#16a34a'
    });

  } catch (err) {
    console.error('Failed to delete accessory:', err);

    await Swal.fire({
      title: 'Delete Failed',
      text:
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to delete accessory.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626'
    });
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

          `${API_BASE_URL}/api/equipment/update/${editingId}`,

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

          `${API_BASE_URL}/api/equipment/add`,

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



      clearEquipmentCache();

      await fetchEquipment(true);

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

  const equipment = equipmentList.find((item) => item.id === id);



  const result = await Swal.fire({

    title: 'Delete Equipment?',

    text: equipment

      ? `Are you sure you want to delete "${equipment.equipmentName}"?`

      : 'Are you sure you want to delete this equipment?',

    icon: 'warning',

    showCancelButton: true,

    confirmButtonText: 'Yes, Delete',

    cancelButtonText: 'Cancel',

    confirmButtonColor: '#dc2626',

    cancelButtonColor: '#6b7280',

    reverseButtons: true,

  });



  if (!result.isConfirmed) {

    return;

  }



  try {

    const token = localStorage.getItem('token');



    await axios.delete(

      `${API_BASE_URL}/api/equipment/delete/${id}`,

      {

        headers: {

          Authorization: `Bearer ${token}`

        }

      }

    );



    clearEquipmentCache();

    await fetchEquipment(true);



    setSuccess('Equipment deleted successfully!');



setTimeout(() => {

  setSuccess('');

}, 3000);



  } catch (err) {

    console.error(

      'DELETE EQUIPMENT ERROR:',

      err.response?.data || err.message

    );



    await Swal.fire({

      title: 'Delete Failed',

      text:

        err.response?.data?.message ||

        err.response?.data ||

        'Failed to delete equipment.',

      icon: 'error',

      confirmButtonText: 'OK',

      confirmButtonColor: '#dc2626',

    });

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

  const qrUrl = getImageUrl(item.qrCode);



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

  const url = getImageUrl(item.qrCode);

  const response = await fetch(url);

  const blob = await response.blob();



  const link = document.createElement('a');

  link.href = window.URL.createObjectURL(blob);

  link.download = `QR_${item.equipmentCode || item.id}.png`;

  link.click();

};

const statusStyles = {
  WORKING: 'bg-green-100 text-green-800',
  UNDER_REPAIR: 'bg-blue-100 text-blue-800',
  BROKEN: 'bg-red-100 text-red-800'
};

const formatStatus = (status) =>
  (status || '')
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const [isRegeneratingQr, setIsRegeneratingQr] = useState(false);

  const handleRegenerateAllQr = async () => {
    const confirm = await Swal.fire({
      title: 'Sync All QR Codes?',
      text: 'This will regenerate QR codes for all existing equipment with the current website URL. Existing physical stickers will need to be reprinted.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Yes, Sync All',
      cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsRegeneratingQr(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/equipment/regenerate-all-qr`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchEquipment(true);

      Swal.fire({
        title: 'Success!',
        text: response.data?.message || 'All equipment QR codes have been updated successfully.',
        icon: 'success'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || err.message || 'Failed to regenerate QR codes',
        icon: 'error'
      });
    } finally {
      setIsRegeneratingQr(false);
    }
  };

  return (

    <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 min-h-full w-full">

      <div className="w-full max-w-none mx-auto px-1 sm:px-2 lg:px-0">



        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">

          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2 min-w-0">

            <Package /> Equipment Management

          </h1>



          {!showForm && (

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">

              <button
                onClick={handleRegenerateAllQr}
                disabled={isRegeneratingQr}
                className="btn btn-secondary flex items-center justify-center gap-1.5 text-sm"
                title="Regenerate QR codes for all equipment with the current URL"
              >
                <QrCode size={18} /> {isRegeneratingQr ? 'Syncing...' : 'Sync QR Codes'}
              </button>

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

                className="btn btn-primary w-full sm:w-auto justify-center text-sm"

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

                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost (Rs.)</label>

                    <input

                      type="number"

                      name="cost"

                      placeholder="Enter cost (e.g. 50000)"

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

                      className="w-full min-w-0 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer text-sm"

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



              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-3">

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

                  className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 self-start sm:self-auto"

                >

                  Clear Filters

                </button>

              </div>

            </div>

{/* Mobile Equipment Cards */}
<div className="md:hidden space-y-3">
  {paginatedEquipment.map((item) => (
    <div
      key={item.id}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
    >
      {/* Top section */}
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {item.photoPath ? (
            <img
              src={getImageUrl(item.photoPath)}
              alt={item.equipmentName || 'Equipment'}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
              <Package size={28} className="text-gray-400" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-500">
                ID #{item.id}
              </p>

              <h3 className="font-bold text-gray-900 break-words">
                {item.equipmentName}
              </h3>
            </div>

            <span
              className={`flex-shrink-0 inline-block px-2 py-1 rounded text-white text-[10px] font-semibold ${
                item.status === 'WORKING'
                  ? 'bg-green-500'
                  : item.status === 'UNDER_REPAIR'
                  ? 'bg-blue-500'
                  : item.status === 'BROKEN'
                  ? 'bg-red-500'
                  : 'bg-gray-500'
              }`}
            >
              {item.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-2 break-words">
            {item.laboratory || 'No laboratory'}
          </p>
        </div>
      </div>

      {/* Equipment details */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-4 pt-3 border-t border-gray-100 text-sm">
        <div>
          <p className="text-xs text-gray-500">Model</p>
          <p className="font-medium text-gray-800 break-words">
            {item.model || '-'}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Serial</p>
          <p className="font-medium text-gray-800 break-words">
            {item.serialNumber || '-'}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Cost (Rs.)</p>
          <p className="font-medium text-gray-800">
            {formatCost(item.cost)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">GRN</p>
          <p className="font-medium text-gray-800 break-words">
            {item.grnNumber || '-'}
          </p>
        </div>
      </div>

      {/* QR */}
      {item.qrCode && (
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
          <img
            src={getImageUrl(item.qrCode)}
            alt="QR code"
            className="w-16 h-16 object-contain flex-shrink-0"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handlePrintQR(item)}
              className="text-xs bg-gray-500 text-white px-3 py-1.5 rounded hover:bg-gray-600"
            >
              Print QR
            </button>

            <button
              type="button"
              onClick={() => handleDownloadQR(item)}
              className="text-xs bg-slate-600 text-white px-3 py-1.5 rounded hover:bg-slate-700"
            >
              Download
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={() => openEquipmentView(item)}
          className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100"
        >
          <Eye size={16} />
          View
        </button>

        <button
          type="button"
          onClick={() => handleEdit(item)}
          className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100"
        >
          <Edit size={16} />
          Edit
        </button>

        <button
          type="button"
          onClick={() => handleDelete(item.id)}
          className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  ))}

  {filteredEquipment.length === 0 && (
    <div className="bg-white rounded-xl border border-gray-200 text-center py-10 px-4 text-gray-500">
      No equipment found
    </div>
  )}
</div>

            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-800">
  <thead className="bg-gray-200 text-gray-900 text-xs uppercase tracking-wider">
    <tr className="text-left">
      <th className="px-3 py-3.5 font-bold">Equipment</th>
      <th className="px-2.5 py-3.5 font-bold">Serial</th>
      <th className="px-2.5 py-3.5 font-bold whitespace-nowrap">Cost (Rs.)</th>
      <th className="px-2.5 py-3.5 font-bold whitespace-nowrap">Purchase Date</th>
      <th className="px-2.5 py-3.5 font-bold">Supplier</th>
      <th className="px-2.5 py-3.5 font-bold">GRN</th>
      <th className="px-2.5 py-3.5 font-bold text-center">Status</th>
      <th className="px-2.5 py-3.5 font-bold text-center">QR</th>
      <th className="px-2.5 py-3.5 font-bold text-center">Actions</th>
    </tr>
  </thead>

  <tbody className="divide-y divide-gray-100">
    {paginatedEquipment.map((item) => (
      <tr
        key={item.id}
        className="hover:bg-gray-50/80 transition-colors"
      >
        <td className="px-3 py-3">
          <div className="flex items-center gap-2.5">
            {item.photoPath ? (
              <img
                src={getImageUrl(item.photoPath)}
                alt={item.equipmentName || 'Equipment'}
                className="w-10 h-10 object-cover rounded-lg shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                <Package size={18} />
              </div>
            )}

            <div className="min-w-0">
              <div className="font-semibold text-gray-900 leading-tight">
                {item.equipmentName}
              </div>

              <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                ID: {item.id}
                {item.laboratory && <> • {item.laboratory}</>}
                {item.model && <> • {item.model}</>}
              </div>
            </div>
          </div>
        </td>

        <td className="px-2.5 py-3 text-xs text-gray-700">{item.serialNumber || '-'}</td>
        <td className="px-2.5 py-3 font-semibold text-gray-900 text-xs whitespace-nowrap">
          {formatCost(item.cost)}
        </td>
        <td className="px-2.5 py-3 text-xs text-gray-600 whitespace-nowrap">{item.purchaseDate || '-'}</td>
        <td className="px-2.5 py-3 text-xs text-gray-700">{item.supplier || '-'}</td>
        <td className="px-2.5 py-3 text-xs text-gray-700">{item.grnNumber || '-'}</td>

        <td className="px-2.5 py-3 text-center">
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
              statusStyles[item.status] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {formatStatus(item.status)}
          </span>
        </td>

        <td className="px-2.5 py-3 text-center">
          {item.qrCode ? (
            <div className="flex flex-col items-center gap-1">
              <img
                src={getImageUrl(item.qrCode)}
                alt="QR code"
                className="w-10 h-10 object-contain"
              />

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handlePrintQR(item)}
                  className="text-[10px] bg-gray-600 hover:bg-gray-700 text-white px-1.5 py-0.5 rounded transition shadow-xs"
                >
                  Print
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadQR(item)}
                  className="text-[10px] bg-slate-600 hover:bg-slate-700 text-white px-1.5 py-0.5 rounded transition shadow-xs"
                >
                  Download
                </button>
              </div>
            </div>
          ) : (
            '-'
          )}
        </td>

        <td className="px-2.5 py-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => openEquipmentView(item)}
              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 hover:text-green-800 transition"
              title="View Details"
            >
              <Eye size={17} />
            </button>

            <button
              type="button"
              onClick={() => handleEdit(item)}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition"
              title="Edit"
            >
              <Edit size={17} />
            </button>

            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 transition"
              title="Delete"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
              </div>

              {filteredEquipment.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  No equipment found
                </div>
              )}

             </div>

{/* Shared Pagination - Mobile + Desktop */}
{filteredEquipment.length > 0 && totalPages > 1 && (
  <div className="flex flex-wrap items-center justify-center gap-2 px-2 py-4 mt-3 bg-white rounded-lg shadow-sm">
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

</>

)}

        {/* ================= IN-PLACE EQUIPMENT VIEW MODAL ================= */}
        {viewingItem && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={() => setViewingItem(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between p-5 border-b border-gray-100 bg-gray-50/80 rounded-t-2xl">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                      ID #{viewingItem.id}
                    </span>
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        statusStyles[viewingItem.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {formatStatus(viewingItem.status)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mt-1.5 break-words">
                    {viewingItem.equipmentName}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {viewingItem.laboratory || 'No laboratory assigned'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors shrink-0"
                  title="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Photo Preview */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Equipment Photo
                    </label>
                    <div className="h-48 w-full rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                      {viewingItem.photoPath ? (
                        <img
                          src={getImageUrl(viewingItem.photoPath)}
                          alt={viewingItem.equipmentName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-400 p-4">
                          <Package size={40} className="mx-auto mb-1 text-gray-300" />
                          <p className="text-xs">No photo uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QR Code */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      QR Code
                    </label>
                    <div className="h-48 w-full rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center p-3">
                      {viewingItem.qrCode ? (
                        <>
                          <img
                            src={getImageUrl(viewingItem.qrCode)}
                            alt="Equipment QR Code"
                            className="w-28 h-28 object-contain"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => handlePrintQR(viewingItem)}
                              className="text-xs bg-gray-700 hover:bg-gray-800 text-white font-medium px-3 py-1 rounded transition shadow-sm"
                            >
                              Print QR
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadQR(viewingItem)}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1 rounded transition shadow-sm"
                            >
                              Download
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-gray-400">
                          <QrCode size={36} className="mx-auto mb-1 text-gray-300" />
                          <p className="text-xs">No QR Code available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specifications Grid */}
                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 text-sm">
                  <div className="grid grid-cols-2 p-3 bg-gray-50/50">
                    <span className="text-gray-500 font-medium">Model</span>
                    <span className="text-gray-900 font-semibold text-right">{viewingItem.model || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-gray-500 font-medium">Serial Number</span>
                    <span className="text-gray-900 font-semibold text-right">{viewingItem.serialNumber || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-gray-50/50">
                    <span className="text-gray-500 font-medium">Cost</span>
                    <span className="text-gray-900 font-bold text-right text-yellow-700">{formatCost(viewingItem.cost)}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-gray-500 font-medium">Purchase Date</span>
                    <span className="text-gray-900 font-semibold text-right">{viewingItem.purchaseDate || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-gray-50/50">
                    <span className="text-gray-500 font-medium">Supplier</span>
                    <span className="text-gray-900 font-semibold text-right">{viewingItem.supplier || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3">
                    <span className="text-gray-500 font-medium">GRN Number</span>
                    <span className="text-gray-900 font-semibold text-right">{viewingItem.grnNumber || '-'}</span>
                  </div>
                                    <div className="grid grid-cols-2 p-3 bg-gray-50/50">
                    <span className="text-gray-500 font-medium">Laboratory</span>
                    <span className="text-gray-900 font-semibold text-right">
                      {viewingItem.laboratory || '-'}
                    </span>
                  </div>
                </div>

                {/* Accessories Section */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between gap-3 p-4 bg-gray-50 border-b border-gray-200">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        Accessories
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Manage accessories assigned to this equipment
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingAccessoryId(null);
                        setAccessoryForm({
                          accessoryName: '',
                          quantity: 1,
                          status: 'AVAILABLE',
                          description: ''
                        });
                        setShowAccessoryForm(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
                    >
                      <Plus size={16} />
                      Add Accessory
                    </button>
                  </div>

                  {/* Add / Edit Accessory Form */}
                  {showAccessoryForm && (
                    <div className="p-4 bg-yellow-50/50 border-b border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Accessory Name
                          </label>
                          <input
                            type="text"
                            value={accessoryForm.accessoryName}
                            onChange={(e) =>
                              setAccessoryForm({
                                ...accessoryForm,
                                accessoryName: e.target.value
                              })
                            }
                            placeholder="e.g. Power Cable"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={accessoryForm.quantity}
                            onChange={(e) =>
                              setAccessoryForm({
                                ...accessoryForm,
                                quantity: e.target.value
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Status
                          </label>
                          <select
                            value={accessoryForm.status}
                            onChange={(e) =>
                              setAccessoryForm({
                                ...accessoryForm,
                                status: e.target.value
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-yellow-500"
                          >
                            <option value="AVAILABLE">Available</option>
                            <option value="UNAVAILABLE">Unavailable</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={accessoryForm.description}
                            onChange={(e) =>
                              setAccessoryForm({
                                ...accessoryForm,
                                description: e.target.value
                              })
                            }
                            placeholder="Optional description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>

                      </div>

                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          type="button"
                          onClick={resetAccessoryForm}
                          className="px-3 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={
                            editingAccessoryId
                              ? handleUpdateAccessory
                              : handleAddAccessory
                          }
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg"
                        >
                          {editingAccessoryId
                            ? 'Update Accessory'
                            : 'Save Accessory'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Accessories List */}
                  <div className="p-4">
                    {accessoriesLoading ? (
                      <div className="py-5 text-center text-sm text-gray-500">
                        Loading accessories...
                      </div>
                    ) : accessories.length === 0 ? (
                      <div className="py-5 text-center">
                        <Package
                          size={28}
                          className="mx-auto text-gray-300 mb-2"
                        />
                        <p className="text-sm text-gray-500">
                          No accessories registered for this equipment.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {accessories.map((accessory) => (
                          <div
                            key={accessory.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg bg-white"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-gray-900 text-sm">
                                  {accessory.accessoryName}
                                </p>

                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    accessory.status === 'AVAILABLE'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {accessory.status}
                                </span>
                              </div>

                              <p className="text-xs text-gray-500 mt-1">
                                Quantity: {accessory.quantity}
                              </p>

                              {accessory.description && (
                                <p className="text-xs text-gray-500 mt-1 break-words">
                                  {accessory.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditAccessory(accessory)
                                }
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                              >
                                <Edit size={14} />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteAccessory(accessory)
                                }
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => {
                    const itemToEdit = viewingItem;
                    setViewingItem(null);
                    handleEdit(itemToEdit);
                  }}
                  className="btn btn-primary text-sm flex items-center gap-1.5"
                >
                  <Edit size={16} /> Edit Equipment
                </button>
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="btn btn-secondary text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>

  );

}
