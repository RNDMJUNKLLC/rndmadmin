/**
 * RNDM Admin Dashboard - Cloudflare Worker
 * Serves static dashboard files with enhanced security and performance
 */

// Security headers for enhanced protection
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.gstatic.com https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
    font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
    img-src 'self' data: https:;
    connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.googleads.com https://www.googleadservices.com;
    frame-src https://*.firebaseapp.com https://accounts.google.com;
  `.replace(/\s+/g, ' ').trim()
};

// Cache settings for different file types
const CACHE_SETTINGS = {
  'text/html': 'public, max-age=0, must-revalidate',
  'application/javascript': 'public, max-age=31536000, immutable',
  'text/css': 'public, max-age=31536000, immutable',
  'image/': 'public, max-age=31536000, immutable',
  'font/': 'public, max-age=31536000, immutable'
};

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Handle root path - serve dashboard directly (no redirect)
      if (url.pathname === '/') {
        const dashboardRequest = new Request(`${url.origin}/dashboard.html`);
        const dashboardResponse = await env.ASSETS.fetch(dashboardRequest);
        
        if (dashboardResponse.status !== 404) {
          const response = new Response(dashboardResponse.body, {
            status: 200,
            statusText: 'OK',
            headers: dashboardResponse.headers
          });
          
          // Add security headers
          Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
          
          return response;
        }
      }
      
      // Handle admin and login paths - serve dashboard directly
      if (url.pathname === '/admin' || url.pathname === '/login') {
        const dashboardRequest = new Request(`${url.origin}/dashboard.html`);
        const dashboardResponse = await env.ASSETS.fetch(dashboardRequest);
        
        if (dashboardResponse.status !== 404) {
          const response = new Response(dashboardResponse.body, {
            status: 200,
            statusText: 'OK',
            headers: dashboardResponse.headers
          });
          
          // Add security headers
          Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
          
          return response;
        }
      }
      
      // Block access to temp_reference files - return 404
      if (url.pathname.startsWith('/temp_reference/')) {
        return new Response('Not Found', { 
          status: 404,
          headers: SECURITY_HEADERS
        });
      }

      // Handle Firebase config API endpoint
      if (url.pathname === '/api/config/firebase') {
        const firebaseConfig = {
          apiKey: env.FIREBASE_API_KEY,
          authDomain: env.FIREBASE_AUTH_DOMAIN,
          databaseURL: env.FIREBASE_DATABASE_URL,
          projectId: env.FIREBASE_PROJECT_ID,
          storageBucket: env.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
          appId: env.FIREBASE_APP_ID,
          measurementId: env.FIREBASE_MEASUREMENT_ID
        };
        
        return new Response(JSON.stringify(firebaseConfig), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            ...SECURITY_HEADERS
          }
        });
      }

      // Handle OPTIONS for CORS
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            ...SECURITY_HEADERS
          }
        });
      }
      
      // Try to get asset from the static site
      const assetResponse = await env.ASSETS.fetch(request);
      
      // If asset exists, enhance with security headers
      if (assetResponse.status !== 404) {
        const modifiedResponse = new Response(assetResponse.body, {
          status: assetResponse.status,
          statusText: assetResponse.statusText,
          headers: assetResponse.headers
        });
        
        // Add security headers
        Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
          modifiedResponse.headers.set(key, value);
        });
        
        // Set cache headers based on content type
        const contentType = modifiedResponse.headers.get('content-type') || '';
        
        for (const [type, cacheControl] of Object.entries(CACHE_SETTINGS)) {
          if (contentType.includes(type)) {
            modifiedResponse.headers.set('Cache-Control', cacheControl);
            break;
          }
        }
        
        return modifiedResponse;
      }
      
      // SPA fallback - serve dashboard.html for routes that don't exist
      if (!url.pathname.includes('.') || url.pathname.startsWith('/dashboard/')) {
        const dashboardRequest = new Request(`${url.origin}/dashboard.html`);
        const dashboardResponse = await env.ASSETS.fetch(dashboardRequest);
        
        if (dashboardResponse.status !== 404) {
          const fallbackResponse = new Response(dashboardResponse.body, {
            status: 200, // Return 200 for SPA routing
            statusText: 'OK',
            headers: dashboardResponse.headers
          });
          
          // Add security headers
          Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
            fallbackResponse.headers.set(key, value);
          });
          
          return fallbackResponse;
        }
      }
      
      // Return 404 with security headers
      return new Response('Not Found', {
        status: 404,
        headers: SECURITY_HEADERS
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(`Error: ${error.message}`, { 
        status: 500,
        headers: SECURITY_HEADERS
      });
    }
  }
};