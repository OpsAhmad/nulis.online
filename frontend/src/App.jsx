import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, getToken, clearAuth, getSavedUser, saveAuth } from './api';

// --- SVGS ---
const LogoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
);
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const ExternalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);

// --- HELPER COMPONENT: Typographic Avatar ---
const Avatar = ({ name, size = 40 }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '4px',
      backgroundColor: '#f4f4f5',
      border: '1px solid #e4e4e7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 'bold',
      fontSize: `${size * 0.45}px`,
      color: '#000000',
      userSelect: 'none',
    }}>
      {initial}
    </div>
  );
};

// --- BASE LAYOUT: NAVIGATION HEADER ---
const NavHeader = ({ user, onLogout }) => {
  return (
    <header className="nav-header">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          NULIS<span>.online</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Explore</Link>
          {user && <Link to="/following">Following</Link>}
          {user ? (
            <>
              <Link to="/write" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '11px', height: 'auto', marginLeft: '0.5rem' }}>
                Write
              </Link>
              <Link to={`/${user.username}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                <Avatar name={user.name} size={24} />
                <span>Me</span>
              </Link>
              <button onClick={onLogout} style={{ opacity: 0.6, fontSize: 'var(--font-size-sm)' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '11px', height: 'auto' }}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

// --- PAGE: EXPLORE FEED ---
const ExplorePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArticles() {
      const { data, error } = await api.getArticles();
      if (error) {
        setError(error);
      } else {
        setArticles(data.data || []);
      }
      setLoading(false);
    }
    fetchArticles();
  }, []);

  if (loading) {
    return <div className="main-content technical-mono">Retrieving latest articles...</div>;
  }

  if (error) {
    return <div className="main-content technical-mono" style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <main className="main-content scroll-reveal">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ letterSpacing: '-0.04em', fontWeight: '800' }}>Explore</h1>
        <p className="technical-mono" style={{ marginTop: '0.25rem' }}>Latest editorial articles written around the globe</p>
      </div>
      
      <hr />

      {articles.length === 0 ? (
        <p className="technical-mono">No articles published yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {articles.map((article, idx) => (
            <article key={article.id} className={`article-card scroll-reveal delay-${(idx % 3) + 1}`}>
              <div className="article-meta">
                <Link to={`/${article.user.username}`} className="article-author" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Avatar name={article.user.name} size={18} />
                  <span>{article.user.name}</span>
                </Link>
                <span className="technical-mono">•</span>
                <span className="technical-mono">{new Date(article.created_at).toLocaleDateString()}</span>
              </div>
              <h2 className="article-title">
                <Link to={`/article/${article.slug}`}>{article.title}</Link>
              </h2>
              <p className="article-excerpt">{article.excerpt}</p>
              <div className="article-footer">
                <div className="technical-mono" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <EyeIcon /> <span>{article.views_count || 0} views</span>
                </div>
                <Link to={`/article/${article.slug}`} className="technical-mono" style={{ textDecoration: 'underline' }}>Read more &rarr;</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

// --- PAGE: FOLLOWING FEED ---
const FollowingPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFollowingArticles() {
      const { data, error } = await api.getFollowingArticles();
      if (error) {
        setError(error);
      } else {
        setArticles(data.data || []);
      }
      setLoading(false);
    }
    fetchFollowingArticles();
  }, []);

  if (loading) {
    return <div className="main-content technical-mono">Loading followed authors feed...</div>;
  }

  if (error) {
    return <div className="main-content technical-mono" style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <main className="main-content scroll-reveal">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ letterSpacing: '-0.04em', fontWeight: '800' }}>Following</h1>
        <p className="technical-mono" style={{ marginTop: '0.25rem' }}>Articles from writers you are currently following</p>
      </div>

      <hr />

      {articles.length === 0 ? (
        <div style={{ padding: '3rem 0', textAlign: 'center' }}>
          <p className="technical-mono">No articles found from writers you follow.</p>
          <p className="technical-mono" style={{ marginTop: '0.5rem', opacity: 0.7 }}>
            Go to <Link to="/" style={{ textDecoration: 'underline' }}>Explore</Link> to follow some interesting authors.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {articles.map((article, idx) => (
            <article key={article.id} className={`article-card scroll-reveal delay-${(idx % 3) + 1}`}>
              <div className="article-meta">
                <Link to={`/${article.user.username}`} className="article-author" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Avatar name={article.user.name} size={18} />
                  <span>{article.user.name}</span>
                </Link>
                <span className="technical-mono">•</span>
                <span className="technical-mono">{new Date(article.created_at).toLocaleDateString()}</span>
              </div>
              <h2 className="article-title">
                <Link to={`/article/${article.slug}`}>{article.title}</Link>
              </h2>
              <p className="article-excerpt">{article.excerpt}</p>
              <div className="article-footer">
                <div className="technical-mono" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <EyeIcon /> <span>{article.views_count || 0} views</span>
                </div>
                <Link to={`/article/${article.slug}`} className="technical-mono" style={{ textDecoration: 'underline' }}>Read more &rarr;</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

// --- PAGE: ARTICLE DETAIL (WITH TRACKED SHARING) ---
const ArticleDetailPage = ({ currentUser }) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareSource, setShareSource] = useState('link');
  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleDeleteArticle = async () => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    const { error } = await api.deleteArticle(article.id);
    if (error) {
      alert(error);
    } else {
      alert('Article deleted successfully.');
      navigate('/');
    }
  };

  useEffect(() => {
    async function fetchArticle() {
      // Retrieve the source query tracker from browser URL if present
      const sourceVal = searchParams.get('source');
      const { data, error } = await api.getArticle(slug, sourceVal);
      if (error) {
        setError(error);
      } else {
        setArticle(data);
      }
      setLoading(false);
    }
    fetchArticle();
  }, [slug, searchParams]);

  const handlePublishDraft = async () => {
    if (!window.confirm('Are you sure you want to publish this article? It will become public.')) {
      return;
    }
    setPublishing(true);
    const { data, error } = await api.updateArticle(article.id, {
      status: 'published'
    });
    setPublishing(false);
    if (error) {
      alert(error);
    } else {
      setArticle(data);
    }
  };

  if (loading) {
    return <div className="main-content technical-mono">Reading article...</div>;
  }

  if (error || !article) {
    return <div className="main-content technical-mono" style={{ color: 'red' }}>Error: {error || 'Article not found.'}</div>;
  }

  // Helper to generate the exact tracked share URL
  const getTrackedUrl = (source) => {
    return `${window.location.origin}/article/${article.slug}?source=${source}`;
  };

  const copyTrackedLink = (source) => {
    const trackedUrl = getTrackedUrl(source);
    navigator.clipboard.writeText(trackedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="main-content scroll-reveal">
      {article.status === 'draft' && currentUser && currentUser.id === article.user_id && (
        <div style={{
          backgroundColor: 'var(--bg-highlight)',
          border: '1px solid var(--border-thin)',
          borderRadius: '6px',
          padding: '1.25rem',
          maxWidth: '750px',
          margin: '0 auto 2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: '700', color: 'var(--text-heading)', marginBottom: '0.2rem' }}>
              This article is a Draft
            </h3>
            <p className="technical-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Only you can see this page. Click Publish to make it visible to everyone.
            </p>
          </div>
          <button 
            onClick={handlePublishDraft} 
            className="btn-primary" 
            style={{ padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)' }}
            disabled={publishing}
          >
            {publishing ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      )}
      <article style={{ maxWidth: '750px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '800', lineHeight: '1.2', marginBottom: '1.25rem' }}>
            {article.title}
            {article.status === 'draft' && (
              <span style={{
                fontSize: '0.9rem',
                backgroundColor: 'var(--border-thin)',
                color: 'var(--text-muted)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                marginLeft: '0.75rem',
                verticalAlign: 'middle',
                fontWeight: '600'
              }}>Draft</span>
            )}
          </h1>
          
          <div className="article-meta" style={{ 
            paddingBottom: '1.5rem', 
            borderBottom: '1px solid var(--border-thin)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to={`/${article.user.username}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                <Avatar name={article.user.name} size={32} />
                <span>{article.user.name}</span>
              </Link>
              <span className="technical-mono">•</span>
              <span className="technical-mono">{new Date(article.created_at).toLocaleDateString()}</span>
              <span className="technical-mono">•</span>
              <span className="technical-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <EyeIcon /> <span>{article.views_count || 0} views</span>
              </span>
            </div>
            {currentUser && currentUser.id === article.user_id && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Link 
                  to={`/edit/${article.slug}`} 
                  className="btn-secondary" 
                  style={{ 
                    padding: '0.35rem 0.75rem', 
                    fontSize: '11px',
                    height: 'auto',
                    minHeight: 'unset',
                    textTransform: 'none',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <span>Edit</span>
                </Link>
                <button 
                  onClick={handleDeleteArticle} 
                  className="btn-secondary" 
                  style={{ 
                    padding: '0.35rem 0.75rem', 
                    fontSize: '11px',
                    height: 'auto',
                    minHeight: 'unset',
                    textTransform: 'none',
                    borderRadius: '4px',
                    color: '#e03131',
                    borderColor: '#ffc9c9',
                    backgroundColor: '#fff5f5',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffe3e3';
                    e.currentTarget.style.borderColor = '#fa5252';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff5f5';
                    e.currentTarget.style.borderColor = '#ffc9c9';
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div 
          className="article-body-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <hr style={{ margin: '3rem 0 1.5rem' }} />

        {/* Social Share Bar */}
        <footer style={{ backgroundColor: 'var(--bg-highlight)', padding: '1.5rem', borderRadius: '4px', border: '1px solid var(--border-thin)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p className="technical-mono" style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Share Article</p>
              <p className="technical-mono" style={{ fontSize: '11px', marginTop: '0.15rem' }}>Tracks audience performance sources automatically</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* X Share Button */}
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(getTrackedUrl('x'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '11px', display: 'inline-flex', gap: '0.35rem', textTransform: 'none' }}
              >
                <XIcon /> <span>X</span>
              </a>

              {/* LinkedIn Share Button */}
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getTrackedUrl('linkedin'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '11px', display: 'inline-flex', gap: '0.35rem', textTransform: 'none' }}
              >
                <LinkedInIcon /> <span>LinkedIn</span>
              </a>

              {/* Copy Links Selector */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-thin)', borderRadius: '4px', backgroundColor: 'var(--bg-canvas)', overflow: 'hidden' }}>
                <select 
                  value={shareSource}
                  onChange={(e) => setShareSource(e.target.value)}
                  className="technical-mono"
                  style={{ 
                    border: 'none', 
                    padding: '0.4rem 0.75rem', 
                    fontSize: '11px', 
                    backgroundColor: 'transparent',
                    outline: 'none',
                    cursor: 'pointer',
                    width: 'auto',
                  }}
                >
                  <option value="link">General Link</option>
                  <option value="instagram">Instagram Story</option>
                  <option value="x">X Post</option>
                  <option value="linkedin">LinkedIn Post</option>
                </select>
                <button 
                  onClick={() => copyTrackedLink(shareSource)}
                  className="btn-primary" 
                  style={{ 
                    padding: '0.4rem 0.8rem', 
                    fontSize: '11px', 
                    borderRadius: '0', 
                    border: 'none',
                    borderLeft: '1px solid var(--border-thin)',
                    height: '100%',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </footer>
      </article>
    </main>
  );
};

// --- HELPER COMPONENT: CUSTOM DIALOG MODAL ---
const CustomModal = ({ isOpen, onClose, title, placeholder, value, onChange, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(2px)',
    }}>
      <div className="scroll-reveal" style={{
        backgroundColor: 'var(--bg-canvas)',
        border: '1px solid var(--border-thin)',
        borderRadius: '4px',
        padding: '2rem',
        width: '90%',
        maxWidth: '440px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', letterSpacing: '-0.02em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
            {title}
          </h3>
          <hr style={{ margin: '0.5rem 0 0' }} />
        </div>

        <div>
          <input 
            type="text" 
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit();
              }
            }}
            style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: 'var(--font-size-sm)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '11px', textTransform: 'none' }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onSubmit} 
            className="btn-primary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '11px', textTransform: 'none' }}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENT: CUSTOM IMAGE UPLOAD MODAL ---
const ImageUploadModal = ({ isOpen, onClose, title, onChange, onSubmit, loading, error, fileSelected }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(2px)',
    }}>
      <div className="scroll-reveal" style={{
        backgroundColor: 'var(--bg-canvas)',
        border: '1px solid var(--border-thin)',
        borderRadius: '4px',
        padding: '2rem',
        width: '90%',
        maxWidth: '440px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold', letterSpacing: '-0.02em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--text-heading)' }}>
            {title}
          </h3>
          <hr style={{ margin: '0.5rem 0 0' }} />
        </div>

        {error && (
          <p className="technical-mono" style={{ color: '#ff4d4f', fontSize: '11px' }}>{error}</p>
        )}

        <div>
          <label className="technical-mono" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Choose local image file (Max 5MB)
          </label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => onChange(e.target.files[0] || null)}
            disabled={loading}
            style={{ 
              border: '1px solid var(--border-thin)',
              padding: '0.5rem',
              borderRadius: '4px',
              width: '100%',
              backgroundColor: 'var(--bg-highlight)',
              fontFamily: 'var(--font-sans)', 
              fontSize: 'var(--font-size-sm)',
              outline: 'none',
            }}
          />
          {fileSelected && (
            <p className="technical-mono" style={{ marginTop: '0.5rem', fontSize: '11px', color: 'green' }}>
              Selected: {fileSelected.name} ({(fileSelected.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '11px', textTransform: 'none' }}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onSubmit} 
            className="btn-primary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '11px', textTransform: 'none' }}
            disabled={loading || !fileSelected}
          >
            {loading ? 'Uploading...' : 'Upload & Insert'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENT: CUSTOM RICH TEXT EDITOR ---
const RichTextEditor = ({ value, onChange, disabled }) => {
  const editorRef = React.useRef(null);
  const savedRangeRef = React.useRef(null);
  
  // Modal & File states
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Synchronize initial value once
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      if (savedRangeRef.current) {
        sel.addRange(savedRangeRef.current);
      } else {
        // Fallback: place cursor at the end of the editor content
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        sel.addRange(range);
      }
    }
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = (e) => {
    saveSelection();
    onChange(e.currentTarget.innerHTML);
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const trimmed = url.trim();
    
    // If it's already a clean 11-char ID
    if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('?')) {
      return trimmed;
    }
    
    const patterns = [
      /(?:youtube\.com\/watch\?(?:.*&)?v=|youtube\.com\/watch\?.*&v=)([^&?/\s]{11})/,
      /(?:youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/e\/)([^&?/\s]{11})/,
      /(?:youtu\.be\/)([^&?/\s]{11})/,
      /(?:youtube\.com\/shorts\/)([^&?/\s]{11})/,
      /(?:youtube\.com\/live\/)([^&?/\s]{11})/
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleImageUploadSubmit = async () => {
    if (!imageFile) {
      setUploadError('Please select a file first.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', imageFile);

    const { data, error } = await api.uploadImage(formData);

    setUploading(false);

    if (error) {
      setUploadError(error);
    } else if (data && data.url) {
      const imgHtml = `<img src="${data.url}" alt="Uploaded Image" style="max-width: 100%; height: auto; border: 1px solid var(--border-thin); border-radius: 4px; margin: 1.5rem 0; display: block;" /><p><br></p>`;
      restoreSelection();
      executeCommand('insertHTML', imgHtml);
      setImageFile(null);
      setIsImageOpen(false);
    }
  };

  const handleVideoSubmit = () => {
    if (videoUrl) {
      const videoId = getYouTubeId(videoUrl);
      if (videoId) {
        const videoHtml = `
          <div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 1.5rem 0; border: 1px solid var(--border-thin); border-radius: 4px;">
            <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"></iframe>
          </div>
          <p><br></p>
        `;
        restoreSelection();
        executeCommand('insertHTML', videoHtml);
        setVideoUrl('');
        setIsVideoOpen(false);
      } else {
        alert('Invalid YouTube URL or Video ID');
      }
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)' }}>
      {/* Sticky Toolbar */}
      <div style={{ 
        display: 'flex', 
        gap: '0.15rem', 
        padding: '0.5rem 0', 
        backgroundColor: 'var(--bg-canvas)', 
        borderBottom: '1px solid var(--border-thin)',
        flexWrap: 'wrap',
        alignItems: 'center',
        position: 'sticky',
        top: '69px',
        zIndex: 90,
        marginBottom: '1.5rem',
      }}>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }} className="editor-toolbar-btn" style={{ fontWeight: 'bold' }}>B</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }} className="editor-toolbar-btn" style={{ fontStyle: 'italic' }}>I</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('underline'); }} className="editor-toolbar-btn" style={{ textDecoration: 'underline' }}>U</button>
        <span style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-thin)', margin: '0 0.35rem' }}></span>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', 'h2'); }} className="editor-toolbar-btn">H2</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', 'h3'); }} className="editor-toolbar-btn">H3</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', 'p'); }} className="editor-toolbar-btn">Text</button>
        <span style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-thin)', margin: '0 0.35rem' }}></span>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('insertUnorderedList'); }} className="editor-toolbar-btn">• List</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('insertOrderedList'); }} className="editor-toolbar-btn">1. List</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('formatBlock', 'blockquote'); }} className="editor-toolbar-btn">Quote</button>
        <span style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-thin)', margin: '0 0.35rem' }}></span>
        <button 
          type="button" 
          onMouseDown={(e) => { 
            e.preventDefault(); 
            saveSelection(); 
          }} 
          onClick={() => { 
            setImageFile(null); 
            setUploadError(null); 
            setIsImageOpen(true); 
          }} 
          className="editor-toolbar-btn"
        >
          + Image
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => { 
            e.preventDefault(); 
            saveSelection(); 
          }} 
          onClick={() => { 
            setVideoUrl(''); 
            setIsVideoOpen(true); 
          }} 
          className="editor-toolbar-btn"
        >
          + YouTube
        </button>
        <span style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-thin)', margin: '0 0.35rem' }}></span>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); executeCommand('removeFormat'); }} className="editor-toolbar-btn" style={{ color: '#ff4d4f' }}>Clear</button>
      </div>

      {/* Editing Area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onFocus={saveSelection}
        className="rich-editor-area"
        style={{
          minHeight: '700px', // Spacious blank writing canvas (reduced by 30%)
          padding: '1.5rem 0',
          outline: 'none',
          backgroundColor: 'var(--bg-canvas)',
          lineHeight: '1.85',
          fontSize: 'var(--font-size-base)',
        }}
        placeholder="Tell your story. Format using the toolbar above..."
      />

      {/* Custom dialog modals */}
      <ImageUploadModal 
        isOpen={isImageOpen} 
        onClose={() => setIsImageOpen(false)} 
        title="Upload Image File" 
        onChange={setImageFile} 
        onSubmit={handleImageUploadSubmit} 
        loading={uploading} 
        error={uploadError} 
        fileSelected={imageFile} 
      />

      <CustomModal 
        isOpen={isVideoOpen} 
        onClose={() => setIsVideoOpen(false)} 
        title="Embed YouTube Video" 
        placeholder="https://www.youtube.com/watch?v=..." 
        value={videoUrl} 
        onChange={setVideoUrl} 
        onSubmit={handleVideoSubmit} 
      />
    </div>
  );
};

