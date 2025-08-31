// Website classification - expanded lists
const productiveSites = [
  'github.com', 'stackoverflow.com', 'leetcode.com', 
  'docs.google.com/document', 'docs.google.com/spreadsheets',
  'codecademy.com', 'udemy.com', 'coursera.org', 'developer.mozilla.org',
  'w3schools.com', 'freecodecamp.org', 'gitlab.com', 'bitbucket.org',
  'notion.so', 'trello.com', 'atlassian.com', 'medium.com/tech'
];

const unproductiveSites = [
  'facebook.com', 'twitter.com', 'instagram.com',
  'youtube.com', 'reddit.com', 'netflix.com',
  'tiktok.com', 'pinterest.com', '9gag.com',
  'twitch.tv', 'dailymotion.com', 'vimeo.com',
  'ebay.com', 'amazon.com/shopping'
];

// Track active tab and time spent
let currentTab = null;
let startTime = null;
let currentDomain = null;
let isProductive = null;

// Initialize timeData
let timeData = {};
loadInitialData();

function loadInitialData() {
  chrome.storage.local.get('timeData', (result) => {
    timeData = result.timeData || {};
    console.log('Initial data loaded', timeData);
  });
}

// Track tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    updateActiveTab(tab);
  });
});

// Track URL changes and tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    updateActiveTab(tab);
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // No window is focused (browser lost focus)
    saveCurrentTabTime();
  } else {
    chrome.tabs.query({active: true, windowId: windowId}, (tabs) => {
      if (tabs[0]) updateActiveTab(tabs[0]);
    });
  }
});

// Update the active tab information
function updateActiveTab(tab) {
  // Save previous tab's time
  saveCurrentTabTime();

  // Set new tab info
  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      currentTab = tab.id;
      currentDomain = url.hostname.replace('www.', '');
      isProductive = classifyWebsite(currentDomain);
      startTime = Date.now();
      
      console.log(`Now tracking: ${currentDomain} (${getCategoryName(isProductive)})`);
    } catch (e) {
      console.error('Error parsing URL:', e);
    }
  }
}

function saveCurrentTabTime() {
  if (currentTab && startTime && currentDomain) {
    const timeSpent = Math.round((Date.now() - startTime) / 1000); // in seconds
    if (timeSpent > 0) {
      updateTimeData(currentDomain, timeSpent, isProductive);
      console.log(`Saved ${timeSpent}s on ${currentDomain}`);
    }
    startTime = Date.now(); // Reset timer for the new tab
  }
}

// Classify website as productive or unproductive
function classifyWebsite(domain) {
  domain = domain.toLowerCase();
  
  if (productiveSites.some(site => domain.includes(site.toLowerCase()))) {
    return true;
  }
  if (unproductiveSites.some(site => domain.includes(site.toLowerCase()))) {
    return false;
  }
  return null; // neutral
}

function getCategoryName(productive) {
  return productive === true ? 'Productive' : 
         productive === false ? 'Unproductive' : 'Neutral';
}

// Update time data in storage
function updateTimeData(domain, seconds, productive) {
  const today = getCurrentDate();
  
  if (!timeData[today]) {
    timeData[today] = {
      productive: 0,
      unproductive: 0,
      neutral: 0,
      domains: {}
    };
  }
  
  const category = productive === true ? 'productive' : 
                   productive === false ? 'unproductive' : 'neutral';
  
  timeData[today][category] += seconds;
  
  if (!timeData[today].domains[domain]) {
    timeData[today].domains[domain] = {
      time: 0,
      productive: productive
    };
  }
  
  timeData[today].domains[domain].time += seconds;
  
  chrome.storage.local.set({ timeData }, () => {
    console.log('Data saved:', timeData[today]);
  });
}

function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Save data periodically and when browser closes
chrome.alarms.create('saveData', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'saveData') {
    saveCurrentTabTime();
  }
});

// Save when extension is unloaded
chrome.runtime.onSuspend.addListener(() => {
  saveCurrentTabTime();
});