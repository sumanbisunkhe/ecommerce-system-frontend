'use client';

import { FaChartLine, FaChartBar, FaChartPie, FaChartArea } from 'react-icons/fa';

export default function AnalyticsPage() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$48,234',
      change: '+12%',
      icon: <FaChartLine className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Average Order Value',
      value: '$124',
      change: '+8%',
      icon: <FaChartBar className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '+2%',
      icon: <FaChartPie className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+18%',
      icon: <FaChartArea className="w-6 h-6" />,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-6 px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Overview</h1>
        <div className="flex space-x-4">
          <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="p-6 rounded-lg shadow-lg bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            {/* Add chart component here */}
            <p className="text-gray-500">Revenue Chart Placeholder</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            {/* Add chart component here */}
            <p className="text-gray-500">Products Chart Placeholder</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">User Demographics</h3>
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            {/* Add chart component here */}
            <p className="text-gray-500">Demographics Chart Placeholder</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            {/* Add chart component here */}
            <p className="text-gray-500">Orders Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}