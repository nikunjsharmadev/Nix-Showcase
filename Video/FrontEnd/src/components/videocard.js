export function VideoCard(video) {
  const card = document.createElement("article");
  card.className = "video-card";
  card.innerHTML = `
    <div>
      <a href="${video.url}" target="_blank" title="${video.title}" rel="noopener noreferrer">
        <img loading="lazy" alt="${video.title}" src="${video.thumbnail}" />
        <h3>${video.title}</h3>
        <p>${video.views}</p>
      </a>
    </div>`;
  return card;
}
