/**
 * YouRen工具箱 Service Worker
 * 策略：页面导航 network-first（保证更新及时），静态资源 cache-first（文件名带哈希、内容不可变）。
 * 升级：改变 VERSION 常量即可让 activate 阶段清理全部旧缓存。
 */
const VERSION = 'v1';
const SHELL_CACHE = `youren-shell-${VERSION}`;
const RUNTIME_CACHE = `youren-runtime-${VERSION}`;

self.addEventListener('install', (event) => {
  const base = new URL(self.registration.scope).pathname;
  const shell = [base, `${base}favicon.svg`, `${base}manifest.webmanifest`];
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(shell))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 页面导航：优先网络，离线时回退缓存，再回退到首页
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(new URL(self.registration.scope).pathname)),
        ),
    );
    return;
  }

  // 同源静态资源：cache-first
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
