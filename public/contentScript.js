// Basic content script
// This script runs in the context of the web pages the user visits.
// It can interact with the DOM of the page or send messages to the background script.

console.log("EcoBrowse content script loaded.");

// Example: Send a message to the background script when the page loads
// window.addEventListener('load', () => {
//   chrome.runtime.sendMessage({ action: "pageLoaded", url: window.location.href });
// });

// This could potentially be used for more advanced features like
// analyzing page content directly or interacting with page elements,
// but for the current scope, it might not be heavily used.
