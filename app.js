// State Management
const state = {
  articles: [],
  currentView: "feed",
  currentTopic: "all",
  settings: {
    rssFeeds: [],
    autoRefresh: 15,
  },
};

// Default Configuration
const DEFAULT_RSS_FEEDS = [
  // General News (Kotimaa)
  {
    name: "Yle Kotimaa",
    url: "https://yle.fi/rss/t/18-34837/fi",
    category: "kotimaa",
    enabled: true,
    isDefault: true,
  },
  {
    name: "HS Kotimaa",
    url: "https://www.hs.fi/rss/suomi.xml",
    category: "kotimaa",
    enabled: true,
    isDefault: true,
  },
  {
    name: "Iltalehti Kotimaa",
    url: "https://www.iltalehti.fi/rss/kotimaa.xml",
    category: "kotimaa",
    enabled: true,
    isDefault: true,
  },
  {
    name: "IS Kotimaa",
    url: "https://www.is.fi/rss/kotimaa.xml",
    category: "kotimaa",
    enabled: true,
    isDefault: true,
  },

  // International News (Ulkomaat)
  {
    name: "Yle Ulkomaat",
    url: "https://yle.fi/rss/t/18-34953/fi",
    category: "ulkomaat",
    enabled: true,
    isDefault: true,
  },
  {
    name: "HS Ulkomaat",
    url: "https://www.hs.fi/rss/maailma.xml",
    category: "ulkomaat",
    enabled: true,
    isDefault: true,
  },
  {
    name: "Iltalehti Ulkomaat",
    url: "https://www.iltalehti.fi/rss/ulkomaat.xml",
    category: "ulkomaat",
    enabled: true,
    isDefault: true,
  },
  {
    name: "IS Ulkomaat",
    url: "https://www.is.fi/rss/ulkomaat.xml",
    category: "ulkomaat",
    enabled: true,
    isDefault: true,
  },

  // Sports (Urheilu)
  {
    name: "Yle Urheilu",
    url: "https://yle.fi/rss/urheilu",
    category: "urheilu",
    enabled: true,
    isDefault: true,
  },
  {
    name: "HS Urheilu",
    url: "https://www.hs.fi/rss/urheilu.xml",
    category: "urheilu",
    enabled: true,
    isDefault: true,
  },
  {
    name: "Iltalehti Urheilu",
    url: "https://www.iltalehti.fi/rss/urheilu.xml",
    category: "urheilu",
    enabled: true,
    isDefault: true,
  },
  {
    name: "IS Urheilu",
    url: "https://www.is.fi/rss/urheilu.xml",
    category: "urheilu",
    enabled: true,
    isDefault: true,
  },

  // Economy & Business (Talous)
  {
    name: "Yle Talous",
    url: "https://yle.fi/rss/t/18-19274/fi",
    category: "talous",
    enabled: true,
    isDefault: true,
  },
  {
    name: "HS Talous",
    url: "https://www.hs.fi/rss/talous.xml",
    category: "talous",
    enabled: true,
    isDefault: true,
  },
  {
    name: "Iltalehti Talous",
    url: "https://www.iltalehti.fi/rss/talous.xml",
    category: "talous",
    enabled: true,
    isDefault: true,
  },

  // Technology & Science (Teknologia/Tiede)
  {
    name: "Yle Tiede",
    url: "https://yle.fi/rss/t/18-819/fi",
    category: "tiede",
    enabled: true,
    isDefault: true,
  },
  {
    name: "Iltalehti Digi",
    url: "https://www.iltalehti.fi/rss/digi.xml",
    category: "teknologia",
    enabled: true,
    isDefault: true,
  },

  // Entertainment (Viihde)
  {
    name: "Yle Viihde",
    url: "https://yle.fi/rss/t/18-36066/fi",
    category: "viihde",
    enabled: true,
    isDefault: true,
  },
  {
    name: "Iltalehti Viihde",
    url: "https://www.iltalehti.fi/rss/viihde.xml",
    category: "viihde",
    enabled: true,
    isDefault: true,
  },
  {
    name: "IS Viihde",
    url: "https://www.is.fi/rss/viihde.xml",
    category: "viihde",
    enabled: true,
    isDefault: true,
  },
];