// --- PAGE: WRITE / EDIT ARTICLE COMPOSER ---
const WritePage = ({ currentUser }) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isEditMode = !!slug;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState(null);
  const [articleId, setArticleId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('published');

  useEffect(() => {
    if (isEditMode) {
      async function fetchArticle() {
        setLoading(true);
        const { data, error } = await api.getArticle(slug);
        if (error) {
          setErrors({ general: [error] });
        } else {
          // Check ownership
          if (currentUser && data.user_id !== currentUser.id) {
            setErrors({ general: ['You are not authorized to edit this article.'] });
          } else {
            setArticleId(data.id);
            setTitle(data.title);
            setContent(data.content);
            setExcerpt(data.excerpt || '');
            setCurrentStatus(data.status);
          }
        }
        setLoading(false);
      }
      fetchArticle();
    }
  }, [slug, isEditMode, currentUser]);

  const handlePublish = async (status) => {
    if (!title) {
      setErrors({ title: ['Title is required'] });
      return;
    }
    if (!content) {
      setErrors({ content: ['Content is required'] });
      return;
    }

    setSubmitting(true);
    setErrors(null);

    const payload = {
      title,
      content,
      excerpt: excerpt || null,
      status,
    };

    const { data, error, errors: validationErrors } = isEditMode
      ? await api.updateArticle(articleId, payload)
      : await api.createArticle(payload);

    setSubmitting(false);

    if (error) {
      setErrors(validationErrors || { general: [error] });
    } else {
      navigate(`/article/${data.slug}`);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handlePublish('published');
  };

  if (loading) {
    return <div className="main-content technical-mono">Loading article details...</div>;
  }

  return (
    <main className="main-content scroll-reveal" style={{ maxWidth: '720px', padding: '4rem 1.5rem' }}>
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        {errors && errors.general && (
          <div className="technical-mono" style={{ color: 'red', marginBottom: '1.5rem' }}>
            {errors.general[0]}
          </div>
        )}

        {/* Medium-like Borderless Title */}
        <div style={{ marginBottom: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={submitting}
            style={{ 
              fontSize: 'var(--font-size-3xl)', 
              padding: '0.5rem 0', 
              fontWeight: '800', 
              border: 'none',
              borderRadius: 0,
              backgroundColor: 'transparent',
              outline: 'none',
              letterSpacing: '-0.04em',
              color: 'var(--text-heading)',
              boxShadow: 'none',
              width: '100%',
            }}
          />
          {errors && errors.title && <p className="technical-mono" style={{ color: 'red', marginTop: '0.25rem' }}>{errors.title[0]}</p>}
        </div>

        {/* Medium-like Borderless Excerpt/Subtitle */}
        <div style={{ marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="Tell your story's short summary (optional)..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            disabled={submitting}
            style={{ 
              fontFamily: 'var(--font-sans)', 
              fontSize: 'var(--font-size-lg)', 
              padding: '0.5rem 0',
              border: 'none',
              borderRadius: 0,
              backgroundColor: 'transparent',
              outline: 'none',
              color: 'var(--text-muted)',
              boxShadow: 'none',
              width: '100%',
              fontWeight: '400',
            }}
          />
          {errors && errors.excerpt && <p className="technical-mono" style={{ color: 'red', marginTop: '0.25rem' }}>{errors.excerpt[0]}</p>}
        </div>

        {/* Writing Body Container */}
        <div>
          <RichTextEditor 
            value={content}
            onChange={setContent}
            disabled={submitting}
          />
          {errors && errors.content && <p className="technical-mono" style={{ color: 'red', marginTop: '0.5rem' }}>{errors.content[0]}</p>}
        </div>

        {/* Form Submission Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '2.5rem',
          borderTop: '1px solid var(--border-thin)',
          paddingTop: '2rem',
          alignItems: 'center'
        }}>
          <button 
            type="button" 
            onClick={() => handlePublish('published')} 
            className="btn-primary" 
            disabled={submitting}
          >
            {submitting 
              ? (isEditMode ? 'Saving...' : 'Publishing...') 
              : (isEditMode && currentStatus === 'published' ? 'Update Article' : 'Publish Article')}
          </button>
          <button 
            type="button" 
            onClick={() => handlePublish('draft')} 
            className="btn-secondary" 
            disabled={submitting}
          >
            {submitting 
              ? 'Saving...' 
              : (isEditMode && currentStatus === 'published' ? 'Revert to Draft' : 'Save as Draft')}
          </button>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="btn-secondary" 
            style={{ marginLeft: 'auto' }} 
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
};

// --- PAGE: PROFILE (VIEW / EDIT / FOLLOWS) ---
const ProfilePage = ({ currentUser }) => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Edit fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [socialX, setSocialX] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialWebsite, setSocialWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const isOwnProfile = currentUser && currentUser.username === username;

  async function fetchProfile() {
    setLoading(true);
    const { data, error } = await api.getUserProfile(username);
    if (error) {
      setError(error);
    } else {
      setProfile(data);
      // Initialize edit fields
      setName(data.user.name);
      setDescription(data.user.description || '');
      setImagePath(data.user.image_path || '');
      setSocialX(data.user.social_x || '');
      setSocialLinkedin(data.user.social_linkedin || '');
      setSocialInstagram(data.user.social_instagram || '');
      setSocialWebsite(data.user.social_website || '');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProfile();
  }, [username, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert('You must be logged in to follow users.');
      return;
    }
    const { data, error } = await api.toggleFollow(profile.user.id);
    if (!error) {
      // Refresh profile data to reflect updated counts
      const updatedProfile = { ...profile };
      updatedProfile.is_following = data.is_following;
      updatedProfile.user.followers_count += data.is_following ? 1 : -1;
      setProfile(updatedProfile);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUpdateError(null);

    const { data, error, errors: validationErrors } = await api.updateProfile({
      name,
      description,
      image_path: imagePath,
      social_x: socialX,
      social_linkedin: socialLinkedin,
      social_instagram: socialInstagram,
      social_website: socialWebsite,
    });

    setSaving(false);

    if (error) {
      setUpdateError(validationErrors ? Object.values(validationErrors).flat()[0] : error);
    } else {
      setEditMode(false);
      // Reload profile
      fetchProfile();
    }
  };

  if (loading) {
    return <div className="main-content technical-mono">Reading user profile...</div>;
  }

  if (error || !profile) {
    return <div className="main-content technical-mono" style={{ color: 'red' }}>Error: {error || 'User not found.'}</div>;
  }

  const { user, is_following, articles } = profile;

  return (
    <main className="main-content scroll-reveal">
      <div className="grid-magazine">
        {/* Left Column: Author card info */}
        <div className="profile-sidebar">
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Avatar name={user.name} size={64} />
              <div>
                <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800' }}>{user.name}</h1>
                <p className="technical-mono">@{user.username}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }} className="technical-mono">
              <div><strong>{user.followers_count || 0}</strong> Followers</div>
              <div><strong>{user.followings_count || 0}</strong> Following</div>
            </div>

            {/* Profile Avatar / Image URL Display */}
            {user.image_path && (
              <img 
                src={user.image_path} 
                alt={`${user.name} upload`} 
                style={{ 
                  width: '100%', 
                  maxHeight: '200px', 
                  objectFit: 'cover', 
                  borderRadius: '4px',
                  border: '1px solid var(--border-thin)' 
                }} 
              />
            )}

            {!editMode ? (
              <>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-body)', fontWeight: 300, whiteSpace: 'pre-wrap' }}>
                  {user.description || 'No description provided.'}
                </p>

                {/* Social media connections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }} className="technical-mono">
                  {user.social_x && (
                    <a href={user.social_x.startsWith('http') ? user.social_x : `https://x.com/${user.social_x}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <XIcon /> <span>{user.social_x}</span>
                    </a>
                  )}
                  {user.social_linkedin && (
                    <a href={user.social_linkedin.startsWith('http') ? user.social_linkedin : `https://linkedin.com/in/${user.social_linkedin}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <LinkedInIcon /> <span>{user.social_linkedin}</span>
                    </a>
                  )}
                  {user.social_instagram && (
                    <a href={user.social_instagram.startsWith('http') ? user.social_instagram : `https://instagram.com/${user.social_instagram}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <InstagramIcon /> <span>{user.social_instagram}</span>
                    </a>
                  )}
                  {user.social_website && (
                    <a href={user.social_website.startsWith('http') ? user.social_website : `https://${user.social_website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <LinkIcon /> <span>{user.social_website}</span>
                    </a>
                  )}
                </div>

                {isOwnProfile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <button onClick={() => setEditMode(true)} className="btn-secondary" style={{ width: '100%' }}>
                      Edit Profile
                    </button>
                    <Link to="/dashboard" className="btn-primary" style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}>
                      View Analytics
                    </Link>
                  </div>
                ) : (
                  <button 
                    onClick={handleFollowToggle} 
                    className={is_following ? "btn-secondary" : "btn-primary"} 
                    style={{ width: '100%' }}
                  >
                    {is_following ? 'Unfollow' : 'Follow Writer'}
                  </button>
                )}
              </>
            ) : (
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {updateError && <p className="technical-mono" style={{ color: 'red' }}>{updateError}</p>}
                
                <div>
                  <label className="technical-mono" style={{ fontSize: '10px' }}>Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                
                <div>
                  <label className="technical-mono" style={{ fontSize: '10px' }}>Description / Bio</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ fontSize: 'var(--font-size-sm)' }} />
                </div>

                <div>
                  <label className="technical-mono" style={{ fontSize: '10px' }}>Image URL</label>
                  <input type="text" placeholder="https://..." value={imagePath} onChange={(e) => setImagePath(e.target.value)} />
                </div>

                <div>
                  <label className="technical-mono" style={{ fontSize: '10px' }}>X username</label>
                  <input type="text" placeholder="@username" value={socialX} onChange={(e) => setSocialX(e.target.value)} />
                </div>

                <div>
                  <label className="technical-mono" style={{ fontSize: '10px' }}>LinkedIn username</label>
                  <input type="text" placeholder="username" value={socialLinkedin} onChange={(e) => setSocialLinkedin(e.target.value)} />
                </div>

                <div>
                  <label className="technical-mono" style={{ fontSize: '10px' }}>Instagram username</label>
                  <input type="text" placeholder="@username" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} />
                </div>

                <div>
                  <label className="technical-mono" style={{ fontSize: '10px' }}>Website Link</label>
                  <input type="text" placeholder="mywebsite.com" value={socialWebsite} onChange={(e) => setSocialWebsite(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '0.5rem', fontSize: '11px', flex: 1 }} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setEditMode(false)} className="btn-secondary" style={{ padding: '0.5rem', fontSize: '11px', flex: 1 }} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Articles list */}
        <div className="profile-content">
          <h2 style={{ fontSize: 'var(--font-size-lg)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
            Articles by {user.name}
          </h2>

          <hr style={{ margin: '1rem 0' }} />

          {articles.length === 0 ? (
            <p className="technical-mono" style={{ padding: '2rem 0' }}>No articles published yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {articles.map((article) => (
                <article key={article.id} className="article-card" style={{ padding: '1.5rem 0' }}>
                  <div className="article-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="technical-mono">{new Date(article.created_at).toLocaleDateString()}</span>
                    {article.status === 'draft' && (
                      <span style={{
                        fontSize: '9px',
                        backgroundColor: 'var(--border-thin)',
                        color: 'var(--text-muted)',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '3px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>Draft</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', margin: '0.25rem 0' }}>
                    <Link to={`/article/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p className="article-excerpt" style={{ fontSize: 'var(--font-size-sm)' }}>{article.excerpt}</p>
                  <div className="article-footer" style={{ marginTop: '0.4rem' }}>
                    <div className="technical-mono" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <EyeIcon /> <span>{article.views_count || 0} views</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

// --- PAGE: AUTHENTICATION (LOGIN & REGISTRATION WITH ROBOT CHALLENGE) ---
const LoginPage = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [challengeQuestion, setChallengeQuestion] = useState('');
  const [challengeKey, setChallengeKey] = useState('');
  const [challengeAnswer, setChallengeAnswer] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState(null);

  // Fetch the math equation challenge
  async function reloadChallenge() {
    setChallengeAnswer('');
    const { data, error } = await api.getChallenge();
    if (data) {
      setChallengeQuestion(data.question);
      setChallengeKey(data.key);
    } else {
      alert('Unable to retrieve anti-robot challenge. Please refresh the page.');
    }
  }

  useEffect(() => {
    reloadChallenge();
  }, [isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors(null);

    let res;
    if (isRegister) {
      res = await api.register({
        name,
        email,
        username,
        password,
        password_confirmation: passwordConfirmation,
        challenge_answer: challengeAnswer,
        challenge_key: challengeKey,
      });
    } else {
      res = await api.login({
        email,
        password,
        challenge_answer: challengeAnswer,
        challenge_key: challengeKey,
      });
    }

    setSubmitting(false);

    if (res.error) {
      setErrors(res.errors || { general: [res.error] });
      // Reload challenge on failure
      reloadChallenge();
    } else {
      // Save details & inform parent app
      saveAuth(res.data.access_token, res.data.user);
      onAuthSuccess(res.data.user);
      navigate('/');
    }
  };

  return (
    <main className="main-content scroll-reveal" style={{ maxWidth: '450px', margin: '4rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ letterSpacing: '-0.04em', fontWeight: '800' }}>{isRegister ? 'Register' : 'Login'}</h1>
        <p className="technical-mono" style={{ marginTop: '0.25rem' }}>
          {isRegister ? 'Create a writer credentials file' : 'Sign in to access your dashboard'}
        </p>
      </div>

      <hr />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errors && errors.general && (
          <div className="technical-mono" style={{ color: 'red', textAlign: 'center', marginBottom: '0.5rem' }}>
            {errors.general[0]}
          </div>
        )}

        {isRegister && (
          <>
            <div>
              <label className="technical-mono" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                disabled={submitting} 
              />
              {errors && errors.name && <p className="technical-mono" style={{ color: 'red', marginTop: '0.15rem' }}>{errors.name[0]}</p>}
            </div>
            <div>
              <label className="technical-mono" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} 
                required 
                placeholder="lowercase_letters_only"
                disabled={submitting} 
              />
              {errors && errors.username && <p className="technical-mono" style={{ color: 'red', marginTop: '0.15rem' }}>{errors.username[0]}</p>}
            </div>
          </>
        )}

        <div>
          <label className="technical-mono" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={submitting} 
          />
          {errors && errors.email && <p className="technical-mono" style={{ color: 'red', marginTop: '0.15rem' }}>{errors.email[0]}</p>}
        </div>

        <div>
          <label className="technical-mono" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={submitting} 
          />
          {errors && errors.password && <p className="technical-mono" style={{ color: 'red', marginTop: '0.15rem' }}>{errors.password[0]}</p>}
        </div>

        {isRegister && (
          <div>
            <label className="technical-mono" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Confirm Password</label>
            <input 
              type="password" 
              value={passwordConfirmation} 
              onChange={(e) => setPasswordConfirmation(e.target.value)} 
              required 
              disabled={submitting} 
            />
          </div>
        )}

        {/* MATH CHALLENGE CARD */}
        <div style={{ 
          marginTop: '0.5rem',
          padding: '1.25rem', 
          backgroundColor: 'var(--bg-highlight)', 
          border: '1px solid var(--border-thin)', 
          borderRadius: '4px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="technical-mono" style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Robot Verification</span>
            <button 
              type="button" 
              onClick={reloadChallenge} 
              className="technical-mono" 
              style={{ textDecoration: 'underline', opacity: 0.7 }}
            >
              Refresh
            </button>
          </div>
          
          <p style={{ fontWeight: '600', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            {challengeQuestion || 'Loading math challenge...'}
          </p>

          <input 
            type="text" 
            placeholder="Solve the equation..."
            value={challengeAnswer}
            onChange={(e) => setChallengeAnswer(e.target.value)}
            required
            disabled={submitting}
            style={{ backgroundColor: 'var(--bg-canvas)' }}
          />
          {errors && errors.challenge_answer && <p className="technical-mono" style={{ color: 'red', marginTop: '0.25rem' }}>{errors.challenge_answer[0]}</p>}
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
          {submitting ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
        </button>

        <button 
          type="button" 
          onClick={() => {
            setIsRegister(!isRegister);
            setErrors(null);
          }}
          className="technical-mono"
          style={{ textDecoration: 'underline', marginTop: '0.5rem', display: 'block', margin: '0.5rem auto' }}
        >
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </form>
    </main>
  );
};

// --- PAGE: ANALYTICS DASHBOARD ---
const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      const { data, error } = await api.getAnalytics();
      if (error) {
        setError(error);
      } else {
        setData(data);
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="main-content technical-mono">Compiling analytics report...</div>;
  }

  if (error || !data) {
    return <div className="main-content technical-mono" style={{ color: 'red' }}>Error: {error || 'Analytics not found.'}</div>;
  }

  const { total_views, source_breakdown, articles } = data;

  return (
    <main className="main-content scroll-reveal">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ letterSpacing: '-0.04em', fontWeight: '800' }}>Analytics Dashboard</h1>
        <p className="technical-mono" style={{ marginTop: '0.25rem' }}>Performance logs for your published materials</p>
      </div>

      <hr />

      {/* Grid Summary Row */}
      <div className="grid-magazine" style={{ marginBottom: '3rem' }}>
        <div className="dashboard-summary">
          <p className="technical-mono" style={{ textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Views</p>
          <p style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'var(--font-sans)', letterSpacing: '-0.04em', color: 'var(--text-heading)' }}>
            {total_views}
          </p>
        </div>

        <div className="dashboard-channels">
          <p className="technical-mono" style={{ textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Traffic Referral Channels</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(source_breakdown).map(([source, count]) => {
              const percentage = total_views > 0 ? Math.round((count / total_views) * 100) : 0;
              return (
                <div key={source} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="technical-mono" style={{ width: '120px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {source === 'x' ? 'X (Twitter)' : source}
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div style={{ flex: 1, backgroundColor: 'var(--bg-highlight)', height: '12px', border: '1px solid var(--border-thin)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: 'var(--text-heading)', height: '100%', width: `${percentage}%` }}></div>
                  </div>
                  
                  <div className="technical-mono" style={{ width: '80px', textAlign: 'right' }}>
                    {count} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Articles Grid */}
      <h2 style={{ fontSize: 'var(--font-size-lg)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Article List Report
      </h2>

      {articles.length === 0 ? (
        <p className="technical-mono">You haven't written any articles yet.</p>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-thin)', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-highlight)', borderBottom: '1px solid var(--border-thin)', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Article Title</th>
                <th style={{ padding: '1rem', width: '100px', textAlign: 'right' }}>Views</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Referral Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} style={{ borderBottom: '1px solid var(--border-thin)' }}>
                  <td style={{ padding: '1.25rem', fontWeight: '600' }}>
                    <Link to={`/article/${article.slug}`} style={{ textDecoration: 'underline' }}>{article.title}</Link>
                    {article.status === 'draft' && (
                      <span style={{
                        fontSize: '9px',
                        backgroundColor: 'var(--border-thin)',
                        color: 'var(--text-muted)',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '3px',
                        marginLeft: '0.5rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        verticalAlign: 'middle'
                      }}>Draft</span>
                    )}
                    <span className="technical-mono" style={{ display: 'block', fontSize: '10px', fontWeight: 'normal', marginTop: '0.25rem' }}>
                      Slug: {article.slug} • {article.status === 'draft' ? 'Created' : 'Published'}: {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  
                  <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                    {article.views_count}
                  </td>
                  
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }} className="technical-mono">
                      {Object.entries(article.source_breakdown).map(([src, val]) => (
                        <div key={src} style={{ padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-highlight)', border: '1px solid var(--border-thin)', borderRadius: '2px', display: 'flex', gap: '0.25rem' }}>
                          <span style={{ opacity: 0.6, textTransform: 'uppercase', fontWeight: 'bold' }}>{src}:</span>
                          <strong>{val}</strong>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

// --- APP WRAPPER & ROUTER CONFIG ---
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from local storage on mount
  useEffect(() => {
    async function loadUser() {
      const token = getToken();
      if (token) {
        const saved = getSavedUser();
        if (saved) {
          setCurrentUser(saved);
        }
        
        // Sync with API to verify token validity
        const { data, error } = await api.getMe();
        if (data && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('nulis_user', JSON.stringify(data.user));
        } else if (error) {
          clearAuth();
          setCurrentUser(null);
        }
      }
      setLoading(false);
    }

    loadUser();

    // Listen for auth modifications (e.g. logouts from fetch calls)
    const handleAuthChange = () => {
      const token = getToken();
      if (!token) {
        setCurrentUser(null);
      } else {
        setCurrentUser(getSavedUser());
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Do you wish to logout from this session?')) {
      await api.logout();
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
        Authenticating editor session...
      </div>
    );
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
        <NavHeader user={currentUser} onLogout={handleLogout} />
        
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/following" element={<FollowingPage />} />
            <Route path="/article/:slug" element={<ArticleDetailPage currentUser={currentUser} />} />
            <Route path="/write" element={<WritePage currentUser={currentUser} />} />
            <Route path="/edit/:slug" element={<WritePage currentUser={currentUser} />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage onAuthSuccess={(user) => setCurrentUser(user)} />} />
            <Route path="/:username" element={<ProfilePage currentUser={currentUser} />} />
          </Routes>
        </div>

        <footer className="footer">
          <div className="footer-text">
            NULIS.ONLINE • AN ARCHITECTURAL canvas for written thought. NO BUBBLES. ONLY STEEL.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
