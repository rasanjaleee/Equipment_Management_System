import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader } from 'lucide-react';

const EquipmentDetails = () => {
  const { equipmentName, laboratory } = useParams();
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEquipmentDetails();
  }, [equipmentName, laboratory]);

const fetchEquipmentDetails = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem('token');

    // Fetch all equipment and filter by name and laboratory
    const res = await axios.get(
      `http://localhost:8080/api/equipment/all`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );

    // Filter equipment by name and laboratory
    const filtered = res.data.filter(item => 
      item.equipmentName === decodeURIComponent(equipmentName) && 
      item.laboratory === decodeURIComponent(laboratory)
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

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'WORKING':
        return 'bg-green-500';
      case 'UNDER_REPAIR':
        return 'bg-blue-500';
      case 'BROKEN':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'WORKING':
        return 'text-green-600';
      case 'UNDER_REPAIR':
        return 'text-blue-600';
      case 'BROKEN':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
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

  // Calculate totals
  const totalQuantity = equipmentList.length;
  const working = equipmentList.filter(item => item.status === 'WORKING').length;
  const underRepair = equipmentList.filter(item => item.status === 'UNDER_REPAIR').length;
  const broken = equipmentList.filter(item => item.status === 'BROKEN').length;
  const displayEquipment = equipmentList[0] || {};

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

  if (error || equipmentList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
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
        {/* Back Button */}
        <button 
          onClick={() => navigate('/equipment')}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Equipment List
        </button>

        {/* Equipment Header with Image and Summary */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <h1 className="text-2xl font-bold text-center pt-6 pb-4">
            {decodeURIComponent(equipmentName)}
          </h1>
          
          <div className="flex flex-col md:flex-row gap-6 p-6">
            {/* Equipment Image */}
            <div className="flex-shrink-0 w-full md:w-80">
              {displayEquipment.photoPath ? (
                <img
                  src={`http://localhost:8080/${displayEquipment.photoPath}?t=${Date.now()}`}
                  alt={displayEquipment.equipmentName}
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/1.webp';
                  }}
                />
              ) : (
                <img
                  src="/images/1.webp"
                  alt={displayEquipment.equipmentName}
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                />
              )}
            </div>

            {/* Summary Table */}
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <div className="flex bg-gray-200">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Equipment Name
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <span>{decodeURIComponent(equipmentName)}</span>
                  </div>
                </div>

                <div className="flex bg-gray-100">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Laboratory Name
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <span>{decodeURIComponent(laboratory)}</span>
                  </div>
                </div>

                <div className="flex bg-gray-200">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Total Quantity
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <span className="font-bold">{totalQuantity}</span>
                  </div>
                </div>

                <div className="flex bg-gray-200">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Working
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <span className="font-bold text-green-600">{working}</span>
                  </div>
                </div>

                <div className="flex bg-gray-100">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Under Repair
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <span className="font-bold text-blue-600">{underRepair}</span>
                  </div>
                </div>

                <div className="flex bg-gray-200">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Broken
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <span className="font-bold text-red-600">{broken}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Instances Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-yellow-500">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Equipment ID
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Serial
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    GRN
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipmentList.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {item.qrCode || item.serialNumber || `ID-${item.id}`}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.qrCode || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.purchaseDate)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.supplier || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.model || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.serialNumber || '-'}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      ${item.cost ? Number(item.cost).toLocaleString() : '-'}
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
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      {item.grnNumber || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-md transition-colors shadow-md">
            Request to Borrow
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;