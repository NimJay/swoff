/**
 * swoff.js
 * A Service Worker that provides offline usage by caching GET responses.
 *
 * @version 1.0.0
 * @author Nim Jayawardena - Feel free to bother me with questions!
 */


const CACHE_NAME = 'my-app-1.0.1'; // Used for versioning your cache.


/**
 * Only URL listed in URL_CACHE_INFO will be cached.
 * Only GET requests will be cached.
 *
 * @typedef {Object} UrlCacheInfo
 * @property {string} url
 * @property {boolean} cacheAsap - If true, Swoff will cache as soon as possible.
 */
const URL_CACHE_INFO = [
  { url: '/', cacheAsap: true },
  { url: '/index.html', cacheAsap: true },
  { url: '/assets/script.js', cacheAsap: true },
  { url: '/assets/stylesheet.css', cacheAsap: true },
  { url: '/assets/script-not.js', cacheAsap: false },
  { url: '/assets/script-not-cached-asap.js', cacheAsap: false },
];


const LOG = true; // Disable/Enable console.log()s as you like.


function log(msg) {
  if (LOG) {
    console.log(`%cSwoff %c${msg}`, 'text-shadow: 0px 0px 5px #79dc64;', '');
  }
}


function main() {
  log('Running...');
  self.addEventListener('install', (event) => {
    log('Installing...');
    cacheAsaps(event);
  });
  interceptFetches();
}


/**
 * @param {string} relUrl - Something like "/path/to/file".
 * @returns {string} - Something like "https://my-app.com/path/to/file"
 */
function relUrlToAbsUrl(relUrl) {
  return location.origin + relUrl;
}


function getUrlCacheInfo(url) {
  log(`getUrlCacheInfo(${url})`);
  return URL_CACHE_INFO.find((urlInfo) => {
    const absoluteUrl = relUrlToAbsUrl(urlInfo.url);
    return absoluteUrl === url;
  });
}


function cacheAsaps() {
  return caches.open(CACHE_NAME).then((cache) => {
    const urlsToCache = URL_CACHE_INFO
      .filter(urlInfo => urlInfo.cacheAsap)
      .map(urlInfo => urlInfo.url);
    // TODO: See if there's a cleaner way to handle empty urlsToCache.
    log(`Caching all of ${urlsToCache.join(', ')}.`);
    return cache.addAll(urlsToCache);
  });
}


function interceptFetches() {
  self.addEventListener('fetch', (event) => {
    log(`Intercepting fetch of ${event.request.url}`);
    const interception = fetchFromNetwork(event.request)
      .catch(() => fetchFromCache(event.request));
    event.respondWith(interception);
  });
}


function fetchFromNetwork(request) {
  return new Promise((resolve, reject) => {
    if (!navigator.onLine) {
      log('We are offline.');
      return reject();
    }

    const timeoutId = setTimeout(reject, 5000);
    let fetchedResponse = null;

    log(`Fetching from network ${request.url}.`);
    fetch(request)
      .then((response) => {
        fetchedResponse = response;
        clearTimeout(timeoutId);
        return cacheUrl(request.url);
      })
      .then(() => resolve(fetchedResponse));
  });
}


function fetchFromCache(request) {
  log(`Fetching from cache: ${request.url}.`);
  return caches.open(CACHE_NAME)
    .then(cache => cache.match(request))
    .then((matching) => {
      if (!matching) { log(`Cache missed for ${request.url}.`); }
      return matching || Promise.reject();
    });
}


function cacheUrl(url) {
  return caches.open(CACHE_NAME).then((cache) => {
    const cacheInfo = getUrlCacheInfo(url);
    if (cacheInfo) {
      log(`Caching ${url}.`);
      return cache.add(url);
    }
    log(`Not caching ${url}.`);
  });
}


try {
  main();
} catch (err) {
  log('Failed to run.');
}
