import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, X, Send, AlertCircle, CheckCircle, Edit, DollarSign, Image as ImageIcon } from 'lucide-react';

const Products = ({ authHeaders, ADMIN_API }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [productForm, setProductForm] = useState({ 
    title: '', 
    description: '', 
    price: 0, 
    originalPrice: 0,
    image: '',
    badge: '',
    inStock: true,
    isActive: true
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${ADMIN_API}/products`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductForm({ 
      title: '', 
      description: '', 
      price: 0, 
      originalPrice: 0,
      image: '',
      badge: '',
      inStock: true,
      isActive: true
    });
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!productForm.title.trim()) return setError('Title is required');
    if (!productForm.image.trim()) return setError('Image URL is required');
    if (productForm.price < 0) return setError('Price cannot be negative');

    try {
      const url = isEditing ? `${ADMIN_API}/products/${editingId}` : `${ADMIN_API}/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });

      if (res.ok) {
        setSuccess(`Product ${isEditing ? 'updated' : 'added'} successfully!`);
        setTimeout(() => resetForm(), 1500);
        fetchProducts();
      } else {
        const data = await res.json();
        setError(data.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const handleEdit = (product) => {
    setProductForm({
      title: product.title || '',
      description: product.description || '',
      price: product.price || 0,
      originalPrice: product.originalPrice || 0,
      image: product.image || '',
      badge: product.badge || '',
      inStock: product.inStock,
      isActive: product.isActive
    });
    setEditingId(product._id);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`${ADMIN_API}/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Product Management</h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">Create and manage products for the frontend Cart page.</p>
        </div>
        <button
          onClick={() => isAdding || isEditing ? resetForm() : setIsAdding(true)}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black shadow-xl transition-all w-full sm:w-auto active:scale-95 ${
            isAdding || isEditing
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
          }`}
        >
          {isAdding || isEditing ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding || isEditing ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl" />
          
          <form onSubmit={handleCreateOrUpdate} className="space-y-6 relative z-10">
            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Product Title</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                placeholder="Product Name..."
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Sale Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Original Price (Strike-through)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    value={productForm.originalPrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Image URL</label>
              <div className="relative">
                 <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-5 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                  placeholder="https://example.com/image.jpg"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Badge Text (e.g. HOT, -50%)</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                  placeholder="Leave empty for no badge"
                  value={productForm.badge}
                  onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 mt-8">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="w-5 h-5 bg-slate-950 border-slate-800 rounded text-indigo-600 focus:ring-indigo-500/50"
                  />
                  <label htmlFor="inStock" className="text-white font-medium">In Stock</label>
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={productForm.isActive}
                    onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                    className="w-5 h-5 bg-slate-950 border-slate-800 rounded text-indigo-600 focus:ring-indigo-500/50"
                  />
                  <label htmlFor="isActive" className="text-white font-medium">Active (Visible)</label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-black uppercase tracking-widest mb-3 ml-1">Description (Optional)</label>
              <textarea
                className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[120px] transition-all text-base leading-relaxed placeholder:text-slate-600"
                placeholder="Product description... (optional)"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-sm font-bold flex items-center gap-3 animate-fade-in">
                <CheckCircle className="w-5 h-5 shrink-0" /> {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              {isEditing ? 'Update Product' : 'Add Product'}
            </button>
          </form>
        </div>
      )}

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] animate-pulse" />
          ))
        ) : (
          products.map(product => (
            <div
              key={product._id}
              className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/50 transition-all group flex flex-col relative"
            >
              {product.badge && (
                <div className="absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider z-10 shadow-lg">
                  {product.badge}
                </div>
              )}
              
              <div className="h-48 bg-slate-950 p-6 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <img 
                  src={product.image || 'https://via.placeholder.com/300?text=No+Image'} 
                  alt={product.title} 
                  className="w-full h-full object-contain drop-shadow-2xl z-10"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Error'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-0" />
              </div>
              
              <div className="p-6 flex-1 flex flex-col relative z-20 bg-slate-900">
                <div className="flex justify-between items-start gap-3">
                  <h3 className="text-lg font-black text-white leading-tight flex-1">
                    {product.title}
                  </h3>
                </div>
                
                <div className="mt-3 flex items-end gap-3 mb-4">
                  <div className="flex items-center text-emerald-400 font-black text-2xl">
                    <span className="text-lg mr-0.5">৳</span>{product.price}
                  </div>
                  {product.originalPrice > 0 && product.originalPrice > product.price && (
                    <div className="text-slate-500 font-bold decoration-rose-500/50 decoration-2 line-through text-sm flex items-center mb-1">
                      <span className="text-xs mr-0.5">৳</span>{product.originalPrice}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${product.inStock ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${product.isActive ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    {product.isActive ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-sm tracking-wide hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-sm tracking-wide hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && products.length === 0 && (
        <div className="py-24 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] animate-fade-in">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-600">
            <Package className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">No products found</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">Start by adding your first product to the Cart page.</p>
        </div>
      )}
    </div>
  );
};

export default Products;
