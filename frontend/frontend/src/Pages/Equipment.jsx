import { Search, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Equipment = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLaboratory, setSelectedLaboratory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showLabDropdown, setShowLabDropdown] = useState(false);
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch equipment from backend
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
      setEquipmentData(response.data);
    } catch (err) {
      console.error('Failed to fetch equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  // Group equipment by laboratory
  const groupedEquipment = equipmentData.reduce((acc, item) => {
    const lab = item.laboratory || 'Uncategorized';
    if (!acc[lab]) {
      acc[lab] = [];
    }
    acc[lab].push(item);
    return acc;
  }, {});

  // Filter equipment based on search and filters
  const getFilteredEquipment = () => {
    let filtered = { ...groupedEquipment };
    
    if (selectedLaboratory) {
      filtered = { [selectedLaboratory]: filtered[selectedLaboratory] || [] };
    }
    
    if (searchQuery) {
      Object.keys(filtered).forEach(lab => {
        filtered[lab] = filtered[lab].filter(item =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    
    return filtered;
  };

  const filteredLabs = getFilteredEquipment();

  const departments = [
    'Department of Electrical and Information Engineering',
    'Department of Mechanical and Manufacturing Engineering',
    'Department of Civil and Environmental Engineering',
    'Department of Materials and Mechanical Engineering',
    'Department of Interdisciplinary Studies'
  ];

  const laboratoriesList = Object.keys(groupedEquipment).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left Content */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Laboratory Equipment<br />Inventory
              </h1>
              <p className="text-gray-600 text-lg">
                Browse and view details of all available<br />laboratory devices
              </p>
            </div>

            {/* Right Image */}
            <div className="flex-1">
              <img 
                src="https://images.unsplash.com/photo-1562774053-701939374585?w=600" 
                alt="Engineering Building"
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-yellow-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center bg-white rounded-md px-4 py-3 shadow-md max-w-2xl">
            <Search className="text-gray-400 mr-3" size={20} />
            <input
              type="text"
              placeholder="Search for equipment name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Department Filter */}
          <div className="relative">
            <div 
              onClick={() => {
                setShowDeptDropdown(!showDeptDropdown);
                setShowLabDropdown(false);
              }}
              className="bg-gray-100 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <span className="text-gray-700 font-medium">
                {selectedDepartment || 'Department'}
              </span>
              <ChevronDown size={20} className="text-yellow-500" />
            </div>
            
            {showDeptDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {departments.map((dept, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setShowDeptDropdown(false);
                    }}
                    className="p-3 hover:bg-yellow-50 cursor-pointer border-b last:border-b-0 text-sm text-gray-700"
                  >
                    {dept}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Laboratory Filter */}
          <div className="relative">
            <div 
              onClick={() => {
                setShowLabDropdown(!showLabDropdown);
                setShowDeptDropdown(false);
              }}
              className="bg-gray-100 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <span className="text-gray-700 font-medium">
                {selectedLaboratory || 'Laboratory'}
              </span>
              <ChevronDown size={20} className="text-yellow-500" />
            </div>
            
            {showLabDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {laboratoriesList.map((lab, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedLaboratory(lab);
                      setShowLabDropdown(false);
                    }}
                    className="p-3 hover:bg-yellow-50 cursor-pointer border-b last:border-b-0 text-sm text-gray-700"
                  >
                    {lab}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8">
          <button 
            onClick={() => {
              // Filters are applied automatically through state
              console.log('Filters applied:', { selectedDepartment, selectedLaboratory, searchQuery });
            }}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-full text-sm transition-colors"
          >
            Apply Filters
          </button>
          <button 
            onClick={() => {
              setSelectedDepartment('');
              setSelectedLaboratory('');
              setSearchQuery('');
            }}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-full text-sm transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p className="text-gray-600 mt-4">Loading equipment...</p>
          </div>
        )}

        {/* No Equipment Message */}
        {!loading && Object.keys(filteredLabs).length === 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-8 text-center">
            <p className="text-gray-700 text-lg font-medium">No equipment found</p>
            <p className="text-gray-600 text-sm mt-2">
              {searchQuery || selectedLaboratory 
                ? 'Try adjusting your search filters' 
                : 'Equipment will appear here once added by administrators'}
            </p>
          </div>
        )}

        {/* Laboratory Sections */}
        {!loading && Object.entries(filteredLabs).map(([labName, equipment]) => (
          equipment.length > 0 && (
            <div key={labName} className="mb-12">
              <div className="bg-white border-l-4 border-yellow-500 p-4 mb-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">{labName}</h2>
                <p className="text-gray-600 text-sm">Total Equipment = {equipment.length}</p>
              </div>

              {/* Equipment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipment.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-yellow-400 hover:shadow-xl transition-shadow">
                    {/* Equipment Image */}
                    <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={item.image || '/images/placeholder-equipment.jpg'} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400';
                        }}
                      />
                    </div>

                    {/* Equipment Details */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">Category: {item.category}</p>
                      <p className="text-sm text-gray-600 mb-1">Total: {item.totalQuantity}</p>
                      <div className="flex gap-2 mb-4 text-xs">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          Working: {item.workingAmount}
                        </span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                          Repair: {item.underRepair}
                        </span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                          Broken: {item.broken}
                        </span>
                      </div>

                      <button 
                        onClick={() => window.location.href = `/equipment/${item.id}`}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-4 rounded transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Equipment;