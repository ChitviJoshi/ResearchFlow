/**
 * Inline icon set (24x24, stroke based). `ICONS` is exported too, so the
 * lineage graph can draw the same shapes inside its own <svg>.
 */
export const ICONS = {
  paper: ["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z", "M14 3v5h5", "M9 13h6M9 17h6"],
  dataset: ["M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z", "M4 10h16M10 4v16"],
  experiment: ["M9 3h6M10 3v6.2L5 18.2a1.5 1.5 0 0 0 1.3 2.3h11.4a1.5 1.5 0 0 0 1.3-2.3L14 9.2V3", "M7.5 14h9"],
  result: ["M5 20V10M12 20V4M19 20v-7"],
  download: ["M12 4v11M7 11l5 5 5-5M5 20h14"],
  upload: ["M12 16V5M7 9l5-5 5 5M5 20h14"],
  link: ["M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1", "M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"],
  chevron: ["M6 9l6 6 6-6"],
  chevronRight: ["M9 6l6 6-6 6"],
  send: ["M21 3L10 14", "M21 3l-7 18-4-7-7-4z"],
  paperclip: ["M20 11.5l-8.5 8.5a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 5l-9 9a2 2 0 0 1-3-3l8.2-8.2"],
  scan: ["M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2", "M8 12h8"],
  trash: ["M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"],
  arrow: ["M5 12h14M13 6l6 6-6 6"],
  check: ["M5 12.5l4.5 4.5L19 7"],
  alert: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 8v5M12 16.5v.5"],
  clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 7v5l3 2"],
  folder: ["M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
  chat: ["M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"],
  review: ["M9 4h6v3H9z", "M7 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1", "M9 14l2 2 4-4"],
  plus: ["M12 5v14M5 12h14"],
  logout: ["M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4", "M15 8l4 4-4 4M19 12H9"],
  lock: ["M7 11V8a5 5 0 0 1 10 0v3", "M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z"],
  close: ["M6 6l12 12M18 6L6 18"],
};

export function Icon({ name, size = 18, className = "", strokeWidth = 1.7 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {(ICONS[name] || []).map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/** One label and one icon per kind of item, used everywhere an item appears. */
export const TYPE_META = {
  paper: { label: "Paper", plural: "Papers", icon: "paper" },
  dataset: { label: "Dataset", plural: "Datasets", icon: "dataset" },
  experiment: { label: "Experiment", plural: "Experiments", icon: "experiment" },
  result: { label: "Result", plural: "Results", icon: "result" },
};

/** The small flow mark used next to the product name. */
export function BrandMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M5.5 20 C 10 20, 10 9.5, 14 9.5 S 18 18, 22.5 18" stroke="#2F5D50" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="5.5" cy="20" r="3.2" fill="#8A6D3B" />
      <circle cx="14" cy="9.5" r="3.2" fill="#3D6A87" />
      <circle cx="22.5" cy="18" r="3.2" fill="#A15A3D" />
    </svg>
  );
}
