import { useEffect, useRef } from "react";

// ---- PENGATURAN ----
const GAP = 24; // jarak antar titik (px)
const RADIUS = 150; // jangkauan efek di sekitar kursor (px)
const EASE = 0.12; // kehalusan gerak (kecil = lebih lambat)
// ---------------------

export default function HeroDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover)").matches;
    const dpr = window.devicePixelRatio || 1;

    let width = 0;
    let height = 0;
    let mx = 0, my = 0; // posisi kursor sebenarnya
    let cx = 0, cy = 0; // posisi yang diikuti dengan halus
    let strength = 0; // 0 = efek mati, 1 = efek penuh
    let target = 0;
    let frame = 0;
    let running = false;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let x = GAP / 2; x < width; x += GAP) {
        for (let y = GAP / 2; y < height; y += GAP) {
          const d = Math.hypot(x - cx, y - cy);
          const t = Math.max(0, 1 - d / RADIUS) * strength;
          if (t > 0.01) {
            ctx.fillStyle = `rgba(29, 78, 216, ${0.2 + t * 0.7})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.2 + t * 2.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = "rgba(11, 59, 111, 0.14)";
            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const loop = () => {
      cx += (mx - cx) * EASE;
      cy += (my - cy) * EASE;
      strength += (target - strength) * 0.08;
      draw();
      if (target === 1 || strength > 0.01) {
        frame = requestAnimationFrame(loop);
      } else {
        strength = 0;
        draw();
        running = false;
      }
    };

    const start = () => {
      if (!running) {
        running = true;
        frame = requestAnimationFrame(loop);
      }
    };

    const resize = () => {
      const r = parent.getBoundingClientRect();
      width = r.width;
      height = r.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const onMove = (e: MouseEvent) => {
      const r = parent.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      if (target === 0) {
        cx = mx;
        cy = my;
      }
      target = 1;
      start();
    };
    const onLeave = () => {
      target = 0;
      start();
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduced && canHover) {
      parent.addEventListener("mousemove", onMove);
      parent.addEventListener("mouseleave", onLeave);
    }
    return () => {
      window.removeEventListener("resize", resize);
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-dots" aria-hidden="true" />;
}