// Topic categories for filtering
const TOPICS = [
  { id: "all", name: "Kaikki" },
  { id: "kotimaa", name: "Kotimaa" },
  { id: "ulkomaat", name: "Ulkomaat" },
  { id: "talous", name: "Talous" },
  { id: "teknologia", name: "Teknologia" },
  { id: "urheilu", name: "Urheilu" },
  { id: "viihde", name: "Viihde" },
  { id: "tiede", name: "Tiede" },
];

// Sidebar Rendering
function renderTopicSidebar() {
  const topicNav = document.getElementById("topic-nav");
  topicNav.innerHTML = TOPICS.map(
    (topic) => `
        <button
            class="topic-btn ${topic.id === "all" ? "active" : ""}"
            data-topic="${topic.id}"
            onclick="switchTopic('${topic.id}')"
        >
            <span class="topic-name">${topic.name}</span>
        </button>
    `,
  ).join("");
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderTopicSidebar();
  loadSettings();
  initializeEventListeners();
  loadArticles();
  setupAutoRefresh();
});

// Settings Management
function loadSettings() {
  const savedSettings = localStorage.getItem("espresso-settings");

  if (savedSettings) {
    state.settings = JSON.parse(savedSettings);

    // Migrate old settings: add enabled/isDefault/category flags if missing
    state.settings.rssFeeds = state.settings.rssFeeds.map((feed) => {
      if (feed.enabled === undefined) {
        feed.enabled = true;
      }
      if (feed.isDefault === undefined) {
        // Check if this feed matches a default feed
        const isDefault = DEFAULT_RSS_FEEDS.some(
          (defaultFeed) => defaultFeed.url === feed.url,
        );
        feed.isDefault = isDefault;
      }
      if (feed.category === undefined) {
        // Try to find matching default feed to get its category
        const defaultFeed = DEFAULT_RSS_FEEDS.find(
          (defaultFeed) => defaultFeed.url === feed.url,
        );
        feed.category = defaultFeed ? defaultFeed.category : null;
      }
      return feed;
    });

    saveSettings();
  } else {
    // First time - use defaults
    state.settings.rssFeeds = DEFAULT_RSS_FEEDS;
    saveSettings();
  }

  // Load auto-refresh setting
  const autoRefresh = localStorage.getItem("auto-refresh");
  if (autoRefresh) {
    state.settings.autoRefresh = parseInt(autoRefresh);
    document.getElementById("auto-refresh").value = autoRefresh;
  }

  renderSettings();
}

function saveSettings() {
  localStorage.setItem("espresso-settings", JSON.stringify(state.settings));
}

