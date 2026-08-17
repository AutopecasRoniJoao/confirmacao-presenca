const CACHE_NAME = 'presenca-roni-v1';

// Arquivos que serão salvos em cache para uso offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './painel.html',
  './manifest.json',
  'https://roni.com.br/wp-content/uploads/2023/02/Logomarca-RONI-oficial.jpg'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Armazenando arquivos em cache');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação das requisições (Servir do cache quando offline)
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retorna a resposta do cache se existir; caso contrário, busca na rede
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Valida se a resposta é válida antes de armazenar
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clona a resposta para salvar uma cópia no cache
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback caso a rede falhe e o recurso não esteja no cache
        console.log('[Service Worker] Falha ao carregar recurso sem conexão.');
      });
    })
  );
});
