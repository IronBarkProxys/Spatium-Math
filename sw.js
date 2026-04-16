// scram/sw.js - Simple & Reliable Scramjet Service Worker

// Load the main Scramjet bundle (relative path from inside /scram/ folder)
importScripts("./scramjet.all.js");

// Wait until the script is fully loaded before using it
self.addEventListener("install", () => {
    console.log("Scramjet Service Worker installing...");
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
    console.log("✅ Scramjet Service Worker activated");
});

// Main fetch handler
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Only handle requests that go through the Scramjet prefix
    if (url.pathname.startsWith("/scram/") || 
        url.pathname.includes("/scramjet.") || 
        url.origin === location.origin) {

        event.respondWith(handleScramjetRequest(event));
    }
});

async function handleScramjetRequest(event) {
    try {
        // Load Scramjet dynamically
        if (typeof $scramjetLoadWorker === "undefined") {
            console.warn("Scramjet not ready yet");
            return fetch(event.request);
        }

        const { ScramjetServiceWorker } = $scramjetLoadWorker();
        const scramjet = new ScramjetServiceWorker();

        await scramjet.loadConfig();

        if (scramjet.route(event)) {
            return await scramjet.fetch(event);
        }

        return fetch(event.request);
    } catch (err) {
        console.error("Scramjet fetch error:", err);
        return fetch(event.request);
    }
}

console.log("✅ Scramjet sw.js loaded");