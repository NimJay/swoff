![Swoff Logo](https://github.com/NimJay/swoff/blob/master/other/logo-small.png)


# Swoff
Swoff allows for offline usage of your web app, by caching certain URLs.
"Swoff" is a mash of "Service Worker" and "Offline".


## How to Use Swoff
To bring Swoff into your app:
1. Configure `swoff.js`.
2. Place `swoff.js` in the root directory of your app.
3. Register `swoff.js` in one of your `<script>`s.
```javascript
if (navigator.serviceWorker) {
    navigator.serviceWorker.register("/swoff.js");
} else {
    // Service workers not supported. :(
}
```


## How to Configure Swoff
Take a look at `URL_CACHE_INFO` in `swoff.js`.
This is where you configure the caching of your URLs (files).
```javascript
const URL_CACHE_INFO = [
    { url: '/path/to/cached/file' }
]
```

After Swoff is registered and installed, it will wait until `/path/to/cached/file` is requested from the server, 
and cache `/path/to/cached/file` when the server responds with it.

If you want to cache `/path/to/cached/file` *as soon as* Swoff is registered and *installed*, use cacheAsap: true. In other words, Swoff won't wait for the next request for `/path/to/cached/file`.
```javascript
const URL_CACHE_INFO = [
    { url: '/path/to/cached/file', cacheAsap: true }
]
```

Finally, use `CACHE_NAME` to manage the versioning of Swoff's cache.
That is, change `CACHE_NAME` as the cached files' contents change.


## Swoff's Role in Your App

To understand how Swoff fits into your web app, let's look at the typical lifecycle of a web app using Swoff.

### Your Web App's Lifecycle (with Swoff)
1. `index.html` is loaded.
2. `index.html` loads its assets (CSS, JavaScript, etc.).
3. One of the `<script>`s registers Swoff.
4. Swoff installs itself.
5. Swoff immediately stores, in its cache, all URLs where `cacheAsap` is `true`.
6. For URLs where `cacheAsap` is falsy, Swoff waits for the next `GET` request for that file. When the server responds with the file, that file is added to Swoff's cache.
7. Now, whenever a cached file is requested by the browser, Swoff intercepts the request and retrieves the file from its cache (if the response from the service is too slow, or the client is offline).

