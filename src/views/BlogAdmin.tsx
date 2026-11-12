import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export default function BlogAdmin() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, user } = useSelector((state: RootState) => state.auth);

  // Form states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Active form data
  const [formId, setFormId] = useState('');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Style');
  const [author, setAuthor] = useState('Arihant Luxe Editorial');
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileBase64, setImageFileBase64] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate('/login');
    }
  }, [isInitialized, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
    }
  }, [isAuthenticated]);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await getBlogPosts();
      setPosts(data);
    } catch (err) {
      console.error('Error loading posts in admin:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle local image file uploads and convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Limit base64 size to avoid Firestore document limits (max 1MB for safety)
    if (file.size > 1.2 * 1024 * 1024) {
      setUploadError('Image is too large. Please select an image under 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageFileBase64(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = (post: BlogPost) => {
    setFormId(post.id);
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setCategory(post.category);
    setAuthor(post.author);

    // Check if current image is a data url
    if (post.image.startsWith('data:')) {
      setImageType('upload');
      setImageFileBase64(post.image);
      setImageUrl('');
    } else {
      setImageType('url');
      setImageUrl(post.image);
      setImageFileBase64('');
    }

    setIsEditing(true);
  };

  const handleCreateNewClick = () => {
    setFormId('');
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory('Style');
    setAuthor(user?.fullName || 'Arihant Luxe Editorial');
    setImageType('url');
    setImageUrl('');
    setImageFileBase64('');
    setUploadError('');
    setIsEditing(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteBlogPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete post. Please try again.');
      console.error(err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !excerpt || !content) {
      alert('Please fill out all required fields.');
      return;
    }

    const finalImage = imageType === 'url' ? imageUrl : imageFileBase64;
    if (!finalImage) {
      alert('Please specify an article cover image.');
      return;
    }

    setSubmitLoading(true);

    // Auto generate slug from title if we are creating a new post
    const slug = formId || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const postData: Omit<BlogPost, 'createdAt'> & { createdAt?: number } = {
      id: slug,
      title,
      excerpt,
      content,
      category,
      author,
      image: finalImage,
      publishDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      createdAt: formId ? posts.find(p => p.id === formId)?.createdAt : Date.now()
    };

    try {
      await createOrUpdateBlogPost(postData);
      setIsEditing(false);
      loadPosts();
    } catch (err) {
      alert('Failed to save article to Firestore. Check console for details.');
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="blog-admin-page">
      <header className="admin-header">
        <div>
          <h1 className="admin-header__title serif">Journal Editor Workspace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Logged in as {user?.fullName || 'Administrator'}
          </p>
        </div>
        {!isEditing && (
          <button className="admin-btn" onClick={handleCreateNewClick}>
            + Write Article
          </button>
        )}
      </header>

      {isEditing ? (
        <div className="admin-form-container">
          <h2 className="admin-form-title serif">{formId ? 'Edit Article' : 'New Journal Entry'}</h2>

          <form onSubmit={handleFormSubmit}>
            <div className="admin-form-group">
              <label className="admin-form-label">Article Title *</label>
              <input
                className="admin-input"
                type="text"
                placeholder="Enter a compelling title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Category</label>
              <select className="admin-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Style">Style</option>
                <option value="Sustainability">Sustainability</option>
                <option value="Craftsmanship">Craftsmanship</option>
                <option value="Editorial">Editorial</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Author Name</label>
              <input
                className="admin-input"
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Cover Image *</label>
              <div className="admin-input-toggle">
                <button
                  type="button"
                  className={`admin-toggle-btn ${imageType === 'url' ? 'active' : ''}`}
                  onClick={() => setImageType('url')}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  className={`admin-toggle-btn ${imageType === 'upload' ? 'active' : ''}`}
                  onClick={() => setImageType('upload')}
                >
                  Upload File
                </button>
              </div>

              {imageType === 'url' ? (
                <input
                  className="admin-input"
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                />
              ) : (
                <div>
                  <label className="admin-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <p>Click to select a local image (JPEG, PNG, WEBP, max 1MB)</p>
                  </label>
                  {uploadError && (
                    <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.5rem' }}>{uploadError}</p>
                  )}
                </div>
              )}

              {/* Cover Image Preview */}
              {(imageType === 'url' && imageUrl) && (
                <div className="admin-preview-container">
                  <img src={imageUrl} alt="Preview" className="admin-preview-img" onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1594736297302-01768cbd3a42?w=800';
                  }} />
                </div>
              )}
              {(imageType === 'upload' && imageFileBase64) && (
                <div className="admin-preview-container">
                  <img src={imageFileBase64} alt="Preview" className="admin-preview-img" />
                  <button
                    type="button"
                    className="admin-preview-remove"
                    onClick={() => setImageFileBase64('')}
                  >
                    Clear Image
                  </button>
                </div>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Short Excerpt *</label>
              <textarea
                className="admin-textarea"
                rows={3}
                placeholder="Write a brief, engaging summary of the article..."
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Article Body Content * (supports HTML & multiple images)</label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Tip: You can write HTML tags directly to structure your post and insert multiple images (e.g. <code>&lt;img src="..." /&gt;</code>). Plain text is also supported and will be formatted automatically.
              </p>
              <textarea
                className="admin-textarea"
                rows={12}
                placeholder="Write your article body here. E.g. <p>Paragraph</p> <img src='https://unsplash...' />"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-actions">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setIsEditing(false)}
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button type="submit" className="admin-btn" disabled={submitLoading}>
                {submitLoading ? 'Saving...' : 'Publish Article'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p className="serif" style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Fetching articles...</p>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem 2rem', border: '1px solid var(--border)', background: 'white' }}>
              <p className="serif" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                There are no articles in the Arihant Luxe journal yet.
              </p>
              <button className="admin-btn" onClick={handleCreateNewClick}>
                Write Your First Post
              </button>
            </div>
          ) : (
            <div className="blog-admin-table-wrap">
              <table className="blog-admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Cover</th>
                    <th>Article details</th>
                    <th>Category</th>
                    <th>Published</th>
                    <th style={{ width: '180px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id}>
                      <td>
                        <img src={post.image} alt="" className="admin-table-thumb" onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1594736297302-01768cbd3a42?w=100';
                        }} />
                      </td>
                      <td>
                        <div className="admin-table-title">{post.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          By {post.author} • Slug: {post.id}
                        </div>
                      </td>
                      <td>
                        <span className="admin-table-category">{post.category}</span>
                      </td>
                      <td>
                        <span className="admin-table-date">{post.publishDate}</span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="admin-btn admin-btn--secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}
                            onClick={() => handleEditClick(post)}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-btn admin-btn--danger"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}
                            onClick={() => handleDeleteClick(post.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link to="/journal" style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', borderBottom: '1px solid var(--text-muted)', paddingBottom: '0.2rem' }}>
              ← Return to Public Journal View
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
