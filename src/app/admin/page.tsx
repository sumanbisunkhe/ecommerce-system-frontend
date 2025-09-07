'use client';

import { FaUsers, FaShoppingCart, FaBoxOpen, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';

export default function AdminDashboard() {
  const dashboardCards = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: <FaUsers className="w-6 h-6" />,
      link: '/admin/users',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: '856',
      change: '+23%',
      icon: <FaShoppingCart className="w-6 h-6" />,
      link: '/admin/orders',
      color: 'bg-green-500',
    },
    {
      title: 'Total Products',
      value: '432',
      change: '+8%',
      icon: <FaBoxOpen className="w-6 h-6" />,
      link: '/admin/products',
      color: 'bg-purple-500',
    },
    {
      title: 'Revenue',
      value: '$12,345',
      change: '+18%',
      icon: <FaChartLine className="w-6 h-6" />,
      link: '/admin/analytics',
      color: 'bg-indigo-500',
    },
  ];

  // return (
  //   <div className="space-y-6 p-6">
  //     <div className="flex justify-between items-center">
  //       <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
  //       <div className="flex space-x-4">
  //         <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
  //           Generate Report
  //         </button>
  //       </div>
  //     </div>

  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  //       {dashboardCards.map((card, index) => (
  //         <Link key={index} href={card.link}>
  //           <div className="p-6 rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow">
  //             <div className="flex items-center justify-between mb-4">
  //               <div className={`p-3 rounded-full ${card.color} text-white`}>
  //                 {card.icon}
  //               </div>
  //               <span className={`text-sm font-semibold ${
  //                 card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
  //               }`}>
  //                 {card.change}
  //               </span>
  //             </div>
  //             <h3 className="text-gray-600 text-sm font-medium">{card.title}</h3>
  //             <p className="text-2xl font-bold text-gray-900">{card.value}</p>
  //           </div>
  //         </Link>
  //       ))}
  //     </div>

  //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //       <div className="bg-white p-6 rounded-lg shadow">
  //         <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
  //         {/* Add recent orders table or list here */}
  //       </div>
  //       <div className="bg-white p-6 rounded-lg shadow">
  //         <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
  //         {/* Add recent users table or list here */}
  //       </div>
  //     </div>
  //   </div>
  // );
}