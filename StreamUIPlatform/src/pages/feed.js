import { ApiService } from "../services/api.js";
import { VideoCard } from "../components/videocard.js";
import { delegate } from "../core/events.js";
import { debounce } from "../utils/debounce.js";

const feedState = {
  videos: [],
  page: 1,
  loading: false,
  search: "",
};
let observer;
export function FeedPage() {
  setTimeout(() => initFeed(), 0);
  return `
  <div class="feed-container">
      <div id="feed"></div>
      <div id="sentinel"></div>
      <div id="loader" class="loader hidden">Loading...</div>
  </div>`;
}
async function initFeed() {
  const container = document.getElementById("feed");
  const sentinel = document.getElementById("sentinel");
  const loader = document.getElementById("loader");
  //load first page
  await loadVideos(container, loader);
  //start infinite scrolling
  setupObserver(container, loader, sentinel);
}
setTimeout(() => {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;
  searchInput.addEventListener(
    "input",
    debounce((e) => {
      const value = e.target.value.toLowerCase();
      filterVideos(value);
    }, 300),
  );
}, 0);
function filterVideos(query) {
  feedState.search = query.trim().toLowerCase();
  applyFilter();
}
delegate(document, ".video-card", "click", (el) => {
  console.log("video clicked: ", el);
});
async function loadVideos(container, loader) {
  try {
    feedState.loading = true;
    loader.classList.remove("hidden");
    const videos = await ApiService.getVideos(feedState.page, 6);
    feedState.videos.push(...videos);
    applyFilter();
    feedState.page++;
  } catch (err) {
    console.error("Failed to load videos", err);
  } finally {
    feedState.loading = false;
    loader.classList.add("hidden");
  }
}
function applyFilter() {
  const container = document.getElementById("feed");
  if (!feedState.search) {
    renderVideos(container, feedState.videos);
    return;
  }
  const filtered = feedState.videos.filter((video) =>
    video.title.toLowerCase().includes(feedState.search),
  );
  renderVideos(container, filtered);
}
function renderVideos(container, videos) {
  container.innerHTML = "";
  if (videos.length < 1) {
    container.innerHTML = `<div class="empty-state">
      <h2>No videos found</h2>
      <p>Try searching with a different keyword, then "<strong>${feedState.search}</strong>".</p> 
    </div>`;
    return;
  }
  container.innerHTML = videos.map(VideoCard).join("");
}
function setupObserver(container, loader, sentinel) {
  observer = new IntersectionObserver(
    async (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !feedState.loading) {
        await loadVideos(container, loader);
      }
    },
    {
      root: null,
      threshold: 1.0,
    },
  );
  observer.observe(sentinel);
}