function renderSettings() {
  const rssFeedsList = document.getElementById("rss-feeds-list");
  rssFeedsList.innerHTML = "";

  // Group feeds by source
  const groupedFeeds = {
    Yle: [],
    "Helsingin Sanomat": [],
    Iltalehti: [],
    "Ilta-Sanomat": [],
    Custom: [],
  };

  state.settings.rssFeeds.forEach((feed, index) => {
    const feedData = { feed, index };

    if (!feed.isDefault) {
      groupedFeeds["Custom"].push(feedData);
      console.log("Custom feed found:", feed.name);
    } else if (feed.name.startsWith("Yle")) {
      groupedFeeds["Yle"].push(feedData);
    } else if (feed.name.startsWith("HS ")) {
      groupedFeeds["Helsingin Sanomat"].push(feedData);
    } else if (feed.name.startsWith("Iltalehti")) {
      groupedFeeds["Iltalehti"].push(feedData);
    } else if (feed.name.startsWith("IS ")) {
      groupedFeeds["Ilta-Sanomat"].push(feedData);
    }
  });

  console.log("Custom feeds count:", groupedFeeds["Custom"].length);

  // Render each source group
  Object.entries(groupedFeeds).forEach(([source, feeds]) => {
    if (feeds.length === 0) return;

    // Source header
    const sourceHeader = document.createElement("div");
    sourceHeader.className = "source-header";
    sourceHeader.textContent = source;
    rssFeedsList.appendChild(sourceHeader);

    // Source feeds container
    const sourceContainer = document.createElement("div");
    sourceContainer.className = "source-feeds";

    feeds.forEach(({ feed, index }) => {
      const feedItem = document.createElement("div");
      feedItem.className = "feed-item-compact";

      if (feed.isDefault) {
        // Extract short name (remove source prefix)
        let shortName = feed.name;
        if (source === "Yle") shortName = feed.name.replace("Yle ", "");
        if (source === "Helsingin Sanomat")
          shortName = feed.name.replace("HS ", "");
        if (source === "Iltalehti")
          shortName = feed.name.replace("Iltalehti ", "");
        if (source === "Ilta-Sanomat") shortName = feed.name.replace("IS ", "");

        feedItem.innerHTML = `
                    <label class="feed-checkbox-label-compact">
                        <input
                            type="checkbox"
                            class="feed-checkbox"
                            ${feed.enabled ? "checked" : ""}
                            onchange="toggleFeed(${index})"
                        >
                        <span class="feed-name-compact">${escapeHtml(shortName)}</span>
                    </label>
                `;
      } else {
        // Custom feed - compact style with checkbox and remove button
        feedItem.innerHTML = `
                    <div class="custom-feed-item">
                        <label class="feed-checkbox-label-compact">
                            <input
                                type="checkbox"
                                class="feed-checkbox"
                                ${feed.enabled ? "checked" : ""}
                                onchange="toggleFeed(${index})"
                            >
                            <span class="feed-name-compact">${escapeHtml(feed.name)}</span>
                        </label>
                        <button class="btn-remove-compact" onclick="removeFeed(${index})" title="Remove feed">×</button>
                    </div>
                `;
      }

      sourceContainer.appendChild(feedItem);
    });

    rssFeedsList.appendChild(sourceContainer);
  });
}

async function addFeed() {
  const urlInput = document.getElementById("new-feed-url");
  const nameInput = document.getElementById("new-feed-name");

  const url = urlInput.value.trim();
  const name = nameInput.value.trim();

  if (!url) {
    await customAlert("Please enter a feed URL", "Missing URL");
    return;
  }

  if (!name) {
    await customAlert("Please enter a feed name", "Missing Name");
    return;
  }

  state.settings.rssFeeds.push({
    name,
    url,
    category: null,
    enabled: true,
    isDefault: false,
  });
  saveSettings();
  renderSettings();

  urlInput.value = "";
  nameInput.value = "";

  showNotification("RSS feed added successfully!");
}

function toggleFeed(index) {
  state.settings.rssFeeds[index].enabled =
    !state.settings.rssFeeds[index].enabled;
  saveSettings();
  showNotification(
    state.settings.rssFeeds[index].enabled ? "Feed enabled" : "Feed disabled",
  );
}

async function removeFeed(index) {
  const confirmed = await customConfirm(
    "Are you sure you want to remove this feed?",
    "Remove Feed",
  );
  if (confirmed) {
    state.settings.rssFeeds.splice(index, 1);
    saveSettings();
    renderSettings();
    showNotification("Feed removed");
  }
}

function updateAutoRefresh() {
  const value = document.getElementById("auto-refresh").value;
  localStorage.setItem("auto-refresh", value);
  state.settings.autoRefresh = parseInt(value);
  setupAutoRefresh();
  showNotification("Auto-refresh updated");
}

