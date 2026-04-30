import { Search, ChevronDown, X, FlaskConical } from 'lucide-react';
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
  const [equipmentList, setEquipmentList] = useState([]); // SAFE default
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

      setEquipmentList(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch equipment:', err);
      setEquipmentList([]); // IMPORTANT FIX
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
    if (!acc[labKey].equipmentByName[equipmentKey])
      acc[labKey].equipmentByName[equipmentKey] = { name: equipmentName, items: [] };

    acc[labKey].equipmentByName[equipmentKey].items.push(item);
    return acc;
  }, {});

  const filteredEquipment = Object.values(filteredMap).map((lab) => {
    const equipment = Object.values(lab.equipmentByName).map((group) => {
      const working = group.items.filter((item) => normalizeValue(item.status) === 'working').length;
      const underRepair = group.items.filter((item) => normalizeValue(item.status) === 'under_repair').length;
      const broken = group.items.filter((item) => normalizeValue(item.status) === 'broken').length;

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
      {/* UI unchanged exactly as yours */}
    </div>
  );
};

export default Equipment;