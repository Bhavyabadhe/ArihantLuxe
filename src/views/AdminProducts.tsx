import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface ProductItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  images?: string[];
  badge?: string;
  stock: number;
  createdAt: string;
}

const PRESET_CATEGORIES = ['Jewellery', 'Fashion', 'Clothing', 'Accessories'];
const PRESET_BADGES = ['', 'New Arrival', 'Exclusive', 'Bestseller', 'Handcrafted', 'Limited Edition'];

export default function AdminProducts() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Jewellery');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Status message
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      showFeedback('Could not fetch products from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Convert uploaded files to Data URL (Base64) for instant display & persistence
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be picked again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setImages((prev) => {
      const item = prev[indexToPrimary];
      const rest = prev.filter((_, idx) => idx !== indexToPrimary);
      return [item, ...rest];
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Jewellery');
    setCustomCategory('');
    setPrice('');
    setStock('10');
    setBadge('');
    setDescription('');
    setImages([]);
    setImageUrlInput('');
  };

  const handleEditClick = (p: ProductItem) => {
    setEditingId(p.id);
    setName(p.name);
    if (PRESET_CATEGORIES.includes(p.category)) {
      setCategory(p.category);
      setCustomCategory('');
    } else {
      setCategory('Custom');
      setCustomCategory(p.category);
    }
    setPrice(String(p.price));
    setStock(String(p.stock));
    setBadge(p.badge || '');
    setDescription(p.description || '');

    // Resolve images
    const prodImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : p.image ? [p.image] : [];
    setImages(prodImages);

    // Scroll to form
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: number, prodName: string) => {
    if (!confirm(`Are you sure you want to delete "${prodName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showFeedback(`Product "${prodName}" deleted successfully.`, 'success');
      if (editingId === id) resetForm();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      showFeedback('Failed to delete product from database.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showFeedback('Please enter a product name.', 'error');
      return;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      showFeedback('Please enter a valid price.', 'error');
      return;
    }

    const finalCategory = category === 'Custom' ? customCategory.trim() || 'General' : category;

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      category: finalCategory,
      price: parseFloat(price),
      stock: parseInt(stock, 10) || 0,
      badge: badge.trim() || null,
      description: description.trim(),
      image: images[0] || null,
      images: images,
    };

    try {
      if (editingId) {
        // Update product
        const res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Update failed');
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        showFeedback(`Product "${name}" updated successfully!`, 'success');
        resetForm();
      } else {
        // Create new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Creation failed');
        const created = await res.json();
        setProducts((prev) => [created, ...prev]);
        showFeedback(`Product "${name}" published to store successfully!`, 'success');
        resetForm();
      }
    } catch (err: any) {
      console.error('Error submitting product:', err);
      showFeedback('Failed to save product to database. Check connection.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products for listing
  const filteredProducts = products.filter((p) => {
    const matchCat =
      selectedCategoryFilter === 'All' ||
      p.category?.toLowerCase() === selectedCategoryFilter.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="admin-page" style={{ maxWidth: '1240px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: 600 }}>
            Store Management
          </span>
          <h1 className="serif" style={{ fontSize: '2.5rem', margin: '0.25rem 0' }}>
            Product Catalog Manager
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Upload, manage, and update luxury pieces in your PostgreSQL store catalog.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link
            to="/journal/admin"
            className="hero-btn"
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            Blog Articles
          </Link>
          <Link
            to="/"
            className="hero-btn"
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}
          >
            View Live Store
          </Link>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '4px',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: feedback.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{feedback.type === 'success' ? '✓ ' : '✕ '}{feedback.message}</span>
          <button onClick={() => setFeedback(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Grid Layout: Upload Form (Left) & Existing Inventory (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 480px) 1fr', gap: '3rem', alignItems: 'start' }}>
        
        {/* Upload / Edit Form */}
        <div ref={formRef} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2rem', boxShadow: 'var(--shadow-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h2 className="serif" style={{ fontSize: '1.6rem', margin: 0 }}>
              {editingId ? 'Edit Product Piece' : 'Upload New Product'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{ fontSize: '0.75rem', background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                + New Product
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Product Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.4rem' }}>
                Product Title <span style={{ color: '#b91c1c' }}>*</span>
              </label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. Royal Heritage Kundan Choker"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Category & Badge */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Category <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <select
                  className="auth-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ background: 'var(--surface)' }}
                >
                  {PRESET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="Custom">+ Other (Type below)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Badge / Tag (Optional)
                </label>
                <select
                  className="auth-input"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  style={{ background: 'var(--surface)' }}
                >
                  {PRESET_BADGES.map((b) => (
                    <option key={b} value={b}>{b || 'None'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Category input if chosen */}
            {category === 'Custom' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Custom Category Name
                </label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Bridal Sets, Rings, Footwear"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}

            {/* Price & Stock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Price (Rs.) <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="auth-input"
                  placeholder="e.g. 1111.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  className="auth-input"
                  placeholder="e.g. 15"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.4rem' }}>
                Description
              </label>
              <textarea
                className="auth-input"
                rows={4}
                placeholder="Describe the craftsmanship, materials, dimensions, or styling notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Product Images Uploader */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.4rem' }}>
                Product Photos ({images.length} added)
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Upload images from your device or paste web URLs. The first image will be used as the cover.
              </p>

              {/* File Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: '6px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-alt)',
                  marginBottom: '1rem',
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>📸</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                  Click to select photos from device
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Supports multiple JPG, PNG, WEBP images
                </span>
              </div>

              {/* Paste URL Option */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="url"
                  className="auth-input"
                  placeholder="Or paste an image URL..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  style={{ fontSize: '0.8rem' }}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--text)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  + Add URL
                </button>
              </div>

              {/* Images Preview Grid */}
              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {images.map((img, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        border: index === 0 ? '2px solid var(--accent)' : '1px solid var(--border)',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      {index === 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '2px',
                          left: '2px',
                          background: 'var(--accent)',
                          color: '#fff',
                          fontSize: '0.6rem',
                          padding: '1px 4px',
                          borderRadius: '2px',
                          fontWeight: 'bold',
                        }}>
                          COVER
                        </span>
                      )}

                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                      >
                        {index !== 0 && (
                          <button
                            type="button"
                            title="Make Cover Image"
                            onClick={() => handleSetPrimaryImage(index)}
                            style={{ background: '#ffffff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.7rem' }}
                          >
                            ⭐
                          </button>
                        )}
                        <button
                          type="button"
                          title="Remove Image"
                          onClick={() => handleRemoveImage(index)}
                          style={{ background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.7rem' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={submitting}
                className="hero-btn"
                style={{
                  flex: 1,
                  padding: '1rem',
                  fontSize: '0.85rem',
                  letterSpacing: '0.15em',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Saving to Database...' : editingId ? 'Update Product' : 'Publish Product to Store'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '1rem',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Inventory List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 className="serif" style={{ fontSize: '1.8rem', margin: 0 }}>
              Live Store Products ({products.length})
            </h2>

            {/* Search Input */}
            <input
              type="text"
              className="search-input"
              placeholder="Search by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: '220px', padding: '0.5rem 1rem' }}
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {['All', 'Jewellery', 'Fashion', 'Clothing', 'Accessories'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  border: selectedCategoryFilter === cat ? '1px solid var(--text)' : '1px solid var(--border)',
                  background: selectedCategoryFilter === cat ? 'var(--text)' : 'transparent',
                  color: selectedCategoryFilter === cat ? '#fff' : 'var(--text)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Loading catalog from PostgreSQL...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No products found matching your search.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredProducts.map((p) => {
                const cover = p.image || (Array.isArray(p.images) && p.images[0]) || 'https://placehold.co/100x100/png';
                const imageCount = Array.isArray(p.images) ? p.images.length : p.image ? 1 : 0;

                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      background: 'var(--surface)',
                      padding: '1rem 1.25rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ width: '64px', height: '76px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'var(--bg-alt)' }}>
                      <img src={cover} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {imageCount > 1 && (
                        <span style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: '0.6rem',
                          padding: '1px 4px',
                          borderRadius: '2px',
                        }}>
                          +{imageCount - 1}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)', fontWeight: 600 }}>
                          {p.category}
                        </span>
                        {p.badge && (
                          <span style={{ fontSize: '0.65rem', background: 'var(--bg-alt)', border: '1px solid var(--border)', padding: '1px 6px', borderRadius: '10px' }}>
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <h4 className="serif" style={{ fontSize: '1.15rem', margin: '0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                        <strong style={{ color: 'var(--text)' }}>Rs.{Number(p.price).toFixed(2)}</strong>
                        <span style={{ color: p.stock > 0 ? '#166534' : '#991b1b', fontSize: '0.75rem' }}>
                          {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <Link
                        to={`/product/${p.slug || p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="View Live Page"
                        style={{
                          padding: '0.45rem 0.8rem',
                          fontSize: '0.75rem',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          color: 'var(--text)',
                          background: 'var(--bg-alt)',
                        }}
                      >
                        View
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleEditClick(p)}
                        title="Edit Piece"
                        style={{
                          padding: '0.45rem 0.8rem',
                          fontSize: '0.75rem',
                          border: '1px solid var(--text)',
                          background: 'var(--text)',
                          color: '#fff',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        title="Delete Piece"
                        style={{
                          padding: '0.45rem 0.6rem',
                          fontSize: '0.75rem',
                          border: '1px solid #fecaca',
                          background: '#fef2f2',
                          color: '#b91c1c',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
