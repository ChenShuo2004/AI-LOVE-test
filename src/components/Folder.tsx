import { type ReactNode, useState } from "react";
import "./Folder.css";

type FolderProps = {
  color?: string;
  coverImage?: string;
  size?: number;
  items?: ReactNode[];
  className?: string;
  defaultOpen?: boolean;
  open?: boolean;
  label?: ReactNode;
  onOpenChange?: (open: boolean) => void;
};

type PaperOffset = {
  x: number;
  y: number;
};

function darkenColor(hex: string, percent: number) {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const num = Number.parseInt(color, 16);
  let red = (num >> 16) & 0xff;
  let green = (num >> 8) & 0xff;
  let blue = num & 0xff;

  red = Math.max(0, Math.min(255, Math.floor(red * (1 - percent))));
  green = Math.max(0, Math.min(255, Math.floor(green * (1 - percent))));
  blue = Math.max(0, Math.min(255, Math.floor(blue * (1 - percent))));

  return `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1).toUpperCase()}`;
}

function Folder({
  color = "#A97A93",
  coverImage,
  size = 1,
  items = [],
  className = "",
  defaultOpen = false,
  open: controlledOpen,
  label,
  onOpenChange,
}: FolderProps) {
  const maxItems = 3;
  const papers = items.slice(0, maxItems);
  while (papers.length < maxItems) papers.push(null);

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const [paperOffsets, setPaperOffsets] = useState<PaperOffset[]>(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })),
  );

  const folderStyle = {
    "--folder-color": color,
    "--folder-back-color": darkenColor(color, 0.08),
    "--folder-cover-image": coverImage ? `url("${coverImage}")` : "none",
    "--paper-1": darkenColor("#ffffff", 0.1),
    "--paper-2": darkenColor("#ffffff", 0.05),
    "--paper-3": "#ffffff",
  } as React.CSSProperties & Record<`--${string}`, string>;

  const handleClick = (event?: React.MouseEvent<HTMLDivElement>) => {
    if (event?.target instanceof HTMLElement && event.target.closest(".paper")) return;
    const nextOpen = !open;
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (open) setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
  };

  const handlePaperMouseMove = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (!open) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (event.clientX - centerX) * 0.15;
    const offsetY = (event.clientY - centerY) * 0.15;

    setPaperOffsets((previous) => {
      const next = [...previous];
      next[index] = { x: offsetX, y: offsetY };
      return next;
    });
  };

  const handlePaperMouseLeave = (_event: React.MouseEvent<HTMLDivElement>, index: number) => {
    setPaperOffsets((previous) => {
      const next = [...previous];
      next[index] = { x: 0, y: 0 };
      return next;
    });
  };

  return (
    <div style={{ transform: `scale(${size})` }} className={className}>
      <div
        className={`folder ${open ? "open" : ""} ${coverImage ? "folder--cover" : ""}`}
        style={folderStyle}
        onClick={(event) => handleClick(event)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-label={open ? "收起题卡夹" : "打开题卡夹"}
      >
        <div className="folder__back">
          {papers.map((item, index) => (
            <div
              key={index}
              className={`paper paper-${index + 1}`}
              onMouseMove={(event) => handlePaperMouseMove(event, index)}
              onMouseLeave={(event) => handlePaperMouseLeave(event, index)}
              style={
                open
                  ? {
                      "--magnet-x": `${paperOffsets[index]?.x || 0}px`,
                      "--magnet-y": `${paperOffsets[index]?.y || 0}px`,
                    } as React.CSSProperties & Record<`--${string}`, string>
                  : undefined
              }
            >
              {item}
            </div>
          ))}
          <div className="folder__front">
            {label && <span className="folder__label">{label}</span>}
          </div>
          <div className="folder__front right" />
        </div>
      </div>
    </div>
  );
}

export default Folder;
