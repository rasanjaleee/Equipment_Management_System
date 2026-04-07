import { useState } from 'react';
import { Upload, Download, ArrowLeft, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BulkUploadEquipment() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setMessage('');
    setError('');
    setResult(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await axios.get(
        'http://localhost:8080/api/equipment/bulk-template',
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'equipment_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a CSV file first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');
      setResult(null);

      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'http://localhost:8080/api/equipment/bulk-upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setResult(response.data);
      setMessage('Bulk upload completed successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        'Bulk upload failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8 min-h-full">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/equipment')}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                title="Back to equipment page"
              >
                <ArrowLeft size={24} />
              </button>

              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Upload className="text-yellow-500" size={28} />
                Bulk Upload Equipment
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileText size={20} className="text-yellow-600" />
                Step 1 - Download Template
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Download the sample CSV file and fill in your equipment details using the same column names.
              </p>
              <button
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:bg-gray-400"
              >
                <Download size={18} />
                {downloadingTemplate ? 'Downloading...' : 'Download Sample CSV'}
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Upload size={20} className="text-yellow-600" />
                Step 2 - Upload CSV
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload your completed CSV file. Valid rows will be saved and invalid rows will be shown below.
              </p>

              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 cursor-pointer"
              />

              {file && (
                <p className="mt-3 text-sm text-green-700 font-medium">
                  Selected file: {file.name}
                </p>
              )}

              <button
                onClick={handleUpload}
                disabled={loading}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:bg-gray-400"
              >
                <Upload size={18} />
                {loading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
            <h3 className="text-md font-semibold text-yellow-900 mb-3 flex items-center gap-2">
              <AlertCircle size={18} className="text-yellow-700" />
              Important Instructions
            </h3>
            <ul className="space-y-2 text-sm text-yellow-900 list-disc list-inside">
              <li>Status must be: WORKING, UNDER_REPAIR, BROKEN</li>
              <li>
                Laboratory names must match system values exactly: Electrical Machines and Power Electronics Laboratory, Power Systems and High Voltage Laboratory, Electronics and Measurements Laboratory, Control Systems Laboratory, Communication Systems Laboratory, Computer Networks Laboratory
              </li>
              <li>
                Date format: <span className="font-semibold">YYYY-MM-DD</span> (Excel format like 6/27/2022 is also supported)
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <h3 className="text-md font-semibold text-blue-800 mb-2">CSV format</h3>
            <p className="text-sm text-blue-700 break-all">
              equipmentName,laboratory,model,serialNumber,cost,purchaseDate,supplier,status,grnNumber
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Use date format: <span className="font-semibold">YYYY-MM-DD</span>
            </p>
          </div>

          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
              <p className="text-green-700 font-medium flex items-center gap-2">
                <CheckCircle2 size={18} />
                {message}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
              <p className="text-red-700 font-medium flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </p>
            </div>
          )}

          {result && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Summary</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Total Rows</p>
                  <p className="text-2xl font-bold text-gray-800">{result.totalRows}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-700">Success Count</p>
                  <p className="text-2xl font-bold text-green-700">{result.successCount}</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700">Failed Count</p>
                  <p className="text-2xl font-bold text-red-700">{result.failedCount}</p>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">Row Errors</h3>
                  <ul className="space-y-2 list-disc list-inside text-sm text-red-700">
                    {result.errors.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.errors && result.errors.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <p className="text-green-700 font-medium">
                    All rows were uploaded successfully.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}