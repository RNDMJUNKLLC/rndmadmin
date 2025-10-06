/**
 * RNDM Admin Dashboard - Cloudflare Worker
 * Serves static dashboard files with enhanced security and performance
 */

import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler';

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
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.gstatic.com https://apis.google.com;
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
      
      // Handle root path - redirect to dashboard
      if (url.pathname === '/') {
        return Response.redirect(`${url.origin}/dashboard.html`, 301);
      }
      
      // Handle admin and login redirects
      if (url.pathname === '/admin' || url.pathname === '/login') {
        return Response.redirect(`${url.origin}/dashboard.html`, 301);
      }
      
      // Block access to temp_reference files
      if (url.pathname.startsWith('/temp_reference/')) {
        return Response.redirect(`${url.origin}/dashboard.html`, 301);
      }
      
      // Custom request mapping for SPA behavior
      const requestOptions = {
        mapRequestToAsset: request => {
          const url = new URL(request.url);
          
          // Handle dashboard routes (SPA fallback)
          if (url.pathname.startsWith('/dashboard/') && !url.pathname.includes('.')) {
            return mapRequestToAsset(new Request(`${url.origin}/dashboard.html`, request));
          }
          
          return mapRequestToAsset(request);
        }
      };
      
      // Get asset from KV storage
      const response = await getAssetFromKV(request, requestOptions);
      
      // Clone response to modify headers
      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
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
      
      // Add CORS headers for API endpoints if needed
      if (url.pathname.startsWith('/api/')) {
        modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
        modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
      
      return modifiedResponse;
      
    } catch (error) {
      // Handle 404s by serving the dashboard (SPA fallback)
      if (error.status === 404) {
        try {
          const dashboardRequest = new Request(`${new URL(request.url).origin}/dashboard.html`);
          const dashboardResponse = await getAssetFromKV(dashboardRequest);
          
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
        } catch (dashboardError) {
          return new Response('Dashboard not found', { status: 404 });
        }
      }
      
      // Handle other errors
      console.error('Worker error:', error);
      return new Response(`Error: ${error.message}`, { 
        status: error.status || 500,
        headers: SECURITY_HEADERS
      });
    }
  }
};