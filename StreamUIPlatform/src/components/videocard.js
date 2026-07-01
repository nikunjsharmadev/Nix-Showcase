export function VideoCard(video) {
  return `<div class="video-card">
            <img loading="lazy" src="${video.thumbnail}" />
            <h3>${video.title}</h3>
            <p>${video.views} views</p>
        </div>
    `;
}
