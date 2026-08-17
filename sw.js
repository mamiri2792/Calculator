const CACHE_NAME = "calcnova-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icon.svg"
];


/* =========================
   INSTALL
========================= */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(APP_FILES);

      })
      .then(() => {

        return self.skipWaiting();

      })

  );

});


/* =========================
   ACTIVATE
========================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(cacheNames => {

        return Promise.all(

          cacheNames
            .filter(cacheName => {

              return (
                cacheName !== CACHE_NAME
              );

            })
            .map(cacheName => {

              return caches.delete(
                cacheName
              );

            })

        );

      })
      .then(() => {

        return self.clients.claim();

      })

  );

});


/* =========================
   FETCH
========================= */

self.addEventListener("fetch", event => {

  /*
    Only handle normal GET requests.
  */

  if (event.request.method !== "GET") {
    return;
  }


  event.respondWith(

    caches.match(event.request)
      .then(cachedResponse => {

        /*
          If the file is already cached,
          use the cached version.
        */

        if (cachedResponse) {
          return cachedResponse;
        }


        /*
          Otherwise try the network.
        */

        return fetch(event.request)
          .then(networkResponse => {

            /*
              Save a copy for future
              offline use.
            */

            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === "basic"
            ) {

              const responseClone =
                networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => {

                  cache.put(
                    event.request,
                    responseClone
                  );

                });

            }

            return networkResponse;

          })
          .catch(() => {

            /*
              If the internet is unavailable
              and the requested file isn't
              cached, fall back to the app.
            */

            return caches.match(
              "./index.html"
            );

          });

      })

  );

});
