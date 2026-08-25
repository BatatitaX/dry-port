import type { CSSProperties, ReactNode } from "react";

export type UiIconName =
  | "quest"
  | "portfolio"
  | "map"
  | "inventory"
  | "pc"
  | "sound-on"
  | "sound-off"
  | "counter"
  | "home"
  | "jao"
  | "poem"
  | "book"
  | "paper"
  | "database"
  | "language"
  | "close";

const ICON_PATHS: Record<UiIconName, ReactNode> = {
  quest: <><circle cx="12" cy="12" r="8.25" /><path d="m12 6.5 1.7 3.8 3.8 1.7-3.8 1.7-1.7 3.8-1.7-3.8L6.5 12l3.8-1.7L12 6.5Z" /></>,
  portfolio: <><rect x="3.25" y="6.75" width="17.5" height="13" rx="2.5" /><path d="M8.5 6.75V5.5c0-.7.55-1.25 1.25-1.25h4.5c.7 0 1.25.55 1.25 1.25v1.25M3.25 11.25h17.5M9.5 11.25v1.5h5v-1.5" /></>,
  map: <><path d="m3.5 5.5 5-2 7 2 5-2v15l-5 2-7-2-5 2v-15Z" /><path d="M8.5 3.5v15M15.5 5.5v15" /><path className="icon-accent" d="M11.25 9.25 13 11l-2.5 2.5" /></>,
  inventory: <><path d="M4.25 7.5h15.5v12H4.25z" /><path d="M3.25 4.25h17.5V8H3.25zM9 11.25h6" /><circle className="icon-dot" cx="17.5" cy="16.5" r="1" /></>,
  pc: <><rect x="3.25" y="4.25" width="17.5" height="12.25" rx="2" /><path d="M8 20h8M12 16.5V20" /><path className="icon-accent" d="m8.25 9 2 2-2 2M12.5 13h3.25" /></>,
  "sound-on": <><path d="M4 10h3.25L12 6v12l-4.75-4H4v-4Z" /><path d="M15.25 9a4.1 4.1 0 0 1 0 6M17.75 6.5a7.5 7.5 0 0 1 0 11" /></>,
  "sound-off": <><path d="M4 10h3.25L12 6v12l-4.75-4H4v-4Z" /><path d="m16 9 5 5M21 9l-5 5" /></>,
  counter: <><path d="M5.25 4.25h13.5v15.5H5.25z" /><path d="M8.25 8h7.5M8.25 12h4.5M8.25 16h2.5" /><circle className="icon-dot" cx="16.25" cy="15.75" r="1.75" /></>,
  home: <><path d="m3.5 11.25 8.5-7 8.5 7" /><path d="M5.5 10v9.75h13V10M9.5 19.75v-6h5v6" /></>,
  jao: <><path d="M9.25 18V6.5l9-2v11.25" /><ellipse cx="6.75" cy="18" rx="2.5" ry="2" /><ellipse cx="15.75" cy="15.75" rx="2.5" ry="2" /></>,
  poem: <><path d="M19.25 4.25c-7.5 0-12.5 4.25-12.5 10.75 3.75.25 7.25-1 9.5-3.75 2-2.5 2.75-5 3-7Z" /><path d="M4.25 20c2.25-4.75 5.5-8.25 10.5-11.5" /></>,
  book: <><path d="M3.5 5.25c3.5-1 6.25-.25 8.5 1.75v13c-2.25-2-5-2.75-8.5-1.75v-13ZM20.5 5.25C17 4.25 14.25 5 12 7v13c2.25-2 5-2.75 8.5-1.75v-13Z" /></>,
  paper: <><path d="M6 3.25h8l4 4v13.5H6V3.25Z" /><path d="M14 3.25v4h4M9 12h6M9 15.5h6" /></>,
  database: <><ellipse cx="12" cy="5.5" rx="7.75" ry="3" /><path d="M4.25 5.5v6c0 1.65 3.45 3 7.75 3s7.75-1.35 7.75-3v-6M4.25 11.5v6c0 1.65 3.45 3 7.75 3s7.75-1.35 7.75-3v-6" /></>,
  language: <><circle cx="12" cy="12" r="8.75" /><path d="M3.5 12h17M12 3.25c2.25 2.4 3.5 5.3 3.5 8.75S14.25 18.35 12 20.75C9.75 18.35 8.5 15.45 8.5 12S9.75 5.65 12 3.25Z" /></>,
  close: <path d="m6.25 6.25 11.5 11.5M17.75 6.25l-11.5 11.5" />,
};

export function UiIcon({ name, size = 20, className = "" }: { name: UiIconName; size?: number; className?: string }) {
  const style = { "--icon-size": `${size}px` } as CSSProperties;

  return (
    <span className={`ui-icon hud-icon ${className}`.trim()} style={style} data-icon={name} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
        {ICON_PATHS[name]}
      </svg>
    </span>
  );
}
