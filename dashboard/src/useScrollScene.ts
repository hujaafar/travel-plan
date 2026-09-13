import { useEffect, type RefObject } from "react";

/** Scroll Craft's progress/device model, with explicit React lifecycle cleanup.
 * Only one paint is queued per frame. There is no idle animation loop or wheel interception.
 */
export function useScrollScene(
  root: RefObject<HTMLDivElement | null>,
  revision: string,
  onStop: (index: number) => void,
) {
  useEffect(() => {
    const scene = root.current;
    if (!scene) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const acts = [...scene.querySelectorAll<HTMLElement>("[data-sc-act]")];
    const stops = [...scene.querySelectorAll<HTMLElement>("[data-route-stop]")];
    let frame = 0;
    let selected = -1;
    function paint() {
      frame = 0;
      if (!scene || document.hidden) return;
      const height = window.innerHeight;
      for (const act of acts) {
        const box = act.getBoundingClientRect();
        if (box.bottom < -height || box.top > height * 2) continue;
        const progress = Math.max(
          0,
          Math.min(1, (height - box.top) / (height + box.height)),
        );
        act.style.setProperty(
          "--sc-p",
          reduced.matches ? "0.35" : progress.toFixed(4),
        );
      }
      let current = 0;
      stops.forEach((stop, index) => {
        if (stop.getBoundingClientRect().top < height * 0.52) current = index;
      });
      if (current !== selected) {
        selected = current;
        onStop(current);
      }
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(paint);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    scene
      .querySelectorAll("[data-sc-in]")
      .forEach((el) => observer.observe(el));
    const resize = new ResizeObserver(schedule);
    resize.observe(scene);
    scene.classList.add("motion-ready");
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    reduced.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      reduced.removeEventListener("change", schedule);
      observer.disconnect();
      resize.disconnect();
      scene.classList.remove("motion-ready");
    };
  }, [root, revision, onStop]);
}
