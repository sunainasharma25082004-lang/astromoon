import { useState } from 'react';
import { ShoppingBag, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  category: 'Gemstones',
  short_description: '',
  description: '',
  price: '',
  original_price: '',
  stock: '50',
  images: '',
  is_active: true,
};

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    if (!token) return;
    apiFetch('/products/admin/all', {}, token)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useRealtimeData(load, 'orders', [token]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setModal('create');
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      category: p.category || 'Gemstones',
      short_description: p.short_description || '',
      description: p.description || '',
      price: String(p.price ?? ''),
      original_price: p.original_price ? String(p.original_price) : '',
      stock: String(p.stock ?? 50),
      images: (p.images || []).join('\n'),
      is_active: p.is_active !== false,
    });
    setModal('edit');
  };

  const save = async () => {
    if (!form.name || !form.price) {
      toast.error('Name and price required');
      return;
    }
    const body = {
      name: form.name,
      category: form.category,
      short_description: form.short_description,
      description: form.description,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : undefined,
      stock: Number(form.stock),
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      is_active: form.is_active,
    };
    try {
      if (modal === 'edit' && editing) {
        await apiFetch(`/products/${editing._id}`, { method: 'PATCH', body: JSON.stringify(body) }, token);
        toast.success('Product updated');
      } else {
        await apiFetch('/products', { method: 'POST', body: JSON.stringify(body) }, token);
        toast.success('Product added');
      }
      setModal(null);
      load();
    } catch {
      toast.error('Failed to save product');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Deactivate this product?')) return;
    await apiFetch(`/products/${id}`, { method: 'DELETE' }, token);
    toast.success('Product removed');
    load();
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 text-amber-400 rounded-xl flex items-center justify-center border border-slate-700">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Shop Products</h1>
            <p className="text-slate-400 text-sm">{products.length} products — upload & manage from here</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 text-sm bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-xl text-white font-medium">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No products yet. Add your first product above.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {products.map((p: any) => (
              <div key={p._id} className="p-4 flex items-center gap-4">
                <img
                  src={p.images?.[0] || 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=80'}
                  alt={p.name}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.category} • ₹{p.price} • Stock: {p.stock}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(p._id)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">{modal === 'create' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-slate-800 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Product Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
                    {['Gemstones', 'Rudraksha', 'Yantras', 'Puja Items', 'Books', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Original Price (₹)</label>
                  <input type="number" value={form.original_price} onChange={e => setForm({ ...form, original_price: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Short Description</label>
                <input value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Full Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Image URLs (one per line)</label>
                <textarea rows={2} value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} placeholder="https://..." className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white resize-none" />
              </div>
              {modal === 'edit' && (
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  Active on shop
                </label>
              )}
            </div>
            <div className="p-5 border-t border-slate-800 flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium">Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}