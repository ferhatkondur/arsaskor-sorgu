import type { Level } from "@/lib/arsa-data";

// Shape+colour+label redundancy. Never colour-only.
const shapes: Record<Level, string> = {
  good: "●",
  medium: "◐",
  low: "◑",
  weak: "▲",
  unknown: "—",
};

const colorClass: Record<Level, string> = {
  good: "text-strong",
  medium: "text-good",
  low: "text-medium",
  weak: "text-weak",
  unknown: "text-unknown",
};

export function LevelMark({ level }: { level: Level }) {
  return (
    <span
      className={`font-mono text-body leading-none ${colorClass[level]}`}
      aria-hidden
    >
      {shapes[level]}
    </span>
  );
}

export function levelBorderClass(level: Level): string {
  return {
    good: "border-l-strong",
    medium: "border-l-good",
    low: "border-l-medium",
    weak: "border-l-weak",
    unknown: "border-l-unknown",
  }[level];
}
