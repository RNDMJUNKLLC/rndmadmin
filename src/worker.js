/**
 * RNDM Admin Dashboard - Cloudflare Worker
 * Serves static dashboard files with enhanced security and performance
 * Version: 2.0.0 - Complete refactor with working Firebase integration
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
    script-src 'self' 'unsafe-inline' 'unsafe-eval' 
      https://cdn.jsdelivr.net 
      https://www.gstatic.com 
      https://apis.google.com 
      https://static.cloudflareinsights.com 
      https://*.firebaseio.com 
      https://*.googleapis.com;
    style-src 'self' 'unsafe-inline' 
      https://fonts.googleapis.com 
      https://cdnjs.cloudflare.com;
    font-src 'self' 
      https://fonts.gstatic.com 
      https://cdnjs.cloudflare.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' 
      https://*.firebaseio.com 
      https://*.googleapis.com 
      https://api.googleads.com 
      https://www.googleadservices.com 
      https://www.gstatic.com 
      https://cdn.jsdelivr.net 
      https://static.cloudflareinsights.com 
      https://cloudflareinsights.com 
      wss://*.firebaseio.com;
    frame-src 'self' 
      https://*.firebaseapp.com 
      https://accounts.google.com;
    object-src 'none';
  `.replace(/\s+/g, ' ').trim()
};

// Cache settings for different file types
const CACHE_SETTINGS = {
  'text/html': 'no-cache, no-store, must-revalidate',
  'application/javascript': 'no-cache, no-store, must-revalidate',
  'text/css': 'no-cache, no-store, must-revalidate',
  'image/': 'public, max-age=31536000, immutable',
  'font/': 'public, max-age=31536000, immutable'
};

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Always land on the login page for /, /admin, /login.
      // The dashboard is only reachable by explicitly navigating to
      // /dashboard.html (or /dashboard/*), which is gated by auth-guard.
      // Combined with session-only auth persistence (firebase-auth.js),
      // closing the tab/browser forces a fresh sign-in.
      if (url.pathname === '/' || url.pathname === '/admin' || url.pathname === '/login') {
        const loginRequest = new Request(`${url.origin}/login.html`);
        const loginResponse = await env.ASSETS.fetch(loginRequest);

        if (loginResponse.status !== 404) {
          const response = new Response(loginResponse.body, {
            status: 200,
            statusText: 'OK',
            headers: loginResponse.headers
          });
          Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
            response.headers.set(key, value);
          });
          response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          return response;
        }
      }

      // Emergency reset endpoint — nukes client-side storage, unregisters
      // any service workers, and forces a fresh sign-in. Use this if a
      // browser has cached a stale 301 from the old _redirects file or
      // an old Firebase token is causing a redirect loop.
      if (url.pathname === '/reset' || url.pathname === '/reset/') {
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Resetting…</title>` +
          `<meta name="viewport" content="width=device-width,initial-scale=1">` +
          `<style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.c{max-width:520px;padding:32px;text-align:center}h1{margin:0 0 12px}p{opacity:.8}code{background:#1e293b;padding:2px 6px;border-radius:4px}</style>` +
          `</head><body><div class="c"><h1>Clearing session…</h1><p id="s">Removing local storage, cookies and service workers.</p></div>` +
          `<script>(async()=>{try{localStorage.clear();sessionStorage.clear();}catch(e){}` +
          `try{const dbs=await indexedDB.databases();for(const d of dbs){if(d.name)indexedDB.deleteDatabase(d.name);}}catch(e){}` +
          `try{document.cookie.split(';').forEach(c=>{const n=c.split('=')[0].trim();document.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';});}catch(e){}` +
          `try{if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();for(const r of regs)await r.unregister();}}catch(e){}` +
          `try{if('caches' in self){const ks=await caches.keys();for(const k of ks)await caches.delete(k);}}catch(e){}` +
          `document.getElementById('s').textContent='Done. Redirecting to login…';` +
          // Cache-bust to defeat any cached 301 to /dashboard.html
          `setTimeout(()=>{location.replace('/login.html?fresh='+Date.now());},600);` +
          `})();<\/script></body></html>`;
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Clear-Site-Data': '"cache", "cookies", "storage"',
            ...SECURITY_HEADERS,
          },
        });
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
        // Check if we have the required environment variables/secrets
        const hasConfig = env.FIREBASE_API_KEY && env.FIREBASE_PROJECT_ID;
        
        if (!hasConfig) {
          console.log('Firebase secrets not available:', {
            hasApiKey: !!env.FIREBASE_API_KEY,
            hasProjectId: !!env.FIREBASE_PROJECT_ID,
            envKeys: Object.keys(env)
          });
          
          return new Response(JSON.stringify({ 
            error: 'Firebase configuration not available',
            debug: {
              hasApiKey: !!env.FIREBASE_API_KEY,
              hasProjectId: !!env.FIREBASE_PROJECT_ID,
              availableKeys: Object.keys(env).filter(k => k.startsWith('FIREBASE'))
            }
          }), {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
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
            'Access-Control-Allow-Origin': '*'
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
      
      // SPA fallback for unknown paths — send to login (not dashboard).
      // This prevents random typo paths from loading the dashboard shell,
      // which would then bounce through auth-guard.
      if (!url.pathname.includes('.') || url.pathname.startsWith('/dashboard/')) {
        const target = url.pathname.startsWith('/dashboard/') ? '/dashboard.html' : '/login.html';
        const fallbackRequest = new Request(`${url.origin}${target}`);
        const fallbackResponse = await env.ASSETS.fetch(fallbackRequest);

        if (fallbackResponse.status !== 404) {
          const out = new Response(fallbackResponse.body, {
            status: 200,
            statusText: 'OK',
            headers: fallbackResponse.headers
          });
          Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
            out.headers.set(key, value);
          });
          out.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          return out;
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