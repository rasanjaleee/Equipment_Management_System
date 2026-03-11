import { Search, ChevronDown, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import image from '/images/1.webp';

const Equipment = () => {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLaboratory, setSelectedLaboratory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showLabDropdown, setShowLabDropdown] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const departments = [
    'Department of Electrical and Information Engineering',
    'Department of Mechanical and Manufacturing Engineering',
    'Department of Civil and Environmental Engineering',
    'Department of Materials and Mechanical Engineering',
    'Department of Interdisciplinary Studies'
  ];

  // Laboratories list under Electrical and Information Engineering
  const laboratoriesListOptions = [
    'Electrical Machines and Power Electronics Laboratory',
    'Power Systems and High Voltage Laboratory',
    'Electronics and Measurements Laboratory',
    'Control Systems Laboratory',
    'Communication Systems Laboratory',
    'Computer Networks Laboratory'
  ];

  // Fetch equipment from backend
  useEffect(() => {
    fetchEquipment();
  }, []);

 const fetchEquipment = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem('token'); // ✅ get token if user logged in

    const res = await axios.get('http://localhost:8080/api/equipment/all', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    setEquipmentList(res.data);
    setError('');
  } catch (err) {
    console.error('Failed to fetch equipment:', err);
    setError('Failed to load equipment. Please try again later.');
  } finally {
    setLoading(false);
  }
};

  // Group equipment by laboratory
  const groupedByLaboratory = equipmentList.reduce((acc, equipment) => {
    const labName = equipment.laboratory || 'Other';
    if (!acc[labName]) {
      acc[labName] = [];
    }
    acc[labName].push(equipment);
    return acc;
  }, {});

  // Get unique laboratories for filter - combine predefined list with dynamic ones
  const dynamicLabs = [...new Set(equipmentList.map(eq => eq.laboratory).filter(Boolean))];
  const laboratoriesList = [...new Set([...laboratoriesListOptions, ...dynamicLabs])];

  // Filter equipment based on search and filters, then group by name
  const filteredEquipment = Object.entries(groupedByLaboratory)
    .map(([labName, equipment]) => {
      // First filter the equipment
      const filtered = equipment.filter(item => {
        const matchesSearch = searchQuery === '' || 
          item.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesLab = selectedLaboratory === '' || item.laboratory === selectedLaboratory;
        
        return matchesSearch && matchesLab;
      });

      // Group filtered equipment by name
      const groupedByName = filtered.reduce((acc, item) => {
        const name = item.equipmentName || 'Unknown';
        if (!acc[name]) {
          acc[name] = [];
        }
        acc[name].push(item);
        return acc;
      }, {});

      // Convert to array with summary info
      const equipmentGroups = Object.entries(groupedByName).map(([name, items]) => {
        const working = items.filter(item => item.status === 'WORKING').length;
        const underRepair = items.filter(item => item.status === 'UNDER_REPAIR').length;
        const broken = items.filter(item => item.status === 'BROKEN').length;
        
        return {
          name,
          items,
          totalQuantity: items.length,
          working,
          underRepair,
          broken,
          // Use first item for display image and other common properties
          displayItem: items[0]
        };
      });

      return {
        name: labName,
        equipment: equipmentGroups
      };
    })
    .filter(lab => lab.equipment.length > 0);

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
                src={image}
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
              placeholder="Search by equipment name, model, serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear search"
              >
                <X className="text-gray-400 hover:text-gray-600" size={18} />
              </button>
            )}
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
        <div className="flex gap-3 mb-4">
          <button 
            onClick={() => {
              // Filters are applied automatically via filteredEquipment
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

        {/* Search Results Indicator */}
        {(searchQuery || selectedLaboratory) && (
          <div className="mb-6 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm text-gray-700">
              {searchQuery && (
                <span>Searching for: <strong>"{searchQuery}"</strong></span>
              )}
              {searchQuery && selectedLaboratory && <span className="mx-2">•</span>}
              {selectedLaboratory && (
                <span>Laboratory: <strong>{selectedLaboratory}</strong></span>
              )}
              <span className="ml-2">
                - Found <strong>{filteredEquipment.reduce((acc, lab) => acc + lab.equipment.reduce((sum, group) => sum + group.totalQuantity, 0), 0)}</strong> equipment 
                ({filteredEquipment.reduce((acc, lab) => acc + lab.equipment.length, 0)} types)
              </span>
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Loading equipment...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* No Equipment Found */}
        {!loading && !error && filteredEquipment.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 text-lg">No equipment found matching your criteria.</p>
            <button 
              onClick={() => {
                setSelectedDepartment('');
                setSelectedLaboratory('');
                setSearchQuery('');
              }}
              className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-2 rounded-full text-sm transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Laboratory Sections */}
        {!loading && !error && filteredEquipment.map((lab, index) => (
          <div key={index} className="mb-12">
            <div className="bg-white border-l-4 border-yellow-500 p-4 mb-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">{lab.name}</h2>
              <p className="text-gray-600 text-sm">
                Total Equipment = {lab.equipment.reduce((acc, group) => acc + group.totalQuantity, 0)} 
                ({lab.equipment.length} types)
              </p>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lab.equipment.map((group, groupIndex) => (
                <div key={groupIndex} className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-yellow-400 hover:shadow-xl transition-shadow">
                  {/* Equipment Image */}
                  <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                    {group.displayItem.photoPath ? (
                      <img 
                        src={`http://localhost:8080/${group.displayItem.photoPath}?t=${Date.now()}`}
                        alt={group.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/1.webp';
                        }}
                      />
                    ) : (
                      <img 
                        src="/images/1.webp"
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Equipment Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{group.name}</h3>
                    <div className="bg-gray-50 rounded p-2 mb-3">
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-semibold">Total Quantity:</span> {group.totalQuantity}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Working: {group.working}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Repair: {group.underRepair}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Broken: {group.broken}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(`/equipment/details/${encodeURIComponent(group.name)}/${encodeURIComponent(lab.name)}`)}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-4 rounded transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equipment;