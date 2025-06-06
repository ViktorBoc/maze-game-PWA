const CACHE_NAME = "maze-game-cache-v1";
const urlsToCache = [
    "./",
    "./index.html",
    "./src/css/style.css",
    "./src/css/print.css",
    "./src/js/script.js",
    "./src/json/mazes.json",
    "./src/assets/images/favicon.png",
    "./src/assets/images/favicon144.png",
    "https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/darkly/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});