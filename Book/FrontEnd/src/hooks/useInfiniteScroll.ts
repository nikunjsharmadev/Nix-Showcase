import { useEffect, type RefObject } from "react";
interface Props {
  target: RefObject<HTMLDivElement | null>;
  onIntersect: () => void;
}
export function useInfiniteScroll({ target, onIntersect }: Props) {
  useEffect(() => {
    if (!target.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      { threshold: 1 },
    );
    observer.observe(target.current);
    return () => observer.disconnect();
  }, [target, onIntersect]);
}