async function resetSettings() {
  const confirmed = await customConfirm(
    "Are you sure you want to reset all settings to defaults? This cannot be undone.",
    "Reset Settings",
  );
  if (confirmed) {
    localStorage.clear();
    state.settings.rssFeeds = DEFAULT_RSS_FEEDS;
    state.settings.autoRefresh = 15;

    saveSettings();
    renderSettings();

    document.getElementById("auto-refresh").value = "15";

    showNotification("Settings reset to defaults");
    loadArticles();
  }
}

// Event Listeners
function initializeEventListeners() {
  // Navigation
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const view = e.currentTarget.dataset.view;
      switchView(view);
    });
  });

  // Settings buttons
  document.getElementById("add-feed-btn").addEventListener("click", addFeed);
  document.getElementById("refresh-now-btn").addEventListener("click", () => {
    loadArticles();
    showNotification("Refreshing...");
  });
  document
    .getElementById("reset-settings-btn")
    .addEventListener("click", resetSettings);

  // Auto-refresh selector
  document
    .getElementById("auto-refresh")
    .addEventListener("change", updateAutoRefresh);

  // Allow Enter key to add feeds
  document.getElementById("new-feed-url").addEventListener("keypress", (e) => {
    if (e.key === "Enter") addFeed();
  });
  document.getElementById("new-feed-name").addEventListener("keypress", (e) => {
    if (e.key === "Enter") addFeed();
  });
}

// View Management
function switchView(view) {
  state.currentView = view;

  // Update nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  // Update views
  document.querySelectorAll(".view").forEach((v) => {
    v.classList.toggle("active", v.id === `${view}-view`);
  });
}

function goToHome() {
  // Switch to feed view
  switchView("feed");
  // Switch to "Kaikki" (all) topic
  switchTopic("all");
}

function switchTopic(topicId) {
  state.currentTopic = topicId;

  // Update topic buttons
  document.querySelectorAll(".topic-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.topic === topicId);
  });

  renderArticles();
}

// Article Fetching
async function loadArticles() {
  showLoading(true);
  hideError();

  state.articles = [];

  try {
    const promises = [];

    // Fetch RSS feeds (only enabled ones)
    state.settings.rssFeeds.forEach((feed) => {
      if (feed.enabled) {
        promises.push(fetchRSSFeed(feed));
      }
    });

    await Promise.all(promises);

    // Sort by date (newest first)
    state.articles.sort((a, b) => b.timestamp - a.timestamp);

    renderArticles();
  } catch (error) {
    console.error("Error loading articles:", error);
    showError(
      "Failed to load articles. Please check your settings and try again.",
    );
  } finally {
    showLoading(false);
  }
}

async function fetchRSSFeed(feed) {
  try {
    // Using rss2json.com API to convert RSS to JSON and handle CORS
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "ok") {
      console.warn(`Failed to fetch ${feed.name}: ${data.message}`);
      console.warn(`Try removing this feed or checking the URL in settings`);
      return;
    }

    if (!data.items || data.items.length === 0) {
      console.warn(`No items found in ${feed.name}`);
      return;
    }

    data.items.forEach((item) => {
      const title = item.title;
      const description = stripHtml(item.description || item.content || "");

      // Use the feed's category instead of keyword matching
      const topics = feed.category ? [feed.category] : ["all"];

      // Get categories/tags from RSS feed
      const tags = item.categories || [];

      state.articles.push({
        id: generateId(),
        title: title,
        description: description.substring(0, 200),
        url: item.link,
        image:
          item.enclosure?.link ||
          item.thumbnail ||
          extractImageFromContent(item.content),
        source: feed.name,
        sourceType: "rss",
        timestamp: new Date(item.pubDate).getTime(),
        date: formatDate(new Date(item.pubDate)),
        topics: topics,
        tags: tags,
      });
    });
  } catch (error) {
    console.error(`Error fetching RSS feed ${feed.name}:`, error.message);
    console.warn(
      `Skipping ${feed.name} - try again later or remove it from settings`,
    );
  }
}

// ========================================
// Article Rendering
// ========================================

