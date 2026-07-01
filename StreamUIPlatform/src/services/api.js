export class ApiService {
  static async getVideos(page = 1, limit = 6) {
    //simulate real API latency
    await new Promise((res) => setTimeout(res, 500));
    const videos = Array.from({ length: limit }, (_, i) => {
      const id = (page - 1) * limit + i + 1;
      return {
        id,
        title: `video ${id} - Vanilla JS Deep Dive `,
        views: `${Math.floor(Math.random() * 1000)} views`,
        thumbnail: `https://picsum.photos/300/180?random=${id}`,
      };
    });
    return videos;
  }
}
