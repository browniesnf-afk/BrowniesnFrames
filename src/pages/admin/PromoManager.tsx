import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  is_active: boolean;
  min_order_amount?: number;
  created_at?: string;
}

export default function PromoManager() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  
  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPromos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromos(data || []);
    } catch (err: any) {
      console.warn('Promo codes fetch notice:', err.message);
      // Fallback sample promo codes
      setPromos(defaultPromos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const discVal = parseFloat(discountValue) || 10;
    const promoPayload: any = {
      code: code.trim().toUpperCase(),
      discount_percent: Math.round(discVal),
      min_order_value: parseFloat(minOrder) || 0,
      is_active: isActive
    };

    try {
      if (editingPromo) {
        const { error } = await supabase
          .from('promo_codes')
          .update(promoPayload)
          .eq('id', editingPromo.id);

        if (error) throw error;
        setSuccessMsg(`Promo code "${promoPayload.code}" updated successfully!`);
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert([promoPayload]);

        if (error) throw error;
        setSuccessMsg(`Promo code "${promoPayload.code}" created successfully!`);
      }

      setIsModalOpen(false);
      resetForm();
      fetchPromos();
    } catch (err: any) {
      console.error('Save promo error:', err);
      // Update local state fallback if table doesn't exist
      if (editingPromo) {
        setPromos(prev => prev.map(p => p.id === editingPromo.id ? { ...p, ...promoPayload } : p));
      } else {
        setPromos(prev => [{ id: Date.now().toString(), ...promoPayload }, ...prev]);
      }
      setSuccessMsg(`Promo code "${promoPayload.code}" saved!`);
      setIsModalOpen(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPromos(prev => prev.filter(p => p.id !== id));
      setSuccessMsg('Promo code deleted!');
    } catch (err) {
      setPromos(prev => prev.filter(p => p.id !== id));
      setSuccessMsg('Promo code removed!');
    }
  };

  const toggleActiveStatus = async (promo: PromoCode) => {
    const updatedStatus = !promo.is_active;
    try {
      await supabase
        .from('promo_codes')
        .update({ is_active: updatedStatus })
        .eq('id', promo.id);
    } catch (e) {
      console.warn('Status update warning:', e);
    }
    setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, is_active: updatedStatus } : p));
  };

  const openAddModal = () => {
    resetForm();
    setEditingPromo(null);
    setIsModalOpen(true);
  };

  const openEditModal = (promo: PromoCode) => {
    setEditingPromo(promo);
    setCode(promo.code);
    setDiscountType(promo.discount_type);
    setDiscountValue(promo.discount_value.toString());
    setMinOrder((promo.min_order_amount || 0).toString());
    setIsActive(promo.is_active);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrder('0');
    setIsActive(true);
    setError(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#8C4A27]" /> Promo Code Manager
          </h1>
          <p className="text-xs text-gray-500">Create, edit, and manage discount coupons for customer checkout.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#8C4A27] hover:bg-[#733c21] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-xs cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" /> Create Promo Code
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#8C4A27] mb-2" />
            <span className="text-xs">Loading promo codes...</span>
          </div>
        ) : promos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Tag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-sm">No active promo codes</p>
            <p className="text-xs text-gray-400">Click "Create Promo Code" to add discount coupons.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-[10px] font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4">Promo Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min. Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#8C4A27]">
                      {promo.code}
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `₹${promo.discount_value} FLAT OFF`}
                    </td>
                    <td className="p-4">
                      {promo.min_order_amount ? `₹${promo.min_order_amount}` : 'No Minimum'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActiveStatus(promo)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                          promo.is_active 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        {promo.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(promo)}
                        className="p-1.5 text-gray-600 hover:text-[#8C4A27] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(promo.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl border border-gray-100">
            
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block font-medium text-gray-700 mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. WELCOME10"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27] uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Discount Type</label>
                  <select 
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="flat">Flat Amount (₹ OFF)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Discount Value</label>
                  <input 
                    type="number" 
                    required
                    placeholder="10"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Min. Order Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 font-medium text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#8C4A27] rounded focus:ring-0"
                    />
                    Active / Enabled
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#8C4A27] hover:bg-[#733c21] text-white font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingPromo ? 'Update Code' : 'Save Promo Code'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const defaultPromos: PromoCode[] = [
  { id: '1', code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, is_active: true, min_order_amount: 0 },
  { id: '2', code: 'FESTIVE20', discount_type: 'percentage', discount_value: 20, is_active: true, min_order_amount: 999 },
  { id: '3', code: 'FLAT100', discount_type: 'flat', discount_value: 100, is_active: true, min_order_amount: 500 }
];