function renderArticles() {
  const grid = document.getElementById("articles-grid");
  const emptyState = document.getElementById("empty-state");

  // Filter articles by current topic
  let filteredArticles = state.articles;
  if (state.currentTopic !== "all") {
    filteredArticles = state.articles.filter(
      (article) =>
        article.topics && article.topics.includes(state.currentTopic),
    );
  }

  if (filteredArticles.length === 0) {
    grid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  grid.innerHTML = filteredArticles
    .map((article) => {
      // Limit tags to first 4 for cleaner UI
      const displayTags =
        article.tags && article.tags.length > 0
          ? article.tags
              .slice(0, 4)
              .map(
                (tag) => `<span class="article-tag">${escapeHtml(tag)}</span>`,
              )
              .join("")
          : "";

      return `
            <div class="article-card" data-id="${article.id}" onclick="openArticle('${article.url}')">
                ${article.image ? `<img src="${article.image}" alt="${escapeHtml(article.title)}" class="article-image" onerror="this.style.display='none'">` : ""}
                <div class="article-content">
                    <span class="article-source">${escapeHtml(article.source)}</span>
                    <h3 class="article-title">${escapeHtml(article.title)}</h3>
                    ${article.description ? `<p class="article-description">${escapeHtml(article.description)}...</p>` : ""}
                    ${displayTags ? `<div class="article-tags">${displayTags}</div>` : ""}
                    <div class="article-meta">
                        <span class="article-date">${article.date}</span>
                    </div>
                </div>
            </div>
        `;
    })
    .join("");
}

// Article Actions
function openArticle(url) {
  window.open(url, "_blank");
}

// Auto-Refresh
let autoRefreshInterval = null;

function setupAutoRefresh() {
  // Clear existing interval
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }

  const minutes = state.settings.autoRefresh;

  if (minutes > 0) {
    autoRefreshInterval = setInterval(
      () => {
        console.log("Auto-refreshing articles...");
        loadArticles();
      },
      minutes * 60 * 1000,
    );
  }
}

// UI Helpers
function showLoading(show) {
  document.getElementById("loading").classList.toggle("hidden", !show);
}

function showError(message) {
  const errorEl = document.getElementById("error");
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

function hideError() {
  document.getElementById("error").classList.add("hidden");
}

function showNotification(message) {
  // Simple notification (you could enhance this with a toast notification)
  console.log("Notification:", message);

  // Create temporary notification
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Utility Functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function extractImageFromContent(html) {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

// Custom Modal Functions
function customConfirm(message, title = "Confirm") {
  return new Promise((resolve) => {
    const modal = document.getElementById("custom-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalMessage = document.getElementById("modal-message");
    const confirmBtn = document.getElementById("modal-confirm");
    const cancelBtn = document.getElementById("modal-cancel");

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Show both buttons for confirm
    cancelBtn.style.display = "block";
    confirmBtn.textContent = "OK";

    modal.classList.remove("hidden");

    const handleConfirm = () => {
      modal.classList.add("hidden");
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      modal.classList.add("hidden");
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      confirmBtn.removeEventListener("click", handleConfirm);
      cancelBtn.removeEventListener("click", handleCancel);
    };

    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", handleCancel);
  });
}

function customAlert(message, title = "Notice") {
  return new Promise((resolve) => {
    const modal = document.getElementById("custom-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalMessage = document.getElementById("modal-message");
    const confirmBtn = document.getElementById("modal-confirm");
    const cancelBtn = document.getElementById("modal-cancel");

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    // Hide cancel button for alert
    cancelBtn.style.display = "none";
    confirmBtn.textContent = "OK";

    modal.classList.remove("hidden");

    const handleConfirm = () => {
      modal.classList.add("hidden");
      confirmBtn.removeEventListener("click", handleConfirm);
      resolve();
    };

    confirmBtn.addEventListener("click", handleConfirm);
  });
}

// Add CSS animation styles dynamically
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
