import { useEffect, useRef, useState } from "react";

// Membuat elemen "tahu" posisi kursor lewat variabel CSS --mx, --my, --px, --py
export function useMouseFollow<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    let targetX = 0.5, targetY = 0.5;
    let currentX = 0.5, currentY = 0.5;
    let frame = 0;
    let running = false;

    const loop = () => {
      // 0.08 = kehalusan gerak. Makin kecil makin "lembam"
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      el.style.setProperty("--mx", `${currentX * 100}%`);
      el.style.setProperty("--my", `${currentY * 100}%`);
      el.style.setProperty("--px", `${currentX - 0.5}`);
      el.style.setProperty("--py", `${currentY - 0.5}`);

      const moving =
        Math.abs(targetX - currentX) > 0.001 ||
        Math.abs(targetY - currentY) > 0.001;
      if (moving) frame = requestAnimationFrame(loop);
      else running = false;
    };

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      targetX = (e.clientX - r.left) / r.width;
      targetY = (e.clientY - r.top) / r.height;
      if (!running) {
        running = true;
        frame = requestAnimationFrame(loop);
      }
    };

    el.addEventListener("mousemove", onMove);
    return () => {
      el.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}


// Mendeteksi section mana yang sedang terlihat, untuk menandai menu aktif
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      // garis deteksi ada di sekitar tengah layar
      { rootMargin: "-40% 0px -55% 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}