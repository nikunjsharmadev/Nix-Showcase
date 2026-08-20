export function Skeleton(count = 6) {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";
  for (let i = 0; i < count; i++) {
    feed.innerHTML += `
    <div class="video-card skeleton-card">
      <div class="skeleton skeleton-thumbnail"></div>
        <div class="text-block">
        <div class="skeleton skeleton-line title"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>
    </div>`;
  }
}
