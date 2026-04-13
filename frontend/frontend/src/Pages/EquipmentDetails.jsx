import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader } from 'lucide-react';

const EquipmentDetails = () => {
  const { id, equipmentName, laboratory } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const normalizeValue = (value) =>
    (value || '').trim().replace(/\s+/g, ' ').toLowerCase();

  useEffect(() => {
    if (id) {
      fetchSingleEquipment();
    } else {
      fetchGroupedEquipmentDetails();
    }
  }, [id, equipmentName, laboratory]);

  const fetchSingleEquipment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await axios.get(`http://localhost:8080/api/equipment/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setEquipment(res.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch single equipment:', err);
      setError('Failed to load equipment details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupedEquipmentDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await axios.get(`http://localhost:8080/api/equipment/all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const selectedName = decodeURIComponent(equipmentName || '');
      const selectedLab = decodeURIComponent(laboratory || '');

      const filtered = res.data.filter(
        (item) =>
          normalizeValue(item.equipmentName) === normalizeValue(selectedName) &&
          normalizeValue(item.laboratory) === normalizeValue(selectedLab)
      );

      setEquipmentList(filtered);
      setError('');
    } catch (err) {
      console.error('Failed to fetch equipment details:', err);
      setError('Failed to load equipment details. Please try again later.');
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
                    src={`http://localhost:8080/${equipment.photoPath}`}
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

                <div className="pt-4">
                  <p className="font-semibold mb-2">QR Code</p>
                  {equipment.qrCode ? (
                    <img
                      src={`http://localhost:8080/${equipment.qrCode}`}
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

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <h1 className="text-2xl font-bold text-center pt-6 pb-4">
            {decodeURIComponent(equipmentName)}
          </h1>

          <div className="flex flex-col md:flex-row gap-6 p-6">
            <div className="flex-shrink-0 w-full md:w-80">
              {displayEquipment.photoPath ? (
                <img
                  src={`http://localhost:8080/${displayEquipment.photoPath}`}
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

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
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
                          src={`http://localhost:8080/${item.qrCode}`}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;