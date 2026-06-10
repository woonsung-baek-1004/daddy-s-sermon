/* AI & DADDY'S SERMON — Service Worker v1.0 */
const CACHE_NAME = 'sermon-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

/* 설치 — 정적 파일 캐시 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 캐시 설치 중...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* 활성화 — 구버전 캐시 삭제 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* 네트워크 요청 처리 — Cache First 전략 */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          /* 오프라인 fallback */
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

/* 백그라운드 동기화 — 설교 업로드 오프라인 큐 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sermon-upload') {
    event.waitUntil(syncPendingUploads());
  }
});

async function syncPendingUploads() {
  const db = await openDB();
  const pending = await db.getAll('pending-uploads');
  for (const item of pending) {
    try {
      await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      await db.delete('pending-uploads', item.id);
    } catch (e) {
      console.log('[SW] 업로드 대기 중:', item.id);
    }
  }
}

/* 푸시 알림 — 새 공동체 설교 알림 */
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body || '새로운 아빠의 설교가 올라왔어요',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '보기' },
      { action: 'close', title: '닫기' },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'AI & DADDY\'S SERMON',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});
