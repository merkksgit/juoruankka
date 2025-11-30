// State Management
const state = {
  articles: [],
  currentView: "feed",
  currentTopic: "all",
  settings: {
    rssFeeds: [],
  },
  hasUnsavedChanges: false,
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

// Header Date Update
function updateHeaderDate() {
  const dateElement = document.getElementById("header-date");
  if (dateElement) {
    const now = new Date();
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    dateElement.textContent = now.toLocaleDateString("fi-FI", options);
  }
}

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
  updateHeaderDate();
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
      if (
        feed.category === undefined ||
        feed.category === null ||
        feed.category === "omat"
      ) {
        // Try to find matching default feed to get its category
        const defaultFeed = DEFAULT_RSS_FEEDS.find(
          (defaultFeed) => defaultFeed.url === feed.url,
        );
        // Default feeds get their original category, custom feeds get null (will show in "all")
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

  renderSettings();
}

function saveSettings() {
  localStorage.setItem("espresso-settings", JSON.stringify(state.settings));
}

async function saveSettingsAndRefresh() {
  saveSettings();
  state.hasUnsavedChanges = false;
  await loadArticles();
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
    Omat: [],
  };

  state.settings.rssFeeds.forEach((feed, index) => {
    const feedData = { feed, index };

    if (!feed.isDefault) {
      groupedFeeds["Omat"].push(feedData);
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

  console.log("Custom feeds count:", groupedFeeds["Omat"].length);

  // Create columns container
  const columnsContainer = document.createElement("div");
  columnsContainer.className = "source-columns";

  // Render each source as a column
  Object.entries(groupedFeeds).forEach(([source, feeds]) => {
    if (feeds.length === 0) return;

    // Create column
    const column = document.createElement("div");
    column.className = "source-column";

    // Column header with select all checkbox
    const columnHeader = document.createElement("div");
    columnHeader.className = "source-column-header";

    // Check if all feeds in this source are enabled
    const allEnabled = feeds.every(({ feed }) => feed.enabled);
    const noneEnabled = feeds.every(({ feed }) => !feed.enabled);
    const someEnabled = !allEnabled && !noneEnabled;

    columnHeader.innerHTML = `
      <label class="source-header-label">
        <input
          type="checkbox"
          class="source-select-all"
          ${allEnabled ? "checked" : ""}
          onchange="toggleAllInSource('${source}')"
        >
        <span>${source}</span>
      </label>
    `;
    column.appendChild(columnHeader);

    // Set indeterminate state if some but not all are enabled
    if (someEnabled) {
      const checkbox = columnHeader.querySelector(".source-select-all");
      checkbox.indeterminate = true;
    }

    // Column feeds list
    const feedsList = document.createElement("div");
    feedsList.className = "source-column-feeds";

    feeds.forEach(({ feed, index }) => {
      const feedItem = document.createElement("div");
      feedItem.className = "feed-checkbox-item";

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
                    <label class="feed-checkbox-label">
                        <input
                            type="checkbox"
                            class="feed-checkbox"
                            ${feed.enabled ? "checked" : ""}
                            onchange="toggleFeed(${index})"
                        >
                        <span class="feed-name">${escapeHtml(shortName)}</span>
                    </label>
                `;
      } else {
        // Custom feed with remove button
        feedItem.innerHTML = `
                    <div class="custom-feed-checkbox-item">
                        <label class="feed-checkbox-label">
                            <input
                                type="checkbox"
                                class="feed-checkbox"
                                ${feed.enabled ? "checked" : ""}
                                onchange="toggleFeed(${index})"
                            >
                            <span class="feed-name">${escapeHtml(feed.name)}</span>
                        </label>
                        <button class="btn-remove-compact" onclick="removeFeed(${index})" title="Remove feed">×</button>
                    </div>
                `;
      }

      feedsList.appendChild(feedItem);
    });

    column.appendChild(feedsList);
    columnsContainer.appendChild(column);
  });

  rssFeedsList.appendChild(columnsContainer);
}

function toggleFeed(index) {
  state.settings.rssFeeds[index].enabled =
    !state.settings.rssFeeds[index].enabled;
  state.hasUnsavedChanges = true;
  renderSettings();
}

function toggleAllInSource(source) {
  // Find all feeds in this source
  const feedsInSource = [];
  state.settings.rssFeeds.forEach((feed, index) => {
    let feedSource = null;
    if (!feed.isDefault) {
      feedSource = "Omat";
    } else if (feed.name.startsWith("Yle")) {
      feedSource = "Yle";
    } else if (feed.name.startsWith("HS ")) {
      feedSource = "Helsingin Sanomat";
    } else if (feed.name.startsWith("Iltalehti")) {
      feedSource = "Iltalehti";
    } else if (feed.name.startsWith("IS ")) {
      feedSource = "Ilta-Sanomat";
    }

    if (feedSource === source) {
      feedsInSource.push({ feed, index });
    }
  });

  // Check current state
  const allEnabled = feedsInSource.every(({ feed }) => feed.enabled);

  // Toggle all feeds in this source
  feedsInSource.forEach(({ index }) => {
    state.settings.rssFeeds[index].enabled = !allEnabled;
  });

  state.hasUnsavedChanges = true;
  renderSettings();
}

async function removeFeed(index) {
  const confirmed = await customConfirm(
    "Haluatko varmasti poistaa tämän lähteen?",
    "Poista lähde",
  );
  if (confirmed) {
    state.settings.rssFeeds.splice(index, 1);
    state.hasUnsavedChanges = true;
    renderSettings();
  }
}

async function resetSettings() {
  const confirmed = await customConfirm(
    "Haluatko varmasti palauttaa oletusasetukset?",
    "Palauta asetukset",
  );
  if (confirmed) {
    // Create a deep copy of default feeds to avoid reference issues
    state.settings.rssFeeds = JSON.parse(JSON.stringify(DEFAULT_RSS_FEEDS));

    saveSettings();
    state.hasUnsavedChanges = false;
    renderSettings();
    await loadArticles();
  }
}

// Event Listeners
function initializeEventListeners() {
  // Navigation
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const view = e.currentTarget.dataset.view;
      await switchView(view);
    });
  });

  // Settings buttons
  document
    .getElementById("save-settings-btn")
    .addEventListener("click", async () => {
      await saveSettingsAndRefresh();
    });
  document
    .getElementById("refresh-now-btn")
    .addEventListener("click", async () => {
      const confirmed = await customConfirm(
        "Haluatko päivittää kaikki artikkelit nyt?",
        "Päivitä artikkelit",
      );
      if (confirmed) {
        loadArticles();
      }
    });
  document
    .getElementById("reset-settings-btn")
    .addEventListener("click", resetSettings);
}

// View Management
async function switchView(view) {
  // Check for unsaved changes when leaving settings
  if (
    state.currentView === "settings" &&
    view !== "settings" &&
    state.hasUnsavedChanges
  ) {
    const saveChanges = await customConfirm(
      "Sinulla on tallentamattomia muutoksia. Haluatko tallentaa ne ennen poistumista?",
      "Tallentamattomat muutokset",
    );

    if (saveChanges) {
      // Save settings and refresh articles
      await saveSettingsAndRefresh();
    } else {
      // Discard changes - reload settings from localStorage
      loadSettings();
      state.hasUnsavedChanges = false;
    }
  }

  state.currentView = view;

  // Update nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  // Update views
  document.querySelectorAll(".view").forEach((v) => {
    v.classList.toggle("active", v.id === `${view}-view`);
  });

  // Hide/show sidebar based on view
  const sidebar = document.getElementById("topic-sidebar");
  if (sidebar) {
    sidebar.style.display = view === "feed" ? "block" : "none";
  }
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

  // Scroll to top when switching topics
  window.scrollTo({ top: 0, behavior: "smooth" });
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
      "Artikkeleiden lataus epäonnistui. Tarkista asetukset ja yritä uudelleen.",
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

      // Use the feed's category
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

// Article Rendering
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

  // Auto-refresh every 60 minutes
  const minutes = 60;

  autoRefreshInterval = setInterval(
    () => {
      console.log("Auto-refreshing articles...");
      loadArticles();
    },
    minutes * 60 * 1000,
  );
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
