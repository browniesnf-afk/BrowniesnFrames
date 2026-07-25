import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Loader2, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle,
  PackageCheck,
  Database,
  Filter,
  Tag
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  badge?: string | null;
  images: string[];
  sizes?: string[];
  created_at?: string;
}

const DEFAULT_FRAME_SIZES = ['6 x 6 inch', '8 x 8 inch', '10 x 10 inch', '12 x 12 inch'];

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [seeding, setSeeding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '50',
    category: 'brownies',
    badge: '',
    images: [] as string[],
    sizes: [] as string[]
  });
  const [newSizeInput, setNewSizeInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Seed All Sample Products into Supabase Table
  const handleSeedDatabase = async () => {
    setSeeding(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const seedItems = mockProducts.map(p => ({
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: p.category,
        badge: p.badge || null,
        images: p.images,
        sizes: p.sizes || null
      }));

      const { error } = await supabase
        .from('products')
        .insert(seedItems);

      if (error) throw error;

      setSuccessMsg('Successfully seeded sample products into your Supabase database!');
      fetchProducts();
    } catch (err: any) {
      setError('Seeding Error: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  // Multiple Image Upload to Supabase Storage
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError(null);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError('Image upload failed: ' + (err.message || 'Make sure storage bucket "products" exists in Supabase.'));
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Size Variants Management
  const addSizeVariant = () => {
    if (!newSizeInput.trim()) return;
    if (formData.sizes.includes(newSizeInput.trim())) return;
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, newSizeInput.trim()]
    }));
    setNewSizeInput('');
  };

  const removeSizeVariant = (sizeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== sizeToRemove)
    }));
  };

  // Handle Form Submit (Add/Edit Product)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const productImages = formData.images.length > 0 
      ? formData.images 
      : ['/images/home_brownies.jpg'];

    const productPayload = {
      title: formData.title,
      slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      badge: formData.badge || null,
      images: productImages,
      sizes: formData.sizes.length > 0 ? formData.sizes : null
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);

        if (error) {
          console.warn('Initial product update error, retrying without extended columns:', error.message);
          // If metadata or optional columns are missing, retry with core fields only
          const { metadata, is_active, is_featured, ...corePayload }: any = productPayload;
          const { error: retryErr } = await supabase
            .from('products')
            .update(corePayload)
            .eq('id', editingProduct.id);
          if (retryErr) throw retryErr;
        }
        setSuccessMsg('Product updated successfully in Supabase!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productPayload]);

        if (error) {
          console.warn('Initial product insert error, retrying without extended columns:', error.message);
          const { metadata, is_active, is_featured, ...corePayload }: any = productPayload;
          const { error: retryErr } = await supabase
            .from('products')
            .insert([corePayload]);
          if (retryErr) throw retryErr;
        }
        setSuccessMsg('Product created successfully in Supabase!');
      }

      setIsModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      console.error('Save error:', err);
      setError('Supabase Save Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      setSuccessMsg('Product deleted successfully!');
    } catch (err: any) {
      alert('Failed to delete product: ' + err.message);
    }
  };

  const openAddModal = () => {
    resetForm();
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock?.toString() || '50',
      category: product.category,
      badge: product.badge || '',
      images: product.images || [],
      sizes: product.sizes || (product.category === 'frames' ? DEFAULT_FRAME_SIZES : [])
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      stock: '50',
      category: 'brownies',
      badge: '',
      images: [],
      sizes: []
    });
    setNewSizeInput('');
    setError(null);
  };

  // Filter Logic (Search Title + Category Filter + Stock Status Filter)
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    
    let matchesStock = true;
    const stockVal = p.stock ?? 50;
    if (stockFilter === 'in_stock') matchesStock = stockVal >= 10;
    if (stockFilter === 'low_stock') matchesStock = stockVal > 0 && stockVal < 10;
    if (stockFilter === 'out_of_stock') matchesStock = stockVal === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Product Manager</h1>
          <p className="text-xs text-gray-500">Manage catalog, pricing, inventory, frame size variants, and galleries in Supabase.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            Seed Supabase DB
          </button>
          <button 
            onClick={openAddModal}
            className="bg-[#8C4A27] hover:bg-[#733c21] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
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

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27] focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#8C4A27]"
            >
              <option value="all">All Categories</option>
              <option value="brownies">Brownies</option>
              <option value="frames">Frames</option>
              <option value="gifts">Gifts</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Stock:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#8C4A27]"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock (&ge;10)</option>
              <option value="low_stock">Low Stock (1-9)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          <span className="text-xs text-gray-500 font-medium pl-2">{filteredProducts.length} Products</span>
        </div>

      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#8C4A27] mb-2" />
            <span className="text-xs">Loading products from Supabase...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <PackageCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-sm">No products match your filters</p>
            <p className="text-xs text-gray-400">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-[10px] font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Sizes / Variants</th>
                  <th className="p-4">Badge</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img 
                        src={product.images?.[0] || '/images/home_brownies.jpg'} 
                        alt={product.title} 
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{product.title}</p>
                        <p className="text-[10px] text-gray-400 line-clamp-1">{product.description}</p>
                      </div>
                    </td>
                    <td className="p-4 capitalize">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">₹{product.price}</td>
                    <td className="p-4 font-medium">
                      {(product.stock ?? 50) === 0 ? (
                        <span className="text-red-600 font-bold">Out of stock</span>
                      ) : (product.stock ?? 50) < 10 ? (
                        <span className="text-amber-600 font-bold">{product.stock} left (Low)</span>
                      ) : (
                        <span className="text-green-600">{product.stock ?? 50} units</span>
                      )}
                    </td>
                    <td className="p-4">
                      {product.sizes && product.sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {product.sizes.map((s, idx) => (
                            <span key={idx} className="bg-amber-50 text-[#8C4A27] border border-amber-200/60 text-[9px] font-medium px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-[10px]">Standard</span>
                      )}
                    </td>
                    <td className="p-4">
                      {product.badge ? (
                        <span className="bg-[#8C4A27]/10 text-[#8C4A27] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {product.badge}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-1.5 text-gray-600 hover:text-[#8C4A27] hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
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
              
              <div>
                <label className="block font-medium text-gray-700 mb-1">Product Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Classic Collage Frame"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        category: newCat,
                        sizes: newCat === 'frames' && prev.sizes.length === 0 ? DEFAULT_FRAME_SIZES : prev.sizes
                      }));
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
                  >
                    <option value="brownies">Brownies</option>
                    <option value="frames">Frames</option>
                    <option value="gifts">Gifts</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="799"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    placeholder="50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Badge Tag (Optional)</label>
                  <select 
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
                  >
                    <option value="">None</option>
                    <option value="BESTSELLER">BESTSELLER</option>
                    <option value="NEW">NEW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Short description for product card..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27]"
                />
              </div>

              {/* Size Variants Manager (For Frames & products needing size options) */}
              <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#8C4A27]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#8C4A27]" /> Size Variants
                  </label>
                  <span className="text-[10px] text-gray-500">
                    {formData.sizes.length} variants configured
                  </span>
                </div>

                {/* Size Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {formData.sizes.map((size, idx) => (
                    <span 
                      key={idx} 
                      className="bg-white border border-[#8C4A27]/30 text-[#8C4A27] text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSizeVariant(size)}
                        className="hover:text-red-600 p-0.5 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {formData.sizes.length === 0 && (
                    <span className="text-gray-400 text-[11px]">No custom sizes added. (Will use standard sizing).</span>
                  )}
                </div>

                {/* Add Size Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="e.g. 14 x 14 inch or Large"
                    value={newSizeInput}
                    onChange={(e) => setNewSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSizeVariant();
                      }
                    }}
                    className="flex-1 p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#8C4A27] text-xs"
                  />
                  <button
                    type="button"
                    onClick={addSizeVariant}
                    className="bg-[#8C4A27] text-white px-3 py-2 rounded-lg font-medium text-xs hover:bg-[#733c21] transition-colors cursor-pointer"
                  >
                    + Add Size
                  </button>
                </div>
              </div>

              {/* Multiple Image Upload Gallery */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-gray-700">Product Images Gallery (Multiple Upload)</label>
                  <span className="text-[10px] text-gray-400">{formData.images.length} images added</span>
                </div>

                {/* Thumbnail Preview Grid */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50">
                      <img src={img} alt={`Product ${idx+1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-[#8C4A27] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-colors border border-dashed border-gray-300">
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-[#8C4A27]" /> : <Upload className="w-4 h-4 text-[#8C4A27]" />}
                  {uploadingImage ? 'Uploading to Supabase Storage...' : 'Upload Images (Select 1 or Multiple Files)'}
                  <input type="file" multiple accept="image/*" onChange={handleMultipleImageUpload} className="hidden" />
                </label>
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
                  {editingProduct ? 'Update Product' : 'Save to Supabase'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const mockProducts: Product[] = [
  { id: '1', title: 'Belgian Chocolate Brownie', slug: 'belgian-chocolate-brownie', description: 'Rich, fudgy & decadent chocolate brownie.', price: 399, stock: 50, category: 'brownies', badge: 'BESTSELLER', images: ['/images/brownie_belgian.jpg', '/images/home_brownies.jpg'] },
  { id: '2', title: 'Walnut Brownie', slug: 'walnut-brownie', description: 'Crunchy walnuts with rich chocolate brownie.', price: 449, stock: 42, category: 'brownies', badge: 'NEW', images: ['/images/brownie_walnut.jpg', '/images/home_brownies.jpg'] },
  { id: '3', title: 'Nutella Brownie', slug: 'nutella-brownie', description: 'Gooey Nutella swirl in every bite.', price: 499, stock: 35, category: 'brownies', badge: null, images: ['/images/brownie_nutella.jpg', '/images/home_brownies.jpg'] },
  { id: '4', title: 'Biscoff Brownie', slug: 'biscoff-brownie', description: 'Biscoff spread with crunchy biscoff crumbs.', price: 449, stock: 30, category: 'brownies', badge: null, images: ['/images/brownie_biscoff.jpg', '/images/home_brownies.jpg'] },
  { id: '5', title: 'Classic Collage Frame', slug: 'classic-collage-frame', description: 'Elegant wooden collage frame.', price: 799, stock: 25, category: 'frames', badge: 'BESTSELLER', images: ['/images/frame_classic.jpg', '/images/home_frames.jpg'], sizes: DEFAULT_FRAME_SIZES },
  { id: '6', title: 'Minimal Wooden Frame', slug: 'minimal-wooden-frame', description: 'Simple, natural & perfect for any space.', price: 599, stock: 20, category: 'frames', badge: 'NEW', images: ['/images/frame_minimal.jpg', '/images/home_frames.jpg'], sizes: DEFAULT_FRAME_SIZES },
  { id: '7', title: 'Black Border Frame', slug: 'black-border-frame', description: 'Modern black frame with a premium matte finish.', price: 549, stock: 8, category: 'frames', badge: null, images: ['/images/frame_black.jpg', '/images/home_frames.jpg'], sizes: DEFAULT_FRAME_SIZES },
  { id: '8', title: 'Memories Collage Frame', slug: 'memories-collage-frame', description: 'Multiple memories, one beautiful frame.', price: 899, stock: 0, category: 'frames', badge: null, images: ['/images/home_frames.jpg', '/images/frame_memories.jpg'], sizes: DEFAULT_FRAME_SIZES },
  { id: '9', title: 'Premium Gift Hamper', slug: 'premium-gift-hamper', description: 'Luxury hamper with brownies & mug.', price: 1299, stock: 15, category: 'gifts', badge: 'BESTSELLER', images: ['/images/home_gifts.jpg', '/images/gift_luxury.jpg'] },
  { id: '10', title: 'Luxury Gift Box', slug: 'luxury-gift-box', description: 'Elegant gift box filled with delights.', price: 1099, stock: 5, category: 'gifts', badge: 'NEW', images: ['/images/gift_luxury.jpg', '/images/home_gifts.jpg'] },
  { id: '11', title: 'Brownie Gift Box', slug: 'brownie-gift-box', description: 'Delicious brownies in a gift box.', price: 899, stock: 22, category: 'gifts', badge: null, images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'] },
  { id: '12', title: 'Brownie Bouquet', slug: 'brownie-bouquet', description: 'A unique bouquet made of rich brownies.', price: 1199, stock: 0, category: 'gifts', badge: 'NEW', images: ['https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop'] },
];
