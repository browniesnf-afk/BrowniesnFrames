import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  FolderTree, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Loader2, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active?: boolean;
  created_at?: string;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Categories from Supabase
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setCategories(data.map(c => ({ ...c, is_active: c.is_active ?? true })));
      } else {
        setCategories(initialCategories);
      }
    } catch (err: any) {
      console.warn('Categories fetch notice:', err.message);
      setCategories(initialCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    // Subscribe to categories table realtime events in admin manager
    const channel = supabase
      .channel('categories_admin_realtime_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          console.log('⚡ Realtime category update in Admin:', payload);
          if (payload.eventType === 'INSERT') {
            setCategories(prev => {
              const newCat = { ...(payload.new as any), is_active: (payload.new as any).is_active ?? true };
              if (prev.some(c => c.id === newCat.id)) return prev;
              return [newCat, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setCategories(prev => prev.map(c => c.id === payload.new.id ? { ...(payload.new as any), is_active: (payload.new as any).is_active ?? true } : c));
          } else if (payload.eventType === 'DELETE') {
            setCategories(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `category-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrlData.publicUrl }));
    } catch (err: any) {
      setError('Image upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (category: Category) => {
    const updatedStatus = !(category.is_active ?? true);
    setCategories(prev => prev.map(c => c.id === category.id ? { ...c, is_active: updatedStatus } : c));

    // Only update Supabase if ID is a valid UUID
    if (category.id && category.id.includes('-')) {
      try {
        await supabase
          .from('categories')
          .update({ is_active: updatedStatus })
          .eq('id', category.id);
      } catch (err) {
        console.warn('Toggle active status error:', err);
      }
    }
  };

  // Submit Form (Add / Edit) with UUID & Slug Upsert Protection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const slugValue = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      name: formData.name,
      slug: slugValue,
      description: formData.description,
      image_url: formData.image_url || '/images/home_brownies.jpg',
      is_active: formData.is_active
    };

    try {
      const isRealUUID = editingCategory?.id && editingCategory.id.includes('-');

      if (editingCategory && isRealUUID) {
        // Edit existing row by UUID
        const { error: updateErr } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id);

        if (updateErr) {
          // If is_active column doesn't exist yet, retry without is_active
          const { is_active, ...restPayload } = payload;
          const { error: retryErr } = await supabase
            .from('categories')
            .update(restPayload)
            .eq('id', editingCategory.id);
          if (retryErr) throw retryErr;
        }
        setSuccessMsg('Category updated successfully!');
      } else {
        // Upsert by slug if adding new or updating fallback item
        const { error: upsertErr } = await supabase
          .from('categories')
          .upsert([payload], { onConflict: 'slug' });

        if (upsertErr) {
          const { is_active, ...restPayload } = payload;
          const { error: retryErr } = await supabase
            .from('categories')
            .upsert([restPayload], { onConflict: 'slug' });
          if (retryErr) throw retryErr;
        }
        setSuccessMsg('Category saved successfully to Supabase!');
      }

      setIsModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (err: any) {
      setError('Supabase Save Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      if (id.includes('-')) {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      setCategories(prev => prev.filter(c => c.id !== id));
      setSuccessMsg('Category deleted successfully!');
    } catch (err: any) {
      alert('Failed to delete category: ' + err.message);
    }
  };

  const openAddModal = () => {
    resetForm();
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active ?? true
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true
    });
    setError(null);
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Category Manager</h1>
          <p className="text-xs text-gray-500">Manage store collections, descriptions, banners, and status in Supabase.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#8C4A27] hover:bg-[#733c21] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 w-fit shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
          />
        </div>
        <span className="text-xs text-gray-500">{filteredCategories.length} Categories</span>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#8C4A27] mb-2" />
            <span className="text-xs">Loading categories from Supabase...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FolderTree className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-sm">No categories found</p>
            <p className="text-xs text-gray-400">Click "Add Category" to create your first category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-[10px] font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4">Category</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img 
                        src={category.image_url || '/images/home_brownies.jpg'} 
                        alt={category.name} 
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                      />
                      <span className="font-semibold text-gray-900">{category.name}</span>
                    </td>
                    <td className="p-4 font-mono text-gray-500">/{category.slug}</td>
                    <td className="p-4 max-w-xs text-gray-600 line-clamp-1">{category.description || 'No description'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(category)}
                        className="flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      >
                        {category.is_active ?? true ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <ToggleRight className="w-5 h-5 text-green-600" /> Active
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1">
                            <ToggleLeft className="w-5 h-5 text-gray-400" /> Disabled
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(category)}
                        className="p-1.5 text-gray-600 hover:text-[#8C4A27] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-gray-100">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-gray-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Brownies"
                  value={formData.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
                  })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">URL Slug</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. brownies"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27] font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Short description for collection banner..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
                />
              </div>

              {/* Banner Image Upload */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Banner Image</label>
                <div className="flex items-center gap-3">
                  {formData.image_url ? (
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingImage ? 'Uploading...' : 'Upload to Supabase'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-medium text-gray-700">Enable Category</span>
                <input 
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#8C4A27] rounded border-gray-300 focus:ring-[#8C4A27] cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
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
                  {editingCategory ? 'Update Category' : 'Save to Supabase'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const initialCategories: Category[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Brownies', slug: 'brownies', description: 'Handcrafted brownies baked fresh with premium Belgian chocolate.', image_url: '/images/home_brownies.jpg', is_active: true },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Frames', slug: 'frames', description: 'Beautifully crafted frames to hold your most cherished memories.', image_url: '/images/home_frames.jpg', is_active: true },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Gifts', slug: 'gifts', description: 'Thoughtful gifts for every occasion, beautifully packed with love.', image_url: '/images/home_gifts.jpg', is_active: true },
];
