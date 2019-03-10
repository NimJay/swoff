console.log("script.js - Running.");

if (navigator.serviceWorker) {
    console.log("script.js - Registering /swoff.js.");
    navigator.serviceWorker.register("/swoff.js");
} else {
    console.log("script.js - Service Workers not supported. :(");
}
