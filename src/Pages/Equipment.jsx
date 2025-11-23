import { Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Equipment = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLaboratory, setSelectedLaboratory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showLabDropdown, setShowLabDropdown] = useState(false);

  const departments = [
    'Department of Electrical and Information Engineering',
    'Department of Mechanical and Manufacturing Engineering',
    'Department of Civil and Environmental Engineering',
    'Department of Materials and Mechanical Engineering',
    'Department of Interdisciplinary Studies'
  ];

  const laboratoriesList = [
    'Electrical Machines and Power Electronics Laboratory',
    'Power Systems and High Voltage Laboratory',
    'Electronics and Measurements Laboratory',
    'Control Systems Laboratory',
    'Communication Systems Laboratory',
    'Computer Networks Laboratory'
  ];

  // Sample equipment data
  const laboratories = [
    {
      id: 1,
      name: '01 Electrical Machines and Power Electronics Laboratory',
      totalEquipment: 30,
      equipment: [
        {
          id: 1,
          name: 'Oscilloscope',
          type: 'Total Equipment - 07',
          model: 'Model01 - 02',
          image:'/images/img1.jpeg'
        },
        {
          id: 2,
          name: 'Digital Multimeter',
          type: 'Total Equipment - 07',
          model: 'Model01 - 02',
          image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
        },
        {
          id: 3,
          name: 'Function Generator',
          type: 'Total Equipment - 07',
          model: 'Model01 - 02',
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400'
        }
      ]
    },
    {
      id: 2,
      name: '02. Power systems and High voltage laboratory',
      totalEquipment: 25,
      equipment: [
        {
          id: 4,
          name: 'Oscilloscope',
          type: 'Total Equipment - 05',
          model: 'Model01 - 02',
          image: 'https://images.unsplash.com/photo-1583794834234-c5ebaa5a3a9b?w=400'
        },
        {
          id: 5,
          name: 'Digital Multimeter',
          type: 'Total Equipment - 05',
          model: 'Model01 - 02',
          image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
        },
        {
          id: 6,
          name: 'Function Generator',
          type: 'Total Equipment - 05',
          model: 'Model01 - 02',
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400'
        }
      ]
    },
    {
      id: 3,
      name: '03. Electronics and Measurements laboratory',
      totalEquipment: 28,
      equipment: [
        {
          id: 7,
          name: 'Oscilloscope',
          type: 'Total Equipment - 06',
          model: 'Model01 - 02',
          image: 'https://images.unsplash.com/photo-1583794834234-c5ebaa5a3a9b?w=400'
        },
        {
          id: 8,
          name: 'Digital Multimeter',
          type: 'Total Equipment - 06',
          model: 'Model01 - 02',
          image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
        },
        {
          id: 9,
          name: 'Function Generator',
          type: 'Total Equipment - 06',
          model: 'Model01 - 02',
          image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400'
        }
      ]
    }
  ];

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
              // Apply filter logic here
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

        {/* Laboratory Sections */}
        {laboratories.map((lab) => (
          <div key={lab.id} className="mb-12">
            <div className="bg-white border-l-4 border-yellow-500 p-4 mb-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">{lab.name}</h2>
              <p className="text-gray-600 text-sm">Total Equipment = {lab.totalEquipment}</p>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lab.equipment.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-yellow-400 hover:shadow-xl transition-shadow">
                  {/* Equipment Image */}
                  <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Equipment Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{item.type}</p>
                    <p className="text-sm text-gray-600 mb-4">{item.model}</p>

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
        ))}
      </div>
    </div>
  );
};

export default Equipment;