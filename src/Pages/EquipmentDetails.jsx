import { useState } from 'react';

const EquipmentDetails = () => {
  // Sample equipment data - in real app, this would come from props or API based on equipment ID
  const equipmentData = {
    name: 'Digital Oscilloscope',
    image: '/images/img1.jpeg', // Ensure this image exists in the public/images folder
    details: {
      'Equipment Name': 'Oscilloscope',
      'Laboratory Name': 'Electronic and Power Laboratory',
      'Category': 'Measurement Device',
      'Total Quantity': '7',
      'Working': '4',
      'Under Repair': '2',
      'Broken': '1'
    },
    items: [
      {
        id: 'Q1',
        equipmentId: 'ELEC-LAB-044',
        qrCode: 'QR 001',
        dateOfPurchase: '2019-07-10',
        supplier: 'Techvision Pvt Ltd',
        cost: 'LKR50',
        status: 'Working',
        statusColor: 'bg-green-500'
      },
      {
        id: 'Q2',
        equipmentId: 'ELEC-LAB-045',
        qrCode: 'QR 001',
        dateOfPurchase: '2019-07-10',
        supplier: 'Techvision Pvt Ltd',
        cost: 'LKR50',
        status: 'Working',
        statusColor: 'bg-green-500'
      },
      {
        id: 'Q3',
        equipmentId: 'ELEC-LAB-046',
        qrCode: 'QR 002',
        dateOfPurchase: '2019-07-10',
        supplier: 'Techvision Pvt Ltd',
        cost: 'LKR50',
        status: 'Working',
        statusColor: 'bg-green-500'
      },
      {
        id: 'Q4',
        equipmentId: 'ELEC-LAB-634',
        qrCode: 'QR 004',
        dateOfPurchase: '2020-03-18',
        supplier: 'Techvision Pvt Ltd',
        cost: 'LKR50',
        status: 'Broken',
        statusColor: 'bg-red-500'
      },
      {
        id: 'Q5',
        equipmentId: 'ELEC-LAB-636',
        qrCode: 'QR 005',
        dateOfPurchase: '2024-03-10',
        supplier: 'Techvision Pvt Ltd',
        cost: 'YMCN1',
        status: 'Under Repair',
        statusColor: 'bg-blue-500'
      },
      {
        id: 'Q6',
        equipmentId: 'ELEC-LAB-636',
        qrCode: 'QR 005',
        dateOfPurchase: '2024-03-18',
        supplier: 'Techvision Pvt Ltd',
        cost: '1WRXS',
        status: 'Working',
        statusColor: 'bg-green-500'
      },
      {
        id: 'Q7',
        equipmentId: 'ELEC-LAB-636',
        qrCode: 'QR 007',
        dateOfPurchase: '2019-03-15',
        supplier: 'Techvision Pvt Ltd',
        cost: 'LKR50',
        status: 'Broken',
        statusColor: 'bg-red-500'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Equipment Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            {equipmentData.name}
          </h1>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Equipment Image */}
            <div className="flex-shrink-0 w-full md:w-80">
              <img
                src={equipmentData.image}
                alt={equipmentData.name}
                className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
              />
            </div>

            {/* Equipment Details Table */}
            <div className="flex-1 w-full">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                {Object.entries(equipmentData.details).map(([key, value], index) => (
                  <div
                    key={key}
                    className={`flex ${index % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'}`}
                  >
                    <div className="w-1/2 px-4 py-3 font-semibold text-gray-700 border-r border-gray-300">
                      {key}
                    </div>
                    <div className="w-1/2 px-4 py-3 text-gray-900 flex items-center">
                      <span className="mr-2">-</span>
                      <span>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Items Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Equipment ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">QR code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date of purchase</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cost/Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {equipmentData.items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.equipmentId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.qrCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.dateOfPurchase}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.supplier}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.cost}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.statusColor}`}></div>
                        <span className="text-sm text-gray-900">{item.status}</span>
                      </div>
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