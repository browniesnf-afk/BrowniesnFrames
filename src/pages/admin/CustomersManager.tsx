import { useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { Users, Search, Loader2, Phone, Mail, Calendar, Trash2, AlertCircle } from 'lucide-react';

export default function CustomersManager() {
  const { customers, loading, deleteCustomer } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredCustomers = customers.filter(c => 
    (c.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = async (customerId: string) => {
    setDeletingId(customerId);
    setErrorMsg(null);
    const result = await deleteCustomer(customerId);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (!result.success) {
      setErrorMsg(`Failed to delete customer: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Customer Directory</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Registered customers — updates live in real-time via Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live
          </div>
          <div className="text-xs text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            Total: <span className="font-bold text-[#8C4A27]">{customers.length}</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Delete Customer?</h3>
                <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-4 py-3 mb-5">
              The customer record will be permanently removed from Supabase. Their past orders will remain in the orders table.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deletingId === confirmDeleteId ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-3.5 h-3.5" /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#8C4A27] mb-2" />
            <span className="text-xs">Loading customer directory...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-sm">No registered customers yet</p>
            <p className="text-xs text-gray-400 mt-1">Customers who sign up or place orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-[10px] font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Mobile Number</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#8C4A27]/10 text-[#8C4A27] font-bold flex items-center justify-center text-xs shrink-0">
                          {customer.full_name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <span>{customer.full_name || 'Anonymous Customer'}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-medium text-gray-800">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {customer.phone || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {customer.email || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(customer.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setConfirmDeleteId(customer.id)}
                        disabled={deletingId === customer.id}
                        title="Delete customer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </td>
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
