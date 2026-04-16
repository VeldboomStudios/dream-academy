/**
 * Honeycomb visual primitive.
 * A subtle, mathematically-generated hex grid referencing
 * Siegfried Nassuth's Bijlmer masterplan.
 */

interface HoneycombProps {
  className?: string;
  cols?: number;
  rows?: number;
  size?: number;
  strokeWidth?: number;
  accent?: number | number[]; // indexes of cells to fill with honey accent
  ink?: string;
  accentColor?: string;
}

export function Honeycomb({
  className = "",
  cols = 6,
  rows = 8,
  size = 36,
  strokeWidth = 1,
  accent = [],
  ink = "currentColor",
  accentColor = "#C89F4A",
}: HoneycombProps) {
  const accentSet = new Set(Array.isArray(accent) ? accent : [accent]);
  const w = size * 2;
  const h = Math.sqrt(3) * size;
  const padding = strokeWidth * 2;

  const hexPath = (cx: number, cy: number) => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = cx + size * Math.cos(angle);
      const y = cy + size * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return `M${points.join(" L")} Z`;
  };

  const cells: React.ReactElement[] = [];
  let idx = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = row % 2 === 1 ? w * 0.75 : 0;
      const cx = col * w * 1.5 + offsetX + size + padding;
      const cy = row * h * 0.5 + size + padding;
      const isAccent = accentSet.has(idx);
      cells.push(
        <path
          key={`${row}-${col}`}
          d={hexPath(cx, cy)}
          fill={isAccent ? accentColor : "none"}
          stroke={ink}
          strokeWidth={strokeWidth}
          opacity={isAccent ? 1 : 0.18}
        />
      );
      idx++;
    }
  }

  const totalW = cols * w * 1.5 + size + padding * 2;
  const totalH = rows * h * 0.5 + size + padding * 2;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${totalW} ${totalH}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {cells}
    </svg>
  );
}

/**
 * Small hex — for stats, badges, bullets
 */
export function Hex({
  className = "",
  filled = false,
  size = 24,
  style,
}: {
  className?: string;
  filled?: boolean;
  size?: number;
  style?: React.CSSProperties;
}) {
  const r = size / 2;
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = r + r * 0.92 * Math.cos(angle);
    const y = r + r * 0.92 * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d={`M${points.join(" L")} Z`}
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
