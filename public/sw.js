const CACHE_NAME = 'fyrspit-v1';
const STATIC_CACHE_NAME = 'fyrspit-static-v1';
const RUNTIME_CACHE_NAME = 'fyrspit-runtime-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/feed',
  '/flights/new',
  '/explore',
  '/login',
  '/signup',
  '/manifest.json',
  // Add other critical assets
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE_NAME);
      console.log('Caching static assets');
      try {
        await cache.addAll(STATIC_ASSETS);
      } catch (error) {
        console.error('Failed to cache static assets:', error);
      }
    })()
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(
        name => name !== STATIC_CACHE_NAME && name !== RUNTIME_CACHE_NAME
      );
      
      await Promise.all(
        oldCaches.map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })()
  );
  
  // Take control of all pages
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;
  
  // Only handle GET requests
  if (method !== 'GET') {
    // Handle background sync for POST requests
    if (method === 'POST' && url.includes('/api/flights')) {
      event.waitUntil(handleBackgroundSync(request));
    }
    return;
  }
  
  // Handle different types of requests with appropriate strategies
  if (url.includes('/api/')) {
    // API requests - Network First with fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (url.includes('/_next/static/') || url.includes('/icons/')) {
    // Static assets - Cache First
    event.respondWith(cacheFirstStrategy(request));
  } else if (url.includes('cloudinary.com') || url.includes('images')) {
    // Images - Cache First with long TTL
    event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE_NAME));
  } else {
    // HTML pages - Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network First Strategy (for API calls)
async function networkFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for specific endpoints
    if (request.url.includes('/api/feed')) {
      return new Response(
        JSON.stringify({ 
          flights: [],
          offline: true,
          message: 'You are offline. Showing cached content when available.'
        }),
        {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request, cacheName = STATIC_CACHE_NAME) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch asset:', error);
    throw error;
  }
}

// Stale While Revalidate Strategy (for HTML pages)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Start fetch in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Network failed, return offline page if available
    if (request.mode === 'navigate') {
      return cache.match('/offline') || cachedResponse;
    }
    throw error;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Background Sync for offline flight submissions
async function handleBackgroundSync(request) {
  console.log('Handling background sync for:', request.url);
  
  try {
    // Store the request for later sync
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now()
    };
    
    // Store in IndexedDB for background sync
    await storeForBackgroundSync(requestData);
    
    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('flight-sync');
    }
    
  } catch (error) {
    console.error('Background sync setup failed:', error);
  }
}

// Store data for background sync (simplified - would use IndexedDB in production)
async function storeForBackgroundSync(requestData) {
  // This is a simplified version. In production, you'd use IndexedDB
  const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  syncQueue.push(requestData);
  localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
}

// Background Sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'flight-sync') {
    console.log('Background sync triggered');
    event.waitUntil(processSyncQueue());
  }
});

// Process queued requests
async function processSyncQueue() {
  try {
    const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    const processedRequests = [];
    
    for (const requestData of syncQueue) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        if (response.ok) {
          processedRequests.push(requestData);
          console.log('Synced request:', requestData.url);
        }
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
    
    // Remove successfully synced requests
    const remainingQueue = syncQueue.filter(
      req => !processedRequests.includes(req)
    );
    localStorage.setItem('syncQueue', JSON.stringify(remainingQueue));
    
  } catch (error) {
    console.error('Error processing sync queue:', error);
  }
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else if (event.action !== 'dismiss') {
    event.waitUntil(
      clients.openWindow('/feed')
    );
  }
});
