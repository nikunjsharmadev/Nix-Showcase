export function VideoCard(video) {
  const card = document.createElement("article");
  card.className = "video-card";
  card.innerHTML = `
    <div class="video-card">
      <img loading="lazy" src="${video.thumbnail}" />
      <h3>${video.title}</h3>
      <p>${video.views}</p>
    </div>`;
  return card;
}
