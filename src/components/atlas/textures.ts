/**
 * Procedural planet & nebula texture generators using Canvas.
 * Each planet gets a unique surface based on its base color + a seed.
 */

import * as THREE from "three";

const cache = new Map<string, THREE.CanvasTexture>();

/* ────────────────────────────────────────────────────
 * PLANET SURFACE TEXTURE
 * ──────────────────────────────────────────────────── */

interface PlanetTextureOpts {
  baseColor: string;
  seed?: number;
  detail?: number; // 0-1, how busy the surface is
  bands?: boolean; // gas-giant style horizontal bands
}

export function makePlanetTexture({
  baseColor,
  seed = 1,
  detail = 0.6,
  bands = false,
}: PlanetTextureOpts): THREE.CanvasTexture {
  const cacheKey = `${baseColor}-${seed}-${detail}-${bands}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const W = 1024;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Base fill
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, W, H);

  // ─── Procedural noise ────────────────────
  const rand = (x: number, y: number) => {
    const v = Math.sin(x * 12.9898 + y * 78.233 + seed * 31.0) * 43758.5453;
    return v - Math.floor(v);
  };

  const smooth = (x: number, y: number) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    const a = rand(ix, iy);
    const b = rand(ix + 1, iy);
    const c = rand(ix, iy + 1);
    const d = rand(ix + 1, iy + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };

  const fbm = (x: number, y: number, oct = 5) => {
    let value = 0,
      amp = 0.5,
      freq = 1;
    for (let i = 0; i < oct; i++) {
      value += amp * smooth(x * freq, y * freq);
      freq *= 2;
      amp *= 0.5;
    }
    return value;
  };

  const img = ctx.getImageData(0, 0, W, H);
  const data = img.data;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Sample at multiple scales
      let n = fbm(x * 0.012, y * 0.012, 5);

      if (bands) {
        // Gas-giant bands: emphasize horizontal structure
        const band = Math.sin(y * 0.04 + n * 4) * 0.5 + 0.5;
        n = n * 0.5 + band * 0.5;
      }

      // Map noise to brightness factor (0.5 dim to 1.4 bright)
      const factor = 0.5 + n * detail * 1.5;
      const i = (y * W + x) * 4;
      data[i] = Math.min(255, Math.max(0, data[i] * factor));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor));
    }
  }
  ctx.putImageData(img, 0, 0);

  // Subtle highlights — bright micro dots (impact craters / surface specks)
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(255, 240, 200, 0.04)";
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  cache.set(cacheKey, tex);
  return tex;
}

/* ────────────────────────────────────────────────────
 * NEBULA BACKGROUND (rendered onto giant inside-out sphere)
 * Subtle warm cosmic dust + brightness gradient
 * ──────────────────────────────────────────────────── */

let nebulaCache: THREE.CanvasTexture | null = null;

export function makeNebulaTexture(): THREE.CanvasTexture {
  if (nebulaCache) return nebulaCache;

  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Base obsidian
  ctx.fillStyle = "#0A0604";
  ctx.fillRect(0, 0, W, H);

  // ─── Subtle brightness gradient — fake galactic plane band ───
  const horizonGrad = ctx.createLinearGradient(0, 0, 0, H);
  horizonGrad.addColorStop(0, "rgba(20, 12, 8, 1)");
  horizonGrad.addColorStop(0.45, "rgba(40, 20, 12, 1)");
  horizonGrad.addColorStop(0.5, "rgba(70, 35, 18, 1)");
  horizonGrad.addColorStop(0.55, "rgba(40, 20, 12, 1)");
  horizonGrad.addColorStop(1, "rgba(20, 12, 8, 1)");
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, 0, W, H);

  // ─── Coloured cosmic clouds (procedural blobs) ───
  const cloudColors = [
    "rgba(228, 184, 102, 0.07)", // honey
    "rgba(160, 90, 60, 0.06)",   // rust
    "rgba(80, 50, 110, 0.05)",   // deep purple
    "rgba(60, 100, 130, 0.04)",  // teal
    "rgba(220, 100, 70, 0.05)",  // terracotta
  ];

  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 18; i++) {
    const cx = Math.random() * W;
    const cy = H * 0.3 + Math.random() * H * 0.4;
    const r = 200 + Math.random() * 400;
    const color = cloudColors[i % cloudColors.length];
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // ─── Stars across the entire sphere ───
  ctx.globalCompositeOperation = "lighter";

  // Background dim stars (lots of them)
  for (let i = 0; i < 3500; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const a = Math.random() * 0.5 + 0.05;
    const r = Math.random() * 0.6;
    ctx.fillStyle = `rgba(255, 245, 220, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mid-bright stars
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const a = 0.4 + Math.random() * 0.5;
    const r = 0.6 + Math.random() * 1.0;
    ctx.fillStyle = `rgba(255, 240, 210, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bright stars with tiny halo
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 1.4 + Math.random() * 1.2;
    // Halo
    const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
    const tint = Math.random();
    const tintColor =
      tint < 0.5
        ? "255, 240, 210"
        : tint < 0.8
          ? "230, 200, 255"
          : "200, 220, 255";
    halo.addColorStop(0, `rgba(${tintColor}, 0.7)`);
    halo.addColorStop(0.4, `rgba(${tintColor}, 0.15)`);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
    // Core
    ctx.fillStyle = `rgba(${tintColor}, 1)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  nebulaCache = tex;
  return tex;
}

/* ────────────────────────────────────────────────────
 * Hash a string to a stable seed for deterministic textures
 * ──────────────────────────────────────────────────── */
export function seedFromString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(h % 10000);
}
