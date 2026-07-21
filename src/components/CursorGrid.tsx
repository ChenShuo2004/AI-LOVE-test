import { useEffect, useRef } from "react";
import "./CursorGrid.css";

type Falloff = "linear" | "smooth" | "sharp";

type CursorGridProps = {
  cellSize?: number;
  color?: string;
  radius?: number;
  falloff?: Falloff;
  holdTime?: number;
  fadeDuration?: number;
  lineWidth?: number;
  maxOpacity?: number;
  fillOpacity?: number;
  gridOpacity?: number;
  cellRadius?: number;
  clickPulse?: boolean;
  pulseSpeed?: number;
  className?: string;
};

type CursorGridRuntimeProps = Required<Omit<CursorGridProps, "className">>;

const falloffCurves: Record<Falloff, (value: number) => number> = {
  linear: (value) => value,
  smooth: (value) => value * value * (3 - 2 * value),
  sharp: (value) => value * value * value,
};

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;
  const num = Number.parseInt(value.slice(0, 6), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255] as const;
}

function CursorGrid({
  cellSize = 70,
  color = "#D946EF",
  radius = 140,
  falloff = "smooth",
  holdTime = 400,
  fadeDuration = 800,
  lineWidth = 1.2,
  maxOpacity = 1,
  fillOpacity = 0,
  gridOpacity = 0,
  cellRadius = 0,
  clickPulse = true,
  pulseSpeed = 600,
  className = "",
}: CursorGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef<CursorGridRuntimeProps>({
    cellSize,
    color,
    radius,
    falloff,
    holdTime,
    fadeDuration,
    lineWidth,
    maxOpacity,
    fillOpacity,
    gridOpacity,
    cellRadius,
    clickPulse,
    pulseSpeed,
  });
  const wakeRef = useRef<(() => void) | null>(null);

  propsRef.current = {
    cellSize,
    color,
    radius,
    falloff,
    holdTime,
    fadeDuration,
    lineWidth,
    maxOpacity,
    fillOpacity,
    gridOpacity,
    cellRadius,
    clickPulse,
    pulseSpeed,
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pulses: Array<{ x: number; y: number; t0: number }> = [];
    let cols = 0;
    let rows = 0;
    let offX = 0;
    let offY = 0;
    let alphas = new Float32Array(0);
    let touched = new Float64Array(0);
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let lastFrame = 0;

    const rebuild = () => {
      const props = propsRef.current;
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / props.cellSize) + 1;
      rows = Math.ceil(height / props.cellSize) + 1;
      offX = (width - cols * props.cellSize) / 2;
      offY = (height - rows * props.cellSize) / 2;
      alphas = new Float32Array(cols * rows);
      touched = new Float64Array(cols * rows);
    };

    const cellCenter = (index: number) => {
      const props = propsRef.current;
      const cx = offX + (index % cols) * props.cellSize + props.cellSize / 2;
      const cy = offY + Math.floor(index / cols) * props.cellSize + props.cellSize / 2;
      return [cx, cy] as const;
    };

    const energize = (x: number, y: number, boost = 1) => {
      const props = propsRef.current;
      const activeRadius = Math.max(props.radius, 1);
      const ease = falloffCurves[props.falloff] ?? falloffCurves.linear;
      const now = performance.now();
      const minCol = Math.max(0, Math.floor((x - activeRadius - offX) / props.cellSize));
      const maxCol = Math.min(cols - 1, Math.floor((x + activeRadius - offX) / props.cellSize));
      const minRow = Math.max(0, Math.floor((y - activeRadius - offY) / props.cellSize));
      const maxRow = Math.min(rows - 1, Math.floor((y + activeRadius - offY) / props.cellSize));

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const index = row * cols + col;
          const [cx, cy] = cellCenter(index);
          const distance = Math.hypot(cx - x, cy - y);
          if (distance > activeRadius) continue;
          const level = ease(1 - distance / activeRadius) * props.maxOpacity * boost;
          if (level > alphas[index]) {
            alphas[index] = level;
            touched[index] = now;
          } else if (level > 0) {
            touched[index] = now;
          }
        }
      }
    };

    const draw = (now: number) => {
      const props = propsRef.current;
      const dt = Math.min(now - lastFrame, 50);
      lastFrame = now;
      ctx.clearRect(0, 0, width, height);
      const [red, green, blue] = hexToRgb(props.color);

      if (props.gridOpacity > 0) {
        ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${props.gridOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let col = 0; col <= cols; col++) {
          const x = Math.round(offX + col * props.cellSize) + 0.5;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let row = 0; row <= rows; row++) {
          const y = Math.round(offY + row * props.cellSize) + 0.5;
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      for (let pulseIndex = pulses.length - 1; pulseIndex >= 0; pulseIndex--) {
        const pulse = pulses[pulseIndex];
        const age = (now - pulse.t0) / 1000;
        const ringRadius = age * props.pulseSpeed;
        if (ringRadius > Math.hypot(width, height)) {
          pulses.splice(pulseIndex, 1);
          continue;
        }
        const band = props.cellSize;
        const minCol = Math.max(0, Math.floor((pulse.x - ringRadius - band - offX) / props.cellSize));
        const maxCol = Math.min(cols - 1, Math.floor((pulse.x + ringRadius + band - offX) / props.cellSize));
        const minRow = Math.max(0, Math.floor((pulse.y - ringRadius - band - offY) / props.cellSize));
        const maxRow = Math.min(rows - 1, Math.floor((pulse.y + ringRadius + band - offY) / props.cellSize));
        for (let row = minRow; row <= maxRow; row++) {
          for (let col = minCol; col <= maxCol; col++) {
            const index = row * cols + col;
            const [cx, cy] = cellCenter(index);
            const distance = Math.hypot(cx - pulse.x, cy - pulse.y);
            if (Math.abs(distance - ringRadius) < band / 2 && props.maxOpacity > alphas[index]) {
              alphas[index] = props.maxOpacity;
              touched[index] = now;
            }
          }
        }
      }

      let anyVisible = pulses.length > 0;
      const fadeStep = dt / Math.max(props.fadeDuration, 16);
      const half = props.cellSize / 2;

      for (let index = 0; index < alphas.length; index++) {
        let alpha = alphas[index];
        if (alpha <= 0) continue;
        if (now - touched[index] > props.holdTime) {
          alpha = Math.max(0, alpha - fadeStep);
          alphas[index] = alpha;
          if (alpha <= 0) continue;
        }
        anyVisible = true;
        const [cx, cy] = cellCenter(index);
        const gradient = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, props.cellSize);
        gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);

        const x = cx - half + 0.5;
        const y = cy - half + 0.5;
        const size = props.cellSize - 1;
        ctx.beginPath();
        if (props.cellRadius > 0) {
          ctx.roundRect(x, y, size, size, props.cellRadius);
        } else {
          ctx.rect(x, y, size, size);
        }
        if (props.fillOpacity > 0) {
          ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * props.fillOpacity})`;
          ctx.fill();
        }
        ctx.strokeStyle = gradient;
        ctx.lineWidth = props.lineWidth;
        ctx.stroke();
      }

      if (anyVisible) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        if (propsRef.current.gridOpacity <= 0) ctx.clearRect(0, 0, width, height);
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(draw);
    };
    wakeRef.current = wake;

    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top] as const;
    };

    const isInside = (x: number, y: number) => x >= 0 && y >= 0 && x <= width && y <= height;

    const onPointerMove = (event: PointerEvent) => {
      const [x, y] = toLocal(event);
      if (!isInside(x, y)) return;
      energize(x, y);
      wake();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!propsRef.current.clickPulse) return;
      const [x, y] = toLocal(event);
      if (!isInside(x, y)) return;
      pulses.push({ x, y, t0: performance.now() });
      wake();
    };

    const resizeObserver = new ResizeObserver(() => {
      rebuild();
      wake();
    });

    resizeObserver.observe(container);
    rebuild();
    wake();

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [cellSize]);

  useEffect(() => {
    wakeRef.current?.();
  }, [gridOpacity, color, lineWidth, maxOpacity, fillOpacity, cellRadius]);

  return (
    <div ref={containerRef} className={`cursor-grid${className ? ` ${className}` : ""}`}>
      <canvas ref={canvasRef} className="cursor-grid__canvas" />
    </div>
  );
}

export default CursorGrid;
