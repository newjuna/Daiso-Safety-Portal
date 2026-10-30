/* 다이소 안전 포털 · 서비스 워커 (P1.0)
 * 인터넷이 되면 언제나 새 파일 먼저 (GitHub 에 올리면 바로 반영) · 안 되면 받아 둔 포털 화면
 * 포털 파일만 저장 (밀착지원 · 도급 같은 다른 시스템은 손대지 않음)
 * index.html 의 VER 를 올릴 때 CACHE 이름도 같이 올림 */
const CACHE = 'portal-P1.0';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/favicon-32.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url), mine = u.origin === self.location.origin && u.pathname.startsWith(new URL(self.registration.scope).pathname);
  if (!mine && u.hostname !== 'cdn.jsdelivr.net') return;   // 다른 시스템 · 그 밖은 그대로 인터넷으로
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try { const res = await fetch(r); if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()).catch(() => {}); return res; }
    catch (err) {
      const hit = await c.match(r, { ignoreSearch: mine }); if (hit) return hit;
      if (r.mode === 'navigate') { const idx = await c.match('./index.html') || await c.match('./'); if (idx) return idx; }
      throw err;
    }
  })());
});
