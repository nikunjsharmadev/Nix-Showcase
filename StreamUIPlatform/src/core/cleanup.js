let observer;
export function cleanup() {
  if (observer) {
    observer.disconnect();
  }
  window.removeEventListener("scroll", handleScroll);
}
