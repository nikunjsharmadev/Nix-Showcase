import { VIDEOS } from "../const/index.js";
export class ApiService {
  async getVideos(page = 1, limit = 6) {
    //simulate real API latency
    await new Promise((res) => setTimeout(res, 500));
    const videos = Array.from({ length: limit }, (_, i) => {
      const id = (page - 1) * limit + i + 1;
      const randomVideoIndex = Math.floor(Math.random() * VIDEOS.length);
      const video = VIDEOS[randomVideoIndex];
      return {
        id,
        title: `${video.name}`,
        views: `${Math.floor(Math.random() * 1000)} views`,
        thumbnail: `./assets/${video.name}.webp`,
        url: `${video.url}`,
      };
    });
    return videos;
  }
}
