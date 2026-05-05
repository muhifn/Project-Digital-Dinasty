export type GridCardIconName =
  | "precision"
  | "transparency"
  | "responsiveness"
  | "official-flow"
  | "bmw-focus"
  | "parts"
  | "category"
  | "rating"
  | "sold"
  | "glass"
  | "support"
  | "delivery"
  | "trust"
  | "calendar"
  | "car"
  | "wrench"
  | "search"
  | "location"
  | "clock"
  | "check"
  | "filter";

type GridCardIconProps = {
  name: GridCardIconName;
  className?: string;
};

const pathProps = {
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 2,
};

export function GridCardIcon({ name, className = "h-7 w-7" }: GridCardIconProps) {
  const svgProps = {
    className,
    viewBox: "0 0 32 32",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  if (name === "precision") {
    return (
      <svg {...svgProps}>
        <circle cx="16" cy="16" r="9.5" {...pathProps} />
        <circle cx="16" cy="16" r="3" {...pathProps} />
        <path d="M16 3.5V8M16 24v4.5M3.5 16H8M24 16h4.5" {...pathProps} />
      </svg>
    );
  }

  if (name === "transparency") {
    return (
      <svg {...svgProps}>
        <path d="M9 5h11l5 5v17H9V5Z" {...pathProps} />
        <path d="M20 5v6h6M13 16h10M13 21h7" {...pathProps} />
        <path d="M7 11H5v17h14v-2" {...pathProps} />
      </svg>
    );
  }

  if (name === "responsiveness") {
    return (
      <svg {...svgProps}>
        <path d="M6 8h20v13H13l-6 5v-5H6V8Z" {...pathProps} />
        <path d="M12 14h8M12 18h5" {...pathProps} />
        <path d="M23 5.5c2.2.7 3.8 2.5 4.4 4.7" {...pathProps} />
      </svg>
    );
  }

  if (name === "official-flow") {
    return (
      <svg {...svgProps}>
        <path d="M7 8h7v7H7V8ZM18 17h7v7h-7v-7Z" {...pathProps} />
        <path d="M14 11.5h5.5A4.5 4.5 0 0 1 24 16v1M18 20.5h-5.5A4.5 4.5 0 0 1 8 16v-1" {...pathProps} />
        <path d="m17.5 8.5 2.5 3-2.5 3M14.5 23.5l-2.5-3 2.5-3" {...pathProps} />
      </svg>
    );
  }

  if (name === "bmw-focus" || name === "parts") {
    return (
      <svg {...svgProps}>
        <path d="M8 22V10l8-4 8 4v12l-8 4-8-4Z" {...pathProps} />
        <path d="M8 10l8 4 8-4M16 14v12" {...pathProps} />
        <path d="M11.5 18h9" {...pathProps} />
      </svg>
    );
  }

  if (name === "category") {
    return (
      <svg {...svgProps}>
        <path d="M6 7h8v8H6V7ZM18 7h8v8h-8V7ZM6 19h8v6H6v-6ZM18 19h8v6h-8v-6Z" {...pathProps} />
      </svg>
    );
  }

  if (name === "rating") {
    return (
      <svg {...svgProps}>
        <path d="m16 5 3.1 6.3 6.9 1-5 4.9 1.2 6.9L16 20.8l-6.2 3.3 1.2-6.9-5-4.9 6.9-1L16 5Z" {...pathProps} />
      </svg>
    );
  }

  if (name === "sold") {
    return (
      <svg {...svgProps}>
        <path d="M9 11h14l-1.4 14H10.4L9 11Z" {...pathProps} />
        <path d="M12 11a4 4 0 0 1 8 0M13 17h6M13 21h4" {...pathProps} />
      </svg>
    );
  }

  if (name === "glass") {
    return (
      <svg {...svgProps}>
        <path d="M7 11c3.6-4 14.4-4 18 0l-3 12H10L7 11Z" {...pathProps} />
        <path d="M10 14h12M13 20h6" {...pathProps} />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...svgProps}>
        <path d="M8 6v4M24 6v4M5 11h22M7 8h18a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z" {...pathProps} />
        <path d="M10 16h3M15 16h3M20 16h2M10 21h3M15 21h3" {...pathProps} />
      </svg>
    );
  }

  if (name === "car") {
    return (
      <svg {...svgProps}>
        <path d="M7 19h18l-2-7.5A3 3 0 0 0 20.1 9h-8.2A3 3 0 0 0 9 11.5L7 19Z" {...pathProps} />
        <path d="M6 19v5h4v-2h12v2h4v-5M10 16h12M10 22h.1M22 22h.1" {...pathProps} />
      </svg>
    );
  }

  if (name === "wrench") {
    return (
      <svg {...svgProps}>
        <path d="M22.5 5.5a6 6 0 0 0-7.4 7.4L6 22l4 4 9.1-9.1a6 6 0 0 0 7.4-7.4l-4.1 4.1-4-4 4.1-4.1Z" {...pathProps} />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...svgProps}>
        <circle cx="14" cy="14" r="8" {...pathProps} />
        <path d="m20 20 6 6" {...pathProps} />
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...svgProps}>
        <path d="M16 28s9-7.2 9-15a9 9 0 0 0-18 0c0 7.8 9 15 9 15Z" {...pathProps} />
        <circle cx="16" cy="13" r="3" {...pathProps} />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...svgProps}>
        <circle cx="16" cy="16" r="11" {...pathProps} />
        <path d="M16 9v7l5 3" {...pathProps} />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...svgProps}>
        <path d="M6 16.5 13 23 26 9" {...pathProps} />
      </svg>
    );
  }

  if (name === "filter") {
    return (
      <svg {...svgProps}>
        <path d="M6 9h20M10 16h12M13 23h6" {...pathProps} />
        <path d="M12 7v4M20 14v4M16 21v4" {...pathProps} />
      </svg>
    );
  }

  if (name === "support") {
    return (
      <svg {...svgProps}>
        <path d="M8 17v-2a8 8 0 0 1 16 0v2" {...pathProps} />
        <path d="M7 17h4v6H7v-6ZM21 17h4v6h-4v-6ZM21 23c0 2-1.5 3-4.5 3H15" {...pathProps} />
      </svg>
    );
  }

  if (name === "delivery") {
    return (
      <svg {...svgProps}>
        <path d="M4 10h14v11H4V10ZM18 14h5l4 4v3h-9v-7Z" {...pathProps} />
        <path d="M8 24a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM22 24a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" {...pathProps} />
      </svg>
    );
  }

  return (
    <svg {...svgProps}>
      <path d="M16 5 26 9v7c0 6-4.2 9.5-10 11-5.8-1.5-10-5-10-11V9l10-4Z" {...pathProps} />
      <path d="m11.5 16 3 3 6-7" {...pathProps} />
    </svg>
  );
}
