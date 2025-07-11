import { useState, useEffect } from "react";

export default function WordPressPageWidget({ config }: { config: any }) {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.info('WordPressPageWidget config:', config);

    if (!config.WP_API || !config.PAGE_ID) {
      setError('WordPress API URL and Page ID are required');
      setLoading(false);
      return;
    }

    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${config.WP_API}/pages/${config.PAGE_ID}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
        }
        
        const pageData = await response.json();
        setPage(pageData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch WordPress page');
        console.error('WordPress page fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [config.WP_API, config.PAGE_ID]);

  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
        Loading WordPress page...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: '4px' }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!page) {
    return (
      <div style={{ padding: '1rem', color: '#666' }}>
        No page content found
      </div>
    );
  }

  return (
    <div className="wordpress-page-widget">
      {page.title && (
        <h2 
          dangerouslySetInnerHTML={{ __html: page.title.rendered || page.title }} 
          style={{ marginBottom: '1rem' }}
        />
      )}
      {page.content && (
        <div 
          dangerouslySetInnerHTML={{ __html: page.content.rendered || page.content }}
          style={{ lineHeight: '1.6' }}
        />
      )}
    </div>
  );
}
