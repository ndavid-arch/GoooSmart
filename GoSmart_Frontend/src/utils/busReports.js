/**
 * The three things a rider can flag about the bus they're on. Each is optional —
 * report one, two or all three — and every one uses the same good/moderate/bad
 * scale with wording that suits the dimension.
 */
export const DIMENSIONS = [
  {
    key: "cleanliness",
    label: "Cleanliness",
    question: "How clean is it?",
    levels: [
      { value: "good", label: "Clean" },
      { value: "moderate", label: "So-so" },
      { value: "bad", label: "Dirty" },
    ],
  },
  {
    key: "crowding",
    label: "Crowding",
    question: "How packed is it?",
    levels: [
      { value: "good", label: "Seats free" },
      { value: "moderate", label: "Filling up" },
      { value: "bad", label: "Packed" },
    ],
  },
  {
    key: "driving",
    label: "Driving",
    question: "How is the driving?",
    levels: [
      { value: "good", label: "Smooth" },
      { value: "moderate", label: "Okay" },
      { value: "bad", label: "Reckless" },
    ],
  },
];

export const LEVEL_STYLE = {
  good: { badge: "badge-green", color: "var(--brand)", tint: "var(--ok-tint)" },
  moderate: { badge: "badge-yellow", color: "var(--warn)", tint: "var(--warn-tint)" },
  bad: { badge: "badge-red", color: "var(--danger)", tint: "var(--danger-tint)" },
};

/** "packed", "reckless" … the rider-facing wording for one flagged level. */
export function levelLabel(dimensionKey, value) {
  return DIMENSIONS.find((d) => d.key === dimensionKey)?.levels.find((l) => l.value === value)?.label ?? value;
}

/** The dimensions a given report actually flagged, in display order. */
export function flaggedDimensions(report) {
  return DIMENSIONS.filter((d) => report?.[d.key]);
}
