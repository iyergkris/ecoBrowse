// Basic background script (service worker)
// This file might be needed for future logic like handling messages,
// alarms for periodic tasks, or managing extension state across pages.

chrome.runtime.onInstalled.addListener(() => {
  console.log('EcoBrowse extension installed.');
  // Initialize default settings or perform setup tasks here if needed
  // For example, initialize local storage if not present
    chrome.storage.local.get(['ecoBrowseReports'], (result) => {
        if (!result.ecoBrowseReports) {
            chrome.storage.local.set({ ecoBrowseReports: [] }, () => {
                console.log('Initialized report storage.');
            });
        }
    });
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background:", message);

  if (message.action === "getCurrentTabUrl") {
    // Example: Get URL from the active tab if requested from popup
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0 && tabs[0].url) {
        sendResponse({ url: tabs[0].url });
      } else {
         sendResponse({ url: null, error: "Could not get active tab URL." });
      }
    });
    return true; // Indicates that the response is sent asynchronously
  }

  // Add other message handlers as needed
});

// Example: Log when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    console.log(`Tab updated: ${tab.url}`);
    // Potential place to trigger analysis or update icon based on URL
  }
});

// Note: The Next.js app runs in the popup (index.html).
// Communication between popup, background, and content scripts uses chrome.runtime.sendMessage and listeners.
// This background script primarily sets up listeners and handles tasks that need persistence beyond the popup lifecycle.
