import { Search, ChevronDown, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import image from '/images/1.webp';
import BorrowRequestForm from '../components/BorrowRequestForm';

const Equipment = () => {
  const normalizeValue = (value) => {
    if (!value) return '';
    return String(value).toLowerCase().trim();
  };

  const ITEMS_PER_PAGE = 6;

  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLaboratory, setSelectedLaboratory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showLabDropdown, setShowLabDropdown] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedEquipmentForBorrow, setSelectedEquipmentForBorrow] = useState(null);
  const [labPages, setLabPages] = useState({});

  const departments = [
    'Department of Electrical and Information Engineering',
    'Department of Mechanical and Manufacturing Engineering',
    'Department of Civil and Environmental Engineering',
    'Department of Materials and Mechanical Engineering',
    'Department of Interdisciplinary Studies'
  ];

  const laboratoriesListOptions = [
    'Electrical Machines and Power Electronics Laboratory',
    'Power Systems and High Voltage Laboratory',
    'Electronics and Measurements Laboratory',
    'Control Systems Laboratory',
    'Communication Systems Laboratory',
    'Computer Networks Laboratory'
  ];

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
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

  const dynamicLabMap = equipmentList.reduce((acc, item) => {
    const labName = (item.laboratory || '').trim();
    if (!labName) return acc;
    const key = normalizeValue(labName);
    if (!acc[key]) acc[key] = labName;
    return acc;
  }, {});

  const dynamicLabs = Object.values(dynamicLabMap);
  const laboratoriesList = [...new Set([...laboratoriesListOptions, ...dynamicLabs])];

  const filteredMap = equipmentList.reduce((acc, item) => {
    const normalizedSearch = normalizeValue(searchQuery);
    const matchesSearch =
      normalizedSearch === '' ||
      normalizeValue(item.equipmentName).includes(normalizedSearch) ||
      normalizeValue(item.model).includes(normalizedSearch);

    const matchesLab =
      selectedLaboratory === '' ||
      normalizeValue(item.laboratory) === normalizeValue(selectedLaboratory);

    if (!matchesSearch || !matchesLab) return acc;

    const labName = (item.laboratory || 'Other').trim() || 'Other';
    const equipmentName = (item.equipmentName || 'Unknown').trim() || 'Unknown';
    const labKey = normalizeValue(labName) || 'other';
    const equipmentKey = normalizeValue(equipmentName) || 'unknown';

    if (!acc[labKey]) acc[labKey] = { name: labName, equipmentByName: {} };
    if (!acc[labKey].equipmentByName[equipmentKey]) {
      acc[labKey].equipmentByName[equipmentKey] = { name: equipmentName, items: [] };
    }

    acc[labKey].equipmentByName[equipmentKey].items.push(item);
    return acc;
  }, {});

  const filteredEquipment = Object.values(filteredMap).map((lab) => {
    const equipment = Object.values(lab.equipmentByName).map((group) => {
      const working = group.items.filter(
        (item) => normalizeValue(item.status) === 'working'
      ).length;

      const underRepair = group.items.filter(
        (item) => normalizeValue(item.status) === 'under_repair'
      ).length;

      const broken = group.items.filter(
        (item) => normalizeValue(item.status) === 'broken'
      ).length;

      return {
        name: group.name,
        items: group.items,
        totalQuantity: group.items.length,
        working,
        underRepair,
        broken,
        displayItem: group.items[0]
      };
    });

    return { name: lab.name, equipment };
  });

  useEffect(() => {
    setLabPages({});
  }, [searchQuery, selectedLaboratory, selectedDepartment]);

  const getLabPage = (labName, totalItems) => {
    const key = normalizeValue(labName) || 'other';
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const currentPage = Math.min(labPages[key] || 1, totalPages);
    return { key, currentPage, totalPages };
  };

  const updateLabPage = (labKey, page, totalPages) => {
    const clampedPage = Math.min(Math.max(page, 1), totalPages);
    setLabPages((prev) => ({ ...prev, [labKey]: clampedPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${image})`,
          minHeight: '380px',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.70) 100%)',
          }}
        />

        <div className="relative flex flex-col items-center justify-center text-center px-4 py-20">
          <span
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: 'rgba(234,179,8,0.20)',
              color: '#FDE68A',
              border: '1px solid rgba(234,179,8,0.40)'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
            Faculty of Engineering · University of Ruhuna
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Laboratory Equipment
            <span className="block text-yellow-400">Inventory</span>
          </h1>

          <p className="text-gray-300 text-base md:text-lg max-w-xl mb-10">
            Browse, search, and request laboratory devices across all departments and facilities.
          </p>

          <div className="flex items-center bg-white rounded-full px-5 py-3 shadow-2xl w-full max-w-xl">
            <Search className="text-yellow-500 mr-3 flex-shrink-0" size={20} />
            <input
              type="text"
              placeholder="Search by equipment name or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none outline-none text-gray-700 placeholder-gray-400 text-sm bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear search"
              >
                <X className="text-gray-400 hover:text-gray-600" size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              {equipmentList.filter((e) => normalizeValue(e.status) === 'working').length} Working
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              {equipmentList.filter((e) => normalizeValue(e.status) === 'under_repair').length} Under Repair
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              {equipmentList.filter((e) => normalizeValue(e.status) === 'broken').length} Broken
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-yellow-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              {equipmentList.length} Total Items
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-yellow-500 py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <div
                onClick={() => {
                  setShowDeptDropdown(!showDeptDropdown);
                  setShowLabDropdown(false);
                }}
                className="bg-white rounded-lg px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-yellow-50 transition-colors shadow-sm"
              >
                <span className="text-gray-700 font-medium text-sm truncate">
                  {selectedDepartment || 'All Departments'}
                </span>
                <ChevronDown size={16} className="text-yellow-600 flex-shrink-0 ml-2" />
              </div>

              {showDeptDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-xl max-h-60 overflow-y-auto border border-yellow-100">
                  <div
                    onClick={() => {
                      setSelectedDepartment('');
                      setShowDeptDropdown(false);
                    }}
                    className="p-3 hover:bg-yellow-50 cursor-pointer border-b text-sm text-gray-500 italic"
                  >
                    All Departments
                  </div>

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

            <div className="relative flex-1 min-w-[200px]">
              <div
                onClick={() => {
                  setShowLabDropdown(!showLabDropdown);
                  setShowDeptDropdown(false);
                }}
                className="bg-white rounded-lg px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-yellow-50 transition-colors shadow-sm"
              >
                <span className="text-gray-700 font-medium text-sm truncate">
                  {selectedLaboratory || 'All Laboratories'}
                </span>
                <ChevronDown size={16} className="text-yellow-600 flex-shrink-0 ml-2" />
              </div>

              {showLabDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-xl max-h-60 overflow-y-auto border border-yellow-100">
                  <div
                    onClick={() => {
                      setSelectedLaboratory('');
                      setShowLabDropdown(false);
                    }}
                    className="p-3 hover:bg-yellow-50 cursor-pointer border-b text-sm text-gray-500 italic"
                  >
                    All Laboratories
                  </div>

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

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedDepartment('');
                  setSelectedLaboratory('');
                  setSearchQuery('');
                }}
                className="bg-white hover:bg-yellow-50 text-yellow-700 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm border border-yellow-200"
              >
                Clear
              </button>

              <button
                onClick={() => {
                  setSelectedEquipmentForBorrow(null);
                  setIsBorrowModalOpen(true);
                }}
                className="bg-black hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
              >
                Request to Borrow
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(searchQuery || selectedLaboratory || selectedDepartment) && (
          <div className="mb-6 p-3 bg-blue-50 border-l-4 border-blue-500 rounded flex flex-wrap items-center gap-2">
            <p className="text-sm text-gray-700">
              {searchQuery && (
                <span>
                  Searching: <strong>"{searchQuery}"</strong>
                </span>
              )}
              {searchQuery && selectedLaboratory && <span className="mx-2">·</span>}
              {selectedLaboratory && (
                <span>
                  Lab: <strong>{selectedLaboratory}</strong>
                </span>
              )}
              <span className="ml-2 text-gray-500">
                —{' '}
                <strong>
                  {filteredEquipment.reduce(
                    (acc, lab) =>
                      acc + lab.equipment.reduce((sum, g) => sum + g.totalQuantity, 0),
                    0
                  )}
                </strong>{' '}
                items ({filteredEquipment.reduce((acc, lab) => acc + lab.equipment.length, 0)} types)
              </span>
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-500">Loading equipment...</p>
          </div>
        )}

        {error && !loading && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <strong className="font-bold">Error! </strong>
            {error}
          </div>
        )}

        {!loading && !error && filteredEquipment.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg mb-4">No equipment found matching your criteria.</p>
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
        )}

        {!loading &&
          !error &&
          filteredEquipment.map((lab, index) => {
            const { key: labKey, currentPage, totalPages } = getLabPage(
              lab.name,
              lab.equipment.length
            );
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const paginatedEquipment = lab.equipment.slice(
              startIndex,
              startIndex + ITEMS_PER_PAGE
            );

            return (
              <div key={index} className="mb-12">
                {/* Lab Header */}
                <div className="flex items-center gap-4 mb-6 bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">{lab.name}</h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {lab.equipment.reduce((acc, g) => acc + g.totalQuantity, 0)} items
                      &nbsp;·&nbsp;
                      {lab.equipment.length} types
                    </p>
                  </div>

                  <div className="flex gap-3 text-xs font-medium">
                    <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {lab.equipment.reduce((a, g) => a + g.working, 0)} Working
                    </span>

                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      {lab.equipment.reduce((a, g) => a + g.underRepair, 0)} Repair
                    </span>

                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {lab.equipment.reduce((a, g) => a + g.broken, 0)} Broken
                    </span>
                  </div>
                </div>

                {/* Equipment Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {paginatedEquipment.map((group, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                        <img
                          src={
                            group.displayItem.photoPath
                              ? `http://localhost:8080/${group.displayItem.photoPath}?t=${Date.now()}`
                              : '/images/sample1.jpg'
                          }
                          alt={group.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/sample1.jpg';
                          }}
                        />
                      </div>

                      <div className="p-3">
                        <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                          {group.name}
                        </h3>

                        <div className="bg-gray-50 rounded-lg p-2 mb-3">
                          <p className="text-xs text-gray-600 mb-1.5 font-medium">
                            Qty: {group.totalQuantity}
                          </p>

                          <div className="flex flex-wrap gap-1.5 text-[10px]">
                            <span className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              {group.working}
                            </span>

                            <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              {group.underRepair}
                            </span>

                            <span className="flex items-center gap-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              {group.broken}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            navigate(
                              `/equipment/details/${encodeURIComponent(group.name)}/${encodeURIComponent(lab.name)}`
                            )
                          }
                          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-1.5 px-4 rounded-lg text-xs transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => updateLabPage(labKey, currentPage - 1, totalPages)}
                      disabled={currentPage === 1}
                      className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                      (pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => updateLabPage(labKey, pageNumber, totalPages)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-yellow-500 border-yellow-500 text-black font-semibold'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => updateLabPage(labKey, currentPage + 1, totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <BorrowRequestForm
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        equipmentList={equipmentList}
        preselectedEquipment={selectedEquipmentForBorrow}
        onSubmitted={() => setSelectedEquipmentForBorrow(null)}
      />
    </div>
  );
};

export default Equipment;