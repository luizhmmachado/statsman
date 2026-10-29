export function FormSparkline({
  values,
  width = 120,
  height = 34,
  color = "#B7F34A",
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const points = values.filter((value) => Number.isFinite(value));

  if (points.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden="true">
        <line
          x1="2"
          y1={height / 2}
          x2={width - 2}
          y2={height / 2}
          stroke="#22303D"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = (width - 4) / (points.length - 1);

  const coordinates = points.map((value, index) => {
    const x = 2 + index * step;
    const y = height - 4 - ((value - min) / span) * (height - 8);
    return [x, y] as const;
  });

  const path = coordinates.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lastX, lastY] = coordinates[coordinates.length - 1];

  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline
        points={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  );
}
