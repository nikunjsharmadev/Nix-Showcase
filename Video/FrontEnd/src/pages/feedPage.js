import { ApiService } from "../services/index.js";
import { VideoCard, Skeleton } from "../components/index.js";
import { debounce, setupObserver } from "../utils/index.js";
import { FEED_STATE } from "../const/index.js";
export function FeedPage() {
  setTimeout(() => initFeed(), 0);
  return `
  <div class="feed-container">
      <div id="feed" class="feed"></div>
      <div id="sentinel"></div>
      <div id="loader" class="loader hidden">Loading...</div>
  </div>`;
}
export function filterVideos(query) {
  FEED_STATE.search = query.trim().toLowerCase();
  applyFilter();
}
function applyFilter() {
  const container = document.getElementById("feed");
  if (!FEED_STATE.search) {
    renderVideos(container, FEED_STATE.videos);
    return;
  }
  const filtered = FEED_STATE.videos.filter((video) =>
    video.title.toLowerCase().includes(FEED_STATE.search),
  );
  renderVideos(container, filtered);
}
function renderVideos(container, videos) {
  container.innerHTML = "";
  if (videos.length < 1) {
    container.innerHTML = `
    <div class="empty-state">
      <h2>No videos found</h2>
      <p>Try searching with a different keyword, then "<strong>${FEED_STATE.search}</strong>".</p> 
    </div>`;
    return;
  }
  const fragment = document.createDocumentFragment();
  videos.forEach((video) => {
    fragment.appendChild(VideoCard(video));
  });
  container.innerHTML = "";
  container.appendChild(fragment);
}
function moderateVideo(video) {
  const unsafeKeywords = ["spam", "fake"];
  const isUnsafe = unsafeKeywords.some((word) =>
    video.title.toLowerCase().includes(word),
  );
  return {
    ...video,
    flagged: isUnsafe,
  };
}
async function loadVideos(container, loader) {
  try {
    FEED_STATE.loading = true;
    loader.classList.remove("hidden");
    if (FEED_STATE.page === 1) Skeleton(8);
    const apiService = new ApiService();
    const videos = await apiService.getVideos(FEED_STATE.page, 8);
    FEED_STATE.videos.push(...videos);
    applyFilter();
    FEED_STATE.page++;
  } catch (err) {
    console.error("Failed to load videos", err);
  } finally {
    FEED_STATE.loading = false;
    loader.classList.add("hidden");
  }
}
async function initFeed() {
  const container = document.getElementById("feed");
  const sentinel = document.getElementById("sentinel");
  const loader = document.getElementById("loader");
  //load first page
  await loadVideos(container, loader);
  //start infinite scrolling
  setupObserver(container, loader, sentinel, FEED_STATE.loading, loadVideos);
}
