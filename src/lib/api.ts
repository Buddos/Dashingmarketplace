export const api = {
  fetch: async (endpoint: string, options: RequestInit = {}) => {
    // Determine base URL dynamically. 
    // In production on Netlify, relative paths work via redirects in netlify.toml
    // In local development, we prefer hitting the function port directly if VITE_API_URL is set
    const baseUrl = import.meta.env?.VITE_API_URL || "";
    
    // Automatically attach token from localStorage for auth
    const token = localStorage.getItem("token");
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };
 
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
 
    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
 
    const response = await fetch(url, {
      ...options,
      headers,
    });
 
    if (!response.ok) {
        const text = await response.text();
        let err;
        try {
          err = JSON.parse(text);
        } catch {
          err = { error: text || response.statusText };
        }
        throw new Error(err.error || err.message || response.statusText);
    }
    
    return response.json();
  },
  
  // Helpers matching old supabase styles for easier refactoring
  from: (table: string) => ({
      select: async (query?: string) => {
          // This is a naive implementation purely to bridge simple "GET /table" 
          // Realistically, the entire React Component should be rewritten to use `api.fetch('/api/products')`
          const data = await api.fetch(`/api/${table}`);
          return { data, error: null };
      },
      insert: async (payload: any) => {
          const data = await api.fetch(`/api/${table}`, {
              method: 'POST',
              body: JSON.stringify(payload)
          });
          return { data, error: null };
      },
      update: async (payload: any) => {
           // update usually chained with .eq('id', id)
           // we'll need a different pattern or pass ID in the payload depending on the rewriting strategy
           return { data: null, error: new Error('Please rewrite update to use standard fetch') };
      }
  })
};
