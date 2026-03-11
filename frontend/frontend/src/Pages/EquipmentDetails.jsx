import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader } from 'lucide-react';

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEquipmentDetails();
  }, [id]);

const fetchEquipmentDetails = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem('token');

    const res = await axios.get(
      `http://localhost:8080/api/equipment/${id}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );

    setEquipment(res.data);
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
        month: 'long',
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

  if (error || !equipment) {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/equipment')}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Equipment List
        </button>

        {/* Equipment Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {equipment.equipmentName}
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Equipment Image */}
            <div className="flex-shrink-0 w-full md:w-80">
              {equipment.photoPath ? (
                <img
                  src={`http://localhost:8080/${equipment.photoPath}?t=${Date.now()}`}
                  alt={equipment.equipmentName}
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/1.webp';
                  }}
                />
              ) : (
                <img
                  src="/images/1.webp"
                  alt={equipment.equipmentName}
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                />
              )}
            </div>

            {/* Equipment Details Table */}
            <div className="flex-1 w-full">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <div className="flex bg-gray-200">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Equipment Name
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <span>{equipment.equipmentName}</span>
                  </div>
                </div>

                <div className="flex bg-gray-100">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Laboratory Name
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <span>{equipment.laboratory || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex bg-gray-200">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Model
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <span>{equipment.model || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex bg-gray-100">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Serial Number
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <span>{equipment.serialNumber || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex bg-gray-200">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    Status
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(equipment.status)}`}></div>
                      <span>{formatStatus(equipment.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex bg-gray-100">
                  <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                    QR Code
                  </div>
                  <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                    <span className="mr-2">-</span>
                    <span>{equipment.qrCode || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Information */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="bg-yellow-500 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">Purchase Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Purchase</label>
                <p className="text-gray-900">{formatDate(equipment.purchaseDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Supplier</label>
                <p className="text-gray-900">{equipment.supplier || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cost/Price</label>
                <p className="text-gray-900">{equipment.cost ? `$${equipment.cost}` : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">GRN Number</label>
                <p className="text-gray-900">{equipment.grnNumber || 'N/A'}</p>
              </div>
            </div>
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