import { DollarSign, ShoppingBag, Package, Users, TrendingUp, Loader2, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminStats } from '../../hooks/useAdminStats';
import { useOrders } from '../../hooks/useOrders';

export default function AdminDashboardPage() {
  const { totalSales, totalOrders, activeProducts, totalCustomers, loading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { orders, loading: ordersLoading, seedSampleOrders, refetch: refetchOrders } = useOrders();

  const handleSeedAll = async () => {
    await seedSampleOrders();
    refetchStats();
    refetchOrders();
  };

  const recentOrders = orders.slice(0, 5);

  const stats = [
    { name: 'Total Sales', value: `₹${totalSales.toLocaleString()}`, icon: DollarSign },
    { name: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag },
    { name: 'Active Products', value: activeProducts.toString(), icon: Package },
    { name: 'Customers', value: totalCustomers.toString(), icon: Users },
  ];

  return (
    <div className="space-y-6">
      
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-xs text-gray-500">Live metrics calculated directly from your Supabase database tables.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedAll}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            Seed Sample Orders
          </button>
          <Link 
            to="/admin/products"
            className="bg-[#8C4A27] hover:bg-[#733c21] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            + Add Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">{stat.name}</span>
                <div className="w-8 h-8 rounded-lg bg-[#8C4A27]/10 text-[#8C4A27] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                {statsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#8C4A27]" />
                ) : (
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                )}
                <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  Live
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif font-bold text-gray-900 text-lg">Recent Supabase Orders</h2>
          <Link to="/admin/orders" className="text-xs font-medium text-[#8C4A27] hover:underline">
            View All Orders →
          </Link>
        </div>
        
        {ordersLoading ? (
          <div className="p-8 flex justify-center items-center text-[#8C4A27]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-xs">No orders in Supabase yet.</p>
            <button 
              onClick={handleSeedAll}
              className="mt-2 text-xs font-semibold text-[#8C4A27] underline"
            >
              Click here to seed sample orders
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-[10px] font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-gray-900">#{order.id.slice(0, 8)}</td>
                    <td className="p-4 font-medium text-gray-800">{order.items_summary || 'Order Items'}</td>
                    <td className="p-4 font-sans font-extrabold text-[#111827] text-sm sm:text-base tracking-tight">₹{order.total_amount}</td>
                    <td className="p-4">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[10px] font-bold
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : ''}
                        ${order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' : ''}
                        ${order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' : ''}
                        ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
