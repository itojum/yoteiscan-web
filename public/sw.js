const CACHE = "yoteiscan-v1";

const APP_SHELL = [
  "/",
  "/scan/text",
  "/scan/image",
  "/scan/audio",
  "/scan/link",
  "/scan/file",
  "/result",
];

// ─── Install: cache app shell ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(APP_SHELL).catch(() => {
          // ignore individual failures (e.g. page not yet built)
        })
      )
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: remove old caches ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Skip API calls — always go to network
  if (url.pathname.startsWith("/api/")) return;

  // Skip Next.js internals
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // App pages: network-first (show fresh content when online, fall back to cache)
  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // For navigation, fall back to the root page
    if (request.mode === "navigate") {
      const root = await caches.match("/");
      if (root) return root;
    }
    return new Response("オフラインです。接続を確認してください。", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
