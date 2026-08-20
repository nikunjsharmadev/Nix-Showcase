export function setupObserver(container, loader, sentinel, loading, fn) {
  const observer = new IntersectionObserver(
    async (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading) {
        await fn(container, loader);
      }
    },
    {
      root: null,
      threshold: 0,
      rootMargin: "200px",
    },
  );
  observer.observe(sentinel);
}
