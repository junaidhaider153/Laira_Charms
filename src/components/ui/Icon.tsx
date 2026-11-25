import React from "react";

export type IconName =
  | "pets"
  | "search"
  | "shopping_bag"
  | "add_shopping_cart"
  | "favorite"
  | "favorite_border"
  | "close"
  | "arrow_forward"
  | "auto_awesome"
  | "brush"
  | "water_drop"
  | "star"
  | "local_fire_department"
  | "diamond"
  | "link"
  | "redeem"
  | "check_circle"
  | "mail"
  | "lock"
  | "verified"
  | "local_shipping"
  | "add_photo_alternate"
  | "shield"
  | "person"
  | "expand_more"
  | "menu"
  | "hotel_class"
  | "radio_button_checked"
  | "all_inclusive"
  | "cloud_upload"
  | "chat"
  | "send"
  | "smart_toy"
  | "refresh"
  // Friendly aliases
  | "heart"
  | "heart_outline"
  | "sparkles"
  | "cart"
  | "chevron_down"
  | "user"
  | "check"
  | "truck"
  | "fire"
  | "gift"
  | "upload";

interface IconData {
  viewBox?: string;
  content: React.ReactNode;
}

const ICONS: Record<string, IconData> = {
  pets: {
    viewBox: "0 0 24 24",
    content: (
      <>
        <circle cx="4.5" cy="11.5" r="2.2" />
        <circle cx="8.5" cy="7.5" r="2.2" />
        <circle cx="15.5" cy="7.5" r="2.2" />
        <circle cx="19.5" cy="11.5" r="2.2" />
        <path d="M12 11.5c-2.8 0-5 2.1-5 4.6 0 2 1.6 3.9 3.5 3.9h3c1.9 0 3.5-1.9 3.5-3.9 0-2.5-2.2-4.6-5-4.6z" />
      </>
    ),
  },
  search: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    ),
  },
  shopping_bag: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z" />
    ),
  },
  add_shopping_cart: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z" />
    ),
  },
  favorite: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    ),
  },
  favorite_border: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
    ),
  },
  close: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    ),
  },
  arrow_forward: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
    ),
  },
  auto_awesome: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
    ),
  },
  brush: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 0 0-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z" />
    ),
  },
  water_drop: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    ),
  },
  star: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    ),
  },
  local_fire_department: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M19.48 12.35c-1.57-4.08-7.16-4.3-5.81-10.23.1-.44-.34-.78-.71-.56C9.13 3.75 5 8.7 5 14c0 3.87 3.13 7 7 7s7-3.13 7-7c0-.57-.07-1.13-.21-1.65h-.31zm-7.48 6.65c-2.76 0-5-2.24-5-5 0-2.43 1.73-4.54 3.92-4.93.38-.07.69.26.63.64-.32 2.05 1.26 3.65 3.03 4.24.41.14.54.67.24.96-.75.73-1.82 1.09-2.82.09z" />
    ),
  },
  diamond: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M12.16 3h-.32L4.2 9.38l7.8 11.62 7.8-11.62L12.16 3zm3.92 6H7.92l3.08-4h2l3.08 4z" />
    ),
  },
  link: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    ),
  },
  redeem: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1h-2.22l.8-1.05C13.88 4.41 14.41 4 15 4zM9 4c.59 0 1.12.41 1.42.95L11.22 6H9c-.55 0-1-.45-1-1s.45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76V14h2V8.76L15.38 12 17 10.83 14.92 8H20v6z" />
    ),
  },
  check_circle: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    ),
  },
  mail: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    ),
  },
  lock: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    ),
  },
  verified: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" />
    ),
  },
  local_shipping: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    ),
  },
  add_photo_alternate: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z" />
    ),
  },
  shield: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25 6 2.25v4.7z" />
    ),
  },
  person: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    ),
  },
  expand_more: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
    ),
  },
  menu: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    ),
  },
  hotel_class: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M11.05 6.09l-1.3-2.64A1 1 0 0 0 8 3.5v7l4-2.86V6.76c-.35-.22-.68-.45-.95-.67zM16 3.5c-.38 0-.74.2-.95.55l-1.3 2.64c-.27.22-.6.45-.95.67v.88l4 2.86v-7c0-.28-.11-.53-.29-.71A.996.996 0 0 0 16 3.5zM12 9.25l-2.73 1.95 1.04 3.19L12 13.25l1.69 1.14 1.04-3.19L12 9.25zM19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7 3.13-7 7-7 7 3.13 7 7zm2 0c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9 9-4.03 9-9z" />
    ),
  },
  radio_button_checked: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    ),
  },
  all_inclusive: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.95l-2.83-2.8c-.97-.97-2.33-1.53-3.77-1.53-2.94 0-5.4 2.46-5.4 5.4s2.46 5.4 5.4 5.4c1.44 0 2.8-.56 3.77-1.53l2.83-2.8 2.83 2.8c.97.97 2.33 1.53 3.77 1.53 2.94 0 5.4-2.46 5.4-5.4s-2.46-5.4-5.4-5.4zm-13.2 8.8c-1.84 0-3.4-1.56-3.4-3.4s1.56-3.4 3.4-3.4c.9 0 1.76.37 2.38.99L10.59 12l-2.81 2.43c-.62.62-1.48.99-2.38.99zm13.2 0c-.9 0-1.76-.37-2.38-.99L13.41 12l2.81-2.43c.62-.62 1.48-.99 2.38-.99 1.84 0 3.4 1.56 3.4 3.4s-1.56 3.4-3.4 3.4z" />
    ),
  },
  cloud_upload: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
    ),
  },
  chat: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
    ),
  },
  send: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    ),
  },
  smart_toy: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zm-2 10H6V7h12v12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-6 3h6v1.5H9V16z" />
    ),
  },
  refresh: {
    viewBox: "0 0 24 24",
    content: (
      <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    ),
  },
};

// Aliases mapping
ICONS.heart = ICONS.favorite;
ICONS.heart_outline = ICONS.favorite_border;
ICONS.sparkles = ICONS.auto_awesome;
ICONS.cart = ICONS.shopping_bag;
ICONS.chevron_down = ICONS.expand_more;
ICONS.user = ICONS.person;
ICONS.check = ICONS.check_circle;
ICONS.truck = ICONS.local_shipping;
ICONS.fire = ICONS.local_fire_department;
ICONS.gift = ICONS.redeem;
ICONS.upload = ICONS.cloud_upload;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName | string;
  size?: number | string;
  className?: string;
  title?: string;
}

export function Icon({
  name,
  size,
  className = "",
  style,
  "aria-hidden": ariaHidden = true,
  ...props
}: IconProps) {
  const icon = ICONS[name] || ICONS.sparkles;

  const sizeStyle: React.CSSProperties = size
    ? {
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
      }
    : {
        width: "1em",
        height: "1em",
      };

  return (
    <svg
      viewBox={icon.viewBox || "0 0 24 24"}
      fill="currentColor"
      aria-hidden={ariaHidden}
      className={`inline-block shrink-0 align-middle ${className}`}
      style={{ ...sizeStyle, ...style }}
      {...props}
    >
      {icon.content}
    </svg>
  );
}

export default Icon;
