
const CACHE_NAME = "tymly-shell-v5";

const APP_FILES = [
    "./",
    "./index.html",
    "./styles/style.css",
    "./scripts/app.js",
    "./manifest.webmanifest",
    "./assets/tymly-icon.png",
    "./engagements.html",
    "./add-engagement.html",
    "./scripts/database.js",
    "./scripts/engagements.js",
    "./scripts/add-engagement.js"
];

// Install and cache application files
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
    );

    self.skipWaiting();
});

// Activate and remove outdated caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});

// Network-first strategy
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok) {
                    const responseCopy = response.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseCopy);
                    });
                }

                return response;
            })
            .catch(async () => {
                const cachedResponse = await caches.match(event.request);

                if (cachedResponse) return cachedResponse;

                if (event.request.mode === "navigate") {
                    return caches.match("./index.html");
                }

                return Response.error();
            })
    );
});
