/* 빠른정답 서비스 워커: 껍데기 파일만 기기에 저장(오프라인에서도 열림). 데이터는 앱이 IndexedDB 에 따로 저장.
   반관리 등 같은 주소의 다른 페이지는 건드리지 않는다. */
const V = 'quick-v1';
const FILES = ['quick.html', 'firebase-config.js', 'quick.webmanifest', 'quick-icon-192.png', 'quick-icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k.startsWith('quick-')).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const name = u.pathname.split('/').pop();
  if (!FILES.includes(name)) return;
  const icon = /\.png$|\.webmanifest$/.test(name);
  e.respondWith(icon
    ? caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request))
    : fetch(e.request).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(name, cp)); return res; })
        .catch(() => caches.match(name)));
});
