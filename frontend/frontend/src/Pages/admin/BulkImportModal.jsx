import { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const BulkImportModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);
    setError('');
    parseExcelFile(selectedFile);
  };

  // Parse Excel file
  const parseExcelFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setError('The Excel file is empty');
          return;
        }

        // Validate and format data
        const formattedData = jsonData.map((row, index) => ({
          rowNumber: index + 2, // +2 because Excel rows start at 1 and we have a header
          equipmentName: row['Equipment Name'] || row['equipmentName'] || '',
          laboratory: row['Laboratory'] || row['laboratory'] || '',
          model: row['Model'] || row['model'] || '',
          serialNumber: row['Serial Number'] || row['serialNumber'] || '',
          cost: row['Cost'] || row['cost'] || '',
          purchaseDate: row['Purchase Date'] || row['purchaseDate'] || '',
          supplier: row['Supplier'] || row['supplier'] || '',
          status: row['Status'] || row['status'] || 'WORKING',
          qrCode: row['QR Code'] || row['qrCode'] || '',
          grnNumber: row['GRN Number'] || row['grnNumber'] || ''
        }));

        // Validate data
        const errors = validateData(formattedData);
        setValidationErrors(errors);
        setPreviewData(formattedData);
      } catch (err) {
        setError('Failed to parse Excel file. Please check the format.');
        console.error(err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Validate equipment data
  const validateData = (data) => {
    const errors = [];
    
    data.forEach((item) => {
      if (!item.equipmentName) {
        errors.push(`Row ${item.rowNumber}: Equipment Name is required`);
      }
      if (!item.laboratory) {
        errors.push(`Row ${item.rowNumber}: Laboratory is required`);
      }
      if (item.status && !['WORKING', 'UNDER_REPAIR', 'BROKEN'].includes(item.status.toUpperCase())) {
        errors.push(`Row ${item.rowNumber}: Status must be WORKING, UNDER_REPAIR, or BROKEN`);
      }
      if (item.purchaseDate && !isValidDate(item.purchaseDate)) {
        errors.push(`Row ${item.rowNumber}: Invalid date format (use YYYY-MM-DD)`);
      }
    });

    return errors;
  };

  // Validate date format
  const isValidDate = (dateString) => {
    // Check if it's already a valid date object or a proper date string
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  // Handle bulk upload
  const handleBulkUpload = async () => {
    if (validationErrors.length > 0) {
      setError('Please fix validation errors before uploading');
      return;
    }

    if (previewData.length === 0) {
      setError('No data to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      // Format data for backend (convert dates to proper format)
      const formattedData = previewData.map(item => ({
        ...item,
        status: item.status.toUpperCase(),
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : ''
      }));

      const response = await axios.post(
        'http://localhost:8080/api/equipment/bulk-import',
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess(`Successfully imported ${response.data.importedCount || previewData.length} equipment items`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Bulk import failed:', err);
      setError(err.response?.data?.message || 'Failed to import equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Download Excel template
  const downloadTemplate = () => {
    const template = [
      {
        'Equipment Name': 'Digital Oscilloscope',
        'Laboratory': 'Electronics and Measurements Laboratory',
        'Model': 'Tektronix TBS1102B',
        'Serial Number': 'TBS1102B-ECL-8891',
        'Cost': '244999.99',
        'Purchase Date': '2026-02-19',
        'Supplier': 'Lanka Scientific Solutions',
        'Status': 'WORKING',
        'QR Code': 'QR-ECL-0015',
        'GRN Number': 'GRN-33990'
      },
      {
        'Equipment Name': 'LCR Meter',
        'Laboratory': 'Electrical Machines and Power Electronics Laboratory',
        'Model': 'Keysight U1733C',
        'Serial Number': 'U1733C-ML-3307',
        'Cost': '158000',
        'Purchase Date': '2026-02-11',
        'Supplier': 'Precision Lanka',
        'Status': 'WORKING',
        'QR Code': 'QR-ML-0012',
        'GRN Number': 'GRN-44721'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipment Template');
    XLSX.writeFile(wb, 'Equipment_Import_Template.xlsx');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-yellow-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={24} />
            <h2 className="text-xl font-bold text-gray-900">Bulk Import Equipment</h2>
          </div>
          <button onClick={onClose} className="text-gray-900 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Instructions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Download the template Excel file and fill in your equipment details</li>
                  <li>Required fields: Equipment Name, Laboratory</li>
                  <li>Status must be: WORKING, UNDER_REPAIR, or BROKEN</li>
                  <li>Date format: YYYY-MM-DD (e.g., 2026-02-19)</li>
                  <li>Equipment with the same name will be automatically grouped</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Template Button */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download size={20} />
              Download Excel Template
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Excel File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-yellow-500 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload size={48} className="text-gray-400 mb-3" />
                <p className="text-gray-600 mb-1">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">Excel files only (.xlsx, .xls)</p>
              </label>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-red-900">
                  <p className="font-semibold mb-2">Validation Errors:</p>
                  <ul className="list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-green-900">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {previewData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Preview ({previewData.length} items)
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">#</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Equipment Name</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Laboratory</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Model</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Serial</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Cost</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">{item.equipmentName}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{item.laboratory}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{item.model}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{item.serialNumber}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">${item.cost}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">{item.purchaseDate}</td>
                          <td className="px-3 py-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.status.toUpperCase() === 'WORKING' ? 'bg-green-100 text-green-800' :
                              item.status.toUpperCase() === 'UNDER_REPAIR' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleBulkUpload}
            disabled={loading || previewData.length === 0 || validationErrors.length > 0}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload size={20} />
                Import {previewData.length} Items
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
