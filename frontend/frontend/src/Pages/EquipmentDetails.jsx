import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, getImageUrl } from '../services/api';
import { ArrowLeft, Loader, Edit, Trash2, Calendar } from 'lucide-react';
import BorrowRequestForm from '../components/BorrowRequestForm';
import { useData } from '../context/DataContext';

const EquipmentDetails = () => {
  const { id, equipmentName, laboratory } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const normalizeValue = (value) =>
    (value || '').trim().replace(/\s+/g, ' ').toLowerCase();

  const { equipmentList: cachedAllEquipment, refreshEquipment } = useData();

  const selectedName = decodeURIComponent(equipmentName || '');
  const selectedLab = decodeURIComponent(laboratory || '');

  const cachedSingle = id
    ? cachedAllEquipment?.find((item) => String(item.id) === String(id)) || null
    : null;

  const cachedGrouped = !id && equipmentName && laboratory && cachedAllEquipment?.length > 0
    ? cachedAllEquipment.filter(
        (item) =>
          normalizeValue(item.equipmentName) === normalizeValue(selectedName) &&
          normalizeValue(item.laboratory) === normalizeValue(selectedLab)
      )
    : [];

  const [equipment, setEquipment] = useState(cachedSingle);
  const [equipmentList, setEquipmentList] = useState(cachedGrouped);
  const [loading, setLoading] = useState(
    id ? !cachedSingle : cachedGrouped.length === 0
  );
  const [error, setError] = useState('');
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedEquipmentForBorrow, setSelectedEquipmentForBorrow] = useState(null);

  const handleReserve = (targetItem) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setSelectedEquipmentForBorrow(targetItem);
    setIsBorrowModalOpen(true);
  };

  const [currentIssuance, setCurrentIssuance] = useState(null);
  const [currentIssuanceLoading, setCurrentIssuanceLoading] = useState(false);

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

  useEffect(() => {
    if (id) {
      fetchSingleEquipment();
    } else {
      fetchGroupedEquipmentDetails();
    }
  }, [id, equipmentName, laboratory]);

  const fetchSingleEquipment = async () => {
    try {
      if (!equipment && !cachedSingle) {
        setLoading(true);
      }
      const token = localStorage.getItem('token');

      const res = await axios.get(`${API_BASE_URL}/api/equipment/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setEquipment(res.data);
      setError('');

      await Promise.all([
        fetchAccessories(res.data.id),
        fetchCurrentIssuance(res.data.id)
      ]);
    } catch (err) {
      console.error('Failed to fetch single equipment:', err);
      if (!equipment && !cachedSingle) {
        setError('Failed to load equipment details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessories = async (equipmentId) => {
  try {
    setAccessoriesLoading(true);

    const token = localStorage.getItem('token');

    const res = await axios.get(
      `${API_BASE_URL}/api/equipment-accessories/equipment/${equipmentId}`,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}
      }
    );

    setAccessories(Array.isArray(res.data) ? res.data : []);

  } catch (err) {
    console.error('Failed to fetch accessories:', err);
    setAccessories([]);
  } finally {
    setAccessoriesLoading(false);
  }
};

const fetchCurrentIssuance = async (equipmentId) => {
  try {
    setCurrentIssuanceLoading(true);

    const token = localStorage.getItem('token');

    const response = await axios.get(
      `${API_BASE_URL}/api/issuances/equipment/${equipmentId}/current`,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}
      }
    );

    if (response.status === 200 && response.data) {
      setCurrentIssuance(response.data);
    } else {
      setCurrentIssuance(null);
    }

  } catch (err) {
    console.error('Failed to fetch current issuance:', err);
    setCurrentIssuance(null);
  } finally {
    setCurrentIssuanceLoading(false);
  }
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

  try {
    const token = localStorage.getItem('token');

    await axios.post(
      `${API_BASE_URL}/api/equipment-accessories/equipment/${equipment.id}`,
      {
        accessoryName: accessoryForm.accessoryName.trim(),
        quantity: Number(accessoryForm.quantity),
        status: accessoryForm.status,
        description: accessoryForm.description.trim()
      },
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}
      }
    );

    await fetchAccessories(equipment.id);

    setAccessoryForm({
      accessoryName: '',
      quantity: 1,
      status: 'AVAILABLE',
      description: ''
    });

    setShowAccessoryForm(false);

  } catch (err) {
    console.error('Failed to add accessory:', err);
    alert('Failed to add accessory.');
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
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}
      }
    );

    await fetchAccessories(equipment.id);

    setAccessoryForm({
      accessoryName: '',
      quantity: 1,
      status: 'AVAILABLE',
      description: ''
    });

    setEditingAccessoryId(null);
    setShowAccessoryForm(false);

  } catch (err) {
    console.error('Failed to update accessory:', err);
    alert('Failed to update accessory.');
  }
};

const handleDeleteAccessory = async (accessory) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${accessory.accessoryName}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const token = localStorage.getItem('token');

    await axios.delete(
      `${API_BASE_URL}/api/equipment-accessories/${accessory.id}`,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}
      }
    );

    await fetchAccessories(equipment.id);

  } catch (err) {
    console.error('Failed to delete accessory:', err);
    alert('Failed to delete accessory.');
  }
};

  const fetchGroupedEquipmentDetails = async () => {
    try {
      if (equipmentList.length === 0 && cachedGrouped.length === 0) {
        setLoading(true);
      }
      const data = await refreshEquipment(false);
      const listToFilter = Array.isArray(data) && data.length > 0 ? data : cachedAllEquipment;

      const selectedName = decodeURIComponent(equipmentName || '');
      const selectedLab = decodeURIComponent(laboratory || '');

      const filtered = listToFilter.filter(
        (item) =>
          normalizeValue(item.equipmentName) === normalizeValue(selectedName) &&
          normalizeValue(item.laboratory) === normalizeValue(selectedLab)
      );

      setEquipmentList(filtered);
      setError('');
    } catch (err) {
      console.error('Failed to fetch equipment details:', err);
      if (equipmentList.length === 0 && cachedGrouped.length === 0) {
        setError('Failed to load equipment details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading equipment details...</p>
        </div>
      </div>
    );
  }

  if (id) {
    if (error || !equipment) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipment Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The equipment you are looking for does not exist.'}</p>
              <button
                onClick={() => navigate('/equipment')}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back to Equipment List
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <button
            onClick={() => navigate('/equipment')}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Equipment List
          </button>

          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
            <h1 className="text-2xl font-bold text-center mb-6">{equipment.equipmentName}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                {equipment.photoPath ? (
                  <img
                    src={getImageUrl(equipment.photoPath)}
                    alt={equipment.equipmentName}
                    className="w-full h-72 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-full h-72 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div><span className="font-semibold">Equipment ID:</span> {equipment.equipmentCode || `EQ-${equipment.id}`}</div>
                <div><span className="font-semibold">Laboratory:</span> {equipment.laboratory || '-'}</div>
                <div><span className="font-semibold">Model:</span> {equipment.model || '-'}</div>
                <div><span className="font-semibold">Serial Number:</span> {equipment.serialNumber || '-'}</div>
                <div><span className="font-semibold">Purchase Date:</span> {formatDate(equipment.purchaseDate)}</div>
                <div><span className="font-semibold">Status:</span> {formatStatus(equipment.status)}</div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleReserve(equipment)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2.5 rounded-lg inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Calendar size={18} />
                    Reserve / Request to Borrow
                  </button>
                </div>

                <div className="pt-4">
                  <p className="font-semibold mb-2">QR Code</p>
                  {equipment.qrCode ? (
                    <img
                      src={getImageUrl(equipment.qrCode)}
                      alt="QR code"
                      className="w-48 h-48 object-contain border rounded p-2 bg-white"
                    />
                  ) : (
                    <p className="text-gray-500">QR not available</p>
                  )}
                </div>
              </div>
                        </div>
          </div>
        </div>


                {/* Equipment Availability / Current Holder */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              Equipment Availability
            </h2>

            {!currentIssuanceLoading && (
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  currentIssuance
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {currentIssuance ? 'ISSUED' : 'AVAILABLE'}
              </span>
            )}
          </div>

          {currentIssuanceLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader className="animate-spin h-5 w-5" />
              Loading current holder...
            </div>
          ) : currentIssuance ? (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Current Holder
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Holder Name</p>
                  <p className="font-semibold text-gray-900">
                    {currentIssuance.userName || '-'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Department / Role</p>
                  <p className="font-semibold text-gray-900">
                    {currentIssuance.roleDept || '-'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(currentIssuance.issueDate)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Return Due Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(currentIssuance.returnDueDate)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Issued By</p>
                  <p className="font-semibold text-gray-900">
                    {currentIssuance.issuedByName || '-'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Issuance ID</p>
                  <p className="font-semibold text-gray-900">
                    {currentIssuance.issuanceId || '-'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-700">
                This equipment is currently available.
              </p>
              <p className="text-sm text-green-600 mt-1">
                There is no current holder for this equipment.
              </p>
            </div>
          )}
        </div>

        {/* Accessories Section */}
<div className="bg-white rounded-lg shadow-md p-6 mt-6">

  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
    <h2 className="text-xl font-bold text-gray-900">
      Accessories
    </h2>

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
  className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg"
>
  + Add Accessory
</button>
  </div>
  {showAccessoryForm && (
  <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-lg">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Add Accessory
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Accessory Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="e.g. Power Cable"

        />
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="AVAILABLE">Available</option>
          <option value="IN_USE">In Use</option>
          <option value="DAMAGED">Damaged</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Accessory description"
        />
      </div>

    </div>

    <div className="flex justify-end gap-3 mt-5">
      <button
        type="button"
        onClick={() => {
  setShowAccessoryForm(false);
  setEditingAccessoryId(null);

  setAccessoryForm({
    accessoryName: '',
    quantity: 1,
    status: 'AVAILABLE',
    description: ''
  });
}}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
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
  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-5 py-2 rounded-lg"
>
  {editingAccessoryId ? 'Update Accessory' : 'Save Accessory'}
</button>
    </div>
  </div>
)}
          {accessoriesLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader className="animate-spin h-5 w-5" />
              Loading accessories...
            </div>
          ) : accessories.length === 0 ? (
            <p className="text-gray-500">
              No accessories registered for this equipment.
            </p>
          ) : (
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left border-b">
                      Accessory
                    </th>
                    <th className="px-4 py-3 text-left border-b">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left border-b">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left border-b">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center border-b">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {accessories.map((accessory) => (
                    <tr key={accessory.id} className="hover:bg-gray-50">

                {/* Accessory */}
                <td className="px-4 py-3 border-b">
                  {accessory.accessoryName}
                </td>

                {/* Quantity */}
                <td className="px-4 py-3 border-b">
                  {accessory.quantity}
                </td>

                {/* Status */}
                <td className="px-4 py-3 border-b">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    {accessory.status}
                  </span>
                </td>

                {/* Description */}
                <td className="px-4 py-3 border-b">
                  {accessory.description || '-'}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 border-b">
                <div className="flex justify-center gap-3">

                <button
                  type="button"
                  onClick={() => handleEditAccessory(accessory)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit Accessory"
                >
                  <Edit size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteAccessory(accessory)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete Accessory"
                >
                  <Trash2 size={18} />
                </button>

                </div>
              </td>

              </tr>
                  ))}
                </tbody>
              </table>
            </div>
                    )}
        </div>

        <BorrowRequestForm
          isOpen={isBorrowModalOpen}
          onClose={() => {
            setIsBorrowModalOpen(false);
            setSelectedEquipmentForBorrow(null);
          }}
          equipmentList={equipment ? [equipment] : []}
          preselectedEquipment={selectedEquipmentForBorrow || equipment}
          onSubmitted={() => {
            setSelectedEquipmentForBorrow(null);
            setIsBorrowModalOpen(false);
          }}
        />

      </div>

    );
  }

  const totalQuantity = equipmentList.length;
  const working = equipmentList.filter(item => normalizeValue(item.status) === 'working').length;
  const underRepair = equipmentList.filter(item => normalizeValue(item.status) === 'under_repair').length;
  const broken = equipmentList.filter(item => normalizeValue(item.status) === 'broken').length;
  const displayEquipment = equipmentList[0] || {};

  if (error || equipmentList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipment Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The equipment you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/equipment')}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Equipment List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/equipment')}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Equipment List
        </button>

        <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-center px-4 pt-6 pb-4 break-words">
            {decodeURIComponent(equipmentName)}
          </h1>

          <div className="flex flex-col md:flex-row gap-6 p-6">
            <div className="flex-shrink-0 w-full md:w-80">
              {displayEquipment.photoPath ? (
                <img
                  src={getImageUrl(displayEquipment.photoPath)}
                  alt={displayEquipment.equipmentName}
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <div className="flex bg-gray-200">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Equipment Name
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900">
                    {decodeURIComponent(equipmentName)}
                  </div>
                </div>

                <div className="flex bg-gray-100">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Laboratory Name
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900">
                    {decodeURIComponent(laboratory)}
                  </div>
                </div>

                <div className="flex bg-gray-200">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Total Quantity
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 font-bold">{totalQuantity}</div>
                </div>

                <div className="flex bg-gray-100">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Working
                  </div>
                  <div className="w-1/2 px-4 py-3 text-green-600 font-bold">{working}</div>
                </div>

                <div className="flex bg-gray-200">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Under Repair
                  </div>
                  <div className="w-1/2 px-4 py-3 text-blue-600 font-bold">{underRepair}</div>
                </div>

                <div className="flex bg-gray-100">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Broken
                  </div>
                  <div className="w-1/2 px-4 py-3 text-red-600 font-bold">{broken}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

                <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-yellow-500">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Number</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Equipment ID</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Equipment Name</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Laboratory</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">QR Code</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Date of Purchase</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Model</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipmentList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {item.equipmentCode || `EQ-${item.id}`}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.equipmentName || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.laboratory || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.qrCode ? (
                        <img
                          src={getImageUrl(item.qrCode)}
                          alt="QR code"
                          className="w-16 h-16 object-contain"
                        />
                      ) : '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.purchaseDate)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.model || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'WORKING' ? 'bg-green-500 text-white' :
                        item.status === 'UNDER_REPAIR' ? 'bg-blue-500 text-white' :
                        item.status === 'BROKEN' ? 'bg-red-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm">
                      {item.status === 'WORKING' ? (
                        <button
                          onClick={() => handleReserve(item)}
                          className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
                        >
                          Reserve
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

                {/* Mobile Equipment Cards */}
        <div className="md:hidden space-y-4 mb-6">
          {equipmentList.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-yellow-500 px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-black">
                    Equipment {String(index + 1).padStart(2, '0')}
                  </p>

                  <h3 className="font-bold text-gray-900 break-words">
                    {item.equipmentName || '-'}
                  </h3>
                </div>

                <span
                  className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'WORKING'
                      ? 'bg-green-500 text-white'
                      : item.status === 'UNDER_REPAIR'
                      ? 'bg-blue-500 text-white'
                      : item.status === 'BROKEN'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {formatStatus(item.status)}
                </span>
              </div>

              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <span className="font-semibold text-gray-600">
                    Equipment ID
                  </span>
                  <span className="text-gray-900 break-words">
                    {item.equipmentCode || `EQ-${item.id}`}
                  </span>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <span className="font-semibold text-gray-600">
                    Laboratory
                  </span>
                  <span className="text-gray-900 break-words">
                    {item.laboratory || '-'}
                  </span>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <span className="font-semibold text-gray-600">
                    Model
                  </span>
                  <span className="text-gray-900 break-words">
                    {item.model || '-'}
                  </span>
                </div>

                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <span className="font-semibold text-gray-600">
                    Purchase Date
                  </span>
                  <span className="text-gray-900">
                    {formatDate(item.purchaseDate)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="font-semibold text-gray-600 mb-2">
                    QR Code
                  </p>

                  {item.qrCode ? (
                    <img
                      src={getImageUrl(item.qrCode)}
                      alt="QR code"
                      className="w-20 h-20 object-contain"
                    />
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>

                <div className="pt-2">
                  {item.status === 'WORKING' ? (
                    <button
                      type="button"
                      onClick={() => handleReserve(item)}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2.5 rounded-lg transition-colors"
                    >
                      Reserve Equipment
                    </button>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-500 text-center font-medium px-4 py-2.5 rounded-lg">
                      Currently Unavailable
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <BorrowRequestForm
          isOpen={isBorrowModalOpen}
          onClose={() => setIsBorrowModalOpen(false)}
          equipmentList={equipmentList}
          preselectedEquipment={selectedEquipmentForBorrow}
          onSubmitted={() => {
            setSelectedEquipmentForBorrow(null);
            setIsBorrowModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default EquipmentDetails;