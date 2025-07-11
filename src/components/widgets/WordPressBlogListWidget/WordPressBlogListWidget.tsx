import React, { useEffect, useState } from 'react';

interface WordPressPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  author: number;
  featured_media: number;
  link: string;
  slug: string;
}

interface Config {
  WP_API?: string;
  POSTS_PER_PAGE?: string;
  CATEGORY_ID?: string;
  SHOW_EXCERPT?: boolean;
  SHOW_DATE?: boolean;
  SHOW_READ_MORE?: boolean;
}

export default function WordPressBlogListWidget({ config }: { config: Config }) {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.info('WordPressBlogListWidget config:', config);

    if (!config.WP_API) {
      setError('WordPress API URL is required');
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('per_page', config.POSTS_PER_PAGE || '10');
        if (config.CATEGORY_ID) {
          params.append('categories', config.CATEGORY_ID);
        }
        
        const response = await fetch(`${config.WP_API}/posts?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const postsData: WordPressPost[] = await response.json();
        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching WordPress posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [config.WP_API, config.POSTS_PER_PAGE, config.CATEGORY_ID]);

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
      }}>
        <div>Loading WordPress posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#ffe0e0', 
        border: '1px solid #ff9999',
        borderRadius: '4px',
        color: '#cc0000'
      }}>
        <strong>Error loading WordPress posts:</strong> {error}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
      }}>
        No posts found
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '100%',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ 
        fontSize: '1.8em', 
        marginBottom: '20px',
        color: '#333',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px'
      }}>
        Blog Posts
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {posts.map((post) => (
          <article 
            key={post.id}
            style={{ 
              border: '1px solid #eee',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h3 
              style={{ 
                fontSize: '1.4em', 
                marginBottom: '10px',
                color: '#333',
                lineHeight: '1.3'
              }}
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
            
            {config.SHOW_DATE !== false && (
              <div style={{ 
                fontSize: '0.9em', 
                color: '#666',
                marginBottom: '15px'
              }}>
                Published on {new Date(post.date).toLocaleDateString()}
              </div>
            )}
            
            {config.SHOW_EXCERPT !== false && (
              <div 
                style={{ 
                  fontSize: '1em',
                  color: '#555',
                  lineHeight: '1.6',
                  marginBottom: '15px'
                }}
                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
              />
            )}
            
            {config.SHOW_READ_MORE !== false && (
              <a 
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: '#007cba',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#005a87';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#007cba';
                }}
              >
                Read More
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
