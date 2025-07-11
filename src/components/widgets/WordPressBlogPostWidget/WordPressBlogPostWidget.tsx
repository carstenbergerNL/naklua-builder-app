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
}

interface Config {
  WP_API?: string;
  POST_ID?: string;
}

export default function WordPressBlogPostWidget({ config }: { config: Config }) {
  const [post, setPost] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.info('WordPressBlogPostWidget config:', config);

    if (!config.WP_API || !config.POST_ID) {
      setError('WordPress API URL and Post ID are required');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${config.WP_API}/posts/${config.POST_ID}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const postData: WordPressPost = await response.json();
        setPost(postData);
      } catch (err) {
        console.error('Error fetching WordPress post:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [config.WP_API, config.POST_ID]);

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
      }}>
        <div>Loading WordPress post...</div>
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
        <strong>Error loading WordPress post:</strong> {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
      }}>
        No post found
      </div>
    );
  }

  return (
    <article style={{ 
      maxWidth: '100%',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6'
    }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 
          style={{ 
            fontSize: '2em', 
            marginBottom: '10px',
            color: '#333'
          }}
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div style={{ 
          fontSize: '0.9em', 
          color: '#666',
          marginBottom: '15px'
        }}>
          Published on {new Date(post.date).toLocaleDateString()}
        </div>
      </header>
      
      <div 
        style={{ 
          fontSize: '1em',
          color: '#333'
        }}
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
    </article>
  );
}
